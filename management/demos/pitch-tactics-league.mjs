#!/usr/bin/env node
/**
 * Лига 10 команд разного уровня — каждый с каждым дома и в гостях.
 * Usage: node pitch-tactics-league.mjs [--out path] [--single]
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
const outPath = argVal("--out", "/opt/cursor/artifacts/pitch-league.json");
const singleRound = args.includes("--single");

/** 10 клубов: mult ≈ сила, ai = стиль гостей, homeStyle = стиль дома */
const LEAGUE = [
  { id: "junior", name: "Росток Юниор", mult: 0.55, ai: "shape", homeStyle: "possess", shell: "academy" },
  { id: "academy", name: "Академия «Росток»", mult: 0.65, ai: "shape", homeStyle: "possess", shell: "academy" },
  { id: "river", name: "ФК «Речные»", mult: 0.78, ai: "width", homeStyle: "width", shell: "wingers" },
  { id: "north", name: "ФК «Север»", mult: 0.9, ai: "possess", homeStyle: "possess", shell: "rivals" },
  { id: "wings", name: "«Вольные Края»", mult: 1.0, ai: "width", homeStyle: "width", shell: "wingers" },
  { id: "spike", name: "«Прямой Удар»", mult: 1.05, ai: "direct", homeStyle: "direct", shell: "vertical" },
  { id: "press", name: "«Высокий Вал»", mult: 1.12, ai: "press", homeStyle: "direct", shell: "press" },
  { id: "steel", name: "«Стальной Клин»", mult: 1.18, ai: "direct", homeStyle: "direct", shell: "vertical" },
  { id: "olymp2", name: "Олимп II", mult: 1.22, ai: "possess", homeStyle: "possess", shell: "rivals" },
  { id: "elite", name: "Легион «Олимп»", mult: 1.3, ai: "direct", homeStyle: "direct", shell: "elite" },
];

const SKILL_SPREAD = 0.35;

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
      toggle() {},
      contains(x) {
        return el.classList._s.has(x);
      },
    },
    dataset: {},
    children: [],
    childNodes: [],
    innerHTML: "",
    textContent: "",
    appendChild(c) {
      el.children.push(c);
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
      return { left: 0, top: 0, width: 800, height: 600 };
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
  location: { search: "", href: "http://localhost/pitch-league" },
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
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "pitch-tactics-play.js"), "utf8"), sandbox, {
  filename: "pitch-tactics-play.js",
});

const play = sandbox.window.pitchAutoPlayFullMatch;

function emptyRow(team) {
  return {
    id: team.id,
    name: team.name,
    mult: team.mult,
    ai: team.ai,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    gf: 0,
    ga: 0,
    gd: 0,
    pts: 0,
    xgFor: 0,
    xgAgainst: 0,
    shotsFor: 0,
    shotsAgainst: 0,
    sotFor: 0,
    sotAgainst: 0,
    possSum: 0,
    qualityOk: 0,
  };
}

function spearman(ranksA, ranksB) {
  const n = ranksA.length;
  let sumd2 = 0;
  for (let i = 0; i < n; i++) {
    const d = ranksA[i] - ranksB[i];
    sumd2 += d * d;
  }
  return 1 - (6 * sumd2) / (n * (n * n - 1));
}

