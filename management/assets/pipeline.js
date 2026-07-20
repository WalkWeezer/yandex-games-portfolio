/**
 * Interactive design pipeline — stages practiced at least once
 * by deadline-escape and/or legends-of-the-pitch.
 */
(function () {
  const GAMES = {
    deadline: {
      id: "deadline",
      slug: "deadline-escape",
      name: "Работник месяца",
      short: "Работник",
      status: "REVIEW",
      href: "projects/deadline-escape.html",
    },
    legends: {
      id: "legends",
      slug: "legends-of-the-pitch",
      name: "Легенды Поля",
      short: "Легенды",
      status: "DRAFT",
      href: "projects/legends-of-the-pitch.html",
    },
  };

  /** @type {{id:string, gate:string, title:string, summary:string, why:string, do:string[], dont:string[], artifacts: {label:string, path:string}[], links: {label:string, href:string}[], games: Record<string, {state:'done'|'partial'|'none', note:string}>}[]} */
  const STAGES = [
    {
      id: "concept",
      gate: "W0",
      title: "Концепт",
      summary: "One-liner, сегмент ЦА, сравнение с рефами — без арта и кода.",
      why: "Фиксирует «зачем эта игра в портфеле», пока ещё дёшево ошибаться.",
      do: [
        "Одна фраза фантазии + жанр",
        "Для кого и чем отличается от соседей по портфелю",
        "Открытые решения, не простыня механик",
      ],
      dont: ["Арт-фабрика", "SDK/стор", "Production src/"],
      artifacts: [
        { label: "Карточка концепта", path: "docs/concepts/NN-slug.md" },
      ],
      links: [
        { label: "Концепт Работника", href: "../docs/concepts/02-deadline-escape.md" },
        { label: "Концепт Легенд", href: "../docs/concepts/04-legends-of-the-pitch.md" },
      ],
      games: {
        deadline: { state: "done", note: "docs/concepts/02-deadline-escape.md — grid dodge, REVIEW-wave" },
        legends: { state: "done", note: "docs/concepts/04-legends-of-the-pitch.md — CCG × autochess" },
      },
    },
    {
      id: "f0",
      gate: "F0",
      title: "Вектор",
      summary: "Core verb, пространство, win/fail, анти-вектор. Art factory запрещена.",
      why: "Без вектора агент оптимизирует PNG и чеклисты вместо ощущения раунда.",
      do: [
        "Таблица: verb / space / win / fail / anti",
        "Управление в одном предложении",
        "Зафиксировать в DESIGN (Pass-2) или STATUS",
      ],
      dont: ["Скины и босс-портреты", "Мета-экраны раньше feel", "Смена жанра mid-flight"],
      artifacts: [
        { label: "Pass-2 / feel lock", path: "games/<slug>/docs/DESIGN.md" },
        { label: "STATUS F0", path: "games/<slug>/docs/STATUS.md" },
      ],
      links: [
        { label: "Методология §3", href: "../docs/METHODOLOGY.md" },
        { label: "Pass-2 Легенд", href: "projects/legends-of-the-pitch.html#classic" },
      ],
      games: {
        deadline: { state: "done", note: "STATUS: F0 ✅ · grid dodge · 09:00→18:00" },
        legends: { state: "done", note: "Pass-2: собери комбо → расставь → смотри матч" },
      },
    },
    {
      id: "docs",
      gate: "D1",
      title: "Диздоки",
      summary: "DESIGN.md (видение) + DESIGN_LLM.md (контракты для агентов).",
      why: "Один текст для людей, один — жёсткая спека. Без dual-truth с демкой.",
      do: [
        "Classic GDD: pitch, loop, скоуп",
        "LLM-спека: системы, AC, UI-экраны",
        "Синхронизировать с фактом демки, не с фантазией",
      ],
      dont: ["Писать target, который врёт про runtime", "Код src/ «заодно»"],
      artifacts: [
        { label: "DESIGN.md", path: "games/<slug>/docs/DESIGN.md" },
        { label: "DESIGN_LLM.md", path: "games/<slug>/docs/DESIGN_LLM.md" },
      ],
      links: [
        { label: "Работник · Classic", href: "projects/deadline-escape.html#classic" },
        { label: "Легенды · LLM", href: "projects/legends-of-the-pitch.html#llm" },
      ],
      games: {
        deadline: { state: "done", note: "DESIGN + DESIGN_LLM + GAP_VS_CHAS_PIK, grid-canon sync" },
        legends: { state: "done", note: "Полный GDD + толстая LLM-спека, статус DRAFT" },
      },
    },
    {
      id: "prompts",
      gate: "D1",
      title: "Промпты",
      summary: "Пакет prompts/* под арт/UI/уровни/код — после вектора, не вместо него.",
      why: "Промпт без вектора смещает DoD. Пакет обновляют после sync с демкой.",
      do: [
        "ART / SPRITE_ANIM / UI / LEVEL / CODE_AGENT",
        "Переписать, если демка сменила канон",
        "Не добавлять цели вне текущего гейта",
      ],
      dont: ["Новый промпт, меняющий DoD гейта", "15 скинов до F1"],
      artifacts: [{ label: "prompts/*.md", path: "games/<slug>/prompts/" }],
      links: [
        { label: "Промпты Работника", href: "projects/deadline-escape.html#prompts" },
        { label: "Промпты Легенд", href: "projects/legends-of-the-pitch.html#prompts" },
      ],
      games: {
        deadline: { state: "done", note: "Переписаны под grid feel; старый пакет в archive" },
        legends: { state: "done", note: "Полный набор prompts/*" },
      },
    },
    {
      id: "refs",
      gate: "D2",
      title: "Референсы",
      summary: "Визуальный DoR: key-art / wireframe / layout / sheet — или vibe-seed набор.",
      why: "Картинки калибруют тон. Не заменяют feel-демку.",
      do: [
        "Классический квартет ИЛИ осознанный vibe/seed набор",
        "Вкладка «Референсы» на странице проекта",
        "Архивировать арт, который врёт канону",
      ],
      dont: ["Считать PNG = CONFIRM", "Держать dual-truth refs рядом с SoT"],
      artifacts: [
        { label: "refs/art|ui|levels|sprites", path: "games/<slug>/refs/" },
        { label: "REFS.md", path: "games/<slug>/docs/REFS.md" },
      ],
      links: [
        { label: "Refs Работника", href: "projects/deadline-escape.html#refs" },
        { label: "Refs Легенд", href: "projects/legends-of-the-pitch.html#refs" },
      ],
      games: {
        deadline: { state: "partial", note: "Vibe/seed (style-seed, layout-feel); classic key-art ушёл в archive после pipeline reset" },
        legends: { state: "done", note: "Classic DoR: key-art + wireframe + layout + sheet ✅" },
      },
    },
    {
      id: "f1",
      gate: "F1",
      title: "Feel-демка",
      summary: "Играбельное ядро фигурами на вкладке «Демка». Ответ на «хочу ещё раз?»",
      why: "Картинки не отвечают: как управлять, сколько держит ран, зачем рестарт.",
      do: [
        "30–90с core verb, portrait",
        "Win/fail читаются без простыни текста",
        "Код в management/demos/, не в games/*/src/",
      ],
      dont: ["Скины вместо hitbox/timing", "Production Phaser src/"],
      artifacts: [
        { label: "FEEL_DEMOS[slug]", path: "management/demos/*.js" },
        { label: "Вкладка Демка", path: "management/projects/<slug>.html#demo" },
      ],
      links: [
        { label: "Демка Работника", href: "projects/deadline-escape.html#demo" },
        { label: "Демка Легенд", href: "projects/legends-of-the-pitch.html#demo" },
        { label: "Универсальный промпт", href: "demos/PROMPT_FEEL_DEMO_UNIFIED.md" },
      ],
      games: {
        deadline: { state: "done", note: "STATUS F1 ✅ · сетка 7×9, день≈60с, fullscreen + стики" },
        legends: { state: "missing", note: "Демка удалена · пиши с нуля: demos/PROMPT_LEGENDS_PITCH_SCRATCH.md" },
      },
    },
    {
      id: "deepen",
      gate: "F1+",
      title: "Углубление feel",
      summary: "Слои L0–L5: loop → угрозы → кривая → гаджеты → dev-tools. Метод Работника.",
      why: "Тонкая демка не держит playtest. Углубляем итерациями, не мега-промптом.",
      do: [
        "Один слой за сессию (если не сказано «прогони всё»)",
        "Лимиты плотности и ускорения числами",
        "Dev: god + счётчик «убило бы» + старт-этап",
      ],
      dont: ["Прыгать в мета/wireframe до читаемого loop", "Разгон ×2.5 внутри рана"],
      artifacts: [
        { label: "PROMPT_DEEPEN_FEEL_DEMO", path: "management/demos/PROMPT_DEEPEN_FEEL_DEMO.md" },
      ],
      links: [
        { label: "Метод углубления", href: "demos/PROMPT_DEEPEN_FEEL_DEMO.md" },
        { label: "Демка Работника", href: "projects/deadline-escape.html#demo" },
      ],
      games: {
        deadline: { state: "done", note: "12 типов боссов, фазы дня, кофе/бейдж, Dev∞, рост поля" },
        legends: { state: "partial", note: "Глубокий F1 (комбо осей, merge, матч); без полного L5-пакета как у Работника" },
      },
    },
    {
      id: "wireframe",
      gate: "F1+L6",
      title: "Wireframe UI",
      summary: "Иерархия экранов: Hub / Run / Result / Shop / Daily — до полировки UI.",
      why: "Мета и CTA рекламы видны на блоках, не на красивом мокапе.",
      do: [
        "Экраны минимум: Menu, Hub, Run HUD, Fail, Result, Shop",
        "Отдельная вкладка или PNG + спека в DESIGN_LLM",
        "Daily с хаба, не модалка перед каждым раном",
      ],
      dont: ["Финишный UI-skin до сверки иерархии"],
      artifacts: [
        { label: "wireframes.js / вкладка", path: "management/demos/*-wireframes.js" },
        { label: "wireframe-main.png", path: "games/<slug>/refs/ui/" },
      ],
      links: [
        { label: "Wireframe Работника", href: "projects/deadline-escape.html#wireframe" },
        { label: "UI в LLM Легенд", href: "projects/legends-of-the-pitch.html#llm" },
      ],
      games: {
        deadline: { state: "done", note: "Интерактивная вкладка Wireframe UI (экраны + компоненты)" },
        legends: { state: "partial", note: "wireframe-main.png + экраны в DESIGN_LLM; отдельной вкладки нет" },
      },
    },
    {
      id: "sprites",
      gate: "ART",
      title: "Спрайты / стиль",
      summary: "Style-seed → strips → GIF QA. Или classic sheet-main как калибр.",
      why: "Арт после читаемого feel. Пайплайн Работника — эталон порядка.",
      do: [
        "Зафиксировать style bible / seed",
        "Human APPROVED на seed (агент не APPROVED сам)",
        "Normalize → GIF QA; без warp/graft карусели",
      ],
      dont: ["15 боссов до APPROVED seed", "Менять hitbox «заодно» со спрайтом"],
      artifacts: [
        { label: "SPRITE_PIPELINE.md", path: "games/deadline-escape/docs/SPRITE_PIPELINE.md" },
        { label: "sheet-main / seed", path: "games/<slug>/refs/" },
      ],
      links: [
        { label: "Спрайты Работника", href: "projects/deadline-escape.html#sprites" },
        { label: "Пайплайн v1", href: "../games/deadline-escape/docs/SPRITE_PIPELINE.md" },
      ],
      games: {
        deadline: { state: "partial", note: "PIPELINE_V1 · P1 seed на сайте; ждёт human APPROVED → P2+" },
        legends: { state: "partial", note: "refs/sprites/sheet-main.png как DoR; отдельного pipeline-таба нет" },
      },
    },
    {
      id: "sfx",
      gate: "SFX",
      title: "SFX",
      summary: "Процедурные звуки + loop; превью в каталоге, интеграция в демку.",
      why: "Звук держит ритм рана. Проходили на Работнике до CONFIRM.",
      do: [
        "Каталог превью на вкладке SFX",
        "Шаги / fail / win / pickup / ambience",
        "Без тяжёлых wav в репо, если хватает Web Audio",
      ],
      dont: ["Глушить feel-работу сессией на банк звуков"],
      artifacts: [
        { label: "deadline-sfx*.js", path: "management/demos/deadline-sfx.js" },
      ],
      links: [
        { label: "SFX Работника", href: "projects/deadline-escape.html#sfx" },
      ],
      games: {
        deadline: { state: "done", note: "Вкладка SFX + office_loop в демке" },
        legends: { state: "none", note: "Ещё не заводили" },
      },
    },
    {
      id: "review",
      gate: "REV",
      title: "Ревью дизайна",
      summary: "Статус REVIEW: пакет готов к человеческому playtest и решению продюсера.",
      why: "Агент не повышает до CONFIRMED сам. REVIEW = «смотри и играй».",
      do: [
        "STATUS / Manage → На ревью",
        "Чеклист перед CONFIRM без галочек-фантазий",
        "Playtest на телефоне (fullscreen демка)",
      ],
      dont: ["Агент ставит CONFIRMED", "CONFIRM за «много картинок»"],
      artifacts: [
        { label: "STATUS.md", path: "games/<slug>/docs/STATUS.md" },
        { label: "Manage tab", path: "management/projects/<slug>.html#manage" },
      ],
      links: [
        { label: "STATUS Работника", href: "../games/deadline-escape/docs/STATUS.md" },
        { label: "Управление Работника", href: "projects/deadline-escape.html#manage" },
      ],
      games: {
        deadline: { state: "done", note: "designStatus = REVIEW · ждёт human playtest F1→F2" },
        legends: { state: "none", note: "Пока DRAFT" },
      },
    },
  ];

  const LOCKED = [
    {
      id: "f2",
      gate: "F2",
      title: "Freeze loop",
      note: "§Feel + §Retention зафиксированы. Ни одна игра ещё не прошла human CONFIRM после F1.",
    },
    {
      id: "confirm",
      gate: "OK",
      title: "CONFIRMED",
      note: "Продюсер подтверждает дизайн. Только после этого можно src/.",
    },
    {
      id: "g0",
      gate: "G0+",
      title: "Production G0–G5",
      note: "Bootstrap → slice → content → meta → SDK → store. В портфеле ещё не стартовали.",
    },
  ];

  const STATE_RU = { done: "Пройден", partial: "Частично", none: "Не брали" };

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function gameStateClass(state) {
    return "pl-pill pl-pill--" + state;
  }

  function renderTrack(root) {
    const track = el("div", "pl-track");
    track.setAttribute("role", "list");
    STAGES.forEach((stage, i) => {
      const btn = el("button", "pl-node");
      btn.type = "button";
      btn.setAttribute("role", "listitem");
      btn.dataset.stage = stage.id;
      btn.innerHTML = `
        <span class="pl-node-gate">${stage.gate}</span>
        <span class="pl-node-title">${stage.title}</span>
        <span class="pl-node-dots" aria-hidden="true">
          <i class="dot ${stage.games.deadline.state}" title="Работник"></i>
          <i class="dot ${stage.games.legends.state}" title="Легенды"></i>
        </span>
      `;
      if (i === 0) btn.classList.add("active");
      track.appendChild(btn);
    });

    LOCKED.forEach((L) => {
      const node = el("div", "pl-node pl-node--locked");
      node.innerHTML = `
        <span class="pl-node-gate">${L.gate}</span>
        <span class="pl-node-title">${L.title}</span>
        <span class="pl-node-lock">ещё не проходили</span>
      `;
      node.title = L.note;
      track.appendChild(node);
    });

    root.appendChild(track);
    return track;
  }

  function renderCompare(root) {
    const wrap = el("div", "pl-compare");
    Object.values(GAMES).forEach((g) => {
      const card = el("article", "pl-compare-card");
      const done = STAGES.filter((s) => s.games[g.id].state === "done").length;
      const partial = STAGES.filter((s) => s.games[g.id].state === "partial").length;
      card.innerHTML = `
        <header>
          <h3>${g.name}</h3>
          <span class="status-pill ${g.status}">${g.status === "REVIEW" ? "На ревью" : "Черновик"}</span>
        </header>
        <p class="muted">Эталон процесса: ${g.id === "deadline" ? "глубина F1+ / арт / SFX / REVIEW" : "classic DoR + сильный F1 без арт-табов"}.</p>
        <div class="pl-compare-bar" aria-hidden="true">
          ${STAGES.map((s) => `<i class="${s.games[g.id].state}"></i>`).join("")}
        </div>
        <div class="pl-compare-meta">
          <span>${done} полностью</span>
          <span>${partial} частично</span>
          <a href="${g.href}">Открыть проект →</a>
        </div>
      `;
      wrap.appendChild(card);
    });
    root.appendChild(wrap);
  }

  function renderDetail(panel, stage) {
    panel.innerHTML = "";
    panel.dataset.stage = stage.id;

    const head = el("header", "pl-detail-head");
    head.innerHTML = `
      <div class="pl-detail-gate">${stage.gate}</div>
      <div>
        <h2>${stage.title}</h2>
        <p class="lead">${stage.summary}</p>
      </div>
    `;
    panel.appendChild(head);

    const why = el("p", "pl-why");
    why.innerHTML = `<strong>Зачем:</strong> ${stage.why}`;
    panel.appendChild(why);

    const cols = el("div", "pl-cols");
    const doCol = el("div", "pl-col");
    doCol.appendChild(el("h4", null, "Делать"));
    const doUl = el("ul");
    stage.do.forEach((t) => doUl.appendChild(el("li", null, t)));
    doCol.appendChild(doUl);

    const dontCol = el("div", "pl-col pl-col--dont");
    dontCol.appendChild(el("h4", null, "Не делать"));
    const dontUl = el("ul");
    stage.dont.forEach((t) => dontUl.appendChild(el("li", null, t)));
    dontCol.appendChild(dontUl);
    cols.append(doCol, dontCol);
    panel.appendChild(cols);

    const art = el("div", "pl-block");
    art.appendChild(el("h4", null, "Артефакты"));
    const artUl = el("ul", "pl-files");
    stage.artifacts.forEach((a) => {
      const li = el("li");
      li.innerHTML = `<span>${a.label}</span><code>${a.path}</code>`;
      artUl.appendChild(li);
    });
    art.appendChild(artUl);
    panel.appendChild(art);

    const evidence = el("div", "pl-evidence");
    evidence.appendChild(el("h4", null, "Как уже проходили"));
    const grid = el("div", "pl-evidence-grid");
    Object.values(GAMES).forEach((g) => {
      const st = stage.games[g.id];
      const card = el("div", "pl-evidence-card");
      card.innerHTML = `
        <div class="pl-evidence-top">
          <strong>${g.short}</strong>
          <span class="${gameStateClass(st.state)}">${STATE_RU[st.state]}</span>
        </div>
        <p>${st.note}</p>
      `;
      grid.appendChild(card);
    });
    evidence.appendChild(grid);
    panel.appendChild(evidence);

    if (stage.links.length) {
      const links = el("div", "pl-links");
      stage.links.forEach((L) => {
        const a = el("a", "btn ghost");
        a.href = L.href;
        a.textContent = L.label;
        links.appendChild(a);
      });
      panel.appendChild(links);
    }
  }

  function renderLockedInfo(panel) {
    panel.innerHTML = `
      <header class="pl-detail-head">
        <div class="pl-detail-gate">LOCK</div>
        <div>
          <h2>Дальше — ещё не проходили</h2>
          <p class="lead">Эти гейты есть в методологии, но ни Работник, ни Легенды до них не дошли. На странице они намеренно недоступны как «инструкция к действию».</p>
        </div>
      </header>
      <ul class="pl-locked-list">
        ${LOCKED.map((L) => `<li><strong>${L.gate} · ${L.title}</strong><span>${L.note}</span></li>`).join("")}
      </ul>
      <p class="muted">Источник порядка: <a href="../docs/METHODOLOGY.md">docs/METHODOLOGY.md</a> · F0 → F1 → F2 → CONFIRM → G0+.</p>
    `;
  }

  function setup() {
    const app = document.getElementById("pipeline-app");
    if (!app) return;

    const compareMount = document.getElementById("pipeline-compare");
    const trackMount = document.getElementById("pipeline-track");
    const detail = document.getElementById("pipeline-detail");
    if (!trackMount || !detail) return;

    if (compareMount) renderCompare(compareMount);
    const track = renderTrack(trackMount);
    let index = 0;

    function select(i) {
      index = Math.max(0, Math.min(STAGES.length - 1, i));
      track.querySelectorAll(".pl-node[data-stage]").forEach((n, j) => {
        n.classList.toggle("active", j === index);
      });
      renderDetail(detail, STAGES[index]);
      const active = track.querySelector(".pl-node.active");
      active?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
    }

    track.addEventListener("click", (e) => {
      const node = e.target.closest(".pl-node[data-stage]");
      if (node) {
        const i = STAGES.findIndex((s) => s.id === node.dataset.stage);
        if (i >= 0) select(i);
        return;
      }
      if (e.target.closest(".pl-node--locked")) renderLockedInfo(detail);
    });

    document.getElementById("pipeline-prev")?.addEventListener("click", () => select(index - 1));
    document.getElementById("pipeline-next")?.addEventListener("click", () => select(index + 1));
    window.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") select(index - 1);
      if (e.key === "ArrowRight") select(index + 1);
    });

    const hash = location.hash.replace("#", "");
    const fromHash = STAGES.findIndex((s) => s.id === hash);
    select(fromHash >= 0 ? fromHash : 0);

    // keep hash in sync
    const obs = new MutationObserver(() => {
      const id = detail.dataset.stage;
      if (id && location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    });
    obs.observe(detail, { attributes: true, attributeFilter: ["data-stage"] });
  }

  document.addEventListener("DOMContentLoaded", setup);
  window.PIPELINE = { STAGES, LOCKED, GAMES };
})();
