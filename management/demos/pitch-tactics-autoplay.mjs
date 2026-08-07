#!/usr/bin/env node
/**
 * Быстрый ИИ vs ИИ прогон без браузера.
 * Usage: node pitch-tactics-autoplay.mjs [opponentId=academy] [--out path]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import vm from "vm";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const oppId = args.find((a) => !a.startsWith("--")) || "academy";
const outIdx = args.indexOf("--out");
const outPath = outIdx >= 0 ? args[outIdx + 1] : null;

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

const t0 = Date.now();
const result = sandbox.window.pitchAutoPlayFullMatch(oppId);
result.elapsedMs = Date.now() - t0;

const json = JSON.stringify(result, null, 2);
if (outPath) {
  fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
  fs.writeFileSync(outPath, json);
  const protoPath = outPath.replace(/\.json$/i, "-protocol.txt");
  fs.writeFileSync(protoPath, (result.protocol || []).join("\n"));
}
process.stdout.write(json + "\n");
process.stderr.write(
  `AI vs AI ${result.opponent}: ${result.score[0]}:${result.score[1]} @${result.minute}' in ${result.elapsedMs}ms\n`
);
