/**
 * Legends of the Pitch — Feel demo (from scratch)
 * Vector: DESIGN.md Pass-2
 * Карта = амплуа + тактика · TFT ×2/×3 · 5v5 · вся сетка · смотри матч
 */
window.FEEL_DEMOS = window.FEEL_DEMOS || {};

window.FEEL_DEMOS["legends-of-the-pitch"] = {
  hint: "5v5: расставь по всей сетке → магазин (3→★) → смотри матч. Тактики ×2/×3.",

  COLS: 3,
  ROWS: 5,
  FIELD: 5,
  DECK: 12,
  SHOP: 3,
  BENCH: 2,
  MERGE: 3,
  ROUNDS: 7,

  TACTIC: {
    Gegenpress: { ru: "Gegenpress", color: "#f97316" },
    TikiTaka: { ru: "Tiki-Taka", color: "#38bdf8" },
    ParkBus: { ru: "Park Bus", color: "#a78bfa" },
    Counter: { ru: "Counter", color: "#f472b6" },
    WingPlay: { ru: "Wing Play", color: "#4ade80" },
  },

  AMP: {
    ShotStop: { pass: 1, clear: 2, shoot: 0, tackle: 0 },
    NoNonsense: { pass: 1, clear: 3, tackle: 3, shoot: 0 },
    BallPlayCB: { pass: 3, tackle: 2, clear: 1, shoot: 0 },
    BWM: { pass: 2, tackle: 4, shoot: 1 },
    Playmaker: { pass: 5, shoot: 1, dribble: 1 },
    Winger: { cross: 4, pass: 2, shoot: 1, dribble: 2 },
    Poacher: { shoot: 5, pass: 1 },
    Target: { shoot: 2, pass: 2, hold: 3 },
    InsideFwd: { shoot: 3, pass: 2, dribble: 2 },
    Mezzala: { pass: 3, shoot: 2, dribble: 2 },
  },

  CATALOG: [
    { name: "Круз", amp: "ShotStop", tactic: "ParkBus", role: "GK", cost: 2, pac: 4, sht: 1, pas: 4, def: 9 },
    { name: "Мороз", amp: "NoNonsense", tactic: "ParkBus", role: "DEF", cost: 2, pac: 5, sht: 2, pas: 3, def: 9 },
    { name: "Брант", amp: "BallPlayCB", tactic: "TikiTaka", role: "DEF", cost: 3, pac: 5, sht: 2, pas: 8, def: 7 },
    { name: "Нова", amp: "BWM", tactic: "Gegenpress", role: "MID", cost: 2, pac: 7, sht: 3, pas: 5, def: 7 },
    { name: "Клык", amp: "BWM", tactic: "Gegenpress", role: "MID", cost: 3, pac: 7, sht: 4, pas: 6, def: 8 },
    { name: "Ила", amp: "Playmaker", tactic: "TikiTaka", role: "MID", cost: 3, pac: 6, sht: 5, pas: 8, def: 3 },
    { name: "Сато", amp: "Playmaker", tactic: "TikiTaka", role: "MID", cost: 4, pac: 6, sht: 6, pas: 9, def: 3 },
    { name: "Рей", amp: "Winger", tactic: "WingPlay", role: "WING", cost: 3, pac: 9, sht: 6, pas: 7, def: 3 },
    { name: "Рока", amp: "Winger", tactic: "WingPlay", role: "WING", cost: 4, pac: 9, sht: 6, pas: 7, def: 3 },
    { name: "Ларс", amp: "Poacher", tactic: "Counter", role: "FWD", cost: 3, pac: 8, sht: 8, pas: 3, def: 2 },
    { name: "Найт", amp: "Poacher", tactic: "Counter", role: "FWD", cost: 4, pac: 8, sht: 9, pas: 3, def: 2 },
    { name: "Кип", amp: "Target", tactic: "ParkBus", role: "FWD", cost: 2, pac: 4, sht: 6, pas: 4, def: 4 },
    { name: "Бриз", amp: "InsideFwd", tactic: "Counter", role: "WING", cost: 4, pac: 8, sht: 8, pas: 5, def: 2 },
    { name: "Юна", amp: "Mezzala", tactic: "Counter", role: "MID", cost: 5, pac: 7, sht: 7, pas: 8, def: 3 },
    { name: "Шрам", amp: "NoNonsense", tactic: "ParkBus", role: "DEF", cost: 5, pac: 5, sht: 2, pas: 4, def: 9 },
    { name: "Окафор", amp: "Target", tactic: "WingPlay", role: "FWD", cost: 3, pac: 4, sht: 7, pas: 5, def: 4 },
  ],

  // стартовые позы: обе команды уже на всей сетке
  US_FORM: [
    { zone: "GK", col: 1, row: 4 },
    { zone: "DEF", col: 0, row: 3 },
    { zone: "DEF", col: 2, row: 3 },
    { zone: "MID", col: 1, row: 2 },
    { zone: "FWD", col: 1, row: 1 },
  ],
  OPP_FORM: [
    { zone: "GK", col: 1, row: 0 },
    { zone: "DEF", col: 0, row: 1 },
    { zone: "DEF", col: 2, row: 1 },
    { zone: "MID", col: 1, row: 2 },
    { zone: "FWD", col: 1, row: 3 },
  ],

  create(api) {
    this.layout(api);
    const btns = {
      go: api.input.addButton({ x: api.w / 2 - 70, y: api.h - 68, w: 140, h: 52, label: "Далее", color: "#3dd68c" }),
      reroll: api.input.addButton({ x: 12, y: api.h - 68, w: 108, h: 52, label: "Реролл 2", color: "#64748b" }),
      sell: api.input.addButton({ x: api.w - 120, y: api.h - 68, w: 108, h: 52, label: "Продать", color: "#f07178" }),
      spd: api.input.addButton({ x: -999, y: -999, w: 60, h: 36, label: "×2", color: "#5db0ff" }),
    };
    return this.fresh(api, btns);
  },

  layout(api) {
    const W = api.w;
    const H = api.h;
    const pitchBottom = Math.floor(H * 0.55);
    const padX = 20;
    const padY = 50;
    this.L = {
      W,
      H,
      pitchBottom,
      uiTop: pitchBottom + 4,
      ox: padX,
      oy: padY,
      cw: (W - padX * 2) / this.COLS,
      ch: (pitchBottom - padY - 8) / this.ROWS,
    };
  },

  cellXY(col, row) {
    return {
      x: this.L.ox + (col + 0.5) * this.L.cw,
      y: this.L.oy + (row + 0.5) * this.L.ch,
    };
  },

  cellAt(tap) {
    const c = Math.floor((tap.x - this.L.ox) / this.L.cw);
    const r = Math.floor((tap.y - this.L.oy) / this.L.ch);
    if (c < 0 || r < 0 || c >= this.COLS || r >= this.ROWS) return null;
    return { col: c, row: r };
  },

  mint(base, stars) {
    return Object.assign({}, base, {
      uid: base.name + "_" + Math.random().toString(36).slice(2, 5),
      stars: stars || 1,
    });
  },

  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  buildDeck() {
    const pool = this.shuffle(this.CATALOG);
    const out = [];
    const tactics = new Set();
    for (const c of pool) {
      if (out.length >= this.DECK) break;
      if (tactics.size < 3 || tactics.has(c.tactic) || out.length < 8) {
        out.push(this.mint(c));
        tactics.add(c.tactic);
      }
    }
    while (out.length < this.DECK) out.push(this.mint(pool[out.length % pool.length]));
    return out;
  },

  makeSide(side, form) {
    return form.map((f, i) => {
      const p = this.cellXY(f.col, f.row);
      const ox = side === "us" ? -8 : 8;
      return {
        side,
        i,
        zone: f.zone,
        col: f.col,
        row: f.row,
        ox,
        oy: ((i % 3) - 1) * 6,
        card: null,
        x: p.x + ox,
        y: p.y,
        face: side === "us" ? -Math.PI / 2 : Math.PI / 2,
        arm: Math.random() * 5,
        act: null,
        actT: 0,
        lx: 0,
        ly: 0,
      };
    });
  },

  seedOpp(api, deck) {
    const team = this.makeSide("opp", this.OPP_FORM);
    const tags = [...new Set(deck.map((c) => c.tactic))].slice(0, 3);
    const pool = this.CATALOG.filter((c) => tags.includes(c.tactic));
    for (const u of team) {
      const cand = pool.filter((c) => c.role === u.zone);
      const base = cand.length ? api.pick(cand) : api.pick(this.CATALOG.filter((c) => c.role === u.zone));
      u.card = this.mint(base || this.CATALOG[0]);
    }
    this.packAll(team);
    return team;
  },

  packAll(units) {
    const map = new Map();
    for (const u of units) {
      const k = u.col + "," + u.row;
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(u);
    }
    for (const list of map.values()) {
      const us = list.filter((u) => u.side === "us");
      const opp = list.filter((u) => u.side === "opp");
      us.forEach((u, i) => {
        u.ox = -10;
        u.oy = (i - (us.length - 1) / 2) * 12;
      });
      opp.forEach((u, i) => {
        u.ox = 10;
        u.oy = (i - (opp.length - 1) / 2) * 12;
      });
    }
  },

  snap(u) {
    const p = this.cellXY(u.col, u.row);
    u.x = p.x + u.ox;
    u.y = p.y + u.oy;
  },

  fresh(api, btns) {
    this.layout(api);
    const deck = this.buildDeck();
    const ours = this.makeSide("us", this.US_FORM);
    const opp = this.seedOpp(api, deck);
    const mid = this.cellXY(1, 2);
    btns.reroll.x = -999;
    btns.sell.x = -999;
    btns.spd.x = -999;
    return {
      ...btns,
      phase: "lineup",
      deck,
      bag: this.makeBag(deck),
      ours,
      opp,
      bench: [],
      shop: [],
      sel: null,
      coins: 10,
      round: 0,
      minute: 0,
      gh: 0,
      ga: 0,
      ball: { x: mid.x, y: mid.y, col: 1, row: 2, owner: null, fly: null },
      fx: [],
      line: "Карта → любая клетка сетки (5/5)",
      note: "5v5 · колода 12 · витрина 3 · скамейка 2",
      banner: null,
      bannerT: 0,
      bannerC: "#fff",
      pulse: 0,
      think: 0,
      beat: 0,
      seg: 0,
      scale: 1,
      lastFrom: null,
      streak: 0,
      result: null,
      pending: null,
      restart: 0,
    };
  },

  makeBag(deck) {
    const names = [...new Set(deck.map((c) => c.name))];
    const bag = [];
    for (const n of names) for (let i = 0; i < 3; i++) bag.push(n);
    return bag;
  },

  units(s) {
    return [...s.ours, ...s.opp].filter((u) => u.card);
  },
  filled(s) {
    return s.ours.filter((u) => u.card).length;
  },
  at(s, col, row) {
    return this.units(s).filter((u) => u.col === col && u.row === row);
  },
  side(s, who) {
    return (who === "us" ? s.ours : s.opp).filter((u) => u.card);
  },

  tactics(team) {
    const c = Object.create(null);
    for (const u of team) if (u.card) c[u.card.tactic] = (c[u.card.tactic] || 0) + 1;
    return Object.entries(c)
      .filter(([, n]) => n >= 2)
      .map(([id, n]) => ({ id, n, lv: n >= 4 ? 3 : n >= 3 ? 2 : 1 }))
      .sort((a, b) => b.n - a.n);
  },

  offer(s, api) {
    if (!s.bag.length) s.bag = this.makeBag(s.deck);
    const name = api.pick(s.bag);
    const base = this.CATALOG.find((c) => c.name === name);
    return { card: this.mint(base), price: base.cost, name };
  },
  refreshShop(s, api) {
    s.shop = [];
    for (let i = 0; i < this.SHOP; i++) s.shop.push(this.offer(s, api));
  },

  tryMerge(s) {
    for (let g = 0; g < 4; g++) {
      let did = false;
      const names = new Set([
        ...s.ours.filter((u) => u.card).map((u) => u.card.name),
        ...s.bench.map((c) => c.name),
      ]);
      for (const name of names) {
        const parts = [];
        s.ours.forEach((u, i) => {
          if (u.card && u.card.name === name && u.card.stars === 1) parts.push({ w: "f", i, card: u.card });
        });
        s.bench.forEach((c, i) => {
          if (c.name === name && c.stars === 1) parts.push({ w: "b", i, card: c });
        });
        if (parts.length < this.MERGE) continue;
        const keep = parts.find((p) => p.w === "f") || parts[0];
        const take = [keep];
        for (const p of parts) if (take.length < this.MERGE && p !== keep) take.push(p);
        take
          .slice()
          .sort((a, b) => b.i - a.i)
          .forEach((p) => {
            if (p.w === "f") s.ours[p.i].card = null;
            else s.bench.splice(p.i, 1);
          });
        const up = this.mint(keep.card, 2);
        if (keep.w === "f") {
          s.ours[keep.i].card = up;
          this.snap(s.ours[keep.i]);
        } else if (s.bench.length < this.BENCH) s.bench.push(up);
        s.banner = "MERGE ★";
        s.bannerC = "#fbbf24";
        s.bannerT = 0.9;
        s.line = up.name + " ★★";
        did = true;
      }
      if (!did) break;
    }
  },

  moveTo(s, u, col, row) {
    u.col = col;
    u.row = row;
    this.packAll([...s.ours, ...s.opp]);
    this.snap(u);
  },

  log(s, t) {
    s.line = t;
  },
  beat(s, t) {
    s.beat = Math.max(s.beat, t);
  },
  fx(s, kind, x, y, extra) {
    const life = { pass: 0.5, cross: 0.65, tackle: 0.6, shot: 0.65, save: 0.7, goal: 1.0 }[kind] || 0.45;
    s.fx.push(Object.assign({ kind, x, y, t: life, life }, extra || {}));
  },

  // ——— combat helpers ———
  weights(u, s) {
    const w = Object.assign({ pass: 2, shoot: 1, tackle: 1, hold: 1 }, this.AMP[u.card.amp] || {});
    const top = this.tactics(u.side === "us" ? s.ours : s.opp)[0];
    if (top) {
      if (top.id === "Gegenpress") w.tackle = (w.tackle || 0) + 1 + top.lv;
      if (top.id === "TikiTaka") w.pass = (w.pass || 0) + 2 + top.lv;
      if (top.id === "ParkBus") {
        w.tackle = (w.tackle || 0) + 1;
        w.clear = (w.clear || 0) + 2;
        w.shoot = Math.max(0, (w.shoot || 0) - 1);
      }
      if (top.id === "Counter") w.shoot = (w.shoot || 0) + top.lv;
      if (top.id === "WingPlay") w.cross = (w.cross || 0) + 2 + top.lv;
    }
    const depth = u.side === "us" ? 2 - u.row : u.row - 2;
    if (depth < 0) w.shoot = 0;
    else w.shoot = (w.shoot || 0) + 1 + depth;
    if (s.streak >= 2) {
      w.shoot = (w.shoot || 0) + s.streak;
      w.pass = Math.max(0, (w.pass || 0) - 1);
    }
    if (u.zone === "GK") {
      w.shoot = 0;
      w.cross = 0;
      w.clear = (w.clear || 0) + 3;
    }
    return w;
  },

  pick(w) {
    let sum = 0;
    for (const k of Object.keys(w)) sum += Math.max(0, w[k] || 0);
    if (sum <= 0) return "hold";
    let r = Math.random() * sum;
    for (const k of Object.keys(w)) {
      r -= Math.max(0, w[k] || 0);
      if (r <= 0) return k;
    }
    return "hold";
  },

  fwd(a, b) {
    return a.side === "us" ? a.row - b.row : b.row - a.row;
  },

  targets(s, owner, long) {
    const mates = this.side(s, owner.side).filter((u) => u !== owner);
    const ban = new Set();
    if (s.lastFrom) ban.add(s.lastFrom);
    return mates
      .filter((m) => {
        const dc = Math.abs(m.col - owner.col);
        const dr = Math.abs(m.row - owner.row);
        if (long) return dc + dr <= 3 && this.fwd(owner, m) >= 0 && !ban.has(m);
        return dc <= 1 && dr <= 1 && (dc || dr) && !ban.has(m);
      })
      .sort((a, b) => this.fwd(owner, b) - this.fwd(owner, a) + (b.card.pas - a.card.pas) * 0.1);
  },

  give(s, u, snap) {
    s.ball.owner = u;
    s.ball.col = u.col;
    s.ball.row = u.row;
    s.ball.fly = null;
    if (snap) {
      s.ball.x = u.x;
      s.ball.y = u.y - 12;
    }
  },

  launch(s, x1, y1, dur, meta) {
    s.ball.owner = null;
    s.ball.fly = Object.assign(
      { x0: s.ball.x, y0: s.ball.y, x1, y1, t: dur, life: dur, arc: 0 },
      meta || {}
    );
  },

  face(u, x, y) {
    u.face = Math.atan2(y - u.y, x - u.x);
  },

  doPass(s, owner, cross) {
    const list = this.targets(s, owner, cross);
    if (!list.length) return false;
    const t = list[0];
    owner.act = cross ? "cross" : "pass";
    owner.actT = 0.4;
    this.face(owner, t.x, t.y);
    owner.lx = Math.cos(owner.face) * 7;
    owner.ly = Math.sin(owner.face) * 7;
    this.fx(s, cross ? "cross" : "pass", owner.x, owner.y, { x2: t.x, y2: t.y });
    s.lastFrom = owner;
    s.streak = this.fwd(owner, t) > 0 ? 0 : s.streak + 1;
    const dist = Math.hypot(t.x - owner.x, t.y - owner.y);
    const dur = Math.max(0.32, Math.min(0.8, dist / 240)) * (cross ? 1.2 : 1);
    this.log(s, (cross ? "Навес · " : "Пас · ") + owner.card.name + " → " + t.card.name);
    this.beat(s, dur + 0.35);

    // перехват?
    let thief = null;
    const path = [{ col: t.col, row: t.row }];
    for (const cell of path) {
      for (const f of this.at(s, cell.col, cell.row)) {
        if (f.side === owner.side) continue;
        const ww = this.weights(f, s);
        if (Math.random() < 0.12 + f.card.def * 0.02 + (ww.tackle || 0) * 0.02) thief = f;
      }
    }
    this.launch(s, t.x, t.y - 12, dur, { arc: cross ? 26 : 8, to: t, thief });
    return true;
  },

  doShoot(s, owner) {
    owner.act = "shot";
    owner.actT = 0.5;
    const goal = this.cellXY(1, owner.side === "us" ? 0 : 4);
    this.face(owner, goal.x, goal.y);
    owner.lx = Math.cos(owner.face) * 10;
    owner.ly = Math.sin(owner.face) * 10;
    this.fx(s, "shot", owner.x, owner.y, { x2: goal.x, y2: goal.y });
    const depth = owner.side === "us" ? 2 - owner.row : owner.row - 2;
    const chance =
      0.2 + owner.card.sht * 0.045 + (owner.card.stars - 1) * 0.06 + Math.max(0, depth) * 0.05;
    s.pending = { who: owner.side, chance: Math.min(0.65, chance), name: owner.card.name };
    s.lastFrom = null;
    s.streak = 0;
    this.log(s, "Удар · " + owner.card.name + " (" + owner.card.amp + ")");
    this.beat(s, 0.75);
    this.launch(s, goal.x, goal.y, 0.55, { arc: 20, shot: true, side: owner.side });
    return true;
  },

  resolveShot(s) {
    const p = s.pending;
    s.pending = null;
    if (!p) return;
    const gk = this.side(s, p.who === "us" ? "opp" : "us").find((u) => u.zone === "GK");
    if (Math.random() < p.chance) {
      if (p.who === "us") s.gh++;
      else s.ga++;
      s.banner = "ГОООЛ!";
      s.bannerC = "#fbbf24";
      s.bannerT = 1.5;
      this.fx(s, "goal", this.cellXY(1, p.who === "us" ? 0 : 4).x, this.cellXY(1, p.who === "us" ? 0 : 4).y);
      this.log(s, "Гол · " + p.name);
      this.beat(s, 1.4);
      s.restart = 1.35;
      s.lastScorer = p.who;
    } else if (gk && Math.random() < 0.55) {
      gk.act = "save";
      gk.actT = 0.6;
      this.fx(s, "save", gk.x, gk.y);
      this.give(s, gk, false);
      s.banner = "СЕЙВ";
      s.bannerC = "#c4b5fd";
      s.bannerT = 1.1;
      this.log(s, "Сейв · " + gk.card.name);
      this.beat(s, 1.1);
    } else {
      s.banner = Math.random() < 0.5 ? "МИМО" : "ШТАНГА";
      s.bannerC = "#94a3b8";
      s.bannerT = 0.9;
      if (gk) this.give(s, gk, false);
      this.log(s, s.banner);
      this.beat(s, 0.9);
    }
  },

  tryTackle(s, def, owner, adj) {
    const same = def.col === owner.col && def.row === owner.row;
    if (!same && !adj) return false;
    const w = this.weights(def, s);
    if ((w.tackle || 0) < 1) return false;
    let ch = (same ? 0.32 : 0.06 + s.streak * 0.03) + def.card.def * 0.03 - owner.card.pac * 0.02;
    if (adj && s.streak < 2) return false;
    if (Math.random() > Math.min(same ? 0.65 : 0.3, ch)) return false;
    def.act = "tackle";
    def.actT = 0.5;
    this.face(def, owner.x, owner.y);
    def.lx = (owner.x - def.x) * 0.3;
    def.ly = (owner.y - def.y) * 0.3;
    this.fx(s, "tackle", (def.x + owner.x) / 2, (def.y + owner.y) / 2, {
      color: this.TACTIC[def.card.tactic].color,
    });
    this.give(s, def, false);
    s.lastFrom = null;
    s.streak = 0;
    this.log(s, "Отбор · " + def.card.name + " (" + def.card.amp + ")");
    this.beat(s, 0.85);
    return true;
  },

  tick(s) {
    const owner = s.ball.owner;
    if (!owner || !owner.card) {
      const here = this.at(s, s.ball.col, s.ball.row);
      if (here.length) {
        here.sort((a, b) => b.card.pac - a.card.pac);
        this.give(s, here[0], false);
        this.log(s, "Подбор · " + here[0].card.name);
        this.beat(s, 0.35);
      }
      return;
    }

    for (const f of this.at(s, owner.col, owner.row).filter((u) => u.side !== owner.side)) {
      if (this.tryTackle(s, f, owner, false)) return;
    }
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (!dc && !dr) continue;
        const c = owner.col + dc;
        const r = owner.row + dr;
        if (c < 0 || r < 0 || c >= this.COLS || r >= this.ROWS) continue;
        for (const f of this.at(s, c, r).filter((u) => u.side !== owner.side)) {
          if (this.tryTackle(s, f, owner, true)) return;
        }
      }
    }

    const w = this.weights(owner, s);
    const aw = {
      pass: this.targets(s, owner, false).length ? w.pass || 0 : 0,
      cross: this.targets(s, owner, true).length ? w.cross || 0 : 0,
      shoot: w.shoot || 0,
      clear: this.targets(s, owner, true).length ? w.clear || 0 : 0,
      hold: w.hold || 0,
      dribble: w.dribble || 0,
    };
    const act = this.pick(aw);
    if (act === "shoot") return void this.doShoot(s, owner);
    if (act === "cross" || act === "clear") {
      if (!this.doPass(s, owner, true)) {
        if ((w.shoot || 0) > 0) this.doShoot(s, owner);
        else {
          owner.act = "dribble";
          owner.actT = 0.4;
          this.log(s, "Контроль · " + owner.card.name);
          this.beat(s, 0.45);
        }
      }
      return;
    }
    if (act === "hold" || act === "dribble") {
      owner.act = "dribble";
      owner.actT = 0.4;
      s.streak++;
      this.log(s, "Контроль · " + owner.card.name);
      this.beat(s, 0.45);
      return;
    }
    if (!this.doPass(s, owner, false)) {
      if ((w.shoot || 0) > 0) this.doShoot(s, owner);
      else {
        owner.act = "dribble";
        owner.actT = 0.4;
        this.log(s, "Контроль · " + owner.card.name);
        this.beat(s, 0.45);
      }
    }
  },

  // ——— UI rects ———
  deckRect(i) {
    const col = i % 6;
    const row = (i / 6) | 0;
    const w = Math.floor((this.L.W - 18) / 6) - 3;
    return { x: 9 + col * (w + 3), y: this.L.uiTop + 24 + row * 50, w, h: 46 };
  },
  shopRect(i) {
    const w = Math.floor((this.L.W - 28) / 3) - 4;
    return { x: 12 + i * (w + 6), y: this.L.uiTop + 118, w, h: 80 };
  },
  benchRect(i) {
    const w = Math.floor((this.L.W - 24) / 2) - 4;
    return { x: 12 + i * (w + 6), y: this.L.uiTop + 24, w, h: 44 };
  },

  hitUnit(u, tap) {
    return Math.hypot(tap.x - u.x, tap.y - u.y) < 28;
  },

  placeGrid(s, tap) {
    const cell = this.cellAt(tap);
    // свой юнит
    for (const u of s.ours) {
      if (!this.hitUnit(u, tap)) continue;
      if (s.sel?.from === "deck") {
        const card = s.deck[s.sel.i];
        if (!card) return true;
        if (u.card) s.deck.push(u.card);
        u.card = card;
        s.deck.splice(s.sel.i, 1);
        this.snap(u);
        s.sel = null;
        s.note = u.zone + " ← " + u.card.name;
        return true;
      }
      if (s.sel?.from === "bench") {
        const card = s.bench[s.sel.i];
        if (!card) return true;
        if (u.card) s.bench[s.sel.i] = u.card;
        else s.bench.splice(s.sel.i, 1);
        u.card = card;
        this.snap(u);
        s.sel = null;
        this.tryMerge(s);
        s.note = "На " + u.zone;
        return true;
      }
      if (s.sel?.from === "field") {
        const a = s.ours[s.sel.i];
        if (a === u) {
          if (u.card && s.phase === "lineup") {
            s.deck.push(u.card);
            u.card = null;
            s.note = "В колоду";
          } else if (u.card && s.bench.length < this.BENCH) {
            s.bench.push(u.card);
            u.card = null;
            s.note = "На скамейку";
          }
          s.sel = null;
        } else {
          const tmp = a.card;
          a.card = u.card;
          u.card = tmp;
          s.sel = null;
          s.note = "Свап";
        }
        return true;
      }
      if (u.card) {
        s.sel = { from: "field", i: u.i };
        s.line = u.card.name + " · тап клетку = сдвиг";
        return true;
      }
    }

    if (!cell) return false;

    if (s.sel?.from === "deck") {
      const card = s.deck[s.sel.i];
      let u = s.ours.find((x) => x.col === cell.col && x.row === cell.row && x.card) || s.ours.find((x) => !x.card);
      if (!u) {
        s.note = "5/5 — выбери кого сдвинуть";
        return true;
      }
      if (u.card) s.deck.push(u.card);
      this.moveTo(s, u, cell.col, cell.row);
      u.card = card;
      s.deck.splice(s.sel.i, 1);
      s.sel = null;
      s.note = cell.col + "·" + cell.row + " ← " + card.name;
      return true;
    }
    if (s.sel?.from === "bench") {
      const card = s.bench[s.sel.i];
      let u = s.ours.find((x) => x.col === cell.col && x.row === cell.row && x.card) || s.ours.find((x) => !x.card);
      if (!u) {
        s.note = "5/5 — сдвинь / замени";
        return true;
      }
      if (u.card) s.bench[s.sel.i] = u.card;
      else s.bench.splice(s.sel.i, 1);
      this.moveTo(s, u, cell.col, cell.row);
      u.card = card;
      s.sel = null;
      this.tryMerge(s);
      s.note = "Клетка " + cell.col + "·" + cell.row;
      return true;
    }
    if (s.sel?.from === "field") {
      const u = s.ours[s.sel.i];
      this.moveTo(s, u, cell.col, cell.row);
      s.sel = null;
      s.note = (u.card ? u.card.name : u.zone) + " → " + cell.col + "·" + cell.row;
      return true;
    }
    return false;
  },

  // ——— phases ———
  updateLineup(s, api) {
    s.reroll.x = -999;
    s.sell.x = -999;
    s.spd.x = -999;
    s.go.x = api.w / 2 - 70;
    s.go.y = api.h - 68;
    const n = this.filled(s);
    s.go.label = n >= this.FIELD ? "В магазин" : "Состав " + n + "/" + this.FIELD;
    s.go.color = n >= this.FIELD ? "#3dd68c" : "#64748b";

    const tap = api.input.consumeTap();
    if (tap) {
      for (let i = 0; i < s.deck.length; i++) {
        const r = this.deckRect(i);
        if (tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y && tap.y <= r.y + r.h) {
          s.sel = { from: "deck", i };
          s.line = s.deck[i].amp + " · " + this.TACTIC[s.deck[i].tactic].ru + " · клетка?";
          return;
        }
      }
      if (this.placeGrid(s, tap)) return;
    }
    if (s.go.clicked && n >= this.FIELD) {
      s.bag = this.makeBag(s.ours.filter((u) => u.card).map((u) => u.card).concat(s.deck));
      s.coins = 10;
      s.phase = "shop";
      this.refreshShop(s, api);
      s.go.label = "В бой!";
      s.note = "Купи → скамейка → клетка";
      s.line = "Магазин · равномерный ролл";
    }
    const tc = this.tactics(s.ours);
    api.setHud("Сетка · " + n + "/5 · " + (tc.map((t) => t.id.slice(0, 4) + "×" + t.n).join(" ") || "нет×2") + " · " + s.note);
  },

  updateShop(s, api) {
    s.spd.x = -999;
    s.reroll.x = 12;
    s.reroll.y = api.h - 68;
    s.sell.x = api.w - 120;
    s.sell.y = api.h - 68;
    s.go.x = api.w / 2 - 70;
    s.go.y = api.h - 68;

    if (s.reroll.clicked) {
      if (s.coins >= 2) {
        s.coins -= 2;
        this.refreshShop(s, api);
        s.note = "Реролл";
      } else s.note = "Нужно 2🪙";
    }
    if (s.sell.clicked && s.sel) {
      if (s.sel.from === "bench" && s.bench[s.sel.i]) {
        s.coins += Math.max(1, s.bench[s.sel.i].cost - 1);
        s.bench.splice(s.sel.i, 1);
        s.sel = null;
        s.note = "Продано";
      } else if (s.sel.from === "field" && s.ours[s.sel.i]?.card) {
        s.coins += Math.max(1, s.ours[s.sel.i].card.cost - 1);
        s.ours[s.sel.i].card = null;
        s.sel = null;
        s.note = "Продано";
      }
    }

    const tap = api.input.consumeTap();
    if (tap) {
      for (let i = 0; i < this.SHOP; i++) {
        const r = this.shopRect(i);
        if (tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y && tap.y <= r.y + r.h) {
          const o = s.shop[i];
          if (!o) return;
          if (s.coins < o.price) {
            s.note = "Нужно " + o.price + "🪙";
            return;
          }
          if (s.bench.length >= this.BENCH) {
            s.note = "Скамейка 2/2";
            return;
          }
          s.coins -= o.price;
          const bi = s.bag.indexOf(o.name);
          if (bi >= 0) s.bag.splice(bi, 1);
          s.bench.push(o.card);
          s.shop[i] = null;
          this.tryMerge(s);
          s.note = "Купил " + o.card.name;
          return;
        }
      }
      for (let i = 0; i < s.bench.length; i++) {
        const r = this.benchRect(i);
        if (tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y && tap.y <= r.y + r.h) {
          s.sel = { from: "bench", i };
          s.line = s.bench[i].amp + " · тап клетку";
          return;
        }
      }
      if (this.placeGrid(s, tap)) return;
    }

    if (s.go.clicked) {
      if (s.round >= this.ROUNDS) {
        s.phase = "done";
        s.result = s.gh > s.ga ? "win" : s.gh < s.ga ? "lose" : "draw";
        s.go.label = "Ещё";
        s.go.color = "#5db0ff";
        s.reroll.x = -999;
        s.sell.x = -999;
        return;
      }
      if (this.filled(s) < this.FIELD) {
        s.note = "Нужно 5/5 на сетке";
        return;
      }
      this.startFight(s);
    }
    const tc = this.tactics(s.ours);
    api.setHud(
      "🪙" + s.coins + " · bench " + s.bench.length + "/2 · [" + (tc.map((t) => this.TACTIC[t.id].ru + "×" + t.n).join(", ") || "—") + "] · " + s.note
    );
  },

  startFight(s) {
    s.phase = "fight";
    s.sel = null;
    s.reroll.x = -999;
    s.sell.x = -999;
    s.spd.x = 12;
    s.spd.y = 10;
    s.go.label = "…";
    s.go.color = "#334155";
    s.seg = 26;
    s.think = 1.0;
    s.beat = 1.0;
    s.pending = null;
    s.restart = 0;
    this.packAll([...s.ours, ...s.opp]);
    for (const u of this.units(s)) this.snap(u);
    const mid = this.cellXY(1, 2);
    s.ball.owner = null;
    s.ball.fly = null;
    s.ball.x = mid.x;
    s.ball.y = mid.y;
    s.banner = "СВИСТОК";
    s.bannerC = "#e2e8f0";
    s.bannerT = 0.85;
    this.log(s, "Свисток · матч с ваших позиций");
    s._kick = 0.9;
  },

  enterShop(s, api) {
    s.phase = "shop";
    s.ball.owner = null;
    s.ball.fly = null;
    s.pending = null;
    s.sel = null;
    s.beat = 0;
    s.spd.x = -999;
    s.reroll.x = 12;
    s.sell.x = api.w - 120;
    s.go.label = s.round >= this.ROUNDS ? "Итог" : "В бой!";
    s.go.color = "#3dd68c";
    s.coins += 4;
    this.refreshShop(s, api);
    s.note = "Сетка · скамейка → клетка";
    for (const u of [...s.ours, ...s.opp]) if (u.card) this.snap(u);
  },

  updateFly(s, dt) {
    const f = s.ball.fly;
    if (!f) return;
    f.t -= dt;
    const u = 1 - Math.max(0, f.t) / f.life;
    const e = u * u * (3 - 2 * u);
    s.ball.x = f.x0 + (f.x1 - f.x0) * e;
    s.ball.y = f.y0 + (f.y1 - f.y0) * e - Math.sin(u * Math.PI) * (f.arc || 0);

    if (!f.checked && u >= 0.45 && f.thief) {
      f.checked = true;
      const th = f.thief;
      th.act = "tackle";
      th.actT = 0.5;
      this.fx(s, "tackle", th.x, th.y, { color: "#38bdf8" });
      this.launch(s, th.x, th.y - 12, 0.25, { arc: 4, to: th });
      s.lastFrom = null;
      s.streak = 0;
      this.log(s, "Перехват · " + th.card.name);
      this.beat(s, 0.85);
      return;
    }
    if (f.t > 0) return;
    s.ball.fly = null;
    s.ball.x = f.x1;
    s.ball.y = f.y1;
    if (f.shot) {
      this.resolveShot(s);
      return;
    }
    if (f.to) {
      this.give(s, f.to, false);
      this.beat(s, 0.35);
    }
  },

  update(s, api, dt) {
    this.layout(api);
    const dts = dt * (s.phase === "fight" ? s.scale : 1);
    s.pulse += dts;
    if (s.bannerT > 0) s.bannerT -= dts;
    if (s.beat > 0) s.beat -= dts;
    for (const f of s.fx) f.t -= dts;
    s.fx = s.fx.filter((f) => f.t > 0);

    for (const u of this.units(s)) {
      u.arm += dts * (u.act ? 12 : 6);
      if (u.actT > 0) u.actT -= dts;
      else {
        u.act = null;
        u.lx *= Math.max(0, 1 - dts * 8);
        u.ly *= Math.max(0, 1 - dts * 8);
      }
      const p = this.cellXY(u.col, u.row);
      const idle = s.phase === "fight" ? Math.sin(s.pulse * 2 + u.arm) * 2 : 0;
      const tx = p.x + u.ox + idle + u.lx;
      const ty = p.y + u.oy + Math.cos(s.pulse * 1.6 + u.i) * (s.phase === "fight" ? 1.4 : 0) + u.ly;
      u.x += (tx - u.x) * Math.min(1, 6 * dts);
      u.y += (ty - u.y) * Math.min(1, 6 * dts);
    }

    if (s.ball.fly) this.updateFly(s, dts);
    else if (s.ball.owner) {
      const o = s.ball.owner;
      s.ball.x += (o.x - s.ball.x) * Math.min(1, 8 * dts);
      s.ball.y += (o.y - 12 - s.ball.y) * Math.min(1, 8 * dts);
      s.ball.col = o.col;
      s.ball.row = o.row;
    }

    if (s.phase === "done") {
      s.reroll.x = -999;
      s.sell.x = -999;
      s.spd.x = -999;
      if (s.go.clicked || api.input.consumeTap()) {
        Object.assign(s, this.fresh(api, { go: s.go, reroll: s.reroll, sell: s.sell, spd: s.spd }));
      }
      return;
    }
    if (s.phase === "lineup") return void this.updateLineup(s, api);
    if (s.phase === "shop") return void this.updateShop(s, api);

    // fight
    s.spd.x = 12;
    s.spd.y = 10;
    s.spd.label = s.scale > 1 ? "×1" : "×2";
    if (s.spd.clicked) s.scale = s.scale > 1 ? 1 : 2;

    if (s._kick > 0) {
      s._kick -= dts;
      if (s._kick <= 0) {
        const mid = s.ours.find((u) => u.card && u.zone === "MID") || s.ours.find((u) => u.card);
        if (mid) {
          this.give(s, mid, true);
          this.log(s, "Мяч · " + mid.card.name);
        }
        s.beat = 0.5;
        s.think = 0.5;
      }
      api.setHud(s.gh + ":" + s.ga + " · свисток");
      return;
    }

    if (s.restart > 0) {
      s.restart -= dts;
      if (s.restart <= 0) {
        const kick = s.lastScorer === "us" ? "opp" : "us";
        const m = this.side(s, kick).find((u) => u.zone === "MID") || this.side(s, kick)[0];
        const c = this.cellXY(1, 2);
        s.ball.x = c.x;
        s.ball.y = c.y;
        if (m) this.give(s, m, true);
        this.log(s, "Центр");
        this.beat(s, 0.6);
      }
      api.setHud(s.gh + ":" + s.ga + " · " + s.minute + "'");
      return;
    }

    s.seg -= dts;
    s.think -= dts;
    if (s.think <= 0 && s.beat <= 0 && !s.ball.fly && !s.pending) {
      this.tick(s);
      s.think = 0.9 + Math.random() * 0.4;
    }
    if (s.seg <= 0) {
      s.round++;
      s.minute = Math.min(90, s.round * 13);
      this.enterShop(s, api);
      if (s.round >= this.ROUNDS) {
        s.go.label = "Итог";
        s.note = "Финал " + s.gh + ":" + s.ga;
      }
    }
    api.setHud(s.gh + ":" + s.ga + " · " + s.minute + "' · 5v5" + (s.scale > 1 ? " · ×2" : ""));
  },

  // ——— draw ———
  rr(ctx, x, y, w, h, r) {
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
    const g = ctx.createLinearGradient(0, 0, 0, L.H);
    g.addColorStop(0, "#0a1520");
    g.addColorStop(0.5, "#0c1f18");
    g.addColorStop(1, "#081018");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, L.W, L.H);

    for (let r = 0; r < this.ROWS; r++) {
      for (let c = 0; c < this.COLS; c++) {
        ctx.fillStyle = (r + c) % 2 ? "#1b5a36" : "#174e2f";
        ctx.fillRect(L.ox + c * L.cw, L.oy + r * L.ch, L.cw + 0.5, L.ch + 0.5);
      }
    }

    if (s.phase !== "fight" && s.sel) {
      for (let r = 0; r < this.ROWS; r++) {
        for (let c = 0; c < this.COLS; c++) {
          ctx.fillStyle = "rgba(253,224,71,0.12)";
          ctx.fillRect(L.ox + c * L.cw + 2, L.oy + r * L.ch + 2, L.cw - 4, L.ch - 4);
        }
      }
    }

    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(L.ox, L.oy, L.cw * this.COLS, L.ch * this.ROWS);
    ctx.strokeStyle = "rgba(255,255,255,0.14)";
    ctx.lineWidth = 1;
    for (let c = 1; c < this.COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(L.ox + c * L.cw, L.oy);
      ctx.lineTo(L.ox + c * L.cw, L.oy + L.ch * this.ROWS);
      ctx.stroke();
    }
    for (let r = 1; r < this.ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(L.ox, L.oy + r * L.ch);
      ctx.lineTo(L.ox + L.cw * this.COLS, L.oy + r * L.ch);
      ctx.stroke();
    }
    const midY = L.oy + 2.5 * L.ch;
    ctx.strokeStyle = "rgba(255,255,255,0.65)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(L.ox, midY);
    ctx.lineTo(L.ox + L.cw * this.COLS, midY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(L.ox + (L.cw * this.COLS) / 2, midY, 26, 0, Math.PI * 2);
    ctx.stroke();

    if (s.phase !== "fight") {
      for (const u of s.ours) {
        if (u.card) continue;
        const p = this.cellXY(u.col, u.row);
        ctx.strokeStyle = "rgba(134,239,172,0.5)";
        ctx.lineWidth = 2;
        this.rr(ctx, p.x + u.ox - 26, p.y + u.oy - 18, 52, 36, 8);
        ctx.stroke();
        ctx.fillStyle = "rgba(226,232,240,0.75)";
        ctx.font = "bold 11px Trebuchet MS, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(u.zone, p.x + u.ox, p.y + u.oy + 4);
      }
      if (s.sel) {
        ctx.fillStyle = "rgba(253,224,71,0.9)";
        ctx.font = "bold 11px Trebuchet MS, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("вся сетка · тап клетку", L.W / 2, L.oy - 8);
      }
    }
  },

  drawPlayer(ctx, u, hot, pulse) {
    const c = u.card;
    const opp = u.side === "opp";
    const r = 13 + (c.stars - 1) * 2;
    const bob = Math.sin(pulse * 8 + u.arm) * (u.act ? 0.3 : 1.3);
    const x = u.x;
    const y = u.y + bob;
    const tac = this.TACTIC[c.tactic].color;

    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.85, r * 0.8, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const swing = Math.sin(u.arm) * (u.act === "tackle" || u.act === "shot" ? 1 : 0.4);
    ctx.strokeStyle = opp ? "#fecaca" : "#bbf7d0";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      const a = u.face + side * (0.85 + swing * 0.4);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * (r + 7), y + Math.sin(a) * (r + 7));
      ctx.stroke();
    }

    const body = ctx.createRadialGradient(x - 3, y - 3, 2, x, y, r);
    body.addColorStop(0, opp ? "#ef4444" : "#22c55e");
    body.addColorStop(1, opp ? "#991b1b" : "#166534");
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.strokeStyle = hot ? "#fff" : tac;
    ctx.lineWidth = hot ? 3 : 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y - r * 0.1, r * 0.4, 0, Math.PI * 2);
    ctx.fillStyle = "#f5d0a9";
    ctx.fill();

    if (u.act && u.actT > 0) {
      ctx.globalAlpha = Math.min(1, u.actT * 2);
      ctx.strokeStyle = tac;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, r + 5 + (0.5 - u.actT) * 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px Trebuchet MS, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(c.name, x, y - r - 7);
    ctx.fillStyle = tac;
    ctx.font = "bold 9px Trebuchet MS, sans-serif";
    ctx.fillText(c.amp, x, y + r + 12);
    if (c.stars > 1) {
      ctx.fillStyle = "#fde68a";
      ctx.fillText("★★", x, y + r + 23);
    }
  },

  drawChip(ctx, x, y, w, h, card, sel, price) {
    this.rr(ctx, x, y, w, h, 8);
    ctx.fillStyle = sel ? "#1e3a8a" : "#123524";
    ctx.fill();
    ctx.strokeStyle = sel ? "#fff" : this.TACTIC[card.tactic].color;
    ctx.lineWidth = sel ? 2.2 : 1.5;
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 11px Trebuchet MS, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(card.name, x + w / 2, y + 18);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "9px Trebuchet MS, sans-serif";
    ctx.fillText(card.amp, x + w / 2, y + 32);
    ctx.fillStyle = this.TACTIC[card.tactic].color;
    ctx.font = "bold 9px Trebuchet MS, sans-serif";
    ctx.fillText(this.TACTIC[card.tactic].ru, x + w / 2, y + h - 8);
    if (price != null) {
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 12px Trebuchet MS, sans-serif";
      ctx.fillText(price + "🪙", x + w / 2, y + h - 22);
    }
  },

  draw(s, api) {
    const { ctx } = api;
    this.layout(api);
    const L = this.L;
    this.drawPitch(ctx, s);

    this.rr(ctx, L.W / 2 - 100, 6, 200, 38, 10);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 17px Trebuchet MS, sans-serif";
    ctx.textAlign = "center";
    const title = s.phase === "lineup" ? "РАССТАНОВКА" : s.phase === "shop" ? "МАГАЗИН" : s.gh + " : " + s.ga;
    ctx.fillText(title, L.W / 2, 24);
    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 12px Trebuchet MS, sans-serif";
    ctx.fillText(s.phase === "fight" ? s.minute + "'" : "🪙" + s.coins, L.W / 2, 38);

    let cx = 10;
    for (const t of this.tactics(s.ours).slice(0, 3)) {
      const label = this.TACTIC[t.id].ru + "×" + t.n;
      const tw = 14 + label.length * 6;
      this.rr(ctx, cx, L.pitchBottom - 16, tw, 14, 4);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fill();
      ctx.strokeStyle = this.TACTIC[t.id].color;
      ctx.stroke();
      ctx.fillStyle = this.TACTIC[t.id].color;
      ctx.font = "bold 10px Trebuchet MS, sans-serif";
      ctx.fillText(label, cx + tw / 2, L.pitchBottom - 5);
      cx += tw + 4;
    }

    for (const u of this.units(s).sort((a, b) => a.y - b.y)) {
      this.drawPlayer(ctx, u, s.ball.owner === u, s.pulse);
    }

    if (s.phase === "fight" || s.ball.owner || s.ball.fly) {
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.beginPath();
      ctx.ellipse(s.ball.x, s.ball.y + 5, 6, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fffef2";
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#334155";
      ctx.stroke();
    }

    for (const f of s.fx) {
      const a = Math.max(0, f.t / f.life);
      ctx.save();
      ctx.globalAlpha = a;
      if (f.kind === "pass" || f.kind === "cross") {
        ctx.strokeStyle = f.kind === "cross" ? "#86efac" : "#fff";
        ctx.setLineDash(f.kind === "cross" ? [3, 6] : [5, 4]);
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x2, f.y2);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (f.kind === "tackle") {
        ctx.strokeStyle = f.color || "#f97316";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 10 + (1 - a) * 14, -0.9, 0.9);
        ctx.stroke();
      } else if (f.kind === "shot") {
        ctx.strokeStyle = "#fde68a";
        ctx.lineWidth = 3.5;
        const k = 1 - a;
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x + (f.x2 - f.x) * Math.min(1, k * 1.4), f.y + (f.y2 - f.y) * Math.min(1, k * 1.4));
        ctx.stroke();
      } else if (f.kind === "save") {
        ctx.strokeStyle = "#c4b5fd";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 12 + (1 - a) * 16, 0, Math.PI * 2);
        ctx.stroke();
      } else if (f.kind === "goal") {
        ctx.fillStyle = "#fde68a";
        ctx.font = "bold 22px Trebuchet MS, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("ГОЛ", f.x, f.y - (1 - a) * 20);
      }
      ctx.restore();
    }

    if (s.line) {
      this.rr(ctx, 12, L.pitchBottom + 2, L.W - 24, 20, 6);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fill();
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "12px Trebuchet MS, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.line, L.W / 2, L.pitchBottom + 16);
    }

    if (s.phase === "lineup") {
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, L.uiTop, L.W, L.H - L.uiTop);
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 12px Trebuchet MS, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Колода → любая клетка (5/5)", 12, L.uiTop + 16);
      s.deck.forEach((c, i) => {
        const r = this.deckRect(i);
        this.drawChip(ctx, r.x, r.y, r.w, r.h, c, s.sel?.from === "deck" && s.sel.i === i, null);
      });
    }

    if (s.phase === "shop") {
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(0, L.uiTop, L.W, L.H - L.uiTop);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 12px Trebuchet MS, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Скамейка " + s.bench.length + "/" + this.BENCH, 12, L.uiTop + 16);
      s.bench.forEach((c, i) => {
        const r = this.benchRect(i);
        this.drawChip(ctx, r.x, r.y, r.w, r.h, c, s.sel?.from === "bench" && s.sel.i === i, null);
      });
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 12px Trebuchet MS, sans-serif";
      ctx.fillText("Витрина", 12, L.uiTop + 108);
      for (let i = 0; i < this.SHOP; i++) {
        const r = this.shopRect(i);
        if (s.shop[i]) this.drawChip(ctx, r.x, r.y, r.w, r.h, s.shop[i].card, false, s.shop[i].price);
        else {
          this.rr(ctx, r.x, r.y, r.w, r.h, 8);
          ctx.fillStyle = "#334155";
          ctx.fill();
        }
      }
    }

    if (s.bannerT > 0 && s.banner) {
      this.rr(ctx, 40, L.oy + L.ch * 2 - 26, L.W - 80, 48, 12);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fill();
      ctx.fillStyle = s.bannerC;
      ctx.font = "bold 26px Trebuchet MS, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.banner, L.W / 2, L.oy + L.ch * 2 + 6);
    }

    if (s.phase === "done") {
      const map = { win: ["ПОБЕДА", "#fbbf24"], lose: ["ПОРАЖЕНИЕ", "#f07178"], draw: ["НИЧЬЯ", "#94a3b8"] };
      const r = map[s.result] || map.lose;
      api.drawBanner(ctx, r[0] + " " + s.gh + ":" + s.ga, r[1]);
    }
  },
};
