# Combat Mechanics — Demo Arena (Canon)

**Статус:** единственный канон для сборки демо-арены.  
**Версия:** 1.0 (синтез 4 research streams).  
**Жанр:** изометрический hardcore (Death’s Door readability + soulslike weight + immersive-sim routes).  
**Ограничения:** без XP-левелинга; без роглайк-обёртки; DualSense-first; бой самодостаточен.  
**Loadout:** Attack A, Attack B, Skill 1, Skill 2.

Если правило отсутствует здесь — оно **вне скоупа** демо. Числа важнее прилагательных.

---

## Реестр разрешённых противоречий

| Конфликт | Источник A | Источник B | Канон |
|----------|------------|------------|-------|
| Combine | GDD draft: R1+R2 | DualSense: L1+L2 | **L1+L2** |
| Attack / Skill | GDD: □/△ атаки, R1/R2 скиллы | DualSense golden | **R1/R2 = Attack A/B; L1/L2 = Skill 1/2** |
| Dodge / Block / Interact | GDD: × dodge, ○ interact/block | DualSense | **○ Dodge; □ Block/Parry; × Interact** |
| Weapon swap | GDD: L1+△ | DualSense: △ | **△** (commitment + CD) |
| R stick | GDD: soft-aim offset 3 м | DualSense: Aim/Facing | **Aim/Facing** + лёгкий assist |
| Env Read на L2 | GDD: hold L2 | DualSense: L2 = Skill 2 | **Touchpad hold** = Environmental Read |
| Имена явлений | GDD русские рабочие | Magicka matrix | **Ионный Прилив, Немой Разряд, …** (см. §E) |
| Материалы | GDD: 5 | Weapon budget: 4 | **4 materials** |
| Weapon runes | GDD: 7 | Weapon budget: 12 | **12 weapon runes** |
| Armor major | GDD: 2 равных | Weapon: max 1 major | **2 слота, max 1 Major** |
| Силы | Weapon research: 4 | Fantasy + Magicka: 5 | **5 сил** |
| Heat vs Debt | Magicka Heat | GDD Debt | **Debt = Heat** (одна шкала 0–50) |
| Healing | DualSense: 1 flask | GDD: нет | **1 Flask** на заход |
| Враги | GDD: Grunt/Wretch/Saint | DualSense roles | **Ash Raider / Cinder Archer / Warden / Doorwarden** |
| Magic A/B penalty | GDD −25% HP / −30% poise | — | **сохранено** |
| Combine timing | Magicka 0.35–0.60 с | GDD 0.45 с | **0.50 с** wind-up |
| Hierarchy | — | Weapon research | **Chassis ≫ Rune ≫ Material** |

---

## A. Pillars

1. **Читаемость врага первична.** Тёплый floor-telegraph врага всегда поверх VFX игрока. Среда — второй слой (Touchpad Environmental Read).
2. **Вес и commitment.** Startup → Active → Recover. Спам проигрывает таймингу. Cancel в dodge только в первых 30% startup (исключение: Dagger — 50%).
3. **Мастерство без уровней.** Сила = знание телеграфов, носителей, пар сил, управление Stamina/Focus/Debt — не статы персонажа.
4. **Три равноправных победы.** Pure melee / pure magic / hybrid закрывают арену без обязательного билда.
5. **Две активные силы → одно явление.** Skill 1 + Skill 2 preset до боя; Combine = phenomenon. Нет mid-fight очереди из 5 элементов.
6. **Среда — маршрутизатор силы.** Катализаторы (Wet, AshBed, WhisperFog, RootedGround, Conductive) меняют *модус* явления, не только +%.
7. **Chassis ≫ Rune ≫ Material.** Шасси = кто ты; руна = как бьёт A/B; материал = affinity + mild cost. Руна ≠ скилл.
8. **Anti-ARPG.** Нет affix soup, support gems, skills-as-items, mid-fight rune swap.

---

## B. Resources (exact numbers)

### B1. HP
| Параметр | Значение |
|----------|----------|
| Max HP | **100** |
| Смерть | HP ≤ 0 → рестарт арены с тем же loadout |
| Flask | **1** использование / заход; восстановление **40 HP**; анимация 1,00 с (можно dodge-cancel в первые 0,20 с → flask **не** тратится) |
| Crit | ×**1,50** HP-урон; отдельный SFX + haptic tick |

### B2. Stamina (STA)
| Параметр | Значение |
|----------|----------|
| Max | **100** |
| Attack A | **12** |
| Attack B | **22** |
| Dodge | **28** |
| Block absorb (за удар) | **8 + 0,35 × входящий poise-урон** |
| Parry success | **0** STA (riposte A бесплатен по STA) |
| Реген | **28 STA/с** после **0,35 с** без траты STA |
| Guard break | STA = 0 во время блока → self-stagger **0,60 с**, блок снят |
| Недостаток STA | действие **не стартует** |

Бюджет ощущений: 3 dodge подряд ≈ пусто; Sword A-серия ≈ 36–48 STA.

### B3. Focus
| Параметр | Значение |
|----------|----------|
| Max / старт боя | **100** |
| Skill 1 или Skill 2 (Primary) | **24** |
| Combine (явление) | **40** |
| Реген | **10 Focus/с** после **0,80 с** без каста/combine |
| Списание | в начале wind-up |

