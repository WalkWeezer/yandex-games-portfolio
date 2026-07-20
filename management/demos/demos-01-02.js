window.FEEL_DEMOS = window.FEEL_DEMOS || {};

/* ========== 01 Neon Bullet — combat-puzzle (cones + EXIT) ========== */
window.FEEL_DEMOS["neon-bullet"] = {
  hint: "Стик/aim/Огонь · Рывок. Нож сзади = silent. Комбо → clear → EXIT.",
  COMBO_WINDOW: 2.2,
  DASH_CD: 0.85,
  DASH_DUR: 0.14,
  DASH_SPEED: 520,
  // мир больше окна; камера следует за ГГ
  WORLD: { w: 540, h: 780 },
  KIND_UNLOCK: [
    { id: "patrol", from: 1 },
    { id: "shotgun", from: 2 },
    { id: "shield", from: 3 },
  ],
  KIND_META: {
    // дальше / шире / злее — не мишени
    patrol: { color: "#f07178", label: "ПАТ", cone: 0.78, range: 165, turn: 3.4, shootCd: 0.65, bullet: 340, hear: 200, chase: 100, drop: "pistol" },
    shotgun: { color: "#fb923c", label: "ДРБ", cone: 1.1, range: 105, turn: 4.0, shootCd: 0.75, bullet: 290, pellets: 3, hear: 180, chase: 125, drop: "shotgun" },
    shield: { color: "#94a3b8", label: "ЩИТ", cone: 0.7, range: 145, turn: 2.6, shootCd: 0.7, bullet: 310, frontArmor: true, shieldHp: 3, hear: 170, chase: 85, drop: "smg" },
  },
  // одна обойма; после пусто → нож
  WEAPONS: {
    knife: { id: "knife", label: "НОЖ", ammoMax: Infinity, pellets: 1, speed: 0, life: 0.35, spread: 0, cd: 0.2, melee: true, meleeRange: 30, color: "#ffe66d" },
    pistol: { id: "pistol", label: "ПИСТ", ammoMax: 6, pellets: 1, speed: 540, life: 0.55, spread: 0.04, cd: 0.13, color: "#00f0ff" },
    shotgun: { id: "shotgun", label: "ДРОБ", ammoMax: 2, pellets: 5, speed: 440, life: 0.42, spread: 0.42, cd: 0.4, color: "#fb923c" },
    smg: { id: "smg", label: "SMG", ammoMax: 12, pellets: 1, speed: 500, life: 0.5, spread: 0.1, cd: 0.07, color: "#a78bfa" },
  },
  create(api) {
    for (let i = api.input.tapButtons.length - 1; i >= 0; i--) {
      const lab = api.input.tapButtons[i].label;
      if (["Огонь", "Рывок", "DEV∞", "м−", "м+", "GOD"].includes(lab)) api.input.tapButtons.splice(i, 1);
    }
    const dev = this.ensureDev();
    const fire = api.input.addButton({
      x: api.w - 96, y: api.h - 210, w: 78, h: 78, label: "Огонь", color: "#ff2bd6",
    });
    const dashBtn = api.input.addButton({
      x: api.w - 96, y: api.h - 300, w: 78, h: 58, label: "Рывок", color: "#00f0ff",
    });
    const yDev = 8;
    const bGod = api.input.addButton({
      x: api.w - 72, y: yDev, w: 58, h: 32, label: "DEV∞",
      color: dev.immortal ? "#22c55e" : "#64748b",
    });
    const bDown = api.input.addButton({ x: api.w - 148, y: yDev, w: 36, h: 32, label: "м−", color: "#475569" });
    const bUp = api.input.addButton({ x: api.w - 108, y: yDev, w: 36, h: 32, label: "м+", color: "#475569" });
    const s = { fire, dashBtn, bGod, bDown, bUp };
    this.reset(s, api, Math.max(1, dev.startMission | 0));
    return s;
  },
  ensureDev() {
    if (!this._dev) {
      this._dev = { immortal: false, startMission: 1, deaths: 0, byMission: Object.create(null), lastMission: 0 };
    }
    return this._dev;
  },
  registerGhostDeath(s) {
    const d = this.ensureDev();
    d.deaths += 1;
    const m = s.mission | 0;
    d.byMission[m] = (d.byMission[m] || 0) + 1;
    d.lastMission = m;
  },
  ghostDeathSummary() {
    const d = this.ensureDev();
    if (!d.deaths) return "💀0";
    const parts = Object.keys(d.byMission).map((k) => +k).sort((a, b) => a - b).map((m) => `м${m}:${d.byMission[m]}`);
    return `💀${d.deaths} · ${parts.join(" ")} · посл.м${d.lastMission}`;
  },
  handleDev(s, api) {
    const d = this.ensureDev();
    if (s.bGod && s.bGod.clicked) {
      d.immortal = !d.immortal;
      s.bGod.color = d.immortal ? "#22c55e" : "#64748b";
    }
    if (s.bDown && s.bDown.clicked) {
      d.startMission = Math.max(1, (d.startMission | 0) - 1);
      this.reset(s, api, d.startMission);
    }
    if (s.bUp && s.bUp.clicked) {
      d.startMission = Math.min(12, (d.startMission | 0) + 1);
      this.reset(s, api, d.startMission);
    }
  },
  missionSpeedMul(s) {
    return 1 + Math.max(0, (s.mission | 0) - 1) * 0.01;
  },
  maxEnemies(mission) {
    return Math.min(4, 2 + Math.floor((Math.max(1, mission) - 1) / 2));
  },
  unlockedKinds(mission) {
    return this.KIND_UNLOCK.filter((u) => mission >= u.from).map((u) => u.id);
  },
  frameWalls() {
    const W = this.WORLD;
    const t = 18;
    return [
      { x: 0, y: 0, w: W.w, h: t },
      { x: 0, y: W.h - t, w: W.w, h: t },
      { x: 0, y: 0, w: t, h: W.h },
      { x: W.w - t, y: 0, w: t, h: W.h },
    ];
  },
  /**
   * Большие локации + узкие щели (gap < 2*r игрока = не протиснуться).
   * Игрок r=10 → проход ≥22 ок; щель 16–18 = блок.
   */
  buildLayout(preset) {
    const F = this.frameWalls();
    if (preset === 0) {
      return {
        name: "Дверь",
        walls: F.concat([
          // горизонталь: проход 24px + ложная щель 16px (ГГ не протиснется)
          { x: 18, y: 360, w: 200, h: 18 },   // →218
          // gap 24: 218..242 (проход)
          { x: 242, y: 360, w: 80, h: 18 },   // →322
          // gap 16: 322..338 (блок)
          { x: 338, y: 360, w: 184, h: 18 },
          // вертикальный choke (проход 24)
          { x: 150, y: 378, w: 18, h: 160 },
          { x: 192, y: 480, w: 18, h: 120 },
          // северные укрытия
          { x: 80, y: 120, w: 90, h: 16 },
          { x: 320, y: 160, w: 16, h: 100 },
          { x: 400, y: 80, w: 70, h: 16 },
          { x: 60, y: 240, w: 16, h: 70 },
          // юг
          { x: 360, y: 520, w: 80, h: 16 },
          { x: 80, y: 600, w: 100, h: 16 },
        ]),
        exit: { x: 440, y: 50, w: 52, h: 48 },
        spawn: { x: 100, y: 700 },
        slots: [
          { kind: "patrol", x: 120, y: 180, facing: 0, mode: "patrol", waypoints: [
            { x: 120, y: 180 }, { x: 260, y: 180 }, { x: 260, y: 280 }, { x: 120, y: 280 },
          ]},
          { kind: "patrol", x: 300, y: 400, facing: Math.PI / 2, mode: "guard" },
          { kind: "shotgun", x: 420, y: 620, facing: Math.PI, mode: "guard" },
          { kind: "shield", x: 200, y: 220, facing: 0.4, mode: "guard" },
        ],
      };
    }
    if (preset === 1) {
      return {
        name: "Коридор",
        walls: F.concat([
          { x: 200, y: 18, w: 18, h: 280 },
          { x: 200, y: 320, w: 186, h: 18 }, // →386
          // ложная щель 16px: 386..402
          { x: 402, y: 320, w: 120, h: 18 },
          { x: 320, y: 450, w: 18, h: 200 },
          { x: 80, y: 500, w: 140, h: 16 },
          { x: 60, y: 200, w: 70, h: 16 },
          { x: 420, y: 560, w: 16, h: 90 },
          // choke север (проход 24): 118..142
          { x: 18, y: 140, w: 100, h: 16 },
          { x: 142, y: 140, w: 58, h: 16 },
        ]),
        exit: { x: 40, y: 50, w: 52, h: 48 },
        spawn: { x: 460, y: 700 },
        slots: [
          { kind: "patrol", x: 400, y: 200, facing: Math.PI / 2, mode: "patrol", waypoints: [
            { x: 400, y: 80 }, { x: 400, y: 280 }, { x: 280, y: 280 },
          ]},
          { kind: "shotgun", x: 260, y: 520, facing: 0, mode: "guard" },
          { kind: "patrol", x: 80, y: 280, facing: Math.PI / 2, mode: "guard" },
          { kind: "shield", x: 450, y: 480, facing: -Math.PI / 2, mode: "guard" },
        ],
      };
    }
    return {
      name: "Зал",
      walls: F.concat([
        // колонны + узкие проходы между ними (16–18 = блок для ГГ)
        { x: 140, y: 200, w: 48, h: 48 },
        { x: 204, y: 200, w: 48, h: 48 }, // щель 16 между колоннами
        { x: 340, y: 200, w: 48, h: 48 },
        { x: 160, y: 380, w: 48, h: 48 },
        { x: 280, y: 380, w: 48, h: 48 },
        { x: 220, y: 280, w: 48, h: 48 },
        // южный choke проходимый 24
        { x: 18, y: 560, w: 230, h: 16 },
        { x: 272, y: 560, w: 250, h: 16 }, // gap 24
        { x: 80, y: 640, w: 90, h: 16 },
        { x: 400, y: 100, w: 16, h: 80 },
        { x: 60, y: 100, w: 80, h: 16 },
      ]),
      exit: { x: 244, y: 40, w: 52, h: 48 },
      spawn: { x: 270, y: 700 },
      slots: [
        { kind: "patrol", x: 80, y: 160, facing: 0, mode: "patrol", waypoints: [
          { x: 80, y: 160 }, { x: 460, y: 160 },
        ]},
        { kind: "shotgun", x: 440, y: 320, facing: Math.PI, mode: "guard" },
        { kind: "shield", x: 270, y: 340, facing: Math.PI / 2, mode: "guard" },
        { kind: "patrol", x: 100, y: 480, facing: -0.3, mode: "guard" },
      ],
    };
  },
  makeEnemy(slot, mission) {
    const meta = this.KIND_META[slot.kind] || this.KIND_META.patrol;
    const mul = 1 + Math.max(0, mission - 1) * 0.01;
    return {
      kind: slot.kind,
      x: slot.x,
      y: slot.y,
      r: slot.kind === "shield" ? 12 : 11,
      hp: 1,
      facing: slot.facing || 0,
      homeFacing: slot.facing || 0,
      cone: meta.cone,
      range: meta.range,
      speed: slot.mode === "patrol" ? 48 * mul : 0,
      mode: slot.mode || "guard",
      waypoints: slot.waypoints || null,
      wi: 0,
      alert: 0,
      shootCd: Math.random() * 0.35,
      seeT: 0,
      sus: 0,
      scanT: Math.random() * 4,
      turnSpeed: meta.turn,
      baseShootCd: meta.shootCd,
      bulletSpd: meta.bullet,
      pellets: meta.pellets || 1,
      frontArmor: !!meta.frontArmor,
      shieldHp: meta.shieldHp || 0,
      shieldMax: meta.shieldHp || 0,
      drop: meta.drop || "pistol",
      color: meta.color,
      label: meta.label,
      hear: meta.hear || 160,
      chaseSpeed: (meta.chase || 90) * mul,
      lastSeen: null,
    };
  },
  pickRoster(mission, layout) {
    const unlocked = this.unlockedKinds(mission);
    const unlockedSet = new Set(unlocked);
    const cap = this.maxEnemies(mission);
    const slots = layout.slots.filter((sl) => unlockedSet.has(sl.kind));
    const rank = (id) => {
      const i = unlocked.indexOf(id);
      return i < 0 ? 0 : i;
    };
    slots.sort((a, b) => rank(b.kind) - rank(a.kind));
    const out = [];
    const counts = Object.create(null);
    for (const sl of slots) {
      if (out.length >= cap) break;
      const c = counts[sl.kind] || 0;
      const maxOf = sl.kind === "patrol" ? 2 : sl.kind === "shotgun" ? (mission >= 5 ? 2 : 1) : 1;
      if (c >= maxOf) continue;
      counts[sl.kind] = c + 1;
      out.push(this.makeEnemy(sl, mission));
    }
    if (!out.length && layout.slots[0]) out.push(this.makeEnemy({ ...layout.slots[0], kind: "patrol" }, mission));
    return out;
  },
  equipWeapon(s, id) {
    const def = this.WEAPONS[id] || this.WEAPONS.knife;
    s.weapon = {
      id: def.id,
      label: def.label,
      ammo: def.ammoMax === Infinity ? Infinity : def.ammoMax,
      ammoMax: def.ammoMax,
      pellets: def.pellets,
      speed: def.speed,
      life: def.life,
      spread: def.spread,
      cd: def.cd,
      melee: !!def.melee,
      meleeRange: def.meleeRange || 0,
      color: def.color,
    };
  },
  dropWeapon(s, e) {
    const id = e.drop || "pistol";
    const def = this.WEAPONS[id];
    if (!def || def.melee) return;
    s.pickups.push({
      x: e.x,
      y: e.y,
      r: 10,
      weaponId: id,
      label: def.label,
      color: def.color,
      ammo: def.ammoMax,
      bob: 0,
    });
  },
  tryPickup(s, api) {
    for (let i = s.pickups.length - 1; i >= 0; i--) {
      const p = s.pickups[i];
      if (api.dist(p, s.player) < s.player.r + p.r + 6) {
        this.equipWeapon(s, p.weaponId);
        s.weapon.ammo = p.ammo;
        s.pickups.splice(i, 1);
        s.shake = Math.max(s.shake, 0.06);
        s.fx.push({ x: p.x, y: p.y, vx: 0, vy: -40, life: 0.35, c: p.color });
      }
    }
  },
  reset(s, api, mission) {
    const d = this.ensureDev();
    const m = Math.max(1, mission | 0);
    d.startMission = m;
    const preset = (m - 1) % 3;
    const layout = this.buildLayout(preset);
    s.mission = m;
    s.bestMission = Math.max(s.bestMission || 1, m);
    s.layoutName = layout.name;
    s.walls = layout.walls;
    s.exit = layout.exit;
    s.world = this.WORLD;
    s.player = {
      x: layout.spawn.x,
      y: layout.spawn.y,
      r: 10,
      speed: 220,
      vx: 0,
      vy: 0,
      aim: { x: 0, y: -1 },
      inv: 0,
    };
    s.cam = { x: layout.spawn.x - api.w / 2, y: layout.spawn.y - api.h / 2 };
    s.camKick = { x: 0, y: 0 };
    s.enemies = this.pickRoster(m, layout);
    s.pickups = [];
    s.bullets = [];
    s.ebullets = [];
    s.fx = [];
    s.popups = [];
    s.trails = [];
    s.cd = 0;
    s.dashCd = 0;
    s.dashT = 0;
    s.killRush = 0;
    s.combo = 0;
    s.comboT = 0;
    s.maxCombo = 0;
    s.slowMo = 0;
    s.dead = false;
    s.won = false;
    s.shake = 0;
    s.hitstop = 0;
    s.deathT = 0;
    s.clearLatched = false;
    s.alarmT = 0;
    s.silent = true;
    s.noise = null;
    s.flash = 0;
    this.equipWeapon(s, "knife");
    this.clampCam(s, api);
    api.setHud(`М${m} «${layout.name}» · рывок · нож сзади = silent`);
  },
  clampCam(s, api) {
    const W = s.world || this.WORLD;
    s.cam.x = api.clamp(s.cam.x, 0, Math.max(0, W.w - api.w));
    s.cam.y = api.clamp(s.cam.y, 0, Math.max(0, W.h - api.h));
  },
  updateCam(s, api, dt) {
    const tx = s.player.x - api.w / 2 + s.camKick.x;
    const ty = s.player.y - api.h / 2 + s.camKick.y;
    const k = Math.min(1, 9 * dt);
    s.cam.x += (tx - s.cam.x) * k;
    s.cam.y += (ty - s.cam.y) * k;
    s.camKick.x *= Math.max(0, 1 - 12 * dt);
    s.camKick.y *= Math.max(0, 1 - 12 * dt);
    this.clampCam(s, api);
  },
  popup(s, x, y, text, color) {
    s.popups.push({ x, y, text, color: color || "#fff", life: 0.7, vy: -40 });
  },
  /** Атакующий сзади спины врага */
  isBackstab(e, ax, ay) {
    const ang = Math.atan2(ay - e.y, ax - e.x);
    return Math.abs(this.angDiff(ang, e.facing)) > 2.0;
  },
  tryDash(s, api) {
    if (s.dashCd > 0 || s.dashT > 0 || s.dead || s.won) return;
    const a = api.input.axis();
    let dx = a.x, dy = a.y;
    if (!dx && !dy) {
      dx = s.player.aim.x;
      dy = s.player.aim.y;
    }
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    s.dashT = this.DASH_DUR;
    s.dashCd = this.DASH_CD;
    s.player.vx = dx * this.DASH_SPEED;
    s.player.vy = dy * this.DASH_SPEED;
    s.player.inv = Math.max(s.player.inv, this.DASH_DUR + 0.05);
    s.shake = Math.max(s.shake, 0.08);
    s.flash = 0.08;
    for (let i = 0; i < 6; i++) {
      s.fx.push({
        x: s.player.x - dx * i * 6,
        y: s.player.y - dy * i * 6,
        vx: -dx * 40, vy: -dy * 40,
        life: 0.2, c: "#00f0ff",
      });
    }
  },
  blocked(s, x, y, r) {
    const W = s.world || this.WORLD;
    if (x - r < 18 || x + r > W.w - 18 || y - r < 18 || y + r > W.h - 18) return true;
    for (const wall of s.walls) {
      if (x + r > wall.x && x - r < wall.x + wall.w && y + r > wall.y && y - r < wall.y + wall.h) return true;
    }
    return false;
  },
  los(s, x0, y0, x1, y1) {
    const steps = 16;
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      const x = x0 + (x1 - x0) * t;
      const y = y0 + (y1 - y0) * t;
      for (const wall of s.walls) {
        if (x >= wall.x && x <= wall.x + wall.w && y >= wall.y && y <= wall.y + wall.h) return false;
      }
    }
    return true;
  },
  angDiff(a, b) {
    let d = a - b;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    return d;
  },
  inCone(e, px, py) {
    const dx = px - e.x;
    const dy = py - e.y;
    const d = Math.hypot(dx, dy);
    if (d < 8 || d > e.range) return false;
    return Math.abs(this.angDiff(Math.atan2(dy, dx), e.facing)) <= e.cone;
  },
  hitFromFront(e, bx, by) {
    if (!e.frontArmor || e.shieldHp <= 0) return false;
    const ang = Math.atan2(by - e.y, bx - e.x);
    return Math.abs(this.angDiff(ang, e.facing)) < 1.22;
  },
  resolveAim(s, api) {
    const stickAim = api.input.aimAxis();
    if (stickAim.x || stickAim.y) return stickAim;
    const m = api.input.mouse;
    const wx = m.x + s.cam.x;
    const wy = m.y + s.cam.y;
    const dx = wx - s.player.x;
    const dy = wy - s.player.y;
    const len = Math.hypot(dx, dy);
    if (len > 12) return { x: dx / len, y: dy / len };
    return s.player.aim;
  },
  alarmMul(s) {
    if (s.alarmT <= 0) return 1;
    return Math.min(1.25, 1 + Math.min(1, s.alarmT / 8) * 0.25);
  },
  damageEnemy(s, e, api, fromFront, opts) {
    opts = opts || {};
    if (fromFront && e.frontArmor && e.shieldHp > 0) {
      e.shieldHp -= 1;
      s.shake = Math.max(s.shake, 0.1);
      s.hitstop = Math.max(s.hitstop, 0.03);
      s.camKick.x += (Math.random() - 0.5) * 6;
      s.camKick.y += (Math.random() - 0.5) * 6;
      this.popup(s, e.x, e.y - 16, "BLOCK", "#e2e8f0");
      // knockback flinch
      const ang = Math.atan2(e.y - s.player.y, e.x - s.player.x);
      e.x += Math.cos(ang) * 4;
      e.y += Math.sin(ang) * 4;
      s.fx.push({ x: e.x, y: e.y, vx: 0, vy: 0, life: 0.12, c: "#e2e8f0" });
      if (e.shieldHp <= 0) {
        e.frontArmor = false;
        this.popup(s, e.x, e.y - 28, "SHIELD DOWN", "#f97316");
        for (let i = 0; i < 8; i++) {
          const a = api.rand(0, Math.PI * 2);
          s.fx.push({
            x: e.x, y: e.y,
            vx: Math.cos(a) * 110, vy: Math.sin(a) * 110,
            life: 0.35, c: "#94a3b8",
          });
        }
      }
      return;
    }
    this.killEnemy(s, e, api, opts);
  },
  killEnemy(s, e, api, opts) {
    opts = opts || {};
    if (e.hp <= 0) return;
    e.hp = 0;
    const silent = !!opts.silent;
    const backstab = !!opts.backstab;

    // combo
    if (s.comboT > 0) s.combo += backstab ? 2 : 1;
    else s.combo = backstab ? 2 : 1;
    s.comboT = this.COMBO_WINDOW;
    s.maxCombo = Math.max(s.maxCombo, s.combo);

    s.killRush = 0.55;
    s.shake = Math.max(s.shake, 0.1 + Math.min(0.12, s.combo * 0.02));
    s.hitstop = Math.max(s.hitstop, 0.04 + Math.min(0.06, s.combo * 0.008));
    s.flash = Math.max(s.flash, 0.06);
    s.camKick.x += -s.player.aim.x * (8 + s.combo);
    s.camKick.y += -s.player.aim.y * (8 + s.combo);

    if (backstab) {
      this.popup(s, e.x, e.y - 20, "SILENT x" + s.combo, "#39ff14");
    } else if (silent) {
      this.popup(s, e.x, e.y - 20, s.combo >= 2 ? "STAB x" + s.combo : "STAB", "#ffe66d");
    } else {
      this.popup(s, e.x, e.y - 20, s.combo >= 2 ? "COMBO x" + s.combo : "KILL", "#ff2bd6");
      s.silent = false;
    }

    // dissolve burst + knock direction
    const fling = Math.atan2(e.y - s.player.y, e.x - s.player.x);
    const n = 12 + Math.min(10, s.combo * 2);
    for (let i = 0; i < n; i++) {
      const a = fling + api.rand(-0.9, 0.9);
      const sp = api.rand(60, 180);
      s.fx.push({
        x: e.x, y: e.y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: api.rand(0.28, 0.55),
        c: silent ? "#39ff14" : (i % 2 ? "#00f0ff" : "#ff2bd6"),
      });
    }

    this.dropWeapon(s, e);

    const left = this.aliveCount(s);
    if (left === 0) s.slowMo = 0.45;
    else if (s.combo >= 3) s.slowMo = Math.max(s.slowMo, 0.22);
  },
  die(s, api) {
    if (s.dead || s.won) return;
    if (s.player.inv > 0) return;
    const d = this.ensureDev();
    if (d.immortal) {
      this.registerGhostDeath(s);
      s.shake = 0.15;
      s.player.inv = 0.4;
      return;
    }
    s.dead = true;
    s.deathT = 0;
    s.shake = 0.28;
    s.combo = 0;
    s.flash = 0.2;
    for (let i = 0; i < 18; i++) {
      const a = api.rand(0, Math.PI * 2);
      const sp = api.rand(50, 160);
      s.fx.push({
        x: s.player.x, y: s.player.y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: api.rand(0.2, 0.45), c: "#ffe66d",
      });
    }
    api.setHud(`DEATH · м${s.mission} · max combo ${s.maxCombo} — рестарт…`);
  },
  atExit(s) {
    const e = s.exit;
    const p = s.player;
    return p.x > e.x && p.x < e.x + e.w && p.y > e.y && p.y < e.y + e.h;
  },
  aliveCount(s) {
    return s.enemies.filter((e) => e.hp > 0).length;
  },
  fireEnemyShot(s, e, am) {
    const n = e.pellets || 1;
    const spread = n > 1 ? 0.38 : 0.06;
    for (let i = 0; i < n; i++) {
      const off = n === 1 ? (Math.random() - 0.5) * spread : (i / (n - 1) - 0.5) * spread;
      const ang = e.facing + off;
      s.ebullets.push({
        x: e.x, y: e.y,
        vx: Math.cos(ang) * e.bulletSpd * am,
        vy: Math.sin(ang) * e.bulletSpd * am,
        life: 0.75,
      });
    }
    e.shootCd = (e.baseShootCd * 0.85) / am;
  },
  /** Поднять тревогу + каскад соседям по слуху/близости */
  raiseAlert(s, e, px, py, duration, cascade) {
    e.alert = Math.max(e.alert, duration);
    e.lastSeen = { x: px, y: py };
    e.sus = 0;
    if (s.alarmT <= 0) s.alarmT = 0.001;
    if (!cascade) return;
    for (const o of s.enemies) {
      if (o === e || o.hp <= 0) continue;
      const d = Math.hypot(o.x - e.x, o.y - e.y);
      if (d < 190) {
        o.alert = Math.max(o.alert, duration * 0.75);
        o.lastSeen = { x: px, y: py };
      }
    }
  },
  moveToward(s, e, tx, ty, speed, dt) {
    const dx = tx - e.x;
    const dy = ty - e.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d < 8) return d;
    const ex = e.x + (dx / d) * speed * dt;
    const ey = e.y + (dy / d) * speed * dt;
    if (!this.blocked(s, ex, e.y, e.r)) e.x = ex;
    if (!this.blocked(s, e.x, ey, e.r)) e.y = ey;
    return d;
  },
  emitGunNoise(s, x, y, radius) {
    s.noise = { x, y, r: radius, t: 0.2 };
  },
  playerFire(s, api) {
    const wpn = s.weapon;
    const aim = s.player.aim;
    const len = Math.hypot(aim.x, aim.y) || 1;
    const ax = aim.x / len;
    const ay = aim.y / len;

    if (wpn.melee) {
      const reach = wpn.meleeRange + 4;
      let hit = false;
      for (const e of s.enemies) {
        if (e.hp <= 0) continue;
        const d = api.dist(e, s.player);
        if (d > reach + e.r) continue;
        const ang = Math.atan2(e.y - s.player.y, e.x - s.player.x);
        if (Math.abs(this.angDiff(ang, Math.atan2(ay, ax))) > 0.95) continue;
        const back = this.isBackstab(e, s.player.x, s.player.y);
        const fromFront = !back && this.hitFromFront(e, s.player.x, s.player.y);
        this.damageEnemy(s, e, api, fromFront, { silent: true, backstab: back });
        hit = true;
      }
      s.cd = wpn.cd * (hit ? 0.85 : 1);
      s.shake = Math.max(s.shake, hit ? 0.14 : 0.04);
      s.camKick.x += -ax * (hit ? 10 : 3);
      s.camKick.y += -ay * (hit ? 10 : 3);
      // slash FX
      s.fx.push({
        x: s.player.x + ax * 18, y: s.player.y + ay * 18,
        vx: ax * 20, vy: ay * 20, life: 0.12, c: "#ffe66d",
      });
      return;
    }

    if (wpn.ammo <= 0) {
      this.equipWeapon(s, "knife");
      this.popup(s, s.player.x, s.player.y - 18, "EMPTY", "#94a3b8");
      return;
    }

    const n = wpn.pellets;
    const spread = wpn.spread;
    for (let i = 0; i < n; i++) {
      const off = n === 1 ? (api.rand(-1, 1) * spread) : (i / (n - 1) - 0.5) * spread;
      const ang = Math.atan2(ay, ax) + off;
      s.bullets.push({
        x: s.player.x + ax * 8,
        y: s.player.y + ay * 8,
        vx: Math.cos(ang) * wpn.speed,
        vy: Math.sin(ang) * wpn.speed,
        life: wpn.life,
        color: wpn.color,
      });
    }
    // muzzle
    for (let i = 0; i < 4; i++) {
      s.fx.push({
        x: s.player.x + ax * 14, y: s.player.y + ay * 14,
        vx: ax * api.rand(40, 120) + api.rand(-40, 40),
        vy: ay * api.rand(40, 120) + api.rand(-40, 40),
        life: 0.1, c: "#ffe66d",
      });
    }
    wpn.ammo -= 1;
    s.cd = wpn.cd;
    s.silent = false;
    s.shake = Math.max(s.shake, wpn.id === "shotgun" ? 0.16 : 0.07);
    s.camKick.x += -ax * (wpn.id === "shotgun" ? 14 : 7);
    s.camKick.y += -ay * (wpn.id === "shotgun" ? 14 : 7);
    s.flash = Math.max(s.flash, 0.05);
    this.emitGunNoise(s, s.player.x, s.player.y, 220);
    if (wpn.ammo <= 0) {
      this.equipWeapon(s, "knife");
      this.popup(s, s.player.x, s.player.y - 18, "EMPTY→НОЖ", "#94a3b8");
    }
  },
  update(s, api, dt) {
    this.handleDev(s, api);

    if (s.dead) {
      s.deathT += dt;
      s.shake = Math.max(0, s.shake - dt);
      for (const f of s.fx) { f.x += f.vx * dt; f.y += f.vy * dt; f.life -= dt; }
      s.fx = s.fx.filter((f) => f.life > 0);
      if (s.deathT >= 0.32 || s.fire.clicked || api.input.consumeTap() || api.input.keys.Space) {
        this.reset(s, api, this.ensureDev().startMission);
      }
      return;
    }
    if (s.won) {
      if (s.fire.clicked || api.input.consumeTap() || api.input.keys.Space) {
        const next = Math.min(12, (s.mission | 0) + 1);
        this.ensureDev().startMission = next;
        this.reset(s, api, next);
      }
      return;
    }

    if (s.hitstop > 0) {
      s.hitstop -= dt;
      // лёгкий shake во время hitstop
      s.shake = Math.max(s.shake, 0.04);
      return;
    }

    // slow-mo (драйв на киллах)
    let sim = dt;
    if (s.slowMo > 0) {
      s.slowMo -= dt;
      sim = dt * 0.35;
    }

    s.shake = Math.max(0, s.shake - sim);
    s.flash = Math.max(0, s.flash - dt * 3);
    s.cd = Math.max(0, s.cd - sim);
    s.dashCd = Math.max(0, s.dashCd - sim);
    s.killRush = Math.max(0, s.killRush - sim);
    s.player.inv = Math.max(0, s.player.inv - sim);
    if (s.comboT > 0) {
      s.comboT -= sim;
      if (s.comboT <= 0) s.combo = 0;
    }
    if (s.alarmT > 0) s.alarmT += sim;

    // dash input
    const wantDash =
      (s.dashBtn && (s.dashBtn.clicked || s.dashBtn._held && s.dashBtn.pressed)) ||
      !!api.input.keys.ShiftLeft || !!api.input.keys.ShiftRight || !!api.input.keys.KeyQ;
    // edge: use clicked for button; keys need latch
    if (!s._dashLatch) s._dashLatch = false;
    const dashKey = !!(api.input.keys.ShiftLeft || api.input.keys.ShiftRight || api.input.keys.KeyQ);
    if ((s.dashBtn && s.dashBtn.clicked) || (dashKey && !s._dashLatch)) this.tryDash(s, api);
    s._dashLatch = dashKey;

    const a = api.input.axis();
    const accel = 2800;
    const drag = 2000;
    const rush = s.killRush > 0 ? 1.35 : 1;
    const maxSp = s.player.speed * this.missionSpeedMul(s) * rush * (s.dashT > 0 ? 1 : 1);

    if (s.dashT > 0) {
      s.dashT -= sim;
      s.trails.push({ x: s.player.x, y: s.player.y, life: 0.18 });
      // during dash keep velocity, light steering
      if (a.x || a.y) {
        s.player.vx += a.x * 800 * sim;
        s.player.vy += a.y * 800 * sim;
      }
    } else if (a.x || a.y) {
      s.player.vx += a.x * accel * sim;
      s.player.vy += a.y * accel * sim;
    } else {
      const sp = Math.hypot(s.player.vx, s.player.vy);
      if (sp > 0) {
        const nd = Math.max(0, sp - drag * sim);
        s.player.vx = (s.player.vx / sp) * nd;
        s.player.vy = (s.player.vy / sp) * nd;
      }
    }
    let psp = Math.hypot(s.player.vx, s.player.vy);
    const cap = s.dashT > 0 ? this.DASH_SPEED : maxSp;
    if (psp > cap) {
      s.player.vx = (s.player.vx / psp) * cap;
      s.player.vy = (s.player.vy / psp) * cap;
    }
    const nx = s.player.x + s.player.vx * sim;
    const ny = s.player.y + s.player.vy * sim;
    if (!this.blocked(s, nx, s.player.y, s.player.r)) s.player.x = nx;
    else s.player.vx = 0;
    if (!this.blocked(s, s.player.x, ny, s.player.r)) s.player.y = ny;
    else s.player.vy = 0;

    this.updateCam(s, api, sim);
    s.player.aim = this.resolveAim(s, api);
    this.tryPickup(s, api);

    for (const p of s.pickups) p.bob += sim * 6;
    for (const t of s.trails) t.life -= sim;
    s.trails = s.trails.filter((t) => t.life > 0);
    for (const p of s.popups) {
      p.y += p.vy * sim;
      p.life -= sim;
    }
    s.popups = s.popups.filter((p) => p.life > 0);

    const wantFire =
      s.fire._held || s.fire.clicked || !!api.input.keys.Space ||
      api.input.mouse.down || api.input.aim.active;
    if (wantFire && s.cd <= 0 && (s.player.aim.x || s.player.aim.y)) {
      this.playerFire(s, api);
    }

    // use sim for bullets/enemies below — rebind dt locally
    dt = sim;

    for (const b of s.bullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (this.blocked(s, b.x, b.y, 2)) b.life = 0;
      for (const e of s.enemies) {
        if (e.hp <= 0 || api.dist(b, e) >= e.r + 4) continue;
        const fromFront = this.hitFromFront(e, b.x, b.y);
        this.damageEnemy(s, e, api, fromFront, { silent: false, backstab: false });
        b.life = 0;
      }
    }
    s.bullets = s.bullets.filter((b) => b.life > 0);

    const am = this.alarmMul(s) * this.missionSpeedMul(s);
    let anyAlert = false;

    if (s.noise) {
      s.noise.t -= dt;
      if (s.noise.t <= 0) s.noise = null;
    }

    for (const e of s.enemies) {
      if (e.hp <= 0) continue;
      e.shootCd = Math.max(0, e.shootCd - dt);

      const distP = api.dist(e, s.player);
      const sees =
        this.inCone(e, s.player.x, s.player.y) &&
        this.los(s, e.x, e.y, s.player.x, s.player.y);

      // слух: выстрел игрока
      if (s.noise && Math.hypot(e.x - s.noise.x, e.y - s.noise.y) < e.hear) {
        this.raiseAlert(s, e, s.noise.x, s.noise.y, 4.5, true);
      }

      // периферия в упор
      if (!sees && distP < 58) {
        e.sus += dt;
        if (e.sus > 0.35) {
          const ang = Math.atan2(s.player.y - e.y, s.player.x - e.x);
          const diff = this.angDiff(ang, e.facing);
          e.facing += Math.sign(diff) * Math.min(Math.abs(diff), e.turnSpeed * 1.6 * dt);
          if (e.sus > 0.7) this.raiseAlert(s, e, s.player.x, s.player.y, 3.2, false);
        }
      } else if (!sees) {
        e.sus = Math.max(0, e.sus - dt * 0.5);
      }

      if (sees) {
        e.seeT += dt;
        if (e.seeT > 0.025) this.raiseAlert(s, e, s.player.x, s.player.y, 5.5, true);
      } else {
        e.seeT = Math.max(0, e.seeT - dt * 1.5);
      }

      if (e.alert <= 0) {
        if (e.mode === "patrol" && e.waypoints) {
          const wp = e.waypoints[e.wi];
          const dx = wp.x - e.x;
          const dy = wp.y - e.y;
          const d = Math.hypot(dx, dy) || 1;
          if (d < 6) e.wi = (e.wi + 1) % e.waypoints.length;
          else {
            e.facing = Math.atan2(dy, dx);
            this.moveToward(s, e, wp.x, wp.y, e.speed * am, dt);
          }
        } else {
          e.scanT += dt;
          e.facing = e.homeFacing + Math.sin(e.scanT * 1.1) * 0.7;
        }
      } else {
        anyAlert = true;
        e.alert -= dt;
        const tx = sees ? s.player.x : (e.lastSeen ? e.lastSeen.x : s.player.x);
        const ty = sees ? s.player.y : (e.lastSeen ? e.lastSeen.y : s.player.y);
        if (sees) e.lastSeen = { x: s.player.x, y: s.player.y };

        const ang = Math.atan2(ty - e.y, tx - e.x);
        const diff = this.angDiff(ang, e.facing);
        e.facing += Math.sign(diff) * Math.min(Math.abs(diff), e.turnSpeed * (sees ? 1.35 : 1) * am * dt);

        const preferDist = e.kind === "shotgun" ? 40 : e.kind === "shield" ? 55 : 70;
        if (distP > preferDist || !sees) {
          this.moveToward(s, e, tx, ty, e.chaseSpeed * am, dt);
        }

        const aimed = Math.abs(this.angDiff(ang, e.facing)) < 0.35;
        const canSeeShot = this.los(s, e.x, e.y, s.player.x, s.player.y);
        if (e.shootCd <= 0 && aimed && canSeeShot && distP < e.range * 1.15) {
          this.fireEnemyShot(s, e, am);
          this.emitGunNoise(s, e.x, e.y, 160);
        }

        if (!sees && e.lastSeen && Math.hypot(e.x - e.lastSeen.x, e.y - e.lastSeen.y) < 18) {
          e.facing += dt * 3.5;
        }
      }

      if (distP < e.r + s.player.r - 1) this.die(s, api);
    }

    for (const b of s.ebullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      if (this.blocked(s, b.x, b.y, 2)) b.life = 0;
      const pd = api.dist(b, s.player);
      if (pd < s.player.r + 3) {
        b.life = 0;
        this.die(s, api);
      } else if (pd < 22 && !b._near && s.player.inv <= 0) {
        b._near = true;
        this.popup(s, s.player.x, s.player.y - 22, "CLOSE!", "#ff3b4a");
        s.shake = Math.max(s.shake, 0.06);
      }
    }
    s.ebullets = s.ebullets.filter((b) => b.life > 0);

    for (const f of s.fx) { f.x += f.vx * dt; f.y += f.vy * dt; f.life -= dt; }
    s.fx = s.fx.filter((f) => f.life > 0);

    const left = this.aliveCount(s);
    const d = this.ensureDev();
    const god = d.immortal ? ` · ${this.ghostDeathSummary()}` : "";
    const ammoStr = s.weapon.ammo === Infinity ? "∞" : `${s.weapon.ammo}/${s.weapon.ammoMax}`;
    if (left === 0) {
      if (!s.clearLatched) {
        s.clearLatched = true;
        api.setHud(`CLEAR · м${s.mission} — EXIT${god}`);
      }
      if (this.atExit(s)) {
        s.won = true;
        api.setHud(`EXIT OK · м${s.mission}${s.silent ? " · silent!" : ""} · тап → м${Math.min(12, s.mission + 1)}`);
      }
    } else if (!s.dead) {
      const combo = s.combo >= 2 ? ` · COMBO x${s.combo}` : "";
      const dash = s.dashCd > 0 ? "" : " · рывок✓";
      api.setHud(
        `М${s.mission} · ${s.weapon.label} ${ammoStr} · ${left}${anyAlert ? " · ⚠ HUNT" : ""}${combo}${dash}${god}`
      );
    }
    if (s.dashBtn) s.dashBtn.color = s.dashCd > 0 ? "#334155" : "#00f0ff";
  },
  drawCone(ctx, e) {
    const a0 = e.facing - e.cone;
    const a1 = e.facing + e.cone;
    ctx.beginPath();
    ctx.moveTo(e.x, e.y);
    ctx.arc(e.x, e.y, e.range, a0, a1);
    ctx.closePath();
    ctx.fillStyle = e.alert > 0 ? "rgba(255,59,74,0.28)" : "rgba(255,43,214,0.18)";
    ctx.fill();
    ctx.strokeStyle = e.alert > 0 ? "rgba(255,59,74,0.7)" : "rgba(255,43,214,0.45)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  },
  draw(s, api) {
    const { ctx, w, h } = api;
    const shakeAmp = s.shake ? 2 + s.shake * 18 : 0;
    const shx = shakeAmp ? api.rand(-shakeAmp, shakeAmp) : 0;
    const shy = shakeAmp ? api.rand(-shakeAmp, shakeAmp) : 0;
    const W = s.world || this.WORLD;

    ctx.fillStyle = "#05040a";
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(-s.cam.x + shx, -s.cam.y + shy);

    const tints = ["#12101a", "#10141c", "#141018"];
    ctx.fillStyle = tints[(s.mission - 1) % 3];
    ctx.fillRect(0, 0, W.w, W.h);

    ctx.strokeStyle = "#00f0ff";
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, W.w - 8, W.h - 8);
    ctx.globalAlpha = 1;

    const ex = s.exit;
    const clear = s.clearLatched || this.aliveCount(s) === 0;
    ctx.fillStyle = clear ? "#39ff14" : "#1a4a22";
    ctx.globalAlpha = clear ? 0.85 : 0.45;
    ctx.fillRect(ex.x, ex.y, ex.w, ex.h);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#39ff14";
    ctx.lineWidth = 2;
    ctx.strokeRect(ex.x, ex.y, ex.w, ex.h);
    ctx.fillStyle = "#39ff14";
    ctx.font = "bold 11px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("EXIT", ex.x + ex.w / 2, ex.y + ex.h / 2 + 4);

    for (const wall of s.walls) {
      ctx.fillStyle = "#1c1830";
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.fillStyle = "#ff2bd6";
      ctx.globalAlpha = 0.55;
      if (wall.w >= wall.h) ctx.fillRect(wall.x, wall.y, wall.w, 2);
      else ctx.fillRect(wall.x, wall.y, 2, wall.h);
      ctx.globalAlpha = 1;
    }

    for (const p of s.pickups) {
      const bob = Math.sin(p.bob) * 3;
      ctx.beginPath();
      ctx.arc(p.x, p.y + bob, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.85;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 8px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.label, p.x, p.y + bob - 14);
      ctx.fillText("×" + p.ammo, p.x, p.y + bob + 16);
    }

    for (const e of s.enemies) {
      if (e.hp > 0) this.drawCone(ctx, e);
    }

    for (const e of s.enemies) {
      if (e.hp <= 0) continue;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = e.alert > 0 ? "#ff3b4a" : e.color;
      ctx.fill();
      if (e.frontArmor && e.shieldHp > 0) {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r + 4, e.facing - 1.1, e.facing + 1.1);
        ctx.strokeStyle = e.shieldHp >= 3 ? "#e2e8f0" : e.shieldHp === 2 ? "#fbbf24" : "#f97316";
        ctx.lineWidth = 2 + e.shieldHp;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.x + Math.cos(e.facing) * (e.r + 6), e.y + Math.sin(e.facing) * (e.r + 6));
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 8px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      const sh = e.shieldMax ? ` ${e.shieldHp}/${e.shieldMax}` : "";
      ctx.fillText(e.label + sh, e.x, e.y - e.r - 6);
    }

    // dash trails
    for (const t of s.trails || []) {
      ctx.globalAlpha = Math.max(0, t.life * 3);
      ctx.beginPath();
      ctx.arc(t.x, t.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#00f0ff";
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    for (const b of s.bullets) {
      ctx.fillStyle = b.color || "#00f0ff";
      ctx.shadowColor = b.color || "#00f0ff";
      ctx.shadowBlur = 6;
      ctx.fillRect(b.x - 2, b.y - 2, 5, 5);
      ctx.shadowBlur = 0;
    }
    for (const b of s.ebullets) {
      ctx.fillStyle = "#ff3b4a";
      ctx.fillRect(b.x - 2, b.y - 2, 4, 4);
    }
    for (const f of s.fx) {
      ctx.globalAlpha = Math.max(0, f.life * 2.2);
      ctx.fillStyle = f.c;
      ctx.fillRect(f.x - 2, f.y - 2, 4, 4);
      ctx.globalAlpha = 1;
    }

    for (const p of s.popups || []) {
      ctx.globalAlpha = Math.min(1, p.life * 2);
      ctx.fillStyle = p.color;
      ctx.font = "bold 11px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(p.text, p.x, p.y);
      ctx.globalAlpha = 1;
    }

    if (!s.dead) {
      const p = s.player;
      if (s.dashT > 0) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,240,255,0.7)";
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.inv > 0 ? (Math.floor(p.inv * 20) % 2 ? "#fff" : "#ffe66d") : "#ffe66d";
      ctx.fill();
      ctx.strokeStyle = s.weapon.color || "#00f0ff";
      ctx.globalAlpha = 0.7;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      const reach = s.weapon.melee ? s.weapon.meleeRange : 36;
      ctx.lineTo(p.x + p.aim.x * reach, p.y + p.aim.y * reach);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    ctx.restore();

    // muzzle / hit flash
    if (s.flash > 0) {
      ctx.fillStyle = `rgba(255,230,100,${Math.min(0.35, s.flash)})`;
      ctx.fillRect(0, 0, w, h);
    }
    // hunt vignette
    if (s.alarmT > 0 && !s.won) {
      const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.75);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(80,0,30,0.35)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(10, 8, 120, 28);
    ctx.fillStyle = "#00f0ff";
    ctx.font = "bold 12px Segoe UI, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`М${s.mission} ${s.layoutName || ""}`, 16, 27);

    const ammo = s.weapon.ammo === Infinity ? "∞" : s.weapon.ammo;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(10, 42, 110, 26);
    ctx.fillStyle = s.weapon.color || "#fff";
    ctx.font = "bold 12px Segoe UI, sans-serif";
    ctx.fillText(`${s.weapon.label} ${ammo}`, 16, 60);

    if (s.combo >= 2) {
      ctx.fillStyle = "rgba(255,43,214,0.85)";
      ctx.fillRect(10, 72, 100, 24);
      ctx.fillStyle = "#fff";
      ctx.font = "bold 13px Segoe UI, sans-serif";
      ctx.fillText(`COMBO x${s.combo}`, 18, 89);
    }

    // minimap
    const mmW = 56, mmH = 72, mmX = 10, mmY = h - mmH - 100;
    const sx = mmW / W.w, sy = mmH / W.h;
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(mmX, mmY, mmW, mmH);
    ctx.strokeStyle = "#00f0ff";
    ctx.globalAlpha = 0.4;
    ctx.strokeRect(mmX, mmY, mmW, mmH);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#39ff14";
    ctx.fillRect(mmX + s.exit.x * sx, mmY + s.exit.y * sy, Math.max(3, s.exit.w * sx), Math.max(3, s.exit.h * sy));
    for (const e of s.enemies) {
      if (e.hp <= 0) continue;
      ctx.fillStyle = e.color;
      ctx.fillRect(mmX + e.x * sx - 1, mmY + e.y * sy - 1, 3, 3);
    }
    ctx.fillStyle = "#ffe66d";
    ctx.fillRect(mmX + s.player.x * sx - 2, mmY + s.player.y * sy - 2, 4, 4);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.strokeRect(mmX + s.cam.x * sx, mmY + s.cam.y * sy, api.w * sx, api.h * sy);

    if (s.dead) {
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ff2bd6";
      ctx.font = "bold 26px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("DEATH", w / 2, h / 2 - 10);
    }
    if (s.won) {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#39ff14";
      ctx.font = "bold 22px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(`М${s.mission} CLEAR`, w / 2, h / 2 - 14);
      ctx.fillStyle = "#ddd";
      ctx.font = "14px Segoe UI, sans-serif";
      ctx.fillText(`Тап → миссия ${Math.min(12, s.mission + 1)}`, w / 2, h / 2 + 18);
    }
  },
};

