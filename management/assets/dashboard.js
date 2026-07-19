
const KEY = "yg-portfolio-mgmt-v1";
const STATUS_RU = {
  DRAFT: "Черновик",
  REVIEW: "На ревью",
  CONFIRMED: "Подтверждён",
  BLOCKED: "Заблокирован",
};
const GAMES = window.PORTFOLIO_GAMES || [];

function defaultState() {
  const o = {};
  GAMES.forEach(g => {
    o[g.slug] = { classic: true, llm: true, refs: true, designStatus: "DRAFT", gate: "—", note: "" };
  });
  return o;
}
function load() {
  try {
    return { ...defaultState(), ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return defaultState();
  }
}
let state = load();
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

function progress(s) {
  const design = ((s.classic?1:0)+(s.llm?1:0)+(s.refs?1:0)) / 3;
  const gates = {"—":0,G0:1,G1:2,G2:3,G3:4,G4:5,G5:6};
  const g = (gates[s.gate] || 0) / 6;
  if (s.designStatus !== "CONFIRMED") {
    const conf = s.designStatus === "REVIEW" ? 0.5 : 0;
    return Math.round((design * 0.5 + conf * 0.1) * 100);
  }
  return Math.round((0.4 + g * 0.6) * 100);
}

function paintStatusPills() {
  document.querySelectorAll("[data-status-for]").forEach(el => {
    const slug = el.getAttribute("data-status-for");
    const st = state[slug]?.designStatus || "DRAFT";
    el.textContent = STATUS_RU[st] || st;
    el.className = "status-pill " + st;
  });
  document.querySelectorAll("[data-gate-label-for]").forEach(el => {
    const slug = el.getAttribute("data-gate-label-for");
    el.textContent = state[slug]?.gate || "—";
  });
  document.querySelectorAll("[data-progress-for]").forEach(el => {
    const slug = el.getAttribute("data-progress-for");
    el.style.width = progress(state[slug] || {classic:0,llm:0,refs:0,designStatus:"DRAFT",gate:"—"}) + "%";
  });
}

function renderStats() {
  const box = document.getElementById("stats");
  if (!box) return;
  const vals = GAMES.map(g => state[g.slug]);
  const c = (pred) => vals.filter(pred).length;
  box.innerHTML = `
    <div class="stat"><div class="n">${c(s => s.designStatus==="CONFIRMED")}/10</div><div class="l">Подтверждено</div></div>
    <div class="stat"><div class="n">${c(s => s.designStatus==="REVIEW")}</div><div class="l">На ревью</div></div>
    <div class="stat"><div class="n">${c(s => s.designStatus==="DRAFT")}</div><div class="l">Черновики</div></div>
    <div class="stat"><div class="n">${c(s => s.designStatus==="BLOCKED")}</div><div class="l">Заблокировано</div></div>
    <div class="stat"><div class="n">${c(s => s.designStatus==="CONFIRMED" && s.gate!=="—")}</div><div class="l">В разработке</div></div>
    <div class="stat"><div class="n">${c(s => s.gate==="G5")}</div><div class="l">Готово к стору</div></div>
  `;
}

function setupFilters() {
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      const wave = chip.getAttribute("data-wave");
      document.querySelectorAll(".card").forEach(card => {
        const slug = card.getAttribute("data-slug");
        const g = GAMES.find(x => x.slug === slug);
        card.style.display = (wave === "all" || String(g.wave) === wave) ? "" : "none";
      });
    });
  });
}

function setupTabs() {
  const tabs = document.querySelectorAll(".tab");
  if (!tabs.length) return;
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const id = tab.getAttribute("data-tab");
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      document.getElementById("tab-" + id)?.classList.add("active");
      history.replaceState(null, "", "#" + id);
    });
  });
  const hash = location.hash.replace("#", "");
  if (hash) {
    const t = document.querySelector(`.tab[data-tab="${hash}"]`);
    if (t) t.click();
  }
}

