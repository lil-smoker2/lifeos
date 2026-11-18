# LifeOS — Build Plan (Incremental, Always-Runnable)

> **Goal:** Build LifeOS, an all-in-one personal life-management dashboard
> (Tasks, Calendar, Finance, Learning, Health, Goals, Notes, Files, AI
> Assistant, Automation) matching the reference mockups in the repo root.
>
> **Core rule:** after **every step** the app must install, run and load at
> `http://localhost:5173/`. The homepage is the health check. A step is only
> complete when the homepage still renders in **both** themes.

---

## How to read this plan

Every step uses the same shape:

```
STEP N — <name>
STATUS:    done | in progress | pending
GOAL:      what the step adds
BUILD:     files touched / created
VERIFY:    what should be visible or measurable when the step is finished
```

Status legend: ✅ done · 🟡 in progress · ⬜ pending

Do not start a later step while the current one fails VERIFY. If a change
breaks the homepage, fix it before moving on.

---

## Where the build stands (snapshot: 2026-11-18)

**Done:** the entire frontend prototype. A routed React SPA with a persistent
light/dark theme, a theme-aware dashboard (light 5-stat layout and dark 3×3
widget matrix), and twelve working module pages backed by `localStorage`.
`npm run build` (TypeScript + Vite) and `npm run lint` (oxlint) pass. The
Phase 1 build is installed as a desktop launcher named **LifeOS** that serves
the built app on port 4173.

**Not started:** the FastAPI backend, database, auth, real persistence, PWA /
desktop packaging, and the automation engine beyond frontend simulation.

This means the app currently behaves like a polished offline demo: everything
is editable and survives refresh (per browser), but nothing syncs between
devices and there is no account system yet.

### Verified commands

```bash
cd /home/david/Documents/lifesmart/apps/web
npm install          # dependencies already installed
npm run dev          # http://localhost:5173/
npm run build        # tsc -b && vite build
npm run lint         # oxlint
```

Phase 1 is also installed as a local desktop launcher (see Step 1.6):

```bash
cd /home/david/Documents/lifesmart
bash scripts/install_app.sh    # rebuild + refresh launcher
lifeos                         # launch at http://localhost:4173/
bash scripts/uninstall_app.sh  # remove the installed copy
```

There is **no git repository** in this folder yet and no `apps/api` yet; the
old `scripts/build_app.sh` path and `~/.local/bin/lifesmart` binary referenced
by earlier memory are stale and unrelated to the current frontend.

---

## Tech stack

- **Frontend:** Vite 8 + React 19 + TypeScript, React Router 7, Lucide icons,
  hand-rolled CSS tokens (no UI kit), `localStorage` as the temporary store.
- **Backend (planned):** FastAPI + SQLAlchemy + Alembic + SQLite (dev), JWT
  auth, served on port 8000 with Vite proxying `/api`.
- **Packaging (planned):** PWA manifest/service worker, then an Electron or
  Tauri wrapper around the built web app.

## Repository layout (current)

```
lifesmart/
├─ apps/
│  └─ web/
│     ├─ index.html
│     ├─ package.json
│     ├─ vite.config.ts
│     └─ src/
│        ├─ App.tsx                 # route table
│        ├─ main.tsx                # React root
│        ├─ index.css               # design tokens + base styles
│        ├─ App.css                 # imports styles/*
│        ├─ styles/
│        │  ├─ layout.css           # shell, sidebar, topbar, breakpoints
│        │  ├─ dashboard.css        # hero, stat cards, widgets, matrix
│        │  └─ pages.css            # module pages, tables, forms, chat
│        ├─ features/theme/ThemeProvider.tsx
│        ├─ layouts/AppShell.tsx    # sidebar + topbar + routed outlet
│        ├─ components/
│        │  ├─ DonutRing.tsx
│        │  └─ PageHeader.tsx
│        ├─ lib/
│        │  ├─ seed.ts              # types, seed data, money/progress helpers
│        │  └─ useLocalStore.ts     # localStorage-backed useState
│        └─ pages/                  # Dashboard + 12 module pages
├─ docs/
│  └─ BUILD_PLAN.md                 # this file
├─ scripts/
│  ├─ install_app.sh                # build + install desktop launcher
│  └─ uninstall_app.sh              # remove launcher and installed files
└─ *.png / *.jpeg                   # design references
```

