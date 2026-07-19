/**
 * Legends of the Pitch — feel demo v4
 * 540×960 · 5v5 · скамейка 7 · живое пространство (винг / опорник / зона 14)
 */
window.FEEL_DEMOS = window.FEEL_DEMOS || {};

window.FEEL_DEMOS["legends-of-the-pitch"] = {
  hint: "Ты сам ставишь состав на слоты. Покупка → на скамейку → тап на слот. В матче бегут плавно от твоей расстановки.",

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
  ROLE_COLOR: { GK: "#c4b5fd", DEF: "#60a5fa", MID: "#fbbf24", WING: "#86efac", FWD: "#f87171" },
  MERGE_NEED: 3,
  SHOP_SIZE: 3,
  BENCH_MAX: 7,
  ROUNDS: 7,

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

  /** Геометрия под 540×960 */
  syncLayout(api) {
    const W = api.w;
    const H = api.h;
    const pitchBottom = Math.floor(H * 0.62);
    this.PITCH = {
      x0: Math.floor(W * 0.04),
      x1: Math.floor(W * 0.96),
      y0: Math.floor(H * 0.07),
      y1: pitchBottom,
      midY: Math.floor((H * 0.07 + pitchBottom) / 2),
      w: W,
      h: H,
      pitchBottom,
      uiTop: pitchBottom + 8,
    };
    return this.PITCH;
  },

  create(api) {
    this.syncLayout(api);
    const W = api.w;
    const H = api.h;
    const startBtn = api.input.addButton({
      x: W / 2 - 70,
      y: H - 72,
      w: 140,
      h: 56,
      label: "Далее",
      color: "#3dd68c",
    });
    const reroll = api.input.addButton({
      x: 14,
      y: H - 72,
      w: 110,
      h: 56,
      label: "Реролл 2",
      color: "#64748b",
    });
    const sell = api.input.addButton({
      x: W - 124,
      y: H - 72,
      w: 110,
      h: 56,
      label: "Продать",
      color: "#f07178",
    });
    const speed = api.input.addButton({
      x: -999,
      y: -999,
      w: 64,
      h: 40,
      label: "×2",
      color: "#5db0ff",
    });
    return this.fresh(api, { startBtn, reroll, sell, speed }, { wins: 0, losses: 0 });
  },

  mint(base, stars) {
    return { ...base, uid: base.name + "_" + Math.random().toString(36).slice(2, 6), stars: stars || 1 };
  },
  starLabel(c) {
    return "★".repeat(c.stars || 1);
  },

  makeSlots(side, api) {
    const P = this.syncLayout(api);
    const cx = (P.x0 + P.x1) / 2;
    const left = P.x0 + 48;
    const right = P.x1 - 48;
    const sw = 68;
    const sh = 48;
    // soft homes only — в бою уезжают по пространству
    const us = [
      { zone: "FWD", x: cx - sw / 2, y: P.midY + 36 },
      { zone: "WING", x: left - 10, y: P.midY + 70 },
      { zone: "MID", x: cx - sw / 2, y: P.midY + 110 },
      { zone: "DEF", x: cx - sw / 2, y: P.y1 - 100 },
      { zone: "GK", x: cx - sw / 2, y: P.y1 - 52 },
    ];
    const opp = [
      { zone: "GK", x: cx - sw / 2, y: P.y0 + 16 },
      { zone: "DEF", x: cx - sw / 2, y: P.y0 + 64 },
      { zone: "MID", x: cx - sw / 2, y: P.midY - 110 },
      { zone: "WING", x: right - sw + 10, y: P.midY - 70 },
      { zone: "FWD", x: cx - sw / 2, y: P.midY - 36 },
    ];
    return (side === "us" ? us : opp).map((p, i) => ({
      side,
      zone: p.zone,
      index: i,
      homeX: p.x + sw / 2,
      homeY: p.y + sh / 2,
      slotX: p.x,
      slotY: p.y,
      w: sw,
      h: sh,
      card: null,
      px: p.x + sw / 2,
      py: p.y + sh / 2,
      tx: p.x + sw / 2,
      ty: p.y + sh / 2,
      formX: p.x + sw / 2,
      formY: p.y + sh / 2,
      vx: 0,
      vy: 0,
      facing: side === "us" ? -Math.PI / 2 : Math.PI / 2,
      armPhase: Math.random() * 6,
      action: null,
      actionT: 0,
      intent: "hold",
      cover: null,
    }));
  },

  buildDeck(api) {
    const pool = this.CATALOG.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 12).map((c) => this.mint(c, 1));
  },

  seedOpp(api, oursDeck) {
    const opp = this.makeSlots("opp", api);
    const tactics = [...new Set(oursDeck.map((c) => c.tactic))].slice(0, 3);
    const picks = this.CATALOG.filter((c) => tactics.includes(c.tactic));
    for (const z of ["GK", "DEF", "MID", "WING", "FWD"]) {
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
    sl.desireX = sl.homeX;
    sl.desireY = sl.homeY;
    sl.vx = 0;
    sl.vy = 0;
    sl.action = null;
    sl.actionT = 0;
    sl.intent = "hold";
    sl.cover = null;
  },

  /** Вернуть к твоей расстановке без «телепорта» логики — только цели */
  settleToHome(sl) {
    sl.desireX = sl.homeX;
    sl.desireY = sl.homeY;
    sl.formX = sl.homeX;
    sl.formY = sl.homeY;
    sl.tx = sl.homeX;
    sl.ty = sl.homeY;
    sl.intent = "hold";
    sl.cover = null;
    sl.action = null;
    sl.actionT = 0;
  },

  snapToHome(sl) {
    this.settleToHome(sl);
    sl.px = sl.homeX;
    sl.py = sl.homeY;
    sl.vx = 0;
    sl.vy = 0;
  },

  fresh(api, btns, keep) {
    this.syncLayout(api);
    const deck = this.buildDeck(api);
    const ours = this.makeSlots("us", api);
    const opp = this.seedOpp(api, deck);
    btns.startBtn.label = "В матч";
    btns.startBtn.color = "#3dd68c";
    btns.reroll.x = -999;
    btns.sell.x = -999;
    btns.speed.x = -999;
    const P = this.PITCH;
    return {
      start: btns.startBtn,
      reroll: btns.reroll,
      sell: btns.sell,
      speed: btns.speed,
      phase: "lineup",
      deck,
      poolNames: deck.map((c) => c.name),
      ours,
      opp,
      bench: [],
      shop: [],
      selected: null,
      lineupUsed: new Set(),
      coins: 10,
      round: 0,
      minute: 0,
      myGoals: 0,
      oppGoals: 0,
      wins: keep.wins || 0,
      losses: keep.losses || 0,
      lastResult: null,
      ball: {
        x: (P.x0 + P.x1) / 2,
        y: P.midY,
        tx: (P.x0 + P.x1) / 2,
        ty: P.midY,
        owner: null,
        moving: false,
        visible: false,
        dash: false,
      },
      fx: [],
      trail: [],
      marks: [], // visual: open space / zone14
      subline: "Тап карту колоды → слот на поле (нужно 5)",
      banner: null,
      bannerT: 0,
      bannerColor: "#fff",
      pulse: 0,
      camShake: 0,
      timeScale: 1,
      thinkT: 0,
      segmentT: 0,
      possessSide: "us",
      note: "5v5 · колода 12 · витрина 3 · скамейка 7",
      storyT: 0,
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
    for (const sl of slots) if (sl.card) counts[sl.card.tactic]++;
    const active = [];
    for (const t of this.TACTICS) {
      if (counts[t] >= 2)
        active.push({ id: t, n: counts[t], level: counts[t] >= 4 ? 3 : counts[t] >= 3 ? 2 : 1 });
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
      const fit = c.role === sl.zone ? 1 : 0.75;
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
    const owned = new Set();
    for (const sl of s.ours) if (sl.card) owned.add(sl.card.name);
    for (const c of s.bench) owned.add(c.name);
    let name = api.pick(s.poolNames);
    if (owned.size && Math.random() < 0.55) name = api.pick([...owned]);
    const base = this.CATALOG.find((c) => c.name === name) || api.pick(this.CATALOG);
    return { card: this.mint(base, 1), price: base.cost };
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
  tryMerge(s) {
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
    const life = { tackle: 0.5, feint: 0.55, shot: 0.6, save: 0.55, pass: 0.45, goal: 0.9, press: 0.45, space: 0.9 }[kind] || 0.45;
    s.fx.push(Object.assign({ kind, x, y, t: life, life, ang: 0 }, extra || {}));
  },

  clampPitch(x, y) {
    const P = this.PITCH;
    return { x: clamp(x, P.x0 + 14, P.x1 - 14), y: clamp(y, P.y0 + 16, P.y1 - 16) };
  },

  /** Есть ли соперник впереди в коридоре (для винга / носителя) */
  blockerAhead(s, sl, side, lookDist) {
    const atkDir = side === "us" ? -1 : 1; // us атакует вверх (меньше y)
    const enemies = (side === "us" ? s.opp : s.ours).filter((e) => e.card);
    let best = null;
    let bd = 1e9;
    for (const e of enemies) {
      const dy = (e.py - sl.py) * atkDir; // >0 значит впереди по атаке
      if (dy < 8 || dy > lookDist) continue;
      const dx = Math.abs(e.px - sl.px);
      if (dx > 55) continue;
      if (dy < bd) {
        bd = dy;
        best = e;
      }
    }
    return best;
  },

  zone14Point(side) {
    const P = this.PITCH;
    const cx = (P.x0 + P.x1) / 2;
    // «зона 14» — полуфланг перед штрафной
    if (side === "us") return { x: cx + 70, y: P.y0 + (P.midY - P.y0) * 0.42 };
    return { x: cx - 70, y: P.y1 - (P.y1 - P.midY) * 0.42 };
  },

  /**
   * Желаемые точки = твоя расстановка (home) + ограниченный сдвиг.
   * form плавно догоняет desire — без телепорта по полю.
   */
  updateSpaceAI(s, dt) {
    const P = this.PITCH;
    const atk = s.possessSide || "us";
    s.marks = [];
    const ease = Math.min(1, 1.8 * dt);

    for (const side of ["us", "opp"]) {
      const team = side === "us" ? s.ours : s.opp;
      const wing = team.find((x) => x.card && x.zone === "WING");
      const mid = team.find((x) => x.card && x.zone === "MID");
      const def = team.find((x) => x.card && x.zone === "DEF");
      const fwd = team.find((x) => x.card && x.zone === "FWD");
      const gk = team.find((x) => x.card && x.zone === "GK");
      const attacking = side === atk;
      const dir = side === "us" ? -1 : 1; // us атакует вверх

      const setDesire = (sl, dx, dy, intent, maxFwd, maxSide) => {
        if (!sl) return;
        const fwdOff = clamp(dy, -maxFwd, maxFwd);
        const sideOff = clamp(dx, -maxSide, maxSide);
        const c = this.clampPitch(sl.homeX + sideOff, sl.homeY + fwdOff);
        sl.desireX = c.x;
        sl.desireY = c.y;
        sl.intent = intent;
      };

      if (gk) {
        setDesire(gk, (s.ball.x - gk.homeX) * 0.1, 0, "gk", 18, 28);
      }

      if (def) {
        const push = attacking ? dir * 36 : -dir * 28;
        setDesire(def, (s.ball.x - def.homeX) * 0.18, push, "line", 55, 50);
      }

      if (wing) {
        const block = this.blockerAhead(s, wing, side, 130);
        const lanePull = side === "us" ? P.x0 + 50 - wing.homeX : P.x1 - 50 - wing.homeX;
        if (attacking && !block) {
          setDesire(wing, lanePull * 0.35, dir * 110, "overlap", 130, 70);
          s.marks.push({ kind: "lane", x: wing.desireX, y: wing.desireY, side, label: "КОРИДОР" });
          if (s.storyT <= 0) s.subline = "Винг " + wing.card.name + " открывает бровку";
        } else if (attacking && block) {
          setDesire(wing, lanePull * 0.25, dir * 40, "hold-wide", 70, 60);
        } else {
          const threat = (side === "us" ? s.opp : s.ours).find(
            (x) => x.card && (x.zone === "WING" || x.zone === "FWD")
          );
          if (threat) {
            setDesire(
              wing,
              (threat.px - wing.homeX) * 0.45,
              (threat.py - wing.homeY) * 0.35,
              "mark",
              80,
              70
            );
          } else setDesire(wing, 0, -dir * 20, "hold-wide", 40, 40);
        }
      }

      if (mid) {
        const ourWingRun = wing && wing.intent === "overlap";
        const enemyWing = (side === "us" ? s.opp : s.ours).find(
          (x) => x.card && x.zone === "WING" && x.intent === "overlap"
        );
        if (!attacking && enemyWing) {
          setDesire(
            mid,
            (enemyWing.px - mid.homeX) * 0.55,
            (enemyWing.py - mid.homeY) * 0.5,
            "recover",
            120,
            90
          );
          mid.cover = "wing";
          s.marks.push({ kind: "chase", x: mid.desireX, y: mid.desireY, side, label: "СТРАХОВКА" });
          if (s.storyT <= 0) s.subline = "Опорник " + mid.card.name + " догоняет";
        } else if (attacking && ourWingRun) {
          setDesire(
            mid,
            (wing.px - mid.homeX) * 0.35,
            (wing.py - mid.homeY) * 0.35 + dir * 20,
            "support-wing",
            100,
            80
          );
          const z14 = this.zone14Point(side);
          s.marks.push({ kind: "z14", x: z14.x, y: z14.y, side, label: "ЗОНА 14" });
          if (s.storyT <= 0) {
            s.subline = "Опорник ушёл — зона 14 открыта";
            s.storyT = 1.8;
          }
        } else if (attacking && wing && wing.intent === "overlap") {
          const z14 = this.zone14Point(side);
          setDesire(mid, z14.x - mid.homeX, z14.y - mid.homeY, "zone14", 110, 90);
        } else if (attacking) {
          setDesire(mid, (s.ball.x - mid.homeX) * 0.2, dir * 28, "pivot", 70, 55);
        } else {
          setDesire(mid, (s.ball.x - mid.homeX) * 0.22, -dir * 18, "screen", 55, 50);
        }
      }

      if (fwd) {
        if (attacking) {
          const block = this.blockerAhead(s, fwd, side, 100);
          const towardWing = wing && wing.intent === "overlap" ? (wing.px - fwd.homeX) * 0.25 : 0;
          setDesire(fwd, towardWing, block ? dir * 35 : dir * 85, block ? "pinch" : "inbehind", 110, 70);
        } else {
          setDesire(fwd, 0, -dir * 12, "rest", 30, 30);
        }
      }

      // плавно тянем form → desire (не прыгаем)
      for (const sl of team) {
        if (!sl.card) continue;
        if (sl.desireX == null) {
          sl.desireX = sl.homeX;
          sl.desireY = sl.homeY;
        }
        sl.formX += (sl.desireX - sl.formX) * ease;
        sl.formY += (sl.desireY - sl.formY) * ease;
      }
    }
  },

  updateRunners(s, dt) {
    if (s.phase === "fight") this.updateSpaceAI(s, dt);
    const units = this.allUnits(s);
    for (const { sl } of units) {
      if (s.phase !== "fight") {
        // в магазине/составе стоим на слотах расстановки
        sl.tx = sl.homeX;
        sl.ty = sl.homeY;
        sl.px += (sl.homeX - sl.px) * Math.min(1, 8 * dt);
        sl.py += (sl.homeY - sl.py) * Math.min(1, 8 * dt);
        sl.vx = 0;
        sl.vy = 0;
      } else {
        let tx = sl.formX;
        let ty = sl.formY;
        const isOwner = s.ball.owner && this.slotRef(s, s.ball.owner.side, s.ball.owner.index) === sl;
        if (isOwner && s.ball.visible) {
          // носитель чуть к мячу, не телепорт
          tx = tx * 0.75 + s.ball.x * 0.25;
          ty = ty * 0.75 + s.ball.y * 0.25;
        } else if (sl.intent === "recover" && s.ball.visible) {
          tx = tx * 0.85 + s.ball.x * 0.15;
          ty = ty * 0.85 + s.ball.y * 0.15;
        }
        const c = this.clampPitch(tx, ty);
        sl.tx = c.x;
        sl.ty = c.y;

        const dx = sl.tx - sl.px;
        const dy = sl.ty - sl.py;
        const dist = Math.hypot(dx, dy) || 0.001;
        const sprint =
          sl.intent === "overlap" || sl.intent === "recover" || sl.intent === "inbehind" ? 1.2 : 1;
        const maxSpd = (48 + (sl.card?.pac || 5) * 6 + ((sl.card?.stars || 1) - 1) * 8) * sprint;
        // догоняем цель с потолком скорости — без рывков через всё поле
        const want = Math.min(maxSpd, dist * 2.8);
        const ax = (dx / dist) * want;
        const ay = (dy / dist) * want;
        sl.vx = sl.vx * 0.82 + ax * 0.18;
        sl.vy = sl.vy * 0.82 + ay * 0.18;
        const spdNow = Math.hypot(sl.vx, sl.vy);
        if (spdNow > maxSpd) {
          sl.vx = (sl.vx / spdNow) * maxSpd;
          sl.vy = (sl.vy / spdNow) * maxSpd;
        }
        sl.px += sl.vx * dt;
        sl.py += sl.vy * dt;
        const c2 = this.clampPitch(sl.px, sl.py);
        sl.px = c2.x;
        sl.py = c2.y;
        if (spdNow > 12) sl.facing = Math.atan2(sl.vy, sl.vx);
      }
      sl.armPhase += dt * (10 + Math.hypot(sl.vx, sl.vy) * 0.1);
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
        const minD = a.side === b.side ? 28 : 20;
        if (d < minD) {
          const push = (minD - d) * 0.35;
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

  giveBall(s, side, index) {
    const sl = this.slotRef(s, side, index);
    if (!sl?.card) return;
    s.ball.owner = { side, index };
    s.ball.visible = true;
    s.trail.push({ x: s.ball.x, y: s.ball.y, life: 0.4 });
    s.ball.tx = sl.px;
    s.ball.ty = sl.py;
    s.ball.moving = true;
    s.ball.dash = false;
    s.possessSide = side;
  },

  passBall(s, fromSide, fromI, toSide, toI) {
    const a = this.slotRef(s, fromSide, fromI);
    const b = this.slotRef(s, toSide, toI);
    if (!a?.card || !b?.card) return;
    this.spawnFx(s, "pass", a.px, a.py, { x2: b.px, y2: b.py });
    a.action = "pass";
    a.actionT = 0.28;
    s.ball.x = a.px;
    s.ball.y = a.py;
    this.giveBall(s, toSide, toI);
    s.subline = "Пас · " + a.card.name + " → " + b.card.name;
  },

  doTackle(s, defender, attacker) {
    const d = defender.sl;
    const a = attacker.sl;
    d.action = "tackle";
    d.actionT = 0.4;
    d.facing = Math.atan2(a.py - d.py, a.px - d.px);
    this.spawnFx(s, "tackle", (d.px + a.px) / 2, (d.py + a.py) / 2, {
      ang: d.facing,
      color: this.TACTIC_COLOR[d.card.tactic] || "#f97316",
    });
    s.camShake = 0.22;
    s.subline = "Отбор · " + d.card.name + (d.intent === "recover" ? " (страховка!)" : "");
    this.giveBall(s, defender.side, defender.index);
  },

  doFeint(s, unit) {
    const sl = unit.sl;
    sl.action = "feint";
    sl.actionT = 0.45;
    this.spawnFx(s, "feint", sl.px, sl.py, {
      ang: sl.facing,
      color: this.TACTIC_COLOR[sl.card.tactic] || "#38bdf8",
    });
    // импульс скорости, не телепорт
    sl.vx += Math.cos(sl.facing + 0.9) * 70;
    sl.vy += Math.sin(sl.facing + 0.9) * 70;
    s.subline = "Финт · " + sl.card.name;
  },

  doShot(s, unit, onGoalSide, longShot) {
    const sl = unit.sl;
    const P = this.PITCH;
    const goalY = onGoalSide === "opp" ? P.y0 + 12 : P.y1 - 12;
    const goalX = (P.x0 + P.x1) / 2 + (Math.random() - 0.5) * 50;
    sl.action = "shot";
    sl.actionT = 0.45;
    sl.facing = Math.atan2(goalY - sl.py, goalX - sl.px);
    this.spawnFx(s, "shot", sl.px, sl.py, { x2: goalX, y2: goalY, color: longShot ? "#fda4af" : "#fde68a" });
    s.ball.owner = null;
    s.ball.tx = goalX;
    s.ball.ty = goalY;
    s.ball.moving = true;
    s.ball.dash = true;
    s.subline = (longShot ? "Дальний из зоны 14 · " : "Удар · ") + sl.card.name;
  },

  doSave(s, gkUnit) {
    const sl = gkUnit.sl;
    sl.action = "save";
    sl.actionT = 0.5;
    this.spawnFx(s, "save", sl.px, sl.py, { color: "#c4b5fd" });
    s.subline = "Сейв · " + sl.card.name;
    this.giveBall(s, gkUnit.side, gkUnit.index);
  },

  doCross(s, wingUnit, targetUnit) {
    const w = wingUnit.sl;
    const t = targetUnit.sl;
    w.action = "pass";
    w.actionT = 0.35;
    this.spawnFx(s, "pass", w.px, w.py, { x2: t.px, y2: t.py, color: "#86efac" });
    s.banner = "ПОДАЧА";
    s.bannerColor = "#4ade80";
    s.bannerT = 0.75;
    s.subline = "Навес · " + w.card.name + " → " + t.card.name;
    s.ball.x = w.px;
    s.ball.y = w.py;
    this.giveBall(s, targetUnit.side, targetUnit.index);
  },

  pickZoneUnit(slots, side, zones) {
    const list = [];
    slots.forEach((sl, index) => {
      if (sl.card && zones.includes(sl.zone)) list.push({ sl, side, index });
    });
    return list.length ? list[(Math.random() * list.length) | 0] : null;
  },
  nearestEnemy(s, unit) {
    let best = null;
    let bd = 1e9;
    for (const e of this.allUnits(s)) {
      if (e.side === unit.side) continue;
      const d = Math.hypot(e.sl.px - unit.sl.px, e.sl.py - unit.sl.py);
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    return best;
  },
  unitOf(s, sl) {
    const side = sl.side;
    const index = (side === "us" ? s.ours : s.opp).indexOf(sl);
    return { sl, side, index };
  },

  simThink(s, api) {
    this.updateSpaceAI(s);
    if (!s.ball.owner) {
      const mid = this.pickZoneUnit(s.ours, "us", ["MID"]) || this.allUnits(s).find((u) => u.side === "us");
      if (mid) this.giveBall(s, mid.side, mid.index);
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
    const P = this.PITCH;

    // 1) Страховка: опорник догоняет винга с мячом
    if (owner.sl.zone === "WING" && owner.sl.intent === "overlap") {
      const defSlots = atkSide === "us" ? s.opp : s.ours;
      const defSide = atkSide === "us" ? "opp" : "us";
      const chaser = defSlots.find((x) => x.card && x.zone === "MID" && x.intent === "recover");
      if (chaser) {
        const dist = Math.hypot(chaser.px - owner.sl.px, chaser.py - owner.sl.py);
        const catchP = 0.2 + chaser.card.pac * 0.04 + chaser.card.def * 0.02 - owner.sl.card.pac * 0.03;
        if (dist < 42 && Math.random() < catchP) {
          this.doTackle(s, this.unitOf(s, chaser), owner);
          s.banner = "СПАС!";
          s.bannerColor = "#a78bfa";
          s.bannerT = 0.8;
          return;
        }
      }
    }

    // 2) Обычный прессинг
    const pressChance =
      0.22 +
      (defPrimary === "Gegenpress" ? 0.2 * (defPow.active[0]?.level || 1) : 0) +
      (defPrimary === "ParkBus" ? 0.08 : 0);
    if (Math.random() < pressChance) {
      const defSlots = atkSide === "us" ? s.opp : s.ours;
      const defSide = atkSide === "us" ? "opp" : "us";
      const tackler =
        this.pickZoneUnit(defSlots, defSide, ["MID", "DEF", "WING"]) || this.nearestEnemy(s, owner);
      if (tackler) {
        const win =
          Math.random() <
          0.4 + tackler.sl.card.def * 0.03 + (defPrimary === "Gegenpress" ? 0.12 : 0) - owner.sl.card.pac * 0.02;
        if (win) {
          this.doTackle(s, tackler, owner);
          if (defPrimary === "Counter" || us.active.some((a) => a.id === "Counter" && atkSide === "opp")) {
            const fwd = this.pickZoneUnit(
              tackler.side === "us" ? s.ours : s.opp,
              tackler.side,
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
        if (Math.random() < 0.65) {
          this.doFeint(s, owner);
          this.spawnFx(s, "press", tackler.sl.px, tackler.sl.py, { color: "#fb923c" });
          return;
        }
      }
    }

    // 3) Винг в коридоре: подача или прострел
    if (owner.sl.zone === "WING" && owner.sl.intent === "overlap") {
      const deep =
        atkSide === "us" ? owner.sl.py < P.y0 + 120 : owner.sl.py > P.y1 - 120;
      if (deep && Math.random() < 0.55) {
        const team = atkSide === "us" ? s.ours : s.opp;
        const target =
          this.pickZoneUnit(team, atkSide, ["FWD"]) || this.pickZoneUnit(team, atkSide, ["MID"]);
        if (target) {
          this.doCross(s, owner, target);
          // после подачи — удар
          s.pendingShot = {
            who: atkSide,
            shooter: target.sl.card,
            chance: 0.32 + target.sl.card.sht * 0.03 + (primary === "WingPlay" ? 0.1 : 0),
            fromCross: true,
          };
          s.ball.dash = true;
          s.ball.tx = target.sl.px;
          s.ball.ty = target.sl.py;
          return;
        }
      }
    }

    // 4) Зона 14: дальний удар, если опорник/полузащитник там и пространство открыто
    if (owner.sl.intent === "zone14" || (owner.sl.zone === "MID" && s.marks.some((m) => m.kind === "z14" && m.side === atkSide))) {
      if (Math.random() < 0.4 + owner.sl.card.sht * 0.03) {
        const goalSide = atkSide === "us" ? "opp" : "us";
        this.doShot(s, owner, goalSide, true);
        s.banner = "ЗОНА 14";
        s.bannerColor = "#fbbf24";
        s.bannerT = 0.85;
        this.spawnFx(s, "space", owner.sl.px, owner.sl.py, { color: "#fde68a" });
        s.pendingShot = {
          who: atkSide,
          shooter: owner.sl.card,
          chance: 0.28 + owner.sl.card.sht * 0.03 + (atkPow.atk - defPow.def) * 0.05,
          longShot: true,
        };
        return;
      }
    }

    // 5) Пас в открытого
    const passChance = primary === "TikiTaka" ? 0.7 : primary === "WingPlay" ? 0.52 : 0.45;
    if (Math.random() < passChance) {
      const team = atkSide === "us" ? s.ours : s.opp;
      // предпочитаем игрока с overlap / zone14 / inbehind
      const ranked = team
        .map((sl, index) => ({ sl, side: atkSide, index }))
        .filter((u) => u.sl.card && u.index !== owner.index);
      ranked.sort((a, b) => {
        const score = (u) =>
          (u.sl.intent === "overlap" ? 3 : 0) +
          (u.sl.intent === "zone14" ? 2.5 : 0) +
          (u.sl.intent === "inbehind" ? 2 : 0) +
          Math.random();
        return score(b) - score(a);
      });
      if (ranked[0]) {
        this.passBall(s, owner.side, owner.index, ranked[0].side, ranked[0].index);
        return;
      }
    }

    // 6) Удар в штрафной
    const inBox = atkSide === "us" ? owner.sl.py < P.midY - 30 : owner.sl.py > P.midY + 30;
    if (inBox && ["FWD", "WING", "MID"].includes(owner.sl.zone) && Math.random() < 0.4 + owner.sl.card.sht * 0.03) {
      const goalSide = atkSide === "us" ? "opp" : "us";
      this.doShot(s, owner, goalSide, false);
      s.pendingShot = {
        who: atkSide,
        shooter: owner.sl.card,
        chance:
          0.26 +
          (atkPow.atk - defPow.def) * 0.07 +
          owner.sl.card.sht * 0.025 +
          ((owner.sl.card.stars || 1) - 1) * 0.06,
      };
      return;
    }

    // 7) Ведение — чуть сдвигаем desire от home, бег догонит сам
    const dir = atkSide === "us" ? -1 : 1;
    owner.sl.desireY = clamp(
      (owner.sl.desireY ?? owner.sl.homeY) + dir * 18,
      owner.sl.homeY - 120,
      owner.sl.homeY + 120
    );
    if (owner.sl.zone === "WING") {
      owner.sl.desireX = atkSide === "us" ? P.x0 + 56 : P.x1 - 56;
    }
    s.subline = "Ведение · " + owner.sl.card.name + (owner.sl.intent === "overlap" ? " по бровке" : "");
  },

  resolvePendingShot(s) {
    const p = s.pendingShot;
    if (!p) return;
    s.pendingShot = null;
    const P = this.PITCH;
    const gkSide = p.who === "us" ? "opp" : "us";
    const gk = this.pickZoneUnit(gkSide === "us" ? s.ours : s.opp, gkSide, ["GK"]);
    let chance = Math.max(0.1, Math.min(0.58, p.chance));
    if (p.fromCross) chance += 0.06;
    if (p.longShot) chance -= 0.04;

    // опоздавший опорник может заблокировать
    const defSlots = p.who === "us" ? s.opp : s.ours;
    const recover = defSlots.find((x) => x.card && x.intent === "recover");
    if (recover && Math.hypot(recover.px - s.ball.x, recover.py - s.ball.y) < 50 && Math.random() < 0.45) {
      s.banner = "БЛОК";
      s.bannerColor = "#a78bfa";
      s.bannerT = 0.85;
      s.subline = recover.card.name + " успел закрыть удар";
      this.spawnFx(s, "tackle", recover.px, recover.py, { ang: 0, color: "#a78bfa" });
      this.giveBall(s, p.who === "us" ? "opp" : "us", defSlots.indexOf(recover));
      return;
    }

    if (Math.random() < chance) {
      if (p.who === "us") s.myGoals += 1;
      else s.oppGoals += 1;
      s.banner = "ГОООЛ!";
      s.bannerColor = "#fbbf24";
      s.bannerT = 1.25;
      s.subline = p.shooter.name + " " + this.starLabel(p.shooter);
      s.camShake = 0.5;
      this.spawnFx(s, "goal", (P.x0 + P.x1) / 2, p.who === "us" ? P.y0 + 24 : P.y1 - 24, {});
      s.ball.owner = null;
      s.ball.x = (P.x0 + P.x1) / 2;
      s.ball.y = P.midY;
      const mid = this.pickZoneUnit(p.who === "us" ? s.opp : s.ours, p.who === "us" ? "opp" : "us", ["MID"]);
      if (mid) this.giveBall(s, mid.side, mid.index);
    } else if (gk && Math.random() < 0.55) {
      this.doSave(s, gk);
      s.banner = "СЕЙВ";
      s.bannerColor = "#c4b5fd";
      s.bannerT = 0.85;
    } else {
      s.banner = Math.random() < 0.5 ? "ШТАНГА!" : "МИМО";
      s.bannerColor = "#94a3b8";
      s.bannerT = 0.8;
      if (gk) this.giveBall(s, gk.side, gk.index);
      else s.ball.owner = null;
    }
  },

  enterShop(s, api) {
    this.syncLayout(api);
    s.phase = "shop";
    s.ball.visible = false;
    s.pendingShot = null;
    s.selected = null;
    s.marks = [];
    s.speed.x = -999;
    s.reroll.x = 14;
    s.reroll.y = api.h - 72;
    s.sell.x = api.w - 124;
    s.sell.y = api.h - 72;
    s.start.label = s.round >= this.ROUNDS ? "Итог" : "В бой!";
    s.start.color = "#3dd68c";
    const interest = Math.min(4, (s.coins / 10) | 0);
    s.coins += 4 + interest;
    this.oppShopAI(s, api);
    this.refreshShop(s, api);
    s.note = "Расставь сам: скамейка → слот · свап слотов · 3=★";
    // вернуться к ТВОЕЙ расстановке (home), не к чужой сетке
    for (const sl of [...s.ours, ...s.opp]) if (sl.card) this.snapToHome(sl);
  },

  oppShopAI(s, api) {
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
      s.note = "Расставь 5/5 сам (скамейка → слот)";
      return;
    }
    this.syncLayout(api);
    s.phase = "fight";
    s.selected = null;
    s.reroll.x = -999;
    s.sell.x = -999;
    s.speed.x = 16;
    s.speed.y = 12;
    s.start.label = "…";
    s.start.color = "#334155";
    s.segmentT = 22;
    s.thinkT = 0.85;
    s.ball.visible = true;
    s.ball.x = (this.PITCH.x0 + this.PITCH.x1) / 2;
    s.ball.y = this.PITCH.midY;
    // старт строго с твоей расстановки
    for (const sl of [...s.ours, ...s.opp]) if (sl.card) this.snapToHome(sl);
    const kick = this.pickZoneUnit(s.ours, "us", ["MID"]) || this.allUnits(s).find((u) => u.side === "us");
    if (kick) this.giveBall(s, kick.side, kick.index);
    const tl = this.tacticLevels(s.ours);
    s.subline = "С вашей расстановки · " +
      (tl.active.length
        ? tl.active.map((a) => this.TACTIC_RU[a.id] + "×" + a.n).join(" · ")
        : "без тактики ×2");
    s.banner = s.minute + "'";
    s.bannerColor = "#e2e8f0";
    s.bannerT = 0.55;
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

  deckRect(i, api) {
    const col = i % 4;
    const row = (i / 4) | 0;
    const w = Math.floor((api.w - 28) / 4) - 4;
    return { x: 14 + col * (w + 4), y: this.PITCH.uiTop + 30 + row * 64, w, h: 58 };
  },
  shopRect(i, api) {
    // ниже скамейки (2 ряда × ~48)
    const w = Math.floor((api.w - 36) / 3) - 4;
    return { x: 14 + i * (w + 6), y: this.PITCH.uiTop + 130, w, h: 92 };
  },
  benchRect(i, api) {
    const w = Math.floor((api.w - 28) / 4) - 4;
    const col = i % 4;
    const row = (i / 4) | 0;
    return { x: 14 + col * (w + 4), y: this.PITCH.uiTop + 24 + row * 50, w, h: 44 };
  },

  updateLineup(s, api) {
    this.syncLayout(api);
    s.reroll.x = -999;
    s.sell.x = -999;
    s.speed.x = -999;
    s.start.x = api.w / 2 - 70;
    s.start.y = api.h - 72;
    s.start.label = this.filled(s.ours) >= 5 ? "В магазин" : "Состав " + this.filled(s.ours) + "/5";
    s.start.color = this.filled(s.ours) >= 5 ? "#3dd68c" : "#64748b";
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
      for (let i = 0; i < s.ours.length; i++) {
        const sl = s.ours[i];
        if (tap.x >= sl.slotX && tap.x <= sl.slotX + sl.w && tap.y >= sl.slotY && tap.y <= sl.slotY + sl.h) {
          if (s.selected?.from === "deck") {
            const card = s.deck[s.selected.index];
            if (!card) break;
            if (s.lineupUsed.has(card.uid) && (!sl.card || sl.card.uid !== card.uid)) {
              s.note = "Уже в составе";
              break;
            }
            if (sl.card) s.lineupUsed.delete(sl.card.uid);
            this.place(sl, card);
            s.lineupUsed.add(sl.card.uid);
            s.deck.splice(s.selected.index, 1);
            s.selected = null;
            s.note = sl.zone + " ← " + sl.card.name;
          } else if (sl.card) {
            s.deck.push(sl.card);
            s.lineupUsed.delete(sl.card.uid);
            sl.card = null;
            s.selected = null;
          }
          return;
        }
      }
    }
    if (s.start.clicked && this.filled(s.ours) >= 5) {
      s.poolNames = [...new Set([...s.ours.filter((x) => x.card).map((x) => x.card.name), ...s.deck.map((x) => x.name)])];
      while (s.poolNames.length < 12) {
        const extra = api.pick(this.CATALOG).name;
        if (!s.poolNames.includes(extra)) s.poolNames.push(extra);
      }
      s.coins = 10;
      s.phase = "shop";
      this.refreshShop(s, api);
      s.reroll.x = 14;
      s.sell.x = api.w - 124;
      s.start.label = "В бой!";
      s.note = "Скамейка до 7 · копи для ★ · собери тактику ×2/×3";
      s.subline = "Магазин перед сегментом";
    }
    const tl = this.tacticLevels(s.ours);
    api.setHud(
      "Состав " + this.filled(s.ours) + "/5 · " +
        (tl.active.map((a) => a.id + "×" + a.n).join(", ") || "нет тактики") +
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
    // покупка всегда на скамейку — расстановку на поле выбираешь сам
    if (s.bench.length >= this.BENCH_MAX) {
      s.note = "Скамейка 7/7 — продай или поставь на поле";
      return;
    }
    s.coins -= offer.price;
    s.bench.push(offer.card);
    s.shop[i] = null;
    const m = this.tryMerge(s);
    s.note = m
      ? "MERGE " + m.name + " " + this.starLabel(m)
      : "Купил " + offer.card.name + " → поставь на слот";
  },

  updateShop(s, api) {
    this.syncLayout(api);
    s.speed.x = -999;
    s.reroll.x = 14;
    s.reroll.y = api.h - 72;
    s.sell.x = api.w - 124;
    s.sell.y = api.h - 72;
    s.start.x = api.w / 2 - 70;
    s.start.y = api.h - 72;
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
            this.tryMerge(s);
            s.note = "Поставил на " + sl.zone;
          } else if (s.selected?.from === "field") {
            const a = s.ours[s.selected.index];
            if (a === sl) {
              // повторный тап того же слота → на скамейку
              if (sl.card && s.bench.length < this.BENCH_MAX) {
                s.bench.push(sl.card);
                sl.card = null;
                s.note = "Убрал на скамейку";
              } else s.note = "Скамейка полна";
            } else if (a) {
              // свап слотов — расстановку выбираешь сам
              const tmp = a.card;
              a.card = sl.card;
              sl.card = tmp;
              if (a.card) this.snapToHome(a);
              if (sl.card) this.snapToHome(sl);
              s.note = "Поменял местами";
            }
            s.selected = null;
          } else if (sl.card) {
            s.selected = { from: "field", index: i };
            s.note = sl.zone + ": другой слот = свап · тот же = скамейка";
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
      if (this.filled(s.ours) < 5) {
        s.note = "Расставь 5/5 сам — скамейка → слот";
        return;
      }
      this.startFight(s, api);
    }
    const tl = this.tacticLevels(s.ours);
    api.setHud(
      "🪙" + s.coins + " · расстановка " + this.filled(s.ours) + "/5 · скамейка " + s.bench.length + "/" + this.BENCH_MAX +
        " · [" + (tl.active.map((a) => this.TACTIC_RU[a.id] + "×" + a.n).join(", ") || "нет×2") + "] · " + s.note
    );
  },

  update(s, api, dt) {
    this.syncLayout(api);
    const dts = dt * (s.phase === "fight" ? s.timeScale : 1);
    s.pulse += dts;
    if (s.bannerT > 0) s.bannerT -= dts;
    if (s.camShake > 0) s.camShake -= dts;
    if (s.storyT > 0) s.storyT -= dts;
    for (const f of s.fx) f.t -= dts;
    s.fx = s.fx.filter((f) => f.t > 0);
    for (const t of s.trail) t.life -= dts;
    s.trail = s.trail.filter((t) => t.life > 0);
    this.updateRunners(s, dts);

    if (s.ball.moving) {
      const spd = s.ball.dash ? 13 : 8.5;
      s.ball.x += (s.ball.tx - s.ball.x) * Math.min(1, dts * spd);
      s.ball.y += (s.ball.ty - s.ball.y) * Math.min(1, dts * spd);
      if (Math.hypot(s.ball.tx - s.ball.x, s.ball.ty - s.ball.y) < 6) {
        s.ball.x = s.ball.tx;
        s.ball.y = s.ball.ty;
        s.ball.moving = false;
        if (s.pendingShot && s.ball.dash) this.resolvePendingShot(s);
      }
    } else if (s.ball.owner && s.phase === "fight") {
      const sl = this.slotRef(s, s.ball.owner.side, s.ball.owner.index);
      if (sl?.card) {
        s.ball.x += (sl.px + Math.cos(sl.facing) * 12 - s.ball.x) * Math.min(1, dts * 12);
        s.ball.y += (sl.py + Math.sin(sl.facing) * 12 - s.ball.y) * Math.min(1, dts * 12);
      }
    }

    if (s.phase === "done") {
      s.reroll.x = -999;
      s.sell.x = -999;
      s.speed.x = -999;
      if (s.start.clicked || api.input.consumeTap()) {
        Object.assign(
          s,
          this.fresh(api, { startBtn: s.start, reroll: s.reroll, sell: s.sell, speed: s.speed }, {
            wins: s.wins,
            losses: s.losses,
          })
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

    s.speed.x = 16;
    s.speed.y = 12;
    s.speed.label = s.timeScale > 1 ? "×1" : "×2";
    if (s.speed.clicked) s.timeScale = s.timeScale > 1 ? 1 : 2;

    s.segmentT -= dts;
    s.thinkT -= dts;
    if (s.thinkT <= 0 && !s.pendingShot) {
      this.simThink(s, api);
      s.thinkT = 0.5 + Math.random() * 0.4;
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
      s.myGoals + ":" + s.oppGoals + " · " + s.minute + "' · " +
        (tl.active.map((a) => a.id.slice(0, 4) + "×" + a.n).join(" ") || "space") +
        (s.timeScale > 1 ? " · ×2" : "")
    );
  },

  // ——— DRAW ———
  drawPitch(ctx, P) {
    const w = P.w;
    const y0 = P.y0;
    const y1 = P.y1;
    const h = y1 - y0;
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i % 2 ? "#1a4d30" : "#163f28";
      ctx.fillRect(0, y0 + (h / 14) * i, w, h / 14 + 1);
    }
    ctx.strokeStyle = "#ffffff66";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(P.x0, y0 + 6, P.x1 - P.x0, h - 12);
    ctx.beginPath();
    ctx.moveTo(P.x0, P.midY);
    ctx.lineTo(P.x1, P.midY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, P.midY, 34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeRect(w / 2 - 80, y0 + 6, 160, 48);
    ctx.strokeRect(w / 2 - 80, y1 - 54, 160, 48);
    ctx.fillStyle = "#ffffff40";
    ctx.fillRect(w / 2 - 28, y0 + 4, 56, 7);
    ctx.fillRect(w / 2 - 28, y1 - 11, 56, 7);
  },

  drawMarks(ctx, s) {
    for (const m of s.marks || []) {
      ctx.save();
      ctx.globalAlpha = 0.35 + Math.sin(s.pulse * 6) * 0.1;
      if (m.kind === "z14") {
        ctx.strokeStyle = "#fde68a";
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(m.x - 36, m.y - 28, 72, 56);
        ctx.setLineDash([]);
        ctx.fillStyle = "#fde68a";
        ctx.font = "bold 13px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(m.label, m.x, m.y - 34);
      } else if (m.kind === "lane") {
        ctx.strokeStyle = "#4ade80";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y + 40);
        ctx.lineTo(m.x, m.y - 40);
        ctx.stroke();
        ctx.fillStyle = "#86efac";
        ctx.font = "bold 12px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(m.label, m.x, m.y - 48);
      } else if (m.kind === "chase") {
        ctx.strokeStyle = "#a78bfa";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 16 + Math.sin(s.pulse * 8) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#c4b5fd";
        ctx.font = "bold 11px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(m.label, m.x, m.y - 22);
      }
      ctx.restore();
    }
  },

  drawPlayer(ctx, sl, hot, pulse, shopUI) {
    if (!sl.card) {
      if (shopUI) {
        ctx.strokeStyle = "#ffffff33";
        ctx.lineWidth = 2;
        ctx.strokeRect(sl.slotX, sl.slotY, sl.w, sl.h);
        ctx.fillStyle = "#ffffff66";
        ctx.font = "bold 12px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(sl.zone, sl.slotX + sl.w / 2, sl.slotY + sl.h / 2 + 4);
      }
      return;
    }
    const c = sl.card;
    const isOpp = sl.side === "opp";
    const r = 14 + ((c.stars || 1) - 1) * 2.2;
    const bob = Math.sin(pulse * 10 + sl.armPhase) * 1.4;
    const x = sl.px;
    const y = sl.py + bob;
    const ang = sl.facing;

    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.8, r * 0.85, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    const armSwing = Math.sin(sl.armPhase) * (sl.action === "feint" ? 1 : 0.5);
    const armLen = r + 7;
    ctx.strokeStyle = isOpp ? "#fecaca" : "#bbf7d0";
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    for (const side of [-1, 1]) {
      let a = ang + side * (0.9 + armSwing * side);
      if (sl.action === "tackle") a = ang + side * 0.3;
      if (sl.action === "shot") a = ang + side * 0.15;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * armLen, y + Math.sin(a) * armLen);
      ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * armLen, y + Math.sin(a) * armLen, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = isOpp ? "#b91c1c" : "#15803d";
    ctx.fill();
    ctx.strokeStyle = hot ? "#fff" : this.TACTIC_COLOR[c.tactic] || "#fff";
    ctx.lineWidth = hot ? 3 : 2;
    ctx.stroke();

    // intent pip
    if (!shopUI && sl.intent && sl.intent !== "hold" && sl.intent !== "rest" && sl.intent !== "gk") {
      ctx.fillStyle = sl.intent === "overlap" ? "#4ade80" : sl.intent === "recover" ? "#a78bfa" : sl.intent === "zone14" ? "#fde68a" : "#93c5fd";
      ctx.beginPath();
      ctx.arc(x, y - r - 3, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = this.ROLE_COLOR[c.role] || "#fff";
    ctx.beginPath();
    ctx.arc(x + Math.cos(ang) * (r * 0.35), y + Math.sin(ang) * (r * 0.35), 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(c.name, x, y - r - 8);
    ctx.fillStyle = this.TACTIC_COLOR[c.tactic];
    ctx.font = "bold 11px Segoe UI, sans-serif";
    ctx.fillText(c.amp, x, y + r + 14);
    if ((c.stars || 1) > 1) {
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 12px Segoe UI, sans-serif";
      ctx.fillText(this.starLabel(c), x, y + r + 28);
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
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 10 + k * 18, -0.9, 0.9);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(6, -8);
      ctx.lineTo(18 + k * 12, 0);
      ctx.lineTo(6, 8);
      ctx.stroke();
    } else if (fx.kind === "feint") {
      ctx.strokeStyle = fx.color || "#38bdf8";
      ctx.lineWidth = 2.5;
      for (let i = 0; i < 3; i++) {
        ctx.globalAlpha = a * (1 - i * 0.25);
        ctx.beginPath();
        ctx.arc(
          fx.x - Math.cos(fx.ang || 0) * i * 10,
          fx.y - Math.sin(fx.ang || 0) * i * 10,
          12 - i * 2,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }
    } else if (fx.kind === "shot") {
      ctx.strokeStyle = fx.color || "#fde68a";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(fx.x, fx.y);
      const mx = fx.x + (fx.x2 - fx.x) * Math.min(1, k * 1.4);
      const my = fx.y + (fx.y2 - fx.y) * Math.min(1, k * 1.4);
      ctx.lineTo(mx, my);
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(mx, my, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (fx.kind === "save") {
      ctx.strokeStyle = fx.color || "#c4b5fd";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 10 + k * 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#ffffff99";
      ctx.fillRect(fx.x - 12, fx.y - 4, 24, 8);
    } else if (fx.kind === "pass") {
      ctx.strokeStyle = fx.color || "#ffffffaa";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(fx.x, fx.y);
      ctx.lineTo(fx.x2, fx.y2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (fx.kind === "press") {
      ctx.strokeStyle = fx.color || "#fb923c";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(fx.x - 12, fx.y - 12);
      ctx.lineTo(fx.x + 12, fx.y + 12);
      ctx.moveTo(fx.x + 12, fx.y - 12);
      ctx.lineTo(fx.x - 12, fx.y + 12);
      ctx.stroke();
    } else if (fx.kind === "space") {
      ctx.strokeStyle = fx.color || "#fde68a";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(fx.x, fx.y, 12 + k * 28, 0, Math.PI * 2);
      ctx.stroke();
    } else if (fx.kind === "goal") {
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 22px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("⚽", fx.x, fx.y - k * 24);
    }
    ctx.restore();
  },

  drawCardChip(ctx, x, y, w, h, card, selected, price) {
    ctx.fillStyle = selected ? "#1d4ed8" : "#14532d";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = selected ? "#fff" : this.TACTIC_COLOR[card.tactic];
    ctx.lineWidth = selected ? 2.5 : 2;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = this.ROLE_COLOR[card.role];
    ctx.fillRect(x + 3, y + 3, w - 6, 8);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 13px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(card.name, x + w / 2, y + 26);
    ctx.fillStyle = "#e2e8f0";
    ctx.font = "11px Segoe UI, sans-serif";
    ctx.fillText(card.amp, x + w / 2, y + 42);
    ctx.fillStyle = this.TACTIC_COLOR[card.tactic];
    ctx.font = "bold 11px Segoe UI, sans-serif";
    const tName = this.TACTIC_RU[card.tactic];
    ctx.fillText(tName.length > 12 ? tName.slice(0, 11) + "…" : tName, x + w / 2, y + 56);
    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 13px Segoe UI, sans-serif";
    ctx.fillText(price != null ? price + "🪙" : this.starLabel(card), x + w / 2, y + h - 8);
  },

  draw(s, api) {
    const { ctx, w } = api;
    this.syncLayout(api);
    const P = this.PITCH;
    ctx.save();
    ctx.translate(s.camShake > 0 ? Math.sin(s.pulse * 40) * 4 : 0, 0);
    ctx.fillStyle = "#0b1620";
    ctx.fillRect(-12, 0, w + 24, api.h);

    const shopUI = s.phase === "shop" || s.phase === "lineup";
    this.drawPitch(ctx, P);

    // scoreboard
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(w / 2 - 110, 8, 220, 48);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 22px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    const title =
      s.phase === "lineup" ? "СОСТАВ" : s.phase === "shop" ? "МАГАЗИН" : s.myGoals + " : " + s.oppGoals;
    ctx.fillText(title, w / 2, 30);
    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 14px Segoe UI, sans-serif";
    ctx.fillText(s.phase === "fight" ? s.minute + "'" : "🪙" + s.coins, w / 2, 48);

    const tl = this.tacticLevels(s.ours);
    let cx = 12;
    for (const a of tl.active.slice(0, 3)) {
      const label = this.TACTIC_RU[a.id] + "×" + a.n;
      const tw = 16 + label.length * 7;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(cx, P.pitchBottom - 22, tw, 18);
      ctx.strokeStyle = this.TACTIC_COLOR[a.id];
      ctx.lineWidth = 2;
      ctx.strokeRect(cx, P.pitchBottom - 22, tw, 18);
      ctx.fillStyle = this.TACTIC_COLOR[a.id];
      ctx.font = "bold 12px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, cx + tw / 2, P.pitchBottom - 8);
      cx += tw + 6;
    }

    if (s.phase === "fight") this.drawMarks(ctx, s);

    if (shopUI) {
      for (const sl of [...s.opp, ...s.ours]) {
        if (!sl.card) this.drawPlayer(ctx, sl, false, s.pulse, true);
      }
    }
    const list = this.allUnits(s).sort((a, b) => a.sl.py - b.sl.py);
    for (const u of list) {
      const hot = s.ball.owner && s.ball.owner.side === u.side && s.ball.owner.index === u.index;
      this.drawPlayer(ctx, u.sl, hot, s.pulse, shopUI);
    }

    for (const t of s.trail) {
      ctx.globalAlpha = t.life * 2;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (s.ball.visible) {
      ctx.fillStyle = "#fffef2";
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#333";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    for (const f of s.fx) this.drawFx(ctx, f);

    if (s.subline) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(16, P.pitchBottom + 2, w - 32, 24);
      ctx.fillStyle = "#f1f5f9";
      ctx.font = "14px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.subline, w / 2, P.pitchBottom + 19);
    }

    if (s.phase === "lineup") {
      ctx.fillStyle = "rgba(0,0,0,0.62)";
      ctx.fillRect(0, P.uiTop, w, api.h - P.uiTop);
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 14px Segoe UI, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Колода — тап карту, тап слот (5/5)", 14, P.uiTop + 18);
      s.deck.forEach((c, i) => {
        const r = this.deckRect(i, api);
        this.drawCardChip(ctx, r.x, r.y, r.w, r.h, c, s.selected?.from === "deck" && s.selected.index === i, null);
      });
    }

    if (s.phase === "shop") {
      ctx.fillStyle = "rgba(0,0,0,0.62)";
      ctx.fillRect(0, P.uiTop, w, api.h - P.uiTop);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "bold 13px Segoe UI, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Скамейка " + s.bench.length + "/" + this.BENCH_MAX + " · тап → слот", 14, P.uiTop + 16);
      s.bench.forEach((c, i) => {
        const r = this.benchRect(i, api);
        this.drawCardChip(ctx, r.x, r.y, r.w, r.h, c, s.selected?.from === "bench" && s.selected.index === i, null);
      });
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 14px Segoe UI, sans-serif";
      ctx.fillText("Витрина", 14, P.uiTop + 122);
      for (let i = 0; i < this.SHOP_SIZE; i++) {
        const r = this.shopRect(i, api);
        if (s.shop[i]) this.drawCardChip(ctx, r.x, r.y, r.w, r.h, s.shop[i].card, false, s.shop[i].price);
        else {
          ctx.fillStyle = "#334155";
          ctx.fillRect(r.x, r.y, r.w, r.h);
        }
      }
    }

    if (s.bannerT > 0 && s.banner) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(40, P.midY - 36, w - 80, 56);
      ctx.fillStyle = s.bannerColor;
      ctx.font = "bold 28px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.banner, w / 2, P.midY - 4);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "14px Segoe UI, sans-serif";
      ctx.fillText(s.phase === "fight" ? s.subline || "" : "", w / 2, P.midY + 18);
    }

    ctx.restore();
    if (s.phase === "done") {
      const map = { win: ["ПОБЕДА", "#fbbf24"], lose: ["ПОРАЖЕНИЕ", "#f07178"], draw: ["НИЧЬЯ", "#94a3b8"] };
      const r = map[s.lastResult] || map.lose;
      api.drawBanner(ctx, r[0] + " " + s.myGoals + ":" + s.oppGoals, r[1]);
    }
  },
};

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
