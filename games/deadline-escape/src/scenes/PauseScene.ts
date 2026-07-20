import Phaser from "phaser";
import { COPY } from "../data/canon";
import { FONT, LOGICAL_W, MU, addCta, addSecondary, fillSafeBg } from "../ui/UiKit";
import type { RunScene } from "./RunScene";

export class PauseScene extends Phaser.Scene {
  constructor() {
    super("Pause");
  }

  create(): void {
    // Dim like .mu-modal-dim
    this.add.rectangle(LOGICAL_W / 2, 640, LOGICAL_W, 1280, 0x1d3557, 0.48);

    const modal = this.add
      .rectangle(LOGICAL_W / 2, 640, MU.contentW, 420, MU.panelHi)
      .setStrokeStyle(2, MU.line);
    void modal;

    this.add
      .text(LOGICAL_W / 2, 500, COPY.pause, {
        fontFamily: FONT,
        fontSize: "40px",
        color: "#1d3557",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    addCta(this, 600, COPY.resume, () => {
      const run = this.scene.get("Run") as RunScene;
      run.resumeFromPause();
      this.scene.stop();
    }, MU.contentW - 40);

    addSecondary(this, 710, COPY.settings, () => {
      this.scene.stop();
      this.scene.pause("Run");
      this.scene.start("Settings", { back: "Run" });
    }, MU.contentW - 40);

    addSecondary(this, 820, COPY.toHub, () => {
      const run = this.scene.get("Run") as RunScene;
      run.quitToHub();
    }, MU.contentW - 40);
  }
}
