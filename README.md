# LifeOS

An all-in-one personal life-management dashboard: tasks, planner, finance, learning, health, goals, notes, files, AI assistant, and automation — backed by a FastAPI + SQLite API with JWT auth.

![LifeOS dashboard](LifeOS%20Modern%20Personal%20Dashboard.png)

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI-009688?logo=fastapi)](apps/api)
[![React](https://img.shields.io/badge/frontend-React%2019-61DAFB?logo=react)](apps/web)
[![Vite](https://img.shields.io/badge/bundler-Vite-646CFF?logo=vite)](apps/web)
[![SQLite](https://img.shields.io/badge/database-SQLite-07405E?logo=sqlite)](apps/api)
[![PWA](https://img.shields.io/badge/pwa-installable-2E8B57)](apps/web/vite.config.ts)

## Stack

- **Frontend:** Vite + React 19 + TypeScript, React Router 7, TanStack Query, hand-rolled CSS tokens (light/dark themes)
- **Backend:** FastAPI + SQLAlchemy + Alembic + SQLite, JWT auth (bcrypt), pluggable AI provider
- **Packaging:** PWA (installable, offline shell) via `vite-plugin-pwa`

## Quick start

```bash
# Run both servers
bash scripts/dev.sh
# web: http://localhost:5173  ·  api: http://localhost:8000/docs
```

Or install as a desktop launcher:

```bash
bash scripts/install_app.sh
lifeos   # opens http://localhost:4173
```

## Backend

```bash
cd apps/api
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

## Tests

```bash
cd apps/api && python -m pytest   # 33 tests
cd apps/web && npm run lint && npm run build
```

## License

MIT
