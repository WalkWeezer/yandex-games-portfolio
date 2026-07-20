import Phaser from "phaser";
import { COPY } from "../data/canon";
import { loadMeta } from "../systems/MetaSave";
import { LOGICAL_W, MU, addArtFrame, addBrand, addChip, addCta, addRowButtons, fillSafeBg } from "../ui/UiKit";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    fillSafeBg(this);
    addBrand(this, 100);
    addArtFrame(this, 420, 420);

    const meta = loadMeta();
    const chipY = 700;
    addChip(this, LOGICAL_W / 2 - 160, chipY, `🪙 ${meta.coins}`, 220);
    addChip(this, LOGICAL_W / 2 + 160, chipY, `best эт.${meta.bestFloor}`, 240);

    addCta(this, 820, COPY.play, () => this.scene.start("Hub"));
    addRowButtons(
      this,
      940,
      { label: COPY.shop, onClick: () => this.scene.start("Shop") },
      { label: COPY.settings, onClick: () => this.scene.start("Settings", { back: "Menu" }) },
    );
    void MU;
  }
}