---

## Progress checklist

### Phase 1 — Foundation and dashboard

| Step | Name | Status |
|---|---|---|
| 1.1 | Scaffold the Vite frontend | ✅ |
| 1.2 | Design tokens and global styles | ✅ |
| 1.3 | App shell: sidebar, topbar, routing | ✅ |
| 1.4 | Light/dark theme with persistence | ✅ |
| 1.5 | Theme-aware dashboard | ✅ |
| 1.6 | Local desktop install | ✅ |

### Phase 2 — Module slices (frontend, local data)

| Step | Name | Status |
|---|---|---|
| 2.1 | Tasks | ✅ |
| 2.2 | Planner / calendar | ✅ |
| 2.3 | Goals and habits | ✅ |
| 2.4 | Finance tracker | ✅ |
| 2.5 | Learning and study | ✅ |
| 2.6 | Health and wellness | ✅ |
| 2.7 | Notes and knowledge | ✅ |
| 2.8 | Files and documents | ✅ |
| 2.9 | AI assistant (rule-based) | ✅ |
| 2.10 | Automation rules (simulated runs) | ✅ |
| 2.11 | Settings and help | ✅ |

### Phase 3 — Frontend polish

| Step | Name | Status |
|---|---|---|
| 3.1 | Global search and notification shell | 🟡 |
| 3.2 | Responsive and mobile navigation | ✅ |
| 3.3 | Accessibility and performance pass | 🟡 |
| 3.4 | Route-level code splitting | ⬜ |

### Phase 4 — Backend and real persistence

| Step | Name | Status |
|---|---|---|
| 4.1 | FastAPI scaffold and health check | ⬜ |
| 4.2 | Database, models and migrations | ⬜ |
| 4.3 | Auth (register, login, JWT) | ⬜ |
| 4.4 | API client and auth-aware frontend | ⬜ |
| 4.5 | Persist tasks and events | ⬜ |
| 4.6 | Persist finance, learning, goals, health | ⬜ |
| 4.7 | Persist notes and files (upload) | ⬜ |
| 4.8 | Notifications and search endpoints | ⬜ |
| 4.9 | Pluggable AI provider | ⬜ |
| 4.10 | Automation engine with run history | ⬜ |

### Phase 5 — Packaging

| Step | Name | Status |
|---|---|---|
| 5.1 | PWA manifest and service worker | ⬜ |
| 5.2 | Desktop wrapper (Electron or Tauri) | ⬜ |
| 5.3 | Installable build and smoke test | ⬜ |

---

# PHASE 1 — Foundation and dashboard

### STEP 1.1 — Scaffold the Vite frontend
**STATUS:** ✅
**GOAL:** A runnable React + TypeScript app at `/`.
**BUILD:** `apps/web` with Vite 8, React 19, TypeScript, React Router 7,
Lucide. `main.tsx` mounts the app; `index.html` is the entry.
**VERIFY:** `npm run dev` serves the app on `http://localhost:5173/` with no
console errors; `npm run build` succeeds.

### STEP 1.2 — Design tokens and global styles
**STATUS:** ✅
**GOAL:** One source of truth for color, radius, spacing and type.
**BUILD:** `src/index.css` defines the light and `[data-theme='dark']` token
sets from Appendix A, plus base typography, focus rings and scrollbars.
**VERIFY:** Both themes use the lavender/navy palettes; cards use the shared
radius and shadow tokens.

### STEP 1.3 — App shell: sidebar, topbar, routing
**STATUS:** ✅
**GOAL:** Persistent navigation with real routes, not buttons.
**BUILD:** `src/layouts/AppShell.tsx` (nav rail, topbar, search field, profile),
`src/App.tsx` (route table), `src/styles/layout.css`.
Routes: `/`, `/tasks`, `/planner`, `/learning`, `/finance`, `/health`,
`/notes`, `/files`, `/goals`, `/ai`, `/automation`, `/settings`, `/help`.
Nav has twelve items; AI Assistant carries a "New" badge.
**VERIFY:** Clicking any nav item changes the URL and highlights the active
pill; `/` still loads the dashboard.

