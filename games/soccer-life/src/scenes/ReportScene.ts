/**
 * SC_Report — score, xG, best player, 3 key events, tip. CTA → SC_Hub.
 */

import Phaser from 'phaser';
import type { MatchEvent, MatchReport } from '../engine/types';
import { REG } from '../engine/types';
import { SCENE } from '../types';

const W = 720;
const H = 1280;
const NAVY = 0x0b1f3a;
const GREEN = 0x1a7a3a;
const INK = '#e8eef5';
const AMBER = '#e8a838';

function eventLine(e: MatchEvent, report: MatchReport): string {
  const min = `${e.t}'`;
  if (e.type === 'chance') {
    const side = e.side === 'home' ? report.homeName : report.awayName;
    const o =
      e.outcome === 'goal'
        ? 'ГОЛ'
        : e.outcome === 'save'
          ? 'сейв'
          : e.outcome === 'block'
            ? 'блок'
            : 'мимо';
    return `${min} ${o} · ${side} · xG ${e.xg.toFixed(2)}`;
  }
  if (e.type === 'live') return `${min} Live: ${e.action}`;
  if (e.type === 'sub') return `${min} Замена`;
  if (e.type === 'card') return `${min} Карточка`;
  return `${min} Травма`;
}

export class ReportScene extends Phaser.Scene {
  constructor() {
    super(SCENE.Report);
  }

  create(): void {
    this.cameras.main.setBackgroundColor(NAVY);

    const report = this.registry.get(REG.matchReport) as MatchReport | undefined;

    this.add.rectangle(W / 2, 0, W, 160, GREEN).setOrigin(0.5, 0);
    this.add
      .text(W / 2, 36, 'ОТЧЁТ МАТЧА', {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '28px',
        color: AMBER,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);

    if (!report) {
      this.add
        .text(W / 2, H / 2, 'Нет отчёта', {
          fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
          fontSize: '24px',
          color: INK,
        })
        .setOrigin(0.5);
      this.addBackBtn();
      return;
    }

    this.add
      .text(W / 2, 100, `${report.homeName}  ${report.score.home} — ${report.score.away}  ${report.awayName}`, {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '22px',
        color: INK,
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: W - 48 },
      })
      .setOrigin(0.5, 0);

    let y = 200;
    const block = (title: string, body: string) => {
      this.add
        .text(48, y, title, {
          fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
          fontSize: '16px',
          color: AMBER,
          fontStyle: 'bold',
        });
      y += 28;
      this.add
        .text(48, y, body, {
          fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
          fontSize: '22px',
          color: INK,
          wordWrap: { width: W - 96 },
        });
      y += 70;
    };

    block('xG', `${report.xg.home.toFixed(2)}  —  ${report.xg.away.toFixed(2)}`);
    block(
      'Лучший игрок',
      `${report.bestPlayer.name} (${report.bestPlayer.side === 'home' ? report.homeName : report.awayName}) — ${report.bestPlayer.reason}`,
    );

    this.add
      .text(48, y, 'Ключевые события', {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '16px',
        color: AMBER,
        fontStyle: 'bold',
      });
    y += 32;
    for (const e of report.keyEvents) {
      this.add
        .text(48, y, eventLine(e, report), {
          fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
          fontSize: '18px',
          color: INK,
          wordWrap: { width: W - 96 },
        });
      y += 40;
    }

    y += 24;
    this.add.rectangle(W / 2, y + 40, W - 64, 100, 0x122846).setStrokeStyle(2, GREEN);
    this.add
      .text(W / 2, y + 20, 'СОВЕТ', {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '14px',
        color: AMBER,
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0);
    this.add
      .text(W / 2, y + 48, report.tip, {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '18px',
        color: INK,
        align: 'center',
        wordWrap: { width: W - 120 },
      })
      .setOrigin(0.5, 0);

    this.addBackBtn();
  }

  private addBackBtn(): void {
    const bg = this.add
      .rectangle(W / 2, H - 100, 320, 64, GREEN)
      .setStrokeStyle(2, 0x2ecc71)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(W / 2, H - 100, 'Назад в хаб', {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '24px',
        color: INK,
        fontStyle: 'bold',
      })
      .setOrigin(0.5);

    bg.on('pointerover', () => bg.setFillStyle(0x219150));
    bg.on('pointerout', () => bg.setFillStyle(GREEN));
    bg.on('pointerup', () => {
      this.scene.start(SCENE.Hub);
    });
  }
}
