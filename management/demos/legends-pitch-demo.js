/**
 * Legends of the Pitch — feel demo v3
 * 5v5 · 1 амплуа + 1 тактика · магазин из колоды · merge 3→★
 * Top-down кружки с «ручками» · отдельные FX: отбор / финт / удар / сейв / пас
 */
window.FEEL_DEMOS = window.FEEL_DEMOS || {};

window.FEEL_DEMOS["legends-of-the-pitch"] = {
  hint: "Состав 5v5 → магазин (3 карты из колоды, скамейка 2, 3 копии=★) → смотри матч. Тактики = TFT-трейты.",

  TACTICS: ["Gegenpress", "TikiTaka", "ParkBus", "Counter", "WingPlay"],
  TACTIC_RU: {
    Gegenpress: "Gegenpress",
    TikiTaka: "Tiki-Taka",
    ParkBus: "Park the Bus",
    Counter: "Counter",
    WingPlay: "Wing Play",
  },
  TACTIC_COLOR: {
    Gegenpress: "#f97316",
    TikiTaka: "#38bdf8",
    ParkBus: "#a78bfa",
    Counter: "#f472b6",
    WingPlay: "#4ade80",
  },
  ROLE_COLOR: { GK: "#c4b5fd", DEF: "#5db0ff", MID: "#f0b429", WING: "#86efac", FWD: "#f07178" },
  MERGE_NEED: 3,
  SHOP_SIZE: 3,
  BENCH_MAX: 2,
  ROUNDS: 7,
  PITCH: { x0: 18, x1: 342, y0: 52, y1: 420, midY: 236 },

  /** Базовый пул: 1 амплуа + 1 тактика */
  CATALOG: [
    { name: "Клык", amp: "BWM", tactic: "Gegenpress", role: "MID", cost: 3, pac: 7, sht: 4, pas: 6, def: 8, wor: 9 },
    { name: "Рей", amp: "Winger", tactic: "WingPlay", role: "WING", cost: 3, pac: 9, sht: 6, pas: 7, def: 3, wor: 6 },
    { name: "Найт", amp: "Poacher", tactic: "Counter", role: "FWD", cost: 4, pac: 8, sht: 9, pas: 3, def: 2, wor: 5 },
    { name: "Сато", amp: "Playmaker", tactic: "TikiTaka", role: "MID", cost: 4, pac: 6, sht: 6, pas: 9, def: 3, wor: 6 },
    { name: "Окафор", amp: "Target", tactic: "WingPlay", role: "FWD", cost: 3, pac: 4, sht: 7, pas: 5, def: 4, wor: 8 },
    { name: "Брант", amp: "BallPlayCB", tactic: "TikiTaka", role: "DEF", cost: 3, pac: 5, sht: 2, pas: 8, def: 7, wor: 6 },
    { name: "Мороз", amp: "NoNonsense", tactic: "ParkBus", role: "DEF", cost: 2, pac: 5, sht: 2, pas: 3, def: 9, wor: 7 },
    { name: "Круз", amp: "ShotStop", tactic: "ParkBus", role: "GK", cost: 2, pac: 4, sht: 1, pas: 4, def: 9, wor: 6 },
    { name: "Коста", amp: "WingBack", tactic: "Gegenpress", role: "WING", cost: 3, pac: 8, sht: 4, pas: 6, def: 6, wor: 8 },
    { name: "Феликс", amp: "FalseNine", tactic: "TikiTaka", role: "FWD", cost: 5, pac: 7, sht: 7, pas: 8, def: 2, wor: 7 },
    { name: "Волк", amp: "SweeperGK", tactic: "Gegenpress", role: "GK", cost: 3, pac: 6, sht: 1, pas: 7, def: 7, wor: 7 },
    { name: "Дрейк", amp: "Shadow", tactic: "Counter", role: "MID", cost: 4, pac: 7, sht: 8, pas: 5, def: 3, wor: 6 },
    { name: "Холм", amp: "Anchor", tactic: "ParkBus", role: "MID", cost: 2, pac: 5, sht: 3, pas: 5, def: 8, wor: 8 },
    { name: "Бриз", amp: "InsideFwd", tactic: "Counter", role: "WING", cost: 4, pac: 8, sht: 8, pas: 5, def: 2, wor: 6 },
    { name: "Риф", amp: "FullBack", tactic: "WingPlay", role: "DEF", cost: 2, pac: 7, sht: 2, pas: 5, def: 7, wor: 7 },
  ],

  create(api) {
    const startBtn = api.input.addButton({ x: api.w / 2 - 52, y: api.h - 58, w: 104, h: 44, label: "Далее", color: "#3dd68c" });
    const reroll = api.input.addButton({ x: 10, y: api.h - 58, w: 86, h: 44, label: "Реролл 2", color: "#64748b" });
    const sell = api.input.addButton({ x: api.w - 96, y: api.h - 58, w: 86, h: 44, label: "Продать", color: "#f07178" });
    const speed = api.input.addButton({ x: -999, y: -999, w: 48, h: 32, label: "×2", color: "#5db0ff" });
    return this.fresh(api, { startBtn, reroll, sell, speed }, { wins: 0, losses: 0 });
  },

  mint(base, stars) {
    return {
      ...base,
      uid: base.name + "_" + Math.random().toString(36).slice(2, 6),
      stars: stars || 1,
    };
  },

  starLabel(c) {
    return "★".repeat(c.stars || 1);
  },

  makeSlots(side) {
    // 5v5: GK · DEF · MID · WING · FWD
    const us = [
      { zone: "FWD", x: 155, y: 268 },
      { zone: "WING", x: 48, y: 300 },
      { zone: "MID", x: 155, y: 318 },
      { zone: "DEF", x: 155, y: 358 },
      { zone: "GK", x: 155, y: 398 },
    ];
    const opp = [
      { zone: "GK", x: 155, y: 62 },
      { zone: "DEF", x: 155, y: 102 },
      { zone: "MID", x: 155, y: 142 },
      { zone: "WING", x: 262, y: 158 },
      { zone: "FWD", x: 155, y: 198 },
    ];
    const raw = side === "us" ? us : opp;
    return raw.map((p, i) => ({
      side,
      zone: p.zone,
      index: i,
      homeX: p.x + 25,
      homeY: p.y + 18,
      slotX: p.x,
      slotY: p.y,
      w: 50,
      h: 36,
      card: null,
      px: p.x + 25,
      py: p.y + 18,
      tx: p.x + 25,
      ty: p.y + 18,
      formX: p.x + 25,
      formY: p.y + 18,
      vx: 0,
      vy: 0,
      facing: side === "us" ? -Math.PI / 2 : Math.PI / 2,
      armPhase: Math.random() * Math.PI * 2,
      action: null,
      actionT: 0,
    }));
  },

  /** Колода на матч: 12 уникальных */
  buildDeck(api) {
    const pool = this.CATALOG.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 12).map((c) => this.mint(c, 1));
  },

  seedOpp(api, oursDeck) {
    const opp = this.makeSlots("opp");
    // зеркалим 3 тактики из нашей колоды для честного TFT
    const tactics = [...new Set(oursDeck.map((c) => c.tactic))].slice(0, 3);
    const picks = this.CATALOG.filter((c) => tactics.includes(c.tactic));
    const zones = ["GK", "DEF", "MID", "WING", "FWD"];
    for (const z of zones) {
      const sl = opp.find((s) => s.zone === z);
      const cand = picks.filter((c) => c.role === z);
      const base = cand.length ? api.pick(cand) : api.pick(this.CATALOG.filter((c) => c.role === z));
      if (sl && base) this.place(sl, this.mint(base, 1));
    }
    return opp;
  },

  place(sl, card) {
    sl.card = card;
    sl.px = sl.homeX;
    sl.py = sl.homeY;
    sl.tx = sl.homeX;
    sl.ty = sl.homeY;
    sl.formX = sl.homeX;
    sl.formY = sl.homeY;
    sl.vx = 0;
    sl.vy = 0;
    sl.action = null;
    sl.actionT = 0;
  },

  fresh(api, btns, keep) {
    const deck = this.buildDeck(api);
    const ours = this.makeSlots("us");
    const opp = this.seedOpp(api, deck);
    btns.startBtn.label = "В матч";
    btns.startBtn.color = "#3dd68c";
    btns.reroll.x = -999;
    btns.sell.x = -999;
    btns.speed.x = -999;
    return {
      start: btns.startBtn,
      reroll: btns.reroll,
      sell: btns.sell,
      speed: btns.speed,
      phase: "lineup",
      deck,
      poolBag: deck.map((c) => c.name),
      ours,
      opp,
      bench: [],
      shop: [],
      selected: null,
      lineupPicks: [],
      coins: 10,
      round: 0,
      minute: 0,
      myGoals: 0,
      oppGoals: 0,
      wins: keep.wins || 0,
      losses: keep.losses || 0,
      lastResult: null,
      ball: { x: 180, y: 236, tx: 180, ty: 236, vx: 0, vy: 0, owner: null, moving: false, visible: false },
      fx: [],
      trail: [],
      subline: "Выбери стартовые 5 из колоды (тап по карте → слот)",
      banner: null,
      bannerT: 0,
      bannerColor: "#fff",
      pulse: 0,
      camShake: 0,
      timeScale: 1,
      thinkT: 0,
      segmentT: 0,
      possessSide: "us",
      note: "5v5 · колода 12 · витрина 3 · скамейка 2",
    };
  },

  filled(slots) {
    return slots.filter((s) => s.card).length;
  },

  allUnits(s) {
    return [
      ...s.ours.map((sl, index) => ({ sl, side: "us", index })),
      ...s.opp.map((sl, index) => ({ sl, side: "opp", index })),
    ].filter((u) => u.sl.card);
  },

  slotRef(s, side, index) {
    return (side === "us" ? s.ours : s.opp)[index];
  },

  tacticLevels(slots) {
    const counts = Object.create(null);
    for (const t of this.TACTICS) counts[t] = 0;
    for (const sl of slots) {
      if (sl.card) counts[sl.card.tactic] = (counts[sl.card.tactic] || 0) + 1;
    }
    const active = [];
    for (const t of this.TACTICS) {
      if (counts[t] >= 2) active.push({ id: t, n: counts[t], level: counts[t] >= 4 ? 3 : counts[t] >= 3 ? 2 : 1 });
    }
    active.sort((a, b) => b.n - a.n);
    return { counts, active };
  },

  power(slots) {
    const tl = this.tacticLevels(slots);
    let atk = 0;
    let def = 0;
    for (const sl of slots) {
      if (!sl.card) continue;
      const c = sl.card;
      const star = 1 + ((c.stars || 1) - 1) * 0.35;
      const fit = c.role === sl.zone ? 1 : 0.7;
      atk += ((c.sht + c.pac * 0.4 + c.pas * 0.3) / 10) * star * fit;
      def += ((c.def + c.wor * 0.4) / 10) * star * fit;
    }
    for (const a of tl.active) {
      if (a.id === "Gegenpress") {
        atk += 0.15 * a.level;
        def += 0.1 * a.level;
      }
      if (a.id === "TikiTaka") atk += 0.12 * a.level;
      if (a.id === "ParkBus") def += 0.22 * a.level;
      if (a.id === "Counter") atk += 0.18 * a.level;
      if (a.id === "WingPlay") atk += 0.14 * a.level;
    }
    return { atk, def, ...tl };
  },

  shopOffer(s, api) {
    const names = s.poolNames;
    // bias toward owned for stacking
    const owned = new Set();
    for (const sl of s.ours) if (sl.card) owned.add(sl.card.name);
    for (const c of s.bench) owned.add(c.name);
    let name = api.pick(names);
    if (owned.size && Math.random() < 0.55) name = api.pick([...owned]);
    const base = this.CATALOG.find((c) => c.name === name) || api.pick(this.CATALOG);
    const card = this.mint(base, 1);
    return { card, price: base.cost };
  },

  refreshShop(s, api) {
    s.shop = [];
    for (let i = 0; i < this.SHOP_SIZE; i++) s.shop.push(this.shopOffer(s, api));
  },

  collectPieces(s, name, stars) {
    const pieces = [];
    s.ours.forEach((sl, index) => {
      if (sl.card && sl.card.name === name && (sl.card.stars || 1) === stars)
        pieces.push({ where: "field", index, card: sl.card });
    });
    s.bench.forEach((card, index) => {
      if (card.name === name && (card.stars || 1) === stars) pieces.push({ where: "bench", index, card });
    });
    return pieces;
  },

  removePiece(s, piece) {
    if (piece.where === "field") s.ours[piece.index].card = null;
    else s.bench.splice(piece.index, 1);
  },

  tryMerge(s, api) {
    let merged = null;
    for (let guard = 0; guard < 8; guard++) {
      let did = false;
      const names = new Set([
        ...s.ours.filter((x) => x.card).map((x) => x.card.name),
        ...s.bench.map((x) => x.name),
      ]);
      for (const name of names) {
        for (let stars = 1; stars <= 2; stars++) {
          const pieces = this.collectPieces(s, name, stars);
          if (pieces.length < this.MERGE_NEED) continue;
          const keep = pieces.find((p) => p.where === "field") || pieces[0];
          const take = [keep];
          for (const p of pieces) {
            if (take.length >= this.MERGE_NEED) break;
            if (p !== keep) take.push(p);
          }
          take.sort((a, b) => (a.where === b.where ? b.index - a.index : a.where === "bench" ? -1 : 1));
          const base = take[0].card;
          for (const p of take) this.removePiece(s, p);
          const up = this.mint(base, stars + 1);
          if (keep.where === "field" && !s.ours[keep.index].card) this.place(s.ours[keep.index], up);
          else {
            const empty = s.ours.find((sl) => !sl.card && sl.zone === up.role) || s.ours.find((sl) => !sl.card);
            if (empty) this.place(empty, up);
            else if (s.bench.length < this.BENCH_MAX) s.bench.push(up);
          }
          merged = up;
          did = true;
          s.banner = "MERGE " + this.starLabel(up);
          s.bannerColor = "#fbbf24";
          s.bannerT = 0.9;
          s.subline = up.name + " · " + up.amp;
        }
      }
      if (!did) break;
    }
    return merged;
  },

  spawnFx(s, kind, x, y, extra) {
    const life = { tackle: 0.45, feint: 0.5, shot: 0.55, save: 0.5, pass: 0.4, goal: 0.8, press: 0.4 }[kind] || 0.4;
    s.fx.push(Object.assign({ kind, x, y, t: life, life, ang: 0 }, extra || {}));
  },

  clampPitch(x, y) {
    const P = this.PITCH;
    return {
      x: apiClamp(x, P.x0 + 10, P.x1 - 10),
      y: apiClamp(y, P.y0 + 12, P.y1 - 12),
    };
  },

  applyShape(s, attackSide) {
    const P = this.PITCH;
    const usPow = this.power(s.ours);
    const primary = usPow.active[0]?.id;
    for (const sl of s.ours) {
      if (!sl.card) continue;
      const lane = sl.homeX;
      if (attackSide === "us") {
        if (sl.zone === "GK") {
          sl.formX = lane;
          sl.formY = P.y1 - 30;
        } else if (sl.zone === "DEF") {
          sl.formX = lane;
          sl.formY = P.midY + (primary === "ParkBus" ? 55 : 30);
        } else if (sl.zone === "MID") {
          sl.formX = lane + (primary === "TikiTaka" ? (Math.random() - 0.5) * 40 : 0);
          sl.formY = P.midY - (primary === "Gegenpress" ? 40 : 10);
        } else if (sl.zone === "WING") {
          sl.formX = primary === "WingPlay" ? 40 : 70;
          sl.formY = P.midY - 50;
        } else {
          sl.formX = lane + (Math.random() - 0.5) * 30;
          sl.formY = P.y0 + (primary === "Counter" ? 70 : 90);
        }
      } else {
        if (sl.zone === "GK") {
          sl.formX = lane;
          sl.formY = P.y1 - 28;
        } else if (sl.zone === "DEF") {
          sl.formX = lane;
          sl.formY = P.y1 - (primary === "ParkBus" ? 70 : 95);
        } else if (sl.zone === "MID") {
          sl.formX = lane;
          sl.formY = P.midY + 20;
        } else if (sl.zone === "WING") {
          sl.formX = 60;
          sl.formY = P.midY + 10;
        } else {
          sl.formX = lane;
          sl.formY = P.midY - 5;
        }
      }
    }
    for (const sl of s.opp) {
      if (!sl.card) continue;
      const lane = sl.homeX;
      if (attackSide === "opp") {
        if (sl.zone === "GK") {
          sl.formX = lane;
          sl.formY = P.y0 + 24;
        } else if (sl.zone === "DEF") {
          sl.formX = lane;
          sl.formY = P.midY - 35;
        } else if (sl.zone === "MID") {
          sl.formX = lane;
          sl.formY = P.midY + 15;
        } else if (sl.zone === "WING") {
          sl.formX = 290;
          sl.formY = P.midY + 40;
        } else {
          sl.formX = lane;
          sl.formY = P.y1 - 85;
        }
      } else {
        if (sl.zone === "GK") {
          sl.formX = lane;
          sl.formY = P.y0 + 24;
        } else if (sl.zone === "DEF") {
          sl.formX = lane;
          sl.formY = P.y0 + 75;
        } else if (sl.zone === "MID") {
          sl.formX = lane;
          sl.formY = P.midY - 40;
        } else if (sl.zone === "WING") {
          sl.formX = 280;
          sl.formY = P.midY - 20;
        } else {
          sl.formX = lane;
          sl.formY = P.midY;
        }
      }
    }
    // marking
    if (attackSide === "us") {
      const fwds = s.ours.filter((x) => x.card && (x.zone === "FWD" || x.zone === "WING"));
      const defs = s.opp.filter((x) => x.card && x.zone === "DEF");
      defs.forEach((d, i) => {
        const t = fwds[i % Math.max(1, fwds.length)];
        if (t) {
          d.formX = t.formX;
          d.formY = t.formY + 16;
        }
      });
    }
  },

  updateRunners(s, dt) {
    const units = this.allUnits(s);
    for (const { sl } of units) {
      if (s.phase !== "fight") {
        sl.tx = sl.homeX + Math.sin(s.pulse * 2 + sl.homeX) * 2;
        sl.ty = sl.homeY;
      } else {
        let tx = sl.formX;
        let ty = sl.formY;
        if (s.ball.visible) {
          const d = Math.hypot(s.ball.x - sl.px, s.ball.y - sl.py) || 1;
          const isOwner =
            s.ball.owner && this.slotRef(s, s.ball.owner.side, s.ball.owner.index) === sl;
          const pull = isOwner ? 0.65 : d < 70 ? 0.28 : 0.08;
          tx = tx * (1 - pull) + s.ball.x * pull;
          ty = ty * (1 - pull) + s.ball.y * pull;
        }
        const c = this.clampPitch(tx, ty);
        sl.tx = c.x;
        sl.ty = c.y;
      }
      const pac = sl.card ? 4.2 + sl.card.pac * 0.25 + ((sl.card.stars || 1) - 1) * 0.5 : 4;
      const spd = s.phase === "fight" ? pac : 3;
      sl.vx = sl.vx * 0.72 + (sl.tx - sl.px) * spd * 0.28;
      sl.vy = sl.vy * 0.72 + (sl.ty - sl.py) * spd * 0.28;
      sl.px += sl.vx * dt;
      sl.py += sl.vy * dt;
      const c2 = this.clampPitch(sl.px, sl.py);
      sl.px = c2.x;
      sl.py = c2.y;
      if (Math.hypot(sl.vx, sl.vy) > 8) sl.facing = Math.atan2(sl.vy, sl.vx);
      sl.armPhase += dt * (10 + Math.hypot(sl.vx, sl.vy) * 0.15);
      if (sl.actionT > 0) sl.actionT -= dt;
      else sl.action = null;
    }
    for (let i = 0; i < units.length; i++) {
      for (let j = i + 1; j < units.length; j++) {
        const a = units[i].sl;
        const b = units[j].sl;
        let dx = b.px - a.px;
        let dy = b.py - a.py;
        let d = Math.hypot(dx, dy) || 0.01;
        const minD = a.side === b.side ? 20 : 15;
        if (d < minD) {
          const push = (minD - d) * 0.45;
          dx /= d;
          dy /= d;
          a.px -= dx * push;
          a.py -= dy * push;
          b.px += dx * push;
          b.py += dy * push;
        }
      }
    }
  },

  giveBall(s, side, index, dash) {
    const sl = this.slotRef(s, side, index);
    if (!sl?.card) return;
    s.ball.owner = { side, index };
    s.ball.visible = true;
    s.trail.push({ x: s.ball.x, y: s.ball.y, life: 0.35 });
    s.ball.tx = sl.px;
    s.ball.ty = sl.py;
    s.ball.moving = true;
    s.ball.dash = !!dash;
    s.possessSide = side;
  },

  passBall(s, fromSide, fromI, toSide, toI) {
    const a = this.slotRef(s, fromSide, fromI);
    const b = this.slotRef(s, toSide, toI);
    if (!a?.card || !b?.card) return;
    this.spawnFx(s, "pass", a.px, a.py, { x2: b.px, y2: b.py, color: "#fff" });
    a.action = "pass";
    a.actionT = 0.25;
    s.ball.x = a.px;
    s.ball.y = a.py;
    this.giveBall(s, toSide, toI, false);
    s.subline = "Пас · " + a.card.name + " → " + b.card.name;
  },

  doTackle(s, defender, attacker) {
    const d = defender.sl;
    const a = attacker.sl;
    d.action = "tackle";
    d.actionT = 0.35;
    d.facing = Math.atan2(a.py - d.py, a.px - d.px);
    this.spawnFx(s, "tackle", (d.px + a.px) / 2, (d.py + a.py) / 2, {
      ang: d.facing,
      color: this.TACTIC_COLOR[d.card.tactic] || "#f97316",
    });
    s.camShake = 0.2;
    s.subline = "Отбор · " + d.card.name;
    this.giveBall(s, defender.side, defender.index, false);
  },

  doFeint(s, unit) {
    const sl = unit.sl;
    sl.action = "feint";
    sl.actionT = 0.4;
    this.spawnFx(s, "feint", sl.px, sl.py, {
      ang: sl.facing,
      color: this.TACTIC_COLOR[sl.card.tactic] || "#38bdf8",
    });
    sl.px += Math.cos(sl.facing + 0.9) * 12;
    sl.py += Math.sin(sl.facing + 0.9) * 12;
    s.subline = "Финт · " + sl.card.name;
  },

  doShot(s, unit, onGoalSide) {
    const sl = unit.sl;
    const goalY = onGoalSide === "opp" ? this.PITCH.y0 + 10 : this.PITCH.y1 - 10;
    const goalX = 180 + (Math.random() - 0.5) * 40;
    sl.action = "shot";
    sl.actionT = 0.4;
    sl.facing = Math.atan2(goalY - sl.py, goalX - sl.px);
    this.spawnFx(s, "shot", sl.px, sl.py, {
      x2: goalX,
      y2: goalY,
      color: "#fde68a",
    });
    s.ball.owner = null;
    s.ball.tx = goalX;
    s.ball.ty = goalY;
    s.ball.moving = true;
    s.ball.dash = true;
    s.subline = "Удар · " + sl.card.name + " (" + sl.card.amp + ")";
    return { goalX, goalY };
  },

  doSave(s, gkUnit) {
    const sl = gkUnit.sl;
    sl.action = "save";
    sl.actionT = 0.45;
    this.spawnFx(s, "save", sl.px, sl.py, { color: "#c4b5fd" });
    s.subline = "Сейв · " + sl.card.name;
    this.giveBall(s, gkUnit.side, gkUnit.index, false);
  },

  pickZoneUnit(slots, side, zones) {
    const list = [];
    slots.forEach((sl, index) => {
      if (sl.card && zones.includes(sl.zone)) list.push({ sl, side, index });
    });
    return list.length ? list[(Math.random() * list.length) | 0] : null;
  },

  nearestEnemy(s, unit) {
    const enemies = this.allUnits(s).filter((u) => u.side !== unit.side);
    let best = null;
    let bd = 1e9;
    for (const e of enemies) {
      const d = Math.hypot(e.sl.px - unit.sl.px, e.sl.py - unit.sl.py);
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    return best;
  },

  /** Ядро симуляции одного «мыслительного» тика */
  simThink(s, api) {
    if (!s.ball.owner) {
      const mid = this.pickZoneUnit(s.ours, "us", ["MID"]) || this.allUnits(s).find((u) => u.side === "us");
      if (mid) this.giveBall(s, mid.side, mid.index, false);
      this.applyShape(s, "us");
      return;
    }
    const owner = {
      sl: this.slotRef(s, s.ball.owner.side, s.ball.owner.index),
      side: s.ball.owner.side,
      index: s.ball.owner.index,
    };
    if (!owner.sl?.card) {
      s.ball.owner = null;
      return;
    }

    const us = this.power(s.ours);
    const them = this.power(s.opp);
    const atkSide = s.possessSide;
    const atkPow = atkSide === "us" ? us : them;
    const defPow = atkSide === "us" ? them : us;
    const primary = atkPow.active[0]?.id;
    const defPrimary = defPow.active[0]?.id;

    this.applyShape(s, atkSide);

    // Прессинг / отбор
    const pressChance =
      0.24 +
      (defPrimary === "Gegenpress" ? 0.18 * (defPow.active[0]?.level || 1) : 0) +
      (defPrimary === "ParkBus" ? 0.08 : 0);
    if (Math.random() < pressChance) {
      const defSlots = atkSide === "us" ? s.opp : s.ours;
      const defSide = atkSide === "us" ? "opp" : "us";
      const tackler =
        this.pickZoneUnit(defSlots, defSide, ["MID", "DEF", "WING"]) ||
        this.nearestEnemy(s, owner);
      if (tackler) {
        const win =
          Math.random() <
          0.42 +
            tackler.sl.card.def * 0.03 +
            (defPrimary === "Gegenpress" ? 0.14 : 0) -
            owner.sl.card.pac * 0.02;
        if (win) {
          this.doTackle(s, tackler, owner);
          // Counter after turnover
          if (defPrimary === "Counter" || (atkSide === "opp" && us.active.some((a) => a.id === "Counter"))) {
            const counterSide = tackler.side;
            const fwd = this.pickZoneUnit(
              counterSide === "us" ? s.ours : s.opp,
              counterSide,
              ["FWD", "WING"]
            );
            if (fwd) {
              s.banner = "КОНТРА";
              s.bannerColor = this.TACTIC_COLOR.Counter;
              s.bannerT = 0.7;
              this.passBall(s, tackler.side, tackler.index, fwd.side, fwd.index);
            }
          }
          return;
        }
        // failed tackle → feint by carrier
        if (Math.random() < 0.7) {
          this.doFeint(s, owner);
          this.spawnFx(s, "press", tackler.sl.px, tackler.sl.py, { color: "#fb923c" });
          return;
        }
      }
    }

    // Build-up / pass
    const passChance = primary === "TikiTaka" ? 0.72 : primary === "WingPlay" ? 0.55 : 0.48;
    if (Math.random() < passChance) {
      const team = atkSide === "us" ? s.ours : s.opp;
      let zones;
      if (primary === "WingPlay") zones = ["WING", "FWD", "MID"];
      else if (primary === "TikiTaka") zones = ["MID", "DEF", "WING", "FWD"];
      else if (primary === "Counter") zones = ["FWD", "WING", "MID"];
      else zones = ["MID", "WING", "FWD"];
      const target = this.pickZoneUnit(team, atkSide, zones);
      if (target && target.index !== owner.index) {
        this.passBall(s, owner.side, owner.index, target.side, target.index);
        return;
      }
    }

    // Shot attempt when high enough
    const inBox =
      atkSide === "us" ? owner.sl.py < this.PITCH.midY - 20 : owner.sl.py > this.PITCH.midY + 20;
    const shootZones = ["FWD", "WING", "MID"];
    if (inBox && shootZones.includes(owner.sl.zone) && Math.random() < 0.42 + owner.sl.card.sht * 0.035) {
      const goalSide = atkSide === "us" ? "opp" : "us";
      this.doShot(s, owner, goalSide);
      // resolve shortly via ball arrival flag
      s.pendingShot = {
        who: atkSide,
        shooter: owner.sl.card,
        chance:
          0.26 +
          (atkPow.atk - defPow.def) * 0.07 +
          owner.sl.card.sht * 0.025 +
          (primary === "Counter" && owner.sl.zone === "FWD" ? 0.1 : 0) +
          ((owner.sl.card.stars || 1) - 1) * 0.06,
      };
      return;
    }

    // dribble push
    owner.sl.formY += atkSide === "us" ? -18 : 18;
    if (primary === "WingPlay" && owner.sl.zone === "WING") {
      owner.sl.formX = atkSide === "us" ? 36 : 324;
    }
    s.subline = "Ведение · " + owner.sl.card.name;
  },

  resolvePendingShot(s) {
    const p = s.pendingShot;
    if (!p) return;
    s.pendingShot = null;
    const gkSide = p.who === "us" ? "opp" : "us";
    const gkSlots = gkSide === "us" ? s.ours : s.opp;
    const gk = this.pickZoneUnit(gkSlots, gkSide, ["GK"]);
    const chance = Math.max(0.08, Math.min(0.55, p.chance));
    if (Math.random() < chance) {
      if (p.who === "us") s.myGoals += 1;
      else s.oppGoals += 1;
      s.banner = "ГОООЛ!";
      s.bannerColor = "#fbbf24";
      s.bannerT = 1.2;
      s.subline = p.shooter.name + " " + this.starLabel(p.shooter);
      s.camShake = 0.45;
      this.spawnFx(s, "goal", 180, p.who === "us" ? this.PITCH.y0 + 20 : this.PITCH.y1 - 20, {});
      s.ball.owner = null;
      s.ball.x = 180;
      s.ball.y = this.PITCH.midY;
      // kickoff restart
      const mid = this.pickZoneUnit(p.who === "us" ? s.opp : s.ours, p.who === "us" ? "opp" : "us", ["MID"]);
      if (mid) this.giveBall(s, mid.side, mid.index, false);
      this.applyShape(s, mid ? mid.side : "us");
    } else if (gk && Math.random() < 0.55) {
      this.doSave(s, gk);
      s.banner = "СЕЙВ";
      s.bannerColor = "#c4b5fd";
      s.bannerT = 0.8;
    } else {
      s.banner = Math.random() < 0.5 ? "ШТАНГА!" : "МИМО";
      s.bannerColor = "#94a3b8";
      s.bannerT = 0.75;
      s.subline = "Момент упущен";
      if (gk) this.giveBall(s, gk.side, gk.index, false);
      else s.ball.owner = null;
    }
  },

  enterShop(s, api) {
    s.phase = "shop";
    s.ball.visible = false;
    s.pendingShot = null;
    s.selected = null;
    s.speed.x = -999;
    s.reroll.x = 10;
    s.reroll.y = api.h - 58;
    s.sell.x = api.w - 96;
    s.sell.y = api.h - 58;
    s.start.label = s.round >= this.ROUNDS ? "Итог" : "В бой!";
    s.start.color = "#3dd68c";
    const interest = Math.min(4, (s.coins / 10) | 0);
    s.coins += 4 + interest;
    this.oppShopAI(s, api);
    this.refreshShop(s, api);
    s.note = "+🪙 · реролл 2 · 3 копии = ★ · скамейка " + s.bench.length + "/" + this.BENCH_MAX;
    for (const sl of [...s.ours, ...s.opp]) if (sl.card) this.place(sl, sl.card);
  },

  oppShopAI(s, api) {
    // simple: try stack primary tactic
    const pow = this.power(s.opp);
    const focus = pow.active[0]?.id || api.pick(this.TACTICS);
    for (let i = 0; i < 2; i++) {
      const cand = this.CATALOG.filter((c) => c.tactic === focus && s.poolNames.includes(c.name));
      const base = cand.length ? api.pick(cand) : null;
      if (!base || Math.random() > 0.65) continue;
      const copies = s.opp.filter((sl) => sl.card && sl.card.name === base.name && (sl.card.stars || 1) === 1);
      if (copies.length >= 2) {
        copies[0].card = this.mint(base, 2);
        copies[1].card = null;
      }
    }
  },

  startFight(s, api) {
    if (this.filled(s.ours) < 5) {
      s.note = "Нужен полный состав 5/5";
      return;
    }
    s.phase = "fight";
    s.selected = null;
    s.reroll.x = -999;
    s.sell.x = -999;
    s.speed.x = 12;
    s.speed.y = 8;
    s.start.label = "…";
    s.start.color = "#334155";
    s.segmentT = 18;
    s.thinkT = 0.6;
    s.ball.visible = true;
    s.ball.x = 180;
    s.ball.y = this.PITCH.midY;
    const kick = this.pickZoneUnit(s.ours, "us", ["MID"]) || this.allUnits(s).find((u) => u.side === "us");
    if (kick) this.giveBall(s, kick.side, kick.index, false);
    this.applyShape(s, "us");
    const tl = this.tacticLevels(s.ours);
    s.subline = tl.active.length
      ? "Тактики: " + tl.active.map((a) => this.TACTIC_RU[a.id] + "×" + a.n).join(" · ")
      : "Нет активной тактики (нужно ×2)";
    s.banner = s.minute + "'";
    s.bannerColor = "#e2e8f0";
    s.bannerT = 0.6;
  },

  endMatch(s, api) {
    s.phase = "done";
    s.ball.visible = false;
    s.reroll.x = -999;
    s.sell.x = -999;
    s.speed.x = -999;
    const win = s.myGoals > s.oppGoals;
    const draw = s.myGoals === s.oppGoals;
    if (win) s.wins += 1;
    else if (!draw) s.losses += 1;
    s.lastResult = draw ? "draw" : win ? "win" : "lose";
    s.start.label = "Ещё";
    s.start.color = "#5db0ff";
    api.setHud((draw ? "Ничья " : win ? "Победа " : "Поражение ") + s.myGoals + ":" + s.oppGoals);
  },

  // ——— UI hit areas ———
  deckRect(i) {
    const col = i % 4;
    const row = (i / 4) | 0;
    return { x: 16 + col * 84, y: 448 + row * 52, w: 78, h: 46 };
  },
  shopRect(i) {
    return { x: 16 + i * 114, y: 470, w: 106, h: 72 };
  },
  benchRect(i) {
    return { x: 16 + i * 70, y: 422, w: 64, h: 40 };
  },

  updateLineup(s, api) {
    s.reroll.x = -999;
    s.sell.x = -999;
    s.speed.x = -999;
    s.start.label = this.filled(s.ours) >= 5 ? "В магазин" : "Состав " + this.filled(s.ours) + "/5";
    s.start.color = this.filled(s.ours) >= 5 ? "#3dd68c" : "#64748b";
    const tap = api.input.consumeTap();
    if (tap) {
      // tap deck card
      for (let i = 0; i < s.deck.length; i++) {
        const r = this.deckRect(i);
        if (tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y && tap.y <= r.y + r.h) {
          s.selected = { from: "deck", index: i };
          s.subline = s.deck[i].amp + " · " + this.TACTIC_RU[s.deck[i].tactic];
          return;
        }
      }
      // tap slot
      for (let i = 0; i < s.ours.length; i++) {
        const sl = s.ours[i];
        if (tap.x >= sl.slotX && tap.x <= sl.slotX + sl.w && tap.y >= sl.slotY && tap.y <= sl.slotY + sl.h) {
          if (s.selected?.from === "deck") {
            const card = s.deck[s.selected.index];
            if (!card) break;
            // return previous to deck visual pool (deck array stays, we track used)
            if (sl.card) {
              // free name back — deck list is catalog of available; use lineupUsed set
            }
            if (!s.lineupUsed) s.lineupUsed = new Set();
            if (s.lineupUsed.has(card.uid) && (!sl.card || sl.card.uid !== card.uid)) {
              s.note = "Уже в составе";
              break;
            }
            if (sl.card) s.lineupUsed.delete(sl.card.uid);
            this.place(sl, card);
            s.lineupUsed.add(sl.card.uid);
            // remove from deck display by splicing
            s.deck.splice(s.selected.index, 1);
            s.selected = null;
            s.note = sl.zone + " ← " + sl.card.name;
          } else if (sl.card) {
            // return to deck
            s.deck.push(sl.card);
            if (s.lineupUsed) s.lineupUsed.delete(sl.card.uid);
            sl.card = null;
            s.selected = null;
          }
          return;
        }
      }
    }
    if (s.start.clicked && this.filled(s.ours) >= 5) {
      // leftover deck becomes shop pool names
      s.poolNames = [
        ...s.ours.filter((x) => x.card).map((x) => x.card.name),
        ...s.deck.map((x) => x.name),
      ];
      // unique preserve order
      s.poolNames = [...new Set(s.poolNames)];
      while (s.poolNames.length < 12) {
        const extra = api.pick(this.CATALOG).name;
        if (!s.poolNames.includes(extra)) s.poolNames.push(extra);
      }
      s.coins = 10;
      s.phase = "shop";
      this.refreshShop(s, api);
      s.reroll.x = 10;
      s.sell.x = api.w - 96;
      s.start.label = "В бой!";
      s.note = "Купи копии для ★ · собери тактику ×2/×3";
      s.subline = "Магазин перед сегментом";
    }
    const tl = this.tacticLevels(s.ours);
    api.setHud(
      "Состав " +
        this.filled(s.ours) +
        "/5 · " +
        (tl.active.map((a) => a.id + "×" + a.n).join(", ") || "нет тактики") +
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
    if (s.bench.length >= this.BENCH_MAX && this.filled(s.ours) >= 5) {
      // try auto-place merge path via bench full — must sell first
      s.note = "Скамейка полна (2) — продай или поставь";
      // still allow buy if empty field slot
    }
    const empty = s.ours.find((sl) => !sl.card);
    if (!empty && s.bench.length >= this.BENCH_MAX) {
      s.note = "Нет места";
      return;
    }
    s.coins -= offer.price;
    if (empty) this.place(empty, offer.card);
    else s.bench.push(offer.card);
    s.shop[i] = null;
    const m = this.tryMerge(s, api);
    s.note = m ? "MERGE " + m.name + " " + this.starLabel(m) : "Купил " + offer.card.name;
  },

  updateShop(s, api) {
    s.speed.x = -999;
    s.reroll.x = 10;
    s.reroll.y = api.h - 58;
    s.sell.x = api.w - 96;
    s.sell.y = api.h - 58;
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
        const sl = s.ours[s.selected.index];
        if (sl?.card) {
          s.coins += Math.max(1, sl.card.cost - 1);
          sl.card = null;
          s.selected = null;
          s.note = "Продано";
        }
      }
    }
    const tap = api.input.consumeTap();
    if (tap) {
      for (let i = 0; i < this.SHOP_SIZE; i++) {
        const r = this.shopRect(i);
        if (tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y && tap.y <= r.y + r.h) {
          this.buyOffer(s, api, i);
          return;
        }
      }
      for (let i = 0; i < s.bench.length; i++) {
        const r = this.benchRect(i);
        if (tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y && tap.y <= r.y + r.h) {
          s.selected = { from: "bench", index: i };
          return;
        }
      }
      for (let i = 0; i < s.ours.length; i++) {
        const sl = s.ours[i];
        if (tap.x >= sl.slotX && tap.x <= sl.slotX + sl.w && tap.y >= sl.slotY && tap.y <= sl.slotY + sl.h) {
          if (s.selected?.from === "bench") {
            const card = s.bench[s.selected.index];
            if (!card) break;
            if (sl.card) {
              const tmp = sl.card;
              this.place(sl, card);
              s.bench[s.selected.index] = tmp;
            } else {
              this.place(sl, card);
              s.bench.splice(s.selected.index, 1);
            }
            s.selected = null;
            this.tryMerge(s, api);
          } else if (sl.card) {
            if (s.bench.length < this.BENCH_MAX) {
              s.bench.push(sl.card);
              sl.card = null;
            } else s.selected = { from: "field", index: i };
          }
          return;
        }
      }
    }
    if (s.start.clicked) {
      if (s.round >= this.ROUNDS) {
        this.endMatch(s, api);
        return;
      }
      this.startFight(s, api);
    }
    const tl = this.tacticLevels(s.ours);
    api.setHud(
      "🪙" +
        s.coins +
        " · 5v5 · [" +
        (tl.active.map((a) => this.TACTIC_RU[a.id] + "×" + a.n).join(", ") || "нет×2") +
        "] · " +
        s.note
    );
  },

  update(s, api, dt) {
    const dts = dt * (s.phase === "fight" ? s.timeScale : 1);
    s.pulse += dts;
    if (s.bannerT > 0) s.bannerT -= dts;
    if (s.camShake > 0) s.camShake -= dts;
    for (const f of s.fx) f.t -= dts;
    s.fx = s.fx.filter((f) => f.t > 0);
    for (const t of s.trail) t.life -= dts;
    s.trail = s.trail.filter((t) => t.life > 0);
    this.updateRunners(s, dts);

    // ball motion
    if (s.ball.moving) {
      const spd = s.ball.dash ? 14 : 9;
      s.ball.x += (s.ball.tx - s.ball.x) * Math.min(1, dts * spd);
      s.ball.y += (s.ball.ty - s.ball.y) * Math.min(1, dts * spd);
      if (Math.hypot(s.ball.tx - s.ball.x, s.ball.ty - s.ball.y) < 5) {
        s.ball.x = s.ball.tx;
        s.ball.y = s.ball.ty;
        s.ball.moving = false;
        if (s.pendingShot && s.ball.dash) this.resolvePendingShot(s);
      }
    } else if (s.ball.owner && s.phase === "fight") {
      const sl = this.slotRef(s, s.ball.owner.side, s.ball.owner.index);
      if (sl?.card) {
        s.ball.x += (sl.px + Math.cos(sl.facing) * 10 - s.ball.x) * Math.min(1, dts * 12);
        s.ball.y += (sl.py + Math.sin(sl.facing) * 10 - s.ball.y) * Math.min(1, dts * 12);
      }
    }

    if (s.phase === "done") {
      s.reroll.x = -999;
      s.sell.x = -999;
      s.speed.x = -999;
      if (s.start.clicked || api.input.consumeTap()) {
        Object.assign(
          s,
          this.fresh(
            api,
            { startBtn: s.start, reroll: s.reroll, sell: s.sell, speed: s.speed },
            { wins: s.wins, losses: s.losses }
          )
        );
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
    s.speed.x = 12;
    s.speed.y = 8;
    s.speed.label = s.timeScale > 1 ? "×1" : "×2";
    if (s.speed.clicked) s.timeScale = s.timeScale > 1 ? 1 : 2;

    s.segmentT -= dts;
    s.thinkT -= dts;
    if (s.thinkT <= 0 && !s.pendingShot) {
      this.simThink(s, api);
      s.thinkT = 0.55 + Math.random() * 0.45;
    }
    if (s.segmentT <= 0) {
      s.round += 1;
      s.minute = Math.min(90, s.round * 13);
      if (s.round >= this.ROUNDS) {
        this.enterShop(s, api);
        s.start.label = "Итог";
        s.note = "Финал " + s.myGoals + ":" + s.oppGoals;
      } else this.enterShop(s, api);
    }
    const tl = this.tacticLevels(s.ours);
    api.setHud(
      s.myGoals +
        ":" +
        s.oppGoals +
        " · " +
        s.minute +
        "' · " +
        (tl.active.map((a) => a.id.slice(0, 4) + "×" + a.n).join(" ") || "—") +
        (s.timeScale > 1 ? " · ×2" : "")
    );
  },

  // ——— DRAW ———
  drawPitch(ctx, w, y0, y1) {
    const h = y1 - y0;
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = i % 2 ? "#1a4d30" : "#164228";
      ctx.fillRect(0, y0 + (h / 12) * i, w, h / 12 + 1);
    }
    ctx.strokeStyle = "#ffffff55";
    ctx.lineWidth = 2;
    ctx.strokeRect(12, y0 + 4, w - 24, h - 8);
    const midY = (y0 + y1) / 2;
    ctx.beginPath();
    ctx.moveTo(12, midY);
    ctx.lineTo(w - 12, midY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, midY, 26, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(w / 2 - 60, y0 + 4, 120, 36);
    ctx.strokeRect(w / 2 - 60, y1 - 40, 120, 36);
    ctx.fillStyle = "#ffffff33";
    ctx.fillRect(w / 2 - 22, y0 + 2, 44, 5);
    ctx.fillRect(w / 2 - 22, y1 - 7, 44, 5);
  },

  drawPlayer(ctx, sl, hot, pulse) {
    if (!sl.card) {
      ctx.strokeStyle = "#ffffff28";
      ctx.strokeRect(sl.slotX, sl.slotY, sl.w, sl.h);
      ctx.fillStyle = "#ffffff44";
      ctx.font = "8px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(sl.zone, sl.slotX + sl.w / 2, sl.slotY + sl.h / 2 + 3);
      return;
    }
    const c = sl.card;
    const isOpp = sl.side === "opp";
    const r = 10 + ((c.stars || 1) - 1) * 1.6;
    const bob = Math.sin(pulse * 10 + sl.armPhase) * 1.2;
    const x = sl.px;
    const y = sl.py + bob;
    const ang = sl.facing;

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.75, r * 0.75, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // arms
    const armSwing = Math.sin(sl.armPhase) * (sl.action === "feint" ? 0.9 : 0.45);
    const armLen = r + 5;
    ctx.strokeStyle = isOpp ? "#fecaca" : "#bbf7d0";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      let a = ang + side * (0.85 + armSwing * side);
      if (sl.action === "tackle") a = ang + side * 0.35;
      if (sl.action === "shot") a = ang + side * 0.2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * armLen, y + Math.sin(a) * armLen);
      ctx.stroke();
      // hand knob
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * armLen, y + Math.sin(a) * armLen, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // body
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = isOpp ? "#b91c1c" : "#15803d";
    ctx.fill();
    ctx.strokeStyle = hot ? "#fff" : this.TACTIC_COLOR[c.tactic] || "#fff";
    ctx.lineWidth = hot ? 2.4 : 1.6;
    ctx.stroke();

    // role pip
    ctx.fillStyle = this.ROLE_COLOR[c.role] || "#fff";
    ctx.beginPath();
    ctx.arc(x + Math.cos(ang) * (r * 0.35), y + Math.sin(ang) * (r * 0.35), 2.5, 0, Math.PI * 2);
    ctx.fill();

    // label
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(c.name, x, y - r - 4);
    ctx.fillStyle = this.TACTIC_COLOR[c.tactic];
    ctx.font = "7px Segoe UI, sans-serif";
    ctx.fillText(c.amp, x, y + r + 9);
    if ((c.stars || 1) > 1) {
      ctx.fillStyle = "#fde68a";
      ctx.fillText(this.starLabel(c), x, y + r + 17);
    }
  },

  drawFx(ctx, fx) {
    const k = 1 - fx.t / fx.life;
    const a = Math.max(0, fx.t / fx.life);
    ctx.save();
    ctx.globalAlpha = a;
    if (fx.kind === "tackle") {
      ctx.translate(fx.x, fx.y);
      ctx.rotate(fx.ang || 0);
      ctx.strokeStyle = fx.color || "#f97316";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 8 + k * 16, -0.9, 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(4, -6);
      ctx.lineTo(14 + k * 10, 0);
      ctx.lineTo(4, 6);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (fx.kind === "feint") {
      ctx.strokeStyle = fx.color || "#38bdf8";
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = a * (1 - i * 0.25);
        ctx.beginPath();
        ctx.arc(fx.x - Math.cos(fx.ang || 0) * i * 8, fx.y - Math.sin(fx.ang || 0) * i * 8, 10 - i * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
      // swirl
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 6 + k * 12, k * 4, k * 4 + 2);
      ctx.stroke();
    } else if (fx.kind === "shot") {
      ctx.strokeStyle = fx.color || "#fde68a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fx.x, fx.y);
      const mx = fx.x + (fx.x2 - fx.x) * Math.min(1, k * 1.4);
      const my = fx.y + (fx.y2 - fx.y) * Math.min(1, k * 1.4);
      ctx.lineTo(mx, my);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(mx, my, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 6 + k * 10, 0, Math.PI * 2);
      ctx.stroke();
    } else if (fx.kind === "save") {
      ctx.strokeStyle = fx.color || "#c4b5fd";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 8 + k * 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ffffff88";
      ctx.fillRect(fx.x - 8, fx.y - 3, 16, 6);
    } else if (fx.kind === "pass") {
      ctx.strokeStyle = "#ffffffaa";
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(fx.x, fx.y);
      ctx.lineTo(fx.x2, fx.y2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (fx.kind === "press") {
      ctx.strokeStyle = fx.color || "#fb923c";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx.x - 10, fx.y - 10);
      ctx.lineTo(fx.x + 10, fx.y + 10);
      ctx.moveTo(fx.x + 10, fx.y - 10);
      ctx.lineTo(fx.x - 10, fx.y + 10);
      ctx.stroke();
    } else if (fx.kind === "goal") {
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 14px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("⚽", fx.x, fx.y - k * 20);
    }
    ctx.restore();
  },

  drawCardChip(ctx, x, y, w, h, card, selected, price) {
    ctx.fillStyle = selected ? "#1d4ed8" : "#14532d";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = selected ? "#fff" : this.TACTIC_COLOR[card.tactic];
    ctx.lineWidth = selected ? 2 : 1.5;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = this.ROLE_COLOR[card.role];
    ctx.fillRect(x + 2, y + 2, w - 4, 6);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(card.name, x + w / 2, y + 20);
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "7px Segoe UI, sans-serif";
    ctx.fillText(card.amp, x + w / 2, y + 32);
    ctx.fillStyle = this.TACTIC_COLOR[card.tactic];
    ctx.fillText(this.TACTIC_RU[card.tactic], x + w / 2, y + 42);
    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 9px Segoe UI, sans-serif";
    ctx.fillText(price != null ? price + "🪙" : this.starLabel(card), x + w / 2, y + h - 6);
  },

  draw(s, api) {
    const { ctx, w } = api;
    ctx.save();
    ctx.translate(s.camShake > 0 ? Math.sin(s.pulse * 40) * 3 : 0, 0);
    ctx.fillStyle = "#0b1620";
    ctx.fillRect(-10, 0, w + 20, api.h);

    const shopUI = s.phase === "shop" || s.phase === "lineup";
    const pitchBottom = shopUI ? 410 : 448;
    this.drawPitch(ctx, w, 48, pitchBottom);

    // scoreboard
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(w / 2 - 80, 4, 160, 40);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 16px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    const title =
      s.phase === "lineup" ? "СОСТАВ" : s.phase === "shop" ? "МАГАЗИН" : s.myGoals + " : " + s.oppGoals;
    ctx.fillText(title, w / 2, 22);
    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 11px Segoe UI, sans-serif";
    ctx.fillText(
      s.phase === "fight" ? s.minute + "'" : "🪙" + s.coins,
      w / 2,
      38
    );

    // tactic chips
    const tl = this.tacticLevels(s.ours);
    let cx = 8;
    for (const a of tl.active.slice(0, 3)) {
      const label = this.TACTIC_RU[a.id] + "×" + a.n;
      const tw = 10 + label.length * 5.2;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(cx, pitchBottom - 16, tw, 13);
      ctx.strokeStyle = this.TACTIC_COLOR[a.id];
      ctx.strokeRect(cx, pitchBottom - 16, tw, 13);
      ctx.fillStyle = this.TACTIC_COLOR[a.id];
      ctx.font = "bold 8px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, cx + tw / 2, pitchBottom - 6);
      cx += tw + 3;
    }

    // players depth-sorted
    if (shopUI) {
      for (const sl of [...s.opp, ...s.ours]) {
        if (!sl.card) this.drawPlayer(ctx, sl, false, s.pulse);
      }
    }
    const list = this.allUnits(s).sort((a, b) => a.sl.py - b.sl.py);
    for (const u of list) {
      const hot = s.ball.owner && s.ball.owner.side === u.side && s.ball.owner.index === u.index;
      this.drawPlayer(ctx, u.sl, hot, s.pulse);
    }

    for (const t of s.trail) {
      ctx.globalAlpha = t.life * 2;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(t.x, t.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (s.ball.visible) {
      ctx.fillStyle = "#fffef2";
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.stroke();
    }
    for (const f of s.fx) this.drawFx(ctx, f);

    if (s.subline && s.phase === "fight") {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(12, pitchBottom + 2, w - 24, 18);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "11px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.subline, w / 2, pitchBottom + 15);
    }

    if (s.phase === "lineup") {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 412, w, 230);
      ctx.fillStyle = "#fde68a";
      ctx.font = "10px Segoe UI, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Колода — тап карту, тап слот на поле (5/5)", 12, 428);
      s.deck.forEach((c, i) => {
        const r = this.deckRect(i);
        this.drawCardChip(ctx, r.x, r.y, r.w, r.h, c, s.selected?.from === "deck" && s.selected.index === i, null);
      });
    }

    if (s.phase === "shop") {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 412, w, 230);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "9px Segoe UI, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Скамейка " + s.bench.length + "/" + this.BENCH_MAX + " · тап → слот", 12, 426);
      s.bench.forEach((c, i) => {
        const r = this.benchRect(i);
        this.drawCardChip(ctx, r.x, r.y, r.w, r.h, c, s.selected?.from === "bench" && s.selected.index === i, null);
      });
      ctx.fillStyle = "#fde68a";
      ctx.fillText("Витрина (из колоды)", 16, 462);
      for (let i = 0; i < this.SHOP_SIZE; i++) {
        const r = this.shopRect(i);
        if (s.shop[i]) this.drawCardChip(ctx, r.x, r.y, r.w, r.h, s.shop[i].card, false, s.shop[i].price);
        else {
          ctx.fillStyle = "#334155";
          ctx.fillRect(r.x, r.y, r.w, r.h);
        }
      }
    }

    if (s.bannerT > 0 && s.banner) {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(28, 188, w - 56, 44);
      ctx.fillStyle = s.bannerColor;
      ctx.font = "bold 20px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.banner, w / 2, 210);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "11px Segoe UI, sans-serif";
      ctx.fillText(s.phase === "fight" ? s.subline || "" : "", w / 2, 226);
    }

    ctx.restore();
    if (s.phase === "done") {
      const map = { win: ["ПОБЕДА", "#fbbf24"], lose: ["ПОРАЖЕНИЕ", "#f07178"], draw: ["НИЧЬЯ", "#94a3b8"] };
      const r = map[s.lastResult] || map.lose;
      api.drawBanner(ctx, r[0] + " " + s.myGoals + ":" + s.oppGoals, r[1]);
    }
  },
};

function apiClamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
