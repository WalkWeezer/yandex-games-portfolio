# AGENTS.md

## Cursor Cloud specific instructions

### What this repo is
A **static, vanilla HTML/CSS/JS** games portfolio ("Yandex Games Portfolio") plus Python tooling. There is **no `package.json`, no bundler, no lockfile, and no framework** — pages are opened directly or via a plain static file server. The current focus (this branch family) is the **Pitch Tactics** football-tactics demos under `management/demos/`.

### Runtimes
- **Node.js** and **Python 3** are both required and pre-installed on the VM. They are used independently (no build pipeline links them).
- The only external dependency is the Python `markdown` package, used by the dashboard/PDF build scripts. The scripts auto-install it on demand, and the update script also installs it up front.

### Lint
There is **no linter configured** in this repo (no ESLint/Prettier/flake8 config). Do not expect a `lint` command; there is nothing to run.

### Tests (Node, no framework — plain scripts)
- Smoke test: `node management/demos/smoke-legends-pitch.js` (prints `SMOKE PASS` on success; non-zero exit on failure).
- AI-vs-AI full-match autoplay (headless, DOM is stubbed): `node management/demos/pitch-tactics-autoplay.mjs [opponentId=academy] [--out path]`. Simulates a full 90' match in ~150ms and prints a JSON result + protocol.

### Build (Python)
- `python3 tools/build_dashboard.py` regenerates `management/portfolio-dashboard.html`, the per-game files in `management/projects/*.html`, and `management/assets/dashboard.{js,css}`.
- Gotcha: those generated files are **committed** in the repo, so running the build **dirties the working tree** even with no source change. If you only ran it to verify, `git checkout --` the regenerated files unless you intend to commit them.
- `python3 tools/md_to_pdf.py` builds PDFs from docs; PDFs are gitignored and may pull in `playwright`/`chromium`. Not needed for normal dev.

### Run (static server)
- From the repo root: `python3 -m http.server 8765` (the `.bat` files are Windows-only wrappers around this). Serve from the **repo root**, not a subfolder, so `games/*/docs` and `refs` resolve.
- Key pages once served:
  - Dashboard: `http://localhost:8765/management/portfolio-dashboard.html`
  - Pitch Tactics replay viewer: `http://localhost:8765/management/demos/pitch-tactics-replay.html`
  - Pitch Tactics interactive play demo: `http://localhost:8765/management/demos/pitch-tactics-play.html`
- The `*-standalone.html` files (e.g. `pitch-tactics-play-standalone.html`) are self-contained single-file bundles that also work when opened directly with `file://`.

### Demo/testing notes
- The replay viewer (`pitch-tactics-replay.html`) is the most deterministic thing to demo: use the bottom transport controls — `Шаг →` (next step), `▶ Смотреть` (play), and the H/I/J match tabs — to step/auto-play a match; clock, score, and step counter update as it advances.
- In the interactive play demo, clicking one of your (orange) players during your turn opens a **radial action menu** positioned on top of the piece; pick an action, then click a target hex. Automated/agent clicks on the radial can be finicky because it overlays the player.
