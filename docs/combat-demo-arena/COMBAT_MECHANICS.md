# Демо-арена: боевые механики (канон v2)

**Статус:** канон для немедленной сборки v0 арены.  
**Язык правил:** русский. Числа важнее прилагательных.  
**Жанр:** изометрический hardcore action (вес soulslike + маршруты immersive sim).  
**Ввод:** DualSense-first.  
**Вне скоупа демо:** левелинг персонажа, роглайк-мета, магазин между забегами, кооп.

Если правило не описано здесь — его **нет** в демо. Любое изменение чисел = новая версия документа.

---

## 0. Build Order for Programmers (день 1 → арена)

Делать **строго по порядку**. Не начинать босса, пока не закрыт предыдущий блок.

| Шаг | Что собрать | Готово, когда | Числа-якоря |
|-----|-------------|---------------|-------------|
| **P0** | Игрок: движение + камера-aim | Л стик двигает, П стик двигает soft-aim ≤ 3 м, deadzone 0,12 | скорость базы 4,2 м/с |
| **P1** | Ресурсы HP/STA/Focus/Debt/Poise | HUD числа; реген по §3; действия блокируются при STA < cost | HP100, STA100, Focus100, Debt0–50, Poise80 |
| **P2** | DualSense map §4 без скиллов | R1/R2 = Attack A/B заглушки; ○ dodge; □ block; × interact; △ swap; R3 lock | см. §4 |
| **P3** | Одно melee-шасси Cleaver | A/B с startup/active/recovery; STA cost; hitbox | §6.3 Cleaver |
| **P4** | Dodge + i-frames + Poise stagger | ○: 0,18 с i-frames с кадра 2; Poise=0 → stagger 0,70 с | STA28 |
| **P5** | Block/Parry на □ | hold=block, tap/вход в окне=parry; canBlock только Cleaver/Spear | §6.2 |
| **P6** | Skill1/Skill2 на L1/L2 (Tier-0) | 5 сил; Focus24; wind-up 0,28 / recover 0,22 | §7.1 |
| **P7** | Combine = **L1+L2 ≥ 120 мс** | Tier-1 феномен по неупорядоченной паре; Focus40 | §7.2, §8 |
| **P8** | Носители + Tier-2 | Torch/Water/Oil/Shadow/Corpse; soft-aim ≤1,5 м → Tier-2 иначе Tier-1 | §7.3 |
| **P9** | Debt→Heat + Backfire | Debt≥40 → Backfire; haptic Heat | §3.4, §8.4 |
| **P10** | 6 шасси + Material + 2 Weapon Runes | Конфликты ForceExclusive/Stance; иерархия Chassis≫Rune≫Material | §6–§9 |
| **P11** | 2 Armor Runes | Конфликты Family; штрафы обязательны | §10 |
| **P12** | Пресеты M1/M2/M3 + loadout UI | Без суммарного DPS-числа | §6.5 |
| **P13** | Адды ×2 | Ash Grunt + Tide Wretch | §11.3–11.4 |
| **P14** | Босс Gate Saint 3 фазы | HP280; скрипт 45 с / оба адда | §11.5–11.6 |
| **P15** | Приёмка трёх маршрутов | M1/M2/M3 проходят по критериям §11.7 | §13 |

**Запрет дня 1:** роглайк-лут, очередь элементов, третий скилл-слот, Affix-суп, лечение флаконами.

---

## 1. Десять жёстких правил (не обсуждаются)

1. **Combine = L1+L2** (удержание ≥ 120 мс). **Не** R1+R2. R1/R2 = только Attack A/B.
2. **Нет очереди элементов.** Loadout = ровно Skill1 + Skill2. Явление = именованный феномен пары. Порядок кнопок не важен.
3. **Враг важнее алхимии.** Телеграф врага всегда выше VFX игрока и подсветки носителей.
4. **Скилл = акт Силы. Руна = пассив оружия/брони. Среда = носитель Tier-2.** Spark-руна ≠ Spark-скилл.
5. **Иерархия силы билда:** Chassis ≫ Rune ≫ Material. Шасси задаёт глаголы; руна — поведение; материал — тонкий множитель.
6. **Gear = Chassis + Material + RuneA + RuneB.** Без ARPG-аффиксов и без «ещё одного процента в меню».
7. **Focus + Debt/Heat + Backfire** работают вместе. Магия не бесплатна.
8. **Tier-2 требует носитель.** Tier-0/1 работают без среды. Melee-клир без Tier-2 валиден.
9. **Три фантазии равноправны:** pure melee / pure magic / hybrid — у каждой явный маршрут на демо-боссе (§11.7).
10. **Свап = commitment 0,60 с, CD 4,00 с.** Меняет только оружие (Chassis+Material+Weapon Runes). Skills и Armor Runes не меняются.

---

## 2. Combat pillars

1. Читаемость врага первична.
2. Вес и commitment: спам проигрывает таймингу.
3. Мастерство без уровней: знание телеграфов, носителей, Focus/Debt.
4. Три равноправных победы.
5. Две активные силы → один феномен.
6. Среда — маршрут силы, не декор.
7. Руны правят оружием, не заменяют скиллы.

---

## 3. Ресурсы (точные правила)