### STEP 1.4 — Light/dark theme with persistence
**STATUS:** ✅
**GOAL:** A single toggle flips the whole UI and survives refresh.
**BUILD:** `src/features/theme/ThemeProvider.tsx` (context, `localStorage` key
`lifeos.theme`, `<html data-theme>`), theme switch in the sidebar footer.
Sidebar footer shows the "You're on track!" card in light and the
"Upgrade to Pro" card in dark.
**VERIFY:** Toggle changes every surface, reload keeps the choice, and the
sidebar footer variant matches the theme.

### STEP 1.5 — Theme-aware dashboard
**STATUS:** ✅
**GOAL:** Two compositions per Appendix C, both reading live data.
**BUILD:** `src/pages/Dashboard.tsx`, `src/styles/dashboard.css`,
`src/components/DonutRing.tsx`. Light: hero with date + clock, five gradient
stat cards, task/event/finance row, learning/goals/AI row. Dark: hero with
gold name, eight quick-action tiles, 3×3 widget matrix (schedule, tasks,
learning, finance sparkline in KSh, goals, health, quick access, reminders,
recent activity).
**VERIFY:** Both themes show complete dashboards on `/`; counts and money
update when module data changes.

### STEP 1.6 — Local desktop install (Phase 1 build)
**STATUS:** ✅
**GOAL:** Make the Phase 1 build launchable like a normal desktop app, so
progress can be checked from the app menu after every later phase.
**BUILD:** `scripts/install_app.sh` builds the frontend, copies `dist/` to
`~/.local/share/lifeos`, installs a launcher at `~/.local/bin/lifeos` and a
desktop entry at `~/.local/share/applications/lifeos.desktop`.
`scripts/uninstall_app.sh` reverses all of it.
The launcher starts `vite preview` on port 4173 if it is not already running
and opens the dashboard in the default browser.
**INSTALL / RUN:**
```bash
cd /home/david/Documents/lifesmart
bash scripts/install_app.sh
lifeos                 # or open "LifeOS" from the app menu
```
**VERIFY:** The launcher opens `http://localhost:4173/` on the dashboard, and
deep links such as `/finance` reload correctly thanks to the preview SPA
fallback.

> This is a developer install for phase-by-phase monitoring. The official
> installable package (PWA / desktop wrapper, offline shell, icons, versioned
> release) remains Phase 5.

---

# PHASE 2 — Module slices (frontend, local data)

Each slice follows the same pattern: a typed record in `src/lib/seed.ts`, seed
data, a page in `src/pages/`, and shared styles in `src/styles/pages.css`.
State is read through `useLocalStore`, which persists JSON under a
`lifeos.*` key and lets the dashboard reuse the same records.

### STEP 2.1 — Tasks
**STATUS:** ✅
**GOAL:** Capture, complete, filter and delete tasks.
**BUILD:** `pages/TasksPage.tsx`; key `lifeos.tasks`; fields
`title, category, priority (High/Medium/Low), due, done`.
Dashboard task list and "Tasks" stat read the same store.
**VERIFY:** Add a task, complete it, filter All/Open/Done; the dashboard count
and rows reflect the change.

### STEP 2.2 — Planner / calendar
**STATUS:** ✅
**GOAL:** Month grid plus a vertical day timeline.
**BUILD:** `pages/PlannerPage.tsx`; key `lifeos.events`; fields
`title, place, day, start, tone`. November 2026 grid with event counts, day
selection, per-day timeline and add/delete forms.
**VERIFY:** Selecting a day shows its events; adding an event updates the
grid count and the dashboard schedule widget.

### STEP 2.3 — Goals and habits
**STATUS:** ✅
**GOAL:** Progress toward measurable goals.
**BUILD:** `pages/GoalsPage.tsx`; key `lifeos.goals`; fields
`title, current, target, unit, tone`. Increment/decrement controls, add and
delete, average progress KPI.
**VERIFY:** Bump progress and see bars and the dashboard goal average move.

### STEP 2.4 — Finance tracker
**STATUS:** ✅
**GOAL:** Log income, expenses and savings with theme-aware currency.
**BUILD:** `pages/FinancePage.tsx`; key `lifeos.txns`; fields
`label, amount, type, date`. Summary cards, cash-flow split, transaction list.
`money(value, isDark)` renders USD in light and KSh in dark.
**VERIFY:** Add an income and an expense; the balance, split and dashboard
chart values update.

