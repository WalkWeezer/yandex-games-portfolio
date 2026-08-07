/**
 * Pitch Tactics Core — replay match data (edited for Freeze v1)
 * All statuses visible. Probabilities shown. Per-player Focus (Сон).
 * Coords: col 0-11 (A-L), row 0-19 (1-20). Home attacks +row.
 */
window.PITCH_TACTICS_MATCHES = [
  {
    id: "H",
    theme: "H",
    title: "Блок → прессинг",
    subtitle: "Игра у своих третей. Сон на чужих ОП → гол. B раскрывается.",
    scoreFinal: "1:1",
    styles: { A: "Низкий контроль у своей трети", B: "Пассивный блок → прессинг" },
    uiGlossary: [
      { key: "Сон", where: "Бейдж на фишке + полоска слева", text: "Концентрация конкретной фишки. Сброс только её действием." },
      { key: "Defend", where: "Щит на фишке, подсветка клетки", text: "Активная стойка, 2 чужих хода, затем сгорает." },
      { key: "%", where: "Панель «Бросок» справа", text: "Preview шанса до действия и результат после." },
      { key: "Форма", where: "Мелкие стрелки на поле после хода", text: "Пассив +1–2 к якорю. Не сброс Сна." }
    ],
    steps: [
      {
        min: 0, side: "kick", score: [0, 0],
        narrative: "Свисток. Оба сидят низко — компакт у своих половин. Это партия «про терпение».",
        ball: [5, 9],
        players: {
          A: { GK:[5,1], Z:[5,3], OP1:[3,5], OP2:[7,5], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,16], OP1:[3,14], OP2:[7,14], NAP:[5,12] }
        },
        statuses: {},
        focus: {},
        actions: [],
        roll: null,
        uiLabels: [
          { id: "timer", text: "00'" },
          { id: "score", text: "0 : 0" },
          { id: "banner", text: "Kick-off · оба низко" }
        ]
      },
      {
        min: 1, side: "A", score: [0, 0], ap: 2,
        narrative: "A: короткий контроль. Два AP на двух L1 — ОП1 с мячом вперёд, ОП2 подстраховал форму.",
        ball: [5, 10],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[5,10], OP2:[7,8], NAP:[5,9] },
          B: { GK:[5,18], Z:[5,15], OP1:[3,13], OP2:[7,13], NAP:[5,11] }
        },
        statuses: {},
        focus: { "B.NAP": 1 },
        actions: [
          { who: "A.OP1", kind: "move", detail: "F7→F11 (3 кл.)" },
          { who: "A.OP2", kind: "move", detail: "H7→H9" }
        ],
        roll: null,
        uiLabels: [
          { id: "focus", text: "B Нап: Сон 1 — 3' без действия", spot: "badge" },
          { id: "ap", text: "AP 2/2 потрачено" }
        ],
        note: "Нап B уже копит Сон: его не трогали. З B пока чист."
      },
      {
        min: 2, side: "B", score: [0, 0], ap: 2,
        narrative: "B ставит Defend на З и чуть двигает ОП1. Сон Нап не сброшен — двигали не его.",
        ball: [5, 10],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[5,10], OP2:[7,8], NAP:[5,9] },
          B: { GK:[5,18], Z:[5,14], OP1:[4,13], OP2:[7,13], NAP:[5,11] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: { "B.NAP": 1, "B.OP2": 1 },
        actions: [
          { who: "B.Z", kind: "defend", detail: "Defend F15 (осталось 2 хода A)" },
          { who: "B.OP1", kind: "move", detail: "D14→E14" }
        ],
        roll: null,
        uiLabels: [
          { id: "defend", text: "Defend · 2", spot: "piece B.Z" },
          { id: "focus", text: "B ОП2: Сон 1 (не трогали)" }
        ]
      },
      {
        min: 3, side: "A", score: [0, 0], ap: 2,
        narrative: "A не прёт в щит. Горизонталь на ОП2, пас под край.",
        ball: [7, 11],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[5,10], OP2:[7,11], NAP:[6,10] },
          B: { GK:[5,18], Z:[5,14], OP1:[4,13], OP2:[7,13], NAP:[5,11] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: { "B.NAP": 2, "B.OP2": 2 },
        actions: [
          { who: "A.OP1", kind: "pass", detail: "→ ОП2" },
          { who: "A.OP2", kind: "move", detail: "с мячом H10→H12" }
        ],
        roll: { label: "Пас низом (без давления)", chance: 88, result: "ok", roll: 41 },
        uiLabels: [
          { id: "roll", text: "Пас 88% → 41 успех" },
          { id: "defend", text: "Defend B.Z: осталось 1 ход" }
        ]
      },
      {
        min: 4, side: "B", score: [0, 0], ap: 2,
        narrative: "B снова только З и ОП1. ОП2 и Нап продолжают копиться в Сне — классика «одного пошевелил».",
        ball: [7, 11],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[5,10], OP2:[7,11], NAP:[6,10] },
          B: { GK:[5,18], Z:[5,14], OP1:[5,13], OP2:[7,13], NAP:[5,11] }
        },
        statuses: { "B.Z": { defend: 0 } },
        focus: { "B.NAP": 2, "B.OP2": 2 },
        actions: [
          { who: "B.Z", kind: "move", detail: "держится F15 (Defend сгорел по таймеру)" },
          { who: "B.OP1", kind: "move", detail: "к мячу F14" }
        ],
        roll: null,
        uiLabels: [
          { id: "defend", text: "Defend сгорел (N=2 истекло)" },
          { id: "focus", text: "Сон держится на ОП2 и Нап" }
        ],
        note: "Истечение Defend — честный таймер на щитке, не сюрприз."
      },
      {
        min: 5, side: "A", score: [0, 0], ap: 2,
        narrative: "Пас на Нап A. Дальше — в зону между сонными ОП2 B и линией.",
        ball: [5, 12],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[5,11], OP2:[7,12], NAP:[5,12] },
          B: { GK:[5,18], Z:[5,14], OP1:[5,13], OP2:[7,13], NAP:[5,11] }
        },
        statuses: {},
        focus: { "B.NAP": 2, "B.OP2": 2 },
        actions: [
          { who: "A.OP2", kind: "pass", detail: "→ Нап" },
          { who: "A.NAP", kind: "move", detail: "F11→F13" }
        ],
        roll: { label: "Пас (край ауры ОП1 B = 1)", chance: 72, result: "ok", roll: 55 },
        uiLabels: [{ id: "roll", text: "Пас под аурой 1: 72% → 55" }]
      },
      {
        min: 6, side: "B", score: [0, 0], ap: 2,
        narrative: "B пытается сбросить через ОП2… но у ОП2 Сон 2. Грязный приём.",
        ball: [5, 12],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[5,11], OP2:[7,12], NAP:[5,12] },
          B: { GK:[5,18], Z:[5,14], OP1:[5,13], OP2:[7,13], NAP:[5,11] }
        },
        statuses: {},
        focus: { "B.NAP": 3, "B.OP2": 0 },
        actions: [
          { who: "B.OP2", kind: "receive", detail: "попытка принять под прессингом формы" },
          { who: "B.Z", kind: "move", detail: "F15→F14" }
        ],
        roll: { label: "Приём ОП2 (Сон 2)", chance: 38, result: "fail", roll: 61 },
        uiLabels: [
          { id: "roll", text: "Приём 38% (Сон2) → 61 провал" },
          { id: "ball", text: "Подбор A.NAP" }
        ],
        note: "Ключевой урок Сна: сброс только у того, кто действовал. После фейла ОП2 сбросил Сон действием, но мяч уже потерян."
      },
      {
        min: 7, side: "A", score: [1, 0], ap: 2,
        narrative: "Нап A L2: ход в ударную + удар. Гол.",
        ball: null,
        players: {
          A: { GK:[5,1], Z:[5,8], OP1:[5,12], OP2:[7,13], NAP:[5,16] },
          B: { GK:[5,18], Z:[5,14], OP1:[5,13], OP2:[7,13], NAP:[5,11] }
        },
        statuses: {},
        focus: { "B.NAP": 3 },
        actions: [
          { who: "A.NAP", kind: "move", detail: "F13→F17" },
          { who: "A.NAP", kind: "shot", detail: "удар L2 (2-е действие)" }
        ],
        roll: { label: "Удар (чисто, без Defend)", chance: 64, result: "goal", roll: 22 },
        uiLabels: [
          { id: "roll", text: "Удар 64% → 22 ГОЛ" },
          { id: "score", text: "1 : 0" },
          { id: "banner", text: "GOAL A" }
        ],
        paradigm: "A переключается на удержание преимущества."
      },
      {
        min: 11, side: "B", score: [1, 0], ap: 2,
        narrative: "Смена парадигмы B: оба ОП вверх, Нап наконец двигают — сброс Сна. Прессинг.",
        ball: [5, 9],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[4,8], OP2:[7,8], NAP:[5,9] },
          B: { GK:[5,18], Z:[5,12], OP1:[4,10], OP2:[7,10], NAP:[5,9] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "B.OP1", kind: "press", detail: "высокий выход" },
          { who: "B.NAP", kind: "move", detail: "сброс Сон 3→0" }
        ],
        roll: null,
        uiLabels: [
          { id: "paradigm", text: "B: блок → прессинг" },
          { id: "focus", text: "Сон сброшен действиями" }
        ],
        paradigm: "B больше не ждёт."
      },
      {
        min: 13, side: "B", score: [1, 1], ap: 2,
        narrative: "Отбор на половине A и Нап L2: ход+удар. 1:1.",
        ball: null,
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[3,7], OP2:[8,7], NAP:[5,8] },
          B: { GK:[5,18], Z:[5,11], OP1:[4,8], OP2:[7,8], NAP:[5,3] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "B.NAP", kind: "move", detail: "канал F9→F4" },
          { who: "B.NAP", kind: "shot", detail: "L2 удар" }
        ],
        roll: { label: "Удар контра", chance: 58, result: "goal", roll: 30 },
        uiLabels: [
          { id: "roll", text: "Удар 58% → 30 ГОЛ" },
          { id: "score", text: "1 : 1" }
        ]
      },
      {
        min: 17, side: "A", score: [1, 1], ap: 2,
        narrative: "A ставит видимый Замах на Нап (CD потом 5'). B видит иконку сразу.",
        ball: [6, 14],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[4,11], OP2:[7,12], NAP:[6,14] },
          B: { GK:[5,18], Z:[5,15], OP1:[4,14], OP2:[7,14], NAP:[5,12] }
        },
        statuses: { "A.NAP": { windup: true, windupCdAfter: 5 } },
        focus: {},
        actions: [
          { who: "A.NAP", kind: "move", detail: "в полуфланг" },
          { who: "A.NAP", kind: "windup", detail: "Замах (видно)" }
        ],
        roll: null,
        uiLabels: [
          { id: "windup", text: "Замах A.Нап — открытая стойка", spot: "piece" }
        ]
      },
      {
        min: 18, side: "B", score: [1, 1], ap: 2,
        narrative: "B отвечает Defend в зоне замаха + ОП к линии паса.",
        ball: [6, 14],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[4,11], OP2:[7,12], NAP:[6,14] },
          B: { GK:[5,18], Z:[6,15], OP1:[5,14], OP2:[7,14], NAP:[5,12] }
        },
        statuses: { "A.NAP": { windup: true }, "B.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "B.Z", kind: "defend", detail: "Defend G16" },
          { who: "B.OP1", kind: "move", detail: "режет пас" }
        ],
        roll: null,
        uiLabels: [{ id: "duel", text: "Замах vs Defend — оба видимы" }]
      },
      {
        min: 19, side: "A", score: [1, 1], ap: 2,
        narrative: "Пас под замах в стойку. Бесплатный удар сгорает / низкий %.",
        ball: [6, 14],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[4,11], OP2:[7,12], NAP:[6,14] },
          B: { GK:[5,18], Z:[6,15], OP1:[5,14], OP2:[7,14], NAP:[5,12] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "A.OP2", kind: "pass", detail: "в Нап под Замах" },
          { who: "A.NAP", kind: "shot", detail: "реализация замаха в Defend" }
        ],
        roll: { label: "Удар замаха в Defend", chance: 18, result: "fail", roll: 70 },
        uiLabels: [
          { id: "roll", text: "Замах-удар 18% → 70 блок" },
          { id: "windup", text: "Замах сгорел · CD 5'" }
        ]
      },
      {
        min: 20, side: "end", score: [1, 1],
        narrative: "Свисток среза. 1:1. Оба меняли план; Сон и видимый покер Замах↔Defend отработали без скрытых дебаффов.",
        ball: [5, 9],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[4,8], OP2:[7,8], NAP:[5,9] },
          B: { GK:[5,18], Z:[5,13], OP1:[4,11], OP2:[7,11], NAP:[5,10] }
        },
        statuses: {},
        focus: {},
        actions: [],
        roll: null,
        uiLabels: [{ id: "banner", text: "Итог 1:1 · 20'" }]
      }
    ]
  },

  {
    id: "I",
    theme: "I",
    title: "Контроль → край",
    subtitle: "Мяч и игроки у бровок (колонки A–C / J–L). Замах читают — уход на фланг.",
    scoreFinal: "1:1",
    styles: { A: "Тики-така → правый край", B: "Активный блок → контра левым каналом" },
    uiGlossary: [
      { key: "Аура З", where: "Кольцо 2 клетки", text: "Давление 2 режет % паса в зоне." },
      { key: "Смена плана", where: "Баннер «Парадигма»", text: "Игрок сам бросает тики-така ради края." }
    ],
    steps: [
      {
        min: 0, side: "kick", score: [0, 0],
        narrative: "Kick-off A. Сразу видно: игра по бровкам — OP2 и NAP правее центра, у B левый канал свободнее.",
        ball: [8, 9],
        players: {
          A: { GK:[5,1], Z:[6,4], OP1:[2,7], OP2:[9,7], NAP:[8,8] },
          B: { GK:[5,18], Z:[5,15], OP1:[2,13], OP2:[9,13], NAP:[3,11] }
        },
        statuses: {},
        focus: {},
        actions: [],
        roll: null,
        uiLabels: [{ id: "banner", text: "Kick-off · акцент на фланги" }]
      },
      {
        min: 2, side: "B", score: [0, 0], ap: 2,
        narrative: "B: Defend → на следующем ходу переставит. Нап B пока столбом — Сон растёт.",
        ball: [8, 10],
        players: {
          A: { GK:[5,1], Z:[6,5], OP1:[2,8], OP2:[9,9], NAP:[8,10] },
          B: { GK:[5,18], Z:[7,14], OP1:[3,13], OP2:[9,13], NAP:[3,11] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: { "B.NAP": 1 },
        actions: [
          { who: "B.Z", kind: "defend", detail: "Defend F15" },
          { who: "B.OP1", kind: "move", detail: "сужает канал" }
        ],
        roll: null,
        uiLabels: [
          { id: "defend", text: "Defend · 2" },
          { id: "focus", text: "B Нап Сон1 — хотите чистого снайпера без Сна: качайте параметр позже" }
        ]
      },
      {
        min: 4, side: "A", score: [0, 0], ap: 2,
        narrative: "A рано ставит Замах на F14 — видно. Зона удара ещё далеко.",
        ball: [5, 12],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[4,10], OP2:[7,11], NAP:[5,13] },
          B: { GK:[5,18], Z:[6,14], OP1:[4,13], OP2:[7,13], NAP:[5,11] }
        },
        statuses: { "A.NAP": { windup: true }, "B.Z": { defend: 1 } },
        focus: { "B.NAP": 2 },
        actions: [
          { who: "A.NAP", kind: "move", detail: "F12→F14" },
          { who: "A.NAP", kind: "windup", detail: "Замах (рано)" }
        ],
        roll: null,
        uiLabels: [{ id: "windup", text: "Замах виден — B может готовить ответ" }]
      },
      {
        min: 5, side: "B", score: [0, 0], ap: 2,
        narrative: "B не только Defend: ОП на фланг чтения. Не покупается целиком.",
        ball: [5, 12],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[4,10], OP2:[7,11], NAP:[5,13] },
          B: { GK:[5,18], Z:[5,14], OP1:[4,13], OP2:[8,14], NAP:[5,11] }
        },
        statuses: { "A.NAP": { windup: true } },
        focus: { "B.NAP": 2 },
        actions: [
          { who: "B.Z", kind: "move", detail: "переставил линию" },
          { who: "B.OP2", kind: "move", detail: "закрыл полуфланг" }
        ],
        roll: null,
        uiLabels: [{ id: "paradigm", text: "B: чтение замаха без паники" }]
      },
      {
        min: 6, side: "A", score: [0, 0], ap: 2,
        narrative: "Смена парадигмы A: центр закрыт — все AP в край. Замах сгорает без реализации.",
        ball: [8, 14],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[5,11], OP2:[8,14], NAP:[7,14] },
          B: { GK:[5,18], Z:[5,14], OP1:[4,13], OP2:[8,14], NAP:[5,11] }
        },
        statuses: {},
        focus: { "B.NAP": 3 },
        actions: [
          { who: "A.OP2", kind: "move", detail: "H→ край с мячом" },
          { who: "A.NAP", kind: "move", detail: "тянулся к флангу; замах сгорел" }
        ],
        roll: null,
        uiLabels: [
          { id: "paradigm", text: "A: контроль → край" },
          { id: "windup", text: "Замах сгорел (окно / зона)" }
        ],
        paradigm: "A бросает тики-така."
      },
      {
        min: 7, side: "B", score: [0, 0], ap: 2,
        narrative: "B выносит на Нап с Соном 3 — грязный приём, но удержал и сбросил Сон действием.",
        ball: [5, 10],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[5,11], OP2:[8,13], NAP:[7,13] },
          B: { GK:[5,18], Z:[5,14], OP1:[4,12], OP2:[7,12], NAP:[5,10] }
        },
        statuses: {},
        focus: { "B.NAP": 0 },
        actions: [
          { who: "B.GK", kind: "pass", detail: "вынос" },
          { who: "B.NAP", kind: "receive", detail: "приём при Сон3" }
        ],
        roll: { label: "Приём Нап Сон3", chance: 28, result: "ok", roll: 19 },
        uiLabels: [{ id: "roll", text: "Приём 28% → 19 чудом удержал · Сон сброшен" }]
      },
      {
        min: 11, side: "B", score: [0, 1], ap: 2,
        narrative: "Контра в канал за поднятой линией A. Нап L2 — гол.",
        ball: null,
        players: {
          A: { GK:[5,1], Z:[5,8], OP1:[4,12], OP2:[8,12], NAP:[6,13] },
          B: { GK:[5,18], Z:[5,12], OP1:[3,9], OP2:[7,9], NAP:[5,3] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "B.NAP", kind: "move", detail: "F8→F4" },
          { who: "B.NAP", kind: "shot", detail: "L2" }
        ],
        roll: { label: "Удар контра", chance: 61, result: "goal", roll: 25 },
        uiLabels: [
          { id: "score", text: "0 : 1" },
          { id: "roll", text: "61% → 25 ГОЛ" }
        ],
        paradigm: "B перешёл в контратакующий режим."
      },
      {
        min: 16, side: "A", score: [0, 1], ap: 2,
        narrative: "A: новый Замах после CD 5'. Уже в ударной зоне края.",
        ball: [8, 15],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[4,11], OP2:[8,15], NAP:[7,16] },
          B: { GK:[5,18], Z:[6,15], OP1:[4,13], OP2:[8,14], NAP:[5,11] }
        },
        statuses: { "A.NAP": { windup: true } },
        focus: {},
        actions: [
          { who: "A.OP2", kind: "pass", detail: "под Нап" },
          { who: "A.NAP", kind: "windup", detail: "Замах G17" }
        ],
        roll: { label: "Пас под замах", chance: 70, result: "ok", roll: 40 },
        uiLabels: [{ id: "windup", text: "Замах · CD готов после 5'" }]
      },
      {
        min: 17, side: "B", score: [0, 1], ap: 2,
        narrative: "B снова Defend на замах.",
        ball: [7, 16],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[4,11], OP2:[8,15], NAP:[7,16] },
          B: { GK:[5,18], Z:[7,16], OP1:[5,14], OP2:[8,14], NAP:[5,11] }
        },
        statuses: { "A.NAP": { windup: true }, "B.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "B.Z", kind: "defend", detail: "на клетке замаха" },
          { who: "B.OP1", kind: "move", detail: "страховка" }
        ],
        roll: null,
        uiLabels: [{ id: "duel", text: "Снова Замах vs Defend" }]
      },
      {
        min: 18, side: "A", score: [1, 1], ap: 2,
        narrative: "Обход: не бьём в щит — скидываем ОП2, тот возвращает, обычный L2 удар с угла.",
        ball: null,
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[5,12], OP2:[9,16], NAP:[8,17] },
          B: { GK:[5,18], Z:[7,16], OP1:[5,14], OP2:[8,14], NAP:[5,11] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "A.NAP", kind: "pass", detail: "скидка с замаха на ОП2 (замах сгорел ради схемы)" },
          { who: "A.NAP", kind: "shot", detail: "после возврата — обычный удар" }
        ],
        roll: { label: "Удар с угла в обход Defend", chance: 47, result: "goal", roll: 33 },
        uiLabels: [
          { id: "score", text: "1 : 1" },
          { id: "roll", text: "47% → 33 ГОЛ" },
          { id: "tip", text: "Лобовой замах в Defend слаб; обход — сильнее" }
        ]
      },
      {
        min: 20, side: "end", score: [1, 1],
        narrative: "1:1. Видимый замах создал покер; победил не скрытый бафф, а смена плана на край и обход стойки.",
        ball: [5, 10],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[4,8], OP2:[7,8], NAP:[5,9] },
          B: { GK:[5,18], Z:[5,14], OP1:[4,12], OP2:[7,12], NAP:[5,11] }
        },
        statuses: {},
        focus: {},
        actions: [],
        roll: null,
        uiLabels: [{ id: "banner", text: "Итог 1:1" }]
      }
    ]
  },

  {
    id: "J",
    theme: "J",
    title: "Пресс → блок лидера",
    subtitle: "A сразу высоко (ряды 10–15). После 1:0 садится в свою треть. B лезет.",
    scoreFinal: "2:0",
    styles: { A: "Высокий пресс → автобус", B: "Низкий блок → вынужденный риск" },
    uiGlossary: [
      { key: "CD Замах", where: "Таймер на бейдже", text: "Сильные скиллы всегда с cooldown." },
      { key: "Аура ОП", where: "Кольцо 1", text: "Прессинг двумя ОП режет чужой вынос." }
    ],
    steps: [
      {
        min: 0, side: "kick", score: [0, 0],
        narrative: "A сразу высокий прессинг — линия уже у центрального круга. B сидит низко у своих ворот.",
        ball: [5, 12],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[3,11], OP2:[7,11], NAP:[5,12] },
          B: { GK:[5,18], Z:[5,16], OP1:[3,15], OP2:[7,15], NAP:[5,14] }
        },
        statuses: {},
        focus: {},
        actions: [],
        roll: null,
        uiLabels: [{ id: "banner", text: "Прессинг A · линия высоко" }]
      },
      {
        min: 3, side: "A", score: [0, 0], ap: 2,
        narrative: "Два ОП в ауре 1 на разыгрывающего B. Нап B бездействует — Сон.",
        ball: [5, 15],
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[4,14], OP2:[6,14], NAP:[5,13] },
          B: { GK:[5,18], Z:[5,16], OP1:[5,15], OP2:[7,14], NAP:[5,14] }
        },
        statuses: {},
        focus: { "B.NAP": 1 },
        actions: [
          { who: "A.OP1", kind: "press", detail: "аура 1" },
          { who: "A.OP2", kind: "press", detail: "аура 1" }
        ],
        roll: null,
        uiLabels: [
          { id: "aura", text: "Давление ОП×2 на клетках вокруг мяча" },
          { id: "focus", text: "B Нап Сон1" }
        ]
      },
      {
        min: 4, side: "B", score: [0, 0], ap: 2,
        narrative: "Вынос под двойной аурой — срыв. Мяч у A.",
        ball: [5, 13],
        players: {
          A: { GK:[5,1], Z:[5,8], OP1:[4,13], OP2:[6,13], NAP:[5,12] },
          B: { GK:[5,18], Z:[5,15], OP1:[5,14], OP2:[7,13], NAP:[5,11] }
        },
        statuses: {},
        focus: { "B.NAP": 2 },
        actions: [{ who: "B.OP1", kind: "pass", detail: "вынос вперёд" }],
        roll: { label: "Пас под 2×аурой ОП", chance: 34, result: "fail", roll: 71 },
        uiLabels: [{ id: "roll", text: "Пас 34% → 71 перехват A" }]
      },
      {
        min: 8, side: "A", score: [1, 0], ap: 2,
        narrative: "Нап L2 ход+удар после серии потерь B. 1:0.",
        ball: null,
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[4,14], OP2:[7,14], NAP:[5,16] },
          B: { GK:[5,18], Z:[5,15], OP1:[4,13], OP2:[7,13], NAP:[5,11] }
        },
        statuses: {},
        focus: { "B.NAP": 3 },
        actions: [
          { who: "A.NAP", kind: "move", detail: "в ударную" },
          { who: "A.NAP", kind: "shot", detail: "L2" }
        ],
        roll: { label: "Удар", chance: 60, result: "goal", roll: 18 },
        uiLabels: [
          { id: "score", text: "1 : 0" },
          { id: "roll", text: "60% → 18 ГОЛ" }
        ]
      },
      {
        min: 9, side: "A", score: [1, 0], ap: 2,
        narrative: "Смена парадигмы A: пресс выключен, З Defend у своей трети, ОП откат.",
        ball: [5, 9],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[3,6], OP2:[7,6], NAP:[5,8] },
          B: { GK:[5,18], Z:[5,14], OP1:[4,12], OP2:[7,12], NAP:[5,10] }
        },
        statuses: { "A.Z": { defend: 2 } },
        focus: { "B.NAP": 0 },
        actions: [
          { who: "A.Z", kind: "defend", detail: "автобус F6" },
          { who: "A.OP1", kind: "move", detail: "откат" }
        ],
        roll: null,
        uiLabels: [
          { id: "paradigm", text: "A: пресс → блок лидера" },
          { id: "defend", text: "Defend · 2 — не до конца матча" }
        ],
        paradigm: "A защищает счёт. B обязан рискнуть — иначе ничья в полном матче, здесь срез продолжается."
      },
      {
        min: 13, side: "B", score: [1, 0], ap: 2,
        narrative: "B раскрылся и ставит Замах — видно. A уже ждёт.",
        ball: [5, 15],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[4,7], OP2:[7,7], NAP:[5,8] },
          B: { GK:[5,18], Z:[5,12], OP1:[4,14], OP2:[7,14], NAP:[5,15] }
        },
        statuses: { "A.Z": { defend: 1 }, "B.NAP": { windup: true } },
        focus: {},
        actions: [
          { who: "B.NAP", kind: "move", detail: "в зону" },
          { who: "B.NAP", kind: "windup", detail: "Замах" }
        ],
        roll: null,
        uiLabels: [{ id: "windup", text: "Замах B виден" }]
      },
      {
        min: 14, side: "A", score: [1, 0], ap: 2,
        narrative: "A: Defend на клетку замаха + второй AP ОП к мячу.",
        ball: [5, 15],
        players: {
          A: { GK:[5,1], Z:[5,14], OP1:[5,13], OP2:[7,8], NAP:[5,8] },
          B: { GK:[5,18], Z:[5,12], OP1:[4,14], OP2:[7,14], NAP:[5,15] }
        },
        statuses: { "A.Z": { defend: 2 }, "B.NAP": { windup: true } },
        focus: {},
        actions: [
          { who: "A.Z", kind: "defend", detail: "на замахе" },
          { who: "A.OP1", kind: "move", detail: "к мячу" }
        ],
        roll: null,
        uiLabels: [{ id: "duel", text: "Открытый ответ на Замах" }]
      },
      {
        min: 15, side: "B", score: [1, 0], ap: 2,
        narrative: "Реализация замаха в щит — провал. Честный низкий %.",
        ball: [5, 14],
        players: {
          A: { GK:[5,1], Z:[5,14], OP1:[5,13], OP2:[7,8], NAP:[5,8] },
          B: { GK:[5,18], Z:[5,12], OP1:[4,14], OP2:[7,14], NAP:[5,15] }
        },
        statuses: { "A.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "B.OP1", kind: "pass", detail: "в Нап" },
          { who: "B.NAP", kind: "shot", detail: "замах-удар" }
        ],
        roll: { label: "Замах в Defend", chance: 16, result: "fail", roll: 82 },
        uiLabels: [
          { id: "roll", text: "16% → 82 мимо" },
          { id: "windup", text: "Замах сгорел · CD 5'" }
        ]
      },
      {
        min: 19, side: "A", score: [1, 0], ap: 2,
        narrative: "Контра: A ставит Замах (свой CD готов) на уходе.",
        ball: [5, 14],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[4,11], OP2:[7,11], NAP:[5,14] },
          B: { GK:[5,18], Z:[5,12], OP1:[3,10], OP2:[8,10], NAP:[5,9] }
        },
        statuses: { "A.NAP": { windup: true } },
        focus: { "B.OP1": 1, "B.OP2": 1 },
        actions: [
          { who: "A.OP2", kind: "pass", detail: "в Нап" },
          { who: "A.NAP", kind: "windup", detail: "Замах" }
        ],
        roll: { label: "Пас в контратаку", chance: 75, result: "ok", roll: 50 },
        uiLabels: [{ id: "windup", text: "Замах A · B ОП в Сне после раскрытия" }]
      },
      {
        min: 20, side: "A", score: [2, 0], ap: 2,
        narrative: "Пас в зону + реализация замаха. 2:0. Свисток.",
        ball: null,
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[4,12], OP2:[7,12], NAP:[5,17] },
          B: { GK:[5,18], Z:[5,14], OP1:[3,11], OP2:[8,11], NAP:[5,10] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "A.OP1", kind: "pass", detail: "под замах" },
          { who: "A.NAP", kind: "shot", detail: "замах-удар" }
        ],
        roll: { label: "Замах чистый", chance: 55, result: "goal", roll: 21 },
        uiLabels: [
          { id: "score", text: "2 : 0" },
          { id: "roll", text: "55% → 21 ГОЛ" },
          { id: "banner", text: "Итог 2:0" }
        ]
      }
    ]
  }
];
