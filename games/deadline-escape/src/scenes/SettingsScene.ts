import Phaser from "phaser";
import { COPY } from "../data/canon";
import { getSdk } from "../sdk/yandex";
import { loadMeta, saveMeta } from "../systems/MetaSave";
import { addMuted, addSecondary, addTitle, fillBg } from "../ui/UiKit";

interface SettingsData {
  back?: string;
}

export class SettingsScene extends Phaser.Scene {
  private back = "Menu";

  constructor() {
    super("Settings");
  }

  init(data: SettingsData): void {
    this.back = data?.back || "Menu";
  }

  create(): void {
    fillBg(this);
    const meta = loadMeta();
    addTitle(this, 180, COPY.settings, 36);

    const muteBg = this.add.rectangle(360, 360, 560, 90, 0xf7fafc).setStrokeStyle(2, 0xb7c4d4).setInteractive({ useHandCursor: true });
    const muteTxt = this.add.text(360, 360, meta.mute ? "🔇 Звук выкл" : "🔊 Звук вкл", {
      fontSize: "28px",
      color: "#1d3557",
      fontStyle: "bold",
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
    }).setOrigin(0.5);
    muteBg.on("pointerup", () => {
      meta.mute = !meta.mute;
      saveMeta(meta);
      muteTxt.setText(meta.mute ? "🔇 Звук выкл" : "🔊 Звук вкл");
    });

    addMuted(this, 520, "Яндекс Игры · Cloud save · RU · portrait");
    addMuted(this, 580, getSdk().isMock ? "SDK: DEV_MOCK" : "SDK: live");
    addMuted(this, 640, "Графика: заглушки по DESIGN (G0)");

    addSecondary(this, 860, "← Назад", () => {
      if (this.back === "Run") {
        this.scene.stop();
        this.scene.resume("Run");
        this.scene.launch("Pause");
      } else {
        this.scene.start(this.back);
      }
    });
  }
}
