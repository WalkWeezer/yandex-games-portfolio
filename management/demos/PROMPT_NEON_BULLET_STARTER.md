# Neon Bullet — стартовый промпт (новый чат)

Скопируй блок ниже целиком в **новый** чат с workspace  
`C:\Users\borov\Projects\yandex-games-portfolio`.

После первого выравнивания демки под combat-puzzle используй  
`PROMPT_DEEPEN_NEON_BULLET.md` (заполненный метод из `PROMPT_DEEPEN_FEEL_DEMO.md`).

---

```text
Ты работаешь только над feel-демкой игры Neon Bullet в портфеле Яндекс Игр.

КОРЕНЬ:
C:\Users\borov\Projects\yandex-games-portfolio

ВЕКТОР (MERGE, зафиксирован):
- Жанр: top-down Hotline-like combat-puzzle для Яндекс Игр
- Core verb: планируй маршрут → обходи vision cones → убивай → стой на EXIT
- Win: objective выполнено (MVP: clear = все враги мертвы) И игрок на клетке/зоне EXIT
- Fail: попадание по игроку → death → рестарт <400ms
- Пространство: комнаты + стены (честные коллизии), не open arena waves
- Mobile-first portrait; twin-stick: стик = движение, кнопка/второй ввод = огонь/aim
- VFX в демке: без gore (фигуры); целевой рейтинг 12+ dissolve (как Neontron) — blood не канон
- Бренд остаётся Neon Bullet (не копировать «Неонтрон»/пейджер wholesale)

АНТИ-ВЕКТОР (запрещено):
- Wave-arena / endless spawn chase как MVP
- Fire-only-along-facing без отдельного aim
- Free-roam без стен и без EXIT
- Production games/neon-bullet/src/**
- Другие демки / другие игры
- Тяжёлый арт / AI sprites

ОБЯЗАТЕЛЬНО ПРОЧИТАЙ:
1) games/neon-bullet/docs/DESIGN.md
2) games/neon-bullet/docs/DESIGN_LLM.md (системы / уровни)
3) games/neon-bullet/docs/GAP_VS_JSOOTER.md
4) docs/METHODOLOGY.md
5) management/demos/demo-engine.js
6) management/demos/demos-01-02.js — блок FEEL_DEMOS["neon-bullet"]
7) management/demos/PROMPT_DEEPEN_FEEL_DEMO.md — метод слоёв (следуй духу)

РЕФЕРЕНС FEEL (не копировать бренд/репо как submodule):
C:\Users\borov\Projects\JSooter
- docs/GDD-NEONTRON.md §2–§4 (pillars, combat fantasy, vision)
- docs/tech-design/TDD-NEONTRON-LLM.md §0.2 / §3 (win rules, EXIT)
- при необходимости src/scenes/MissionScene.ts (checkWin / death restart)

ЦЕЛЬ ЭТОЙ СЕССИИ (слой 0→1, максимум задеть слой 2):
1) Инвентаризация: что в демке врёт вектору (сейчас wave-arena).
2) ПЕРЕПИСАТЬ демку neon-bullet под combat-puzzle:
   - 1–2 комнаты, стены, 2–4 врага
   - у врагов читаемый vision cone (дуга); не видят сквозь стены
   - one-hit death, рестарт без reload страницы, цель <400ms
   - win = все враги мертвы И игрок на EXIT (зона/клетка)
   - mobile: move stick + fire/aim (не только огонь в сторону бега)
   - оружие: можно упростить (постоянный «пистолет»-круг), pickup — опционально 1 предмет на полу
3) Коротко обновить Pass-2 / feel targets в DESIGN.md под факт демки.
4) НЕ делать сразу слои 3–7 (кривая этажей, wireframe hub, daily) — это следующий чат по PROMPT_DEEPEN_NEON_BULLET.md

ФАЙЛЫ ДЛЯ ПРАВОК:
- management/demos/demos-01-02.js (главное)
- management/demos/demo-engine.js — только если ломает twin-stick / tap на мобиле
- games/neon-bullet/docs/DESIGN.md — короткий Pass-2 / feel lock

DEFINITION OF DONE (сессия 1):
- [ ] Демка больше не wave-arena
- [ ] За 5–10с понятно: двигайся, не заходи в конус, убей, дойди до EXIT
- [ ] Смерть → мгновенный рестарт той же комнаты
- [ ] Победа только через EXIT после clear
- [ ] Играбельно с телефона (serve-dashboard.bat)
- [ ] DESIGN feel lock совпадает с демкой

ФОРМАТ ОТВЕТА:
1) Gaps текущей демки vs вектор (5–8 буллетов)
2) Что сделал в коде
3) Как проверить (hard refresh → Neon Bullet → Демка; с телефона)
4) Какой следующий слой из PROMPT_DEEPEN_NEON_BULLET.md рекомендуешь

Начни с чтения файлов, затем сразу выравнивай демку. Не предлагай вернуть waves как канон.
```
