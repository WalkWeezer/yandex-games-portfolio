/**
 * Smoke: legends-pitch-demo placement + match feel
 * node management/demos/smoke-legends-pitch.js
 */
const path = require("path");
const demoPath = path.join(__dirname, "legends-pitch-demo.js");
require(demoPath);

const Smoke = globalThis.LegendsPitchDemoSmoke;
if (!Smoke) {
  console.error("FAIL: LegendsPitchDemoSmoke missing");
  process.exit(1);
}

const api = Smoke.createMockApi();
const s = Smoke.demo.create(api);

if (s.oppField && s.oppField.length) {
  console.error("FAIL: opponent visible before fight", s.oppField.length);
  process.exit(1);
}
console.log("OK opponent hidden pre-fight");

// Placement on corners of full 3×5 — must accept (0,0) and (2,4)
const p0 = Smoke.placeOnCell(s, api, 0, 0, 0);
const p1 = Smoke.placeOnCell(s, api, 0, 2, 4); // after first place, next bench[0]
if (p0.col !== 0 || p0.row !== 0) {
  console.error("FAIL: place (0,0)", p0);
  process.exit(1);
}
if (p1.col !== 2 || p1.row !== 4) {
  console.error("FAIL: place (2,4)", p1);
  process.exit(1);
}
console.log("OK placement (0,0) and (2,4)");

// Fill remaining bench onto field for a real 6v6
let bi = 0;
const cells = [
  [1, 4],
  [0, 3],
  [2, 3],
  [1, 2],
];
while (s.bench.length && s.field.length < 6 && bi < cells.length) {
  const [c, r] = cells[bi++];
  Smoke.placeOnCell(s, api, 0, c, r);
}

const stats = Smoke.runMatchTicks(s, api, 90, 1 / 30);
console.log("stats", {
  flights: stats.flights,
  passes: stats.passes,
  shots: stats.shots,
  tackles: stats.tackles,
  intercepts: stats.intercepts,
  saves: stats.saves,
  goals: stats.goals,
  byKind: stats.byKind,
  passEdges: (stats.passEdges || []).length,
});

if ((stats.flights || 0) < 3) {
  console.error("FAIL: need ≥3 ball flights, got", stats.flights);
  process.exit(1);
}
console.log("OK flights ≥3");

const hasPass = (stats.passes || 0) > 0 || (stats.byKind && stats.byKind.pass);
const hasShot = (stats.shots || 0) > 0 || (stats.byKind && stats.byKind.shot);
const hasDef = (stats.tackles || 0) > 0 || (stats.intercepts || 0) > 0;
if (!hasPass) {
  console.error("FAIL: no Pass");
  process.exit(1);
}
if (!hasShot) {
  console.error("FAIL: no Shot");
  process.exit(1);
}
if (!hasDef) {
  console.error("FAIL: no Tackle/Intercept");
  process.exit(1);
}
console.log("OK Pass + Shot + Tackle/Intercept");

const pp = Smoke.pingPongRate(stats);
console.log("pingPongRate", (pp * 100).toFixed(1) + "%");
if (pp > 0.1) {
  console.error("FAIL: A→B→A ping-pong >10%", pp);
  process.exit(1);
}
console.log("OK ping-pong ≤10%");

// Economy sanity
const tactics = new Set(Smoke.CARD_DEFS.map((d) => d.tacticId));
if (Smoke.CARD_DEFS.length !== 18) {
  console.error("FAIL: deck size", Smoke.CARD_DEFS.length);
  process.exit(1);
}
if (tactics.size < 4) {
  console.error("FAIL: tactics <4", tactics.size);
  process.exit(1);
}
console.log("OK deck 18 · tactics", tactics.size);

console.log("SMOKE PASS");
