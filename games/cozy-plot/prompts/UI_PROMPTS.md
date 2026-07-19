# UI_PROMPTS — cozy-plot

**Роль:** UI агент. `DESIGN_LLM.md` §3 (inventory + all wireframes), §15.  
**Ground truth:** `refs/ui/wireframe-main.png`.  
**coding_allowed:** false until CONFIRMED.

## Master lock
```
Mobile cozy farm UI kit, cream panels #FAEDCD, wood frames #D4A373, coral CTA #E76F51, soft leaf green accents #8CB369, rounded 20px, light shadows only, 9-slice friendly, portrait 720 wide, no text labels, no fake numbers, no glassmorphism, no dark mode default
```

## U1 — Atlas parts
`panel_cream_9slice`, `btn_primary_coral`, `btn_wood`, `order_card`, `recipe_card`, `currency_chip_coin`, `currency_chip_rep`, `timer_pie_soft`, `modal_frame`, `tab_bag/kitchen/orders/decor/shop`, `seed_picker_frame`, `decor_thumb_frame`.

## U2 — Screen mocks → `refs/ui/`
1. Homestead HUD  
2. Seed picker  
3. Kitchen  
4. Orders (soft timer)  
5. Decor catalog + placement ghost  
6. Village NPC  
7. Expansion unlock modal  
8. Shop IAP  
9. Rewarded «Ускорить рост»

## U3 — Component contract
| Component | Touch min | Notes |
|-----------|-----------|-------|
| Plot cell | 64×64 | world |
| Seed button | 56×56 | |
| OrderCard CTA | 48×48 | |
| RewardedChip | 48×48 | label reward |
| Decor confirm | 56×56 | |

## U4 — RU strings
«Вспахать», «Посадить», «Собрать», «Приготовить», «Сдать заказ», «Ускорить рост», «Открыть участок у реки», «Просрочка: награда 60%», «Нет жёсткого штрафа — сдайте, когда сможете».

## Rules
- Timer warn color `#E9C46A`, critical `#E76F51` only last 10%  
- No ads during drag placement  
- Sticky optional only on Village screen bottom inset
