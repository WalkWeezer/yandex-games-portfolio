#!/usr/bin/env node
/**
 * Headless checks for deadline-escape mob AI (feel SoT).
 * Run: node management/tools/test_deadline_mobs.js
 */
global.window = global;
window.FEEL_DEMOS = {};
require("fs").readFileSync;
const fs = require("fs");
const path = require("path");
const src = fs.readFileSync(path.join(__dirname, "../demos/demos-01-02.js"), "utf8");
// eslint-disable-next-line no-eval
eval(src);

const demo = window.FEEL_DEMOS["deadline-escape"];
if (!demo) {
  console.error("FEEL_DEMOS['deadline-escape'] missing");
  process.exit(1);
}

const api = {
  w: 360,
  h: 640,
  pick: (arr) => arr[(Math.random() * arr.length) | 0],
  setHud() {},
  input: {
    consumeTap: () => null,
    consumeSwipe: () => null,
    axis: () => ({ x: 0, y: 0 }),
    keys: {},
  },
  drawBanner() {},
};

function makeState(floor = 45) {
  const s = { padX: 12, padT: 72, padB: 24, floor, totalMin: 540, coins: 0 };
  demo.resetDay(s, api, { floor, tutorial: 0 });
  s.invuln = 99;
  return s;
}

function placeThreatOnPlay(s, kindId, dir = "down") {
  const kind = demo.KINDS.find((k) => k.id === kindId);
  const opts = demo.edgeSpawns(s, dir);
  if (!opts.length) return null;
  const pick = opts.find((o) => demo.corridorClear(s, o.col, o.row, dir, 3)) || opts[0];
  const t = demo.baseThreat(s, kind, dir, pick);
  const d = demo.DIRS[dir];
  let c = pick.col;
  let r = pick.row;
  for (let i = 0; i < 6; i++) {
    c += d.dc;
    r += d.dr;
    if (demo.walkable(s, c, r)) {
      t.col = c;
      t.row = r;
      t.entered = true;
      t.frac = 0;
      break;
    }
  }
  if (!t.entered) return null;
  return t;
}

const results = [];
function ok(name, cond, detail = "") {
  results.push({ name, pass: !!cond, detail });
  if (!cond) console.log("FAIL", name, detail);
}

// edge spawns never leave along fog strip
{
  const s = makeState(8);
  for (const dir of ["down", "up", "left", "right"]) {
    const opts = demo.edgeSpawns(s, dir);
    ok(`edgeSpawns ${dir} nonempty`, opts.length > 0, `n=${opts.length}`);
    let bad = 0;
    for (const o of opts) {
      if (!demo.edgeLeadsToPlay(s, o.col, o.row, dir)) bad++;
    }
    ok(`edgeSpawns ${dir} lead to play`, bad === 0, `bad=${bad}`);
  }
}

// hasEscape lane patterns
{
  const s = makeState(10);
  const kind = demo.KINDS.find((k) => k.id === "urgent");
  const opts = demo.edgeSpawns(s, "down");
  const t = demo.baseThreat(s, kind, "down", opts[0]);
  ok("isLaneThreat(dash)", demo.isLaneThreat(t));
  ok("not isLaneThreat(weave)", !demo.isLaneThreat({ pattern: "weave" }));
  const ghost = { ...t, col: opts[0].col, row: opts[0].row };
  ok("hasEscape runs for dash", typeof demo.hasEscape(s, [ghost]) === "boolean");
}

// hold vs peek
{
  const s = makeState(20);
  const hold = placeThreatOnPlay(s, "meeting", "down");
  const peek = placeThreatOnPlay(s, "looker", "down");
  ok("place hold/peek", !!(hold && peek));
  if (hold && peek) {
    ok(
      "hold waitDur longer",
      hold.waitDur >= 1.85 && peek.waitDur < 1.6,
      `hold=${hold.waitDur} peek=${peek.waitDur}`
    );
  }
}

// hold: wait + reverse
{
  const s = makeState(20);
  const t = placeThreatOnPlay(s, "meeting", "down");
  ok("hold placed", !!t);
  if (t) {
    t.peekDepth = 1;
    t.waitDur = 0.2;
    const inDc = t.dc;
    const inDr = t.dr;
    let sawWait = false;
    let sawReverse = false;
    let sawHoldDone = false;
    for (let i = 0; i < 400; i++) {
      demo.advanceThreat(s, t, 2.35, 0.05);
      if (t.peekPhase === "wait") {
        sawWait = true;
        if (t.holdDone) sawHoldDone = true;
      }
      if (t.peekPhase === "out" && t.dc === -inDc && t.dr === -inDr) sawReverse = true;
      if (t._dead) break;
    }
    ok("hold waits", sawWait);
    ok("hold sets holdDone", sawHoldDone);
    ok("hold reverses after wait", sawReverse, `phase=${t.peekPhase} dc=${t.dc}`);
  }
}

// peek reverse
{
  const s = makeState(10);
  const t = placeThreatOnPlay(s, "looker", "down");
  if (t) {
    t.peekDepth = 1;
    t.waitDur = 0.15;
    const inDc = t.dc;
    const inDr = t.dr;
    let sawReverse = false;
    for (let i = 0; i < 300; i++) {
      demo.advanceThreat(s, t, 2.35, 0.05);
      if (t.peekPhase === "out" && t.dc === -inDc && t.dr === -inDr) sawReverse = true;
      if (t._dead) break;
    }
    ok("peek reverses", sawReverse);
  } else ok("peek placed", false);
}

