# Window Shuffle

**Distribute all currently open windows across GNOME workspaces.**

Window Shuffle is a GNOME Shell 50 extension for turning a crowded desktop into a touchpad-friendly sequence of workspaces. Distribute matching application windows one per workspace, then collect them back onto the current workspace when needed.

## Features

- Distribute shortcut: <kbd>Super</kbd>+<kbd>Shift</kbd>+<kbd>S</kbd>
- Collect shortcut: <kbd>Super</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd>
- Collect matching windows from every workspace onto the current workspace
- Target the primary, non-primary, active, first, second, or all monitors
- Start from the current or first workspace
- Keep the active window on the first destination workspace
- Optionally include minimized windows
- Optionally maximize every distributed window
- OSD confirmation after each run
- Skips dialogs, desktop components, taskbar-hidden windows, and sticky windows

GNOME manages workspaces globally. When `workspaces-only-on-primary` is enabled, secondary-display windows stay visible across workspace changes; in that common setup, select the primary display as Window Shuffle's target.

## Build and install

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

- Quick Settings or panel menu action
- Remember displays by connector/model rather than temporary monitor number
- Optional undo of the last distribution
- Window filters and ordering rules

## License

GPL-3.0-or-later. Copyright © 2026 Tomáš Mark.