function analyze(table, fixtures) {
  const byMult = [...table].sort((a, b) => b.mult - a.mult);
  const byPts = [...table].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  const idToMultRank = {};
  const idToPtsRank = {};
  byMult.forEach((t, i) => {
    idToMultRank[t.id] = i + 1;
  });
  byPts.forEach((t, i) => {
    idToPtsRank[t.id] = i + 1;
  });
  const multRanks = table.map((t) => idToMultRank[t.id]);
  const ptsRanks = table.map((t) => idToPtsRank[t.id]);
  const rho = spearman(multRanks, ptsRanks);

  const top3Mult = new Set(byMult.slice(0, 3).map((t) => t.id));
  const bot3Mult = new Set(byMult.slice(-3).map((t) => t.id));
  const top3Pts = byPts.slice(0, 3).map((t) => t.id);
  const bot3Pts = byPts.slice(-3).map((t) => t.id);
  const topOverlap = top3Pts.filter((id) => top3Mult.has(id)).length;
  const botOverlap = bot3Pts.filter((id) => bot3Mult.has(id)).length;

  let favWins = 0;
  let favGames = 0;
  let draws = 0;
  let upsets = 0; // weaker beats stronger by mult gap >= 0.12
  fixtures.forEach((f) => {
    if (f.score[0] === f.score[1]) draws++;
    const homeFav = f.homeMult >= f.awayMult + 0.08;
    const awayFav = f.awayMult >= f.homeMult + 0.08;
    if (homeFav || awayFav) {
      favGames++;
      const favWon = (homeFav && f.score[0] > f.score[1]) || (awayFav && f.score[1] > f.score[0]);
      if (favWon) favWins++;
      else if ((homeFav && f.score[0] < f.score[1]) || (awayFav && f.score[1] < f.score[0])) {
        if (Math.abs(f.homeMult - f.awayMult) >= 0.12) upsets++;
      }
    }
  });

  const goals = fixtures.reduce((a, f) => a + f.score[0] + f.score[1], 0);
  const qualityOk = fixtures.filter((f) => f.qualityOk).length;

  const champMultRank = idToMultRank[byPts[0].id];
  const lastMultRank = idToMultRank[byPts[byPts.length - 1].id];

  const issues = [];
  if (rho < 0.6) issues.push("слабая корреляция силы и места (ρ=" + rho.toFixed(2) + ")");
  if (champMultRank > 3) issues.push("чемпион вне топ-3 по силе");
  if (lastMultRank < table.length - 2) issues.push("аутсайдер не из слабейших по силе");
  // топ: допускаем стилевой шум — достаточно 1/3 строгого пересечения при высоком ρ,
  // либо 2/3; дно важнее держать стабильным
  if (topOverlap < 1 || (topOverlap < 2 && rho < 0.8))
    issues.push("топ-3 по очкам плохо совпадает с топ-3 по силе");
  if (botOverlap < 2) issues.push("дно таблицы плохо совпадает со слабыми");
  if (byPts[0].mult + 0.2 < byPts[byPts.length - 1].mult) issues.push("чемпион заметно слабее последнего");
  if (goals / fixtures.length < 1.2) issues.push("слишком мало голов в среднем");
  if (goals / fixtures.length > 6.5) issues.push("слишком много голов в среднем");
  if (favGames && favWins / favGames < 0.45) issues.push("фавориты выигрывают слишком редко");

  return {
    spearmanRho: +rho.toFixed(3),
    top3Overlap: topOverlap,
    bottom3Overlap: botOverlap,
    champMultRank,
    lastMultRank,
    favWinRate: favGames ? +(favWins / favGames).toFixed(3) : null,
    upsetCount: upsets,
    avgGoals: +(goals / fixtures.length).toFixed(2),
    drawRate: +(draws / fixtures.length).toFixed(3),
    qualityOkRate: +(qualityOk / fixtures.length).toFixed(3),
    champion: { name: champ.name, mult: champ.mult, pts: champ.pts },
    last: { name: last.name, mult: last.mult, pts: last.pts },
    adequate: issues.length === 0,
    issues,
    note:
      "Стиль (press/direct/width) даёт дисперсию в середине: клуб с меньшим mult может обогнать «бумажно» более сильного.",
  };
}

function formatTable(table) {
  const sorted = [...table].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  const lines = [
    "Pos  Club                      Mult  P   W  D  L   GF  GA   GD  Pts  xGF   xGA",
    "---- ------------------------- ----- --- -- -- --  --- ---  ---  ---  ----  ----",
  ];
  sorted.forEach((t, i) => {
    lines.push(
      String(i + 1).padStart(3, " ") +
        "  " +
        t.name.padEnd(25, " ").slice(0, 25) +
        " " +
        t.mult.toFixed(2).padStart(5, " ") +
        " " +
        String(t.played).padStart(3, " ") +
        " " +
        String(t.won).padStart(2, " ") +
        " " +
        String(t.drawn).padStart(2, " ") +
        " " +
        String(t.lost).padStart(2, " ") +
        "  " +
        String(t.gf).padStart(3, " ") +
        " " +
        String(t.ga).padStart(3, " ") +
        "  " +
        String(t.gd).padStart(3, " ") +
        "  " +
        String(t.pts).padStart(3, " ") +
        "  " +
        t.xgFor.toFixed(1).padStart(4, " ") +
        "  " +
        t.xgAgainst.toFixed(1).padStart(4, " ")
    );
  });
  return lines.join("\n");
}

// fixtures
const fixturesPlan = [];
for (let i = 0; i < LEAGUE.length; i++) {
  for (let j = 0; j < LEAGUE.length; j++) {
    if (i === j) continue;
    if (singleRound && i > j) continue;
    fixturesPlan.push({ home: LEAGUE[i], away: LEAGUE[j] });
  }
}

const tableMap = {};
LEAGUE.forEach((t) => {
  tableMap[t.id] = emptyRow(t);
});
const results = [];
const t0 = Date.now();

