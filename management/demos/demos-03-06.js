window.FEEL_DEMOS = window.FEEL_DEMOS || {};

/* ========== 04 Legends of the Pitch ========== */
/* legends-of-the-pitch → management/demos/legends-pitch-demo.js (rewrite Pass-2) */

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
