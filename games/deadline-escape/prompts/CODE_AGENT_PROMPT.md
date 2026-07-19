# Работник месяца — CODE_AGENT_PROMPT

**Канон:** `docs/DESIGN_LLM.md` + feel demo.  
**⛔ Если `docs/STATUS.md` designStatus ≠ `CONFIRMED` — FORBIDDEN писать `src/**`.**

## Identity

```
Code agent — Employee of the Month (deadline-escape).
MVP verb: top-down GRID DODGE, 4-dir cell steps, day clock 09→18.
NOT ChaseAI free-move. NOT hide/LOS/stealth systems as MVP.
Port feel numbers from FEEL_DEMOS["deadline-escape"] unless DESIGN_LLM says otherwise.
```

## Pre-flight

1. Read `docs/STATUS.md` — abort coding if not CONFIRMED.  
2. Read `DESIGN_LLM.md` INV-DE-01…08.  
3. Play / read feel demo path: `management/demos/demos-01-02.js`.  
4. Orchestrator: ACCEPT / REWORK / CUT only.

## Systems to implement (post-CONFIRM)

| System | Responsibility |
|--------|----------------|
| `GridMap` | cell codes, walkable, growth every 25 floors |
| `GridMove` | step + slide 0.095s, input latches |
| `DayClock` | TIME_SCALE 0.5, phases, promote at 540 |
| `ThreatSystem` | off-map spawn, 12 kinds/patterns, caps, fairness |
| `BonusSystem` | coffee slow-mo, badge drop/shield, coins |
| `RunScene` | HUD, pause, caught, result |
| `MetaHub` | floors, daily, shop, save |
| `Audio` | SFX keys + office_loop |
| `YandexSDK` | ready, gameplay start/stop, RV |

## Explicit non-goals (MVP)

- `ChaseAI` continuous pursuit on navmesh  
- `hideZone` / LOS detection loops  
- Coffee as player move-speed buff  
- Badge as invisibility  
- Lane-only 3-column runner as the whole map  

## AC smoke (after G0)

- [ ] Walls block player  
- [ ] Threats enter from multiple edges  
- [ ] 18:00 → ПОВЫШЕНИЕ  
- [ ] Hit → ЗАСТАВИЛИ  
- [ ] Coffee slows threats; badge absorbs one hit  
- [ ] LoadingAPI.ready called once  

## DoD session

- Match DESIGN_LLM paths and IDs  
- No drive-by refactors outside slug folder  
- Feel regress: day length and move slide still in band  