### 3.1 HP
| Параметр | Значение |
|----------|----------|
| Max | **100** |
| Старт | 100 |
| Смерть | HP ≤ 0 → рестарт арены с тем же loadout |
| Лечение в демо | **нет** |
| Crit | ×1,5 HP-урона + отдельный SFX/haptic |

**Failure:** HP≤0 = смерть. Нет «downed» состояния.

### 3.2 Stamina (STA)
| Параметр | Значение |
|----------|----------|
| Max | **100** |
| Реген | **28 STA/с** после **0,35 с** без траты STA |
| При STA < cost | действие **не стартует** (короткий haptic deny) |

| Действие | Cost STA |
|----------|----------|
| Attack A | 12 |
| Attack B | 22 |
| Dodge | 28 |
| Block absorb (canBlock) | 8 + 0,35 × входящий poise-урон |
| Parry успех | 0 (вместо block absorb) |
| Parry провал (tap вне окна) | 6 |

Debt модифицирует реген STA и cost dodge — §3.4.

### 3.3 Focus
| Параметр | Значение |
|----------|----------|
| Max / старт | **100** / 100 |
| Skill1 или Skill2 (Tier-0) | **24** |
| Combine Tier-1 или Tier-2 | **40** (+ носитель расходуется на Tier-2) |
| Реген | **10 Focus/с** после **0,80 с** без каста/combine |
| Списание | в начале wind-up (резерв); при dodge-cancel в окне — возврат 100% |

### 3.4 Debt / Heat
**Debt** — число 0–50. **Heat** — UI/haptic-лента от Debt (не отдельный пул).

| Debt | Heat-лента | Эффект |
|------|------------|--------|
| 0 | Cold | нет |
| 1–29 | Warm | реген STA ×(1 − 0,01×Debt); реген Focus ×(1 − 0,012×Debt) |
| 30–39 | Hot | + эффекты Warm; каждое уклонение **+6 STA** к cost |
| 40–50 | Critical | + Hot; следующий каст/combine → **обязательный Backfire** (§8.4) |

**Каст при Focus < cost:**
1. Каст разрешён.
2. Недостача → Debt 1:1 (нужно 40, есть 15 → Focus=0, Debt+=25).
3. Если Debt упрётся в 50 и недостача ещё есть → каст **отмена в первые 100 мс**, Backfire **нет**, ресурсы не тратятся сверх капа.

**Снижение Debt:** **6 Debt/с**, только если Focus ≥ 60 **и** игрок не в wind-up. Иначе Debt не падает.

### 3.5 Poise (игрок)
| Параметр | Значение |
|----------|----------|
| Max | **80** |
| Stagger при Poise=0 | уязвимость **0,70 с**; Poise → 40 сразу после; далее реген **20/с** |
| Во время dodge i-frames | poise-урон = 0 |
| Cast stagger | если во время commitment каста входящий poise ≥ **25** → каст fail (§8.1) |

### 3.6 Демо явно не использует
Mana-пул, CD на одиночные скиллы, комбо-счётчик как ресурс, флаконы, очередь элементов.

---

## 4. DualSense — золотая карта (канон)

Контекст: бой на арене. Options = пауза.

| Ввод | Действие | Примечание |
|------|----------|------------|
| **Л стик** | Движение | 8-way + аналог. Sprint **нет**. База 4,2 м/с |
| **П стик** | Soft-aim | Точка скилла/явления в радиусе **3 м** от игрока. Deadzone **0,12**. Камера изометрия фиксирована |
| **R1** | **Attack A** | Лёгкая атака активного оружия |
| **R2** | **Attack B** | Тяжёлая / особая атака |
| **L1** | **Skill 1** | Тап <200 мс = каст; hold ≥200 мс = charge/готовность к combine |
| **L2** | **Skill 2** | Аналогично L1 |
| **L1+L2** ≥ **120 мс** | **Combine** → явление | Приоритет выше одиночного каста. Отпустил один раньше 120 мс → одиночный скилл той кнопки, что держалась дольше |
| **○** | **Dodge** | STA 28; i-frames 0,18 с с кадра 2; направление = Л стик, иначе от угрозы |
| **□** | **Block / Parry** | Hold ≥200 мс = Block (если `canBlock`). Tap в окне parry = Parry. Иначе deny |
| **△** | **Weapon swap** | Commitment 0,60 с; CD 4,00 с; движение ×0,4; нельзя Attack/Skill/Dodge |
| **×** | **Interact** | Тап. Факел зажечь/потушенный, дверь, триггеры арены |
| **R3** | Soft-lock | Ближайшая угроза ≤10 м; повтор / смерть цели = сброс |
| **Touchpad hold ≥200 мс** | Environmental Read | Подсветка носителей ≤8 м; **не пауза**; атаки отменяют режим. Телеграфы врага **не** скрываются |
| **Touchpad клик** | Быстрый статус | Focus/Debt/STA числа 1,2 с |
| **L3 / Create** | — | Не используются в демо |
| **Options** | Пауза | Полная |
| **D-pad ↑/↓** | Смена Skill1/Skill2 | **Только вне боя**. В бою ignore + deny haptic |
| **D-pad ←/→** | Пресет loadout | Только до старта арены |