### STEP 2.5 — Learning and study
**STATUS:** ✅
**GOAL:** Per-course lesson progress feeding the donut ring.
**BUILD:** `pages/LearningPage.tsx`; key `lifeos.courses`; fields
`name, done, total, tone`. Stepper buttons adjust completed lessons; overall
percentage uses `learningPercent`.
**VERIFY:** Mark lessons done; the ring on Learning and Dashboard both change.

### STEP 2.6 — Health and wellness
**STATUS:** ✅
**GOAL:** A daily health log with targets.
**BUILD:** `pages/HealthPage.tsx`; key `lifeos.health`; fields
`steps, sleep, water, diet`. Progress bars against 10,000 steps, 8 h sleep and
2.5 L water; edits save immediately.
**VERIFY:** Change steps; the dashboard health widget shows the same number.

### STEP 2.7 — Notes and knowledge
**STATUS:** ✅
**GOAL:** A Notion-style database of notes (Appendix E).
**BUILD:** `pages/NotesPage.tsx`; key `lifeos.notes`; fields
`title, emoji, className, type, reviewed`. Amber cover, tab switcher, table
with Reviewed checkbox, class and type pills, footer count, create/delete.
**VERIFY:** Create a note, toggle Reviewed, filter ENG 455 and To review; the
table stays readable on mobile via horizontal scroll.

### STEP 2.8 — Files and documents
**STATUS:** ✅
**GOAL:** A searchable file grid with an upload affordance.
**BUILD:** `pages/FilesPage.tsx`; key `lifeos.files`; fields
`name, kind, size, tag`. File input records metadata only (no blob storage
yet); search and delete supported.
**VERIFY:** Upload files and see cards appear with correct kind/size; search
filters them.

### STEP 2.9 — AI assistant (rule-based)
**STATUS:** ✅
**GOAL:** Answer questions from the live local data.
**BUILD:** `pages/AiPage.tsx` with keyword routing over tasks, courses,
finances, goals, health and notes; suggestion chips; a chat transcript. The
dashboard AI promo submits into `/ai` via router state.
**VERIFY:** "What is due today?" lists open tasks with times; other prompts
return the matching module summary.

### STEP 2.10 — Automation rules (simulated runs)
**STATUS:** ✅
**GOAL:** Exercise the automation UX before a real engine exists.
**BUILD:** `pages/AutomationPage.tsx`; keys `lifeos.rules` and `lifeos.activity`.
Rules can be toggled, run manually (increments run count and appends activity)
and created from trigger/action text.
**VERIFY:** Run a rule and see the count increase plus a new history entry.

### STEP 2.11 — Settings and help
**STATUS:** ✅
**GOAL:** Profile, appearance controls and documentation.
**BUILD:** `pages/SettingsPage.tsx` (profile stored in `lifeos.profile`, theme
choice, reset-all-data) and `pages/HelpPage.tsx` (FAQ, shortcuts, contact).
**VERIFY:** Rename the profile and see the topbar and greeting update; reset
restores seed data.

---

# PHASE 3 — Frontend polish

### STEP 3.1 — Global search and notification shell
**STATUS:** 🟡 in progress
**GOAL:** Cmd/Ctrl+K search that navigates, and a notification surface.
**DONE:** Search field focuses via Cmd/Ctrl+K, filters the twelve routes,
supports Enter and Escape; bell shows a static unread count.
**BUILD NEXT:** index module records (tasks, notes, files, events) as search
targets, add a results overlay with sections, and turn the bell into a
dropdown backed by a `lifeos.alerts` store.
**VERIFY:** Searching "calculus" surfaces the event and the note; bell badge
count matches unresolved alerts.

### STEP 3.2 — Responsive and mobile navigation
**STATUS:** ✅
**GOAL:** Usable from 320 px upward.
**BUILD:** Breakpoints at 1180/1024/860/640 px in `layout.css`,
`dashboard.css` and `pages.css`; the sidebar collapses to icons at 860 px and
becomes a five-item bottom bar at 640 px.
**VERIFY:** At phone width, bottom nav is visible and every page stacks
without horizontal scrolling (tables scroll inside their own container).

