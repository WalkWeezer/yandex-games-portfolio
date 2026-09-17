import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../gameConfig';
import { SCENE } from '../types';
import { REG } from '../engine/types';
import {
  getPlayerClub,
  getNextOpponent,
  getSeason,
  sortedTable,
  getClub,
  isVip,
} from '../state/GameState';
import { nextFixture } from '../data/league';
import {
  COLORS,
  addButton,
  addLabel,
  addMuted,
  addPanel,
  addTitle,
  drawPitchBg,
  formatCash,
} from '../ui/theme';

/** SC_Hub — home: club, cash, table stub, next opponent, nav */
export class HubScene extends Phaser.Scene {
  constructor() {
    super(SCENE.Hub);
  }

  create(): void {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;
    drawPitchBg(this, w, h);

    const club = getPlayerClub();
    const season = getSeason();
    const opp = getNextOpponent();
    const table = sortedTable();
    const myRank = table.findIndex((t) => t.row.clubId === club.id) + 1;
    const myRow = table.find((t) => t.row.clubId === club.id)?.row;

    addTitle(this, w / 2, 56, 'Живи Футболом', 34);
    addMuted(this, w / 2, 92, `Тур ${season.matchday} / ${season.matchdaysTotal}`, 18);

    addPanel(this, w / 2, 180, w - 48, 110);
    addLabel(this, w / 2, 155, club.name, 30);
    addMuted(
      this,
      w / 2,
      195,
      `Касса: ${formatCash(club.cash)}  ·  ${myRank}-е место  ·  ${myRow?.pts ?? 0} очк.`,
      18,
    );

    addPanel(this, w / 2, 340, w - 48, 140, COLORS.pitchDark);
    addMuted(this, w / 2, 290, 'СЛЕДУЮЩИЙ МАТЧ', 16);
    addLabel(this, w / 2, 330, opp ? `vs ${opp.name}` : 'Сезон завершён', 28);
    if (opp) {
      addMuted(this, w / 2, 370, `Цвета соперника · сила базы ур.${opp.stadiumLvl}`, 16);
    }

    addMuted(this, w / 2, 440, 'ТАБЛИЦА (фрагмент)', 16);
    addPanel(this, w / 2, 580, w - 48, 240);
    const show = buildTablePreview(table, club.id);
    show.forEach((line, i) => {
      const y = 480 + i * 36;
      const isMe = line.clubId === club.id;
      this.add
        .text(56, y, line.text, {
          fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
          fontSize: '20px',
          color: isMe ? '#e8a838' : '#e8eef5',
          fontStyle: isMe ? 'bold' : 'normal',
        })
        .setOrigin(0, 0.5);
    });

    const bw = w - 64;
    const bh = 72;
    let by = 760;
    addButton(this, {
      x: w / 2,
      y: by,
      w: bw,
      h: bh,
      label: 'Играть матч',
      fill: COLORS.pitch,
      fontSize: 30,
      onClick: () => this.startMatch(),
    });
    by += 88;
    addButton(this, {
      x: w / 2,
      y: by,
      w: bw,
      h: bh,
      label: 'Состав',
      fill: COLORS.btnAlt,
      onClick: () => this.scene.start(SCENE.Squad),
    });
    by += 88;
    addButton(this, {
      x: w / 2,
      y: by,
      w: bw,
      h: bh,
      label: 'Тактика',
      fill: COLORS.btnAlt,
      onClick: () => this.scene.start(SCENE.Tactics),
    });
    by += 88;
    addButton(this, {
      x: w / 2,
      y: by,
      w: bw,
      h: bh,
      label: 'Клуб',
      fill: 0x2a3a5a,
      onClick: () => this.scene.start(SCENE.Club),
    });
  }

  private startMatch(): void {
    const club = getPlayerClub();
    const season = getSeason();
    const fx = nextFixture(season, club.id);
    if (!fx) {
      this.scene.start(SCENE.Match);
      return;
    }
    const home = getClub(fx.homeId);
    const away = getClub(fx.awayId);
    this.registry.set(REG.matchConfig, {
      home,
      away,
      seed: season.matchday * 10007 + 42,
      liveCharges: isVip() ? 4 : 3,
    });
    this.scene.start(SCENE.Match);
  }
}

function buildTablePreview(
  table: {
    row: { clubId: string; played: number; pts: number; gf: number; ga: number };
    club: { id: string; name: string };
  }[],
  myId: string,
): { clubId: string; text: string }[] {
  const top = table.slice(0, 5);
  const lines = top.map((t, i) => ({
    clubId: t.row.clubId,
    text: `${i + 1}. ${t.club.name}  ${t.row.pts} очк.  (${t.row.gf}:${t.row.ga})`,
  }));
  const myIdx = table.findIndex((t) => t.row.clubId === myId);
  if (myIdx >= 5) {
    const t = table[myIdx];
    lines.push({
      clubId: myId,
      text: `${myIdx + 1}. ${t.club.name}  ${t.row.pts} очк.  (${t.row.gf}:${t.row.ga})`,
    });
  }
  return lines;
}
