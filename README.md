# Window Shuffle

[![PayPal](https://img.shields.io/badge/PayPal-Donate-blue?logo=paypal)](https://paypal.me/TomasMark)

**Distribute all currently open windows across GNOME workspaces.**

Window Shuffle is a GNOME Shell 50 extension for turning a crowded desktop into a touchpad-friendly sequence of workspaces. Distribute matching application windows one per workspace, then collect them back onto the current workspace when needed.

## Features

- Distribute shortcut: <kbd>Super</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd>
- Collect shortcut: <kbd>Super</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd>
- Optional panel icon with menu actions for distributing and collecting windows
- Left-click the panel icon to collect windows immediately
- Middle-click the panel icon to distribute windows immediately
- Right-click the panel icon to open its menu
- Collect matching windows from every workspace onto the current workspace
- Target the primary, non-primary, active, first, second, or all monitors
- Start from the current or first workspace
- Keep the active window on the first destination workspace
- Optionally include minimized windows
- Optionally maximize every distributed window and restore its previous size when collecting
- OSD confirmation after each run
- English and Czech interface
- Skips dialogs, desktop components, taskbar-hidden windows, and sticky windows

GNOME manages workspaces globally. When `workspaces-only-on-primary` is enabled, secondary-display windows stay visible across workspace changes; in that common setup, select the primary display as Window Shuffle's target.

## Build and install

### GNOME Extensions

Install Window Shuffle from [extensions.gnome.org](https://extensions.gnome.org/extension/10853/window-shuffle/).

### Manual installation

```bash
./build.sh -bi
```

Then log out and back in (Wayland), or use:

```bash
./build.sh -bil
```

Enable the extension:

```bash
gnome-extensions enable window-shuffle@digitalspace.name
```

Open its settings from the Extensions application or with:

```bash
gnome-extensions prefs window-shuffle@digitalspace.name
```

## Planned directions

- Remember displays by connector/model rather than temporary monitor number
- Optional undo of the last distribution
- Window filters and ordering rules

## License

GPL-3.0-or-later. Copyright © 2026 Tomáš Mark.