fixturesPlan.forEach((fx, idx) => {
  const home = fx.home;
  const away = fx.away;
  const matchT0 = Date.now();
  const r = play({
    awayId: away.shell,
    homeStyle: home.homeStyle,
    awayAi: away.ai,
    homeMult: home.mult,
    awayMult: away.mult,
    skillSpread: SKILL_SPREAD,
    homeName: home.name,
    awayName: away.name,
  });
  const elapsedOne = Date.now() - matchT0;
  r.elapsedMs = elapsedOne;
  const hs = r.score[0];
  const as_ = r.score[1];
  const H = tableMap[home.id];
  const A = tableMap[away.id];
  H.played++;
  A.played++;
  H.gf += hs;
  H.ga += as_;
  A.gf += as_;
  A.ga += hs;
  H.xgFor += (r.xg && r.xg.A) || 0;
  H.xgAgainst += (r.xg && r.xg.B) || 0;
  A.xgFor += (r.xg && r.xg.B) || 0;
  A.xgAgainst += (r.xg && r.xg.A) || 0;
  H.shotsFor += (r.stats && r.stats.shotsFor) || 0;
  H.shotsAgainst += (r.stats && r.stats.shotsAgainst) || 0;
  A.shotsFor += (r.stats && r.stats.shotsAgainst) || 0;
  A.shotsAgainst += (r.stats && r.stats.shotsFor) || 0;
  if (r.sot) {
    H.sotFor += r.sot.A || 0;
    H.sotAgainst += r.sot.B || 0;
    A.sotFor += r.sot.B || 0;
    A.sotAgainst += r.sot.A || 0;
  }
  if (r.possessionPct) {
    H.possSum += Number(r.possessionPct.A) || 0;
    A.possSum += Number(r.possessionPct.B) || 0;
  }
  if (r.quality && r.quality.ok) {
    H.qualityOk++;
    A.qualityOk++;
  }
  if (hs > as_) {
    H.won++;
    A.lost++;
    H.pts += 3;
  } else if (hs < as_) {
    A.won++;
    H.lost++;
    A.pts += 3;
  } else {
    H.drawn++;
    A.drawn++;
    H.pts += 1;
    A.pts += 1;
  }
  H.gd = H.gf - H.ga;
  A.gd = A.gf - A.ga;

  const row = {
    n: idx + 1,
    home: home.name,
    away: away.name,
    homeId: home.id,
    awayId: away.id,
    homeMult: home.mult,
    awayMult: away.mult,
    score: [hs, as_],
    xg: r.xg,
    shots: [r.stats.shotsFor, r.stats.shotsAgainst],
    qualityOk: !!(r.quality && r.quality.ok),
    notes: (r.quality && r.quality.notes) || [],
    elapsedMs: r.elapsedMs,
  };
  results.push(row);
  process.stderr.write(
    `#${idx + 1}/${fixturesPlan.length} ${home.name} ${hs}:${as_} ${away.name} ` +
      `xG ${r.xg.A}-${r.xg.B} ${row.qualityOk ? "OK" : "FAIL"} (${r.elapsedMs}ms)\n`
  );
});

const table = Object.values(tableMap).map((t) => ({
  ...t,
  xgFor: +t.xgFor.toFixed(2),
  xgAgainst: +t.xgAgainst.toFixed(2),
  avgPoss: t.played ? +(t.possSum / t.played).toFixed(1) : 0,
}));
const verdict = analyze(table, results);
const tableText = formatTable(table);
const elapsedMs = Date.now() - t0;

const report = {
  mode: singleRound ? "single round-robin" : "double round-robin (home/away)",
  teams: LEAGUE.length,
  matches: results.length,
  skillSpread: SKILL_SPREAD,
  elapsedMs,
  table,
  tableText,
  verdict,
  results,
};

const txt = [
  `Pitch Tactics League — ${report.mode}`,
  `Matches: ${report.matches} · ${elapsedMs}ms · skillSpread=${SKILL_SPREAD}`,
  "",
  tableText,
  "",
  "Verdict:",
  `  adequate: ${verdict.adequate}`,
  `  Spearman ρ (mult rank vs pts rank): ${verdict.spearmanRho}`,
  `  top3 overlap: ${verdict.top3Overlap}/3 · bottom3 overlap: ${verdict.bottom3Overlap}/3`,
  `  fav win rate: ${verdict.favWinRate} · upsets: ${verdict.upsetCount}`,
  `  avg goals: ${verdict.avgGoals} · draws: ${verdict.drawRate} · quality OK: ${verdict.qualityOkRate}`,
  `  champion: ${verdict.champion.name} (mult ${verdict.champion.mult}, ${verdict.champion.pts} pts)`,
  `  last: ${verdict.last.name} (mult ${verdict.last.mult}, ${verdict.last.pts} pts)`,
  verdict.note ? "  note: " + verdict.note : "",
  verdict.issues.length ? "  issues:\n" + verdict.issues.map((x) => "   - " + x).join("\n") : "  issues: none",
].join("\n");

fs.mkdirSync(path.dirname(path.resolve(outPath)), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
fs.writeFileSync(outPath.replace(/\.json$/i, ".txt"), txt);
process.stdout.write(txt + "\n");
process.stderr.write(`\nWrote ${outPath}\n`);