### 4.1 Haptic (минимум)
| Событие | Haptic |
|---------|--------|
| Hit Attack A | короткий tick |
| Attack B / враг stagger | тяжёлый pulse |
| Heat Hot (Debt≥30) | низкочастотный гул, пока Debt≥30 |
| Backfire | двусторонний удар 200 мс |
| Телеграф «красный» | warning pulse (направленный, если API есть) |
| Deny (нет STA / конфликт) | короткий двойной tick |

### 4.2 Adaptive triggers
| Триггер | Сопротивление |
|---------|----------------|
| **R2** (Attack B) | лёгкое при STA < 22; сильнее при STA < 12 |
| **L2** (Skill 2) | лёгкое при Focus < 24; сильное при Debt ≥ 40 (Critical Heat) |

### 4.3 Что запрещено путать
- **Combine ≠ R1+R2.** R1+R2 одновременно = оба Attack (не комбо-явление; в демо просто приоритет Attack B если оба в одном кадре).
- **Skill ≠ Attack.** Силы только на L1/L2.
- **Dodge только ○.** Interact только ×. Block только □.

### 4.4 Feel-скрипт (одна «фраза» DualSense)
Цель: за 8 секунд игрок слышит пальцами вес боя.
1. R1 tick-hit → R2 тяжёлый pulse (Cleaver B).
2. ○ dodge через жёлтый телеграф (короткий whoosh haptic).
3. L1 Skill (лёгкое сопротивление L-триггера если низкий Focus).
4. L1+L2 Combine: оба триггера вжаты → на release ударный pulse явления.
5. Debt≥30: постоянный гул Heat, пока не сбросят Debt.

Если этот скрипт не читается без HUD — карта кнопок провалена.

---

## 5. Боевые глаголы — полная спецификация

Каждый глагол: кнопка, cost, тайминг, failure.

| Глагол | Кнопка | Cost | Startup / Active / Recover | Failure state |
|--------|--------|------|----------------------------|---------------|
| Move | Л стик | 0 | continuous | нет |
| Soft-aim | П стик | 0 | continuous, clamp 3 м | вне радиуса — clamp |
| Attack A | R1 | STA 12 | по шасси §6 | STA<12 → не старт; hit whiff = только STA/анимация |
| Attack B | R2 | STA 22 | по шасси §6 | STA<22 → не старт |
| Skill 1 | L1 | Focus 24 (+Debt) | 0,28 / per-skill / 0,22 | Focus+Debt cap → cancel 100 мс; cast stagger → fail, Focus spent, no Backfire |
| Skill 2 | L2 | Focus 24 (+Debt) | 0,28 / per-skill / 0,22 | то же |
| Combine | L1+L2 ≥120 мс | Focus 40 (+Debt) | 0,45 / release / 0,30 | нет пары сил (UI forbid); Debt cap cancel; Backfire если Debt≥40; нет носителя → Tier-1 |
| Dodge | ○ | STA 28 (+6 если Debt≥30) | startup 2 кадра (~0,033 с) / i-frames 0,18 / recover 0,22 | STA<cost → не старт; в commitment без cancel-окна → ignore |
| Block | □ hold ≥200 мс | absorb: 8+0,35×poise_in | enter 0,10 / hold / exit 0,15 | `canBlock=no` → deny; STA<absorb → блок ломается, полный урон + poise |
| Parry | □ tap **или** вход в Block в окне | 0 | окно: первые **0,12 с** active hitbox врага | вне окна: если был tap → STA 6 + обычный hit; если hold block вне окна → обычный Block. `canBlock=no` → любой □ = deny |
| Swap | △ | 0 (CD 4,0 с) | commitment **0,60 с** | CD активен → deny; во время commitment hit = полный урон/stagger |
| Interact | × | 0 | 0,15 с | нет цели ≤1,5 м → deny |
| Soft-lock | R3 | 0 | instant toggle | нет цели ≤10 м → deny |
| Env Read | Touchpad hold | 0 | enter 0,20 / hold | Attack/Skill отменяет |

**Списание STA/Focus:** в кадре **старта** действия (не в active). Whiff не возвращает cost (кроме dodge-cancel в окне каста — Focus возврат 100%).

**R1+R2 в одном кадре:** это **не** Combine. Приоритет = Attack B. Combine только **L1+L2**.

**Приоритет ввода (высший → низший):**
1. Уже идущий commitment (атака/каст/swap)
2. Dodge — если cancel-окно открыто
3. Combine (L1+L2)
4. Skill tap (L1 или L2)
5. Attack B (R2)
6. Attack A (R1)
7. Block/Parry (□)
8. Interact (×)
9. Swap request (△)

---

## 6. Оружие: Chassis + Material + RuneA + RuneB

### 6.0 Иерархия и сборка
```
Loadout оружия = Chassis ≫ (RuneA + RuneB) ≫ Material
```
- **Chassis** задаёт hitbox, тайминги, canBlock, роль.
- **Runes** меняют поведение A/B и пассивы (не дают «бесплатный каст Силы»).
- **Material** — множители HP/poise + опциональный тег Силы на крите/хите. Не меняет глаголы шасси.

Активно 1 оружие + 1 в запасе. Swap меняет весь пакет оружия. Skills и Armor Runes — нет.

### 6.1 Material (демо)

