/**
 * Работник месяца — finished Beta UI shell
 * All MVP screens, Yandex Games portrait contract.
 * Mounts into #mu-app. No games/.../src while design REVIEW.
 */
(function () {
  const BUILD = "mu250720d";
  const STORAGE_KEY = "deadline-escape-mock-ui-v2";

  const COPY = {
    brand: "РАБОТНИК МЕСЯЦА",
    play: "Играть",
    settings: "Настройки",
    shop: "Магазин",
    toWork: "На работу",
    caught: "ЗАСТАВИЛИ РАБОТАТЬ",
    promote: "ПОВЫШЕНИЕ!",
    failTitle: "Смена сорвана",
    rv: "Продолжить (реклама)",
    caughtSkip: "В меню",
    dailyTitle: "Побег из планёрки",
    dailyHub: "Daily · побег из планёрки",
    tut: "Ходи по светлым · избегай боссов · доживи до 18:00",
    tutTitle: "Как играть",
    tutRules: "Ходи по светлым клеткам. Избегай боссов. Доживи до 18:00 — получишь ПОВЫШЕНИЕ.",
    tutControls: "Управление: тап по полю — шаг · WASD / стрелки · ⏸ пауза",
    tutOk: "Понятно",
    nextFloor: "Следующий этаж",
    again: "Ещё раз",
    toHub: "В хаб",
    resume: "Продолжить",
    pause: "ПАУЗА",
  };

  const PHASES = [
    { id: "morning", label: "Утро", at: 0 },
    { id: "work", label: "Работа", at: 80 },
    { id: "crunch", label: "Аврал", at: 280 },
    { id: "ot", label: "Переработка", at: 430 },
  ];

  const SHOP = [
    { id: "skin_a", title: "Скин A", price: 50, kind: "soft" },
    { id: "skin_b", title: "Скин B", price: 80, kind: "soft" },
    { id: "starter_pack", title: "Стартер", price: 0, kind: "iap", label: "IAP" },
    { id: "remove_ads", title: "Убрать рекламу", price: 0, kind: "iap", label: "IAP" },
  ];

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...defaultState(), ...JSON.parse(raw) };
    } catch (_) {}
    return defaultState();
  }

  function defaultState() {
    return {
      coins: 120,
      bestFloor: 1,
      floor: 1,
      unlocked: 4,
      mute: false,
      dailyClaimed: false,
      runsSinceInterstitial: 0,
      removeAds: false,
      ownedSkins: [],
      selectedSkin: null,
      shopPick: "skin_a",
      dailyPick: "meeting",
      tutSeen: false,
    };
  }

  function persist(s) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        coins: s.coins,
        bestFloor: s.bestFloor,
        floor: s.floor,
        unlocked: s.unlocked,
        mute: s.mute,
        dailyClaimed: s.dailyClaimed,
        runsSinceInterstitial: s.runsSinceInterstitial,
        removeAds: s.removeAds,
        ownedSkins: s.ownedSkins,
        selectedSkin: s.selectedSkin,
        tutSeen: s.tutSeen,
      }));
    } catch (_) {}
  }

  function createYandexMock(log) {
    let ready = false;
    let gameplay = false;
    return {
      isReady: () => ready,
      isGameplay: () => gameplay,
      async init() {
        log("info", "YaGames.init()…");
        await wait(380);
        log("ok", "ysdk ready (DEV_MOCK)");
        return this;
      },
      loadingReady() {
        if (ready) return;
        ready = true;
        log("ok", "LoadingAPI.ready()");
      },
      gameplayStart() {
        if (gameplay) return;
        gameplay = true;
        log("ok", "GameplayAPI.start()");
      },
      gameplayStop() {
        if (!gameplay) return;
        gameplay = false;
        log("ok", "GameplayAPI.stop()");
      },
      async showRewarded(placement) {
        log("warn", `RewardedVideo.show(${placement})`);
        await wait(650);
        log("ok", `RewardedVideo rewarded · ${placement}`);
        return true;
      },
      async showInterstitial(reason) {
        log("warn", `Interstitial.show(${reason})`);
        await wait(480);
        log("ok", "Interstitial closed");
        return true;
      },
      async getPlayerData() {
        log("info", "player.getData()");
        return {};
      },
      async setPlayerData(data) {
        log("info", "player.setData() " + JSON.stringify(data).slice(0, 72));
      },
    };
  }

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  function fmtClock(gameMin) {
    const total = 9 * 60 + Math.min(540, Math.floor(gameMin));
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  function phaseFor(gameMin) {
    let p = PHASES[0];
    for (const x of PHASES) if (gameMin >= x.at) p = x;
    return p;
  }

  function mount(root) {
    const state = loadState();
    const logEl = { current: null };
    const sdkLog = (cls, msg) => {
      const el = logEl.current;
      if (!el) return;
      const line = document.createElement("div");
      line.className = cls;
      const t = new Date().toLocaleTimeString("ru-RU", { hour12: false });
      line.textContent = `[${t}] ${msg}`;
      el.prepend(line);
      while (el.children.length > 40) el.lastChild.remove();
    };
    const ysdk = createYandexMock(sdkLog);

    root.innerHTML = `
      <div class="mu-layout">
        <div class="mu-phone-wrap">
          <div class="mu-phone" id="mu-phone" aria-live="polite"></div>
          <div class="mu-caption">Portrait UI · 360×640 (logical 720×1280) · ${BUILD}</div>
          <div class="mu-actions">
            <button type="button" class="btn ghost" id="mu-open-feel">Feel-демка</button>
          </div>
        </div>
        <aside class="mu-side">
          <h4>Бета-тест · UI shell</h4>
          <p>Полный поток экранов MVP. Только продуктовый UI в портретном шелле.</p>
          <ul class="mu-checks">
            <li>Boot → Menu → Hub → Daily?/Run</li>
            <li>Pause / Caught(RV) / Result / Shop / Settings</li>
            <li>Copy: ЗАСТАВИЛИ / ПОВЫШЕНИЕ</li>
            <li>Yandex: LoadingAPI · GameplayAPI · RV · interstitial</li>
          </ul>

          <div class="mu-sdk-bar" id="mu-sdk-bar"></div>
          <div class="mu-log" id="mu-log" aria-label="SDK log"></div>
        </aside>
      </div>
    `;

    const phone = root.querySelector("#mu-phone");
    logEl.current = root.querySelector("#mu-log");
    const sdkBar = root.querySelector("#mu-sdk-bar");

    root.querySelector("#mu-open-feel").addEventListener("click", () => {
      const tab = document.querySelector('.tab[data-tab="demo"]');
      if (tab) tab.click();
      else location.hash = "demo";
    });

    const KEY_STEP = {
      KeyW: [0, -10], ArrowUp: [0, -10],
      KeyS: [0, 10], ArrowDown: [0, 10],
      KeyA: [-10, 0], ArrowLeft: [-10, 0],
      KeyD: [10, 0], ArrowRight: [10, 0],
    };
    const onKey = (ev) => {
      if (screen !== "run" || !run || run.paused || run.over || run.showTut) return;
      const delta = KEY_STEP[ev.code];
      if (!delta) return;
      ev.preventDefault();
      run.player.x = Math.max(12, Math.min(88, run.player.x + delta[0]));
      run.player.y = Math.max(18, Math.min(86, run.player.y + delta[1]));
      paintRunHud();
    };
    window.addEventListener("keydown", onKey);

    let screen = "boot";
    let run = null;
    let raf = 0;
    let lastTs = 0;
    let settingsReturn = "menu";

    function updateSdkBar() {
      sdkBar.innerHTML = `
        <span class="mu-sdk-pill ${ysdk.isReady() ? "ok" : "warn"}">LoadingAPI ${ysdk.isReady() ? "ready" : "…"}</span>
        <span class="mu-sdk-pill ${ysdk.isGameplay() ? "ok" : ""}">Gameplay ${ysdk.isGameplay() ? "ON" : "off"}</span>
        <span class="mu-sdk-pill">эт.${state.floor} · 🪙${state.coins}</span>
        <span class="mu-sdk-pill">${state.mute ? "🔇" : "🔊"}</span>
        <span class="mu-sdk-pill">${state.removeAds ? "no ads" : `ads ${Math.max(0, 2 - state.runsSinceInterstitial)}`}</span>
      `;
    }

    function dist(a, b) {
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      return Math.hypot(dx, dy);
    }

    function stopRunLoop() {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      lastTs = 0;
    }

    function startRunLoop() {
      stopRunLoop();
      lastTs = 0;
      const tick = (ts) => {
        if (!run || run.paused || run.over) return;
        if (!lastTs) lastTs = ts;
        const dt = Math.min(0.05, (ts - lastTs) / 1000);
        lastTs = ts;
        const scale = (run.coffee ? 0.42 : 1) * (run.showTut ? 0 : 1);
        run.gameMin += 18 * 0.5 * dt * scale;
        if (run.showTut) {
          paintRunHud();
          raf = requestAnimationFrame(tick);
          return;
        }
        if (run.gameMin >= 540) {
          run.over = true;
          run.win = true;
          endRun(true);
          return;
        }
        run.bosses.forEach((b, i) => {
          const t = run.gameMin * 0.02 + i;
          b.x = 18 + ((Math.sin(t * (1.05 + i * 0.22)) + 1) / 2) * 64;
          b.y = 22 + ((Math.cos(t * (0.88 + i * 0.18)) + 1) / 2) * 52;
        });
        // Ally offer → coffee; badge drops once after a short walk.
        if (!run.coffee && dist(run.player, run.ally) < 9) {
          run.coffee = true;
          run.coffeeUntil = run.gameMin + 54; // ~3s world at default pace
          sdkLog("info", "coffee slow-mo");
        }
        if (run.coffee && run.gameMin >= (run.coffeeUntil || 0)) run.coffee = false;
        if (!run.badgeDropped && run.gameMin > 40) {
          run.badgeDropped = true;
          run.badge = { x: run.ally.x + 6, y: run.ally.y + 8 };
        }
        if (run.badge && !run.shield && dist(run.player, run.badge) < 8) {
          run.shield = true;
          run.badge = null;
          sdkLog("info", "badge pickup");
        }
        const hit = run.bosses.some((b) => dist(run.player, b) < 7.5);
        if (hit) {
          if (run.shield) {
            run.shield = false;
            run.iframesUntil = run.gameMin + 12;
            sdkLog("ok", "shield_break");
          } else if (run.gameMin >= (run.iframesUntil || 0)) {
            run.over = true;
            run.win = false;
            endRun(false);
            return;
          }
        }
        paintRunHud();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }

    async function maybeInterstitial(reason) {
      if (state.removeAds) return;
      state.runsSinceInterstitial += 1;
      if (state.runsSinceInterstitial >= 2) {
        state.runsSinceInterstitial = 0;
        await ysdk.showInterstitial(reason);
      }
      persist(state);
    }

    async function endRun(win) {
      stopRunLoop();
      ysdk.gameplayStop();
      if (win) {
        state.coins += 24;
        state.floor = Math.min(state.floor + 1, 99);
        state.bestFloor = Math.max(state.bestFloor, state.floor);
        state.unlocked = Math.max(state.unlocked, state.floor);
        persist(state);
        await ysdk.setPlayerData({ bestFloor: state.bestFloor, coins: state.coins });
        await maybeInterstitial("between_runs");
        go("result_win");
      } else {
        await maybeInterstitial("after_fail");
        go("caught");
      }
    }

    function beginRun(opts) {
      run = {
        gameMin: 0,
        paused: false,
        over: false,
        win: false,
        daily: !!opts.daily,
        shield: false,
        coffee: false,
        coffeeUntil: 0,
        iframesUntil: 0,
        badgeDropped: false,
        badge: null,
        showTut: true,
        player: { x: 50, y: 62 },
        bosses: [{ x: 22, y: 28 }, { x: 70, y: 40 }],
        ally: { x: 48, y: 34 },
      };
      ysdk.gameplayStart();
      go("run");
      startRunLoop();
    }

    function paintRunHud() {
      if (!run || (screen !== "run" && screen !== "pause")) return;
      const clock = phone.querySelector("[data-mu-clock]");
      const phase = phone.querySelector("[data-mu-phase]");
      const bar = phone.querySelector("[data-mu-daybar]");
      const field = phone.querySelector("[data-mu-field]");
      const tip = phone.querySelector("[data-mu-tip]");
      if (clock) clock.textContent = fmtClock(run.gameMin);
      if (phase) phase.textContent = phaseFor(run.gameMin).label;
      if (bar) bar.style.width = `${Math.min(100, (run.gameMin / 540) * 100)}%`;
      if (tip) tip.hidden = !run.showTut;
      if (field && screen === "run") {
        let layer = field.querySelector("[data-mu-entities]");
        if (!layer) {
          layer = document.createElement("div");
          layer.dataset.muEntities = "1";
          layer.style.cssText = "position:absolute;inset:0;pointer-events:none";
          field.appendChild(layer);
        }
        layer.innerHTML = `
          <div class="mu-dot" style="left:${run.player.x}%;top:${run.player.y}%"></div>
          <div class="mu-dot ally" style="left:${run.ally.x}%;top:${run.ally.y}%"></div>
          ${run.badge ? `<div class="mu-dot badge" style="left:${run.badge.x}%;top:${run.badge.y}%"></div>` : ""}
          ${run.bosses.map((b) => `<div class="mu-dot boss" style="left:${b.x}%;top:${b.y}%"></div>`).join("")}
        `;
      }
      const shield = phone.querySelector("[data-mu-shield]");
      const coffee = phone.querySelector("[data-mu-coffee]");
      if (shield) shield.classList.toggle("on", !!run.shield);
      if (coffee) coffee.classList.toggle("on", !!run.coffee);
      updateSdkBar();
    }

    function htmlFor(id) {
      if (id === "boot") {
        return `
          <div class="mu-screen active" data-id="boot">
            <div class="mu-grow mu-center">
              <div class="mu-brand">${COPY.brand}<small>Yandex Games · HTML5</small></div>
              <div class="mu-panel tight" style="width:86%;margin-top:18px">
                <div class="mu-label">LoadingAPI</div>
                <div class="mu-sub" id="mu-boot-msg">Инициализация SDK…</div>
                <div class="mu-progress" style="margin-top:10px"><i id="mu-boot-bar" style="width:10%"></i></div>
              </div>
            </div>
            <div class="mu-sub" style="text-align:center">portrait-primary · 720×1280</div>
          </div>`;
      }
      if (id === "menu") {
        return `
          <div class="mu-screen active" data-id="menu">
            <div class="mu-brand">${COPY.brand}<small>Employee of the Month</small></div>
            <div class="mu-art" data-caption="офис · top-down" role="img" aria-label="Style seed"></div>
            <div class="mu-row">
              <div class="mu-chip">🪙 ${state.coins}</div>
              <div class="mu-chip">best эт.${state.bestFloor}</div>
            </div>
            <button type="button" class="mu-btn cta" data-go="hub">${COPY.play}</button>
            <div class="mu-row">
              <button type="button" class="mu-btn" data-go="shop">${COPY.shop}</button>
              <button type="button" class="mu-btn" data-go="settings">${COPY.settings}</button>
            </div>
          </div>`;
      }
      if (id === "hub") {
        const floors = [];
        for (let i = 1; i <= 6; i++) {
          const locked = i > state.unlocked;
          const current = i === state.floor;
          floors.push(`
            <button type="button" class="mu-floor ${locked ? "locked" : ""} ${current ? "current" : ""}"
              data-floor="${i}" ${locked ? "disabled" : ""}>
              ${locked ? "🔒" : i}
              <small>${locked ? "closed" : current ? "сейчас" : "эт."}</small>
            </button>`);
        }
        return `
          <div class="mu-screen active" data-id="hub">
            <div class="mu-panel tight">
              <div class="mu-label">Hub</div>
              <div class="mu-title">Офис · этажи</div>
            </div>
            <div class="mu-row">
              <div class="mu-chip">🪙 ${state.coins}</div>
              <div class="mu-chip">best эт.${state.bestFloor}</div>
            </div>
            <button type="button" class="mu-btn cta mu-daily-card" data-go="daily" ${state.dailyClaimed ? "disabled" : ""}>
              <div class="mu-label" style="color:#115e59">${state.dailyClaimed ? "Daily · завтра" : "Daily · сегодня"}</div>
              <div style="font-weight:800;margin-top:2px">${COPY.dailyHub}</div>
              <div class="mu-sub">${state.dailyClaimed ? "Награда уже получена" : "1/день · выбор смены"}</div>
            </button>
            <div class="mu-grow">
              <div class="mu-label">Этажи</div>
              <div class="mu-floors">${floors.join("")}</div>
            </div>
            <div class="mu-panel tight"><div class="mu-sub">Боссы этажа ${state.floor}: HR · Дир · ГЛЯД</div></div>
            <button type="button" class="mu-btn cta" data-action="work">${COPY.toWork} · эт.${state.floor} →</button>
            <div class="mu-row">
              <button type="button" class="mu-btn" data-go="shop">${COPY.shop}</button>
              <button type="button" class="mu-btn" data-go="menu">← Меню</button>
            </div>
          </div>`;
      }
      if (id === "daily") {
        const meetingSel = state.dailyPick === "meeting" ? "selected" : "";
        const quietSel = state.dailyPick === "quiet" ? "selected" : "";
        return `
          <div class="mu-screen active" data-id="daily">
            <div class="mu-row">
              <button type="button" class="mu-btn icon" data-go="hub">←</button>
              <div class="mu-panel tight mu-grow">
                <div class="mu-label">Daily</div>
                <div class="mu-title">Смена дня</div>
              </div>
            </div>
            <div class="mu-sub">Сегодня · сброс 00:00 · 1 попытка награды</div>
            <div class="mu-grow">
              <button type="button" class="mu-panel ok mu-daily-card ${meetingSel}" data-daily="meeting">
                <div class="mu-label">выбрано</div>
                <div class="mu-title" style="font-size:1rem">${COPY.dailyTitle}</div>
                <div class="mu-sub">Дожить до 15:00 · без кофе · 🎁 🪙40 + бейдж</div>
              </button>
              <button type="button" class="mu-panel tight mu-daily-card ${quietSel}" data-daily="quiet">
                <div class="mu-label">альтернатива</div>
                <div style="font-weight:800">Тихий этаж</div>
                <div class="mu-sub">Только HR · до 18:00 · 🎁 🪙25</div>
              </button>
            </div>
            <button type="button" class="mu-btn cta" data-action="daily-start">Взять смену →</button>
            <button type="button" class="mu-btn" data-go="hub">Обычный этаж (хаб)</button>
          </div>`;
      }
      if (id === "run") {
        return `
          <div class="mu-screen active" data-id="run">
            <div class="mu-hud">
              <span class="mu-clock" data-mu-clock>09:00</span>
              <span>эт.${state.floor}</span>
              <span>🪙${state.coins}</span>
              <button type="button" class="mu-btn icon" data-action="pause" title="Пауза" aria-label="Пауза">⏸</button>
            </div>
            <div class="mu-phase-row">
              <span class="mu-phase" data-mu-phase>Утро</span>
              <div class="mu-buffs">
                <div class="mu-buff" data-mu-coffee title="Кофе">☕</div>
                <div class="mu-buff" data-mu-shield title="Бейдж">🪪</div>
              </div>
            </div>
            <div class="mu-progress"><i data-mu-daybar style="width:0%"></i></div>
            <div class="mu-playfield" data-mu-field data-action="step" role="application" aria-label="Игровое поле"></div>
            <div class="mu-tip" data-mu-tip ${run && run.showTut ? "" : "hidden"}>
              <div class="mu-label">${COPY.tutTitle}</div>
              <div class="mu-tip-rules">${COPY.tutRules}</div>
              <div class="mu-tip-controls">${COPY.tutControls}</div>
              <button type="button" class="mu-btn cta" data-action="dismiss-tut">${COPY.tutOk}</button>
            </div>
          </div>`;
      }
      if (id === "pause") {
        return `
          <div class="mu-screen active" data-id="pause" style="position:relative">
            <div class="mu-hud" style="opacity:.55">
              <span class="mu-clock">${run ? fmtClock(run.gameMin) : "09:00"}</span>
              <span>эт.${state.floor}</span>
              <span>🪙${state.coins}</span>
              <span>⏸</span>
            </div>
            <div class="mu-playfield" style="opacity:.35"></div>
            <div class="mu-modal-dim">
              <div class="mu-modal">
                <div class="mu-title" style="text-align:center">${COPY.pause}</div>
                <button type="button" class="mu-btn cta" data-action="resume">${COPY.resume}</button>
                <button type="button" class="mu-btn" data-go="settings">${COPY.settings}</button>
                <button type="button" class="mu-btn" data-action="quit-hub">${COPY.toHub}</button>
              </div>
            </div>
          </div>`;
      }
      if (id === "caught") {
        return `
          <div class="mu-screen active" data-id="caught">
            <div class="mu-grow mu-center">
              <div class="mu-panel danger" style="width:92%">
                <div class="mu-title">${COPY.caught}</div>
                <div class="mu-sub">эт.${state.floor} · ${run ? fmtClock(run.gameMin) : "—"}</div>
              </div>
            </div>
            <button type="button" class="mu-btn cta rv" data-action="rv">${COPY.rv}</button>
            <button type="button" class="mu-btn" data-go="result_fail">${COPY.caughtSkip}</button>
          </div>`;
      }
      if (id === "result_win") {
        return `
          <div class="mu-screen active" data-id="result_win">
            <div class="mu-panel ok">
              <div class="mu-label">Result</div>
              <div class="mu-title">${COPY.promote}</div>
            </div>
            <div class="mu-grow">
              <div class="mu-panel tight">Этаж → ${state.floor}</div>
              <div class="mu-panel tight">Время до 18:00 ✓</div>
              <div class="mu-panel tight">🪙 +24 · итого ${state.coins}</div>
            </div>
            <button type="button" class="mu-btn cta" data-action="work">${COPY.nextFloor}</button>
            <button type="button" class="mu-btn" data-go="hub">${COPY.toHub}</button>
          </div>`;
      }
      if (id === "result_fail") {
        return `
          <div class="mu-screen active" data-id="result_fail">
            <div class="mu-panel danger">
              <div class="mu-label">Result</div>
              <div class="mu-title">${COPY.failTitle}</div>
            </div>
            <div class="mu-grow">
              <div class="mu-panel tight">Этаж ${state.floor}</div>
              <div class="mu-panel tight">Время ${run ? fmtClock(run.gameMin) : "—"}</div>
              <div class="mu-panel tight">🪙 ${state.coins}</div>
            </div>
            <button type="button" class="mu-btn cta" data-action="work">${COPY.again}</button>
            <button type="button" class="mu-btn" data-go="hub">${COPY.toHub}</button>
          </div>`;
      }
      if (id === "shop") {
        const cards = SHOP.map((item) => {
          const owned = item.id === "remove_ads" ? state.removeAds : state.ownedSkins.includes(item.id);
          const selected = state.shopPick === item.id;
          const price = item.kind === "iap" ? (item.label || "IAP") : `${item.price}🪙`;
          return `
            <button type="button" class="mu-shop-card ${selected ? "selected" : ""} ${owned ? "locked" : ""}"
              data-shop="${item.id}" ${owned && item.id === "remove_ads" ? "disabled" : ""}>
              ${item.title}${owned ? " ✓" : ""}
              <div class="price">${owned && item.id !== "remove_ads" ? "куплено" : price}</div>
            </button>`;
        }).join("");
        return `
          <div class="mu-screen active" data-id="shop">
            <div class="mu-row">
              <button type="button" class="mu-btn icon" data-go="hub">←</button>
              <div class="mu-panel tight mu-grow"><div class="mu-title">${COPY.shop}</div></div>
              <div class="mu-chip">🪙 ${state.coins}</div>
            </div>
            <div class="mu-grow"><div class="mu-shop-grid">${cards}</div></div>
            <button type="button" class="mu-btn cta" data-action="buy">Купить</button>
            <div class="mu-sub">IAP: remove_ads · starter_pack · skin_*</div>
          </div>`;
      }
      if (id === "settings") {
        return `
          <div class="mu-screen active" data-id="settings">
            <div class="mu-row">
              <button type="button" class="mu-btn icon" data-action="settings-back">←</button>
              <div class="mu-panel tight mu-grow"><div class="mu-title">${COPY.settings}</div></div>
            </div>
            <div class="mu-grow">
              <button type="button" class="mu-toggle" data-action="toggle-mute">
                <span>Звук</span>
                <span>${state.mute ? "Выкл" : "Вкл"}</span>
              </button>
              <div class="mu-panel tight">
                <div class="mu-label">Яндекс Игры</div>
                <div class="mu-sub">Cloud save · RU · portrait · SDK DEV_MOCK</div>
              </div>
              <div class="mu-panel tight">
                <div class="mu-label">Сборка UI</div>
                <div class="mu-sub">${BUILD} · feel — вкладка Демка</div>
              </div>
            </div>
          </div>`;
      }
      return `<div class="mu-screen active"><div class="mu-panel">Unknown</div></div>`;
    }

    function bindPhone() {
      phone.querySelectorAll("[data-go]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const to = btn.getAttribute("data-go");
          if (to === "settings") settingsReturn = screen;
          go(to);
        });
      });
      phone.querySelectorAll("[data-floor]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const n = Number(btn.getAttribute("data-floor"));
          if (n >= 1 && n <= state.unlocked) {
            state.floor = n;
            persist(state);
            go("hub");
          }
        });
      });
      phone.querySelectorAll("[data-daily]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.dailyPick = btn.getAttribute("data-daily");
          go("daily");
        });
      });
      phone.querySelectorAll("[data-shop]").forEach((btn) => {
        btn.addEventListener("click", () => {
          state.shopPick = btn.getAttribute("data-shop");
          go("shop");
        });
      });
      phone.querySelectorAll("[data-action]").forEach((btn) => {
        btn.addEventListener("click", async (ev) => {
          const act = btn.getAttribute("data-action");
          if (act === "work") beginRun({ daily: false });
          else if (act === "daily-start") {
            state.dailyClaimed = true;
            persist(state);
            beginRun({ daily: true });
          } else if (act === "pause") {
            if (!run || run.over) return;
            run.paused = true;
            stopRunLoop();
            go("pause");
          } else if (act === "resume") {
            if (run) run.paused = false;
            go("run");
            startRunLoop();
          } else if (act === "quit-hub") {
            stopRunLoop();
            ysdk.gameplayStop();
            run = null;
            go("hub");
          } else if (act === "rv") {
            const ok = await ysdk.showRewarded("revive");
            if (ok && run) {
              run.over = false;
              run.paused = false;
              run.shield = true;
              ysdk.gameplayStart();
              go("run");
              startRunLoop();
            }
          }           else if (act === "step") {
            if (!run || run.paused || run.over || run.showTut) return;
            const rect = btn.getBoundingClientRect();
            const x = ((ev.clientX - rect.left) / rect.width) * 100;
            const y = ((ev.clientY - rect.top) / rect.height) * 100;
            run.player.x = Math.max(12, Math.min(88, x));
            run.player.y = Math.max(18, Math.min(86, y));
            paintRunHud();
          } else if (act === "dismiss-tut") {
            if (!run) return;
            run.showTut = false;
            state.tutSeen = true;
            persist(state);
            paintRunHud();
          } else if (act === "toggle-mute") {
            state.mute = !state.mute;
            persist(state);
            go("settings");
          } else if (act === "settings-back") {
            go(settingsReturn === "pause" ? "pause" : settingsReturn || "menu");
          } else if (act === "buy") {
            buySelected();
          }
        });
      });
    }

    function buySelected() {
      const item = SHOP.find((x) => x.id === state.shopPick) || SHOP[0];
      if (item.id === "remove_ads") {
        if (state.removeAds) return;
        state.removeAds = true;
        sdkLog("ok", "payments.purchase(remove_ads)");
        persist(state);
        go("shop");
        return;
      }
      if (item.id === "starter_pack") {
        state.coins += 100;
        if (!state.ownedSkins.includes("skin_a")) state.ownedSkins.push("skin_a");
        sdkLog("ok", "payments.purchase(starter_pack)");
        persist(state);
        go("shop");
        return;
      }
      if (state.ownedSkins.includes(item.id)) {
        state.selectedSkin = item.id;
        persist(state);
        go("shop");
        return;
      }
      if (state.coins < item.price) {
        sdkLog("warn", "not enough coins");
        return;
      }
      state.coins -= item.price;
      state.ownedSkins.push(item.id);
      state.selectedSkin = item.id;
      persist(state);
      sdkLog("ok", `buy ${item.id}`);
      go("shop");
    }

    async function go(id) {
      screen = id;
      if (id !== "run" && id !== "pause") stopRunLoop();
      phone.innerHTML = `<div class="mu-safe">${htmlFor(id)}</div>`;
      bindPhone();
      updateSdkBar();
      if (id === "run") paintRunHud();
      if (id === "boot") await runBoot();
    }

    async function runBoot() {
      const bar = phone.querySelector("#mu-boot-bar");
      const msg = phone.querySelector("#mu-boot-msg");
      await ysdk.init();
      if (bar) bar.style.width = "48%";
      if (msg) msg.textContent = "Cloud save / player…";
      await ysdk.getPlayerData();
      if (bar) bar.style.width = "86%";
      if (msg) msg.textContent = "LoadingAPI.ready()";
      ysdk.loadingReady();
      if (bar) bar.style.width = "100%";
      await wait(260);
      go("menu");
    }

    updateSdkBar();
    go("boot");

    return {
      destroy() {
        stopRunLoop();
        window.removeEventListener("keydown", onKey);
        root.innerHTML = "";
      },
    };
  }

  function boot() {
    const el = document.getElementById("mu-app");
    if (!el) return;
    mount(el);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
