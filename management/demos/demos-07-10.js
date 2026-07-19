window.FEEL_DEMOS = window.FEEL_DEMOS || {};

/* ========== 07 Idle Forge ========== */
window.FEEL_DEMOS["idle-forge"] = {
  hint: "Ковка даёт руду. Апгрейды и рабочие копят оффлайн. Престиж сбрасывает за бонус.",
  create(api) {
    const y = api.h - 250;
    return {
      hit: api.input.addButton({ x: 30, y: y, w: 140, h: 70, label: "Ковка", color: "#ff7043" }),
      upPower: api.input.addButton({ x: 190, y: y, w: 140, h: 70, label: "Сила+", color: "#5db0ff" }),
      upAuto: api.input.addButton({ x: 30, y: y + 85, w: 140, h: 70, label: "Рабочий+", color: "#66bb6a" }),
      prestige: api.input.addButton({ x: 190, y: y + 85, w: 140, h: 70, label: "Престиж", color: "#ab47bc" }),
      ore: 0, power: 1, auto: 0, workers: 0,
      costP: 20, costA: 35, prestiges: 0, mult: 1,
      sparks: [], t: 0,
    };
  },
  update(s, api, dt) {
    s.t += dt;
    s.ore += s.auto * s.mult * dt;
    if (s.hit.clicked) {
      s.ore += s.power * s.mult;
      s.sparks.push({ x: api.w / 2 + api.rand(-30, 30), y: 220, life: 0.4 });
    }
    if (s.upPower.clicked && s.ore >= s.costP) {
      s.ore -= s.costP; s.power += 1; s.costP = Math.floor(s.costP * 1.35);
    }
    if (s.upAuto.clicked && s.ore >= s.costA) {
      s.ore -= s.costA; s.auto += 0.8 + s.workers * 0.2; s.workers += 1; s.costA = Math.floor(s.costA * 1.4);
    }
    if (s.prestige.clicked && s.ore >= 500 * (s.prestiges + 1)) {
      s.prestiges += 1; s.mult = 1 + s.prestiges * 0.5;
      s.ore = 0; s.power = 1; s.auto = 0; s.workers = 0; s.costP = 20; s.costA = 35;
    }
    for (const sp of s.sparks) sp.life -= dt;
    s.sparks = s.sparks.filter((sp) => sp.life > 0);
    api.setHud(`⛏${s.ore.toFixed(0)} · сила ${s.power} · авто ${s.auto.toFixed(1)}/с · ×${s.mult.toFixed(1)} · престиж ${s.prestiges}`);
  },
  draw(s, api) {
    const { ctx, w, h } = api;
    ctx.fillStyle = "#1a1410"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#3e2723"; ctx.fillRect(40, 140, w - 80, 120);
    ctx.fillStyle = "#ff7043";
    ctx.beginPath(); ctx.arc(w / 2, 180, 28 + Math.min(40, s.power * 2), 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#8d6e63"; ctx.fillRect(w / 2 - 40, 210, 80, 30);
    for (const sp of s.sparks) {
      ctx.globalAlpha = sp.life * 2; ctx.fillStyle = "#ffe082";
      ctx.fillRect(sp.x, sp.y - (0.4 - sp.life) * 40, 6, 6); ctx.globalAlpha = 1;
    }
    // workers dots
    for (let i = 0; i < s.workers; i++) {
      ctx.fillStyle = "#a5d6a7";
      ctx.beginPath(); ctx.arc(60 + i * 18, 300, 7, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "#bcaaa4"; ctx.font = "13px Segoe UI"; ctx.textAlign = "center";
    ctx.fillText(`Престиж от ${(500 * (s.prestiges + 1)).toFixed(0)} руды`, w / 2, 360);
  },
};

/* ========== 08 Cozy Plot ========== */
window.FEEL_DEMOS["cozy-plot"] = {
  hint: "Тап по грядке: посев → жди → сбор. Выполняй заказ наверху. Монеты открывают слоты.",
  create(api) {
    const plots = [];
    for (let i = 0; i < 12; i++) plots.push({ stage: 0, t: 0, unlocked: i < 6 });
    return {
      plots, cols: 4,
      coins: 5, order: { crop: 3, need: 3, have: 0 },
      ox: 30, oy: 150, cs: 75,
      msg: "Посей и собери для заказа",
      day: 0,
    };
  },
  update(s, api, dt) {
    s.day += dt;
    for (const p of s.plots) {
      if (p.stage > 0 && p.stage < 3) {
        p.t += dt;
        if (p.t >= 2.2) { p.stage += 1; p.t = 0; }
      }
    }
    const tap = api.input.consumeTap();
    if (tap) {
      const c = Math.floor((tap.x - s.ox) / s.cs);
      const r = Math.floor((tap.y - s.oy) / s.cs);
      if (c >= 0 && r >= 0 && c < s.cols && r < 3) {
        const i = r * s.cols + c;
        const p = s.plots[i];
        if (!p.unlocked) {
          if (s.coins >= 8) { s.coins -= 8; p.unlocked = true; s.msg = "Грядка открыта"; }
          else s.msg = "Нужно 8 монет";
        } else if (p.stage === 0) { p.stage = 1; p.t = 0; s.msg = "Посеяно"; }
        else if (p.stage >= 3) {
          p.stage = 0; p.t = 0; s.coins += 2;
          if (s.order.crop === 3) {
            s.order.have += 1;
            if (s.order.have >= s.order.need) {
              s.coins += 15; s.order.have = 0; s.order.need = 3 + ((Math.random() * 3) | 0);
              s.msg = "Заказ сдан! +15";
            } else s.msg = `Заказ ${s.order.have}/${s.order.need}`;
          }
        } else s.msg = "Ещё растёт…";
      }
    }
    api.setHud(`${s.msg} · 🪙${s.coins} · заказ ${s.order.have}/${s.order.need}`);
  },
  draw(s, api) {
    const { ctx, w, h } = api;
    const colors = ["#6d4c41", "#a5d6a7", "#66bb6a", "#2e7d32"];
    ctx.fillStyle = "#5d4037"; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#81c784"; ctx.fillRect(0, 0, w, 110);
    ctx.fillStyle = "#1b5e20"; ctx.font = "15px Segoe UI"; ctx.textAlign = "left";
    ctx.fillText(`Заказ: ${s.order.need} урожая`, 20, 40);
    ctx.fillText("Тап: посев / сбор · закрытая грядка = 8🪙", 20, 68);
    s.plots.forEach((p, i) => {
      const x = s.ox + (i % s.cols) * s.cs;
      const y = s.oy + Math.floor(i / s.cols) * s.cs;
      if (!p.unlocked) {
        ctx.fillStyle = "#3e2723"; ctx.fillRect(x, y, 68, 68);
        ctx.fillStyle = "#bcaaa4"; ctx.font = "12px Segoe UI"; ctx.textAlign = "center";
        ctx.fillText("🔒8", x + 34, y + 38);
        return;
      }
      ctx.fillStyle = colors[p.stage]; ctx.fillRect(x, y, 68, 68);
      if (p.stage > 0 && p.stage < 3) {
        ctx.fillStyle = "#fff8"; ctx.fillRect(x + 8, y + 58, 52 * (p.t / 2.2), 4);
      }
    });
  },
};

/* ========== 09 Auto Towers ========== */
window.FEEL_DEMOS["auto-towers"] = {
  hint: "Тап по слоту — купить башню (15🪙). Волна шлёт врагов. Не дай дойти до базы.",
  create(api) {
    const wave = api.input.addButton({ x: api.w - 108, y: api.h - 118, w: 90, h: 90, label: "Волна", color: "#f07178" });
    const slots = [];
    for (let i = 0; i < 5; i++) slots.push({ x: 40 + i * 58, y: 340, tower: null });
    return {
      waveBtn: wave, slots,
      gold: 45, hp: 8, n: 0, enemies: [], bullets: [],
      waveOn: false, spawnLeft: 0, spawnT: 0, over: false,
      pathY: 230,
    };
  },
  update(s, api, dt) {
    if (s.over) {
      if (s.waveBtn.clicked || api.input.consumeTap()) Object.assign(s, this.create(api));
      return;
    }
    const tap = api.input.consumeTap();
    if (tap) {
      for (const sl of s.slots) {
        if (tap.x >= sl.x && tap.x <= sl.x + 50 && tap.y >= sl.y && tap.y <= sl.y + 50) {
          if (!sl.tower && s.gold >= 15) { s.gold -= 15; sl.tower = { dps: 10, lvl: 0 }; }
          else if (sl.tower && s.gold >= 25) { s.gold -= 25; sl.tower.dps += 6; }
        }
      }
    }
    if (s.waveBtn.clicked && !s.waveOn) {
      s.n += 1; s.waveOn = true; s.spawnLeft = 5 + s.n * 2; s.spawnT = 0;
    }
    if (s.waveOn) {
      s.spawnT -= dt;
      if (s.spawnLeft > 0 && s.spawnT <= 0) {
        s.enemies.push({ x: -20, y: s.pathY + api.rand(-16, 16), hp: 18 + s.n * 6, max: 18 + s.n * 6, speed: 55 + s.n * 4 });
        s.spawnLeft -= 1; s.spawnT = 0.55;
      }
      for (const e of s.enemies) e.x += e.speed * dt;
      for (const sl of s.slots) {
        if (!sl.tower) continue;
        sl.tower.cd -= dt;
        if (sl.tower.cd <= 0) {
          const target = s.enemies.find((e) => e.hp > 0 && e.x > 0 && e.x < api.w - 40);
          if (target) {
            s.bullets.push({ x: sl.x + 25, y: sl.y, tx: target.x, ty: target.y, dmg: sl.tower.dps * 0.35, life: 0.35 });
            sl.tower.cd = 0.35;
          }
        }
      }
      for (const b of s.bullets) {
        b.life -= dt;
        b.x += (b.tx - b.x) * 8 * dt;
        b.y += (b.ty - b.y) * 8 * dt;
        for (const e of s.enemies) {
          if (e.hp > 0 && api.dist(b, e) < 16) { e.hp -= b.dmg; b.life = 0; }
        }
      }
      s.bullets = s.bullets.filter((b) => b.life > 0);
      s.enemies = s.enemies.filter((e) => {
        if (e.hp <= 0) { s.gold += 5; return false; }
        if (e.x > api.w - 45) { s.hp -= 1; return false; }
        return true;
      });
      if (s.spawnLeft <= 0 && !s.enemies.length) {
        s.waveOn = false; s.gold += 12;
      }
      if (s.hp <= 0) { s.over = true; api.setHud("База пала"); }
    }
    if (!s.over) api.setHud(`HP ${s.hp} · 🪙${s.gold} · волна ${s.n}${s.waveOn ? " ▶" : ""} · тап слот=купить/ап`);
  },
  draw(s, api) {
    const { ctx, w, h } = api;
    ctx.fillStyle = "#1b2a1f"; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#c4a574"; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.moveTo(0, s.pathY); ctx.lineTo(w - 40, s.pathY); ctx.stroke();
    ctx.fillStyle = "#ffe66d"; ctx.fillRect(w - 42, s.pathY - 28, 28, 56);
    for (const sl of s.slots) {
      ctx.strokeStyle = "#ffffff55"; ctx.strokeRect(sl.x, sl.y, 50, 50);
      if (sl.tower) {
        ctx.fillStyle = "#5db0ff"; ctx.fillRect(sl.x + 8, sl.y + 8, 34, 34);
        ctx.fillStyle = "#fff"; ctx.font = "10px Segoe UI"; ctx.textAlign = "center";
        ctx.fillText(String(sl.tower.dps | 0), sl.x + 25, sl.y + 28);
      }
    }
    for (const e of s.enemies) {
      ctx.fillStyle = "#f07178"; ctx.beginPath(); ctx.arc(e.x, e.y, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#3dd68c"; ctx.fillRect(e.x - 12, e.y - 20, 24 * (e.hp / e.max), 4);
    }
    for (const b of s.bullets) {
      ctx.fillStyle = "#81d4fa"; ctx.fillRect(b.x - 3, b.y - 3, 6, 6);
    }
    if (s.over) api.drawBanner(ctx, "ПОРАЖЕНИЕ", "#f07178");
  },
};

/* ========== 10 Night Courier ========== */
window.FEEL_DEMOS["night-courier"] = {
  hint: "←→ полоса. Жёлтое = взять → бирюзовые ВОРОТА = сдать. 6 доставок = смена. Красное = краш.",
  WIN_DELIVERIES: 6,
  BASE_SPEED: 220,
  MAX_SPEED_MULT: 1.25,
  create(api) {
    const laneX = [api.w * 0.22, api.w * 0.5, api.w * 0.78];
    const s = {
      lane: 1,
      px: laneX[1],
      alive: true,
      won: false,
      score: 0,
      combo: 0,
      best: 0,
      deliveries: 0,
      carry: null,
      speed: 220,
      t: 0,
      spawn: 0.35,
      objs: [],
      inv: 0,
      toast: 0,
      toastText: "",
      teach: 8,
      _showContinue: false,
      _laneX: laneX,
      _latch: false,
    };
    s.continueBtn = api.input.addButton({
      x: api.w / 2 - 70, y: -200, w: 140, h: 52, label: "Продолжить", color: "#00F5D4",
    });
    s.restartBtn = api.input.addButton({
      x: api.w / 2 - 70, y: -200, w: 140, h: 52, label: "Ещё раз", color: "#5db0ff",
    });
    return s;
  },
  softReset(s, api) {
    const keepBest = s.best | 0;
    const cont = s.continueBtn;
    const rest = s.restartBtn;
    const laneX = s._laneX;
    Object.assign(s, {
      lane: 1,
      px: laneX[1],
      alive: true,
      won: false,
      score: 0,
      combo: 0,
      best: keepBest,
      deliveries: 0,
      carry: null,
      speed: this.BASE_SPEED,
      t: 0,
      spawn: 0.35,
      objs: [],
      inv: 0,
      toast: 0,
      toastText: "",
      teach: 8,
      _showContinue: false,
      _latch: false,
    });
    cont.y = -200;
    rest.y = -200;
    api.setHud(this.hint);
  },
  _safeGap() {
    // one free lane always; 1–2 cars
    const free = (Math.random() * 3) | 0;
    const cars = [];
    for (let L = 0; L < 3; L++) {
      if (L === free) continue;
      if (cars.length === 0 || Math.random() < 0.55) cars.push(L);
    }
    if (cars.length === 0) cars.push((free + 1) % 3);
    return cars;
  },
  update(s, api, dt) {
    const py = api.h - 130;

    if (s.won) {
      s.restartBtn.y = api.h / 2 + 40;
      s.continueBtn.y = -200;
      if (s.restartBtn.clicked || api.input.consumeTap() || api.input.keys.KeyR) {
        this.softReset(s, api);
      }
      return;
    }

    if (!s.alive) {
      s.continueBtn.y = s._showContinue ? api.h / 2 + 28 : -200;
      s.restartBtn.y = s._showContinue ? api.h / 2 + 90 : api.h / 2 + 40;
      const tap = api.input.consumeTap();
      const wantContinue = s._showContinue && (s.continueBtn.clicked || tap || api.input.keys.KeyR);
      const wantRestart = s.restartBtn.clicked || (!s._showContinue && (tap || api.input.keys.KeyR));
      if (wantContinue) {
        s.alive = true;
        s.inv = 1.5;
        s._showContinue = false;
        s.objs = [];
        s.combo = 0;
        s.carry = null;
        s.spawn = 0.8;
        s.continueBtn.y = -200;
        s.restartBtn.y = -200;
        s.toast = 1.2;
        s.toastText = "i-frames 1.5с · дорога чиста";
      } else if (wantRestart) {
        this.softReset(s, api);
      }
      return;
    }

    s.continueBtn.y = -200;
    s.restartBtn.y = -200;
    s.t += dt;
    s.inv = Math.max(0, s.inv - dt);
    s.toast = Math.max(0, s.toast - dt);
    s.teach = Math.max(0, s.teach - dt);

    // within-run ramp ≤ +25%
    const ramp = Math.min(1, s.t / 50);
    s.speed = this.BASE_SPEED * (1 + (this.MAX_SPEED_MULT - 1) * ramp);

    const sw = api.input.consumeSwipe();
    if (sw === "left") s.lane = Math.max(0, s.lane - 1);
    if (sw === "right") s.lane = Math.min(2, s.lane + 1);
    const a = api.input.axis();
    if (!s._latch) {
      if (a.x > 0.55) { s.lane = Math.min(2, s.lane + 1); s._latch = true; }
      else if (a.x < -0.55) { s.lane = Math.max(0, s.lane - 1); s._latch = true; }
    } else if (Math.abs(a.x) < 0.25) s._latch = false;

    // smooth lane slide (~110ms feel)
    const targetX = s._laneX[s.lane];
    s.px += (targetX - s.px) * Math.min(1, dt * 14);

    s.spawn -= dt;
    if (s.spawn <= 0) {
      const y0 = -36;
      // cars first (fair gap)
      for (const lane of this._safeGap()) {
        s.objs.push({ lane, y: y0, type: "car" });
      }
      // parcel when empty hands; gate when carrying — readable core loop
      if (!s.carry && Math.random() < 0.55) {
        const freeLanes = [0, 1, 2].filter((L) => !s.objs.some((o) => o.y === y0 && o.lane === L && o.type === "car"));
        const pl = freeLanes.length ? freeLanes[(Math.random() * freeLanes.length) | 0] : ((Math.random() * 3) | 0);
        s.objs.push({ lane: pl, y: y0 - 90, type: "parcel" });
      } else if (s.carry && Math.random() < 0.7) {
        const gl = (Math.random() * 3) | 0;
        s.objs.push({ lane: gl, y: y0 - 120, type: "gate" });
      }
      s.spawn = Math.max(0.42, 0.78 - ramp * 0.2);
    }

    for (const o of s.objs) {
      o.y += s.speed * dt;
      if (o.lane !== s.lane || Math.abs(o.y - py) >= 28) continue;

      if (o.type === "car" && s.inv <= 0) {
        o.y = 9999;
        s.alive = false;
        s._showContinue = s.deliveries > 0 || s.score > 0;
        s.best = Math.max(s.best, s.score);
        s.combo = 0;
        api.setHud(`КРАШ · доставок ${s.deliveries}/${this.WIN_DELIVERIES} · счёт ${s.score}`);
      } else if (o.type === "parcel" && !s.carry) {
        o.y = 9999;
        s.carry = "std";
        s.toast = 1.1;
        s.toastText = "Посылка! Ищи БИРЮЗОВЫЕ ворота";
      } else if (o.type === "gate" && s.carry) {
        o.y = 9999;
        s.carry = null;
        s.combo += 1;
        s.deliveries += 1;
        const pts = Math.floor(100 * (1 + (s.combo - 1) * 0.1));
        s.score += pts;
        s.toast = 1.0;
        s.toastText = `СДАНО · комбо ×${s.combo} · +${pts}`;
        if (s.deliveries >= this.WIN_DELIVERIES) {
          s.won = true;
          s.alive = false;
          s.best = Math.max(s.best, s.score);
          api.setHud(`СМЕНА! ${s.deliveries} доставок · счёт ${s.score} · рекорд ${s.best}`);
        }
      }
    }
    s.objs = s.objs.filter((o) => o.y < api.h + 60);

    if (s.alive && !s.won) {
      const bag = s.carry ? "📦 несёшь" : "пусто";
      const tip = s.teach > 0
        ? (!s.carry ? " · возьми жёлтое" : " · сдай в ворота")
        : "";
      api.setHud(
        `⭐${s.score} · ×${s.combo} · ${s.deliveries}/${this.WIN_DELIVERIES} · ${bag}${tip}`
      );
    }
  },
  draw(s, api) {
    const { ctx, w, h } = api;
    const lanes = s._laneX;

    // night road
    ctx.fillStyle = "#0B1026";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#1C2541";
    ctx.fillRect(w * 0.08, 0, w * 0.84, h);

    // scroll dashes
    const scroll = (s.t * s.speed * 0.35) % 48;
    ctx.strokeStyle = "#5BC0BE55";
    ctx.lineWidth = 2;
    ctx.setLineDash([18, 30]);
    ctx.lineDashOffset = -scroll;
    lanes.forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // city dots
    for (let i = 0; i < 10; i++) {
      ctx.fillStyle = i % 2 ? "rgba(0,245,212,0.12)" : "rgba(255,46,151,0.1)";
      ctx.fillRect(6 + i * 34, 24 + ((i * 17 + scroll) % 80), 6, 6);
    }

    for (const o of s.objs) {
      const x = lanes[o.lane];
      if (o.type === "car") {
        ctx.fillStyle = "#FF4D6D";
        ctx.fillRect(x - 20, o.y - 16, 40, 32);
        ctx.fillStyle = "#ffb4c0";
        ctx.fillRect(x - 12, o.y - 8, 24, 10);
      } else if (o.type === "parcel") {
        ctx.fillStyle = "#FFB703";
        ctx.fillRect(x - 14, o.y - 14, 28, 28);
        ctx.strokeStyle = "#fff8";
        ctx.strokeRect(x - 14, o.y - 14, 28, 28);
      } else if (o.type === "gate") {
        ctx.strokeStyle = "#00F5D4";
        ctx.lineWidth = 4;
        ctx.strokeRect(x - 26, o.y - 22, 52, 44);
        ctx.fillStyle = "rgba(0,245,212,0.18)";
        ctx.fillRect(x - 26, o.y - 22, 52, 44);
        ctx.fillStyle = "#00F5D4";
        ctx.font = "bold 11px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("СДАТЬ", x, o.y + 4);
      }
    }

    // bike
    const bx = s.px;
    const by = h - 130;
    ctx.beginPath();
    ctx.arc(bx, by, 18, 0, Math.PI * 2);
    ctx.fillStyle = s.inv > 0 ? "#E8F1F2" : "#00F5D4";
    ctx.fill();
    if (s.carry) {
      ctx.fillStyle = "#FFB703";
      ctx.fillRect(bx - 8, by - 34, 16, 14);
    }

    // toast
    if (s.toast > 0 && s.toastText) {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(20, h * 0.28, w - 40, 36);
      ctx.fillStyle = "#E8F1F2";
      ctx.font = "bold 13px Segoe UI, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(s.toastText, w / 2, h * 0.28 + 22);
    }

    if (s.won) {
      api.drawBanner(ctx, "СМЕНА ЗАКРЫТА", "#00F5D4");
    } else if (!s.alive) {
      api.drawBanner(ctx, "КРАШ", "#FF4D6D");
    }
  },
};