### STEP 3.3 — Accessibility and performance pass
**STATUS:** 🟡 in progress
**DONE:** Semantic landmarks, labelled inputs, `aria-current` via NavLink,
`aria-selected` tabs, `role="switch"` toggles, visible focus rings, reduced
motion handling.
**BUILD NEXT:** Audit contrast for pastel pills in both themes, add a skip
link, ensure every icon-only button has an accessible name (already mostly
done), and remove the `Date` call from render in `PlannerPage`.
**VERIFY:** Keyboard-only navigation reaches every page and control; no
console errors; Lighthouse accessibility ≥ 95.

### STEP 3.4 — Route-level code splitting
**STATUS:** ⬜ pending
**GOAL:** Keep the initial bundle small.
**BUILD:** Convert page imports in `App.tsx` to `React.lazy` with a suspense
fallback matching the card skeleton style.
**VERIFY:** `npm run build` reports multiple chunks; navigation still
instant on localhost.

---

# PHASE 4 — Backend and real persistence

### STEP 4.1 — FastAPI scaffold and health check
**STATUS:** ⬜ pending
**GOAL:** A backend the frontend can talk to.
**BUILD:** `apps/api/app/main.py`, `app/core/config.py`, `/api/health`, CORS
for `http://localhost:5173`, Vite proxy for `/api`.
**VERIFY:** `GET http://localhost:8000/api/health` returns `{"status":"ok"}`
and the homepage still loads.

### STEP 4.2 — Database, models and migrations
**STATUS:** ⬜ pending
**GOAL:** One table per module, matching the frontend shapes.
**BUILD:** SQLAlchemy base, SQLite engine, Alembic, models for `users`,
`tasks`, `events`, `transactions` (amounts in minor units), `courses`, `goals`,
`health_logs`, `notes`, `documents`, `automation_rules`, `activity`.
**VERIFY:** `alembic upgrade head` creates `app.db`; `/api/health` still ok.

### STEP 4.3 — Auth (register, login, JWT)
**STATUS:** ⬜ pending
**GOAL:** Per-user data.
**BUILD:** `POST /api/auth/register`, `POST /api/auth/login`,
`GET /api/auth/me`, hashing and token dependencies.
**VERIFY:** Register and log in through `/docs`; `/api/auth/me` returns the
user.

### STEP 4.4 — API client and auth-aware frontend
**STATUS:** ⬜ pending
**GOAL:** Replace `useLocalStore` reads with API queries.
**BUILD:** `src/services/api.ts` fetch wrapper, TanStack Query provider,
`AuthProvider`, login/register routes, guarded `/app` area.
**VERIFY:** Logging in loads the dashboard with server data; logging out
returns to the welcome page.

### STEP 4.5 — Persist tasks and events
**STATUS:** ⬜ pending
**BUILD:** CRUD routers (`/api/tasks`, `/api/events`), typed hooks, optimistic
updates, dashboard widgets switched to queries.
**VERIFY:** A task created in one browser appears after reload; dashboard
counts match the API.

### STEP 4.6 — Persist finance, learning, goals, health
**STATUS:** ⬜ pending
**BUILD:** Routers, summary endpoints, migration of the remaining local
stores to queries. Keep KSh/USD display logic presentation-only.
**VERIFY:** Each module survives reload and reports the same totals as the
API summary endpoints.

### STEP 4.7 — Persist notes and files (upload)
**STATUS:** ⬜ pending
**BUILD:** Notes router; document upload to local disk with metadata rows;
preview and download endpoints; file size limits.
**VERIFY:** Uploaded file can be downloaded; notes table paginates.

### STEP 4.8 — Notifications and search endpoints
**STATUS:** ⬜ pending
**BUILD:** `/api/search` across tasks, notes, files and events;
`/api/alerts` with read/unread state.
**VERIFY:** Cmd/Ctrl+K returns server search results; bell count matches
unread alerts.

### STEP 4.9 — Pluggable AI provider
**STATUS:** ⬜ pending
**BUILD:** `/api/assistant` with a rule-based default and an optional provider
adapter behind an env flag; conversation history optional.
**VERIFY:** Existing prompts produce the same answers as the local build;
without a key the rule-based path still works.

### STEP 4.10 — Automation engine with run history
**STATUS:** ⬜ pending
**BUILD:** Real triggers on task completion, expense creation and study
sessions; rule execution writes activity rows; run history endpoint.
**VERIFY:** Completing a task with an active rule produces an activity entry
and increments run count server-side.

