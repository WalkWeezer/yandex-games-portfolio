/**
 * Pitch Tactics — coherent hex match replays (Freeze v1)
 * Rules baked into scripts:
 * - max move 6 hexes / action
 * - Z pressure r=2, OP r=1, NAP r=0 — нельзя «пройти сквозь» без срыва/%
 * - удар только из ударной зоны (к воротам B: row>=16; к воротам A: row<=3)
 * - гол = мяч улетает в гекс ворот, не абстрактная надпись
 * Coords: [col 0-11, row 0-19], A атакует +row (к 19), B атакует -row (к 0)
 */
window.PITCH_TACTICS_MATCHES = [
  {
    id: "H",
    theme: "H",
    title: "Блок → прессинг",
    subtitle: "Оба низко. Сквозь ауру З не лезем — обход краем. Гол с 17-го ряда.",
    scoreFinal: "1:1",
    styles: { A: "Терпеливый низкий блок + правый край", B: "То же → после 0:1 высокий пресс" },
    uiGlossary: [
      { key: "Аура З", where: "Оранжевые гексы", text: "Радиус 2. Пас/пронос внутрь = низкий %." },
      { key: "Ударная зона", where: "Ряды 16–18", text: "Удар легален только отсюда (к воротам B)." },
      { key: "Гол", where: "Мяч в гексе ворот", text: "Видно, как мяч залетел, не только текст." }
    ],
    steps: [
      {
        min: 0, side: "kick", score: [0, 0],
        narrative: "Kick-off. Обе команды компактно у своих третей — законный «от обороны».",
        ball: [5, 9],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[3,5], OP2:[7,5], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,15], OP1:[3,14], OP2:[7,14], NAP:[5,12] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "banner", text: "Kick-off · оба низко" }]
      },
      {
        min: 1, side: "A", score: [0, 0], ap: 2,
        narrative: "A: короткий розыгрыш у своей половины. Не прём в центр.",
        ball: [7, 6],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[4,6], OP2:[7,6], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,15], OP1:[3,14], OP2:[7,14], NAP:[5,12] }
        },
        statuses: {}, focus: { "B.NAP": 1 },
        actions: [
          { who: "A.OP1", kind: "pass", detail: "низом → ОП2" },
          { who: "A.OP2", kind: "move", detail: "принял на H7" }
        ],
        roll: { label: "Пас без давления", chance: 92, result: "ok", roll: 40 },
        uiLabels: [{ id: "roll", text: "Пас 92% → ок" }]
      },
      {
        min: 2, side: "B", score: [0, 0], ap: 2,
        narrative: "B ставит Defend на З и чуть сужает канал. Нап B бездействует → Сон.",
        ball: [7, 6],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[4,6], OP2:[7,6], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,15], OP1:[4,14], OP2:[7,14], NAP:[5,12] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: { "B.NAP": 1, "B.OP2": 1 },
        actions: [
          { who: "B.Z", kind: "defend", detail: "Defend F16" },
          { who: "B.OP1", kind: "move", detail: "E15" }
        ],
        roll: null,
        uiLabels: [{ id: "defend", text: "Defend · 2" }]
      },
      {
        min: 3, side: "A", score: [0, 0], ap: 2,
        narrative: "A пробует вертикаль в Нап — линия входит в ауру З B (r=2). Срыв.",
        ball: [5, 6],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[4,6], OP2:[7,6], NAP:[5,8] },
          B: { GK:[5,18], Z:[5,15], OP1:[4,14], OP2:[7,14], NAP:[5,12] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: { "B.NAP": 2, "B.OP2": 2 },
        actions: [
          { who: "A.OP2", kind: "pass", detail: "в Нап через центр" },
          { who: "A.OP1", kind: "move", detail: "подбор после срыва" }
        ],
        roll: { label: "Пас в ауру З (r=2)", chance: 28, result: "fail", roll: 71 },
        uiLabels: [{ id: "roll", text: "28% → срыв · мяч остаётся у A после отскока" }],
        note: "Не «прошёл сквозь защиту» — пас в ауру закономерно умер."
      },
      {
        min: 4, side: "B", score: [0, 0], ap: 2,
        narrative: "B не прессит высоко — только переставил Defend. ОП2 всё ещё в Сне.",
        ball: [5, 6],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[4,6], OP2:[7,6], NAP:[5,8] },
          B: { GK:[5,18], Z:[6,15], OP1:[4,14], OP2:[7,14], NAP:[5,12] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: { "B.NAP": 2, "B.OP2": 2 },
        actions: [
          { who: "B.Z", kind: "defend", detail: "переставил на G16" },
          { who: "B.OP1", kind: "move", detail: "держит середину" }
        ],
        roll: null,
        uiLabels: [{ id: "focus", text: "Сон на Нап и ОП2 B — их не трогали" }]
      },
      {
        min: 5, side: "A", score: [0, 0], ap: 2,
        narrative: "Обход: не в щит, а на правый край — вне ауры З.",
        ball: [9, 8],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[5,6], OP2:[9,8], NAP:[7,8] },
          B: { GK:[5,18], Z:[6,15], OP1:[4,14], OP2:[7,14], NAP:[5,12] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: { "B.NAP": 3, "B.OP2": 3 },
        actions: [
          { who: "A.OP1", kind: "pass", detail: "диагональ на ОП2 край" },
          { who: "A.OP2", kind: "move", detail: "J9 с мячом" }
        ],
        roll: { label: "Пас в свободный край", chance: 78, result: "ok", roll: 22 },
        uiLabels: [{ id: "paradigm", text: "A: центр закрыт → край" }]
      },
      {
        min: 6, side: "B", score: [0, 0], ap: 2,
        narrative: "B тянет ОП2 к флангу (сброс Сна) и З смещается. Поздно для края.",
        ball: [9, 8],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[5,6], OP2:[9,8], NAP:[7,8] },
          B: { GK:[5,18], Z:[7,15], OP1:[5,13], OP2:[9,13], NAP:[5,12] }
        },
        statuses: {},
        focus: { "B.NAP": 3 },
        actions: [
          { who: "B.OP2", kind: "move", detail: "вышел на фланг · Сон сброшен" },
          { who: "B.Z", kind: "move", detail: "сместился к краю" }
        ],
        roll: null,
        uiLabels: [{ id: "focus", text: "Нап B всё ещё Z3" }]
      },
      {
        min: 7, side: "A", score: [0, 0], ap: 2,
        narrative: "Прогресс по краю: ОП2 → Нап уже на 11-м ряду, всё ещё вне ударной зоны.",
        ball: [8, 11],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[6,8], OP2:[9,10], NAP:[8,11] },
          B: { GK:[5,18], Z:[7,15], OP1:[5,13], OP2:[9,13], NAP:[5,12] }
        },
        statuses: {},
        focus: { "B.NAP": 3 },
        actions: [
          { who: "A.OP2", kind: "pass", detail: "в Нап вдоль бровки" },
          { who: "A.NAP", kind: "move", detail: "I12" }
        ],
        roll: { label: "Пас по краю (далеко от З)", chance: 74, result: "ok", roll: 51 },
        uiLabels: [{ id: "tip", text: "До удара ещё далеко — ряд 11" }]
      },
      {
        min: 8, side: "B", score: [0, 0], ap: 2,
        narrative: "B наконец двигает Нап (сброс Сна) и ставит Defend на полуфланге.",
        ball: [8, 11],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[6,8], OP2:[9,10], NAP:[8,11] },
          B: { GK:[5,18], Z:[8,14], OP1:[6,13], OP2:[9,13], NAP:[6,12] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "B.NAP", kind: "move", detail: "вернулся в игру · Сон 0" },
          { who: "B.Z", kind: "defend", detail: "Defend I15" }
        ],
        roll: null,
        uiLabels: [{ id: "defend", text: "Defend на пути навеса" }]
      },
      {
        min: 9, side: "A", score: [0, 0], ap: 2,
        narrative: "Не в Defend. Нап откатывает мяч, ОП2 заходит ещё выше по краю.",
        ball: [10, 13],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[6,9], OP2:[10,13], NAP:[8,12] },
          B: { GK:[5,18], Z:[8,14], OP1:[6,13], OP2:[9,13], NAP:[6,12] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "A.NAP", kind: "pass", detail: "назад-вбок ОП2" },
          { who: "A.OP2", kind: "move", detail: "K14 — уже почти ударная" }
        ],
        roll: { label: "Безопасный пас от стойки", chance: 80, result: "ok", roll: 12 },
        uiLabels: [{ id: "tip", text: "Обход стойки, не лобовой пронос" }]
      },
      {
        min: 10, side: "B", score: [0, 0], ap: 2,
        narrative: "B срывает Defend и догоняет край — аура З теперь накрывает K14.",
        ball: [10, 13],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[6,9], OP2:[10,13], NAP:[8,12] },
          B: { GK:[5,18], Z:[9,14], OP1:[7,13], OP2:[9,12], NAP:[6,12] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "B.Z", kind: "move", detail: "J15 · аура на край" },
          { who: "B.OP2", kind: "move", detail: "поджал" }
        ],
        roll: null,
        uiLabels: [{ id: "aura", text: "ОП2 A под давлением З+ОП" }]
      },
      {
        min: 11, side: "A", score: [0, 0], ap: 2,
        narrative: "Под давлением не прём. Скидка внутрь на Нап в ряд 16 — ударная зона, но угол острый.",
        ball: [7, 16],
        players: {
          A: { GK:[5,1], Z:[5,8], OP1:[6,11], OP2:[9,14], NAP:[7,16] },
          B: { GK:[5,18], Z:[9,14], OP1:[7,13], OP2:[9,12], NAP:[6,12] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "A.OP2", kind: "pass", detail: "прострел/скидка в штрафную" },
          { who: "A.NAP", kind: "move", detail: "H17 · ряд 16+" }
        ],
        roll: { label: "Скидка под аурой ОП", chance: 52, result: "ok", roll: 44 },
        uiLabels: [{ id: "tip", text: "Наконец ударная зона (row 16)" }]
      },
      {
        min: 12, side: "B", score: [0, 0], ap: 2,
        narrative: "ВР B выходит, З пытается закрыть. Нап A уже в зоне удара.",
        ball: [7, 16],
        players: {
          A: { GK:[5,1], Z:[5,8], OP1:[6,11], OP2:[9,14], NAP:[7,16] },
          B: { GK:[6,17], Z:[8,15], OP1:[7,14], OP2:[9,12], NAP:[6,12] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "B.GK", kind: "move", detail: "выход G18" },
          { who: "B.Z", kind: "move", detail: "закрывает" }
        ],
        roll: null,
        uiLabels: [{ id: "banner", text: "Ударный момент" }]
      },
      {
        min: 13, side: "A", score: [1, 0], ap: 2,
        narrative: "Удар с H17. Мяч в створ ворот B (гекс F20).",
        ball: [5, 19],
        shotFrom: [7, 16],
        goalTo: [5, 19],
        players: {
          A: { GK:[5,1], Z:[5,8], OP1:[6,11], OP2:[9,14], NAP:[7,16] },
          B: { GK:[6,17], Z:[8,15], OP1:[7,14], OP2:[9,12], NAP:[6,12] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "A.NAP", kind: "shot", detail: "удар с H17" },
          { who: "A.OP1", kind: "move", detail: "на подбор" }
        ],
        roll: { label: "Удар из зоны (ВР вышел)", chance: 48, result: "goal", roll: 31 },
        uiLabels: [{ id: "banner", text: "ГОЛ A · мяч в воротах" }],
        paradigm: "A забил — будет держать."
      },
      {
        min: 14, side: "kick", score: [1, 0],
        narrative: "Снова центр. B меняет план: высокий пресс, иначе 0:1 до конца среза.",
        ball: [5, 9],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[3,6], OP2:[7,6], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,12], OP1:[3,10], OP2:[7,10], NAP:[5,9] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "paradigm", text: "B: блок → прессинг" }],
        paradigm: "B раскрывается."
      },
      {
        min: 15, side: "B", score: [1, 0], ap: 2,
        narrative: "Прессинг двумя ОП на разыгрывающего A.",
        ball: [5, 6],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[4,6], OP2:[7,6], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,11], OP1:[4,7], OP2:[6,7], NAP:[5,9] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "B.OP1", kind: "press", detail: "аура на OP1 A" },
          { who: "B.OP2", kind: "press", detail: "аура" }
        ],
        roll: null,
        uiLabels: [{ id: "aura", text: "Двойной прессинг ОП" }]
      },
      {
        min: 16, side: "A", score: [1, 0], ap: 2,
        narrative: "Вынос под прессингом — срыв. Подбор B.",
        ball: [5, 7],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[4,6], OP2:[7,6], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,11], OP1:[4,7], OP2:[6,7], NAP:[5,9] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "A.OP1", kind: "pass", detail: "вынос вперёд" },
          { who: "A.Z", kind: "move", detail: "страховка" }
        ],
        roll: { label: "Вынос под 2×ОП", chance: 36, result: "fail", roll: 80 },
        uiLabels: [{ id: "roll", text: "36% → потеря" }]
      },
      {
        min: 17, side: "B", score: [1, 0], ap: 2,
        narrative: "B быстро вперёд: пас Нап на ряд 4 — ещё не удар, но близко.",
        ball: [5, 4],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[3,6], OP2:[7,6], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,10], OP1:[4,6], OP2:[6,6], NAP:[5,4] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "B.OP1", kind: "pass", detail: "в Нап" },
          { who: "B.NAP", kind: "move", detail: "F5" }
        ],
        roll: { label: "Пас в контратаку", chance: 70, result: "ok", roll: 20 },
        uiLabels: [{ id: "tip", text: "Ударная зона B: row≤3" }]
      },
      {
        min: 18, side: "A", score: [1, 0], ap: 2,
        narrative: "A ставит Defend на пути и возвращает З.",
        ball: [5, 4],
        players: {
          A: { GK:[5,1], Z:[5,3], OP1:[4,5], OP2:[7,5], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,10], OP1:[4,6], OP2:[6,6], NAP:[5,4] }
        },
        statuses: { "A.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "A.Z", kind: "defend", detail: "Defend F4" },
          { who: "A.OP1", kind: "move", detail: "поджал" }
        ],
        roll: null,
        uiLabels: [{ id: "defend", text: "Defend на контратаке" }]
      },
      {
        min: 19, side: "B", score: [1, 1], ap: 2,
        narrative: "Не в щит. Смещение на полгекса вбок + удар с E3 (ударная зона).",
        ball: [5, 0],
        shotFrom: [4, 2],
        goalTo: [5, 0],
        players: {
          A: { GK:[5,1], Z:[5,3], OP1:[4,5], OP2:[7,5], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,10], OP1:[4,6], OP2:[6,6], NAP:[4,2] }
        },
        statuses: { "A.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "B.NAP", kind: "move", detail: "ушёл с Defend на E3" },
          { who: "B.NAP", kind: "shot", detail: "удар L2 с E3" }
        ],
        roll: { label: "Удар с угла после обхода Defend", chance: 41, result: "goal", roll: 27 },
        uiLabels: [{ id: "banner", text: "ГОЛ B · мяч в воротах A" }]
      },
      {
        min: 20, side: "end", score: [1, 1],
        narrative: "Свисток. 1:1. Оба гола — из ударной зоны после обхода, не из центра.",
        ball: [5, 9],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[3,6], OP2:[7,6], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,15], OP1:[3,14], OP2:[7,14], NAP:[5,12] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "banner", text: "Итог 1:1" }]
      }
    ]
  },

  {
    id: "I",
    theme: "I",
    title: "Контроль → край",
    subtitle: "Тики-така упирается в Defend. Гол только после прострела с бровки в ряд 17.",
    scoreFinal: "1:1",
    styles: { A: "Контроль → правый край", B: "Активный блок → контра левым краем" },
    uiGlossary: [
      { key: "Замах", where: "⚡ на фишке", text: "Виден. Лобовой удар в Defend — низкий %." },
      { key: "Прострел", where: "Пас с края в штрафную", text: "Способ зайти в ударную зону без дриблинга сквозь З." }
    ],
    steps: [
      {
        min: 0, side: "kick", score: [0, 0],
        narrative: "Стартовые позиции уже «фланговые»: A правее, B держит левый канал.",
        ball: [7, 9],
        players: {
          A: { GK:[5,1], Z:[6,4], OP1:[3,6], OP2:[8,6], NAP:[7,8] },
          B: { GK:[5,18], Z:[5,15], OP1:[2,13], OP2:[7,14], NAP:[3,12] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "banner", text: "Kick-off · фланговый рисунок" }]
      },
      {
        min: 1, side: "A", score: [0, 0], ap: 2,
        narrative: "Короткий контроль OP1↔OP2 без вертикали.",
        ball: [8, 7],
        players: {
          A: { GK:[5,1], Z:[6,4], OP1:[4,7], OP2:[8,7], NAP:[7,8] },
          B: { GK:[5,18], Z:[5,15], OP1:[2,13], OP2:[7,14], NAP:[3,12] }
        },
        statuses: {}, focus: { "B.NAP": 1 },
        actions: [
          { who: "A.OP1", kind: "pass", detail: "→ ОП2" },
          { who: "A.OP2", kind: "move", detail: "принял" }
        ],
        roll: { label: "Пас", chance: 90, result: "ok", roll: 10 },
        uiLabels: []
      },
      {
        min: 2, side: "B", score: [0, 0], ap: 2,
        narrative: "B: Defend в центре + OP поджимает. Нап столбом → Сон.",
        ball: [8, 7],
        players: {
          A: { GK:[5,1], Z:[6,4], OP1:[4,7], OP2:[8,7], NAP:[7,8] },
          B: { GK:[5,18], Z:[5,14], OP1:[4,13], OP2:[7,14], NAP:[3,12] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: { "B.NAP": 1 },
        actions: [
          { who: "B.Z", kind: "defend", detail: "Defend F15" },
          { who: "B.OP1", kind: "move", detail: "к центру" }
        ],
        roll: null,
        uiLabels: [{ id: "defend", text: "Defend центр" }]
      },
      {
        min: 3, side: "A", score: [0, 0], ap: 2,
        narrative: "Замах на Нап у F12 — рано и почти в ауру. Видно.",
        ball: [6, 11],
        players: {
          A: { GK:[5,1], Z:[6,5], OP1:[5,8], OP2:[8,9], NAP:[6,11] },
          B: { GK:[5,18], Z:[5,14], OP1:[4,13], OP2:[7,14], NAP:[3,12] }
        },
        statuses: { "A.NAP": { windup: true }, "B.Z": { defend: 1 } },
        focus: { "B.NAP": 2 },
        actions: [
          { who: "A.OP2", kind: "pass", detail: "внутрь Нап" },
          { who: "A.NAP", kind: "windup", detail: "Замах (рано)" }
        ],
        roll: { label: "Пас под OP B", chance: 68, result: "ok", roll: 50 },
        uiLabels: [{ id: "windup", text: "Замах виден" }]
      },
      {
        min: 4, side: "B", score: [0, 0], ap: 2,
        narrative: "B не паникует: Defend на замах + крайний OP.",
        ball: [6, 11],
        players: {
          A: { GK:[5,1], Z:[6,5], OP1:[5,8], OP2:[8,9], NAP:[6,11] },
          B: { GK:[5,18], Z:[6,13], OP1:[5,12], OP2:[8,13], NAP:[3,12] }
        },
        statuses: { "A.NAP": { windup: true }, "B.Z": { defend: 2 } },
        focus: { "B.NAP": 2 },
        actions: [
          { who: "B.Z", kind: "defend", detail: "на клетке замаха" },
          { who: "B.OP2", kind: "move", detail: "отрезал край" }
        ],
        roll: null,
        uiLabels: [{ id: "duel", text: "Замах vs Defend" }]
      },
      {
        min: 5, side: "A", score: [0, 0], ap: 2,
        narrative: "Лобовой замах-удар в Defend — закономерно мимо. Замах сгорел.",
        ball: [6, 11],
        players: {
          A: { GK:[5,1], Z:[6,5], OP1:[5,8], OP2:[8,9], NAP:[6,11] },
          B: { GK:[5,18], Z:[6,13], OP1:[5,12], OP2:[8,13], NAP:[3,12] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: { "B.NAP": 3 },
        actions: [
          { who: "A.OP1", kind: "pass", detail: "под замах" },
          { who: "A.NAP", kind: "shot", detail: "замах в Defend" }
        ],
        roll: { label: "Замах-удар в Defend с row 11", chance: 14, result: "fail", roll: 77 },
        uiLabels: [
          { id: "roll", text: "14% → блок" },
          { id: "tip", text: "Даже без Defend удар с row 11 вне зоны" }
        ],
        note: "Показываем ошибку: и рано, и в стойку."
      },
      {
        min: 6, side: "B", score: [0, 0], ap: 2,
        narrative: "Подбор З → вынос на Нап с Соном. Грязный приём, но удержал.",
        ball: [3, 10],
        players: {
          A: { GK:[5,1], Z:[6,5], OP1:[5,8], OP2:[8,9], NAP:[6,11] },
          B: { GK:[5,18], Z:[6,13], OP1:[4,11], OP2:[8,13], NAP:[3,10] }
        },
        statuses: {},
        focus: { "B.NAP": 0 },
        actions: [
          { who: "B.Z", kind: "pass", detail: "вынос на Нап" },
          { who: "B.NAP", kind: "receive", detail: "приём при Сон3" }
        ],
        roll: { label: "Приём Сон3", chance: 30, result: "ok", roll: 18 },
        uiLabels: [{ id: "roll", text: "30% → чудом · Сон сброшен" }]
      },
      {
        min: 7, side: "A", score: [0, 0], ap: 2,
        narrative: "A возвращается — не даём контратаке дойти до ударной зоны.",
        ball: [3, 10],
        players: {
          A: { GK:[5,1], Z:[4,6], OP1:[3,8], OP2:[7,8], NAP:[5,9] },
          B: { GK:[5,18], Z:[6,13], OP1:[4,11], OP2:[8,13], NAP:[3,10] }
        },
        statuses: { "A.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "A.Z", kind: "defend", detail: "на пути контра" },
          { who: "A.OP1", kind: "move", detail: "поджал Нап B" }
        ],
        roll: null,
        uiLabels: [{ id: "defend", text: "A гасит контратаку" }]
      },
      {
        min: 8, side: "B", score: [0, 0], ap: 2,
        narrative: "B не прёт в Defend — скидка назад. Атака сброшена.",
        ball: [4, 12],
        players: {
          A: { GK:[5,1], Z:[4,6], OP1:[3,8], OP2:[7,8], NAP:[5,9] },
          B: { GK:[5,18], Z:[5,14], OP1:[4,12], OP2:[7,13], NAP:[3,11] }
        },
        statuses: { "A.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "B.NAP", kind: "pass", detail: "назад OP1" },
          { who: "B.OP1", kind: "move", detail: "принял" }
        ],
        roll: { label: "Пас назад", chance: 88, result: "ok", roll: 5 },
        uiLabels: []
      },
      {
        min: 9, side: "A", score: [0, 0], ap: 2,
        narrative: "Смена плана: весь темп на правый край, без замаха.",
        ball: [10, 10],
        players: {
          A: { GK:[5,1], Z:[6,5], OP1:[6,8], OP2:[10,10], NAP:[8,10] },
          B: { GK:[5,18], Z:[5,14], OP1:[4,12], OP2:[7,13], NAP:[3,11] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "A.OP1", kind: "pass", detail: "длинный на край" },
          { who: "A.OP2", kind: "move", detail: "K11" }
        ],
        roll: { label: "Смена фланга", chance: 72, result: "ok", roll: 40 },
        uiLabels: [{ id: "paradigm", text: "A: контроль → край" }],
        paradigm: "A уходит на бровку."
      },
      {
        min: 10, side: "B", score: [0, 0], ap: 2,
        narrative: "B смещает блок к правому краю A.",
        ball: [10, 10],
        players: {
          A: { GK:[5,1], Z:[6,5], OP1:[6,8], OP2:[10,10], NAP:[8,10] },
          B: { GK:[5,18], Z:[8,14], OP1:[6,12], OP2:[10,13], NAP:[4,11] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "B.Z", kind: "move", detail: "к флангу" },
          { who: "B.OP2", kind: "move", detail: "K14" }
        ],
        roll: null,
        uiLabels: []
      },
      {
        min: 11, side: "A", score: [0, 0], ap: 2,
        narrative: "Вверх по бровке: ещё не удар, но готовим прострел.",
        ball: [10, 14],
        players: {
          A: { GK:[5,1], Z:[6,6], OP1:[7,10], OP2:[10,14], NAP:[8,13] },
          B: { GK:[5,18], Z:[8,14], OP1:[6,12], OP2:[10,13], NAP:[4,11] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "A.OP2", kind: "move", detail: "K15 с мячом" },
          { who: "A.NAP", kind: "move", detail: "открылся под прострел I14" }
        ],
        roll: null,
        uiLabels: [{ id: "tip", text: "Цель — прострел в row 16–17" }]
      },
      {
        min: 12, side: "B", score: [0, 0], ap: 2,
        narrative: "З B в ауре на прострельную линию. OP2 жмёт край.",
        ball: [10, 14],
        players: {
          A: { GK:[5,1], Z:[6,6], OP1:[7,10], OP2:[10,14], NAP:[8,13] },
          B: { GK:[5,18], Z:[8,15], OP1:[7,13], OP2:[10,14], NAP:[4,11] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "B.OP2", kind: "move", detail: "контакт на краю" },
          { who: "B.Z", kind: "defend", detail: "режет прострел" }
        ],
        roll: null,
        uiLabels: [{ id: "defend", text: "Defend на линии прострела" }]
      },
      {
        min: 13, side: "A", score: [0, 0], ap: 2,
        narrative: "Не в стойку: пас назад, смена угла — Нап забегает за спину Defend на H17.",
        ball: [7, 16],
        players: {
          A: { GK:[5,1], Z:[6,7], OP1:[8,12], OP2:[9,14], NAP:[7,16] },
          B: { GK:[5,18], Z:[8,15], OP1:[7,13], OP2:[10,14], NAP:[4,11] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "A.OP2", kind: "pass", detail: "за спину стойки" },
          { who: "A.NAP", kind: "move", detail: "H17 ударная зона" }
        ],
        roll: { label: "Пас за Defend", chance: 46, result: "ok", roll: 39 },
        uiLabels: [{ id: "roll", text: "46% → прошёл" }]
      },
      {
        min: 14, side: "B", score: [0, 0], ap: 2,
        narrative: "ВР и З пытаются накрыть — поздно для идеального угла, но ещё есть шанс сейва.",
        ball: [7, 16],
        players: {
          A: { GK:[5,1], Z:[6,7], OP1:[8,12], OP2:[9,14], NAP:[7,16] },
          B: { GK:[6,17], Z:[7,16], OP1:[7,13], OP2:[10,14], NAP:[4,11] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "B.GK", kind: "move", detail: "на угол" },
          { who: "B.Z", kind: "move", detail: "блок" }
        ],
        roll: null,
        uiLabels: []
      },
      {
        min: 15, side: "A", score: [1, 0], ap: 2,
        narrative: "Удар с H17 — мяч в ворота.",
        ball: [5, 19],
        shotFrom: [7, 16],
        goalTo: [5, 19],
        players: {
          A: { GK:[5,1], Z:[6,7], OP1:[8,12], OP2:[9,14], NAP:[7,16] },
          B: { GK:[6,17], Z:[7,16], OP1:[7,13], OP2:[10,14], NAP:[4,11] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "A.NAP", kind: "shot", detail: "с H17" },
          { who: "A.OP2", kind: "move", detail: "на отскок" }
        ],
        roll: { label: "Удар из штрафной", chance: 55, result: "goal", roll: 29 },
        uiLabels: [{ id: "banner", text: "ГОЛ A" }]
      },
      {
        min: 16, side: "kick", score: [1, 0],
        narrative: "B отвечает своим краем — левый канал, который копировали с начала.",
        ball: [5, 9],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[4,7], OP2:[8,7], NAP:[6,8] },
          B: { GK:[5,18], Z:[5,14], OP1:[2,11], OP2:[6,12], NAP:[2,10] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "paradigm", text: "B: контра левым краем" }],
        paradigm: "B идёт своим флангом."
      },
      {
        min: 17, side: "B", score: [1, 0], ap: 2,
        narrative: "Быстрый подъём по A–B колонкам.",
        ball: [2, 6],
        players: {
          A: { GK:[5,1], Z:[4,5], OP1:[3,7], OP2:[7,7], NAP:[6,8] },
          B: { GK:[5,18], Z:[4,12], OP1:[3,8], OP2:[6,11], NAP:[2,6] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "B.OP1", kind: "pass", detail: "в Нап по краю" },
          { who: "B.NAP", kind: "move", detail: "C7" }
        ],
        roll: { label: "Пас в край", chance: 76, result: "ok", roll: 33 },
        uiLabels: []
      },
      {
        min: 18, side: "A", score: [1, 0], ap: 2,
        narrative: "З A опоздал на край — аура не достаёт до C7. Defend ставит ближе к воротам.",
        ball: [2, 6],
        players: {
          A: { GK:[5,1], Z:[3,4], OP1:[3,6], OP2:[6,6], NAP:[6,8] },
          B: { GK:[5,18], Z:[4,12], OP1:[3,8], OP2:[6,11], NAP:[2,6] }
        },
        statuses: { "A.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "A.Z", kind: "defend", detail: "D5" },
          { who: "A.OP1", kind: "move", detail: "вышел" }
        ],
        roll: null,
        uiLabels: [{ id: "tip", text: "Defend не накрыл край — Нап B ещё на row 6" }]
      },
      {
        min: 19, side: "B", score: [1, 1], ap: 2,
        narrative: "Ещё ход вперёд в ударную (C3) и удар. Мяч в ворота A.",
        ball: [5, 0],
        shotFrom: [2, 2],
        goalTo: [5, 0],
        players: {
          A: { GK:[4,1], Z:[3,4], OP1:[3,6], OP2:[6,6], NAP:[6,8] },
          B: { GK:[5,18], Z:[4,12], OP1:[3,7], OP2:[6,11], NAP:[2,2] }
        },
        statuses: { "A.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "B.NAP", kind: "move", detail: "C3 ударная зона" },
          { who: "B.NAP", kind: "shot", detail: "удар" }
        ],
        roll: { label: "Удар с края штрафной", chance: 44, result: "goal", roll: 21 },
        uiLabels: [{ id: "banner", text: "ГОЛ B" }]
      },
      {
        min: 20, side: "end", score: [1, 1],
        narrative: "1:1. Оба гола — прострел/край + удар из зоны, без «прохода через троих».",
        ball: [5, 9],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[3,6], OP2:[8,6], NAP:[6,8] },
          B: { GK:[5,18], Z:[5,15], OP1:[2,13], OP2:[7,14], NAP:[3,12] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "banner", text: "Итог 1:1" }]
      }
    ]
  },

  {
    id: "J",
    theme: "J",
    title: "Пресс → блок лидера",
    subtitle: "Отбор высоко → короткий розыгрыш у чужой штрафной → гол. Потом автобус.",
    scoreFinal: "2:0",
    styles: { A: "Высокий пресс → автобус после гола", B: "Низкий блок → вынужденный риск" },
    uiGlossary: [
      { key: "Пресс", where: "A на рядах 12–15", text: "Отбор в чужой трети, не дриблинг через всю оборону." },
      { key: "Автобус", where: "После 1:0", text: "A садится; B обязан раскрыться." }
    ],
    steps: [
      {
        min: 0, side: "kick", score: [0, 0],
        narrative: "A сразу высоко. B низко у своих — видно по рядам.",
        ball: [5, 11],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[3,11], OP2:[7,11], NAP:[5,12] },
          B: { GK:[5,18], Z:[5,16], OP1:[3,15], OP2:[7,15], NAP:[5,14] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "banner", text: "Прессинг A высоко" }]
      },
      {
        min: 1, side: "B", score: [0, 0], ap: 2,
        narrative: "B пытается разыграть от З под прессингом OP A.",
        ball: [5, 15],
        players: {
          A: { GK:[5,1], Z:[5,8], OP1:[4,13], OP2:[6,13], NAP:[5,12] },
          B: { GK:[5,18], Z:[5,16], OP1:[4,15], OP2:[7,15], NAP:[5,14] }
        },
        statuses: {},
        focus: { "B.NAP": 1 },
        actions: [
          { who: "B.Z", kind: "pass", detail: "на OP1" },
          { who: "B.OP1", kind: "move", detail: "принял под прессом" }
        ],
        roll: { label: "Пас под аурой OP A", chance: 48, result: "ok", roll: 41 },
        uiLabels: []
      },
      {
        min: 2, side: "A", score: [0, 0], ap: 2,
        narrative: "Двойной пресс: оба OP накрывают владельца.",
        ball: [4, 15],
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[3,14], OP2:[5,14], NAP:[5,12] },
          B: { GK:[5,18], Z:[5,16], OP1:[4,15], OP2:[7,15], NAP:[5,14] }
        },
        statuses: {},
        focus: { "B.NAP": 1 },
        actions: [
          { who: "A.OP1", kind: "press", detail: "аура" },
          { who: "A.OP2", kind: "press", detail: "аура" }
        ],
        roll: null,
        uiLabels: [{ id: "aura", text: "2×OP на разыгрывающем" }]
      },
      {
        min: 3, side: "B", score: [0, 0], ap: 2,
        narrative: "Вынос вперёд под прессом — срыв. Мяч у A на чужой трети.",
        ball: [5, 14],
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[3,14], OP2:[5,14], NAP:[5,13] },
          B: { GK:[5,18], Z:[5,16], OP1:[4,15], OP2:[7,15], NAP:[5,14] }
        },
        statuses: {},
        focus: { "B.NAP": 2 },
        actions: [
          { who: "B.OP1", kind: "pass", detail: "вынос" },
          { who: "B.Z", kind: "move", detail: "страховка" }
        ],
        roll: { label: "Вынос под 2×OP", chance: 32, result: "fail", roll: 74 },
        uiLabels: [{ id: "roll", text: "потеря на чужой трети A" }]
      },
      {
        min: 4, side: "A", score: [0, 0], ap: 2,
        narrative: "Коротко: OP → NAP уже на 15 — ещё не бьём, готовим угол.",
        ball: [6, 15],
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[4,14], OP2:[6,14], NAP:[6,15] },
          B: { GK:[5,18], Z:[5,16], OP1:[4,15], OP2:[7,15], NAP:[5,14] }
        },
        statuses: {},
        focus: { "B.NAP": 2 },
        actions: [
          { who: "A.OP2", kind: "pass", detail: "в Нап" },
          { who: "A.NAP", kind: "move", detail: "G16" }
        ],
        roll: { label: "Пас в штрафную зону", chance: 58, result: "ok", roll: 36 },
        uiLabels: [{ id: "tip", text: "Ударная зона достигнута (15+)" }]
      },
      {
        min: 5, side: "B", score: [0, 0], ap: 2,
        narrative: "З B Defend + ВР. Не дают бить свободно.",
        ball: [6, 15],
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[4,14], OP2:[6,14], NAP:[6,15] },
          B: { GK:[6,17], Z:[6,16], OP1:[4,15], OP2:[7,15], NAP:[5,14] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: { "B.NAP": 2 },
        actions: [
          { who: "B.Z", kind: "defend", detail: "на Нап" },
          { who: "B.GK", kind: "move", detail: "сузил угол" }
        ],
        roll: null,
        uiLabels: [{ id: "defend", text: "Defend на ударнике" }]
      },
      {
        min: 6, side: "A", score: [0, 0], ap: 2,
        narrative: "Не бьём в Defend: скидка на OP1 под другим углом → ряд 16.",
        ball: [4, 16],
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[4,16], OP2:[6,14], NAP:[6,15] },
          B: { GK:[6,17], Z:[6,16], OP1:[4,15], OP2:[7,15], NAP:[5,14] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: { "B.NAP": 3 },
        actions: [
          { who: "A.NAP", kind: "pass", detail: "скидка OP1" },
          { who: "A.OP1", kind: "move", detail: "E17" }
        ],
        roll: { label: "Скидка от стойки", chance: 50, result: "ok", roll: 42 },
        uiLabels: [{ id: "tip", text: "Обход Defend пасом" }]
      },
      {
        min: 7, side: "B", score: [0, 0], ap: 2,
        narrative: "Поздний сдвиг Defend — угол уже открыт.",
        ball: [4, 16],
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[4,16], OP2:[6,14], NAP:[6,15] },
          B: { GK:[5,17], Z:[5,16], OP1:[4,15], OP2:[7,15], NAP:[5,14] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: { "B.NAP": 3 },
        actions: [
          { who: "B.Z", kind: "defend", detail: "переставил" },
          { who: "B.GK", kind: "move", detail: "F18" }
        ],
        roll: null,
        uiLabels: []
      },
      {
        min: 8, side: "A", score: [1, 0], ap: 2,
        narrative: "Удар OP1 с E17 — мяч в ворота.",
        ball: [5, 19],
        shotFrom: [4, 16],
        goalTo: [5, 19],
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[4,16], OP2:[6,14], NAP:[6,15] },
          B: { GK:[5,17], Z:[5,16], OP1:[4,15], OP2:[7,15], NAP:[5,14] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: { "B.NAP": 3 },
        actions: [
          { who: "A.OP1", kind: "shot", detail: "с E17" },
          { who: "A.NAP", kind: "move", detail: "на отскок" }
        ],
        roll: { label: "Удар после скидки", chance: 47, result: "goal", roll: 25 },
        uiLabels: [{ id: "banner", text: "ГОЛ A" }],
        paradigm: "A забил высоким прессом — теперь сядет."
      },
      {
        min: 9, side: "kick", score: [1, 0],
        narrative: "Парадигма A: пресс выключен, автобус у своей трети.",
        ball: [5, 9],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[3,5], OP2:[7,5], NAP:[5,6] },
          B: { GK:[5,18], Z:[5,14], OP1:[3,11], OP2:[7,11], NAP:[5,10] }
        },
        statuses: { "A.Z": { defend: 2 } },
        focus: {},
        actions: [],
        roll: null,
        uiLabels: [{ id: "paradigm", text: "A: пресс → блок лидера" }],
        paradigm: "A защищает счёт."
      },
      {
        min: 10, side: "B", score: [1, 0], ap: 2,
        narrative: "B обязан идти — поднимает линию.",
        ball: [5, 11],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[3,5], OP2:[7,5], NAP:[5,6] },
          B: { GK:[5,18], Z:[5,12], OP1:[4,10], OP2:[7,10], NAP:[5,11] }
        },
        statuses: { "A.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "B.OP1", kind: "pass", detail: "в Нап" },
          { who: "B.NAP", kind: "move", detail: "F12" }
        ],
        roll: { label: "Пас вперёд", chance: 82, result: "ok", roll: 11 },
        uiLabels: []
      },
      {
        min: 11, side: "A", score: [1, 0], ap: 2,
        narrative: "A только переставляет Defend и держит компакт.",
        ball: [5, 11],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[3,6], OP2:[7,6], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,12], OP1:[4,10], OP2:[7,10], NAP:[5,11] }
        },
        statuses: { "A.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "A.Z", kind: "defend", detail: "F6" },
          { who: "A.OP2", kind: "move", detail: "ужали пространство" }
        ],
        roll: null,
        uiLabels: [{ id: "defend", text: "Автобус" }]
      },
      {
        min: 12, side: "B", score: [1, 0], ap: 2,
        narrative: "B ставит Замах издалека (row 11) — видно, но зона плохая.",
        ball: [5, 11],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[3,6], OP2:[7,6], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,12], OP1:[4,10], OP2:[7,10], NAP:[5,11] }
        },
        statuses: { "A.Z": { defend: 1 }, "B.NAP": { windup: true } },
        focus: {},
        actions: [
          { who: "B.OP2", kind: "pass", detail: "в Нап" },
          { who: "B.NAP", kind: "windup", detail: "Замах с row 11" }
        ],
        roll: { label: "Пас", chance: 75, result: "ok", roll: 40 },
        uiLabels: [{ id: "windup", text: "Замах слишком рано" }]
      },
      {
        min: 13, side: "A", score: [1, 0], ap: 2,
        narrative: "A просто держит Defend на линии — пусть бьют издалека.",
        ball: [5, 11],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[4,6], OP2:[7,6], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,12], OP1:[4,10], OP2:[7,10], NAP:[5,11] }
        },
        statuses: { "A.Z": { defend: 2 }, "B.NAP": { windup: true } },
        focus: {},
        actions: [
          { who: "A.Z", kind: "defend", detail: "обновил" },
          { who: "A.OP1", kind: "move", detail: "блок" }
        ],
        roll: null,
        uiLabels: []
      },
      {
        min: 14, side: "B", score: [1, 0], ap: 2,
        narrative: "Реализация замаха с row 11 в стену/% — мимо. Так и должно быть.",
        ball: [5, 5],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[4,6], OP2:[7,6], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,12], OP1:[4,10], OP2:[7,10], NAP:[5,11] }
        },
        statuses: { "A.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "B.OP1", kind: "pass", detail: "под замах" },
          { who: "B.NAP", kind: "shot", detail: "издали в Defend" }
        ],
        roll: { label: "Замах с row 11 + Defend", chance: 9, result: "fail", roll: 88 },
        uiLabels: [{ id: "roll", text: "9% → мимо · подбор A" }]
      },
      {
        min: 15, side: "A", score: [1, 0], ap: 2,
        narrative: "Вынос в свободную зону — B раскрыт.",
        ball: [8, 9],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[4,6], OP2:[8,9], NAP:[6,8] },
          B: { GK:[5,18], Z:[5,11], OP1:[3,9], OP2:[7,9], NAP:[5,10] }
        },
        statuses: {},
        focus: { "B.OP1": 1 },
        actions: [
          { who: "A.Z", kind: "pass", detail: "вынос на OP2" },
          { who: "A.OP2", kind: "move", detail: "I10" }
        ],
        roll: { label: "Вынос", chance: 84, result: "ok", roll: 15 },
        uiLabels: [{ id: "paradigm", text: "Контра против раскрытого B" }]
      },
      {
        min: 16, side: "B", score: [1, 0], ap: 2,
        narrative: "B бежит назад — оба OP ещё высоко, Сон копится на одном.",
        ball: [8, 9],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[4,6], OP2:[8,9], NAP:[6,8] },
          B: { GK:[5,18], Z:[6,12], OP1:[5,10], OP2:[8,11], NAP:[5,10] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "B.Z", kind: "move", detail: "назад" },
          { who: "B.OP2", kind: "move", detail: "догоняет край" }
        ],
        roll: null,
        uiLabels: []
      },
      {
        min: 17, side: "A", score: [1, 0], ap: 2,
        narrative: "Ещё пас в Нап на 14 — вход в ударную без дриблинга через З.",
        ball: [7, 15],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[5,10], OP2:[8,12], NAP:[7,15] },
          B: { GK:[5,18], Z:[6,14], OP1:[5,12], OP2:[8,13], NAP:[5,11] }
        },
        statuses: {},
        focus: {},
        actions: [
          { who: "A.OP2", kind: "pass", detail: "за спину убегающим" },
          { who: "A.NAP", kind: "move", detail: "H16" }
        ],
        roll: { label: "Пас в разрез", chance: 61, result: "ok", roll: 38 },
        uiLabels: [{ id: "tip", text: "Снова row 15+ до удара" }]
      },
      {
        min: 18, side: "B", score: [1, 0], ap: 2,
        narrative: "Поздний Defend — Нап A уже в зоне.",
        ball: [7, 15],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[5,10], OP2:[8,12], NAP:[7,15] },
          B: { GK:[6,17], Z:[7,16], OP1:[5,13], OP2:[8,13], NAP:[5,11] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "B.Z", kind: "defend", detail: "H17" },
          { who: "B.GK", kind: "move", detail: "выход" }
        ],
        roll: null,
        uiLabels: []
      },
      {
        min: 19, side: "A", score: [2, 0], ap: 2,
        narrative: "Смещение с Defend на G17 + удар. Мяч в сетку.",
        ball: [5, 19],
        shotFrom: [6, 16],
        goalTo: [5, 19],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[5,10], OP2:[8,12], NAP:[6,16] },
          B: { GK:[6,17], Z:[7,16], OP1:[5,13], OP2:[8,13], NAP:[5,11] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "A.NAP", kind: "move", detail: "ушёл с линии Defend на G17" },
          { who: "A.NAP", kind: "shot", detail: "удар" }
        ],
        roll: { label: "Удар после смещения", chance: 49, result: "goal", roll: 22 },
        uiLabels: [{ id: "banner", text: "ГОЛ A · 2:0" }]
      },
      {
        min: 20, side: "end", score: [2, 0],
        narrative: "2:0. Голы из чужой штрафной после отбора/контратаки — без прохода через троих в центре.",
        ball: [5, 9],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[3,5], OP2:[7,5], NAP:[5,6] },
          B: { GK:[5,18], Z:[5,15], OP1:[3,14], OP2:[7,14], NAP:[5,12] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "banner", text: "Итог 2:0" }]
      }
    ]
  }
];
