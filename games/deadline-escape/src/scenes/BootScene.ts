import Phaser from "phaser";
import { registerPlaceholders } from "../assets/placeholders";
import { COPY } from "../data/canon";
import { createYandexSdk } from "../sdk/yandex";
import { FONT, MU, addBrand, addLabel, addMuted, addProgressBar, fillSafeBg, setProgress } from "../ui/UiKit";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  async create(): Promise<void> {
    fillSafeBg(this);
    addBrand(this, 420, "Yandex Games · HTML5");

    const panel = this.add.rectangle(360, 640, MU.contentW * 0.92, 160, MU.panelHi).setStrokeStyle(2, MU.line);
    addLabel(this, 360, 580, "LoadingAPI");
    const msg = this.add
      .text(360, 620, "Инициализация SDK…", {
        fontFamily: FONT,
        fontSize: "20px",
        color: "#5b6b82",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const { track, fill } = addProgressBar(this, 680, 0.1, MU.contentW * 0.78);
    void panel;

    registerPlaceholders(this);

    const sdk = await createYandexSdk();
    await sdk.init();
    setProgress(fill, track, 0.55);
    msg.setText(sdk.isMock ? "SDK DEV_MOCK…" : "SDK…");
    await new Promise((r) => setTimeout(r, 180));
    setProgress(fill, track, 1);
    sdk.loadingReady();
    msg.setText("LoadingAPI.ready()");
    addMuted(this, 1180, "portrait-primary · 720×1280");
    await new Promise((r) => setTimeout(r, 160));
    this.scene.start("Menu");
  }
}
