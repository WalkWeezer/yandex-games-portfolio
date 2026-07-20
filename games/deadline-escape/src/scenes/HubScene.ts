import Phaser from "phaser";
import { COPY } from "../data/canon";
import { loadMeta, saveMeta } from "../systems/MetaSave";
import { addCta, addMuted, addSecondary, addTitle, fillBg } from "../ui/UiKit";

export class HubScene extends Phaser.Scene {
  constructor() {
    super("Hub");
  }

  create(): void {
    fillBg(this);
    const meta = loadMeta();
    addTitle(this, 140, "Офис · этажи", 36);
    addMuted(this, 200, `🪙 ${meta.coins} · best эт.${meta.bestFloor}`);

    const dailyY = 300;
    const dailyBg = this.add.rectangle(360, dailyY, 560, 120, meta.dailyClaimed ? 0xe2e8f0 : 0xe6f6f3)
      .setStrokeStyle(2, meta.dailyClaimed ? 0xb7c4d4 : 0x2a9d8f)
      .setInteractive({ useHandCursor: !meta.dailyClaimed });
    this.add.text(120, dailyY - 36, meta.dailyClaimed ? "Daily · завтра" : "Daily · сегодня", {
      fontSize: "18px",
      color: "#115e59",
      fontStyle: "bold",
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
    });
    this.add.text(120, dailyY - 8, COPY.daily, {
      fontSize: "26px",
      color: "#1d3557",
      fontStyle: "bold",
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
    });
    this.add.text(120, dailyY + 28, meta.dailyClaimed ? "Награда уже получена" : "1/день · тап → выбор", {
      fontSize: "18px",
      color: "#5b6b82",
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
    });
    if (!meta.dailyClaimed) {
      dailyBg.on("pointerup", () => this.scene.start("Daily"));
    }

    // Floor grid
    const startX = 140;
    const startY = 460;
    for (let i = 1; i <= 6; i++) {
      const locked = i > meta.unlocked;
      const current = i === meta.floor;
      const col = (i - 1) % 3;
      const row = Math.floor((i - 1) / 3);
      const x = startX + col * 150;
      const y = startY + row * 150;
      const bg = this.add.rectangle(x, y, 120, 120, current ? 0xe9c46a : locked ? 0xd7dee8 : 0xf7fafc)
        .setStrokeStyle(2, current ? 0xc9a24a : 0xb7c4d4);
      this.add.text(x, y, locked ? "🔒" : String(i), {
        fontSize: "36px",
        color: "#1d3557",
        fontStyle: "bold",
        fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
      }).setOrigin(0.5);
      if (!locked) {
        bg.setInteractive({ useHandCursor: true }).on("pointerup", () => {
          meta.floor = i;
          saveMeta(meta);
          this.scene.restart();
        });
      }
    }

    addMuted(this, 780, `Боссы этажа ${meta.floor}: по разлоку DESIGN`);
    addCta(this, 900, `${COPY.toWork} · эт.${meta.floor} →`, () => {
      this.scene.start("Run", { floor: meta.floor, daily: false });
    });
    addSecondary(this, 1000, COPY.shop, () => this.scene.start("Shop"));
    addSecondary(this, 1090, "← Меню", () => this.scene.start("Menu"));
  }
}
