# Чеклист портфеля — готовность дизайна и разработка

> Живой HTML-дашборд: [`portfolio-dashboard.html`](portfolio-dashboard.html)  
> Интерактивный пайплайн (этапы, уже пройденные на Работнике / Легендах): [`pipeline.html`](pipeline.html)  
> Страницы проектов: [`projects/`](projects/) — у каждой вкладки с документами и картинками.  
> Пересборка UI: `python tools/build_dashboard.py`  
> Правило: **код (`src/`) запрещён**, пока статус дизайна ≠ **Подтверждён**.

## Легенда статусов дизайна

| Статус | Значение |
|--------|----------|
| `DRAFT` | Документы написаны, ждём ревью |
| `REVIEW` | На проверке у тебя |
| `CONFIRMED` | Можно запускать Gate 0 разработки |
| `BLOCKED` | Дыры в диздоке, доработать |

## Матрица (синхронизировать с HTML)

| # | Игра | Classic GDD | LLM GDD | Refs UI/Level/Sprite | Design Status | Dev Gate |
|---|------|-------------|---------|----------------------|---------------|----------|
| 01 | neon-bullet | ✅ | ✅ | ✅ | DRAFT | — |
| 02 | deadline-escape | ✅ | ✅ | ✅ | DRAFT | — |
| 03 | tide-of-relics | ✅ | ✅ | ✅ | DRAFT | — |
| 04 | legends-of-the-pitch | ✅ | ✅ | ✅ | DRAFT | — |
| 05 | merge-bazaar | ✅ | ✅ | ✅ | DRAFT | — |
| 06 | crystal-archipelago | ✅ | ✅ | ✅ | DRAFT | — |
| 07 | idle-forge | ✅ | ✅ | ✅ | DRAFT | — |
| 08 | cozy-plot | ✅ | ✅ | ✅ | DRAFT | — |
| 09 | auto-towers | ✅ | ✅ | ✅ | DRAFT | — |
| 10 | night-courier | ✅ | ✅ | ✅ | DRAFT | — |

## Definition of Ready для CONFIRM дизайна (на игру)

- [ ] Прочитан `docs/DESIGN.md` — видение ок
- [ ] Прочитан `docs/DESIGN_LLM.md` — контракты/системы/уровни/UI ок
- [ ] Есть `refs/art/key-art.png`
- [ ] Есть `refs/ui/wireframe-main.png`
- [ ] Есть `refs/levels/layout-main.png`
- [ ] Есть `refs/sprites/sheet-main.png`
- [ ] **Сыграна Feel-демка** на странице проекта (вкладка «Демка») — управление и «хочу ещё» ок
- [ ] Промпты в `prompts/` достаточны для арт/код агентов
- [ ] Скоуп MVP реалистичен для store-ready
- [ ] Явно подтверждено: **CONFIRMED**

Методология: [`docs/METHODOLOGY.md`](../docs/METHODOLOGY.md)  
Работник месяца vs chas-pik: [`games/deadline-escape/docs/GAP_VS_CHAS_PIK.md`](../games/deadline-escape/docs/GAP_VS_CHAS_PIK.md)

## Порядок confirm (рекомендация)

1. Wave 1: deadline-escape, night-courier, merge-bazaar  
2. Wave 2: crystal-archipelago, idle-forge  
3. Wave 3: neon-bullet, auto-towers, cozy-plot  
4. Wave 4: tide-of-relics, legends-of-the-pitch  