| Material | × HP-урон | × poise | Сила-тег |
|----------|-----------|---------|----------|
| Iron | 1,00 | 1,00 | — |
| Embersteel | 0,92 | 0,95 | Ash: DoT 2/с × 3 с при crit |
| Tideglass | 0,90 | 0,85 | Tide |
| Whisperwood | 0,88 | 0,80 | Whisper |
| Rootbone | 0,94 | 1,10 | Root |

### 6.2 Block / Parry (канон)
- `canBlock: yes` → Cleaver, Spear.
- `canBlock: no` → Twin Knives, Orb, Grimoire, Staff.
- **Block:** hold □ ≥200 мс. HP-урон melee −55%, ranged −25%; poise-урон ×0,6. STA absorb по §3.2.
- **Parry (идеальный блок):** □ tap **или** начало block-контакта в первые **0,12 с** active hitbox врага → poise-урон ×0,0; атакующий получает poise **12**.
- Во время Attack B charge копья блок невозможен.

### 6.3 Blade family

#### Cleaver
| | Attack A | Attack B |
|--|----------|----------|
| Описание | горизонтальный рубёж, дуга 90°, r=1,6 м | рубёж сверху, r=1,8 м |
| Урон HP / poise | 18 / 22 | 32 / 40; +10 HP если цель staggered |
| Startup / Active / Recover | **0,22 / 0,10 / 0,28** | **0,42 / 0,12 / 0,48** |
| Cancel | dodge с ≥50% recovery | нет dodge-cancel после startup |
| canBlock | yes | yes |
| Failure | whiff / STA | whiff / STA; прерывание poise≥25 во startup → recover early, урон 0 |

#### Spear
| | Attack A | Attack B |
|--|----------|----------|
| Описание | укол, луч 2,4×0,45 м | charge-выпад (hold R2 до 0,55 с), 2,8–3,2 м |
| Урон HP / poise | 15 / 16 | 28–36 / 30–38 (от заряда) |
| Startup / Active / Recover | **0,18 / 0,08 / 0,24** | charge 0–0,55; active **0,10**; recover **0,40** |
| Move | startup ×0,5 скорости | dodge-cancel только в первые 0,15 с charge |
| canBlock | yes (не во время charge B) | — |
| Failure | whiff / STA | отпускание <0,15 с charge → слабый poke 20/22; STA<22 → не старт |

#### Twin Knives
| | Attack A | Attack B |
|--|----------|----------|
| Описание | двойной удар | крест-разрыв + Bleed 6/с × 2 с |
| Урон HP / poise | 10+10 / 8+8 | 24 / 18 |
| Startup / Active / Recover | **0,12 / 0,08 / 0,16** | **0,30 / 0,10 / 0,34** |
| Серия | до 3×A без потери темпа; 4-й A recover **0,28** | — |
| canBlock | **no** | — |
| Награда | идеальный dodge → авто-микрошаг назад 0,2 м | — |
| Failure | STA; 4-й A в спаме = длинный recover (намеренно) | whiff / STA |

### 6.4 Magic family

**Штраф справедливости:** Attack A/B magic → HP ×**0,75**, poise ×**0,70** vs «эквивалент» клинка (числа ниже уже финальные).

#### Orb
| | Attack A | Attack B |
|--|----------|----------|
| Описание | bolt 14 м/с (не Сила Spark) | орб зависает 0,80 с → взрыв r=1,4 м; повторный R2 = детонация |
| Урон HP / poise | 12 / 8 | 22 / 14 |
| Startup / Active / Recover | **0,16 / projectile / 0,20** | **0,20 / 0,80 hang+burst / 0,28** |
| Weave | после любого Tier-0 скилла: след. A ≤0,50 с получает **+4** урона | автодетонация если не взорвать |
| Failure | промах снаряда; STA | STA; взрыв по пустоте = только STA |

#### Grimoire
| | Attack A | Attack B |
|--|----------|----------|
| Описание | руна-метка в soft-aim ≤5 м; через 0,35 с импульс r=1,0 м | страница-щит 0,90 с: 1 снаряд absorb **или** −35% ближайший melee |
| Урон HP / poise | 14 / 10 | 0 (защита) |
| Startup / Active / Recover | **0,20 / mark 0,35 then pulse / 0,24** | **0,12 / 0,90 / 0,20** |
| Лимит | макс **2** активных метки | не стакается |
| Бонус | во время метки Combine → метка +10% радиус на 2 с (тег Силы визуал) | — |
| Failure | 3-я метка заменяет старейшую; STA | STA; щит истекает впустую |

#### Staff
| | Attack A | Attack B |
|--|----------|----------|
| Описание | удар древком r=1,7 м | волна 4×1,2 м, knockback лёгких 1,5 м |
| Урон HP / poise | 14 / **18** (исключение: выше прочих magic) | 20 / 16 |
| Startup / Active / Recover | **0,24 / 0,10 / 0,30** | **0,48 / 0,12 / 0,52** |
| Бонус | — | стоять 0,40 с до B → **pierce** (не гасится трупом) |
| Failure | STA / whiff | движение во время «стоять 0,40» сбрасывает pierce; STA |

### 6.5 Пресеты приёмки (обязательны)

| ID | Оружие A | Оружие B | Skill1 | Skill2 | Armor |
|----|----------|----------|--------|--------|-------|
| **M1 Melee** | Cleaver Iron | Spear Iron | Root | Ash | Brace, Thornmail |
| **M2 Magic** | Orb Tideglass | Grimoire Whisperwood | Spark | Tide | Focusweave, Glassmind |
| **M3 Hybrid** | Spear Embersteel | Orb Whisperwood | Spark | Root | Brace, Focusweave |