### B4. Debt (Heat)
Единая шкала долга/перегрева магии. Диапазон **0–50**.

| Правило | Число |
|---------|-------|
| Каст при Focus < cost | разрешён; недостача → Debt 1:1; Focus → 0 |
| Debt cap | **50**; если недостача не влезает → каст **отменяется** в первые 100 мс, Backfire **нет** |
| STA regen while Debt > 0 | ×**(1 − 0,01 × Debt)** (Debt 50 → ×0,50) |
| Focus regen while Debt > 0 | ×**(1 − 0,012 × Debt)** (Debt 50 → ×0,40) |
| Debt ≥ 30 | каждое dodge **+6 STA** cost |
| Debt ≥ 40 | следующий Primary/Combine = **обязательный Backfire roll** (§H) |
| Debt decay | **6 Debt/с** только при Focus ≥ 60 и вне wind-up каста |
| Combine всегда | +**4 Debt** на успешный release (даже при полном Focus) |

### B5. Poise (скрытый / тонкий щит)
| Параметр | Игрок |
|----------|-------|
| Max Poise | **80** |
| Break | Poise = 0 → stagger **0,70 с**; Poise сразу → **40**; далее реген **20/с** вне хита |
| Dodge i-frames | входящий poise-урон = **0** |
| Block | входящий poise ×**0,60**; perfect block (первые 0,12 с контакта) → poise ×**0,0**, атакующий получает poise **12** |

Вражеские Poise — §K.

### B6. Явно не используется
- Отдельная Mana
- Кулдауны на одиночные Primary (кроме анимаций)
- Комбо-счётчик как ресурс
- Sprint
- XP / уровни персонажа

---

## C. DualSense map (every button)

**Золотой layout (канон):**

```
L stick  — Move
R stick  — Aim / Facing
R1       — Attack A
R2       — Attack B (+ adaptive)
L1       — Skill 1 (Primary 1)
L2       — Skill 2 (Primary 2) (+ adaptive charge)
L1+L2    — Combine / Fusion (≥ 120 мс simultaneous)
○        — Dodge
□        — Block / Parry (tap = parry, hold ≥ 200 мс = block)
△        — Weapon / Loadout Swap
×        — Interact
R3       — Soft-lock toggle
Touchpad hold — Environmental Read
Touchpad click — Status flash (Focus/Debt/STA 1,2 с)
Options  — Pause
```

### C1. Детали вводов

| Ввод | Поведение |
|------|-----------|
| **L stick** | Analog move; sprint нет; 8-way ок |
| **R stick** | Независимый facing. Soft assist: притяжение к ближайшему врагу в конусе ±35° / 8 м; отключается при отклонении стика > 0,70. Deadzone 0,12 |
| **R1 Attack A** | Tap = лёгкая атака. Hold ≥ 280 мс = charged A **только** если шасси `hasChargeA` (Spear, Staff, Bow-out-of-demo) |
| **R2 Attack B** | Тяжёлая / special. Adaptive: сопротивление по типу шасси (§C3) |
| **L1 Skill 1** | Tap < 200 мс = Primary 1. Hold ≥ 200 мс = charge ready для Combine |
| **L2 Skill 2** | Аналогично L1 |
| **L1+L2 ≥ 120 мс** | Combine. Приоритет выше одиночного Primary. Если отпустить один раньше 120 мс — одиночный скилл той кнопки, что держалась дольше |
| **○ Dodge** | I-frames **0,18 с** с кадра 2; стоимость 28 STA; направление = L stick, иначе away from soft-lock / facing back |
| **□ tap (< 200 мс)** | Parry window **0,18 с** (если `canBlock`). Успех vs melee active → враг recover +0,45 с, ваш riposte R1 бесплатен по STA в 0,40 с |
| **□ hold (≥ 200 мс)** | Block. HP melee −55%, ranged −25%; poise ×0,60. Magic chassis / Dagger: `canBlock: no` → hold = deny haptic |
| **△ Swap** | На запасное оружие. Commitment **0,60 с**, CD **4,00 с**. Во время commitment: нельзя Attack/Skill/Dodge; move ×0,40. Меняет только Chassis+Material+Weapon Runes. Skills и Armor **не** меняются |
| **× Interact** | Рычаг, flask pickup, зажечь Torch, bench вне боя |
| **R3** | Toggle soft-lock; цикл целей в 10 м. Повтор / смерть цели = сброс. Камера **не** hard-lock |
| **Touchpad hold** | Environmental Read: подсвет носителей/катализаторов ≤ 8 м; **не** скрывает вражеские телеграфы; атаки отменяют режим |
| **D-pad** | Только **вне боя** / на bench: ↑ Skill 1, ↓ Skill 2, ←/→ пресет. В бою = deny |
| **L3** | Не используется |
| **Create** | Не используется |

### C2. Haptics (минимум)
| Событие | Feedback |
|---------|----------|
| Attack A hit | короткий tick |
| Attack B / enemy poise break | тяжёлый pulse |
| Parry success | sharp tick L+R |
| Debt ≥ 30 | низкочастотный гул пока Debt ≥ 30 |
| Backfire | двусторонний удар 200 мс |
| Enemy red telegraph | directional rumble (fallback: общий warning) |
| Dodge i-frames | тишина |

