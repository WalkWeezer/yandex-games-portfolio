/**
 * Работник месяца — процедурный SFX + простой BGM-луп (Web Audio).
 * window.DEADLINE_SFX.play(id) · .bgmStart/Stop · .resume() · mute
 */
(function () {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  let ctx = null;
  let master = null;
  let musicBus = null;
  let muted = false;
  let musicMuted = false;
  const lastPlay = Object.create(null);

  // BGM state
  let bgmOn = false;
  let bgmStep = 0;
  let bgmTimer = 0;
  let bgmRate = 1; // 1..~1.25 от фазы дня
  let bgmSlow = 1; // кофе slow-mo

  function ensure() {
    if (!AudioCtx) return null;
    if (!ctx) {
      ctx = new AudioCtx();
      master = ctx.createGain();
      master.gain.value = 0.35;
      master.connect(ctx.destination);
      musicBus = ctx.createGain();
      musicBus.gain.value = 0.22;
      musicBus.connect(master);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function env(gainNode, t0, a, peak, d, sustain, rel) {
    const g = gainNode.gain;
    g.cancelScheduledValues(t0);
    g.setValueAtTime(0.0001, t0);
    g.exponentialRampToValueAtTime(Math.max(0.001, peak), t0 + a);
    g.exponentialRampToValueAtTime(Math.max(0.001, sustain), t0 + a + d);
    g.exponentialRampToValueAtTime(0.0001, t0 + a + d + rel);
  }

  function tone(freq, dur, type, peak, slideTo) {
    const c = ensure();
    if (!c || muted) return;
    const t0 = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo != null) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    env(g, t0, 0.01, peak || 0.2, dur * 0.25, (peak || 0.2) * 0.4, dur * 0.55);
    o.connect(g);
    g.connect(master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  function noiseBurst(dur, peak, filterFreq, filterType) {
    const c = ensure();
    if (!c || muted) return;
    const t0 = c.currentTime;
    const len = Math.max(1, (dur * c.sampleRate) | 0);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    const f = c.createBiquadFilter();
    f.type = filterType || "bandpass";
    f.frequency.value = filterFreq || 800;
    f.Q.value = 1.2;
    env(g, t0, 0.005, peak || 0.25, dur * 0.2, (peak || 0.25) * 0.3, dur * 0.6);
    src.connect(f);
    f.connect(g);
    g.connect(master);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  const RECIPES = {
    step() {
      noiseBurst(0.045, 0.12, 420, "lowpass");
      tone(90, 0.04, "triangle", 0.06);
    },
    coin() {
      tone(880, 0.08, "square", 0.12, 1320);
      setTimeout(() => tone(1320, 0.1, "square", 0.08), 60);
    },
    coffee() {
      tone(220, 0.12, "sine", 0.1, 180);
      noiseBurst(0.1, 0.08, 600, "lowpass");
      setTimeout(() => tone(330, 0.15, "sine", 0.07), 80);
    },
    badge() {
      tone(520, 0.1, "triangle", 0.14, 780);
      setTimeout(() => tone(780, 0.14, "triangle", 0.1, 1040), 70);
    },
    shield_break() {
      noiseBurst(0.18, 0.28, 1200, "bandpass");
      tone(180, 0.2, "sawtooth", 0.12, 60);
    },
    caught() {
      tone(200, 0.25, "sawtooth", 0.18, 80);
      setTimeout(() => tone(120, 0.35, "square", 0.14, 55), 120);
      noiseBurst(0.3, 0.2, 300, "lowpass");
    },
    promote() {
      tone(523, 0.12, "square", 0.12);
      setTimeout(() => tone(659, 0.12, "square", 0.12), 100);
      setTimeout(() => tone(784, 0.18, "square", 0.14), 200);
      setTimeout(() => tone(1046, 0.28, "triangle", 0.12), 320);
    },
    near_miss() {
      tone(640, 0.06, "square", 0.06, 400);
    },
    drop() {
      tone(280, 0.08, "triangle", 0.1, 140);
      noiseBurst(0.06, 0.1, 900, "highpass");
    },
    ui_click() {
      tone(660, 0.04, "square", 0.08);
    },
  };

  const CATALOG = [
    { id: "step", label: "Шаг", when: "Игрок сходил на клетку", dur: "~45ms", prio: "MVP" },
    { id: "coin", label: "Монета", when: "Подобрал coin", dur: "~150ms", prio: "MVP" },
    { id: "coffee", label: "Кофе", when: "Подобрал slow-mo с карты", dur: "~200ms", prio: "MVP" },
    { id: "badge", label: "Бейдж", when: "Подобрал щит с пола", dur: "~200ms", prio: "MVP" },
    { id: "drop", label: "Падение", when: "Бейдж упал на пол", dur: "~90ms", prio: "MVP" },
    { id: "shield_break", label: "Щит лопнул", when: "Поглощён удар", dur: "~200ms", prio: "MVP" },
    { id: "caught", label: "Поймали", when: "Смерть / ЗАСТАВИЛИ", dur: "~400ms", prio: "MVP" },
    { id: "promote", label: "Повышение", when: "Дожил до 18:00", dur: "~500ms", prio: "MVP" },
    { id: "near_miss", label: "Near miss", when: "Босс рядом (клетка)", dur: "~60ms", prio: "nice" },
    { id: "ui_click", label: "UI click", when: "Кнопки каталога / меню", dur: "~40ms", prio: "MVP" },
  ];

  function play(id, opts) {
    const minGap = (opts && opts.minGap) != null ? opts.minGap : (id === "step" ? 0.07 : 0.03);
    const now = performance.now() / 1000;
    if (lastPlay[id] != null && now - lastPlay[id] < minGap) return;
    lastPlay[id] = now;
    const fn = RECIPES[id];
    if (fn) {
      try { fn(); } catch (_) { /* ignore autoplay */ }
    }
  }

  /** Тихий тон в musicBus (не режется SFX mute). */
  function mTone(freq, dur, type, peak, slideTo, when) {
    const c = ensure();
    if (!c || musicMuted || !musicBus) return;
    const t0 = when != null ? when : c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "triangle";
    o.frequency.setValueAtTime(freq, t0);
    if (slideTo != null) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    env(g, t0, 0.02, peak || 0.08, dur * 0.3, (peak || 0.08) * 0.35, dur * 0.5);
    o.connect(g);
    g.connect(musicBus);
    o.start(t0);
    o.stop(t0 + dur + 0.04);
  }

  function mNoise(dur, peak, filterFreq, when) {
    const c = ensure();
    if (!c || musicMuted || !musicBus) return;
    const t0 = when != null ? when : c.currentTime;
    const len = Math.max(1, (dur * c.sampleRate) | 0);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    const f = c.createBiquadFilter();
    f.type = "highpass";
    f.frequency.value = filterFreq || 2500;
    env(g, t0, 0.002, peak || 0.04, dur * 0.15, (peak || 0.04) * 0.2, dur * 0.7);
    src.connect(f);
    f.connect(g);
    g.connect(musicBus);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  // Офисный тревожный луп: Cm, 16 шагов × 1/8
  // Бас: C G Ab Eb | мелодия: C Eb G Bb …
  const BGM_BASS = [130.81, 0, 98.00, 0, 103.83, 0, 77.78, 0, 130.81, 0, 98.00, 0, 103.83, 0, 116.54, 0];
  const BGM_LEAD = [261.63, 311.13, 392.00, 466.16, 392.00, 311.13, 261.63, 233.08, 261.63, 311.13, 349.23, 311.13, 261.63, 196.00, 233.08, 261.63];
  const BGM_BASE_BPM = 92;

  function bgmScheduleStep(step, when) {
    const bass = BGM_BASS[step % BGM_BASS.length];
    const lead = BGM_LEAD[step % BGM_LEAD.length];
    if (bass) mTone(bass, 0.22, "triangle", 0.09, bass * 0.92, when);
    if (lead && step % 2 === 0) mTone(lead, 0.16, "square", 0.045, lead * 1.02, when);
    if (step % 2 === 1) mNoise(0.03, 0.028, 3200, when);
    if (step % 8 === 0) mTone(65.41, 0.28, "sine", 0.06, 55, when);
  }

  function bgmTick() {
    if (!bgmOn) return;
    const c = ensure();
    if (!c) {
      bgmTimer = setTimeout(bgmTick, 200);
      return;
    }
    const stepDur = (60 / (BGM_BASE_BPM * bgmRate * bgmSlow)) / 2; // eighths
    const now = c.currentTime;
    // lookahead ~120ms
    let t = Math.max(now + 0.02, (bgmTick._nextT || now + 0.02));
    const ahead = now + 0.14;
    while (t < ahead) {
      bgmScheduleStep(bgmStep, t);
      bgmStep += 1;
      t += stepDur;
    }
    bgmTick._nextT = t;
    bgmTimer = setTimeout(bgmTick, 40);
  }

  function bgmStart() {
    ensure();
    if (bgmOn) return;
    bgmOn = true;
    bgmStep = 0;
    bgmTick._nextT = 0;
    clearTimeout(bgmTimer);
    bgmTick();
  }

  function bgmStop() {
    bgmOn = false;
    clearTimeout(bgmTimer);
    bgmTimer = 0;
    bgmTick._nextT = 0;
  }

  function bgmSetParams(opts) {
    if (!opts) return;
    if (opts.rate != null) bgmRate = Math.max(0.85, Math.min(1.35, opts.rate));
    if (opts.slow != null) bgmSlow = opts.slow ? 0.72 : 1;
  }

  window.DEADLINE_SFX = {
    catalog: CATALOG,
    play,
    resume() { ensure(); },
    isMuted() { return muted; },
    setMute(v) { muted = !!v; },
    toggleMute() { muted = !muted; return muted; },
    isMusicMuted() { return musicMuted; },
    setMusicMute(v) { musicMuted = !!v; },
    toggleMusicMute() { musicMuted = !musicMuted; return musicMuted; },
    bgmStart,
    bgmStop,
    bgmIsPlaying() { return bgmOn; },
    bgmSetParams,
  };
})();