Кастом в пределах каталога демо разрешён; приёмка маршрутов §11.7 — только на M1/M2/M3.

---

## 7. Силы, скиллы, явления (Magicka-суть)

### 7.0 Пять Сил

| Сила | Суть | Цвет телеграфа игрока |
|------|------|------------------------|
| Spark | разряд, пик, поджог носителя | янтарный |
| Tide | давление, сдвиг, лужа | сине-зелёный |
| Whisper | смещение, частичный игнор брони | бледно-лиловый *(только VFX силы)* |
| Ash | тление, DoT, тушение | угольно-оранжевый |
| Root | якорь, замедление, poise | хвойно-зелёный |

**Запрет:** две одинаковые силы в Skill1+Skill2 на экране экипировки.  
**Запрет:** element queue / buffer / «сначала Spark потом Tide в очереди». Только пара слотов → феномен.

### 7.1 Tier-0 — одиночный скилл (без носителя)

Общее: cost **24 Focus**; startup **0,28**; recovery **0,22**; dodge-cancel только **0,00–0,10 с**; после — commitment.

| Сила | Active / форма | Числа | Failure |
|------|----------------|-------|---------|
| Spark | луч 5 м по soft-aim | урон **26**, poise **12**; 100% поджиг Torch/Oil | whiff; cast stagger |
| Tide | конус 160° r=2,2 м | урон **18**, poise **20**, knockback 1,2 м; создаёт **Water** 2,5 с | cast stagger |
| Whisper | i-frames 0,15 + удар в точке выхода | урон **20**, poise **8**, игнор 30% брони; **Shadow** 3,0 с | cast stagger |
| Ash | конус 90° r=2,0 м | урон **12** + DoT **8/с × 3 с**, poise **10**; тушит Torch; усиливает Corpse как Ash-носитель | cast stagger |
| Root | зона soft-aim r=1,3 м | урон **10**, poise **24**, Rooted 1,2 с; **RootAnchor** 4 с | aim в пустоту = зона всё равно ставится |

### 7.2 Tier-1 — Skill1+Skill2 без носителя

Combine: cost **40 Focus**; startup **0,45**; recovery **0,30**; dodge-cancel **0,00–0,12 с**.  
Пара **неупорядоченная**. 10 феноменов:

| Пара | Явление | Эффект |
|------|---------|--------|
| Spark+Tide | **Грозовая плёнка** | зона 2,4 м × 2,5 с: **10/с**; каждые 0,8 с poise 8 |
| Spark+Whisper | **Режущая вспышка** | линия 6 м: урон **34**, poise **14**; лёгкий agro-drop 0,2 с |
| Spark+Ash | **Вспышка тлена** | взрыв 2,0 м: урон **28** + Ash DoT 4/с × 4 с |
| Spark+Root | **Искровой капкан** | aim: капкан 3 с → урон **30**, Rooted 0,8 с |
| Tide+Whisper | **Тихий поток** | смещение игрока 3,5 м по aim + урон **16** на пути; лужа |
| Tide+Ash | **Кипящая муть** | зона 2,2 м: −35% speed, **8/с × 3 с** |
| Tide+Root | **Трясина** | зона 2,6 м × 3 с: speed ×0,5, poise regen врага ×0,5 |
| Whisper+Ash | **Пепельный мираж** | клон 2 с; первый удар врага по клону = miss; игрок ≤2 м → 0,2 с i-frames |
| Whisper+Root | **Хватка из тени** | тянет 1 врага ≤5 м на 2 м к игроку; урон **18**, poise **22** |
| Ash+Root | **Мёртвая поросль** | зона 2,0 м: урон **14**; Frail (+15% входящего) 4 с |

**Failure Combine:** Debt cap → cancel 100 мс; Backfire при Debt≥40; одинаковые силы — невозможно (UI).

### 7.3 Tier-2 — с носителем

Условие: в кадре release soft-aim **≤1,5 м** от нужного носителя **или** носитель пересекает зону явления. Носитель **потребляется** (кроме geometry-shadow — см. ниже).  
Нет валидного носителя → **Tier-1 той же пары**, без Backfire.

| Пара | Носитель | Tier-2 | Эффект |
|------|----------|--------|--------|
| Spark+Tide | Water | **Грозовой столб** | r=1,6 м × 2 с: **18/с**, poise 18 / 0,6 с; лужа исчезает |
| Spark+Ash | Torch / Oil | **Огненный шквал** | конус 6 м: урон **40**, poise **20**; пол горит 3 с (12/с); факел тухнет / oil сгорает |
| Spark+Root | RootAnchor | **Проводная казнь** | **48** одной цели на якоре ≤4 м; якорь сгорает |
| Tide+Whisper | Shadow (skill) | **Утопление тени** | урон **36**, Silence 2,5 с; тень скилла расходуется |
| Tide+Root | Water + RootAnchor ≤3 м apart | **Болото-клетка** | кольцо 3 м × 4 с: не выйти, speed ×0,4; оба носителя |
| Whisper+Ash | Corpse | **Пепельный двойник** | мираж-союзник 4 с, удар 12 / 1,2 с; труп расходуется |
| Ash+Root | Corpse | **Костяной терн** | взрыв r=2,5 м: урон **32**, Rooted 1,0 с |
| Spark+Whisper | Shadow (skill) | **Невидимый разряд** | урон **38** + agro-drop 1,5 с |
| Tide+Ash | Water | **Пар-завеса** | зона 3 м: потеря lock 2 с, **10/с** |
| Whisper+Root | Shadow (skill) **или** RootAnchor | **Скрытый силок** | капкан 5 с: урон **34**, притяг 1 м |

