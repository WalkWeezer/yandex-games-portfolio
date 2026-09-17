import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../gameConfig';
import { SCENE } from '../types';
import { getPlayerClub } from '../state/GameState';
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

/** SC_Club — buildings / transfer / shop stub (G4 later) */
export class ClubScene extends Phaser.Scene {
  constructor() {
    super(SCENE.Club);
  }

  create(): void {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;
    drawPitchBg(this, w, h);

    const club = getPlayerClub();

    addTitle(this, w / 2, 48, 'Клуб', 36);
    addButton(this, {
      x: 100,
      y: 48,
      w: 120,
      h: 48,
      label: '← Хаб',
      fill: 0x2a3a5a,
      fontSize: 20,
      onClick: () => this.scene.start(SCENE.Hub),
    });

    addPanel(this, w / 2, 160, w - 48, 100);
    addLabel(this, w / 2, 140, club.name, 28);
    addMuted(this, w / 2, 180, `Касса: ${formatCash(club.cash)}`, 20);

    const buildings = [
      { name: 'Тренировочная база', lvl: club.trainingLvl },
      { name: 'Стадион', lvl: club.stadiumLvl },
      { name: 'Академия', lvl: club.academyLvl },
    ];

    buildings.forEach((b, i) => {
      const y = 280 + i * 100;
      addPanel(this, w / 2, y, w - 48, 80);
      addLabel(this, 56, y, b.name, 24, 0);
      addMuted(this, w - 56, y, `Ур. ${b.lvl} / 5`, 20, 1);
    });

    addPanel(this, w / 2, 620, w - 48, 120, COLORS.panel);
    addLabel(this, w / 2, 600, 'Трансферы', 24);
    addMuted(this, w / 2, 640, 'Рынок откроется в G4', 18);

    addPanel(this, w / 2, 780, w - 48, 120, COLORS.panel);
    addLabel(this, w / 2, 760, 'Магазин VIP', 24);
    addMuted(this, w / 2, 800, 'IAP / токены — в G5', 18);

    addMuted(this, w / 2, h - 80, 'Заглушка клуба · здания и рынок позже', 16);
  }
}
