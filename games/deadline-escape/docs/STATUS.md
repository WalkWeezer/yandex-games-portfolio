# Работник месяца — STATUS

| Поле | Значение |
|------|----------|
| **designStatus** | `REVIEW` |
| **slug** | `deadline-escape` |
| **displayName.ru** | Работник месяца |
| **displayName.en** | Employee of the Month |
| **coding_allowed** | `false` until `CONFIRMED` |
| **feel SoT** | `management/demos/demos-01-02.js` → `FEEL_DEMOS["deadline-escape"]` |
| **mock UI beta** | dashboard → вкладка **Бета-тест** (`management/demos/deadline-mock-ui.js`) |
| **ART_STATUS** | `PIPELINE_V1` (2026-07-18) — визуал с нуля по `SPRITE_PIPELINE.md` |
| **synced** | 2026-07-17 (grid feel → docs/prompts/refs) |
| **archive** | `archive/2026-07-17-pre-feel-sync/` · `archive/2026-07-18-sprites-cleanup/` · `archive/2026-07-18-pipeline-v1-reset/` |

## Art / pipeline

`ART_STATUS = PIPELINE_V1` — см. **`SPRITE_PIPELINE.md`**.

- Сейчас: **P1** — кнопка APPROVED на сайте (Спрайты) → маркер `refs/art/style-seed-hero.APPROVED.json`
- Активный арт: только style-seed + sheets ГГ; остальное в `archive/2026-07-18-pipeline-v1-reset/`
- Дальше: QA/walk ГГ под пайплайн → HR от seed → director → rest (4-dir)
- Закон: seed → strip → normalize → GIF QA; без warp/graft/regen-карусели
- Human gate: **APPROVED** / reject на style-seed (агент не APPROVED сам)

MVP art scope: **ГГ** idle+walk+caught · **HR** idle+walk · остальные боссы **4-dir only**.

## Gate

```
F0 Vector lock  ✅
F1 Feel demo    ✅ (dashboard → Демка)
F2 Loop freeze  → после human CONFIRM на этом пакете
G0+ src/        ⛔ не начинать до CONFIRMED
```

CONFIRM = feel OK на телефоне, **не** «все 12 боссов идеальны».

## Чеклист перед CONFIRM

- [x] Старый пакет в archive
- [x] `DESIGN.md` / `DESIGN_LLM.md` без dual-truth (grid canon)
- [x] `prompts/*` переписаны под демку
- [x] Vibe refs в `refs/`
- [x] Sprite pipeline v1 (`SPRITE_PIPELINE.md`) + style-seed export
- [ ] Human APPROVED на `style-seed-hero.png`
- [ ] Human playtest F1→F2 на телефоне (~2–3 рана)
- [ ] Продюсер ставит `CONFIRMED` в дашборде / этом файле

**CONFIRM — только решение человека.** Агент не повышает статус сам.
