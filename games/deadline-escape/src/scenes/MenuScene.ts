import Phaser from "phaser";
import { COPY } from "../data/canon";
import { loadMeta } from "../systems/MetaSave";
import { addCta, addMuted, addSecondary, addTitle, fillBg } from "../ui/UiKit";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    fillBg(this);
    addTitle(this, 220, COPY.brand);
    addMuted(this, 290, "Employee of the Month");

    // Placeholder key-art frame
    const art = this.add.rectangle(360, 520, 360, 360, 0xc5d0df).setStrokeStyle(2, 0xb7c4d4);
    this.add.image(360, 500, "char_hero").setScale(4);
    this.add.text(360, 640, "заглушка · key-art", {
      fontSize: "18px",
      color: "#5b6b82",
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
    }).setOrigin(0.5);
    void art;

    const meta = loadMeta();
    addMuted(this, 760, `🪙 ${meta.coins} · best эт.${meta.bestFloor}`);

    addCta(this, 880, COPY.play, () => this.scene.start("Hub"));
    addSecondary(this, 980, COPY.shop, () => this.scene.start("Shop"));
    addSecondary(this, 1070, COPY.settings, () => this.scene.start("Settings", { back: "Menu" }));
  }
}
