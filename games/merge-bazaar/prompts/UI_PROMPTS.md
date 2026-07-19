# UI_PROMPTS — Базар Слияний

> Канон: `docs/DESIGN_LLM.md` §4–5. Выход: `refs/ui/` + kit PNG.

## Style lock

```text
Cozy fantasy mobile UI, warm cream panels #FFF6E8, purple #6B3FA0 and gold #E6B35A accents, wood trim, large thumb buttons, friendly rounded but not pill-spam, Russian labels on mockups, clear hierarchy, no cluttered cards wall
```

## Screens to mock

### Board (primary)
```text
9:16 merge bazaar UI, top energy timer coins gems, two order cards, wooden 6x5 board with cute item icons, bottom generator buttons and shop, cozy purple gold, Russian labels Энергия Заказ
```

### Energy modal
```text
Modal empty energy, options watch ad +25, buy pack, wait timer, cozy friendly not aggressive paywall, Russian
```

### Hub décor
```text
Shop façade décor editor UI, placeable hotspots, inventory strip décor items, CTA К прилавку, cozy
```

### Collection album
```text
Grid of discovered merge max items, locked silhouettes, cozy sticker album feel
```

### Shop IAP
```text
Energy packs, pass, board slots, remove ads, décor pack, clear prices, soft cozy store, no gambling art
```

### Pass
```text
Light battle pass track cozy bazaar rewards energy décor coins
```

## UI kit prompt

```text
Cozy mobile UI kit transparent: primary purple gold button states, secondary wood button, modal panel parchment, energy bar, coin gem energy icons, order panel, close and back icons, toggle, progress bar, soft shadows subtle
```

## Asset IDs

```text
ui_btn_primary_{up,down,dis}
ui_btn_secondary_*
ui_modal_panel
ui_bar_energy
ui_order_panel
ui_icon_close / ui_icon_back / ui_icon_stash
ui_btn_rv
ui_shop_tile
ui_pass_node_*
```

## Motion
- Drag magnet 80ms ease  
- Invalid merge shake 150ms  
- Order complete panel bounce 300ms  

## Rules
Min hit 64px; merge не перекрывать модалкой mid-drag; interstitial не на board drag.

## Delivery
`refs/ui/screens/`, `refs/ui/kit/`, `NOTES.md` 8px grid.
