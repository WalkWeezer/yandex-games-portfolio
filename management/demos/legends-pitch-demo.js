/**
 * Legends of the Pitch — feel demo (FROM SCRATCH)
 * 6v6 · 3×5 full grid · shop merge · match with flying ball
 * FEEL_DEMOS["legends-of-the-pitch"]
 */
(function (global) {
  "use strict";

  const W = 540;
  const H = 960;
  const COLS = 3;
  const ROWS = 5;
  const MAX_FIELD = 6;
  const BENCH_SLOTS = 7;
  const SHOP_SLOTS = 3;
  const ROUNDS = 9;
  const MATCH_MINUTES = 90;
  const MIN_PER_ROUND = MATCH_MINUTES / ROUNDS; // 10'
  /** Wall-clock seconds per round at ×1 (~22s of play per 10') */
  const ROUND_WALL_SEC = 22;
  const COPIES_PER_NAME = 3;
  const MERGE_NEED = 3;

  const TACTICS = [
    { id: "press", name: "Пресс", color: "#e85d4c", short: "PRS" },
    { id: "tiki", name: "Тики", color: "#3cb8a0", short: "TKI" },
    { id: "bus", name: "Автобус", color: "#4a7fd4", short: "BUS" },
    { id: "counter", name: "Контра", color: "#e8a838", short: "CTR" },
    { id: "wing", name: "Бровки", color: "#c4a35a", short: "WNG" },
  ];

  const AMPLUAS = [
    { id: "stop", name: "Сейвер", role: "GK", w: { save: 3.2, tackle: 0.4, pass: 1.0, shoot: 0.1, cross: 0.2, control: 0.8 } },
    { id: "bwm", name: "Отборщик", role: "DEF", w: { save: 0.1, tackle: 2.6, pass: 1.2, shoot: 0.3, cross: 0.4, control: 1.0 } },
    { id: "play", name: "Плеймейкер", role: "MID", w: { save: 0, tackle: 0.8, pass: 2.8, shoot: 0.8, cross: 1.2, control: 1.4 } },
    { id: "wingr", name: "Вингер", role: "WING", w: { save: 0, tackle: 0.6, pass: 1.4, shoot: 1.2, cross: 2.6, control: 1.2 } },
    { id: "poach", name: "Браконьер", role: "FWD", w: { save: 0, tackle: 0.5, pass: 0.9, shoot: 2.8, cross: 0.5, control: 1.1 } },
    { id: "box", name: "Бокс-мид", role: "MID", w: { save: 0, tackle: 1.6, pass: 1.8, shoot: 0.6, cross: 0.6, control: 1.3 } },
  ];

  const ROLE_BADGE = {
    GK: { short: "ВР", full: "Вратарь", color: "#d4a017" },
    DEF: { short: "ЗЩ", full: "Защита", color: "#3d7ec9" },
    MID: { short: "ПЗ", full: "Центр", color: "#2f9e6a" },
    WING: { short: "КР", full: "Край", color: "#c47a2a" },
    FWD: { short: "НП", full: "Напад", color: "#c44a3a" },
  };

  /** 5 opponent lineup presets — cells anywhere on 3×5 */
  const OPP_PRESETS = [
    [
      [1, 0],
      [0, 1],
      [2, 1],
      [1, 2],
      [0, 3],
      [2, 3],
    ],
    [
      [0, 0],
      [2, 0],
      [1, 1],
      [0, 2],
      [2, 2],
      [1, 4],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 2],
      [2, 2],
      [0, 4],
      [2, 4],
    ],
    [
      [0, 0],
      [1, 0],
      [2, 0],
      [1, 2],
      [0, 3],
      [2, 4],
    ],
    [
      [2, 0],
      [0, 1],
      [1, 2],
      [2, 3],
      [0, 3],
      [1, 4],
    ],
  ];

  const NAMES = [
    "Риф", "Нова", "Кедр", "Лис", "Игл", "Форж", "Скат", "Волт",
    "Мира", "Дюна", "Клин", "Арк", "Зефир", "Бард", "Оникс", "Тайд",
    "Спарк", "Роук",
  ];

  /** 18 unique cards: amp + tactic + stats · ≥4 tactics */
  const CARD_DEFS = (function buildDefs() {
    const tacticCycle = ["press", "tiki", "bus", "counter", "wing", "press", "tiki", "bus", "counter", "wing", "press", "tiki", "bus", "counter", "wing", "press", "tiki", "counter"];
    const ampCycle = ["stop", "bwm", "bwm", "play", "play", "box", "wingr", "wingr", "poach", "poach", "stop", "bwm", "play", "wingr", "poach", "box", "bwm", "play"];
    const costs = [1, 1, 2, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 3, 4, 2, 3, 4];
    return NAMES.map((name, i) => {
      const amp = AMPLUAS.find((a) => a.id === ampCycle[i]);
      const tac = TACTICS.find((t) => t.id === tacticCycle[i]);
      const starBias = costs[i];
      return {
        defId: "c" + i,
        name,
        ampId: amp.id,
        ampName: amp.name,
        role: amp.role,
        tacticId: tac.id,
        tacticName: tac.name,
        tacticColor: tac.color,
        pac: 4 + ((i * 3) % 5),
        sht: amp.role === "FWD" ? 7 + (i % 3) : 3 + (i % 4),
        pas: amp.role === "MID" || amp.role === "WING" ? 6 + (i % 3) : 3 + (i % 4),
        def: amp.role === "DEF" || amp.role === "GK" ? 7 + (i % 3) : 3 + (i % 4),
        cost: costs[i],
        weights: amp.w,
      };
    });
  })();

  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }
  function formatMatchClock(min) {
    const clamped = clamp(min, 0, MATCH_MINUTES);
    const m = Math.floor(clamped);
    const sec = Math.floor((clamped - m) * 60);
    return m + "'" + (sec < 10 ? "0" : "") + sec;
  }
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  function smoothstep(t) {
    t = clamp(t, 0, 1);
    return t * t * (3 - 2 * t);
  }
  function rand(a, b) {
    return a + Math.random() * (b - a);
  }
  function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }
  function uid() {
    return "u" + Math.random().toString(36).slice(2, 9);
  }

  function tacticById(id) {
    return TACTICS.find((t) => t.id === id);
  }

  function makeUnit(def, team, star) {
    return {
      id: uid(),
      defId: def.defId,
      name: def.name,
      ampId: def.ampId,
      ampName: def.ampName,
      role: def.role,
      tacticId: def.tacticId,
      tacticName: def.tacticName,
      tacticColor: def.tacticColor,
      pac: def.pac + (star - 1),
      sht: def.sht + (star - 1),
      pas: def.pas + (star - 1),
      def: def.def + (star - 1),
      cost: def.cost,
      weights: def.weights,
      star: star || 1,
      team,
      col: -1,
      row: -1,
      ox: 0,
      oy: 0,
      breath: Math.random() * Math.PI * 2,
      lunge: 0,
      lungeAng: 0,
      sel: false,
    };
  }

  function buildBag() {
    const bag = [];
    for (const def of CARD_DEFS) {
      for (let i = 0; i < COPIES_PER_NAME; i++) bag.push(def.defId);
    }
    // shuffle
    for (let i = bag.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      const t = bag[i];
      bag[i] = bag[j];
      bag[j] = t;
    }
    return bag;
  }

  function countOwned(s, defId, star) {
    let n = 0;
    const all = [...s.bench, ...s.field, ...s.oppField].filter(Boolean);
    for (const u of all) {
      if (u.team !== "you") continue;
      if (u.defId === defId && u.star === star) n++;
    }
    return n;
  }

  function removeOwned(s, defId, star, n) {
    let left = n;
    function from(arr) {
      for (let i = arr.length - 1; i >= 0 && left > 0; i--) {
        const u = arr[i];
        if (u && u.team === "you" && u.defId === defId && u.star === star) {
          arr.splice(i, 1);
          left--;
        }
      }
    }
    from(s.bench);
    from(s.field);
  }

  function tryMerge(s, defId, star) {
    if (star >= 3) return false;
    if (countOwned(s, defId, star) < MERGE_NEED) return false;
    removeOwned(s, defId, star, MERGE_NEED);
    const def = CARD_DEFS.find((d) => d.defId === defId);
    const merged = makeUnit(def, "you", star + 1);
    if (s.bench.length < BENCH_SLOTS) s.bench.push(merged);
    else s.field.push(merged);
    s.flash = `Merge ${def.name} → ★${star + 1}`;
    s.flashT = 1.2;
    return true;
  }

  function rollShop(s) {
    const shop = [];
    for (let i = 0; i < SHOP_SLOTS; i++) {
      if (!s.bag.length) s.bag = buildBag();
      const defId = s.bag.pop();
      const def = CARD_DEFS.find((d) => d.defId === defId);
      shop.push({ defId, def, cost: def.cost, sold: false });
    }
    s.shop = shop;
  }

  function returnShopToBag(s) {
    for (const slot of s.shop) {
      if (!slot.sold) s.bag.push(slot.defId);
    }
    s.shop = [];
  }

  function tacticCounts(units) {
    const m = Object.create(null);
    for (const u of units) {
      if (!u) continue;
      m[u.tacticId] = (m[u.tacticId] || 0) + 1;
    }
    return m;
  }

  function activeTactics(units) {
    const c = tacticCounts(units);
    const out = [];
    for (const t of TACTICS) {
      const n = c[t.id] || 0;
      if (n >= 2) out.push({ id: t.id, name: t.name, color: t.color, n: n >= 4 ? 4 : n >= 3 ? 3 : 2 });
    }
    return out;
  }

  function tacLevel(units, id) {
    const n = tacticCounts(units)[id] || 0;
    if (n >= 4) return 4;
    if (n >= 3) return 3;
    if (n >= 2) return 2;
    return 0;
  }

  /** Layout helpers — full 3×5 for both teams */
  function pitchRect(api) {
    const top = 88;
    const bottom = 118;
    const left = 18;
    const right = 18;
    return {
      x: left,
      y: top,
      w: api.w - left - right,
      h: api.h - top - bottom,
    };
  }

  function cellSize(pr) {
    return { cw: pr.w / COLS, ch: pr.h / ROWS };
  }

  function cellCenter(pr, col, row) {
    const { cw, ch } = cellSize(pr);
    return { x: pr.x + (col + 0.5) * cw, y: pr.y + (row + 0.5) * ch };
  }

  function cellAt(pr, x, y) {
    const { cw, ch } = cellSize(pr);
    const col = Math.floor((x - pr.x) / cw);
    const row = Math.floor((y - pr.y) / ch);
    if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return null;
    return { col, row };
  }

  /** Offsets so multiple units in one cell don't stack on one pixel */
  function applyCellOffsets(units) {
    const groups = Object.create(null);
    for (const u of units) {
      if (u.col < 0) continue;
      const k = u.col + "," + u.row;
      (groups[k] || (groups[k] = [])).push(u);
    }
    for (const k of Object.keys(groups)) {
      const g = groups[k];
      const n = g.length;
      for (let i = 0; i < n; i++) {
        const ang = (i / n) * Math.PI * 2 - Math.PI / 2;
        const r = n === 1 ? 0 : 14 + Math.min(8, n * 2);
        g[i].ox = Math.cos(ang) * r;
        g[i].oy = Math.sin(ang) * r * 0.85;
      }
    }
  }

  function unitPos(pr, u) {
    const c = cellCenter(pr, u.col, u.row);
    const lx = Math.cos(u.lungeAng || 0) * (u.lunge || 0);
    const ly = Math.sin(u.lungeAng || 0) * (u.lunge || 0);
    return { x: c.x + u.ox + lx, y: c.y + u.oy + ly };
  }

  function neighbors(col, row) {
    const out = [];
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (!dc && !dr) continue;
        const c = col + dc;
        const r = row + dr;
        if (c >= 0 && c < COLS && r >= 0 && r < ROWS) out.push({ col: c, row: r });
      }
    }
    return out;
  }

  function sameOrNear(a, b) {
    return Math.abs(a.col - b.col) <= 1 && Math.abs(a.row - b.row) <= 1;
  }

  function forwardRowDelta(team) {
    // you attack toward row 0; opp toward row ROWS-1
    return team === "you" ? -1 : 1;
  }

  function goalRow(team) {
    return team === "you" ? 0 : ROWS - 1;
  }

  function enemyGoalRow(team) {
    return team === "you" ? 0 : ROWS - 1;
  }

  function distToGoal(u) {
    return Math.abs(u.row - enemyGoalRow(u.team));
  }

  function seedOpponent(s) {
    const preset = OPP_PRESETS[(Math.random() * OPP_PRESETS.length) | 0];
    s.oppPreset = OPP_PRESETS.indexOf(preset);
    const defs = CARD_DEFS.slice().sort(() => Math.random() - 0.5);
    s.oppField = [];
    for (let i = 0; i < MAX_FIELD; i++) {
      const def = defs[i % defs.length];
      const u = makeUnit(def, "opp", 1 + ((i % 3) === 0 ? 1 : 0));
      u.col = preset[i][0];
      u.row = preset[i][1];
      s.oppField.push(u);
    }
    applyCellOffsets([...s.field, ...s.oppField]);
  }

  function giveStarters(s) {
    // 6 starters spanning ≥4 tactics for lineup
    const picks = [0, 1, 2, 3, 4, 8];
    s.bench = [];
    for (const i of picks) {
      s.bench.push(makeUnit(CARD_DEFS[i], "you", 1));
      // remove one copy from bag
      const idx = s.bag.indexOf(CARD_DEFS[i].defId);
      if (idx >= 0) s.bag.splice(idx, 1);
    }
  }

  function pitchCenter(pr) {
    return { x: pr.x + pr.w / 2, y: pr.y + pr.h / 2 };
  }

  /** Possession change: fly ball to unit — never hard-snap across the pitch */
  function takeBall(s, unit, opts) {
    opts = opts || {};
    const pr = s._pr;
    const p = unitPos(pr, unit);
    const dist = Math.hypot(p.x - s.ball.x, p.y - s.ball.y);
    const finish = () => {
      s.ball.holderId = unit.id;
      s.ball.x = p.x;
      s.ball.y = p.y;
      s.ball.flight = null;
      if (opts.fx) pushFx(s, opts.fx, p.x, p.y);
      if (opts.beat) setBeat(s, opts.beat, opts.beatSec || 0.7);
      if (opts.onDone) opts.onDone();
    };
    s.ball.holderId = null;
    if (dist < 16) {
      finish();
      return;
    }
    const dur = opts.dur || clamp(dist / 420, 0.22, 0.55);
    beginFlight(s, null, p.x, p.y, opts.kind || "loose", finish, dur);
  }

  function startBall(s, pr) {
    const mid = pitchCenter(pr);
    const holders = s.field.length ? s.field : s.oppField;
    const u = holders.find((x) => x.role === "MID") || pick(holders);
    s.ball = {
      x: mid.x,
      y: mid.y,
      holderId: null,
      flight: null,
      lastFromId: null,
      lastToId: null,
      passPairBan: 0,
      passStreak: 0,
    };
    if (u) {
      // Kickoff: center → first holder (visible flight, no teleport)
      takeBall(s, u, { kind: "pass", dur: 0.5, beat: "Свисток", beatSec: 0.55 });
    }
  }

  function beginFlight(s, fromU, toX, toY, kind, onArrive, dur) {
    const pr = s._pr;
    const from = fromU ? unitPos(pr, fromU) : { x: s.ball.x, y: s.ball.y };
    const duration = dur || (kind === "shot" ? 0.55 : kind === "cross" ? 0.7 : 0.45);
    s.ball.flight = {
      x0: from.x,
      y0: from.y,
      x1: toX,
      y1: toY,
      t: 0,
      dur: duration,
      arc: kind === "cross" ? 42 : kind === "shot" ? 28 : 18,
      kind,
      onArrive,
    };
    s.ball.holderId = null;
    if (fromU) {
      fromU.lunge = 10;
      fromU.lungeAng = Math.atan2(toY - from.y, toX - from.x);
    }
    s.stats.flights = (s.stats.flights || 0) + 1;
    s.stats.byKind = s.stats.byKind || Object.create(null);
    s.stats.byKind[kind] = (s.stats.byKind[kind] || 0) + 1;
  }

  function setBeat(s, label, sec) {
    s.beat = sec;
    s.beatLabel = label;
    s.fx.push({ kind: "banner", text: label, t: sec, life: sec });
  }

  function pushFx(s, kind, x, y, extra) {
    s.fx.push(Object.assign({ kind, x, y, t: 0.55, life: 0.55 }, extra || {}));
  }

  function teamUnits(s, team) {
    return team === "you" ? s.field : s.oppField;
  }

  function findUnit(s, id) {
    return s.field.concat(s.oppField).find((u) => u.id === id) || null;
  }

  function holder(s) {
    return s.ball.holderId ? findUnit(s, s.ball.holderId) : null;
  }

  function decideAction(s) {
    const h = holder(s);
    if (!h) return;
    const mine = teamUnits(s, h.team);
    const foes = teamUnits(s, h.team === "you" ? "opp" : "you");
    const myTac = activeTactics(h.team === "you" ? s.field : s.oppField);
    const tacMap = Object.create(null);
    for (const t of myTac) tacMap[t.id] = t.n;

    const press = tacMap.press || 0;
    const tiki = tacMap.tiki || 0;
    const bus = tacMap.bus || 0;
    const counter = tacMap.counter || 0;
    const wing = tacMap.wing || 0;

    const nearFoe = foes.find((f) => sameOrNear(h, f));
    if (nearFoe && Math.random() < 0.2 + press * 0.07 + nearFoe.weights.tackle * 0.05) {
      doTackle(s, nearFoe, h);
      return;
    }

    const w = Object.assign({}, h.weights);
    if (tiki) w.pass *= 1 + tiki * 0.35;
    if (wing) w.cross *= 1 + wing * 0.4;
    if (press) w.tackle *= 1 + press * 0.25;
    if (bus) w.control *= 1 + bus * 0.3;
    if (counter && distToGoal(h) <= 2) w.shoot *= 1 + counter * 0.45;
    if (bus && distToGoal(h) >= 3) w.shoot *= 0.55;
    if (distToGoal(h) <= 1) w.shoot *= 2.4;
    if (distToGoal(h) <= 2) w.shoot *= 1.5;

    const mates = mine.filter((u) => u.id !== h.id);
    let passTargets = mates.filter((u) => sameOrNear(h, u));
    if (!passTargets.length) passTargets = mates.filter((u) => Math.abs(u.col - h.col) <= 2 && Math.abs(u.row - h.row) <= 2);

    const fd = forwardRowDelta(h.team);
    const forwardTargets = passTargets.filter((u) => (u.row - h.row) * fd >= 0);
    let candidates = forwardTargets.length ? forwardTargets : passTargets;
    if (s.ball.lastFromId && s.ball.passPairBan > 0) {
      candidates = candidates.filter((u) => u.id !== s.ball.lastFromId);
    }

    // Prefer forward pass pressure; still allow lateral short passes often
    if (candidates.length && (s.ball.passStreak || 0) < 2) {
      w.pass *= 1.5 + tiki * 0.1;
    }
    const onlyBack = passTargets.length && !forwardTargets.length;
    if (onlyBack || (s.ball.passStreak || 0) >= 3) {
      w.pass *= 0.12;
      w.shoot *= 2.2;
      w.cross *= 1.5;
    }

    const actions = [];
    if (candidates.length) actions.push({ k: "pass", p: w.pass });
    if (candidates.length && (wing || h.role === "WING" || Math.random() < 0.35)) actions.push({ k: "cross", p: w.cross });
    actions.push({ k: "shoot", p: w.shoot * (distToGoal(h) <= 2 ? 1 : 0.22) });
    actions.push({ k: "control", p: w.control });

    let sum = 0;
    for (const a of actions) sum += Math.max(0.01, a.p);
    let r = Math.random() * sum;
    let choice = "control";
    for (const a of actions) {
      r -= Math.max(0.01, a.p);
      if (r <= 0) {
        choice = a.k;
        break;
      }
    }

    if (choice === "pass" || choice === "cross") {
      const tgt = pick(candidates.length ? candidates : passTargets);
      if (tgt) doPass(s, h, tgt, choice === "cross" ? "cross" : "pass");
      else doControl(s, h);
    } else if (choice === "shoot") {
      doShot(s, h);
    } else {
      doControl(s, h);
    }
  }

  function doPass(s, from, to, kind) {
    if (!to) return;
    const pr = s._pr;
    const tp = unitPos(pr, to);

    // ping-pong tracking
    if (s.ball.lastToId === from.id && s.ball.lastFromId === to.id) {
      s.stats.pingPong = (s.stats.pingPong || 0) + 1;
    }
    s.stats.passes = (s.stats.passes || 0) + 1;
    s.stats.passEdges = s.stats.passEdges || [];
    s.stats.passEdges.push([from.id, to.id]);

    const prevFrom = s.ball.lastFromId;
    s.ball.lastFromId = from.id;
    s.ball.lastToId = to.id;
    if (prevFrom === to.id) s.ball.passPairBan = 2;
    s.ball.passStreak = (s.ball.passStreak || 0) + 1;

    const label = kind === "cross" ? "Навес" : "Пас";
    pushFx(s, kind === "cross" ? "cross" : "pass", tp.x, tp.y);
    beginFlight(s, from, tp.x, tp.y, kind, () => {
      // intercept chance mid-arrival resolved at land
      const foes = teamUnits(s, from.team === "you" ? "opp" : "you");
      const interceptor = foes.find((f) => sameOrNear(f, to) && Math.random() < 0.18 + tacLevel(foes, "press") * 0.05 + f.weights.tackle * 0.04);
      if (interceptor) {
        s.ball.passStreak = 0;
        s.stats.intercepts = (s.stats.intercepts || 0) + 1;
        takeBall(s, interceptor, { kind: "loose", fx: "intercept", beat: "Перехват", beatSec: 0.75 });
      } else {
        takeBall(s, to, { kind: "loose", beat: label, beatSec: 0.45 });
      }
      if (s.ball.passPairBan > 0) s.ball.passPairBan--;
    });
  }

  function doShot(s, from) {
    const pr = s._pr;
    const gy = from.team === "you" ? pr.y + 8 : pr.y + pr.h - 8;
    const gx = pr.x + pr.w * (0.35 + Math.random() * 0.3);
    s.ball.passStreak = 0;
    s.stats.shots = (s.stats.shots || 0) + 1;
    pushFx(s, "shot", gx, gy);
    from.lunge = 12;
    from.lungeAng = Math.atan2(gy - unitPos(pr, from).y, gx - unitPos(pr, from).x);
    beginFlight(s, from, gx, gy, "shot", () => {
      const foes = teamUnits(s, from.team === "you" ? "opp" : "you");
      const gk =
        foes.find((f) => f.role === "GK" && Math.abs(f.row - (from.team === "you" ? ROWS - 1 : 0)) <= 1) ||
        foes.find((f) => f.role === "GK") ||
        foes.find((f) => f.row === (from.team === "you" ? ROWS - 1 : 0));
      const saveChance = gk
        ? clamp(0.28 + gk.def * 0.035 + gk.weights.save * 0.08 + tacLevel(foes, "bus") * 0.06 - from.sht * 0.03, 0.18, 0.72)
        : 0.22;
      if (Math.random() < saveChance && gk) {
        s.stats.saves = (s.stats.saves || 0) + 1;
        gk.lunge = 12;
        gk.lungeAng = Math.atan2(gy - unitPos(pr, gk).y, gx - unitPos(pr, gk).x);
        // Ball stays at shot end, then flies into GK hands — no snap
        takeBall(s, gk, { kind: "save", fx: "save", beat: "Сейв", beatSec: 0.95, dur: 0.35 });
      } else {
        if (from.team === "you") s.scoreYou++;
        else s.scoreOpp++;
        s.stats.goals = (s.stats.goals || 0) + 1;
        s._lastGoalTeam = from.team;
        s._koTeam = from.team;
        pushFx(s, "goal", gx, gy);
        setBeat(s, "ГОЛ ⚽", 1.4);
        s.pendingKickoff = 0.25;
        s.ball.holderId = null;
      }
    }, 0.58);
  }

  function doTackle(s, tackler, victim) {
    const pr = s._pr;
    const p = unitPos(pr, victim);
    tackler.lunge = 14;
    tackler.lungeAng = Math.atan2(p.y - unitPos(pr, tackler).y, p.x - unitPos(pr, tackler).x);
    const chance = clamp(0.35 + tackler.def * 0.03 + tackler.weights.tackle * 0.08 + tacLevel(teamUnits(s, tackler.team), "press") * 0.05 - victim.pac * 0.02, 0.2, 0.8);
    s.stats.tackles = (s.stats.tackles || 0) + 1;
    if (Math.random() < chance) {
      s.ball.passStreak = 0;
      s.ball.lastFromId = null;
      // Ball is already at victim feet — fly/attach to tackler, no hard teleport
      takeBall(s, tackler, { kind: "loose", fx: "tackle", beat: "Отбор", beatSec: 0.75, dur: 0.28 });
    } else {
      pushFx(s, "tackle", p.x, p.y, { miss: true });
      setBeat(s, "Фол-мимо", 0.4);
    }
  }

  function doControl(s, h) {
    // nudge toward enemy goal if empty-ish cell
    const fd = forwardRowDelta(h.team);
    const nc = clamp(h.col + ((Math.random() * 3) | 0) - 1, 0, COLS - 1);
    const nr = clamp(h.row + fd, 0, ROWS - 1);
    if (nr !== h.row || nc !== h.col) {
      h.col = nc;
      h.row = nr;
      applyCellOffsets([...s.field, ...s.oppField]);
    }
    h.lunge = 6;
    h.lungeAng = fd < 0 ? -Math.PI / 2 : Math.PI / 2;
    s.thinkT = 0.35;
  }

  function kickoffAfterGoal(s) {
    const pr = s._pr;
    s._koTeam = s._lastGoalTeam === "you" ? "opp" : "you";
    const pool = teamUnits(s, s._koTeam);
    const u = pool.find((x) => x.role === "MID") || pick(pool);
    s.ball.holderId = null;
    s.pendingKickoff = 0;
    s.ball.passStreak = 0;
    if (!u) return;
    const mid = pitchCenter(pr);
    // Goal mouth → center → holder (two legs, always flying)
    beginFlight(s, null, mid.x, mid.y, "pass", () => {
      takeBall(s, u, { kind: "pass", dur: 0.4, beat: "Розыгрыш", beatSec: 0.5 });
    }, 0.45);
  }

  function updateFight(s, api, dt) {
    const pr = s._pr;
    const speed = s.speed;

    // breath / lunge decay
    for (const u of s.field.concat(s.oppField)) {
      u.breath += dt * 2.2;
      if (u.lunge > 0) u.lunge = Math.max(0, u.lunge - dt * 28);
    }

    // fx
    for (const f of s.fx) f.t -= dt * speed;
    s.fx = s.fx.filter((f) => f.t > 0);
    if (s.flashT > 0) s.flashT -= dt;

    if (s.beat > 0) {
      s.beat -= dt * speed;
      // Keep ball on holder only when grounded — never snap during / after episode flights
      if (!s.ball.flight && s.ball.holderId) syncBallToHolder(s, pr);
      updateFlight(s, api, dt * speed);
      if (s.beat <= 0 && s.pendingKickoff) {
        kickoffAfterGoal(s);
      }
      s.thinkT = 0.25;
      return;
    }

    updateFlight(s, api, dt * speed);
    if (s.ball.flight) return;

    if (s.ball.holderId) syncBallToHolder(s, pr);

    if (s.pendingKickoff) {
      s.pendingKickoff -= dt * speed;
      if (s.pendingKickoff <= 0) kickoffAfterGoal(s);
      return;
    }

    s.clock += dt * speed * (MIN_PER_ROUND / ROUND_WALL_SEC);
    s.thinkT -= dt * speed;
    if (s.thinkT <= 0) {
      s.thinkT = rand(0.45, 0.85);
      decideAction(s);
    }

    // End round when football clock hits this round's slice (10', 20', … 90')
    if (s.clock >= s.round * MIN_PER_ROUND - 0.0001) {
      s.clock = Math.min(MATCH_MINUTES, s.round * MIN_PER_ROUND);
      endRound(s, api);
    }
  }

  function syncBallToHolder(s, pr) {
    const h = holder(s);
    if (h) {
      const p = unitPos(pr, h);
      s.ball.x = p.x;
      s.ball.y = p.y;
    }
  }

  function updateFlight(s, api, dt) {
    const fl = s.ball.flight;
    if (!fl) return;
    fl.t += dt;
    const u = smoothstep(fl.t / fl.dur);
    s.ball.x = lerp(fl.x0, fl.x1, u);
    s.ball.y = lerp(fl.y0, fl.y1, u) - Math.sin(u * Math.PI) * fl.arc;
    if (fl.t >= fl.dur) {
      const cb = fl.onArrive;
      s.ball.flight = null;
      s.ball.x = fl.x1;
      s.ball.y = fl.y1;
      if (cb) cb();
      // track goal team
      if (s.beatLabel === "ГОЛ ⚽") {
        // score already updated; set kickoff side
        if (typeof s._goalFlag === "undefined") s._goalFlag = true;
      }
    }
  }

  function endRound(s, api) {
    if (s.round >= ROUNDS) {
      s.phase = "result";
      s.clock = MATCH_MINUTES;
      s.btnFight.label = "Заново";
      s.flash = "Финал " + formatMatchClock(s.clock);
      s.flashT = 1.6;
      s.oppField = [];
      s.ball.holderId = null;
      s.ball.flight = null;
      return;
    }
    // Между раундами — закупка
    s.phase = "shop";
    s.round += 1;
    s.gold += 3 + s.round;
    returnShopToBag(s);
    rollShop(s);
    s.flash = `Закупка · раунд ${s.round}/${ROUNDS} · ${formatMatchClock(s.clock)}`;
    s.flashT = 1.5;
    s.oppField = [];
    s.ball.holderId = null;
    s.ball.flight = null;
  }

  function startFight(s, api) {
    if (s.field.length < 1) {
      s.flash = "Поставь хотя бы 1 игрока";
      s.flashT = 1.2;
      return;
    }
    while (s.field.length > MAX_FIELD) {
      s.bench.push(s.field.pop());
    }
    // Reveal opponent only now — 1 of 5 presets
    seedOpponent(s);
    applyCellOffsets([...s.field, ...s.oppField]);
    s.phase = "fight";
    s.thinkT = 1.1;
    s.beat = 0;
    s.beatLabel = "";
    s.pendingKickoff = 0;
    // engage from placed cells — slight lunge toward center, no teleport
    const pr = s._pr;
    const mid = pitchCenter(pr);
    for (const u of s.field.concat(s.oppField)) {
      const p = unitPos(pr, u);
      u.lunge = 8;
      u.lungeAng = Math.atan2(mid.y - p.y, mid.x - p.x);
    }
    startBall(s, pr);
    s._koTeam = "opp";
    const from = formatMatchClock((s.round - 1) * MIN_PER_ROUND);
    const to = formatMatchClock(s.round * MIN_PER_ROUND);
    s.flash = `Раунд ${s.round}/${ROUNDS} · ${from}–${to}`;
    s.flashT = 1.2;
  }

  function placeSelected(s, col, row) {
    const u = s.selected;
    if (!u) return;
    // if from bench and field full and unit not already on field — bounce
    const onField = s.field.includes(u);
    if (!onField && s.field.length >= MAX_FIELD) {
      s.flash = "На поле макс 6";
      s.flashT = 1;
      return;
    }
    if (!onField) {
      const bi = s.bench.indexOf(u);
      if (bi >= 0) s.bench.splice(bi, 1);
      s.field.push(u);
    }
    u.col = col;
    u.row = row;
    applyCellOffsets([...s.field, ...s.oppField]);
    s.flash = `${u.name} → (${col},${row})`;
    s.flashT = 0.7;
    s.stats.placements = s.stats.placements || [];
    s.stats.placements.push({ col, row, name: u.name });
  }

  function selectUnit(s, u) {
    for (const x of s.bench.concat(s.field)) if (x) x.sel = false;
    if (u) u.sel = true;
    s.selected = u || null;
  }

  function buyShop(s, idx) {
    const slot = s.shop[idx];
    if (!slot || slot.sold) return;
    if (s.gold < slot.cost) {
      s.flash = "Мало монет";
      s.flashT = 0.8;
      return;
    }
    if (s.bench.length + s.field.length >= BENCH_SLOTS + MAX_FIELD) {
      s.flash = "Нет места";
      s.flashT = 0.8;
      return;
    }
    s.gold -= slot.cost;
    slot.sold = true;
    const u = makeUnit(slot.def, "you", 1);
    if (s.bench.length < BENCH_SLOTS) s.bench.push(u);
    else s.field.push(u);
    // merge chain
    let star = 1;
    while (tryMerge(s, slot.defId, star) && star < 3) star++;
    s.flash = `Купил ${slot.def.name}`;
    s.flashT = 0.9;
  }

  function createState(api) {
    const speedBtn = api.input.addButton({
      x: api.w - 96,
      y: 12,
      w: 80,
      h: 36,
      label: "×1",
      color: "#2a6b4a",
    });
    const btnFight = api.input.addButton({
      x: api.w / 2 - 70,
      y: api.h - 52,
      w: 140,
      h: 40,
      label: "В матч",
      color: "#c45c26",
    });
    const btnReroll = api.input.addButton({
      x: 16,
      y: api.h - 52,
      w: 100,
      h: 40,
      label: "Реролл 1",
      color: "#3a5a7a",
    });
    const btnReady = api.input.addButton({
      x: api.w - 116,
      y: api.h - 52,
      w: 100,
      h: 40,
      label: "Готово",
      color: "#2a7a5a",
    });

    const s = {
      phase: "lineup", // lineup | shop | fight | result
      round: 1,
      gold: 6,
      bag: buildBag(),
      shop: [],
      bench: [],
      field: [],
      oppField: [],
      selected: null,
      scoreYou: 0,
      scoreOpp: 0,
      clock: 0,
      speed: 1,
      speedBtn,
      btnFight,
      btnReroll,
      btnReady,
      ball: { x: 0, y: 0, holderId: null, flight: null, lastFromId: null, lastToId: null, passPairBan: 0, passStreak: 0 },
      beat: 0,
      beatLabel: "",
      thinkT: 0,
      fx: [],
      flash: "",
      flashT: 0,
      pendingKickoff: 0,
      _pr: pitchRect(api),
      _koTeam: "opp",
      stats: { flights: 0, passes: 0, shots: 0, tackles: 0, intercepts: 0, saves: 0, goals: 0, pingPong: 0, passEdges: [], placements: [], byKind: {} },
    };
    giveStarters(s);
    // Opponent hidden until fight — seeded from presets on kickoff
    rollShop(s);
    return s;
  }

  function hitBench(s, tap) {
    const y0 = H - 108;
    const chipW = 68;
    const gap = 6;
    const total = s.bench.length * (chipW + gap);
    let x0 = (W - total) / 2;
    for (let i = 0; i < s.bench.length; i++) {
      const x = x0 + i * (chipW + gap);
      if (tap.x >= x && tap.x <= x + chipW && tap.y >= y0 && tap.y <= y0 + 52) return s.bench[i];
    }
    return null;
  }

  function hitFieldUnit(s, tap) {
    const pr = s._pr;
    let best = null;
    let bestD = 28;
    for (const u of s.field) {
      const p = unitPos(pr, u);
      const d = Math.hypot(tap.x - p.x, tap.y - p.y);
      if (d < bestD) {
        bestD = d;
        best = u;
      }
    }
    return best;
  }

  function hitShop(s, tap) {
    if (s.phase !== "shop" && s.phase !== "lineup") return -1;
    const y = H - 175;
    const w = 150;
    const gap = 10;
    const total = SHOP_SLOTS * w + (SHOP_SLOTS - 1) * gap;
    let x0 = (W - total) / 2;
    for (let i = 0; i < SHOP_SLOTS; i++) {
      const x = x0 + i * (w + gap);
      if (tap.x >= x && tap.x <= x + w && tap.y >= y && tap.y <= y + 58) return i;
    }
    return -1;
  }

  const demo = {
    hint: "Состав → закупка → 9 раундов матча (0'–90') · магазин между раундами",

    create(api) {
      // force canvas logical size for hires if needed
      if (api.canvas && (api.canvas.width !== W || api.canvas.height !== H)) {
        // keep whatever dashboard set; use api.w/h
      }
      const s = createState(api);
      s._pr = pitchRect(api);
      api.setHud("Lineup: карта → любая клетка · обе команды на всей сетке");
      return s;
    },

    update(s, api, dt) {
      s._pr = pitchRect(api);

      if (s.speedBtn.clicked) {
        s.speed = s.speed === 1 ? 2 : 1;
        s.speedBtn.label = "×" + s.speed;
      }

      if (s.phase === "result") {
        if (s.btnFight.clicked || api.input.consumeTap()) {
          const fresh = createState(api);
          Object.keys(fresh).forEach((k) => (s[k] = fresh[k]));
          s._pr = pitchRect(api);
        }
        api.setHud(
          (s.scoreYou > s.scoreOpp ? "Победа" : s.scoreYou < s.scoreOpp ? "Поражение" : "Ничья") +
            ` ${s.scoreYou}:${s.scoreOpp} · тап = заново`
        );
        return;
      }

      if (s.phase === "fight") {
        s.btnFight.label = "…";
        updateFight(s, api, dt);
        // consume stray taps
        while (api.input.consumeTap()) {}
        const tacs = activeTactics(s.field)
          .map((t) => `${t.name}×${t.n}`)
          .join(" ");
        const clock = formatMatchClock(s.clock);
        api.setHud(
          `${s.scoreYou}:${s.scoreOpp} · ${clock} · раунд ${s.round}/${ROUNDS}` + (tacs ? " · " + tacs : "")
        );
        return;
      }

      // lineup / shop UI
      if (s.btnReroll.clicked && (s.phase === "shop" || s.phase === "lineup")) {
        if (s.gold >= 1) {
          s.gold -= 1;
          returnShopToBag(s);
          rollShop(s);
          s.flash = "Реролл";
          s.flashT = 0.7;
        }
      }
      if (s.btnReady.clicked && s.phase === "lineup") {
        s.phase = "shop";
        s.flash = `Закупка перед раундом ${s.round}`;
        s.flashT = 1;
      }
      if (s.btnFight.clicked) {
        if (s.phase === "lineup" || s.phase === "shop") startFight(s, api);
      }

      const tap = api.input.consumeTap();
      if (tap) {
        const si = hitShop(s, tap);
        if (si >= 0 && (s.phase === "shop" || s.phase === "lineup")) {
          buyShop(s, si);
        } else {
          const bu = hitBench(s, tap);
          const fu = hitFieldUnit(s, tap);
          if (bu) {
            selectUnit(s, bu);
          } else if (fu) {
            selectUnit(s, fu);
          } else if (s.selected) {
            const cell = cellAt(s._pr, tap.x, tap.y);
            if (cell) {
              // ANY cell on 3×5 — no half restriction
              placeSelected(s, cell.col, cell.row);
            } else {
              selectUnit(s, null);
            }
          }
        }
      }

      if (s.flashT > 0) s.flashT -= dt;

      const placed = s.field.length;
      const tacs = activeTactics(s.field)
        .map((t) => `${t.name}×${t.n}`)
        .join(" ");
      api.setHud(
        `${s.phase === "lineup" ? "Состав" : "Закупка"} · 💰${s.gold} · поле ${placed}/${MAX_FIELD} · раунд ${s.round}/${ROUNDS} · ${formatMatchClock(s.clock)}` +
          (tacs ? " · " + tacs : "") +
          (s.selected ? ` · ${s.selected.name}` : "")
      );
    },

    draw(s, api) {
      const { ctx, w, h } = api;
      const pr = s._pr;

      // bg atmosphere
      const g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, "#0c1a14");
      g.addColorStop(0.5, "#143022");
      g.addColorStop(1, "#0a1410");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      drawPitch(ctx, pr);

      // units — opponent only visible during fight
      applyCellOffsets(s.phase === "fight" ? [...s.field, ...s.oppField] : s.field.slice());
      if (s.phase === "fight") {
        for (const u of s.oppField) drawUnit(ctx, pr, u, s);
      }
      for (const u of s.field) drawUnit(ctx, pr, u, s);

      // ball
      if (s.phase === "fight") {
        drawBall(ctx, s);
      }

      // fx
      for (const f of s.fx) drawFx(ctx, f);

      // HUD score + football clock
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      roundRect(ctx, w / 2 - 110, 8, 220, 42, 8);
      ctx.fill();
      ctx.fillStyle = "#f0f4f0";
      ctx.font = "bold 20px Trebuchet MS, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${s.scoreYou} : ${s.scoreOpp}`, w / 2 - 48, 22);
      ctx.fillStyle = "#ffe08a";
      ctx.font = "bold 16px Trebuchet MS, sans-serif";
      ctx.fillText(formatMatchClock(s.clock), w / 2 + 52, 22);
      ctx.fillStyle = "rgba(220,230,220,0.75)";
      ctx.font = "11px Trebuchet MS, sans-serif";
      ctx.fillText(`R${s.round}/${ROUNDS}`, w / 2 + 52, 38);

      // tactics chips top-left
      const tacs = activeTactics(s.field);
      let tx = 12;
      for (const t of tacs) {
        ctx.fillStyle = t.color;
        roundRect(ctx, tx, 52, 54, 18, 4);
        ctx.fill();
        ctx.fillStyle = "#111";
        ctx.font = "bold 11px Trebuchet MS, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${t.short || t.name.slice(0, 3)}×${t.n}`, tx + 27, 61);
        tx += 58;
      }

      if (s.phase !== "fight" && s.phase !== "result") {
        drawShop(ctx, s);
        drawBench(ctx, s);
        // hint
        ctx.fillStyle = "rgba(240,244,240,0.75)";
        ctx.font = "12px Trebuchet MS, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          s.selected ? "Тап по любой клетке 3×5" : "Выбери карту на скамейке / поле",
          w / 2,
          pr.y - 8
        );
      }

      if (s.phase === "fight" && s.beat > 0 && s.beatLabel) {
        ctx.fillStyle = "rgba(0,0,0,0.35)";
        roundRect(ctx, w / 2 - 80, 70, 160, 32, 8);
        ctx.fill();
        ctx.fillStyle = "#ffe08a";
        ctx.font = "bold 16px Trebuchet MS, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(s.beatLabel, w / 2, 86);
      }

      if (s.flashT > 0 && s.flash) {
        ctx.globalAlpha = Math.min(1, s.flashT * 2);
        ctx.fillStyle = "#e8f0e8";
        ctx.font = "13px Trebuchet MS, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(s.flash, w / 2, h - 64);
        ctx.globalAlpha = 1;
      }

      if (s.phase === "result") {
        ctx.fillStyle = "rgba(0,0,0,0.62)";
        ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = "#f2f7f2";
        ctx.font = "bold 28px Trebuchet MS, sans-serif";
        ctx.textAlign = "center";
        const title = s.scoreYou > s.scoreOpp ? "ПОБЕДА" : s.scoreYou < s.scoreOpp ? "ПОРАЖЕНИЕ" : "НИЧЬЯ";
        ctx.fillText(title, w / 2, h / 2 - 20);
        ctx.font = "20px Trebuchet MS, sans-serif";
        ctx.fillText(`${s.scoreYou} : ${s.scoreOpp}  ·  ${formatMatchClock(s.clock)}`, w / 2, h / 2 + 16);
        ctx.font = "14px Trebuchet MS, sans-serif";
        ctx.fillStyle = "#b8c8b8";
        ctx.fillText(`${ROUNDS} раундов`, w / 2, h / 2 + 42);
      }

      // hide unused buttons visually by phase — engine still draws them; adjust labels
      s.btnReroll.label = s.phase === "fight" || s.phase === "result" ? "" : "Реролл 1";
      s.btnReady.label = s.phase === "lineup" ? "Готово" : "";
      if (s.phase === "fight") s.btnFight.label = "×" + s.speed;
      else if (s.phase === "result") s.btnFight.label = "Заново";
      else if (s.phase === "shop") s.btnFight.label = `Раунд ${s.round}`;
      else s.btnFight.label = "В матч";
    },
  };

  function roundRect(ctx, x, y, w, h, r) {
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      return;
    }
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawPitch(ctx, pr) {
    const { cw, ch } = cellSize(pr);
    // grass stripes
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const stripe = (r + c) % 2 === 0;
        ctx.fillStyle = stripe ? "#1f6b3a" : "#1a5c32";
        ctx.fillRect(pr.x + c * cw, pr.y + r * ch, cw + 0.5, ch + 0.5);
      }
    }
    // border
    ctx.strokeStyle = "rgba(230,240,230,0.85)";
    ctx.lineWidth = 2;
    ctx.strokeRect(pr.x, pr.y, pr.w, pr.h);
    // center line
    ctx.beginPath();
    ctx.moveTo(pr.x, pr.y + pr.h / 2);
    ctx.lineTo(pr.x + pr.w, pr.y + pr.h / 2);
    ctx.strokeStyle = "rgba(230,240,230,0.7)";
    ctx.stroke();
    // center circle
    ctx.beginPath();
    ctx.arc(pr.x + pr.w / 2, pr.y + pr.h / 2, Math.min(cw, ch) * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    // goals
    const gw = pr.w * 0.42;
    const gh = 14;
    ctx.fillStyle = "rgba(220,230,220,0.35)";
    ctx.fillRect(pr.x + (pr.w - gw) / 2, pr.y - 2, gw, gh);
    ctx.fillRect(pr.x + (pr.w - gw) / 2, pr.y + pr.h - gh + 2, gw, gh);
    ctx.strokeStyle = "rgba(240,248,240,0.9)";
    ctx.strokeRect(pr.x + (pr.w - gw) / 2, pr.y - 2, gw, gh);
    ctx.strokeRect(pr.x + (pr.w - gw) / 2, pr.y + pr.h - gh + 2, gw, gh);
    // grid faint
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 1;
    for (let c = 1; c < COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(pr.x + c * cw, pr.y);
      ctx.lineTo(pr.x + c * cw, pr.y + pr.h);
      ctx.stroke();
    }
    for (let r = 1; r < ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(pr.x, pr.y + r * ch);
      ctx.lineTo(pr.x + pr.w, pr.y + r * ch);
      ctx.stroke();
    }
  }

  function drawRoleBadge(ctx, x, y, role, scale) {
    scale = scale || 1;
    const b = ROLE_BADGE[role] || ROLE_BADGE.MID;
    const w = 22 * scale;
    const h = 12 * scale;
    ctx.fillStyle = b.color;
    roundRect(ctx, x - w / 2, y - h / 2, w, h, 3 * scale);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.font = "bold " + Math.round(9 * scale) + "px Trebuchet MS, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(b.short, x, y + 0.5);
  }

  function drawUnit(ctx, pr, u, s) {
    if (u.col < 0) return;
    const p = unitPos(pr, u);
    const breath = Math.sin(u.breath) * 1.4;
    const r = 15 + (u.star - 1) * 2;
    const body = u.team === "you" ? "#2f8f6b" : "#b84a3a";
    const stroke = u.sel ? "#fff" : u.tacticColor;
    const badge = ROLE_BADGE[u.role] || ROLE_BADGE.MID;

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + r * 0.7, r * 0.7, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // body
    ctx.beginPath();
    ctx.arc(p.x, p.y + breath * 0.3, r, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = stroke;
    ctx.stroke();

    // arms («ручки»)
    const armA = (u.lungeAng || -Math.PI / 2) + 0.9;
    const armB = (u.lungeAng || -Math.PI / 2) - 0.9;
    ctx.strokeStyle = body;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(armA) * (r + 5), p.y + Math.sin(armA) * (r + 5) + breath);
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + Math.cos(armB) * (r + 5), p.y + Math.sin(armB) * (r + 5) + breath);
    ctx.stroke();

    // role letter inside body
    ctx.fillStyle = "#f2f7f2";
    ctx.font = "bold 11px Trebuchet MS, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(badge.short, p.x, p.y + breath * 0.3 + 1);

    // star pips
    ctx.fillStyle = "#f0d060";
    ctx.font = "9px Trebuchet MS, sans-serif";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("★".repeat(u.star), p.x, p.y - r - 2);

    // name + role full + amp
    ctx.fillStyle = "#f2f7f2";
    ctx.font = "bold 10px Trebuchet MS, sans-serif";
    ctx.fillText(u.name, p.x, p.y + r + 10);
    drawRoleBadge(ctx, p.x - 18, p.y + r + 22, u.role, 0.95);
    ctx.fillStyle = "rgba(220,230,220,0.9)";
    ctx.font = "9px Trebuchet MS, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(u.ampName, p.x - 4, p.y + r + 22);
  }

  function drawBall(ctx, s) {
    const fl = s.ball.flight;
    const x = s.ball.x;
    const y = s.ball.y;
    if (fl) {
      // trail
      ctx.strokeStyle = "rgba(240,240,220,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fl.x0, fl.y0);
      ctx.quadraticCurveTo((fl.x0 + fl.x1) / 2, (fl.y0 + fl.y1) / 2 - fl.arc, x, y);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#f4f0e0";
    ctx.fill();
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawFx(ctx, f) {
    const a = clamp(f.t / (f.life || 0.55), 0, 1);
    ctx.globalAlpha = a;
    if (f.kind === "banner") {
      ctx.globalAlpha = 1;
      return;
    }
    const colors = {
      pass: "#7ec8a0",
      cross: "#c4a35a",
      tackle: "#e85d4c",
      intercept: "#4a9fe0",
      shot: "#e8a838",
      save: "#4a7fd4",
      goal: "#f0d060",
    };
    ctx.fillStyle = colors[f.kind] || "#fff";
    ctx.beginPath();
    const rad = 10 + (1 - a) * 18;
    ctx.arc(f.x, f.y, rad, 0, Math.PI * 2);
    ctx.fill();
    if (f.kind === "goal") {
      ctx.fillStyle = "#fff";
      ctx.font = "bold 14px Trebuchet MS, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("⚽", f.x, f.y - rad - 4);
    }
    ctx.globalAlpha = 1;
  }

  function drawShop(ctx, s) {
    const y = H - 175;
    const w = 150;
    const gap = 10;
    const total = SHOP_SLOTS * w + (SHOP_SLOTS - 1) * gap;
    let x0 = (W - total) / 2;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    roundRect(ctx, x0 - 8, y - 8, total + 16, 74, 8);
    ctx.fill();
    for (let i = 0; i < s.shop.length; i++) {
      const slot = s.shop[i];
      const x = x0 + i * (w + gap);
      ctx.fillStyle = slot.sold ? "rgba(40,50,40,0.5)" : "#1e3a2c";
      roundRect(ctx, x, y, w, 58, 6);
      ctx.fill();
      ctx.strokeStyle = slot.def.tacticColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      if (slot.sold) {
        ctx.fillStyle = "#889";
        ctx.font = "12px Trebuchet MS, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("sold", x + w / 2, y + 32);
        continue;
      }
      ctx.fillStyle = "#f0f4f0";
      ctx.font = "bold 12px Trebuchet MS, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(slot.def.name, x + 30, y + 16);
      drawRoleBadge(ctx, x + 16, y + 14, slot.def.role, 1);
      ctx.font = "10px Trebuchet MS, sans-serif";
      ctx.fillStyle = "#b8c8b8";
      const rb = ROLE_BADGE[slot.def.role] || ROLE_BADGE.MID;
      ctx.fillText(`${rb.full} · ${slot.def.ampName}`, x + 8, y + 32);
      ctx.fillStyle = slot.def.tacticColor;
      ctx.fillText(slot.def.tacticName, x + 8, y + 46);
      ctx.fillStyle = "#f0d060";
      ctx.font = "bold 12px Trebuchet MS, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`💰${slot.cost}`, x + w - 8, y + 16);
    }
  }

  function drawBench(ctx, s) {
    const y0 = H - 108;
    const chipW = 68;
    const gap = 6;
    const total = Math.max(1, s.bench.length) * (chipW + gap);
    let x0 = (W - total) / 2;
    ctx.fillStyle = "rgba(0,0,0,0.3)";
    roundRect(ctx, 8, y0 - 6, W - 16, 64, 8);
    ctx.fill();
    if (!s.bench.length) {
      ctx.fillStyle = "#889988";
      ctx.font = "11px Trebuchet MS, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Скамейка пуста", W / 2, y0 + 28);
      return;
    }
    for (let i = 0; i < s.bench.length; i++) {
      const u = s.bench[i];
      const x = x0 + i * (chipW + gap);
      ctx.fillStyle = u.sel ? "#2a5a40" : "#1a3024";
      roundRect(ctx, x, y0, chipW, 52, 5);
      ctx.fill();
      ctx.strokeStyle = u.tacticColor;
      ctx.lineWidth = u.sel ? 2.5 : 1.5;
      ctx.stroke();
      ctx.fillStyle = "#f0f4f0";
      ctx.font = "bold 10px Trebuchet MS, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(u.name, x + chipW / 2, y0 + 12);
      drawRoleBadge(ctx, x + chipW / 2, y0 + 24, u.role, 1);
      ctx.fillStyle = "#a8b8a8";
      ctx.font = "8px Trebuchet MS, sans-serif";
      ctx.textBaseline = "alphabetic";
      const rb = ROLE_BADGE[u.role] || ROLE_BADGE.MID;
      ctx.fillText(rb.full, x + chipW / 2, y0 + 38);
      ctx.fillStyle = "#f0d060";
      ctx.fillText("★".repeat(u.star) + ` ${u.cost}`, x + chipW / 2, y0 + 48);
    }
  }

  // —— Public API ——
  global.FEEL_DEMOS = global.FEEL_DEMOS || {};
  global.FEEL_DEMOS["legends-of-the-pitch"] = demo;

  /** Node / smoke helpers (no canvas required for logic checks) */
  global.LegendsPitchDemoSmoke = {
    CARD_DEFS,
    TACTICS,
    COLS,
    ROWS,
    createMockApi() {
      const buttons = [];
      const taps = [];
      return {
        w: W,
        h: H,
        canvas: { width: W, height: H },
        ctx: null,
        input: {
          addButton(b) {
            const btn = Object.assign({ pressed: false, _held: false }, b);
            Object.defineProperty(btn, "clicked", {
              get() {
                if (btn.pressed) {
                  btn.pressed = false;
                  return true;
                }
                return false;
              },
            });
            buttons.push(btn);
            return btn;
          },
          consumeTap() {
            return taps.shift() || null;
          },
          pushTap(x, y) {
            taps.push({ x, y });
          },
          _buttons: buttons,
        },
        setHud() {},
        clamp,
        rand,
        pick,
        dist(a, b) {
          return Math.hypot(a.x - b.x, a.y - b.y);
        },
      };
    },
    placeOnCell(s, api, unitIndex, col, row) {
      const u = s.bench[unitIndex] || s.field[unitIndex];
      if (!u) throw new Error("no unit");
      selectUnit(s, u);
      placeSelected(s, col, row);
      return { col: u.col, row: u.row };
    },
    runMatchTicks(s, api, seconds, step) {
      step = step || 1 / 30;
      let t = 0;
      if (s.phase !== "fight") startFight(s, api);
      while (t < seconds && s.phase === "fight") {
        demo.update(s, api, step);
        t += step;
      }
      return s.stats;
    },
    pingPongRate(stats) {
      const edges = stats.passEdges || [];
      if (edges.length < 2) return 0;
      let pp = 0;
      for (let i = 1; i < edges.length; i++) {
        const [a, b] = edges[i - 1];
        const [c, d] = edges[i];
        if (a === d && b === c) pp++;
      }
      return pp / Math.max(1, edges.length - 1);
    },
    demo,
  };
})(typeof window !== "undefined" ? window : globalThis);
