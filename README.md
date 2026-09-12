# GeeDesk — IT Troubleshooting Simulator

GeeDesk turns realistic IT helpdesk tickets into an interactive troubleshooting game. Investigate an incident with a simulated terminal and a chat with the affected user, submit a diagnosis, apply a fix, verify it actually worked, and get a deterministic, evidence-based score.

**Zero backend. Zero paid APIs. Zero accounts.** Everything runs client-side; progress is saved in your browser's `localStorage`.

## Quick start

```bash
npm install
npm run dev
```

Then open the printed local URL. To build a static production bundle:

```bash
npm run build   # outputs to dist/
npm run preview # serve the production build locally to sanity-check it
```

## Deploying for free

The Vite config uses relative asset paths (`base: './'`) and the app uses a hash router (`/#/tickets/...`), so the build in `dist/` works as-is from **any** static host or sub-path — no server rewrite rules needed.

- **GitHub Pages**: push this repo to GitHub, then enable Pages in the repo settings pointed at the included `.github/workflows/deploy.yml`, which builds and deploys `dist/` automatically on every push to `main`.
- **Cloudflare Pages**: connect the repo, set build command `npm run build`, output directory `dist`.

## How it's built

- **React + TypeScript + Vite + Tailwind CSS v4** — built from `GeeDesk_Project_Specification`.
- **`src/types/scenario.ts`** — the scenario data model. A ticket is pure data: environment, symptoms, hidden fault, terminal outputs, evidence, conversation, diagnosis/resolution options, a scoring rubric, and hints.
- **`src/data/scenarios/`** — actual scenario content. Adding a new ticket means adding a new file here and one line in `index.ts` — nothing in the engine or UI needs to change.
- **`src/game/`** — the engine. Pure, framework-free functions:
  - `terminal.ts` — interprets simulated commands against scenario data (never touches a real shell).
  - `engine.ts` — one pure function per player action (`runCommand`, `askQuestion`, `submitDiagnosis`, ...), each `(scenario, session) -> session`.
  - `scoring.ts` — deterministic, testable scoring. No AI involved.
  - `persistence.ts` — the `localStorage` read/write layer, XP, streaks, and achievements.
  - `store.tsx` — the only place these pure functions meet React state (a `Context` + `useState`).
- **`src/components/`, `src/pages/`** — UI that renders whatever scenario is active. No ticket-specific logic lives here.

## Current scope (V1, in progress)

- Done: one complete, polished scenario end-to-end (`NET-1042`) — ticket -> investigate -> diagnose -> fix -> verify -> score.
- Done: deterministic scoring across six categories, with hint costs and an efficiency penalty for unnecessary actions.
- Done: XP, levels, streaks, and four achievements, all persisted locally.
- Next milestone: four more scenarios on the same engine (per the spec's "no ticket-specific engine logic" rule), then a weak-skill / random-incident practice mode.

## Explicitly out of scope for V1

Accounts, a database, a backend, real AI calls, payments, and multiplayer — see the spec's non-goals. The architecture (`src/game/persistence.ts` in particular) is intentionally the seam where a future opt-in AI "coach" or a real backend could be added without touching the game engine.