### C3. Adaptive triggers
| Триггер | Поведение |
|---------|-----------|
| **R2** | Bow/Staff charge: progressive resistance. Hammer/heavy B: click на release. Focus < 24: лёгкое сопротивление. Debt ≥ 40: сильное |
| **L2** | Charge Skill 2 / Combine ready: нарастающее сопротивление |

Все критические cues дублируются визуально/звуком.

---

## D. Chassis list for demo + Attack A/B

### D0. Общие правила
- Оружие = **Chassis + Material + Rune A + Rune B**.
- Иерархия: **Chassis ≫ Rune ≫ Material**.
- Активно 1 оружие + 1 запасное (swap △).
- Демо-бюджет шасси: **6**.

**Material (ровно 4):**

| Material | HP dmg | Poise dmg | Affinity | Mild cost |
|----------|--------|-----------|----------|-----------|
| **Iron** | ×1,00 | ×1,00 | — | — |
| **Embersteel** | ×0,92 | ×0,95 | Ash | Crit → Ash DoT 2/с × 3 с |
| **Tideglass** | ×0,90 | ×0,85 | Tide | +4% STA cost на A/B |
| **Rootbone** | ×0,94 | ×1,10 | Root | −6% move speed в recovery атак |

Material **не** меняет число ударов комбо и не даёт новых кнопок.

**Magic fairness:** Attack A/B магических шасси: HP-урон ×**0,75**, poise ×**0,70** vs martial того же тира (уже заложено в числах ниже).

### D1. Frame-feel (философия при 60 fps «кадрах ощущения»)

| Семья | Startup A/B | Active | Recover | Poise vs врага | Заметка |
|-------|-------------|--------|---------|----------------|---------|
| Sword | 6–10 / 14–20 | короткий | A короткий; B +12–18 | средний | учитель арены |
| Spear | 8–12 / 16–22 | узкий A | whiff наказуем | хорош vs dash-in | facing критичен |
| Dagger | 3–6 / 10–14 | крошечный | малый, высокий STA drain | низкий | награда за фланг |
| Hammer* | 14–22 / 22–32 | длинный | тяжёлый | высокий break | *вне демо-списка; спек для пост-демо |
| Bow* | 4–8 / charge 20–45 | projectile | A лёгкий | низкий | *вне демо; adaptive draw |
| Staff | 8–12 / 18–28 | линия/луч | interruptible | средний | linear commitment |
| Book | 10–14 / channel 25–50 | zone linger | высокий на B | низкий | sigil ritual |
| Orb | 6–10 / 12–20+delay | delayed | средний | средний | residues / orbitals |

Правила commitment: (1) dodge-cancel первые 30% startup (Dagger 50%); (2) после active recover uncancellable кроме parry-success; (3) B всегда дороже A.

### D2. Martial chassis (3)

#### 1) Sword (`canBlock: yes`, `hasChargeA: no`)
- **A:** горизонтальный slash, дуга 90°, радиус 1,6 м; урон **18**, poise **22**; startup 0,22 с, active 0,10 с, recovery 0,28 с. Серия до 3 A.
- **B:** overhead, радиус 1,8 м; урон **32**, poise **40**; startup 0,42 с, active 0,12 с, recovery 0,48 с. Vs staggered: +10 HP.

#### 2) Spear (`canBlock: yes`, `hasChargeA: yes`)
- **A:** poke луч 2,4 × 0,45 м; урон **15**, poise **16**; startup 0,18 с, recovery 0,24 с; move ×0,5 в startup.
- **B:** charged thrust (hold R2 до 0,55 с); дистанция 2,8–3,2 м; урон **28–36**, poise **30–38**; recovery 0,40 с. Dodge-cancel только первые 0,15 с charge. Block во время charge B запрещён.

#### 3) Dagger / Twin Knives (`canBlock: no`, `hasChargeA: no`)
- **A:** double strike **10+10**, poise **8+8**; startup 0,12 с, recovery 0,16 с; 4-й удар recovery 0,28 с.
- **B:** cross-cut урон **24**, poise **18**, Bleed 6/с × 2 с; startup 0,30 с, recovery 0,34 с. +25% HP если удар в спину (угол > 120° от facing врага).
- Ideal dodge → микрошаг назад 0,2 м.

### D3. Magical chassis (3)

#### 4) Staff — linear commitment (`canBlock: no`, `hasChargeA: yes`)
- **A:** shaft melee радиус 1,7 м; урон **14**, poise **18**; startup 0,24 с, recovery 0,30 с.
- **B:** line wave 4 × 1,2 м; урон **20**, poise **16**; startup 0,48 с, recovery 0,52 с; knockback лёгких 1,5 м. Стоять 0,40 с до B → pierce.
- **Combine feel:** «выстрел явления» по facing; поворот во wind-up ×0,35.
- Лучшие пары: Spark+Tide, Spark+Root.