// patrol axis fallback
{
  const s = makeState(20);
  const b = s.border;
  let cell = null;
  for (let r = b + 1; r < s.rows - b - 1 && !cell; r++) {
    for (let c = b + 1; c < s.cols - b - 1; c++) {
      if (demo.walkable(s, c, r)) {
        cell = { c, r };
        break;
      }
    }
  }
  ok("patrol fixture cell", !!cell);
  if (cell) {
    const { c, r } = cell;
    if (c - 1 >= b) s.map[r][c - 1] = 1;
    if (c + 1 < s.cols - b) s.map[r][c + 1] = 1;
    if (!demo.walkable(s, c, r - 1)) s.map[r - 1][c] = 0;
    if (!demo.walkable(s, c, r + 1)) s.map[r + 1][c] = 0;
    const kind = demo.KINDS.find((k) => k.id === "guard");
    const pick = demo.edgeSpawns(s, "down")[0];
    const t = demo.baseThreat(s, kind, "down", pick);
    t.col = c;
    t.row = r;
    t.entered = true;
    t.frac = 0;
    t.homeDir = "down";
    demo.patrolPickDir(s, t);
    ok("patrol picks vertical when horiz blocked", t.dr !== 0 && t.dc === 0, `dc=${t.dc} dr=${t.dr}`);
    let deadEarly = false;
    for (let i = 0; i < 40; i++) {
      demo.advanceThreat(s, t, 2.35, 0.05);
      if (t._dead && t.age < 2) {
        deadEarly = true;
        break;
      }
    }
    ok("patrol not dead early in corridor", !deadEarly, `age=${t.age} dead=${t._dead}`);
  }
}

// IT survives wall
{
  const s = makeState(40);
  const t = placeThreatOnPlay(s, "it", "down");
  ok("IT placed", !!t);
  if (t) {
    const ac = t.col + t.dc;
    const ar = t.row + t.dr;
    if (demo.inPlayArea(s, ac, ar)) s.map[ar][ac] = 1;
    t.dashLeft = 2;
    t.blinkT = 99;
    for (let i = 0; i < 30; i++) demo.advanceThreat(s, t, 2.35, 0.05);
    ok("IT survives wall bump", !t._dead || t.age > 13, `dead=${t._dead} age=${t.age}`);
  }
}

// all kinds spawn + advance
{
  for (const kind of demo.KINDS) {
    const s = makeState(45);
    s.threats = [];
    let spawned = false;
    if (kind.id === "client") {
      spawned = demo.spawnPincer(s, api);
    } else {
      for (const dir of ["down", "up", "left", "right"]) {
        const t = demo.makeThreat(s, api, dir, kind);
        if (t) {
          s.threats.push(t);
          spawned = true;
          break;
        }
      }
    }
    ok(`spawn ${kind.id}`, spawned, "could not spawn");
    for (let i = 0; i < 120; i++) {
      for (const t of s.threats) {
        if (!t._dead) demo.advanceThreat(s, t, 2.35, 0.05);
      }
      s.threats = s.threats.filter((t) => !t._dead);
    }
    ok(`sim ${kind.id} no throw`, true);
  }
}

// pincer pair
{
  const s = makeState(35);
  let any = false;
  for (let i = 0; i < 40; i++) {
    s.threats = [];
    if (demo.spawnPincer(s, api)) {
      any = true;
      ok(
        "pincer pair patterns",
        s.threats.length === 2 && s.threats.every((t) => t.pattern === "pincer")
      );
      break;
    }
  }
  ok("pincer can spawn sometimes", any);
}

// weave moves
{
  const s = makeState(5);
  const t = placeThreatOnPlay(s, "hr", "down");
  ok("weave placed", !!t);
  if (t) {
    demo.weavePickNext(s, t);
    ok("weave has direction", t.dc !== 0 || t.dr !== 0);
    const sc = t.col;
    const sr = t.row;
    let moved = false;
    for (let i = 0; i < 80; i++) {
      demo.advanceThreat(s, t, 2.35, 0.05);
      if (t.col !== sc || t.row !== sr) moved = true;
      if (t._dead) break;
    }
    ok("weave moves", moved);
  }
}

// ghost through prop
{
  const s = makeState(5);
  const t = placeThreatOnPlay(s, "director", "down");
  ok("ghost placed", !!t);
  if (t && demo.inPlayArea(s, t.col, t.row)) {
    s.map[t.row][t.col] = 1;
    ok("ghost throughObstacle", demo.throughObstacle(s, t) === true);
  }
}

// account zones
{
  const s = makeState(30);
  const t = placeThreatOnPlay(s, "account", "down");
  ok("account placed", !!t);
  if (t) {
    t.dropT = 0;
    for (let i = 0; i < 100; i++) {
      demo.advanceThreat(s, t, 2.35, 0.05);
      if (t._dead) break;
    }
    ok("account drops zones", s.zones.length > 0, `zones=${s.zones.length} dead=${t._dead}`);
  }
}

// wide second hitbox
{
  const s = makeState(45);
  const t = placeThreatOnPlay(s, "secretary", "down");
  ok("secretary placed", !!t);
  if (t) {
    t.entered = true;
    s.px = t.col + t.wideDc;
    s.py = t.row + t.wideDr;
    s.col = Math.round(s.px);
    s.row = Math.round(s.py);
    ok("wide hits second body", demo.threatHits(s, t) === true);
  }
}

const passed = results.filter((r) => r.pass).length;
const failed = results.filter((r) => !r.pass);
console.log(`\n=== RESULT ${passed}/${results.length} passed ===`);
if (failed.length) {
  console.log("Failed:");
  failed.forEach((f) => console.log(" -", f.name, f.detail));
  process.exit(1);
}
console.log("All mob behavior checks passed.");
