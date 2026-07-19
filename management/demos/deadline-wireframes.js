/**
 * Работник месяца — interactive wireframe UI (sverka screens).
 * Mounts into #wf-app when present.
 */
(function () {
  const SCREENS = [
    {
      id: "boot",
      title: "Boot",
      note: "Загрузка SDK / прогресс. Без кнопок — только бренд и бар.",
      checks: ["Логотип по центру", "Progress bar", "Нет CTA до готовности"],
      build(el) {
        el.innerHTML = `
          <div class="wf-grow wf-center">
            <div class="wf-box solid" style="width:70%;padding:20px 12px">
              <div class="wf-label">Brand</div>
              <div class="wf-title">РАБОТНИК МЕСЯЦА</div>
            </div>
            <div class="wf-box muted" style="width:80%">Loading…</div>
            <div class="wf-box solid" style="width:70%;height:10px;padding:0;overflow:hidden">
              <div style="width:55%;height:100%;background:#94a3b8"></div>
            </div>
          </div>
          <div class="wf-box muted">Yandex Games SDK</div>
        `;
      },
    },
    {
      id: "menu",
      title: "Menu",
      note: "Главный вход. Один крупный CTA «Играть».",
      checks: ["Play = primary CTA", "Settings / Shop вторичные", "Best floor / coins"],
      build(el) {
        el.innerHTML = `
          <div class="wf-box solid">
            <div class="wf-label">Title</div>
            <div class="wf-title">РАБОТНИК МЕСЯЦА</div>
          </div>
          <div class="wf-grow wf-center">
            <div class="wf-box muted" style="width:60%;aspect-ratio:1;display:flex;align-items:center;justify-content:center">
              key-art / office
            </div>
          </div>
          <div class="wf-row">
            <div class="wf-box">🪙 coins</div>
            <div class="wf-box">эт. best</div>
          </div>
          <div class="wf-box cta">▶ ИГРАТЬ</div>
          <div class="wf-row">
            <div class="wf-box">Магазин</div>
            <div class="wf-box">Настройки</div>
          </div>
        `;
      },
    },
    {
      id: "hub",
      title: "Hub / Floors",
      note: "Хаб: выбор этажа + вход в Daily. Daily не на старте этажа.",
      checks: ["Карточка Daily (1/день)", "Сетка этажей", "CTA «На работу» отдельно от Daily"],
      build(el) {
        el.innerHTML = `
          <div class="wf-box solid">
            <div class="wf-label">Hub</div>
            <div class="wf-title">Офис · этажи</div>
          </div>
          <div class="wf-row">
            <div class="wf-box">🪙 240</div>
            <div class="wf-box">best эт.4</div>
          </div>
          <div class="wf-box cta" style="text-align:left">
            <div class="wf-label" style="color:#115e59">Daily · сегодня</div>
            <div style="font-weight:700;margin:2px 0 4px">Смена дня · доступна</div>
            <div style="font-size:10px;font-weight:400">Награда ждёт · тап → выбор</div>
          </div>
          <div class="wf-grow">
            <div class="wf-label">Этажи (прогресс сохранён)</div>
            <div class="wf-grid-mini">
              <div class="wf-box solid">1</div>
              <div class="wf-box solid">2</div>
              <div class="wf-box solid">3</div>
              <div class="wf-box cta">4</div>
              <div class="wf-box muted">🔒5</div>
              <div class="wf-box muted">…</div>
            </div>
          </div>
          <div class="wf-box">Боссы этажа 4 · preview</div>
          <div class="wf-box cta">На работу · эт.4 →</div>
        `;
      },
    },
    {
      id: "hud",
      title: "Run HUD",
      note: "Игровой экран. Часы 09→18, этаж, баффы, поле.",
      checks: ["Clock + progress", "Поле сетки", "Pause", "Бейдж/кофе индикаторы"],
      build(el) {
        el.innerHTML = `
          <div class="wf-box solid wf-hud-bar">
            <span>09:42</span>
            <span>эт.1</span>
            <span>🪙12</span>
            <span>⏸</span>
          </div>
          <div class="wf-box muted" style="padding:4px 8px;font-size:10px">■■■■■■□□□□ Утро</div>
          <div class="wf-playfield wf-grow">
            <div class="wf-dot" style="left:48%;top:62%"></div>
            <div class="wf-dot boss" style="left:20%;top:28%"></div>
            <div class="wf-dot boss" style="left:70%;top:40%"></div>
          </div>
          <div class="wf-row">
            <div class="wf-box">кофе</div>
            <div class="wf-box">бейдж</div>
            <div class="wf-box muted">стик</div>
          </div>
        `;
      },
    },
    {
      id: "pause",
      title: "Pause",
      note: "Оверлей паузы поверх рана.",
      checks: ["Resume primary", "Menu / Settings", "Interstitial slot ok"],
      build(el) {
        el.innerHTML = `
          <div class="wf-box muted wf-grow" style="opacity:.4">[ run dimmed ]</div>
          <div class="wf-box solid" style="position:relative;margin-top:-40%;z-index:1">
            <div class="wf-title" style="text-align:center;margin-bottom:10px">ПАУЗА</div>
            <div class="wf-box cta">Продолжить</div>
            <div style="height:8px"></div>
            <div class="wf-box">В меню</div>
            <div style="height:6px"></div>
            <div class="wf-box">Настройки</div>
            <div style="height:8px"></div>
            <div class="wf-box muted">ad / interstitial</div>
          </div>
        `;
      },
    },
    {
      id: "caught",
      title: "Caught / Revive",
      note: "Смерть: «ЗАСТАВИЛИ РАБОТАТЬ» + revive CTA.",
      checks: ["Fail copy readable", "RV revive CTA", "Skip → result"],
      build(el) {
        el.innerHTML = `
          <div class="wf-grow wf-center">
            <div class="wf-box danger" style="width:90%;padding:16px">
              <div class="wf-title">ЗАСТАВИЛИ РАБОТАТЬ</div>
              <div style="margin-top:6px;font-size:11px">эт.3 · 14:20</div>
            </div>
          </div>
          <div class="wf-box cta">▶ Реклама · ещё шанс</div>
          <div class="wf-box">В результат</div>
        `;
      },
    },
    {
      id: "result",
      title: "Result",
      note: "Конец дня / повышение. Рестарт или хаб.",
      checks: ["Floor / time / coins", "ПОВЫШЕНИЕ vs fail", "Play again CTA"],
      build(el) {
        el.innerHTML = `
          <div class="wf-box solid">
            <div class="wf-label">Result</div>
            <div class="wf-title">ПОВЫШЕНИЕ!</div>
          </div>
          <div class="wf-grow">
            <div class="wf-box">Этаж 1 → 2</div>
            <div style="height:8px"></div>
            <div class="wf-box">Время до 18:00 ✓</div>
            <div style="height:8px"></div>
            <div class="wf-box">🪙 +24</div>
            <div style="height:8px"></div>
            <div class="wf-box muted">share / LB (later)</div>
          </div>
          <div class="wf-box cta">Следующий этаж</div>
          <div class="wf-box">В хаб</div>
        `;
      },
    },
    {
      id: "shop",
      title: "Shop",
      note: "Скины / гаджеты. Простая сетка офферов.",
      checks: ["Cards 2-col", "Price + buy", "Back"],
      build(el) {
        el.innerHTML = `
          <div class="wf-row">
            <div class="wf-box">←</div>
            <div class="wf-box solid wf-grow"><div class="wf-title">Магазин</div></div>
            <div class="wf-box">🪙</div>
          </div>
          <div class="wf-grow">
            <div class="wf-grid-mini" style="grid-template-columns:1fr 1fr">
              <div class="wf-box solid">скин A<br/>50🪙</div>
              <div class="wf-box solid">скин B<br/>80🪙</div>
              <div class="wf-box solid">гаджет<br/>120🪙</div>
              <div class="wf-box muted">locked</div>
            </div>
          </div>
          <div class="wf-box cta">Купить</div>
        `;
      },
    },
    {
      id: "daily",
      title: "Daily select",
      note: "С хаба: выбор сегодняшней смены. 1 активный daily / день. Не модалка перед этажом.",
      checks: ["Список правил дня", "Один выбран", "Награда видна", "Старт / Назад в хаб"],
      build(el) {
        el.innerHTML = `
          <div class="wf-row">
            <div class="wf-box">← хаб</div>
            <div class="wf-box solid wf-grow">
              <div class="wf-label">Daily</div>
              <div class="wf-title">Смена дня</div>
            </div>
          </div>
          <div class="wf-box muted" style="font-size:10px">Сегодня · сброс 00:00 · 1 попытка награды</div>
          <div class="wf-grow" style="display:flex;flex-direction:column;gap:8px;overflow:auto">
            <div class="wf-box cta" style="text-align:left">
              <div class="wf-label" style="color:#115e59">выбрано</div>
              <div style="font-weight:700">Побег из планёрки</div>
              <div style="font-size:10px;font-weight:400;margin-top:4px">Дожить до 15:00 · без кофе</div>
              <div style="font-size:10px;font-weight:400;margin-top:4px">🎁 🪙40 + бейдж</div>
            </div>
            <div class="wf-box solid" style="text-align:left;opacity:.85">
              <div class="wf-label">альтернатива</div>
              <div style="font-weight:600">Тихий этаж</div>
              <div style="font-size:10px;margin-top:4px">Только HR · до 18:00</div>
              <div style="font-size:10px;margin-top:4px">🎁 🪙25</div>
            </div>
            <div class="wf-box muted" style="text-align:left">
              <div class="wf-label">завтра</div>
              <div style="font-size:10px">??? · откроется после 00:00</div>
            </div>
          </div>
          <div class="wf-box cta">Взять смену →</div>
          <div class="wf-box">Обычный этаж (хаб)</div>
        `;
      },
    },
  ];

  const COMPONENTS = [
    {
      id: "buttons",
      group: "База",
      nav: "Кнопки",
      html: () => `
        <div class="sp-card">
          <h3>Кнопки</h3>
          <div class="sp-meta"><span class="sp-chip ok">спека UI</span><span class="sp-chip todo">арт todo</span></div>
          <p class="sp-desc">Ключи: <code>ui_btn_*</code>. 9-slice или готовые состояния. Portrait-thumb friendly ≥44px.</p>
          <table class="sp-table">
            <thead><tr><th>key</th><th>состояния</th><th>где</th></tr></thead>
            <tbody>
              <tr><td><code>ui_btn_cta</code></td><td>normal / pressed / disabled</td><td>Играть, На работу, Взять смену, Revive</td></tr>
              <tr><td><code>ui_btn_secondary</code></td><td>normal / pressed</td><td>Магазин, Настройки, В хаб</td></tr>
              <tr><td><code>ui_btn_danger</code></td><td>normal / pressed</td><td>редко; fail accents</td></tr>
              <tr><td><code>ui_btn_icon</code></td><td>normal / pressed</td><td>Пауза, назад ←</td></tr>
              <tr><td><code>ui_btn_rv</code></td><td>normal / pressed</td><td>Rewarded revive (play icon)</td></tr>
            </tbody>
          </table>
          <div class="wf-comp-row">
            <span class="wf-comp-swatch cta">CTA</span>
            <span class="wf-comp-swatch">Secondary</span>
            <span class="wf-comp-swatch icon">⏸</span>
            <span class="wf-comp-swatch icon">←</span>
            <span class="wf-comp-swatch cta">▶ RV</span>
          </div>
        </div>
      `,
    },
    {
      id: "panels",
      group: "База",
      nav: "Панели",
      html: () => `
        <div class="sp-card">
          <h3>Панели / модалки</h3>
          <table class="sp-table">
            <thead><tr><th>key</th><th>размер</th><th>где</th></tr></thead>
            <tbody>
              <tr><td><code>ui_panel_sheet</code> 9-slice</td><td>—</td><td>меню, хаб, result</td></tr>
              <tr><td><code>ui_modal_dim</code></td><td>fullscreen alpha</td><td>pause / caught</td></tr>
              <tr><td><code>ui_modal_frame</code></td><td>center card</td><td>pause, caught, settings</td></tr>
              <tr><td><code>ui_banner_top</code></td><td>full width</td><td>run HUD clock bar</td></tr>
              <tr><td><code>ui_card_floor</code></td><td>~96×96</td><td>хаб этажи</td></tr>
              <tr><td><code>ui_card_daily</code></td><td>wide</td><td>хаб + daily select</td></tr>
              <tr><td><code>ui_card_shop</code></td><td>2-col</td><td>магазин</td></tr>
            </tbody>
          </table>
          <div class="wf-comp-row">
            <span class="wf-comp-swatch" style="width:120px;height:64px">panel</span>
            <span class="wf-comp-swatch" style="width:100px;height:100px">floor</span>
            <span class="wf-comp-swatch cta" style="width:160px;height:56px;text-align:left;padding:8px">Daily card</span>
          </div>
        </div>
      `,
    },
    {
      id: "hud",
      group: "Run",
      nav: "HUD pieces",
      html: () => `
        <div class="sp-card">
          <h3>Run HUD — элементы</h3>
          <table class="sp-table">
            <thead><tr><th>key</th><th>тип</th><th>содержание</th></tr></thead>
            <tbody>
              <tr><td><code>ui_hud_clock</code></td><td>text + frame</td><td>09:00–18:00</td></tr>
              <tr><td><code>ui_hud_progress</code></td><td>bar fill</td><td>день / фаза</td></tr>
              <tr><td><code>ui_hud_floor</code></td><td>badge</td><td>эт.N</td></tr>
              <tr><td><code>ui_hud_coins</code></td><td>icon+num</td><td>🪙</td></tr>
              <tr><td><code>ui_hud_buff_coffee</code></td><td>icon on/off</td><td>slow-mo</td></tr>
              <tr><td><code>ui_hud_buff_shield</code></td><td>icon on/off</td><td>бейдж</td></tr>
              <tr><td><code>ui_hud_pause</code></td><td>icon btn</td><td>⏸</td></tr>
              <tr><td><code>ui_stick_base</code> / <code>ui_stick_knob</code></td><td>virtual stick</td><td>mobile (demo-engine)</td></tr>
            </tbody>
          </table>
          <div class="wf-comp-row">
            <span class="wf-comp-swatch">09:42</span>
            <span class="wf-comp-swatch" style="width:100px;height:12px;padding:0;background:linear-gradient(90deg,#0f766e 60%,#e2e8f0 60%)"></span>
            <span class="wf-comp-swatch icon">эт</span>
            <span class="wf-comp-swatch icon">🪙</span>
            <span class="wf-comp-swatch icon">☕</span>
            <span class="wf-comp-swatch icon">ID</span>
            <span class="wf-comp-swatch icon">⏸</span>
          </div>
        </div>
      `,
    },
    {
      id: "icons",
      group: "Иконки",
      nav: "Иконки",
      html: () => `
        <div class="sp-card">
          <h3>UI icons · <code>ui_icon_sheet.png</code></h3>
          <p class="sp-desc">Рекомендуемый атлас 32×32 или 64×64. Без генерации — перечень слотов.</p>
          <table class="sp-table">
            <thead><tr><th>key</th><th>смысл</th></tr></thead>
            <tbody>
              <tr><td><code>ui_icon_coin</code></td><td>валюта</td></tr>
              <tr><td><code>ui_icon_floor</code></td><td>этаж / офис</td></tr>
              <tr><td><code>ui_icon_lock</code></td><td>закрытый этаж</td></tr>
              <tr><td><code>ui_icon_daily</code></td><td>смена дня</td></tr>
              <tr><td><code>ui_icon_coffee</code></td><td>бафф</td></tr>
              <tr><td><code>ui_icon_badge</code></td><td>щит</td></tr>
              <tr><td><code>ui_icon_settings</code></td><td>шестерёнка</td></tr>
              <tr><td><code>ui_icon_shop</code></td><td>магазин</td></tr>
              <tr><td><code>ui_icon_play</code></td><td>старт</td></tr>
              <tr><td><code>ui_icon_ad</code></td><td>rewarded</td></tr>
              <tr><td><code>ui_icon_share</code></td><td>шаринг (later)</td></tr>
              <tr><td><code>ui_icon_sound_on/off</code></td><td>настройки</td></tr>
            </tbody>
          </table>
          <div class="wf-comp-row">
            ${["🪙","🏢","🔒","📅","☕","ID","⚙","🛒","▶","📺","🔊"].map((x) =>
              `<span class="wf-comp-swatch icon">${x}</span>`).join("")}
          </div>
        </div>
      `,
    },
    {
      id: "text",
      group: "Иконки",
      nav: "Текст / шрифт",
      html: () => `
        <div class="sp-card">
          <h3>Типографика UI (не спрайт)</h3>
          <p class="sp-desc">Bitmap font optional. MVP: системный/веб-шрифт. Копирайт-ключи:</p>
          <table class="sp-table">
            <thead><tr><th>строка</th><th>экран</th></tr></thead>
            <tbody>
              <tr><td>РАБОТНИК МЕСЯЦА</td><td>boot / menu</td></tr>
              <tr><td>ИГРАТЬ / На работу</td><td>menu / hub</td></tr>
              <tr><td>ЗАСТАВИЛИ РАБОТАТЬ</td><td>caught</td></tr>
              <tr><td>ПОВЫШЕНИЕ!</td><td>result</td></tr>
              <tr><td>Смена дня / Побег из планёрки</td><td>daily</td></tr>
              <tr><td>Утро / Работа / Аврал / Переработка</td><td>HUD phase</td></tr>
            </tbody>
          </table>
        </div>
      `,
    },
    {
      id: "screens-map",
      group: "Сводка",
      nav: "Карта экранов",
      html: () => `
        <div class="sp-card">
          <h3>Какие компоненты на каких экранах</h3>
          <table class="sp-table">
            <thead><tr><th>экран</th><th>компоненты</th></tr></thead>
            <tbody>
              <tr><td>Boot</td><td>brand title, progress bar, muted SDK label</td></tr>
              <tr><td>Menu</td><td>title, key-art frame, coins, best, CTA play, secondary shop/settings</td></tr>
              <tr><td>Hub</td><td>coins, best, daily card, floor cards, boss preview, CTA work</td></tr>
              <tr><td>Daily select</td><td>back, challenge cards, CTA take, secondary hub</td></tr>
              <tr><td>Run HUD</td><td>clock, progress, floor, coins, buffs, pause, stick</td></tr>
              <tr><td>Pause</td><td>dim, modal, CTA resume, secondary menu/settings</td></tr>
              <tr><td>Caught</td><td>danger panel, RV CTA, skip result</td></tr>
              <tr><td>Result</td><td>title promo/fail, stats rows, CTA next, hub</td></tr>
              <tr><td>Shop</td><td>back, title, coins, shop cards, CTA buy</td></tr>
            </tbody>
          </table>
          <div class="sp-note">Экраны целиком смотри в режиме <strong>Экраны</strong> (телефон слева). Здесь — атомарный UI kit.</div>
        </div>
      `,
    },
  ];

  function mountScreens(host) {
    host.classList.remove("wf-mode-components");
    host.innerHTML = `
      <nav class="wf-nav" role="tablist" aria-label="Экраны UI"></nav>
      <div class="wf-phone-wrap">
        <div class="wf-phone" aria-live="polite">
          <div class="wf-phone-notch"></div>
        </div>
        <div class="wf-phone-caption"></div>
      </div>
      <aside class="wf-meta"></aside>
    `;
    const nav = host.querySelector(".wf-nav");
    const phone = host.querySelector(".wf-phone");
    const caption = host.querySelector(".wf-phone-caption");
    const meta = host.querySelector(".wf-meta");
    const panes = {};
    SCREENS.forEach((s) => {
      const pane = document.createElement("div");
      pane.className = "wf-screen";
      pane.dataset.id = s.id;
      s.build(pane);
      phone.appendChild(pane);
      panes[s.id] = pane;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = s.title;
      btn.dataset.id = s.id;
      btn.addEventListener("click", () => show(s.id));
      nav.appendChild(btn);
    });
    function show(id) {
      const s = SCREENS.find((x) => x.id === id) || SCREENS[0];
      Object.values(panes).forEach((p) => p.classList.toggle("active", p.dataset.id === s.id));
      nav.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.id === s.id));
      caption.textContent = `${s.title} · portrait 360×640`;
      meta.innerHTML = `<h4>${s.title}</h4><p>${s.note}</p><ul>${s.checks.map((c) => `<li>${c}</li>`).join("")}</ul>`;
    }
    show(SCREENS[0].id);
  }

  function mountComponents(host) {
    host.classList.add("wf-mode-components");
    host.innerHTML = `
      <nav class="wf-nav sp-nav" aria-label="UI компоненты"></nav>
      <div class="wf-comp-panel sp-panel"></div>
    `;
    const nav = host.querySelector(".wf-nav");
    const panel = host.querySelector(".wf-comp-panel");
    let lastGroup = null;
    COMPONENTS.forEach((c) => {
      if (c.group !== lastGroup) {
        const g = document.createElement("div");
        g.className = "sp-nav-group";
        g.textContent = c.group;
        g.style.cssText = "font-size:0.72rem;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;margin:10px 0 4px;padding-left:4px";
        nav.appendChild(g);
        lastGroup = c.group;
      }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = c.nav;
      btn.dataset.id = c.id;
      btn.addEventListener("click", () => show(c.id));
      nav.appendChild(btn);
    });
    function show(id) {
      const c = COMPONENTS.find((x) => x.id === id) || COMPONENTS[0];
      nav.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.id === c.id));
      panel.innerHTML = c.html();
    }
    show(COMPONENTS[0].id);
  }

  function mount(root) {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="wf-mode" role="tablist" aria-label="Режим wireframe">
        <button type="button" data-mode="screens" class="active">Экраны</button>
        <button type="button" data-mode="components">Компоненты UI</button>
      </div>
      <div class="wf-app" id="wf-app-inner"></div>
    `;
    root.appendChild(wrap);
    // root was #wf-app with class wf-app — flatten
    root.classList.remove("wf-app");
    const inner = wrap.querySelector("#wf-app-inner");
    const modeBtns = wrap.querySelectorAll(".wf-mode button");
    function setMode(mode) {
      modeBtns.forEach((b) => b.classList.toggle("active", b.dataset.mode === mode));
      if (mode === "components") mountComponents(inner);
      else mountScreens(inner);
    }
    modeBtns.forEach((b) => b.addEventListener("click", () => setMode(b.dataset.mode)));
    setMode("screens");
  }

  function boot() {
    const el = document.getElementById("wf-app");
    if (el) mount(el);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
