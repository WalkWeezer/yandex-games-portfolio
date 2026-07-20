/**
 * Работник месяца — каталог спрайтов (всё, что грузит feel-демо + pipeline gate).
 */
(function () {
  const ART = "../../games/deadline-escape/refs/art/";
  const SP = "../../games/deadline-escape/refs/sprites/";
  const FR = SP + "frames/";
  const ARCH = "../../games/deadline-escape/archive/2026-07-18-pipeline-v1-reset/sprites/";
  const SEED = "style-seed-hero.png";
  const BOARD = "style-seed-hero-board.png";
  const APPROVED_FILE = "style-seed-hero.APPROVED.json";
  const REJECTED_FILE = "style-seed-hero.REJECTED.json";
  const LS_KEY = "deadline-escape.style-seed";
  const BUST = "w250721i";

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
    const src = `${root}${rel}?v=${BUST}`;
    return mediaCard(src, caption || rel, { large, zoom: true, fullSrc: src });
  }
  function gif(name, caption, large) {
    const src = `${SP}gifs/${name}?v=${BUST}`;
    return mediaCard(src, caption || name, { large, zoom: true, fullSrc: src });
  }
  function pngRow(items, base) {
    return `<div class="sp-demo-row">${items.map((it) => png(it[0], it[1], it[2], base)).join("")}</div>`;
  }
  function gifRow(items) {
    return `<div class="sp-demo-row">${items.map((it) => gif(it[0], it[1], it[2])).join("")}</div>`;
  }
  function card(title, desc, body) {
    return `<div class="sp-card"><h3>${title}</h3><p class="sp-desc">${desc}</p>${body}</div>`;
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
      id: "hero",
      group: "Feel demo",
      nav: "Герой",
      html: () =>
        card(
          "Герой · frames + sheets + GIF",
          "Грузит <code>ensureArt</code>: idle / walk 6f / caught. Носитель стиля.",
          pngRow([
            ["char_hero_idle_sheet.png", "idle sheet"],
            ["char_hero_walk_sheet.png", "walk sheet"],
            ["char_hero_caught_sheet.png", "caught sheet"],
            ["char_hero_sheet.png", "legacy sheet"],
          ]) +
            gifRow([
              ["char_hero_idle.gif", "idle S"],
              ["char_hero_walk.gif", "walk S"],
              ["char_hero_idle_turn.gif", "idle turn"],
              ["char_hero_caught.gif", "caught"],
            ]) +
            pngRow([
              ["frames/char_hero/idle_s.png", "idle_s"],
              ["frames/char_hero/walk_s_0.png", "walk_s_0"],
              ["frames/char_hero_sheet/s.png", "sheet S"],
              ["frames/char_hero_sheet/e.png", "sheet E"],
            ])
        ),
    },
    {
      id: "floors",
      group: "Feel demo",
      nav: "Пол / fog",
      html: () =>
        card(
          "Пол и туман",
          "Клетки play: <code>tile_floor_a/b</code>. Открытый fog — <code>tile_fog</code> (мягкий FoW поверх).",
          pngRow([
            ["frames/tile_floor_a.png", "floor_a"],
            ["frames/tile_floor_b.png", "floor_b"],
            ["frames/tile_fog.png", "fog"],
          ])
        ),
    },
    {
      id: "walls",
      group: "Feel demo",
      nav: "Стены / окна",
      html: () =>
        card(
          "Каркас · полосы + цельные L/U (одна заливка)",
          "Прямые: <code>build_wall_break_set.py</code>. Углы L/U: <code>build_solid_lu_tiles.py</code> — " +
            "руки из прямых полос (стык без щели). Окно только на прямой стене ребра (50%), не на углах.",
          pngRow([
            ["ai-set-wall-n.png", "AI master wall", true, ART],
            ["ai-set-window-n.png", "AI master window", true, ART],
            ["ai-set-corner-nw.png", "L master", true, ART],
            ["wall_lu_solid_preview.png", "L/U preview", true],
          ]) +
            pngRow([
              ["frames/tile_wall_n.png", "wall N"],
              ["frames/tile_wall_s.png", "wall S"],
              ["frames/tile_wall_e.png", "wall E"],
              ["frames/tile_wall_w.png", "wall W"],
              ["frames/tile_window_n.png", "window N"],
              ["frames/tile_window_e.png", "window E"],
            ]) +
            pngRow([
              ["frames/tile_wall_nw.png", "угол nw"],
              ["frames/tile_wall_ne.png", "угол ne"],
              ["frames/tile_wall_nwe.png", "U nwe"],
              ["frames/tile_wall_stub_nw.png", "stub nw"],
            ])
        ),
    },
    {
      id: "props",
      group: "Feel demo",
      nav: "Пропы",
      html: () =>
        card(
          "Мебель и пропы play",
          "Отдельные пропы на play. Композиты стена+проп архивированы: <code>archive/2026-07-20-wall-prop-composites/</code>.",
          pngRow([
            ["frames/tile_desk.png", "desk"],
            ["frames/tile_desk2.png", "desk2"],
            ["frames/tile_plant.png", "plant"],
            ["frames/tile_cooler.png", "cooler"],
            ["frames/tile_cabinet.png", "cabinet"],
            ["frames/tile_printer.png", "printer"],
            ["frames/tile_trash.png", "trash"],
          ])
        ),
    },
    {
      id: "pickups",
      group: "Feel demo",
      nav: "Пикапы",
      html: () =>
        card(
          "Пикапы",
          "<code>pu_coin</code> · <code>pu_coffee</code> · <code>pu_badge</code>.",
          pngRow([
            ["frames/pu_coin.png", "coin"],
            ["frames/pu_coffee.png", "coffee"],
            ["frames/pu_badge.png", "badge"],
          ])
        ),
    },
    {
      id: "vfx",
      group: "Feel demo",
      nav: "VFX",
      html: () =>
        card(
          "VFX",
          "Щит, пар, неуязвимость, near-miss, репорт, рывок, slam, конфетти. " +
            "Нарезка с <code>vfx_sheet.png</code> сеткой 4×2 (не column-blobs).",
          pngRow([
            ["frames/vfx_shield.png", "shield"],
            ["frames/vfx_steam.png", "steam"],
            ["frames/vfx_invuln.png", "invuln"],
            ["frames/vfx_near_miss.png", "near_miss"],
            ["frames/vfx_report.png", "report"],
            ["frames/vfx_dash.png", "dash"],
            ["frames/vfx_slam.png", "slam"],
            ["frames/vfx_confetti.png", "confetti"],
          ]) +
            pngRow([["vfx_recut_preview.png", "4×2 preview", true]])
        ),
    },
    {
      id: "npcs",
      group: "Feel demo",
      nav: "NPC / боссы",
      html: () =>
        card(
          "NPC · в архиве pipeline reset",
          "Feel всё ещё запрашивает <code>frames/boss_*_sheet</code> и colleague — файлы лежат в архиве. " +
            "Пока показываем архивные sheets (не SoT для новых правок).",
          pngRow(
            [
              ["alpha/boss_hr_sheet.png", "HR"],
              ["alpha/boss_director_sheet.png", "Director"],
              ["alpha/boss_guard_sheet.png", "Guard"],
              ["alpha/boss_looker_sheet.png", "Looker"],
              ["alpha/char_colleague_sheet.png", "Colleague"],
              ["alpha/boss_intern_sheet.png", "Intern"],
            ],
            ARCH
          ) +
            pngRow(
              [
                ["alpha/boss_meeting_sheet.png", "Meeting"],
                ["alpha/boss_account_sheet.png", "Account"],
                ["alpha/boss_kpi_sheet.png", "KPI"],
                ["alpha/boss_client_sheet.png", "Client"],
                ["alpha/boss_it_sheet.png", "IT"],
                ["alpha/boss_secretary_sheet.png", "Secretary"],
                ["alpha/boss_urgent_sheet.png", "Urgent"],
              ],
              ARCH
            )
        ),
    },
    {
      id: "archive",
      group: "Pipeline",
      nav: "Архив",
      html: () => `
        <div class="sp-card">
          <h3>Архив наработок</h3>
          <p class="sp-desc">
            Всё, что не style-seed / ГГ carrier / актуальный env, перенесено в архив.
            <br/>• <code>archive/2026-07-18-pipeline-v1-reset/</code> — art, boss sheets, HR, концепты, chroma…
            <br/>• <code>archive/2026-07-20-wall-prop-composites/</code> — стена+проп композиты (N+plant и т.п.)
            <br/>• <code>archive/2026-07-20-broken-lu-corners/</code> — L/U «перекрестья» (сняты с каталога)
            <br/>Не использовать как SoT.
          </p>
        </div>
      `,
    },
  ];

  function mount(root) {
    root.innerHTML = `
      <p class="sp-intro">
        <strong>ART_STATUS = PIPELINE_V1</strong> · каталог = всё, что грузит feel-демо + gate.
        Стены: полосы + цельные L/U <code>?v=${BUST}</code>.
      </p>
      <div class="sp-layout">
        <nav class="sp-nav" aria-label="Sprites"></nav>
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
