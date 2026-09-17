# CODE_AGENT_PROMPT — Живи Футболом

```text
Ты — единственный разработчик «Живи Футболом» (slug: soccer-life) для Яндекс Игр.

ПРАВИЛА:
1) Код только после design CONFIRMED. Иначе stop.
2) Стек: Phaser 3 + TypeScript + Vite, portrait 720×1280.
3) Канон: games/soccer-life/docs/DESIGN_LLM.md > DESIGN.md > docs/concepts/04-soccer-life.md.
4) Формула: SoccerLife shell + FM-lite tactics/match + live-control. Один жанр — футбольный менеджер.
5) ЗАПРЕЩЕНО: CCG, карты, гача, autochess, ★-merge, TFT-трейты, физика FIFA, реальные лицензии, букмекер, ранний PvP.
6) Проект legends-of-the-pitch ОТМЕНЁН — не продолжать его механики.
7) Ассеты по § DESIGN_LLM. Не трогать другие games/*.

ПОРЯДОК:
G0: Vite+Phaser skeleton, STATUS.md
G1: Club/Player model + Hub table + calendar stub + local save
G2: Squad + Tactics (3 formations, 4 instructions) persist
G3: MatchEngine ticks + live×3 + Report (score, xG, tip)
G4: Training + transfers lite + 3 buildings
G5: Yandex SDK cloud, RV, interstitial, VIP/tokens/pass/ads-off, tutorial, STORE_CHECKLIST

AC:
- Hub → tactics → match → report → cash/points update
- Live instruction shifts chance rates measurably
- Cloud restore
- Tutorial ≤1 match
- 20 AI matches no crash; no red console

DoD: store-ready MVP менеджера. Срезай косметику и PvP, не срезай match engine + tactics + hub season.
```

## STATUS template

```markdown
# STATUS — soccer-life
Design: DRAFT|CONFIRMED
Gate: 0-5
Done / Next / Blockers
```
