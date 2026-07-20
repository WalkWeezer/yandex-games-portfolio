import Phaser from "phaser";
import { COPY } from "../data/canon";
import { getSdk } from "../sdk/yandex";
import { FONT, LOGICAL_W, MU, addCta, addSecondary, fillSafeBg } from "../ui/UiKit";
import { loadMeta, saveMeta } from "../systems/MetaSave";

interface CaughtData {
  floor: number;
  clock: string;
  coins: number;
  daily?: boolean;
}

export class CaughtScene extends Phaser.Scene {
  private payload!: CaughtData;

  constructor() {
    super("Caught");
  }

  init(data: CaughtData): void {
    this.payload = data;
  }

  create(): void {
    fillSafeBg(this);

    const panel = this.add
      .rectangle(LOGICAL_W / 2, 520, MU.contentW * 0.96, 280, MU.dangerBg)
      .setStrokeStyle(2, 0xf1a0a6);
    this.add
      .text(LOGICAL_W / 2, 460, COPY.caught, {
        fontFamily: FONT,
        fontSize: "36px",
        color: "#7a1520",
        fontStyle: "bold",
        align: "center",
        wordWrap: { width: MU.contentW - 40 },
      })
      .setOrigin(0.5);
    this.add
      .text(LOGICAL_W / 2, 560, `эт.${this.payload.floor} · ${this.payload.clock}`, {
        fontFamily: FONT,
        fontSize: "22px",
        color: "#7a1520",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    void panel;

    addCta(this, 900, `▶ ${COPY.rv}`, async () => {
      const ok = await getSdk().showRewarded("revive");
      if (ok) {
        this.scene.start("Run", { floor: this.payload.floor, daily: this.payload.daily });
      }
    });
    addSecondary(this, 1040, COPY.skip, () => {
      const meta = loadMeta();
      meta.coins += this.payload.coins;
      meta.runsSinceInterstitial += 1;
      saveMeta(meta);
      if (!meta.removeAds && meta.runsSinceInterstitial >= 2) {
        meta.runsSinceInterstitial = 0;
        saveMeta(meta);
        void getSdk().showInterstitial("after_fail");
      }
      this.scene.start("Result", {
        win: false,
        floor: this.payload.floor,
        clock: this.payload.clock,
        coins: meta.coins,
      });
    });
  }
}
