window.FEEL_DEMOS = window.FEEL_DEMOS || {};

/* ========== 04 Legends of the Pitch ========== */
window.FEEL_DEMOS["legends-of-the-pitch"] = {
  hint: "Магазин/merge ★ → комбо позиция×амплуа×характер → полноценный матч: бег по всему полю, составы пересекаются.",
  TAGS: ["Press", "Poss", "Cntr", "Wall"],
  TAG_RU: { Press: "прессинг", Poss: "контроль", Cntr: "контра", Wall: "стена" },
  TAG_COLOR: { Press: "#f97316", Poss: "#38bdf8", Cntr: "#f472b6", Wall: "#a78bfa" },
  AMP_BY_SKILL: { long: "снайпер", press: "хардран", pass: "дирижёр", wall: "стоппер", save: "сейвер", tap: "трудяга" },
  ROLE_COLORS: { FWD: "#f07178", MID: "#f0b429", DEF: "#5db0ff", GK: "#c4b5fd" },
  RARITY_EDGE: { N: "#64748b", R: "#38bdf8", SR: "#fbbf24" },
  PRICE: { N: 3, R: 4, SR: 5 },
  ROUNDS: 9,
  MERGE_NEED: 3,
  // pitch play bounds (fight)
  PITCH: { x0: 22, x1: 338, y0: 58, y1: 448, midY: 248 },

  create(api) {
    const startBtn = api.input.addButton({ x: api.w / 2 - 50, y: api.h - 64, w: 100, h: 48, label: "В бой!", color: "#3dd68c" });
    const skill = api.input.addButton({ x: -999, y: -999, w: 72, h: 34, label: "Таймаут", color: "#f0b429" });
    const reroll = api.input.addButton({ x: 12, y: api.h - 64, w: 88, h: 48, label: "Реролл", color: "#64748b" });
    const sell = api.input.addButton({ x: api.w - 100, y: api.h - 64, w: 88, h: 48, label: "Продать", color: "#f07178" });
    const speed = api.input.addButton({ x: -999, y: -999, w: 52, h: 34, label: "×2", color: "#5db0ff" });
    return this.fresh(api, { startBtn, skill, reroll, sell, speed }, { wins: 0, losses: 0 });
  },

  heroes() {
    return [
      { name: "Блейз", role: "FWD", tag: "Cntr", rarity: "SR", skill: "long" },
      { name: "Рико", role: "FWD", tag: "Press", rarity: "R", skill: "press" },
      { name: "Нова", role: "FWD", tag: "Poss", rarity: "N", skill: "tap" },
      { name: "Флэш", role: "FWD", tag: "Cntr", rarity: "R", skill: "long" },
      { name: "Маэстро", role: "MID", tag: "Poss", rarity: "SR", skill: "pass" },
      { name: "Вира", role: "MID", tag: "Press", rarity: "R", skill: "press" },
      { name: "Орби", role: "MID", tag: "Cntr", rarity: "N", skill: "tap" },
      { name: "Пульс", role: "MID", tag: "Poss", rarity: "R", skill: "pass" },
      { name: "Стена", role: "DEF", tag: "Wall", rarity: "SR", skill: "wall" },
      { name: "Клин", role: "DEF", tag: "Press", rarity: "R", skill: "press" },
      { name: "Болт", role: "DEF", tag: "Wall", rarity: "N", skill: "wall" },
      { name: "Щит", role: "DEF", tag: "Wall", rarity: "R", skill: "wall" },
      { name: "Эгида", role: "GK", tag: "Wall", rarity: "SR", skill: "save" },
      { name: "Купол", role: "GK", tag: "Poss", rarity: "R", skill: "save" },
    ];
  },

  makeSlots(side) {
    const sw = 50, sh = 36;
    const raw = side === "opp"
      ? [
          { zone: "GK", x: 155, y: 56 }, { zone: "DEF", x: 80, y: 96 }, { zone: "DEF", x: 230, y: 96 },
          { zone: "MID", x: 42, y: 136 }, { zone: "MID", x: 155, y: 136 }, { zone: "MID", x: 268, y: 136 },
          { zone: "FWD", x: 92, y: 176 }, { zone: "FWD", x: 218, y: 176 },
        ]
      : [
          { zone: "FWD", x: 92, y: 292 }, { zone: "FWD", x: 218, y: 292 },
          { zone: "MID", x: 42, y: 332 }, { zone: "MID", x: 155, y: 332 }, { zone: "MID", x: 268, y: 332 },
          { zone: "DEF", x: 80, y: 372 }, { zone: "DEF", x: 230, y: 372 }, { zone: "GK", x: 155, y: 410 },
        ];
    return raw.map((p, i) => ({
      side, zone: p.zone, slotI: i,
      x: p.x, y: p.y, w: sw, h: sh, card: null,
      homeX: p.x + sw / 2, homeY: p.y + sh / 2,
      formX: p.x + sw / 2, formY: p.y + sh / 2,
      px: p.x + sw / 2, py: p.y + sh / 2,
      tx: p.x + sw / 2, ty: p.y + sh / 2,
      vx: 0, vy: 0,
    }));
  },

  mintCard(api, forced, stars) {
    const base = forced || api.pick(this.heroes());
    return {
      ...base,
      amp: this.AMP_BY_SKILL[base.skill] || "трудяга",
      id: base.name + "_" + Math.random().toString(36).slice(2, 7),
      stars: stars || 1,
      team: "us",
    };
  },
  starLabel(c) { return "★".repeat(c.stars || 1) + "☆".repeat(Math.max(0, 3 - (c.stars || 1))); },
  costOf(c) { return (this.PRICE[c.rarity] || 3) + ((c.stars || 1) - 1); },
  sellValue(c) { return Math.max(1, this.costOf(c) - 1); },

  ownedNames(s) {
    const n = new Set();
    for (const sl of s.ours) if (sl.card) n.add(sl.card.name);
    for (const c of s.bench) n.add(c.name);
    return [...n];
  },
  shopOffer(s, api) {
    const owned = this.ownedNames(s);
    let base = api.pick(this.heroes());
    if (owned.length && Math.random() < 0.55) {
      base = this.heroes().find((h) => h.name === api.pick(owned)) || base;
    }
    const c = this.mintCard(api, base, 1);
    return { card: c, price: this.PRICE[c.rarity] || 3 };
  },
  refreshShop(s, api) {
    s.shop = [this.shopOffer(s, api), this.shopOffer(s, api), this.shopOffer(s, api)];
  },

  collectPieces(s, name, stars) {
    const pieces = [];
    s.ours.forEach((sl, index) => {
      if (sl.card && sl.card.name === name && (sl.card.stars || 1) === stars)
        pieces.push({ where: "field", index, card: sl.card });
    });
    s.bench.forEach((card, index) => {
      if (card.name === name && (card.stars || 1) === stars)
        pieces.push({ where: "bench", index, card });
    });
    return pieces;
  },
  removePiece(s, piece) {
    if (piece.where === "field") s.ours[piece.index].card = null;
    else s.bench.splice(piece.index, 1);
  },
  tryMergeAll(s, api) {
    let merged = null;
    for (let guard = 0; guard < 12; guard++) {
      let did = false;
      const names = new Set([
        ...s.ours.filter((x) => x.card).map((x) => x.card.name),
        ...s.bench.map((x) => x.name),
      ]);
      for (const name of names) {
        for (let stars = 1; stars <= 2; stars++) {
          const pieces = this.collectPieces(s, name, stars);
          if (pieces.length < this.MERGE_NEED) continue;
          const keepField = pieces.find((p) => p.where === "field");
          const take = [];
          if (keepField) take.push(keepField);
          for (const p of pieces) {
            if (take.length >= this.MERGE_NEED) break;
            if (p !== keepField) take.push(p);
          }
          take.sort((a, b) => {
            if (a.where !== b.where) return a.where === "bench" ? -1 : 1;
            return b.index - a.index;
          });
          const base = take[0].card;
          for (const p of take) this.removePiece(s, p);
          const upgraded = this.mintCard(api, base, stars + 1);
          if (keepField && !s.ours[keepField.index].card) {
            this.placeCard(s.ours[keepField.index], upgraded);
          } else {
            const empty = s.ours.find((sl) => !sl.card && sl.zone === upgraded.role) || s.ours.find((sl) => !sl.card);
            if (empty) this.placeCard(empty, upgraded);
            else s.bench.push(upgraded);
          }
          merged = upgraded;
          did = true;
          s.banner = "MERGE ★" + upgraded.stars;
          s.bannerColor = "#fbbf24";
          s.bannerT = 1.0;
          s.subline = upgraded.name + " " + this.starLabel(upgraded);
          s.shopNote = "Merge! " + upgraded.name;
        }
      }
      if (!did) break;
    }
    return merged;
  },

  placeCard(sl, card) {
    sl.card = card;
    this.resetRunner(sl);
  },
  resetRunner(sl) {
    sl.formX = sl.homeX;
    sl.formY = sl.homeY;
    sl.px = sl.homeX;
    sl.py = sl.homeY;
    sl.tx = sl.homeX;
    sl.ty = sl.homeY;
    sl.vx = 0;
    sl.vy = 0;
  },

  seedEqualTeams(api) {
    const ours = this.makeSlots("us");
    const opp = this.makeSlots("opp");
    const starters = ["Купол", "Болт", "Орби", "Нова", "Рико"];
    const bench = [];
    for (const name of starters) {
      const h = this.heroes().find((x) => x.name === name);
      if (h) bench.push(this.mintCard(api, h, 1));
    }
    const plan = [
      { zone: "GK", name: "Купол" },
      { zone: "DEF", name: "Болт" },
      { zone: "MID", name: "Орби" },
    ];
    for (const p of plan) {
      const osl = opp.find((x) => x.zone === p.zone && !x.card);
      const h = this.heroes().find((x) => x.name === p.name);
      if (osl && h) this.placeCard(osl, this.mintCard(api, h, 1));
      const usl = ours.find((x) => x.zone === p.zone && !x.card);
      const bi = bench.findIndex((c) => c.name === p.name);
      if (usl && bi >= 0) this.placeCard(usl, bench.splice(bi, 1)[0]);
    }
    return { ours, opp, bench };
  },

  fresh(api, btns, keep) {
    const seeded = this.seedEqualTeams(api);
    btns.startBtn.label = "В бой!";
    btns.startBtn.color = "#3dd68c";
    btns.skill.x = -999;
    btns.speed.x = -999;
    btns.reroll.x = 12;
    btns.reroll.y = api.h - 64;
    btns.sell.x = api.w - 100;
    btns.sell.y = api.h - 64;
    const state = {
      start: btns.startBtn, skill: btns.skill, reroll: btns.reroll, sell: btns.sell, speed: btns.speed,
      ours: seeded.ours, opp: seeded.opp, bench: seeded.bench, shop: [],
      oppCoins: 10, selected: null,
      phase: "shop",
      round: 0, minute: 0,
      myGoals: 0, oppGoals: 0,
      coins: 10, roundCoins: 0, coinFx: [],
      wins: keep.wins || 0, losses: keep.losses || 0,
      lastResult: null,
      skillLeft: 1, timeoutBoost: 0, oppYellow: 0, momentum: 0, cornerNext: false,
      ball: { x: 180, y: 248, tx: 180, ty: 248, visible: false, moving: false, owner: null },
      trail: [], queue: [], beatT: 0,
      hot: null, banner: null, bannerT: 0, bannerColor: "#fff",
      subline: "", pulse: 0, camShake: 0,
      shopNote: "3v3 · комбо · merge ★ · в бою бегут по всему полю",
      activeCombos: [],
      timeScale: 1,
      match: { attackSide: "us", pressure: 0 },
    };
    this.refreshShop(state, api);
    return state;
  },

  benchRect(s, i) { return { x: 8 + i * 50, y: 402, w: 46, h: 56 }; },
  shopRect(i) { return { x: 18 + i * 112, y: 468, w: 100, h: 70 }; },
  slotRef(s, side, index) { return (side === "us" ? s.ours : s.opp)[index]; },
  allFilled(s) {
    return [
      ...s.ours.map((sl, index) => ({ sl, side: "us", index })).filter((x) => x.sl.card),
      ...s.opp.map((sl, index) => ({ sl, side: "opp", index })).filter((x) => x.sl.card),
    ];
  },
  filled(slots) { return slots.filter((x) => x.card).length; },

  synergies(slots) {
    const tags = slots.map((x) => x.card?.tag).filter(Boolean);
    return this.TAGS.filter((t) => tags.filter((x) => x === t).length >= 2);
  },

  comboReport(slots) {
    const filled = slots.filter((sl) => sl.card);
    const combos = [];
    let atk = 0, def = 0, fitN = 0;
    const links = [];
    for (const sl of filled) {
      const c = sl.card;
      const fit = c.role === sl.zone;
      if (fit) fitN += 1;
      const fitMul = fit ? 1 : 0.55;
      const rare = c.rarity === "SR" ? 0.4 : c.rarity === "R" ? 0.18 : 0;
      const star = ((c.stars || 1) - 1) * 0.45;
      const ampBonus = (c.amp === "снайпер" && sl.zone === "FWD") || (c.amp === "дирижёр" && sl.zone === "MID")
        || (c.amp === "стоппер" && sl.zone === "DEF") || (c.amp === "сейвер" && sl.zone === "GK") ? 0.18 : 0;
      if (sl.zone === "FWD") atk += (1.1 + rare + star + ampBonus) * fitMul;
      if (sl.zone === "MID") { atk += (0.55 + rare * 0.5 + star * 0.5 + ampBonus) * fitMul; def += 0.22 * fitMul; }
      if (sl.zone === "DEF") def += (1.0 + rare + star + ampBonus) * fitMul;
      if (sl.zone === "GK") def += (1.2 + rare + star + ampBonus) * fitMul;
    }
    if (fitN) { combos.push({ id: "FIT", name: "FIT×" + fitN }); atk += fitN * 0.08; def += fitN * 0.06; }
    for (const tag of this.TAGS) {
      const idxs = [];
      for (let i = 0; i < slots.length; i++) if (slots[i].card?.tag === tag) idxs.push(i);
      if (idxs.length >= 2) {
        for (let a = 0; a < idxs.length; a++) for (let b = a + 1; b < idxs.length; b++) links.push({ a: idxs[a], b: idxs[b], tag });
        const ru = (this.TAG_RU[tag] || tag).toUpperCase();
        if (idxs.length >= 3) {
          combos.push({ id: "TRAIT3_" + tag, name: ru + "×3" });
          if (tag === "Wall") def += 0.45; else atk += 0.35;
        } else {
          combos.push({ id: "TRAIT2_" + tag, name: ru + "×2" });
          if (tag === "Wall") def += 0.28; else atk += 0.2;
        }
      }
    }
    const hasZ = (z, t) => filled.some((sl) => sl.zone === z && sl.card.tag === t);
    if (hasZ("MID", "Poss") && hasZ("FWD", "Cntr")) { combos.push({ id: "ENGINE", name: "ENGINE" }); atk += 0.4; }
    if (hasZ("DEF", "Wall") && hasZ("GK", "Wall")) { combos.push({ id: "WALLCHAIN", name: "WALLCHAIN" }); def += 0.4; }
    if (filled.filter((sl) => sl.card.tag === "Press" && (sl.zone === "DEF" || sl.zone === "MID")).length >= 2) {
      combos.push({ id: "PRESSLINE", name: "PRESSLINE" }); atk += 0.15; def += 0.15;
    }
    return { atk, def, syn: this.synergies(slots), combos, links, fitN };
  },
  power(slots) { return this.comboReport(slots); },

  zoneIndex(slots, zone) {
    const idxs = [];
    for (let i = 0; i < slots.length; i++) if (slots[i].card && slots[i].zone === zone) idxs.push(i);
    return idxs;
  },
  pickZone(slots, zone) {
    const idxs = this.zoneIndex(slots, zone);
    return idxs.length ? idxs[(Math.random() * idxs.length) | 0] : -1;
  },
  pickAny(slots) {
    const idxs = [];
    for (let i = 0; i < slots.length; i++) if (slots[i].card) idxs.push(i);
    return idxs.length ? idxs[(Math.random() * idxs.length) | 0] : -1;
  },

  /**
   * Formation push: attackers enter opp half — teams CROSS on the pitch.
   * us attack → our FWD/MID go to y~80-200 (opp half); opp DEF drops to mark.
   */
  applyFormations(s, attackSide) {
    const P = this.PITCH;
    const mid = P.midY;
    for (const sl of s.ours) {
      if (!sl.card) continue;
      const lane = (sl.homeX - 180) * 0.9 + 180;
      if (attackSide === "us") {
        if (sl.zone === "GK") { sl.formX = lane; sl.formY = P.y1 - 28; }
        else if (sl.zone === "DEF") { sl.formX = lane; sl.formY = mid + 40 + Math.random() * 20; }
        else if (sl.zone === "MID") { sl.formX = lane + (Math.random() - 0.5) * 30; sl.formY = mid - 20 - Math.random() * 50; }
        else { sl.formX = lane + (Math.random() - 0.5) * 40; sl.formY = P.y0 + 55 + Math.random() * 50; } // into opp box
      } else {
        if (sl.zone === "GK") { sl.formX = lane; sl.formY = P.y1 - 24; }
        else if (sl.zone === "DEF") { sl.formX = lane; sl.formY = P.y1 - 90 - Math.random() * 30; }
        else if (sl.zone === "MID") { sl.formX = lane; sl.formY = mid + 10 + Math.random() * 40; }
        else { sl.formX = lane; sl.formY = mid - 10; }
      }
    }
    for (const sl of s.opp) {
      if (!sl.card) continue;
      const lane = (sl.homeX - 180) * 0.9 + 180;
      if (attackSide === "opp") {
        if (sl.zone === "GK") { sl.formX = lane; sl.formY = P.y0 + 22; }
        else if (sl.zone === "DEF") { sl.formX = lane; sl.formY = mid - 40 - Math.random() * 20; }
        else if (sl.zone === "MID") { sl.formX = lane + (Math.random() - 0.5) * 30; sl.formY = mid + 10 + Math.random() * 50; }
        else { sl.formX = lane + (Math.random() - 0.5) * 40; sl.formY = P.y1 - 70 - Math.random() * 45; } // into our box
      } else {
        // defending vs us — drop deep and MARK
        if (sl.zone === "GK") { sl.formX = lane; sl.formY = P.y0 + 22; }
        else if (sl.zone === "DEF") { sl.formX = lane; sl.formY = P.y0 + 70 + Math.random() * 35; }
        else if (sl.zone === "MID") { sl.formX = lane; sl.formY = mid - 50 - Math.random() * 30; }
        else { sl.formX = lane; sl.formY = mid - 10; }
      }
    }
    // marking: opp DEF tracks nearest our FWD when we attack
    if (attackSide === "us") {
      const fwds = s.ours.filter((x) => x.card && x.zone === "FWD");
      const defs = s.opp.filter((x) => x.card && x.zone === "DEF");
      defs.forEach((d, i) => {
        const t = fwds[i % Math.max(1, fwds.length)];
        if (t) { d.formX = t.formX + (Math.random() - 0.5) * 18; d.formY = t.formY + 18; }
      });
    } else {
      const fwds = s.opp.filter((x) => x.card && x.zone === "FWD");
      const defs = s.ours.filter((x) => x.card && x.zone === "DEF");
      defs.forEach((d, i) => {
        const t = fwds[i % Math.max(1, fwds.length)];
        if (t) { d.formX = t.formX + (Math.random() - 0.5) * 18; d.formY = t.formY - 18; }
      });
    }
  },

  clampPitch(x, y) {
    const P = this.PITCH;
    return {
      x: Math.max(P.x0, Math.min(P.x1, x)),
      y: Math.max(P.y0, Math.min(P.y1, y)),
    };
  },

  updateRunners(s, dt) {
    const units = this.allFilled(s);
    for (const { sl } of units) {
      if (s.phase !== "fight") {
        sl.tx = sl.homeX + Math.sin(s.pulse * 2 + sl.homeX) * 2;
        sl.ty = sl.homeY + Math.cos(s.pulse * 1.6 + sl.homeY) * 1.5;
      } else {
        // chase formation + noise + ball magnet for hot / nearby
        let tx = sl.formX;
        let ty = sl.formY;
        if (s.ball.visible) {
          const dx = s.ball.x - sl.px;
          const dy = s.ball.y - sl.py;
          const dist = Math.hypot(dx, dy) || 1;
          const hot = s.hot && this.slotRef(s, s.hot.side, s.hot.index) === sl;
          const pull = hot ? 0.55 : dist < 90 ? 0.22 : 0.06;
          tx = tx * (1 - pull) + s.ball.x * pull + (Math.random() - 0.5) * 8;
          ty = ty * (1 - pull) + s.ball.y * pull + (Math.random() - 0.5) * 8;
        }
        const c = this.clampPitch(tx, ty);
        sl.tx = c.x;
        sl.ty = c.y;
      }
      const spd = s.phase === "fight" ? 5.2 + ((sl.card.stars || 1) - 1) * 0.6 : 3;
      const ax = (sl.tx - sl.px) * spd;
      const ay = (sl.ty - sl.py) * spd;
      sl.vx = sl.vx * 0.7 + ax * 0.3;
      sl.vy = sl.vy * 0.7 + ay * 0.3;
      sl.px += sl.vx * dt;
      sl.py += sl.vy * dt;
      const c2 = this.clampPitch(sl.px, sl.py);
      sl.px = c2.x;
      sl.py = c2.y;
    }
    // soft separation — allows crossing lanes without stacking
    for (let i = 0; i < units.length; i++) {
      for (let j = i + 1; j < units.length; j++) {
        const a = units[i].sl, b = units[j].sl;
        let dx = b.px - a.px, dy = b.py - a.py;
        let d = Math.hypot(dx, dy) || 0.01;
        const minD = a.side === b.side ? 22 : 16; // opponents can get closer (duels)
        if (d < minD) {
          const push = (minD - d) * 0.5;
          dx /= d; dy /= d;
          a.px -= dx * push; a.py -= dy * push;
          b.px += dx * push; b.py += dy * push;
        }
      }
    }
  },

  addCoins(s, amount, label, x, y) {
    if (amount <= 0) return;
    s.coins += amount;
    s.roundCoins += amount;
    s.coinFx.push({ t: 0.9, text: "+" + amount + "🪙 " + label, x: x || 180, y: y || 220 });
  },

  oppThink(s, api) {
    s.oppCoins += Math.max(3, s.roundCoins + Math.min(5, (s.oppCoins / 10) | 0));
    for (let buys = 0; buys < 3; buys++) {
      const fieldCards = s.opp.map((x) => x.card).filter(Boolean);
      let hero = api.pick(this.heroes());
      if (fieldCards.length && Math.random() < 0.6) {
        hero = this.heroes().find((h) => h.name === api.pick(fieldCards).name) || hero;
      }
      const price = this.PRICE[hero.rarity] || 3;
      if (s.oppCoins < price) break;
      const copies = s.opp.filter((sl) => sl.card && sl.card.name === hero.name && (sl.card.stars || 1) === 1);
      if (copies.length >= 2) {
        s.oppCoins -= price;
        copies[0].card = this.mintCard(api, hero, 2);
        this.resetRunner(copies[0]);
        copies[1].card = null;
        continue;
      }
      if (this.filled(s.opp) >= this.filled(s.ours) + 1) break;
      const empty = s.opp.find((sl) => !sl.card && sl.zone === hero.role) || s.opp.find((sl) => !sl.card);
      if (!empty) break;
      s.oppCoins -= price;
      this.placeCard(empty, this.mintCard(api, hero, 1));
    }
    for (const name of new Set(s.opp.filter((x) => x.card).map((x) => x.card.name))) {
      for (let stars = 1; stars <= 2; stars++) {
        const slots = s.opp.filter((sl) => sl.card && sl.card.name === name && (sl.card.stars || 1) === stars);
        if (slots.length >= 3) {
          const h = this.heroes().find((x) => x.name === name);
          slots[0].card = this.mintCard(api, h, stars + 1);
          this.resetRunner(slots[0]);
          slots[1].card = null;
          slots[2].card = null;
        }
      }
    }
  },

  passPath(slots, attackSide) {
    // build a path that progresses toward goal — may zigzag across pitch
    const order = attackSide === "us" ? ["GK", "DEF", "MID", "MID", "FWD"] : ["GK", "DEF", "MID", "MID", "FWD"];
    const path = [];
    const used = new Set();
    for (const z of order) {
      const opts = [];
      for (let i = 0; i < slots.length; i++) {
        if (slots[i].card && slots[i].zone === z && !used.has(i)) opts.push(i);
      }
      if (!opts.length) {
        const any = this.pickAny(slots);
        if (any >= 0 && !used.has(any)) { path.push(any); used.add(any); }
        continue;
      }
      const i = opts[(Math.random() * opts.length) | 0];
      path.push(i);
      used.add(i);
    }
    return path;
  },

  enqueueRound(s) {
    const us = this.power(s.ours);
    const them = this.power(s.opp);
    const hasCombo = (id) => us.combos.some((c) => c.id === id || c.id.indexOf(id) === 0);
    const myAtk = us.atk + s.momentum * 0.08 + s.timeoutBoost * 0.35 + (s.cornerNext ? 0.28 : 0);
    const myDef = us.def + s.oppYellow * 0.22;
    const oppAtk = them.atk - s.oppYellow * 0.2;
    const oppDef = them.def;
    s.cornerNext = false;
    s.timeoutBoost = Math.max(0, s.timeoutBoost - 1);
    s.roundCoins = 0;
    s.activeCombos = us.combos;

    const poss = 0.4 + 0.07 * (myAtk - oppAtk) + (hasCombo("ENGINE") ? 0.06 : 0) + (us.syn.includes("Poss") ? 0.05 : 0);
    const weAttack = Math.random() < Math.max(0.32, Math.min(0.68, poss));
    const attackSide = weAttack ? "us" : "opp";
    s.match.attackSide = attackSide;
    this.applyFormations(s, attackSide);

    const events = [];
    events.push({ kind: "kickoff" });
    events.push({ kind: "whistle", text: s.minute + "'" });
    if (us.combos.length) events.push({ kind: "comboshow", text: us.combos.map((c) => c.name).slice(0, 3).join(" · ") });

    if (weAttack) {
      const path = this.passPath(s.ours, "us");
      events.push({ kind: "possess", side: "us", text: "Владение · идём вперёд", coins: 2 });
      events.push({ kind: "shape", attackSide: "us" });
      for (let i = 0; i < path.length; i++) {
        const idx = path[i];
        const card = s.ours[idx].card;
        const prev = i > 0 ? s.ours[path[i - 1]].card : null;
        events.push({ kind: "pass", side: "us", index: idx, text: "Пас · " + card.name, run: true });
        if (prev && prev.tag === card.tag) {
          events.push({ kind: "link", side: "us", index: idx, tag: card.tag, text: "Связка " + (this.TAG_RU[card.tag] || card.tag), coins: 2 });
        }
        // opp press attempt mid-build
        if (i === 2 && Math.random() < 0.35) {
          const di = this.pickZone(s.opp, "MID");
          if (di >= 0) events.push({ kind: "press", side: "opp", index: di, text: "Прессинг · " + s.opp[di].card.name });
        }
        if ((card.stars || 1) >= 2 && Math.random() < 0.4) {
          events.push({ kind: "star", side: "us", index: idx, text: "★ " + card.amp + " · " + card.name, coins: 1 });
        }
      }
      let shootI = path[path.length - 1];
      const fwds = path.filter((i) => s.ours[i].zone === "FWD");
      if (fwds.length) shootI = fwds[fwds.length - 1];
      const shooter = shootI >= 0 ? s.ours[shootI].card : null;
      let chance = 0.2 + 0.08 * (myAtk - oppDef) + ((shooter && shooter.stars) || 1) * 0.03;
      if (shooter?.skill === "long") chance += 0.08;
      if (hasCombo("ENGINE")) chance += 0.07;
      chance = Math.max(0.1, Math.min(0.42, chance));
      events.push({ kind: "shot", side: "us", index: shootI, text: (shooter?.skill === "long" ? "Дальний — " : "Удар — ") + (shooter?.name || "?"), coins: 2 });
      const oppGk = this.pickZone(s.opp, "GK");
      if (oppGk >= 0) events.push({ kind: "ballfly", side: "opp", index: oppGk, text: "В створ!", dash: true });
      events.push({ kind: "resolve", who: "us", chance, shooter, gk: oppGk >= 0 ? s.opp[oppGk].card : null });
    } else {
      const path = this.passPath(s.opp, "opp");
      events.push({ kind: "possess", side: "opp", text: "Их атака · забегаем в нашу половину" });
      events.push({ kind: "shape", attackSide: "opp" });
      for (const idx of path) {
        events.push({ kind: "pass", side: "opp", index: idx, text: "Пас · " + s.opp[idx].card.name, run: true });
      }
      const defI = this.pickZone(s.ours, "DEF");
      const midI = this.pickZone(s.ours, "MID");
      const duelI = defI >= 0 && Math.random() < 0.55 ? defI : midI;
      if (duelI >= 0) {
        let duelP = 0.45 + myDef * 0.08 + (hasCombo("PRESSLINE") ? 0.12 : 0);
        if (Math.random() < duelP) {
          const kind = s.ours[duelI].zone === "MID" ? "intercept" : "tackle";
          events.push({
            kind: "duel_win", side: "us", index: duelI,
            text: (kind === "intercept" ? "Перехват · " : "Отбор · ") + s.ours[duelI].card.name,
            coins: kind === "intercept" ? 4 : 3,
          });
          // counter!
          if (hasCombo("ENGINE") || Math.random() < 0.45) {
            events.push({ kind: "shape", attackSide: "us" });
            events.push({ kind: "possess", side: "us", text: "КОНТРАТАКА!", coins: 2 });
            const ci = this.pickZone(s.ours, "FWD");
            if (ci >= 0) {
              events.push({ kind: "pass", side: "us", index: ci, text: "Вперёд · " + s.ours[ci].card.name, run: true });
              let chance = 0.22 + 0.06 * (myAtk - oppDef);
              events.push({ kind: "shot", side: "us", index: ci, text: "Контр-удар · " + s.ours[ci].card.name, coins: 2 });
              const ogk = this.pickZone(s.opp, "GK");
              if (ogk >= 0) events.push({ kind: "ballfly", side: "opp", index: ogk, dash: true, text: "Удар!" });
              events.push({ kind: "resolve", who: "us", chance, shooter: s.ours[ci].card, gk: ogk >= 0 ? s.opp[ogk].card : null });
            }
          }
        } else {
          events.push({ kind: "duel", side: "us", index: duelI, text: "Единоборство · " + s.ours[duelI].card.name });
        }
      }
      let chance = 0.18 + 0.08 * (oppAtk - myDef) - (hasCombo("WALLCHAIN") ? 0.08 : 0);
      chance = Math.max(0.08, Math.min(0.36, chance));
      const shootI = path.length ? path[path.length - 1] : this.pickZone(s.opp, "FWD");
      events.push({ kind: "shot", side: "opp", index: shootI, text: "Удар соперника" });
      const ourGk = this.pickZone(s.ours, "GK");
      if (ourGk >= 0) events.push({ kind: "ballfly", side: "us", index: ourGk, dash: true, text: "В наши ворота!" });
      events.push({ kind: "resolve", who: "them", chance, shooter: shootI >= 0 ? s.opp[shootI].card : null, gk: ourGk >= 0 ? s.ours[ourGk].card : null, wallchain: hasCombo("WALLCHAIN") });
    }

    if (Math.random() < 0.16) events.push({ kind: "yellow" });
    else if (Math.random() < 0.14) events.push({ kind: "corner" });

    s.queue = events;
    s.beatT = 0.08;
  },

  ballToPlayer(s, side, index, dash) {
    const sl = this.slotRef(s, side, index);
    if (!sl) return;
    s.hot = { side, index };
    s.ball.owner = { side, index };
    s.trail.push({ x: s.ball.x, y: s.ball.y, life: 0.5 });
    // lead pass ahead of runner
    const lead = dash ? 0.05 : 0.35;
    s.ball.tx = sl.px + sl.vx * lead;
    s.ball.ty = sl.py + sl.vy * lead;
    s.ball.moving = true;
    s.ball.visible = true;
    s.ball.dash = !!dash;
    // carrier sprints toward ball / forward
    sl.tx = s.ball.tx;
    sl.ty = s.ball.ty;
  },

  applyResolve(s, ev) {
    if (ev.kind === "yellow") {
      s.oppYellow += 1;
      s.banner = "ЖЁЛТАЯ"; s.bannerColor = "#fbbf24"; s.bannerT = 1.0;
      s.subline = "Их игрок под давлением";
      this.addCoins(s, 1, "фол", 180, 210);
      s.momentum += 1;
      return;
    }
    if (ev.kind === "corner") {
      s.cornerNext = true;
      s.banner = "УГЛОВОЙ"; s.bannerColor = "#38bdf8"; s.bannerT = 0.95;
      s.subline = "След. атака острее";
      this.addCoins(s, 1, "угловой", 180, 210);
      return;
    }
    if (ev.kind !== "resolve") return;
    if (ev.who === "us") {
      if (Math.random() < ev.chance) {
        s.myGoals += 1;
        s.banner = "ГОООЛ!"; s.bannerColor = "#fbbf24"; s.bannerT = 1.5;
        s.subline = ev.shooter ? ev.shooter.name + " " + this.starLabel(ev.shooter) : "";
        s.camShake = 0.5;
        s.momentum += 2;
        this.addCoins(s, 8, "гол", 180, 200);
      } else {
        const m = Math.random();
        if (m < 0.33) { s.banner = "ШТАНГА!"; s.subline = "Каркас"; }
        else if (m < 0.66) { s.banner = "СЕЙВ · " + (ev.gk?.name || "GK"); s.subline = "Их вратарь"; }
        else { s.banner = "МИМО"; s.subline = "Будет ещё"; }
        s.bannerColor = "#94a3b8"; s.bannerT = 1.05;
        s.momentum += 0.4;
      }
    } else {
      let saveBonus = 0;
      if (ev.gk) {
        saveBonus = (ev.gk.rarity === "SR" ? 0.12 : 0.05) + ((ev.gk.stars || 1) - 1) * 0.06;
        if (ev.gk.skill === "save") saveBonus += 0.05;
      }
      if (ev.wallchain) saveBonus += 0.1;
      if (Math.random() < Math.max(0.06, ev.chance - saveBonus)) {
        s.oppGoals += 1;
        s.banner = "ПРОПУСТИЛИ"; s.bannerColor = "#f07178"; s.bannerT = 1.4;
        s.subline = ev.shooter?.name || "";
        s.camShake = 0.4;
        s.momentum = Math.max(0, s.momentum - 1);
      } else {
        s.banner = ev.gk ? ("СЕЙВ · " + ev.gk.name) : "ОТБОЙ";
        s.bannerColor = "#c4b5fd"; s.bannerT = 1.15;
        s.subline = "Ворота целы";
        this.addCoins(s, 3, "сейв", 180, 320);
        s.momentum += 0.5;
      }
    }
  },

  stepQueue(s) {
    if (!s.queue.length) return;
    const ev = s.queue.shift();
    if (ev.coins) {
      const sl = ev.side != null && ev.index >= 0 ? this.slotRef(s, ev.side, ev.index) : null;
      this.addCoins(s, ev.coins, (ev.text || "").split("·")[0].trim(), sl ? sl.px : 180, sl ? sl.py : 220);
    }
    if (ev.kind === "kickoff") {
      s.ball.x = 180; s.ball.y = this.PITCH.midY; s.ball.visible = true; s.ball.moving = false;
      this.applyFormations(s, "us");
      // both teams jog toward mid for kickoff feel
      for (const { sl } of this.allFilled(s)) {
        sl.formY = sl.side === "us" ? this.PITCH.midY + 35 : this.PITCH.midY - 35;
      }
      s.subline = "Свисток · розыгрыш с центра";
      s.beatT = 0.7;
      return;
    }
    if (ev.kind === "shape") {
      this.applyFormations(s, ev.attackSide);
      s.match.attackSide = ev.attackSide;
      s.beatT = 0.45;
      return;
    }
    if (ev.kind === "whistle") { s.subline = ev.text; s.beatT = 0.3; return; }
    if (ev.kind === "comboshow") {
      s.banner = "КОМБО"; s.bannerColor = "#fde68a"; s.bannerT = 0.95;
      s.subline = ev.text; s.beatT = 0.8; return;
    }
    if (ev.kind === "possess") { s.subline = ev.text; s.beatT = 0.4; return; }
    if (ev.kind === "pass" || ev.kind === "shot" || ev.kind === "duel" || ev.kind === "duel_win" || ev.kind === "press" || ev.kind === "ballfly") {
      if (ev.side != null && ev.index >= 0) this.ballToPlayer(s, ev.side, ev.index, ev.dash || ev.kind === "ballfly");
      s.subline = ev.text || "";
      if (ev.kind === "duel_win") {
        s.banner = ev.text.indexOf("Перехват") >= 0 ? "ПЕРЕХВАТ" : "ОТБОР";
        s.bannerColor = "#86efac"; s.bannerT = 0.75;
      }
      s.beatT = ev.dash || ev.kind === "ballfly" ? 0.4 : ev.kind === "shot" ? 0.7 : 0.55;
      return;
    }
    if (ev.kind === "link" || ev.kind === "star") {
      if (ev.side != null) s.hot = { side: ev.side, index: ev.index };
      s.banner = ev.kind === "link" ? ("СВЯЗКА " + (this.TAG_RU[ev.tag] || "")) : ev.text;
      s.bannerColor = ev.kind === "link" ? "#38bdf8" : "#fbbf24";
      s.bannerT = 0.7; s.subline = ev.text; s.beatT = 0.55; return;
    }
    if (ev.kind === "resolve" || ev.kind === "yellow" || ev.kind === "corner") {
      this.applyResolve(s, ev);
      // reset toward mid-block after chance
      this.applyFormations(s, s.match.attackSide === "us" ? "opp" : "us");
      s.beatT = 1.15;
      return;
    }
    s.beatT = 0.3;
  },

  enterShop(s, api, afterRound) {
    s.phase = "shop";
    s.ball.visible = false;
    s.queue = [];
    s.hot = null;
    s.selected = null;
    s.skill.x = -999;
    s.speed.x = -999;
    s.reroll.x = 12; s.reroll.y = api.h - 64;
    s.sell.x = api.w - 100; s.sell.y = api.h - 64;
    s.start.label = s.round >= this.ROUNDS ? "Итог" : "В бой!";
    s.start.color = "#3dd68c";
    const interest = Math.min(5, (s.coins / 10) | 0);
    if (afterRound) {
      if (interest) s.coins += interest;
      this.oppThink(s, api);
      s.shopNote = "+" + s.roundCoins + "🪙" + (interest ? " +%" + interest : "") + " · они " + this.filled(s.opp) + " чел · копи для ★";
    } else s.shopNote = "Позиция×амплуа×характер · 3 копии=★ · потом матч";
    this.refreshShop(s, api);
    for (const sl of [...s.ours, ...s.opp]) if (sl.card) this.resetRunner(sl);
  },

  startFight(s, api) {
    s.phase = "fight";
    s.selected = null;
    s.skillLeft = 1;
    s.timeoutBoost = 0;
    s.roundCoins = 0;
    s.banner = null;
    s.reroll.x = -999; s.sell.x = -999;
    s.skill.x = 10; s.skill.y = 8;
    s.speed.x = 88; s.speed.y = 8;
    s.start.label = s.minute + "'";
    s.start.color = "#334155";
    s.ball.visible = true;
    s.ball.x = 180; s.ball.y = this.PITCH.midY;
    for (const sl of [...s.ours, ...s.opp]) if (sl.card) this.resetRunner(sl);
    this.enqueueRound(s);
  },

  endMatch(s, api) {
    s.phase = "done";
    s.ball.visible = false;
    s.skill.x = -999; s.speed.x = -999; s.reroll.x = -999; s.sell.x = -999;
    const win = s.myGoals > s.oppGoals;
    const draw = s.myGoals === s.oppGoals;
    if (win) s.wins += 1; else if (!draw) s.losses += 1;
    s.lastResult = draw ? "draw" : win ? "win" : "lose";
    s.start.label = "Ещё"; s.start.color = "#5db0ff";
    api.setHud((draw ? "Ничья " : win ? "Победа " : "Поражение ") + s.myGoals + ":" + s.oppGoals);
  },

  buyOffer(s, api, i) {
    const offer = s.shop[i];
    if (!offer) return;
    if (s.coins < offer.price) { s.shopNote = "Нужно " + offer.price + "🪙"; return; }
    if (s.bench.length >= 8) { s.shopNote = "Скамейка полна"; return; }
    s.coins -= offer.price;
    s.bench.push(offer.card);
    s.shop[i] = null;
    const m = this.tryMergeAll(s, api);
    s.shopNote = m ? ("MERGE " + m.name + " " + this.starLabel(m)) : ("Купил " + offer.card.name + " · ещё копии для ★");
  },

  updateShop(s, api) {
    s.skill.x = -999; s.speed.x = -999;
    s.reroll.x = 12; s.reroll.y = api.h - 64;
    s.sell.x = api.w - 100; s.sell.y = api.h - 64;
    s.reroll.label = "Реролл 2";
    if (s.reroll.clicked) {
      if (s.coins >= 2) { s.coins -= 2; this.refreshShop(s, api); s.shopNote = "Реролл · ищи копии"; }
      else s.shopNote = "Нужно 2🪙";
    }
    if (s.sell.clicked && s.selected) {
      if (s.selected.from === "bench") {
        const c = s.bench[s.selected.index];
        if (c) { s.coins += this.sellValue(c); s.bench.splice(s.selected.index, 1); s.selected = null; s.shopNote = "Продано"; }
      } else if (s.selected.from === "field") {
        const sl = s.ours[s.selected.index];
        if (sl?.card) { s.coins += this.sellValue(sl.card); sl.card = null; s.selected = null; s.shopNote = "Продано"; }
      }
    }
    const tap = api.input.consumeTap();
    if (tap) {
      for (let i = 0; i < 3; i++) {
        const r = this.shopRect(i);
        if (tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y && tap.y <= r.y + r.h) { this.buyOffer(s, api, i); return; }
      }
      for (let i = 0; i < s.bench.length; i++) {
        const r = this.benchRect(s, i);
        if (tap.x >= r.x && tap.x <= r.x + r.w && tap.y >= r.y && tap.y <= r.y + r.h) { s.selected = { from: "bench", index: i }; return; }
      }
      for (let i = 0; i < s.ours.length; i++) {
        const sl = s.ours[i];
        if (tap.x >= sl.x && tap.x <= sl.x + sl.w && tap.y >= sl.y && tap.y <= sl.y + sl.h) {
          if (s.selected?.from === "bench") {
            const card = s.bench[s.selected.index];
            if (!card) break;
            if (sl.card) { const tmp = sl.card; this.placeCard(sl, card); s.bench[s.selected.index] = tmp; }
            else { this.placeCard(sl, card); s.bench.splice(s.selected.index, 1); }
            s.selected = null;
            this.tryMergeAll(s, api);
          } else if (sl.card) {
            if (s.bench.length < 8) { s.bench.push(sl.card); sl.card = null; }
            else s.selected = { from: "field", index: i };
          }
          return;
        }
      }
    }
    if (s.start.clicked) {
      if (s.round >= this.ROUNDS) { this.endMatch(s, api); return; }
      if (this.filled(s.ours) >= 3) this.startFight(s, api);
      else s.shopNote = "Нужно ≥3 (" + this.filled(s.ours) + "/3)";
    }
    const report = this.comboReport(s.ours);
    api.setHud("🪙" + s.coins + " · " + this.filled(s.ours) + "v" + this.filled(s.opp) + " · [" +
      (report.combos.map((c) => c.name).join(",") || "нет комбо") + "] · " + s.shopNote);
  },

  update(s, api, dt) {
    const dts = dt * (s.phase === "fight" ? s.timeScale : 1);
    s.pulse += dts;
    if (s.bannerT > 0) s.bannerT -= dts;
    if (s.camShake > 0) s.camShake -= dts;
    for (const f of s.coinFx) f.t -= dts;
    s.coinFx = s.coinFx.filter((f) => f.t > 0);
    this.updateRunners(s, dts);

    // ball: follow flight or stick to owner
    if (s.ball.moving) {
      const spd = s.ball.dash ? 16 : 9;
      s.ball.x += (s.ball.tx - s.ball.x) * Math.min(1, dts * spd);
      s.ball.y += (s.ball.ty - s.ball.y) * Math.min(1, dts * spd);
      if (Math.hypot(s.ball.tx - s.ball.x, s.ball.ty - s.ball.y) < 4) {
        s.ball.x = s.ball.tx; s.ball.y = s.ball.ty; s.ball.moving = false;
      }
    } else if (s.ball.owner && s.phase === "fight") {
      const sl = this.slotRef(s, s.ball.owner.side, s.ball.owner.index);
      if (sl?.card) {
        s.ball.x += (sl.px - s.ball.x) * Math.min(1, dts * 10);
        s.ball.y += (sl.py - 10 - s.ball.y) * Math.min(1, dts * 10);
      }
    }
    for (const t of s.trail) t.life -= dts;
    s.trail = s.trail.filter((t) => t.life > 0);

    if (s.phase === "done") {
      s.skill.x = -999; s.speed.x = -999; s.reroll.x = -999; s.sell.x = -999;
      if (s.start.clicked || api.input.consumeTap()) {
        Object.assign(s, this.fresh(api, {
          startBtn: s.start, skill: s.skill, reroll: s.reroll, sell: s.sell, speed: s.speed,
        }, { wins: s.wins, losses: s.losses }));
      }
      return;
    }
    if (s.phase === "shop") { this.updateShop(s, api); return; }

    // fight controls
    s.skill.x = s.skillLeft > 0 ? 10 : -999;
    s.skill.y = 8;
    s.speed.x = 88; s.speed.y = 8;
    s.speed.label = s.timeScale > 1 ? "×1" : "×2";
    if (s.speed.clicked) s.timeScale = s.timeScale > 1 ? 1 : 2;
    if (s.skill.clicked && s.skillLeft > 0) {
      s.skillLeft -= 1; s.timeoutBoost = 2;
      s.banner = "ТАЙМАУТ"; s.bannerColor = "#f0b429"; s.bannerT = 0.9;
      s.subline = "Атака острее";
    }

    s.beatT -= dts;
    if (s.beatT <= 0) {
      if (s.queue.length) this.stepQueue(s);
      else {
        s.round += 1;
        s.minute = Math.min(90, s.round * 10);
        if (s.round >= this.ROUNDS) {
          this.enterShop(s, api, true);
          s.start.label = "Итог";
          s.shopNote = "Финал " + s.myGoals + ":" + s.oppGoals + " · Итог";
        } else this.enterShop(s, api, true);
      }
    }
    api.setHud("🪙" + s.coins + "(+" + s.roundCoins + ") · " + s.minute + "' · " +
      s.myGoals + ":" + s.oppGoals + " · " + this.filled(s.ours) + "v" + this.filled(s.opp) +
      " · поле открыто" + (s.timeScale > 1 ? " · ×2" : "") + (s.skillLeft ? " · Таймаут" : ""));
  },

  drawPitch(ctx, w, y0, y1) {
    const h = y1 - y0;
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i % 2 ? "#1a4d30" : "#164228";
      ctx.fillRect(0, y0 + (h / 14) * i, w, h / 14 + 1);
    }
    ctx.strokeStyle = "#ffffff44";
    ctx.lineWidth = 2;
    ctx.strokeRect(14, y0 + 4, w - 28, h - 8);
    const midY = (y0 + y1) / 2;
    ctx.beginPath(); ctx.moveTo(14, midY); ctx.lineTo(w - 14, midY); ctx.stroke();
    ctx.beginPath(); ctx.arc(w / 2, midY, 28, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeRect(w / 2 - 70, y0 + 4, 140, 42);
    ctx.strokeRect(w / 2 - 70, y1 - 46, 140, 42);
    // goals
    ctx.fillStyle = "#ffffff22";
    ctx.fillRect(w / 2 - 28, y0 + 2, 56, 6);
    ctx.fillRect(w / 2 - 28, y1 - 8, 56, 6);
  },

  drawUnit(ctx, sl, hot, pulse, fightMode) {
    if (!sl.card) {
      if (!fightMode) {
        ctx.strokeStyle = "#ffffff22";
        ctx.strokeRect(sl.x, sl.y, sl.w, sl.h);
        ctx.fillStyle = "#ffffff33";
        ctx.font = "8px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(sl.zone, sl.x + sl.w / 2, sl.y + sl.h / 2 + 3);
      }
      return;
    }
    const c = sl.card;
    const isOpp = sl.side === "opp";
    const speed = Math.hypot(sl.vx, sl.vy);
    const bob = Math.sin(pulse * (12 + speed * 0.4) + sl.homeX) * (hot ? 2.2 : 1);
    const lean = Math.max(-4, Math.min(4, sl.vx * 0.08));

    if (fightMode) {
      // match-like jersey dots — teams can overlap visually
      const r = 11 + ((c.stars || 1) - 1) * 1.5;
      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(sl.px, sl.py + r * 0.7, r * 0.7, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sl.px + lean, sl.py + bob, r, 0, Math.PI * 2);
      ctx.fillStyle = isOpp ? "#b91c1c" : "#15803d";
      ctx.fill();
      ctx.strokeStyle = hot ? "#fff" : (this.TAG_COLOR[c.tag] || "#fff");
      ctx.lineWidth = hot ? 2.5 : 1.5;
      ctx.stroke();
      if (!isOpp && c.role === sl.zone) {
        ctx.strokeStyle = "#86efac88";
        ctx.beginPath();
        ctx.arc(sl.px + lean, sl.py + bob, r + 3, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = "#fff";
      ctx.font = "bold 8px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(c.name.slice(0, 5), sl.px, sl.py + bob - r - 3);
      ctx.fillStyle = "#fde68a";
      ctx.font = "7px Segoe UI, sans-serif";
      ctx.fillText(this.starLabel(c), sl.px, sl.py + bob + r + 9);
      return;
    }

    // shop card face
    const pw = sl.w - 4, ph = sl.h - 2;
    const x = sl.px - pw / 2 + lean, y = sl.py - ph / 2 + bob;
    ctx.fillStyle = isOpp ? "#7f1d1d" : "#14532d";
    ctx.fillRect(x, y, pw, ph);
    ctx.fillStyle = this.ROLE_COLORS[c.role];
    ctx.fillRect(x + 2, y + 2, pw - 4, 7);
    if (!isOpp && c.role === sl.zone) { ctx.strokeStyle = "#86efac"; ctx.lineWidth = 2; ctx.strokeRect(x - 1, y - 1, pw + 2, ph + 2); }
    ctx.strokeStyle = this.RARITY_EDGE[c.rarity];
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, pw, ph);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(c.name, sl.px, y + 18);
    ctx.fillStyle = this.TAG_COLOR[c.tag] || "#ddd";
    ctx.font = "7px Segoe UI, sans-serif";
    ctx.fillText((c.amp || "") + "·" + (this.TAG_RU[c.tag] || ""), sl.px, y + 28);
    ctx.fillStyle = "#fde68a";
    ctx.fillText(this.starLabel(c), sl.px, y + 36);
  },

  drawCardMini(ctx, x, y, w, h, card, selected, price) {
    ctx.fillStyle = "#166534";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = selected ? "#fff" : this.RARITY_EDGE[card.rarity];
    ctx.lineWidth = selected ? 2.5 : 1.5;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = this.ROLE_COLORS[card.role];
    ctx.fillRect(x + 3, y + 3, w - 6, 7);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 8px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(card.name, x + w / 2, y + 20);
    ctx.fillStyle = this.TAG_COLOR[card.tag];
    ctx.font = "7px Segoe UI, sans-serif";
    ctx.fillText(card.amp || "", x + w / 2, y + 32);
    ctx.fillText(this.TAG_RU[card.tag] || "", x + w / 2, y + 42);
    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 9px Segoe UI, sans-serif";
    ctx.fillText(price != null ? price + "🪙" : this.starLabel(card), x + w / 2, y + h - 6);
  },

  draw(s, api) {
    const { ctx, w } = api;
    ctx.save();
    ctx.translate(s.camShake > 0 ? Math.sin(s.pulse * 40) * 3 : 0, 0);
    ctx.fillStyle = "#0f1f17";
    ctx.fillRect(-10, 0, w + 20, api.h);

    const fightMode = s.phase === "fight";
    const pitchBottom = s.phase === "shop" ? 392 : 455;
    this.drawPitch(ctx, w, 48, pitchBottom);

    ctx.fillStyle = "#fca5a5";
    ctx.font = "bold 10px Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("СОПЕРНИК " + this.filled(s.opp), 16, 60);
    ctx.fillStyle = "#86efac";
    ctx.fillText("МЫ " + this.filled(s.ours), 16, pitchBottom - 6);

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(w / 2 - 78, 4, 156, 38);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 17px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(s.phase === "shop" ? "МАГАЗИН" : (s.myGoals + " : " + s.oppGoals), w / 2, 22);
    ctx.fillStyle = "#fde68a";
    ctx.font = "bold 11px Segoe UI, sans-serif";
    ctx.fillText("🪙" + s.coins + (s.phase === "fight" && s.roundCoins ? " +" + s.roundCoins : ""), w / 2, 38);

    if (!fightMode) {
      for (const sl of [...s.opp, ...s.ours]) if (!sl.card) this.drawUnit(ctx, sl, false, s.pulse, false);
    }

    // combo lines (ours)
    const report = this.comboReport(s.ours);
    if (!fightMode || s.bannerT > 0) {
      for (const link of report.links) {
        const a = s.ours[link.a], b = s.ours[link.b];
        if (!a?.card || !b?.card) continue;
        ctx.strokeStyle = this.TAG_COLOR[link.tag];
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(a.px, a.py);
        ctx.lineTo(b.px, b.py);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // draw far players first (by y) for depth
    const drawList = this.allFilled(s).sort((a, b) => a.sl.py - b.sl.py);
    for (const { sl, side, index } of drawList) {
      const hot = s.hot && s.hot.side === side && s.hot.index === index;
      this.drawUnit(ctx, sl, hot, s.pulse, fightMode);
    }

    // trails + ball
    for (const t of s.trail) {
      ctx.globalAlpha = Math.max(0, t.life * 1.6);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (s.ball.visible) {
      ctx.fillStyle = "#fffef0";
      ctx.beginPath();
      ctx.arc(s.ball.x, s.ball.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#222";
      ctx.stroke();
    }

    // combo chips
    let cx = 10;
    for (const c of report.combos.slice(0, 4)) {
      const tw = 14 + c.name.length * 5.5;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(cx, pitchBottom - 18, tw, 14);
      ctx.strokeStyle = "#fde68a";
      ctx.strokeRect(cx, pitchBottom - 18, tw, 14);
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 8px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(c.name, cx + tw / 2, pitchBottom - 8);
      cx += tw + 3;
    }

    if (s.phase !== "shop" && s.subline) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(16, pitchBottom + 2, w - 32, 18);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "11px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.subline, w / 2, pitchBottom + 15);
    }

    for (const f of s.coinFx) {
      ctx.globalAlpha = Math.min(1, f.t * 1.4);
      ctx.fillStyle = "#fde68a";
      ctx.font = "bold 11px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(f.text, f.x, f.y - (0.9 - f.t) * 26);
      ctx.globalAlpha = 1;
    }

    if (s.phase === "shop") {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(0, 392, w, 180);
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "9px Segoe UI, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("Скамейка · FIT зелёный · линии характера · 3 копии=★", 8, 398);
      s.bench.forEach((c, i) => {
        const r = this.benchRect(s, i);
        this.drawCardMini(ctx, r.x, r.y, r.w, r.h, c, s.selected?.from === "bench" && s.selected.index === i, null);
      });
      ctx.fillStyle = "#fde68a";
      ctx.fillText("Витрина", 18, 462);
      for (let i = 0; i < 3; i++) {
        const r = this.shopRect(i);
        if (s.shop[i]) this.drawCardMini(ctx, r.x, r.y, r.w, r.h, s.shop[i].card, false, s.shop[i].price);
        else { ctx.fillStyle = "#334155"; ctx.fillRect(r.x, r.y, r.w, r.h); }
      }
    }

    if (s.bannerT > 0 && s.banner) {
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(24, 190, w - 48, 48);
      ctx.fillStyle = s.bannerColor;
      ctx.font = "bold 20px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.banner, w / 2, 212);
      ctx.fillStyle = "#e2e8f0";
      ctx.font = "11px Segoe UI, sans-serif";
      ctx.fillText(s.subline || "", w / 2, 230);
    }

    ctx.restore();
    if (s.phase === "done") {
      const map = { win: ["ПОБЕДА", "#fbbf24"], lose: ["ПОРАЖЕНИЕ", "#f07178"], draw: ["НИЧЬЯ", "#94a3b8"] };
      const r = map[s.lastResult] || map.lose;
      api.drawBanner(ctx, r[0] + " " + s.myGoals + ":" + s.oppGoals, r[1]);
    }
  },
};

/* ========== 05 Merge Bazaar ========== */
window.FEEL_DEMOS["merge-bazaar"] = {
  hint: "Тап по предмету, тап по такому же тиру — merge. Заказы справа сверху. Энергия на генератор.",
  create(api) {
    const gen = api.input.addButton({ x: api.w - 108, y: api.h - 118, w: 90, h: 90, label: "Ген+1", color: "#ab47bc" });
    const cells = [];
    for (let i = 0; i < 20; i++) cells.push({ tier: 0, sel: false });
    // seed
    for (let i = 0; i < 6; i++) cells[(Math.random() * 20) | 0].tier = 1 + ((Math.random() * 2) | 0);
    return {
      gen, cells, cols: 5, rows: 4,
      energy: 25, coins: 0, orderNeed: 3, orderHave: 0, orderTier: 3,
      msg: "Слей до тира заказа",
      ox: 20, oy: 130, cw: 60, ch: 70,
    };
  },
  cellAt(s, tap) {
    const c = Math.floor((tap.x - s.ox) / s.cw);
    const r = Math.floor((tap.y - s.oy) / s.ch);
    if (c < 0 || r < 0 || c >= s.cols || r >= s.rows) return -1;
    return r * s.cols + c;
  },
  update(s, api) {
    if (s.gen.clicked && s.energy > 0) {
      const empty = s.cells.findIndex((c) => !c.tier);
      if (empty >= 0) { s.cells[empty].tier = 1; s.energy -= 1; s.msg = "Выпал тир 1"; }
    }
    const tap = api.input.consumeTap();
    if (tap) {
      const i = this.cellAt(s, tap);
      if (i >= 0 && s.cells[i].tier) {
        const sel = s.cells.findIndex((c) => c.sel);
        if (sel < 0) { s.cells[i].sel = true; }
        else if (sel === i) s.cells[i].sel = false;
        else if (s.cells[sel].tier === s.cells[i].tier && s.cells[i].tier < 6) {
          s.cells[i].tier += 1;
          s.cells[sel].tier = 0; s.cells[sel].sel = false;
          s.msg = `Merge → тир ${s.cells[i].tier}`;
          if (s.cells[i].tier === s.orderTier) {
            s.orderHave += 1; s.cells[i].tier = 0;
            if (s.orderHave >= s.orderNeed) {
              s.coins += 30; s.energy += 8; s.orderHave = 0; s.orderTier = Math.min(6, s.orderTier + (Math.random() < 0.5 ? 1 : 0));
              s.orderNeed = 2 + ((Math.random() * 3) | 0);
              s.msg = `Заказ выполнен! 🪙+30`;
            }
          }
        } else {
          s.cells[sel].sel = false; s.cells[i].sel = true;
        }
      }
    }
    api.setHud(`${s.msg} · ⚡${s.energy} · 🪙${s.coins} · заказ тир${s.orderTier} ${s.orderHave}/${s.orderNeed}`);
  },
  draw(s, api) {
    const { ctx, w, h } = api;
    const colors = ["#0000", "#81c784", "#64b5f6", "#ba68c8", "#ff8a65", "#ffd54f", "#ef5350"];
    ctx.fillStyle = "#2b2118"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#3e2723"; ctx.fillRect(10, 20, w - 20, 90);
    ctx.fillStyle = "#ffe0b2"; ctx.font = "14px Segoe UI"; ctx.textAlign = "left";
    ctx.fillText(`Заказ: ${s.orderNeed}× тир ${s.orderTier}`, 24, 50);
    ctx.fillText(`Сдано ${s.orderHave}`, 24, 74);
    s.cells.forEach((c, i) => {
      const x = s.ox + (i % s.cols) * s.cw;
      const y = s.oy + Math.floor(i / s.cols) * s.ch;
      ctx.strokeStyle = "#5d4037"; ctx.strokeRect(x, y, s.cw - 6, s.ch - 6);
      if (!c.tier) return;
      ctx.beginPath(); ctx.arc(x + 27, y + 32, c.sel ? 24 : 20, 0, Math.PI * 2);
      ctx.fillStyle = colors[c.tier]; ctx.fill();
      if (c.sel) { ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke(); }
      ctx.fillStyle = "#111"; ctx.font = "bold 14px Segoe UI"; ctx.textAlign = "center";
      ctx.fillText(String(c.tier), x + 27, y + 37);
    });
  },
};

/* ========== 06 Crystal Match3 ========== */
window.FEEL_DEMOS["crystal-archipelago"] = {
  hint: "Тап — выбрать камень, тап по соседу — свап. Собери цель за ходы.",
  create(api) {
    const n = 7;
    const grid = [];
    for (let y = 0; y < n; y++) {
      const row = [];
      for (let x = 0; x < n; x++) row.push(1 + ((Math.random() * 5) | 0));
      grid.push(row);
    }
    return {
      n, grid, sel: null, moves: 20, goal: 12, score: 0,
      ox: 25, oy: 110, cs: 42, cascading: false,
      level: 1, over: false,
    };
  },
  neighbors(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
  },
  findMatches(s) {
    const m = [];
    const n = s.n;
    for (let y = 0; y < n; y++) for (let x = 0; x < n - 2; x++) {
      const v = s.grid[y][x];
      if (v && v === s.grid[y][x + 1] && v === s.grid[y][x + 2]) {
        m.push({ x, y }, { x: x + 1, y }, { x: x + 2, y });
        let k = x + 3;
        while (k < n && s.grid[y][k] === v) { m.push({ x: k, y }); k++; }
      }
    }
    for (let x = 0; x < n; x++) for (let y = 0; y < n - 2; y++) {
      const v = s.grid[y][x];
      if (v && v === s.grid[y + 1][x] && v === s.grid[y + 2][x]) {
        m.push({ x, y }, { x, y: y + 1 }, { x, y: y + 2 });
        let k = y + 3;
        while (k < n && s.grid[k][x] === v) { m.push({ x, y: k }); k++; }
      }
    }
    // unique
    const key = new Set();
    return m.filter((p) => {
      const k = p.x + "," + p.y;
      if (key.has(k)) return false;
      key.add(k); return true;
    });
  },
  resolve(s) {
    let total = 0;
    for (let guard = 0; guard < 8; guard++) {
      const matches = this.findMatches(s);
      if (!matches.length) break;
      total += matches.length;
      for (const p of matches) s.grid[p.y][p.x] = 0;
      // gravity
      for (let x = 0; x < s.n; x++) {
        let write = s.n - 1;
        for (let y = s.n - 1; y >= 0; y--) {
          if (s.grid[y][x]) { s.grid[write][x] = s.grid[y][x]; if (write !== y) s.grid[y][x] = 0; write--; }
        }
        for (let y = write; y >= 0; y--) s.grid[y][x] = 1 + ((Math.random() * 5) | 0);
      }
    }
    return total;
  },
  update(s, api) {
    if (s.over) {
      if (api.input.consumeTap()) Object.assign(s, this.create(api));
      return;
    }
    const tap = api.input.consumeTap();
    if (tap) {
      const x = Math.floor((tap.x - s.ox) / s.cs);
      const y = Math.floor((tap.y - s.oy) / s.cs);
      if (x >= 0 && y >= 0 && x < s.n && y < s.n) {
        if (!s.sel) s.sel = { x, y };
        else if (s.sel.x === x && s.sel.y === y) s.sel = null;
        else if (this.neighbors(s.sel, { x, y }) && s.moves > 0) {
          const a = s.sel; s.sel = null;
          const tmp = s.grid[a.y][a.x]; s.grid[a.y][a.x] = s.grid[y][x]; s.grid[y][x] = tmp;
          const gained = this.resolve(s);
          if (!gained) {
            // swap back
            const t2 = s.grid[a.y][a.x]; s.grid[a.y][a.x] = s.grid[y][x]; s.grid[y][x] = t2;
          } else {
            s.moves -= 1;
            s.score += gained;
            if (s.score >= s.goal) {
              s.level += 1; s.goal += 8; s.moves += 8; s.score = 0;
              api.setHud(`Уровень ${s.level}!`);
            }
          }
        } else s.sel = { x, y };
      }
    }
    if (s.moves <= 0 && s.score < s.goal) { s.over = true; api.setHud("Ходы кончились"); }
    else api.setHud(`Ур.${s.level} · ходы ${s.moves} · цель ${s.score}/${s.goal}`);
  },
  draw(s, api) {
    const cols = ["#111", "#ef5350", "#42a5f5", "#66bb6a", "#ab47bc", "#ffca28"];
    const { ctx, w, h } = api;
    ctx.fillStyle = "#0d2b3a"; ctx.fillRect(0, 0, w, h);
    for (let y = 0; y < s.n; y++) for (let x = 0; x < s.n; x++) {
      const px = s.ox + x * s.cs, py = s.oy + y * s.cs;
      ctx.beginPath(); ctx.arc(px + 18, py + 18, 16, 0, Math.PI * 2);
      ctx.fillStyle = cols[s.grid[y][x]]; ctx.fill();
      if (s.sel && s.sel.x === x && s.sel.y === y) {
        ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
      }
    }
    if (s.over) api.drawBanner(ctx, "ПОРАЖЕНИЕ", "#f07178");
  },
};
