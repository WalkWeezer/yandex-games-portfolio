# UI_PROMPTS — auto-towers

**Роль:** UI агент.  
**Читать:** DESIGN_LLM §3 (full inventory + wireframes).  
**Ground truth:** `refs/ui/wireframe-main.png`.  
**coding_allowed:** false until CONFIRMED.

## Lock
```
Mobile TD UI kit, cream panels #F1FAEE, navy text #1D3557, red CTA #E63946, gold #F4D35E, arcane purple #9B5DE5 accents, large card offers for thumbs, synergy strip, no text labels, no fake numbers
```

## Atlas
panel, btn_cta, btn_secondary, card_offer_frame, slot_marker_empty/filled, synergy_chip, life_heart, gold_coin_chip, skill_btn, wave_banner, result_stars, modal_retry_rv, meta_node_locked/owned.

## Mocks → `refs/ui/` (ALL major)
boot, meta hub, chapter select, loadout, battle HUD, shop panel, skill button states, pause, result win/lose, rewarded retry, meta tree, IAP shop, settings.

Align primary battle mock to `refs/ui/wireframe-main.png`.

## Touch contract
| Control | Min |
|---------|-----|
| Slot marker | 72×72 |
| Card offer | 96×128 |
| Skill | 80×80 BR |
| Pause | 44×44 TR |
| Reroll / sell / start wave | 48×48 / 56×56 |

## RU copy
«Старт волны», «Перебросить», «Продать 50%», «Скилл героя», «Повторить волну», «×2 награда», «Синергия», «Пыль».

## Rules
No interstitial mid-wave; RV retry labeled; confirm sell accidental-proof; mid-wave shop hidden.

## Acceptance
- [ ] All §3 screens mocked
- [ ] Touch mins met
- [ ] Matches wireframe-main
