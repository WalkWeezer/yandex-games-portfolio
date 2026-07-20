import Phaser from "phaser";
import { registerPlaceholders } from "../assets/placeholders";
import { COPY } from "../data/canon";
import { createYandexSdk } from "../sdk/yandex";
import { addMuted, addTitle, fillBg } from "../ui/UiKit";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    /* placeholders generated in create */
  }

  async create(): Promise<void> {
    fillBg(this, 0xeaf0f7);
    addTitle(this, 420, COPY.brand, 40);
    addMuted(this, 490, "Yandex Games · HTML5");
    const barBg = this.add.rectangle(360, 640, 420, 18, 0xc5d0df).setStrokeStyle(1, 0xb7c4d4);
    const bar = this.add.rectangle(360 - 210 + 8, 640, 16, 12, 0x2a9d8f).setOrigin(0, 0.5);
    const msg = addMuted(this, 700, "Инициализация SDK…");

    registerPlaceholders(this);

    const sdk = await createYandexSdk();
    await sdk.init();
    bar.width = 200;
    msg.setText(sdk.isMock ? "SDK DEV_MOCK…" : "SDK…");
    await new Promise((r) => setTimeout(r, 180));
    bar.width = 400;
    sdk.loadingReady();
    msg.setText("LoadingAPI.ready()");
    void barBg;
    await new Promise((r) => setTimeout(r, 160));
    this.scene.start("Menu");
  }
}