#### 5) Book (Grimoire) — sigil ritual (`canBlock: no`)
- **A:** сигил на пол в aim-точке ≤ 5 м; через 0,35 с импульс урон **14**, poise **10**, радиус 1,0 м. Макс активных сигилов: **2**.
- **B:** page-ward 0,90 с: поглощает **1** снаряд **или** −35% ближайшего melee. Не стакается.
- **Residue+Strike:** Primary Skill на активный сигил → сигил получает тег Силы (+10% радиус 2 с). Combine во время сигила = ритуал с полным telegraph.
- Лучшие пары: Root+Whisper, Tide+Root, Whisper+Ash.

#### 6) Orb — residues / orbitals (`canBlock: no`)
- **A:** bolt 14 м/с; урон **12**, poise **8**; startup 0,16 с, recovery 0,20 с.
- **B:** вооружает до **2** орбиталей (радиус орбиты 1,2 м, 0,80 с до автодетонации); повтор R2 = detonate радиус 1,4 м, урон **22**, poise **14**.
- Weave: после Primary следующее A в 0,50 с получает **+4** урона.
- Лучшие пары: Ash+Whisper, Tide+Ash, Ash+Root.

### D4. Пресеты приёмки

| ID | Weapon A | Weapon B | Skill 1 | Skill 2 | Armor |
|----|----------|----------|---------|---------|-------|
| **M1 Melee** | Sword Iron | Spear Iron | Root | Ash | Anchor Guard (Major), Thorn Plate |
| **M2 Magic** | Orb Tideglass | Book Embersteel | Spark | Tide | Focus Veil (Major), Wide Step |
| **M3 Hybrid** | Spear Embersteel | Orb Rootbone | Spark | Root | Anchor Guard (Major), Blood Toll |

---

## E. Forces + singles + full skill×skill matrix

### E0. Пять Сил

| Сила | Primary форма | Статус | Цвет игрока (cool) |
|------|---------------|--------|--------------------|
| **Spark** | Bolt / chain-1 | Charged | Янтарный (cool edge) |
| **Tide** | Sector wave | Wet + knock | Сине-зелёный |
| **Whisper** | Bind / mark | Hushed | Бледно-лиловый *(только VFX силы)* |
| **Ash** | Field cloud | Ashen | Угольно-оранжевый |
| **Root** | Bind vines | Entangled | Хвойно-зелёный |

Вражеский telegraph: **тёплый янтарь/красный** floor decal — никогда не совпадает с player cool palette.

### E1. Primary (Tier-0) — одиночный скилл

Общее: startup **0,28 с**, recovery **0,22 с**, cost **24 Focus**. Dodge-cancel только T+0,00–0,10 с (полный refund).

| Сила | Эффект | Числа |
|------|--------|-------|
| Spark | Разряд по facing | Луч 5 м; урон **26**; poise **12**; поджигает Oil/AshBed 100% |
| Tide | Волна от игрока | Конус 160° / 2,2 м; урон **18**; poise **20**; knock 1,2 м; создаёт **Wet** лужу 2,5 с |
| Whisper | Step + shadow cut | I-frames 0,15 с + удар на выходе урон **20**; poise **8**; ignore 30% armor; оставляет **WhisperFog** 3,0 с (расходуемый) |
| Ash | Конус тлена | 90° / 2,0 м; урон **12** + DoT **8/с × 3 с**; poise **10**; тушит Torch; усиливает труп → AshBed tag |
| Root | Лозы в aim | Радиус 1,3 м; урон **10**; poise **24**; Entangled 1,2 с; **RootedGround** якорь 4 с |

Loadout: ровно 2 силы. Две **одинаковые** силы **разрешены** (dual-same phenomena). UI bench показывает имя явления пары.

### E2. Полная матрица Combine (Skill × Skill)

Combine: unordered pair (порядок кнопок не важен). Startup **0,50 с**, recovery **0,30 с**, cost **40 Focus**, +**4 Debt**. Dodge-cancel T+0,00–0,12 с (refund). Формы: Bolt / Field / Bind.

#### E2.1 Cross pairs (обязательный документ; демо может шипнуть 6 ключей первыми)

| Пара | Явление | Форма | Базовый эффект (без катализатора) |
|------|---------|-------|-----------------------------------|
| Spark+Tide | **Ионный Прилив** | Field | Сектор 2,4 м × 2,5 с: **10/с**; micro-stagger poise 8 каждые 0,8 с; chain на Wet |
| Spark+Whisper | **Немой Разряд** | Bolt | Линия 6 м: урон **34**; poise **14**; Hushed 2,0 с; следующий удар по цели = guaranteed stagger (≥18 poise) |
| Spark+Ash | **Тлеющая Вспышка** | Field | Взрыв 2,0 м: урон **28**; Ash DoT 4/с × 4 с; short blind 0,35 с у аддов |
| Spark+Root | **Живая Проволока** | Bind | Entangled в aim 3 с связаны: tick Spark **6/с**; DR после 2 с (−50% tick). Poise 12 on apply |
| Tide+Whisper | **Утопленный Шёпот** | Field | Туман 3,0 м × 3 с: miss chance врагов +25%; aggression −; audio cue направлений |
| Tide+Ash | **Грязевой Шторм** | Field | Зона 2,2 м: slow 35%; урон **8/с × 3 с**; гасит горение / AshBed → грязь |
| Tide+Root | **Топь (Mire)** | Bind | Круг 2,6 м × 3 с: скорость ×0,5; попытка dodge через зону → Entangled 1 proc/враг |
| Whisper+Ash | **Пепельная Завеса (Ash Veil)** | Field | Stealth 1,2 с (no Combine i-frames); выход = ash burst урон **16** радиус 1,5 м |
| Whisper+Root | **Терновник-Психе (Thorn Psyche)** | Bind | Forced turn / taunt-lite 1 цели ≤ 5 м + fear аддов 1,5 с; урон **18**; poise **22** |
| Ash+Root | **Угольный Склеп (Coal Crypt)** | Field | Клетка 2,0 м × 4 с: DoT **14** apply + **6/с**; anti-heal (flask эффекты врагов n/a; игрок flask в зоне −50% heal) |

