/**
 * Coherent hex replays — space / free zones first.
 * Principle: width & depth held; goals come from empty channels,
 * not from everyone magnetizing to the ball.
 * A attacks +row (goal row 19); B attacks -row (goal row 0).
 * Shot zone: A row>=16, B row<=3. Z r=2, OP r=1.
 */
window.PITCH_TACTICS_MATCHES = [
  {
    id: "H",
    theme: "H",
    title: "Ширина vs схлопывание",
    subtitle: "Сначала оба жмутся к мячу — атака мертва. Потом A держит край пустым и бьёт оттуда.",
    scoreFinal: "1:0",
    styles: {
      A: "После ошибки начинает держать ширину",
      B: "Весь матч схлопывается к мячу"
    },
    uiGlossary: [
      { key: "Свободная зона", where: "Подсветка гекса · пунктир", text: "Пустой канал вне аур. Туда и надо пасовать." },
      { key: "Схлопывание", where: "Все фишки у мяча", text: "Плохо: нет угла для паса, ауры перекрывают всё." },
      { key: "Ширина", where: "ОП2 остаётся на бровке", text: "Не бежит к мячу — ждёт передачу в пустоту." }
    ],
    steps: [
      {
        min: 0, side: "kick", score: [0, 0],
        narrative: "Старт. Форма широкая: OP1 слева, OP2 справа, NAP впереди по центру.",
        ball: [5, 9],
        freeZones: [[9, 11], [2, 11]],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[2,6], OP2:[9,6], NAP:[5,8] },
          B: { GK:[5,18], Z:[5,15], OP1:[2,14], OP2:[9,14], NAP:[5,12] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "banner", text: "Широкая форма · пустые каналы" }]
      },
      {
        min: 1, side: "A", score: [0, 0], ap: 2,
        narrative: "Мяч уходит на OP1 (лево). OP2 A пассивом остаётся справа — не бежит к мячу.",
        ball: [2, 7],
        freeZones: [[9, 10], [9, 12]],
        players: {
          A: { GK:[5,1], Z:[4,5], OP1:[2,7], OP2:[9,7], NAP:[4,8] },
          B: { GK:[5,18], Z:[5,15], OP1:[2,14], OP2:[9,14], NAP:[5,12] }
        },
        statuses: {}, focus: { "B.NAP": 1 },
        actions: [
          { who: "A.OP1", kind: "move", detail: "принял на левом канале C8" },
          { who: "A.Z", kind: "move", detail: "чуть подстраховал" }
        ],
        roll: null,
        uiLabels: [{ id: "tip", text: "Свободно справа: J/K — OP2 там ждёт" }]
      },
      {
        min: 2, side: "B", score: [0, 0], ap: 2,
        narrative: "Ошибка B: оба OP и З съезжают к левому мячу. Правый край B оголён.",
        ball: [2, 7],
        freeZones: [[9, 12], [10, 13], [9, 14]],
        players: {
          A: { GK:[5,1], Z:[4,5], OP1:[2,7], OP2:[9,7], NAP:[4,8] },
          B: { GK:[5,18], Z:[3,14], OP1:[2,12], OP2:[4,13], NAP:[3,11] }
        },
        statuses: {}, focus: { "B.NAP": 1 },
        actions: [
          { who: "B.OP1", kind: "press", detail: "рванул к мячу" },
          { who: "B.Z", kind: "move", detail: "съехал влево за мячом" }
        ],
        roll: null,
        uiLabels: [
          { id: "paradigm", text: "B схлопнулся к мячу" },
          { id: "tip", text: "Свободная зона: весь правый край B пуст" }
        ],
        note: "Плохой паттерн: 3 игрока B у колонок 2–4, справа никого."
      },
      {
        min: 3, side: "A", score: [0, 0], ap: 2,
        narrative: "A играет в пустоту: длинный пас на OP2, который не схлопывался.",
        ball: [9, 10],
        freeZones: [[9, 12], [10, 14]],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[3,7], OP2:[9,10], NAP:[6,9] },
          B: { GK:[5,18], Z:[3,14], OP1:[2,12], OP2:[4,13], NAP:[3,11] }
        },
        statuses: {}, focus: { "B.NAP": 2 },
        actions: [
          { who: "A.OP1", kind: "pass", detail: "переключение на правый край" },
          { who: "A.OP2", kind: "move", detail: "принял в свободной зоне J11" }
        ],
        roll: { label: "Пас в свободный край (вне аур)", chance: 76, result: "ok", roll: 28 },
        uiLabels: [{ id: "roll", text: "В пустоту 76% → ок" }]
      },
      {
        min: 4, side: "B", score: [0, 0], ap: 2,
        narrative: "B поздно бежит на фланг — снова все трое к мячу. Центр и лево B пустые, но A уже справа.",
        ball: [9, 10],
        freeZones: [[5, 14], [2, 13]],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[3,7], OP2:[9,10], NAP:[6,9] },
          B: { GK:[5,18], Z:[7,14], OP1:[6,12], OP2:[9,13], NAP:[5,12] }
        },
        statuses: {}, focus: { "B.NAP": 2 },
        actions: [
          { who: "B.OP2", kind: "move", detail: "догоняет край" },
          { who: "B.Z", kind: "move", detail: "опять к мячу" }
        ],
        roll: null,
        uiLabels: [{ id: "tip", text: "B снова уплотняется у мяча — опоздал" }]
      },
      {
        min: 5, side: "A", score: [0, 0], ap: 2,
        narrative: "Плохой выбор A: NAP и OP1 тоже бегут к мячу на фланг. Скученность — пас вперёд в ауру OP2 B.",
        ball: [9, 11],
        freeZones: [[4, 12], [5, 13]],
        players: {
          A: { GK:[5,1], Z:[6,6], OP1:[7,9], OP2:[9,11], NAP:[8,10] },
          B: { GK:[5,18], Z:[7,14], OP1:[6,12], OP2:[9,13], NAP:[5,12] }
        },
        statuses: {}, focus: { "B.NAP": 3 },
        actions: [
          { who: "A.OP2", kind: "pass", detail: "вперёд в скученность" },
          { who: "A.NAP", kind: "move", detail: "притянут к мячу" }
        ],
        roll: { label: "Пас в ауру OP B при скученности", chance: 34, result: "fail", roll: 70 },
        uiLabels: [
          { id: "roll", text: "34% → срыв" },
          { id: "tip", text: "Свободная зона была в центре (E/F) — туда не сыграли" }
        ],
        note: "Эпизод-ошибка: даже владея краем, схлопнули свою атаку к мячу."
      },
      {
        min: 6, side: "B", score: [0, 0], ap: 2,
        narrative: "B подобрал и… снова все к мячу. Контратака без ширины.",
        ball: [8, 11],
        freeZones: [[2, 8], [2, 6]],
        players: {
          A: { GK:[5,1], Z:[6,6], OP1:[7,9], OP2:[9,11], NAP:[8,10] },
          B: { GK:[5,18], Z:[7,13], OP1:[6,11], OP2:[8,11], NAP:[5,11] }
        },
        statuses: {}, focus: {},
        actions: [
          { who: "B.OP2", kind: "move", detail: "подбор у мяча" },
          { who: "B.OP1", kind: "move", detail: "тоже к мячу" }
        ],
        roll: null,
        uiLabels: [{ id: "tip", text: "Свободен левый канал A–C — B его не использует" }]
      },
      {
        min: 7, side: "A", score: [0, 0], ap: 2,
        narrative: "Отбор. A возвращает ширину: OP1 уходит далеко влево от мяча.",
        ball: [7, 9],
        freeZones: [[2, 11], [2, 13]],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[2,8], OP2:[8,9], NAP:[5,9] },
          B: { GK:[5,18], Z:[6,13], OP1:[5,11], OP2:[8,12], NAP:[5,11] }
        },
        statuses: {}, focus: {},
        actions: [
          { who: "A.OP2", kind: "move", detail: "отбор" },
          { who: "A.OP1", kind: "move", detail: "ушёл в широкий канал · не к мячу" }
        ],
        roll: { label: "Отбор у скученности B", chance: 55, result: "ok", roll: 40 },
        uiLabels: [{ id: "paradigm", text: "A снова держит ширину" }],
        paradigm: "A: ширина важнее бега к мячу."
      },
      {
        min: 8, side: "B", score: [0, 0], ap: 2,
        narrative: "B ставит Defend у центра и жмётся к мячу — левый край B пуст.",
        ball: [7, 9],
        freeZones: [[2, 12], [1, 14], [2, 15]],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[2,8], OP2:[8,9], NAP:[5,9] },
          B: { GK:[5,18], Z:[6,14], OP1:[5,12], OP2:[7,12], NAP:[5,11] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "B.Z", kind: "defend", detail: "центр" },
          { who: "B.OP2", kind: "move", detail: "к мячу" }
        ],
        roll: null,
        uiLabels: [{ id: "tip", text: "Свободная зона: A–C ряды 12–15" }]
      },
      {
        min: 9, side: "A", score: [0, 0], ap: 2,
        narrative: "Переключение в пустоту на OP1 — он один на всём левом крае.",
        ball: [2, 12],
        freeZones: [[2, 15], [3, 16]],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[2,12], OP2:[8,10], NAP:[4,11] },
          B: { GK:[5,18], Z:[6,14], OP1:[5,12], OP2:[7,12], NAP:[5,11] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "A.OP2", kind: "pass", detail: "длинное переключение в свободную зону" },
          { who: "A.OP1", kind: "move", detail: "C13 один" }
        ],
        roll: { label: "Пас в свободную зону", chance: 71, result: "ok", roll: 25 },
        uiLabels: [{ id: "roll", text: "Пустота 71% → ок" }]
      },
      {
        min: 10, side: "B", score: [0, 0], ap: 2,
        narrative: "B бежит влево пачкой. Правый край B теперь пуст — но мяч уже слева.",
        ball: [2, 12],
        freeZones: [[9, 14], [10, 15]],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[2,12], OP2:[8,10], NAP:[4,11] },
          B: { GK:[5,18], Z:[3,14], OP1:[2,13], OP2:[4,13], NAP:[4,12] }
        },
        statuses: {}, focus: {},
        actions: [
          { who: "B.OP1", kind: "move", detail: "к мячу" },
          { who: "B.Z", kind: "move", detail: "к мячу" }
        ],
        roll: null,
        uiLabels: [{ id: "tip", text: "Снова схлопывание B · NAP A может диагональ вправо позже" }]
      },
      {
        min: 11, side: "A", score: [0, 0], ap: 2,
        narrative: "Не прём в троих. Пас внутрь-вперёд на NAP в щель между уехавшими.",
        ball: [4, 15],
        freeZones: [[4, 16], [5, 17]],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[2,13], OP2:[7,11], NAP:[4,15] },
          B: { GK:[5,18], Z:[3,14], OP1:[2,13], OP2:[4,13], NAP:[4,12] }
        },
        statuses: {}, focus: {},
        actions: [
          { who: "A.OP1", kind: "pass", detail: "в щель за спину схлопнувшимся" },
          { who: "A.NAP", kind: "move", detail: "E16 · ударная зона" }
        ],
        roll: { label: "Пас в щель (З B уехал влево)", chance: 58, result: "ok", roll: 45 },
        uiLabels: [{ id: "tip", text: "Ударная зона через пустоту, не через ауру" }]
      },
      {
        min: 12, side: "B", score: [0, 0], ap: 2,
        narrative: "Поздний Defend — NAP уже в зоне, ВР выходит.",
        ball: [4, 15],
        freeZones: [],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[2,13], OP2:[7,11], NAP:[4,15] },
          B: { GK:[5,17], Z:[4,16], OP1:[3,14], OP2:[5,14], NAP:[4,12] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "B.Z", kind: "defend", detail: "E17" },
          { who: "B.GK", kind: "move", detail: "выход" }
        ],
        roll: null,
        uiLabels: [{ id: "defend", text: "Поздняя стойка" }]
      },
      {
        min: 13, side: "A", score: [1, 0], ap: 2,
        narrative: "Смещение с линии Defend в свободный гекс F17 + удар. Мяч в ворота.",
        ball: [5, 19],
        shotFrom: [5, 16],
        goalTo: [5, 19],
        freeZones: [[5, 16]],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[2,13], OP2:[7,11], NAP:[5,16] },
          B: { GK:[5,17], Z:[4,16], OP1:[3,14], OP2:[5,14], NAP:[4,12] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "A.NAP", kind: "move", detail: "в свободный F17" },
          { who: "A.NAP", kind: "shot", detail: "удар" }
        ],
        roll: { label: "Удар из свободного гекса штрафной", chance: 52, result: "goal", roll: 30 },
        uiLabels: [{ id: "banner", text: "ГОЛ · через пустоту" }]
      },
      {
        min: 14, side: "kick", score: [1, 0],
        narrative: "B всё ещё играет «все к мячу». A держит ширину и убивает время.",
        ball: [5, 9],
        freeZones: [[9, 8], [2, 8]],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[2,6], OP2:[9,6], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,12], OP1:[4,10], OP2:[6,10], NAP:[5,9] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "paradigm", text: "A держит 1:0 шириной" }],
        paradigm: "A не схлопывается."
      },
      {
        min: 16, side: "B", score: [1, 0], ap: 2,
        narrative: "B прёт центром пачкой — ауры A перекрывают узкий коридор.",
        ball: [5, 8],
        freeZones: [[1, 5], [10, 5]],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[3,6], OP2:[7,6], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,10], OP1:[4,8], OP2:[6,8], NAP:[5,8] }
        },
        statuses: { "A.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "B.NAP", kind: "move", detail: "в лоб в блок" },
          { who: "B.OP1", kind: "pass", detail: "в скученность" }
        ],
        roll: { label: "Пас в тройную насыщенность + Defend", chance: 22, result: "fail", roll: 81 },
        uiLabels: [{ id: "roll", text: "Узкий центр закрыт · края пустые не использованы" }]
      },
      {
        min: 18, side: "A", score: [1, 0], ap: 2,
        narrative: "Вынос в широкий OP2 — снова не к куче, а в свободный край.",
        ball: [9, 8],
        freeZones: [[9, 8]],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[2,6], OP2:[9,8], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,9], OP1:[4,8], OP2:[6,8], NAP:[5,8] }
        },
        statuses: {}, focus: { "B.OP1": 1 },
        actions: [
          { who: "A.Z", kind: "pass", detail: "на широкий край" },
          { who: "A.OP2", kind: "move", detail: "принял один" }
        ],
        roll: { label: "Вынос в ширину", chance: 80, result: "ok", roll: 14 },
        uiLabels: []
      },
      {
        min: 20, side: "end", score: [1, 0],
        narrative: "1:0. Гол родился из пустого канала после схлопывания B. Скученность у мяча дважды убила атаки.",
        ball: [5, 9],
        freeZones: [[2, 10], [9, 10]],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[2,6], OP2:[9,6], NAP:[5,7] },
          B: { GK:[5,18], Z:[5,15], OP1:[2,14], OP2:[9,14], NAP:[5,12] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "banner", text: "Итог 1:0 · урок ширины" }]
      }
    ]
  },

  {
    id: "I",
    theme: "I",
    title: "Пустой край",
    subtitle: "Замах в толпу мимо. Гол — прострел с одинокого фланга, где никто не стоял.",
    scoreFinal: "1:1",
    styles: {
      A: "Ищет пустые гексы",
      B: "Держит ширину в контратаке"
    },
    uiGlossary: [
      { key: "Одинокий фланг", where: "1 фишка на бровке", text: "Если соперник уехал к мячу — это главный адрес паса." }
    ],
    steps: [
      {
        min: 0, side: "kick", score: [0, 0],
        narrative: "Обе стороны широкие. Свободные зоны по бровкам отмечены.",
        ball: [5, 9],
        freeZones: [[1, 11], [10, 11]],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[1,6], OP2:[10,6], NAP:[5,8] },
          B: { GK:[5,18], Z:[5,15], OP1:[1,14], OP2:[10,14], NAP:[5,12] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "banner", text: "Максимальная ширина" }]
      },
      {
        min: 1, side: "A", score: [0, 0], ap: 2,
        narrative: "Контроль в центре. Края A специально не трогают — якоря формы.",
        ball: [5, 8],
        freeZones: [[1, 10], [10, 10]],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[1,7], OP2:[10,7], NAP:[5,8] },
          B: { GK:[5,18], Z:[5,15], OP1:[1,14], OP2:[10,14], NAP:[5,12] }
        },
        statuses: {}, focus: { "B.NAP": 1 },
        actions: [
          { who: "A.NAP", kind: "move", detail: "чуть глубже под пас" },
          { who: "A.Z", kind: "pass", detail: "в Нап" }
        ],
        roll: { label: "Пас", chance: 88, result: "ok", roll: 20 },
        uiLabels: [{ id: "tip", text: "OP1/OP2 держат колонки 1 и 10" }]
      },
      {
        min: 2, side: "B", score: [0, 0], ap: 2,
        narrative: "B сжимает только центр Defend — края оставляет. Честный блок.",
        ball: [5, 8],
        freeZones: [[1, 12], [10, 12]],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[1,7], OP2:[10,7], NAP:[5,8] },
          B: { GK:[5,18], Z:[5,14], OP1:[3,13], OP2:[7,13], NAP:[5,12] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: { "B.NAP": 1 },
        actions: [
          { who: "B.Z", kind: "defend", detail: "центр" },
          { who: "B.OP1", kind: "move", detail: "чуть уже, но не на бровку A" }
        ],
        roll: null,
        uiLabels: [{ id: "tip", text: "Края B (1 и 10) всё ещё свободны для A" }]
      },
      {
        min: 3, side: "A", score: [0, 0], ap: 2,
        narrative: "Ошибка: Замах NAP в центре перед Defend — в толпе, не в пустоте.",
        ball: [5, 11],
        freeZones: [[10, 12], [10, 14]],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[1,8], OP2:[10,8], NAP:[5,11] },
          B: { GK:[5,18], Z:[5,14], OP1:[3,13], OP2:[7,13], NAP:[5,12] }
        },
        statuses: { "A.NAP": { windup: true }, "B.Z": { defend: 1 } },
        focus: { "B.NAP": 2 },
        actions: [
          { who: "A.NAP", kind: "move", detail: "в лоб в блок" },
          { who: "A.NAP", kind: "windup", detail: "Замах в насыщенной зоне" }
        ],
        roll: null,
        uiLabels: [{ id: "windup", text: "Замах в толпе · свободный край справа проигнорирован" }]
      },
      {
        min: 4, side: "B", score: [0, 0], ap: 2,
        narrative: "B усиливает центр — края по-прежнему пустые.",
        ball: [5, 11],
        freeZones: [[10, 13], [1, 13]],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[1,8], OP2:[10,8], NAP:[5,11] },
          B: { GK:[5,18], Z:[5,13], OP1:[4,12], OP2:[6,12], NAP:[5,12] }
        },
        statuses: { "A.NAP": { windup: true }, "B.Z": { defend: 2 } },
        focus: { "B.NAP": 2 },
        actions: [
          { who: "B.Z", kind: "defend", detail: "на замахе" },
          { who: "B.OP2", kind: "move", detail: "уплотнил центр" }
        ],
        roll: null,
        uiLabels: []
      },
      {
        min: 5, side: "A", score: [0, 0], ap: 2,
        narrative: "Замах-удар из толпы — мимо. Правильный адрес был K-колонка.",
        ball: [5, 11],
        freeZones: [[10, 12]],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[1,8], OP2:[10,8], NAP:[5,11] },
          B: { GK:[5,18], Z:[5,13], OP1:[4,12], OP2:[6,12], NAP:[5,12] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: { "B.NAP": 3 },
        actions: [
          { who: "A.Z", kind: "pass", detail: "под замах" },
          { who: "A.NAP", kind: "shot", detail: "в Defend из центра" }
        ],
        roll: { label: "Удар из толпы / не зона", chance: 11, result: "fail", roll: 79 },
        uiLabels: [{ id: "roll", text: "11% · урок: не бить там, где все стоят" }]
      },
      {
        min: 6, side: "B", score: [0, 0], ap: 2,
        narrative: "Подбор. B не схлопывается: вынос на своего широкого OP1 (колонка 1).",
        ball: [1, 10],
        freeZones: [[1, 7], [1, 5]],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[1,8], OP2:[10,8], NAP:[5,11] },
          B: { GK:[5,18], Z:[5,13], OP1:[1,10], OP2:[8,12], NAP:[4,11] }
        },
        statuses: {}, focus: {},
        actions: [
          { who: "B.Z", kind: "pass", detail: "на широкий край, не в кучу" },
          { who: "B.OP1", kind: "move", detail: "B11 один" }
        ],
        roll: { label: "Вынос в ширину", chance: 77, result: "ok", roll: 19 },
        uiLabels: [{ id: "paradigm", text: "B играет в пустоту" }],
        paradigm: "B: контра шириной."
      },
      {
        min: 7, side: "A", score: [0, 0], ap: 2,
        narrative: "A ошибочно всё тянет к левому мячу — правый край A брошен.",
        ball: [1, 10],
        freeZones: [[10, 8], [10, 6]],
        players: {
          A: { GK:[5,1], Z:[3,5], OP1:[2,7], OP2:[5,7], NAP:[3,9] },
          B: { GK:[5,18], Z:[5,13], OP1:[1,10], OP2:[8,12], NAP:[4,11] }
        },
        statuses: { "A.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "A.Z", kind: "defend", detail: "к мячу" },
          { who: "A.OP2", kind: "move", detail: "бросил свой край · к мячу" }
        ],
        roll: null,
        uiLabels: [{ id: "tip", text: "Схлопывание A · колонка 10 пуста" }]
      },
      {
        min: 8, side: "B", score: [0, 0], ap: 2,
        narrative: "Вперёд по пустому каналу A–B. Ещё не ударная зона.",
        ball: [1, 6],
        freeZones: [[1, 3], [2, 2]],
        players: {
          A: { GK:[5,1], Z:[3,5], OP1:[2,7], OP2:[5,7], NAP:[3,9] },
          B: { GK:[5,18], Z:[4,11], OP1:[2,8], OP2:[7,11], NAP:[1,6] }
        },
        statuses: { "A.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "B.OP1", kind: "pass", detail: "в Нап по пустому краю" },
          { who: "B.NAP", kind: "move", detail: "B7" }
        ],
        roll: { label: "Пас в свободный канал", chance: 74, result: "ok", roll: 40 },
        uiLabels: []
      },
      {
        min: 9, side: "A", score: [0, 0], ap: 2,
        narrative: "Defend у ворот — край всё равно не закрыт до конца.",
        ball: [1, 6],
        freeZones: [[1, 3]],
        players: {
          A: { GK:[4,1], Z:[2,3], OP1:[2,5], OP2:[5,5], NAP:[4,7] },
          B: { GK:[5,18], Z:[4,11], OP1:[2,8], OP2:[7,11], NAP:[1,6] }
        },
        statuses: { "A.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "A.Z", kind: "defend", detail: "C4" },
          { who: "A.OP1", kind: "move", detail: "вышел" }
        ],
        roll: null,
        uiLabels: []
      },
      {
        min: 10, side: "B", score: [0, 1], ap: 2,
        narrative: "Ещё гекс в ударную C3 (мимо Defend) + удар. Мяч в ворота.",
        ball: [5, 0],
        shotFrom: [2, 2],
        goalTo: [5, 0],
        freeZones: [[2, 2]],
        players: {
          A: { GK:[4,1], Z:[2,3], OP1:[2,5], OP2:[5,5], NAP:[4,7] },
          B: { GK:[5,18], Z:[4,11], OP1:[2,7], OP2:[7,11], NAP:[2,2] }
        },
        statuses: { "A.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "B.NAP", kind: "move", detail: "в свободный C3" },
          { who: "B.NAP", kind: "shot", detail: "удар" }
        ],
        roll: { label: "Удар из свободного гекса", chance: 50, result: "goal", roll: 24 },
        uiLabels: [{ id: "banner", text: "ГОЛ B · пустой край" }]
      },
      {
        min: 11, side: "kick", score: [0, 1],
        narrative: "A возвращает ширину. Больше не схлопываем OP2.",
        ball: [5, 9],
        freeZones: [[10, 11], [1, 11]],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[1,6], OP2:[10,6], NAP:[5,8] },
          B: { GK:[5,18], Z:[5,15], OP1:[1,14], OP2:[10,14], NAP:[5,12] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "paradigm", text: "A: играй в пустоту" }],
        paradigm: "A копирует урок B."
      },
      {
        min: 12, side: "B", score: [0, 1], ap: 2,
        narrative: "B теперь сам схлопывается защищать счёт — оба OP к центру.",
        ball: [5, 9],
        freeZones: [[10, 12], [10, 14]],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[1,6], OP2:[10,6], NAP:[5,8] },
          B: { GK:[5,18], Z:[5,14], OP1:[4,12], OP2:[6,12], NAP:[5,11] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "B.OP1", kind: "move", detail: "уже к центру" },
          { who: "B.OP2", kind: "move", detail: "бросил край" }
        ],
        roll: null,
        uiLabels: [{ id: "tip", text: "Правый край B пуст" }]
      },
      {
        min: 13, side: "A", score: [0, 1], ap: 2,
        narrative: "Сразу в одинокий OP2 на колонке 10.",
        ball: [10, 10],
        freeZones: [[10, 14], [9, 15]],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[2,7], OP2:[10,10], NAP:[6,9] },
          B: { GK:[5,18], Z:[5,14], OP1:[4,12], OP2:[6,12], NAP:[5,11] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "A.NAP", kind: "pass", detail: "переключение в пустоту" },
          { who: "A.OP2", kind: "move", detail: "K11 один" }
        ],
        roll: { label: "Пас на одинокий край", chance: 73, result: "ok", roll: 31 },
        uiLabels: []
      },
      {
        min: 14, side: "B", score: [0, 1], ap: 2,
        narrative: "Поздний выход OP2 B на край — NAP B всё ещё в центре.",
        ball: [10, 10],
        freeZones: [[10, 15]],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[2,7], OP2:[10,10], NAP:[6,9] },
          B: { GK:[5,18], Z:[6,14], OP1:[5,12], OP2:[9,13], NAP:[5,11] }
        },
        statuses: {}, focus: {},
        actions: [
          { who: "B.OP2", kind: "move", detail: "догоняет" },
          { who: "B.Z", kind: "move", detail: "сместился" }
        ],
        roll: null,
        uiLabels: []
      },
      {
        min: 15, side: "A", score: [0, 1], ap: 2,
        narrative: "Прострел с одинокого фланга в NAP на H17 — между уехавшими.",
        ball: [7, 16],
        freeZones: [[7, 16]],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[3,9], OP2:[10,14], NAP:[7,16] },
          B: { GK:[5,18], Z:[6,14], OP1:[5,12], OP2:[9,13], NAP:[5,11] }
        },
        statuses: {}, focus: {},
        actions: [
          { who: "A.OP2", kind: "pass", detail: "прострел в свободный гекс штрафной" },
          { who: "A.NAP", kind: "move", detail: "H17" }
        ],
        roll: { label: "Прострел в пустоту", chance: 54, result: "ok", roll: 48 },
        uiLabels: [{ id: "tip", text: "Не дриблинг сквозь З — пас в пустой гекс" }]
      },
      {
        min: 16, side: "B", score: [0, 1], ap: 2,
        narrative: "ВР/З пытаются накрыть свободный гекс.",
        ball: [7, 16],
        freeZones: [],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[3,9], OP2:[10,14], NAP:[7,16] },
          B: { GK:[6,17], Z:[7,16], OP1:[5,13], OP2:[9,14], NAP:[5,11] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "B.Z", kind: "defend", detail: "на NAP" },
          { who: "B.GK", kind: "move", detail: "выход" }
        ],
        roll: null,
        uiLabels: []
      },
      {
        min: 17, side: "A", score: [1, 1], ap: 2,
        narrative: "Шаг в соседний свободный G17 + удар. Мяч в сетку.",
        ball: [5, 19],
        shotFrom: [6, 16],
        goalTo: [5, 19],
        freeZones: [[6, 16]],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[3,9], OP2:[10,14], NAP:[6,16] },
          B: { GK:[6,17], Z:[7,16], OP1:[5,13], OP2:[9,14], NAP:[5,11] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "A.NAP", kind: "move", detail: "G17 свободно" },
          { who: "A.NAP", kind: "shot", detail: "удар" }
        ],
        roll: { label: "Удар из свободного гекса", chance: 51, result: "goal", roll: 27 },
        uiLabels: [{ id: "banner", text: "ГОЛ A · 1:1" }]
      },
      {
        min: 20, side: "end", score: [1, 1],
        narrative: "Оба гола — из пустых гексов после того, как соперник уехал к мячу. Толпа у мяча голов не создала.",
        ball: [5, 9],
        freeZones: [[1, 10], [10, 10]],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[1,6], OP2:[10,6], NAP:[5,8] },
          B: { GK:[5,18], Z:[5,15], OP1:[1,14], OP2:[10,14], NAP:[5,12] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "banner", text: "Итог 1:1 · пустые зоны" }]
      }
    ]
  },

  {
    id: "J",
    theme: "J",
    title: "Пресс без схлопывания",
    subtitle: "Прессинг двумя, но третий остаётся широким. Гол в щель. Потом автобус с шириной.",
    scoreFinal: "2:0",
    styles: {
      A: "Пресс точечный + один широкий якорь",
      B: "Низкий блок, потом паническое схлопывание"
    },
    uiGlossary: [
      { key: "Точечный пресс", where: "2 у мяча, 1 широкий", text: "Не все бегут к мячу — иначе нет адреса для отбора." }
    ],
    steps: [
      {
        min: 0, side: "kick", score: [0, 0],
        narrative: "A высоко, но широко: OP2 не в линии с OP1.",
        ball: [5, 12],
        freeZones: [[10, 14], [1, 14]],
        players: {
          A: { GK:[5,1], Z:[5,7], OP1:[3,12], OP2:[10,10], NAP:[5,12] },
          B: { GK:[5,18], Z:[5,16], OP1:[3,15], OP2:[8,15], NAP:[5,14] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "banner", text: "Пресс + широкий якорь OP2" }]
      },
      {
        min: 1, side: "B", score: [0, 0], ap: 2,
        narrative: "B разыгрывает у своей штрафной узко.",
        ball: [4, 15],
        freeZones: [[10, 12]],
        players: {
          A: { GK:[5,1], Z:[5,8], OP1:[3,13], OP2:[10,11], NAP:[5,12] },
          B: { GK:[5,18], Z:[5,16], OP1:[4,15], OP2:[7,15], NAP:[5,14] }
        },
        statuses: {}, focus: { "B.NAP": 1 },
        actions: [
          { who: "B.Z", kind: "pass", detail: "на OP1" },
          { who: "B.OP1", kind: "move", detail: "принял" }
        ],
        roll: { label: "Пас под давлением OP", chance: 55, result: "ok", roll: 50 },
        uiLabels: []
      },
      {
        min: 2, side: "A", score: [0, 0], ap: 2,
        narrative: "Точечный пресс: OP1+NAP на мяч. OP2 остаётся на K — не бежит.",
        ball: [4, 15],
        freeZones: [[10, 13], [10, 15]],
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[3,14], OP2:[10,12], NAP:[5,14] },
          B: { GK:[5,18], Z:[5,16], OP1:[4,15], OP2:[7,15], NAP:[5,14] }
        },
        statuses: {}, focus: { "B.NAP": 1 },
        actions: [
          { who: "A.OP1", kind: "press", detail: "на мяч" },
          { who: "A.NAP", kind: "press", detail: "на мяч · OP2 НЕ схлопнулся" }
        ],
        roll: null,
        uiLabels: [{ id: "tip", text: "Широкий OP2 = адрес после отбора" }]
      },
      {
        min: 3, side: "B", score: [0, 0], ap: 2,
        narrative: "Вынос под прессом — срыв. Мяч у A.",
        ball: [4, 14],
        freeZones: [[10, 14]],
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[3,14], OP2:[10,12], NAP:[5,14] },
          B: { GK:[5,18], Z:[5,16], OP1:[4,15], OP2:[7,15], NAP:[5,14] }
        },
        statuses: {}, focus: { "B.NAP": 2 },
        actions: [
          { who: "B.OP1", kind: "pass", detail: "вынос" },
          { who: "B.Z", kind: "move", detail: "страховка" }
        ],
        roll: { label: "Вынос под прессом", chance: 33, result: "fail", roll: 72 },
        uiLabels: [{ id: "roll", text: "потеря" }]
      },
      {
        min: 4, side: "A", score: [0, 0], ap: 2,
        narrative: "Не били из толпы у отбора. Переключение на широкого OP2 в пустоту.",
        ball: [10, 14],
        freeZones: [[10, 16], [9, 16]],
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[4,14], OP2:[10,14], NAP:[6,13] },
          B: { GK:[5,18], Z:[5,16], OP1:[4,15], OP2:[7,15], NAP:[5,14] }
        },
        statuses: {}, focus: { "B.NAP": 2 },
        actions: [
          { who: "A.OP1", kind: "pass", detail: "в широкий свободный край" },
          { who: "A.OP2", kind: "move", detail: "K15 один против линии" }
        ],
        roll: { label: "Пас в свободную зону после отбора", chance: 70, result: "ok", roll: 22 },
        uiLabels: [{ id: "tip", text: "Смысл широкого якоря при прессе" }]
      },
      {
        min: 5, side: "B", score: [0, 0], ap: 2,
        narrative: "B паникует — З и оба OP к правому мячу. Центр/лево пусты.",
        ball: [10, 14],
        freeZones: [[4, 16], [5, 16], [3, 15]],
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[4,14], OP2:[10,14], NAP:[6,13] },
          B: { GK:[5,18], Z:[8,15], OP1:[7,14], OP2:[10,15], NAP:[6,14] }
        },
        statuses: {}, focus: { "B.NAP": 2 },
        actions: [
          { who: "B.Z", kind: "move", detail: "к мячу" },
          { who: "B.OP2", kind: "move", detail: "к мячу" }
        ],
        roll: null,
        uiLabels: [{ id: "tip", text: "Схлопывание B открыло E/F 16" }]
      },
      {
        min: 6, side: "A", score: [0, 0], ap: 2,
        narrative: "Прострел/диаговаль в свободный E17 — NAP бежит туда, не к куче на K.",
        ball: [4, 16],
        freeZones: [[4, 16]],
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[5,13], OP2:[9,14], NAP:[4,16] },
          B: { GK:[5,18], Z:[8,15], OP1:[7,14], OP2:[10,15], NAP:[6,14] }
        },
        statuses: {}, focus: { "B.NAP": 3 },
        actions: [
          { who: "A.OP2", kind: "pass", detail: "в свободную штрафную" },
          { who: "A.NAP", kind: "move", detail: "E17 · не к мячу на фланг" }
        ],
        roll: { label: "Пас в пустоту за схлопнутой линией", chance: 57, result: "ok", roll: 41 },
        uiLabels: []
      },
      {
        min: 7, side: "B", score: [0, 0], ap: 2,
        narrative: "Поздний возврат.",
        ball: [4, 16],
        freeZones: [],
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[5,13], OP2:[9,14], NAP:[4,16] },
          B: { GK:[5,17], Z:[5,16], OP1:[5,15], OP2:[8,15], NAP:[6,14] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "B.Z", kind: "defend", detail: "F17" },
          { who: "B.GK", kind: "move", detail: "выход" }
        ],
        roll: null,
        uiLabels: []
      },
      {
        min: 8, side: "A", score: [1, 0], ap: 2,
        narrative: "Смещение в свободный F17 + удар в ворота.",
        ball: [5, 19],
        shotFrom: [5, 16],
        goalTo: [5, 19],
        freeZones: [[5, 16]],
        players: {
          A: { GK:[5,1], Z:[5,9], OP1:[5,13], OP2:[9,14], NAP:[5,16] },
          B: { GK:[5,17], Z:[5,16], OP1:[5,15], OP2:[8,15], NAP:[6,14] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "A.NAP", kind: "move", detail: "F17 свободно" },
          { who: "A.NAP", kind: "shot", detail: "удар" }
        ],
        roll: { label: "Удар из свободного гекса", chance: 53, result: "goal", roll: 26 },
        uiLabels: [{ id: "banner", text: "ГОЛ A" }],
        paradigm: "A сядет, но ширину сохранит."
      },
      {
        min: 9, side: "kick", score: [1, 0],
        narrative: "Автобус A: низко, но OP1/OP2 на разных краях — не комок.",
        ball: [5, 9],
        freeZones: [[1, 7], [10, 7]],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[1,5], OP2:[10,5], NAP:[5,6] },
          B: { GK:[5,18], Z:[5,13], OP1:[4,10], OP2:[6,10], NAP:[5,9] }
        },
        statuses: { "A.Z": { defend: 2 } },
        focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "paradigm", text: "Автобус с шириной" }],
        paradigm: "Блок ≠ схлопывание."
      },
      {
        min: 11, side: "B", score: [1, 0], ap: 2,
        narrative: "B прёт центром втроём в Defend — края A пустые не использует.",
        ball: [5, 6],
        freeZones: [[1, 4], [10, 4]],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[1,5], OP2:[10,5], NAP:[5,6] },
          B: { GK:[5,18], Z:[5,9], OP1:[4,7], OP2:[6,7], NAP:[5,6] }
        },
        statuses: { "A.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "B.NAP", kind: "move", detail: "в лоб" },
          { who: "B.OP1", kind: "pass", detail: "в скученность" }
        ],
        roll: { label: "Пас в комок + Defend", chance: 24, result: "fail", roll: 85 },
        uiLabels: [{ id: "roll", text: "Края A пусты — B туда не пошёл" }]
      },
      {
        min: 13, side: "A", score: [1, 0], ap: 2,
        narrative: "Вынос на широкий OP2.",
        ball: [10, 7],
        freeZones: [[10, 7]],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[1,5], OP2:[10,7], NAP:[5,6] },
          B: { GK:[5,18], Z:[5,8], OP1:[4,7], OP2:[6,7], NAP:[5,6] }
        },
        statuses: {}, focus: {},
        actions: [
          { who: "A.Z", kind: "pass", detail: "в ширину" },
          { who: "A.OP2", kind: "move", detail: "один" }
        ],
        roll: { label: "Вынос в пустоту", chance: 82, result: "ok", roll: 12 },
        uiLabels: []
      },
      {
        min: 14, side: "B", score: [1, 0], ap: 2,
        narrative: "B снова всей группой на фланг к мячу.",
        ball: [10, 7],
        freeZones: [[2, 10], [3, 12]],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[1,5], OP2:[10,7], NAP:[5,6] },
          B: { GK:[5,18], Z:[7,9], OP1:[6,8], OP2:[9,8], NAP:[6,7] }
        },
        statuses: {}, focus: {},
        actions: [
          { who: "B.OP2", kind: "move", detail: "к мячу" },
          { who: "B.Z", kind: "move", detail: "к мячу" }
        ],
        roll: null,
        uiLabels: [{ id: "tip", text: "Левый канал B пуст для контра" }]
      },
      {
        min: 15, side: "A", score: [1, 0], ap: 2,
        narrative: "Переключение на OP1 в огромную пустоту.",
        ball: [1, 10],
        freeZones: [[1, 13], [2, 15]],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[1,10], OP2:[9,8], NAP:[4,8] },
          B: { GK:[5,18], Z:[7,9], OP1:[6,8], OP2:[9,8], NAP:[6,7] }
        },
        statuses: {}, focus: {},
        actions: [
          { who: "A.OP2", kind: "pass", detail: "на пустой край" },
          { who: "A.OP1", kind: "move", detail: "B11 один" }
        ],
        roll: { label: "Пас в свободную зону", chance: 75, result: "ok", roll: 29 },
        uiLabels: []
      },
      {
        min: 16, side: "B", score: [1, 0], ap: 2,
        narrative: "Поздний возврат всей команды влево.",
        ball: [1, 10],
        freeZones: [[8, 14]],
        players: {
          A: { GK:[5,1], Z:[5,5], OP1:[1,10], OP2:[9,8], NAP:[4,8] },
          B: { GK:[5,18], Z:[3,12], OP1:[2,11], OP2:[5,11], NAP:[4,10] }
        },
        statuses: {}, focus: {},
        actions: [
          { who: "B.OP1", kind: "move", detail: "к мячу" },
          { who: "B.Z", kind: "move", detail: "к мячу" }
        ],
        roll: null,
        uiLabels: []
      },
      {
        min: 17, side: "A", score: [1, 0], ap: 2,
        narrative: "В щель на NAP E16, пока B уехал на фланг.",
        ball: [4, 16],
        freeZones: [[4, 16]],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[2,12], OP2:[8,10], NAP:[4,16] },
          B: { GK:[5,18], Z:[3,12], OP1:[2,11], OP2:[5,11], NAP:[4,10] }
        },
        statuses: {}, focus: {},
        actions: [
          { who: "A.OP1", kind: "pass", detail: "в пустую штрафную" },
          { who: "A.NAP", kind: "move", detail: "E17" }
        ],
        roll: { label: "Пас в пустоту", chance: 60, result: "ok", roll: 37 },
        uiLabels: []
      },
      {
        min: 18, side: "B", score: [1, 0], ap: 2,
        narrative: "ВР и Defend — поздно.",
        ball: [4, 16],
        freeZones: [],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[2,12], OP2:[8,10], NAP:[4,16] },
          B: { GK:[5,17], Z:[4,16], OP1:[3,13], OP2:[6,13], NAP:[4,11] }
        },
        statuses: { "B.Z": { defend: 2 } },
        focus: {},
        actions: [
          { who: "B.Z", kind: "defend", detail: "E17" },
          { who: "B.GK", kind: "move", detail: "выход" }
        ],
        roll: null,
        uiLabels: []
      },
      {
        min: 19, side: "A", score: [2, 0], ap: 2,
        narrative: "Свободный F17 + удар. Мяч в ворота.",
        ball: [5, 19],
        shotFrom: [5, 16],
        goalTo: [5, 19],
        freeZones: [[5, 16]],
        players: {
          A: { GK:[5,1], Z:[5,6], OP1:[2,12], OP2:[8,10], NAP:[5,16] },
          B: { GK:[5,17], Z:[4,16], OP1:[3,13], OP2:[6,13], NAP:[4,11] }
        },
        statuses: { "B.Z": { defend: 1 } },
        focus: {},
        actions: [
          { who: "A.NAP", kind: "move", detail: "F17" },
          { who: "A.NAP", kind: "shot", detail: "удар" }
        ],
        roll: { label: "Удар из свободного гекса", chance: 50, result: "goal", roll: 23 },
        uiLabels: [{ id: "banner", text: "ГОЛ A · 2:0" }]
      },
      {
        min: 20, side: "end", score: [2, 0],
        narrative: "2:0. Пресс работал, потому что один оставался широким. Голы — в щели после схлопывания B к мячу.",
        ball: [5, 9],
        freeZones: [[1, 10], [10, 10]],
        players: {
          A: { GK:[5,1], Z:[5,4], OP1:[1,5], OP2:[10,5], NAP:[5,6] },
          B: { GK:[5,18], Z:[5,15], OP1:[3,14], OP2:[8,14], NAP:[5,12] }
        },
        statuses: {}, focus: {}, actions: [], roll: null,
        uiLabels: [{ id: "banner", text: "Итог 2:0 · пространство" }]
      }
    ]
  }
];