function setupManage() {
  const panel = document.querySelector("[data-manage-slug]");
  if (!panel) return;
  const slug = panel.getAttribute("data-manage-slug");
  const s = state[slug];

  panel.querySelectorAll('[data-role="design-status"] button').forEach(btn => {
    if (btn.getAttribute("data-v") === s.designStatus) btn.classList.add("active");
    btn.addEventListener("click", () => {
      panel.querySelectorAll('[data-role="design-status"] button').forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      s.designStatus = btn.getAttribute("data-v");
      if (s.designStatus !== "CONFIRMED") s.gate = "—";
      save(); paintStatusPills(); syncGateDisabled();
    });
  });

  panel.querySelectorAll("input[data-k]").forEach(inp => {
    inp.checked = !!s[inp.getAttribute("data-k")];
    inp.addEventListener("change", () => {
      s[inp.getAttribute("data-k")] = inp.checked;
      save(); paintStatusPills();
    });
  });

  const gate = panel.querySelector('[data-role="gate"]');
  gate.value = s.gate || "—";
  gate.addEventListener("change", () => {
    s.gate = gate.value;
    save(); paintStatusPills();
  });

  const note = panel.querySelector('[data-role="note"]');
  note.value = s.note || "";
  note.addEventListener("change", () => {
    s.note = note.value;
    save();
  });

  function syncGateDisabled() {
    gate.disabled = s.designStatus !== "CONFIRMED";
  }
  syncGateDisabled();
}

function setupMobileNav() {
  const layout = document.querySelector(".layout");
  const sidebar = document.querySelector(".sidebar");
  if (!layout || !sidebar || document.querySelector(".mobile-bar")) return;

  const bar = document.createElement("header");
  bar.className = "mobile-bar";
  bar.innerHTML = `
    <button type="button" class="mobile-nav-btn" aria-label="Меню" aria-expanded="false">
      <span class="mobile-nav-icon" aria-hidden="true"></span>
    </button>
    <a class="mobile-bar-brand" href="${sidebar.querySelector(".brand")?.getAttribute("href") || "#"}">Портфель</a>
  `;
  const backdrop = document.createElement("div");
  backdrop.className = "sidebar-backdrop";
  backdrop.hidden = true;
  layout.prepend(bar);
  document.body.appendChild(backdrop);

  const btn = bar.querySelector(".mobile-nav-btn");
  function setOpen(open) {
    document.body.classList.toggle("nav-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    backdrop.hidden = !open;
  }
  btn.addEventListener("click", () => setOpen(!document.body.classList.contains("nav-open")));
  backdrop.addEventListener("click", () => setOpen(false));
  sidebar.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) setOpen(false);
  });
}

