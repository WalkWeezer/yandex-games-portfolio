(function () {
  const COLS = 12;
  const ROWS = 20;
  const ROLE_SHORT = { GK: "ВР", Z: "З", OP1: "О1", OP2: "О2", NAP: "Н" };
  const PRESSURE = { GK: 0, Z: 2, OP1: 1, OP2: 1, NAP: 0 };

  const matches = window.PITCH_TACTICS_MATCHES || [];
  let matchIndex = 0;
  let stepIndex = 0;
  let playing = false;
  let playTimer = null;

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
  };

  function match() {
    return matches[matchIndex];
  }

  function step() {
    return match().steps[stepIndex];
  }

  function pct(col, row) {
    return {
      left: ((col + 0.5) / COLS) * 100 + "%",
      top: ((row + 0.5) / ROWS) * 100 + "%",
    };
  }

  function buildTabs() {
    els.tabs.innerHTML = "";
    matches.forEach((m, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "tab";
      b.textContent = m.id + " · " + m.title;
      b.setAttribute("aria-selected", i === matchIndex ? "true" : "false");
      b.addEventListener("click", () => {
        stopPlay();
        matchIndex = i;
        stepIndex = 0;
        buildTabs();
        render();
      });
      els.tabs.appendChild(b);
    });
  }

  function renderMeta() {
    const m = match();
    els.meta.innerHTML =
      "<strong>" +
      m.title +
      "</strong> — " +
      m.subtitle +
      " · Итог <strong>" +
      m.scoreFinal +
      "</strong>";

    els.stylesBox.innerHTML =
      '<div><div class="who">Игрок A</div>' +
      m.styles.A +
      "</div><div><div class=\"who\">Игрок B</div>" +
      m.styles.B +
      "</div>";

    els.glossary.innerHTML = "";
    (m.uiGlossary || []).forEach((g) => {
      const art = document.createElement("article");
      art.innerHTML =
        "<b>" +
        g.key +
        '</b><span class="where">Где на экране: ' +
        g.where +
        "</span><p>" +
        g.text +
        "</p>";
      els.glossary.appendChild(art);
    });
  }

  function clearPitch() {
    els.pitch.innerHTML = "";
  }

  function addAura(col, row, cls) {
    if (col < 0 || row < 0 || col >= COLS || row >= ROWS) return;
    const d = document.createElement("div");
    d.className = "cell-aura " + cls;
    const p = pct(col, row);
    d.style.left = "calc(" + p.left + " - " + 100 / COLS / 2 + "%)";
    d.style.top = "calc(" + p.top + " - " + 100 / ROWS / 2 + "%)";
    d.style.width = 100 / COLS + "%";
    d.style.height = 100 / ROWS + "%";
    els.pitch.appendChild(d);
  }

  function renderPitch(s) {
    clearPitch();

    // Defend cells
    Object.entries(s.statuses || {}).forEach(([key, st]) => {
      if (!st.defend) return;
      const [side, role] = key.split(".");
      const pos = s.players[side][role];
      if (pos) addAura(pos[0], pos[1], "defend");
    });

    // Pressure auras from defenders/mids
    ["A", "B"].forEach((side) => {
      Object.entries(s.players[side]).forEach(([role, pos]) => {
        const r = PRESSURE[role] || 0;
        if (!r) return;
        for (let dc = -r; dc <= r; dc++) {
          for (let dr = -r; dr <= r; dr++) {
            if (Math.abs(dc) + Math.abs(dr) === 0) continue;
            if (Math.abs(dc) <= r && Math.abs(dr) <= r) {
              addAura(pos[0] + dc, pos[1] + dr, r >= 2 ? "p2" : "p1");
            }
          }
        }
      });
    });

    if (s.ball) {
      const ball = document.createElement("div");
      ball.className = "ball";
      const p = pct(s.ball[0], s.ball[1]);
      ball.style.left = p.left;
      ball.style.top = p.top;
      els.pitch.appendChild(ball);
    }

    ["A", "B"].forEach((side) => {
      Object.entries(s.players[side]).forEach(([role, pos]) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "piece " + side + (role === "GK" ? " GK" : "");
        el.textContent = ROLE_SHORT[role] || role;
        el.title = side + " " + role;
        const p = pct(pos[0], pos[1]);
        el.style.left = p.left;
        el.style.top = p.top;

        const key = side + "." + role;
        const focusLv = (s.focus || {})[key] || 0;
        const st = (s.statuses || {})[key] || {};

        if (focusLv > 0) {
          const b = document.createElement("span");
          b.className = "badge sleep";
          b.textContent = "Z" + focusLv;
          b.title = "Сон / концентрация " + focusLv;
          el.appendChild(b);
        } else if (st.defend) {
          const b = document.createElement("span");
          b.className = "badge defend";
          b.textContent = "D" + st.defend;
          b.title = "Defend, осталось ходов: " + st.defend;
          el.appendChild(b);
        } else if (st.windup) {
          const b = document.createElement("span");
          b.className = "badge windup";
          b.textContent = "⚡";
          b.title = "Замах (видно)";
          el.appendChild(b);
        }

        els.pitch.appendChild(el);
      });
    });
  }

  function renderRoll(roll) {
    if (!roll) {
      els.rollBox.innerHTML = '<div class="roll-empty">Нет броска на этом шаге</div>';
      return;
    }
    const cls =
      roll.result === "fail" ? "fail" : roll.result === "goal" ? "goal" : "ok";
    const resultText =
      roll.result === "goal"
        ? "ГОЛ"
        : roll.result === "ok"
          ? "Успех"
          : "Провал";
    els.rollBox.innerHTML =
      '<div class="roll-label">' +
      roll.label +
      "</div>" +
      '<div class="roll-chance">' +
      roll.chance +
      "%</div>" +
      '<div class="roll-bar"><span style="width:' +
      roll.chance +
      '%"></span></div>' +
      '<div class="roll-result ' +
      cls +
      '">Бросок ' +
      roll.roll +
      " → " +
      resultText +
      "</div>";
  }

  function render() {
    const m = match();
    const s = step();
    renderMeta();

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
    els.sidePill.className = "side-pill " + (side === "A" || side === "B" ? side : "");

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
      } else {
        els.paradigm.hidden = true;
      }
    }

    els.narrative.textContent = s.narrative || "";

    els.actions.innerHTML = "";
    (s.actions || []).forEach((a) => {
      const li = document.createElement("li");
      li.innerHTML =
        '<span class="kind">' +
        a.kind +
        "</span><strong>" +
        a.who +
        "</strong> — " +
        a.detail;
      els.actions.appendChild(li);
    });
    if (!(s.actions || []).length) {
      els.actions.innerHTML = "<li>Нет AP-действий</li>";
    }

    renderRoll(s.roll);

    els.labels.innerHTML = "";
    (s.uiLabels || []).forEach((l) => {
      const li = document.createElement("li");
      li.innerHTML =
        "<strong>" +
        l.id +
        "</strong>" +
        (l.spot ? ' <span style="color:var(--muted)">(' + l.spot + ")</span>" : "") +
        ": " +
        l.text;
      els.labels.appendChild(li);
    });

    if (s.note) {
      els.note.hidden = false;
      els.note.textContent = s.note;
    } else {
      els.note.hidden = true;
    }

    renderPitch(s);
  }

  function stopPlay() {
    playing = false;
    els.btnPlay.textContent = "▶ Смотреть";
    if (playTimer) {
      clearInterval(playTimer);
      playTimer = null;
    }
  }

  function startPlay() {
    playing = true;
    els.btnPlay.textContent = "❚❚ Пауза";
    playTimer = setInterval(() => {
      if (stepIndex >= match().steps.length - 1) {
        stopPlay();
        return;
      }
      stepIndex += 1;
      render();
    }, 2200);
  }

  els.btnPrev.addEventListener("click", () => {
    stopPlay();
    stepIndex = Math.max(0, stepIndex - 1);
    render();
  });
  els.btnNext.addEventListener("click", () => {
    stopPlay();
    stepIndex = Math.min(match().steps.length - 1, stepIndex + 1);
    render();
  });
  els.btnPlay.addEventListener("click", () => {
    if (playing) stopPlay();
    else {
      if (stepIndex >= match().steps.length - 1) stepIndex = 0;
      startPlay();
      render();
    }
  });
  els.scrubber.addEventListener("input", () => {
    stopPlay();
    stepIndex = Number(els.scrubber.value);
    render();
  });

  if (!matches.length) {
    document.body.innerHTML = "<p style='padding:2rem'>Нет данных партий.</p>";
    return;
  }
  buildTabs();
  render();
})();
