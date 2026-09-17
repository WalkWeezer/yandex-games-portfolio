/**
 * SC_Match — event feed + scoreboard + live×3 (DESIGN_LLM §2 / §4.3)
 * Not a mini-FIFA camera. Portrait navy/green Russian UI.
 *
 * Sibling starts with:
 *   registry.set(REG.matchConfig, { home, away, seed?, liveCharges? })
 *   scene.start(SCENE.Match)
 * Or just scene.start(SCENE.Match) — config is built from GameState.
 */

import Phaser from 'phaser';
import {
  applyLiveAction,
  createMatch,
  finishMatch,
  MATCH_MINUTES,
  peekChanceRates,
  tickMatch,
} from '../engine/matchEngine';
import { formatEventRu, buildMatchDeltas, buildReport } from '../engine/reportBuilder';
import type {
  InstrKey,
  LiveActionRequest,
  MatchConfig,
  MatchState,
  OnMatchEndFn,
} from '../engine/types';
import { REG } from '../engine/types';
import {
  applyMatchResult,
  getNextOpponent,
  getPlayerClub,
  getSeason,
  getState,
  isVip,
} from '../state/GameState';
import { nextFixture } from '../data/league';
import { SCENE, type InstrLevel } from '../types';

const W = 720;
const H = 1280;
const NAVY = 0x0b1f3a;
const GREEN = 0x1a7a3a;
const INK = '#e8eef5';
const AMBER = '#e8a838';
const MS_PER_TICK: Record<1 | 2 | 4, number> = { 1: 420, 2: 210, 4: 105 };

function resolveMatchConfig(registryCfg: MatchConfig | undefined): MatchConfig | null {
  if (registryCfg?.home && registryCfg?.away) return registryCfg;
  try {
    const player = getPlayerClub();
    const opp = getNextOpponent();
    if (!opp) return null;
    const s = getState();
    const season = getSeason();
    const fx = nextFixture(season, player.id);
    // Respect calendar venue so applyMatchResult can mark the fixture.
    const home = fx && fx.homeId === opp.id ? opp : player;
    const away = home.id === player.id ? opp : player;
    return {
      home,
      away,
      seed: (s.season.matchday * 997 + player.id.length * 13) >>> 0 || 1,
      liveCharges: isVip() ? 4 : 3,
    };
  } catch {
    return null;
  }
}

export class MatchScene extends Phaser.Scene {
  private match!: MatchState;
  private matchCfg!: MatchConfig;
  private playerSide: 'home' | 'away' = 'home';
  private speed: 1 | 2 | 4 = 1;
  private acc = 0;
  private pausedLive = false;
  private feedLines: string[] = [];
  private feedText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private minuteText!: Phaser.GameObjects.Text;
  private chargeText!: Phaser.GameObjects.Text;
  private xgText!: Phaser.GameObjects.Text;
  private overlay?: Phaser.GameObjects.Container;
  private ended = false;
  private lastEventCount = 0;

  constructor() {
    super(SCENE.Match);
  }

