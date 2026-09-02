/*
 * Window Shuffle preferences
 * Copyright (C) 2026 Tomáš Mark
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import Adw from 'gi://Adw';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

const MONITOR_VALUES = [
    'primary',
    'non-primary',
    'active',
    'all',
    'monitor-1',
    'monitor-2',
];

const START_VALUES = ['current', 'first'];

export default class WindowShufflePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();
        window._windowShuffleSettings = settings;
        window.set_default_size(620, 620);

        const page = new Adw.PreferencesPage({
            title: 'Window Shuffle',
            icon_name: 'view-grid-symbolic',
        });

        page.add(this._createBehaviorGroup(settings));
        page.add(this._createShortcutGroup(window, settings));
        page.add(this._createInformationGroup());
        window.add(page);
    }

    _createBehaviorGroup(settings) {
        const group = new Adw.PreferencesGroup({
            title: 'Distribution',
            description: 'Choose which windows are placed one per workspace.',
        });

        group.add(this._createComboRow(
            settings,
            'target-monitor',
            'Windows on monitor',
            'The primary option follows your current display configuration.',
            [
                'Primary monitor',
                'Non-primary monitor',
                'Monitor of active window',
                'All monitors',
                'Monitor 1',
                'Monitor 2',
            ],
            MONITOR_VALUES
        ));

        group.add(this._createComboRow(
            settings,
            'start-workspace',
            'Start on workspace',
            'Current keeps the focused window in your present workspace.',
            ['Current workspace', 'First workspace'],
            START_VALUES
        ));

        group.add(this._createSwitchRow(
            settings,
            'focused-window-first',
            'Keep the active window first',
            'When possible, place the focused window on the starting workspace.'
        ));

        group.add(this._createSwitchRow(
            settings,
            'include-minimized',
            'Include minimized windows',
            'Also distribute application windows currently minimized.'
        ));

        group.add(this._createSwitchRow(
            settings,
            'maximize-windows',
            'Maximize distributed windows',
            'Make each window fill its monitor after moving it to a workspace.'
        ));

        group.add(this._createSwitchRow(
            settings,
            'show-feedback',
            'Show confirmation',
            'Display a short on-screen message after the shortcut is used.'
        ));

        return group;
    }

    _createShortcutGroup(parent, settings) {
        const group = new Adw.PreferencesGroup({
            title: 'Keyboard',
            description: 'The shortcut is active in the desktop and Overview.',
        });

        group.add(this._createShortcutRow(
            parent,
            settings,
            'shuffle-windows',
            'Distribute windows',
            'Move each matching window to its own workspace.'
        ));
        group.add(this._createShortcutRow(
            parent,
            settings,
            'collect-windows',
            'Collect windows',
            'Bring matching windows from all workspaces to the current one.'
        ));

        return group;
    }

    _createShortcutRow(parent, settings, key, title, subtitle) {
        const row = new Adw.ActionRow({title, subtitle});
        const shortcutLabel = new Gtk.ShortcutLabel({
            accelerator: settings.get_strv(key)[0] ?? '',
            valign: Gtk.Align.CENTER,
        });
        const changeButton = new Gtk.Button({
            label: 'Change…',
            valign: Gtk.Align.CENTER,
            margin_start: 12,
        });
        const resetButton = new Gtk.Button({
            icon_name: 'edit-undo-symbolic',
            tooltip_text: 'Reset to default',
            valign: Gtk.Align.CENTER,
            margin_start: 6,
        });

        settings.connect(`changed::${key}`, () => {
            shortcutLabel.accelerator = settings.get_strv(key)[0] ?? '';
        });
        changeButton.connect('clicked', () => {
            this._showShortcutRecorder(parent, settings, key);
        });
        resetButton.connect('clicked', () => settings.reset(key));

        row.add_suffix(shortcutLabel);
        row.add_suffix(changeButton);
        row.add_suffix(resetButton);
        return row;
    }

    _showShortcutRecorder(parent, settings, key) {
        const dialog = new Gtk.Window({
            title: 'Set keyboard shortcut',
            transient_for: parent,
            modal: true,
            default_width: 420,
            default_height: 180,
        });
        const box = new Gtk.Box({
            orientation: Gtk.Orientation.VERTICAL,
            spacing: 16,
            margin_top: 28,
            margin_bottom: 28,
            margin_start: 28,
            margin_end: 28,
            valign: Gtk.Align.CENTER,
        });
        const title = new Gtk.Label({
            label: '<b>Press the new shortcut</b>',
            use_markup: true,
        });
        const hint = new Gtk.Label({
            label: 'Escape cancels. Backspace disables the shortcut.',
            wrap: true,
        });
        const controller = new Gtk.EventControllerKey();
        controller.set_propagation_phase(Gtk.PropagationPhase.CAPTURE);

        controller.connect('key-pressed', (_controller, keyval, _keycode, state) => {
            const modifiers = state & Gtk.accelerator_get_default_mod_mask();

            if (keyval === Gdk.KEY_Escape) {
                dialog.close();
                return true;
            }

            if (keyval === Gdk.KEY_BackSpace && modifiers === 0) {
                settings.set_strv(key, []);
                dialog.close();
                return true;
            }

            if (!Gtk.accelerator_valid(keyval, modifiers))
                return true;

            settings.set_strv(
                key,
                [Gtk.accelerator_name(keyval, modifiers)]
            );
            dialog.close();
            return true;
        });

        box.append(title);
        box.append(hint);
        dialog.set_child(box);
        dialog.add_controller(controller);
        dialog.present();
    }

    _createComboRow(settings, key, title, subtitle, labels, values) {
        const row = new Adw.ComboRow({
            title,
            subtitle,
            model: Gtk.StringList.new(labels),
        });
        const currentIndex = values.indexOf(settings.get_string(key));
        row.selected = currentIndex >= 0 ? currentIndex : 0;

        row.connect('notify::selected', () => {
            if (row.selected < values.length)
                settings.set_string(key, values[row.selected]);
        });
        settings.connect(`changed::${key}`, () => {
            const index = values.indexOf(settings.get_string(key));
            if (index >= 0 && row.selected !== index)
                row.selected = index;
        });

        return row;
    }

    _createSwitchRow(settings, key, title, subtitle) {
        const row = new Adw.SwitchRow({title, subtitle});
        settings.bind(key, row, 'active', Gio.SettingsBindFlags.DEFAULT);
        return row;
    }

    _createInformationGroup() {
        const group = new Adw.PreferencesGroup({title: 'Multi-monitor note'});
        group.add(new Adw.ActionRow({
            title: 'GNOME workspace behavior still applies',
            subtitle: 'If GNOME is configured to use workspaces only on the primary display, windows on other displays remain visible while switching workspaces. Prefer “Primary monitor” for that setup.',
        }));
        return group;
    }
}
