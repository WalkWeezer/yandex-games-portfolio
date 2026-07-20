import Phaser from "phaser";
import { COPY } from "../data/canon";
import { loadMeta, saveMeta } from "../systems/MetaSave";
import { FONT, LOGICAL_W, MU, addCta, addHeaderBar, addMuted, fillSafeBg } from "../ui/UiKit";

const SHOP = [
  { id: "skin_a", title: "Скин A", price: 50, kind: "soft" as const },
  { id: "skin_b", title: "Скин B", price: 80, kind: "soft" as const },
  { id: "starter_pack", title: "Стартер", price: 0, kind: "iap" as const },
  { id: "remove_ads", title: "Убрать рекламу", price: 0, kind: "iap" as const },
];

export class ShopScene extends Phaser.Scene {
  private pick = "skin_a";

  constructor() {
    super("Shop");
  }

  create(): void {
    fillSafeBg(this);
    const meta = loadMeta();
    addHeaderBar(this, 90, COPY.shop, () => this.scene.start("Hub"), `🪙 ${meta.coins}`);

    const owned = new Set<string>(meta.removeAds ? ["remove_ads"] : []);
    SHOP.forEach((it, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 180 + col * 340;
      const y = 320 + row * 240;
      const selected = this.pick === it.id;
      const isOwned = owned.has(it.id);
      const fill = selected ? 0xfff8e6 : MU.panel;
      const stroke = selected ? 0xc9a24a : MU.line;
      const bg = this.add.rectangle(x, y, 280, 180, fill).setStrokeStyle(2, stroke);
      if (selected) bg.setStrokeStyle(3, 0xc9a24a);
      this.add
        .text(x, y - 24, `${it.title}${isOwned ? " ✓" : ""}`, {
          fontFamily: FONT,
          fontSize: "24px",
          color: "#1d3557",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      this.add
        .text(x, y + 28, it.kind === "iap" ? "IAP" : `${it.price}🪙`, {
          fontFamily: FONT,
          fontSize: "20px",
          color: "#5b6b82",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      if (!isOwned) {
        bg.setInteractive({ useHandCursor: true }).on("pointerup", () => {
          this.pick = it.id;
          this.scene.restart();
        });
      } else {
        bg.setAlpha(0.55);
      }
    });

    addCta(this, 900, "Купить", () => {
      const m = loadMeta();
      const item = SHOP.find((s) => s.id === this.pick);
      if (!item) return;
      if (item.id === "remove_ads") {
        m.removeAds = true;
        saveMeta(m);
        this.scene.restart();
        return;
      }
      if (item.kind === "soft" && m.coins >= item.price) {
        m.coins -= item.price;
        saveMeta(m);
        this.scene.restart();
      }
    });
    addMuted(this, 1040, "IAP: remove_ads · starter_pack · skin_*");
    void LOGICAL_W;
  }
}
