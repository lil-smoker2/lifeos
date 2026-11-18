#!/usr/bin/env bash
set -euo pipefail

DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
APP_DIR="$DATA_HOME/lifeos"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$DATA_HOME/applications"
LAUNCHER="$BIN_DIR/lifeos"
DESKTOP_FILE="$DESKTOP_DIR/lifeos.desktop"

if pgrep -f "vite preview --port 4173" >/dev/null 2>&1; then
  pkill -f "vite preview --port 4173" || true
fi

rm -rf "$APP_DIR"
rm -f "$LAUNCHER" "$DESKTOP_FILE"

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$DESKTOP_DIR" >/dev/null 2>&1 || true
fi

echo "LifeOS uninstalled. Browser data (localStorage) is untouched."
