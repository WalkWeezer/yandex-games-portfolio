# Demo Arena Combat — индекс

Канон боевой демо-арены. DualSense-first. Язык правил — русский.

## Документы

| Файл | Зачем |
|------|--------|
| [`COMBAT_MECHANICS.md`](./COMBAT_MECHANICS.md) | **Источник истины.** Полный канон: ресурсы, карта кнопок, шасси, силы, явления, босс, маршруты |
| [`DEMO_BUILD_CHECKLIST.md`](./DEMO_BUILD_CHECKLIST.md) | Упорядоченный чеклист инженера (день 1 → приёмка) |
| [`EVALUATION.md`](./EVALUATION.md) | Рекурсивные оценки качества, риски, вердикт готовности |
| [`refs/`](./refs/) | Арт-референсы (настроение/силуэты). **Числа и бинды только из COMBAT_MECHANICS** |

## Как пользоваться для сборки демо

1. Открой **§0 Build Order** в `COMBAT_MECHANICS.md` — это день-1 последовательность.
2. Держи рядом `DEMO_BUILD_CHECKLIST.md` и закрывай пункты сверху вниз.
3. **Не импровизируй бинды.** Золотая карта:
   - **R1/R2** = Attack A/B
   - **L1/L2** = Skill1/Skill2
   - **L1+L2** = Combine (явление)
   - **○** dodge, **□** block/parry, **△** swap, **×** interact, **R3** lock
4. Приёмка = три пресета **M1 / M2 / M3** проходят по §11.7 канона.
5. Всё, чего нет в каноне — **вне v0**.

## Быстрые якоря

- Нет element queue. Пара скиллов → именованный феномен.
- Gear = Chassis + Material + RuneA + RuneB. Chassis ≫ Rune ≫ Material.
- Ресурсы: HP, STA, Focus, Debt/Heat, Poise.
- Tier-2 нужен носитель; melee-клир без Tier-2 валиден.
