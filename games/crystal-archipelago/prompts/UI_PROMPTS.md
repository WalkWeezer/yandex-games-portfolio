# UI_PROMPTS — Кристаллы Архипелага

> Канон: DESIGN_LLM §4–5. Выход: `refs/ui/`.

## Style lock

```text
Casual tropical match-3 UI, turquoise and gold accents, dark board frame, sunny cheerful panels, large thumb targets, Russian labels on mockups, clean one-job screens, no dashboard clutter, no purple-on-white generic AI look
```

## Screen mocks

### Map
```text
9:16 mobile map UI tropical islands path nodes level 1-15, lives hearts coins gems top, daily button, pass button, soft parallax sea, Russian
```

### PreLevel
```text
Level start modal goals icons moves count prebooster slots PLAY button tropical gold, Russian Уровень Ходы Играть
```

### Level HUD
```text
Overlay UI transparent center for board: moves left, goal counters with gem icons, bottom four boosters, pause, tropical casual, large hit areas
```

### Win
```text
Victory three stars animation space, soft rewards, NEXT and MAP buttons, Russian Победа
```

### Fail
```text
Out of moves modal, rewarded +5 moves primary, booster, restart, map; friendly not punitive, Russian
```

### Shop / Pass / Lives
```text
IAP shop lives booster packs remove ads pass; tropical cozy store clear prices no gambling
```

## UI kit

```text
UI kit transparent: play button, panel parchment-tropical, progress bar, heart life, coin gem icons, booster slots, close pause settings, star icons empty/full, map node states
```

## Asset IDs

```text
ui_btn_play_{up,down}
ui_btn_secondary_*
ui_panel_modal
ui_icon_life / ui_icon_coin / ui_icon_gem
ui_icon_pause / ui_icon_close
ui_goal_slot
ui_booster_slot
ui_star_on / ui_star_off
ui_map_node_{locked,open,done1,done2,done3}
ui_board_frame
```

## Motion
- Star fly to HUD 500ms  
- Goal check pop 200ms  
- Fail modal 200ms fade  

## Rules
Never cover board with IS ad mid-level; min hit 64px; goal icons color+shape.

## Delivery
`refs/ui/screens/`, `refs/ui/kit/`, `NOTES.md`
