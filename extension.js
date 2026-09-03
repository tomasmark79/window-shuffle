/*
 * Window Shuffle
 * Copyright (C) 2026 Tomáš Mark
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {
    Extension,
    gettext as _,
    ngettext,
} from 'resource:///org/gnome/shell/extensions/extension.js';

const LOG_TAG = 'WindowShuffle';
const SHUFFLE_KEYBINDING = 'shuffle-windows';
const COLLECT_KEYBINDING = 'collect-windows';

export default class WindowShuffleExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._maximizedByShuffle = new WeakSet();

        Main.wm.addKeybinding(
            SHUFFLE_KEYBINDING,
            this._settings,
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            () => this._shuffleWindows()
        );
        Main.wm.addKeybinding(
            COLLECT_KEYBINDING,
            this._settings,
            Meta.KeyBindingFlags.IGNORE_AUTOREPEAT,
            Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
            () => this._collectWindows()
        );

        console.debug(`${LOG_TAG}: enabled`);
    }

    disable() {
        Main.wm.removeKeybinding(SHUFFLE_KEYBINDING);
        Main.wm.removeKeybinding(COLLECT_KEYBINDING);
        this._maximizedByShuffle = null;
        this._settings = null;
        console.debug(`${LOG_TAG}: disabled`);
    }

    _shuffleWindows() {
        try {
            const monitor = this._getTargetMonitor();
            const windows = this._getCandidateWindows(monitor);

            if (windows.length === 0) {
                this._showFeedback(_('No matching windows found'), monitor);
                return;
            }

            this._sortWindows(windows);

            const workspaceManager = global.workspace_manager;
            const startIndex = this._settings.get_string('start-workspace') === 'first'
                ? 0
                : workspaceManager.get_active_workspace_index();
            const maximizeWindows = this._settings.get_boolean('maximize-windows');

            windows.forEach((window, offset) => {
                // Passing true lets Mutter append a destination workspace when needed.
                window.change_workspace_by_index(startIndex + offset, true);

                if (maximizeWindows && window.can_maximize() &&
                    !window.is_maximized()) {
                    this._maximizedByShuffle.add(window);
                    window.maximize();
                }
            });

            this._showFeedback(
                ngettext(
                    '%d window distributed across workspaces',
                    '%d windows distributed across workspaces',
                    windows.length
                ).format(windows.length),
                monitor
            );
            console.debug(`${LOG_TAG}: distributed ${windows.length} window(s)`);
        } catch (error) {
            console.error(`${LOG_TAG}: failed to distribute windows`, error);
            this._showFeedback(_('Window distribution failed'), -1);
        }
    }

    _collectWindows() {
        try {
            const monitor = this._getTargetMonitor();
            const windows = this._getCandidateWindows(monitor);

            if (windows.length === 0) {
                this._showFeedback(_('No matching windows found'), monitor);
                return;
            }

            const destinationIndex = global.workspace_manager
                .get_active_workspace_index();

            windows.forEach(window => {
                window.change_workspace_by_index(destinationIndex, false);

                if (this._maximizedByShuffle.has(window)) {
                    window.unmaximize();
                    this._maximizedByShuffle.delete(window);
                }
            });

            this._showFeedback(
                ngettext(
                    '%d window collected on this workspace',
                    '%d windows collected on this workspace',
                    windows.length
                ).format(windows.length),
                monitor
            );
            console.debug(`${LOG_TAG}: collected ${windows.length} window(s)`);
        } catch (error) {
            console.error(`${LOG_TAG}: failed to collect windows`, error);
            this._showFeedback(_('Window collection failed'), -1);
        }
    }

    _getCandidateWindows(targetMonitor) {
        const includeMinimized = this._settings.get_boolean('include-minimized');

        if (targetMonitor === -2)
            return [];

        return global.display.list_all_windows().filter(window => {
            if (window.get_window_type() !== Meta.WindowType.NORMAL)
                return false;
            if (window.is_skip_taskbar() || window.is_override_redirect())
                return false;
            // Skip genuinely sticky windows. On a secondary monitor Mutter can
            // report a window as being on all workspaces because of the global
            // "workspaces-only-on-primary" mode; that is not user stickiness.
            if (window.is_always_on_all_workspaces())
                return false;
            if (!includeMinimized && window.minimized)
                return false;

            return targetMonitor === -1 || window.get_monitor() === targetMonitor;
        });
    }

    _sortWindows(windows) {
        const focusedWindow = global.display.get_focus_window();
        const focusedFirst = this._settings.get_boolean('focused-window-first');

        windows.sort((a, b) => {
            if (focusedFirst && a === focusedWindow)
                return -1;
            if (focusedFirst && b === focusedWindow)
                return 1;

            const workspaceA = a.get_workspace()?.index() ?? Number.MAX_SAFE_INTEGER;
            const workspaceB = b.get_workspace()?.index() ?? Number.MAX_SAFE_INTEGER;
            if (workspaceA !== workspaceB)
                return workspaceA - workspaceB;

            return b.get_user_time() - a.get_user_time();
        });
    }

    _getTargetMonitor() {
        const mode = this._settings.get_string('target-monitor');
        const primary = Main.layoutManager.primaryIndex;

        switch (mode) {
        case 'all':
            return -1;
        case 'active':
            return global.display.get_focus_window()?.get_monitor()
                ?? global.display.get_current_monitor();
        case 'non-primary': {
            const monitorCount = Main.layoutManager.monitors.length;
            if (monitorCount < 2)
                return -2;
            return Array.from({length: monitorCount}, (_, index) => index)
                .find(index => index !== primary) ?? -2;
        }
        case 'monitor-1':
            return Main.layoutManager.monitors.length >= 1 ? 0 : -2;
        case 'monitor-2':
            return Main.layoutManager.monitors.length >= 2 ? 1 : -2;
        case 'primary':
        default:
            return primary;
        }
    }

    _showFeedback(message, targetMonitor) {
        if (!this._settings?.get_boolean('show-feedback'))
            return;

        const monitorCount = Main.layoutManager.monitors.length;
        const monitor = targetMonitor >= 0 && targetMonitor < monitorCount
            ? targetMonitor
            : Main.layoutManager.primaryIndex;
        const icon = new Gio.ThemedIcon({name: 'view-grid-symbolic'});

        Main.osdWindowManager.showOne(monitor, icon, message, -1, -1);
    }
}