/* ========== 02 Работник месяца — office grid dodge (chas-pik vector) ========== */
window.FEEL_DEMOS["deadline-escape"] = {
  hint: "BETA спрайты · тап — шаг · кофе/бейдж · день ≈60с",
  /** Глобальное замедление симуляции (1 = норма, 0.5 = в 2 раза медленнее) */
  TIME_SCALE: 0.5,
  /** Меняй при выкладке стен — сбрасывает кэш ensureArt + видно в HUD */
  ART_BUST: "w250721n",
  ART_BASES: [
    "../../games/deadline-escape/refs/sprites/",
    "/games/deadline-escape/refs/sprites/",
    "../games/deadline-escape/refs/sprites/",
  ],
  ensureArt() {
    if (this._art && this._art.bust === this.ART_BUST) return this._art;
    const art = { ready: false, base: "", bust: this.ART_BUST, img: Object.create(null), failed: Object.create(null) };
    const tryLoad = (key, rel) => {
      if (art.img[key] || art.failed[key]) return;
      const img = new Image();
      img.decoding = "async";
      let bi = 0;
      const next = () => {
        if (bi >= this.ART_BASES.length) {
          art.failed[key] = true;
          return;
        }
        img.onload = () => {
          art.img[key] = img;
          art.base = this.ART_BASES[bi];
          art.ready = true;
        };
        img.onerror = () => {
          bi += 1;
          next();
        };
        img.src = this.ART_BASES[bi] + rel;
      };
      next();
    };
    // legacy turnaround + полные анимации ГГ / HR
    ["s", "e", "n", "w"].forEach((d) => {
      tryLoad("hero_" + d, `frames/char_hero_sheet/${d}.png`);
      tryLoad("hero_idle_" + d, `frames/char_hero/idle_${d}.png`);
      tryLoad("colleague_" + d, `frames/char_colleague_sheet/${d}.png`);
      for (let f = 0; f < 4; f++) tryLoad(`hero_idle_${d}_${f}`, `frames/char_hero/idle_${d}_${f}.png`);
      // Slynyrd 6-frame run: contact→down→pass×2
      for (let f = 0; f < 6; f++) tryLoad(`hero_walk_${d}_${f}`, `frames/char_hero/walk_${d}_${f}.png?v=compose2`);
    });
    for (let f = 0; f < 4; f++) tryLoad("hero_caught_" + f, `frames/char_hero/caught_${f}.png`);
    ["s", "e", "n", "w"].forEach((d) => {
      tryLoad("boss_hr_idle_" + d, `frames/boss_hr/idle_${d}.png?v=hr12`);
      // Slynyrd 6-frame walk; без special — idle при паузе/контакте
      for (let f = 0; f < 6; f++) tryLoad(`boss_hr_walk_${d}_${f}`, `frames/boss_hr/walk_${d}_${f}.png?v=hr12`);
      for (let f = 0; f < 4; f++) tryLoad(`boss_hr_idle_${d}_${f}`, `frames/boss_hr/idle_${d}.png?v=hr12`);
    });
    ["hr", "director", "looker", "urgent", "meeting", "guard", "intern", "account", "kpi", "client", "it", "secretary"].forEach((id) => {
      const bust = (id === "it" || id === "kpi" || id === "hr") ? "?v=recolor2" : "";
      ["s", "e", "n", "w"].forEach((d) => tryLoad(`boss_${id}_${d}`, `frames/boss_${id}_sheet/${d}.png${bust}`));
    });
    ["floor_a", "floor_b", "desk", "desk2", "plant", "cooler", "fog", "cabinet", "printer", "trash"].forEach((t) => tryLoad("tile_" + t, `frames/tile_${t}.png?v=w250721n`));
    // стены — proof-геометрия без спрайтов (wall/window tiles не грузим)
    ["coin", "coffee", "badge"].forEach((p) => tryLoad("pu_" + p, `frames/pu_${p}.png`));
    ["shield", "steam", "invuln", "near_miss", "report", "dash", "slam", "confetti"].forEach((v) => tryLoad("vfx_" + v, `frames/vfx_${v}.png?v=w250721n`));
    this._art = art;
    return art;
  },
  dirKey(dir) {
    if (dir === "up") return "n";
    if (dir === "down") return "s";
    if (dir === "left") return "w";
    if (dir === "right") return "e";
    return "s";
  },
  facingFromDelta(dc, dr) {
    if (Math.abs(dc) >= Math.abs(dr)) return dc > 0 ? "right" : "left";
    return dr > 0 ? "down" : "up";
  },
  animFrame(t, fps, n) {
    const frames = n || 4;
    return Math.floor(Math.max(0, t) * fps) % frames;
  },
  /**
   * Walk: 6 кадров = шаг A (0–2) + шаг B (3–5).
   * За клетку — один полушаг (3 кадра); следующий шаг — другая нога.
   * Линейный loop 0→5→0 — НЕ ping-pong (иначе походка идёт назад).
   */
  walkPingPongFrame(phase, n) {
    const frames = n || 6;
    if (frames <= 1) return 0;
    const cycle = (frames - 1) * 2;
    let i = Math.floor(phase) % cycle;
    if (i < 0) i += cycle;
    return i < frames ? i : cycle - i;
  },
  /** progress 0..1 внутри полушага → кадр 0..2; stride 0|1 выбирает A или B */
  walkFrameFromStep(progress, stride) {
    const u = Math.max(0, Math.min(0.999, progress));
    const local = Math.min(2, Math.floor(u * 3));
    return ((stride | 0) & 1) * 3 + local;
  },
  /** непрерывный линейный цикл по пути (боссы) */
  walkFrameLinear(phase, n) {
    const frames = n || 6;
    let i = Math.floor(phase) % frames;
    if (i < 0) i += frames;
    return i;
  },
  /** Idle: hold extremities longer (Slynyrd offset timing) */
  idleFrameFromTime(ms) {
    const seq = [0, 0, 1, 2, 2, 2, 3, 1];
    return seq[Math.floor(ms / 160) % seq.length];
  },
  heroSpriteKey(s) {
    const d = this.dirKey(s.facing || "down");
    if (!s.alive) {
      const elapsed = (performance.now() - (s.caughtAt || performance.now())) / 1000;
      const fi = Math.min(3, Math.floor(elapsed / 0.11));
      return "hero_caught_" + fi;
    }
    if (s.moving) {
      const u = Math.min(1, (s.moveT || 0) / (s.moveDur || 0.1));
      return `hero_walk_${d}_${this.walkFrameFromStep(u, s.walkStride || 0)}`;
    }
    return `hero_idle_${d}_${this.idleFrameFromTime(performance.now())}`;
  },
  bossSpriteKey(t, sliding, waiting, nearHero) {
    const id = t.kind && t.kind.id;
    const d = this.dirKey(t.dir || "down");
    if (id === "hr") {
      // idle+walk only (без special)
      if (waiting || nearHero) {
        return "boss_hr_idle_" + d + "_" + this.idleFrameFromTime(performance.now());
      }
      if (sliding && (t.dc || t.dr)) {
        if (t.walkStride == null) t.walkStride = 0;
        return `boss_hr_walk_${d}_${this.walkFrameFromStep(t.frac || 0, t.walkStride)}`;
      }
      return "boss_hr_idle_" + d + "_" + this.idleFrameFromTime(performance.now());
    }
    return `boss_${id}_${d}`;
  },
  drawArt(ctx, key, x, y, size, alpha) {
    const art = this.ensureArt();
    const img = art.img[key];
    if (!img || !img.complete || !img.naturalWidth) return false;
    // масштаб по высоте холста (не по ширине) — широкие walk E/W не сжимаются
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = size / ih;
    const dw = iw * scale;
    const dh = ih * scale;
    ctx.save();
    if (alpha != null) ctx.globalAlpha = alpha;
    // низ холста = земля; кадры уже с общим feet baseline
    ctx.drawImage(img, x - dw / 2, y + size * 0.38 - dh, dw, dh);
    ctx.restore();
    return true;
  },
  // 0 floor · 1 desk1×1 · 2 wall · 3 plant · 4 cooler · 5 desk2×1 anchor · 6 desk2 occupancy · 7 window
  // с каждой стороны +1 клетка тумана (игрок не ходит; мобы спавнятся и видны);
  // стены/окна на этой полосе — декоративные препятствия «как на концепте»
  /** Радиус тела для хитбокса (клетки). Хит = пересечение тел, не «общая клетка». */
  HIT_BODY: 0.36,
  /** Всегда 1 клетка тумана с каждой стороны сетки. */
  FOG_BORDER: 1,
  FLOOR_TINT: [
    "rgba(36, 26, 82, 1)",
    "rgba(30, 40, 70, 1)",
    "rgba(40, 28, 55, 1)",
    "rgba(22, 45, 58, 1)",
    "rgba(50, 30, 45, 1)",
  ],
  // разлок: HR с 1 · директор на 3 (исключение) · дальше новый вид каждые 4 этажа
  KIND_UNLOCK: [
    { id: "hr", from: 1 },
    { id: "director", from: 3 },
    { id: "looker", from: 5 },
    { id: "urgent", from: 9 },
    { id: "meeting", from: 13 },
    { id: "guard", from: 17 },
    { id: "intern", from: 21 },
    { id: "account", from: 25 },
    { id: "kpi", from: 29 },
    { id: "client", from: 33 },
    { id: "it", from: 37 },
    { id: "secretary", from: 41 },
  ],
  KINDS: [
    { id: "director", color: "#ef4444", label: "Дир", pattern: "ghost" },
    { id: "hr", color: "#f472b6", label: "HR", pattern: "weave" },
    { id: "looker", color: "#4338ca", label: "ГЛЯД", pattern: "peek" },
    { id: "urgent", color: "#ea580c", label: "СРОЧ", pattern: "dash" },
    { id: "meeting", color: "#38bdf8", label: "ВСТР", pattern: "hold" },
    { id: "guard", color: "#64748b", label: "ОХР", pattern: "patrol" },
    { id: "intern", color: "#a3e635", label: "СТАЖ", pattern: "chaos" },
    { id: "kpi", color: "#dc2626", label: "KPI", pattern: "hunt" },
    { id: "client", color: "#eab308", label: "КЛИ", pattern: "pincer" },
    { id: "account", color: "#0d9488", label: "БУХ", pattern: "report" },
    { id: "it", color: "#4ade80", label: "IT", pattern: "blink" },
    { id: "secretary", color: "#c084fc", label: "СЕКР", pattern: "wide" },
  ],
  DIRS: {
    down: { dc: 0, dr: 1 },
    up: { dc: 0, dr: -1 },
    right: { dc: 1, dr: 0 },
    left: { dc: -1, dr: 0 },
  },
  create(api) {
    // убрать старые дев/кофе кнопки, если остались с прошлой сессии
    for (let i = api.input.tapButtons.length - 1; i >= 0; i--) {
      const lab = api.input.tapButtons[i].label;
      if (lab === "Кофе" || lab === "DEV∞" || lab === "эт−" || lab === "эт+" || lab === "GOD") {
        api.input.tapButtons.splice(i, 1);
      }
    }
    const dev = this.ensureDev();
    const floor = Math.max(1, dev.startFloor | 0);
    const grid = this.gridSizeForFloor(floor);
    const { cols, rows, border, playCols, playRows } = grid;
    const padT = 96, padB = 125, padX = 14;
    const built = this.buildMap(floor, grid);
    const map = built.map;
    const wallDecor = built.wallDecor;
    const start = this.findStart(map, border);
    const yDev = 86;
    const bGod = api.input.addButton({ x: api.w - 72, y: yDev, w: 58, h: 36, label: "DEV∞", color: dev.immortal ? "#22c55e" : "#64748b" });
    const bFloorDown = api.input.addButton({ x: api.w - 148, y: yDev, w: 36, h: 36, label: "эт−", color: "#475569" });
    const bFloorUp = api.input.addButton({ x: api.w - 108, y: yDev, w: 36, h: 36, label: "эт+", color: "#475569" });
    return {
      cols, rows, border, playCols, playRows, padT, padB, padX, map, wallDecor,
      cellW: (api.w - padX * 2) / cols,
      cellH: (api.h - padT - padB) / rows,
      col: start.col, row: start.row,
      px: start.col, py: start.row,
      moving: false, fromCol: start.col, fromRow: start.row, moveT: 0, moveDur: 0.095,
      walkStride: 0,
      gameMin: 0, minutesPerSecond: 18, totalMin: 540,
      threats: [], pickups: [], colleagues: [], zones: [], spawnT: 1.2,
      alive: true, won: false, invuln: 1.5,
      coffeeBoost: 0, shield: false, coins: 0, floor, bestFloor: floor,
      nearMiss: 0, tutorial: 3.2, pendingClick: null,
      allyFlash: 0, allyFlashText: "",
      facing: "down",
      _axisLatch: false, _keyLatch: false,
      bGod, bFloorDown, bFloorUp,
    };
  },
  ensureDev() {
    this.ensureArt();
    if (!this._dev) {
      this._dev = {
        immortal: false,
        startFloor: 1,
        deaths: 0,
        byFloor: Object.create(null),
        lastFloor: 0,
        lastClock: "",
      };
    }
    return this._dev;
  },
  registerGhostDeath(s) {
    const d = this.ensureDev();
    d.deaths += 1;
    const f = s.floor | 0;
    d.byFloor[f] = (d.byFloor[f] || 0) + 1;
    d.lastFloor = f;
    d.lastClock = this.clock(s.gameMin);
  },
  applyStartFloor(s, api, floor) {
    const d = this.ensureDev();
    d.startFloor = Math.max(1, floor | 0);
    this.resetDay(s, api, {
      floor: d.startFloor,
      bestFloor: Math.max(s.bestFloor || 1, d.startFloor),
      coins: s.coins || 0,
      tutorial: 0,
    });
  },
  handleDevButtons(s, api) {
    const d = this.ensureDev();
    if (s.bGod && s.bGod.clicked) {
      d.immortal = !d.immortal;
      if (s.bGod) s.bGod.color = d.immortal ? "#22c55e" : "#64748b";
    }
    if (s.bFloorDown && s.bFloorDown.clicked) this.applyStartFloor(s, api, d.startFloor - 1);
    if (s.bFloorUp && s.bFloorUp.clicked) this.applyStartFloor(s, api, d.startFloor + 1);
  },
  ghostDeathSummary() {
    const d = this.ensureDev();
    if (!d.deaths) return "💀0";
    const parts = Object.keys(d.byFloor)
      .map((k) => +k)
      .sort((a, b) => a - b)
      .map((f) => `э${f}:${d.byFloor[f]}`);
    return `💀${d.deaths} · ${parts.join(" ")} · посл.э${d.lastFloor}@${d.lastClock}`;
  },
  /** Глубина тумана с каждой стороны — всегда 1 клетка. */
  borderDepthForFloor(_floor) {
    return this.FOG_BORDER;
  },
  /** База play 5×7 (без fog); fog-border 1 с каждой стороны; +1 col/row каждые 25 этажей */
  gridSizeForFloor(floor) {
    const expansions = Math.max(0, Math.floor((floor | 0) / 25));
    let playCols = 5, playRows = 7;
    for (let i = 0; i < expansions; i++) {
      if (i % 2 === 0) playCols += 1;
      else playRows += 1;
    }
    const border = this.borderDepthForFloor(floor);
    return {
      playCols, playRows, border,
      cols: playCols + border * 2,
      rows: playRows + border * 2,
    };
  },
  inFogBorder(s, col, row) {
    const b = s.border | 0;
    if (col < 0 || row < 0 || col >= s.cols || row >= s.rows) return false;
    return col < b || row < b || col >= s.cols - b || row >= s.rows - b;
  },
  inPlayArea(s, col, row) {
    const b = s.border | 0;
    return col >= b && col < s.cols - b && row >= b && row < s.rows - b;
  },
  /** Ходьба моба по арене (play). Край — не для ходьбы. */
  threatStepOk(s, col, row) {
    if (!this.inPlayArea(s, col, row)) return false;
    return s.map[row][col] === 0;
  },
  /**
   * Открытая клетка полосы тумана: маркер спавна/коридора входа.
   * Стоять и ходить по ней нельзя никому — только перескок off-map ↔ play.
   */
  edgeTransitOk(s, col, row) {
    if (!this.inFogBorder(s, col, row)) return false;
    return s.map[row][col] === 0;
  },
  /** Спавн на краю — открытый вход (метка лайна, не клетка ходьбы). */
  spawnCellOpen(s, col, row) {
    return this.edgeTransitOk(s, col, row);
  },
  /**
   * Один шаг моба/коллеги. Клетки тени (fog) недоступны: открытый лайн
   * перескакивается в том же шаге (off-map ↔ play), стена на каркасе — стоп.
   */
  tryMoverStep(s, col, row, dc, dr) {
    let c = col + dc, r = row + dr;
    for (let hops = 0; hops < 4; hops++) {
      if (c < -2 || r < -2 || c > s.cols + 1 || r > s.rows + 1) return null;
      if (c < 0 || r < 0 || c >= s.cols || r >= s.rows) return { col: c, row: r };
      if (this.inFogBorder(s, c, r)) {
        if (s.map[r][c] !== 0) return null; // стена/окно на каркасе
        c += dc;
        r += dr;
        continue;
      }
      if (s.map[r][c] !== 0) return null;
      return { col: c, row: r };
    }
    return null;
  },
  findStart(map, border = 1) {
    const rows = map.length, cols = map[0].length;
    const b = border | 0;
    for (let r = rows - b - 1; r >= b; r--) {
      const c = (cols / 2) | 0;
      if (map[r][c] === 0) return { col: c, row: r };
    }
    for (let r = b; r < rows - b; r++) {
      for (let c = b; c < cols - b; c++) {
        if (map[r][c] === 0) return { col: c, row: r };
      }
    }
    return { col: b + 3, row: b + 5 };
  },
  /** Детерминированный RNG по этажу — одна и та же раскладка на рестарте дня */
  floorRng(floor) {
    let x = ((floor | 0) * 1103515245 + 12345) >>> 0;
    return () => {
      x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
      return x / 4294967296;
    };
  },
  /** Связность только play-зоны (полоса тумана не участвует). */
  mapConnected(map, border = 1) {
    const rows = map.length, cols = map[0].length;
    const b = border | 0;
    let start = null, open = 0;
    for (let r = b; r < rows - b; r++) {
      for (let c = b; c < cols - b; c++) {
        if (map[r][c] !== 0) continue;
        open++;
        if (!start) start = { c, r };
      }
    }
    if (!start || open < 8) return false;
    const seen = new Set([`${start.c},${start.r}`]);
    const q = [start];
    let reach = 0;
    while (q.length) {
      const cur = q.shift();
      reach++;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = cur.c + dc, nr = cur.r + dr;
        if (nr < b || nc < b || nr >= rows - b || nc >= cols - b) continue;
        if (map[nr][nc] !== 0) continue;
        const key = `${nc},${nr}`;
        if (seen.has(key)) continue;
        seen.add(key);
        q.push({ c: nc, r: nr });
      }
    }
    return reach === open;
  },
  /** Кольцо каркаса по часовой: N→E→S→W, клетки на каждом ребре подряд. */
  fogFrameRing(cols, rows, border) {
    const b = border | 0;
    const cells = [];
    const r0 = b - 1, r1 = rows - b, c0 = b - 1, c1 = cols - b;
    if (b < 1) return cells;
    for (let c = c0; c <= c1; c++) if (c >= 0 && c < cols) cells.push({ c, r: r0, edge: "n" });
    for (let r = r0 + 1; r <= r1 - 1; r++) if (r >= 0 && r < rows) cells.push({ c: c1, r, edge: "e" });
    for (let c = c1; c >= c0; c--) if (c >= 0 && c < cols) cells.push({ c, r: r1, edge: "s" });
    for (let r = r1 - 1; r >= r0 + 1; r--) if (r >= 0 && r < rows) cells.push({ c: c0, r, edge: "w" });
    return cells;
  },
  isFrameSolid(cell) {
    return cell === 2 || cell === 7;
  },
  /** Какое ребро полосы тумана: n/s/w/e. */
  fogEdgeOf(s, col, row) {
    const b = s.border | 0;
    if (row === b - 1) return "n";
    if (row === s.rows - b) return "s";
    if (col === b - 1) return "w";
    if (col === s.cols - b) return "e";
    return null;
  },
  /** Угол карты на полосе тумана: nw|ne|sw|se|null. */
  mapCornerOf(s, col, row) {
    const b = s.border | 0;
    const onN = row === b - 1;
    const onS = row === s.rows - b;
    const onW = col === b - 1;
    const onE = col === s.cols - b;
    if (onN && onW) return "nw";
    if (onN && onE) return "ne";
    if (onS && onW) return "sw";
    if (onS && onE) return "se";
    return null;
  },
  frameSolidAt(s, col, row) {
    if (col < 0 || row < 0 || col >= s.cols || row >= s.rows) return false;
    return this.isFrameSolid(s.map[row][col]);
  },
  /**
   * Битмап препятствий на кольце границы → клетки map = 2 (стены).
   * Картинка стены потом только из соседей битмапа (wallGeomOf) — дыры ок.
   * ≥70% клеток кольца проходные. Окна отключены. Арена сюда не лезет.
   */
  placeFogDecor(map, border, rnd) {
    const rows = map.length, cols = map[0].length;
    const ring = this.fogFrameRing(cols, rows, border);
    const wallDecor = Array.from({ length: rows }, () => Array.from({ length: cols }, () => null));
    if (!ring.length) return wallDecor;

    const isRingCorner = (c, r) => {
      const b = border | 0;
      const onN = r === b - 1, onS = r === rows - b, onW = c === b - 1, onE = c === cols - b;
      return (onN || onS) && (onW || onE);
    };

    // mid-edge: короткие сегменты ~22% бюджета
    for (const side of ["n", "e", "s", "w"]) {
      const idxs = [];
      for (let i = 0; i < ring.length; i++) {
        if (ring[i].edge !== side) continue;
        if (isRingCorner(ring[i].c, ring[i].r)) continue;
        idxs.push(i);
      }
      if (!idxs.length) continue;
      const marks = Array(idxs.length).fill(0);
      const budget = Math.max(0, Math.round(idxs.length * 0.22));
      let placed = 0, guard = 0;
      while (placed < budget && guard < 120) {
        guard++;
        const start = (rnd() * idxs.length) | 0;
        const maxLen = Math.min(3, idxs.length - start);
        if (maxLen < 1) continue;
        const len = 1 + ((rnd() * maxLen) | 0);
        let ok = true;
        for (let k = 0; k < len; k++) if (marks[start + k]) { ok = false; break; }
        if (start > 0 && marks[start - 1]) ok = false;
        if (start + len < idxs.length && marks[start + len]) ok = false;
        if (!ok) continue;
        for (let k = 0; k < len && placed < budget; k++) {
          marks[start + k] = 1;
          placed++;
        }
      }
      for (let i = 0; i < idxs.length; i++) {
        if (!marks[i]) continue;
        const { c, r } = ring[idxs[i]];
        map[r][c] = 2;
      }
    }

    const b = border | 0;
    const corners = [
      { c: b - 1, r: b - 1, d1: [1, 0], d2: [0, 1] },
      { c: cols - b, r: b - 1, d1: [-1, 0], d2: [0, 1] },
      { c: b - 1, r: rows - b, d1: [1, 0], d2: [0, -1] },
      { c: cols - b, r: rows - b, d1: [-1, 0], d2: [0, -1] },
    ];
    // угол: stub если обе руки; 1 рука — редко
    for (const corner of corners) {
      const { c, r, d1, d2 } = corner;
      if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
      const solid = (dc, dr) => {
        const nc = c + dc, nr = r + dr;
        return nr >= 0 && nc >= 0 && nr < rows && nc < cols && map[nr][nc] === 2;
      };
      const a = solid(d1[0], d1[1]), b2 = solid(d2[0], d2[1]);
      if (a && b2) map[r][c] = 2;
      else if ((a || b2) && rnd() < 0.20) map[r][c] = 2;
    }

    // ≥70% открытых на кольце — снимаем любые стены (картинка из битмапа пересчитается)
    const needOpen = Math.ceil(ring.length * 0.70);
    const walls = [];
    for (const { c, r } of ring) if (map[r][c] === 2) walls.push({ c, r });
    let openCount = ring.length - walls.length;
    for (let i = walls.length - 1; i > 0; i--) {
      const j = (rnd() * (i + 1)) | 0;
      const tmp = walls[i]; walls[i] = walls[j]; walls[j] = tmp;
    }
    for (const cell of walls) {
      if (openCount >= needOpen) break;
      if (isRingCorner(cell.c, cell.r)) continue;
      map[cell.r][cell.c] = 0;
      openCount++;
    }
    for (const cell of walls) {
      if (openCount >= needOpen) break;
      if (map[cell.r][cell.c] !== 2) continue;
      map[cell.r][cell.c] = 0;
      openCount++;
    }
    // угол без рук — не стена
    for (const corner of corners) {
      const { c, r, d1, d2 } = corner;
      if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
      if (map[r][c] !== 2) continue;
      const solid = (dc, dr) => {
        const nc = c + dc, nr = r + dr;
        return nr >= 0 && nc >= 0 && nr < rows && nc < cols && map[nr][nc] === 2;
      };
      const arms = (solid(d1[0], d1[1]) ? 1 : 0) + (solid(d2[0], d2[1]) ? 1 : 0);
      if (arms === 0) map[r][c] = 0;
    }
    return wallDecor;
  },
  /**
   * Бюджет препятствий play по этажу (LEVEL_PROMPTS bands).
   * 5×7 база: рано — открытые проходы; позже — плотнее, но ≤~35% блокировки.
   */
  playPropPlan(floor, playCols, playRows) {
    const area = playCols * playRows;
    const f = floor | 0;
    let desk1, desk2, plant = 1, cooler = 1;
    if (f <= 2) {
      desk1 = 1; desk2 = 1; // open aisles
    } else if (f <= 8) {
      desk1 = 2; desk2 = 1;
    } else if (f <= 16) {
      desk1 = 2; desk2 = 2;
    } else if (f <= 24) {
      desk1 = 2; desk2 = 2;
      if (area >= 42) desk1 += 1;
    } else {
      desk1 = 2 + ((f + playCols) % 2);
      desk2 = 2 + Math.min(2, Math.floor((area - 35) / 18));
    }
    // жёсткий потолок: не больше ~38% клеток play
    const maxCells = Math.max(4, Math.floor(area * 0.38));
    while (desk1 + desk2 * 2 + plant + cooler > maxCells && desk2 > 1) desk2--;
    while (desk1 + desk2 * 2 + plant + cooler > maxCells && desk1 > 1) desk1--;
    return { desk1, desk2, plant, cooler };
  },
  /** Кандидаты play: внутри офиса, shuffle с весом к «островкам» (не на входах). */
  playPropCandidates(map, border, rnd) {
    const rows = map.length, cols = map[0].length;
    const b = border | 0;
    const playCols = cols - b * 2, playRows = rows - b * 2;
    const aisleC = b + ((playCols / 2) | 0);
    const aisleR = b + ((playRows / 2) | 0);
    const list = [];
    for (let r = b; r < rows - b; r++) {
      for (let c = b; c < cols - b; c++) {
        // вес: край play (входы со спавна) — ниже; центральные проходы — ниже; островки — выше
        const onEdge = r === b || r === rows - b - 1 || c === b || c === cols - b - 1;
        const onAisle = c === aisleC || r === aisleR;
        let w = 10;
        if (onEdge) w -= 6;
        if (onAisle) w -= 4;
        // чуть внутрь от края — хороший «мебельный» ряд
        if (!onEdge && (r === b + 1 || r === rows - b - 2 || c === b + 1 || c === cols - b - 2)) w += 3;
        list.push({ c, r, w: Math.max(1, w) });
      }
    }
    list.forEach((x) => { x.key = rnd() / x.w; });
    list.sort((a, b) => a.key - b.key);
    return list;
  },
  /** После раскладки: у открытых входов края снести только soft-пропы (plant/cooler). */
  clearPlayEntries(map, border) {
    const rows = map.length, cols = map[0].length;
    const b = border | 0;
    const soft = new Set([3, 4]);
    const clearAt = (c, r) => {
      if (r < b || c < b || r >= rows - b || c >= cols - b) return;
      if (soft.has(map[r][c])) map[r][c] = 0;
    };
    for (let c = b; c < cols - b; c++) {
      if (map[0][c] === 0) clearAt(c, b);
      if (map[rows - 1][c] === 0) clearAt(c, rows - b - 1);
    }
    for (let r = b; r < rows - b; r++) {
      if (map[r][0] === 0) clearAt(b, r);
      if (map[r][cols - 1] === 0) clearAt(cols - b - 1, r);
    }
  },
  /** Клетка на периметре play (соседит с fog) — столы сюда не ставим. */
  isPlayPerimeter(c, r, border, cols, rows) {
    const b = border | 0;
    return r === b || r === rows - b - 1 || c === b || c === cols - b - 1;
  },
  /**
   * Play-пропы (столы и т.п.) + битмап стен на границе.
   * Порядок: арена → препятствия-мебель; кольцо → препятствия-стены (placeFogDecor).
   * Рисование стен — только wallGeomOf/wallPictureOf по соседям битмапа.
   */
  buildMap(floor, grid) {
    const { cols, rows, border, playCols, playRows } = grid;
    const b = border | 0;
    const rnd = this.floorRng(floor);
    const map = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
    const plan = this.playPropPlan(floor, playCols, playRows);
    const props = [];
    for (let i = 0; i < plan.desk2; i++) props.push(5);
    for (let i = 0; i < plan.desk1; i++) props.push(1);
    if (plan.plant) props.push(3);
    if (plan.cooler) props.push(4);

    const candidates = this.playPropCandidates(map, b, rnd);
    for (const kind of props) {
      let placed = false;
      for (const cell of candidates) {
        if (kind === 5) {
          if (cell.c + 1 >= cols - b) continue;
          if (map[cell.r][cell.c] !== 0 || map[cell.r][cell.c + 1] !== 0) continue;
          // столы — только внутри, не на периметре входов
          if (this.isPlayPerimeter(cell.c, cell.r, b, cols, rows)) continue;
          if (this.isPlayPerimeter(cell.c + 1, cell.r, b, cols, rows)) continue;
          const aisleC = b + ((playCols / 2) | 0);
          if ((cell.c === aisleC || cell.c + 1 === aisleC) && rnd() < 0.3) continue;
          map[cell.r][cell.c] = 5;
          map[cell.r][cell.c + 1] = 6;
          if (!this.mapConnected(map, b)) {
            map[cell.r][cell.c] = 0;
            map[cell.r][cell.c + 1] = 0;
            continue;
          }
          placed = true;
          break;
        }
        if (map[cell.r][cell.c] !== 0) continue;
        // plant/cooler тоже не на периметре входов (иначе clear/спавн их сносит)
        if (this.isPlayPerimeter(cell.c, cell.r, b, cols, rows)) continue;
        const aisleC = b + ((playCols / 2) | 0);
        const aisleR = b + ((playRows / 2) | 0);
        if ((cell.c === aisleC || cell.r === aisleR) && rnd() < 0.25) continue;
        map[cell.r][cell.c] = kind;
        if (!this.mapConnected(map, b)) {
          map[cell.r][cell.c] = 0;
          continue;
        }
        placed = true;
        break;
      }
      if (!placed) {
        for (const cell of candidates) {
          if (kind === 5) {
            if (cell.c + 1 >= cols - b) continue;
            if (map[cell.r][cell.c] !== 0 || map[cell.r][cell.c + 1] !== 0) continue;
            if (this.isPlayPerimeter(cell.c, cell.r, b, cols, rows)) continue;
            if (this.isPlayPerimeter(cell.c + 1, cell.r, b, cols, rows)) continue;
            map[cell.r][cell.c] = 5;
            map[cell.r][cell.c + 1] = 6;
            if (!this.mapConnected(map, b)) {
              map[cell.r][cell.c] = 0;
              map[cell.r][cell.c + 1] = 0;
              continue;
            }
            break;
          }
          if (map[cell.r][cell.c] !== 0) continue;
          if (this.isPlayPerimeter(cell.c, cell.r, b, cols, rows)) continue;
          map[cell.r][cell.c] = kind;
          if (!this.mapConnected(map, b)) {
            map[cell.r][cell.c] = 0;
            continue;
          }
          break;
        }
      }
    }
    const wallDecor = this.placeFogDecor(map, b, rnd);
    this.clearPlayEntries(map, b);
    if (!this.mapConnected(map, b)) {
      for (let r = b; r < rows - b; r++) {
        for (let c = b; c < cols - b; c++) map[r][c] = 0;
      }
    }
    return { map, wallDecor };
  },
  /** Игрок: только play-пол; полоса тумана и пропы — нельзя */
  walkable(s, col, row) {
    if (row < 0 || col < 0 || row >= s.rows || col >= s.cols) return false;
    if (!this.inPlayArea(s, col, row)) return false;
    return s.map[row][col] === 0;
  },
  isBlockedProp(cell) {
    return cell === 1 || cell === 2 || cell === 3 || cell === 4 || cell === 5 || cell === 6 || cell === 7;
  },
  isWallCell(cell) {
    return cell === 2 || cell === 7;
  },
  walkList(s, excludeCol, excludeRow) {
    const out = [];
    for (let r = 0; r < s.rows; r++) {
      for (let c = 0; c < s.cols; c++) {
        if (!this.walkable(s, c, r)) continue;
        if (c === excludeCol && r === excludeRow) continue;
        out.push({ col: c, row: r });
      }
    }
    return out;
  },
  edgeSpawns(s, dir) {
    // спавн на внешней кромке полосы тумана (открытый пол); стены — не спавн
    const cells = [];
    if (dir === "down") {
      for (let c = 0; c < s.cols; c++) if (this.spawnCellOpen(s, c, 0)) cells.push({ col: c, row: 0, dir });
    } else if (dir === "up") {
      for (let c = 0; c < s.cols; c++) if (this.spawnCellOpen(s, c, s.rows - 1)) cells.push({ col: c, row: s.rows - 1, dir });
    } else if (dir === "right") {
      for (let r = 0; r < s.rows; r++) if (this.spawnCellOpen(s, 0, r)) cells.push({ col: 0, row: r, dir });
    } else if (dir === "left") {
      for (let r = 0; r < s.rows; r++) if (this.spawnCellOpen(s, s.cols - 1, r)) cells.push({ col: s.cols - 1, row: r, dir });
    }
    return cells;
  },
  /** 0 на 1 этаже; растёт с каждым днём */
  floorIdx(s) {
    return Math.max(0, (s.floor || 1) - 1);
  },
  /** +1% скорости за этаж (и игрок, и мобы) */
  floorSpeedMul(s) {
    return 1 + this.floorIdx(s) * 0.01;
  },
  playerMoveMs(s) {
    return 0.095 / this.floorSpeedMul(s);
  },
  threatSpeedScale(s) {
    return this.floorSpeedMul(s);
  },
  /** База 3, +1 каждые 15 этажей */
  maxThreats(s) {
    return 3 + Math.floor(this.floorIdx(s) / 15);
  },
  liveThreatCount(s) {
    return s.threats.filter((t) => !t._dead).length;
  },
  unlockedKindIds(s) {
    const f = s.floor || 1;
    return this.KIND_UNLOCK.filter((u) => f >= u.from).map((u) => u.id);
  },
  /** HR и клиенты могут дублироваться; остальные — макс. 1 на поле */
  kindAllowsDup(id) {
    return id === "hr" || id === "client";
  },
  liveKindCount(s, id) {
    return s.threats.filter((t) => !t._dead && t.kind && t.kind.id === id).length;
  },
  canSpawnKind(s, id) {
    if (this.kindAllowsDup(id)) return true;
    return this.liveKindCount(s, id) < 1;
  },
  phase(m) {
    // прогрессия дня, пик ускорения мобов +25% к утру
    if (m < 80) return { label: "Утро", speedMul: 1.00, spawnMul: 1.45, tint: "rgba(255,247,237,0.14)" };
    if (m < 280) return { label: "Работа", speedMul: 1.08, spawnMul: 1.12, tint: "rgba(255,255,255,0.05)" };
    if (m < 430) return { label: "Аврал", speedMul: 1.16, spawnMul: 0.92, tint: "rgba(254,240,138,0.16)" };
    return { label: "Переработка", speedMul: 1.25, spawnMul: 0.78, tint: "rgba(196,181,253,0.2)" };
  },
  clock(m) {
    const t = 9 * 60 + Math.floor(m);
    return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
  },
  cell(s, col, row) {
    return { x: s.padX + (col + 0.5) * s.cellW, y: s.padT + (row + 0.5) * s.cellH };
  },
  tryMove(s, dc, dr) {
    if (s.moving || !s.alive || s.won) return false;
    const nc = s.col + dc, nr = s.row + dr;
    if (!this.walkable(s, nc, nr)) return false;
    s.fromCol = s.col;
    s.fromRow = s.row;
    s.col = nc;
    s.row = nr;
    s.moveT = 0;
    s.moveDur = this.playerMoveMs(s);
    s.moving = true;
    s.facing = this.facingFromDelta(dc, dr);
    // walkStride 0|1 задаёт полушаг (кадры 0–2 или 3–5);翻п после завершения шага
    if (s.walkStride == null) s.walkStride = 0;
    this.sfx("step");
    return true;
  },
  sfx(id, opts) {
    const api = window.DEADLINE_SFX;
    if (api && api.play) api.play(id, opts);
  },
  syncBgm(s) {
    const api = window.DEADLINE_SFX;
    if (!api) return;
    const demoTab = document.getElementById("tab-demo");
    // на других вкладках не трогаем BGM — там своё превью
    if (demoTab && !demoTab.classList.contains("active")) return;
    const playing = !!(s.alive && !s.won);
    if (playing) {
      if (!api.bgmIsPlaying()) api.bgmStart();
      const ph = this.phase(s.gameMin);
      api.bgmSetParams({ rate: ph.speedMul, slow: s.coffeeBoost > 0 });
    } else if (api.bgmIsPlaying()) {
      api.bgmStop();
    }
  },
  /** Один шаг к целевой клетке (клик). Не pathfind-бег. */
  stepToward(s, tCol, tRow) {
    if (s.moving || !s.alive || s.won) return false;
    if (tCol === s.col && tRow === s.row) return false;
    const dc = Math.sign(tCol - s.col);
    const dr = Math.sign(tRow - s.row);
    // соседняя клетка — шаг прямо
    if (Math.abs(tCol - s.col) + Math.abs(tRow - s.row) === 1) {
      return this.tryMove(s, tCol - s.col, tRow - s.row);
    }
    // дальше — один шаг по доминирующей оси, иначе по второй
    if (Math.abs(tCol - s.col) >= Math.abs(tRow - s.row)) {
      if (dc && this.tryMove(s, dc, 0)) return true;
      if (dr && this.tryMove(s, 0, dr)) return true;
    } else {
      if (dr && this.tryMove(s, 0, dr)) return true;
      if (dc && this.tryMove(s, dc, 0)) return true;
    }
    return false;
  },
  cellFromPointer(s, x, y) {
    const col = Math.floor((x - s.padX) / s.cellW);
    const row = Math.floor((y - s.padT) / s.cellH);
    if (col < 0 || row < 0 || col >= s.cols || row >= s.rows) return null;
    return { col, row };
  },
  handleTapMove(s, api) {
    const tap = api.input.consumeTap();
    if (!tap) return;
    const cell = this.cellFromPointer(s, tap.x, tap.y);
    if (!cell) return;
    if (!this.walkable(s, cell.col, cell.row) && !(cell.col === s.col && cell.row === s.row)) return;
    if (s.moving) {
      s.pendingClick = cell; // максимум один отложенный шаг
      return;
    }
    this.stepToward(s, cell.col, cell.row);
  },
  /** Кофе = slow-mo мира (боссы/коллеги), не ускорение шага */
  worldScale(s) {
    return s.coffeeBoost > 0 ? 0.42 : 1;
  },
  tickMove(s, dt) {
    if (!s.moving) {
      s.px = s.col;
      s.py = s.row;
      return;
    }
    s.moveT += dt;
    const u = Math.min(1, s.moveT / s.moveDur);
    // smoothstep — без ease-out «подпрыгивания» на старте/финише клетки
    const e = u * u * (3 - 2 * u);
    s.px = s.fromCol + (s.col - s.fromCol) * e;
    s.py = s.fromRow + (s.row - s.fromRow) * e;
    if (u >= 1) {
      s.moving = false;
      s.px = s.col;
      s.py = s.row;
      s.walkStride = ((s.walkStride || 0) + 1) & 1; // следующая клетка — другая нога
      // один отложенный клик → один шаг, без автобега
      if (s.pendingClick) {
        const p = s.pendingClick;
        s.pendingClick = null;
        this.stepToward(s, p.col, p.row);
      }
    }
  },
  /** Старт за краем карты: 1 клетка снаружи игрового поля */
  offMapStart(pick, dir) {
    // pick = крайняя клетка пола; старт — в тумане за краем
    const d = this.DIRS[dir];
    return { col: pick.col - d.dc * 2, row: pick.row - d.dr * 2 };
  },
  /** Проход: off-map / пол арены. Полоса тумана — недоступна всем. */
  moverPassable(s, col, row) {
    if (col < -2 || row < -2 || col > s.cols + 1 || row > s.rows + 1) return false;
    if (col < 0 || row < 0 || col >= s.cols || row >= s.rows) return true; // за сеткой
    if (this.inFogBorder(s, col, row)) return false; // тень — нельзя никому
    return s.map[row][col] === 0;
  },
  onPlayFloor(s, col, row) {
    return this.walkable(s, col, row);
  },
  /** Стол/проп/стена — препятствие (директор ghost лезет медленнее) */
  isObstacleCell(s, col, row) {
    if (col < 0 || row < 0 || col >= s.cols || row >= s.rows) return false;
    return this.isBlockedProp(s.map[row][col]);
  },
  /** Моб сейчас лезет сквозь препятствие (текущая или следующая клетка) */
  throughObstacle(s, t) {
    if (this.isObstacleCell(s, t.col, t.row)) return true;
    if (t.frac > 0.02 && this.isObstacleCell(s, t.col + t.dc, t.row + t.dr)) return true;
    return false;
  },
  spawnColleague(s, api) {
    const bonus = Math.random() < 0.42 ? "shield" : "coffee";
    if (s.colleagues.some((c) => c.bonus === bonus)) return false;
    if (bonus === "shield" && s.pickups.some((p) => p.type === "shield")) return false;
    const dirs = ["down", "up", "left", "right"];
    const shuffled = dirs.slice().sort(() => Math.random() - 0.5);
    for (const dir of shuffled) {
      let opts = this.edgeSpawns(s, dir).filter((o) => this.corridorClear(s, o.col, o.row, dir, 2));
      if (!opts.length) continue;
      // не «летит в игрока» по его полосе — предпочитаем соседние коридоры
      const offLane = opts.filter((o) => (dir === "down" || dir === "up") ? o.col !== s.col : o.row !== s.row);
      if (offLane.length) opts = offLane;
      const pick = api.pick(opts);
      const d = this.DIRS[dir];
      const start = this.offMapStart(pick, dir);
      const entryC = pick.col;
      const entryR = pick.row;
      if (!this.spawnCellOpen(s, entryC, entryR)) continue;
      if (entryC === s.col && entryR === s.row) continue;
      s.colleagues.push({
        col: start.col, row: start.row, frac: 0,
        dir, dc: d.dc, dr: d.dr,
        px: start.col, py: start.row,
        bonus,
        age: 0,
        floorSteps: 0,
        dropAfter: 1 + ((Math.random() * 2) | 0), // через 1–2 шага по полу бейдж падает
        offerT: 0,
        offerDone: false,
        helped: false,
        waveT: 0,
      });
      if (!(s.allyFlash > 0)) {
        s.allyFlash = 1.6;
        s.allyFlashText = bonus === "coffee" ? "Коллега несёт кофе!" : "Коллега несёт бейдж!";
      }
      return true;
    }
    return false;
  },
  /** Бейдж падает на клетку — его надо подобрать, не срывать с коллеги */
  dropBadge(s, c) {
    if (c.bonus !== "shield" || c.dropped) return false;
    let col = c.col, row = c.row;
    if (!this.walkable(s, col, row)) {
      const near = this.walkList(s);
      if (!near.length) return false;
      let best = near[0], bestD = 99;
      for (const cell of near) {
        const d = Math.abs(cell.col - col) + Math.abs(cell.row - row);
        if (d < bestD) { bestD = d; best = cell; }
      }
      col = best.col; row = best.row;
    }
    if (s.pickups.some((p) => p.type === "shield" && p.col === col && p.row === row)) return false;
    s.pickups.push({ col, row, type: "shield" });
    c.bonus = null;
    c.dropped = true;
    this.sfx("drop");
    return true;
  },
  colleagueFacePlayer(s, c) {
    const fdc = Math.sign(Math.round(s.px) - c.col);
    const fdr = Math.sign(Math.round(s.py) - c.row);
    if (fdc || fdr) c.dir = this.facingFromDelta(fdc, fdr);
  },
  colleagueTravelDir(c) {
    c.dir = c.dc === 1 ? "right" : c.dc === -1 ? "left" : c.dr === 1 ? "down" : "up";
  },
  advanceColleague(s, c, cellsPerSec, dt) {
    c.age += dt;
    c.px = c.col + c.dc * c.frac;
    c.py = c.row + c.dr * c.frac;

    // после кофе — помахал и уходит живым (не «убитый моб»)
    if (c.waveT > 0) {
      c.waveT -= dt;
      this.colleagueFacePlayer(s, c);
      return;
    }

    const dist = Math.abs(c.px - s.px) + Math.abs(c.py - s.py);
    // пауза-предложение: друг ждёт, игрок сам подходит
    if (c.bonus && !c.helped && dist <= 1.6) {
      if (c.offerT <= 0 && !c.offerDone) {
        c.offerT = 0.85;
        c.offerDone = true;
      }
    }
    if (c.offerT > 0) {
      c.offerT -= dt;
      this.colleagueFacePlayer(s, c);
      return;
    }

    this.colleagueTravelDir(c);
    const speed = cellsPerSec * 0.38;
    c.frac += speed * dt;
    while (c.frac >= 1) {
      c.frac -= 1;
      const land = this.tryMoverStep(s, c.col, c.row, c.dc, c.dr);
      if (!land) { c._dead = true; return; }
      c.col = land.col; c.row = land.row;
      if (c.bonus === "shield" && !c.dropped && this.onPlayFloor(s, c.col, c.row)) {
        c.floorSteps = (c.floorSteps || 0) + 1;
        if (c.floorSteps >= (c.dropAfter || 1)) this.dropBadge(s, c);
      }
    }
    c.px = c.col + c.dc * c.frac;
    c.py = c.row + c.dr * c.frac;
    // ушёл за противоположный край после прохода поля
    if (c.age > 1 && (c.px < -1.35 || c.py < -1.35 || c.px > s.cols + 0.35 || c.py > s.rows + 0.35)) {
      if (c.bonus === "shield" && !c.dropped) this.dropBadge(s, c);
      c._dead = true;
    }
  },
  /** Escape graph: player can reach ≥1 safe cell not under imminent threat lanes */
  hasEscape(s, extraThreat) {
    const threats = extraThreat ? s.threats.concat(extraThreat) : s.threats;
    const blocked = new Set();
    for (const t of threats) {
      const c = Math.round(t.col), r = Math.round(t.row);
      if (c < 0 || r < 0 || c >= s.cols || r >= s.rows) continue;
      blocked.add(`${c},${r}`);
      if (t.pattern === "line") {
        const d = this.DIRS[t.dir];
        for (let i = 1; i <= 2; i++) {
          const bc = c + d.dc * i, br = r + d.dr * i;
          if (bc < 0 || br < 0 || bc >= s.cols || br >= s.rows) continue;
          blocked.add(`${bc},${br}`);
        }
      }
    }
    const startKey = `${s.col},${s.row}`;
    if (blocked.has(startKey)) return false;
    const seen = new Set([startKey]);
    const q = [{ col: s.col, row: s.row }];
    let reachable = 0;
    while (q.length) {
      const cur = q.shift();
      reachable++;
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = cur.col + dc, nr = cur.row + dr;
        const key = `${nc},${nr}`;
        if (!this.walkable(s, nc, nr) || seen.has(key) || blocked.has(key)) continue;
        seen.add(key);
        q.push({ col: nc, row: nr });
      }
    }
    return reachable >= 3;
  },
  pickKind(s, api) {
    const ids = this.unlockedKindIds(s);
    const open = ids.filter((id) => this.canSpawnKind(s, id));
    const pool = open.length ? open : ids.filter((id) => this.kindAllowsDup(id));
    if (!pool.length) return null;
    // чуть чаще берём самый свежий разлок
    const weights = pool.map((_, i) => (i === pool.length - 1 ? 3 : 2));
    let total = 0;
    for (const w of weights) total += w;
    let r = Math.random() * total;
    let id = pool[0];
    for (let i = 0; i < pool.length; i++) {
      r -= weights[i];
      if (r <= 0) { id = pool[i]; break; }
    }
    return this.KINDS.find((k) => k.id === id) || this.KINDS.find((k) => k.id === "hr");
  },
  corridorClear(s, col, row, dir, depth) {
    // от входа: транзит края → пол арены (не стены/пропы)
    const d = this.DIRS[dir];
    let c = col, r = row;
    for (let i = 0; i < depth; i++) {
      c += d.dc; r += d.dr;
      if (c < 0 || r < 0 || c >= s.cols || r >= s.rows) continue;
      if (s.map[r][c] !== 0) return false;
    }
    return true;
  },
  /** Ghost тоже только из проходов — не из стен/окон. */
  edgeSpawnsAny(s, dir) {
    return this.edgeSpawns(s, dir);
  },
  baseThreat(s, kind, dir, pick) {
    const d = this.DIRS[dir];
    const entryC = pick.col, entryR = pick.row;
    const start = this.offMapStart(pick, dir);
    const homeLane = (dir === "down" || dir === "up") ? entryC : entryR;
    const widePerp = (dir === "down" || dir === "up") ? { dc: 1, dr: 0 } : { dc: 0, dr: 1 };
    // секретарь: вторая клетка хитбокса
    let wideDc = widePerp.dc, wideDr = widePerp.dr;
    if (kind.pattern === "wide") {
      if (!this.spawnCellOpen(s, entryC + wideDc, entryR + wideDr)) {
        wideDc *= -1; wideDr *= -1;
      }
    }
    return {
      col: start.col, row: start.row, frac: 0, dir, pattern: kind.pattern, kind,
      dc: d.dc, dr: d.dr,
      stepT: 0, age: 0, entered: false,
      homeLane, homeDir: dir,
      path: [],
      peekPhase: "in",
      peekDepth: 2 + ((Math.random() * 3) | 0),
      floorSteps: 0,
      waitDur: kind.pattern === "hold" ? (0.55 + Math.random() * 0.45) : (0.75 + Math.random() * 0.7),
      waitT: 0,
      holdDone: false,
      blinkT: 0.35 + Math.random() * 0.25,
      dropT: 0.9 + Math.random() * 0.5,
      wideDc, wideDr,
      throughSlow: false,
      flash: 0,
      dashLeft: 0,
      walkStride: 0, // HR: полушаг A/B как у героя
    };
  },
  makeThreat(s, api, dir, forcedKind) {
    const kind = forcedKind || this.pickKind(s, api);
    if (!kind || !this.canSpawnKind(s, kind.id)) return null;
    const pattern = kind.pattern;
    const needsFloor = pattern !== "ghost";
    const optsRaw = needsFloor ? this.edgeSpawns(s, dir) : this.edgeSpawnsAny(s, dir);
    if (!optsRaw.length) return null;

    const depth = (s.border | 0) + (["dash", "peek", "hold", "weave", "patrol", "chaos", "hunt", "pincer", "report", "blink", "wide"].includes(pattern) ? 2 : 1);
    const scored = optsRaw.map((o) => {
      let crowd = 0;
      for (const t of s.threats) {
        if (dir === "down" || dir === "up") {
          if (Math.round(t.col) === o.col) crowd++;
        } else if (Math.round(t.row) === o.row) crowd++;
      }
      let clear = 0;
      if (needsFloor && pattern !== "ghost") {
        clear = this.corridorClear(s, o.col, o.row, dir, depth) ? 0 : (pattern === "weave" || pattern === "hunt" || pattern === "chaos" ? 1 : 5);
      }
      return { o, score: crowd + clear };
    }).filter((x) => x.score < 5 || pattern === "ghost" || pattern === "weave" || pattern === "hunt" || pattern === "chaos");
    if (!scored.length) return null;
    scored.sort((a, b) => a.score - b.score);
    const pick = scored[(Math.random() * Math.min(3, scored.length)) | 0].o;
    const entryC = pick.col, entryR = pick.row;
    if (needsFloor && !this.spawnCellOpen(s, entryC, entryR) && pattern !== "ghost") return null;
    const t = this.baseThreat(s, kind, dir, pick);
    const ghost = { ...t, col: entryC, row: entryR };
    if (!this.hasEscape(s, [ghost])) return null;
    return t;
  },
  /** Клиент: клещи — два моба с противоположных краёв одной линии */
  spawnPincer(s, api) {
    const kind = this.KINDS.find((k) => k.id === "client");
    const b = s.border | 0;
    const vertical = Math.random() < 0.5;
    if (vertical) {
      const cols = [];
      for (let c = b; c < s.cols - b; c++) {
        if (this.walkable(s, c, b) && this.walkable(s, c, s.rows - b - 1)) cols.push(c);
      }
      if (!cols.length) return false;
      const lane = api.pick(cols);
      const top = this.edgeSpawns(s, "down").find((o) => o.col === lane);
      const bot = this.edgeSpawns(s, "up").find((o) => o.col === lane);
      if (!top || !bot) return false;
      const a = this.baseThreat(s, kind, "down", top);
      const b2 = this.baseThreat(s, kind, "up", bot);
      a.pattern = "pincer"; b2.pattern = "pincer";
      s.threats.push(a, b2);
      return true;
    }
    const rows = [];
    for (let r = b; r < s.rows - b; r++) {
      if (this.walkable(s, b, r) && this.walkable(s, s.cols - b - 1, r)) rows.push(r);
    }
    if (!rows.length) return false;
    const lane = api.pick(rows);
    const left = this.edgeSpawns(s, "right").find((o) => o.row === lane);
    const right = this.edgeSpawns(s, "left").find((o) => o.row === lane);
    if (!left || !right) return false;
    const a = this.baseThreat(s, kind, "right", left);
    const b2 = this.baseThreat(s, kind, "left", right);
    a.pattern = "pincer"; b2.pattern = "pincer";
    s.threats.push(a, b2);
    return true;
  },
  spawnWave(s, api, ph) {
    const max = this.maxThreats(s);
    const dirs = ["down", "up", "left", "right"];
    const shuffled = dirs.slice().sort(() => Math.random() - 0.5);
    const tryPush = (need = 1) => this.liveThreatCount(s) + need <= max;

    const kind = this.pickKind(s, api);
    if (!kind) {
      s.spawnT = Math.max(0.4, 0.9 * ph.spawnMul);
      return;
    }
    if (kind.id === "client") {
      if (tryPush(2) && this.spawnPincer(s, api)) {
        // ok — клиенты могут быть парой и дублироваться
      } else if (tryPush(1)) {
        for (const dir of shuffled) {
          const fallback = this.KINDS.find((k) => k.id === "hr") || kind;
          const t = this.makeThreat(s, api, dir, fallback);
          if (t) { s.threats.push(t); break; }
        }
      }
    } else if (tryPush(1) && this.canSpawnKind(s, kind.id)) {
      for (const dir of shuffled) {
        const t = this.makeThreat(s, api, dir, kind);
        if (!t) continue;
        s.threats.push(t);
        break;
      }
    }

    const fi = this.floorIdx(s);
    const pressure = s.gameMin / s.totalMin + fi * 0.08;
    // доп. спавн только если есть слот и свободный тип (или HR)
    if (tryPush(1) && Math.random() < 0.12 + pressure * 0.4) {
      const k2 = this.pickKind(s, api);
      if (k2 && this.canSpawnKind(s, k2.id) && k2.id !== "client") {
        for (const dir of shuffled) {
          const t2 = this.makeThreat(s, api, dir, k2);
          if (!t2) continue;
          s.threats.push(t2);
          break;
        }
      }
    }
    if (s.pickups.filter((p) => p.type === "coin").length < 2 && Math.random() < 0.32) {
      const cells = this.walkList(s, s.col, s.row);
      if (cells.length) {
        const c = api.pick(cells);
        s.pickups.push({ col: c.col, row: c.row, type: "coin" });
      }
    }
    if (Math.random() < 0.36 + Math.min(0.12, fi * 0.03)) this.spawnColleague(s, api);
    // если у лимита — подождать дольше
    const full = this.liveThreatCount(s) >= max;
    s.spawnT = Math.max(0.32, (full ? 1.1 : 0.85) * (1.2 - fi * 0.04) * ph.spawnMul);
  },
  reverseDir(t) {
    t.dc *= -1;
    t.dr *= -1;
    t.dir = t.dc === 1 ? "right" : t.dc === -1 ? "left" : t.dr === 1 ? "down" : "up";
  },
  threatFlipWalkStride(t) {
    if (t.kind && t.kind.id === "hr") {
      t.walkStride = ((t.walkStride || 0) + 1) & 1;
    }
  },
  enterUntilFloor(s, t, cellsPerSec, dt, speedMul) {
    t.frac += cellsPerSec * (speedMul || 0.9) * dt;
    while (t.frac >= 1) {
      t.frac -= 1;
      const land = this.tryMoverStep(s, t.col, t.row, t.dc, t.dr);
      if (!land) { t._dead = true; return true; }
      t.col = land.col; t.row = land.row;
      this.threatFlipWalkStride(t);
      if (this.onPlayFloor(s, t.col, t.row)) { t.entered = true; return false; }
    }
    return false;
  },
  lineStepPassable(s, t, cellsPerSec, dt, speedMul) {
    t.frac += cellsPerSec * speedMul * dt;
    while (t.frac >= 1) {
      t.frac -= 1;
      const land = this.tryMoverStep(s, t.col, t.row, t.dc, t.dr);
      if (!land) { t._dead = true; return; }
      t.col = land.col; t.row = land.row;
      if (this.onPlayFloor(s, t.col, t.row)) t.entered = true;
    }
    if (t.entered && (t.col < 0 || t.row < 0 || t.col >= s.cols || t.row >= s.rows)) t._dead = true;
  },
  /** Дир: прямо, сквозь столы/пропы; в препятствии ~×0.5. Тень (fog) — не стоит. */
  advanceGhost(s, t, cellsPerSec, dt) {
    let remain = dt;
    while (remain > 0.00005) {
      const crawling = this.throughObstacle(s, t);
      t.throughSlow = crawling;
      const rate = cellsPerSec * 1.05 * (crawling ? 0.5 : 1);
      const need = 1 - t.frac;
      const timeNeed = need / Math.max(0.001, rate);
      if (timeNeed <= remain) {
        remain -= timeNeed;
        t.frac = 0;
        t.col += t.dc;
        t.row += t.dr;
        // открытая полоса тумана — перескок, не стоять
        while (
          t.col >= 0 && t.row >= 0 && t.col < s.cols && t.row < s.rows
          && this.inFogBorder(s, t.col, t.row)
          && s.map[t.row][t.col] === 0
        ) {
          t.col += t.dc;
          t.row += t.dr;
        }
        if (t.col >= 0 && t.row >= 0 && t.col < s.cols && t.row < s.rows) t.entered = true;
        const cx = t.col, cy = t.row;
        if (t.entered && (cx < -1.5 || cy < -1.5 || cx > s.cols + 0.5 || cy > s.rows + 0.5)) {
          t._dead = true;
          return;
        }
      } else {
        t.frac += rate * remain;
        remain = 0;
      }
    }
    t.throughSlow = this.throughObstacle(s, t);
    const cx = t.col + t.dc * t.frac;
    const cy = t.row + t.dr * t.frac;
    if (t.entered && (cx < -1.5 || cy < -1.5 || cx > s.cols + 0.5 || cy > s.rows + 0.5)) t._dead = true;
  },
  hrGoal(s, t) {
    const b = s.border | 0;
    if (t.homeDir === "down") return { col: t.homeLane, row: s.rows - b - 1 };
    if (t.homeDir === "up") return { col: t.homeLane, row: b };
    if (t.homeDir === "right") return { col: s.cols - b - 1, row: t.homeLane };
    return { col: b, row: t.homeLane };
  },
  hrExitOff(s, t) {
    if (t.homeDir === "down") return { col: t.homeLane, row: s.rows };
    if (t.homeDir === "up") return { col: t.homeLane, row: -1 };
    if (t.homeDir === "right") return { col: s.cols, row: t.homeLane };
    return { col: -1, row: t.homeLane };
  },
  bfsNext(s, fromC, fromR, goalC, goalR) {
    if (fromC === goalC && fromR === goalR) return null;
    const key = (c, r) => `${c},${r}`;
    const q = [{ c: fromC, r: fromR }];
    const prev = new Map();
    prev.set(key(fromC, fromR), null);
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let found = null;
    while (q.length) {
      const cur = q.shift();
      if (cur.c === goalC && cur.r === goalR) { found = cur; break; }
      for (const [dc, dr] of dirs) {
        const nc = cur.c + dc, nr = cur.r + dr;
        const k = key(nc, nr);
        if (prev.has(k)) continue;
        const isGoal = nc === goalC && nr === goalR;
        // моб ходит только по арене (край — не walk)
        if (!isGoal && !this.threatStepOk(s, nc, nr)) continue;
        prev.set(k, cur);
        q.push({ c: nc, r: nr });
      }
    }
    if (!found) return null;
    let cur = found;
    let p = prev.get(key(cur.c, cur.r));
    while (p && !(p.c === fromC && p.r === fromR)) {
      cur = p;
      p = prev.get(key(cur.c, cur.r));
    }
    return { col: cur.c, row: cur.r };
  },
  weavePickNext(s, t) {
    const goal = this.hrGoal(s, t);
    if (t.col === goal.col && t.row === goal.row) {
      const ex = this.hrExitOff(s, t);
      t.dc = Math.sign(ex.col - t.col);
      t.dr = Math.sign(ex.row - t.row);
      if (!t.dc && !t.dr) {
        if (t.homeDir === "down") t.dr = 1;
        else if (t.homeDir === "up") t.dr = -1;
        else if (t.homeDir === "right") t.dc = 1;
        else t.dc = -1;
      }
      t.dir = t.dc === 1 ? "right" : t.dc === -1 ? "left" : t.dr === 1 ? "down" : "up";
      return;
    }
    let next = this.bfsNext(s, t.col, t.row, goal.col, goal.row);
    if (!next) {
      const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        .map(([dc, dr]) => ({ col: t.col + dc, row: t.row + dr }))
        .filter((n) => this.threatStepOk(s, n.col, n.row)
          || n.col < 0 || n.row < 0 || n.col >= s.cols || n.row >= s.rows);
      if (!opts.length) { t._dead = true; return; }
      opts.sort((a, b) => {
        const da = Math.abs(a.col - goal.col) + Math.abs(a.row - goal.row);
        const db = Math.abs(b.col - goal.col) + Math.abs(b.row - goal.row);
        return da - db;
      });
      next = opts[0];
    }
    t.dc = Math.sign(next.col - t.col);
    t.dr = Math.sign(next.row - t.row);
    if (!t.dc && !t.dr) { t._dead = true; return; }
    t.dir = t.dc === 1 ? "right" : t.dc === -1 ? "left" : t.dr === 1 ? "down" : "up";
  },
  /** HR: BFS вокруг препятствий, плавное скольжение по клеткам */
  advanceWeave(s, t, cellsPerSec, dt) {
    if (!t.entered) {
      if (this.enterUntilFloor(s, t, cellsPerSec, dt, 0.9)) return;
      return;
    }
    const speed = cellsPerSec * 0.85;
    t.frac += speed * dt;
    while (t.frac >= 1) {
      t.frac -= 1;
      const land = this.tryMoverStep(s, t.col, t.row, t.dc, t.dr);
      if (!land) {
        this.weavePickNext(s, t);
        if (t._dead) return;
        const land2 = this.tryMoverStep(s, t.col, t.row, t.dc, t.dr);
        if (!land2) { t._dead = true; return; }
        t.col = land2.col; t.row = land2.row;
      } else {
        t.col = land.col; t.row = land.row;
      }
      if (t.col < 0 || t.row < 0 || t.col >= s.cols || t.row >= s.rows) {
        t._dead = true;
        return;
      }
      this.threatFlipWalkStride(t);
      this.weavePickNext(s, t);
      if (t._dead) return;
      if (t.age > 18) { t._dead = true; return; }
    }
    const cx = t.col + t.dc * t.frac;
    const cy = t.row + t.dr * t.frac;
    if (cx < -1.4 || cy < -1.4 || cx > s.cols + 0.4 || cy > s.rows + 0.4) t._dead = true;
  },
  advancePeek(s, t, cellsPerSec, dt) {
    if (t.peekPhase === "wait") {
      t.waitT -= dt;
      t.frac = 0;
      if (t.waitT <= 0) {
        t.peekPhase = "out";
        this.reverseDir(t);
      }
      return;
    }
    const speed = cellsPerSec * (t.peekPhase === "out" ? 1.08 : 0.92);
    t.frac += speed * dt;
    while (t.frac >= 1) {
      t.frac -= 1;
      const land = this.tryMoverStep(s, t.col, t.row, t.dc, t.dr);
      if (!land) { t._dead = true; return; }
      t.col = land.col; t.row = land.row;
      if (this.onPlayFloor(s, t.col, t.row)) {
        t.entered = true;
        if (t.peekPhase === "in") {
          t.floorSteps += 1;
          if (t.floorSteps >= t.peekDepth) {
            t.peekPhase = "wait";
            t.waitT = t.waitDur;
            t.frac = 0;
            return;
          }
        }
      }
      if (t.peekPhase === "out" && (t.col < 0 || t.row < 0 || t.col >= s.cols || t.row >= s.rows)) {
        t._dead = true;
        return;
      }
    }
    if (t.peekPhase === "out" && t.entered) {
      const cx = t.col + t.dc * t.frac;
      const cy = t.row + t.dr * t.frac;
      if (cx < -1.4 || cy < -1.4 || cx > s.cols + 0.4 || cy > s.rows + 0.4) t._dead = true;
    }
  },
  advanceDash(s, t, cellsPerSec, dt) {
    this.lineStepPassable(s, t, cellsPerSec, dt, 1.35);
  },
  advanceHold(s, t, cellsPerSec, dt) {
    if (t.peekPhase === "wait") {
      t.waitT -= dt;
      t.frac = 0;
      if (t.waitT <= 0) t.peekPhase = "out";
      return;
    }
    t.frac += cellsPerSec * 0.88 * dt;
    while (t.frac >= 1) {
      t.frac -= 1;
      const land = this.tryMoverStep(s, t.col, t.row, t.dc, t.dr);
      if (!land) { t._dead = true; return; }
      t.col = land.col; t.row = land.row;
      if (this.onPlayFloor(s, t.col, t.row)) {
        t.entered = true;
        if (t.peekPhase === "in") {
          t.floorSteps += 1;
          if (t.floorSteps >= t.peekDepth) {
            t.peekPhase = "wait";
            t.waitT = t.waitDur;
            t.frac = 0;
            return;
          }
        }
      }
      if (t.peekPhase === "out" && (t.col < 0 || t.row < 0 || t.col >= s.cols || t.row >= s.rows)) {
        t._dead = true;
        return;
      }
    }
    if (t.peekPhase === "out" && t.entered) {
      const cx = t.col + t.dc * t.frac;
      const cy = t.row + t.dr * t.frac;
      if (cx < -1.4 || cy < -1.4 || cx > s.cols + 0.4 || cy > s.rows + 0.4) t._dead = true;
    }
  },
  /** Охранник: патруль туда-сюда по ряду/колонке — плавно */
  advancePatrol(s, t, cellsPerSec, dt) {
    if (!t.entered) {
      if (this.enterUntilFloor(s, t, cellsPerSec, dt, 0.85)) return;
      if (t.entered) {
        if (t.homeDir === "down" || t.homeDir === "up") {
          t.dc = Math.random() < 0.5 ? 1 : -1;
          t.dr = 0;
        } else {
          t.dc = 0;
          t.dr = Math.random() < 0.5 ? 1 : -1;
        }
        t.dir = t.dc === 1 ? "right" : t.dc === -1 ? "left" : t.dr === 1 ? "down" : "up";
        t.frac = 0;
      }
      return;
    }
    const speed = cellsPerSec * 0.75;
    t.frac += speed * dt;
    while (t.frac >= 1) {
      t.frac -= 1;
      let nc = t.col + t.dc, nr = t.row + t.dr;
      if (!this.walkable(s, nc, nr)) {
        this.reverseDir(t);
        nc = t.col + t.dc; nr = t.row + t.dr;
        if (!this.walkable(s, nc, nr)) { t._dead = true; return; }
      }
      t.col = nc; t.row = nr;
      if (t.age > 16) { t._dead = true; return; }
    }
  },
  /** Стажёр: хаотичные шаги — плавное скольжение */
  advanceChaos(s, t, cellsPerSec, dt) {
    if (!t.entered) {
      if (this.enterUntilFloor(s, t, cellsPerSec, dt, 0.95)) return;
      return;
    }
    if (!t.dc && !t.dr) {
      const opts0 = [[1, 0], [-1, 0], [0, 1], [0, -1]]
        .map(([dc, dr]) => ({ dc, dr }))
        .filter((n) => this.walkable(s, t.col + n.dc, t.row + n.dr));
      if (!opts0.length) { t._dead = true; return; }
      const p = opts0[(Math.random() * opts0.length) | 0];
      t.dc = p.dc; t.dr = p.dr;
      t.dir = t.dc === 1 ? "right" : t.dc === -1 ? "left" : t.dr === 1 ? "down" : "up";
    }
    const speed = cellsPerSec * 1.1;
    t.frac += speed * dt;
    while (t.frac >= 1) {
      t.frac -= 1;
      const nc = t.col + t.dc, nr = t.row + t.dr;
      if (!this.walkable(s, nc, nr)) {
        const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]]
          .map(([dc, dr]) => ({ col: t.col + dc, row: t.row + dr, dc, dr }))
          .filter((n) => this.walkable(s, n.col, n.row));
        if (!opts.length) { t._dead = true; return; }
        const pick = opts[(Math.random() * opts.length) | 0];
        t.dc = pick.dc; t.dr = pick.dr;
        t.dir = t.dc === 1 ? "right" : t.dc === -1 ? "left" : t.dr === 1 ? "down" : "up";
        t.col = pick.col; t.row = pick.row;
      } else {
        t.col = nc; t.row = nr;
        // новый случайный курс после шага
        const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]]
          .map(([dc, dr]) => ({ col: t.col + dc, row: t.row + dr, dc, dr }))
          .filter((n) => this.walkable(s, n.col, n.row));
        if (!opts.length) { t._dead = true; return; }
        const pick = opts[(Math.random() * opts.length) | 0];
        t.dc = pick.dc; t.dr = pick.dr;
        t.dir = t.dc === 1 ? "right" : t.dc === -1 ? "left" : t.dr === 1 ? "down" : "up";
      }
      if (t.age > 12) { t._dead = true; return; }
    }
  },
  /** KPI: медленно поджимает к игроку — плавно по BFS */
  advanceHunt(s, t, cellsPerSec, dt) {
    if (!t.entered) {
      if (this.enterUntilFloor(s, t, cellsPerSec, dt, 0.8)) return;
      return;
    }
    const pickHunt = () => {
      let next = this.bfsNext(s, t.col, t.row, s.col, s.row);
      if (!next) {
        const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]]
          .map(([dc, dr]) => ({ col: t.col + dc, row: t.row + dr }))
          .filter((n) => this.walkable(s, n.col, n.row));
        if (!opts.length) { t._dead = true; return; }
        opts.sort((a, b) => {
          const da = Math.abs(a.col - s.col) + Math.abs(a.row - s.row);
          const db = Math.abs(b.col - s.col) + Math.abs(b.row - s.row);
          return da - db;
        });
        next = opts[0];
      }
      t.dc = Math.sign(next.col - t.col);
      t.dr = Math.sign(next.row - t.row);
      if (!t.dc && !t.dr) return;
      t.dir = t.dc === 1 ? "right" : t.dc === -1 ? "left" : t.dr === 1 ? "down" : "up";
    };
    if (!t.dc && !t.dr) pickHunt();
    if (t._dead) return;
    const speed = cellsPerSec * 0.48;
    t.frac += speed * dt;
    while (t.frac >= 1) {
      t.frac -= 1;
      let nc = t.col + t.dc, nr = t.row + t.dr;
      if (!this.walkable(s, nc, nr)) {
        pickHunt();
        if (t._dead) return;
        nc = t.col + t.dc; nr = t.row + t.dr;
        if (!this.walkable(s, nc, nr)) { t._dead = true; return; }
      }
      t.col = nc; t.row = nr;
      pickHunt();
      if (t._dead) return;
      if (t.age > 14) { t._dead = true; return; }
    }
  },
  /** Клиент: линейный заход навстречу (клещи спавнятся парой) */
  advancePincer(s, t, cellsPerSec, dt) {
    this.lineStepPassable(s, t, cellsPerSec, dt, 1.05);
  },
  /** Бухгалтер: идёт и роняет зону «отчёт» */
  advanceReport(s, t, cellsPerSec, dt) {
    if (!t.entered) {
      if (this.enterUntilFloor(s, t, cellsPerSec, dt, 0.8)) return;
      return;
    }
    t.dropT -= dt;
    t.frac += cellsPerSec * 0.7 * dt;
    while (t.frac >= 1) {
      t.frac -= 1;
      const land = this.tryMoverStep(s, t.col, t.row, t.dc, t.dr);
      if (!land) { t._dead = true; return; }
      t.col = land.col; t.row = land.row;
      if (this.onPlayFloor(s, t.col, t.row) && t.dropT <= 0) {
        s.zones.push({
          col: t.col, row: t.row,
          life: 1.2 + Math.random() * 0.8,
          color: "rgba(20, 184, 166, 0.45)",
        });
        t.dropT = 1.1 + Math.random() * 0.6;
      }
    }
    if (t.entered && (t.col < 0 || t.row < 0 || t.col >= s.cols || t.row >= s.rows)) t._dead = true;
  },
  /** IT: быстрый рывок на 2 клетки — плавно, без телепорта */
  advanceBlink(s, t, cellsPerSec, dt) {
    if (!t.entered) {
      if (this.enterUntilFloor(s, t, cellsPerSec, dt, 1.0)) return;
      return;
    }
    t.blinkT -= dt;
    t.flash = Math.max(0, (t.flash || 0) - dt);
    const dashing = (t.dashLeft || 0) > 0;
    const speed = cellsPerSec * (dashing ? 2.4 : 0.45);
    if (dashing) t.flash = Math.max(t.flash, 0.12);
    t.frac += speed * dt;
    while (t.frac >= 1) {
      t.frac -= 1;
      const land = this.tryMoverStep(s, t.col, t.row, t.dc, t.dr);
      if (!land) {
        t.dashLeft = 0;
        t._dead = true;
        return;
      }
      t.col = land.col; t.row = land.row;
      if (dashing) {
        t.dashLeft -= 1;
        if (t.dashLeft <= 0) {
          t.blinkT = 0.55 + Math.random() * 0.35;
          break;
        }
      }
    }
    if (!dashing && t.blinkT <= 0) {
      // старт плавного рывка на 2 клетки (play only; тень не считается)
      let can = 0;
      let c = t.col, r = t.row;
      for (let i = 0; i < 2; i++) {
        const land = this.tryMoverStep(s, c, r, t.dc, t.dr);
        if (!land || !this.onPlayFloor(s, land.col, land.row)) break;
        c = land.col; r = land.row;
        can++;
      }
      if (can > 0) {
        t.dashLeft = can;
        t.flash = 0.2;
        t.blinkT = 99;
      } else {
        t.blinkT = 0.4 + Math.random() * 0.3;
      }
    }
    if (t.entered && (t.col < 0 || t.row < 0 || t.col >= s.cols || t.row >= s.rows)) t._dead = true;
  },
  /** Секретарь: медленно, хитбокс на 2 клетки */
  advanceWide(s, t, cellsPerSec, dt) {
    this.lineStepPassable(s, t, cellsPerSec, dt, 0.52);
  },
  advanceThreat(s, t, cellsPerSec, dt) {
    t.age += dt;
    if (t.pattern === "ghost") return this.advanceGhost(s, t, cellsPerSec, dt);
    if (t.pattern === "weave") return this.advanceWeave(s, t, cellsPerSec, dt);
    if (t.pattern === "peek") return this.advancePeek(s, t, cellsPerSec, dt);
    if (t.pattern === "dash") return this.advanceDash(s, t, cellsPerSec, dt);
    if (t.pattern === "hold") return this.advanceHold(s, t, cellsPerSec, dt);
    if (t.pattern === "patrol") return this.advancePatrol(s, t, cellsPerSec, dt);
    if (t.pattern === "chaos") return this.advanceChaos(s, t, cellsPerSec, dt);
    if (t.pattern === "hunt") return this.advanceHunt(s, t, cellsPerSec, dt);
    if (t.pattern === "pincer") return this.advancePincer(s, t, cellsPerSec, dt);
    if (t.pattern === "report") return this.advanceReport(s, t, cellsPerSec, dt);
    if (t.pattern === "blink") return this.advanceBlink(s, t, cellsPerSec, dt);
    if (t.pattern === "wide") return this.advanceWide(s, t, cellsPerSec, dt);
    return this.advanceDash(s, t, cellsPerSec, dt);
  },
  /** Непрерывная позиция тела моба (не индекс клетки). */
  threatBodyPos(t) {
    const waiting = (t.pattern === "peek" || t.pattern === "hold") && t.peekPhase === "wait";
    if (waiting) return { x: t.col, y: t.row };
    const sliding = t.pattern === "ghost" || t.pattern === "dash" || t.pattern === "peek" || t.pattern === "hold"
      || t.pattern === "weave" || t.pattern === "patrol" || t.pattern === "chaos" || t.pattern === "hunt"
      || t.pattern === "pincer" || t.pattern === "report" || t.pattern === "blink"
      || t.pattern === "wide" || !t.entered;
    if (sliding) return { x: t.col + t.dc * t.frac, y: t.row + t.dr * t.frac };
    return { x: t.col, y: t.row };
  },
  /** Хит по пересечению тел (игрок px/py ↔ моб), не по общей клетке сетки. */
  bodiesOverlap(ax, ay, bx, by, r) {
    return Math.abs(ax - bx) < r && Math.abs(ay - by) < r;
  },
  threatHits(s, t) {
    const body = this.threatBodyPos(t);
    const r = this.HIT_BODY;
    // ещё глубоко в тумане — не бьёт
    if (body.x < -0.35 || body.y < -0.35 || body.x > s.cols - 0.65 || body.y > s.rows - 0.65) {
      return false;
    }
    const px = s.px, py = s.py;
    if (this.bodiesOverlap(body.x, body.y, px, py, r)) return true;
    // секретарь: второе тело рядом
    if (t.pattern === "wide" && t.entered) {
      if (this.bodiesOverlap(body.x + t.wideDc, body.y + t.wideDr, px, py, r)) return true;
    }
    return false;
  },
  resetDay(s, api, keepMeta) {
    const floor = keepMeta.floor;
    const grid = this.gridSizeForFloor(floor);
    const { cols, rows, border, playCols, playRows } = grid;
    const built = this.buildMap(floor, grid);
    const map = built.map;
    const wallDecor = built.wallDecor;
    const start = this.findStart(map, border);
    Object.assign(s, {
      cols, rows, border, playCols, playRows, map, wallDecor,
      cellW: (api.w - s.padX * 2) / cols,
      cellH: (api.h - s.padT - s.padB) / rows,
      col: start.col, row: start.row,
      px: start.col, py: start.row,
      moving: false, fromCol: start.col, fromRow: start.row, moveT: 0, moveDur: this.playerMoveMs({ floor }),
      walkStride: 0,
      gameMin: 0, threats: [], pickups: [], colleagues: [], zones: [], spawnT: Math.max(0.55, 1.05 - (floor - 1) * 0.04),
      alive: true, won: false, invuln: 1.45,
      coffeeBoost: 0, shield: false, nearMiss: 0, tutorial: keepMeta.tutorial || 0, pendingClick: null,
      allyFlash: 0, allyFlashText: "",
      floor, bestFloor: keepMeta.bestFloor, coins: keepMeta.coins,
      facing: "down",
      _axisLatch: false, _keyLatch: false,
    });
  },
  update(s, api, dt) {
    this.handleDevButtons(s, api);
    const move = (dc, dr) => this.tryMove(s, dc, dr);
    if (!s.alive || s.won) {
      this.syncBgm(s);
      if (api.input.consumeTap() || api.input.keys.KeyR || api.input.keys.Space) {
        const startF = this.ensureDev().startFloor;
        // смерть → обратно на стартовый этаж (по умолчанию 1); победа уже подняла s.floor
        const floor = s.won ? s.floor : startF;
        this.resetDay(s, api, {
          floor,
          bestFloor: Math.max(s.bestFloor, floor),
          coins: s.coins,
          tutorial: 0,
        });
      }
      return;
    }
    this.syncBgm(s);
    s.tutorial = Math.max(0, s.tutorial - dt);
    const sim = dt * (this.TIME_SCALE || 1);
    s.gameMin += s.minutesPerSecond * sim;
    s.invuln = Math.max(0, s.invuln - sim);
    s.coffeeBoost = Math.max(0, s.coffeeBoost - sim);
    s.nearMiss = Math.max(0, s.nearMiss - sim);
    s.allyFlash = Math.max(0, (s.allyFlash || 0) - sim);
    this.tickMove(s, sim);

    // клик/тап по клетке — основной ввод (один шаг)
    this.handleTapMove(s, api);

    const sw = api.input.consumeSwipe();
    if (sw === "left") move(-1, 0);
    if (sw === "right") move(1, 0);
    if (sw === "up") move(0, -1);
    if (sw === "down") move(0, 1);

    // стик/ось: ровно один шаг на жест, пока не отпустил
    const a = api.input.axis();
    const held = Math.abs(a.x) > 0.5 || Math.abs(a.y) > 0.5;
    if (!s._axisLatch && held) {
      s._axisLatch = true;
      if (Math.abs(a.x) >= Math.abs(a.y)) move(a.x > 0 ? 1 : -1, 0);
      else move(0, a.y > 0 ? 1 : -1);
    } else if (!held) s._axisLatch = false;

    // клавиши: один шаг на нажатие, удержание не продолжает
    const k = api.input.keys;
    if (!s._keyLatch) {
      if (k.ArrowLeft || k.KeyA) { move(-1, 0); s._keyLatch = true; }
      else if (k.ArrowRight || k.KeyD) { move(1, 0); s._keyLatch = true; }
      else if (k.ArrowUp || k.KeyW) { move(0, -1); s._keyLatch = true; }
      else if (k.ArrowDown || k.KeyS) { move(0, 1); s._keyLatch = true; }
    } else if (!(k.ArrowLeft || k.KeyA || k.ArrowRight || k.KeyD || k.ArrowUp || k.KeyW || k.ArrowDown || k.KeyS)) {
      s._keyLatch = false;
    }

    const ph = this.phase(s.gameMin);
    const wdt = sim * this.worldScale(s);
    s.spawnT -= wdt;
    if (s.spawnT <= 0) this.spawnWave(s, api, ph);

    const scroll = 2.35 * ph.speedMul * this.threatSpeedScale(s);
    for (const c of s.colleagues) this.advanceColleague(s, c, scroll, wdt);

    for (const t of s.threats) {
      this.advanceThreat(s, t, scroll, wdt);
      if (this.threatHits(s, t)) {
        if (s.invuln > 0) continue;
        if (s.shield) {
          s.shield = false;
          s.invuln = 0.65;
          t._dead = true;
          s.nearMiss = 0.35;
          this.sfx("shield_break");
          continue;
        }
        t._dead = true;
        if (this.ensureDev().immortal) {
          this.registerGhostDeath(s);
          s.invuln = 0.7;
          s.nearMiss = 0.4;
          this.sfx("caught");
          continue;
        }
        s.alive = false;
        s.caughtAt = performance.now();
        this.sfx("caught");
        api.setHud(`ЗАСТАВИЛИ · ${this.clock(s.gameMin)} · этаж ${s.floor}`);
      } else {
        const body = this.threatBodyPos(t);
        const dist = Math.abs(body.x - s.px) + Math.abs(body.y - s.py);
        if (dist > this.HIT_BODY && dist < 1.15) {
          if (s.nearMiss <= 0) this.sfx("near_miss", { minGap: 0.35 });
          s.nearMiss = 0.22;
        }
      }
    }
    s.threats = s.threats.filter((t) => !t._dead && t.col >= -2 && t.row >= -2 && t.col <= s.cols + 1 && t.row <= s.rows + 1);

    // зоны «отчёт» от бухгалтера
    for (const z of s.zones) {
      z.life -= wdt;
      if (z.life > 0 && z.col === s.col && z.row === s.row && s.invuln <= 0) {
        if (s.shield) {
          s.shield = false;
          s.invuln = 0.55;
          z.life = 0;
          this.sfx("shield_break");
        } else if (this.ensureDev().immortal) {
          this.registerGhostDeath(s);
          s.invuln = 0.7;
          z.life = 0;
          this.sfx("caught");
        } else {
          s.alive = false;
          s.caughtAt = performance.now();
          this.sfx("caught");
          api.setHud(`ОТЧЁТ! · ${this.clock(s.gameMin)} · этаж ${s.floor}`);
        }
      }
    }
    s.zones = s.zones.filter((z) => z.life > 0);

    for (const p of s.pickups) {
      if (p.col === s.col && p.row === s.row) {
        p._dead = true;
        if (p.type === "shield") {
          s.shield = true;
          this.sfx("badge");
        } else {
          s.coins += 1;
          this.sfx("coin");
        }
      }
    }
    s.pickups = s.pickups.filter((p) => !p._dead);

    for (const c of s.colleagues) {
      // кофе — только подход на клетку (не lane-sweep как у боссов); бейдж с пола
      const sameCell = c.col === s.col && c.row === s.row;
      if (c.bonus === "coffee" && sameCell && !c.helped) {
        s.coffeeBoost = Math.max(s.coffeeBoost, 3.0);
        c.bonus = null;
        c.helped = true;
        c.waveT = 0.55;
        c.offerT = 0;
        this.colleagueFacePlayer(s, c);
        this.sfx("coffee");
      }
    }
    s.colleagues = s.colleagues.filter((c) => !c._dead && c.col >= -2 && c.row >= -2 && c.col <= s.cols + 1 && c.row <= s.rows + 1);

    if (s.gameMin >= s.totalMin) {
      s.won = true;
      s.floor += 1;
      s.bestFloor = Math.max(s.bestFloor, s.floor);
      s.threats = [];
      s.colleagues = [];
      s.zones = [];
      this.sfx("promote");
      api.setHud(`ПОВЫШЕНИЕ! Этаж ${s.floor}`);
      return;
    }
    const tip = s.tutorial > 0 ? " · ходи по светлым" : "";
    const buff = [
      s.coffeeBoost > 0 ? "КОФЕ" : "",
      s.shield ? "ЩИТ" : "",
    ].filter(Boolean).join("+");
    const d = this.ensureDev();
    const god = d.immortal ? ` · ${this.ghostDeathSummary()}` : "";
    const startTip = d.startFloor !== 1 ? ` · старт эт.${d.startFloor}` : "";
    if (s.allyFlash > 0 && s.allyFlashText) {
      api.setHud(s.allyFlashText);
    } else {
      api.setHud(`${this.clock(s.gameMin)} · ${ph.label} · эт.${s.floor} · 🪙${s.coins}${buff ? " · " + buff : ""}${god}${startTip}${s.nearMiss > 0 ? " · near!" : ""}${tip} · ${this.ART_BUST}`);
    }
  },
  /** Пиксельные границы клетки — без субпиксельных щелей между спрайтами. */
  cellRect(s, col, row) {
    const x0 = Math.round(s.padX + col * s.cellW);
    const y0 = Math.round(s.padT + row * s.cellH);
    const x1 = Math.round(s.padX + (col + 1) * s.cellW);
    const y1 = Math.round(s.padT + (row + 1) * s.cellH);
    return { x: x0, y: y0, w: Math.max(1, x1 - x0), h: Math.max(1, y1 - y0) };
  },
  /** Пол — ровно в клетку, без зазоров */
  drawTile(ctx, key, x, y, w, h) {
    const art = this.ensureArt();
    const img = art.img[key];
    if (!img || !img.complete || !img.naturalWidth) return false;
    ctx.drawImage(img, x, y, w, h);
    return true;
  },
  /**
   * Подбор картинки стены из битмапа (соседи cell===2|7).
   * mid=1 сторона, L=2, U=3, stub=квадрат в углу арены, face=продолжение на клетке угла.
   */
  wallPictureOf(s, col, row) {
    const geom = this.wallGeomOf(s, col, row);
    if (geom.square) return { kind: "stub", ...geom };
    if (this.mapCornerOf(s, col, row)) {
      return { kind: geom.sides.length ? "face" : "empty", ...geom };
    }
    const n = geom.sides.length;
    if (n <= 1) return { kind: "mid", ...geom };
    if (n === 2) return { kind: "L", ...geom };
    return { kind: "U", ...geom };
  },
  /**
   * Геометрия стены из битмапа препятствий на границе (не из мебели арены).
   * Сосед вдоль кольца solid → нет торца; пусто → торец (в т.ч. пустой угол карты).
   *
   * Полоса к play (N→s, S→n, W→e, E→w).
   *  1 side  — mid
   *  2 sides — L
   *  3 sides — U
   *  square  — stub у стыка к play
   */
  wallGeomOf(s, col, row) {
    const sides = [];
    const push = (side) => { if (!sides.includes(side)) sides.push(side); };
    const corner = this.mapCornerOf(s, col, row);

    // Угол арены: 2 руки → stub; 1 рука → полоса-продолжение к play
    if (corner === "nw") {
      const a = this.frameSolidAt(s, col + 1, row);
      const b = this.frameSolidAt(s, col, row + 1);
      if (a && b) return { sides: [], square: "se" };
      if (a) push("s");
      if (b) push("e");
      return { sides, square: null };
    }
    if (corner === "ne") {
      const a = this.frameSolidAt(s, col - 1, row);
      const b = this.frameSolidAt(s, col, row + 1);
      if (a && b) return { sides: [], square: "sw" };
      if (a) push("s");
      if (b) push("w");
      return { sides, square: null };
    }
    if (corner === "sw") {
      const a = this.frameSolidAt(s, col + 1, row);
      const b = this.frameSolidAt(s, col, row - 1);
      if (a && b) return { sides: [], square: "ne" };
      if (a) push("n");
      if (b) push("e");
      return { sides, square: null };
    }
    if (corner === "se") {
      const a = this.frameSolidAt(s, col - 1, row);
      const b = this.frameSolidAt(s, col, row - 1);
      if (a && b) return { sides: [], square: "nw" };
      if (a) push("n");
      if (b) push("w");
      return { sides, square: null };
    }

    // Ребро: лицо к play + торец в каждую пустую клетку вдоль кольца
    const edge = this.fogEdgeOf(s, col, row);
    const openAlong = (nc, nr) => {
      if (nc < 0 || nr < 0 || nc >= s.cols || nr >= s.rows) return false;
      return !this.frameSolidAt(s, nc, nr);
    };
    if (edge === "n") {
      push("s");
      if (openAlong(col - 1, row)) push("w");
      if (openAlong(col + 1, row)) push("e");
    } else if (edge === "s") {
      push("n");
      if (openAlong(col - 1, row)) push("w");
      if (openAlong(col + 1, row)) push("e");
    } else if (edge === "w") {
      push("e");
      if (openAlong(col, row - 1)) push("n");
      if (openAlong(col, row + 1)) push("s");
    } else if (edge === "e") {
      push("w");
      if (openAlong(col, row - 1)) push("n");
      if (openAlong(col, row + 1)) push("s");
    }
    return { sides, square: null };
  },
  /**
   * Стены — proof по wallPictureOf (битмап → mid/L/U/stub/face).
   */
  drawWallAt(ctx, s, col, row, x, y, w, h) {
    ctx.fillStyle = "#020308";
    ctx.fillRect(x, y, w, h);
    const pic = this.wallPictureOf(s, col, row);
    const { sides, square, kind } = pic;
    if (kind === "empty") return;
    const band = Math.max(10, Math.round(Math.min(s.cellW, s.cellH) * 0.42));
    const body = "#c4a882";
    const edgeCol = "#6b4a2e";
    const lip = Math.max(3, (band * 0.18) | 0);

    const fillFace = (face) => {
      if (face === "n") ctx.fillRect(x, y, w, band);
      else if (face === "s") ctx.fillRect(x, y + h - band, w, band);
      else if (face === "w") ctx.fillRect(x, y, band, h);
      else if (face === "e") ctx.fillRect(x + w - band, y, band, h);
    };
    /** Кромка на стороне к play. */
    const fillFaceLip = (face) => {
      if (face === "n") ctx.fillRect(x, y, w, lip);
      else if (face === "s") ctx.fillRect(x, y + h - lip, w, lip);
      else if (face === "w") ctx.fillRect(x, y, lip, h);
      else if (face === "e") ctx.fillRect(x + w - lip, y, lip, h);
    };
    /**
     * Хвостик торца: от лицевой полосы до внешнего края клетки (к хрому/экрану).
     * Не band×band — иначе остаётся щель пола у границы.
     */
    const fillEndTail = (face, end) => {
      if (face === "s" && end === "w") ctx.fillRect(x, y, band, h - band);
      else if (face === "s" && end === "e") ctx.fillRect(x + w - band, y, band, h - band);
      else if (face === "n" && end === "w") ctx.fillRect(x, y + band, band, h - band);
      else if (face === "n" && end === "e") ctx.fillRect(x + w - band, y + band, band, h - band);
      else if (face === "e" && end === "n") ctx.fillRect(x, y, w - band, band);
      else if (face === "e" && end === "s") ctx.fillRect(x, y + h - band, w - band, band);
      else if (face === "w" && end === "n") ctx.fillRect(x + band, y, w - band, band);
      else if (face === "w" && end === "s") ctx.fillRect(x + band, y + h - band, w - band, band);
    };
    /** Тёмная кайма хвостика — внешняя грань на всю длину клетки (лицо + хвостик). */
    const fillEndTailLip = (face, end) => {
      if (face === "s" && end === "w") ctx.fillRect(x, y, lip, h);
      else if (face === "s" && end === "e") ctx.fillRect(x + w - lip, y, lip, h);
      else if (face === "n" && end === "w") ctx.fillRect(x, y, lip, h);
      else if (face === "n" && end === "e") ctx.fillRect(x + w - lip, y, lip, h);
      else if (face === "e" && end === "n") ctx.fillRect(x, y, w, lip);
      else if (face === "e" && end === "s") ctx.fillRect(x, y + h - lip, w, lip);
      else if (face === "w" && end === "n") ctx.fillRect(x, y, w, lip);
      else if (face === "w" && end === "s") ctx.fillRect(x, y + h - lip, w, lip);
    };
    const fillSquare = (sq) => {
      if (sq === "se") ctx.fillRect(x + w - band, y + h - band, band, band);
      else if (sq === "sw") ctx.fillRect(x, y + h - band, band, band);
      else if (sq === "ne") ctx.fillRect(x + w - band, y, band, band);
      else if (sq === "nw") ctx.fillRect(x, y, band, band);
    };
    /** Кайма квадратика — маленький квадрат lip×lip в углу к play. */
    const fillSquareLip = (sq) => {
      if (sq === "se") ctx.fillRect(x + w - lip, y + h - lip, lip, lip);
      else if (sq === "sw") ctx.fillRect(x, y + h - lip, lip, lip);
      else if (sq === "ne") ctx.fillRect(x + w - lip, y, lip, lip);
      else if (sq === "nw") ctx.fillRect(x, y, lip, lip);
    };

    if (kind === "stub" && square) {
      ctx.fillStyle = body;
      fillSquare(square);
      ctx.fillStyle = edgeCol;
      fillSquareLip(square);
      return;
    }
    if (!sides.length) return;

    // Угол карты: только face-полосы (fogEdgeOf неоднозначен — иначе ложный L)
    if (kind === "face") {
      ctx.fillStyle = body;
      for (const side of sides) fillFace(side);
      ctx.fillStyle = edgeCol;
      for (const side of sides) fillFaceLip(side);
      return;
    }

    const edge = this.fogEdgeOf(s, col, row);
    const faceByEdge = { n: "s", s: "n", w: "e", e: "w" };
    const face = (edge && faceByEdge[edge]) || sides[0];
    const ends = sides.filter((side) => side !== face);

    ctx.fillStyle = body;
    fillFace(face);
    for (const end of ends) fillEndTail(face, end);

    ctx.fillStyle = edgeCol;
    fillFaceLip(face);
    for (const end of ends) fillEndTailLip(face, end);
  },
  drawProp(ctx, x, y, w, h, cell) {
    if (cell === 2 || cell === 7) return;
    if (cell === 1 && this.drawTile(ctx, "tile_desk", x, y, w, h)) return;
    if (cell === 3 && this.drawTile(ctx, "tile_plant", x, y, w, h)) return;
    if (cell === 4 && this.drawTile(ctx, "tile_cooler", x, y, w, h)) return;
    if (cell === 8 && this.drawTile(ctx, "tile_cabinet", x, y, w, h)) return;
    if (cell === 9 && this.drawTile(ctx, "tile_printer", x, y, w, h)) return;
    if (cell === 10 && this.drawTile(ctx, "tile_trash", x, y, w, h)) return;
    if (cell === 1) {
      ctx.fillStyle = "#6b5344"; ctx.fillRect(x + 2, y + 4, w - 4, h - 8);
      ctx.fillStyle = "#c9a66b"; ctx.fillRect(x + 4, y + 6, w - 8, 6);
    } else if (cell === 3) {
      ctx.fillStyle = "#b45309"; ctx.fillRect(x + w * 0.35, y + h * 0.55, w * 0.3, h * 0.28);
      ctx.fillStyle = "#3d9b5f"; ctx.beginPath();
      ctx.arc(x + w * 0.5, y + h * 0.42, w * 0.28, 0, Math.PI * 2); ctx.fill();
    } else if (cell === 4) {
      ctx.fillStyle = "#94a3b8"; ctx.fillRect(x + 4, y + 6, w - 8, h - 12);
      ctx.fillStyle = "#67e8f9"; ctx.fillRect(x + 8, y + 10, w - 16, 8);
    } else if (cell === 8) {
      ctx.fillStyle = "#76889e"; ctx.fillRect(x + w * 0.28, y + h * 0.18, w * 0.44, h * 0.68);
      ctx.fillStyle = "#c9b070"; ctx.fillRect(x + w * 0.46, y + h * 0.32, w * 0.08, h * 0.06);
      ctx.fillRect(x + w * 0.46, y + h * 0.48, w * 0.08, h * 0.06);
      ctx.fillRect(x + w * 0.46, y + h * 0.64, w * 0.08, h * 0.06);
    } else if (cell === 9) {
      ctx.fillStyle = "#4b5563"; ctx.fillRect(x + w * 0.22, y + h * 0.32, w * 0.56, h * 0.4);
      ctx.fillStyle = "#e5e7eb"; ctx.fillRect(x + w * 0.26, y + h * 0.58, w * 0.48, h * 0.14);
      ctx.fillStyle = "#4ade80"; ctx.beginPath();
      ctx.arc(x + w * 0.68, y + h * 0.42, w * 0.05, 0, Math.PI * 2); ctx.fill();
    } else if (cell === 10) {
      ctx.fillStyle = "#475569"; ctx.beginPath();
      ctx.ellipse(x + w * 0.5, y + h * 0.72, w * 0.18, h * 0.1, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(x + w * 0.34, y + h * 0.36, w * 0.32, h * 0.38);
      ctx.fillStyle = "#1e293b"; ctx.beginPath();
      ctx.ellipse(x + w * 0.5, y + h * 0.38, w * 0.16, h * 0.08, 0, 0, Math.PI * 2); ctx.fill();
    }
  },
  drawDesk2(ctx, x, y, cellW, cellH) {
    const w = cellW * 2, h = cellH;
    if (this.drawTile(ctx, "tile_desk2", x, y, w, h)) return;
    if (this.drawTile(ctx, "tile_desk", x, y, w, h)) return;
    ctx.fillStyle = "#6b5344"; ctx.fillRect(x + 1, y + 3, w - 2, h - 6);
    ctx.fillStyle = "#c9a66b"; ctx.fillRect(x + 3, y + 5, w - 6, 8);
  },
  /**
   * Градиент тумана на клетках кольца границы — поверх пола.
   * Ребро: линейный от края арены к play.
   * Угол: два линейных градиента по примыкающим границам (чёрный вдоль обеих сторон).
   */
  paintBorderCellFog(ctx, s) {
    const b = Math.max(1, s.border | 0);
    const ring = this.fogFrameRing(s.cols, s.rows, b);
    if (!ring.length) return;

    const fogStops = (g) => {
      g.addColorStop(0, "rgba(2,3,8,0.92)");
      g.addColorStop(0.45, "rgba(2,3,8,0.48)");
      g.addColorStop(0.82, "rgba(2,3,8,0.12)");
      g.addColorStop(1, "rgba(2,3,8,0)");
    };

    const paintEdge = (x, y, cw, ch, edge) => {
      let g;
      if (edge === "n") g = ctx.createLinearGradient(0, y, 0, y + ch);
      else if (edge === "s") g = ctx.createLinearGradient(0, y + ch, 0, y);
      else if (edge === "w") g = ctx.createLinearGradient(x, 0, x + cw, 0);
      else if (edge === "e") g = ctx.createLinearGradient(x + cw, 0, x, 0);
      else return;
      fogStops(g);
      ctx.fillStyle = g;
      ctx.fillRect(x, y, cw, ch);
    };

    for (const { c, r } of ring) {
      const { x, y, w: cw, h: ch } = this.cellRect(s, c, r);
      const corner = this.mapCornerOf(s, c, r);
      if (corner === "nw") { paintEdge(x, y, cw, ch, "n"); paintEdge(x, y, cw, ch, "w"); }
      else if (corner === "ne") { paintEdge(x, y, cw, ch, "n"); paintEdge(x, y, cw, ch, "e"); }
      else if (corner === "sw") { paintEdge(x, y, cw, ch, "s"); paintEdge(x, y, cw, ch, "w"); }
      else if (corner === "se") { paintEdge(x, y, cw, ch, "s"); paintEdge(x, y, cw, ch, "e"); }
      else {
        const edge = this.fogEdgeOf(s, c, r);
        if (edge) paintEdge(x, y, cw, ch, edge);
      }
    }
  },
  /**
   * Туман вне сетки (хром).
   */
  drawFogOfWar(ctx, s, api) {
    const { w, h } = api;
    const fog = this.ensureArt().img.tile_fog;
    const gx = s.padX, gy = s.padT;
    const cw = s.cellW, ch = s.cellH;
    const gw = s.cols * cw, gh = s.rows * ch;

    ctx.fillStyle = "rgba(2, 3, 8, 0.97)";
    ctx.fillRect(0, 0, w, gy);
    ctx.fillRect(0, gy + gh, w, h - (gy + gh));
    ctx.fillRect(0, gy, gx, gh);
    ctx.fillRect(gx + gw, gy, w - (gx + gw), gh);

    if (fog && fog.complete && fog.naturalWidth) {
      ctx.globalAlpha = 0.28;
      ctx.drawImage(fog, 0, 0, w, gy);
      ctx.drawImage(fog, 0, gy + gh, w, h - (gy + gh));
      ctx.globalAlpha = 1;
    }
  },
  draw(s, api) {
    this.ensureArt();
    const { ctx, w, h } = api;
    const ph = this.phase(s.gameMin);
    const coffee = s.coffeeBoost > 0;
    const shield = !!s.shield;
    const pulse = coffee ? 0.5 + 0.5 * Math.sin(performance.now() * 0.008) : 0;
    const spulse = shield ? 0.5 + 0.5 * Math.sin(performance.now() * 0.01) : 0;
    const bg = this.FLOOR_TINT[this.floorIdx(s) % this.FLOOR_TINT.length] || "#241a52";
    const unit = Math.min(s.cellW, s.cellH);

    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = ph.tint; ctx.fillRect(0, 0, w, h);
    if (coffee) {
      ctx.fillStyle = `rgba(180, 110, 30, ${0.10 + pulse * 0.06})`;
      ctx.fillRect(0, 0, w, h);
    }
    if (shield && !coffee) {
      ctx.fillStyle = `rgba(56, 189, 248, ${0.06 + spulse * 0.04})`;
      ctx.fillRect(0, 0, w, h);
    }

    // 1) пол на всей сетке (включая кольцо границы) — иначе клетка 6 затирает правую половину стола 2×1
    for (let r = 0; r < s.rows; r++) {
      for (let c = 0; c < s.cols; c++) {
        const { x, y, w: cw, h: ch } = this.cellRect(s, c, r);
        // клетки со стеной — чёрный фон под полосами
        if (this.isFrameSolid(s.map[r][c])) {
          ctx.fillStyle = "#020308";
          ctx.fillRect(x, y, cw, ch);
          continue;
        }
        const floorKey = (r + c) % 2 ? "tile_floor_a" : "tile_floor_b";
        if (!this.drawTile(ctx, floorKey, x, y, cw, ch)) {
          ctx.fillStyle = coffee
            ? ((r + c) % 2 ? "#d9cfc0" : "#cfc4b4")
            : ((r + c) % 2 ? "#e9e5df" : "#ded9d2");
          ctx.fillRect(x, y, cw, ch);
        }
      }
    }
    // 1b) градиент тумана на кольце границы — поверх пола (и чёрного фона стен)
    this.paintBorderCellFog(ctx, s);
    // 2) пропы + декоративные стены/окна на полосе тумана (каркас; концы = углы)
    for (let r = 0; r < s.rows; r++) {
      for (let c = 0; c < s.cols; c++) {
        const { x, y, w: cw, h: ch } = this.cellRect(s, c, r);
        const cell = s.map[r][c];
        if (cell === 6) continue;
        if (cell === 2 || cell === 7) this.drawWallAt(ctx, s, c, r, x, y, cw, ch);
        else if (cell === 5) this.drawDesk2(ctx, x, y, s.cellW, s.cellH);
        else if (cell !== 0) this.drawProp(ctx, x, y, cw, ch, cell);
      }
    }

    for (const p of s.pickups) {
      const pos = this.cell(s, p.col, p.row);
      const bob = Math.sin(performance.now() * 0.008 + p.col) * 2;
      if (p.type === "shield") {
        if (!this.drawArt(ctx, "pu_badge", pos.x, pos.y + bob, unit * 0.55)) {
          ctx.fillStyle = "#38bdf8";
          ctx.beginPath(); ctx.arc(pos.x, pos.y + bob, 10, 0, Math.PI * 2); ctx.fill();
        }
      } else if (!this.drawArt(ctx, "pu_coin", pos.x, pos.y + bob * 0.5, unit * 0.45)) {
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 9, 0, Math.PI * 2);
        ctx.fillStyle = "#fcd34d"; ctx.fill();
      }
    }

    // зоны отчёта
    for (const z of s.zones) {
      const x = s.padX + z.col * s.cellW, y = s.padT + z.row * s.cellH;
      const a = Math.min(0.55, 0.25 + z.life * 0.2);
      if (!this.drawArt(ctx, "vfx_report", x + s.cellW / 2, y + s.cellH / 2, unit * 0.9, 0.55 + a * 0.4)) {
        ctx.fillStyle = `rgba(20, 184, 166, ${a})`;
        ctx.fillRect(x + 3, y + 3, s.cellW - 6, s.cellH - 6);
        ctx.fillStyle = "#ccfbf1"; ctx.font = "bold 8px Segoe UI"; ctx.textAlign = "center";
        ctx.fillText("ОТЧ", x + s.cellW / 2, y + s.cellH / 2 + 3);
      }
    }

    for (const c of s.colleagues) {
      if (c.px < -1.35 || c.py < -1.35 || c.px > s.cols + 0.35 || c.py > s.rows + 0.35) continue;
      const offering = c.offerT > 0 || c.waveT > 0;
      const bob = offering ? Math.sin(performance.now() * 0.014) * 3 : 0;
      const pos = {
        x: s.padX + (c.px + 0.5) * s.cellW,
        y: s.padT + (c.py + 0.5) * s.cellH + bob,
      };
      if (pos.y < 70 || pos.y > h - 100 || pos.x < 0 || pos.x > w) continue;

      // ally-маркер: мятное кольцо (не danger-цвета боссов)
      const pulse = 0.55 + 0.45 * Math.sin(performance.now() * 0.01);
      const ringR = (offering ? 20 : 16) + pulse * 3;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y + unit * 0.22, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = offering
        ? `rgba(52, 211, 153, ${0.55 + pulse * 0.35})`
        : `rgba(45, 212, 191, ${0.35 + pulse * 0.25})`;
      ctx.lineWidth = offering ? 3.2 : 2.4;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y + unit * 0.22, ringR * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167, 243, 208, ${0.12 + pulse * 0.08})`;
      ctx.fill();

      const ck = "colleague_" + this.dirKey(c.dir);
      const allyAlpha = coffee ? 0.92 : 1; // не гасим как угрозы
      const drawn = this.drawArt(ctx, ck, pos.x, pos.y, unit * 0.95, allyAlpha);
      if (!drawn) {
        ctx.globalAlpha = allyAlpha;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 13, 0, Math.PI * 2);
        ctx.fillStyle = "#2dd4bf"; ctx.fill();
        ctx.globalAlpha = 1;
      }

      // дар сверху по центру (без текстовых подписей)
      const giftKey = c.bonus === "coffee" ? "pu_coffee" : c.bonus === "shield" ? "pu_badge" : null;
      if (giftKey) {
        const gy = pos.y - unit * 0.58;
        if (!this.drawArt(ctx, giftKey, pos.x, gy, unit * 0.48)) {
          ctx.beginPath();
          ctx.arc(pos.x, gy, 7, 0, Math.PI * 2);
          ctx.fillStyle = c.bonus === "coffee" ? "#fbbf24" : "#38bdf8";
          ctx.fill();
        }
      }
    }

    for (const t of s.threats) {
      let cx = t.col, cy = t.row;
      const waiting = (t.pattern === "peek" || t.pattern === "hold") && t.peekPhase === "wait";
      const sliding = !waiting && (
        t.pattern === "ghost" || t.pattern === "dash" || t.pattern === "peek" || t.pattern === "hold"
        || t.pattern === "weave" || t.pattern === "patrol" || t.pattern === "chaos" || t.pattern === "hunt"
        || t.pattern === "pincer" || t.pattern === "report" || t.pattern === "blink"
        || t.pattern === "wide" || !t.entered
      );
      if (sliding) {
        cx = t.col + t.dc * t.frac;
        cy = t.row + t.dr * t.frac;
      }
      if (cx < -1.35 || cy < -1.35 || cx > s.cols + 0.35 || cy > s.rows + 0.35) continue;
      const pos = { x: s.padX + (cx + 0.5) * s.cellW, y: s.padT + (cy + 0.5) * s.cellH };
      if (pos.y < 68 || pos.y > h - 95 || pos.x < -8 || pos.x > w + 8) continue;

      if (t.pattern === "wide" && t.entered) {
        const wx = s.padX + (cx + t.wideDc + 0.5) * s.cellW;
        const wy = s.padT + (cy + t.wideDr + 0.5) * s.cellH;
        this.drawArt(ctx, `boss_${t.kind.id}_${this.dirKey(t.dir)}`, wx, wy, unit * 0.85, 0.35);
      }

      let alpha = coffee ? 0.7 : 1;
      if (t.pattern === "ghost") alpha = t.throughSlow ? (coffee ? 0.4 : 0.55) : (coffee ? 0.55 : 0.82);
      if (t.flash > 0) this.drawArt(ctx, "vfx_dash", pos.x, pos.y, unit * 1.1, 0.7);
      if (waiting) {
        const wp = 0.5 + 0.5 * Math.sin(performance.now() * 0.012);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 22 + wp * 4, 0, Math.PI * 2);
        ctx.strokeStyle = t.pattern === "hold"
          ? `rgba(56, 189, 248, ${0.45 + wp * 0.4})`
          : `rgba(167, 139, 250, ${0.45 + wp * 0.4})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      const nearHero = t.kind.id === "hr"
        && Math.abs(cx - s.px) + Math.abs(cy - s.py) <= 1.15;
      const bk = this.bossSpriteKey(t, sliding, waiting, nearHero);
      const fallback = `boss_${t.kind.id}_${this.dirKey(t.dir)}`;
      if (!this.drawArt(ctx, bk, pos.x, pos.y, unit * 1.05, alpha)
        && !this.drawArt(ctx, fallback, pos.x, pos.y, unit * 1.05, alpha)
        && !this.drawArt(ctx, `boss_${t.kind.id}_s`, pos.x, pos.y, unit * 1.05, alpha)) {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = t.kind.color;
        ctx.fillRect(pos.x - 14, pos.y - 16, 28, 32);
        ctx.fillStyle = "#fff"; ctx.font = "bold 7px Segoe UI"; ctx.textAlign = "center";
        ctx.fillText(t.kind.label, pos.x, pos.y + 2);
        ctx.globalAlpha = 1;
      }
      ctx.globalAlpha = 1;
    }

    const pp = { x: s.padX + (s.px + 0.5) * s.cellW, y: s.padT + (s.py + 0.5) * s.cellH };
    if (coffee) {
      this.drawArt(ctx, "vfx_steam", pp.x, pp.y - 8, unit * 0.9, 0.55 + pulse * 0.3);
      ctx.beginPath(); ctx.arc(pp.x, pp.y, 24 + pulse * 4, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(251, 191, 36, ${0.35 + pulse * 0.25})`;
      ctx.lineWidth = 3; ctx.stroke();
    }
    if (shield) {
      this.drawArt(ctx, "vfx_shield", pp.x, pp.y, unit * 1.15, 0.55 + spulse * 0.35);
    }
    if (s.invuln > 0) this.drawArt(ctx, "vfx_invuln", pp.x, pp.y, unit * 1.05, 0.45);
    if (s.nearMiss > 0) this.drawArt(ctx, "vfx_near_miss", pp.x, pp.y - unit * 0.45, unit * 0.55, 0.8);
    const heroKey = this.heroSpriteKey(s);
    const heroFallback = "hero_" + this.dirKey(s.facing || "down");
    const heroAlpha = (!s.alive) ? 1 : (s.invuln > 0 ? 0.55 + 0.45 * Math.sin(performance.now() * 0.02) : 1);
    const idle0 = "hero_idle_" + this.dirKey(s.facing || "down") + "_0";
    if (!this.drawArt(ctx, heroKey, pp.x, pp.y, unit * 1.1, heroAlpha)
      && !this.drawArt(ctx, idle0, pp.x, pp.y, unit * 1.1, heroAlpha)
      && !this.drawArt(ctx, "hero_idle_" + this.dirKey(s.facing || "down"), pp.x, pp.y, unit * 1.1, heroAlpha)
      && !this.drawArt(ctx, heroFallback, pp.x, pp.y, unit * 1.1, heroAlpha)) {
      ctx.beginPath(); ctx.arc(pp.x, pp.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = coffee ? "#fde68a" : shield ? "#7dd3fc" : this.ensureDev().immortal ? "#fbbf24" : s.invuln > 0 ? "#a7f3d0" : "#22d3a8";
      ctx.fill();
      ctx.beginPath(); ctx.arc(pp.x, pp.y, 18, 0, Math.PI * 2);
      ctx.strokeStyle = coffee ? "#fbbf24" : shield ? "#38bdf8" : this.ensureDev().immortal ? "#eab308" : "#67e8f9"; ctx.lineWidth = 3; ctx.stroke();
    }
    if (s.won) this.drawArt(ctx, "vfx_confetti", pp.x, pp.y - 20, unit * 1.4, 0.9);
    if (!s.alive) this.drawArt(ctx, "vfx_slam", pp.x, pp.y, unit * 1.2, 0.55);

    // туман поклеточно на крае; стены без тумана (уже нарисованы ниже)
    this.drawFogOfWar(ctx, s, api);

    ctx.fillStyle = "rgba(30,27,75,0.92)"; ctx.fillRect(10, 10, w - 20, 72);
    ctx.strokeStyle = coffee ? "#fbbf24" : shield ? "#38bdf8" : "#22d3a8"; ctx.strokeRect(10, 10, w - 20, 72);
    ctx.fillStyle = "#fffef9"; ctx.font = "bold 22px Segoe UI"; ctx.textAlign = "left";
    ctx.fillText(this.clock(s.gameMin), 22, 40);
    ctx.fillStyle = coffee ? "#fbbf24" : shield ? "#7dd3fc" : "#c4b5fd"; ctx.font = "13px Segoe UI";
    let status = `${ph.label} · этаж ${s.floor}`;
    if (coffee) status = `${ph.label} · КОФЕ · мир тормозит`;
    else if (shield) status = `${ph.label} · ЩИТ · 1 удар`;
    else if (this.ensureDev().immortal) {
      const d = this.ensureDev();
      status = `${ph.label} · GOD · 💀${d.deaths}` + (d.lastFloor ? ` · посл.э${d.lastFloor}` : "");
    }
    ctx.fillText(status, 22, 62);
    const prog = Math.min(1, s.gameMin / s.totalMin);
    ctx.fillStyle = "#312e81"; ctx.fillRect(140, 28, w - 170, 10);
    ctx.fillStyle = coffee ? "#fbbf24" : shield ? "#38bdf8" : "#22d3a8";
    ctx.fillRect(140, 28, (w - 170) * prog, 10);
    if (coffee) {
      const left = Math.min(1, s.coffeeBoost / 3);
      ctx.fillStyle = "rgba(251,191,36,0.25)"; ctx.fillRect(140, 44, w - 170, 6);
      ctx.fillStyle = "#f59e0b"; ctx.fillRect(140, 44, (w - 170) * left, 6);
    } else if (shield) {
      ctx.fillStyle = "rgba(56,189,248,0.3)"; ctx.fillRect(140, 44, w - 170, 6);
      ctx.fillStyle = "#0ea5e9"; ctx.fillRect(140, 44, w - 170, 6);
    }

    if (coffee) {
      const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.25, w / 2, h / 2, h * 0.72);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(40, 20, 5, ${0.28 + pulse * 0.1})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    } else if (shield) {
      const g = ctx.createRadialGradient(w / 2, h / 2, h * 0.28, w / 2, h / 2, h * 0.75);
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(8, 40, 60, ${0.22 + spulse * 0.08})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    if (!s.alive) api.drawBanner(ctx, "ЗАСТАВИЛИ РАБОТАТЬ!", "#fb7185");
    if (s.won) api.drawBanner(ctx, "ПОВЫШЕНИЕ!", "#fbbf24");
    if (s.tutorial > 0 && s.alive) {
      ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(18, h / 2 - 48, w - 36, 96);
      ctx.fillStyle = "#fff"; ctx.font = "14px Segoe UI"; ctx.textAlign = "center";
      ctx.fillText("Тап по клетке — один шаг", w / 2, h / 2 - 14);
      ctx.fillText("Коллега — друг: подойди за кофе · бейдж сам падает на пол", w / 2, h / 2 + 8);
      ctx.fillText("Доживи до 18:00 → повышение", w / 2, h / 2 + 30);
    }
  },
};

/* ========== 03 Tide of Relics — deeper combat ========== */
window.FEEL_DEMOS["tide-of-relics"] = {
  hint: "Распределяй энергию: Щит / Пушки / Паруса / Лечи. Победи 3 корабля акта.",
  create(api) {
    const y = api.h - 108;
    const mk = (label, x, color) => api.input.addButton({ x, y, w: 76, h: 76, label, color });
    return {
      bShield: mk("Щит", 16, "#5db0ff"),
      bGuns: mk("Огонь", 100, "#f07178"),
      bSail: mk("Парус", 184, "#3dd68c"),
      bHeal: mk("Рем", 268, "#f0b429"),
      hull: 100, shield: 35, energy: 5, maxE: 8,
      enemyHull: 70, enemyDps: 9, wave: 1, maxWave: 3,
      t: 0, evade: 0, log: "Враг на горизонте",
      over: false, victory: false, gold: 0,
    };
  },
  update(s, api, dt) {
    if (s.over) {
      if (s.bSail.clicked || api.input.consumeTap()) Object.assign(s, this.create(api));
      return;
    }
    s.t += dt;
    s.evade = Math.max(0, s.evade - dt);
    s.energy = Math.min(s.maxE, s.energy + dt * 0.85);
    if (s.bShield.clicked && s.energy >= 1) { s.shield = Math.min(70, s.shield + 22); s.energy -= 1; s.log = "Щиты!"; }
    if (s.bGuns.clicked && s.energy >= 2) {
      const dmg = 16 + Math.random() * 8;
      s.enemyHull -= dmg; s.energy -= 2; s.log = `Залп −${dmg.toFixed(0)}`;
    }
    if (s.bSail.clicked && s.energy >= 1) { s.evade = 1.4; s.energy -= 1; s.log = "Манёвр"; }
    if (s.bHeal.clicked && s.energy >= 2) { s.hull = Math.min(100, s.hull + 18); s.energy -= 2; s.log = "Ремонт"; }

    if (Math.floor(s.t * 1.6) !== Math.floor((s.t - dt) * 1.6)) {
      let dmg = s.enemyDps * (0.8 + Math.random() * 0.5);
      if (s.evade > 0) dmg *= 0.3;
      if (s.shield > 0) { s.shield -= dmg; if (s.shield < 0) { s.hull += s.shield; s.shield = 0; } }
      else s.hull -= dmg;
    }
    if (s.enemyHull <= 0) {
      s.gold += 20; s.wave += 1;
      if (s.wave > s.maxWave) { s.over = true; s.victory = true; api.setHud(`Акт пройден! Золото ${s.gold}`); }
      else {
        s.enemyHull = 55 + s.wave * 25;
        s.enemyDps = 8 + s.wave * 2;
        s.energy = Math.min(s.maxE, s.energy + 3);
        s.log = `Враг ${s.wave}/${s.maxWave}`;
      }
    }
    if (s.hull <= 0) { s.over = true; s.victory = false; api.setHud("Корабль потоплен"); }
    else if (!s.over) api.setHud(`${s.log} · E${s.energy.toFixed(1)} · HP${s.hull.toFixed(0)} SH${s.shield.toFixed(0)} · Враг${s.enemyHull.toFixed(0)} · ${s.wave}/${s.maxWave}`);
  },
  draw(s, api) {
    const { ctx, w, h } = api;
    ctx.fillStyle = "#0b1c2c"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#12324a"; ctx.fillRect(0, h * 0.5, w, h * 0.5);
    // player ship
    ctx.fillStyle = "#c4a574"; ctx.fillRect(50, 280, 110, 46);
    ctx.fillStyle = "#8b5a2b"; ctx.fillRect(90, 230, 12, 55);
    ctx.fillStyle = "#e8e0d0"; ctx.beginPath(); ctx.moveTo(96, 230); ctx.lineTo(140, 255); ctx.lineTo(96, 260); ctx.fill();
    // enemy
    ctx.fillStyle = "#7f1d1d"; ctx.fillRect(210, 200, 130, 55);
    ctx.fillStyle = "#450a0a"; ctx.fillRect(260, 150, 12, 55);
    // bars
    ctx.fillStyle = "#3dd68c"; ctx.fillRect(20, 30, s.hull * 1.5, 12);
    ctx.fillStyle = "#5db0ff"; ctx.fillRect(20, 48, s.shield * 2, 10);
    ctx.fillStyle = "#fbbf24"; ctx.fillRect(20, 64, s.energy * 18, 10);
    ctx.fillStyle = "#f07178"; ctx.fillRect(20, 90, Math.max(0, s.enemyHull) * 1.6, 12);
    ctx.fillStyle = "#fff"; ctx.font = "12px Segoe UI"; ctx.fillText(`Волна ${s.wave}/${s.maxWave} · 🪙${s.gold}`, 20, 120);
    if (s.over) api.drawBanner(ctx, s.victory ? "ПОБЕДА АКТА" : "ПОТОПЛЕН", s.victory ? "#fbbf24" : "#f07178");
  },
};
