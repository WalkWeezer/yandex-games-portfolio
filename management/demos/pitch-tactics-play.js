(function () {
  "use strict";

  // Field: flat-top odd-q, 13 wide
  const COLS = 13;
  const ROWS = 21;
  const HEX = 16;
  const STEP_X = HEX * 1.5;
  const STEP_Y = HEX * Math.sqrt(3);
  const OX = HEX * 1.35;
  const OY = HEX * 1.15;
  const VB_W = OX * 2 + STEP_X * (COLS - 1) + HEX;
  const VB_H = OY * 2 + STEP_Y * (ROWS - 0.5) + HEX;
  const GOAL_COLS = [5, 6, 7]; // 3-wide goals
  const GOAL_A_ROW = 0;
  const GOAL_B_ROW = 20;
  const CENTER_COL = 6;
  const HALF_ROW = 10;
  const COACH_AP = 2;
  const MATCH_MINUTES = 90;
  const ROLE_LABEL = { GK: "ВР", Z: "З", OP1: "О1", OP2: "О2", NAP: "Н" };
  const RADIAL = [
    { mode: "move", label: "Ход" },
    { mode: "pass", label: "Пас" },
    { mode: "cross", label: "Навес" },
    { mode: "shot", label: "Удар" },
    { mode: "tackle", label: "Отбор" },
  ];

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }
  function rnd() {
    return Math.random() * 100;
  }
  function hexCenter(c, r) {
    return { x: OX + STEP_X * c, y: OY + STEP_Y * (r + 0.5 * (c & 1)) };
  }
  function hexPoints(cx, cy, size) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 180) * (60 * i);
      pts.push(cx + size * Math.cos(a) + "," + (cy + size * Math.sin(a)));
    }
    return pts.join(" ");
  }
  function offsetToCube(c, r) {
    const x = c;
    const z = r - ((c - (c & 1)) >> 1);
    return { x, y: -x - z, z };
  }
  function hexDist(a, b) {
    const A = offsetToCube(a[0], a[1]);
    const B = offsetToCube(b[0], b[1]);
    return (Math.abs(A.x - B.x) + Math.abs(A.y - B.y) + Math.abs(A.z - B.z)) / 2;
  }
  function inBounds(c, r) {
    return c >= 0 && r >= 0 && c < COLS && r < ROWS;
  }
  function cellName(pos) {
    return String.fromCharCode(65 + pos[0]) + (pos[1] + 1);
  }
  function pctFromHex(c, r) {
    const p = hexCenter(c, r);
    return { left: (p.x / VB_W) * 100, top: (p.y / VB_H) * 100 };
  }
  function isGoalHex(c, r) {
    if (GOAL_COLS.indexOf(c) < 0) return null;
    if (r === GOAL_A_ROW) return "A";
    if (r === GOAL_B_ROW) return "B";
    return null;
  }
  function isPenaltyMark(c, r) {
    if (r <= 4 && c >= 3 && c <= 9) return true;
    if (r >= 16 && c >= 3 && c <= 9) return true;
    if (r === HALF_ROW) return true;
    if (Math.abs(r - HALF_ROW) <= 1 && Math.abs(c - CENTER_COL) <= 2) return true;
    return false;
  }
  function nearestHex(px, py, stageEl) {
    const rect = stageEl.getBoundingClientRect();
    const x = ((px - rect.left) / rect.width) * VB_W;
    const y = ((py - rect.top) / rect.height) * VB_H;
    let best = null;
    let bestD = 1e9;
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const p = hexCenter(c, r);
        const d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y);
        if (d < bestD) {
          bestD = d;
          best = [c, r];
        }
      }
    }
    return best;
  }

  function svgNode(tag, attrs) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (attrs) {
      Object.keys(attrs).forEach((k) => el.setAttribute(k, attrs[k]));
    }
    return el;
  }

  /** Stage matches viewBox aspect; sized to fit host without page scroll. */
  function createPitchStage(host) {
    host.innerHTML = "";
    const stage = document.createElement("div");
    stage.className = "pitch-stage";
    stage.style.aspectRatio = VB_W + " / " + VB_H;
    host.appendChild(stage);
    sizePitchStage(stage, host);
    return stage;
  }

  function sizePitchStage(stage, host) {
    if (!stage || !host) return;
    const ar = VB_W / VB_H;
    const pad = 8;
    const availW = Math.max(40, host.clientWidth - pad);
    const availH = Math.max(40, host.clientHeight - pad);
    let w = availW;
    let h = w / ar;
    if (h > availH) {
      h = availH;
      w = h * ar;
    }
    stage.style.width = Math.floor(w) + "px";
    stage.style.height = Math.floor(h) + "px";
  }

  let pitchResizeBound = false;
  function bindPitchResize() {
    if (pitchResizeBound) return;
    pitchResizeBound = true;
    window.addEventListener("resize", () => {
      const host = app.querySelector("#pitch") || app.querySelector("#lineupPitch");
      const stage = host && host.querySelector(".pitch-stage");
      if (stage && host) sizePitchStage(stage, host);
    });
  }

  function pitchBounds() {
    const halfH = HEX * (Math.sqrt(3) / 2);
    return {
      left: hexCenter(0, 0).x - HEX,
      right: hexCenter(COLS - 1, 0).x + HEX,
      top: hexCenter(0, 0).y - halfH,
      bottom: hexCenter(0, ROWS - 1).y + halfH,
    };
  }

  function drawPitchMarkings(svg) {
    const g = svgNode("g", { class: "pitch-marks" });
    const b = pitchBounds();
    const midY = (hexCenter(0, HALF_ROW - 1).y + hexCenter(0, HALF_ROW).y) / 2;
    const cx = hexCenter(CENTER_COL, HALF_ROW).x;
    const cy = midY;
    const boxPad = HEX * 0.35;

    // Outer touchlines
    g.appendChild(
      svgNode("rect", {
        x: b.left,
        y: b.top,
        width: b.right - b.left,
        height: b.bottom - b.top,
        class: "mark-boundary",
      })
    );

    // Halfway line
    g.appendChild(
      svgNode("line", {
        x1: b.left,
        x2: b.right,
        y1: midY,
        y2: midY,
        class: "mark-line",
      })
    );

    // Center circle + spot
    const R = STEP_Y * 2.15;
    g.appendChild(svgNode("circle", { cx: cx, cy: cy, r: R, class: "mark-circle" }));
    g.appendChild(svgNode("circle", { cx: cx, cy: cy, r: 2.2, class: "mark-spot" }));

    function boxForRows(r0, r1) {
      const ys = [];
      const xs = [];
      for (let c = 3; c <= 9; c++) {
        for (let r = r0; r <= r1; r++) {
          const p = hexCenter(c, r);
          xs.push(p.x);
          ys.push(p.y);
        }
      }
      const halfH = HEX * (Math.sqrt(3) / 2);
      return {
        x: Math.min.apply(null, xs) - HEX * 0.55,
        y: Math.min.apply(null, ys) - halfH + boxPad * 0.2,
        w: Math.max.apply(null, xs) - Math.min.apply(null, xs) + HEX * 1.1,
        h: Math.max.apply(null, ys) - Math.min.apply(null, ys) + halfH * 1.6,
      };
    }
    const boxA = boxForRows(0, 4);
    const boxB = boxForRows(16, 20);
    [boxA, boxB].forEach((box) => {
      g.appendChild(
        svgNode("rect", {
          x: box.x,
          y: box.y,
          width: box.w,
          height: box.h,
          class: "mark-box",
        })
      );
    });

    // 6-yard-ish boxes
    function six(r0, r1) {
      const xs = GOAL_COLS.map((c) => hexCenter(c, r0).x);
      const y0 = hexCenter(CENTER_COL, r0).y;
      const y1 = hexCenter(CENTER_COL, r1).y;
      const halfH = HEX * (Math.sqrt(3) / 2);
      const top = Math.min(y0, y1) - halfH * 0.3;
      const bot = Math.max(y0, y1) + halfH * 0.3;
      return {
        x: Math.min.apply(null, xs) - HEX * 0.7,
        y: top,
        w: Math.max.apply(null, xs) - Math.min.apply(null, xs) + HEX * 1.4,
        h: bot - top,
      };
    }
    [six(0, 2), six(18, 20)].forEach((box) => {
      g.appendChild(
        svgNode("rect", {
          x: box.x,
          y: box.y,
          width: box.w,
          height: box.h,
          class: "mark-six",
        })
      );
    });

    // Goal mouths on the 3 goal cells (inside field so viewBox does not clip)
    function goalMouth(row) {
      const xs = GOAL_COLS.map((c) => hexCenter(c, row).x);
      const y = hexCenter(CENTER_COL, row).y;
      const halfH = HEX * (Math.sqrt(3) / 2);
      const x0 = Math.min.apply(null, xs) - HEX * 0.5;
      const x1 = Math.max.apply(null, xs) + HEX * 0.5;
      g.appendChild(
        svgNode("rect", {
          x: x0,
          y: y - halfH * 0.55,
          width: x1 - x0,
          height: halfH * 1.1,
          class: "mark-goal-mouth",
        })
      );
    }
    goalMouth(GOAL_A_ROW);
    goalMouth(GOAL_B_ROW);

    svg.appendChild(g);
  }

  function fillHexGrid(svg, opts) {
    const interactive = !!(opts && opts.interactive);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const center = hexCenter(c, r);
        const poly = svgNode("polygon", {
          points: hexPoints(center.x, center.y, HEX * 0.92),
        });
        let cls = "hex-cell" + ((c + r) % 2 ? " alt" : "");
        if (isGoalHex(c, r)) cls += " goal";
        else if (isPenaltyMark(c, r)) cls += " mark";
        poly.setAttribute("class", cls);
        poly.dataset.c = String(c);
        poly.dataset.r = String(r);
        if (interactive) {
          poly.addEventListener("click", () => onHexClick(c, r));
          poly.addEventListener("pointerenter", () => {
            if (state.mode === "move" && state.ballOwner === state.selectedId) updatePreview([c, r]);
          });
          hexNodes[c + "," + r] = poly;
        }
        svg.appendChild(poly);
      }
    }
  }

  function makePlayer(side, role, spec) {
    return {
      id: side + "." + role,
      side,
      role,
      name: spec.name,
      shot: spec.shot,
      pass: spec.pass,
      cross: spec.cross,
      tackle: spec.tackle,
      speed: spec.speed,
      accel: spec.accel,
      control: spec.control, // владение мячом 1–5
      press: spec.press,
      burst: false,
      pos: spec.pos.slice(),
      home: spec.pos.slice(),
    };
  }
  function scaleSkills(base, mult) {
    const o = {};
    ["shot", "pass", "cross", "tackle", "speed", "accel", "control"].forEach((k) => {
      o[k] = clamp(Math.round(base[k] * mult), 1, 5);
    });
    o.press = base.press;
    o.name = base.name;
    o.pos = base.pos.slice();
    return o;
  }

  // S/A = гексы без мяча. С мячом − дебафф от владения. Усталость ведения копит риск потери.
  const YOU_BASE = {
    GK: { name: "Кольцов", shot: 1, pass: 3, cross: 1, tackle: 2, speed: 2, accel: 1, control: 3, press: 0, pos: [6, 1] },
    Z: { name: "Буров", shot: 1, pass: 3, cross: 2, tackle: 4, speed: 3, accel: 2, control: 3, press: 2, pos: [6, 4] },
    OP1: { name: "Левин", shot: 2, pass: 4, cross: 3, tackle: 3, speed: 2, accel: 5, control: 4, press: 1, pos: [2, 6] },
    OP2: { name: "Райцев", shot: 2, pass: 4, cross: 4, tackle: 3, speed: 5, accel: 1, control: 3, press: 1, pos: [10, 6] },
    NAP: { name: "Сомов", shot: 4, pass: 2, cross: 2, tackle: 2, speed: 5, accel: 4, control: 2, press: 0, pos: [6, 8] },
  };
  const AWAY_HOME = {
    GK: [6, 19],
    Z: [6, 16],
    OP1: [2, 14],
    OP2: [10, 14],
    NAP: [6, 12],
  };
  const OPPONENTS = [
    {
      id: "academy",
      name: "Академия «Росток»",
      tier: "weak",
      tierLabel: "Слабее",
      tactics: "Робкий блок",
      desc: "Слабые скиллы, держат форму, мало пресса.",
      mult: 0.62,
      ai: "shape",
      names: { GK: "Юный", Z: "Тихий", OP1: "Серый", OP2: "Малый", NAP: "Новиков" },
    },
    {
      id: "rivals",
      name: "ФК «Север»",
      tier: "equal",
      tierLabel: "Равный · владение",
      tactics: "Короткий пас",
      desc: "На вашем уровне.",
      mult: 1.0,
      ai: "possess",
      names: { GK: "Ильин", Z: "Карпов", OP1: "Медведев", OP2: "Орлов", NAP: "Громов" },
    },
    {
      id: "wingers",
      name: "«Вольные Края»",
      tier: "equal",
      tierLabel: "Равный · края",
      tactics: "Ширина",
      desc: "Ищет пустые бровки.",
      mult: 1.0,
      ai: "width",
      names: { GK: "Панов", Z: "Скала", OP1: "Левый", OP2: "Правый", NAP: "Клинок" },
    },
    {
      id: "press",
      name: "«Высокий Вал»",
      tier: "plus",
      tierLabel: "Чуть сильнее",
      tactics: "Высокий пресс",
      desc: "Сильнее в отборе.",
      mult: 1.12,
      ai: "press",
      names: { GK: "Страж", Z: "Якорь", OP1: "Хват", OP2: "Клещи", NAP: "Ударник" },
    },
    {
      id: "elite",
      name: "Легион «Олимп»",
      tier: "elite",
      tierLabel: "Явно сильнее",
      tactics: "Элита",
      desc: "Высокие скиллы, мало ошибок.",
      mult: 1.28,
      ai: "elite",
      names: { GK: "Эгида", Z: "Бастион", OP1: "Метр", OP2: "Вектор", NAP: "Апекс" },
    },
  ];

  function buildSquad(side, names, mult) {
    const squad = {};
    ["GK", "Z", "OP1", "OP2", "NAP"].forEach((role) => {
      const src = YOU_BASE[role];
      const scaled = scaleSkills(src, side === "A" ? 1 : mult);
      if (side === "B") {
        scaled.name = names[role];
        scaled.pos = AWAY_HOME[role].slice();
      } else {
        scaled.pos = src.pos.slice();
      }
      // роли → радиус давления (ЗЩ всегда 2)
      if (role === "Z") scaled.press = 2;
      else if (role === "OP1" || role === "OP2") scaled.press = 1;
      else scaled.press = 0;
      squad[role] = makePlayer(side, role, scaled);
    });
    return squad;
  }

  const state = {
    screen: "lobby",
    opponentId: null,
    you: null,
    them: null,
    minute: 0,
    score: [0, 0],
    turn: "A",
    ap: COACH_AP,
    ball: [CENTER_COL, HALF_ROW],
    ballOwner: null,
    loose: false,
    selectedId: null,
    mode: null,
    reachable: [],
    targets: [],
    log: [],
    over: false,
    waiting: false,
    radialOpen: false,
    diveCol: null,
    lockedIds: [],
    actedIds: [],
    carryFatigue: 0, // клетки, пройденные с мячом за текущее владение
    aiLocked: [],
  };

  const app = document.getElementById("app");
  let hexNodes = {};
  let pieceEls = {};
  let ballEl = null;
  let radialEl = null;

  function allPlayers() {
    return [].concat(Object.values(state.you || {}), Object.values(state.them || {}));
  }
  function byId(id) {
    return allPlayers().find((p) => p.id === id) || null;
  }
  function occupant(pos) {
    return allPlayers().find((p) => p.pos[0] === pos[0] && p.pos[1] === pos[1]) || null;
  }
  function ownerPlayer() {
    return state.ballOwner ? byId(state.ballOwner) : null;
  }
  function isLocked(id) {
    return state.lockedIds.indexOf(id) >= 0;
  }
  function lockPlayer(id, reason) {
    if (!id || isLocked(id)) return;
    state.lockedIds.push(id);
    markActed(id);
    const p = byId(id);
    pushLog((p ? p.name : id) + " исчерпан" + (reason ? " (" + reason + ")" : ""), true);
  }
  function markActed(id) {
    if (!id) return;
    if (state.actedIds.indexOf(id) < 0) state.actedIds.push(id);
  }
  function resetCarryFatigue() {
    state.carryFatigue = 0;
  }

  /** Stacked pressure: each enemy adds (pressRadius - dist + 1) if in range */
  function pressureOn(hex, forSide) {
    let pts = 0;
    const parts = [];
    allPlayers().forEach((p) => {
      if (p.side === forSide || !p.press) return;
      const d = hexDist(p.pos, hex);
      if (d >= 1 && d <= p.press) {
        const add = p.press - d + 1;
        pts += add;
        parts.push(ROLE_LABEL[p.role] + "+" + add);
      }
    });
    return { pts, parts };
  }

  function shotProximity(side, pos) {
    const goalRow = side === "A" ? GOAL_B_ROW : GOAL_A_ROW;
    const dist = Math.abs(goalRow - pos[1]);
    return clamp(1.15 - dist * 0.09, 0.12, 1.2);
  }

  /** 1–5 → базовый % успеха внутри радиуса */
  function skillPct(attr) {
    return 18 + attr * 14; // 1→32 … 5→88
  }

  /** Радиус действия: пас/удар = N, отбор = N/2, навес = N×2; ход = A (рывок) или S */
  function actionRange(p, mode) {
    if (mode === "pass" || mode === "shot") return p[mode];
    if (mode === "cross") return p.cross * 2;
    if (mode === "tackle") return Math.max(1, Math.round(p.tackle / 2));
    if (mode === "move") return moveBudget(p);
    return 1;
  }

  /**
   * Без мяча: S/A = гексы (1–5).
   * С мячом: дебафф к дистанции от низкого владения + усталость ведения режет % удержания.
   */
  function carrySpeedDebuff(control) {
    // control 5→0, 4→1, 3→1, 2→2, 1→2
    return Math.max(0, Math.ceil((5 - clamp(control, 1, 5)) / 2));
  }

  function moveBudget(p) {
    const raw = state.ballOwner === p.id && p.burst ? p.accel : p.speed;
    let hexes = clamp(raw, 1, 5);
    if (state.ballOwner === p.id) {
      hexes = Math.max(1, hexes - carrySpeedDebuff(p.control || 1));
    }
    return hexes;
  }

  function moveMs(from, to) {
    const d = Math.max(1, hexDist(from, to));
    return 90 + d * 100;
  }

  function canStandOn(pos, movingId) {
    if (!inBounds(pos[0], pos[1])) return false;
    if (isGoalHex(pos[0], pos[1])) return false;
    const occ = occupant(pos);
    if (occ && occ.id !== movingId) return false;
    return true;
  }

  /** Неактивные подтягиваются к якорю схемы (0–2 гекса), сохраняя канал */
  function holdFormation(side, skipIds, quiet) {
    const squad = side === "A" ? state.you : state.them;
    if (!squad) return;
    const skip = skipIds || [];
    let moved = 0;
    Object.values(squad).forEach((p) => {
      if (skip.indexOf(p.id) >= 0) return;
      if (state.ballOwner === p.id) return;
      const home = p.home;
      const dist = hexDist(p.pos, home);
      if (dist <= 0) return;
      const step = Math.min(2, dist);
      let opts = cellsInRange(p.pos, step).filter((pos) => canStandOn(pos, p.id));
      if (p.role === "OP1") opts = opts.filter((pos) => pos[0] <= CENTER_COL);
      if (p.role === "OP2") opts = opts.filter((pos) => pos[0] >= CENTER_COL);
      if (p.role === "GK") opts = opts.filter((pos) => (side === "A" ? pos[1] <= 3 : pos[1] >= ROWS - 4));
      opts.sort((a, b) => hexDist(a, home) - hexDist(b, home));
      if (!opts.length) return;
      if (hexDist(opts[0], home) >= dist) return;
      p.pos = opts[0];
      moved++;
    });
    if (moved && !quiet) {
      pushLog(side === "A" ? "Ваши без команды подтянули форму (" + moved + ")" : "ПК держит ширину формы (" + moved + ")");
    }
  }

  function inActionRange(from, to, mode) {
    return hexDist(from.pos, to) <= actionRange(from, mode);
  }

  function chanceShot(p, goalHex, gkDiveCol) {
    const pr = pressureOn(p.pos, p.side);
    const range = actionRange(p, "shot");
    const dist = goalHex ? hexDist(p.pos, goalHex) : 99;
    let skill = skillPct(p.shot) * Math.max(0, 1 - 0.5 * pr.pts) * shotProximity(p.side, p.pos);
    let diveNote = "";
    let outOfRange = dist > range;
    if (outOfRange) skill *= 0.15;
    if (goalHex && gkDiveCol != null) {
      if (gkDiveCol === goalHex[0]) {
        skill *= 0.35;
        diveNote = " · ВР угадал клетку (−65% шанса)";
      } else {
        diveNote = " · ВР прыгнул мимо";
      }
    }
    const blockLikely = pr.pts >= 2;
    return {
      chance: clamp(Math.round(skill), 1, 96),
      pressure: pr.pts,
      pressureParts: pr.parts,
      blockLikely,
      range,
      dist,
      outOfRange,
      detail:
        "Удар " +
        p.shot +
        "/5 · радиус " +
        range +
        " · дист. " +
        dist +
        (outOfRange ? " · ВНЕ радиуса" : "") +
        " · Σдавл. " +
        pr.pts +
        (pr.parts.length ? " [" + pr.parts.join(", ") + "]" : "") +
        " (−50%/пт)" +
        diveNote +
        (blockLikely ? " · плотная сумма → блок/мимо" : ""),
    };
  }

  function chancePassLike(p, target, mode) {
    const pr = pressureOn(p.pos, p.side);
    const dist = hexDist(p.pos, target);
    const range = actionRange(p, mode);
    const attr = mode === "cross" ? p.cross : p.pass;
    const label = mode === "cross" ? "Навес" : "Пас";
    let skill = skillPct(attr) * Math.max(0, 1 - 0.25 * pr.pts);
    const outOfRange = dist > range;
    if (outOfRange) skill *= 0.12;
    // внутри радиуса — «без проблем» по дистанции (штраф только давление)
    return {
      chance: clamp(Math.round(skill), 1, 96),
      pressure: pr.pts,
      dist,
      range,
      outOfRange,
      detail:
        label +
        " " +
        attr +
        "/5 · радиус " +
        range +
        " · дист. " +
        dist +
        (outOfRange ? " · ВНЕ радиуса" : " · в радиусе") +
        " · Σдавл. " +
        pr.pts +
        (pr.parts.length ? " [" + pr.parts.join("+") + "]" : "") +
        " (−25%/пт)",
    };
  }

  function chanceTackle(p, victim) {
    const pr = pressureOn(victim.pos, victim.side);
    const range = actionRange(p, "tackle");
    const dist = hexDist(p.pos, victim.pos);
    const outOfRange = dist > range;
    let skill = skillPct(p.tackle) * (0.75 + 0.08 * pr.pts);
    if (outOfRange) skill *= 0.1;
    return {
      chance: clamp(Math.round(skill), 5, 92),
      range,
      dist,
      outOfRange,
      detail:
        "Отбор " +
        p.tackle +
        "/5 · радиус " +
        range +
        " (÷2) · дист. " +
        dist +
        (outOfRange ? " · ВНЕ радиуса" : "") +
        " · жертва Σдавл. " +
        pr.pts,
    };
  }

  /** Ведение: давление + усталость за каждую пройденную с мячом клетку; владение смягчает */
  function chanceCarry(p, toHex, steps) {
    const pr = pressureOn(toHex, p.side);
    const ctrl = p.control || 1;
    const fat = (state.carryFatigue || 0) + (steps || 0);
    const perHex = Math.max(5, 18 - ctrl * 2); // control5: 8%/гекс, control1: 16%/гекс
    let keep = 98 - fat * perHex;
    if (pr.pts === 1) keep -= 32;
    else if (pr.pts === 2) keep -= 62;
    else if (pr.pts >= 3) keep -= 78;
    keep = clamp(Math.round(keep), 4, 97);
    return {
      keep,
      pressure: pr.pts,
      parts: pr.parts,
      fatigue: fat,
      detail:
        "Ведение → " +
        cellName(toHex) +
        " · удержать " +
        keep +
        "% · влад." +
        ctrl +
        " · устал." +
        fat +
        " (−" +
        perHex +
        "%/гекс) · Σдавл. " +
        pr.pts +
        (pr.parts.length ? " [" + pr.parts.join(", ") + "]" : "") +
        (pr.pts >= 2 ? " · плотное давление" : ""),
    };
  }

  function pushLog(msg, hi) {
    state.log.unshift({ msg, hi: !!hi });
    if (state.log.length > 50) state.log.pop();
  }
  function toast(msg) {
    let t = document.querySelector(".toast");
    if (!t) {
      t = document.createElement("div");
      t.className = "toast";
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1600);
  }

  function render() {
    if (state.screen === "lobby") renderLobby();
    else if (state.screen === "lineup") renderLineup();
    else renderMatch();
  }

  // —— Lobby ——
  function renderLobby() {
    app.innerHTML =
      '<section class="screen active"><div class="lobby-head"><h1>Pitch Tactics — Play</h1>' +
      '<p class="muted">5 соперников · DnD расстановка · радиальное меню · давление суммируется · ворота 3 гекса · сейв ВР</p></div>' +
      '<div class="opp-grid" id="oppGrid"></div>' +
      '<div class="lineup-actions"><button class="btn btn-primary" id="go" disabled>К расстановке →</button></div>' +
      '<div class="hint-box">Давление с нескольких защитников <b>складывается</b> на клетке. Плотность душит удар/пас, но открывает свободные зоны на другом фланге.</div></section>';
    const grid = app.querySelector("#oppGrid");
    OPPONENTS.forEach((o) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "opp-card tier-" + o.tier + (state.opponentId === o.id ? " selected" : "");
      b.innerHTML =
        '<div class="tier">' +
        o.tierLabel +
        "</div><h3>" +
        o.name +
        "</h3><p><b>" +
        o.tactics +
        "</b><br/>" +
        o.desc +
        "</p>";
      b.onclick = () => {
        state.opponentId = o.id;
        renderLobby();
      };
      grid.appendChild(b);
    });
    const go = app.querySelector("#go");
    go.disabled = !state.opponentId;
    go.onclick = () => {
      const opp = OPPONENTS.find((x) => x.id === state.opponentId);
      state.you = buildSquad("A", null, 1);
      state.them = buildSquad("B", opp.names, opp.mult);
      if (opp.id === "press" || opp.id === "elite") {
        state.them.Z.tackle = clamp(state.them.Z.tackle + 1, 1, 5);
        state.them.NAP.shot = clamp(state.them.NAP.shot + 1, 1, 5);
      }
      state.screen = "lineup";
      render();
    };
  }

  // —— Lineup DnD ——
  function renderLineup() {
    const opp = OPPONENTS.find((x) => x.id === state.opponentId);
    app.innerHTML =
      '<section class="screen active"><h1>Расстановка (Drag & Drop)</h1>' +
      '<p class="muted">Тяните <b>своих</b> игроков по гексам. Соперник: ' +
      opp.name +
      ". Справа — скиллы обеих команд.</p>" +
      '<div class="lineup-layout"><div class="lineup-pitch" id="lineupPitch"></div>' +
      '<div class="skills-side" id="skillsSide"></div></div>' +
      '<div class="lineup-actions"><button class="btn btn-ghost" id="back">← Назад</button>' +
      '<button class="btn btn-primary" id="kick">Начать матч</button></div>' +
      '<div class="hint-box">Без мяча — полный S/A (до 5 гекс). С мячом −дебафф от <b>владения</b>; каждая клетка ведения копит риск потери (как усталость). Неактивные сами подтягивают форму.</div></section>';

    drawLineupPitch();
    fillSkillsSide();
    bindPitchResize();
    requestAnimationFrame(() => {
      const host = app.querySelector("#lineupPitch");
      const stage = host && host.querySelector(".pitch-stage");
      if (stage) sizePitchStage(stage, host);
    });
    app.querySelector("#back").onclick = () => {
      state.screen = "lobby";
      render();
    };
    app.querySelector("#kick").onclick = startMatch;
  }

  function drawLineupPitch() {
    const host = app.querySelector("#lineupPitch");
    const stage = createPitchStage(host);
    const svg = svgNode("svg", {
      class: "pitch-svg",
      viewBox: "0 0 " + VB_W + " " + VB_H,
      preserveAspectRatio: "none",
    });
    stage.appendChild(svg);
    fillHexGrid(svg, { interactive: false });
    drawPitchMarkings(svg);

    allPlayers().forEach((p) => {
      const el = document.createElement("div");
      el.className = "lineup-piece " + p.side + (p.side === "B" ? " locked" : "");
      el.textContent = ROLE_LABEL[p.role];
      el.title = p.name;
      const pt = pctFromHex(p.pos[0], p.pos[1]);
      el.style.left = pt.left + "%";
      el.style.top = pt.top + "%";
      if (p.side === "A") enableDrag(el, p, stage);
      stage.appendChild(el);
    });
  }

  function enableDrag(el, player, stage) {
    let dragging = false;
    const onDown = (ev) => {
      ev.preventDefault();
      dragging = true;
      el.classList.add("dragging");
      const move = (e) => {
        if (!dragging) return;
        const pt = e.touches ? e.touches[0] : e;
        const rect = stage.getBoundingClientRect();
        el.style.left = ((pt.clientX - rect.left) / rect.width) * 100 + "%";
        el.style.top = ((pt.clientY - rect.top) / rect.height) * 100 + "%";
      };
      const up = (e) => {
        dragging = false;
        el.classList.remove("dragging");
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        document.removeEventListener("touchmove", move);
        document.removeEventListener("touchend", up);
        const pt = e.changedTouches ? e.changedTouches[0] : e;
        const hex = nearestHex(pt.clientX, pt.clientY, stage);
        if (!hex || !inBounds(hex[0], hex[1])) {
          snapPiece(el, player.pos);
          return;
        }
        if (hex[1] > HALF_ROW) {
          toast("Ставьте на своей половине");
          snapPiece(el, player.pos);
          return;
        }
        if (isGoalHex(hex[0], hex[1])) {
          toast("Не в ворота");
          snapPiece(el, player.pos);
          return;
        }
        const other = occupant(hex);
        if (other && other.id !== player.id) {
          if (other.side !== "A") {
            toast("Клетка занята соперником");
            snapPiece(el, player.pos);
            return;
          }
          const tmp = other.pos.slice();
          other.pos = player.pos.slice();
          other.home = other.pos.slice();
          player.pos = tmp;
          player.home = tmp.slice();
          toast("Обмен с " + other.name);
          drawLineupPitch();
          fillSkillsSide();
          return;
        }
        player.pos = hex;
        player.home = hex.slice();
        snapPiece(el, hex);
        fillSkillsSide();
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
      document.addEventListener("touchmove", move, { passive: false });
      document.addEventListener("touchend", up);
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("touchstart", onDown, { passive: false });
  }
  function snapPiece(el, pos) {
    const pt = pctFromHex(pos[0], pos[1]);
    el.style.left = pt.left + "%";
    el.style.top = pt.top + "%";
  }

  function fillSkillsSide() {
    const el = app.querySelector("#skillsSide");
    if (!el) return;
    el.innerHTML = "<h2>Скиллы</h2>";
    const block = (title, squad, side) => {
      const h = document.createElement("h3");
      h.textContent = title;
      h.style.color = side === "A" ? "var(--a)" : "var(--b)";
      h.style.fontSize = "0.95rem";
      el.appendChild(h);
      Object.values(squad).forEach((p) => {
        const d = document.createElement("div");
        d.className = "skill-block";
        d.innerHTML =
          "<h4>" +
          ROLE_LABEL[p.role] +
          " · " +
          p.name +
          "</h4><div class=\"skills\">" +
          skillCell("Удар", p.shot) +
          skillCell("Пас", p.pass) +
          skillCell("Навес", p.cross) +
          skillCell("Отбор", p.tackle) +
          '</div><div class="meta-row"><b>S' +
          p.speed +
          "/A" +
          p.accel +
          " · Влад." +
          p.control +
          "</b> · пас " +
          actionRange(p, "pass") +
          " · навес " +
          actionRange(p, "cross") +
          " · отбор " +
          actionRange(p, "tackle") +
          " · " +
          cellName(p.pos) +
          "</div>";
        el.appendChild(d);
      });
    };
    block("Вы", state.you, "A");
    block("Соперник", state.them, "B");
  }
  function skillCell(l, v) {
    return "<span>" + l + "<b>" + v + "</b></span>";
  }

  function startMatch() {
    state.minute = 0;
    state.score = [0, 0];
    state.turn = "A";
    state.ap = COACH_AP;
    state.ball = [CENTER_COL, HALF_ROW];
    state.you.NAP.pos = [CENTER_COL, HALF_ROW];
    state.you.NAP.home = state.you.NAP.pos.slice();
    state.you.NAP.burst = true;
    Object.values(state.them).forEach((p) => {
      p.pos = p.home.slice();
      p.burst = false;
    });
    Object.values(state.you).forEach((p) => {
      if (p.role !== "NAP") {
        p.home = p.pos.slice();
        p.burst = false;
      }
    });
    state.ballOwner = "A.NAP";
    state.loose = false;
    state.selectedId = null;
    state.mode = null;
    state.reachable = [];
    state.targets = [];
    state.log = [];
    state.over = false;
    state.waiting = false;
    state.radialOpen = false;
    state.lockedIds = [];
    state.actedIds = [];
    resetCarryFatigue();
    pushLog("Свисток! Клик по игроку → радиальное меню (5 действий).", true);
    state.screen = "match";
    render();
  }

  // —— Match ——
  function renderMatch() {
    app.innerHTML =
      '<section class="screen active match-layout">' +
      '<aside class="panel panel-cards" id="leftPanel"></aside>' +
      '<section class="pitch-wrap"><div class="pitch" id="pitch"></div>' +
      '<div class="preview" id="preview">Клик по своему игроку — меню из 5 действий, затем клетка цели.</div></section>' +
      '<aside class="panel panel-log" id="rightPanel"></aside></section>';
    renderLeft();
    renderRight();
    ensurePitch();
    bindPitchResize();
    requestAnimationFrame(() => {
      const host = app.querySelector("#pitch");
      const stage = host && host.querySelector(".pitch-stage");
      if (stage) sizePitchStage(stage, host);
      syncPieces(false);
      paintBoard();
    });
    syncPieces(false);
    paintBoard();
  }

  function renderLeft() {
    const el = app.querySelector("#leftPanel");
    if (!el) return;
    const sel = state.selectedId ? byId(state.selectedId) : null;
    el.innerHTML =
      '<div class="scoreline"><span>Вы ' +
      state.score[0] +
      '</span><span class="clock">' +
      String(state.minute) +
      "'</span><span>" +
      state.score[1] +
      " ПК</span></div>" +
      '<div class="muted">Ход: <b>' +
      (state.turn === "A" ? "Вы" : "Соперник") +
      "</b>" +
      (state.mode ? ' · <span class="mode-chip">' + modeLabel(state.mode) + "</span>" : "") +
      "</div>" +
      '<div class="ap-pills">' +
      [0, 1].map((i) => '<div class="ap' + (i < state.ap && state.turn === "A" ? " on" : "") + '"></div>').join("") +
      "</div>" +
      '<div class="muted" style="font-size:0.78rem;margin-bottom:8px">Мяч: ' +
      (state.loose ? "свободный @ " + cellName(state.ball) : state.ballOwner ? byId(state.ballOwner).name : "—") +
      "</div>" +
      '<h3 style="font-size:0.85rem;margin:0 0 6px">Состав</h3>' +
      '<div class="card-list" id="cardList"></div>' +
      (sel ? selectedCardHtml(sel) : '<p class="muted" style="font-size:0.8rem">Клик по игроку на поле или карточке.</p>') +
      '<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">' +
      '<button class="btn" id="btnEnd" ' +
      (state.turn !== "A" || state.waiting || state.over ? "disabled" : "") +
      ">Конец хода</button>" +
      '<button class="btn btn-ghost" id="btnResign">Выйти</button></div>';

    const list = el.querySelector("#cardList");
    Object.values(state.you).forEach((p) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className =
        "player-card" +
        (state.selectedId === p.id ? " selected" : "") +
        (state.ballOwner === p.id ? " has-ball" : "") +
        (isLocked(p.id) ? " locked" : "");
      const pr = pressureOn(p.pos, p.side);
      b.innerHTML =
        '<span class="pc-role">' +
        ROLE_LABEL[p.role] +
        '</span><span class="pc-name">' +
        p.name +
        (isLocked(p.id) ? " · ✕" : "") +
        '</span><span class="pc-meta">' +
        cellName(p.pos) +
        " · <b>S" +
        p.speed +
        "/A" +
        p.accel +
        "</b> · Σ" +
        pr.pts +
        "</span>";
      b.onclick = () => {
        if (isLocked(p.id)) {
          toast("Игрок уже отбирал — ход для него закрыт");
          return;
        }
        if (state.turn === "A" && !state.waiting && !state.over) openRadial(p.id);
        else {
          state.selectedId = p.id;
          renderLeft();
          renderRight();
          syncPieces(false);
        }
      };
      list.appendChild(b);
    });

    el.querySelector("#btnEnd").onclick = () => endPlayerTurn();
    el.querySelector("#btnResign").onclick = () => {
      state.screen = "lobby";
      state.opponentId = null;
      render();
    };
  }

  function selectedCardHtml(p) {
    const pr = pressureOn(p.pos, p.side);
    return (
      '<div class="sel-card">' +
      "<h3>" +
      ROLE_LABEL[p.role] +
      " · " +
      p.name +
      "</h3>" +
      '<div class="muted">' +
      cellName(p.pos) +
      " · Σдавл. <b>" +
      pr.pts +
      "</b>" +
      (pr.parts.length ? " (" + pr.parts.join(", ") + ")" : "") +
      "</div>" +
      '<div class="skill-mini"><div>Удар <b>' +
      p.shot +
      "</b>→" +
      actionRange(p, "shot") +
      '</div><div>Пас <b>' +
      p.pass +
      "</b>→" +
      actionRange(p, "pass") +
      '</div><div>Навес <b>' +
      p.cross +
      "</b>→" +
      actionRange(p, "cross") +
      '</div><div>Отбор <b>' +
      p.tackle +
      "</b>→" +
      actionRange(p, "tackle") +
      '</div><div>Влад. <b>' +
      p.control +
      "</b></div><div>Ход <b>" +
      moveBudget(p) +
      "</b></div></div>" +
      '<div class="muted" style="font-size:0.75rem">S' +
      p.speed +
      " / A" +
      p.accel +
      (p.burst && state.ballOwner === p.id ? " · рывок A" : "") +
      " · давл.r" +
      p.press +
      " · устал." +
      (state.ballOwner === p.id ? state.carryFatigue || 0 : 0) +
      "</div>" +
      '<div class="hint-box">Без мяча — полный S/A. С мячом −дебафф владения; клетки ведения копят риск потери.</div></div>'
    );
  }

  function modeLabel(m) {
    const x = RADIAL.find((r) => r.mode === m);
    return x ? x.label : m;
  }

  function renderRight() {
    const el = app.querySelector("#rightPanel");
    if (!el) return;
    el.innerHTML =
      '<h3 style="font-size:0.95rem;margin:0 0 8px">Стенограмма</h3>' +
      '<div class="log log-tall" id="log"></div>';
    const log = el.querySelector("#log");
    state.log.forEach((e) => {
      const d = document.createElement("div");
      if (e.hi) d.className = "hi";
      d.textContent = e.msg;
      log.appendChild(d);
    });
  }

  function ensurePitch() {
    const host = app.querySelector("#pitch");
    hexNodes = {};
    pieceEls = {};
    const stage = createPitchStage(host);

    const svg = svgNode("svg", {
      class: "pitch-svg",
      viewBox: "0 0 " + VB_W + " " + VB_H,
      preserveAspectRatio: "none",
    });
    stage.appendChild(svg);
    fillHexGrid(svg, { interactive: true });
    drawPitchMarkings(svg);

    ballEl = document.createElement("div");
    ballEl.className = "ball";
    stage.appendChild(ballEl);

    allPlayers().forEach((p) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "piece " + p.side;
      el.innerHTML =
        '<span class="piece-role">' +
        ROLE_LABEL[p.role] +
        '</span><span class="piece-sa">S' +
        p.speed +
        " A" +
        p.accel +
        "</span>";
      el.title = p.name + " · S" + p.speed + "/A" + p.accel;
      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onPieceClick(p.id);
      });
      stage.appendChild(el);
      pieceEls[p.id] = el;
    });

    radialEl = document.createElement("div");
    radialEl.className = "radial";
    radialEl.innerHTML =
      '<button type="button" class="radial-center" id="radialClose">✕</button>' +
      RADIAL.map((r, i) =>
        '<button type="button" class="radial-btn" data-mode="' + r.mode + '" style="--i:' + i + '">' + r.label + "</button>"
      ).join("");
    stage.appendChild(radialEl);
    radialEl.querySelector("#radialClose").onclick = (e) => {
      e.stopPropagation();
      cancelRadialOrMode();
    };
    radialEl.querySelectorAll(".radial-btn").forEach((btn) => {
      const i = RADIAL.findIndex((r) => r.mode === btn.dataset.mode);
      const ang = (-90 + i * 72) * (Math.PI / 180);
      const rad = 58;
      btn.style.left = Math.cos(ang) * rad + "px";
      btn.style.top = Math.sin(ang) * rad + "px";
      btn.onclick = (e) => {
        e.stopPropagation();
        chooseRadial(btn.dataset.mode);
      };
    });
  }

  function syncPieces(animate, moveId, fromPos) {
    allPlayers().forEach((p) => {
      const el = pieceEls[p.id];
      if (!el) return;
      const pt = pctFromHex(p.pos[0], p.pos[1]);
      if (animate && moveId && p.id === moveId && fromPos) {
        el.style.transition = "left " + moveMs(fromPos, p.pos) + "ms ease, top " + moveMs(fromPos, p.pos) + "ms ease";
      } else {
        el.style.transition = animate ? "left .28s ease, top .28s ease" : "none";
      }
      el.style.left = pt.left + "%";
      el.style.top = pt.top + "%";
      el.classList.toggle("selected", state.selectedId === p.id);
      el.classList.toggle("has-ball", state.ballOwner === p.id);
      el.classList.toggle("locked", isLocked(p.id));
      el.title =
        p.name +
        " · S" +
        p.speed +
        "/A" +
        p.accel +
        (p.burst && state.ballOwner === p.id ? " · рывок" : "") +
        (isLocked(p.id) ? " · исчерпан после отбора" : "");
      const label = ROLE_LABEL[p.role];
      if (el.dataset.baseLabel !== label) {
        el.dataset.baseLabel = label;
      }
      el.innerHTML =
        '<span class="piece-role">' +
        label +
        '</span><span class="piece-sa">S' +
        p.speed +
        " A" +
        p.accel +
        "</span>";
    });
    const bp = pctFromHex(state.ball[0], state.ball[1]);
    ballEl.style.transition = animate ? "left .35s ease, top .35s ease" : "none";
    ballEl.style.left = bp.left + "%";
    ballEl.style.top = bp.top + "%";
    ballEl.style.opacity = state.ballOwner && !state.loose ? "0.3" : "1";
  }

  function resetHexClasses() {
    Object.values(hexNodes).forEach((poly) => {
      const c = +poly.dataset.c;
      const r = +poly.dataset.r;
      let cls = "hex-cell" + ((c + r) % 2 ? " alt" : "");
      if (isGoalHex(c, r)) cls += " goal";
      else if (isPenaltyMark(c, r)) cls += " mark";
      poly.setAttribute("class", cls);
    });
  }

  function paintBoard() {
    resetHexClasses();
    const focusSide = state.selectedId ? byId(state.selectedId).side : "A";
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const pr = pressureOn([c, r], focusSide);
        if (pr.pts <= 0) continue;
        const n = hexNodes[c + "," + r];
        if (!n || isGoalHex(c, r)) continue;
        n.classList.add(pr.pts >= 2 ? "pressure2" : "pressure1");
      }
    }
    state.reachable.forEach((pos) => {
      const n = hexNodes[pos[0] + "," + pos[1]];
      if (!n) return;
      n.classList.add("reachable");
      if (state.ballOwner === state.selectedId) {
        const pr = pressureOn(pos, "A").pts;
        if (pr >= 2) n.classList.add("carry-danger");
        else if (pr === 1) n.classList.add("carry-risk");
      }
    });
    state.targets.forEach((pos) => {
      const n = hexNodes[pos[0] + "," + pos[1]];
      if (n) n.classList.add("target");
    });
    if (state.loose) {
      const n = hexNodes[state.ball[0] + "," + state.ball[1]];
      if (n) n.classList.add("loose");
    }
  }

  function openRadial(playerId) {
    const p = byId(playerId);
    if (!p || p.side !== "A" || state.turn !== "A" || state.waiting || state.over) return;
    if (isLocked(playerId)) {
      toast("После отбора этому игроку больше нельзя отдавать команды в этом ходу");
      return;
    }
    state.selectedId = playerId;
    state.radialOpen = true;
    state.mode = null;
    state.reachable = [];
    state.targets = [];
    const pt = pctFromHex(p.pos[0], p.pos[1]);
    radialEl.style.left = pt.left + "%";
    radialEl.style.top = pt.top + "%";
    radialEl.classList.add("open");
    radialEl.classList.remove("cancel-only");
    // disable actions that don't apply
    radialEl.querySelectorAll(".radial-btn").forEach((btn) => {
      const m = btn.dataset.mode;
      let ok = state.ap > 0;
      if (m === "pass" || m === "cross" || m === "shot") ok = ok && state.ballOwner === p.id;
      if (m === "tackle") {
        const range = actionRange(p, "tackle");
        ok =
          ok &&
          (state.loose
            ? hexDist(p.pos, state.ball) <= range
            : !!(ownerPlayer() && ownerPlayer().side === "B" && hexDist(p.pos, ownerPlayer().pos) <= range));
      }
      btn.disabled = !ok;
      btn.style.opacity = ok ? "1" : "0.35";
    });
    syncPieces(false);
    paintBoard();
    renderLeft();
    updatePreview();
  }

  function closeRadial() {
    state.radialOpen = false;
    if (radialEl) {
      radialEl.classList.remove("open");
      radialEl.classList.remove("cancel-only");
    }
  }

  function cancelRadialOrMode() {
    if (state.mode) {
      state.mode = null;
      state.reachable = [];
      state.targets = [];
      closeRadial();
      paintBoard();
      renderLeft();
      updatePreview();
      toast("Действие отменено");
      return;
    }
    closeRadial();
    updatePreview();
  }

  function showRadialCancelOnly() {
    if (!radialEl || !state.selectedId) return;
    const p = byId(state.selectedId);
    if (!p) return;
    const pt = pctFromHex(p.pos[0], p.pos[1]);
    radialEl.style.left = pt.left + "%";
    radialEl.style.top = pt.top + "%";
    radialEl.classList.remove("open");
    radialEl.classList.add("cancel-only");
    state.radialOpen = false;
  }

  function chooseRadial(mode) {
    const p = byId(state.selectedId);
    if (!p) return;
    state.mode = mode;
    state.reachable = [];
    state.targets = [];
    showRadialCancelOnly();
    if (mode === "move") {
      const bud = actionRange(p, "move");
      state.reachable = cellsInRange(p.pos, bud).filter((pos) => canStandOn(pos, p.id));
      if (state.loose) {
        const d = hexDist(p.pos, state.ball);
        if (d > 0 && d <= bud && canStandOn(state.ball, p.id)) {
          if (!state.reachable.some((x) => x[0] === state.ball[0] && x[1] === state.ball[1])) {
            state.reachable.push(state.ball.slice());
          }
        }
      }
      const raw = state.ballOwner === p.id && p.burst ? p.accel : p.speed;
      const deb = state.ballOwner === p.id ? carrySpeedDebuff(p.control || 1) : 0;
      const tag =
        (state.ballOwner === p.id && p.burst ? "рывок A" : "скор. S") +
        raw +
        (deb ? "−" + deb : "") +
        "→" +
        bud +
        " гекс";
      toast("Ход до " + bud + " · " + tag);
    } else if (mode === "pass" || mode === "cross") {
      const range = actionRange(p, mode);
      Object.values(state.you).forEach((t) => {
        if (t.id !== p.id && hexDist(p.pos, t.pos) <= range) state.targets.push(t.pos.slice());
      });
      if (!state.targets.length) toast("Никто не в радиусе " + range);
      else toast("Партнёры в радиусе " + range);
    } else if (mode === "shot") {
      const range = actionRange(p, "shot");
      GOAL_COLS.forEach((c) => {
        const hex = [c, GOAL_B_ROW];
        if (hexDist(p.pos, hex) <= range) state.targets.push(hex);
      });
      if (!state.targets.length) toast("Ворота вне радиуса удара " + range);
      else toast("Клетка ворот в радиусе " + range);
    } else if (mode === "tackle") {
      const range = actionRange(p, "tackle");
      if (state.loose && hexDist(p.pos, state.ball) <= range) {
        if (hexDist(p.pos, state.ball) === 0) {
          closeRadial();
          doPickup(p, true);
          return;
        }
        state.targets.push(state.ball.slice());
      }
      const ow = ownerPlayer();
      if (ow && ow.side === "B" && hexDist(p.pos, ow.pos) <= range) state.targets.push(ow.pos.slice());
      if (!state.targets.length) toast("Цель отбора вне радиуса " + range);
      else toast("Отбор · радиус " + range);
    }
    paintBoard();
    renderLeft();
    updatePreview();
  }

  function cellsInRange(origin, range) {
    const out = [];
    for (let c = 0; c < COLS; c++)
      for (let r = 0; r < ROWS; r++) {
        const d = hexDist(origin, [c, r]);
        if (d > 0 && d <= range) out.push([c, r]);
      }
    return out;
  }

  function updatePreview(hoverHex) {
    const box = app.querySelector("#preview");
    if (!box) return;
    const p = state.selectedId ? byId(state.selectedId) : null;
    if (!p || !state.mode) {
      box.innerHTML = state.radialOpen
        ? "Выберите действие в радиальном меню"
        : "Клик по своему игроку → 5 опций";
      return;
    }
    if (state.mode === "move") {
      const bud = actionRange(p, "move");
      const raw = state.ballOwner === p.id && p.burst ? p.accel : p.speed;
      const deb = state.ballOwner === p.id ? carrySpeedDebuff(p.control || 1) : 0;
      let html =
        "<b>Ход</b> до <b>" +
        bud +
        "</b> · " +
        (state.ballOwner === p.id && p.burst ? "A" : "S") +
        raw +
        (deb ? " −" + deb + " (влад." + p.control + ")" : " без мяча") +
        " · устал." +
        (state.carryFatigue || 0);
      if (state.ballOwner === p.id && hoverHex) {
        const steps = hexDist(p.pos, hoverHex);
        const ch = chanceCarry(p, hoverHex, steps);
        html +=
          '<div class="pct" style="font-size:1.2rem">' +
          ch.keep +
          "%</div><div>" +
          ch.detail +
          "</div>";
      } else {
        html +=
          "<div class='muted'>Без мяча — полный S/A (до 5). С мячом −дебафф владения; каждая клетка ведения копит риск потери.</div>";
      }
      box.innerHTML = html;
      return;
    }
    if (state.mode === "shot") {
      const aim = hoverHex && isGoalHex(hoverHex[0], hoverHex[1]) === "B" ? hoverHex : [CENTER_COL, GOAL_B_ROW];
      const dive = aiGkDive("B");
      const ch = chanceShot(p, aim, dive);
      box.innerHTML =
        '<div class="mode-chip">Удар → ' +
        cellName(aim) +
        " · ВР → " +
        cellName([dive, GOAL_B_ROW]) +
        '</div><div class="pct">' +
        ch.chance +
        "%</div><div>" +
        ch.detail +
        "</div>";
      Object.values(hexNodes).forEach((n) => n.classList.remove("goal-dive"));
      const dn = hexNodes[dive + "," + GOAL_B_ROW];
      if (dn) dn.classList.add("goal-dive");
      return;
    }
    if (state.mode === "pass" || state.mode === "cross") {
      box.innerHTML =
        "<b>" +
        modeLabel(state.mode) +
        "</b> радиус " +
        actionRange(p, state.mode) +
        ". В радиусе — без штрафа дистанции. Вне — почти мимо. Промах = свободный мяч.";
      return;
    }
    if (state.mode === "tackle")
      box.innerHTML =
        "<b>Отбор</b> радиус " +
        actionRange(p, "tackle") +
        " (атрибут÷2). Промах — мяч остаётся у владельца.";
  }

  function aiGkDive(side) {
    // AI picks one of 3 goal cols — weighted toward center / ball column
    const ow = ownerPlayer();
    const prefer = ow ? clamp(ow.pos[0], GOAL_COLS[0], GOAL_COLS[2]) : CENTER_COL;
    if (Math.random() < 0.55) return prefer;
    return GOAL_COLS[(Math.random() * 3) | 0];
  }

  function onPieceClick(id) {
    if (state.waiting || state.over) return;
    const p = byId(id);
    if (state.turn === "A" && state.mode && state.selectedId) {
      const sel = byId(state.selectedId);
      if (sel && sel.side === "A") {
        if ((state.mode === "pass" || state.mode === "cross") && p.side === "A" && p.id !== sel.id) {
          doPass(sel, p, state.mode === "cross");
          return;
        }
        if (state.mode === "tackle" && p.side === "B") {
          if (state.loose && state.ball[0] === p.pos[0] && state.ball[1] === p.pos[1]) {
            doPickup(sel, false);
            return;
          }
          doTackle(sel, p);
          return;
        }
        if (state.mode === "tackle" && state.loose && p.id === sel.id && hexDist(sel.pos, state.ball) === 0) {
          doPickup(sel, true);
          return;
        }
      }
    }
    if (p.side === "A" && state.turn === "A") openRadial(id);
  }

  function onHexClick(c, r) {
    if (state.waiting || state.over || state.turn !== "A") return;
    if (state.radialOpen) {
      closeRadial();
      return;
    }
    const p = byId(state.selectedId);
    if (!p || p.side !== "A" || !state.mode) return;

    if (state.mode === "move") {
      if (!state.reachable.some((x) => x[0] === c && x[1] === r)) return;
      doMove(p, [c, r]);
      return;
    }
    if (state.mode === "shot") {
      if (!isGoalHex(c, r) || r !== GOAL_B_ROW) {
        toast("Выберите одну из 3 клеток ворот");
        return;
      }
      if (!state.targets.some((x) => x[0] === c && x[1] === r)) {
        toast("Вне радиуса удара");
        return;
      }
      doShot(p, [c, r]);
      return;
    }
    if (state.mode === "tackle" && state.loose && c === state.ball[0] && r === state.ball[1]) {
      if (hexDist(p.pos, state.ball) <= actionRange(p, "tackle")) doPickup(p);
    }
  }

  function spendAP(moveId, fromPos) {
    if (moveId) markActed(moveId);
    else if (state.selectedId) markActed(state.selectedId);
    state.ap -= 1;
    state.mode = null;
    state.reachable = [];
    state.targets = [];
    closeRadial();
    syncPieces(true, moveId, fromPos);
    renderLeft();
    renderRight();
    paintBoard();
    updatePreview();
    if (state.ap <= 0 && !state.over) endPlayerTurn();
  }

  function doMove(p, to) {
    const from = p.pos.slice();
    const carrying = state.ballOwner === p.id;
    const usedBurst = carrying && p.burst;
    const bud = moveBudget(p);
    const steps = hexDist(from, to);
    if (steps > bud) {
      toast("Дальше лимита хода (" + bud + ")");
      return;
    }
    p.pos = to.slice();
    if (carrying) {
      const ch = chanceCarry(p, to, steps);
      const roll = rnd();
      pushLog(
        p.name +
          " ведёт → " +
          cellName(to) +
          " · " +
          (usedBurst ? "A" + p.accel : "S" + p.speed) +
          " · " +
          ch.detail +
          " · бросок " +
          Math.round(roll)
      );
      if (roll <= ch.keep) {
        state.ball = to.slice();
        state.loose = false;
        state.carryFatigue = (state.carryFatigue || 0) + steps;
        pushLog("Мяч удержан · усталость ведения " + state.carryFatigue);
      } else {
        state.ballOwner = null;
        state.loose = true;
        state.ball = to.slice();
        resetCarryFatigue();
        pushLog("Потеря на ведении! Свободный мяч @ " + cellName(to), true);
        toast("Потеря мяча");
      }
    } else {
      pushLog(p.name + " → " + cellName(to) + " · S" + p.speed + " (ход " + steps + "/" + bud + ")");
      if (state.loose && state.ball[0] === to[0] && state.ball[1] === to[1]) {
        claimLoose(p, true);
      }
    }
    if (usedBurst) p.burst = false;
    else if (carrying) p.burst = false;
    spendAP(p.id, from);
  }

  /** sure=true: мяч под ногами / наступил — без провала */
  function claimLoose(p, sure) {
    if (!state.loose) return false;
    const dist = hexDist(p.pos, state.ball);
    if (dist > actionRange(p, "tackle") && !sure) return false;
    if (sure || dist === 0) {
      state.ballOwner = p.id;
      state.loose = false;
      state.ball = p.pos.slice();
      p.burst = true;
      resetCarryFatigue();
      pushLog(p.name + " подобрал мяч", true);
      return true;
    }
    const ch = clamp(55 + skillPct(p.tackle) * 0.35, 40, 92);
    const roll = rnd();
    if (roll <= ch) {
      state.ballOwner = p.id;
      state.loose = false;
      state.ball = p.pos.slice();
      p.burst = true;
      resetCarryFatigue();
      pushLog(p.name + " подобрал мяч (" + ch + "%)", true);
      return true;
    }
    pushLog(p.name + " не зафиксировал мяч (" + ch + "%)");
    return false;
  }

  function doPickup(p, sure) {
    if (!state.loose) {
      toast("Мяч не свободен");
      return;
    }
    if (hexDist(p.pos, state.ball) > actionRange(p, "tackle")) {
      toast("Мяч вне радиуса");
      return;
    }
    claimLoose(p, !!sure || hexDist(p.pos, state.ball) === 0);
    spendAP();
  }

  function doPass(from, to, isCross) {
    const mode = isCross ? "cross" : "pass";
    if (!inActionRange(from, to.pos, mode)) {
      toast("Вне радиуса " + actionRange(from, mode));
      return;
    }
    const ch = chancePassLike(from, to.pos, mode);
    const roll = rnd();
    pushLog(
      (isCross ? "Навес" : "Пас") +
        " " +
        from.name +
        " → " +
        to.name +
        " · " +
        ch.chance +
        "% (" +
        Math.round(roll) +
        ") · " +
        ch.detail
    );
    if (roll <= ch.chance) {
      state.ballOwner = to.id;
      state.ball = to.pos.slice();
      state.loose = false;
      to.burst = true;
      from.burst = false;
      resetCarryFatigue();
      pushLog("Точно!", true);
    } else {
      state.ball = [
        clamp(Math.round((from.pos[0] + to.pos[0]) / 2), 0, COLS - 1),
        clamp(Math.round((from.pos[1] + to.pos[1]) / 2), 0, ROWS - 1),
      ];
      state.ballOwner = null;
      state.loose = true;
      resetCarryFatigue();
      pushLog("Свободный мяч @ " + cellName(state.ball), true);
    }
    spendAP(from.id);
  }

  function doShot(p, goalHex) {
    const dive = aiGkDive("B");
    const ch = chanceShot(p, goalHex, dive);
    const roll = rnd();
    pushLog(
      "Удар " +
        p.name +
        " в " +
        cellName(goalHex) +
        " · ВР → " +
        cellName([dive, GOAL_B_ROW]) +
        " · " +
        ch.chance +
        "% (" +
        Math.round(roll) +
        ") · " +
        ch.detail
    );
    state.ballOwner = null;
    state.loose = false;
    state.ball = p.pos.slice();
    resetCarryFatigue();
    syncPieces(false);
    state.waiting = true;

    const scored = roll <= ch.chance && !ch.blockLikely;
    setTimeout(() => {
      if (scored) {
        state.ball = goalHex.slice();
        syncPieces(true);
        state.score[0] += 1;
        pushLog("ГОЛ! Мяч в " + cellName(goalHex), true);
        toast("ГОЛ!");
        setTimeout(() => {
          resetKickoff("B");
          state.waiting = false;
          spendAP();
        }, 700);
      } else {
        state.ball = [clamp(goalHex[0] + (dive === goalHex[0] ? 0 : goalHex[0] - dive), 0, COLS - 1), clamp(GOAL_B_ROW - 2, 0, ROWS - 1)];
        // if GK guessed, often catch
        if (dive === goalHex[0] && Math.random() < 0.55) {
          state.ballOwner = "B.GK";
          state.them.GK.pos = [dive, GOAL_B_ROW];
          state.ball = state.them.GK.pos.slice();
          state.loose = false;
          pushLog("ВР поймал! Угадал клетку.", true);
        } else {
          state.loose = true;
          pushLog(ch.blockLikely ? "Блок / Σдавление!" : dive === goalHex[0] ? "Сейв / отбил" : "Мимо — свободный мяч", true);
        }
        syncPieces(true);
        state.waiting = false;
        spendAP();
      }
    }, 280);
  }

  function doTackle(p, victim) {
    if (isLocked(p.id)) {
      toast("Игрок уже отбирал в этом ходу");
      return;
    }
    const range = actionRange(p, "tackle");
    if (hexDist(p.pos, victim.pos) > range) {
      toast("Вне радиуса отбора " + range);
      return;
    }
    if (!victim || state.ballOwner !== victim.id) {
      toast("У цели нет мяча");
      return;
    }
    const ch = chanceTackle(p, victim);
    const roll = rnd();
    pushLog("Отбор " + p.name + " → " + victim.name + " · " + ch.chance + "% · " + ch.detail);
    if (roll <= ch.chance) {
      state.ballOwner = p.id;
      state.ball = p.pos.slice();
      state.loose = false;
      p.burst = true;
      victim.burst = false;
      resetCarryFatigue();
      pushLog("Мяч отобран!", true);
    } else {
      pushLog("Отбор не вышел — мяч у " + victim.name, true);
    }
    lockPlayer(p.id, "отбор");
    spendAP(p.id);
  }

  function resetKickoff(ownerSide) {
    Object.values(state.you).forEach((p) => (p.pos = p.home.slice()));
    Object.values(state.them).forEach((p) => (p.pos = p.home.slice()));
    state.ball = [CENTER_COL, HALF_ROW];
    if (ownerSide === "A") {
      state.you.NAP.pos = [CENTER_COL, HALF_ROW];
      state.ballOwner = "A.NAP";
      state.you.NAP.burst = true;
    } else {
      state.them.NAP.pos = [CENTER_COL, HALF_ROW];
      state.ballOwner = "B.NAP";
      state.them.NAP.burst = true;
    }
    state.loose = false;
    resetCarryFatigue();
    pushLog("Розыгрыш с центра.");
    syncPieces(true);
  }

  function endPlayerTurn() {
    if (state.over || state.turn !== "A") return;
    closeRadial();
    state.ap = 0;
    state.mode = null;
    state.reachable = [];
    state.targets = [];
    holdFormation("A", state.actedIds.concat(state.lockedIds));
    state.turn = "B";
    pushLog("— Ход соперника —");
    renderLeft();
    renderRight();
    paintBoard();
    syncPieces(true);
    state.waiting = true;
    setTimeout(runAI, 400);
  }

  function endAITurn() {
    holdFormation("B", state.aiLocked || []);
    holdFormation("A", state.actedIds); // подтянуть своих перед новым ходом
    state.turn = "A";
    state.ap = COACH_AP;
    state.lockedIds = [];
    state.actedIds = [];
    state.minute = Math.min(MATCH_MINUTES, state.minute + 1);
    state.waiting = false;
    state.selectedId = null;
    pushLog("— Ваш ход (2 AP) — · " + state.minute + "'", true);
    if (state.minute >= MATCH_MINUTES) {
      endMatch();
      return;
    }
    render();
  }

  function endMatch() {
    state.over = true;
    const msg =
      state.score[0] > state.score[1] ? "Победа!" : state.score[0] < state.score[1] ? "Поражение" : "Ничья";
    pushLog("Финал " + state.score[0] + ":" + state.score[1] + " — " + msg, true);
    toast(msg + " " + state.score[0] + ":" + state.score[1]);
    renderLeft();
    renderRight();
  }

  function runAI() {
    const opp = OPPONENTS.find((x) => x.id === state.opponentId);
    let ap = COACH_AP;
    state.aiLocked = [];
    const step = () => {
      if (ap <= 0 || state.over) {
        setTimeout(endAITurn, 280);
        return;
      }
      aiAction(opp.ai);
      ap -= 1;
      syncPieces(true);
      paintBoard();
      renderLeft();
      renderRight();
      setTimeout(step, 520);
    };
    step();
  }

  function aiAction(style) {
    if (state.loose) {
      // 1) уже стоит на мяче — всегда забирает
      const onBall = Object.values(state.them).find(
        (p) => p.pos[0] === state.ball[0] && p.pos[1] === state.ball[1]
      );
      if (onBall) {
        claimLoose(onBall, true);
        return;
      }
      // 2) ближайший бежит на клетку мяча / подбирает
      const near = Object.values(state.them)
        .filter((p) => p.role !== "GK")
        .sort((a, b) => hexDist(a.pos, state.ball) - hexDist(b.pos, state.ball))[0];
      if (near) {
        const d = hexDist(near.pos, state.ball);
        const bud = actionRange(near, "move");
        if (d <= actionRange(near, "tackle") && d > 0 && Math.random() < 0.45) {
          claimLoose(near, false);
          if (!state.loose) return;
        }
        if (d <= bud && !occupant(state.ball)) {
          // шаг на мяч
          const opts = cellsInRange(near.pos, bud)
            .filter((pos) => canStandOn(pos, near.id))
            .sort((a, b) => hexDist(a, state.ball) - hexDist(b, state.ball));
          // предпочесть саму клетку мяча
          const onto = opts.find((pos) => pos[0] === state.ball[0] && pos[1] === state.ball[1]) || opts[0];
          if (onto) {
            near.pos = onto;
            pushLog("ПК " + near.name + " → " + cellName(onto));
            if (onto[0] === state.ball[0] && onto[1] === state.ball[1]) {
              claimLoose(near, true);
            }
            return;
          }
        }
        aiMoveToward(near, state.ball);
        if (state.loose && near.pos[0] === state.ball[0] && near.pos[1] === state.ball[1]) {
          claimLoose(near, true);
        }
        return;
      }
    }
    const ow = ownerPlayer();
    if (ow && ow.side === "B") {
      const ch = chanceShot(ow, [CENTER_COL, GOAL_A_ROW], null);
      if (ow.pos[1] <= 4 && !ch.outOfRange && ch.chance >= 30 && ch.pressure < 2) {
        aiShot(ow);
        return;
      }
      if (style === "width") return aiWidth(ow);
      if (style === "collapse") return aiCollapse(ow);
      if (style === "shape") return aiShape(ow);
      return aiSmart(ow);
    }
    return aiDefend();
  }

  function aiShot(ow) {
    const dive = aiGkDive("A");
    const aim = GOAL_COLS.includes(ow.pos[0]) ? ow.pos[0] : CENTER_COL;
    const goalHex = [aim, GOAL_A_ROW];
    const ch = chanceShot(ow, goalHex, dive);
    const roll = rnd();
    pushLog("ПК удар в " + cellName(goalHex) + " · ваш ВР → " + cellName([dive, GOAL_A_ROW]) + " · " + ch.chance + "%");
    state.ballOwner = null;
    if (roll <= ch.chance && ch.pressure < 2) {
      state.ball = goalHex;
      state.score[1] += 1;
      pushLog("ГОЛ соперника!", true);
      toast("Гол ПК");
      resetKickoff("A");
    } else if (dive === aim && Math.random() < 0.5) {
      state.ballOwner = "A.GK";
      state.you.GK.pos = [dive, GOAL_A_ROW];
      state.ball = state.you.GK.pos.slice();
      state.loose = false;
      resetCarryFatigue();
      pushLog("Ваш ВР поймал!", true);
    } else {
      state.loose = true;
      state.ball = [aim, 2];
      resetCarryFatigue();
      pushLog("ПК не забил");
    }
  }

  function freest(from, preferWide) {
    let best = null;
    let bestS = -999;
    Object.values(state.them).forEach((t) => {
      if (t.id === from.id || t.role === "GK") return;
      const mode = hexDist(from.pos, t.pos) > actionRange(from, "pass") ? "cross" : "pass";
      if (hexDist(from.pos, t.pos) > actionRange(from, mode)) return;
      const pr = pressureOn(t.pos, "B").pts;
      const forward = from.pos[1] - t.pos[1];
      const wide = Math.abs(t.pos[0] - CENTER_COL);
      let s = -pr * 4 + forward * 2 + (preferWide ? wide : -wide * 0.2);
      if (s > bestS) {
        bestS = s;
        best = t;
      }
    });
    return best;
  }

  function aiPass(from, to, isCross) {
    const mode = isCross ? "cross" : "pass";
    if (!inActionRange(from, to.pos, mode)) {
      aiMoveToward(from, to.pos);
      return;
    }
    const ch = chancePassLike(from, to.pos, mode);
    const roll = rnd();
    pushLog("ПК передача · " + ch.chance + "% · " + ch.detail);
    if (roll <= ch.chance) {
      state.ballOwner = to.id;
      state.ball = to.pos.slice();
      state.loose = false;
      to.burst = true;
      from.burst = false;
      resetCarryFatigue();
    } else {
      state.ballOwner = null;
      state.loose = true;
      resetCarryFatigue();
      state.ball = [
        clamp(Math.round((from.pos[0] + to.pos[0]) / 2), 0, 12),
        clamp(Math.round((from.pos[1] + to.pos[1]) / 2), 0, 20),
      ];
      pushLog("ПК: свободный мяч");
    }
  }

  function aiMoveToward(p, target) {
    const bud = moveBudget(p);
    const from = p.pos.slice();
    const opts = cellsInRange(p.pos, bud).filter((pos) => canStandOn(pos, p.id));
    if (!opts.length) return;
    const carrying = state.ballOwner === p.id;
    opts.sort((a, b) => {
      const da = hexDist(a, target) - hexDist(b, target);
      if (!carrying) return da;
      const pa = pressureOn(a, p.side).pts;
      const pb = pressureOn(b, p.side).pts;
      const ra = pa >= 2 ? 100 : pa;
      const rb = pb >= 2 ? 100 : pb;
      return ra - rb || da;
    });
    const to = opts[0];
    const steps = hexDist(from, to);
    const usedBurst = carrying && p.burst;
    p.pos = to;
    if (carrying) {
      const ch = chanceCarry(p, to, steps);
      const roll = rnd();
      pushLog(
        "ПК " +
          p.name +
          " ведёт → " +
          cellName(to) +
          " · " +
          (usedBurst ? "A" + p.accel : "S" + p.speed) +
          " · удержать " +
          ch.keep +
          "% · устал." +
          ch.fatigue
      );
      if (roll <= ch.keep) {
        state.ball = to.slice();
        state.loose = false;
        state.carryFatigue = (state.carryFatigue || 0) + steps;
      } else {
        state.ballOwner = null;
        state.loose = true;
        state.ball = to.slice();
        resetCarryFatigue();
        pushLog("ПК потерял мяч на ведении!", true);
      }
    } else {
      pushLog("ПК " + p.name + " → " + cellName(p.pos) + " · S" + p.speed);
      if (state.loose && p.pos[0] === state.ball[0] && p.pos[1] === state.ball[1]) {
        claimLoose(p, true);
      }
    }
    if (usedBurst || carrying) p.burst = false;
    const el = pieceEls[p.id];
    if (el) {
      el.style.transition = "left " + moveMs(from, to) + "ms ease, top " + moveMs(from, to) + "ms ease";
    }
  }

  function aiSmart(ow) {
    const recv = freest(ow, true);
    if (recv && pressureOn(recv.pos, "B").pts === 0 && recv.pos[1] < ow.pos[1]) {
      aiPass(ow, recv, hexDist(ow.pos, recv.pos) > actionRange(ow, "pass"));
      return;
    }
    aiMoveToward(ow, [CENTER_COL, 2]);
  }
  function aiWidth(ow) {
    const recv = freest(ow, true);
    if (recv && Math.abs(recv.pos[0] - CENTER_COL) >= 3) {
      aiPass(ow, recv, true);
      return;
    }
    aiMoveToward(ow, [ow.pos[0] < 6 ? 1 : 11, Math.max(2, ow.pos[1] - 3)]);
  }
  /** Слабый соперник: почти не тащит сам, пас назад/в ширину, форма не схлопывается */
  function aiShape(ow) {
    if ((state.carryFatigue || 0) >= 2 || pressureOn(ow.pos, "B").pts >= 1) {
      const safe = Object.values(state.them)
        .filter((t) => t.id !== ow.id && t.role !== "GK")
        .sort((a, b) => pressureOn(a.pos, "B").pts - pressureOn(b.pos, "B").pts)[0];
      if (safe && inActionRange(ow, safe.pos, "pass")) {
        aiPass(ow, safe, false);
        return;
      }
    }
    const recv = freest(ow, true);
    if (recv) {
      aiPass(ow, recv, hexDist(ow.pos, recv.pos) > 3);
      return;
    }
    // короткий шаг, не бег через всё поле
    aiMoveToward(ow, [clamp(ow.pos[0], 2, 10), Math.max(3, ow.pos[1] - 1)]);
  }
  function aiCollapse(ow) {
    // только З чуть поджимает — края не схлопываются
    const z = state.them.Z;
    if (z && hexDist(z.pos, ow.pos) > 3) {
      const opts = cellsInRange(z.pos, 1).filter((pos) => canStandOn(pos, z.id));
      opts.sort((a, b) => hexDist(a, ow.pos) - hexDist(b, ow.pos));
      if (opts[0]) z.pos = opts[0];
    }
    aiMoveToward(ow, [CENTER_COL, 3]);
  }
  function aiDefend() {
    const target = state.loose ? state.ball : ownerPlayer() ? ownerPlayer().pos : state.ball;
    const hunters = Object.values(state.them)
      .filter((p) => p.role !== "GK" && (state.aiLocked || []).indexOf(p.id) < 0)
      .sort((a, b) => hexDist(a.pos, target) - hexDist(b.pos, target));
    const h = hunters[0];
    if (!h) {
      holdFormation("B", [], true);
      return;
    }
    if ((h.role === "OP1" || h.role === "OP2") && Math.abs(h.home[0] - target[0]) > 4) {
      holdFormation("B", [], true);
      aiMoveToward(h, h.home);
      return;
    }
    const ow = ownerPlayer();
    const range = actionRange(h, "tackle");
    if (ow && ow.side === "A" && hexDist(h.pos, ow.pos) <= range) {
      const ch = chanceTackle(h, ow);
      let chance = ch.chance;
      if (state.opponentId === "academy") chance = Math.round(chance * 0.7);
      const roll = rnd();
      pushLog("ПК отбор · " + chance + "%");
      if (roll <= chance) {
        state.ballOwner = h.id;
        state.ball = h.pos.slice();
        state.loose = false;
        h.burst = true;
        resetCarryFatigue();
        pushLog("ПК отобрал!", true);
      } else {
        pushLog("ПК отбор мимо — мяч у " + ow.name);
      }
      state.aiLocked = state.aiLocked || [];
      state.aiLocked.push(h.id);
      return;
    }
    aiMoveToward(h, target);
    holdFormation("B", [h.id].concat(state.aiLocked || []), true);
  }

  render();
})();
