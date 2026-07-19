/**
 * Работник месяца — вкладка SFX: инвентарь + превью + простой BGM.
 */
(function () {
  function mount(root) {
    const sfx = window.DEADLINE_SFX;
    if (!sfx) {
      root.innerHTML = `<p class="sp-desc">SFX lib не загружена.</p>`;
      return;
    }
    root.innerHTML = `
      <p class="sp-intro" style="max-width:720px;color:var(--muted);font-size:0.92rem;line-height:1.55;margin:0 0 12px">
        Процедурные звуки (Web Audio), без wav. В <strong>Демке</strong> BGM крутится во время дня и встаёт на смерти/повышении.
        Браузер может требовать жест — нажми «Разблокировать аудио».
      </p>
      <div class="sfx-toolbar">
        <button type="button" class="btn-sfx" data-act="unlock">Разблокировать аудио</button>
        <button type="button" class="btn-sfx" data-act="mute">${sfx.isMuted() ? "🔇 SFX выкл" : "🔊 SFX вкл"}</button>
        <button type="button" class="btn-sfx" data-act="music-mute">${sfx.isMusicMuted() ? "🔇 Music выкл" : "🎵 Music вкл"}</button>
        <button type="button" class="btn-sfx" data-act="bgm">${sfx.bgmIsPlaying() ? "⏹ Stop BGM" : "▶ Play BGM"}</button>
      </div>
      <div class="sfx-bgm-card">
        <h4>BGM · <code>office_loop</code></h4>
        <p>Простой луп Cm: бас + арпеджио + тик. В демке темп чуть растёт к авралу, на кофе замедляется.</p>
      </div>
      <div class="sfx-grid"></div>
      <div class="sfx-note">
        MVP: step, coin, coffee, badge, drop, shield_break, caught, promote, near_miss + office_loop.
      </div>
    `;
    const grid = root.querySelector(".sfx-grid");
    const muteBtn = root.querySelector('[data-act="mute"]');
    const musicMuteBtn = root.querySelector('[data-act="music-mute"]');
    const bgmBtn = root.querySelector('[data-act="bgm"]');

    function syncBgmBtn() {
      bgmBtn.textContent = sfx.bgmIsPlaying() ? "⏹ Stop BGM" : "▶ Play BGM";
    }

    root.querySelector('[data-act="unlock"]').addEventListener("click", () => {
      sfx.resume();
      sfx.play("ui_click");
    });
    muteBtn.addEventListener("click", () => {
      const m = sfx.toggleMute();
      muteBtn.textContent = m ? "🔇 SFX выкл" : "🔊 SFX вкл";
      muteBtn.classList.toggle("muted", m);
      if (!m) sfx.play("ui_click");
    });
    muteBtn.classList.toggle("muted", sfx.isMuted());

    musicMuteBtn.addEventListener("click", () => {
      const m = sfx.toggleMusicMute();
      musicMuteBtn.textContent = m ? "🔇 Music выкл" : "🎵 Music вкл";
      musicMuteBtn.classList.toggle("muted", m);
      if (!m) sfx.play("ui_click");
    });
    musicMuteBtn.classList.toggle("muted", sfx.isMusicMuted());

    bgmBtn.addEventListener("click", () => {
      sfx.resume();
      if (sfx.bgmIsPlaying()) sfx.bgmStop();
      else sfx.bgmStart();
      syncBgmBtn();
    });
    syncBgmBtn();

    sfx.catalog.forEach((item) => {
      const card = document.createElement("div");
      card.className = "sfx-card";
      card.innerHTML = `
        <h4>${item.label} · <code>${item.id}</code></h4>
        <div class="sfx-meta">
          <span class="sp-chip ${item.prio === "MVP" ? "ok" : "warn"}">${item.prio}</span>
          <span class="sp-chip">${item.dur}</span>
        </div>
        <p>${item.when}</p>
        <button type="button" class="play">▶ Play</button>
      `;
      card.querySelector(".play").addEventListener("click", () => {
        sfx.resume();
        sfx.play(item.id, { minGap: 0 });
      });
      grid.appendChild(card);
    });
  }

  function boot() {
    const el = document.getElementById("sfx-app");
    if (el) mount(el);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