**Тени — канон без двусмысленности:**
- **Geometry Shadow** (под колоннами, у северной стены): дают **бонус позиционирования** (+15% Whisper Edge уже покрыт руной; для Tier-2 **недостаточно сами по себе**). Не расходуются.
- **Skill Shadow** (от Whisper Tier-0 / части явлений): **расходуемый** носитель для Tier-2.

### 7.4 Иерархия Spark (пример «руна ≠ скилл»)

| Слой | Делает | Не делает |
|------|--------|-----------|
| Skill Spark | луч, Focus, телеграф каста | не бафает автоатаки постоянно |
| Weapon Rune Spark Tip | 25% шанс +6 Spark на хит A/B | не кастует луч по L1 |
| Armor Rune (нет Spark Skin в демо-каталоге) | — | — |
| Environment Torch/Oil | каталит Tier-2 Spark-пар | не бьёт без действия игрока |

Приоритет визуального шума: **телеграф врага > силуэт игрока > VFX скилла > L2/Touchpad носители > idle рун**.

---

## 8. Тайминги каста, телеграфы, Backfire

### 8.1 Одиночный скилл
1. Input → wind-up **0,28 с** (цвет Силы).
2. T+0,00–0,10: dodge-cancel; Focus/Debt возврат 100%.
3. После 0,10: commitment; входящий poise ≥25 → **cast stagger**: fail, Focus spent, Debt не снимается, **Backfire нет**.
4. Release эффекта.
5. Recovery **0,22 с**.

### 8.2 Combine (L1+L2)
1. Удержание ≥120 мс → wind-up **0,45 с**.
2. T+0,00–0,12: dodge-cancel; ресурс возврат.
3. T+0,12–0,45: commitment; на кадре release — проверка носителя.
4. Release: Tier-2 или Tier-1.
5. Recovery **0,30 с**.
6. Cast stagger во время combine commitment → fail + **Backfire** (§8.4 B).

### 8.3 Телеграфы врага
| Цвет | Значение |
|------|----------|
| Жёлтый контур | атака ≤0,45 с до active |
| Красный + haptic | active hitbox или unblockable |

L2/Touchpad Env Read **не** скрывает телеграфы.

### 8.4 Backfire — только так
Срабатывает если:
- **(A)** каст/combine начат при Debt ≥ 40, **или**
- **(B)** cast stagger прервал **combine** после commitment (не одиночный скилл).

Эффект: **12 HP** (игнор thorns); Poise −30; self-stagger **0,35 с**; каст отменён; Focus уже потрачен; haptic §4.1.

Нет RNG-Backfire при Debt < 40 и чистом касте.

---

## 9. Weapon Runes

### 9.1 Слоты
2 слота на оружие. Пустые ок. Только вне боя.

### 9.2 Конфликты
1. Один и тот же Rune ID ×2 — нет.
2. Две руны одной Force с тегом `ForceExclusive` — нет.
3. Две `Stance` — нет.
4. UI блокирует; в бой такой стейт не попадает.

### 9.3 Каталог

| ID | Имя | Эффект | Штраф | Тег |
|----|-----|--------|-------|-----|
| WR-SPK | Spark Tip | 25% хит: +6 Spark; поджиг Oil/Torch | −5% урона Attack A | ForceExclusive Spark |
| WR-TID | Tide Bit | +0,4 м knockback на Attack B | +4 STA на Attack B | ForceExclusive Tide |
| WR-WSP | Whisper Edge | +15% урона по врагам, не смотрящим на игрока | −10% poise-урона | ForceExclusive Whisper |
| WR-ASH | Ash Groove | DoT 3/с × 2 с на Attack B хит | −8% прямого HP | ForceExclusive Ash |
| WR-ROT | Root Weight | +12 poise на Attack A | −8% move speed в recovery атак | ForceExclusive Root |
| WR-STN | Steady Haft | −0,04 с startup Attack A | −6% урона Attack B | Stance |
| WR-HVR | Weaver Coil | Orb weave +0,15 с; иначе после скилла +3 к след. A | +3 Focus cost Tier-0 | Stance |

Валидно: Spark Tip + Steady Haft; Root Weight + Weaver Coil; Spark Tip + Ash Groove (разные Force).  
Невалидно: Spark Tip ×2; Steady Haft + Weaver Coil.

---

## 10. Armor Runes

### 10.1 Жёсткие правила
- Ровно **2** слота.
- У каждой руны **обязательный штраф**.
- Нельзя две с одним `ArmorFamily` (`Guard`, `Focus`, `Thorns`, `Glass`).
- Нельзя дублировать один числовой бонус двумя рунами.
- На loadout UI **запрещён** суммарный DPS одной цифрой.

### 10.2 Каталог

