/**
 * Clean Yandex play boot — PRODUCTION only (no DEV∞).
 * Sets DEADLINE_PROD before feel demo loads.
 */
(function () {
  window.DEADLINE_PROD = true;
  window.FEEL_DEMOS = window.FEEL_DEMOS || {};

  const logEl = () => document.getElementById("sdk-log");
  function log(msg) {
    const el = logEl();
    if (!el) return;
    el.textContent = msg;
  }

  const ysdk = {
    ready: false,
    gameplay: false,
    async init() {
      log("YaGames.init…");
      await wait(280);
      log("ysdk ready (DEV_MOCK)");
    },
    loadingReady() {
      if (this.ready) return;
      this.ready = true;
      log("LoadingAPI.ready()");
      try {
        if (window.YaGames && window.ysdk && window.ysdk.features && window.ysdk.features.LoadingAPI) {
          window.ysdk.features.LoadingAPI.ready();
        }
      } catch (_) {}
    },
    gameplayStart() {
      if (this.gameplay) return;
      this.gameplay = true;
      log("GameplayAPI.start()");
      try {
        window.ysdk?.features?.GameplayAPI?.start?.();
      } catch (_) {}
    },
    gameplayStop() {
      if (!this.gameplay) return;
      this.gameplay = false;
      log("GameplayAPI.stop()");
      try {
        window.ysdk?.features?.GameplayAPI?.stop?.();
      } catch (_) {}
    },
  };

  function wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  let handle = null;

  async function boot() {
    const bootUi = document.getElementById("boot");
    const bar = document.getElementById("boot-bar");
    const msg = document.getElementById("boot-msg");
    const playBtn = document.getElementById("btn-play");
    const canvas = document.getElementById("feel-demo");
    // hud used via getElementById("hud") at mount

    await ysdk.init();
    if (bar) bar.style.width = "55%";
    if (msg) msg.textContent = "Ассеты / feel…";
    await wait(200);
    if (bar) bar.style.width = "100%";
    ysdk.loadingReady();
    if (msg) msg.textContent = "Готово";
    playBtn.hidden = false;

    playBtn.addEventListener("click", () => {
      bootUi.hidden = true;
      ysdk.gameplayStart();
      if (!window.FeelDemo || !window.FeelDemo.mount) {
        log("FeelDemo missing");
        return;
      }
      if (handle) handle.destroy();
      handle = window.FeelDemo.mount("deadline-escape", canvas, document.getElementById("hud"));
      log("run · production feel");
    });

    document.getElementById("btn-restart")?.addEventListener("click", () => {
      if (handle) handle.restart();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
