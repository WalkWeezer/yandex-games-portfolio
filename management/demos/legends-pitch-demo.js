/**
 * Legends of the Pitch — feel demo ZONE 6v6
 *
 * Расстановка на СВОЕЙ половине → после свистка разбежка и пересечение.
 * Пас/удар: мяч летит. Моменты с паузой. Игроки с оффсетами в зоне.
 */
window.FEEL_DEMOS = window.FEEL_DEMOS || {};

window.FEEL_DEMOS["legends-of-the-pitch"] = {
  hint: "Своя половина → магазин → свисток: разбежка, пас/отбор/удар. Мяч летит, моменты читаемые.",

  COLS: 3,
  ROWS: 5, // 0 = их ворота, 4 = наши
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

  /**
   * home = своя половина (расстановка).
   * push = позиции после свистка (команды пересекаются).
   * ox/oy — пиксельный оффсет внутри клетки, чтобы не стакать в центре.
   */
  US_SLOTS: [
    { zone: "GK", home: { col: 1, row: 4, ox: 0, oy: 10 }, push: { col: 1, row: 4, ox: 0, oy: 10 } },
    { zone: "DEF", home: { col: 0, row: 3, ox: -14, oy: 6 }, push: { col: 0, row: 3, ox: -16, oy: 0 } },
    { zone: "DEF", home: { col: 2, row: 3, ox: 14, oy: 6 }, push: { col: 2, row: 3, ox: 16, oy: 0 } },
    { zone: "MID", home: { col: 1, row: 3, ox: 0, oy: -18 }, push: { col: 1, row: 2, ox: 12, oy: 8 } },
    { zone: "WING", home: { col: 0, row: 3, ox: -6, oy: -22 }, push: { col: 0, row: 1, ox: -12, oy: 6 } },
    { zone: "FWD", home: { col: 1, row: 2, ox: 0, oy: 16 }, push: { col: 1, row: 1, ox: -10, oy: 4 } },
  ],
  OPP_SLOTS: [
    { zone: "GK", home: { col: 1, row: 0, ox: 0, oy: -10 }, push: { col: 1, row: 0, ox: 0, oy: -10 } },
    { zone: "DEF", home: { col: 0, row: 1, ox: -14, oy: -6 }, push: { col: 0, row: 1, ox: -16, oy: 0 } },
    { zone: "DEF", home: { col: 2, row: 1, ox: 14, oy: -6 }, push: { col: 2, row: 1, ox: 16, oy: 0 } },
    { zone: "MID", home: { col: 1, row: 1, ox: 0, oy: 18 }, push: { col: 1, row: 2, ox: -12, oy: -8 } },
    { zone: "WING", home: { col: 2, row: 1, ox: 6, oy: 22 }, push: { col: 2, row: 3, ox: 12, oy: -6 } },
    { zone: "FWD", home: { col: 1, row: 2, ox: 0, oy: -16 }, push: { col: 1, row: 3, ox: 10, oy: -4 } },
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
    const pitchBottom = Math.floor(H * 0.56);
    const padX = 22;
    const padY = 52;
    const gw = W - padX * 2;
    const gh = pitchBottom - padY - 10;
    this.L = {
      W,
      H,
      pitchBottom,
      uiTop: pitchBottom + 4,
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

  slotWorld(col, row, ox, oy) {
    const p = this.cellCenter(col, row);
    return { x: p.x + (ox || 0), y: p.y + (oy || 0) };
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

  applyPose(u, pose) {
    u.col = pose.col;
    u.row = pose.row;
    u.ox = pose.ox || 0;
    u.oy = pose.oy || 0;
  },

  makeTeam(side, slots) {
    return slots.map((s, i) => {
      const home = s.home;
      const push = s.push;
      const p = this.slotWorld(home.col, home.row, home.ox, home.oy);
      return {
        side,
        index: i,
        zone: s.zone,
        home: { ...home },
        push: { ...push },
        col: home.col,
        row: home.row,
        ox: home.ox || 0,
        oy: home.oy || 0,
        card: null,
        px: p.x,
        py: p.y,
        facing: side === "us" ? -Math.PI / 2 : Math.PI / 2,
        arm: Math.random() * 6,
        act: null,
        actT: 0,
        lungeX: 0,
        lungeY: 0,
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
    const mid = this.cellCenter(1, 2);
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
      ball: { col: 1, row: 2, owner: null, flying: null, x: mid.x, y: mid.y },
      fx: [],
      log: [],
      subline: "Своя половина · карта → слот (6/6)",
      banner: null,
      bannerT: 0,
      bannerColor: "#fff",
      pulse: 0,
      thinkT: 0,
      beatT: 0,
      spreadT: 0,
      segmentT: 0,
      timeScale: 1,
      note: "6v6 · колода 18 · витрина 3 · скамейка 7",
      lastResult: null,
      lastPassFrom: null,
      lastPassTo: null,
      passStreak: 0,
      pendingShot: null,
    };
  },

  makeBag(deck) {
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
        s.bannerT = 0.9;
        s.subline = up.name + " · " + up.amp;
      }
      if (!did) break;
    }
    return merged;
  },

  unitTarget(u) {
    return this.slotWorld(u.col, u.row, u.ox, u.oy);
  },

  snapUnit(u) {
    const p = this.unitTarget(u);
    u.px = p.x;
    u.py = p.y;
    u.lungeX = 0;
    u.lungeY = 0;
  },

  placeOn(u, card) {
    u.card = card;
    this.applyPose(u, u.home);
    this.snapUnit(u);
    u.act = null;
    u.actT = 0;
  },

  resetToHome(s) {
    for (const u of [...s.ours, ...s.opp]) {
      this.applyPose(u, u.home);
      if (u.card) this.snapUnit(u);
    }
  },

  beginSpread(s) {
    for (const u of this.units(s)) {
      this.applyPose(u, u.push);
      // px/py remain at home — update() lerps toward push
    }
    s.spreadT = 1.15;
    s.beatT = 1.15;
    s.ball.owner = null;
    const mid = this.cellCenter(1, 2);
    s.ball.x = mid.x;
    s.ball.y = mid.y;
    s.ball.col = 1;
    s.ball.row = 2;
    s.banner = "СВИСТОК";
    s.bannerColor = "#e2e8f0";
    s.bannerT = 0.9;
    this.pushLog(s, "Свисток · разбежка, команды пересекаются");
  },

  finishKickoff(s) {
    const mid = s.ours.find((u) => u.card && u.zone === "MID") || s.ours.find((u) => u.card);
    if (mid) {
      this.giveBall(s, mid, true);
      this.pushLog(s, "Мяч · " + mid.card.name);
    }
    s.beatT = 0.55;
    s.thinkT = 0.55;
  },

  spawnFx(s, kind, x, y, extra) {
    const life =
      { pass: 0.55, cross: 0.7, tackle: 0.65, intercept: 0.65, shot: 0.7, save: 0.7, goal: 1.1, mark: 0.5 }[kind] || 0.45;
    s.fx.push(Object.assign({ kind, x, y, t: life, life }, extra || {}));
  },
  pushLog(s, text) {
    s.log.unshift(text);
    if (s.log.length > 6) s.log.pop();
    s.subline = text;
  },
  beat(s, t) {
    s.beatT = Math.max(s.beatT || 0, t);
  },

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
    const cells = [];
    const steps = Math.max(Math.abs(b.col - a.col), Math.abs(b.row - a.row));
    for (let i = 1; i < steps; i++) {
      cells.push({
        col: a.col + Math.round(((b.col - a.col) * i) / steps),
        row: a.row + Math.round(((b.row - a.row) * i) / steps),
      });
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
    const attackDepth = u.side === "us" ? 2 - u.row : u.row - 2;
    if (attackDepth < 0) base.shoot = 0;
    else base.shoot = (base.shoot || 0) + 1 + attackDepth * 2;
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

  passProgress(owner, target) {
    if (owner.side === "us") return owner.row - target.row;
    return target.row - owner.row;
  },

  passTargets(s, owner, { cross = false, clear = false } = {}) {
    const mates = this.teammates(s, owner.side).filter((u) => u !== owner && u.card);
    const last = s.lastPassFrom;
    const banned = new Set();
    if (last) banned.add(last);
    if (s.lastPassTo && s.lastPassFrom === owner) banned.add(s.lastPassTo);

    const inReach = (m) => {
      const dc = Math.abs(m.col - owner.col);
      const dr = Math.abs(m.row - owner.row);
      if (clear || cross) return dc + dr <= 3 && this.passProgress(owner, m) >= 0;
      return dc <= 1 && dr <= 1 && !(dc === 0 && dr === 0);
    };

    let targets = mates.filter((m) => inReach(m) && !banned.has(m));
    if (cross) {
      const air = mates.filter((m) => this.passProgress(owner, m) >= 0 && !banned.has(m));
      if (air.length) targets = air;
    }
    if (!targets.length) targets = mates.filter((m) => inReach(m) && m !== last);
    targets.sort((a, b) => {
      const pa = this.passProgress(owner, a);
      const pb = this.passProgress(owner, b);
      let sa = a.card.pas + pa * 3 + (a.zone === "FWD" ? 2 : 0) + (cross && a.zone === "FWD" ? 3 : 0);
      let sb = b.card.pas + pb * 3 + (b.zone === "FWD" ? 2 : 0) + (cross && b.zone === "FWD" ? 3 : 0);
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

  giveBall(s, unit, snap) {
    s.ball.owner = unit;
    s.ball.col = unit.col;
    s.ball.row = unit.row;
    s.ball.flying = null;
    if (snap) {
      s.ball.x = unit.px;
      s.ball.y = unit.py - 14;
    }
  },

  launchBall(s, x1, y1, dur, meta) {
    s.ball.owner = null;
    s.ball.flying = Object.assign(
      {
        x0: s.ball.x,
        y0: s.ball.y,
        x1,
        y1,
        t: dur,
        life: dur,
        arc: 0,
        checked: false,
      },
      meta || {}
    );
  },

  faceToward(u, x, y) {
    u.facing = Math.atan2(y - u.py, x - u.px);
  },

  tryTackle(s, defender, owner, adjacent) {
    const same = defender.col === owner.col && defender.row === owner.row;
    if (!same && !adjacent) return false;
    const w = this.weightsFor(defender, s);
    if ((w.tackle || 0) < 1) return false;
    let chance =
      (same ? 0.34 : 0.05 + Math.min(0.1, (s.passStreak || 0) * 0.03)) +
      defender.card.def * 0.03 +
      ((defender.card.stars || 1) - 1) * 0.05 -
      owner.card.pac * 0.02;
    if (adjacent && (w.tackle || 0) < 2 && (s.passStreak || 0) < 2) return false;
    if (Math.random() > Math.min(same ? 0.68 : 0.32, chance)) return false;

    defender.act = "tackle";
    defender.actT = 0.55;
    this.faceToward(defender, owner.px, owner.py);
    defender.lungeX = (owner.px - defender.px) * 0.35;
    defender.lungeY = (owner.py - defender.py) * 0.35;
    owner.act = "stumble";
    owner.actT = 0.45;
    this.spawnFx(s, "tackle", (defender.px + owner.px) / 2, (defender.py + owner.py) / 2, {
      color: this.TACTIC_COLOR[defender.card.tactic],
    });
    this.giveBall(s, defender, false);
    s.lastPassFrom = null;
    s.lastPassTo = null;
    s.passStreak = 0;
    this.pushLog(s, "Отбор · " + defender.card.name + " (" + defender.card.amp + ")");
    this.beat(s, 0.85);
    return true;
  },

  pickInterceptor(s, from, to, passerSide) {
    const path = this.pathCells(from, to);
    path.push({ col: to.col, row: to.row });
    const seen = new Set();
    const cand = [];
    for (const cell of path) {
      const key = cell.col + "," + cell.row;
      if (seen.has(key)) continue;
      seen.add(key);
      for (const f of this.atCell(s, cell.col, cell.row).filter((u) => u.side !== passerSide && u.card)) {
        const w = this.weightsFor(f, s);
        const atRecv = f.col === to.col && f.row === to.row;
        const chance = (atRecv ? 0.15 : 0.09) + f.card.def * 0.02 + (w.intercept || 0) * 0.04;
        if (Math.random() < Math.min(0.38, chance)) cand.push(f);
      }
    }
    return cand[0] || null;
  },

  doPass(s, owner, cross, clear) {
    const targets = this.passTargets(s, owner, { cross: !!cross, clear: !!clear });
    if (!targets.length) return false;
    const target = targets[0];
    const kind = cross ? "cross" : clear ? "clear" : "pass";
    owner.act = kind === "clear" ? "pass" : kind;
    owner.actT = 0.4;
    this.faceToward(owner, target.px, target.py);
    owner.lungeX = Math.cos(owner.facing) * 6;
    owner.lungeY = Math.sin(owner.facing) * 6;
    this.spawnFx(s, cross ? "cross" : "pass", owner.px, owner.py, { x2: target.px, y2: target.py });

    const prog = this.passProgress(owner, target);
    s.lastPassFrom = owner;
    s.lastPassTo = target;
    if (prog > 0) s.passStreak = 0;
    else s.passStreak = (s.passStreak || 0) + 1;

    const dist = Math.hypot(target.px - owner.px, target.py - owner.py);
    const dur = Math.max(0.35, Math.min(0.85, dist / 220)) * (cross ? 1.25 : 1);
    const label = (cross ? "Навес · " : clear ? "Вынос · " : "Пас · ") + owner.card.name + " → " + target.card.name;
    this.pushLog(s, label);
    this.beat(s, dur + 0.35);

    const thief = this.pickInterceptor(s, owner, target, owner.side);
    this.launchBall(s, target.px, target.py - 12, dur, {
      arc: cross ? 28 : clear ? 18 : 8,
      to: target,
      thief,
      label,
      kind,
    });
    return true;
  },

  doShoot(s, owner) {
    owner.act = "shot";
    owner.actT = 0.5;
    const goalRow = owner.side === "us" ? 0 : 4;
    const goal = this.cellCenter(1, goalRow);
    this.faceToward(owner, goal.x, goal.y);
    owner.lungeX = Math.cos(owner.facing) * 10;
    owner.lungeY = Math.sin(owner.facing) * 10;
    this.spawnFx(s, "shot", owner.px, owner.py, { x2: goal.x, y2: goal.y, color: "#fde68a" });

    const depth = owner.side === "us" ? 2 - owner.row : owner.row - 2;
    const chance =
      0.18 +
      owner.card.sht * 0.045 +
      ((owner.card.stars || 1) - 1) * 0.06 +
      Math.max(0, depth) * 0.06 +
      (owner.card.amp === "Poacher" ? 0.08 : 0);
    s.pendingShot = { who: owner.side, chance: Math.min(0.68, chance), shooter: owner.card };
    s.lastPassFrom = null;
    s.lastPassTo = null;
    s.passStreak = 0;
    this.pushLog(s, "Удар · " + owner.card.name + " (" + owner.card.amp + ")");
    const dur = 0.55;
    this.beat(s, dur + 0.2);
    this.launchBall(s, goal.x, goal.y, dur, { arc: 22, shot: true, side: owner.side });
    return true;
  },

  resolveShot(s) {
    const p = s.pendingShot;
    if (!p) return;
    s.pendingShot = null;
    const gkSide = p.who === "us" ? "opp" : "us";
    const gk = this.teammates(s, gkSide).find((u) => u.zone === "GK");
    const box = this.atCell(s, 1, p.who === "us" ? 0 : 4).filter((u) => u.side !== p.who);

    if (box.length && Math.random() < 0.22) {
      const b = box[0];
      b.act = "tackle";
      b.actT = 0.5;
      this.spawnFx(s, "tackle", b.px, b.py, { color: "#a78bfa" });
      this.giveBall(s, b, false);
      this.pushLog(s, "Блок · " + b.card.name);
      s.banner = "БЛОК";
      s.bannerColor = "#a78bfa";
      s.bannerT = 1.0;
      this.beat(s, 1.0);
      return;
    }
    if (Math.random() < p.chance) {
      if (p.who === "us") s.myGoals += 1;
      else s.oppGoals += 1;
      s.lastScorer = p.who;
      s.banner = "ГОООЛ!";
      s.bannerColor = "#fbbf24";
      s.bannerT = 1.6;
      const g = this.cellCenter(1, p.who === "us" ? 0 : 4);
      this.spawnFx(s, "goal", g.x, g.y);
      this.pushLog(s, "Гол · " + p.shooter.name);
      this.beat(s, 1.5);
      s.restartKick = 1.4;
    } else if (gk && Math.random() < 0.6) {
      gk.act = "save";
      gk.actT = 0.65;
      gk.lungeX = (s.ball.x - gk.px) * 0.2;
      gk.lungeY = (s.ball.y - gk.py) * 0.2;
      this.spawnFx(s, "save", gk.px, gk.py, { color: "#c4b5fd" });
      this.giveBall(s, gk, false);
      s.banner = "СЕЙВ";
      s.bannerColor = "#c4b5fd";
      s.bannerT = 1.15;
      this.pushLog(s, "Сейв · " + gk.card.name);
      this.beat(s, 1.15);
    } else {
      s.banner = Math.random() < 0.5 ? "МИМО" : "ШТАНГА";
      s.bannerColor = "#94a3b8";
      s.bannerT = 1.0;
      if (gk) this.giveBall(s, gk, false);
      this.pushLog(s, s.banner);
      this.beat(s, 1.0);
    }
  },

  afterGoalRestart(s) {
    s.restartKick = 0;
    for (const u of this.units(s)) {
      this.applyPose(u, u.push);
      this.snapUnit(u);
    }
    const kickSide = s.lastScorer === "us" ? "opp" : "us";
    const m =
      this.teammates(s, kickSide).find((u) => u.zone === "MID") || this.teammates(s, kickSide)[0];
    const center = this.cellCenter(1, 2);
    s.ball.x = center.x;
    s.ball.y = center.y;
    if (m) this.giveBall(s, m, true);
    this.pushLog(s, "Центр · снова в игре");
    this.beat(s, 0.7);
  },

  simTick(s) {
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
          owner.actT = 0.4;
          this.pushLog(s, "Контроль · " + owner.card.name);
          this.beat(s, 0.45);
        }
        return;
      }
      if (act === "dribble" || act === "hold") {
        owner.act = "dribble";
        owner.actT = 0.45;
        owner.lungeX = Math.cos(owner.facing) * 4;
        owner.lungeY = Math.sin(owner.facing) * 4;
        s.passStreak = (s.passStreak || 0) + 1;
        this.pushLog(s, "Контроль · " + owner.card.name);
        this.beat(s, 0.5);
        return;
      }
      if (!this.doPass(s, owner, false, false)) {
        if (attackDepth >= 0) this.doShoot(s, owner);
        else if (!this.doPass(s, owner, false, true)) {
          owner.act = "dribble";
          owner.actT = 0.4;
          this.pushLog(s, "Контроль · " + owner.card.name);
          this.beat(s, 0.45);
        }
      }
      return;
    }

    const here = this.atCell(s, s.ball.col, s.ball.row).filter((u) => u.card);
    if (here.length) {
      here.sort((a, b) => b.card.pac - a.card.pac);
      this.giveBall(s, here[0], false);
      s.passStreak = 0;
      this.pushLog(s, "Подбор · " + here[0].card.name);
      this.beat(s, 0.4);
    }
  },

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

  hitUnit(u, tap) {
    return Math.hypot(tap.x - u.px, tap.y - u.py) < 30;
  },

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
        if (!this.hitUnit(u, tap) && !(
          tap.x >= u.px - this.L.cellW * 0.35 &&
          tap.x <= u.px + this.L.cellW * 0.35 &&
          tap.y >= u.py - this.L.cellH * 0.35 &&
          tap.y <= u.py + this.L.cellH * 0.35
        )) continue;
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
      s.deck = s.poolNames.map((name) => this.mint(this.CATALOG.find((c) => c.name === name), 1));
      s.bag = this.makeBag(s.deck);
      s.coins = 10;
      s.phase = "shop";
      this.refreshShop(s, api);
      s.reroll.x = 14;
      s.sell.x = api.w - 124;
      s.start.label = "В бой!";
      s.note = "Покупки → скамейка → слот на своей половине";
      s.subline = "Магазин · ролл из колоды 18";
    }
    const tc = this.tacticCount(s.ours);
    api.setHud(
      "Своя половина " +
        n +
        "/" +
        this.FIELD +
        " · " +
        (tc.map((t) => t.id.slice(0, 4) + "×" + t.n).join(" ") || "нет×2") +
        " · " +
        s.note
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
        if (!this.hitUnit(u, tap)) continue;
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
            if (a.card) {
              this.applyPose(a, a.home);
              this.snapUnit(a);
            }
            if (u.card) {
              this.applyPose(u, u.home);
              this.snapUnit(u);
            }
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
        s.note = "Нужно 6/6 на своей половине";
        return;
      }
      this.startFight(s, api);
    }
    const tc = this.tacticCount(s.ours);
    api.setHud(
      "🪙" +
        s.coins +
        " · скамейка " +
        s.bench.length +
        "/" +
        this.BENCH_MAX +
        " · [" +
        (tc.map((t) => this.TACTIC_RU[t.id] + "×" + t.n).join(", ") || "нет×2") +
        "] · " +
        s.note
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
    s.segmentT = 28;
    s.thinkT = 99;
    s.pendingShot = null;
    s.restartKick = 0;
    s.lastScorer = null;
    // вернуть визуально на home, затем разбежка на push
    this.resetToHome(s);
    this.beginSpread(s);
  },

  enterShop(s, api) {
    s.phase = "shop";
    s.ball.owner = null;
    s.ball.flying = null;
    s.pendingShot = null;
    s.selected = null;
    s.spreadT = 0;
    s.beatT = 0;
    s.restartKick = 0;
    s.speed.x = -999;
    s.reroll.x = 14;
    s.sell.x = api.w - 124;
    s.start.label = s.round >= this.ROUNDS ? "Итог" : "В бой!";
    s.start.color = "#3dd68c";
    s.coins += 4 + Math.min(4, (s.coins / 10) | 0);
    this.refreshShop(s, api);
    s.note = "Своя половина · скамейка → слот";
    this.resetToHome(s);
  },

  updateBallFlight(s, dts) {
    const f = s.ball.flying;
    if (!f) return;
    f.t -= dts;
    const u = 1 - Math.max(0, f.t) / f.life;
    const e = u * u * (3 - 2 * u);
    s.ball.x = f.x0 + (f.x1 - f.x0) * e;
    s.ball.y = f.y0 + (f.y1 - f.y0) * e - Math.sin(u * Math.PI) * (f.arc || 0);

    // перехват на середине полёта
    if (!f.checked && u >= 0.45 && f.thief) {
      f.checked = true;
      const th = f.thief;
      th.act = "intercept";
      th.actT = 0.55;
      th.lungeX = (s.ball.x - th.px) * 0.4;
      th.lungeY = (s.ball.y - th.py) * 0.4;
      this.spawnFx(s, "intercept", th.px, th.py, { color: "#38bdf8" });
      this.launchBall(s, th.px, th.py - 12, 0.28, { arc: 4, to: th, steal: true });
      s.lastPassFrom = null;
      s.lastPassTo = null;
      s.passStreak = 0;
      this.pushLog(s, "Перехват · " + th.card.name);
      this.beat(s, 0.9);
      return;
    }

    if (f.t > 0) return;

    s.ball.flying = null;
    s.ball.x = f.x1;
    s.ball.y = f.y1;
    if (f.shot) {
      this.resolveShot(s);
      return;
    }
    if (f.to && f.to.card) {
      this.giveBall(s, f.to, false);
      if (f.steal) this.beat(s, 0.55);
      else this.beat(s, 0.4);
    }
  },

  update(s, api, dt) {
    this.syncLayout(api);
    const dts = dt * (s.phase === "fight" ? s.timeScale : 1);
    s.pulse += dts;
    if (s.bannerT > 0) s.bannerT -= dts;
    if (s.beatT > 0) s.beatT -= dts;
    for (const f of s.fx) f.t -= dts;
    s.fx = s.fx.filter((f) => f.t > 0);

    for (const u of this.units(s)) {
      u.arm += dts * (u.act ? 14 : 7);
      if (u.actT > 0) u.actT -= dts;
      else {
        u.act = null;
        u.lungeX *= Math.max(0, 1 - dts * 8);
        u.lungeY *= Math.max(0, 1 - dts * 8);
      }
      const p = this.unitTarget(u);
      const idleX = s.phase === "fight" ? Math.sin(s.pulse * 2.1 + u.arm) * 2.2 : 0;
      const idleY = s.phase === "fight" ? Math.cos(s.pulse * 1.7 + u.index) * 1.6 : 0;
      const tx = p.x + idleX + (u.lungeX || 0);
      const ty = p.y + idleY + (u.lungeY || 0);
      const k = Math.min(1, (s.spreadT > 0 ? 3.2 : 5.5) * dts);
      u.px += (tx - u.px) * k;
      u.py += (ty - u.py) * k;
      if (s.phase === "fight" && !u.act) {
        u.facing = u.side === "us" ? -Math.PI / 2 : Math.PI / 2;
      }
    }

    if (s.ball.flying) this.updateBallFlight(s, dts);
    else if (s.ball.owner) {
      const o = s.ball.owner;
      s.ball.x += (o.px - s.ball.x) * Math.min(1, dts * 8);
      s.ball.y += (o.py - 14 - s.ball.y) * Math.min(1, dts * 8);
      s.ball.col = o.col;
      s.ball.row = o.row;
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

    if (s.spreadT > 0) {
      s.spreadT -= dts;
      if (s.spreadT <= 0) {
        s.spreadT = 0;
        this.finishKickoff(s);
      }
      api.setHud(s.myGoals + ":" + s.oppGoals + " · разбежка…");
      return;
    }

    if (s.restartKick > 0) {
      s.restartKick -= dts;
      if (s.restartKick <= 0) this.afterGoalRestart(s);
      api.setHud(s.myGoals + ":" + s.oppGoals + " · " + s.minute + "'");
      return;
    }

    s.segmentT -= dts;
    s.thinkT -= dts;
    if (s.thinkT <= 0 && s.beatT <= 0 && !s.ball.flying && !s.pendingShot) {
      this.simTick(s);
      s.thinkT = 0.85 + Math.random() * 0.45;
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
  roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  },

  drawPitch(ctx, s) {
    const L = this.L;
    // atmosphere
    const g = ctx.createLinearGradient(0, 0, 0, L.H);
    g.addColorStop(0, "#0a1520");
    g.addColorStop(0.45, "#0d1f18");
    g.addColorStop(1, "#081018");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, L.W, L.H);

    const px = L.originX;
    const py = L.originY;
    const pw = L.cellW * this.COLS;
    const ph = L.cellH * this.ROWS;

    // pitch body
    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        const x = px + c * L.cellW;
        const y = py + r * L.cellH;
        const stripe = (r + c) % 2;
        ctx.fillStyle = stripe ? "#1b5a36" : "#174e2f";
        ctx.fillRect(x, y, L.cellW + 0.5, L.cellH + 0.5);
      }
    }

    // own-half tint during lineup/shop
    if (s.phase !== "fight") {
      ctx.fillStyle = "rgba(61, 214, 140, 0.10)";
      ctx.fillRect(px, py + L.cellH * 2.5, pw, L.cellH * 2.5);
      ctx.fillStyle = "rgba(248, 113, 113, 0.08)";
      ctx.fillRect(px, py, pw, L.cellH * 2.5);
      ctx.fillStyle = "#86efac";
      ctx.font = "bold 12px 'Trebuchet MS', 'Segoe UI', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("ВАША ПОЛОВИНА", px + 8, py + ph - 10);
      ctx.fillStyle = "#fca5a5";
      ctx.textAlign = "right";
      ctx.fillText("СОПЕРНИК", px + pw - 8, py + 16);
    }

    // lines
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(px, py, pw, ph);

    ctx.strokeStyle = "rgba(255,255,255,0.16)";
    ctx.lineWidth = 1;
    for (let c = 1; c < this.COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(px + c * L.cellW, py);
      ctx.lineTo(px + c * L.cellW, py + ph);
      ctx.stroke();
    }
    for (let r = 1; r < this.ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(px, py + r * L.cellH);
      ctx.lineTo(px + pw, py + r * L.cellH);
      ctx.stroke();
    }

    // halfway
    const midY = py + 2.5 * L.cellH;
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, midY);
    ctx.lineTo(px + pw, midY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px + pw / 2, midY, Math.min(28, L.cellW * 0.28), 0, Math.PI * 2);
    ctx.stroke();

    // goals
    ctx.fillStyle = "rgba(226,232,240,0.2)";
    ctx.fillRect(px + L.cellW * 0.7, py - 6, L.cellW * 0.6, 8);
    ctx.fillRect(px + L.cellW * 0.7, py + ph - 2, L.cellW * 0.6, 8);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.strokeRect(px + L.cellW * 0.55, py, L.cellW * 0.9, L.cellH * 0.55);
    ctx.strokeRect(px + L.cellW * 0.55, py + ph - L.cellH * 0.55, L.cellW * 0.9, L.cellH * 0.55);

    // empty slots
    if (s.phase !== "fight") {
      for (const u of s.ours) {
        if (u.card) continue;
        const p = this.unitTarget(u);
        ctx.strokeStyle = "rgba(134,239,172,0.45)";
        ctx.lineWidth = 2;
        this.roundRect(ctx, p.x - 28, p.y - 20, 56, 40, 8);
        ctx.stroke();
        ctx.fillStyle = "rgba(226,232,240,0.7)";
        ctx.font = "bold 12px 'Trebuchet MS', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(u.zone, p.x, p.y + 4);
      }
    }
  },

  drawPlayer(ctx, u, hot, pulse) {
    if (!u.card) return;
    const c = u.card;
    const isOpp = u.side === "opp";
    const r = 14 + ((c.stars || 1) - 1) * 2;
    const bob = Math.sin(pulse * 8 + u.arm) * (u.act ? 0.4 : 1.4);
    const x = u.px;
    const y = u.py + bob;
    const ang = u.facing;
    const tac = this.TACTIC_COLOR[c.tactic];

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.32)";
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.85, r * 0.85, 3.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // limbs
    const swing = Math.sin(u.arm) * (u.act === "tackle" || u.act === "shot" ? 1.1 : 0.4);
    ctx.strokeStyle = isOpp ? "#fecaca" : "#bbf7d0";
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      const a = ang + side * (0.9 + swing * 0.5);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * (r + 7), y + Math.sin(a) * (r + 7));
      ctx.stroke();
    }

    // body
    const body = ctx.createRadialGradient(x - 3, y - 4, 2, x, y, r);
    body.addColorStop(0, isOpp ? "#ef4444" : "#22c55e");
    body.addColorStop(1, isOpp ? "#991b1b" : "#166534");
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.strokeStyle = hot ? "#fff" : tac;
    ctx.lineWidth = hot ? 3.2 : 2.2;
    ctx.stroke();

    // head
    ctx.beginPath();
    ctx.arc(x + Math.cos(ang) * 2, y + Math.sin(ang) * 2 - r * 0.15, r * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = "#f5d0a9";
    ctx.fill();

    // action ring
    if (u.act && u.actT > 0) {
      ctx.strokeStyle = tac;
      ctx.globalAlpha = Math.min(1, u.actT * 2);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, r + 6 + (0.5 - u.actT) * 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px 'Trebuchet MS', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(c.name, x, y - r - 8);
    ctx.fillStyle = tac;
    ctx.font = "bold 10px 'Trebuchet MS', sans-serif";
    ctx.fillText(c.amp, x, y + r + 13);
    if ((c.stars || 1) > 1) {
      ctx.fillStyle = "#fde68a";
      ctx.fillText(this.starLabel(c), x, y + r + 25);
    }
  },

  drawFx(ctx, fx) {
    const a = Math.max(0, fx.t / fx.life);
    const k = 1 - a;
    ctx.save();
    ctx.globalAlpha = a;
    if (fx.kind === "pass" || fx.kind === "cross") {
      ctx.strokeStyle = fx.kind === "cross" ? "#86efac" : "rgba(255,255,255,0.9)";
      ctx.setLineDash(fx.kind === "cross" ? [3, 7] : [6, 5]);
      ctx.lineWidth = fx.kind === "cross" ? 3 : 2.2;
      ctx.beginPath();
      ctx.moveTo(fx.x, fx.y);
      ctx.lineTo(fx.x2, fx.y2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (fx.kind === "tackle") {
      ctx.strokeStyle = fx.color || "#f97316";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 10 + k * 18, -1, 1);
      ctx.stroke();
    } else if (fx.kind === "intercept") {
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fx.x - 14, fx.y);
      ctx.lineTo(fx.x + 14, fx.y);
      ctx.moveTo(fx.x, fx.y - 14);
      ctx.lineTo(fx.x, fx.y + 14);
      ctx.stroke();
    } else if (fx.kind === "shot") {
      ctx.strokeStyle = fx.color || "#fde68a";
      ctx.lineWidth = 4;
      const t = Math.min(1, k * 1.4);
      ctx.beginPath();
      ctx.moveTo(fx.x, fx.y);
      ctx.lineTo(fx.x + (fx.x2 - fx.x) * t, fx.y + (fx.y2 - fx.y) * t);
      ctx.stroke();
    } else if (fx.kind === "save") {
      ctx.strokeStyle = "#c4b5fd";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 12 + k * 20, 0, Math.PI * 2);
      ctx.stroke();
    } else if (fx.kind === "goal") {
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 22px 'Trebuchet MS', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("ГОЛ", fx.x, fx.y - k * 24);
    }
    ctx.restore();
  },

  drawChip(ctx, x, y, w, h, card, selected, price) {
    ctx.save();
    this.roundRect(ctx, x, y, w, h, 8);
    ctx.fillStyle = selected ? "#1e3a8a" : "#123524";
    ctx.fill();
    ctx.strokeStyle = selected ? "#fff" : this.TACTIC_COLOR[card.tactic];
    ctx.lineWidth = selected ? 2.4 : 1.6;
    ctx.stroke();
    ctx.fillStyle = this.ROLE_COLOR[card.role];
    ctx.fillRect(x + 3, y + 3, w - 6, 5);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px 'Trebuchet MS', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(card.name, x + w / 2, y + 22);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "9px 'Trebuchet MS', sans-serif";
    ctx.fillText(card.amp, x + w / 2, y + 34);
    ctx.fillStyle = this.TACTIC_COLOR[card.tactic];
    ctx.font = "bold 9px 'Trebuchet MS', sans-serif";
    const tn = this.TACTIC_RU[card.tactic];
    ctx.fillText(tn.length > 10 ? tn.slice(0, 9) + "…" : tn, x + w / 2, y + h - 8);
    if (price != null) {
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 12px 'Trebuchet MS', sans-serif";
      ctx.fillText(price + "🪙", x + w / 2, y + h - 20);
    }
    ctx.restore();
  },

  draw(s, api) {
    const { ctx } = api;
    this.syncLayout(api);
    const L = this.L;
    this.drawPitch(ctx, s);

    // scoreboard
    this.roundRect(ctx, L.W / 2 - 108, 6, 216, 40, 10);
    ctx.fillStyle = "rgba(0,0,0,0.62)";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 18px 'Trebuchet MS', 'Segoe UI', sans-serif";
    ctx.textAlign = "center";
    const title =
      s.phase === "lineup" ? "РАССТАНОВКА" : s.phase === "shop" ? "МАГАЗИН" : s.myGoals + " : " + s.oppGoals;
    ctx.fillText(title, L.W / 2, 24);
    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 12px 'Trebuchet MS', sans-serif";
    ctx.fillText(s.phase === "fight" ? s.minute + "'" : "🪙" + s.coins, L.W / 2, 40);

    const tc = this.tacticCount(s.ours);
    let cx = 10;
    for (const t of tc.slice(0, 3)) {
      const label = this.TACTIC_RU[t.id] + "×" + t.n;
      const tw = 16 + label.length * 6.2;
      this.roundRect(ctx, cx, L.pitchBottom - 18, tw, 15, 4);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fill();
      ctx.strokeStyle = this.TACTIC_COLOR[t.id];
      ctx.stroke();
      ctx.fillStyle = this.TACTIC_COLOR[t.id];
      ctx.font = "bold 10px 'Trebuchet MS', sans-serif";
      ctx.fillText(label, cx + tw / 2, L.pitchBottom - 6);
      cx += tw + 4;
    }

    const list = this.units(s).sort((a, b) => a.py - b.py);
    for (const u of list) this.drawPlayer(ctx, u, s.ball.owner === u, s.pulse);

    // ball with soft shadow
    if (s.phase === "fight" || s.ball.owner || s.ball.flying) {
      const bx = s.ball.x || L.W / 2;
      const by = s.ball.y || L.originY + L.cellH * 2.5;
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(bx, by + 5, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fffef2";
      ctx.beginPath();
      ctx.arc(bx, by, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    for (const f of s.fx) this.drawFx(ctx, f);

    if (s.subline) {
      this.roundRect(ctx, 12, L.pitchBottom + 2, L.W - 24, 22, 6);
      ctx.fillStyle = "rgba(0,0,0,0.58)";
      ctx.fill();
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "13px 'Trebuchet MS', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.subline, L.W / 2, L.pitchBottom + 17);
    }

    if (s.phase === "lineup") {
      ctx.fillStyle = "rgba(0,0,0,0.66)";
      ctx.fillRect(0, L.uiTop, L.W, L.H - L.uiTop);
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 13px 'Trebuchet MS', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Колода → слот на СВОЕЙ половине (6/6)", 12, L.uiTop + 18);
      s.deck.forEach((c, i) => {
        const r = this.deckRect(i, api);
        this.drawChip(ctx, r.x, r.y, r.w, r.h, c, s.selected?.from === "deck" && s.selected.index === i, null);
      });
    }

    if (s.phase === "shop") {
      ctx.fillStyle = "rgba(0,0,0,0.66)";
      ctx.fillRect(0, L.uiTop, L.W, L.H - L.uiTop);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12px 'Trebuchet MS', sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Скамейка " + s.bench.length + "/" + this.BENCH_MAX, 12, L.uiTop + 16);
      s.bench.forEach((c, i) => {
        const r = this.benchRect(i, api);
        this.drawChip(ctx, r.x, r.y, r.w, r.h, c, s.selected?.from === "bench" && s.selected.index === i, null);
      });
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 13px 'Trebuchet MS', sans-serif";
      ctx.fillText("Витрина (равномерно из колоды)", 12, L.uiTop + 116);
      for (let i = 0; i < this.SHOP_SIZE; i++) {
        const r = this.shopRect(i, api);
        if (s.shop[i]) this.drawChip(ctx, r.x, r.y, r.w, r.h, s.shop[i].card, false, s.shop[i].price);
        else {
          this.roundRect(ctx, r.x, r.y, r.w, r.h, 8);
          ctx.fillStyle = "#334155";
          ctx.fill();
        }
      }
    }

    if (s.bannerT > 0 && s.banner) {
      this.roundRect(ctx, 36, L.originY + L.cellH * 2 - 28, L.W - 72, 52, 12);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fill();
      ctx.fillStyle = s.bannerColor;
      ctx.font = "bold 28px 'Trebuchet MS', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.banner, L.W / 2, L.originY + L.cellH * 2 + 6);
    }

    if (s.phase === "done") {
      const map = { win: ["ПОБЕДА", "#fbbf24"], lose: ["ПОРАЖЕНИЕ", "#f07178"], draw: ["НИЧЬЯ", "#94a3b8"] };
      const r = map[s.lastResult] || map.lose;
      api.drawBanner(ctx, r[0] + " " + s.myGoals + ":" + s.oppGoals, r[1]);
    }
  },
};
   