# DEMO_BUILD_CHECKLIST — инженеры

Источник истины по числам: `COMBAT_MECHANICS.md`.  
Отмечай сверху вниз. Не прыгай через блоки.

## A. Каркас ввода и движения

- [ ] A1. Л стик → движение 4,2 м/с, без спринта
- [ ] A2. П стик → soft-aim clamp 3 м, deadzone 0,12
- [ ] A3. R3 soft-lock ≤10 м, toggle/сброс
- [ ] A4. Options = пауза; Touchpad клик = статус 1,2 с
- [ ] A5. Touchpad hold ≥200 мс = Env Read (носители ≤8 м), не скрывает телеграфы врага

## B. Ресурсы

- [ ] B1. HP 100; смерть → рестарт с тем же loadout; лечения нет
- [ ] B2. STA 100; реген 28/с после 0,35 с idle; deny если STA < cost
- [ ] B3. Focus 100; Tier-0 = 24; Combine = 40; реген 10/с после 0,80 с
- [ ] B4. Debt 0–50; недостача Focus → Debt; Heat-ленты Cold/Warm/Hot/Critical
- [ ] B5. Debt≥30 → dodge +6 STA; Debt≥40 → Backfire на каст/combine
- [ ] B6. Debt drain 6/с только при Focus≥60 и вне wind-up
- [ ] B7. Poise 80; =0 → stagger 0,70 с, Poise→40, реген 20/с

## C. DualSense глаголы (без полного каталога скиллов)

- [ ] C1. **R1** Attack A, **R2** Attack B
- [ ] C2. **L1** Skill1, **L2** Skill2
- [ ] C3. **L1+L2 ≥120 мс** = Combine (не R1+R2)
- [ ] C4. **○** Dodge: STA 28; i-frames 0,18 с с кадра 2; recover 0,22
- [ ] C5. **□** hold ≥200 мс Block (canBlock); tap/контакт в 0,12 с = Parry
- [ ] C6. **△** Swap: commitment 0,60 с, CD 4,00 с, move ×0,4
- [ ] C7. **×** Interact ≤1,5 м
- [ ] C8. Приоритет ввода как в §5 канона
- [ ] C9. Haptic минимум + adaptive R2/L2 по §4.1–4.2

## D. Оружие

- [ ] D1. Cleaver A/B полные тайминги + canBlock
- [ ] D2. Spear A/B + charge B + блок запрещён в charge
- [ ] D3. Twin Knives A серия 1–3 / 4-й длинный; B bleed; canBlock=no
- [ ] D4. Orb A bolt + B hang/detonate + weave +0,50 с
- [ ] D5. Grimoire A метки (max 2) + B щит 0,90 с
- [ ] D6. Staff A + B wave + pierce после 0,40 с стоя
- [ ] D7. Material таблица ×HP/×poise/тег
- [ ] D8. Magic A/B уже с штрафом ×0,75 HP / ×0,70 poise в числах канона
- [ ] D9. 1 активное + 1 запасное; swap меняет только оружейный пакет

## E. Силы и явления

- [ ] E1. 5 Tier-0 сил, startup 0,28 / recover 0,22, dodge-cancel 0–0,10 с
- [ ] E2. Combine wind-up 0,45 / recover 0,30, cancel 0–0,12 с
- [ ] E3. 10 именованных Tier-1 (неупорядоченная пара; **нет** element queue)
- [ ] E4. Tier-2 при носителе ≤1,5 м soft-aim; иначе Tier-1 без Backfire
- [ ] E5. Geometry Shadow ≠ Skill Shadow (только Skill Shadow расходник Tier-2)
- [ ] E6. Запрет двух одинаковых сил в loadout UI

## F. Руны

- [ ] F1. Weapon: 2 слота; ForceExclusive / Stance конфликты
- [ ] F2. Armor: 2 слота; Family конфликт; обязательный штраф
- [ ] F3. Loadout UI без суммарного DPS-числа
- [ ] F4. Пресеты M1/M2/M3 загружаются одной кнопкой

## G. Backfire и прерывания

- [ ] G1. Cast stagger (poise in ≥25 в commitment): одиночный = fail без Backfire
- [ ] G2. То же на combine = fail + Backfire
- [ ] G3. Debt≥40 старт каста/combine = Backfire (12 HP, Poise−30, self-stagger 0,35 с)

## H. Арена и AI

- [ ] H1. Комната 18×14; колонны; круг (9,8); старт (9,2); дверь (9,13)
- [ ] H2. Носители: 3 Torch, 2 Water, 1 Oil, geometry shadows, corpses от аддов
- [ ] H3. Ash Grunt HP70 Poise50 — рубка + плевок
- [ ] H4. Tide Wretch HP55 Poise40 — болт + смачивание
- [ ] H5. Gate Saint HP280 Poise120 — 3 фазы по канону
- [ ] H6. Скрипт: оба адда мертвы **или** 45 с → вход босса
- [ ] H7. Жёлтый/красный телеграфы поверх VFX игрока

## I. Приёмка маршрутов

- [ ] I1. M1 Pure Melee клир; Debt≤20; без обязательного Tier-2
- [ ] I2. M2 Pure Magic клир; ≥50% урона боссу от скиллов/явлений; A/B ≤25%
- [ ] I3. M3 Hybrid клир; ровно 1 swap; ≥1 Tier-2 Проводная казнь; ни источник >70%
- [ ] I4. Медиана времени M1 vs M2 ≤20% разницы (playtest)
- [ ] I5. Сознательный провал: M2 без носителей ≥+30% времени

## J. Запреты v0 (не делать)

- [ ] J1. Нет element queue / третьего скилла
- [ ] J2. Нет флаконов / левелинга / роглайк-меты
- [ ] J3. Нет random affix soup
- [ ] J4. Нет Combine на R1+R2 (регрессионный тест биндов)
