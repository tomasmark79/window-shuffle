#!/usr/bin/env bash

# Copyright (C) 2026 Tomáš Mark
# SPDX-License-Identifier: GPL-3.0-or-later

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

EXTENSION_UUID="window-shuffle@digitalspace.name"
ZIP_NAME="${EXTENSION_UUID}.zip"
GETTEXT_DOMAIN="$EXTENSION_UUID"

function require_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "Error: '$1' not found. $2" >&2
        exit 1
    fi
}

function build_extension() {
    require_command glib-compile-schemas "Install GLib development tools."
    require_command msgfmt "Install GNU gettext."
    require_command zip "Install zip."

    python3 -m json.tool metadata.json >/dev/null
    glib-compile-schemas --strict schemas
    for po_file in po/*.po; do
        language="$(basename "$po_file" .po)"
        locale_dir="locale/$language/LC_MESSAGES"
        mkdir -p "$locale_dir"
        msgfmt --check --output-file \
            "$locale_dir/$GETTEXT_DOMAIN.mo" "$po_file"
    done
    rm -f "$ZIP_NAME"
    zip -rq "$ZIP_NAME" extension.js prefs.js metadata.json schemas locale \
        -x 'schemas/gschemas.compiled'
    echo "Built $ZIP_NAME"
}

function show_help() {
    echo "Usage: $(basename "$0") [-b] [-i] [-l] [-r]"
    echo "  -b  build the extension zip"
    echo "  -i  install the built extension"
    echo "  -l  log out of the GNOME session after installation"
    echo "  -r  validate and build a release zip"
}

build=false
install=false
logout=false

while getopts ':bilr' option; do
    case "$option" in
        b|r) build=true ;;
        i) install=true ;;
        l) logout=true ;;
        *) show_help; exit 1 ;;
    esac
done

if [[ "$build" == false && "$install" == false && "$logout" == false ]]; then
    show_help
    exit 0
fi

if [[ "$build" == true ]]; then
    build_extension
fi

if [[ "$install" == true ]]; then
    if [[ ! -f "$ZIP_NAME" ]]; then
        build_extension
    fi
    gnome-extensions install --force "$ZIP_NAME"
    echo "Installed $EXTENSION_UUID"
fi

if [[ "$logout" == true ]]; then
    gnome-session-quit --logout --no-prompt
fi
