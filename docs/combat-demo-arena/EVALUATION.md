# EVALUATION — рекурсивная приёмка канона

Документ фиксирует жёсткую самооценку по шкале 1–10.  
Порог выхода: **все пять осей ≥ 9**. Ниже — переписывать, не «надеюсь».

Оси:
1. **Clarity** — ноль двусмысленностей, программист не спрашивает
2. **Fun fantasy** — melee / magic / hybrid читаются как разные фантазии
3. **Implementability** — день-1 порядок + числа + failure states
4. **Balance fairness** — три маршрута валидны; магия не бесплатна; клинок не калека
5. **DualSense feel** — золотая карта соблюдена; Combine на L1+L2; атаки на R1/R2

---

## Pass 0 — аудит источника (`cursor/demo-arena-combat-design-7916`)

Источник: `COMBAT_MECHANICS.md` на design-ветке (512 строк).

| Ось | Оценка | Почему |
|-----|--------|--------|
| Clarity | 6 | Много чисел, но бинды конфликтуют с золотой картой; тени носителя двусмысленны |
| Fun fantasy | 8 | Явления названы, три маршрута есть |
| Implementability | 7 | Нет Build Order наверху; часть active-таймингов дырявая (Spear A) |
| Balance fairness | 8 | ×0,75 magic и три route — ок |
| DualSense feel | **3** | **Критический провал:** Combine=R1+R2; Attack на □/△; Skills на R1/R2; Dodge на × |

**Вердикт Pass 0:** NOT READY. Обязательный полный rewrite биндов.

### Противоречия, закрытые в v2
| Было | Стало |
|------|-------|
| Combine R1+R2 | L1+L2 |
| Attack □/△ | R1/R2 |
| Skills R1/R2 | L1/L2 |
| Dodge × | ○ |
| Block ○ (конфликт interact/swap) | □ Block/Parry |
| Interact ○ | × |
| Swap L1+△ | △ |
| Env Read L2 | Touchpad hold |
| Shadow «и да и нет» | Geometry Shadow ≠ Skill Shadow |
| Debt без Heat | Debt число + Heat лента |
| M3 требовал Corpse Tier-2 при Spark+Root | M3 = Проводная казнь на RootAnchor |

---

## Pass 1 — первый полный v2 draft

| Ось | Оценка | Слабое место |
|-----|--------|--------------|
| Clarity | 8 | M3 маршрут был кашей про трупы/Ash |
| Fun fantasy | 8 | Feel-скрипта DualSense не было |
| Implementability | 9 | Build Order + verb table на месте |
| Balance fairness | 8 | M2 критерий без числа Tier-2 |
| DualSense feel | 8 | Карта верная; не хватало feel-скрипта и явного «R1+R2 ≠ Combine» |

**Действие:** переписать M3; усилить M1/M2; добавить §4.4 feel-скрипт; STA spend timing; Parry failure уточнить.

---

## Pass 2 — после правок маршрутов и feel

| Ось | Оценка | Почему |
|-----|--------|--------|
| Clarity | 9 | Маршруты пошаговые; Shadow канон; Appendix B |
| Fun fantasy | 9 | 10 именованных явлений; M1 вес / M2 алхимия луж / M3 якорь+swap |
| Implementability | 9 | Checklist + P0–P15; каждый глагол с failure |
| Balance fairness | 9 | M1 без Tier-2; M2 ≥2 Tier-2 и ≤25% weapon; magic ×0,75; Debt/Backfire |
| DualSense feel | 9 | Золотая карта; L1+L2 combine; adaptive; feel-скрипт 8 с |

**Остаточные риски (не валят порог):**
1. Баланс чисел (18/32 у Cleaver vs 26 Spark) потребует playtest-тюнинга ±10% — это ожидаемо, правила однозначны.
2. Touchpad Env Read менее «мясный», чем был L2 — цена золотой карты; компенсирован haptic Heat и trigger resistance.
3. Parry = tap **или** early-block contact — два входа в одно окно; в коде одна функция `TryParryWindow()`.

---

## Pass 3 — контрольный проход «программист без автора»

Чеклист вопросов, которые программист мог бы задать — и где ответ:

| Вопрос | Ответ в каноне |
|--------|----------------|
| Combine на каких кнопках? | §1.1, §4: **L1+L2 ≥120 мс** |
| Что если нажать R1+R2? | §5: Attack B priority, не явление |
| Где Env Read? | §4: Touchpad hold |
| Debt vs Heat? | §3.4: один пул Debt, Heat = лента |
| Можно ли melee без луж? | §11.7 M1: да |
| Tier-2 без носителя? | §7.3: нет, падает в Tier-1 |
| Swap меняет скиллы? | §1.10 / §6.0: нет |
| Одинаковые Skill1/2? | §7.0: UI forbid |
| Backfire когда? | §8.4 только A или B |
| Geometry shadow для грозы? | §7.3: нет, только Skill Shadow / listed carriers |

Дополнительных дыр, требующих уточнения автора, **не найдено**.

| Ось | Оценка |
|-----|--------|
| Clarity | **9** |
| Fun fantasy | **9** |
| Implementability | **9** |
| Balance fairness | **9** |
| DualSense feel | **9** |

---

## Pass 4 — финальный score (выход)

Повторная читка §0, §4, §5, §7, §11.7 + сверка с `DEMO_BUILD_CHECKLIST.md` и `README.md`.

| Ось | Score | Доказательство |
|-----|-------|----------------|
| Clarity | **9** | Одна карта биндов; Appendix B; verb×failure таблица |
| Fun fantasy | **9** | Три явных route; именованные феномены; нет element queue |
| Implementability | **9** | Build Order день-1; checklist A→J; все тайминги |
| Balance fairness | **9** | Роли клинок/магия; Debt цена; критерии % урона |
| DualSense feel | **9** | Golden map соблюдена; feel-скрипт; adaptive triggers |

**Среднее: 9.0. Мин: 9. Порог пройден.**

Pass 4 не требовал новой переписки substantive-секций — только подтверждение.

---

## Почему READY

1. Главное противоречие DualSense уничтожено и вынесено в правило №1.
2. Программист получает порядок сборки без созвона.
3. Три фантазии имеют измеримые критерии клира на одном боссе.
4. Magicka-суть (пара → феномен) зафиксирована; очереди элементов запрещены текстом и чеклистом.
5. Скоуп v0 отрезан ножом (§12).

## Оставшиеся риски (после READY)

- Числовой тюнинг DPS после первого playtest (±10% урона/poise) — **не** дырка дизайна.
- Haptic API вариативность на PC vs DualSense native — fallback на общий pulse уже в §4.1.
- Игроки могут путать Touchpad Env Read первые 30 с — один туториал-баннер в acceptance §13.1.7.

---

## Вердикт

# READY TO BUILD DEMO

Канон однозначен, бинды совпадают с золотой картой, три маршрута специфицированы, скоуп обрезан. Можно открывать `DEMO_BUILD_CHECKLIST.md` и писать код с P0.
