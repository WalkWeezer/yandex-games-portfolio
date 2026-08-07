#!/usr/bin/env node
/**
 * Быстрый ИИ vs ИИ прогон без браузера.
 * Usage:
 *   node pitch-tactics-autoplay.mjs [awayId=academy]
 *   node pitch-tactics-autoplay.mjs rivals --home direct
 *   node pitch-tactics-autoplay.mjs --batch 5 --out /tmp/pitch-batch.json
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

const positional = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--home" && args[args.indexOf(a) - 1] !== "--out" && args[args.indexOf(a) - 1] !== "--batch");
const awayId = positional || "rivals";
const homeStyle = argVal("--home", "direct");
const outPath = argVal("--out", null);
const batchN = Number(argVal("--batch", "0")) || 0;

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
    homeStyle: result.homeStyle,
    opponent: result.opponent,
    awayAi: result.awayAi,
    score: result.score,
    shots: [result.stats.shotsFor, result.stats.shotsAgainst],
    passPct: result.passPct,
    thirdsShare: result.thirdsShare,
    tackles: result.stats.tackles,
    hotCells: result.hotCells,
    topPassLinks: result.topPassLinks,
    quality: result.quality,
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
  for (let i = 0; i < batchN; i++) {
    const opts = EQUAL_ROTATION[i % EQUAL_ROTATION.length];
    const result = play(opts);
    const sum = summarize(result);
    matches.push(sum);
    if (sum.quality.ok) {
      streak++;
      best = Math.max(best, streak);
    } else streak = 0;
    process.stderr.write(
      `#${i + 1} ${opts.homeStyle} vs ${result.opponent}: ${result.score[0]}:${result.score[1]} ` +
        `shots ${sum.shots.join("-")} mid ${Math.round(sum.thirdsShare.mid * 100)}% ` +
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
  const result = play({ awayId, homeStyle });
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
