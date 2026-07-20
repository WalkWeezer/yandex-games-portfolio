import Phaser from "phaser";
import { LOGICAL_H, LOGICAL_W } from "./data/canon";
import { BootScene } from "./scenes/BootScene";
import { CaughtScene } from "./scenes/CaughtScene";
import { DailyScene } from "./scenes/DailyScene";
import { HubScene } from "./scenes/HubScene";
import { MenuScene } from "./scenes/MenuScene";
import { PauseScene } from "./scenes/PauseScene";
import { ResultScene } from "./scenes/ResultScene";
import { RunScene } from "./scenes/RunScene";
import { SettingsScene } from "./scenes/SettingsScene";
import { ShopScene } from "./scenes/ShopScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#0e1218",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: LOGICAL_W,
    height: LOGICAL_H,
  },
  scene: [
    BootScene,
    MenuScene,
    HubScene,
    DailyScene,
    RunScene,
    PauseScene,
    CaughtScene,
    ResultScene,
    ShopScene,
    SettingsScene,
  ],
  input: {
    activePointers: 3,
  },
  banner: false,
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
