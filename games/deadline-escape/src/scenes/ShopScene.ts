import Phaser from "phaser";
import { COPY } from "../data/canon";
import { loadMeta, saveMeta } from "../systems/MetaSave";
import { addCta, addMuted, addSecondary, addTitle, fillBg } from "../ui/UiKit";

export class ShopScene extends Phaser.Scene {
  constructor() {
    super("Shop");
  }

  create(): void {
    fillBg(this);
    const meta = loadMeta();
    addTitle(this, 140, COPY.shop, 36);
    addMuted(this, 200, `🪙 ${meta.coins}`);

    const items = [
      { id: "skin_a", title: "Скин A", price: 50 },
      { id: "skin_b", title: "Скин B", price: 80 },
      { id: "starter", title: "Стартер IAP", price: 0 },
      { id: "remove_ads", title: meta.removeAds ? "No ads ✓" : "Убрать рекламу", price: 0 },
    ];

    items.forEach((it, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 200 + col * 320;
      const y = 380 + row * 200;
      this.add.rectangle(x, y, 260, 160, 0xf7fafc).setStrokeStyle(2, 0xb7c4d4);
      this.add.text(x, y - 24, it.title, {
        fontSize: "24px",
        color: "#1d3557",
        fontStyle: "bold",
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
      }).setOrigin(0.5);
      this.add.text(x, y + 24, it.price ? `${it.price}🪙` : "IAP", {
        fontSize: "20px",
        color: "#5b6b82",
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
      }).setOrigin(0.5);
    });

    addCta(this, 860, "Купить · remove ads", () => {
      const m = loadMeta();
      m.removeAds = true;
      saveMeta(m);
      this.scene.restart();
    });
    addSecondary(this, 960, "← Хаб", () => this.scene.start("Hub"));
    addMuted(this, 1080, "IAP ids: remove_ads · starter_pack · skin_*");
  }
}