  create(): void {
    this.ended = false;
    this.acc = 0;
    this.speed = 1;
    this.pausedLive = false;
    this.feedLines = [];
    this.lastEventCount = 0;

    const cfg = resolveMatchConfig(
      this.registry.get(REG.matchConfig) as MatchConfig | undefined,
    );
    if (!cfg) {
      this.cameras.main.setBackgroundColor(NAVY);
      this.add
        .text(W / 2, H / 2, 'Нет данных матча\n(нет соперника / GameState)', {
          fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
          fontSize: '28px',
          color: INK,
          align: 'center',
        })
        .setOrigin(0.5);
      this.add
        .text(W / 2, H / 2 + 80, 'Назад в хаб', {
          fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
          fontSize: '22px',
          color: AMBER,
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerup', () => this.scene.start(SCENE.Hub));
      return;
    }

    this.matchCfg = cfg;
    this.registry.set(REG.matchConfig, cfg);
    this.match = createMatch(cfg);
    try {
      this.playerSide = cfg.home.id === getPlayerClub().id ? 'home' : 'away';
    } catch {
      this.playerSide = 'home';
    }
    this.cameras.main.setBackgroundColor(NAVY);
    this.buildChrome();
    this.refreshHud();
    this.pushFeed(`Стартовый свисток · ${cfg.home.name} — ${cfg.away.name}`);
  }

  update(_t: number, dt: number): void {
    if (!this.match || this.ended || this.pausedLive) return;
    if (this.match.finished) {
      this.onMatchEnd();
      return;
    }

    this.acc += dt;
    const step = MS_PER_TICK[this.speed];
    while (this.acc >= step && !this.match.finished && !this.pausedLive) {
      this.acc -= step;
      tickMatch(this.match);
      this.syncFeed();
      this.refreshHud();
    }
    if (this.match.finished) this.onMatchEnd();
  }

  private buildChrome(): void {
    // Top scoreboard band
    this.add.rectangle(W / 2, 70, W, 140, GREEN, 0.95);
    this.add
      .text(W / 2, 28, 'ЖИВИ ФУТБОЛОМ', {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '18px',
        color: AMBER,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);

    this.scoreText = this.add
      .text(W / 2, 70, '0 — 0', {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '48px',
        color: INK,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);

    this.minuteText = this.add
      .text(W / 2, 128, "0'", {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '22px',
        color: AMBER,
      })
      .setOrigin(0.5, 0);

    this.add
      .text(36, 78, this.match.home.name.slice(0, 14), {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '20px',
        color: INK,
      })
      .setOrigin(0, 0.5);

    this.add
      .text(W - 36, 78, this.match.away.name.slice(0, 14), {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '20px',
        color: INK,
      })
      .setOrigin(1, 0.5);

    this.xgText = this.add
      .text(W / 2, 160, 'xG 0.00 — 0.00', {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '16px',
        color: '#a8c0d8',
      })
      .setOrigin(0.5, 0);

    // Feed panel
    this.add.rectangle(W / 2, 520, W - 40, 560, 0x122846, 1).setStrokeStyle(2, GREEN);
    this.add
      .text(40, 250, 'СОБЫТИЯ', {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '16px',
        color: AMBER,
        fontStyle: 'bold',
      });

    this.feedText = this.add.text(44, 280, '', {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: '18px',
      color: INK,
      lineSpacing: 8,
      wordWrap: { width: W - 88 },
    });

    this.chargeText = this.add
      .text(W / 2, 820, 'Live: 3/3', {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '18px',
        color: AMBER,
      })
      .setOrigin(0.5);

    // Bottom live buttons
    const by = 920;
    this.makeBtn(120, by, 'Инструкция', () => this.openInstrPanel());
    this.makeBtn(360, by, 'Замена', () => this.openSubPanel());
    this.makeBtn(600, by, 'Автобус|Вперёд', () => this.openEmotionPanel());

    // Speed
    this.makeBtn(180, 1040, '×1', () => {
      this.speed = 1;
    }, 100);
    this.makeBtn(360, 1040, '×2', () => {
      this.speed = 2;
    }, 100);
    this.makeBtn(540, 1040, '×4', () => {
      this.speed = 4;
    }, 100);

    this.add
      .text(W / 2, 1120, 'Скорость симуляции', {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '14px',
        color: '#7a93ad',
      })
      .setOrigin(0.5);

    // Skip to end (debug convenience for sibling)
    this.makeBtn(W / 2, 1200, 'Досмотреть', () => {
      if (this.ended) return;
      finishMatch(this.match);
      this.syncFeed();
      this.refreshHud();
      this.onMatchEnd();
    }, 220);
  }

  private makeBtn(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    width = 200,
  ): Phaser.GameObjects.Container {
    const h = 56;
    const bg = this.add.rectangle(0, 0, width, h, GREEN, 1).setStrokeStyle(2, 0x2ecc71);
    const tx = this.add
      .text(0, 0, label, {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: label.length > 12 ? '16px' : '20px',
        color: INK,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    const c = this.add.container(x, y, [bg, tx]);
    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => bg.setFillStyle(0x219150))
      .on('pointerout', () => bg.setFillStyle(GREEN))
      .on('pointerup', onClick);
    return c;
  }

  private refreshHud(): void {
    const m = this.match;
    this.scoreText.setText(`${m.score.home} — ${m.score.away}`);
    this.minuteText.setText(`${m.minute}' / ${MATCH_MINUTES}' · ×${this.speed}`);
    this.xgText.setText(`xG ${m.xg.home.toFixed(2)} — ${m.xg.away.toFixed(2)}`);
    this.chargeText.setText(`Live-заряды: ${m.liveCharges}/${m.liveChargesMax}`);
  }

  private syncFeed(): void {
    const evs = this.match.events;
    while (this.lastEventCount < evs.length) {
      const e = evs[this.lastEventCount]!;
      this.pushFeed(formatEventRu(this.match, e));
      this.lastEventCount += 1;
    }
  }

  private pushFeed(line: string): void {
    this.feedLines.unshift(line);
    if (this.feedLines.length > 14) this.feedLines.length = 14;
    this.feedText.setText(this.feedLines.join('\n'));
  }

  private clearOverlay(): void {
    this.overlay?.destroy(true);
    this.overlay = undefined;
    this.pausedLive = false;
  }

  private openPanel(title: string, build: (root: Phaser.GameObjects.Container) => void): void {
    this.clearOverlay();
    this.pausedLive = true;
    const root = this.add.container(0, 0);
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.55).setInteractive();
    dim.on('pointerup', () => this.clearOverlay());
    const card = this.add.rectangle(W / 2, H / 2, W - 80, 520, NAVY).setStrokeStyle(3, GREEN);
    const t = this.add
      .text(W / 2, H / 2 - 220, title, {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '26px',
        color: AMBER,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);
    root.add([dim, card, t]);
    build(root);
    this.overlay = root;
  }

  private spend(action: LiveActionRequest): void {
    const before = peekChanceRates(this.match);
    const res = applyLiveAction(this.match, action, this.playerSide);
    this.clearOverlay();
    if (!res.ok) {
      this.pushFeed(`Live недоступен: ${res.reason}`);
      return;
    }
    const after = peekChanceRates(this.match);
    this.syncFeed();
    this.refreshHud();
    if (action.kind === 'instr') {
      const b = this.playerSide === 'home' ? before.home : before.away;
      const a = this.playerSide === 'home' ? after.home : after.away;
      this.pushFeed(`Шанс ${b.toFixed(3)} → ${a.toFixed(3)} (инструкция)`);
    }
  }

  private openInstrPanel(): void {
    if (this.match.liveCharges <= 0) {
      this.pushFeed('Нет live-зарядов');
      return;
    }
    const keys: { key: InstrKey; label: string }[] = [
      { key: 'press', label: 'Прессинг' },
      { key: 'width', label: 'Ширина' },
      { key: 'tempo', label: 'Темп' },
      { key: 'risk', label: 'Риск' },
    ];
    this.openPanel('Сменить инструкцию', (root) => {
      keys.forEach((row, i) => {
        const y = H / 2 - 150 + i * 70;
        const label = this.add
          .text(120, y, row.label, {
            fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
            fontSize: '20px',
            color: INK,
          })
          .setOrigin(0, 0.5);
        root.add(label);
        ([0, 1, 2] as InstrLevel[]).forEach((lvl, j) => {
          const bx = 320 + j * 100;
          const b = this.add
            .rectangle(bx, y, 84, 44, GREEN)
            .setInteractive({ useHandCursor: true })
            .on('pointerup', () => this.spend({ kind: 'instr', key: row.key, level: lvl }));
          const tx = this.add
            .text(bx, y, ['↓', '●', '↑'][j]!, {
              fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
              fontSize: '20px',
              color: INK,
            })
            .setOrigin(0.5);
          root.add([b, tx]);
        });
      });
    });
  }

  private openSubPanel(): void {
    if (this.match.liveCharges <= 0) {
      this.pushFeed('Нет live-зарядов');
      return;
    }
    const side = this.match[this.playerSide];
    const lineup = side.tactics.lineup;
    const bench = side.tactics.bench;
    if (bench.length === 0) {
      this.pushFeed('Скамейка пуста');
      return;
    }
    this.openPanel('Замена', (root) => {
      const outId = lineup[lineup.length - 1]!;
      const inId = bench[0]!;
      const outP = side.players.find((p) => p.id === outId);
      const inP = side.players.find((p) => p.id === inId);
      const info = this.add
        .text(
          W / 2,
          H / 2 - 40,
          `Уйдёт: ${outP?.name ?? outId}\nВыйдет: ${inP?.name ?? inId}`,
          {
            fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
            fontSize: '22px',
            color: INK,
            align: 'center',
          },
        )
        .setOrigin(0.5);
      root.add(info);
      const ok = this.add
        .rectangle(W / 2, H / 2 + 80, 200, 56, GREEN)
        .setInteractive({ useHandCursor: true })
        .on('pointerup', () => this.spend({ kind: 'sub', outId, inId }));
      const okTx = this.add
        .text(W / 2, H / 2 + 80, 'Подтвердить', {
          fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
          fontSize: '20px',
          color: INK,
          fontStyle: 'bold',
        })
        .setOrigin(0.5);
      root.add([ok, okTx]);
    });
  }

  private openEmotionPanel(): void {
    if (this.match.liveCharges <= 0) {
      this.pushFeed('Нет live-зарядов');
      return;
    }
    this.openPanel('Эмо-режим (~12 мин)', (root) => {
      const mk = (x: number, label: string, mode: 'bus' | 'allout') => {
        const b = this.add
          .rectangle(x, H / 2, 220, 64, GREEN)
          .setInteractive({ useHandCursor: true })
          .on('pointerup', () => this.spend({ kind: 'emotion', mode }));
        const t = this.add
          .text(x, H / 2, label, {
            fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
            fontSize: '22px',
            color: INK,
            fontStyle: 'bold',
          })
          .setOrigin(0.5);
        root.add([b, t]);
      };
      mk(W / 2 - 130, 'Автобус', 'bus');
      mk(W / 2 + 130, 'Вперёд', 'allout');
    });
  }

  private onMatchEnd(): void {
    if (this.ended) return;
    this.ended = true;
    this.clearOverlay();

    const report = buildReport(this.match);
    const deltas = buildMatchDeltas(this.match, this.matchCfg.home, this.matchCfg.away);

    this.registry.set(REG.matchReport, report);
    this.registry.set(REG.matchDeltas, deltas);

    const cb = this.registry.get(REG.onMatchEnd) as OnMatchEndFn | undefined;
    if (typeof cb === 'function') {
      cb(report, deltas);
    } else {
      try {
        applyMatchResult(report, deltas);
      } catch {
        // GameState not loaded — registry stash only
      }
    }

    this.time.delayedCall(400, () => {
      this.scene.start(SCENE.Report);
    });
  }
}
