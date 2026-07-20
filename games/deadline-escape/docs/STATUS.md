# Работник месяца — STATUS

| Поле | Значение |
|------|----------|
| **designStatus** | `REVIEW` |
| **slug** | `deadline-escape` |
| **displayName.ru** | Работник месяца |
| **displayName.en** | Employee of the Month |
| **coding_allowed** | `false` for Phaser `src/**` until `CONFIRMED` |
| **feel SoT** | `management/demos/demos-01-02.js` → `FEEL_DEMOS["deadline-escape"]` |
| **UI shell beta** | dashboard → **Бета-тест** (`deadline-mock-ui.js`) |
| **clean play** | `games/deadline-escape/play/` — production feel, **без DEV∞** |
| **port freeze** | `docs/PORT.md` — ALLOW/DENY для переноса в билд |
| **ART_STATUS** | `PIPELINE_V1` |
| **synced** | 2026-07-20 (G0 Phaser scaffold removed) |
| **archive** | `archive/2026-07-17-pre-feel-sync/` · `archive/2026-07-18-sprites-cleanup/` · `archive/2026-07-18-pipeline-v1-reset/` |

## Gate

```
F0 Vector lock     ✅
F1 Feel demo       ✅ (Демка; DEV только ?dev=1)
F1.5 Clean play    ✅ games/deadline-escape/play/ (DEADLINE_PROD)
F2 Loop freeze     → после human CONFIRM
G0+ src/ Phaser    ⛔ до CONFIRMED — перенос строго по docs/PORT.md
```

## Чеклист перед CONFIRM

- [x] Старый пакет в archive
- [x] DESIGN без dual-truth (grid canon)
- [x] prompts / refs / sprite pipeline
- [x] PORT.md ALLOW/DENY · production без DEV-читов
- [x] `play/` вход (Yandex-shaped)
- [ ] Human APPROVED на style-seed
- [x] Human APPROVED на HR seed + idle turnaround (`seed-hr.APPROVED.json`)
- [ ] Human playtest через `play/` (~2–3 рана)
- [ ] Продюсер ставит `CONFIRMED`

**CONFIRM — только решение человека.**  
Phaser G0 scaffold удалён (2026-07-20) — не восстанавливать без нового запроса.