---

# PHASE 5 — Packaging

### STEP 5.1 — PWA manifest and service worker
**STATUS:** ⬜ pending
**BUILD:** `vite-plugin-pwa`, manifest (name, icons, theme color), offline
shell for the dashboard.
**VERIFY:** Chrome offers install; the installed app opens on `/`.

### STEP 5.2 — Desktop wrapper
**STATUS:** ⬜ pending
**BUILD:** Electron or Tauri shell that serves the built frontend and can
start the bundled API.
**VERIFY:** A development build launches a desktop window with the dashboard.

### STEP 5.3 — Installable build and smoke test
**STATUS:** ⬜ pending
**BUILD:** Installer configuration, app icons, versioned release artifact.
**INSTALL/RUN:** `cd apps/web && npm run build && npm run preview`.
**VERIFY:** Fresh install opens the dashboard; light/dark toggle works; local
data persists between launches.

---

## Definition of Done (every step)

- [ ] `npm install` completes without peer-dependency errors.
- [ ] `npm run dev` serves `/` cleanly (plus `uvicorn` once Phase 4 starts).
- [ ] No console errors on the homepage.
- [ ] New feature is visible and works.
- [ ] Light and dark themes both render correctly.
- [ ] `npm run build` and `npm run lint` pass.
- [ ] Previous steps still work (no regressions).

---

## Next recommended step

**4.1 — FastAPI scaffold.** The frontend is feature-complete against local
data; the highest-value next move is standing up the API and health check, so
Phase 4 persistence can proceed one module at a time. Until then the frontend
is the reference implementation for every data shape in `src/lib/seed.ts`.

---

# APPENDIX A — Design tokens (implemented)

```css
:root {
  --canvas:#EEEFFB; --surface:#FFFFFF; --surface-2:#F4F6FD;
  --sidebar:#0D1B37; --primary:#1462EA; --indigo:#4A4FC5;
  --green:#0EAE50; --azure:#319AD6; --orange:#F16A0F; --amber:#F8A955;
  --purple:#9B6BD7; --red:#E04848;
  --text:#445868; --text-strong:#0D1B37; --muted:#7C8DB5;
  --border:rgba(13,27,55,0.08); --radius:16px; --sidebar-width:250px;
}
[data-theme="dark"] {
  --canvas:#0C162D; --surface:#15224B; --surface-2:#1C2D63;
  --sidebar:#081024; --primary:#4143D4; --indigo:#4143D4;
  --green:#22B052; --azure:#2EA8BE; --orange:#F0AB43; --amber:#F0AB43;
  --purple:#AB5BC4; --red:#D44B43;
  --text:#CBD5E1; --text-strong:#FFFFFF; --muted:#7B86B2;
  --border:rgba(255,255,255,0.08);
}
```

Gradient utilities used by stat cards and quick tiles:

```css
.grad-green  { background:linear-gradient(135deg,#0EAE50,#22C55E); }
.grad-blue   { background:linear-gradient(135deg,#1462EA,#38BDF8); }
.grad-orange { background:linear-gradient(135deg,#F16A0F,#FBBF24); }
.grad-purple { background:linear-gradient(135deg,#6E45E2,#A855F7); }
.grad-teal   { background:linear-gradient(135deg,#0284C7,#2DD4BF); }
.grad-pink   { background:linear-gradient(135deg,#E11D48,#FB7185); }
.grad-indigo { background:linear-gradient(135deg,#4338CA,#6366F1); }
.grad-lime   { background:linear-gradient(135deg,#4D7C0F,#84CC16); }
```

Type scale: display 30–32/700 · h2 15–17/600 · metric 21–26/700 · body
12.5–14/400 · caption 10–11/500. Shape: sidebar 250 px · topbar 68 px ·
canvas padding 24 px · grid gap 16 px · card radius 16 px.

---

# APPENDIX B — Layout architecture (implemented)

- **Left nav rail:** 250 px sticky, full height, dark navy in both themes.
  Collapses to a 76 px icon rail at 860 px and a five-item bottom bar at 640 px.
- **Topbar:** 68 px sticky; rounded search pill with Cmd/Ctrl+K, bell with a
  red unread count, avatar with name and role.
