# STATUS — soccer-life

Design: CONFIRMED  
Gate: 3 (match engine core) / shell G0–G2 landing in parallel  
Coding: allowed

## Done
- Concept + DESIGN + DESIGN_LLM
- Design unlocked for core build
- **Match engine (G3):** `matchEngine` 90-tick event sim, seeded RNG, live×3
- **Chance model:** attack/defense powers + instr mult 0.85–1.20 + xG/outcomes
- **Report builder:** score, xG, best player, 3 key events, tip
- **SC_Match / SC_Report:** feed UI, live buttons, speed ×1/×2/×4, hub return
- Smoke: `npx tsx src/engine/__tests__/simSmoke.ts`

## Match-engine section
| Piece | Path | Notes |
|-------|------|--------|
| Types | `src/engine/types.ts` | MatchState, report, deltas, `REG.*` keys |
| Chance | `src/engine/chanceModel.ts` | pChance / xG / powers |
| Sim | `src/engine/matchEngine.ts` | `createMatch` / `tickMatch` / `applyLiveAction` / `simulateMatch` |
| Report | `src/engine/reportBuilder.ts` | `buildReport` + cash/form deltas |
| UI | `src/scenes/MatchScene.ts` | reads `REG.matchConfig` or GameState |
| Report UI | `src/scenes/ReportScene.ts` | → `SC_Hub` |

**Sibling call:**
```ts
import { simulateMatch } from './engine/matchEngine';
import { REG } from './engine/types';
import { SCENE } from './types';

// Headless
const { report, deltas } = simulateMatch({ home, away, seed: 42 });

// Interactive
registry.set(REG.matchConfig, { home, away, seed: 42, liveCharges: 3 });
// or omit config — MatchScene builds from GameState (player vs next opponent)
scene.start(SCENE.Match);
```

## Next
- Wire remaining Hub polish / G4 training-transfers-buildings
- VIP live×4 already read from `vipUntil`
- G5 SDK

## Blockers
- none