| ID | Имя | Family | Бонус | Штраф | Условие |
|----|-----|--------|-------|-------|---------|
| AR-BRC | Brace | Guard | −20% входящего poise | −10% move speed | всегда |
| AR-THN | Thornmail | Thorns | 10 reflect melee / 1,5 с | +10% входящего ranged HP | всегда |
| AR-FCW | Focusweave | Focus | Focus regen +3/с | Max STA −15 | всегда |
| AR-GLM | Glassmind | Glass | +12% урон скиллов | +20% входящего, пока Debt≥20 | штраф условный |
| AR-BLD | Bloodroot | Guard | при HP≤40: +8% урона A/B | нельзя Block/Parry | бонус while HP≤40 |
| AR-DBT | Debtwalker | Focus | Debt≥20: dodge −8 STA | Debt≥20: −15% урона A | while Debt≥20 |

Валидно: Brace+Thornmail; Focusweave+Glassmind; Brace+Focusweave.  
Невалидно: Brace+Bloodroot (оба Guard).

---

## 11. Демо-арена

### 11.1 Комната
- Пол **18×14 м**, изометрия, один зал.
- Старт игрока: (9, 2). Вход юг.
- Колонны: (4,7), (14,7) — LOS-блок.
- Ритуальный круг: центр (9,8), r=2 м — фаза 2 босса.
- Победа: дверь (9,13) при смерти босса.

### 11.2 Носители (старт)

| Носитель | Позиции | Кол-во | Возобновление |
|----------|---------|--------|---------------|
| Torch | (3,5), (15,5), (9,11) | 3 | не респавн; × зажечь если потушил Ash |
| Water | (6,9), (12,9) | 2 | + создание Tide |
| Oil | (9,4) | 1 | нет |
| Geometry Shadow | под колоннами; (9,12) | 3 зоны | постоянные; **не** Tier-2 носитель |
| Skill Shadow | от Whisper | 0→n | расходуемые |
| Corpse | смерть аддов | 0→2 | адды не респавнятся |

### 11.3 Адд A — Ash Grunt
- HP **70**, Poise **50**, speed 3,2 м/с.
- **Рубка:** startup 0,40 (жёлтый) / active 0,12 / recover 0,35; урон 18, poise 20, r=1,5.
- **Плевок:** startup 0,55 / projectile / recover 0,40; урон 14 + Ash DoT 4/с × 2 с.
- Смерть → Corpse.
- Failure для игрока: стоять в active рубки без dodge/block.

### 11.4 Адд B — Tide Wretch
- HP **55**, Poise **40**; дистанция AI 5–7 м.
- **Болт:** startup 0,35 / projectile / recover 0,30; урон 12; Grimoire B absorb.
- **Смачивание:** телеграф 0,70 → Water под игроком 3 с.
- Слабость: Spark+Tide Tier-2 по луже.

### 11.5 Босс — Gate Saint
- HP **280**, Poise **120** (после stagger → 60; окно stagger 1,2 с).

| Фаза | HP | Атаки |
|------|-----|-------|
| 1 | >60% | **Cleave:** 0,55 / 0,14 / 0,50; дуга 120°; урон 26; poise 28; **unblockable**. **Bolt:** 0,40 / proj / 0,35; урон 16 |
| 2 | 60–30% | уходит в круг; VFX-искры (без новых аддов); **Root snare:** телеграф круг 1,4 м под игроком 0,70 → Rooted 1,0 + 10 урона |
| 3 | ≤30% | cleave startup −0,10; каждые **8 с** Ash wave (dodge; урон 22); **первый** Ash wave тушит все Torch |

**Справедливость:** босс убиваем Attack A/B + dodge без скиллов и без Tier-2. Носители ускоряют, не валидируют.

### 11.6 Скрипт
1. Старт: 2 адда; босс за решёткой север (силуэт виден, неуязвим).
2. Оба адда мертвы **или** 45 с → решётка вверх; босс walk 2 с (неуязвим) → бой.
3. Если сработал таймер 45 с и адд жив — бой босс+адд.
4. Дверь победы только при смерти босса. Адды не респавнятся.

### 11.7 Три маршрута (acceptance)

#### Route M1 — Pure Melee
1. Grunt: читать жёлтый → Cleaver R2 в окно → stagger → R1 R1. Плевки только ○. Рубка: □ Parry/Block.
2. △ swap на Spear (commitment 0,60). Wretch из-за колонны: R1 poke; L1 Root на телеграф болта → R2.
3. Босс: Spear/Cleaver R1/R2 + ○. Cleave unblockable → только ○. Ash (L2) — DoT в окне stagger босса (не обязателен).
4. Tier-2 не использовать (или использовать — не влияет на валидность).
5. **Критерий:** босс мёртв; Debt ≤ 20; Tier-2 не требуется; Env Read не требуется.

#### Route M2 — Pure Magic
1. Старт Orb: выйти к Water (6,9) или (12,9). L2 Tide при необходимости долить лужу.
2. Soft-aim в лужу ≤1,5 м → L1+L2 Combine → **Грозовой столб** (Tier-2) в Grunt. Добивание Orb weave (A после скилла).
3. Wretch: Grimoire △ swap **или** сразу запасной если уже свапнуты; метки A + щит B на болт. Повтор Spark+Tide по новой луже от смачивания/Tide.
4. Босс: дистанция >3 м; Orb A/B; Combine на лужах; Focus не ронять в Critical без плана. Glassmind: держать Debt <20 или принимать +20% входящего.
5. **Критерий:** ≥50% урона по боссу от скиллов/явлений; Attack A/B ≤25% урона по боссу; ≥2 Tier-2 за бой.

