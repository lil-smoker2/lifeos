#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB_DIR="$REPO_DIR/apps/web"
DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
APP_DIR="$DATA_HOME/lifeos"
BIN_DIR="$HOME/.local/bin"
DESKTOP_DIR="$DATA_HOME/applications"
LAUNCHER="$BIN_DIR/lifeos"
DESKTOP_FILE="$DESKTOP_DIR/lifeos.desktop"

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required to build LifeOS." >&2
  exit 1
fi

echo "Building LifeOS frontend..."
(cd "$WEB_DIR" && npm run build)

echo "Installing app files to $APP_DIR..."
rm -rf "$APP_DIR"
mkdir -p "$APP_DIR"
cp -R "$WEB_DIR/dist/." "$APP_DIR/"
cp "$WEB_DIR/public/favicon.svg" "$APP_DIR/icon.svg"

mkdir -p "$BIN_DIR" "$DESKTOP_DIR"

cat > "$LAUNCHER" <<LAUNCHER_EOF
#!/usr/bin/env bash
set -euo pipefail

WEB_DIR="$WEB_DIR"
PORT="\${LIFEOS_PORT:-4173}"
URL="http://localhost:\$PORT/"
STATE_DIR="\${XDG_STATE_HOME:-\$HOME/.local/state}/lifeos"
LOG="\$STATE_DIR/server.log"
mkdir -p "\$STATE_DIR"

if ! curl -sf "\$URL" >/dev/null 2>&1; then
  ( cd "\$WEB_DIR" && nohup npm run preview -- --port "\$PORT" --strictPort >>"\$LOG" 2>&1 & )
  for _ in \$(seq 1 60); do
    curl -sf "\$URL" >/dev/null 2>&1 && break
    sleep 0.25
  done
fi

xdg-open "\$URL" >/dev/null 2>&1 || true
LAUNCHER_EOF

chmod +x "$LAUNCHER"

cat > "$DESKTOP_FILE" <<DESKTOP_EOF
[Desktop Entry]
Type=Application
Name=LifeOS
GenericName=Personal dashboard
Comment=Tasks, planner, finance, learning, health and notes in one place
Exec=$LAUNCHER
Icon=$APP_DIR/icon.svg
Terminal=false
Categories=Office;Finance;Education;
Keywords=life;dashboard;tasks;notes;finance;planner;
StartupNotify=true
DESKTOP_EOF

if command -v update-desktop-database >/dev/null 2>&1; then
  update-desktop-database "$DESKTOP_DIR" >/dev/null 2>&1 || true
fi

echo "Installed."
echo "  Launcher: $LAUNCHER"
echo "  Desktop entry: $DESKTOP_FILE"
echo "  App files: $APP_DIR"
echo "Run 'lifeos' or open LifeOS from your application menu."
