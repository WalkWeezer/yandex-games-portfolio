# Работник месяца — STATUS

| Поле | Значение |
|------|----------|
| **designStatus** | `REVIEW` (G0 placeholders authorized by producer) |
| **slug** | `deadline-escape` |
| **displayName.ru** | Работник месяца |
| **displayName.en** | Employee of the Month |
| **coding_allowed** | `true` for G0 Phaser scaffold with **placeholder art only** |
| **feel SoT** | `management/demos/demos-01-02.js` → `FEEL_DEMOS["deadline-escape"]` |
| **UI shell beta** | dashboard → **Бета-тест** (`deadline-mock-ui.js`) |
| **clean play** | `games/deadline-escape/play/` — production feel, **без DEV∞** |
| **Phaser G0** | `games/deadline-escape/` — Vite + Phaser 3 + runtime placeholders |
| **port freeze** | `docs/PORT.md` — ALLOW/DENY для переноса в билд |
| **ART_STATUS** | placeholders (DESIGN IDs); real art swap later |
| **synced** | 2026-07-20 (G0 placeholders + Yandex SDK facade) |
| **archive** | `archive/2026-07-17-pre-feel-sync/` · `archive/2026-07-18-sprites-cleanup/` · `archive/2026-07-18-pipeline-v1-reset/` |

## Gate

```
F0 Vector lock     ✅
F1 Feel demo       ✅ (Демка; DEV только ?dev=1)
F1.5 Clean play    ✅ games/deadline-escape/play/ (DEADLINE_PROD)
F2 Loop freeze     → после human CONFIRM
G0 Phaser + stubs  ✅ src/ с заглушками по DESIGN asset IDs (без final art)
G1+ real art       ⛔ до paint-over / CONFIRM арта
```

## Чеклист

- [x] Старый пакет в archive
- [x] DESIGN без dual-truth (grid canon)
- [x] prompts / refs / sprite pipeline
- [x] PORT.md ALLOW/DENY · production без DEV-читов
- [x] `play/` вход (Yandex-shaped)
- [x] G0 Vite+Phaser: Boot→Menu→Hub→Daily→Run→Pause→Caught→Result→Shop/Settings
- [x] Placeholder textures: tile_* · char_* · boss_* · pu_* (DESIGN §8)
- [x] YaSdk: LoadingAPI / GameplayAPI / RV / interstitial · DEV_MOCK
- [ ] Human APPROVED на style-seed
- [ ] Swap placeholders → refs art
- [ ] Human playtest (~2–3 рана)
- [ ] Продюсер ставит `CONFIRMED` на feel/loop

**CONFIRM feel — только решение человека.** G0 с заглушками — по запросу продюсера.
