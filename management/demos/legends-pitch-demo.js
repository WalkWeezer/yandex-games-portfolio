/**
 * Legends of the Pitch — feel demo ZONE 6v6 (from scratch)
 *
 * Сетка · расстановка · команды пересекаются · каждый действует в своей зоне
 * Действия: пас / навес / отбор / перехват / удар / сейв
 * Колода 18 · витрина 3 · скамейка 7 · 3→★ · ролл равномерно (без bias)
 */
window.FEEL_DEMOS = window.FEEL_DEMOS || {};

window.FEEL_DEMOS["legends-of-the-pitch"] = {
  hint: "6v6 на сетке: расставь → магазин → матч. Пас / отбор / перехват / удар в своей зоне.",

  COLS: 3,
  ROWS: 5, // 0 = их ворота (верх), 4 = наши (низ)
  DECK_SIZE: 18,
  SHOP_SIZE: 3,
  BENCH_MAX: 7,
  MERGE_NEED: 3,
  COPIES: 3,
  ROUNDS: 7,
  FIELD: 6,

  TACTIC_RU: {
    Gegenpress: "Gegenpress",
    TikiTaka: "Tiki-Taka",
    ParkBus: "Park Bus",
    Counter: "Counter",
    WingPlay: "Wing Play",
    RouteOne: "Route One",
  },
  TACTIC_COLOR: {
    Gegenpress: "#f97316",
    TikiTaka: "#38bdf8",
    ParkBus: "#a78bfa",
    Counter: "#f472b6",
    WingPlay: "#4ade80",
    RouteOne: "#fbbf24",
  },
  ROLE_COLOR: { GK: "#c4b5fd", DEF: "#60a5fa", MID: "#fbbf24", WING: "#86efac", FWD: "#f87171" },

  /** amp → веса действий (сумма не важна, нормализуем) */
  AMP_ACT: {
    ShotStop: { save: 5, clear: 2, pass: 1 },
    SweeperGK: { save: 3, clear: 2, pass: 3 },
    NoNonsense: { tackle: 3, clear: 3, pass: 1 },
    BallPlayCB: { tackle: 2, pass: 3, clear: 1 },
    FullBack: { tackle: 2, pass: 2, cross: 2 },
    WingBack: { tackle: 2, pass: 2, cross: 3, dribble: 1 },
    Anchor: { tackle: 3, intercept: 2, pass: 2 },
    BWM: { tackle: 4, intercept: 3, pass: 2 },
    Playmaker: { pass: 5, shoot: 1, dribble: 1 },
    Mezzala: { pass: 3, shoot: 2, dribble: 2 },
    Winger: { cross: 4, dribble: 2, pass: 2, shoot: 1 },
    InsideFwd: { shoot: 3, dribble: 2, pass: 2 },
    Target: { shoot: 2, pass: 2, hold: 3 },
    Poacher: { shoot: 5, pass: 1 },
    FalseNine: { pass: 4, shoot: 2, dribble: 2 },
    Shadow: { shoot: 3, pass: 2, dribble: 2 },
  },

  CATALOG: [
    { name: "Мороз", amp: "NoNonsense", tactic: "ParkBus", role: "DEF", cost: 2, pac: 5, sht: 2, pas: 3, def: 9, wor: 7 },
    { name: "Холм", amp: "Anchor", tactic: "ParkBus", role: "MID", cost: 2, pac: 5, sht: 3, pas: 5, def: 8, wor: 8 },
    { name: "Круз", amp: "ShotStop", tactic: "ParkBus", role: "GK", cost: 2, pac: 4, sht: 1, pas: 4, def: 9, wor: 6 },
    { name: "Риф", amp: "FullBack", tactic: "WingPlay", role: "DEF", cost: 2, pac: 7, sht: 2, pas: 5, def: 7, wor: 7 },
    { name: "Нова", amp: "BWM", tactic: "Gegenpress", role: "MID", cost: 2, pac: 7, sht: 3, pas: 5, def: 7, wor: 8 },
    { name: "Кип", amp: "Target", tactic: "RouteOne", role: "FWD", cost: 2, pac: 4, sht: 6, pas: 4, def: 4, wor: 7 },
    { name: "Клык", amp: "BWM", tactic: "Gegenpress", role: "MID", cost: 3, pac: 7, sht: 4, pas: 6, def: 8, wor: 9 },
    { name: "Коста", amp: "WingBack", tactic: "Gegenpress", role: "WING", cost: 3, pac: 8, sht: 4, pas: 6, def: 6, wor: 8 },
    { name: "Рей", amp: "Winger", tactic: "WingPlay", role: "WING", cost: 3, pac: 9, sht: 6, pas: 7, def: 3, wor: 6 },
    { name: "Окафор", amp: "Target", tactic: "WingPlay", role: "FWD", cost: 3, pac: 4, sht: 7, pas: 5, def: 4, wor: 8 },
    { name: "Брант", amp: "BallPlayCB", tactic: "TikiTaka", role: "DEF", cost: 3, pac: 5, sht: 2, pas: 8, def: 7, wor: 6 },
    { name: "Ила", amp: "Playmaker", tactic: "TikiTaka", role: "MID", cost: 3, pac: 6, sht: 5, pas: 8, def: 3, wor: 6 },
    { name: "Волк", amp: "SweeperGK", tactic: "Gegenpress", role: "GK", cost: 3, pac: 6, sht: 1, pas: 7, def: 7, wor: 7 },
    { name: "Дрейк", amp: "Shadow", tactic: "Counter", role: "MID", cost: 3, pac: 7, sht: 8, pas: 5, def: 3, wor: 6 },
    { name: "Ларс", amp: "Poacher", tactic: "Counter", role: "FWD", cost: 3, pac: 8, sht: 8, pas: 3, def: 2, wor: 5 },
    { name: "Найт", amp: "Poacher", tactic: "Counter", role: "FWD", cost: 4, pac: 8, sht: 9, pas: 3, def: 2, wor: 5 },
    { name: "Сато", amp: "Playmaker", tactic: "TikiTaka", role: "MID", cost: 4, pac: 6, sht: 6, pas: 9, def: 3, wor: 6 },
    { name: "Бриз", amp: "InsideFwd", tactic: "Counter", role: "WING", cost: 4, pac: 8, sht: 8, pas: 5, def: 2, wor: 6 },
    { name: "Рока", amp: "Winger", tactic: "WingPlay", role: "WING", cost: 4, pac: 9, sht: 6, pas: 7, def: 3, wor: 6 },
    { name: "Феликс", amp: "FalseNine", tactic: "TikiTaka", role: "FWD", cost: 5, pac: 7, sht: 7, pas: 8, def: 2, wor: 7 },
    { name: "Аида", amp: "Poacher", tactic: "Gegenpress", role: "FWD", cost: 5, pac: 8, sht: 8, pas: 5, def: 3, wor: 8 },
    { name: "Шрам", amp: "NoNonsense", tactic: "ParkBus", role: "DEF", cost: 5, pac: 5, sht: 2, pas: 4, def: 9, wor: 8 },
    { name: "Юна", amp: "Mezzala", tactic: "Counter", role: "MID", cost: 5, pac: 7, sht: 7, pas: 8, def: 3, wor: 7 },
    { name: "Мира", amp: "Playmaker", tactic: "RouteOne", role: "MID", cost: 4, pac: 5, sht: 4, pas: 8, def: 4, wor: 6 },
  ],

  // слоты расстановки (наши): col,row на сетке
  US_SLOTS: [
    { zone: "GK", col: 1, row: 4 },
    { zone: "DEF", col: 0, row: 3 },
    { zone: "DEF", col: 2, row: 3 },
    { zone: "MID", col: 1, row: 2 },
    { zone: "WING", col: 0, row: 2 },
    { zone: "FWD", col: 1, row: 1 },
  ],
  OPP_SLOTS: [
    { zone: "GK", col: 1, row: 0 },
    { zone: "DEF", col: 0, row: 1 },
    { zone: "DEF", col: 2, row: 1 },
    { zone: "MID", col: 1, row: 2 },
    { zone: "WING", col: 2, row: 2 },
    { zone: "FWD", col: 1, row: 3 },
  ],

  create(api) {
    this.syncLayout(api);
    const W = api.w;
    const H = api.h;
    const start = api.input.addButton({ x: W / 2 - 70, y: H - 70, w: 140, h: 54, label: "Далее", color: "#3dd68c" });
    const reroll = api.input.addButton({ x: 14, y: H - 70, w: 110, h: 54, label: "Реролл 2", color: "#64748b" });
    const sell = api.input.addButton({ x: W - 124, y: H - 70, w: 110, h: 54, label: "Продать", color: "#f07178" });
    const speed = api.input.addButton({ x: -999, y: -999, w: 64, h: 40, label: "×2", color: "#5db0ff" });
    return this.fresh(api, { start, reroll, sell, speed });
  },

  syncLayout(api) {
    const W = api.w;
    const H = api.h;
    const pitchBottom = Math.floor(H * 0.58);
    const padX = 28;
    const padY = 56;
    const gw = W - padX * 2;
    const gh = pitchBottom - padY - 8;
    this.L = {
      W,
      H,
      pitchBottom,
      uiTop: pitchBottom + 6,
      originX: padX,
      originY: padY,
      cellW: gw / this.COLS,
      cellH: gh / this.ROWS,
    };
    return this.L;
  },

  cellCenter(col, row) {
    const L = this.L;
    return {
      x: L.originX + (col + 0.5) * L.cellW,
      y: L.originY + (row + 0.5) * L.cellH,
    };
  },

  mint(base, stars) {
    return { ...base, uid: base.name + "_" + Math.random().toString(36).slice(2, 6), stars: stars || 1 };
  },
  starLabel(c) {
    return "★".repeat(c.stars || 1);
  },

  buildDeck() {
    const pool = this.CATALOG.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    // гарантируем ≥4 тактики
    const picked = [];
    const tactics = new Set();
    for (const c of pool) {
      if (picked.length >= this.DECK_SIZE) break;
      if (tactics.size < 4 || tactics.has(c.tactic) || picked.length < 12) {
        picked.push(this.mint(c, 1));
        tactics.add(c.tactic);
      }
    }
    while (picked.length < this.DECK_SIZE) {
      const c = pool[picked.length % pool.length];
      picked.push(this.mint(c, 1));
    }
    return picked;
  },

  makeTeam(side, slots) {
    return slots.map((s, i) => {
      const p = this.cellCenter(s.col, s.row);
      return {
        side,
        index: i,
        zone: s.zone,
        col: s.col,
        row: s.row,
        homeCol: s.col,
        homeRow: s.row,
        card: null,
        px: p.x,
        py: p.y,
        facing: side === "us" ? -Math.PI / 2 : Math.PI / 2,
        arm: Math.random() * 6,
        act: null,
        actT: 0,
      };
    });
  },

  seedOpp(api, deck) {
    const team = this.makeTeam("opp", this.OPP_SLOTS);
    const tactics = [...new Set(deck.map((c) => c.tactic))].slice(0, 4);
    const pool = this.CATALOG.filter((c) => tactics.includes(c.tactic));
    for (const u of team) {
      const cand = pool.filter((c) => c.role === u.zone);
      const base = cand.length ? api.pick(cand) : api.pick(this.CATALOG.filter((c) => c.role === u.zone));
      u.card = this.mint(base || this.CATALOG[0], 1);
    }
    return team;
  },

  fresh(api, btns) {
    this.syncLayout(api);
    const deck = this.buildDeck();
    const ours = this.makeTeam("us", this.US_SLOTS);
    const opp = this.seedOpp(api, deck);
    btns.start.label = "В магазин";
    btns.start.color = "#3dd68c";
    btns.reroll.x = -999;
    btns.sell.x = -999;
    btns.speed.x = -999;
    return {
      start: btns.start,
      reroll: btns.reroll,
      sell: btns.sell,
      speed: btns.speed,
      phase: "lineup",
      deck,
      poolNames: deck.map((c) => c.name),
      bag: this.makeBag(deck),
      ours,
      opp,
      bench: [],
      shop: [],
      selected: null,
      coins: 10,
      round: 0,
      minute: 0,
      myGoals: 0,
      oppGoals: 0,
      ball: { col: 1, row: 2, owner: null, flying: null, x: 0, y: 0 },
      fx: [],
      log: [],
      subline: "Тап карту колоды → слот на сетке (6/6)",
      banner: null,
      bannerT: 0,
      bannerColor: "#fff",
      pulse: 0,
      thinkT: 0,
      segmentT: 0,
      timeScale: 1,
      note: "6v6 · колода 18 · витрина 3 · скамейка 7",
      lastResult: null,
      lastPassFrom: null,
      lastPassTo: null,
      passStreak: 0,
    };
  },

  makeBag(deck) {
    // по 3 копии каждого имени колоды
    const bag = [];
    const names = [...new Set(deck.map((c) => c.name))];
    for (const n of names) {
      const base = this.CATALOG.find((c) => c.name === n) || deck.find((c) => c.name === n);
      for (let i = 0; i < this.COPIES; i++) bag.push(base.name);
    }
    return bag;
  },

  filled(team) {
    return team.filter((u) => u.card).length;
  },
  units(s) {
    return [...s.ours, ...s.opp].filter((u) => u.card);
  },
  atCell(s, col, row) {
    return this.units(s).filter((u) => u.col === col && u.row === row);
  },
  teammates(s, side) {
    return (side === "us" ? s.ours : s.opp).filter((u) => u.card);
  },
  enemies(s, side) {
    return (side === "us" ? s.opp : s.ours).filter((u) => u.card);
  },

  tacticCount(team) {
    const c = Object.create(null);
    for (const u of team) {
      if (!u.card) continue;
      c[u.card.tactic] = (c[u.card.tactic] || 0) + 1;
    }
    return Object.entries(c)
      .filter(([, n]) => n >= 2)
      .map(([id, n]) => ({ id, n, level: n >= 4 ? 3 : n >= 3 ? 2 : 1 }))
      .sort((a, b) => b.n - a.n);
  },

  shopOffer(s, api) {
    // равномерно из мешка (без owned-bias)
    if (!s.bag.length) s.bag = this.makeBag(s.deck.length ? s.deck : s.poolNames.map((n) => ({ name: n })));
    const name = api.pick(s.bag);
    const base = this.CATALOG.find((c) => c.name === name);
    return { card: this.mint(base, 1), price: base.cost, name };
  },
  refreshShop(s, api) {
    s.shop = [];
    for (let i = 0; i < this.SHOP_SIZE; i++) s.shop.push(this.shopOffer(s, api));
  },
  takeFromBag(s, name) {
    const i = s.bag.indexOf(name);
    if (i >= 0) s.bag.splice(i, 1);
  },

  tryMerge(s) {
    let merged = null;
    for (let guard = 0; guard < 6; guard++) {
      let did = false;
      const names = new Set([
        ...s.ours.filter((u) => u.card).map((u) => u.card.name),
        ...s.bench.map((c) => c.name),
      ]);
      for (const name of names) {
        const field = [];
        s.ours.forEach((u, i) => {
          if (u.card && u.card.name === name && (u.card.stars || 1) === 1) field.push({ where: "field", i, card: u.card });
        });
        const bench = [];
        s.bench.forEach((c, i) => {
          if (c.name === name && (c.stars || 1) === 1) bench.push({ where: "bench", i, card: c });
        });
        const all = [...field, ...bench];
        if (all.length < this.MERGE_NEED) continue;
        const keep = all.find((p) => p.where === "field") || all[0];
        const take = [keep];
        for (const p of all) {
          if (take.length >= this.MERGE_NEED) break;
          if (p !== keep) take.push(p);
        }
        // remove higher indices first
        take
          .slice()
          .sort((a, b) => b.i - a.i)
          .forEach((p) => {
            if (p.where === "field") s.ours[p.i].card = null;
            else s.bench.splice(p.i, 1);
          });
        const up = this.mint(keep.card, 2);
        if (keep.where === "field") {
          s.ours[keep.i].card = up;
          this.snapUnit(s.ours[keep.i]);
        } else if (s.bench.length < this.BENCH_MAX) s.bench.push(up);
        merged = up;
        did = true;
        s.banner = "MERGE ★";
        s.bannerColor = "#fbbf24";
        s.bannerT = 0.8;
        s.subline = up.name + " · " + up.amp;
      }
      if (!did) break;
    }
    return merged;
  },

  snapUnit(u) {
    const p = this.cellCenter(u.col, u.row);
    u.px = p.x;
    u.py = p.y;
  },

  placeOn(u, card) {
    u.card = card;
    this.snapUnit(u);
    u.act = null;
    u.actT = 0;
  },

  // ——— FX ———
  spawnFx(s, kind, x, y, extra) {
    const life = { pass: 0.45, cross: 0.55, tackle: 0.5, intercept: 0.5, shot: 0.55, save: 0.5, goal: 0.85 }[kind] || 0.4;
    s.fx.push(Object.assign({ kind, x, y, t: life, life }, extra || {}));
  },
  pushLog(s, text) {
    s.log.unshift(text);
    if (s.log.length > 5) s.log.pop();
    s.subline = text;
  },

  // ——— SIM ———
  neighbors(col, row) {
    const out = [];
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (!dc && !dr) continue;
        const c = col + dc;
        const r = row + dr;
        if (c >= 0 && c < this.COLS && r >= 0 && r < this.ROWS) out.push({ col: c, row: r });
      }
    }
    return out;
  },

  pathCells(a, b) {
    // клетки «на линии» паса (упрощённо — промежуточные по manhattan)
    const cells = [];
    let c = a.col;
    let r = a.row;
    const steps = Math.max(Math.abs(b.col - a.col), Math.abs(b.row - a.row));
    for (let i = 1; i < steps; i++) {
      c = a.col + Math.round(((b.col - a.col) * i) / steps);
      r = a.row + Math.round(((b.row - a.row) * i) / steps);
      cells.push({ col: c, row: r });
    }
    return cells;
  },

  weightsFor(u, s) {
    const base = Object.assign({}, this.AMP_ACT[u.card.amp] || { pass: 2, shoot: 1, tackle: 1 });
    const tactics = this.tacticCount(u.side === "us" ? s.ours : s.opp);
    const top = tactics[0];
    const lv = top ? top.level : 0;
    if (top) {
      if (top.id === "Gegenpress") {
        base.tackle = (base.tackle || 0) + 1 + lv;
        base.intercept = (base.intercept || 0) + 1;
      }
      if (top.id === "TikiTaka") base.pass = (base.pass || 0) + 2 + lv;
      if (top.id === "ParkBus") {
        base.tackle = (base.tackle || 0) + 1;
        base.clear = (base.clear || 0) + 1;
        base.shoot = Math.max(0, (base.shoot || 0) - 1);
      }
      if (top.id === "Counter") {
        base.pass = (base.pass || 0) + 1;
        base.shoot = (base.shoot || 0) + lv;
      }
      if (top.id === "WingPlay") base.cross = (base.cross || 0) + 2 + lv;
      if (top.id === "RouteOne") {
        base.cross = (base.cross || 0) + 1;
        base.shoot = (base.shoot || 0) + 1;
      }
    }
    // зона: удар из середины и чужой трети; ближе к воротам — чаще
    const attackDepth = u.side === "us" ? 2 - u.row : u.row - 2; // ≥0 в атакующей половине
    if (attackDepth < 0) base.shoot = 0;
    else base.shoot = (base.shoot || 0) + 1 + attackDepth * 2;
    // застой владения → давим на удар / вынос, режем боковой пас
    const stagn = s.passStreak || 0;
    if (stagn >= 2) {
      base.shoot = (base.shoot || 0) + stagn;
      base.cross = (base.cross || 0) + 1;
      base.pass = Math.max(0, (base.pass || 0) - stagn);
    }
    if (stagn >= 4 && attackDepth >= 0) {
      base.shoot = (base.shoot || 0) + 6;
      base.pass = 0;
    }
    if (u.zone === "GK") {
      base.shoot = 0;
      base.cross = 0;
      base.dribble = 0;
      base.clear = (base.clear || 0) + 3;
    }
    return base;
  },

  pickWeighted(weights) {
    let sum = 0;
    for (const k of Object.keys(weights)) sum += Math.max(0, weights[k]);
    if (sum <= 0) return "hold";
    let r = Math.random() * sum;
    for (const k of Object.keys(weights)) {
      r -= Math.max(0, weights[k]);
      if (r <= 0) return k;
    }
    return "hold";
  },

  /** прогресс паса: + вперёд, 0 бок, − назад */
  passProgress(owner, target) {
    if (owner.side === "us") return owner.row - target.row;
    return target.row - owner.row;
  },

  /** цели паса в зоне (соседние клетки); long = вся своя половина вперёд */
  passTargets(s, owner, { cross = false, clear = false } = {}) {
    const mates = this.teammates(s, owner.side).filter((u) => u !== owner && u.card);
    const last = s.lastPassFrom;
    const banned = new Set();
    if (last) banned.add(last);
    // не гоняем один и тот же дуэт
    if (s.lastPassTo && s.lastPassFrom === owner) banned.add(s.lastPassTo);

    const inReach = (m) => {
      const dc = Math.abs(m.col - owner.col);
      const dr = Math.abs(m.row - owner.row);
      if (clear || cross) return dc + dr <= 3 && (cross || clear ? this.passProgress(owner, m) >= 0 : true);
      return dc <= 1 && dr <= 1 && !(dc === 0 && dr === 0);
    };

    let targets = mates.filter((m) => inReach(m) && !banned.has(m));
    if (cross) {
      const air = mates.filter((m) => this.passProgress(owner, m) >= 0 && !banned.has(m));
      if (air.length) targets = air;
    }
    // без fallback на всю команду — иначе пинг-понг через поле
    if (!targets.length) {
      targets = mates.filter((m) => inReach(m) && m !== last);
    }
    targets.sort((a, b) => {
      const pa = this.passProgress(owner, a);
      const pb = this.passProgress(owner, b);
      let sa = a.card.pas + pa * 3 + (a.zone === "FWD" ? 2 : 0) + (cross && a.zone === "FWD" ? 3 : 0);
      let sb = b.card.pas + pb * 3 + (b.zone === "FWD" ? 2 : 0) + (cross && b.zone === "FWD" ? 3 : 0);
      // при застое режем боковые/назад
      if ((s.passStreak || 0) >= 2) {
        if (pa <= 0) sa -= 4;
        if (pb <= 0) sb -= 4;
      }
      if (owner.card.amp === "Playmaker" || owner.card.amp === "FalseNine") {
        sa += 2;
        sb += 2;
      }
      return sb - sa + Math.random() * 0.4;
    });
    return targets;
  },

  giveBall(s, unit) {
    s.ball.owner = unit;
    s.ball.col = unit.col;
    s.ball.row = unit.row;
    s.ball.flying = null;
    const p = this.cellCenter(unit.col, unit.row);
    s.ball.x = p.x;
    s.ball.y = p.y;
  },

  startKickoff(s) {
    // команды уже на слотах — пересекаются в центре (оба имеют row2)
    for (const u of this.units(s)) this.snapUnit(u);
    const mid = s.ours.find((u) => u.card && u.zone === "MID") || s.ours.find((u) => u.card);
    if (mid) this.giveBall(s, mid);
    else {
      s.ball.col = 1;
      s.ball.row = 2;
      const p = this.cellCenter(1, 2);
      s.ball.x = p.x;
      s.ball.y = p.y;
      s.ball.owner = null;
    }
    this.pushLog(s, "Свисток · мяч в центре");
  },

  tryTackle(s, defender, owner, adjacent) {
    const same = defender.col === owner.col && defender.row === owner.row;
    if (!same && !adjacent) return false;
    const w = this.weightsFor(defender, s);
    if ((w.tackle || 0) < 1) return false;
    // соседний прессинг слабее и растёт только при застое владения
    let chance =
      (same ? 0.36 : 0.05 + Math.min(0.12, (s.passStreak || 0) * 0.03)) +
      defender.card.def * 0.03 +
      ((defender.card.stars || 1) - 1) * 0.05 -
      owner.card.pac * 0.02;
    if (adjacent && (w.tackle || 0) < 2 && (s.passStreak || 0) < 2) return false;
    if (Math.random() > Math.min(same ? 0.7 : 0.35, chance)) return false;
    defender.act = "tackle";
    defender.actT = 0.4;
    this.spawnFx(s, "tackle", defender.px, defender.py, { color: this.TACTIC_COLOR[defender.card.tactic] });
    this.giveBall(s, defender);
    s.lastPassFrom = null;
    s.lastPassTo = null;
    s.passStreak = 0;
    this.pushLog(s, "Отбор · " + defender.card.name + " (" + defender.card.amp + ")");
    return true;
  },

  tryIntercept(s, from, to, passerSide) {
    // перехват только на линии паса / в клетке приёма (не «магия» из соседних зон)
    const path = this.pathCells(from, to);
    path.push({ col: to.col, row: to.row });
    const seen = new Set();
    for (const cell of path) {
      const key = cell.col + "," + cell.row;
      if (seen.has(key)) continue;
      seen.add(key);
      const foes = this.atCell(s, cell.col, cell.row).filter((u) => u.side !== passerSide && u.card);
      for (const f of foes) {
        const w = this.weightsFor(f, s);
        const atRecv = f.col === to.col && f.row === to.row;
        const chance =
          (atRecv ? 0.16 : 0.1) + f.card.def * 0.02 + (w.intercept || 0) * 0.04;
        if (Math.random() < Math.min(0.4, chance)) {
          f.act = "intercept";
          f.actT = 0.4;
          this.spawnFx(s, "intercept", f.px, f.py, { color: "#38bdf8" });
          this.giveBall(s, f);
          s.lastPassFrom = null;
          s.lastPassTo = null;
          s.passStreak = 0;
          this.pushLog(s, "Перехват · " + f.card.name);
          return true;
        }
      }
    }
    return false;
  },

  doPass(s, owner, cross, clear) {
    const targets = this.passTargets(s, owner, { cross: !!cross, clear: !!clear });
    if (!targets.length) return false;
    const target = targets[0];
    const kind = cross ? "cross" : "pass";
    owner.act = kind;
    owner.actT = 0.35;
    this.spawnFx(s, kind, owner.px, owner.py, { x2: target.px, y2: target.py });
    const prog = this.passProgress(owner, target);
    s.lastPassFrom = owner;
    s.lastPassTo = target;
    if (prog > 0) s.passStreak = 0;
    else s.passStreak = (s.passStreak || 0) + 1;
    if (this.tryIntercept(s, owner, target, owner.side)) return true;
    this.giveBall(s, target);
    this.pushLog(
      s,
      (cross ? "Навес · " : clear ? "Вынос · " : "Пас · ") + owner.card.name + " → " + target.card.name
    );
    return true;
  },

  doShoot(s, owner) {
    owner.act = "shot";
    owner.actT = 0.45;
    const goalRow = owner.side === "us" ? 0 : 4;
    const goal = this.cellCenter(1, goalRow);
    this.spawnFx(s, "shot", owner.px, owner.py, { x2: goal.x, y2: goal.y, color: "#fde68a" });
    s.ball.owner = null;
    s.ball.flying = { x: goal.x, y: goal.y, t: 0.35, shot: true, side: owner.side, shooter: owner };
    s.lastPassFrom = null;
    s.lastPassTo = null;
    s.passStreak = 0;

    const depth = owner.side === "us" ? 2 - owner.row : owner.row - 2;
    const chance =
      0.18 +
      owner.card.sht * 0.045 +
      ((owner.card.stars || 1) - 1) * 0.06 +
      Math.max(0, depth) * 0.06 +
      (owner.card.amp === "Poacher" ? 0.08 : 0);
    s.pendingShot = { who: owner.side, chance: Math.min(0.68, chance), shooter: owner.card };
    this.pushLog(s, "Удар · " + owner.card.name + " (" + owner.card.amp + ")");
    return true;
  },

  resolveShot(s) {
    const p = s.pendingShot;
    if (!p) return;
    s.pendingShot = null;
    const gkSide = p.who === "us" ? "opp" : "us";
    const gk = this.teammates(s, gkSide).find((u) => u.zone === "GK");
    // блок в клетке ворот
    const box = this.atCell(s, 1, p.who === "us" ? 0 : 4).filter((u) => u.side !== p.who);
    if (box.length && Math.random() < 0.25) {
      const b = box[0];
      this.spawnFx(s, "tackle", b.px, b.py, { color: "#a78bfa" });
      this.giveBall(s, b);
      this.pushLog(s, "Блок · " + b.card.name);
      s.banner = "БЛОК";
      s.bannerColor = "#a78bfa";
      s.bannerT = 0.7;
      return;
    }
    if (Math.random() < p.chance) {
      if (p.who === "us") s.myGoals += 1;
      else s.oppGoals += 1;
      s.banner = "ГОООЛ!";
      s.bannerColor = "#fbbf24";
      s.bannerT = 1.1;
      this.spawnFx(s, "goal", this.cellCenter(1, p.who === "us" ? 0 : 4).x, this.cellCenter(1, p.who === "us" ? 0 : 4).y);
      this.pushLog(s, "Гол · " + p.shooter.name);
      // kickoff reverse
      const mid = this.teammates(s, p.who === "us" ? "opp" : "us").find((u) => u.zone === "MID");
      if (mid) this.giveBall(s, mid);
    } else if (gk && Math.random() < 0.6) {
      gk.act = "save";
      gk.actT = 0.45;
      this.spawnFx(s, "save", gk.px, gk.py, { color: "#c4b5fd" });
      this.giveBall(s, gk);
      s.banner = "СЕЙВ";
      s.bannerColor = "#c4b5fd";
      s.bannerT = 0.75;
      this.pushLog(s, "Сейв · " + gk.card.name);
    } else {
      s.banner = Math.random() < 0.5 ? "МИМО" : "ШТАНГА";
      s.bannerColor = "#94a3b8";
      s.bannerT = 0.7;
      if (gk) this.giveBall(s, gk);
      this.pushLog(s, s.banner);
    }
  },

  simTick(s) {
    // отбор: та же клетка, иначе давление из соседней зоны
    if (s.ball.owner) {
      const owner = s.ball.owner;
      if (!owner.card) {
        s.ball.owner = null;
        return;
      }
      const same = this.atCell(s, owner.col, owner.row).filter((u) => u.side !== owner.side && u.card);
      for (const f of same) {
        if (this.tryTackle(s, f, owner, false)) return;
      }
      const near = [];
      for (const n of this.neighbors(owner.col, owner.row)) {
        for (const f of this.atCell(s, n.col, n.row)) {
          if (f.side !== owner.side && f.card) near.push(f);
        }
      }
      near.sort((a, b) => (b.card.def || 0) - (a.card.def || 0));
      for (const f of near) {
        if (this.tryTackle(s, f, owner, true)) return;
      }

      const w = this.weightsFor(owner, s);
      const aw = {
        pass: w.pass || 0,
        cross: w.cross || 0,
        shoot: w.shoot || 0,
        dribble: w.dribble || 0,
        hold: w.hold || 0,
        clear: w.clear || 0,
      };
      // нет целей паса → не крутим pass в весах
      const hasPass = this.passTargets(s, owner, {}).length > 0;
      const hasCross = this.passTargets(s, owner, { cross: true }).length > 0;
      const hasClear = this.passTargets(s, owner, { clear: true }).length > 0;
      if (!hasPass) aw.pass = 0;
      if (!hasCross) aw.cross = 0;
      if (!hasClear) aw.clear = 0;
      const attackDepth = owner.side === "us" ? 2 - owner.row : owner.row - 2;
      if (attackDepth >= 0 && !hasPass && !hasCross) aw.shoot = Math.max(aw.shoot, 3);

      const act = this.pickWeighted(aw);
      if (act === "shoot") {
        this.doShoot(s, owner);
        return;
      }
      if (act === "cross") {
        if (!this.doPass(s, owner, true, false)) {
          if (attackDepth >= 0) this.doShoot(s, owner);
          else this.doPass(s, owner, false, true);
        }
        return;
      }
      if (act === "clear") {
        if (!this.doPass(s, owner, false, true)) {
          owner.act = "dribble";
          owner.actT = 0.25;
          this.pushLog(s, "Контроль · " + owner.card.name);
        }
        return;
      }
      if (act === "dribble" || act === "hold") {
        owner.act = "dribble";
        owner.actT = 0.3;
        // дриблинг под прессингом чуть повышает шанс следующего отбора
        s.passStreak = (s.passStreak || 0) + 1;
        this.pushLog(s, "Контроль · " + owner.card.name);
        return;
      }
      if (!this.doPass(s, owner, false, false)) {
        if (attackDepth >= 0) this.doShoot(s, owner);
        else if (!this.doPass(s, owner, false, true)) {
          owner.act = "dribble";
          owner.actT = 0.25;
          this.pushLog(s, "Контроль · " + owner.card.name);
        }
      }
      return;
    }

    // ничейный мяч в клетке
    const here = this.atCell(s, s.ball.col, s.ball.row).filter((u) => u.card);
    if (here.length) {
      here.sort((a, b) => b.card.pac - a.card.pac);
      this.giveBall(s, here[0]);
      s.passStreak = 0;
      this.pushLog(s, "Подбор · " + here[0].card.name);
    }
  },

  // ——— UI rects ———
  deckRect(i, api) {
    const col = i % 6;
    const row = (i / 6) | 0;
    const w = Math.floor((api.w - 20) / 6) - 3;
    return { x: 10 + col * (w + 3), y: this.L.uiTop + 26 + row * 52, w, h: 48 };
  },
  shopRect(i, api) {
    const w = Math.floor((api.w - 28) / 3) - 4;
    return { x: 12 + i * (w + 6), y: this.L.uiTop + 125, w, h: 84 };
  },
  benchRect(i, api) {
    const w = Math.floor((api.w - 20) / 4) - 3;
    const col = i % 4;
    const row = (i / 4) | 0;
    return { x: 10 + col * (w + 3), y: this.L.uiTop + 24 + row * 46, w, h: 40 };
  },

  // ——— PHASES ———
  updateLineup(s, api) {
    s.reroll.x = -999;
    s.sell.x = -999;
    s.speed.x = -999;
    s.start.x = api.w / 2 - 70;
    s.start.y = api.h - 70;
    const n = this.filled(s.ours);
    s.start.label = n >= this.FIELD ? "В магазин" : "Состав " + n + "/" + this.FIELD;
    s.start.color = n >= this.FIELD ? "#3dd68c" : "#64748b";

    const tap = api.input.consumeTap();
    if (tap) {
      for (let i = 0; i < s.deck.length; i++) {
        const r = this.deckRect(i, api);
        if (tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y && tap.y <= r.y + r.h) {
          s.selected = { from: "deck", index: i };
          s.subline = s.deck[i].amp + " · " + this.TACTIC_RU[s.deck[i].tactic];
          return;
        }
      }
      for (const u of s.ours) {
        const p = this.cellCenter(u.col, u.row);
        const hit = Math.hypot(tap.x - p.x, tap.y - p.y) < 28 ||
          (tap.x >= p.x - this.L.cellW * 0.4 &&
            tap.x <= p.x + this.L.cellW * 0.4 &&
            tap.y >= p.y - this.L.cellH * 0.4 &&
            tap.y <= p.y + this.L.cellH * 0.4);
        if (!hit) continue;
        if (s.selected?.from === "deck") {
          const card = s.deck[s.selected.index];
          if (!card) break;
          if (u.card) s.deck.push(u.card);
          this.placeOn(u, card);
          s.deck.splice(s.selected.index, 1);
          s.selected = null;
          s.note = u.zone + " ← " + u.card.name;
        } else if (u.card) {
          s.deck.push(u.card);
          u.card = null;
          s.selected = null;
        }
        return;
      }
    }
    if (s.start.clicked && n >= this.FIELD) {
      s.poolNames = [
        ...new Set([...s.ours.filter((u) => u.card).map((u) => u.card.name), ...s.deck.map((c) => c.name)]),
      ];
      while (s.poolNames.length < this.DECK_SIZE) {
        const extra = api.pick(this.CATALOG).name;
        if (!s.poolNames.includes(extra)) s.poolNames.push(extra);
      }
      // колода для мешка = имена poolNames
      s.deck = s.poolNames.map((name) => this.mint(this.CATALOG.find((c) => c.name === name), 1));
      s.bag = this.makeBag(s.deck);
      s.coins = 10;
      s.phase = "shop";
      this.refreshShop(s, api);
      s.reroll.x = 14;
      s.sell.x = api.w - 124;
      s.start.label = "В бой!";
      s.note = "Покупки → скамейка → поставь на слот сам";
      s.subline = "Магазин · ролл из колоды 18";
    }
    const tc = this.tacticCount(s.ours);
    api.setHud(
      "Расстановка " + n + "/" + this.FIELD + " · " +
        (tc.map((t) => t.id.slice(0, 4) + "×" + t.n).join(" ") || "нет×2") +
        " · " + s.note
    );
  },

  buyOffer(s, api, i) {
    const offer = s.shop[i];
    if (!offer) return;
    if (s.coins < offer.price) {
      s.note = "Нужно " + offer.price + "🪙";
      return;
    }
    if (s.bench.length >= this.BENCH_MAX) {
      s.note = "Скамейка полна";
      return;
    }
    s.coins -= offer.price;
    this.takeFromBag(s, offer.name);
    s.bench.push(offer.card);
    s.shop[i] = null;
    const m = this.tryMerge(s);
    s.note = m ? "MERGE " + m.name : "Купил " + offer.card.name + " → на слот";
  },

  updateShop(s, api) {
    s.speed.x = -999;
    s.reroll.x = 14;
    s.reroll.y = api.h - 70;
    s.sell.x = api.w - 124;
    s.sell.y = api.h - 70;
    s.start.x = api.w / 2 - 70;
    s.start.y = api.h - 70;

    if (s.reroll.clicked) {
      if (s.coins >= 2) {
        s.coins -= 2;
        this.refreshShop(s, api);
        s.note = "Реролл";
      } else s.note = "Нужно 2🪙";
    }
    if (s.sell.clicked && s.selected) {
      if (s.selected.from === "bench") {
        const c = s.bench[s.selected.index];
        if (c) {
          s.coins += Math.max(1, c.cost - 1);
          s.bench.splice(s.selected.index, 1);
          s.selected = null;
          s.note = "Продано";
        }
      } else if (s.selected.from === "field") {
        const u = s.ours[s.selected.index];
        if (u?.card) {
          s.coins += Math.max(1, u.card.cost - 1);
          u.card = null;
          s.selected = null;
          s.note = "Продано";
        }
      }
    }

    const tap = api.input.consumeTap();
    if (tap) {
      for (let i = 0; i < this.SHOP_SIZE; i++) {
        const r = this.shopRect(i, api);
        if (tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y && tap.y <= r.y + r.h) {
          this.buyOffer(s, api, i);
          return;
        }
      }
      for (let i = 0; i < s.bench.length; i++) {
        const r = this.benchRect(i, api);
        if (tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y && tap.y <= r.y + r.h) {
          s.selected = { from: "bench", index: i };
          return;
        }
      }
      for (let i = 0; i < s.ours.length; i++) {
        const u = s.ours[i];
        const p = this.cellCenter(u.col, u.row);
        if (Math.hypot(tap.x - p.x, tap.y - p.y) > 32) continue;
        if (s.selected?.from === "bench") {
          const card = s.bench[s.selected.index];
          if (!card) break;
          if (u.card) {
            const tmp = u.card;
            this.placeOn(u, card);
            s.bench[s.selected.index] = tmp;
          } else {
            this.placeOn(u, card);
            s.bench.splice(s.selected.index, 1);
          }
          s.selected = null;
          this.tryMerge(s);
          s.note = "Поставил на " + u.zone;
        } else if (s.selected?.from === "field") {
          const a = s.ours[s.selected.index];
          if (a === u) {
            if (u.card && s.bench.length < this.BENCH_MAX) {
              s.bench.push(u.card);
              u.card = null;
              s.note = "На скамейку";
            }
          } else {
            const tmp = a.card;
            a.card = u.card;
            u.card = tmp;
            if (a.card) this.snapUnit(a);
            if (u.card) this.snapUnit(u);
            s.note = "Свап слотов";
          }
          s.selected = null;
        } else if (u.card) {
          s.selected = { from: "field", index: i };
          s.note = u.zone + ": свап / повтор = скамейка";
        }
        return;
      }
    }

    if (s.start.clicked) {
      if (s.round >= this.ROUNDS) {
        s.phase = "done";
        s.lastResult = s.myGoals > s.oppGoals ? "win" : s.myGoals < s.oppGoals ? "lose" : "draw";
        s.start.label = "Ещё";
        s.start.color = "#5db0ff";
        s.reroll.x = -999;
        s.sell.x = -999;
        return;
      }
      if (this.filled(s.ours) < this.FIELD) {
        s.note = "Нужно 6/6 на сетке";
        return;
      }
      this.startFight(s, api);
    }
    const tc = this.tacticCount(s.ours);
    api.setHud(
      "🪙" + s.coins + " · 6v6 · скамейка " + s.bench.length + "/" + this.BENCH_MAX + " · [" +
        (tc.map((t) => this.TACTIC_RU[t.id] + "×" + t.n).join(", ") || "нет×2") + "] · " + s.note
    );
  },

  startFight(s, api) {
    s.phase = "fight";
    s.selected = null;
    s.reroll.x = -999;
    s.sell.x = -999;
    s.speed.x = 14;
    s.speed.y = 10;
    s.start.label = "…";
    s.start.color = "#334155";
    s.segmentT = 20;
    s.thinkT = 0.7;
    s.pendingShot = null;
    this.startKickoff(s);
    const tc = this.tacticCount(s.ours);
    s.banner = (s.minute || 0) + "'";
    s.bannerColor = "#e2e8f0";
    s.bannerT = 0.5;
    s.subline =
      "Зональный матч · " +
      (tc.map((t) => this.TACTIC_RU[t.id] + "×" + t.n).join(" · ") || "без тактики ×2");
  },

  enterShop(s, api) {
    s.phase = "shop";
    s.ball.owner = null;
    s.ball.flying = null;
    s.pendingShot = null;
    s.selected = null;
    s.speed.x = -999;
    s.reroll.x = 14;
    s.sell.x = api.w - 124;
    s.start.label = s.round >= this.ROUNDS ? "Итог" : "В бой!";
    s.start.color = "#3dd68c";
    s.coins += 4 + Math.min(4, (s.coins / 10) | 0);
    this.refreshShop(s, api);
    s.note = "Расставь сам · скамейка → слот";
    for (const u of this.units(s)) {
      u.col = u.homeCol;
      u.row = u.homeRow;
      this.snapUnit(u);
    }
  },

  update(s, api, dt) {
    this.syncLayout(api);
    const dts = dt * (s.phase === "fight" ? s.timeScale : 1);
    s.pulse += dts;
    if (s.bannerT > 0) s.bannerT -= dts;
    for (const f of s.fx) f.t -= dts;
    s.fx = s.fx.filter((f) => f.t > 0);
    for (const u of this.units(s)) {
      u.arm += dts * 10;
      if (u.actT > 0) u.actT -= dts;
      else u.act = null;
      // лёгкое дыхание к центру клетки
      const p = this.cellCenter(u.col, u.row);
      u.px += (p.x - u.px) * Math.min(1, 6 * dts);
      u.py += (p.y - u.py) * Math.min(1, 6 * dts);
    }

    if (s.ball.flying) {
      const f = s.ball.flying;
      f.t -= dts;
      s.ball.x += (f.x - s.ball.x) * Math.min(1, dts * 10);
      s.ball.y += (f.y - s.ball.y) * Math.min(1, dts * 10);
      if (f.t <= 0) {
        s.ball.flying = null;
        if (f.shot) this.resolveShot(s);
      }
    } else if (s.ball.owner) {
      s.ball.x += (s.ball.owner.px - s.ball.x) * Math.min(1, dts * 10);
      s.ball.y += (s.ball.owner.py - 12 - s.ball.y) * Math.min(1, dts * 10);
      s.ball.col = s.ball.owner.col;
      s.ball.row = s.ball.owner.row;
    }

    if (s.phase === "done") {
      s.reroll.x = -999;
      s.sell.x = -999;
      s.speed.x = -999;
      if (s.start.clicked || api.input.consumeTap()) {
        Object.assign(s, this.fresh(api, { start: s.start, reroll: s.reroll, sell: s.sell, speed: s.speed }));
      }
      return;
    }
    if (s.phase === "lineup") {
      this.updateLineup(s, api);
      return;
    }
    if (s.phase === "shop") {
      this.updateShop(s, api);
      return;
    }

    // fight
    s.speed.x = 14;
    s.speed.y = 10;
    s.speed.label = s.timeScale > 1 ? "×1" : "×2";
    if (s.speed.clicked) s.timeScale = s.timeScale > 1 ? 1 : 2;

    s.segmentT -= dts;
    s.thinkT -= dts;
    if (s.thinkT <= 0 && !s.ball.flying && !s.pendingShot) {
      this.simTick(s);
      s.thinkT = 0.65 + Math.random() * 0.35;
    }
    if (s.segmentT <= 0) {
      s.round += 1;
      s.minute = Math.min(90, s.round * 13);
      this.enterShop(s, api);
      if (s.round >= this.ROUNDS) {
        s.start.label = "Итог";
        s.note = "Финал " + s.myGoals + ":" + s.oppGoals;
      }
    }
    api.setHud(s.myGoals + ":" + s.oppGoals + " · " + s.minute + "' · зона 6v6" + (s.timeScale > 1 ? " · ×2" : ""));
  },

  // ——— DRAW ———
  drawPitch(ctx, s) {
    const L = this.L;
    ctx.fillStyle = "#0b1620";
    ctx.fillRect(0, 0, L.W, L.H);
    // grass
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        ctx.fillStyle = (r + c) % 2 ? "#1a4d30" : "#163f28";
        ctx.fillRect(L.originX + c * L.cellW, L.originY + r * L.cellH, L.cellW + 0.5, L.cellH + 0.5);
      }
    }
    ctx.strokeStyle = "#ffffff55";
    ctx.lineWidth = 2;
    ctx.strokeRect(L.originX, L.originY, L.cellW * this.COLS, L.cellH * this.ROWS);
    // grid
    ctx.strokeStyle = "#ffffff22";
    ctx.lineWidth = 1;
    for (let c = 1; c < this.COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(L.originX + c * L.cellW, L.originY);
      ctx.lineTo(L.originX + c * L.cellW, L.originY + L.cellH * this.ROWS);
      ctx.stroke();
    }
    for (let r = 1; r < this.ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(L.originX, L.originY + r * L.cellH);
      ctx.lineTo(L.originX + L.cellW * this.COLS, L.originY + r * L.cellH);
      ctx.stroke();
    }
    // mid line
    ctx.strokeStyle = "#ffffff44";
    ctx.lineWidth = 2;
    const midY = L.originY + 2.5 * L.cellH;
    ctx.beginPath();
    ctx.moveTo(L.originX, midY);
    ctx.lineTo(L.originX + L.cellW * this.COLS, midY);
    ctx.stroke();

    // empty slot hints in lineup/shop
    if (s.phase !== "fight") {
      for (const u of s.ours) {
        if (u.card) continue;
        const p = this.cellCenter(u.col, u.row);
        ctx.strokeStyle = "#ffffff33";
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x - 26, p.y - 18, 52, 36);
        ctx.fillStyle = "#ffffff55";
        ctx.font = "bold 12px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(u.zone, p.x, p.y + 4);
      }
    }
  },

  drawPlayer(ctx, u, hot, pulse) {
    if (!u.card) return;
    const c = u.card;
    const isOpp = u.side === "opp";
    const r = 13 + ((c.stars || 1) - 1) * 2;
    const bob = Math.sin(pulse * 9 + u.arm) * 1.2;
    const x = u.px;
    const y = u.py + bob;
    const ang = u.facing;

    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.75, r * 0.8, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const swing = Math.sin(u.arm) * (u.act === "tackle" ? 0.9 : 0.45);
    ctx.strokeStyle = isOpp ? "#fecaca" : "#bbf7d0";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      const a = ang + side * (0.85 + swing * side);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6));
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = isOpp ? "#b91c1c" : "#15803d";
    ctx.fill();
    ctx.strokeStyle = hot ? "#fff" : this.TACTIC_COLOR[c.tactic];
    ctx.lineWidth = hot ? 3 : 2;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(c.name, x, y - r - 6);
    ctx.fillStyle = this.TACTIC_COLOR[c.tactic];
    ctx.font = "bold 10px Segoe UI, sans-serif";
    ctx.fillText(c.amp, x, y + r + 12);
    if ((c.stars || 1) > 1) {
      ctx.fillStyle = "#fde68a";
      ctx.fillText(this.starLabel(c), x, y + r + 24);
    }
  },

  drawFx(ctx, fx) {
    const a = Math.max(0, fx.t / fx.life);
    const k = 1 - a;
    ctx.save();
    ctx.globalAlpha = a;
    if (fx.kind === "pass" || fx.kind === "cross") {
      ctx.strokeStyle = fx.kind === "cross" ? "#86efac" : "#fff";
      ctx.setLineDash(fx.kind === "cross" ? [2, 6] : [5, 4]);
      ctx.lineWidth = fx.kind === "cross" ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(fx.x, fx.y);
      ctx.lineTo(fx.x2, fx.y2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (fx.kind === "tackle") {
      ctx.strokeStyle = fx.color || "#f97316";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 8 + k * 16, -0.8, 0.8);
      ctx.stroke();
    } else if (fx.kind === "intercept") {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fx.x - 12, fx.y);
      ctx.lineTo(fx.x + 12, fx.y);
      ctx.moveTo(fx.x, fx.y - 12);
      ctx.lineTo(fx.x, fx.y + 12);
      ctx.stroke();
    } else if (fx.kind === "shot") {
      ctx.strokeStyle = fx.color || "#fde68a";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(fx.x, fx.y);
      ctx.lineTo(fx.x + (fx.x2 - fx.x) * Math.min(1, k * 1.5), fx.y + (fx.y2 - fx.y) * Math.min(1, k * 1.5));
      ctx.stroke();
    } else if (fx.kind === "save") {
      ctx.strokeStyle = "#c4b5fd";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 10 + k * 18, 0, Math.PI * 2);
      ctx.stroke();
    } else if (fx.kind === "goal") {
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 20px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("⚽", fx.x, fx.y - k * 20);
    }
    ctx.restore();
  },

  drawChip(ctx, x, y, w, h, card, selected, price) {
    ctx.fillStyle = selected ? "#1d4ed8" : "#14532d";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = selected ? "#fff" : this.TACTIC_COLOR[card.tactic];
    ctx.lineWidth = selected ? 2.5 : 1.5;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = this.ROLE_COLOR[card.role];
    ctx.fillRect(x + 2, y + 2, w - 4, 6);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(card.name, x + w / 2, y + 22);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "9px Segoe UI, sans-serif";
    ctx.fillText(card.amp, x + w / 2, y + 34);
    ctx.fillStyle = this.TACTIC_COLOR[card.tactic];
    ctx.font = "bold 9px Segoe UI, sans-serif";
    const tn = this.TACTIC_RU[card.tactic];
    ctx.fillText(tn.length > 10 ? tn.slice(0, 9) + "…" : tn, x + w / 2, y + h - 8);
    if (price != null) {
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 12px Segoe UI, sans-serif";
      ctx.fillText(price + "🪙", x + w / 2, y + h - 20);
    }
  },

  draw(s, api) {
    const { ctx } = api;
    this.syncLayout(api);
    const L = this.L;
    this.drawPitch(ctx, s);

    // scoreboard
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(L.W / 2 - 100, 6, 200, 42);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 20px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    const title =
      s.phase === "lineup" ? "РАССТАНОВКА" : s.phase === "shop" ? "МАГАЗИН" : s.myGoals + " : " + s.oppGoals;
    ctx.fillText(title, L.W / 2, 26);
    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 13px Segoe UI, sans-serif";
    ctx.fillText(s.phase === "fight" ? s.minute + "'" : "🪙" + s.coins, L.W / 2, 42);

    // tactic chips
    const tc = this.tacticCount(s.ours);
    let cx = 10;
    for (const t of tc.slice(0, 3)) {
      const label = this.TACTIC_RU[t.id] + "×" + t.n;
      const tw = 14 + label.length * 6.5;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(cx, L.pitchBottom - 20, tw, 16);
      ctx.strokeStyle = this.TACTIC_COLOR[t.id];
      ctx.strokeRect(cx, L.pitchBottom - 20, tw, 16);
      ctx.fillStyle = this.TACTIC_COLOR[t.id];
      ctx.font = "bold 11px Segoe UI, sans-serif";
      ctx.fillText(label, cx + tw / 2, L.pitchBottom - 7);
      cx += tw + 4;
    }

    const list = this.units(s).sort((a, b) => a.py - b.py);
    for (const u of list) {
      const hot = s.ball.owner === u;
      this.drawPlayer(ctx, u, hot, s.pulse);
    }

    // ball
    if (s.phase === "fight" || s.ball.owner || s.ball.flying) {
      ctx.fillStyle = "#fffef2";
      ctx.beginPath();
      ctx.arc(s.ball.x || L.W / 2, s.ball.y || L.originY + L.cellH * 2.5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.stroke();
    }
    for (const f of s.fx) this.drawFx(ctx, f);

    if (s.subline) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(12, L.pitchBottom + 2, L.W - 24, 22);
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "13px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.subline, L.W / 2, L.pitchBottom + 17);
    }

    if (s.phase === "lineup") {
      ctx.fillStyle = "rgba(0,0,0,0.62)";
      ctx.fillRect(0, L.uiTop, L.W, L.H - L.uiTop);
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 13px Segoe UI, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Колода → тап слот на сетке (6/6)", 12, L.uiTop + 18);
      s.deck.forEach((c, i) => {
        const r = this.deckRect(i, api);
        this.drawChip(ctx, r.x, r.y, r.w, r.h, c, s.selected?.from === "deck" && s.selected.index === i, null);
      });
    }

    if (s.phase === "shop") {
      ctx.fillStyle = "rgba(0,0,0,0.62)";
      ctx.fillRect(0, L.uiTop, L.W, L.H - L.uiTop);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12px Segoe UI, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Скамейка " + s.bench.length + "/" + this.BENCH_MAX, 12, L.uiTop + 16);
      s.bench.forEach((c, i) => {
        const r = this.benchRect(i, api);
        this.drawChip(ctx, r.x, r.y, r.w, r.h, c, s.selected?.from === "bench" && s.selected.index === i, null);
      });
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 13px Segoe UI, sans-serif";
      ctx.fillText("Витрина (равномерно из колоды)", 12, L.uiTop + 116);
      for (let i = 0; i < this.SHOP_SIZE; i++) {
        const r = this.shopRect(i, api);
        if (s.shop[i]) this.drawChip(ctx, r.x, r.y, r.w, r.h, s.shop[i].card, false, s.shop[i].price);
        else {
          ctx.fillStyle = "#334155";
          ctx.fillRect(r.x, r.y, r.w, r.h);
        }
      }
    }

    if (s.bannerT > 0 && s.banner) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(40, L.originY + L.cellH * 2 - 30, L.W - 80, 50);
      ctx.fillStyle = s.bannerColor;
      ctx.font = "bold 26px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.banner, L.W / 2, L.originY + L.cellH * 2);
    }

    if (s.phase === "done") {
      const map = { win: ["ПОБЕДА", "#fbbf24"], lose: ["ПОРАЖЕНИЕ", "#f07178"], draw: ["НИЧЬЯ", "#94a3b8"] };
      const r = map[s.lastResult] || map.lose;
      api.drawBanner(ctx, r[0] + " " + s.myGoals + ":" + s.oppGoals, r[1]);
    }
  },
};