#### E2.2 Dual-same (документировано; шип опционален)

| Пара | Явление | Эффект |
|------|---------|--------|
| Spark+Spark | **Грозовой Шквал** | Широкий слабый веер: урон **16**, 3 луча ±20°; быстрый cast (startup 0,35 с) |
| Tide+Tide | **Отлив-Стена** | Стена 3 × 1 м × 2 с: push + блокирует 1 projectile tier |
| Whisper+Whisper | **Хор** | Mass Hush радиус 3 м × 1,2 с; +**8 Debt** вместо +4 |
| Ash+Ash | **Уголь-Щит** | Ablative cloud: поглощает **1** хит ≤ 25 HP в течение 2 с |
| Root+Root | **Роща** | Slow-зона 3,5 м × 4 с; startup 0,60 с (длинный) |

#### E2.3 Демо-приоритет шипа (минимум 6)
1. Ионный Прилив  
2. Немой Разряд  
3. Тлеющая Вспышка  
4. Топь  
5. Пепельная Завеса  
6. Угольный Склеп  

Остальная матрица — в коде за флагом или фаза 2 демо.

### E3. Катализатор → усиленный модус (не отдельный Tier-меню)

Если soft-aim / зона явления пересекает tagged volume в радиусе **1,5 м** на кадре release:

| Явление | Катализатор | Усиленный модус |
|---------|-------------|-----------------|
| Ионный Прилив | Wet / Conductive | Chain +1 прыжок; Conductive: +self-arc риск 15% → 8 HP |
| Немой Разряд | WhisperFog | Hushed +0,8 с; урон **38** |
| Тлеющая Вспышка | AshBed | Радиус 2,6 м; DoT 6/с × 4 с; AshBed расходуется |
| Живая Проволока | RootedGround / Conductive | Tick 9/с первые 2 с; якорь сгорает |
| Утопленный Шёпот | Wet + WhisperFog | Miss +40%; длительность 4 с |
| Грязевой Шторм | Wet | Slow 50%; гасит AshBed в радиусе |
| Топь | Wet + RootedGround ≤ 3 м | Стена-кольцо 3 м × 4 с (клетка); оба носителя− |
| Пепельная Завеса | AshBed | Stealth 1,6 с; burst **22** |
| Терновник-Психе | RootedGround | Pull 2 м + turn; урон **24** |
| Угольный Склеп | AshBed / труп | DoT 9/с; труп расходуется |

Если катализатор невалиден → базовое явление, **без** Backfire.

### E4. Иерархия Spark (анти-путаница)

| Слой | Делает | Не делает |
|------|--------|-----------|
| Skill Spark | Active bolt, Focus | Не модифицирует автоатаки постоянно |
| Weapon Rune Spark | Мутирует A или B on-hit | Не даёт кнопку каста |
| Armor rune | Passive tradeoff | Не кастует Spark |
| Environment Conductive/AshBed | Меняет модус Combine | Не бьёт само |

Визуальный приоритет: **enemy telegraph > player silhouette > skill VFX > catalyst highlight (Touchpad) > rune idle particles**.

---

## F. Weapon runes rules + examples

### F1. Слоты
- Ровно **2** слота: **Rune A** (мутирует Attack A), **Rune B** (мутирует Attack B).
- Один слот = одна руна; установка = overwrite (старая → банк частей).
- Только на prefight bench; **в бою руны не меняются**.
- Пустые слоты допустимы.

### F2. Конфликты
1. Нельзя два одинаковых Rune ID.
2. `Forbids[]` / `Tags[]`: две руны с одним Verb (`Explode`, `Chain`, `Mark`, …) — блок.
3. `ForceExclusive`: не более одной руны одной Силы.
4. `Stance`: не более одной Stance.
5. `RequiresAffinity`: материал должен совпадать (или Iron = universal).
6. `Family`: `Martial` / `Magic` / `Any`.
7. UI: одна фраза «конфликт с [X]».

### F3. Каталог демо — 12 weapon runes