- **Main canvas:** scrollable, 24 px padding, 16 px gaps, 16 px card radius.
- **Sidebar footer:** light = progress card ("You're on track!"); dark =
  gold-bordered "Upgrade to Pro" card. Both show the theme switch and version.
- **Nav items:** Home, Planner, Study & Learning, Finance, Health & Fitness,
  Notes & Knowledge, Files & Documents, Goals & Habits, AI Assistant (New),
  Automation, Settings, Help & Support.

---

# APPENDIX C — Dashboard composition

**Hero banner** (`.hero`, min-height 138 px, radius 16 px):
- Light art: `linear-gradient(120deg,#1D70F2,#60A5FA 48%,#FDBA74 82%,#F97316)`.
- Dark art: `linear-gradient(120deg,#1E1B4B,#4C1D95 45%,#BE185D 75%,#EA580C)`.
- Decorative mountain SVG with a sun circle, plus a left-to-right dark scrim.
- Light right side: weather + live clock. Dark right side: focus-of-the-day
  quote. Dark greeting renders the first name in `#F0AB43`.

**Light layout:**
1. Five gradient stat cards — Tasks, Events, Finance (USD), Courses, Goals.
2. Row: Today's Tasks · Upcoming Events · Finance Overview bar chart.
3. Row: Learning Progress donut · Your Goals · AI Assistant promo.

**Dark layout:**
1. Eight quick-action tiles (Study, Tasks, Calendar, Finance, Health, Goals,
   AI Assistant, More).
2. 3×3 matrix: schedule + tasks + learning · finance (KSh + sparkline) +
   goals + health · quick access + reminders + recent activity.

---

# APPENDIX D — Donut ring (`components/DonutRing.tsx`)

```tsx
export function DonutRing({ percent, color='var(--green)', label, size=116 }) {
  const r = 40, c = 2*Math.PI*r, off = c - (Math.min(100, percent)/100)*c;
  return (
    <div className="donut">
      <div className="donut-visual" style={{ width:size, height:size }}>
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={r} fill="transparent"
            stroke="var(--surface-2)" strokeWidth="10"/>
          <circle className="donut-value" cx="50" cy="50" r={r}
            fill="transparent" stroke={color} strokeWidth="10"
            strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"/>
        </svg>
        <div className="donut-label">{percent}%</div>
      </div>
      {label ? <span className="caption">{label}</span> : null}
    </div>
  );
}
```

The ring animates via `stroke-dashoffset` (0.6 s ease) on the
`.donut-value` class.

---

# APPENDIX E — Notion-style notes database (implemented)

- **Cover:** full-width amber banner `#F0C05A`, 140 px; 📝 emoji overlapping
  the bottom-left edge.
- **Tabs:** All notes · ENG 455 · To review · `+`; active tab is a 2 px bottom
  border in the heading color.
- **Columns:** Reviewed checkbox · Name (emoji + title) · Class (colored pill)
  · Type (secondary pill) · delete action.
- **Footer:** "+ New" on the left, `COUNT n` on the right.
- **Mobile:** the table scrolls horizontally with a 560 px minimum width so
  the Name column stays readable.

---

# APPENDIX F — Local data keys (temporary until Phase 4)

| Key | Shape |
|---|---|
| `lifeos.tasks` | `{ id, title, category, priority, due, done }[]` |
| `lifeos.events` | `{ id, title, place, day, start, tone }[]` |
| `lifeos.txns` | `{ id, label, amount, type, date }[]` |
| `lifeos.courses` | `{ id, name, done, total, tone }[]` |
| `lifeos.goals` | `{ id, title, current, target, unit, tone }[]` |
| `lifeos.notes` | `{ id, title, emoji, className, type, reviewed }[]` |
| `lifeos.files` | `{ id, name, kind, size, tag }[]` |
| `lifeos.health` | `{ steps, sleep, water, diet }` |
| `lifeos.reminders` | `{ id, title, time, badge, done }[]` |
| `lifeos.rules` | `{ id, trigger, action, active, runs }[]` |
| `lifeos.activity` | `{ id, title, time }[]` |
| `lifeos.profile` | `{ name, role, focus }` |
| `lifeos.theme` | `"light"` or `"dark"` |

Clearing these keys (Settings → Reset all data) restores the seed values in
`src/lib/seed.ts`.
