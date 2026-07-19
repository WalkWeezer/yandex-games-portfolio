# Neon Bullet vs JSooter/Neontron — gap analysis

**Источники:**  
- A: `C:\Users\borov\Projects\JSooter` (ветка `cursor/yandex-hotline-gdd-5e2e`, клон WalkWeezer/JSooter)  
- B: `games/neon-bullet/` (портфель)

**Важно:** один жанровый вектор (Hotline-like), уже **не одна спецификация продукта**.

| | JSooter Neontron (A) | portfolio Neon Bullet (B) |
|--|----------------------|---------------------------|
| Core verb | combat-puzzle: маршрут + vision cones + оружие с пола + **EXIT** | в доках — room clear + combo; в демке — **wave arena** |
| Win | objective + стоять на EXIT | «все мертвы» (± extract у боссов в LLM) |
| Смерть VFX | dissolve / 12+ | stylized blood |
| Meta chrome | пейджер / Нью-Рэйл | city hub |
| Зрелость | playable 14 миссий + SDK mock | DRAFT + слабая демка |

---

## 1. Есть в JSooter → нет / слабо у Neon Bullet

| Тема | Что | Зачем |
|------|-----|-------|
| Playable slice | 14 миссий, death→restart &lt;0.4s | Feel уже проверен |
| Vision / alarm | конусы, стадии тревоги, flank shield | Hotline-dopamine |
| EXIT + objectives | clear / vip / extract / silent (+ timed в типах) | Win ≠ «просто убей» |
| Weapon-on-floor | bat/knife/pistol с пола | Ритм раунда |
| Pager fantasy | брифинг 2–4 строки, device UI | Сильный identity |
| 12+ moderation | dissolve, no gore, чеклист | Каталог Яндекса |
| Portrait + twin-stick | mobile-primary | Реальный стор |
| i18n RU+EN + CI | ключи, запрет хардкода | Модерация |
| Store/QA package | promo, QA_REPORT, zip | Путь в консоль |
| Phased agent plan | Phase 1–9 + Agent Cards A1–A10 | Меньше хаоса |
| Runtime truth в TDD | «что в коде» vs backlog | Честный долг |
| Эталонная миссия | «Плат-03» teach layout | Контент-пайплайн |

## 2. Есть у Neon Bullet → нет / слабо в JSooter

| Тема | Что | Зачем |
|------|-----|-------|
| Gate «не кодить до CONFIRM» | DRAFT lock | Защита от drift |
| Числовые AC | speed, weapon table, cones в LLM | Контракт до кода |
| Encounter recipes | ambush / budget points | Контент ≠ +враги |
| Combo juice | окно комбо, HUD | Skill expression |
| Boss в MVP-плане | Maskmaker | Mid-content spike |
| Armor / soft HP mask | опционально | Разный feel |
| RV Continue mid-run | 1× на death | Монетизация vs prestige |
| District leaderboards | lb по районам | Retention |
| Portfolio feel-demo slot | вкладка Демка | F1 до CONFIRM |

## 3. Почему ощущается «красиво по кускам, сыро вместе»

Как у Работника месяца до pass-2:

1. Документы Neon Bullet и Neontron **похожи по фантазии**, но демка портфеля — **другой глагол** (волны chase).  
2. DoR/refs в портфеле отмечены готовыми при слабых/пустых визуалах в папке игры.  
3. JSooter наоборот: **playable сильнее доков-мечты** (GDD ~25 миссий, код 14; маски 5 vs 3).  
4. Нет одной эталонной миссии в портфеле, на которой сходятся feel + layout + win.

## 4. Методология JSooter — что сработало / что поплыло

**Сработало:** vertical slice до арта; фазы с exit criteria; i18n/budget/pack; потом TDD v2 для агентов.  

**Поплыло:** mood-art как «весь визуал»; GDD шире кода; promo ≠ canvas; типы silent/timed/S+ без глубины.  

Тот же урок, что chas-pik: агент оптимизирует измеримое (phases DONE, zip, PNG), feel/retention догоняют позже.

## 5. Рекомендация

**Не** переносить Neontron wholesale (бренд/пейджер/репо).  
**Не** писать Hotline в портфеле с нуля, игнорируя JSooter.

**Merge:**
1. Core verb из Neontron: cones + rooms + EXIT + restart &lt;400ms  
2. Оставить у Neon Bullet: slug/бренд портфеля, combo (если совместимо с 12+), recipes, CONFIRM-gate, district LB  
3. До CONFIRM решить: **12+ dissolve** vs blood  
4. Демку выровнять под combat-puzzle (убить wave-arena как канон)  
5. Код JSooter = reference playable, не слепой import

## 6. До CONFIRM в DESIGN Neon Bullet

1. Feel/verb lock + запрет wave-MVP  
2. Vision & alarm AC  
3. EXIT + objectives table  
4. Restart &lt;400ms  
5. Age rating VFX decision  
6. Orientation + twin-stick  
7. Эталонная миссия (как Плат-03)  
8. INV table (ads/i18n/budget)  
9. Честный REFS DoR  
10. Демка = тот же verb  

## 7. Связанные файлы JSooter

- `docs/GDD-NEONTRON.md`  
- `docs/tech-design/TDD-NEONTRON-LLM.md`  
- `docs/LLM_PRODUCTION_PLAN.md`  
- `docs/QA_REPORT.md`  
- `src/scenes/MissionScene.ts`, `src/data/missions/`  