| ID | Слот | Verb / Tags | Эффект | Штраф / gate |
|----|------|-------------|--------|--------------|
| WR-CHAIN | A | Chain, ForceExclusive Spark | 25% on-hit: chain +6 Spark на 2-ю цель ≤ 3 м | −5% A dmg; Requires Embersteel **или** Any+Iron |
| WR-MARK | A | Mark | A накладывает Mark 3 с; расход Mark усиливает следующий B +30% dmg | −8% A poise |
| WR-ECHO | A | Echo | Через 0,25 с второй хитбокс 50% урона A | +3 STA на A |
| WR-BLEED | A | Bleed | A: Bleed 4/с × 2 с | −6% direct HP |
| WR-REACH | A | Stance | +0,25 м длина / радиус A; −0,03 с startup A | −6% B dmg |
| WR-BEAM | A | Magic, ChargeMorph | Staff/Orb/Book: hold A → beam tick 8/с до 0,8 с | Martial forbidden; +4 Focus если прерван |
| WR-DETONATE | B | Explode | B взрывает Mark / орбиталь: +AoE 1,4 м | +4 STA на B |
| WR-SWEEP | B | Sweep, Martial | B +30° дуга / +0,4 м knock | −10% B dmg |
| WR-COUNTER | B | Stance, Counter | B в 0,20 с после блока/parry = riposte ×1,35 | Conflict other Stance |
| WR-ZONE | B | Deploy, Magic | B оставляет зону 2 с (8/с) | Martial forbidden; −0,05 с move в deploy |
| WR-ORBIT | B | Orbit, Magic | Orb: +1 орбиталь cap (3); Book: сигил +0,3 с life | −8% B dmg |
| WR-ROOTW | B | ForceExclusive Root | +12 poise на B; Entangled 0,4 с on B hit | −8% move в B recovery; Requires Rootbone или Iron |

**Примеры валидных:** Mark(A)+Detonate(B); Reach(A)+Sweep(B); Beam(A)+Zone(B) на Staff; Chain(A)+Orbit(B) на Orb.  
**Невалидно:** Reach+Counter (2 Stance); Chain+другая Spark ForceExclusive; Zone на Sword.

---

## G. Armor runes rules + examples

### G1. Слоты
- Ровно **2** слота брони (Chest + Boots эквивалент).
- Макс **1 Major**. Второй слот — только Minor.
- Каждая руна: **Effect + обязательный Cost** (одна строка).
- Нельзя две с одним `ArmorFamily`.
- Нельзя чистый +dmg/+crit без цены.
- Armor **не** даёт новые active skills.

### G2. Каталог — 6 armor runes

| ID | Tier | Family | Effect | Cost |
|----|------|--------|--------|------|
| AR-ANCHOR | **Major** | Guard | −20% incoming poise; hyperarmor на последние 40% startup Attack B | −15% dodge distance |
| AR-GLASS | **Major** | Tempo | После dodge: A startup −20% на 1,5 с | Max HP **−15** (85); +10% chip through block |
| AR-FOCUSV | **Major** | Focus | Primary/Combine не прерывается хитами poise < 20 | Move ×0,50 во время wind-up каста |
| AR-THORN | Minor | Thorns | Reflect 10 melee 1/1,5 с | +10% incoming ranged HP |
| AR-BLOOD | Minor | Toll | A hit restores **2 Focus** | A costs **2 HP** (не убивает: floor 1 HP) |
| AR-WIDE | Minor | Step | Dodge i-frames **0,22 с** | Dodge STA **34** instead of 28 |

**Валидно:** Anchor + Thorn; Glass + Blood; Focus Veil + Wide.  
**Невалидно:** Anchor + Glass (2 Major); Anchor + другая Guard.

### G3. Anti-menu
На bench **запрещён** суммарный DPS-number. Только слоты, текст бонуса/штрафа, конфликты, имя явления Skill1×Skill2.

---

## H. Cast / combine / backfire timing

### H1. Primary timeline
1. Input → wind-up **0,28 с** (цвет Силы под ногами + trigger charge).
2. T+0,00–0,10: dodge-cancel; Focus/Debt refund 100%.
3. После 0,10: commitment. Враг poise hit ≥ 25 → cast stagger: fail, Focus spent, Debt остаётся, **Backfire нет**.
4. Active → recovery **0,22 с**.

### H2. Combine timeline
1. L1+L2 ≥ 120 мс → wind-up **0,50 с** (уникальный glyph = цвета обеих сил).
2. T+0,00–0,12: dodge-cancel + refund.
3. T+0,12–0,50: уязвимость (нет hyperarmor); проверка катализатора на release.
4. Release: усиленный модус или база; +4 Debt.
5. Recovery **0,30 с**.

### H3. Enemy telegraphs
- Жёлтый floor: ≤ 0,45 с до active.
- Красный + haptic: active / unblockable.
- Форма: круг / линия / конус (colorblind-safe).
- Max 2 particle layers: 1 player heavy + 1 enemy heavy.
- Screen shake только на poise break / boss slam.

### H4. Backfire — точные числа
Триггер **только** если:
- **(A)** Primary/Combine начат при Debt ≥ 40, **или**
- **(B)** Combine прерван врагом после commitment (T > 0,12 с).

Эффект:
- **12 HP** (сквозь thorns/reflect),
- Poise **−30**,
- Self-stagger **0,35 с**,
- Каст отменён; Focus spent,
- Haptic §C2,
- Опционально: polarity flip катализатора под ногами на 2 с (Wet↔AshBed visual only).

Нет RNG Backfire при Debt < 40 и чистом касте.

### H5. Input priority (высокий → низкий)
1. Уже идущий commitment  
2. Dodge (если cancel-окно)  
3. Combine (L1+L2)  
4. Skill tap  
5. Attack B  
6. Attack A  
7. Block / Parry / Interact  
8. Swap △  

---

## I. Environment carriers / catalysts

