# Работник месяца (portfolio) vs chas-pik — gap analysis

**Источники:**  
- A: `C:\Users\borov\Projects\chas-pik\docs\design\` + `src\`  
- B: `games/deadline-escape\docs\` (портфель)

**Важно:** это **разные игры** с похожей фантазией. Portfolio-название: **Работник месяца**; chas-pik — исходный референс с тем же духом.

| | chas-pik | portfolio Работник месяца |
|--|----------|-------------------|
| Core verb | клеточный dodge на 3 колонках | free-move chase + hide/distract |
| Win | дожить 09:00→18:00 → этаж+1 | endless score до catch |
| Пространство | фикс 7×9 | открытый офис / tilemap |
| Зрелость | код + выстраданные инварианты | красивый DRAFT без согласованности |

---

## 1. Есть в chas-pik → нет / слабо у нас

| Тема | Что именно | Почему важно |
|------|------------|--------------|
| **00-CONTEXT / память решений** | U1–U12, fail-условия модерации и арта | Агент не забывает грабли |
| **INV-01…10** | portrait 720×1280, сетка, запрет isometric play, chroma, SDK ready/start | Жёсткий «не плыви» |
| **Agent playbook** | роли + sequences + QA-art + store agent | Оркестрация, не каша |
| **Day/phase fantasy** | morning→overtime, promotion | Понятный win и ритм дня |
| **Authored floors** | 11 отделов с mood/palette/signature | Контент ≠ «+speed» |
| **Art QA pipeline** | 4 dir × 4 frames, ring, reject до интеграции | Не вшивать плохой sheet |
| **Store/i18n канон** | RU/EN, ≥70% real gameplay, SDK lang | Уже обожглись на модерации |
| **Debt transparency** | §5 art-debt честно | Не выдавать target за done |
| **Реальный playable** | можно пощупать loop | Feel виден |

## 2. Есть у нас → нет / слабо в chas-pik

| Тема | Что именно | Почему важно |
|------|------------|--------------|
| **Chase/stealth** | LOS, hide, distraction | Глубже verb |
| **Gadgets** | coffee/badge/VPN/donut | Юмор + agency |
| **Meta/retention design** | hub, upgrades, daily, LB, cloud | D1 теория |
| **Ads/IAP surface** | interstitial cadence, sticky, packs | P0 кэшфлоу |
| **Числовые AC** | deadzone, catch time, median TTC | Тестируемый feel |
| **Gate «не кодировать до CONFIRM»** | DRAFT lock | (но CONFIRM пока рано) |
| **Красивые refs** | key art / wireframe / layout / sprites | Настроение есть |

## 3. Почему «Работник месяца» ощущается сырым (твоя оценка верна)

По отдельности круто, **как система — нет**:

1. **Управление** — «стик/WASD» без feel-чисел, tutorial, mobile D-pad, forgiveness.  
2. **Удержание в ране** — 30–90с сказано, но нет кривой напряжения и «ещё один забег».  
3. **Контент-пайплайн** — 5 биомов списком без signature/encounter recipes.  
4. **Return hooks** — daily упомянут одной строкой, нет расписания наград.  
5. **Согласование** — арт и LLM-промпты не сведены к одной win-truth (endless vs objective).  
6. **Нет демки** — нельзя проверить ощущение до CONFIRM.

chas-pik наоборот: loop тонкий, но **согласован и playable**; энергия ушла в арт/стор.

## 4. Что перенести из chas-pik в Работник месяца (не loop)

Переносим **методологию и канон**, не 7×9 dodge:

- Context log + INV table  
- Art QA reject  
- Store/i18n/SDK method invariants  
- Floor concepts как у `04-LEVELS.md`  
- STATUS с колонками Loop/Feel/Content/Art/Store  
- Playbook ролей  

**Не переносим** как MVP: lane-grid, day-clock (можно later mode), 15 скинов до F1.

## 5. Pass-2 план до CONFIRM

См. обновления в `DESIGN.md` / `DESIGN_LLM.md` (секции Feel, Retention, Content roadmap) + вкладка **Демка** в дашборде.

Статус дизайна остаётся **Черновик**, пока F1–F2 не закрыты playtest’ом.
