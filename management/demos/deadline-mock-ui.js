/**
 * Работник месяца — Beta mock UI
 * Interactive shell: Boot → Menu → Hub → Daily/Run → Pause/Caught/Result → Shop
 * Yandex Games constraints baked in (portrait, LoadingAPI, GameplayAPI, RV, interstitial).
 * Mounts into #mu-app. No games/.../src (design still REVIEW).
 */
(function () {
  const BUILD = "mu250720a";
  const STORAGE_KEY = "deadline-escape-mock-ui-v1";

  const COPY = {
    brand: "РАБОТНИК МЕСЯЦА",
    play: "Играть",
    toWork: "На работу",
    caught: "ЗАСТАВИЛИ РАБОТАТЬ",
    promote: "ПОВЫШЕНИЕ!",
    rv: "Продолжить (реклама)",
    skip: "В результат",
    daily: "Daily · побег из планёрки",
    tut: "Ходи по светлым · избегай боссов · доживи до 18:00",
  };

  const PHASES = [
    { id: "morning", label: "Утро", at: 0 },
    { id: "work", label: "Работа", at: 80 },
    { id: "crunch", label: "Аврал", at: 280 },
    { id: "ot", label: "Переработка", at: 430 },
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
    };
  }

  function saveState(s) {
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
      }));
    } catch (_) {}
  }

  /** DEV_MOCK of Yandex Games SDK — same call sites as production facade. */
  function createYandexMock(log) {
    let ready = false;
    let gameplay = false;
    return {
      isReady: () => ready,
      isGameplay: () => gameplay,
      async init() {
        log("info", "YaGames.init()…");
        await wait(400);
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
        await wait(700);
        log("ok", `RewardedVideo rewarded · ${placement}`);
        return true;
      },
      async showInterstitial(reason) {
        log("warn", `Interstitial.show(${reason})`);
        await wait(500);
        log("ok", "Interstitial closed");
        return true;
      },
      async getPlayerData() {
        log("info", "player.getData() cloud save");
        return {};
      },
      async setPlayerData(data) {
        log("info", "player.setData() " + JSON.stringify(data).slice(0, 80));
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
          <div class="mu-caption">Portrait 360×640 · logical 720×1280 · build ${BUILD}</div>
          <div class="mu-actions">
            <button type="button" class="btn" id="mu-reset">Сброс прогресса</button>
            <button type="button" class="btn ghost" id="mu-open-feel">Открыть Feel-демку</button>
          </div>
        </div>
        <aside class="mu-side">
          <h4>Бета-тест · мок UI</h4>
          <p>Кликай по экранам как в билде. Слева — портретный шелл под Яндекс Игры. Лог SDK справа — проверка ready / gameplay / RV / interstitial.</p>
          <ul class="mu-checks" id="mu-checks">
            <li>Portrait-primary, без landscape MVP</li>
            <li>LoadingAPI.ready до Menu</li>
            <li>GameplayAPI start/stop вокруг Run</li>
            <li>RV только на Caught · interstitial после 1–2 ранов</li>
            <li>Copy: ЗАСТАВИЛИ / ПОВЫШЕНИЕ · без hide</li>
            <li>Daily только с хаба</li>
          </ul>
          <div class="mu-sdk-bar" id="mu-sdk-bar"></div>
          <div class="mu-log" id="mu-log" aria-label="SDK log"></div>
        </aside>
      </div>
    `;

    const phone = root.querySelector("#mu-phone");
    logEl.current = root.querySelector("#mu-log");
    const sdkBar = root.querySelector("#mu-sdk-bar");

    root.querySelector("#mu-reset").addEventListener("click", () => {
      Object.assign(state, defaultState());
      saveState(state);
      sdkLog("warn", "mock progress reset");
      go("boot");
    });
    root.querySelector("#mu-open-feel").addEventListener("click", () => {
      const tab = document.querySelector('.tab[data-tab="demo"]');
      if (tab) tab.click();
      else location.hash = "demo";
    });

    let screen = "boot";
    let run = null;
    let raf = 0;
    let lastTs = 0;

    function updateSdkBar() {
      sdkBar.innerHTML = `
        <span class="mu-sdk-pill ${ysdk.isReady() ? "ok" : "warn"}">LoadingAPI ${ysdk.isReady() ? "ready" : "…"}</span>
        <span class="mu-sdk-pill ${ysdk.isGameplay() ? "ok" : ""}">Gameplay ${ysdk.isGameplay() ? "ON" : "off"}</span>
        <span class="mu-sdk-pill">эт.${state.floor} · 🪙${state.coins}</span>
        <span class="mu-sdk-pill">${state.mute ? "🔇 mute" : "🔊 sfx"}</span>
        <span class="mu-sdk-pill">${state.removeAds ? "no ads" : `ads in ${Math.max(0, 2 - state.runsSinceInterstitial)}`}</span>
      `;
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
        // Feel numbers: minutesPerSecond 18 * TIME_SCALE 0.5 → ~9 game-min / real-sec → ~60s day
        run.gameMin += 18 * 0.5 * dt;
        if (run.gameMin >= 540) {
          run.over = true;
          run.win = true;
          endRun(true);
          return;
        }
        // mock boss drift
        run.bosses.forEach((b, i) => {
          const t = run.gameMin * 0.02 + i;
          b.x = 20 + ((Math.sin(t * (1.1 + i * 0.2)) + 1) / 2) * 60;
          b.y = 18 + ((Math.cos(t * (0.9 + i * 0.15)) + 1) / 2) * 55;
        });
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
      saveState(state);
    }

    async function endRun(win) {
      stopRunLoop();
      ysdk.gameplayStop();
      if (win) {
        state.coins += 24;
        state.floor = Math.min(state.floor + 1, 99);
        state.bestFloor = Math.max(state.bestFloor, state.floor);
        state.unlocked = Math.max(state.unlocked, state.floor);
        saveState(state);
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
        player: { x: 50, y: 62 },
        bosses: [
          { x: 22, y: 28 },
          { x: 70, y: 40 },
        ],
        ally: { x: 48, y: 34 },
      };
      ysdk.gameplayStart();
      go("run");
      startRunLoop();
    }

    function paintRunHud() {
      const clock = phone.querySelector("[data-mu-clock]");
      const phase = phone.querySelector("[data-mu-phase]");
      const bar = phone.querySelector("[data-mu-daybar]");
      const field = phone.querySelector("[data-mu-field]");
      if (!clock || !run) return;
      clock.textContent = fmtClock(run.gameMin);
      const ph = phaseFor(run.gameMin);
      phase.textContent = ph.label;
      if (bar) bar.style.width = `${Math.min(100, (run.gameMin / 540) * 100)}%`;
      if (field) {
        field.innerHTML = `
          <div class="mu-dot" style="left:${run.player.x}%;top:${run.player.y}%"></div>
          <div class="mu-dot ally" style="left:${run.ally.x}%;top:${run.ally.y}%"></div>
          ${run.bosses.map((b) => `<div class="mu-dot boss" style="left:${b.x}%;top:${b.y}%"></div>`).join("")}
          <div class="mu-run-hint">${COPY.tut}<br/><span style="opacity:.8">мок-ран · тап по полю = шаг · ⏸ пауза · ☕/ID баффы</span></div>
        `;
      }
      const shield = phone.querySelector("[data-mu-shield]");
      const coffee = phone.querySelector("[data-mu-coffee]");
      if (shield) shield.classList.toggle("cta", run.shield);
      if (coffee) coffee.classList.toggle("cta", run.coffee);
    }

    function htmlFor(id) {
      if (id === "boot") {
        return `
          <div class="mu-screen active" data-id="boot">
            <div class="mu-grow mu-center">
              <div class="mu-brand">${COPY.brand}<small>Yandex Games · HTML5</small></div>
              <div class="mu-panel tight" style="width:82%;margin-top:18px">
                <div class="mu-label">LoadingAPI</div>
                <div class="mu-sub" id="mu-boot-msg">Инициализация SDK…</div>
                <div class="mu-progress" style="margin-top:10px"><i id="mu-boot-bar" style="width:12%"></i></div>
              </div>
            </div>
            <div class="mu-sub" style="text-align:center">portrait-primary · 720×1280</div>
          </div>`;
      }
      if (id === "menu") {
        return `
          <div class="mu-screen active" data-id="menu">
            <div class="mu-brand">${COPY.brand}<small>Employee of the Month</small></div>
            <div class="mu-art" role="img" aria-label="Style seed"></div>
            <div class="mu-row">
              <div class="mu-chip">🪙 ${state.coins}</div>
              <div class="mu-chip">best эт.${state.bestFloor}</div>
            </div>
            <button type="button" class="mu-btn cta" data-go="hub">${COPY.play}</button>
            <div class="mu-row">
              <button type="button" class="mu-btn" data-go="shop">Магазин</button>
              <button type="button" class="mu-btn" data-go="settings">Настройки</button>
            </div>
          </div>`;
      }
      if (id === "hub") {
        const floors = [];
        for (let i = 1; i <= 6; i++) {
          const locked = i > state.unlocked;
          const current = i === state.floor;
          floors.push(`<button type="button" class="mu-floor ${locked ? "locked" : ""} ${current ? "current" : ""}" data-floor="${i}" ${locked ? "disabled" : ""}>${locked ? "🔒" : i}</button>`);
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
            <button type="button" class="mu-btn cta" data-go="daily" ${state.dailyClaimed ? "disabled" : ""} style="text-align:left">
              <div class="mu-label" style="color:#115e59">${state.dailyClaimed ? "Daily · завтра" : "Daily · сегодня"}</div>
              <div style="font-weight:800;margin-top:2px">${COPY.daily}</div>
              <div class="mu-sub">${state.dailyClaimed ? "Награда уже получена" : "1/день · тап → выбор смены"}</div>
            </button>
            <div class="mu-grow">
              <div class="mu-label">Этажи</div>
              <div class="mu-floors">${floors.join("")}</div>
            </div>
            <div class="mu-panel tight"><div class="mu-sub">Боссы этажа ${state.floor}: HR · Дир · ГЛЯД</div></div>
            <button type="button" class="mu-btn cta" data-action="work">${COPY.toWork} · эт.${state.floor} →</button>
            <div class="mu-row">
              <button type="button" class="mu-btn" data-go="shop">Магазин</button>
              <button type="button" class="mu-btn" data-go="menu">← Меню</button>
            </div>
          </div>`;
      }
      if (id === "daily") {
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
              <div class="mu-panel ok">
                <div class="mu-label">выбрано</div>
                <div class="mu-title" style="font-size:1rem">Побег из планёрки</div>
                <div class="mu-sub">Дожить до 15:00 · без кофе · 🎁 🪙40 + бейдж</div>
              </div>
              <div class="mu-panel tight">
                <div class="mu-label">альтернатива</div>
                <div style="font-weight:700">Тихий этаж</div>
                <div class="mu-sub">Только HR · до 18:00 · 🎁 🪙25</div>
              </div>
            </div>
            <button type="button" class="mu-btn cta" data-action="daily-start">Взять смену →</button>
            <button type="button" class="mu-btn" data-go="hub">Обычный этаж (хаб)</button>
          </div>`;
      }
      if (id === "run") {
        return `
          <div class="mu-screen active" data-id="run">
            <div class="mu-hud">
              <span data-mu-clock>09:00</span>
              <span>эт.${state.floor}</span>
              <span>🪙${state.coins}</span>
              <button type="button" class="mu-btn icon" data-action="pause" title="Пауза">⏸</button>
            </div>
            <div class="mu-phase" data-mu-phase>Утро</div>
            <div class="mu-progress"><i data-mu-daybar style="width:0%"></i></div>
            <div class="mu-playfield" data-mu-field data-action="step"></div>
            <div class="mu-row">
              <button type="button" class="mu-btn" data-mu-coffee data-action="coffee">☕ кофе</button>
              <button type="button" class="mu-btn" data-mu-shield data-action="badge">ID бейдж</button>
              <button type="button" class="mu-btn danger" data-action="caught">удар</button>
            </div>
          </div>`;
      }
      if (id === "pause") {
        return `
          <div class="mu-screen active" data-id="pause" style="position:relative">
            <div class="mu-hud" style="opacity:.5"><span>${run ? fmtClock(run.gameMin) : "09:00"}</span><span>эт.${state.floor}</span><span>🪙${state.coins}</span><span>⏸</span></div>
            <div class="mu-playfield" style="opacity:.35"></div>
            <div class="mu-modal-dim">
              <div class="mu-modal">
                <div class="mu-title" style="text-align:center">ПАУЗА</div>
                <div class="mu-sub" style="text-align:center">GameplayAPI остаётся ON до выхода в хаб</div>
                <button type="button" class="mu-btn cta" data-action="resume">Продолжить</button>
                <button type="button" class="mu-btn" data-go="settings">Настройки</button>
                <button type="button" class="mu-btn" data-action="quit-hub">В хаб</button>
                <div class="mu-panel tight"><div class="mu-sub">Interstitial — не на паузе (слот после рана)</div></div>
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
            <button type="button" class="mu-btn cta" data-action="rv">▶ ${COPY.rv}</button>
            <button type="button" class="mu-btn" data-go="result_fail">${COPY.skip}</button>
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
              <div class="mu-panel tight"><div class="mu-sub">Leaderboard / share — later</div></div>
            </div>
            <button type="button" class="mu-btn cta" data-action="work">Следующий этаж</button>
            <button type="button" class="mu-btn" data-go="hub">В хаб</button>
          </div>`;
      }
      if (id === "result_fail") {
        return `
          <div class="mu-screen active" data-id="result_fail">
            <div class="mu-panel danger">
              <div class="mu-label">Result</div>
              <div class="mu-title">Смена сорвана</div>
            </div>
            <div class="mu-grow">
              <div class="mu-panel tight">Этаж ${state.floor}</div>
              <div class="mu-panel tight">Время ${run ? fmtClock(run.gameMin) : "—"}</div>
              <div class="mu-panel tight">🪙 ${state.coins}</div>
            </div>
            <button type="button" class="mu-btn cta" data-action="work">Ещё раз</button>
            <button type="button" class="mu-btn" data-go="hub">В хаб</button>
          </div>`;
      }
      if (id === "shop") {
        return `
          <div class="mu-screen active" data-id="shop">
            <div class="mu-row">
              <button type="button" class="mu-btn icon" data-go="hub">←</button>
              <div class="mu-panel tight mu-grow"><div class="mu-title">Магазин</div></div>
              <div class="mu-chip">🪙 ${state.coins}</div>
            </div>
            <div class="mu-grow">
              <div class="mu-shop-grid">
                <div class="mu-shop-card">Скин A<br/>50🪙</div>
                <div class="mu-shop-card">Скин B<br/>80🪙</div>
                <div class="mu-shop-card">Стартер<br/>IAP</div>
                <div class="mu-shop-card ${state.removeAds ? "locked" : ""}">${state.removeAds ? "No ads ✓" : "Убрать рекламу<br/>IAP"}</div>
              </div>
            </div>
            <button type="button" class="mu-btn cta" data-action="buy-noads" ${state.removeAds ? "disabled" : ""}>Купить · remove ads</button>
            <div class="mu-sub">IAP ids: remove_ads · starter_pack · skin_*</div>
          </div>`;
      }
      if (id === "settings") {
        return `
          <div class="mu-screen active" data-id="settings">
            <div class="mu-row">
              <button type="button" class="mu-btn icon" data-action="settings-back">←</button>
              <div class="mu-panel tight mu-grow"><div class="mu-title">Настройки</div></div>
            </div>
            <div class="mu-grow">
              <button type="button" class="mu-btn" data-action="toggle-mute">${state.mute ? "🔇 Звук выкл" : "🔊 Звук вкл"}</button>
              <div class="mu-panel tight">
                <div class="mu-label">Яндекс Игры</div>
                <div class="mu-sub">Cloud save · язык RU · портрет · SDK DEV_MOCK</div>
              </div>
              <div class="mu-panel tight">
                <div class="mu-label">Сборка</div>
                <div class="mu-sub">${BUILD} · feel SoT в вкладке Демка</div>
              </div>
            </div>
          </div>`;
      }
      return `<div class="mu-screen active"><div class="mu-panel">Unknown screen</div></div>`;
    }

    let settingsReturn = "menu";

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
            saveState(state);
            go("hub");
          }
        });
      });
      phone.querySelectorAll("[data-action]").forEach((btn) => {
        btn.addEventListener("click", async (ev) => {
          const act = btn.getAttribute("data-action");
          if (act === "work") beginRun({ daily: false });
          else if (act === "daily-start") {
            state.dailyClaimed = true;
            saveState(state);
            beginRun({ daily: true });
          } else if (act === "pause") {
            if (run) run.paused = true;
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
          } else if (act === "caught") {
            if (!run || run.over) return;
            if (run.shield) {
              run.shield = false;
              sdkLog("ok", "shield_break · i-frames");
              paintRunHud();
              return;
            }
            run.over = true;
            run.win = false;
            endRun(false);
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
          } else if (act === "coffee") {
            if (!run) return;
            run.coffee = !run.coffee;
            sdkLog("info", run.coffee ? "coffee slow-mo ON (world 0.42)" : "coffee OFF");
            paintRunHud();
          } else if (act === "badge") {
            if (!run) return;
            run.shield = !run.shield;
            sdkLog("info", run.shield ? "badge shield ON" : "badge OFF");
            paintRunHud();
          } else if (act === "step") {
            if (!run || run.paused || run.over) return;
            // mock one step toward click
            const rect = btn.getBoundingClientRect();
            const x = ((ev.clientX - rect.left) / rect.width) * 100;
            const y = ((ev.clientY - rect.top) / rect.height) * 100;
            run.player.x = Math.max(12, Math.min(88, x));
            run.player.y = Math.max(14, Math.min(86, y));
            sdkLog("info", "GridMove step (mock)");
            paintRunHud();
          } else if (act === "toggle-mute") {
            state.mute = !state.mute;
            saveState(state);
            go("settings");
          } else if (act === "settings-back") {
            go(settingsReturn === "pause" ? "pause" : settingsReturn || "menu");
          } else if (act === "buy-noads") {
            state.removeAds = true;
            state.coins = Math.max(0, state.coins - 0);
            saveState(state);
            sdkLog("ok", "payments.purchase(remove_ads) DEV_MOCK");
            go("shop");
          }
        });
      });
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
      if (bar) bar.style.width = "55%";
      if (msg) msg.textContent = "Cloud save / player…";
      await ysdk.getPlayerData();
      if (bar) bar.style.width = "88%";
      if (msg) msg.textContent = "LoadingAPI.ready()";
      ysdk.loadingReady();
      if (bar) bar.style.width = "100%";
      await wait(280);
      go("menu");
    }

    updateSdkBar();
    go("boot");

    return {
      destroy() {
        stopRunLoop();
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
