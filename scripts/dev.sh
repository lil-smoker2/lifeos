#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -d "$REPO_DIR/apps/api/.venv" ]; then
  echo "Missing apps/api/.venv. Run: python3 -m venv .venv && .venv/bin/pip install -r requirements.txt" >&2
  exit 1
fi

(
  cd "$REPO_DIR/apps/api"
  source .venv/bin/activate
  uvicorn app.main:app --reload --port 8000
) &
API_PID=$!

(
  cd "$REPO_DIR/apps/web"
  npm run dev
) &

trap 'kill "$API_PID" 2>/dev/null || true' EXIT

wait
