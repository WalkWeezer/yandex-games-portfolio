
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

function setupDemo() {
  const canvas = document.getElementById("feel-demo");
  if (!canvas || !window.FeelDemo || !window.CURRENT_SLUG) return;
  const hud = document.getElementById("demo-hint");
  let handle = null;
  function start() {
    if (handle) handle.destroy();
    handle = window.FeelDemo.mount(window.CURRENT_SLUG, canvas, hud);
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
  setupDemo();
});
