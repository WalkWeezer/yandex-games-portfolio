/**
 * Работник месяца — Pipeline v1 sprites UI (style-seed approve gate).
 * Legacy roster sheets live in archive/2026-07-18-pipeline-v1-reset/.
 */
(function () {
  const ART = "../../games/deadline-escape/refs/art/";
  const SP = "../../games/deadline-escape/refs/sprites/";
  const SEED = "style-seed-hero.png";
  const BOARD = "style-seed-hero-board.png";
  const APPROVED_FILE = "style-seed-hero.APPROVED.json";
  const REJECTED_FILE = "style-seed-hero.REJECTED.json";
  const LS_KEY = "deadline-escape.style-seed";

  const CHECKER = "background:repeating-conic-gradient(#2a3340 0% 25%, #1a222c 0% 50%) 50%/12px 12px";

  function mediaCard(src, caption, opts) {
    const o = opts || {};
    const cls = ["sp-demo", o.large ? "sp-demo-lg" : "", o.zoom ? "sp-demo-zoom" : ""].filter(Boolean).join(" ");
    const full = o.fullSrc || src;
    const zoomAttr = o.zoom
      ? ` role="button" tabindex="0" data-sp-zoom="${full}" data-sp-caption="${(caption || "").replace(/"/g, "&quot;")}" title="Открыть в полном размере"`
      : "";
    return `<div class="${cls}"${zoomAttr}><img src="${src}" alt="${caption || ""}" loading="lazy" style="${CHECKER}"/><span>${caption || ""}</span></div>`;
  }
  function png(rel, caption, large, base) {
    const root = base || SP;
    const src = `${root}${rel}?v=seed2`;
    return mediaCard(src, caption || rel, { large, zoom: true, fullSrc: src });
  }
  function gif(name, caption, large) {
    const src = `${SP}gifs/${name}?v=seed2`;
    return mediaCard(src, caption || name, { large, zoom: true, fullSrc: src });
  }
  function pngRow(items, base) {
    return `<div class="sp-demo-row">${items.map((it) => png(it[0], it[1], it[2], base)).join("")}</div>`;
  }
  function gifRow(items) {
    return `<div class="sp-demo-row">${items.map((it) => gif(it[0], it[1], it[2])).join("")}</div>`;
  }

  function ensureLightbox() {
    let el = document.getElementById("sp-lightbox");
    if (el) return el;
    el = document.createElement("div");
    el.id = "sp-lightbox";
    el.className = "sp-lightbox";
    el.hidden = true;
    el.innerHTML = `
      <button type="button" class="sp-lightbox-close" aria-label="Закрыть">×</button>
      <figure class="sp-lightbox-figure">
        <img alt=""/>
        <figcaption></figcaption>
      </figure>
    `;
    document.body.appendChild(el);
    const close = () => {
      el.hidden = true;
      document.body.classList.remove("sp-lightbox-open");
    };
    el.addEventListener("click", (e) => {
      if (e.target === el || e.target.classList.contains("sp-lightbox-close")) close();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !el.hidden) close();
    });
    el._close = close;
    el._open = (src, caption) => {
      const img = el.querySelector("img");
      const cap = el.querySelector("figcaption");
      img.src = src;
      img.alt = caption || "";
      cap.textContent = caption || "";
      el.hidden = false;
      document.body.classList.add("sp-lightbox-open");
    };
    return el;
  }

  function bindZoom(root) {
    const box = ensureLightbox();
    root.querySelectorAll("[data-sp-zoom]").forEach((node) => {
      const open = () => box._open(node.getAttribute("data-sp-zoom"), node.getAttribute("data-sp-caption") || "");
      node.addEventListener("click", open);
      node.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });
  }

  function readLocal() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "null");
    } catch {
      return null;
    }
  }

  function writeLocal(status, note) {
    const payload = {
      asset: SEED,
      status,
      note: note || "",
      at: new Date().toISOString(),
    };
    localStorage.setItem(LS_KEY, JSON.stringify(payload));
    return payload;
  }

  function downloadJson(filename, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2) + "\n"], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  }

  async function saveJsonToDisk(filename, obj) {
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: filename,
          types: [{ description: "JSON", accept: { "application/json": [".json"] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(obj, null, 2) + "\n");
        await writable.close();
        return "picker";
      } catch (err) {
        if (err && err.name === "AbortError") return "abort";
      }
    }
    downloadJson(filename, obj);
    return "download";
  }

  async function fetchMarker() {
    const tries = [
      [APPROVED_FILE, "APPROVED"],
      [REJECTED_FILE, "REJECTED"],
    ];
    for (const [file, status] of tries) {
      try {
        const res = await fetch(ART + file + "?t=" + Date.now(), { cache: "no-store" });
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          return { status, file, data };
        }
      } catch {
        /* file:// or missing */
      }
    }
    return null;
  }

  function statusChip(status) {
    if (status === "APPROVED") return `<span class="sp-chip ok">APPROVED</span>`;
    if (status === "REJECTED") return `<span class="sp-chip warn">REJECTED</span>`;
    return `<span class="sp-chip todo">PENDING</span>`;
  }

  function gateHtml(state) {
    const status = state?.status || "PENDING";
    const note = state?.note || state?.data?.note || "";
    const at = state?.at || state?.data?.at || "";
    return `
      <div class="sp-card sp-gate">
        <h3>P1 · Style seed — утверждение</h3>
        <div class="sp-meta">
          ${statusChip(status)}
          <span class="sp-chip">PIPELINE_V1</span>
          <span class="sp-chip">asset: ${SEED}</span>
        </div>
        <p class="sp-desc">
          Якорь стиля игры (ГГ idle_s). Клик по картинке/GIF — полный размер.
          Архив: <code>archive/2026-07-18-pipeline-v1-reset/</code>. Док: <code>SPRITE_PIPELINE.md</code>.
        </p>
        <div class="sp-compare">
          ${png(SEED, "STYLE SEED · клик = full size", true, ART)}
          ${gif("char_hero_idle.gif", "demo idle S", true)}
          ${gif("char_hero_walk.gif", "demo walk S 6f", true)}
        </div>
        <div class="sp-compare sp-compare-sub">
          ${png(BOARD, "seed + idle sheet", true, ART)}
          ${gif("char_hero_idle_turn.gif", "idle S→E→N→W", true)}
          ${gif("char_hero_walk_s.gif", "walk S loop", true)}
        </div>
        <div class="sp-approve-bar" id="sp-approve-bar">
          <button type="button" class="sp-btn sp-btn-ok" id="sp-approve" ${status === "APPROVED" ? "disabled" : ""}>APPROVED</button>
          <button type="button" class="sp-btn sp-btn-no" id="sp-reject" ${status === "REJECTED" ? "disabled" : ""}>Reject</button>
        </div>
        <label class="sp-note-label" for="sp-note">Комментарий (для Reject — что не так)</label>
        <textarea id="sp-note" class="sp-note" rows="2" placeholder="например: слишком детально / камера / пропорции…">${note ? String(note).replace(/</g, "&lt;") : ""}</textarea>
        <p class="sp-desc" id="sp-approve-msg">${
          status === "APPROVED"
            ? `Утверждено${at ? " · " + at : ""}. Файл-маркер: <code>refs/art/${APPROVED_FILE}</code>`
            : status === "REJECTED"
              ? `Отклонено${at ? " · " + at : ""}. После правок seed — снова APPROVED.`
              : `Нажми APPROVED — сохранится маркер <code>${APPROVED_FILE}</code> в <code>refs/art/</code> (диалог сохранения или Download).`
        }</p>
      </div>
      <div class="sp-card">
        <h3>Активно сейчас</h3>
        <p class="sp-desc">Только style-seed + sheets ГГ (носитель стиля). Боссы/HR/концепты — в архиве.</p>
        ${pngRow([["char_hero_idle_sheet.png", "ГГ idle sheet"], ["char_hero_walk_sheet.png", "ГГ walk sheet"]], SP)}
      </div>
    `;
  }

  async function resolveState() {
    const marker = await fetchMarker();
    if (marker) return { status: marker.status, at: marker.data?.at, note: marker.data?.note, data: marker.data, source: "file" };
    const local = readLocal();
    if (local?.status) return { ...local, source: "local" };
    return { status: "PENDING", source: "none" };
  }

  function bindGate(panel, state) {
    const msg = panel.querySelector("#sp-approve-msg");
    const noteEl = panel.querySelector("#sp-note");
    const approveBtn = panel.querySelector("#sp-approve");
    const rejectBtn = panel.querySelector("#sp-reject");

    async function decide(status) {
      const note = (noteEl?.value || "").trim();
      if (status === "REJECTED" && !note) {
        msg.innerHTML = "Для Reject напиши короткий комментарий — что не так со seed.";
        noteEl?.focus();
        return;
      }
      const payload = writeLocal(status, note);
      payload.pipeline = "SPRITE_PIPELINE.md";
      payload.phase = "P1";
      const filename = status === "APPROVED" ? APPROVED_FILE : REJECTED_FILE;
      const how = await saveJsonToDisk(filename, payload);
      if (how === "abort") {
        msg.textContent = "Сохранение отменено.";
        return;
      }
      panel.innerHTML = gateHtml(payload);
      bindGate(panel, payload);
      bindZoom(panel);
      const m = panel.querySelector("#sp-approve-msg");
      if (how === "picker") {
        m.innerHTML = `Сохранено. Если файл не в <code>refs/art/</code> — переложи туда <code>${filename}</code>.`;
      } else {
        m.innerHTML = `Скачан <code>${filename}</code> — положи его в <code>games/deadline-escape/refs/art/</code> (рядом с seed). UI уже показывает ${status}.`;
      }
    }

    approveBtn?.addEventListener("click", () => decide("APPROVED"));
    rejectBtn?.addEventListener("click", () => decide("REJECTED"));
  }

  const SECTIONS = [
    {
      id: "gate",
      group: "Pipeline",
      nav: "Style seed",
      html: () => gateHtml({ status: "PENDING" }),
    },
    {
      id: "archive",
      group: "Pipeline",
      nav: "Архив",
      html: () => `
        <div class="sp-card">
          <h3>Архив наработок</h3>
          <p class="sp-desc">
            Всё, что не style-seed / ГГ carrier, перенесено в
            <code>games/deadline-escape/archive/2026-07-18-pipeline-v1-reset/</code>
            (art, boss sheets, HR, концепты, chroma…). Не использовать как SoT.
          </p>
        </div>
      `,
    },
  ];

  function mount(root) {
    root.innerHTML = `
      <p class="sp-intro">
        <strong>ART_STATUS = PIPELINE_V1</strong> · seed → strip → normalize → GIF QA.
        Сейчас открыт только gate утверждения style-seed.
      </p>
      <div class="sp-layout">
        <nav class="sp-nav" aria-label="Pipeline"></nav>
        <div class="sp-panel"></div>
      </div>
    `;
    const nav = root.querySelector(".sp-nav");
    const panel = root.querySelector(".sp-panel");
    let lastGroup = null;
    SECTIONS.forEach((s) => {
      if (s.group !== lastGroup) {
        const g = document.createElement("div");
        g.className = "sp-nav-group";
        g.textContent = s.group;
        nav.appendChild(g);
        lastGroup = s.group;
      }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = s.nav;
      btn.dataset.id = s.id;
      btn.addEventListener("click", () => show(s.id));
      nav.appendChild(btn);
    });

    async function show(id) {
      const s = SECTIONS.find((x) => x.id === id) || SECTIONS[0];
      nav.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.id === s.id));
      if (s.id === "gate") {
        const state = await resolveState();
        panel.innerHTML = gateHtml(state);
        bindGate(panel, state);
        bindZoom(panel);
      } else {
        panel.innerHTML = s.html();
        bindZoom(panel);
      }
    }
    show("gate");
  }

  function boot() {
    const el = document.getElementById("sp-app");
    if (el) mount(el);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
