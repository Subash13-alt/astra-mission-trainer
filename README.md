# 🚀 ASTRA – Junior Astronaut Mission Trainer

> **Every Decision Matters. Every Resource Counts.**

ASTRA is a free, browser-based educational space survival game for children aged 7–12. Players command a research
outpost on the **Moon** or **Mars** for **30 days**, balancing oxygen, water, food, electricity, radiation protection
and crew health. Every action has a cost, so every choice is a trade-off.

- **Stack:** React 18 · Vite · JavaScript · Tailwind CSS 3 · Framer Motion · Lucide icons · Recharts · React Router
- **No accounts, no personal data.** Progress is saved in the browser (LocalStorage).
- **Works offline** (except live NASA panels, which fall back to clearly-labelled archived samples).

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # engine + service unit tests (Node's built-in test runner, no extra deps)
npm run build      # production build in dist/
npm run preview    # serve the production build locally
```

Requires Node 18+.

## What is real, what is simulated

| Label in the app | Meaning |
| --- | --- |
| 🟢 **Live NASA data** / 💾 **Saved NASA data** | Real observations from NASA services, shown with source and date. |
| 🗂️ **Archived sample (not live)** | Fallback content used only if NASA cannot be reached. |
| 🟣 **Simulated game value** | Resource %, daily use, crew health, shield strength and the “space-weather risk level”. Invented for gameplay balance. **Not NASA measurements, not medical advice.** |
| 🔵 Approximation | Rounded facts for learning (e.g. radio delay, gravity). |

Important scientific choices:

- **DONKI observations are never converted into radiation doses.** They are shown as an educational space-weather
  list. The in-game risk level is a separate, labelled simulation driven only by the game's own schedule.
- **“Radiation Protection”** is how strong the habitat shield is (a game score), not a measured dose.
- **Crew Health** is a simple game score, not a diagnosis.
- **OSDR** research datasets are linked as research, never presented as live astronaut health monitoring.
- Mars communication delay uses a configurable illustrative value (`MARS_COMM_DELAY_MIN`) and the UI says real delay varies (about 3–22 minutes one way).

## NASA API configuration

ASTRA uses `api.nasa.gov` (DONKI space weather and Mars Rover Photos) and the OSDR public API (`osdr.nasa.gov`).

1. Get a free key at <https://api.nasa.gov/>.
2. Copy `.env.example` to `.env` and set `NASA_API_KEY=your_key`.
3. Restart `npm run dev`.

The key variable intentionally has **no `VITE_` prefix**, so it is never bundled into browser code:

- **Development:** the Vite dev server proxies `/api/nasa/*` and `/api/osdr/*` and adds the key server-side (`vite.config.js`).
- **Production (Vercel):** serverless functions in `api/nasa/[...path].js` and `api/osdr/[...path].js` do the same, with an
  allow-list of endpoints and CDN caching.
- With no key, NASA's shared `DEMO_KEY` is used (low rate limits).

Resilience built in: 9-second timeouts, one automatic retry, rate-limit (HTTP 429) handling, loading indicators, “Try again” buttons,
time-limited caching in LocalStorage, last-good-data reuse, and finally archived samples. **If every NASA call fails, the game stays fully playable.**

> **Note on live services:** NASA changes its public APIs from time to time. The Mars Rover Photos service in particular has
> been reported as unreliable or changing, and the OSDR search response format may change. ASTRA parses responses defensively and
> falls back gracefully, but if a panel always shows “Archived sample”, check the API docs linked in the app credits.

## Deploy to Vercel

1. Push this folder to GitHub (`.env` is git-ignored; never commit keys).
2. In Vercel choose **Add New → Project**, import the repo. Framework preset: **Vite** (detected from `vercel.json`).
3. Under **Settings → Environment Variables** add `NASA_API_KEY`.
4. Deploy. `vercel.json` rewrites all routes to `index.html` so deep links like `/mission` work, and `/api/*` is served by the functions.

CLI alternative: `npm i -g vercel && vercel --prod`.

## How the game works

**Daily loop:** handle today's decision (if any) → spend up to 3 actions → *End Day* → the crew uses resources → next day.

- **Actions** (each costs resources): Oxygen Generator, Recycle Water, Greenhouse, Clean Solar Panels, Strengthen Shielding, Science Experiment, Crew Rest.
  Actions are refused if they would drop a resource under a small safety reserve, and experiments are blocked while air/water/food is in the red.
- **15 scenarios**, three choices each, with costs, consequences and a “Why it matters” lesson. They appear on a fixed schedule by mission phase,
  plus emergencies triggered when a resource runs low (with cooldowns). Planet-specific: *Long Lunar Night* (Moon), *Martian Dust Storm* (Mars).
- **Single-use emergency supplies:** batteries, food packs, spare parts, oxygen tanks.
- **Phases:** Days 1–5 basics · 6–10 water & food · 11–15 power · 16–20 solar activity · 21–25 messages & emergencies · 26–30 final challenge.
- **Failure:** oxygen, water or food reaches 0, or crew health ≤ 15. The report explains what went wrong and how to improve, with kind wording.
- **Success:** survive 30 days → report, badges, score chart. **Scoring rewards safety**: research is capped and low-weighted, risky choices lower scores.
- **Difficulty:** Easy (ages 7–9, more supplies, hints) · Normal (9–12) · Challenge (scarcer supplies, extra emergencies).

### Balancing the game

All gameplay numbers live in **`src/engine/missionConfig.js`** (consumption rates, starting values, thresholds, difficulties, effects, actions,
scenario schedule) and **`src/data/scenarios.js`** (choice costs). The engine is deterministic, with no randomness, so the same decisions always give the same result.

## Features checklist

Landing · Astronaut profile (nickname sanitised, avatars, difficulty, preferred planet) · Planet selection · Mission briefing + tutorial + launch countdown ·
Mission-control dashboard (resource cards, decision center, activity, alerts, crew status, environment, timeline, interactive map) ·
ASTRA AI rule-based advisor (offline, privacy-safe, hints without choosing for you) · Science Center (8 learning cards, Moon vs Mars, NASA data, glossary) ·
Mission report with charts and badges · Mission history · Pause / save / resume · Sound effects (generated with Web Audio, mute button) ·
Teacher / demo mode (About → Settings) · Reduced-motion support · Keyboard navigation, skip link, ARIA labels · Responsive (mobile / tablet / desktop).

## Project structure

```
api/                    Vercel serverless proxies (NASA key stays server-side)
src/engine/             Pure simulation: config, resource maths, scenarios, scoring, practice-crew autopilot
src/data/               Scenarios, science content, archived NASA fallback data
src/services/           NASA client, LocalStorage, rule-based advisor, sound
src/hooks/              App state provider, NASA data hook
src/components/         Reusable UI (resource cards, scenario card, panels, map, overlays…)
src/pages/              Home, HowToPlay, Profile, PlanetSelection, MissionBriefing, MissionControl, ScienceCenter, MissionReport, About
```

## Testing

`npm test` runs 55 automated tests covering: resource clamping and status zones, deterministic daily consumption, environment effects,
action costs/validation (no free actions), scenario scheduling and cooldowns, every required scenario, reserves, difficulty scaling,
failure and success conditions, save/restore round-trip, whole-mission runs on both planets × three difficulties, scoring/badges, advisor safety, and NASA response parsing.

The “practice crews” in `src/engine/autopilot.js` also prove the balance: a careful crew wins every setup, while a do-nothing crew loses on Normal/Challenge
and a science-rushing crew loses everywhere and scores lower.

## Design decisions

- **Original art only:** planets, astronauts and illustrations are hand-written SVG/CSS. Sounds are synthesised, so there are no licensing or download concerns.
- **No heavy backend:** only two tiny serverless proxies, needed to hide the NASA key and avoid CORS.
- **Leaflet not used:** an SVG mission map covers the “interactive map” need without extra dependencies.
- **AI advisor is rule-based.** If you add an LLM later, call it through a secure backend with child-safe system rules, strict length limits and no logging of personal data. Keep the rule-based advisor as the offline fallback.
- **Privacy:** nickname only (letters/numbers, max 16 chars), stored locally; no analytics, cookies or accounts.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Space-weather / Mars panels say “Archived sample” | NASA unreachable or rate-limited. Add your own `NASA_API_KEY`, then press **Try again**. |
| `403`/`429` from NASA | `DEMO_KEY` limit reached. Use your own free key. |
| Deep link (e.g. `/mission`) gives 404 on a host | Add an SPA rewrite to `index.html` (already in `vercel.json`). |
| Progress disappeared | LocalStorage was cleared or the browser is in private mode. ASTRA warns if saving fails. |
| No sound | Browsers allow audio only after a click. Check the mute button in the top bar. |
| `npm test` fails on old Node | Use Node 18 or newer. |

## Credits

NASA DONKI · NASA Open APIs · NASA Mars Rover Photos · NASA OSDR · NASA Artemis (links in the app's About and Science pages).
ASTRA is an independent educational project and is **not made, endorsed or run by NASA**.