function setupDemo() {
  const canvas = document.getElementById("feel-demo");
  if (!canvas || !window.FeelDemo || !window.CURRENT_SLUG) return;
  const hud = document.getElementById("demo-hint");
  const wrap = canvas.closest(".demo-wrap") || canvas.parentElement;
  const actions = wrap?.querySelector(".demo-actions");
  let handle = null;
  let fsMode = false;

  function ensureFsControls() {
    if (!actions) return null;
    let btn = document.getElementById("demo-fullscreen");
    if (!btn) {
      btn = document.createElement("button");
      btn.className = "btn";
      btn.type = "button";
      btn.id = "demo-fullscreen";
      btn.textContent = "На весь экран";
      const restart = document.getElementById("demo-restart");
      if (restart) restart.insertAdjacentElement("afterend", btn);
      else actions.prepend(btn);
    }
    let exit = document.getElementById("demo-fs-exit");
    if (!exit) {
      exit = document.createElement("button");
      exit.type = "button";
      exit.id = "demo-fs-exit";
      exit.className = "demo-fs-exit";
      exit.setAttribute("aria-label", "Закрыть полный экран");
      exit.textContent = "✕";
      wrap.appendChild(exit);
    }
    let hint = actions.querySelector(".demo-controls-hint");
    if (!hint) {
      const muted = actions.querySelector(".muted");
      if (muted) {
        muted.classList.add("demo-controls-hint");
        muted.textContent = "На телефоне: «На весь экран» → стики · WASD / свайпы вне FS";
      }
    }
    return { btn, exit };
  }

  const fsControls = ensureFsControls();

  function syncSticks() {
    if (handle) handle.setSticksEnabled(fsMode);
  }

  function start() {
    if (handle) handle.destroy();
    handle = window.FeelDemo.mount(window.CURRENT_SLUG, canvas, hud);
    syncSticks();
  }

  function isNativeFs() {
    return document.fullscreenElement === wrap || document.webkitFullscreenElement === wrap;
  }

  function enterFs() {
    fsMode = true;
    document.body.classList.add("demo-fs");
    wrap.classList.add("is-fs");
    if (fsControls?.btn) fsControls.btn.textContent = "Свернуть";
    syncSticks();
    const req = wrap.requestFullscreen || wrap.webkitRequestFullscreen;
    if (req) {
      try {
        const p = req.call(wrap);
        if (p && typeof p.catch === "function") p.catch(() => {});
      } catch (_) { /* CSS fallback */ }
    }
    // Prefer landscape lock when available (phones); ignore failures.
    try {
      screen.orientation?.lock?.("portrait").catch?.(() => {});
    } catch (_) {}
  }

  function exitFs() {
    fsMode = false;
    document.body.classList.remove("demo-fs");
    wrap.classList.remove("is-fs");
    if (fsControls?.btn) fsControls.btn.textContent = "На весь экран";
    syncSticks();
    if (isNativeFs()) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) {
        try {
          const p = exit.call(document);
          if (p && typeof p.catch === "function") p.catch(() => {});
        } catch (_) {}
      }
    }
    try {
      screen.orientation?.unlock?.();
    } catch (_) {}
  }

  function toggleFs() {
    if (fsMode) exitFs();
    else enterFs();
  }

  // Start when Demo tab opened first time
  const demoTab = document.querySelector('.tab[data-tab="demo"]');
  if (demoTab) {
    demoTab.addEventListener("click", () => {
      if (!handle) start();
    }, { once: false });
  }
  // If landed on #demo
  if (location.hash === "#demo") start();
  document.getElementById("demo-restart")?.addEventListener("click", () => {
    if (handle) handle.restart();
    else start();
  });
  fsControls?.btn?.addEventListener("click", () => {
    if (!handle) start();
    toggleFs();
  });
  fsControls?.exit?.addEventListener("click", () => exitFs());

  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && fsMode) {
      // Native FS closed via system UI — keep CSS FS or fully exit?
      // Exit play mode entirely so sticks hide again.
      exitFs();
    }
  });
  document.addEventListener("webkitfullscreenchange", () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && fsMode) exitFs();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && fsMode && !isNativeFs()) exitFs();
  });
}

function resetAll() {
  if (!confirm("Сбросить все статусы в «Черновик»?")) return;
  state = defaultState();
  save();
  location.reload();
}
function exportJSON() {
  const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), games: state }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "portfolio-status.json";
  a.click();
}
function exportReport() {
  const rows = GAMES.map(g => {
    const s = state[g.slug];
    return `<tr><td>${g.id}</td><td>${g.name}</td><td>${STATUS_RU[s.designStatus]}</td><td>${s.gate}</td><td>${progress(s)}%</td><td>${(s.note||"").replace(/</g,"&lt;")}</td></tr>`;
  }).join("");
  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8"/><title>Отчёт портфеля</title>
  <style>body{font-family:Segoe UI,sans-serif;padding:24px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:8px;text-align:left}th{background:#f3f3f3}</style></head>
  <body><h1>Отчёт портфеля Яндекс Игры</h1><p>${new Date().toLocaleString()}</p>
  <table><thead><tr><th>#</th><th>Игра</th><th>Статус дизайна</th><th>Гейт</th><th>%</th><th>Заметки</th></tr></thead><tbody>${rows}</tbody></table>
  </body></html>`;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  a.download = "portfolio-report.html";
  a.click();
}

window.resetAll = resetAll;
window.exportJSON = exportJSON;
window.exportReport = exportReport;

document.addEventListener("DOMContentLoaded", () => {
  paintStatusPills();
  renderStats();
  setupFilters();
  setupTabs();
  setupManage();
  setupMobileNav();
  setupDemo();
});