#### Route M3 — Hybrid
Пресет фиксирован: Skill1=Spark, Skill2=Root → единственный Tier-2 пары = **Проводная казнь** (носитель RootAnchor). Corpse/Oil Tier-2 **не** требуются на M3.

1. Spear kite vs Grunt; R1 poke, dodge плевка.
2. L2 Root в ноги Grunt → RootAnchor; L1+L2 Combine у якоря → **Проводная казнь** (Tier-2). Добивание Spear.
3. Wretch: колонна + Spear; при необходимости снова Root → капкан Tier-1 или якорь Tier-2.
4. Босс фаза 1: Spear A/B + Spark (L1) в окна. Фаза 2: **ровно один** △ swap на Orb → безопасный урон по кругу + Root snare dodge.
5. Фаза 3: Orb/Spear (уже свапнуты) + dodge Ash wave; Focus не уводить в Critical без нужды.
6. **Критерий:** ровно **1** weapon swap; ≥1 Tier-2 (Проводная казнь); доля урона по боссу — ни скиллы, ни оружие >70%.

---

## 12. Скоуп: v0 арена vs позже

### v0 SHIPS (этот документ)
- DualSense map §4 целиком (кроме опционального directional haptic fallback).
- Ресурсы §3.
- 6 шасси, 5 Material, 7 Weapon Runes, 6 Armor Runes.
- 5 Tier-0, 10 Tier-1, Tier-2 для носителей на арене.
- 2 адда + Gate Saint.
- Пресеты M1/M2/M3 + простой loadout.
- Backfire, Debt/Heat, Env Read на Touchpad.

### v0 DOES NOT SHIP
- Лечение, флаконы, уровень персонажа.
- Роглайк-мета, магазин, эндлесс.
- >2 активных скилла, element queue.
- Полный крафт / редкости / random affixes.
- Кооп, скакуны, стелс-миссия вне арены.
- Armor Rune «Spark Skin» и прочий расширенный каталог.
- Sprint, верховая, паркур.

### Сразу после v0 (не блокирует демо)
- Больше носителей/сил в каталоге.
- Второй босс / вторая комната.
- Расширение рун при сохранении конфликтов.
- Настраиваемые бинды (канон демо остаётся DualSense-default).

---

## 13. Acceptance (демо проходит, если)

### 13.1 Playtest (3 человека × 3 маршрута)
1. В слепую: телеграф босса назван раньше носителя в ≥80% опасных окон.
2. Медианное время клира M1 vs M2 отличается ≤**20%**.
3. Combine за клир ∈ [3, 10]; новичок ловит Backfire ≥1 раз; на 3-м заходе избегает.
4. M1 без Tier-2 валиден; M2 без носителей ≥+30% времени боя.
5. Ни один 2-рунный сет брони = автовин; Glassmind наказывает Debt.
6. Hit в swap-commitment = урон/stagger.
7. После 1 баннера туториала: R1/R2/L1/L2/L1+L2/○/□/△ читаются без HUD-подсказок.

### 13.2 Техника
- [ ] §3 ресурсы ±0 от чисел
- [ ] §4 карта: Combine = L1+L2; Attack = R1/R2
- [ ] 6 шасси с полными таймингами
- [ ] 5+10 явлений + Tier-2 носителей арены
- [ ] Конфликты рун до старта
- [ ] Backfire только §8.4
- [ ] M1/M2/M3 клир без читов
- [ ] Env Read не перекрывает красные телеграфы
- [ ] Swap 0,60 / CD 4,00; только оружие

---

## Приложение A — словарь

| Термин | Значение |
|--------|----------|
| Commitment | нельзя отменить атакой/кастом; dodge только в явном окне |
| Heat | UI/haptic-лента Debt, не отдельный ресурс |
| Carrier / носитель | объект среды для Tier-2 |
| ForceExclusive | ≤1 руна данной Силы на оружии |
| Soft-aim | точка ≤3 м, П стик |
| Tier-0/1/2 | одиночный / combine без носителя / combine с носителем |
| Weave window | усиление Attack A после скилла (Orb / Weaver Coil) |
| Geometry Shadow | постоянная тень уровня; не расходник Tier-2 |
| Skill Shadow | тень от скилла; расходник Tier-2 |

## Приложение B — анти-противоречия (закрыто)

| Было (ошибочно / устарело) | Стало (канон v2) |
|----------------------------|------------------|
| Combine = R1+R2 | **Combine = L1+L2** |
| Attack A/B на □/△ | **Attack A/B = R1/R2** |
| Skills на R1/R2 | **Skills = L1/L2** |
| Dodge на × | **Dodge = ○** |
| Block на ○ / conflict с L1 | **Block/Parry = □** |
| Interact на ○ | **Interact = ×** |
| Swap = L1+△ | **Swap = △** |
| Env Read на L2 | **Env Read = Touchpad hold** |
| Тень то расходуется, то нет | Geometry ≠ Skill Shadow |
| Debt без Heat | Debt число + Heat лента |

**Конец канона v2.**
