# Легенды Поля — Visual References Index

> Эти файлы — обязательный вход для арт/UI/level LLM-агентов.  
> При генерации новых ассетов держать стиль как у референсов ниже.

## Art
![Key art](../refs/art/key-art.png)

`refs/art/key-art.png` — tonal/mood lock, palette, composition.

## Concept art (variants на выбор)

Черновики: `refs/art/concepts/` · индекс `refs/art/concepts/MANIFEST.md`.  
На сайте: вкладка **Концепт-арт**. По **3 варианта** на запрос (key art / карты / матч-доска).  
Пока не аппрувнуты — **не** заменяют `key-art.png`.

### Key art
![KA v1](../refs/art/concepts/key-art/v1-stadium-cards.jpg)
![KA v2](../refs/art/concepts/key-art/v2-sideline-holograms.jpg)
![KA v3](../refs/art/concepts/key-art/v3-ball-streak.jpg)

### Cards
![Cards v1](../refs/art/concepts/cards/v1-trio-frame.jpg)
![Cards v2](../refs/art/concepts/cards/v2-striker-portrait.jpg)
![Cards v3](../refs/art/concepts/cards/v3-roles-row.jpg)

### Match board
![Board v1](../refs/art/concepts/match-board/v1-tokens-cross.jpg)
![Board v2](../refs/art/concepts/match-board/v2-topdown-grid.jpg)
![Board v3](../refs/art/concepts/match-board/v3-isometric.jpg)

## UI Wireframes
![UI wireframe](../refs/ui/wireframe-main.png)

`refs/ui/wireframe-main.png` — экраны, иерархия, CTA rewarded/IAP зоны.

## Level / Content Layout
![Level layout](../refs/levels/layout-main.png)

`refs/levels/layout-main.png` — грамматика уровней/доски/маршрута.

## Sprites / Animation Sheet
![Sprites](../refs/sprites/sheet-main.png)

`refs/sprites/sheet-main.png` — пропорции, кадры, иконки.

## Как использовать агентам

1. Открыть `DESIGN_LLM.md` (контракт).
2. Открыть этот `REFS.md` (визуальный ground truth).
3. Взять атомарный промпт из `prompts/` и **приложить** соответствующий png.
4. Сохранять результат в пути из Integration Contract `DESIGN_LLM.md`.

## DoR visuals

- [x] key-art
- [x] wireframe-main
- [x] layout-main
- [x] sheet-main
