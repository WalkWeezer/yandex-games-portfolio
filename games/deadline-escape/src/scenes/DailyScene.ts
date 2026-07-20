import Phaser from "phaser";
import { COPY } from "../data/canon";
import { loadMeta, saveMeta, todayKey } from "../systems/MetaSave";
import { addCta, addMuted, addSecondary, addTitle, fillBg } from "../ui/UiKit";

export class DailyScene extends Phaser.Scene {
  constructor() {
    super("Daily");
  }

  create(): void {
    fillBg(this);
    addTitle(this, 160, "Смена дня", 36);
    addMuted(this, 220, "Сегодня · сброс 00:00 · 1 попытка награды");

    this.add.rectangle(360, 420, 560, 160, 0xe6f6f3).setStrokeStyle(2, 0x2a9d8f);
    this.add.text(120, 360, COPY.daily.replace("Daily · ", ""), {
      fontSize: "28px",
      color: "#1d3557",
      fontStyle: "bold",
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
    });
    this.add.text(120, 410, "Дожить до 15:00 · без кофе", {
      fontSize: "20px",
      color: "#5b6b82",
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
    });
    this.add.text(120, 450, "🎁 🪙40 + бейдж", {
      fontSize: "20px",
      color: "#115e59",
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
    });

    addCta(this, 640, "Взять смену →", () => {
      const meta = loadMeta();
      meta.dailyClaimed = true;
      meta.dailyDate = todayKey();
      saveMeta(meta);
      this.scene.start("Run", { floor: meta.floor, daily: true });
    });
    addSecondary(this, 740, "Обычный этаж (хаб)", () => this.scene.start("Hub"));
  }
}
