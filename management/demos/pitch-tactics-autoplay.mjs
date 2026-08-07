#!/usr/bin/env node
/**
 * Быстрый ИИ vs ИИ прогон без браузера.
 * Usage:
 *   node pitch-tactics-autoplay.mjs [awayId=academy]
 *   node pitch-tactics-autoplay.mjs rivals --home direct
 *   node pitch-tactics-autoplay.mjs --batch 5 --out /tmp/pitch-batch.json
 *   node pitch-tactics-autoplay.mjs --batch 12 --spread --out /tmp/spread.json
 *   node pitch-tactics-autoplay.mjs elite --home direct --home-mult 0.85 --spread-skill 1.0
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import vm from "vm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);

function argVal(flag, fallback) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : fallback;
}

const flagArgs = new Set(["--home", "--out", "--batch", "--home-mult", "--away-mult", "--spread-skill"]);
const positional = args.find((a, i) => !a.startsWith("--") && !flagArgs.has(args[i - 1]));
const awayId = positional || "rivals";
const homeStyle = argVal("--home", "direct");
const outPath = argVal("--out", null);
const batchN = Number(argVal("--batch", "0")) || 0;
const homeMultArg = argVal("--home-mult", null);
const awayMultArg = argVal("--away-mult", null);
const skillSpreadArg = argVal("--spread-skill", null);
const spreadMode = args.includes("--spread");

const EQUAL_ROTATION = [
  { awayId: "rivals", homeStyle: "direct" },
  { awayId: "wingers", homeStyle: "possess" },
  { awayId: "vertical", homeStyle: "width" },
  { awayId: "rivals", homeStyle: "width" },
  { awayId: "wingers", homeStyle: "direct" },
  { awayId: "vertical", homeStyle: "possess" },
  { awayId: "rivals", homeStyle: "possess" },
  { awayId: "wingers", homeStyle: "width" },
  { awayId: "vertical", homeStyle: "direct" },
];

/** Большой разброс силы команд + джиттер игроков */
const SPREAD_ROTATION = [
  { label: "weak-vs-home", awayId: "academy", homeStyle: "direct", homeMult: 1.0, skillSpread: 0.6 },
  { label: "home-weak-vs-equal", awayId: "rivals", homeStyle: "possess", homeMult: 0.7, skillSpread: 0.8 },
  { label: "equal-width", awayId: "wingers", homeStyle: "width", homeMult: 1.0, skillSpread: 0.7 },
  { label: "home-strong-vs-equal", awayId: "vertical", homeStyle: "direct", homeMult: 1.2, skillSpread: 0.9 },
  { label: "vs-press", awayId: "press", homeStyle: "possess", homeMult: 0.95, skillSpread: 0.7 },
  { label: "vs-elite", awayId: "elite", homeStyle: "width", homeMult: 0.85, skillSpread: 1.0 },
  { label: "giant-killing", awayId: "elite", homeStyle: "direct", homeMult: 1.15, skillSpread: 1.1 },
  { label: "academy-crush", awayId: "academy", homeStyle: "possess", homeMult: 1.25, skillSpread: 0.5 },
  { label: "mirror-chaos", awayId: "rivals", homeStyle: "width", homeMult: 1.0, awayMult: 1.05, skillSpread: 0.7 },
  { label: "underdog-width", awayId: "press", homeStyle: "width", homeMult: 0.75, skillSpread: 1.0 },
  { label: "direct-duel", awayId: "vertical", homeStyle: "direct", homeMult: 1.05, awayMult: 0.9, skillSpread: 0.8 },
  { label: "possession-clash", awayId: "rivals", homeStyle: "possess", homeMult: 0.9, awayMult: 1.15, skillSpread: 0.9 },
];

function stubEl(tag) {
  const el = {
    tagName: String(tag || "div").toUpperCase(),
    style: {},
    classList: {
      _s: new Set(),
      add(...xs) {
        xs.forEach((x) => el.classList._s.add(x));
      },
      remove(...xs) {
        xs.forEach((x) => el.classList._s.delete(x));
      },
      toggle(x, force) {
        if (force === true) el.classList._s.add(x);
        else if (force === false) el.classList._s.delete(x);
        else if (el.classList._s.has(x)) el.classList._s.delete(x);
        else el.classList._s.add(x);
      },
      contains(x) {
        return el.classList._s.has(x);
      },
    },
    dataset: {},
    children: [],
    childNodes: [],
    innerHTML: "",
    textContent: "",
    value: "",
    disabled: false,
    onclick: null,
    appendChild(c) {
      el.children.push(c);
      el.childNodes.push(c);
      return c;
    },
    removeChild() {},
    querySelector() {
      return stubEl("div");
    },
    querySelectorAll() {
      return [];
    },
    addEventListener() {},
    removeEventListener() {},
    setAttribute() {},
    getAttribute() {
      return null;
    },
    removeAttribute() {},
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600 };
    },
    focus() {},
    blur() {},
  };
  return el;
}

const app = stubEl("div");
app.id = "app";

const document = {
  body: stubEl("body"),
  documentElement: stubEl("html"),
  getElementById(id) {
    return id === "app" ? app : stubEl("div");
  },
  querySelector() {
    return stubEl("div");
  },
  querySelectorAll() {
    return [];
  },
  createElement(tag) {
    return stubEl(tag);
  },
  createElementNS(_ns, tag) {
    return stubEl(tag);
  },
  addEventListener() {},
  removeEventListener() {},
};