### I1. Tagged volumes (канон тегов)

| Тег | Источник | Взаимодействие |
|-----|----------|----------------|
| **Wet** | Лужи арены; Tide Primary | Усиливает Tide-линии; Spark chain; гасит Ash |
| **AshBed** | Зольные пятна; трупы + Ash | Whisper длиннее; Spark → flash; Root → Ember |
| **WhisperFog** | Гео-тени (постоянные); Whisper Primary (расход) | Soft stealth/crit window; Tide рассеивает; Spark детонирует |
| **RootedGround** | Корневые плиты; Root Primary якорь | Root дешевле visually; Tide → Топь+; Ash → toxic |
| **Conductive** | Металлические плиты | Spark комбо +ампер / self-risk |
| **Oil** (подтип AshBed) | Одно пятно | Spark/Ash поджиг пола 12/с × 3 с |
| **Torch** | Интерактив × | Источник огня; Ash тушит; × зажигает снова |
| **Corpse** | Смерть адда | Расходуемый носитель для Ash/Root усилений |

### I2. Правила
- Катализатор меняет **модус** (§E3), не скрытый +% DPS.
- Геометрический WhisperFog (под колоннами) **не** расходуется; скилловый — расходуется.
- Max 1 player Field одновременно; новый Combine схлопывает старое поле игрока.
- CC diminishing: повторный Entangled/Hushed на той же цели в 6 с → длительность ×0,5.

---

## J. Prefight loadout bench

### J1. Таймер
- **60–90 с** на решение (UI таймер; default **75 с**).
- По истечении — **auto-LOCK** текущего пресета (или M1 если пусто).
- Игрок может нажать Confirm раньше → LOCK.

### J2. Порядок сборки
1. Выбрать Chassis (схема A/B + risk icons).  
2. Material blank (affinity + one-line cost).  
3. Rune A + Rune B (live preview dummy 3 с).  
4. Выбрать Skill 1 + Skill 2 → UI показывает **имя явления**.  
5. Armor: 1 Major max + 1 Minor.  
6. Опционально Weapon B (запас).  
7. **LOCK** → арена. В бою: только использование.

### J3. Запрещено на bench
- Affix rares / legendary rolls  
- Support gems  
- Skills-as-items  
- Mid-fight перековка (после LOCK)  
- Суммарный DPS score  

---

## K. Demo arena encounter

### K1. Layout
- Пол: **18 × 14 м**, замкнутый зал, изометрия.
- Старт игрока: (9, 2) юг.
- Колонны (укрытие): (4, 7), (14, 7).
- Ритуальный круг босса фаза 2: центр (9, 8) радиус 2 м.
- Выход: дверь север (9, 13) — открывается при смерти Doorwarden.

**Стартовые катализаторы:**

| Объект | Позиции | Кол-во | Respawn |
|--------|---------|--------|---------|
| Torch | (3,5), (15,5), (9,11) | 3 | нет; × зажечь если потушены |
| Wet puddle | (6,9), (12,9) | 2 | Tide может создать новые |
| Oil / AshBed | (9,4) | 1 | нет |
| WhisperFog geo | под колоннами + (9,12) | 3 | постоянные |
| RootedGround | (5,11), (13,11) | 2 | нет |
| Conductive plates | (8,6), (10,6) | 2 | постоянные |
| Corpses | — | 0→N | от аддов |

### K2. Wave / encounter script
1. **Wave 1:** 2× **Ash Raider** (одновременно).  
2. Когда оба мертвы **или** 40 с: **Wave 2:** 1× **Cinder Archer** + 1× Ash Raider.  
3. Опционально mid: **Warden Construct** вместо второго Raider в wave 2 (флаг демо `WITH_WARDEN`).  
4. Когда арена чиста **или** суммарно 90 с от старта: решётка ↑, входит **Doorwarden** (walk 2 с, неуязвим).  
5. Одновременно на экране: max 3 малых **или** 1 элита+1 малый **или** босс (+1 add только в фазе 2 босса).  
6. Победа: смерть Doorwarden → дверь север.

### K3. Ash Raider (melee tutor)
- HP **70**, Poise **50**, speed 3,2 м/с.
- (1) 2-hit slash: startup 0,40 с, урон 18, poise 20, радиус 1,5 м.  
- (2) Leap-slam: круг telegraph 0,55 с, урон 22, poise 24.  
- (3) Shield raise 1,2 с: блок фронта 180° (нужен flank / interrupt Skill).  
- Смерть → Corpse.

### K4. Cinder Archer (ranged pressure)
- HP **55**, Poise **40**; держит 5–7 м.
- (1) 3-volley line: startup 0,35 с, урон 10×3.  
- (2) Charged sniper: лазер-телеграф 0,70 с, урон 22.  
- (3) Panic roll + melee poke урон 12.  
- Может создать Wet под игроком (0,70 с telegraph) — игрок может использовать.

### K5. Warden Construct (optional elite)
- HP **140**, Poise **100**.
- Wide sweep / stomp AoE / interruptible beam channel 1,2 с.  
- Учит stamina discipline и Hammer/Combine (Staff B / Combine).

### K6. Doorwarden (boss)
- HP **280**, Poise **120** (после stagger → 60; window 1,2 с).

