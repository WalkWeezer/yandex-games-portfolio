# Работник месяца — UI_PROMPTS

**Канон:** `DESIGN_LLM.md` §4, screens `management/demos/deadline-wireframes.js`.  
**Не писать `src/`.**

## Style lock

```
Comedy office UI: cool gray-blue #E8EEF5 panels, sticky yellow CTA #E9C46A,
flat readable type, portrait mobile 720x1280 frames, no purple glow, no phone hardware mock as the deliverable.
```

## JOB A — UI kit → production later `ui_kit.png` / vibe `refs/ui/tone-ui.png`

```
Mobile game UI kit Employee of the Month: primary/secondary buttons, modal panel, HUD clock + day progress bar, buff icons coffee and shield, revive dialog, floor select node, shop row — cool gray-blue and sticky yellow, flat comedy office, no device bezel
```

## JOB B — Screen copy (RU) — implement exactly

| Screen | Copy |
|--------|------|
| Menu | Играть / Настройки |
| Hub | Этажи · Daily · Магазин |
| Daily | Побег из планёрки · 1/день |
| HUD | `HH:MM` · фаза · этаж · монеты · баффы |
| Pause | Продолжить · Настройки · В хаб |
| Caught | **ЗАСТАВИЛИ РАБОТАТЬ** · Продолжить (реклама) · В меню |
| Result win | **ПОВЫШЕНИЕ!** · Следующий этаж · Хаб |
| Result fail | Этаж / время · Ещё раз · Хаб |
| Tutorial | Ходи по светлым · избегай боссов · доживи до 18:00 |

**Запрет copy:** «Спрячься», hide tutorial, stealth tips.

## JOB C — Wireflow check

boot → menu → hub → daily? → run ↔ pause → caught → result → shop/hub

Daily **only** from hub card.

## DoD

- [ ] ЗАСТАВИЛИ / ПОВЫШЕНИЕ exact  
- [ ] No hide language  
- [ ] CTA sticky yellow readable on gray-blue  
