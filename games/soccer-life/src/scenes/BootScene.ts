import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../gameConfig';
import { SCENE } from '../types';
import { loadOrCreate } from '../state/localSave';
import { COLORS, addTitle, addMuted } from '../ui/theme';

/** SC_Boot — load + init save, then Hub */
export class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENE.Boot);
  }

  create(): void {
    const { width: w, height: h } = { width: GAME_WIDTH, height: GAME_HEIGHT };
    this.cameras.main.setBackgroundColor(COLORS.navyDeep);

    addTitle(this, w / 2, h * 0.38, 'Живи Футболом', 48);
    addMuted(this, w / 2, h * 0.46, 'Soccer Life', 22);

    const barBg = this.add.rectangle(w / 2, h * 0.58, 400, 18, 0x122a4a).setStrokeStyle(1, COLORS.panelBorder);
    const bar = this.add.rectangle(barBg.x - 200, h * 0.58, 4, 14, COLORS.pitch).setOrigin(0, 0.5);

    this.tweens.add({
      targets: bar,
      width: 396,
      duration: 500,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        loadOrCreate(42);
        this.scene.start(SCENE.Hub);
      },
    });
  }
}
