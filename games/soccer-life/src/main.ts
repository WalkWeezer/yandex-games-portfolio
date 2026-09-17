import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './gameConfig';
import { BootScene } from './scenes/BootScene';
import { HubScene } from './scenes/HubScene';
import { SquadScene } from './scenes/SquadScene';
import { TacticsScene } from './scenes/TacticsScene';
import { ClubScene } from './scenes/ClubScene';
import { MatchScene } from './scenes/MatchScene';
import { ReportScene } from './scenes/ReportScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#0b1f3a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, HubScene, SquadScene, TacticsScene, ClubScene, MatchScene, ReportScene],
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
