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
  const COACH_AP = 3;
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
  function cubeToOffset(cube) {
    const c = cube.x;
    const r = cube.z + ((cube.x - (cube.x & 1)) >> 1);
    return [c, r];
  }
  function cubeRound(frac) {
    let rx = Math.round(frac.x);
    let ry = Math.round(frac.y);
    let rz = Math.round(frac.z);
    const xDiff = Math.abs(rx - frac.x);
    const yDiff = Math.abs(ry - frac.y);
    const zDiff = Math.abs(rz - frac.z);
    if (xDiff > yDiff && xDiff > zDiff) rx = -ry - rz;
    else if (yDiff > zDiff) ry = -rx - rz;
    else rz = -rx - ry;
    return { x: rx, y: ry, z: rz };
  }
  /** Клетки пути from→to (без старта, с финишем) */
  function hexLine(from, to) {
    const n = hexDist(from, to);
    if (n <= 0) return [];
    const A = offsetToCube(from[0], from[1]);
    const B = offsetToCube(to[0], to[1]);
    const Bend = { x: B.x + 1e-6, y: B.y + 2e-6, z: B.z - 3e-6 };
    const out = [];
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const frac = {
        x: A.x + (Bend.x - A.x) * t,
        y: A.y + (Bend.y - A.y) * t,
        z: A.z + (Bend.z - A.z) * t,
      };
      out.push(cubeToOffset(cubeRound(frac)));
    }
    return out;
  }
  function inBounds(c, r) {
    return c >= 0 && r >= 0 && c < COLS && r < ROWS;
  }
  function cellName(pos) {
    return String.fromCharCode(65 + pos[0]) + (pos[1] + 1);
  }
  function parseCellName(name) {
    if (!name || typeof name !== "string") return null;
    const m = /^([A-Ma-m])(\d{1,2})$/.exec(name.trim());
    if (!m) return null;
    const c = m[1].toUpperCase().charCodeAt(0) - 65;
    const r = parseInt(m[2], 10) - 1;
    if (!inBounds(c, r)) return null;
    return [c, r];
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
            if (state.mode === "move") updatePreview([c, r]);
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
    NAP: { name: "Сомов", shot: 4, pass: 2, cross: 2, tackle: 2, speed: 5, accel: 4, control: 3, press: 0, pos: [6, 8] },
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
      id: "vertical",
      name: "«Прямой Удар»",
      tier: "equal",
      tierLabel: "Равный · вертикаль",
      tactics: "Быстрый выход",
      desc: "Равный соперник, играет вперёд.",
      mult: 1.0,
      ai: "direct",
      names: { GK: "Резкий", Z: "Ось", OP1: "Рывок", OP2: "Прорыв", NAP: "Пика" },
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

  function buildSquad(side, names, mult, skillSpread) {
    const squad = {};
    const spread = skillSpread || 0;
    ["GK", "Z", "OP1", "OP2", "NAP"].forEach((role) => {
      const src = YOU_BASE[role];
      const scaled = scaleSkills(src, mult == null ? 1 : mult);
      if (spread > 0) {
        ["shot", "pass", "cross", "tackle", "speed", "accel", "control"].forEach((k) => {
          const jitter = ((Math.random() * 2 - 1) * spread);
          scaled[k] = clamp(Math.round(scaled[k] + jitter), 1, 5);
        });
      }
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

  function squadSkillSnapshot(squad) {
    const rows = {};
    Object.keys(squad || {}).forEach((role) => {
      const p = squad[role];
      rows[role] = {
        name: p.name,
        shot: p.shot,
        pass: p.pass,
        cross: p.cross,
        tackle: p.tackle,
        speed: p.speed,
        accel: p.accel,
        control: p.control,
      };
    });
    const vals = Object.values(rows).flatMap((r) => [r.shot, r.pass, r.cross, r.tackle, r.speed, r.accel, r.control]);
    const avg = vals.reduce((a, b) => a + b, 0) / Math.max(1, vals.length);
    return { avg: +avg.toFixed(2), players: rows };
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
    reachYellow: 0,
    reachGold: 0,
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
    stats: null,
    watchPlay: false,
    watchDelay: 420,
    homeAiStyle: "direct",
    awayAiStyle: null,
    homeLabel: "Дом",
    awayLabel: "Гости",
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
    // раньше «зона 14»: удар из mid-final трети не мёртвый
    return clamp(1.22 - dist * 0.075, 0.18, 1.25);
  }

  /** 1–5 → базовый % успеха внутри радиуса */
  function skillPct(attr) {
    return 18 + attr * 14; // 1→32 … 5→88
  }

  /** Радиус: пас = N×2, удар = N+2 (кромка штрафной), отбор = N/2, навес = N×2; ход = A/S */
  function actionRange(p, mode) {
    if (mode === "pass") return (p.pass || 1) * 2;
    if (mode === "shot") return (p.shot || 1) + 2;
    if (mode === "cross") return p.cross * 2;
    if (mode === "tackle") return Math.max(1, Math.round(p.tackle / 2));
    if (mode === "move") return moveBudget(p);
    return 1;
  }

  /** Эффективный скилл паса ×2 (карточка 1–5 → до 5 для %) */
  function passSkillAttr(p) {
    return clamp((p.pass || 1) * 2, 1, 5);
  }

  /**
   * Без мяча: S/A = гексы (1–5).
   * С мячом: дебафф к дистанции от низкого владения + усталость ведения режет % удержания.
   */
  function carrySpeedDebuff(control) {
    // было floor((5−c)/2); режем в ~3 раза → почти не режет ход, control 1 даёт −1
    const raw = Math.max(0, Math.floor((5 - clamp(control, 1, 5)) / 2));
    return Math.max(0, Math.round(raw / 3));
  }

  function moveBudget(p) {
    const raw = state.ballOwner === p.id && p.burst ? p.accel : p.speed;
    let hexes = clamp(raw, 1, 5);
    if (state.ballOwner === p.id) {
      hexes = Math.max(1, hexes - carrySpeedDebuff(p.control || 1));
    }
    return hexes;
  }

  /**
   * Ход как в XCOM: два кольца на одном бюджете.
   * Жёлтый — половина (короткий шаг), золотой — полный рывок/S.
   * Любая клетка в золотом (включая 1 гекс) кликабельна.
   */
  function moveBands(p) {
    const gold = moveBudget(p);
    const yellow = Math.max(1, Math.ceil(gold / 2));
    const raw = state.ballOwner === p.id && p.burst ? p.accel : p.speed;
    const tag = state.ballOwner === p.id && p.burst ? "A" + raw : "S" + raw;
    return { yellow, gold, tag };
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

  /**
   * Якорь схемы относительно линии мяча (ряд мяча).
   * Канал (колонка home) сохраняем; блок слегка плывёт с мячом по ширине (−2…+2).
   * Не магнит «все к мячу» — глубина по роли.
   */
  const FORM_DEPTH = {
    A: { Z: -3, OP1: -1, OP2: -1, NAP: 3 },
    B: { Z: 3, OP1: 1, OP2: 1, NAP: -3 },
  };

  function formationAnchor(p, side) {
    const ballCol = state.ball[0];
    const ballRow = state.ball[1];
    const blockShift = clamp(ballCol - CENTER_COL, -2, 2);
    let col = clamp((p.home ? p.home[0] : CENTER_COL) + blockShift, 0, COLS - 1);
    if (p.role === "OP1") col = clamp(col, 0, CENTER_COL);
    if (p.role === "OP2") col = clamp(col, CENTER_COL, COLS - 1);
    if (p.role === "GK") {
      col = clamp(CENTER_COL + clamp(ballCol - CENTER_COL, -1, 1), GOAL_COLS[0], GOAL_COLS[2]);
      const row =
        side === "A"
          ? clamp(Math.min(2, ballRow - 8), 0, 3)
          : clamp(Math.max(ROWS - 3, ballRow + 8), ROWS - 4, ROWS - 1);
      return [col, row];
    }
    const depth = (FORM_DEPTH[side] && FORM_DEPTH[side][p.role]) || 0;
    let row = ballRow + depth;
    if (side === "A") {
      row = clamp(row, p.role === "Z" ? 2 : 3, ROWS - 2);
      // не забегать за линию мяча слишком глубоко в чужую штрафную без смысла
      if (p.role === "Z" || p.role === "OP1" || p.role === "OP2") {
        row = Math.min(row, Math.max(ballRow - 1, 2));
      }
    } else {
      row = clamp(row, 1, p.role === "Z" ? ROWS - 3 : ROWS - 4);
      if (p.role === "Z" || p.role === "OP1" || p.role === "OP2") {
        row = Math.max(row, Math.min(ballRow + 1, ROWS - 3));
      }
    }
    return [col, row];
  }

  function skipBallOwnerIds(side) {
    if (!state.ballOwner) return [];
    if (side === "A" && String(state.ballOwner).charAt(0) === "A") return [state.ballOwner];
    if (side === "B" && String(state.ballOwner).charAt(0) === "B") return [state.ballOwner];
    return [];
  }

  /** Фаза владения по линии мяча: build → progress → finish */
  function attackPhase(side) {
    const r = state.ball[1];
    if (side === "A") {
      if (r <= HALF_ROW - 3) return "build";
      if (r >= GOAL_B_ROW - 8) return "finish";
      return "progress";
    }
    if (r >= HALF_ROW + 3) return "build";
    if (r <= GOAL_A_ROW + 8) return "finish";
    return "progress";
  }

  function microNeed(p, side) {
    const anchor = formationAnchor(p, side);
    const dist = hexDist(p.pos, anchor);
    const ballRow = state.ball[1];
    let need = dist;
    if (side === "A") {
      if (p.role === "NAP" && p.pos[1] < ballRow - 1) need += 8 + (ballRow - p.pos[1]);
      if (p.role === "NAP" && p.pos[1] <= 6) need += 6;
      if (p.pos[1] < anchor[1] - 1) need += 2;
    } else {
      if (p.role === "NAP" && p.pos[1] > ballRow + 1) need += 8 + (p.pos[1] - ballRow);
      if (p.role === "NAP" && p.pos[1] >= ROWS - 7) need += 6;
      if (p.pos[1] > anchor[1] + 1) need += 2;
    }
    return need;
  }

  function stepTowardAnchor(p, side, maxStep) {
    const anchor = formationAnchor(p, side);
    const dist = hexDist(p.pos, anchor);
    if (dist <= 0) return false;
    const ballRow = state.ball[1];
    const lagging =
      (side === "A" && p.role === "NAP" && p.pos[1] < ballRow - 1) ||
      (side === "B" && p.role === "NAP" && p.pos[1] > ballRow + 1);
    const step = Math.min(maxStep || (lagging ? 2 : 1), dist);
    let opts = cellsInRange(p.pos, step).filter((pos) => canStandOn(pos, p.id));
    if (p.role === "OP1") opts = opts.filter((pos) => pos[0] <= CENTER_COL + 1);
    if (p.role === "OP2") opts = opts.filter((pos) => pos[0] >= CENTER_COL - 1);
    if (p.role === "NAP" && side === "A" && ballRow >= HALF_ROW - 2) {
      const forward = opts.filter((pos) => pos[1] > p.pos[1]);
      if (forward.length) opts = forward;
    }
    if (p.role === "NAP" && side === "B" && ballRow <= HALF_ROW + 2) {
      const forward = opts.filter((pos) => pos[1] < p.pos[1]);
      if (forward.length) opts = forward;
    }
    opts.sort((a, b) => hexDist(a, anchor) - hexDist(b, anchor));
    if (!opts.length) return false;
    if (hexDist(opts[0], anchor) >= dist && !lagging) return false;
    p.pos = opts[0];
    return true;
  }

  /** 1–2 партнёра делают маленький шаг к роли после каждого AP */
  function microOffBall(side, opts) {
    opts = opts || {};
    const squad = side === "A" ? state.you : state.them;
    if (!squad) return 0;
    const skip = {};
    skipBallOwnerIds(side).forEach((id) => (skip[id] = true));
    (opts.skipIds || []).forEach((id) => (skip[id] = true));
    const maxMovers = opts.maxMovers != null ? opts.maxMovers : 2;
    const candidates = Object.values(squad)
      .filter((p) => p.role !== "GK" && !skip[p.id] && state.ballOwner !== p.id && !isLocked(p.id))
      .sort((a, b) => microNeed(b, side) - microNeed(a, side));
    let moved = 0;
    for (let i = 0; i < candidates.length && moved < maxMovers; i++) {
      const p = candidates[i];
      if (microNeed(p, side) < 1.2) break;
      const step = p.role === "NAP" && microNeed(p, side) >= 6 ? 2 : 1;
      if (stepTowardAnchor(p, side, step)) moved++;
    }
    return moved;
  }

  /** Неактивные к якорю в конце полного хода (сильнее, чем micro). */
  function holdFormation(side, skipIds, quiet) {
    const squad = side === "A" ? state.you : state.them;
    if (!squad) return;
    const skip = skipIds || [];
    let moved = 0;
    Object.values(squad).forEach((p) => {
      if (skip.indexOf(p.id) >= 0) return;
      if (state.ballOwner === p.id) return;
      const need = microNeed(p, side);
      if (need < 0.5) return;
      const step = p.role === "NAP" || need >= 8 ? 3 : 2;
      if (stepTowardAnchor(p, side, step)) moved++;
    });
    if (moved && !quiet) {
      pushLog(
        side === "A"
          ? "Оффбол: форма к мячу (" + moved + ")"
          : "ПК оффбол: форма к мячу (" + moved + ")"
      );
    }
  }

  function napOutOfPosition(side) {
    const squad = side === "A" ? state.you : state.them;
    if (!squad || !squad.NAP) return false;
    const nap = squad.NAP;
    const ballRow = state.ball[1];
    if (side === "A") return nap.pos[1] < Math.min(ballRow - 1, HALF_ROW - 1) || nap.pos[1] <= 5;
    return nap.pos[1] > Math.max(ballRow + 1, HALF_ROW + 1) || nap.pos[1] >= ROWS - 6;
  }

  function inActionRange(from, to, mode) {
    return hexDist(from.pos, to) <= actionRange(from, mode);
  }

  function chanceShot(p, goalHex, gkDiveCol) {
    const pr = pressureOn(p.pos, p.side);
    const range = actionRange(p, "shot");
    const dist = goalHex ? hexDist(p.pos, goalHex) : 99;
    let skill = skillPct(p.shot) * 0.88 * Math.max(0, 1 - 0.5 * pr.pts) * shotProximity(p.side, p.pos);
    let diveNote = "";
    let outOfRange = dist > range;
    if (outOfRange) skill *= 0.15;
    if (goalHex && gkDiveCol != null) {
      if (gkDiveCol === goalHex[0]) {
        skill *= 0.5; // было 0.35 — ВР сильный, но не убийца атаки
        diveNote = " · ВР угадал клетку (−50% шанса)";
      } else {
        diveNote = " · ВР прыгнул мимо";
      }
    }
    // Σ≥2 сильно режет %, но не запрещает гол навсегда
    if (pr.pts >= 2) skill *= 0.55;
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
        (blockLikely ? " · плотная сумма → тяжело" : ""),
    };
  }

  function chancePassLike(p, target, mode) {
    const pr = pressureOn(p.pos, p.side);
    const dist = hexDist(p.pos, target);
    const range = actionRange(p, mode);
    const isCross = mode === "cross";
    const attr = isCross ? p.cross : p.pass;
    const skillAttr = isCross ? attr : passSkillAttr(p);
    const label = isCross ? "Навес" : "Пас";
    // пас: скилл ×2 (через skillAttr); давление режет сильнее — под прессом короткий пас риск
    let skill = skillPct(skillAttr) * Math.max(0, 1 - 0.32 * pr.pts);
    const outOfRange = dist > range;
    if (outOfRange) skill *= isCross ? 0.12 : 0.2;
    // поперечный без прогресса — чуть хуже (стимул играть вперёд)
    if (!isCross && target && Math.abs(target[1] - p.pos[1]) <= 1 && Math.abs(target[0] - p.pos[0]) >= 2) {
      skill *= 0.88;
    }
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
        "/5" +
        (!isCross && skillAttr !== attr ? "→эфф." + skillAttr : "") +
        " · радиус " +
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
    // база ниже — без поддержки отбор реже «ломает» центр
    let skill = skillPct(p.tackle) * (0.38 + 0.1 * pr.pts);
    if (outOfRange) skill *= 0.1;
    return {
      chance: clamp(Math.round(skill), 5, 82),
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

  /**
   * Риск на КАЖДОЙ клетке пути (не только финиш).
   * Σ1 тяжело, Σ≥2 почти смерть — пролезть между ЗЩ опасно.
   */
  function keepChanceOnCell(p, hex, fatBefore) {
    const pr = pressureOn(hex, p.side);
    const ctrl = p.control || 1;
    // усталость ведения − в ~3 раза слабее прежнего perHex
    const perHex = Math.max(1, Math.round(Math.max(4, 14 - ctrl * 2) / 3));
    // Пустое поле: без давления почти надёжно; риск копится от усталости ведения.
    // Давление Σ1+ — основная угроза потери.
    let keep = 100 - fatBefore * perHex;
    if (pr.pts === 1) keep -= 38 - ctrl * 2;
    else if (pr.pts === 2) keep -= 72 - ctrl;
    else if (pr.pts >= 3) keep -= 88;
    return {
      keep: clamp(Math.round(keep), 2, pr.pts === 0 && fatBefore === 0 ? 100 : 98),
      pressure: pr.pts,
      parts: pr.parts,
    };
  }

  function previewCarryPath(p, from, to) {
    const path = hexLine(from, to);
    let surv = 1;
    let fat = state.carryFatigue || 0;
    let maxPr = 0;
    const bits = [];
    path.forEach((hex, i) => {
      const cell = keepChanceOnCell(p, hex, fat);
      surv *= cell.keep / 100;
      if (cell.pressure > maxPr) maxPr = cell.pressure;
      if (cell.pressure > 0) bits.push(cellName(hex) + " Σ" + cell.pressure + "@" + cell.keep + "%");
      fat += 1;
    });
    const combined = clamp(Math.round(surv * 100), 1, 97);
    return {
      path,
      combined,
      maxPr,
      fatigueEnd: fat,
      detail:
        "Путь " +
        path.map(cellName).join("→") +
        " · шанс пройти весь " +
        combined +
        "%" +
        (bits.length ? " · риск: " + bits.join(", ") : " · без давления на пути") +
        " · влад." +
        (p.control || 1) +
        " · устал." +
        (state.carryFatigue || 0) +
        "→" +
        fat,
    };
  }

  /** Пошаговый бросок на каждой клетке пути; при провале мяч падает на этой клетке */
  function resolveCarryPath(p, from, to) {
    const path = hexLine(from, to);
    let fat = state.carryFatigue || 0;
    const logBits = [];
    for (let i = 0; i < path.length; i++) {
      const hex = path[i];
      const cell = keepChanceOnCell(p, hex, fat);
      const roll = rnd();
      logBits.push(cellName(hex) + " Σ" + cell.pressure + " " + Math.round(roll) + "/" + cell.keep);
      if (roll > cell.keep) {
        return {
          ok: false,
          lostAt: hex.slice(),
          stepsDone: i + 1,
          path,
          detail: logBits.join(" · "),
          pressure: cell.pressure,
        };
      }
      fat += 1;
    }
    return {
      ok: true,
      stepsDone: path.length,
      path,
      fatigue: fat,
      detail: logBits.join(" · ") || "короткий шаг",
    };
  }

  function pushLog(msg, hi) {
    state.log.unshift({ msg, hi: !!hi });
    if (state.log.length > 80) state.log.pop();
    if (state.autoPlay && state.matchArchive) {
      state.matchArchive.push({ minute: state.minute, msg: msg, hi: !!hi });
    }
  }
  function toast(msg) {
    if (state.autoPlay) return;
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
    const homeStyles = [
      { id: "direct", label: "Прямой" },
      { id: "possess", label: "Владение" },
      { id: "width", label: "Ширина" },
    ];
    if (!state.homeAiStyle) state.homeAiStyle = "direct";
    app.innerHTML =
      '<section class="screen active"><div class="lobby-head"><h1>Pitch Tactics — Play</h1>' +
      '<p class="muted">5 соперников · DnD расстановка · радиальное меню · или <b>ИИ vs ИИ</b> на поле</p></div>' +
      '<div class="opp-grid" id="oppGrid"></div>' +
      '<div class="lineup-actions" style="flex-wrap:wrap;gap:8px;align-items:center">' +
      '<label class="muted" style="font-size:0.82rem">Стиль дома:&nbsp;' +
      '<select id="homeStyleSel" class="btn" style="padding:6px 10px">' +
      homeStyles
        .map(
          (s) =>
            '<option value="' +
            s.id +
            '"' +
            (state.homeAiStyle === s.id ? " selected" : "") +
            ">" +
            s.label +
            "</option>"
        )
        .join("") +
      "</select></label>" +
      '<button class="btn btn-primary" id="go" disabled>К расстановке →</button>' +
      '<button class="btn" id="watch" disabled>▶ Смотреть ИИ vs ИИ</button>' +
      '<button class="btn" id="watchRandom">🎲 Случайный матч</button></div>' +
      '<div class="hint-box">Выберите соперника и нажмите <b>Смотреть ИИ vs ИИ</b>, или сразу <b>Случайный матч</b>. URL: <code>?watch=random</code> / <code>?watch=rivals&amp;home=direct</code></div></section>';
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
    const styleSel = app.querySelector("#homeStyleSel");
    styleSel.onchange = () => {
      state.homeAiStyle = styleSel.value;
    };
    const go = app.querySelector("#go");
    const watchBtn = app.querySelector("#watch");
    go.disabled = !state.opponentId;
    watchBtn.disabled = !state.opponentId;
    go.onclick = () => {
      const opp = OPPONENTS.find((x) => x.id === state.opponentId);
      state.watchPlay = false;
      state.you = buildSquad("A", null, 1);
      state.them = buildSquad("B", opp.names, opp.mult);
      if (opp.id === "press" || opp.id === "elite") {
        state.them.Z.tackle = clamp(state.them.Z.tackle + 1, 1, 5);
        state.them.NAP.shot = clamp(state.them.NAP.shot + 1, 1, 5);
      }
      state.screen = "lineup";
      render();
    };
    watchBtn.onclick = () => {
      startWatchMatch({
        awayId: state.opponentId,
        homeStyle: (styleSel && styleSel.value) || state.homeAiStyle || "direct",
      });
    };
    app.querySelector("#watchRandom").onclick = () => startRandomWatchMatch();
  }

  function startRandomWatchMatch(extra) {
    const styles = ["direct", "possess", "width"];
    const opp = OPPONENTS[Math.floor(Math.random() * OPPONENTS.length)];
    const homeStyle = styles[Math.floor(Math.random() * styles.length)];
    const homeMult = 0.75 + Math.random() * 0.55;
    const awayMult = (opp.mult || 1) * (0.85 + Math.random() * 0.3);
    startWatchMatch(
      Object.assign(
        {
          awayId: opp.id,
          homeStyle,
          homeMult: +homeMult.toFixed(2),
          awayMult: +awayMult.toFixed(2),
          skillSpread: 0.35,
          delay: 280,
          homeName: "Дом (" + homeStyle + ")",
          awayName: opp.name,
        },
        extra || {}
      )
    );
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
      '<div class="hint-box">Ход как в XCOM: <b>жёлтый</b>/<b>золотой</b> радиус. В конце хода партнёры слегка подтягиваются к линии мяча (оффбол). С мячом −дебафф владения.</div></section>';

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

  function inCenterCircle(pos) {
    const c = pos[0];
    const r = pos[1];
    if (r === HALF_ROW) return true;
    return Math.abs(r - HALF_ROW) <= 1 && Math.abs(c - CENTER_COL) <= 2;
  }

  /** Принимающая сторона — своя половина, вне центрального круга (НП за кругом) */
  function placeReceivingKickoff(squad, side) {
    Object.values(squad).forEach((p) => {
      p.burst = false;
      let pos = (p.home && p.home.slice()) || p.pos.slice();
      if (side === "A") {
        // своя половина: ряд строго < HALF_ROW
        if (pos[1] >= HALF_ROW) pos[1] = HALF_ROW - 2;
      } else {
        if (pos[1] <= HALF_ROW) pos[1] = HALF_ROW + 2;
      }
      if (inCenterCircle(pos)) {
        pos[1] = side === "A" ? HALF_ROW - 2 : HALF_ROW + 2;
        if (Math.abs(pos[0] - CENTER_COL) <= 2 && pos[1] === (side === "A" ? HALF_ROW - 1 : HALF_ROW + 1)) {
          pos[1] = side === "A" ? HALF_ROW - 2 : HALF_ROW + 2;
        }
      }
      p.pos = pos;
    });
    if (squad.NAP) {
      // НП принимающих — за центральным кругом по центру
      squad.NAP.pos = [CENTER_COL, side === "A" ? HALF_ROW - 2 : HALF_ROW + 2];
    }
  }

  /** Партнёры у центра у разводящих; принимающие вне круга */
  function placeKickoffSupport(ownerSide) {
    const yours = ownerSide === "A";
    const kicking = yours ? state.you : state.them;
    const receiving = yours ? state.them : state.you;
    const recvSide = yours ? "B" : "A";
    const back = yours ? -2 : 2;
    const wingR = yours ? -1 : 1;
    kicking.NAP.pos = [CENTER_COL, HALF_ROW];
    kicking.NAP.burst = true;
    if (kicking.Z) kicking.Z.pos = [CENTER_COL, HALF_ROW + back];
    if (kicking.OP1) kicking.OP1.pos = [CENTER_COL - 2, HALF_ROW + wingR];
    if (kicking.OP2) kicking.OP2.pos = [CENTER_COL + 2, HALF_ROW + wingR];
    if (kicking.GK) kicking.GK.pos = kicking.GK.home.slice();
    Object.values(kicking).forEach((p) => {
      if (p.role !== "NAP") p.burst = false;
    });
    placeReceivingKickoff(receiving, recvSide);
  }

  function startMatch() {
    state.minute = 0;
    state.score = [0, 0];
    state.turn = "A";
    state.ap = COACH_AP;
    state.ball = [CENTER_COL, HALF_ROW];
    // Якоря схемы = расстановка; НП не якорим в центр (при чужом розыгрыше должен быть за кругом)
    Object.values(state.you).forEach((p) => {
      p.home = p.pos.slice();
      if (p.role === "NAP" && (p.home[1] >= HALF_ROW || inCenterCircle(p.home))) {
        p.home = [CENTER_COL, HALF_ROW - 2];
      }
    });
    Object.values(state.them).forEach((p) => {
      p.pos = p.home.slice();
      p.burst = false;
    });
    placeKickoffSupport("A");
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
    if (!state.stats) state.stats = emptyMatchStats();
    pushLog("Свисток! Партнёры у мяча — короткий пас или ведение. Клик → радиальное меню.", true);
    state.screen = "match";
    if (!state.autoPlay) render();
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
    const homeName = state.watchPlay ? state.homeLabel || "Дом" : "Вы";
    const awayName = state.watchPlay ? state.awayLabel || "Гости" : "ПК";
    const turnLabel = state.watchPlay
      ? state.turn === "A"
        ? "ИИ дом (" + (state.homeAiStyle || "direct") + ")"
        : "ИИ гости (" + (state.awayAiStyle || "—") + ")"
      : state.turn === "A"
        ? "Вы"
        : "Соперник";
    el.innerHTML =
      '<div class="scoreline"><span>' +
      homeName +
      " " +
      state.score[0] +
      '</span><span class="clock">' +
      String(state.minute) +
      "'</span><span>" +
      state.score[1] +
      " " +
      awayName +
      "</span></div>" +
      (state.watchPlay
        ? '<div class="mode-chip" style="margin:4px 0 8px;display:inline-block">👁 Просмотр ИИ vs ИИ</div>'
        : "") +
      (state.screen === "match"
        ? '<div class="muted" style="font-size:0.75rem;margin:0 0 6px">Фаза: <b>' +
          attackPhase(state.turn === "A" ? "A" : "B") +
          "</b>" +
          (napOutOfPosition("A") ? ' · <span style="color:#e8b04a">НП дом OOP</span>' : "") +
          (napOutOfPosition("B") ? ' · <span style="color:#e8b04a">НП гости OOP</span>' : "") +
          "</div>"
        : "") +
      '<div class="muted">Ход: <b>' +
      turnLabel +
      "</b>" +
      (state.mode ? ' · <span class="mode-chip">' + modeLabel(state.mode) + "</span>" : "") +
      "</div>" +
      '<div class="ap-pills">' +
      Array.from({ length: COACH_AP }, (_, i) => '<div class="ap' + (i < state.ap && state.turn === "A" ? " on" : "") + '"></div>').join("") +
      "</div>" +
      '<div class="muted" style="font-size:0.78rem;margin-bottom:8px">Мяч: ' +
      (state.loose ? "свободный @ " + cellName(state.ball) : state.ballOwner ? byId(state.ballOwner).name : "—") +
      "</div>" +
      '<h3 style="font-size:0.85rem;margin:0 0 6px">Состав</h3>' +
      '<div class="card-list" id="cardList"></div>' +
      (sel
        ? selectedCardHtml(sel)
        : '<p class="muted" style="font-size:0.8rem">' +
          (state.watchPlay ? "ИИ управляет обеими командами." : "Клик по игроку на поле или карточке.") +
          "</p>") +
      '<div style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">' +
      (state.watchPlay
        ? ""
        : '<button class="btn" id="btnEnd" ' +
          (state.turn !== "A" || state.waiting || state.over ? "disabled" : "") +
          ">Конец хода</button>") +
      '<button class="btn btn-ghost" id="btnResign">' +
      (state.watchPlay ? "Стоп" : "Выйти") +
      "</button></div>";

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
          toast("Игрок исчерпан после неудачного отбора");
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

    const btnEnd = el.querySelector("#btnEnd");
    if (btnEnd) btnEnd.onclick = () => endPlayerTurn();
    el.querySelector("#btnResign").onclick = () => {
      stopWatchMatch();
      state.screen = "lobby";
      state.opponentId = null;
      state.watchPlay = false;
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
      moveBands(p).yellow +
      "</b>/<b>" +
      moveBands(p).gold +
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
      '<div class="hint-box">Ход XCOM: жёлтый/золотой. Без автосдвига формы — двигаете только командами.</div></div>'
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
        // одно действие — анимируем только эту фишку
        el.style.transition = "left " + moveMs(fromPos, p.pos) + "ms ease, top " + moveMs(fromPos, p.pos) + "ms ease";
      } else if (animate && !moveId) {
        // конец хода / розыгрыш — можно двигать всех
        el.style.transition = "left .28s ease, top .28s ease";
      } else {
        el.style.transition = "none";
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
        (isLocked(p.id) ? " · исчерпан после отбора мимо" : "");
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
    const mover = state.selectedId ? byId(state.selectedId) : null;
    state.reachable.forEach((pos) => {
      const n = hexNodes[pos[0] + "," + pos[1]];
      if (!n || !mover) return;
      const d = hexDist(mover.pos, pos);
      n.classList.add(d <= state.reachYellow ? "reach-yellow" : "reach-gold");
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
      if (n) {
        n.classList.add("loose");
        const occ = occupant(state.ball);
        if (occ && occ.side === "B") n.classList.add("loose-contested");
      }
    }
  }

  function openRadial(playerId) {
    const p = byId(playerId);
    if (!p || p.side !== "A" || state.turn !== "A" || state.waiting || state.over) return;
    if (isLocked(playerId)) {
      toast("После неудачного отбора этому игроку больше нельзя отдавать команды в этом ходу");
      return;
    }
    state.selectedId = playerId;
    state.radialOpen = true;
    state.mode = null;
    state.reachable = [];
    state.reachYellow = 0;
    state.reachGold = 0;
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
    state.reachYellow = 0;
    state.reachGold = 0;
    state.targets = [];
    showRadialCancelOnly();
    if (mode === "move") {
      const bands = moveBands(p);
      state.reachYellow = bands.yellow;
      state.reachGold = bands.gold;
      state.reachable = cellsInRange(p.pos, bands.gold).filter((pos) => canStandOn(pos, p.id));
      if (state.loose) {
        const d = hexDist(p.pos, state.ball);
        const tackleR = actionRange(p, "tackle");
        // спорный мяч: в радиусе хода и отбора — клик = борьба (без стака)
        if (
          d > 0 &&
          d <= bands.gold &&
          (canStandOn(state.ball, p.id) || (canTargetLooseBall(state.ball, p.id) && d <= tackleR))
        ) {
          if (!state.reachable.some((x) => x[0] === state.ball[0] && x[1] === state.ball[1])) {
            state.reachable.push(state.ball.slice());
          }
        }
      }
      const deb = state.ballOwner === p.id ? carrySpeedDebuff(p.control || 1) : 0;
      const contested = state.loose && occupant(state.ball) && occupant(state.ball).side === "B";
      toast(
        "Ход XCOM · жёлтый ≤" +
          bands.yellow +
          " · золотой ≤" +
          bands.gold +
          " · " +
          bands.tag +
          (deb ? " −" + deb + " влад." : "") +
          (contested ? " · спорный мяч — клик = борьба" : " · можно на 1 клетку")
      );
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
        if (hexDist(p.pos, state.ball) === 0 && !(occupant(state.ball) && occupant(state.ball).side === "B")) {
          closeRadial();
          doPickup(p, true);
          return;
        }
        state.targets.push(state.ball.slice());
      }
      const ow = ownerPlayer();
      if (ow && ow.side === "B" && hexDist(p.pos, ow.pos) <= range) state.targets.push(ow.pos.slice());
      // соперник на клетке свободного мяча — тоже кликабельная цель
      if (state.loose) {
        const occ = occupant(state.ball);
        if (occ && occ.side === "B" && hexDist(p.pos, occ.pos) <= range) {
          if (!state.targets.some((x) => x[0] === occ.pos[0] && x[1] === occ.pos[1])) {
            state.targets.push(occ.pos.slice());
          }
        }
      }
      if (!state.targets.length) toast("Цель отбора вне радиуса " + range);
      else {
        const contested = state.loose && occupant(state.ball) && occupant(state.ball).side === "B";
        toast(contested ? "Спорный мяч · клик по клетке/сопернику" : "Отбор · радиус " + range);
      }
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
      const bands = moveBands(p);
      const deb = state.ballOwner === p.id ? carrySpeedDebuff(p.control || 1) : 0;
      let html =
        "<b>Ход</b> · <span style=\"color:#f0d35a\">жёлтый ≤" +
        bands.yellow +
        "</span> · <span style=\"color:#e8b84a\">золотой ≤" +
        bands.gold +
        "</span> · " +
        bands.tag +
        (deb ? " −" + deb + " (влад." + p.control + ")" : " без мяча") +
        " · клик любую клетку (хоть 1) · устал." +
        (state.carryFatigue || 0);
      if (hoverHex) {
        const d = hexDist(p.pos, hoverHex);
        if (d > 0 && d <= bands.gold) {
          html +=
            " · цель " +
            cellName(hoverHex) +
            " · " +
            d +
            " гекс · " +
            (d <= bands.yellow ? "жёлтый" : "золотой");
        }
      }
      if (state.ballOwner === p.id && hoverHex) {
        const prev = previewCarryPath(p, p.pos, hoverHex);
        html +=
          '<div class="pct" style="font-size:1.2rem">' +
          prev.combined +
          "%</div><div>" +
          prev.detail +
          "</div>";
      } else {
        html +=
          "<div class='muted'>Риск на каждой клетке пути. Σ1 опасно, Σ≥2 почти потеря — между ЗЩ без коридора не пройти.</div>";
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
        " (атрибут÷2). Свободный мяч на клетке соперника — борьба за подбор. Промах по владельцу — мяч остаётся у него.";
  }

  function aiGkDive(side) {
    // AI picks one of 3 goal cols — weighted toward center / ball column
    const ow = ownerPlayer();
    const prefer = ow ? clamp(ow.pos[0], GOAL_COLS[0], GOAL_COLS[2]) : CENTER_COL;
    if (Math.random() < 0.4) return prefer;
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
          if (state.loose) {
            toast("Мяч свободен — кликните клетку мяча или соперника на ней");
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
      if (!state.reachable.some((x) => x[0] === c && x[1] === r)) {
        toast("Клетка вне радиуса хода");
        return;
      }
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
      if (hexDist(p.pos, state.ball) <= actionRange(p, "tackle")) doPickup(p, false);
      else toast("Мяч вне радиуса отбора");
      return;
    }
    if (state.mode === "tackle" && state.loose) {
      const occ = occupant([c, r]);
      if (occ && occ.side === "B" && occ.pos[0] === state.ball[0] && occ.pos[1] === state.ball[1]) {
        doPickup(p, false);
      }
    }
  }

  function spendAP(moveId, fromPos) {
    if (moveId) markActed(moveId);
    else if (state.selectedId) markActed(state.selectedId);
    state.ap -= 1;
    state.mode = null;
    state.reachable = [];
    state.reachYellow = 0;
    state.reachGold = 0;
    state.targets = [];
    // оффбол после каждого AP (не только в конце хода)
    if (state.turn === "A") microOffBall("A", { skipIds: moveId ? [moveId] : [], maxMovers: 2 });
    noteBallHeat();
    if (!state.autoPlay) {
      closeRadial();
      syncPieces(true, moveId, fromPos);
      renderLeft();
      renderRight();
      paintBoard();
      updatePreview();
      if (state.ap <= 0 && !state.over) endPlayerTurn();
    }
  }

  function doMove(p, to) {
    const from = p.pos.slice();
    const carrying = state.ballOwner === p.id;
    const usedBurst = carrying && p.burst;
    const bands = moveBands(p);
    const steps = hexDist(from, to);
    if (steps > bands.gold) {
      toast("Дальше золотого радиуса (" + bands.gold + ")");
      return;
    }
    // Спорный свободный мяч на клетке соперника — борьба без стака позиций
    if (state.loose && to[0] === state.ball[0] && to[1] === state.ball[1]) {
      const occ = occupant(to);
      if (occ && occ.id !== p.id && occ.side !== p.side) {
        if (hexDist(from, to) > actionRange(p, "tackle")) {
          toast("Подойдите ближе · радиус отбора " + actionRange(p, "tackle"));
          return;
        }
        contestedLoose(p, occ, false);
        spendAP(p.id, from);
        return;
      }
    }
    if (!canStandOn(to, p.id)) {
      toast("Клетка занята");
      return;
    }
    p.pos = to.slice();
    if (carrying) {
      const res = resolveCarryPath(p, from, to);
      pushLog(
        p.name +
          " ведёт → " +
          cellName(to) +
          " · " +
          (steps <= bands.yellow ? "жёлт." : "золот.") +
          steps +
          "/" +
          bands.gold +
          " · " +
          (usedBurst ? "A" + p.accel : "S" + p.speed) +
          " · " +
          res.detail
      );
      if (res.ok) {
        state.ball = to.slice();
        state.loose = false;
        state.carryFatigue = res.fatigue;
        pushLog("Мяч удержан по пути · усталость " + state.carryFatigue);
      } else {
        // останавливаемся на клетке потери
        p.pos = res.lostAt.slice();
        state.ballOwner = null;
        state.loose = true;
        state.ball = res.lostAt.slice();
        resetCarryFatigue();
        pushLog(
          "Потеря на пути @ " + cellName(res.lostAt) + (res.pressure ? " · Σдавл." + res.pressure : ""),
          true
        );
        toast("Потеря мяча на пути");
      }
    } else {
      pushLog(
        p.name +
          " → " +
          cellName(to) +
          " · " +
          (steps <= bands.yellow ? "жёлт." : "золот.") +
          steps +
          "/" +
          bands.gold +
          " · " +
          (usedBurst ? "A" : "S") +
          (usedBurst ? p.accel : p.speed)
      );
      if (state.loose && state.ball[0] === to[0] && state.ball[1] === to[1]) {
        claimLoose(p, true);
      }
    }
    if (usedBurst) p.burst = false;
    else if (carrying) p.burst = false;
    spendAP(p.id, from);
  }

  /** sure=true: мяч под ногами / наступил на пустую клетку — без провала */
  function claimLoose(p, sure) {
    if (!state.loose) return false;
    const dist = hexDist(p.pos, state.ball);
    const occ = occupant(state.ball);
    const enemy = occ && occ.side !== p.side ? occ : null;
    // Спорная клетка — только через contestedLoose (не «бесплатный» sure)
    if (enemy && enemy.id !== p.id) {
      return contestedLoose(p, enemy, sure);
    }
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

  /**
   * Свободный мяч на клетке соперника: борьба за подбор.
   * Позиции не стакаем — победитель забирает мяч к себе (или закрепляет у себя).
   */
  function contestedLoose(p, enemy, forceAttempt) {
    if (!state.loose || !enemy) return false;
    const dist = hexDist(p.pos, state.ball);
    if (dist > actionRange(p, "tackle") && !forceAttempt) {
      toast("Мяч вне радиуса отбора");
      return false;
    }
    let ch = clamp(52 + skillPct(p.tackle) * 0.4 - skillPct(enemy.tackle) * 0.28, 22, 88);
    if (dist === 0) ch = clamp(ch + 8, 22, 92);
    const roll = rnd();
    pushLog(
      "Борьба за мяч: " +
        p.name +
        " vs " +
        enemy.name +
        " · " +
        ch +
        "% (" +
        Math.round(roll) +
        ") · клетка " +
        cellName(state.ball)
    );
    if (roll <= ch) {
      state.ballOwner = p.id;
      state.loose = false;
      state.ball = p.pos.slice();
      p.burst = true;
      enemy.burst = false;
      resetCarryFatigue();
      pushLog(p.name + " выиграл свободный мяч у " + enemy.name, true);
      toast("Мяч ваш!");
      return true;
    }
    state.ballOwner = enemy.id;
    state.loose = false;
    state.ball = enemy.pos.slice();
    enemy.burst = true;
    resetCarryFatigue();
    pushLog(enemy.name + " закрепил свободный мяч", true);
    toast("Соперник закрепил мяч");
    return false;
  }

  function doPickup(p, sure) {
    if (!state.loose) {
      toast("Мяч не свободен");
      return;
    }
    const occ = occupant(state.ball);
    const enemy = occ && occ.side !== p.side ? occ : null;
    const dist = hexDist(p.pos, state.ball);
    if (enemy) {
      if (dist > actionRange(p, "tackle") && !sure) {
        toast("Мяч вне радиуса отбора " + actionRange(p, "tackle"));
        return;
      }
      contestedLoose(p, enemy, !!sure);
      spendAP(p.id);
      return;
    }
    if (dist > actionRange(p, "tackle") && !sure) {
      toast("Мяч вне радиуса");
      return;
    }
    claimLoose(p, !!sure || dist === 0);
    spendAP(p.id);
  }

  /** Клетка свободного мяча — цель хода даже если там стоит соперник */
  function canTargetLooseBall(pos, movingId) {
    if (!state.loose) return false;
    if (pos[0] !== state.ball[0] || pos[1] !== state.ball[1]) return false;
    const occ = occupant(pos);
    if (!occ || occ.id === movingId) return canStandOn(pos, movingId);
    return occ.side !== byId(movingId).side;
  }

  function emptySideStats() {
    return {
      shots: 0,
      sot: 0,
      goals: 0,
      xg: 0,
      xa: 0,
      keyPasses: 0,
      passAtt: 0,
      passComp: 0,
      crosses: 0,
      tacklesWon: 0,
      tacklesAtt: 0,
      saves: 0,
    };
  }

  function emptyMatchStats() {
    return {
      shotsFor: 0,
      shotsAgainst: 0,
      sotFor: 0,
      sotAgainst: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      xgFor: 0,
      xgAgainst: 0,
      xaFor: 0,
      xaAgainst: 0,
      gkSaves: 0,
      passes: 0,
      passAtt: 0,
      passComp: 0,
      tackles: 0,
      heat: {},
      heat1st: {},
      heat2nd: {},
      passMap: {},
      thirds: { attA: 0, mid: 0, attB: 0 },
      possession: { A: 0, B: 0, loose: 0 },
      attackDir: {
        A: { left: 0, center: 0, right: 0 },
        B: { left: 0, center: 0, right: 0 },
      },
      bySide: { A: emptySideStats(), B: emptySideStats() },
      shotLog: [],
      lastPass: null,
      rolePos: {
        A: { NAP: { sumR: 0, n: 0, ownBox: 0 }, OP1: { sumR: 0, n: 0 }, OP2: { sumR: 0, n: 0 }, Z: { sumR: 0, n: 0 } },
        B: { NAP: { sumR: 0, n: 0, ownBox: 0 }, OP1: { sumR: 0, n: 0 }, OP2: { sumR: 0, n: 0 }, Z: { sumR: 0, n: 0 } },
      },
    };
  }

  function noteRolePositions() {
    if (!state.stats || !state.stats.rolePos) return;
    const track = (side, squad) => {
      if (!squad) return;
      Object.values(squad).forEach((p) => {
        if (!p || p.role === "GK") return;
        const bucket = state.stats.rolePos[side][p.role];
        if (!bucket) return;
        bucket.sumR += p.pos[1];
        bucket.n += 1;
        if (p.role === "NAP") {
          if (side === "A" && p.pos[1] <= 5) bucket.ownBox++;
          if (side === "B" && p.pos[1] >= ROWS - 6) bucket.ownBox++;
        }
      });
    };
    track("A", state.you);
    track("B", state.them);
  }

  function attackChannel(col) {
    if (col <= 3) return "left";
    if (col >= 9) return "right";
    return "center";
  }

  function noteBallHeat() {
    if (!state.stats || !state.stats.heat) return;
    const c = state.ball[0];
    const r = state.ball[1];
    const key = c + "," + r;
    state.stats.heat[key] = (state.stats.heat[key] || 0) + 1;
    const halfHeat = state.minute < 45 ? state.stats.heat1st : state.stats.heat2nd;
    if (halfHeat) halfHeat[key] = (halfHeat[key] || 0) + 1;
    if (r <= 6) state.stats.thirds.attB++;
    else if (r >= 14) state.stats.thirds.attA++;
    else state.stats.thirds.mid++;

    const ow = ownerPlayer();
    if (!ow) state.stats.possession.loose++;
    else if (ow.side === "A") state.stats.possession.A++;
    else state.stats.possession.B++;

    // направление атак: мяч в финальной трети владеющей стороны
    if (ow && ow.side === "A" && r >= 14) state.stats.attackDir.A[attackChannel(c)]++;
    if (ow && ow.side === "B" && r <= 6) state.stats.attackDir.B[attackChannel(c)]++;

    noteRolePositions();

    if (state.stats.lastPass && state.stats.lastPass.ttl > 0) state.stats.lastPass.ttl -= 1;
    else state.stats.lastPass = null;
  }

  function notePass(from, to, ok, isCross) {
    if (!state.stats) return;
    const side = from.side;
    const bs = state.stats.bySide[side];
    state.stats.passAtt = (state.stats.passAtt || 0) + 1;
    bs.passAtt++;
    if (isCross) bs.crosses++;
    if (ok) {
      state.stats.passComp = (state.stats.passComp || 0) + 1;
      bs.passComp++;
      const key = cellName(from.pos) + "→" + cellName(to.pos);
      state.stats.passMap[key] = (state.stats.passMap[key] || 0) + 1;
      // ключ для xA: пас «живёт» ~2 касания/сэмпла
      state.stats.lastPass = {
        fromId: from.id,
        toId: to.id,
        side,
        ttl: 3,
        forward: side === "A" ? to.pos[1] - from.pos[1] > 0 : from.pos[1] - to.pos[1] > 0,
      };
    } else {
      state.stats.lastPass = null;
    }
  }

  function noteTackle(winnerSide, won) {
    if (!state.stats) return;
    state.stats.tackles = (state.stats.tackles || 0) + 1;
    const bs = state.stats.bySide[winnerSide];
    bs.tacklesAtt++;
    if (won) bs.tacklesWon++;
  }

  /** xG без учёта прыжка ВР — качество момента */
  function rawShotXG(p, goalHex) {
    return chanceShot(p, goalHex, null).chance / 100;
  }

  function noteShotEvent(side, p, goalHex, diveCol, scored, onTarget) {
    if (!state.stats) return 0;
    const xg = +rawShotXG(p, goalHex).toFixed(3);
    const bs = state.stats.bySide[side];
    bs.shots++;
    bs.xg += xg;
    if (onTarget) bs.sot++;
    if (scored) {
      bs.goals++;
      if (side === "A") state.stats.goalsFor++;
      else state.stats.goalsAgainst++;
    }

    if (side === "A") {
      state.stats.shotsFor++;
      state.stats.xgFor += xg;
      if (onTarget) state.stats.sotFor++;
    } else {
      state.stats.shotsAgainst++;
      state.stats.xgAgainst += xg;
      if (onTarget) state.stats.sotAgainst++;
    }

    const lp = state.stats.lastPass;
    if (lp && lp.side === side && lp.toId === p.id && lp.ttl > 0) {
      bs.xa += xg;
      bs.keyPasses++;
      if (side === "A") state.stats.xaFor += xg;
      else state.stats.xaAgainst += xg;
    }
    state.stats.lastPass = null;

    state.stats.shotLog.push({
      minute: state.minute,
      side,
      player: p.name,
      role: p.role,
      from: cellName(p.pos),
      aim: cellName(goalHex),
      xg,
      onTarget: !!onTarget,
      goal: !!scored,
      dive: diveCol != null ? cellName([diveCol, side === "A" ? GOAL_B_ROW : GOAL_A_ROW]) : null,
    });
    return xg;
  }

  function shareDir(dir) {
    const sum = Math.max(1, (dir.left || 0) + (dir.center || 0) + (dir.right || 0));
    return {
      left: +((dir.left || 0) / sum).toFixed(3),
      center: +((dir.center || 0) / sum).toFixed(3),
      right: +((dir.right || 0) / sum).toFixed(3),
      samples: (dir.left || 0) + (dir.center || 0) + (dir.right || 0),
    };
  }

  function buildHeatMap(st, heatOverride) {
    const heat = heatOverride || st.heat || {};
    let max = 1;
    Object.values(heat).forEach((v) => {
      if (v > max) max = v;
    });
    const cells = Object.entries(heat)
      .map(([key, count]) => {
        const [c, r] = key.split(",").map(Number);
        return {
          cell: cellName([c, r]),
          col: c,
          row: r,
          count,
          intensity: +(count / max).toFixed(3),
        };
      })
      .sort((a, b) => b.count - a.count);
    // сетка: ряды 1..ROWS сверху (ворота A), колонки A..
    const grid = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        row.push(heat[c + "," + r] || 0);
      }
      grid.push(row);
    }
    const glyphs = " ·░▒▓█";
    const asciiRows = grid.map((row, r) => {
      const cellsTxt = row
        .map((v) => {
          if (!v) return "·";
          const t = v / max;
          const i = t > 0.85 ? 5 : t > 0.65 ? 4 : t > 0.4 ? 3 : t > 0.2 ? 2 : 1;
          return glyphs[i];
        })
        .join("");
      return String(r + 1).padStart(2, " ") + " |" + cellsTxt + "|";
    });
    const header = "    " + Array.from({ length: COLS }, (_, c) => String.fromCharCode(65 + c)).join("");
    return {
      max,
      samples: Object.values(heat).reduce((a, b) => a + b, 0),
      top: cells.slice(0, 16).map((x) => x.cell + "×" + x.count),
      cells: cells.slice(0, 40),
      grid,
      ascii: [header, ...asciiRows].join("\n"),
    };
  }

  function buildPassMap(st) {
    const passMap = st.passMap || {};
    const links = Object.entries(passMap)
      .map(([k, count]) => {
        const pair = k.split("→");
        const fromName = pair[0];
        const toName = pair[1];
        const from = parseCellName(fromName);
        const to = parseCellName(toName);
        return {
          from: fromName,
          to: toName,
          fromPos: from,
          toPos: to,
          count,
          dx: from && to ? to[0] - from[0] : 0,
          dy: from && to ? to[1] - from[1] : 0,
          forward: from && to ? to[1] - from[1] : 0,
        };
      })
      .sort((a, b) => b.count - a.count);
    const max = links.length ? links[0].count : 0;
    const total = links.reduce((a, b) => a + b.count, 0);
    // агрегат по зонам: из трети / в треть
    const thirdOf = (r) => (r <= 6 ? "attB" : r >= 14 ? "attA" : "mid");
    // dy>0 = к воротам B (низ поля), dy<0 = к воротам A
    const zones = { toAttA: 0, toMid: 0, toAttB: 0, towardB: 0, towardA: 0, lateral: 0 };
    links.forEach((l) => {
      if (!l.fromPos || !l.toPos) return;
      const t = thirdOf(l.toPos[1]);
      if (t === "attA") zones.toAttA += l.count;
      else if (t === "attB") zones.toAttB += l.count;
      else zones.toMid += l.count;
      if (l.dy > 0) zones.towardB += l.count;
      else if (l.dy < 0) zones.towardA += l.count;
      else zones.lateral += l.count;
    });
    const ascii = links
      .slice(0, 20)
      .map((l) => {
        const bar = "█".repeat(Math.max(1, Math.round((l.count / Math.max(1, max)) * 10)));
        return (l.from + "→" + l.to).padEnd(12, " ") + " " + String(l.count).padStart(3, " ") + " " + bar;
      })
      .join("\n");
    return {
      totalCompletedLinks: total,
      uniqueLinks: links.length,
      top: links.slice(0, 16).map((l) => l.from + "→" + l.to + "×" + l.count),
      links: links.slice(0, 40),
      zones,
      ascii,
    };
  }

  function buildAdvancedReport(st) {
    const possSum = Math.max(1, (st.possession.A || 0) + (st.possession.B || 0) + (st.possession.loose || 0));
    const ballSum = Math.max(1, (st.possession.A || 0) + (st.possession.B || 0));
    const sidePack = (side) => {
      const s = st.bySide[side];
      return {
        shots: s.shots,
        sot: s.sot,
        goals: s.goals,
        xg: +s.xg.toFixed(2),
        xa: +s.xa.toFixed(2),
        keyPasses: s.keyPasses,
        passAtt: s.passAtt,
        passComp: s.passComp,
        passPct: s.passAtt ? +((100 * s.passComp) / s.passAtt).toFixed(1) : 0,
        crosses: s.crosses,
        tacklesWon: s.tacklesWon,
        tacklesAtt: s.tacklesAtt,
        saves: s.saves,
        conversion: s.shots ? +((100 * s.goals) / s.shots).toFixed(1) : 0,
        xgOverperform: +(s.goals - s.xg).toFixed(2),
      };
    };
    const heatMap = buildHeatMap(st);
    const heatMap1st = buildHeatMap(st, st.heat1st || {});
    const heatMap2nd = buildHeatMap(st, st.heat2nd || {});
    const passMap = buildPassMap(st);
    const roleShape = {};
    ["A", "B"].forEach((side) => {
      const pack = (st.rolePos && st.rolePos[side]) || {};
      roleShape[side] = {};
      Object.keys(pack).forEach((role) => {
        const b = pack[role];
        const n = Math.max(1, b.n || 0);
        roleShape[side][role] = {
          avgRow: +(b.sumR / n).toFixed(2),
          samples: b.n || 0,
          ownBoxShare: b.ownBox != null ? +(b.ownBox / n).toFixed(3) : null,
        };
      });
    });
    const passZones = passMap.zones || {};
    const passTotal = Math.max(1, (passZones.towardA || 0) + (passZones.towardB || 0) + (passZones.lateral || 0));
    return {
      possessionPct: {
        A: +((100 * (st.possession.A || 0)) / ballSum).toFixed(1),
        B: +((100 * (st.possession.B || 0)) / ballSum).toFixed(1),
        looseShare: +((st.possession.loose || 0) / possSum).toFixed(3),
      },
      attackDirection: {
        A: shareDir(st.attackDir.A),
        B: shareDir(st.attackDir.B),
      },
      team: { A: sidePack("A"), B: sidePack("B") },
      xg: { A: +st.xgFor.toFixed(2), B: +st.xgAgainst.toFixed(2) },
      xa: { A: +st.xaFor.toFixed(2), B: +st.xaAgainst.toFixed(2) },
      shots: { A: st.shotsFor, B: st.shotsAgainst },
      sot: { A: st.sotFor, B: st.sotAgainst },
      shotLog: (st.shotLog || []).slice(-20),
      heatMap,
      heatMap1st,
      heatMap2nd,
      passMap,
      roleShape,
      passDirectionShare: {
        towardA: +((passZones.towardA || 0) / passTotal).toFixed(3),
        towardB: +((passZones.towardB || 0) / passTotal).toFixed(3),
        lateral: +((passZones.lateral || 0) / passTotal).toFixed(3),
      },
    };
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
      notePass(from, to, true, isCross);
      state.ballOwner = to.id;
      state.ball = to.pos.slice();
      state.loose = false;
      to.burst = true;
      from.burst = false;
      resetCarryFatigue();
      pushLog("Точно!", true);
    } else {
      notePass(from, to, false, isCross);
      state.ball = [
        clamp(Math.round((from.pos[0] + to.pos[0]) / 2), 0, COLS - 1),
        clamp(Math.round((from.pos[1] + to.pos[1]) / 2), 0, ROWS - 1),
      ];
      state.ballOwner = null;
      state.loose = true;
      resetCarryFatigue();
      pushLog("Свободный мяч @ " + cellName(state.ball), true);
    }
    noteBallHeat();
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
    const scored = roll <= ch.chance;
    const onTarget = scored || dive === goalHex[0];
    noteShotEvent("A", p, goalHex, dive, scored, onTarget);
    if (!state.autoPlay) {
      syncPieces(false);
      state.waiting = true;
    }

    const resolveMissOrSave = () => {
      state.ball = [
        clamp(goalHex[0] + (dive === goalHex[0] ? 0 : goalHex[0] - dive), 0, COLS - 1),
        clamp(GOAL_B_ROW - 2, 0, ROWS - 1),
      ];
        if (dive === goalHex[0] && Math.random() < 0.5) {
          state.ballOwner = "B.GK";
          state.them.GK.pos = [dive, GOAL_B_ROW];
          state.ball = state.them.GK.pos.slice();
          state.loose = false;
          if (state.stats) {
            state.stats.gkSaves++;
            state.stats.bySide.B.saves++;
          }
          pushLog("ВР поймал! Угадал клетку.", true);
        } else {
          state.loose = true;
          pushLog(
            ch.blockLikely ? "Блок / Σдавление!" : dive === goalHex[0] ? "Сейв / отбил" : "Мимо — свободный мяч",
            true
          );
        }
      if (!state.autoPlay) syncPieces(true);
      state.waiting = false;
      spendAP(p.id);
    };
    const resolveGoal = () => {
      state.ball = goalHex.slice();
      if (!state.autoPlay) syncPieces(true);
      state.score[0] += 1;
      pushLog("ГОЛ! Мяч в " + cellName(goalHex), true);
      toast("ГОЛ!");
      resetKickoff("B");
      state.waiting = false;
      spendAP(p.id);
    };

    if (state.autoPlay) {
      if (scored) resolveGoal();
      else resolveMissOrSave();
      return;
    }
    setTimeout(() => {
      if (scored) {
        state.ball = goalHex.slice();
        if (!state.autoPlay) syncPieces(true);
        state.score[0] += 1;
        pushLog("ГОЛ! Мяч в " + cellName(goalHex), true);
        toast("ГОЛ!");
        setTimeout(() => {
          resetKickoff("B");
          state.waiting = false;
          spendAP(p.id);
        }, 700);
      } else {
        resolveMissOrSave();
      }
    }, 280);
  }

  function doTackle(p, victim) {
    if (isLocked(p.id)) {
      toast("Игрок исчерпан после неудачного отбора");
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
      noteTackle(p.side, true);
      pushLog("Мяч отобран! Можно продолжать на оставшихся AP.", true);
      toast("Отбор успешен — действуйте дальше");
    } else {
      noteTackle(p.side, false);
      pushLog("Отбор не вышел — мяч у " + victim.name, true);
      lockPlayer(p.id, "отбор мимо");
    }
    spendAP(p.id);
  }

  function resetKickoff(ownerSide) {
    Object.values(state.you).forEach((p) => (p.pos = p.home.slice()));
    Object.values(state.them).forEach((p) => (p.pos = p.home.slice()));
    state.ball = [CENTER_COL, HALF_ROW];
    placeKickoffSupport(ownerSide);
    state.ballOwner = ownerSide === "A" ? "A.NAP" : "B.NAP";
    state.loose = false;
    resetCarryFatigue();
    pushLog(
      "Розыгрыш с центра · " +
        (ownerSide === "A" ? "вы" : "соперник") +
        " у мяча · принимающий НП за кругом."
    );
    if (!state.autoPlay) syncPieces(true);
  }

  function endPlayerTurn() {
    if (state.over || state.turn !== "A") return;
    closeRadial();
    state.ap = 0;
    state.mode = null;
    state.reachable = [];
    state.targets = [];
    // пассивный оффбол: партнёры подтягиваются к линии мяча (НП не остаётся в своей штрафной)
    holdFormation("A", skipBallOwnerIds("A"), !!state.watchPlay);
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
    // пассивный оффбол у ПК
    holdFormation("B", skipBallOwnerIds("B"), !!state.watchPlay);
    noteBallHeat();
    state.turn = "A";
    state.ap = COACH_AP;
    state.lockedIds = [];
    state.actedIds = [];
    state.minute = Math.min(MATCH_MINUTES, state.minute + 1);
    state.selectedId = null;
    if (state.minute >= MATCH_MINUTES) {
      state.waiting = false;
      endMatch();
      return;
    }
    if (state.watchPlay) {
      pushLog("— Ход домашнего ИИ (" + COACH_AP + " AP) — · " + state.minute + "'", true);
      if (state.minute === 45 && state.stats) {
        pushLog("Перерыв · тепло 1-го тайма зафиксировано", true);
      }
      renderLeft();
      renderRight();
      scheduleWatch(runHomeAIWatch, Math.max(180, state.watchDelay - 80));
      return;
    }
    state.waiting = false;
    pushLog("— Ваш ход (" + COACH_AP + " AP) — · " + state.minute + "'", true);
    render();
  }

  function endMatch() {
    state.over = true;
    const msg =
      state.score[0] > state.score[1]
        ? state.watchPlay
          ? "Победа дома"
          : "Победа!"
        : state.score[0] < state.score[1]
          ? state.watchPlay
            ? "Победа гостей"
            : "Поражение"
          : "Ничья";
    pushLog("Финал " + state.score[0] + ":" + state.score[1] + " — " + msg, true);
    toast(msg + " " + state.score[0] + ":" + state.score[1]);
    if (!state.autoPlay) {
      renderLeft();
      renderRight();
      if (state.watchPlay && state.stats) showWatchMapsOverlay();
    }
  }

  function showWatchMapsOverlay() {
    const advanced = buildAdvancedReport(state.stats);
    let pre = document.getElementById("watch-maps");
    if (pre) pre.remove();
    pre = document.createElement("pre");
    pre.id = "watch-maps";
    pre.style.cssText =
      "position:fixed;right:8px;bottom:8px;left:auto;top:auto;max-width:min(520px,46vw);max-height:58vh;overflow:auto;background:#0b100eee;color:#d7e8dc;z-index:80;padding:10px 12px;font:11px/1.35 ui-monospace,monospace;border:1px solid #2a3d32;border-radius:8px";
    const napA = advanced.roleShape && advanced.roleShape.A && advanced.roleShape.A.NAP;
    const napB = advanced.roleShape && advanced.roleShape.B && advanced.roleShape.B.NAP;
    pre.textContent = [
      "Тепло / пасы · " + state.score[0] + ":" + state.score[1],
      "НП дом avgRow=" + (napA ? napA.avgRow : "?") + " ownBox=" + (napA ? napA.ownBoxShare : "?"),
      "НП гости avgRow=" + (napB ? napB.avgRow : "?") + " ownBox=" + (napB ? napB.ownBoxShare : "?"),
      "пасы →B/→A/lat " +
        (advanced.passDirectionShare
          ? advanced.passDirectionShare.towardB +
            "/" +
            advanced.passDirectionShare.towardA +
            "/" +
            advanced.passDirectionShare.lateral
          : "?"),
      "",
      "HEAT full",
      advanced.heatMap.ascii || "",
      "",
      "HEAT 1st",
      (advanced.heatMap1st && advanced.heatMap1st.ascii) || "",
      "",
      "HEAT 2nd",
      (advanced.heatMap2nd && advanced.heatMap2nd.ascii) || "",
      "",
      "PASS",
      advanced.passMap.ascii || "",
      "",
      "клик = закрыть",
    ].join("\n");
    pre.onclick = () => pre.remove();
    document.body.appendChild(pre);
  }

  function runAI() {
    const opp = OPPONENTS.find((x) => x.id === state.opponentId);
    const style = state.awayAiStyle || (opp && opp.ai) || "direct";
    let ap = COACH_AP;
    state.aiLocked = [];
    const delay = state.watchPlay ? state.watchDelay : 520;
    const step = () => {
      if (!state.watchPlay && state.over) {
        setTimeout(endAITurn, 280);
        return;
      }
      if (ap <= 0 || state.over) {
        if (state.watchPlay) scheduleWatch(endAITurn, Math.max(160, delay * 0.55));
        else setTimeout(endAITurn, 280);
        return;
      }
      if (state.watchPlay === false && state.turn !== "B") return;
      aiAction(style);
      microOffBall("B", { maxMovers: 2 });
      ap -= 1;
      syncPieces(true);
      paintBoard();
      renderLeft();
      renderRight();
      if (state.watchPlay) scheduleWatch(step, delay);
      else setTimeout(step, 520);
    };
    step();
  }

  function aiAction(style) {
    if (state.loose) {
      // 1) уже стоит на мяче — всегда забирает (если клетка не занята врагом)
      const onBall = Object.values(state.them).find(
        (p) => p.pos[0] === state.ball[0] && p.pos[1] === state.ball[1]
      );
      if (onBall) {
        claimLoose(onBall, true);
        return;
      }
      const youOnBall = Object.values(state.you || {}).find(
        (p) => p.pos[0] === state.ball[0] && p.pos[1] === state.ball[1]
      );
      // 2) ближайший бежит на клетку мяча / подбирает / борется
      const near = Object.values(state.them)
        .filter((p) => p.role !== "GK")
        .sort((a, b) => hexDist(a.pos, state.ball) - hexDist(b.pos, state.ball))[0];
      if (near) {
        const d = hexDist(near.pos, state.ball);
        const bud = actionRange(near, "move");
        const tR = actionRange(near, "tackle");
        if (d <= tR && d > 0) {
          if (youOnBall) {
            contestedLoose(near, youOnBall, false);
            return;
          }
          if (Math.random() < 0.55) {
            claimLoose(near, false);
            if (!state.loose) return;
          }
        }
        if (d <= bud && !occupant(state.ball)) {
          const opts = cellsInRange(near.pos, bud)
            .filter((pos) => canStandOn(pos, near.id))
            .sort((a, b) => hexDist(a, state.ball) - hexDist(b, state.ball));
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
      const nap = state.them.NAP;
      const phase = attackPhase("B");
      const napStuck =
        nap &&
        (state.aiLocked || []).indexOf(nap.id) < 0 &&
        (nap.pos[1] >= Math.max(ow.pos[1], HALF_ROW + 1) || (nap.pos[1] >= ROWS - 8 && ow.pos[1] <= HALF_ROW + 2));
      if (napStuck && (ow.role === "OP1" || ow.role === "OP2" || ow.role === "Z") && Math.random() < 0.82) {
        aiMoveToward(nap, [
          clamp(ow.pos[0] + (Math.random() < 0.5 ? -1 : 1), 3, 9),
          Math.max(2, Math.min(ow.pos[1] - 2, HALF_ROW - 1)),
        ]);
        return;
      }
      if (napStuck && Math.random() < 0.55 && aiSupportRun(ow)) return;

      if (phase === "finish") {
        if (tryAiShot(ow, style === "possess" ? 14 : 10)) return;
        if (nap && nap.pos[1] < ow.pos[1] && inActionRange(ow, nap.pos, "pass")) {
          aiPass(ow, nap, false);
          return;
        }
      }
      if (phase === "build") {
        if (aiEscapeOwnHalf(ow)) return;
        if (Math.random() < 0.55 && aiSupportRun(ow)) return;
        const fwd = freest(ow, false, { needForward: true });
        if (fwd) {
          aiPass(ow, fwd, hexDist(ow.pos, fwd.pos) > actionRange(ow, "pass"));
          return;
        }
        aiMoveToward(ow, [clamp(ow.pos[0], 2, 10), Math.max(2, ow.pos[1] - 4)]);
        return;
      }

      const ch = chanceShot(ow, [CENTER_COL, GOAL_A_ROW], null);
      // бьём раньше и чаще — иначе матч вязнет в центре
      if (ow.pos[1] <= 8 && !ch.outOfRange && ch.chance >= 12 && ch.pressure < 3) {
        aiShot(ow);
        return;
      }
      if (style === "width") return aiWidth(ow);
      if (style === "collapse") return aiCollapse(ow);
      if (style === "shape") return aiShape(ow);
      if (style === "possess") return aiPossess(ow);
      if (style === "press") return aiPressAttack(ow);
      if (style === "direct") return aiDirect(ow);
      return aiSmart(ow);
    }
    return aiDefend(style);
  }

  function aiShot(ow) {
    const dive = aiGkDive("A");
    const aim = GOAL_COLS.includes(ow.pos[0]) ? ow.pos[0] : CENTER_COL;
    const goalHex = [aim, GOAL_A_ROW];
    const ch = chanceShot(ow, goalHex, dive);
    const roll = rnd();
    pushLog("ПК удар в " + cellName(goalHex) + " · ваш ВР → " + cellName([dive, GOAL_A_ROW]) + " · " + ch.chance + "%");
    state.ballOwner = null;
    const scored = roll <= ch.chance && ch.pressure < 3;
    const onTarget = scored || dive === aim;
    noteShotEvent("B", ow, goalHex, dive, scored, onTarget);
    if (scored) {
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
      if (state.stats) {
        state.stats.gkSaves++;
        state.stats.bySide.A.saves++;
      }
      pushLog("Ваш ВР поймал!", true);
    } else {
      state.loose = true;
      state.ball = [aim, 2];
      resetCarryFatigue();
      pushLog("ПК не забил");
    }
  }

  /** Получатель с уклоном вперёд (side A → больший ряд, B → меньший). */
  function freest(from, preferWide, opts) {
    const needForward = opts && opts.needForward;
    let best = null;
    let bestS = -999;
    Object.values(state.them).forEach((t) => {
      if (t.id === from.id || t.role === "GK") return;
      const mode = hexDist(from.pos, t.pos) > actionRange(from, "pass") ? "cross" : "pass";
      if (hexDist(from.pos, t.pos) > actionRange(from, mode)) return;
      const pr = pressureOn(t.pos, "B").pts;
      const forward = from.pos[1] - t.pos[1];
      if (needForward && forward < 1) return;
      const wide = Math.abs(t.pos[0] - CENTER_COL);
      let s = -pr * 4 + forward * 5 + (preferWide ? wide * 1.5 : -wide * 0.35);
      if (forward <= 0) s -= 6;
      if (t.role === "NAP" && forward >= 1) s += 5;
      if (t.role === "NAP" && t.pos[1] <= HALF_ROW) s += 3;
      if (s > bestS) {
        bestS = s;
        best = t;
      }
    });
    return best;
  }

  function tryAiShot(ow, minChance) {
    const aim = GOAL_COLS.includes(ow.pos[0]) ? ow.pos[0] : CENTER_COL;
    const goalHex = [aim, GOAL_A_ROW];
    const ch = chanceShot(ow, goalHex, null);
    if (!ch.outOfRange && ch.chance >= minChance && ch.pressure < 3) {
      aiShot(ow);
      return true;
    }
    return false;
  }

  /** Выход из своей половины длинным пасом/ведением — чтобы гости тоже били */
  function aiEscapeOwnHalf(ow) {
    if (ow.pos[1] <= HALF_ROW + 1) return false;
    const deep = Object.values(state.them)
      .filter((t) => t.id !== ow.id && t.role !== "GK" && t.pos[1] < ow.pos[1] - 2)
      .sort((a, b) => a.pos[1] - b.pos[1] || pressureOn(a.pos, "B").pts - pressureOn(b.pos, "B").pts)[0];
    if (deep) {
      const mode = hexDist(ow.pos, deep.pos) > actionRange(ow, "pass") ? "cross" : "pass";
      if (hexDist(ow.pos, deep.pos) <= actionRange(ow, mode)) {
        aiPass(ow, deep, mode === "cross");
        return true;
      }
    }
    aiMoveToward(ow, [clamp(ow.pos[0], 2, 10), Math.max(2, ow.pos[1] - 4)]);
    return true;
  }

  function aiSupportNeed(p, ballOw) {
    const ballRow = ballOw.pos[1];
    let need = 0;
    if (p.pos[1] > ballRow + 1) need += (p.pos[1] - ballRow) * 3;
    if (p.role === "NAP" && p.pos[1] >= ballRow) need += 14;
    if (p.role === "NAP" && p.pos[1] >= ROWS - 7) need += 10;
    if (p.pos[1] >= ROWS - 6 && ballRow <= HALF_ROW + 1) need += 9;
    const anchor = formationAnchor(p, "B");
    if (p.pos[1] > anchor[1] + 1) need += (p.pos[1] - anchor[1]) * 2;
    return need;
  }

  function aiSupportRun(ballOw) {
    const runners = Object.values(state.them).filter(
      (p) => p.id !== ballOw.id && p.role !== "GK" && (state.aiLocked || []).indexOf(p.id) < 0
    );
    if (!runners.length) return false;
    runners.sort((a, b) => aiSupportNeed(b, ballOw) - aiSupportNeed(a, ballOw));
    const r = runners[0];
    if (aiSupportNeed(r, ballOw) < 2) return false;
    const anchor = formationAnchor(r, "B");
    const targetRow = Math.max(2, Math.min(ballOw.pos[1] - 2, anchor[1]));
    const col =
      r.role === "OP1"
        ? clamp(r.home[0], 0, 4)
        : r.role === "OP2"
          ? clamp(r.home[0], 8, 12)
          : clamp(ballOw.pos[0], 3, 9);
    aiMoveToward(r, [col, targetRow]);
    return true;
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
      notePass(from, to, true, isCross);
      state.ballOwner = to.id;
      state.ball = to.pos.slice();
      state.loose = false;
      to.burst = true;
      from.burst = false;
      resetCarryFatigue();
    } else {
      notePass(from, to, false, isCross);
      state.ballOwner = null;
      state.loose = true;
      resetCarryFatigue();
      state.ball = [
        clamp(Math.round((from.pos[0] + to.pos[0]) / 2), 0, 12),
        clamp(Math.round((from.pos[1] + to.pos[1]) / 2), 0, 20),
      ];
      pushLog("ПК: свободный мяч");
    }
    noteBallHeat();
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
      const pa = previewCarryPath(p, from, a);
      const pb = previewCarryPath(p, from, b);
      // сначала безопасный коридор, потом ближе к цели
      return pb.combined - pa.combined || pa.maxPr - pb.maxPr || da;
    });
    const to = opts[0];
    const steps = hexDist(from, to);
    const usedBurst = carrying && p.burst;
    if (carrying) {
      const res = resolveCarryPath(p, from, to);
      pushLog(
        "ПК " +
          p.name +
          " ведёт → " +
          cellName(to) +
          " · " +
          (usedBurst ? "A" + p.accel : "S" + p.speed) +
          " · " +
          res.detail
      );
      if (res.ok) {
        p.pos = to;
        state.ball = to.slice();
        state.loose = false;
        state.carryFatigue = res.fatigue;
      } else {
        p.pos = res.lostAt.slice();
        state.ballOwner = null;
        state.loose = true;
        state.ball = res.lostAt.slice();
        resetCarryFatigue();
        pushLog("ПК потерял мяч на пути @ " + cellName(res.lostAt), true);
      }
    } else {
      p.pos = to;
      pushLog("ПК " + p.name + " → " + cellName(p.pos) + " · S" + p.speed);
      if (state.loose && p.pos[0] === state.ball[0] && p.pos[1] === state.ball[1]) {
        claimLoose(p, true);
      }
    }
    if (usedBurst || carrying) p.burst = false;
    const el = pieceEls[p.id];
    if (el) {
      el.style.transition = "left " + moveMs(from, p.pos) + "ms ease, top " + moveMs(from, p.pos) + "ms ease";
    }
  }

  function aiSmart(ow) {
    if (ow.pos[1] <= 7 && tryAiShot(ow, 18)) return;
    if (ow.pos[1] > HALF_ROW + 1 && aiEscapeOwnHalf(ow)) return;
    if (Math.random() < 0.48 && aiSupportRun(ow)) return;
    const recv = freest(ow, true, { needForward: true });
    if (recv && pressureOn(recv.pos, "B").pts <= 1) {
      aiPass(ow, recv, hexDist(ow.pos, recv.pos) > actionRange(ow, "pass"));
      return;
    }
    aiMoveToward(ow, [CENTER_COL, 2]);
  }
  function aiWidth(ow) {
    if (ow.pos[1] <= 8 && tryAiShot(ow, 12)) return;
    if (ow.pos[1] > HALF_ROW + 1 && aiEscapeOwnHalf(ow)) return;
    if (ow.pos[1] >= 8 && ow.pos[1] <= 13 && Math.abs(ow.pos[0] - CENTER_COL) >= 3 && Math.random() < 0.45) {
      aiMoveToward(ow, [CENTER_COL, Math.max(2, ow.pos[1] - 3)]);
      return;
    }
    if (Math.random() < 0.45 && aiSupportRun(ow)) return;
    // у бровки — режь к центру/воротам, не крути A7↔B7
    if (Math.abs(ow.pos[0] - CENTER_COL) >= 4 && ow.pos[1] <= HALF_ROW) {
      if (tryAiShot(ow, 10)) return;
      const cut = freest(ow, false, { needForward: true });
      if (cut) {
        aiPass(ow, cut, hexDist(ow.pos, cut.pos) > actionRange(ow, "pass"));
        return;
      }
      aiMoveToward(ow, [CENTER_COL, Math.max(2, ow.pos[1] - 3)]);
      return;
    }
    const recv = freest(ow, true, { needForward: ow.pos[1] > 6 });
    if (recv && Math.abs(recv.pos[0] - CENTER_COL) >= 2 && recv.pos[1] <= ow.pos[1]) {
      aiPass(ow, recv, true);
      return;
    }
    aiMoveToward(ow, [ow.pos[0] < 6 ? 1 : 11, Math.max(2, ow.pos[1] - 3)]);
  }
  /** Слабый соперник: почти не тащит сам, пас назад/в ширину, форма не схлопывается */
  function aiShape(ow) {
    if (ow.pos[1] <= 7 && tryAiShot(ow, 14)) return;
    if ((state.carryFatigue || 0) >= 2 || pressureOn(ow.pos, "B").pts >= 2) {
      const safe = Object.values(state.them)
        .filter((t) => t.id !== ow.id && t.role !== "GK")
        .sort((a, b) => pressureOn(a.pos, "B").pts - pressureOn(b.pos, "B").pts)[0];
      if (safe && inActionRange(ow, safe.pos, "pass")) {
        aiPass(ow, safe, false);
        return;
      }
    }
    const recv = freest(ow, true, { needForward: true });
    if (recv) {
      aiPass(ow, recv, hexDist(ow.pos, recv.pos) > 3);
      return;
    }
    aiMoveToward(ow, [clamp(ow.pos[0], 2, 10), Math.max(3, ow.pos[1] - 2)]);
  }
  function aiCollapse(ow) {
    const z = state.them.Z;
    if (z && hexDist(z.pos, ow.pos) > 3) {
      const opts = cellsInRange(z.pos, 1).filter((pos) => canStandOn(pos, z.id));
      opts.sort((a, b) => hexDist(a, ow.pos) - hexDist(b, ow.pos));
      if (opts[0]) z.pos = opts[0];
    }
    if (ow.pos[1] <= 7 && tryAiShot(ow, 18)) return;
    aiMoveToward(ow, [CENTER_COL, 3]);
  }
  function aiPossess(ow) {
    if (ow.pos[1] <= 6 && tryAiShot(ow, 22)) return;
    if (ow.pos[1] > HALF_ROW + 1 && aiEscapeOwnHalf(ow)) return;
    if (ow.pos[1] >= 8 && ow.pos[1] <= 13 && Math.random() < 0.5) {
      aiMoveToward(ow, [clamp(ow.pos[0], 4, 8), Math.max(2, ow.pos[1] - 3)]);
      return;
    }
    const press = pressureOn(ow.pos, "B").pts;
    if (Math.random() < 0.45 && press < 3 && aiSupportRun(ow)) return;
    const fwd = freest(ow, false, { needForward: true });
    if (fwd && hexDist(ow.pos, fwd.pos) <= actionRange(ow, "pass")) {
      aiPass(ow, fwd, false);
      return;
    }
    if (press >= 2 || (state.carryFatigue || 0) >= 3) {
      const safe = Object.values(state.them)
        .filter((t) => t.id !== ow.id && t.role !== "GK")
        .sort((a, b) => pressureOn(a.pos, "B").pts - pressureOn(b.pos, "B").pts || hexDist(a.pos, ow.pos) - hexDist(b.pos, ow.pos))[0];
      if (safe && inActionRange(ow, safe.pos, "pass")) {
        aiPass(ow, safe, false);
        return;
      }
    }
    aiMoveToward(ow, [clamp(ow.pos[0], 3, 9), Math.max(2, ow.pos[1] - 3)]);
  }

  function aiDirect(ow) {
    if (ow.pos[1] <= 8 && tryAiShot(ow, 14)) return;
    if (ow.pos[1] > HALF_ROW + 1 && aiEscapeOwnHalf(ow)) return;
    if (ow.pos[1] >= 8 && ow.pos[1] <= 13 && Math.random() < 0.5) {
      aiMoveToward(ow, [CENTER_COL, Math.max(1, ow.pos[1] - 4)]);
      return;
    }
    if (Math.random() < 0.42 && aiSupportRun(ow)) return;
    const recv = freest(ow, false, { needForward: true });
    if (recv && recv.pos[1] < ow.pos[1] - 1) {
      aiPass(ow, recv, hexDist(ow.pos, recv.pos) > actionRange(ow, "pass"));
      return;
    }
    aiMoveToward(ow, [CENTER_COL, 1]);
  }

  function aiPressAttack(ow) {
    if (ow.pos[1] <= 7 && tryAiShot(ow, 16)) return;
    if (ow.pos[1] > HALF_ROW + 1 && aiEscapeOwnHalf(ow)) return;
    if (Math.random() < 0.4 && aiSupportRun(ow)) return;
    const recv = freest(ow, true, { needForward: true });
    if (recv) {
      aiPass(ow, recv, hexDist(ow.pos, recv.pos) > actionRange(ow, "pass"));
      return;
    }
    aiMoveToward(ow, [CENTER_COL, 2]);
  }

  function aiDefend(style) {
    const target = state.loose ? state.ball : ownerPlayer() ? ownerPlayer().pos : state.ball;
    const hunters = Object.values(state.them)
      .filter((p) => p.role !== "GK" && (state.aiLocked || []).indexOf(p.id) < 0)
      .sort((a, b) => hexDist(a.pos, target) - hexDist(b.pos, target));
    const h = hunters[0];
    if (!h) {
      const idle = Object.values(state.them).find((p) => p.role !== "GK");
      if (idle) aiMoveToward(idle, [idle.home[0], clamp(target[1] + 2, 4, ROWS - 3)]);
      return;
    }
    // края не бросают канал
    if ((h.role === "OP1" || h.role === "OP2") && Math.abs(h.home[0] - target[0]) > 4 && style !== "press") {
      aiMoveToward(h, [h.home[0], clamp(target[1] + 1, 3, ROWS - 4)]);
      return;
    }
    const ow = ownerPlayer();
    const range = actionRange(h, "tackle");
    if (ow && ow.side === "A" && hexDist(h.pos, ow.pos) <= range) {
      const ch = chanceTackle(h, ow);
      let chance = ch.chance;
      if (state.opponentId === "academy") chance = Math.round(chance * 0.7);
      const pr = pressureOn(ow.pos, "A").pts;
      // чаще опека: без поддержки партнёра не рубим
      if (pr < 2 && Math.random() < (style === "press" ? 0.48 : 0.82)) {
        const shadow = [
          clamp(ow.pos[0] + (h.role === "OP1" ? -1 : h.role === "OP2" ? 1 : 0), 0, COLS - 1),
          clamp(ow.pos[1] + 1, 0, ROWS - 1),
        ];
        aiMoveToward(h, shadow);
        return;
      }
      const roll = rnd();
      pushLog("ПК отбор · " + chance + "%");
      if (roll <= chance) {
        state.ballOwner = h.id;
        state.ball = h.pos.slice();
        state.loose = false;
        h.burst = true;
        resetCarryFatigue();
        noteTackle("B", true);
        pushLog("ПК отобрал!", true);
      } else {
        noteTackle("B", false);
        pushLog("ПК отбор мимо — мяч у " + ow.name);
        state.aiLocked = state.aiLocked || [];
        state.aiLocked.push(h.id);
      }
      return;
    }
    if (style === "press") aiMoveToward(h, target);
    else aiMoveToward(h, [clamp(target[0], 2, 10), clamp(target[1] + 2, 4, ROWS - 3)]);
  }

  function playerFreest(from, opts) {
    const needForward = opts && opts.needForward;
    let best = null;
    let bestS = -999;
    Object.values(state.you).forEach((t) => {
      if (t.id === from.id || t.role === "GK") return;
      const mode = hexDist(from.pos, t.pos) > actionRange(from, "pass") ? "cross" : "pass";
      if (hexDist(from.pos, t.pos) > actionRange(from, mode)) return;
      const pr = pressureOn(t.pos, "A").pts;
      const forward = t.pos[1] - from.pos[1];
      if (needForward && forward < 1) return;
      let s = -pr * 4 + forward * 5 - Math.abs(t.pos[0] - from.pos[0]) * 0.15;
      if (forward <= 0) s -= 6;
      if (t.role === "NAP" && forward >= 1) s += 5;
      if (t.role === "NAP" && t.pos[1] >= HALF_ROW) s += 3;
      if (s > bestS) {
        bestS = s;
        best = t;
      }
    });
    return best;
  }

  function playerSupportNeed(p, ballOw) {
    const ballRow = ballOw.pos[1];
    let need = 0;
    if (p.pos[1] < ballRow - 1) need += (ballRow - p.pos[1]) * 3;
    if (p.role === "NAP" && p.pos[1] <= ballRow) need += 14;
    if (p.role === "NAP" && p.pos[1] <= 7) need += 10;
    if (p.pos[1] <= 5 && ballRow >= HALF_ROW - 1) need += 9;
    const anchor = formationAnchor(p, "A");
    if (p.pos[1] < anchor[1] - 1) need += (anchor[1] - p.pos[1]) * 2;
    return need;
  }

  function playerSupportRun(ballOw) {
    const runners = Object.values(state.you).filter(
      (p) => p.id !== ballOw.id && p.role !== "GK" && !isLocked(p.id)
    );
    if (!runners.length) return false;
    runners.sort((a, b) => playerSupportNeed(b, ballOw) - playerSupportNeed(a, ballOw));
    const r = runners[0];
    if (playerSupportNeed(r, ballOw) < 2) return false;
    const anchor = formationAnchor(r, "A");
    const targetRow = Math.min(GOAL_B_ROW - 2, Math.max(ballOw.pos[1] + 2, anchor[1]));
    const col =
      r.role === "OP1"
        ? clamp(r.home[0], 0, 4)
        : r.role === "OP2"
          ? clamp(r.home[0], 8, 12)
          : clamp(ballOw.pos[0], 3, 9);
    playerMoveToward(r, [col, targetRow]);
    return true;
  }

  function playerMoveToward(p, target) {
    const bud = moveBudget(p);
    const from = p.pos.slice();
    let opts = cellsInRange(p.pos, bud).filter((pos) => canStandOn(pos, p.id));
    if (state.loose) {
      const d = hexDist(p.pos, state.ball);
      if (d > 0 && d <= bud && (canStandOn(state.ball, p.id) || canTargetLooseBall(state.ball, p.id))) {
        if (!opts.some((x) => x[0] === state.ball[0] && x[1] === state.ball[1])) opts.push(state.ball.slice());
      }
    }
    if (!opts.length) {
      state.selectedId = p.id;
      spendAP(p.id);
      return;
    }
    const carrying = state.ballOwner === p.id;
    opts.sort((a, b) => {
      const da = hexDist(a, target) - hexDist(b, target);
      if (!carrying) return da;
      const pa = previewCarryPath(p, from, a);
      const pb = previewCarryPath(p, from, b);
      return pb.combined - pa.combined || pa.maxPr - pb.maxPr || da;
    });
    doMove(p, opts[0]);
  }

  function playerAutoAction() {
    if (state.over || state.turn !== "A" || state.ap <= 0) return false;
    const style = state.homeAiStyle || "direct";
    if (state.loose) {
      const onBall = Object.values(state.you).find(
        (p) => p.pos[0] === state.ball[0] && p.pos[1] === state.ball[1] && !isLocked(p.id)
      );
      if (onBall) {
        claimLoose(onBall, true);
        spendAP(onBall.id);
        return true;
      }
      const near = Object.values(state.you)
        .filter((p) => p.role !== "GK" && !isLocked(p.id))
        .sort((a, b) => hexDist(a.pos, state.ball) - hexDist(b.pos, state.ball))[0];
      if (near) {
        const d = hexDist(near.pos, state.ball);
        const tR = actionRange(near, "tackle");
        const occ = occupant(state.ball);
        if (d <= tR && d > 0) {
          if (occ && occ.side === "B") contestedLoose(near, occ, false);
          else claimLoose(near, false);
          spendAP(near.id);
          return true;
        }
        playerMoveToward(near, state.ball);
        return true;
      }
    }

    const ow = ownerPlayer();
    if (ow && ow.side === "A" && !isLocked(ow.id)) {
      const press = pressureOn(ow.pos, "A").pts;
      const phase = attackPhase("A");
      const nap = state.you.NAP;
      const napStuck =
        nap &&
        !isLocked(nap.id) &&
        (nap.pos[1] <= Math.min(ow.pos[1], HALF_ROW - 1) || (nap.pos[1] <= 7 && ow.pos[1] >= HALF_ROW - 2));

      // критично: НП застрял сзади — сначала выдвижение, не пас ОП↔ОП
      if (napStuck && (ow.role === "OP1" || ow.role === "OP2" || ow.role === "Z") && Math.random() < 0.85) {
        playerMoveToward(nap, [
          clamp(ow.pos[0] + (Math.random() < 0.5 ? -1 : 1), 3, 9),
          Math.min(GOAL_B_ROW - 2, Math.max(ow.pos[1] + 2, HALF_ROW + 1)),
        ]);
        return true;
      }

      // finish: бить / искать НП, не крутить
      if (phase === "finish") {
        const aim = GOAL_COLS.includes(ow.pos[0]) ? ow.pos[0] : CENTER_COL;
        const ch = chanceShot(ow, [aim, GOAL_B_ROW], null);
        if (!ch.outOfRange && ch.chance >= (style === "possess" ? 11 : 8) && ch.pressure < 3) {
          doShot(ow, [aim, GOAL_B_ROW]);
          return true;
        }
        if (nap && nap.pos[1] > ow.pos[1] && inActionRange(ow, nap.pos, "pass")) {
          doPass(ow, nap, false);
          return true;
        }
        if (Math.random() < 0.45 && playerSupportRun(ow)) return true;
      }

      // build: запрет поперечного ОП↔ОП — только вперёд / support
      if (phase === "build") {
        if ((napStuck || Math.random() < 0.6) && playerSupportRun(ow)) return true;
        const fwd = playerFreest(ow, { needForward: true });
        if (fwd && inActionRange(ow, fwd.pos, hexDist(ow.pos, fwd.pos) > actionRange(ow, "pass") ? "cross" : "pass")) {
          doPass(ow, fwd, hexDist(ow.pos, fwd.pos) > actionRange(ow, "pass"));
          return true;
        }
        playerMoveToward(ow, [clamp(ow.pos[0], 3, 9), Math.min(GOAL_B_ROW - 2, ow.pos[1] + 4)]);
        return true;
      }

      // анти-залипание: из центральной полосы чаще нести/бить вперёд, не крутить поперечный пас
      const midBand = ow.pos[1] >= 8 && ow.pos[1] <= 13;
      if (midBand && press < 2 && Math.random() < 0.72) {
        if (ow.pos[1] >= GOAL_B_ROW - 10) {
          const aim = GOAL_COLS.includes(ow.pos[0]) ? ow.pos[0] : CENTER_COL;
          const ch = chanceShot(ow, [aim, GOAL_B_ROW], null);
          if (!ch.outOfRange && ch.chance >= 8) {
            doShot(ow, [aim, GOAL_B_ROW]);
            return true;
          }
        }
        playerMoveToward(ow, [clamp(ow.pos[0], 4, 8), Math.min(GOAL_B_ROW - 1, ow.pos[1] + 5)]);
        return true;
      }
      // подтяни партнёра вперёд чаще — иначе нет адресата паса
      if ((napStuck || Math.random() < 0.55) && press < 3 && playerSupportRun(ow)) return true;

      const shotRow = style === "possess" ? GOAL_B_ROW - 7 : style === "width" ? GOAL_B_ROW - 9 : GOAL_B_ROW - 9;
      const minChance = style === "possess" ? 14 : style === "width" ? 9 : 10;
      if (ow.pos[1] >= shotRow || ow.pos[1] >= GOAL_B_ROW - 5) {
        const aim = GOAL_COLS.includes(ow.pos[0]) ? ow.pos[0] : CENTER_COL;
        const goalHex = [aim, GOAL_B_ROW];
        const ch = chanceShot(ow, goalHex, null);
        const urgent = ow.pos[1] >= GOAL_B_ROW - 5 || style === "width";
        if (!ch.outOfRange && ch.chance >= (urgent ? Math.min(7, minChance) : minChance) && ch.pressure < 3) {
          doShot(ow, goalHex);
          return true;
        }
      }
      // из своей половины — сразу вперёд, без поперечного круговорота
      if (ow.pos[1] < HALF_ROW - 1) {
        const fwd = playerFreest(ow, { needForward: true });
        if (fwd && inActionRange(ow, fwd.pos, hexDist(ow.pos, fwd.pos) > actionRange(ow, "pass") ? "cross" : "pass")) {
          doPass(ow, fwd, hexDist(ow.pos, fwd.pos) > actionRange(ow, "pass"));
          return true;
        }
        playerMoveToward(ow, [clamp(ow.pos[0], 3, 9), Math.min(GOAL_B_ROW - 2, ow.pos[1] + 4)]);
        return true;
      }

      const fwd = playerFreest(ow, { needForward: true });
      // progress: не кормить поперечный ОП↔ОП, если НП свободен впереди
      const lateralOp =
        fwd &&
        (ow.role === "OP1" || ow.role === "OP2") &&
        (fwd.role === "OP1" || fwd.role === "OP2") &&
        Math.abs(fwd.pos[1] - ow.pos[1]) <= 1;
      const wantPass =
        fwd &&
        !lateralOp &&
        !(fwd.role !== "NAP" && napStuck) &&
        (fwd.role === "NAP" ||
          style === "possess" ||
          press >= 1 ||
          fwd.pos[1] > ow.pos[1] + 1 ||
          (style === "width" && Math.abs(fwd.pos[0] - CENTER_COL) >= 3));
      if (wantPass && fwd) {
        const isCross = hexDist(ow.pos, fwd.pos) > actionRange(ow, "pass");
        const mode = isCross ? "cross" : "pass";
        if (inActionRange(ow, fwd.pos, mode)) {
          doPass(ow, fwd, isCross);
          return true;
        }
      }
      // под прессом без адреса — короткий сброс
      if (press >= 2) {
        const any = playerFreest(ow, null);
        if (any && inActionRange(ow, any.pos, "pass")) {
          doPass(ow, any, false);
          return true;
        }
      }
      if (style === "width") {
        if (ow.pos[1] >= GOAL_B_ROW - 8 && Math.abs(ow.pos[0] - CENTER_COL) >= 2) {
          playerMoveToward(ow, [CENTER_COL, Math.min(GOAL_B_ROW - 1, ow.pos[1] + 2)]);
        } else if (Math.abs(ow.pos[0] - CENTER_COL) >= 4 && ow.pos[1] >= HALF_ROW) {
          playerMoveToward(ow, [CENTER_COL, Math.min(GOAL_B_ROW - 1, ow.pos[1] + 3)]);
        } else {
          playerMoveToward(ow, [ow.pos[0] < CENTER_COL ? 1 : 11, Math.min(GOAL_B_ROW - 1, ow.pos[1] + 3)]);
        }
      } else {
        playerMoveToward(ow, [clamp(ow.pos[0], GOAL_COLS[0], GOAL_COLS[2]), Math.min(GOAL_B_ROW - 1, ow.pos[1] + 4)]);
      }
      return true;
    }

    const target = ownerPlayer() && ownerPlayer().side === "B" ? ownerPlayer().pos : state.ball;
    const hunters = Object.values(state.you)
      .filter((p) => p.role !== "GK" && !isLocked(p.id))
      .sort((a, b) => hexDist(a.pos, target) - hexDist(b.pos, target));
    const h = hunters[0];
    if (!h) return false;
    const victim = ownerPlayer();
    if (victim && victim.side === "B" && hexDist(h.pos, victim.pos) <= actionRange(h, "tackle")) {
      const ch = chanceTackle(h, victim);
      const pr = pressureOn(victim.pos, "B").pts;
      if (pr < 2 && Math.random() < 0.78) {
        playerMoveToward(h, [victim.pos[0], Math.max(1, victim.pos[1] - 1)]);
        return true;
      }
      doTackle(h, victim);
      return true;
    }
    playerMoveToward(h, [clamp(target[0], 2, 10), Math.max(2, target[1] - 2)]);
    return true;
  }

  function endAITurnSync() {
    holdFormation("B", skipBallOwnerIds("B"), true);
    state.turn = "A";
    state.ap = COACH_AP;
    state.lockedIds = [];
    state.actedIds = [];
    state.minute = Math.min(MATCH_MINUTES, state.minute + 1);
    state.waiting = false;
    state.selectedId = null;
    pushLog("— Ваш ход (" + COACH_AP + " AP) — · " + state.minute + "'", true);
    if (state.minute >= MATCH_MINUTES) endMatch();
  }

  function runAISync() {
    const opp = OPPONENTS.find((x) => x.id === state.opponentId);
    const awayStyle = state.awayAiStyle || (opp && opp.ai) || "direct";
    let ap = COACH_AP;
    state.aiLocked = [];
    state.turn = "B";
    pushLog("— Ход соперника —");
    while (ap > 0 && !state.over) {
      aiAction(awayStyle);
      microOffBall("B", { maxMovers: 2 });
      ap -= 1;
    }
    if (!state.over) endAITurnSync();
  }

  /** ИИ vs ИИ. opts: { awayId, homeStyle, awayAi, homeMult, awayMult, skillSpread, homeName, awayName, awayNames } */
  function autoPlayFullMatch(oppIdOrOpts) {
    const opts = typeof oppIdOrOpts === "string" || !oppIdOrOpts ? { awayId: oppIdOrOpts || "academy" } : oppIdOrOpts;
    const awayId = opts.awayId || "academy";
    const homeStyle = opts.homeStyle || "direct";
    const homeMult = opts.homeMult != null ? opts.homeMult : 1;
    const skillSpread = opts.skillSpread != null ? opts.skillSpread : 0;
    state.autoPlay = true;
    state.homeAiStyle = homeStyle;
    state.matchArchive = [];
    state.stats = emptyMatchStats();
    state.opponentId = awayId;
    const opp = OPPONENTS.find((x) => x.id === awayId) || OPPONENTS[0];
    const awayMult = opts.awayMult != null ? opts.awayMult : opp.mult;
    const awayAi = opts.awayAi || opp.ai;
    state.awayAiStyle = awayAi;
    const awayNames = opts.awayNames || opp.names;
    state.you = buildSquad("A", null, homeMult, skillSpread);
    // стиль = только поведение ИИ, без скрытых баффов скиллов
    state.them = buildSquad("B", awayNames, awayMult, skillSpread);
    if (opts.homeName) {
      // косметика для отчёта: переименуем NAP как маркер клуба
      state.you.NAP.name = String(opts.homeName).slice(0, 18);
    }
    const homeSnap = squadSkillSnapshot(state.you);
    const awaySnap = squadSkillSnapshot(state.them);
    startMatch();
    noteBallHeat();
    let guard = 0;
    while (!state.over && state.minute < MATCH_MINUTES && guard++ < 200) {
      state.turn = "A";
      state.ap = COACH_AP;
      state.actedIds = [];
      state.lockedIds = [];
      let stuck = 0;
      while (state.ap > 0 && !state.over && state.turn === "A") {
        const ap0 = state.ap;
        playerAutoAction();
        noteBallHeat();
        if (state.ap >= ap0) {
          stuck++;
          state.ap -= 1;
          microOffBall("A", { maxMovers: 2 });
          if (stuck > 6) break;
        } else stuck = 0;
      }
      holdFormation("A", skipBallOwnerIds("A"), true);
      if (state.over) break;
      runAISync();
      noteBallHeat();
    }
    state.autoPlay = false;
    const archive = state.matchArchive || [];
    const thirds = state.stats.thirds;
    const thirdSum = Math.max(1, thirds.attA + thirds.mid + thirds.attB);
    const advanced = buildAdvancedReport(state.stats);
    const result = {
      mode: "AI vs AI",
      homeStyle,
      homeMult,
      awayMult,
      skillSpread,
      homeName: opts.homeName || "Home",
      opponent: opts.awayName || opp.name,
      awayId: opp.id,
      awayAi,
      awayTier: opp.tier,
      coachAP: COACH_AP,
      score: state.score.slice(),
      minute: state.minute,
      over: state.over,
      squads: { home: homeSnap, away: awaySnap },
      stats: state.stats,
      advanced,
      thirdsShare: {
        attA: +(thirds.attA / thirdSum).toFixed(3),
        mid: +(thirds.mid / thirdSum).toFixed(3),
        attB: +(thirds.attB / thirdSum).toFixed(3),
      },
      possessionPct: advanced.possessionPct,
      attackDirection: advanced.attackDirection,
      xg: advanced.xg,
      xa: advanced.xa,
      sot: advanced.sot,
      heatMap: advanced.heatMap,
      heatMap1st: advanced.heatMap1st,
      heatMap2nd: advanced.heatMap2nd,
      passMap: advanced.passMap,
      roleShape: advanced.roleShape,
      passDirectionShare: advanced.passDirectionShare,
      passPct: state.stats.passAtt ? +((100 * state.stats.passComp) / state.stats.passAtt).toFixed(1) : 0,
      goals: archive.filter((x) => /ГОЛ/i.test(x.msg)),
      saves: state.stats.gkSaves || 0,
      protocol: archive.map((x) => x.minute + "' " + x.msg),
      topPassLinks: advanced.passMap.top.slice(0, 12),
      hotCells: advanced.heatMap.top.slice(0, 12),
    };
    result.quality = evaluateFootballQuality(result);
    return result;
  }

  function evaluateFootballQuality(result) {
    const issues = [];
    const notes = [];
    const s = result.score;
    const st = result.stats || {};
    const totalGoals = s[0] + s[1];
    const sf = st.shotsFor || 0;
    const sa = st.shotsAgainst || 0;
    const shots = sf + sa;
    const xgA = (result.xg && result.xg.A) || st.xgFor || 0;
    const xgB = (result.xg && result.xg.B) || st.xgAgainst || 0;
    const xgSum = xgA + xgB;
    const mid = result.thirdsShare ? result.thirdsShare.mid : 1;
    const att = result.thirdsShare ? result.thirdsShare.attA + result.thirdsShare.attB : 0;
    const passPct = result.passPct || 0;
    const homeMult = result.homeMult != null ? result.homeMult : 1;
    const awayMult = result.awayMult != null ? result.awayMult : 1;
    const homeAvg = result.squads && result.squads.home ? result.squads.home.avg : null;
    const awayAvg = result.squads && result.squads.away ? result.squads.away.avg : null;
    const multGap = Math.max(homeMult, awayMult) / Math.max(0.05, Math.min(homeMult, awayMult));
    const avgGap = homeAvg && awayAvg ? Math.max(homeAvg, awayAvg) / Math.max(0.05, Math.min(homeAvg, awayAvg)) : 1;
    const gap = Math.max(multGap, avgGap);
    const mismatch = gap >= 1.18;
    const bigMismatch = gap >= 1.32;
    const spreadNoise = (result.skillSpread || 0) >= 0.85;
    const homeStronger =
      homeMult > awayMult + 0.04 || (homeAvg != null && awayAvg != null && homeAvg > awayAvg + 0.15);
    const awayStronger =
      awayMult > homeMult + 0.04 || (homeAvg != null && awayAvg != null && awayAvg > homeAvg + 0.15);
    const dominantShots = homeStronger ? sf : awayStronger ? sa : Math.max(sf, sa);
    const weakShots = homeStronger ? sa : awayStronger ? sf : Math.min(sf, sa);
    const equalish = !mismatch && Math.abs(homeMult - awayMult) < 0.15;
    const gd = Math.abs(s[0] - s[1]);
    const xgRatio = Math.max(xgA, xgB) / Math.max(0.35, Math.min(xgA, xgB));
    const softMismatch = mismatch || bigMismatch || gap >= 1.12 || (spreadNoise && xgRatio >= 2.0) || xgRatio >= 2.4;

    // --- goals ---
    if (totalGoals < 1) {
      if (shots >= 3 && xgSum >= 0.7) notes.push("0:0 при моментах (xG " + xgSum.toFixed(2) + ") — низкая реализация");
      else if (softMismatch && dominantShots >= 3 && xgSum >= 0.9)
        notes.push("безголевая осада при контроле/" + "силе");
      else if (shots >= 2 && xgSum >= 0.55) notes.push("0:0, мало моментов (xG " + xgSum.toFixed(2) + ")");
      else issues.push("мало голов (<1)");
    }
    if (totalGoals > 14) issues.push("много голов (>14)");
    else if (totalGoals > 11 && equalish && !spreadNoise && !softMismatch) issues.push("много голов на равных (>11)");
    else if (totalGoals > 9) notes.push("результативный матч (открытый темп / классы)");

    // --- shots volume ---
    if (shots < 5) {
      if (softMismatch && dominantShots >= 2 && shots >= 2)
        notes.push("мало ударов при одностороннем контроле (xG " + xgA.toFixed(2) + "-" + xgB.toFixed(2) + ")");
      else if (shots >= 3 && sf >= 1 && sa >= 1 && xgSum >= 0.7)
        notes.push("мало ударов, но обе стороны создали моменты (xG " + xgSum.toFixed(2) + ")");
      else issues.push("мало ударов (<5)");
    }

    // conversion: ignore when mismatch blowout / weak barely shoots
    if (!softMismatch && shots >= 8 && totalGoals / shots > 0.8) issues.push("слишком высокая реализация");
    else if (equalish && !softMismatch && shots >= 6 && totalGoals / shots > 0.82) issues.push("слишком высокая реализация");
    else if (softMismatch && weakShots <= 1 && shots >= 6 && totalGoals / shots > 0.85)
      notes.push("высокая реализация в матче с подавляющим контролем");

    if (mid > 0.88) issues.push("залипание в центре (>88%)");
    else if (mid > 0.84 && !softMismatch) issues.push("залипание в центре (>84%)");
    else if (mid > 0.84 && softMismatch) notes.push("центр при контроле/разнице классов (" + mid.toFixed(2) + ")");
    else if (mid > 0.8 && equalish && shots < 5) issues.push("залипание в центре (>80%)");
    else if (mid > 0.62 && equalish) notes.push("середина всё ещё жирная (mid=" + mid.toFixed(2) + ")");
    else if (mid <= 0.55) notes.push("хорошее распределение по третям (mid=" + mid.toFixed(2) + ")");
    if (att < 0.1) issues.push("мало игры в финальных третях");
    else if (att < 0.14 && equalish && !softMismatch) issues.push("мало игры в финальных третях");

    if (equalish && gd > 4 && !softMismatch) {
      if (spreadNoise && xgRatio >= 2.0) notes.push("разгром при skill-spread по xG");
      else issues.push("разгром на равных");
    } else if (equalish && gd > 4 && softMismatch) {
      notes.push("разгром по моментам (xG " + xgA.toFixed(2) + "-" + xgB.toFixed(2) + ")");
    }
    if ((mismatch || softMismatch) && gd >= 4) {
      const favWon = (homeStronger && s[0] > s[1]) || (awayStronger && s[1] > s[0]) || (xgA >= xgB && s[0] >= s[1]) || (xgB > xgA && s[1] >= s[0]);
      if (favWon) notes.push("разгром оправдан превосходством (gap=" + gap.toFixed(2) + ")");
    }

    if ((st.passAtt || 0) >= 35 && passPct < 30) issues.push("пас слишком хаотичный");
    if ((st.passAtt || 0) >= 35 && passPct > 95) issues.push("пас слишком лёгкий");
    else if ((st.passAtt || 0) >= 35 && passPct > 92 && softMismatch) notes.push("высокий % паса у контролирующей стороны");

    const pressy = result.awayAi === "press" || result.homeStyle === "press";
    const tackleCap = pressy || softMismatch ? 130 : 92;
    if ((st.tackles || 0) > tackleCap) issues.push("спам отборов");

    // one-sided shots
    if (sf < 1 || sa < 1) {
      const dom = Math.max(sf, sa);
      const weak = Math.min(sf, sa);
      if (softMismatch && weak < 1 && dom >= 2) {
        notes.push("слабый без ударов оправдан контролем/силой (удары фаворита " + dom + ", gap=" + gap.toFixed(2) + ")");
      } else if (totalGoals === 0 && dom >= 4 && xgSum >= 1.0) {
        notes.push("односторонняя осада без гола");
      } else {
        issues.push("одна сторона почти не бьёт");
      }
    }

    if (mismatch && dominantShots < 2 && totalGoals < 2) issues.push("фаворит почти не создаёт моменты");

    // оффбол / НП: не залипать в своей штрафной; пасы не должны быть почти все поперечные
    const rs = (result.advanced && result.advanced.roleShape) || result.roleShape || {};
    const napA = rs.A && rs.A.NAP;
    const napB = rs.B && rs.B.NAP;
    if (napA && napA.samples >= 40 && napA.ownBoxShare != null && napA.ownBoxShare > 0.42)
      issues.push("НП дома слишком часто в своей штрафной");
    else if (napA && napA.samples >= 40 && napA.avgRow < 7.5) notes.push("НП дома глубоко (avgRow " + napA.avgRow + ")");
    if (napB && napB.samples >= 40 && napB.ownBoxShare != null && napB.ownBoxShare > 0.42)
      issues.push("НП гостей слишком часто в своей штрафной");
    else if (napB && napB.samples >= 40 && napB.avgRow > 13.5) notes.push("НП гостей глубоко (avgRow " + napB.avgRow + ")");
    const pdir = (result.advanced && result.advanced.passDirectionShare) || result.passDirectionShare;
    if (pdir && pdir.lateral > 0.55 && equalish) issues.push("слишком много поперечных передач");
    else if (pdir && pdir.lateral > 0.48) notes.push("много поперечных пасов (" + pdir.lateral + ")");

    return {
      ok: issues.length === 0,
      issues,
      notes,
      strength: { homeMult, awayMult, gap: +gap.toFixed(3), mismatch, bigMismatch, softMismatch },
    };
  }

  function stopWatchMatch() {
    state.watchPlay = false;
    state.waiting = false;
    if (state._watchTimer) {
      clearTimeout(state._watchTimer);
      state._watchTimer = null;
    }
  }

  function scheduleWatch(fn, ms) {
    if (state._watchTimer) clearTimeout(state._watchTimer);
    state._watchTimer = setTimeout(fn, ms);
  }

  function finishHomeWatchTurn() {
    if (!state.watchPlay || state.over) return;
    holdFormation("A", skipBallOwnerIds("A"), true);
    noteBallHeat();
    state.turn = "B";
    state.mode = null;
    state.reachable = [];
    state.targets = [];
    pushLog("— Ход соперника —");
    renderLeft();
    renderRight();
    paintBoard();
    syncPieces(true);
    state.waiting = true;
    scheduleWatch(runAI, Math.max(200, state.watchDelay - 40));
  }

  function runHomeAIWatch() {
    if (!state.watchPlay || state.over) return;
    state.turn = "A";
    state.ap = COACH_AP;
    state.actedIds = [];
    state.lockedIds = [];
    state.waiting = true;
    state.selectedId = null;
    renderLeft();
    renderRight();
    const step = () => {
      if (!state.watchPlay || state.over) return;
      if (state.ap <= 0 || state.turn !== "A") {
        finishHomeWatchTurn();
        return;
      }
      const ap0 = state.ap;
      playerAutoAction();
      noteBallHeat();
      if (state.ap >= ap0) state.ap -= 1;
      syncPieces(true);
      paintBoard();
      renderLeft();
      renderRight();
      scheduleWatch(step, state.watchDelay);
    };
    scheduleWatch(step, Math.max(160, state.watchDelay * 0.55));
  }

  /** Визуальный ИИ vs ИИ на поле (не headless). */
  function startWatchMatch(opts) {
    opts = opts || {};
    const awayId = opts.awayId || state.opponentId || "rivals";
    const homeStyle = opts.homeStyle || "direct";
    const homeMult = opts.homeMult != null ? opts.homeMult : 1;
    const skillSpread = opts.skillSpread != null ? opts.skillSpread : 0.35;
    const delay = opts.delay != null ? opts.delay : state.watchDelay || 420;
    stopWatchMatch();
    state.watchPlay = true;
    state.autoPlay = false;
    state.watchDelay = Math.max(80, Number(delay) || 420);
    state.homeAiStyle = homeStyle;
    state.opponentId = awayId;
    state.stats = emptyMatchStats();
    state.matchArchive = [];
    const opp = OPPONENTS.find((x) => x.id === awayId) || OPPONENTS[0];
    const awayMult = opts.awayMult != null ? opts.awayMult : opp.mult;
    const awayAi = opts.awayAi || opp.ai;
    state.awayAiStyle = awayAi;
    state.homeLabel = opts.homeName || "Дом (" + homeStyle + ")";
    state.awayLabel = opts.awayName || opp.name;
    state.you = buildSquad("A", null, homeMult, skillSpread);
    // стиль = только поведение ИИ, без скрытых баффов скиллов
    state.them = buildSquad("B", opts.awayNames || opp.names, awayMult, skillSpread);
    if (opts.homeName) state.you.NAP.name = String(opts.homeName).slice(0, 18);
    startMatch();
    toast("ИИ vs ИИ · " + state.homeLabel + " — " + state.awayLabel);
    pushLog("Просмотр: оба ИИ · дом=" + homeStyle + " · гости=" + awayAi, true);
    state.waiting = true;
    renderLeft();
    renderRight();
    scheduleWatch(runHomeAIWatch, 500);
  }

  window.pitchAutoPlayFullMatch = autoPlayFullMatch;
  window.pitchEvaluateFootballQuality = evaluateFootballQuality;
  window.pitchStartWatchMatch = startWatchMatch;
  window.pitchStopWatchMatch = stopWatchMatch;

  // В Node-прогоне UI не поднимаем — только логика матча
  if (!globalThis.__PITCH_NODE_AUTOPLAY__) {
    render();
    const autoParam = /(?:\?|&)autoplay=([^&]*)/.exec(location.search || "");
    const watchParam =
      /(?:\?|&)watch=([^&]*)/.exec(location.search || "") ||
      /[#&?]watch=([^&]*)/.exec(location.hash || "");
    const homeParam = /(?:\?|&)home=([^&]*)/.exec(location.search || "");
    const delayParam = /(?:\?|&)delay=([^&]*)/.exec(location.search || "");
    if (watchParam) {
      const id = decodeURIComponent(watchParam[1] || "rivals") || "rivals";
      const homeStyle = homeParam ? decodeURIComponent(homeParam[1] || "direct") : "direct";
      const delay = delayParam ? Number(decodeURIComponent(delayParam[1])) : 380;
      if (id === "random") setTimeout(() => startRandomWatchMatch({ delay }), 80);
      else setTimeout(() => startWatchMatch({ awayId: id, homeStyle, delay }), 80);
    } else if (autoParam) {
      const id = decodeURIComponent(autoParam[1] || "academy") || "academy";
      try {
        const result = autoPlayFullMatch(id);
        const pre = document.createElement("pre");
        pre.id = "autoplay-result";
        pre.style.cssText =
          "position:fixed;inset:8px;overflow:auto;background:#0b100e;color:#e8f2ea;z-index:99;padding:12px;font:12px/1.4 monospace";
        pre.textContent = JSON.stringify(result, null, 2);
        document.body.appendChild(pre);
        window.__autoplayResult = result;
      } catch (err) {
        const pre = document.createElement("pre");
        pre.id = "autoplay-result";
        pre.textContent = "ERROR: " + (err && err.stack ? err.stack : err);
        document.body.appendChild(pre);
      }
    }
  }
})();
