# Море Реликвий — LEVEL_PROMPTS

**Канон:** `DESIGN_LLM.md` §4.  
Здесь «уровни» = граф акта + таблицы врагов/событий/наград (не tilemap офиса).

## Контекст
```
Tide of Relics Act 1 content designer.
Deliver JSON graphs and tables matching schemas in DESIGN_LLM.
Output paths:
public/assets/data/act1_graph.json
public/assets/data/events.json
public/assets/data/foes.json
public/assets/data/relics.json
public/assets/data/ships.json
public/assets/data/shops.json
refs/levels/act1_map_preview.png
```

## JOB A — Act 1 graph

Требования:
- 12–16 узлов + boss
- ≥2 ветки
- shop до босса гарантирован на каждом полном path
- node types mix per curve §4.4
- positions без overlap (<80px)

**LLM prompt:**
```
Спроектируй act1_graph для Море Реликвий на 14 узлов + boss.
Верни JSON: nodes[{id,type,difficulty,x,y,rewardTableId}], edges[[from,to]].
Типы: combat,elite,event,shop,treasure,boss.
Кривая: intro→teach event→ramp→shop→optional elite→preboss shop→leviathan.
Проверь: из старта есть 2 пути; каждый путь имеет ≥1 shop до boss.
```

## JOB B — Events (15 MVP)

Каждый: title, body RU, 2–3 choices, effects typed, no softlock.

Обязательные id примеры:
`evt_siren_bargain`, `evt_marooned_crew`, `evt_imperial_tax`, `evt_cursed_idol`,
`evt_merchant_drift`, `evt_storm_shelter`, `evt_ghost_lighthouse`, `evt_kraken_egg`,
`evt_mutiny_whispers`, `evt_reef_map`, `evt_priest_of_tide`, `evt_smuggler_hold`,
`evt_mirror_lagoon`, `evt_abandoned_brig`, `evt_oracle_gull`

## JOB C — Encounter tables

Свяжи `rewardTableId` / `foeTableId` с recipes: intro_patrol, pirate_pack, haunt, cult_ambush, imperial_tax, boss_leviathan.

## JOB D — Balance notes

Для каждого combat node: expected scrap 8–15; elite 18–28; damage threat vs brig hull 30.

## Validation checklist

- [ ] JSON валиден  
- [ ] Все event choices закрывают узел  
- [ ] Boss escape disabled flag  
- [ ] Easy/Normal multipliers documented in foes.json  
- [ ] Preview image in refs/levels  

## Запреты
3 акта в MVP; события без безопасного выхода; mid-combat ads hooks в данных.
