import Phaser from "phaser";
import { COPY } from "../data/canon";
import { getSdk } from "../sdk/yandex";
import { addCta, addMuted, addSecondary, addTitle, fillBg } from "../ui/UiKit";
import type { RunScene } from "./RunScene";

export class PauseScene extends Phaser.Scene {
  constructor() {
    super("Pause");
  }

  create(): void {
    this.add.rectangle(360, 640, 720, 1280, 0x1d3557, 0.45);
    this.add.rectangle(360, 640, 560, 420, 0xf7fafc).setStrokeStyle(2, 0xb7c4d4);
    addTitle(this, 500, COPY.pause, 36);
    addMuted(this, 560, "GameplayAPI.stop на паузе");

    addCta(this, 660, COPY.resume, () => {
      const run = this.scene.get("Run") as RunScene;
      run.resumeFromPause();
      this.scene.stop();
    });
    addSecondary(this, 760, COPY.settings, () => {
      this.scene.stop();
      this.scene.pause("Run");
      this.scene.start("Settings", { back: "Run" });
    });
    addSecondary(this, 860, COPY.toHub, () => {
      const run = this.scene.get("Run") as RunScene;
      run.quitToHub();
    });
    void getSdk;
  }
}
