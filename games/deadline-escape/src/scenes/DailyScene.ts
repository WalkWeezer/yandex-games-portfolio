import Phaser from "phaser";
import { COPY } from "../data/canon";
import { loadMeta, saveMeta, todayKey } from "../systems/MetaSave";
import { FONT, LOGICAL_W, MU, addCta, addHeaderBar, addMuted, addSecondary, fillSafeBg } from "../ui/UiKit";

export class DailyScene extends Phaser.Scene {
  private pick: "meeting" | "quiet" = "meeting";

  constructor() {
    super("Daily");
  }

  create(): void {
    fillSafeBg(this);
    addHeaderBar(this, 90, "Смена дня", () => this.scene.start("Hub"));
    addMuted(this, 180, "Сегодня · сброс 00:00 · 1 попытка награды");

    this.drawCards();

    addCta(this, 980, "Взять смену →", () => {
      const meta = loadMeta();
      meta.dailyClaimed = true;
      meta.dailyDate = todayKey();
      saveMeta(meta);
      this.scene.start("Run", { floor: meta.floor, daily: true, dailyPick: this.pick });
    });
    addSecondary(this, 1100, "Обычный этаж (хаб)", () => this.scene.start("Hub"));
  }

  private drawCards(): void {
    const mk = (y: number, id: "meeting" | "quiet", title: string, sub: string, label: string) => {
      const selected = this.pick === id;
      const fill = selected ? MU.okBg : MU.panelHi;
      const stroke = selected ? MU.ok : MU.line;
      const bg = this.add.rectangle(LOGICAL_W / 2, y, MU.contentW, 160, fill).setStrokeStyle(2, stroke);
      this.add
        .text(80, y - 48, label.toUpperCase(), {
          fontFamily: FONT,
          fontSize: "16px",
          color: selected ? "#115e59" : "#5b6b82",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5);
      this.add
        .text(80, y - 8, title, {
          fontFamily: FONT,
          fontSize: "28px",
          color: "#1d3557",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5);
      this.add
        .text(80, y + 40, sub, {
          fontFamily: FONT,
          fontSize: "18px",
          color: "#5b6b82",
          fontStyle: "bold",
          wordWrap: { width: MU.contentW - 80 },
        })
        .setOrigin(0, 0.5);
      bg.setInteractive({ useHandCursor: true }).on("pointerup", () => {
        this.pick = id;
        this.scene.restart();
      });
    };
    mk(
      380,
      "meeting",
      COPY.dailyTitle,
      "Дожить до 15:00 · без кофе · 🎁 🪙40 + бейдж",
      this.pick === "meeting" ? "выбрано" : "вариант",
    );
    mk(
      580,
      "quiet",
      "Тихий этаж",
      "Только HR · до 18:00 · 🎁 🪙25",
      this.pick === "quiet" ? "выбрано" : "альтернатива",
    );
  }
}
