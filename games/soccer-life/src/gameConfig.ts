import Phaser from 'phaser';

export const GAME_WIDTH = 720;
export const GAME_HEIGHT = 1280;

export function createScaleConfig(): Phaser.Types.Core.GameConfig['scale'] {
  return {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  };
}
