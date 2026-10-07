# Window Shuffle

**Window Shuffle** is a GNOME Shell extension designed primarily to make working on laptops with a touchpad more comfortable.

Turn a crowded desktop into a touchpad-friendly sequence of workspaces by distributing your open windows across them — one window per workspace. When you need to bring everything back together, simply collect the windows onto the current workspace.

- **Distribute:** `Super + Shift + S`
- **Collect:** `Super + Shift + C`

Window Shuffle encourages a workspace-based workflow that fits naturally with GNOME's design. Giving each window its own workspace makes it easy to switch between tasks using touchpad gestures, keyboard shortcuts, or the Activities overview, while keeping your desktop uncluttered and focused.

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

## Requirements

Declared GNOME Shell version: **50**, as listed in `metadata.json`.
Build tools: Bash, Python 3, Node.js (syntax checks), zip, `glib-compile-schemas`
and `msgfmt` (GNU gettext). Local installation also requires `gnome-extensions`.

## Installation

Install from [GNOME Extensions](https://extensions.gnome.org/extension/10853/window-shuffle/),
or build and install from the project directory:

```bash
./build.sh --install
```

On Wayland, log out and back in when needed to load new or changed JavaScript,
then enable the extension:

```bash
gnome-extensions enable window-shuffle@digitalspace.name
```

Installation updates the user copy without enabling the extension or logging you out.

## Usage

Use **Super + Shift + S** to distribute windows and **Super + Shift + C** to collect
them. The optional panel icon collects on left-click, distributes on middle-click,
and opens its menu on right-click.

Configure keyboard shortcuts, target monitors and window behavior in Preferences:

```bash
gnome-extensions prefs window-shuffle@digitalspace.name
```

GNOME manages workspaces globally. When `workspaces-only-on-primary` is enabled, secondary-display windows stay visible across workspace changes; in that common setup, select the primary display as Window Shuffle's target.

## Development

```bash
./build.sh --check
./build.sh
```

The output is `dist/window-shuffle@digitalspace.name.zip`. `-b` and `-r` are build aliases;
`-i`, `-bi` and `-ri` build the current sources and install them.

Compare with a separately saved previous distribution archive, if available:

```bash
./build.sh --compare-zip /path/to/previous-window-shuffle.zip
```

This verifies identical paths and bytes for every packaged file, including metadata
and compiled translations. ZIP timestamps and compression may differ.
Translations from `po/*.po` are compiled in a temporary directory under the gettext
domain from metadata. The package preserves its existing layout without LICENSE
or a compiled schema; GNOME compiles the XML schema during installation.

For runtime changes, verify distribution and collection, shortcuts, panel mouse
buttons, monitor choices, minimized windows, maximization/restoration and repeated
disable/enable. Build checks alone do not confirm runtime behavior.

### Planned directions

- Remember displays by connector/model rather than temporary monitor number
- Optional undo of the last distribution
- Window filters and ordering rules

## Troubleshooting

If secondary-display windows remain visible on every workspace, check the GNOME
workspace setting described in **Usage**. Start a fresh session if an installed code
change does not appear.
Report problems in the [issue tracker](https://github.com/tomasmark79/window-shuffle/issues).

## License

[GPL-3.0-or-later](LICENSE). Copyright © 2026 Tomáš Mark.

[GitHub](https://github.com/tomasmark79/window-shuffle) · [Donate via PayPal](https://paypal.me/TomasMark)
