import Phaser from "phaser";
import { COPY, unlockedKinds } from "../data/canon";
import { loadMeta, saveMeta } from "../systems/MetaSave";
import {
  FONT,
  LOGICAL_W,
  MU,
  addChip,
  addCta,
  addLabel,
  addPanel,
  addRowButtons,
  addTitle,
  fillSafeBg,
} from "../ui/UiKit";

export class HubScene extends Phaser.Scene {
  constructor() {
    super("Hub");
  }

  create(): void {
    fillSafeBg(this);
    const meta = loadMeta();

    addPanel(this, 100, 100);
    addLabel(this, 80, 70, "Hub", 0);
    addTitle(this, 118, "Офис · этажи", 34).setOrigin(0.5);

    addChip(this, LOGICAL_W / 2 - 160, 200, `🪙 ${meta.coins}`, 220);
    addChip(this, LOGICAL_W / 2 + 160, 200, `best эт.${meta.bestFloor}`, 240);

    // Daily card
    const dailyY = 320;
    const dailyFill = meta.dailyClaimed ? 0xe2e8f0 : MU.okBg;
    const dailyStroke = meta.dailyClaimed ? MU.line : MU.ok;
    const dailyBg = this.add
      .rectangle(LOGICAL_W / 2, dailyY, MU.contentW, 140, dailyFill)
      .setStrokeStyle(2, dailyStroke);
    this.add
      .text(80, dailyY - 42, (meta.dailyClaimed ? "Daily · завтра" : "Daily · сегодня").toUpperCase(), {
        fontFamily: FONT,
        fontSize: "16px",
        color: "#115e59",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);
    this.add
      .text(80, dailyY - 4, COPY.daily, {
        fontFamily: FONT,
        fontSize: "26px",
        color: "#1d3557",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);
    this.add
      .text(80, dailyY + 40, meta.dailyClaimed ? "Награда уже получена" : "1/день · выбор смены", {
        fontFamily: FONT,
        fontSize: "18px",
        color: "#5b6b82",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);
    if (!meta.dailyClaimed) {
      dailyBg.setInteractive({ useHandCursor: true }).on("pointerup", () => this.scene.start("Daily"));
    }

    addLabel(this, 80, 430, "Этажи", 0);

    const startX = 120;
    const startY = 520;
    const cell = 160;
    const gap = 24;
    for (let i = 1; i <= 6; i++) {
      const locked = i > meta.unlocked;
      const current = i === meta.floor;
      const col = (i - 1) % 3;
      const row = Math.floor((i - 1) / 3);
      const x = startX + col * (cell + gap);
      const y = startY + row * (cell + gap);
      const fill = current ? MU.cta : locked ? 0xd7dee8 : MU.panel;
      const stroke = current ? 0xc9a24a : MU.line;
      const bg = this.add.rectangle(x, y, cell, cell, fill).setStrokeStyle(2, stroke);
      if (current) {
        this.add.rectangle(x, y + 4, cell, cell, MU.ctaLo).setDepth(-1);
      }
      this.add
        .text(x, y - 8, locked ? "🔒" : String(i), {
          fontFamily: FONT,
          fontSize: "40px",
          color: "#1d3557",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      this.add
        .text(x, y + 36, locked ? "лок" : current ? "сейчас" : "эт.", {
          fontFamily: FONT,
          fontSize: "16px",
          color: "#5b6b82",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      if (!locked) {
        bg.setInteractive({ useHandCursor: true }).on("pointerup", () => {
          meta.floor = i;
          saveMeta(meta);
          this.scene.restart();
        });
      }
    }

    const kinds = unlockedKinds(meta.floor)
      .slice(0, 3)
      .map((k) => k.label)
      .join(" · ");
    addPanel(this, 880, 70);
    this.add
      .text(LOGICAL_W / 2, 880, `Боссы этажа ${meta.floor}: ${kinds || "HR"}`, {
        fontFamily: FONT,
        fontSize: "20px",
        color: "#5b6b82",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    addCta(this, 1000, `${COPY.toWork} · эт.${meta.floor} →`, () => {
      this.scene.start("Run", { floor: meta.floor, daily: false });
    });
    addRowButtons(
      this,
      1120,
      { label: COPY.shop, onClick: () => this.scene.start("Shop") },
      { label: "← Меню", onClick: () => this.scene.start("Menu") },
    );
  }
}
