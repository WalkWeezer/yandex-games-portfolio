import Phaser from "phaser";
import { COPY } from "../data/canon";
import { getSdk } from "../sdk/yandex";
import { loadMeta, saveMeta } from "../systems/MetaSave";
import { FONT, LOGICAL_W, MU, addHeaderBar, fillSafeBg } from "../ui/UiKit";

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
    fillSafeBg(this);
    const meta = loadMeta();
    addHeaderBar(this, 90, COPY.settings, () => this.goBack());

    const muteBg = this.add
      .rectangle(LOGICAL_W / 2, 320, MU.contentW, 100, MU.panelHi)
      .setStrokeStyle(2, MU.line)
      .setInteractive({ useHandCursor: true });
    const muteTxt = this.add
      .text(LOGICAL_W / 2, 320, meta.mute ? "🔇 Звук выкл" : "🔊 Звук вкл", {
        fontFamily: FONT,
        fontSize: "28px",
        color: "#1d3557",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    muteBg.on("pointerup", () => {
      meta.mute = !meta.mute;
      saveMeta(meta);
      muteTxt.setText(meta.mute ? "🔇 Звук выкл" : "🔊 Звук вкл");
    });

    const info = (y: number, label: string, sub: string) => {
      this.add.rectangle(LOGICAL_W / 2, y, MU.contentW, 120, MU.panelHi).setStrokeStyle(2, MU.line);
      this.add
        .text(80, y - 28, label.toUpperCase(), {
          fontFamily: FONT,
          fontSize: "16px",
          color: "#5b6b82",
          fontStyle: "bold",
        })
        .setOrigin(0, 0.5);
      this.add
        .text(80, y + 18, sub, {
          fontFamily: FONT,
          fontSize: "20px",
          color: "#5b6b82",
          fontStyle: "bold",
          wordWrap: { width: MU.contentW - 80 },
        })
        .setOrigin(0, 0.5);
    };
    info(500, "Яндекс Игры", "Cloud save · RU · portrait · SDK " + (getSdk().isMock ? "DEV_MOCK" : "live"));
    info(680, "Сборка UI", "G0 · UI = beta mock shell · графика-заглушки");
  }

  private goBack(): void {
    if (this.back === "Run") {
      this.scene.stop();
      this.scene.resume("Run");
      this.scene.launch("Pause");
    } else {
      this.scene.start(this.back);
    }
  }
}
