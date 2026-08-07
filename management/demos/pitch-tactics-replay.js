(function () {
  /** Flat-top hex grid, odd-q offset coords [col, row] */
  const COLS = 12;
  const ROWS = 20;
  const HEX = 18; // radius in SVG units
  const STEP_X = HEX * 1.5;
  const STEP_Y = HEX * Math.sqrt(3);
  const ORIGIN_X = HEX * 1.35;
  const ORIGIN_Y = HEX * 1.2;
  const VB_W = ORIGIN_X * 2 + STEP_X * (COLS - 1) + HEX;
  const VB_H = ORIGIN_Y * 2 + STEP_Y * (ROWS - 0.5) + HEX;

  const ROLE_SHORT = { GK: "ВР", Z: "З", OP1: "О1", OP2: "О2", NAP: "Н" };
  const ROLE_NAME = {
    GK: "Вратарь",
    Z: "Защитник",
    OP1: "Опорный 1",
    OP2: "Опорный 2",
    NAP: "Нападающий",
  };
  const PRESSURE = { GK: 0, Z: 2, OP1: 1, OP2: 1, NAP: 0 };
  const KIND_RU = {
    move: "Бежит",
    pass: "Пас",
    shot: "Удар!",
    defend: "Defend",
    windup: "Замах",
    press: "Прессинг",
    receive: "Приём",
  };
  const MOVE_MS = 950;
  const BALL_GOAL_MS = 1100;
  const HOLD_MS = 1800;

  const GOAL_A = { cols: [4, 5, 6, 7], row: 0 }; // B scores here
  const GOAL_B = { cols: [4, 5, 6, 7], row: 19 }; // A scores here

  const matches = window.PITCH_TACTICS_MATCHES || [];
  let matchIndex = 0;
  let stepIndex = 0;
  let playing = false;
  let playTimer = null;
  let animating = false;

  const pieceEls = {};
  let ballEl = null;
  let svgEl = null;
  let hexLayer = null;
  let trailLayer = null;
  let fxLayer = null;
  let lastPlayers = null;
  let lastBall = null;
  const hexNodes = {};

  const els = {
    tabs: document.getElementById("matchTabs"),
    meta: document.getElementById("matchMeta"),
    clock: document.getElementById("clock"),
    scoreboard: document.getElementById("scoreboard"),
    sidePill: document.getElementById("sidePill"),
    stylesBox: document.getElementById("stylesBox"),
    glossary: document.getElementById("glossary"),
    banner: document.getElementById("banner"),
    paradigm: document.getElementById("paradigm"),
    pitch: document.getElementById("pitch"),
    narrative: document.getElementById("narrative"),
    actions: document.getElementById("actions"),
    rollBox: document.getElementById("rollBox"),
    labels: document.getElementById("labels"),
    note: document.getElementById("note"),
    scrubber: document.getElementById("scrubber"),
    stepCount: document.getElementById("stepCount"),
    btnPrev: document.getElementById("btnPrev"),
    btnNext: document.getElementById("btnNext"),
    btnPlay: document.getElementById("btnPlay"),
    moveLog: document.getElementById("moveLog"),
  };

  function match() {
    return matches[matchIndex];
  }
  function step() {
    return match().steps[stepIndex];
  }
  function prevStep() {
    return stepIndex > 0 ? match().steps[stepIndex - 1] : null;
  }

  /** odd-q flat-top center in SVG units */
  function hexCenter(col, row) {
    const x = ORIGIN_X + STEP_X * col;
    const y = ORIGIN_Y + STEP_Y * (row + 0.5 * (col & 1));
    return { x, y };
  }

  function hexPoints(cx, cy, size) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 180) * (60 * i); // flat-top
      pts.push(cx + size * Math.cos(a) + "," + (cy + size * Math.sin(a)));
    }
    return pts.join(" ");
  }

  function offsetToCube(col, row) {
    const x = col;
    const z = row - ((col - (col & 1)) >> 1);
    const y = -x - z;
    return { x, y, z };
  }

  function hexDist(a, b) {
    const A = offsetToCube(a[0], a[1]);
    const B = offsetToCube(b[0], b[1]);
    return (Math.abs(A.x - B.x) + Math.abs(A.y - B.y) + Math.abs(A.z - B.z)) / 2;
  }

  function cellName(pos) {
    return ("ABCDEFGHIJKL"[pos[0]] || "?") + (pos[1] + 1);
  }

  function pctFromHex(col, row) {
    const c = hexCenter(col, row);
    return { left: (c.x / VB_W) * 100, top: (c.y / VB_H) * 100 };
  }

  function ensureLayers() {
    if (svgEl) return;
    els.pitch.innerHTML = "";

    svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgEl.setAttribute("class", "pitch-svg");
    svgEl.setAttribute("viewBox", "0 0 " + VB_W + " " + VB_H);
    svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
    els.pitch.appendChild(svgEl);

    hexLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    trailLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svgEl.appendChild(hexLayer);
    svgEl.appendChild(trailLayer);

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const center = hexCenter(c, r);
        const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        poly.setAttribute("points", hexPoints(center.x, center.y, HEX * 0.92));
        let cls = "hex-cell" + ((c + r) % 2 ? " alt" : "");
        const g = isGoalHex(c, r);
        if (g) cls += " hex-goal hex-goal-" + g.toLowerCase();
        poly.setAttribute("class", cls);
        poly.dataset.col = String(c);
        poly.dataset.row = String(r);
        hexLayer.appendChild(poly);
        hexNodes[c + "," + r] = poly;
      }
    }

    const mid = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const yMid = (hexCenter(0, 9).y + hexCenter(0, 10).y) / 2;
    mid.setAttribute("x1", ORIGIN_X - HEX);
    mid.setAttribute("x2", VB_W - ORIGIN_X + HEX);
    mid.setAttribute("y1", yMid);
    mid.setAttribute("y2", yMid);
    mid.setAttribute("class", "hex-midline");
    hexLayer.appendChild(mid);

    fxLayer = document.createElement("div");
    fxLayer.className = "fx-layer";
    els.pitch.appendChild(fxLayer);

    ballEl = document.createElement("div");
    ballEl.className = "ball";
    ballEl.hidden = true;
    els.pitch.appendChild(ballEl);

    ["A", "B"].forEach((side) => {
      ["GK", "Z", "OP1", "OP2", "NAP"].forEach((role) => {
        const key = side + "." + role;
        const el = document.createElement("button");
        el.type = "button";
        el.className = "piece " + side + (role === "GK" ? " GK" : "");
        el.innerHTML =
          '<span class="piece-label">' +
          ROLE_SHORT[role] +
          '</span><span class="badge-slot"></span><span class="float-callout" hidden></span>';
        els.pitch.appendChild(el);
        pieceEls[key] = el;
      });
    });
  }

  function setPiecePos(el, col, row, animate) {
    const p = pctFromHex(col, row);
    if (!animate) {
      el.style.transition = "none";
      el.style.left = p.left + "%";
      el.style.top = p.top + "%";
      void el.offsetWidth;
      el.style.transition = "";
    } else {
      el.style.transition =
        "left " + MOVE_MS + "ms ease, top " + MOVE_MS + "ms ease";
      el.style.left = p.left + "%";
      el.style.top = p.top + "%";
    }
  }

  function setBallPos(col, row, animate) {
    if (col == null) {
      ballEl.hidden = true;
      return;
    }
    ballEl.hidden = false;
    const p = pctFromHex(col, row);
    const ms = ballEl.classList.contains("ball-shot") ? BALL_GOAL_MS : MOVE_MS;
    if (!animate) {
      ballEl.style.transition = "none";
      ballEl.style.left = p.left + "%";
      ballEl.style.top = p.top + "%";
      void ballEl.offsetWidth;
      ballEl.style.transition = "";
    } else {
      ballEl.style.transition =
        "left " +
        ms +
        "ms cubic-bezier(.15,.85,.2,1), top " +
        ms +
        "ms cubic-bezier(.15,.85,.2,1), transform " +
        ms +
        "ms ease";
      ballEl.style.left = p.left + "%";
      ballEl.style.top = p.top + "%";
    }
  }

  function clearTrails() {
    while (trailLayer.firstChild) trailLayer.removeChild(trailLayer.firstChild);
  }

  function drawArrow(from, to, cls) {
    if (!from || !to) return;
    if (from[0] === to[0] && from[1] === to[1]) return;
    const a = hexCenter(from[0], from[1]);
    const b = hexCenter(to[0], to[1]);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", a.x);
    line.setAttribute("y1", a.y);
    line.setAttribute("x2", b.x);
    line.setAttribute("y2", b.y);
    line.setAttribute("class", "move-arrow " + cls);
    trailLayer.appendChild(line);

    const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
    const head = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    const s = 5;
    head.setAttribute(
      "points",
      b.x + "," + b.y + " " + (b.x - s) + "," + (b.y - s * 0.55) + " " + (b.x - s) + "," + (b.y + s * 0.55)
    );
    head.setAttribute("class", "move-head " + cls);
    head.setAttribute("transform", "rotate(" + ang + " " + b.x + " " + b.y + ")");
    trailLayer.appendChild(head);

    const ghost = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ghost.setAttribute("cx", a.x);
    ghost.setAttribute("cy", a.y);
    ghost.setAttribute("r", 4);
    ghost.setAttribute("class", "move-ghost");
    trailLayer.appendChild(ghost);
  }

  function drawBallPath(from, to) {
    if (!from || !to) return;
    const a = hexCenter(from[0], from[1]);
    const b = hexCenter(to[0], to[1]);
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2 - HEX * 0.8;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M " + a.x + " " + a.y + " Q " + mx + " " + my + " " + b.x + " " + b.y);
    path.setAttribute("class", "ball-path");
    trailLayer.appendChild(path);
  }

  function isGoalHex(col, row) {
    if (row === GOAL_A.row && GOAL_A.cols.indexOf(col) >= 0) return "A";
    if (row === GOAL_B.row && GOAL_B.cols.indexOf(col) >= 0) return "B";
    return null;
  }

  function paintGoals() {
    GOAL_A.cols.forEach((c) => {
      const n = hexNodes[c + "," + GOAL_A.row];
      if (n) n.classList.add("hex-goal", "hex-goal-a");
    });
    GOAL_B.cols.forEach((c) => {
      const n = hexNodes[c + "," + GOAL_B.row];
      if (n) n.classList.add("hex-goal", "hex-goal-b");
    });
  }

  function resetHexClasses() {
    Object.values(hexNodes).forEach((poly) => {
      const c = Number(poly.dataset.col);
      const r = Number(poly.dataset.row);
      let cls = "hex-cell" + ((c + r) % 2 ? " alt" : "");
      const g = isGoalHex(c, r);
      if (g) cls += " hex-goal hex-goal-" + g.toLowerCase();
      poly.setAttribute("class", cls);
    });
  }

  function paintHex(col, row, cls) {
    const n = hexNodes[col + "," + row];
    if (!n) return;
    const g = isGoalHex(col, row);
    let base = "hex-cell " + cls;
    if (g) base += " hex-goal hex-goal-" + g.toLowerCase();
    n.setAttribute("class", base);
  }

  function renderAuras(s) {
    resetHexClasses();
    Object.entries(s.statuses || {}).forEach(([key, st]) => {
      if (!st.defend) return;
      const [side, role] = key.split(".");
      const pos = s.players[side][role];
      if (pos) paintHex(pos[0], pos[1], "aura-defend");
    });
    ["A", "B"].forEach((side) => {
      Object.entries(s.players[side]).forEach(([role, pos]) => {
        const rad = PRESSURE[role] || 0;
        if (!rad) return;
        for (let c = 0; c < COLS; c++) {
          for (let r = 0; r < ROWS; r++) {
            const d = hexDist(pos, [c, r]);
            if (d > 0 && d <= rad) {
              const n = hexNodes[c + "," + r];
              if (n && n.getAttribute("class").indexOf("aura-defend") >= 0) continue;
              paintHex(c, r, rad >= 2 ? "aura-p2" : "aura-p1");
            }
          }
        }
      });
    });
  }

  function updateBadges(s) {
    Object.keys(pieceEls).forEach((key) => {
      const slot = pieceEls[key].querySelector(".badge-slot");
      slot.innerHTML = "";
      const focusLv = (s.focus || {})[key] || 0;
      const st = (s.statuses || {})[key] || {};
      if (focusLv > 0) {
        const b = document.createElement("span");
        b.className = "badge sleep";
        b.textContent = "Z" + focusLv;
        slot.appendChild(b);
      }
      if (st.defend) {
        const b = document.createElement("span");
        b.className = "badge defend";
        b.textContent = "D" + st.defend;
        slot.appendChild(b);
      }
      if (st.windup) {
        const b = document.createElement("span");
        b.className = "badge windup";
        b.textContent = "⚡";
        slot.appendChild(b);
      }
    });
  }

  function clearCallouts() {
    Object.values(pieceEls).forEach((el) => {
      const c = el.querySelector(".float-callout");
      c.hidden = true;
      c.textContent = "";
      c.className = "float-callout";
    });
    fxLayer.innerHTML = "";
  }

  function showCallout(key, text, kind) {
    const el = pieceEls[key];
    if (!el) return;
    const c = el.querySelector(".float-callout");
    c.hidden = false;
    c.textContent = text;
    c.className = "float-callout show kind-" + (kind || "move");
  }

  function collectMoves(prev, next) {
    const moves = [];
    if (!prev) return moves;
    ["A", "B"].forEach((side) => {
      Object.keys(next.players[side]).forEach((role) => {
        const a = prev.players[side][role];
        const b = next.players[side][role];
        if (!a || !b) return;
        if (a[0] !== b[0] || a[1] !== b[1]) {
          const key = side + "." + role;
          moves.push({
            key,
            side,
            role,
            from: a,
            to: b,
            active: (next.actions || []).some((act) => act.who === key),
            cells: hexDist(a, b),
          });
        }
      });
    });
    return moves;
  }

  function renderMoveLog(moves) {
    els.moveLog.innerHTML = "";
    if (!moves.length) {
      els.moveLog.innerHTML = "<li>Никто не сдвинулся</li>";
      return;
    }
    moves
      .slice()
      .sort((a, b) => Number(b.active) - Number(a.active) || b.cells - a.cells)
      .forEach((m) => {
        const li = document.createElement("li");
        li.className = m.active ? "active-move" : "passive-move";
        li.innerHTML =
          "<strong>" +
          m.side +
          " " +
          ROLE_NAME[m.role] +
          "</strong> " +
          cellName(m.from) +
          " → " +
          cellName(m.to) +
          ' <span class="tagish">' +
          (m.active ? "актив" : "форма") +
          " · " +
          m.cells +
          " гекс</span>";
        els.moveLog.appendChild(li);
      });
  }

  function renderRoll(roll) {
    if (!roll) {
      els.rollBox.innerHTML = '<div class="roll-empty">Нет броска</div>';
      return;
    }
    const cls =
      roll.result === "fail" ? "fail" : roll.result === "goal" ? "goal" : "ok";
    const resultText =
      roll.result === "goal" ? "ГОЛ" : roll.result === "ok" ? "Успех" : "Провал";
    els.rollBox.innerHTML =
      '<div class="roll-label">' +
      roll.label +
      '</div><div class="roll-chance">' +
      roll.chance +
      '%</div><div class="roll-bar"><span style="width:' +
      roll.chance +
      '%"></span></div><div class="roll-result ' +
      cls +
      '">Бросок ' +
      roll.roll +
      " → " +
      resultText +
      "</div>";
  }

  function renderMeta() {
    const m = match();
    document.body.dataset.match = m.id;
    els.meta.innerHTML =
      '<span class="theme-dot theme-' +
      m.id +
      '"></span><strong>' +
      m.title +
      "</strong> — " +
      m.subtitle +
      " · Итог <strong>" +
      m.scoreFinal +
      "</strong>";
    els.stylesBox.innerHTML =
      '<div><div class="who">Игрок A</div>' +
      m.styles.A +
      '</div><div><div class="who">Игрок B</div>' +
      m.styles.B +
      "</div>";
    els.glossary.innerHTML = "";
    (m.uiGlossary || []).forEach((g) => {
      const art = document.createElement("article");
      art.innerHTML =
        "<b>" +
        g.key +
        '</b><span class="where">Где: ' +
        g.where +
        "</span><p>" +
        g.text +
        "</p>";
      els.glossary.appendChild(art);
    });
  }

  function renderSidePanel(s, moves) {
    const m = match();
    els.scrubber.max = String(m.steps.length - 1);
    els.scrubber.value = String(stepIndex);
    els.stepCount.textContent = stepIndex + 1 + " / " + m.steps.length;
    els.clock.textContent = String(s.min).padStart(2, "0") + "'";
    els.scoreboard.textContent = s.score[0] + " : " + s.score[1];

    const side = s.side || "";
    els.sidePill.textContent =
      side === "A"
        ? "Ход A"
        : side === "B"
          ? "Ход B"
          : side === "kick"
            ? "Kick-off"
            : side === "end"
              ? "Финал"
              : side;
    els.sidePill.className =
      "side-pill " + (side === "A" || side === "B" ? side : "");

    const bannerLabel = (s.uiLabels || []).find((x) => x.id === "banner");
    els.banner.textContent = bannerLabel
      ? bannerLabel.text
      : m.title + " · " + s.min + "'";

    if (s.paradigm) {
      els.paradigm.hidden = false;
      els.paradigm.textContent = "Парадигма: " + s.paradigm;
    } else {
      const pLab = (s.uiLabels || []).find((x) => x.id === "paradigm");
      if (pLab) {
        els.paradigm.hidden = false;
        els.paradigm.textContent = pLab.text;
      } else els.paradigm.hidden = true;
    }

    els.narrative.textContent = s.narrative || "";
    els.actions.innerHTML = "";
    (s.actions || []).forEach((a) => {
      const li = document.createElement("li");
      li.innerHTML =
        '<span class="kind">' +
        (KIND_RU[a.kind] || a.kind) +
        "</span><strong>" +
        a.who +
        "</strong> — " +
        a.detail;
      els.actions.appendChild(li);
    });
    if (!(s.actions || []).length) els.actions.innerHTML = "<li>Нет AP-действий</li>";

    renderRoll(s.roll);
    renderMoveLog(moves);

    els.labels.innerHTML = "";
    (s.uiLabels || []).forEach((l) => {
      const li = document.createElement("li");
      li.innerHTML = "<strong>" + l.id + "</strong>: " + l.text;
      els.labels.appendChild(li);
    });
    if (s.note) {
      els.note.hidden = false;
      els.note.textContent = s.note;
    } else els.note.hidden = true;
  }

  function placeInstant(s) {
    ensureLayers();
    clearTrails();
    clearCallouts();
    ["A", "B"].forEach((side) => {
      Object.entries(s.players[side]).forEach(([role, pos]) => {
        setPiecePos(pieceEls[side + "." + role], pos[0], pos[1], false);
      });
    });
    setBallPos(s.ball ? s.ball[0] : null, s.ball ? s.ball[1] : null, false);
    renderAuras(s);
    updateBadges(s);
    lastPlayers = JSON.parse(JSON.stringify(s.players));
    lastBall = s.ball ? s.ball.slice() : null;
  }

  function animateToStep(s, fromPlayers, fromBall) {
    ensureLayers();
    clearTrails();
    clearCallouts();

    const fakePrev = { players: fromPlayers, actions: [] };
    const moves = collectMoves(fakePrev, s);
    const isGoal = s.roll && s.roll.result === "goal" && s.goalTo;
    const shotFrom = s.shotFrom || fromBall;

    moves.forEach((mv) => {
      drawArrow(mv.from, mv.to, mv.active ? "active-" + mv.side : "passive");
    });

    if (isGoal && shotFrom) {
      drawBallPath(shotFrom, s.goalTo);
    } else if (fromBall && s.ball) {
      drawBallPath(fromBall, s.ball);
    }

    renderSidePanel(s, moves);

    (s.actions || []).forEach((a, idx) => {
      setTimeout(() => {
        showCallout(a.who, KIND_RU[a.kind] || a.kind, a.kind);
      }, 80 + idx * 160);
    });
    moves
      .filter((m) => !m.active && m.cells >= 2)
      .slice(0, 4)
      .forEach((m, idx) => {
        setTimeout(() => {
          const c = pieceEls[m.key].querySelector(".float-callout");
          if (!c.hidden && c.textContent) return;
          showCallout(
            m.key,
            "Форма " + cellName(m.from) + "→" + cellName(m.to),
            "form"
          );
        }, 350 + idx * 140);
      });

    // First move players; ball waits at shot origin for goals
    requestAnimationFrame(() => {
      ["A", "B"].forEach((side) => {
        Object.entries(s.players[side]).forEach(([role, pos]) => {
          setPiecePos(pieceEls[side + "." + role], pos[0], pos[1], true);
        });
      });

      if (isGoal && shotFrom) {
        setBallPos(shotFrom[0], shotFrom[1], false);
        setTimeout(() => {
          ballEl.classList.add("ball-shot");
          setBallPos(s.goalTo[0], s.goalTo[1], true);
          const net = document.createElement("div");
          net.className = "goal-net-flash";
          const gp = pctFromHex(s.goalTo[0], s.goalTo[1]);
          net.style.left = gp.left + "%";
          net.style.top = gp.top + "%";
          net.textContent = "⚽";
          fxLayer.appendChild(net);
          setTimeout(() => ballEl.classList.remove("ball-shot"), BALL_GOAL_MS + 50);
        }, Math.min(400, MOVE_MS * 0.45));
      } else if (s.ball) {
        setBallPos(s.ball[0], s.ball[1], true);
      } else {
        setBallPos(null, null, false);
      }
    });

    setTimeout(() => {
      renderAuras(s);
      updateBadges(s);
    }, MOVE_MS);

    lastPlayers = JSON.parse(JSON.stringify(s.players));
    lastBall = s.ball ? s.ball.slice() : s.goalTo ? s.goalTo.slice() : null;
  }

  function render(animate) {
    renderMeta();
    const s = step();
    ensureLayers();
    const shouldAnimate =
      animate !== false && lastPlayers && stepIndex > 0 && !animating;

    if (shouldAnimate) {
      animating = true;
      animateToStep(s, lastPlayers, lastBall);
      setTimeout(() => {
        animating = false;
      }, MOVE_MS + 80);
    } else {
      const prev = prevStep();
      const moves = collectMoves(prev, s);
      placeInstant(s);
      if (prev) {
        moves.forEach((mv) =>
          drawArrow(mv.from, mv.to, mv.active ? "active-" + mv.side : "passive")
        );
        if (prev.ball && s.ball) drawBallPath(prev.ball, s.ball);
        (s.actions || []).forEach((a) =>
          showCallout(a.who, KIND_RU[a.kind] || a.kind, a.kind)
        );
      }
      renderSidePanel(s, moves);
      renderAuras(s);
      updateBadges(s);
    }
  }

  function buildTabs() {
    els.tabs.innerHTML = "";
    matches.forEach((m, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tab theme-" + m.id;
      b.textContent = m.id + " · " + m.title;
      b.setAttribute("aria-selected", i === matchIndex ? "true" : "false");
      b.addEventListener("click", () => {
        stopPlay();
        matchIndex = i;
        stepIndex = 0;
        lastPlayers = null;
        lastBall = null;
        buildTabs();
        render(false);
      });
      els.tabs.appendChild(b);
    });
  }

  function stopPlay() {
    playing = false;
    els.btnPlay.textContent = "▶ Смотреть";
    if (playTimer) {
      clearTimeout(playTimer);
      playTimer = null;
    }
  }

  function playNext() {
    if (!playing) return;
    if (stepIndex >= match().steps.length - 1) {
      stopPlay();
      return;
    }
    stepIndex += 1;
    render(true);
    playTimer = setTimeout(playNext, MOVE_MS + HOLD_MS + (step().roll && step().roll.result === "goal" ? 700 : 0));
  }

  function startPlay() {
    playing = true;
    els.btnPlay.textContent = "❚❚ Пауза";
    if (stepIndex >= match().steps.length - 1) {
      stepIndex = 0;
      lastPlayers = null;
      render(false);
      playTimer = setTimeout(playNext, 600);
    } else playNext();
  }

  els.btnPrev.addEventListener("click", () => {
    stopPlay();
    stepIndex = Math.max(0, stepIndex - 1);
    lastPlayers = null;
    render(false);
  });
  els.btnNext.addEventListener("click", () => {
    stopPlay();
    if (stepIndex < match().steps.length - 1) {
      stepIndex += 1;
      render(true);
    }
  });
  els.btnPlay.addEventListener("click", () => {
    if (playing) stopPlay();
    else startPlay();
  });
  els.scrubber.addEventListener("input", () => {
    stopPlay();
    stepIndex = Number(els.scrubber.value);
    lastPlayers = null;
    render(false);
  });

  if (!matches.length) {
    document.body.innerHTML = "<p style='padding:2rem'>Нет данных</p>";
    return;
  }
  buildTabs();
  render(false);
})();