**Фаза 1 (HP > 60%) — Melee gate**  
- Horizontal → horizontal → delayed overhead (фейк +0,20 с).  
- Side thrust.  
- Shield-bash: blockstun игрока 0,35 с.  
- Unblockable: max 1 за фазу (overhead).

**Фаза 2 (60–30%) — Hybrid**  
- Уходит в круг (9,8).  
- Призывает **1 Ash Raider** **или** 2 стационарные rune-turrets (Cinder AI, HP 30).  
- Line wave по полу; teleport-slam (круг 0,60 с).

**Фаза 3 (≤ 30%) — Commit check**  
- Recover −15–20%, но big windup **+0,10 с**.  
- Ultimate каждые 8 с: арена → 3 полосы, безопасная читается заранее (урон 22 вне safe).  
- После ultimate: poise break window **2,0 с** — любой loadout казнит.  
- Первый каст фазы 3 тушит все Torch.

**Честность:** нет invisible tracking >45° без поворота корпуса; ни одна фаза не требует обязательно magic или melee.

### K7. Три clear routes

#### Melee (M1)
1. Ash Raider: Sword B на leap recover → A A; Root на shield.  
2. Archer: Spear poke из-за колонны; Ash DoT в окне.  
3. Doorwarden: только A/B + dodge + parry; Tier-усиления не обязательны.  
4. Критерий: босс мёртв; Debt ≤ 20; Flask ≤ 1.

#### Magic (M2)
1. Tide → Wet; Combine **Ионный Прилив** на Raider.  
2. Orb weave + Book сигилы vs Archer.  
3. Босс: дистанция Orb; Combine по лужам/Conductive.  
4. Критерий: ≥ 50% урона боссу от Skills/Combine; weapon A/B ≤ 25%.

#### Hybrid (M3)
1. Spear kite; Spark поджигает Oil.  
2. Трупы → Угольный Склеп / пепельные усиления.  
3. Ровно **1** weapon swap на Orb в фазе 2.  
4. Критерий: ≥ 1 усиленный катализатором Combine; ни Skills ни weapon не > 70% урона.

---

## L. Acceptance criteria for demo pass

### L1. Playtest (3 игрока × 3 маршрута)
1. В слепой записи игрок называет телеграф босса раньше носителя рядом в ≥ **80%** опасных окон.  
2. Медианное время клира M1 vs M2 отличается ≤ **20%**.  
3. Среднее Combine за клир ∈ **[3, 10]**; Backfire хотя бы раз у новичка, избегается на 3-м заходе.  
4. M1 проходит без усиленных катализаторов; M2 без катализаторов длиннее ≥ **30%**.  
5. Ни один armor pair не даёт автовин; Glass Tempo наказывает chip.  
6. Swap commitment наказуем попаданием.  
7. После 1 баннера игрок использует R1/R2/L1/L2/Combine/○/□/△ без подсказки HUD.

### L2. Technical checklist
- [ ] Ресурсы §B с числами ±0  
- [ ] DualSense map §C полностью  
- [ ] 6 chassis §D с таймингами  
- [ ] 5 Primary + полная матрица §E задокументирована; ≥ 6 cross shipped  
- [ ] 4 materials, 12 weapon runes, 6 armor runes, конфликты  
- [ ] Prefight bench 60–90 с → LOCK  
- [ ] Backfire только §H4  
- [ ] Encounter §K тремя пресетами  
- [ ] Enemy warm floor telegraph не перекрыт player VFX  
- [ ] Swap: 0,60 с / CD 4,00 с / только оружие  

### L3. Читаемость магии
- A / B / Combine отличаются силуэтом < 0,5 с на записи.  
- Miscombine < 15% после 2-мин tutorial shrine.  
- Нет infinite CC > 1,5 с на элите без DR.

---

## M. Explicit non-goals for demo

- Роглайк-мета, магазины между забегами, дерево уровней, XP  
- Magicka-очередь из 5 элементов mid-fight  
- 8 школ на face buttons / 4 режима каста на отдельных кнопках  
- Affix soup, support gems, skills-as-items  
- Mid-fight смена рун / сил  
- Полный Noita pixel sim  
- Friendly fire по умолчанию  
- Кооп, скакуны, стелс-миссия вне арены  
- Hammer и Bow как playable chassis (только frame-feel спек; контент пост-демо)  
- Более 2 активных скиллов  
- Третья полоска ресурса кроме STA/Focus (+ Debt как вторичный счётчик, Poise скрыт)  
- Скрытые оппозиции без UI  
- Суммарный DPS на экране loadout  

---

## Приложение: словарь реализации

| Термин | Значение |
|--------|----------|
| Commitment | Нельзя отменить атакой/кастом; dodge только в явном окне |
| Combine / Fusion | L1+L2 → phenomenon |
| Debt / Heat | Одна шкала 0–50 |
| Catalyst / носитель | Tagged volume для усиления модуса |
| Residue+Strike | Book/Orb: метка → удар/сила усиливает |
| Soft-lock | R3 toggle; без hard camera lock |
| Major armor | Макс 1; сильный playstyle shift |
| Chassis ≫ Rune ≫ Material | Иерархия власти ощущения |

**Конец канона.** Любое изменение чисел — только правка этого файла с бампом версии.