const window = {
  document,
  location: { search: "", href: "http://localhost/pitch-tactics-autoplay" },
  addEventListener() {},
  removeEventListener() {},
  requestAnimationFrame(cb) {
    return setTimeout(cb, 0);
  },
  setTimeout,
  clearTimeout,
  Math,
  JSON,
  console,
  __PITCH_NODE_AUTOPLAY__: true,
};
window.window = window;
window.globalThis = window;

const sandbox = {
  window,
  document,
  globalThis: window,
  location: window.location,
  requestAnimationFrame: window.requestAnimationFrame,
  setTimeout,
  clearTimeout,
  Math,
  JSON,
  console,
  __PITCH_NODE_AUTOPLAY__: true,
};

const code = fs.readFileSync(path.join(__dirname, "pitch-tactics-play.js"), "utf8");
vm.runInNewContext(code, sandbox, { filename: "pitch-tactics-play.js" });

function summarize(result) {
  return {
    label: result.label || null,
    homeStyle: result.homeStyle,
    homeMult: result.homeMult,
    awayMult: result.awayMult,
    skillSpread: result.skillSpread,
    opponent: result.opponent,
    awayAi: result.awayAi,
    awayTier: result.awayTier,
    score: result.score,
    shots: [result.stats.shotsFor, result.stats.shotsAgainst],
    sot: result.sot,
    xg: result.xg,
    xa: result.xa,
    possessionPct: result.possessionPct,
    attackDirection: result.attackDirection,
    passPct: result.passPct,
    thirdsShare: result.thirdsShare,
    tackles: result.stats.tackles,
    squadAvg: {
      home: result.squads && result.squads.home ? result.squads.home.avg : null,
      away: result.squads && result.squads.away ? result.squads.away.avg : null,
    },
    team: result.advanced ? result.advanced.team : null,
    heatMap: result.heatMap
      ? { max: result.heatMap.max, samples: result.heatMap.samples, top: result.heatMap.top, ascii: result.heatMap.ascii }
      : null,
    passMap: result.passMap
      ? {
          totalCompletedLinks: result.passMap.totalCompletedLinks,
          uniqueLinks: result.passMap.uniqueLinks,
          top: result.passMap.top,
          zones: result.passMap.zones,
          ascii: result.passMap.ascii,
        }
      : null,
    hotCells: result.hotCells,
    topPassLinks: result.topPassLinks,
    quality: result.quality,
    qualityNotes: result.quality && result.quality.notes ? result.quality.notes : [],
    elapsedMs: result.elapsedMs,
  };
}

function play(opts) {
  const t0 = Date.now();
  const result = sandbox.window.pitchAutoPlayFullMatch(opts);
  result.elapsedMs = Date.now() - t0;
  return result;
}

if (batchN > 0) {
  const matches = [];
  let streak = 0;
  let best = 0;
  const rotation = spreadMode ? SPREAD_ROTATION : EQUAL_ROTATION;
  for (let i = 0; i < batchN; i++) {
    const opts = { ...rotation[i % rotation.length] };
    if (homeMultArg != null) opts.homeMult = Number(homeMultArg);
    if (awayMultArg != null) opts.awayMult = Number(awayMultArg);
    if (skillSpreadArg != null) opts.skillSpread = Number(skillSpreadArg);
    const result = play(opts);
    result.label = opts.label || null;
    const sum = summarize(result);
    matches.push(sum);
    if (sum.quality.ok) {
      streak++;
      best = Math.max(best, streak);
    } else streak = 0;
    const xg = sum.xg ? `${sum.xg.A}-${sum.xg.B}` : "?";
    const poss = sum.possessionPct ? `${sum.possessionPct.A}/${sum.possessionPct.B}` : "?";
    process.stderr.write(
      `#${i + 1} ${opts.label || opts.homeStyle} vs ${result.opponent}: ${result.score[0]}:${result.score[1]} ` +
        `shots ${sum.shots.join("-")} SoT ${(sum.sot && sum.sot.A) || 0}-${(sum.sot && sum.sot.B) || 0} ` +
        `xG ${xg} poss ${poss} mid ${Math.round(sum.thirdsShare.mid * 100)}% ` +
        `${sum.quality.ok ? "OK" : "FAIL " + sum.quality.issues.join("; ")} (${result.elapsedMs}ms)\n`
    );
  }
  const payload = { bestStreak: best, okRate: matches.filter((m) => m.quality.ok).length / matches.length, matches };
  const json = JSON.stringify(payload, null, 2);
  if (outPath) {
    fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
    fs.writeFileSync(outPath, json);
  }
  process.stdout.write(json + "\n");
} else {
  const singleOpts = { awayId, homeStyle };
  if (homeMultArg != null) singleOpts.homeMult = Number(homeMultArg);
  if (awayMultArg != null) singleOpts.awayMult = Number(awayMultArg);
  if (skillSpreadArg != null) singleOpts.skillSpread = Number(skillSpreadArg);
  const result = play(singleOpts);
  const json = JSON.stringify(result, null, 2);
  if (outPath) {
    fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
    fs.writeFileSync(outPath, json);
    const protoPath = outPath.replace(/\.json$/i, "-protocol.txt");
    fs.writeFileSync(protoPath, (result.protocol || []).join("\n"));
  }
  process.stdout.write(json + "\n");
  process.stderr.write(
    `AI vs AI ${homeStyle} vs ${result.opponent}: ${result.score[0]}:${result.score[1]} @${result.minute}' ` +
      `q=${result.quality.ok} in ${result.elapsedMs}ms\n`
  );
}
