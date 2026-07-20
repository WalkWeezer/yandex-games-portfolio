import Phaser from "phaser";
import { COPY } from "../data/canon";
import { getSdk } from "../sdk/yandex";
import { loadMeta, saveMeta } from "../systems/MetaSave";
import { addCta, addMuted, addSecondary, addTitle, fillBg } from "../ui/UiKit";

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
    fillBg(this, 0xffe8ea);
    addTitle(this, 360, COPY.caught, 40);
    addMuted(this, 440, `эт.${this.payload.floor} · ${this.payload.clock}`);
    this.add.image(360, 580, "char_hero").setScale(5).setTint(0xe63946);

    addCta(this, 820, `▶ ${COPY.rv}`, async () => {
      const ok = await getSdk().showRewarded("revive");
      if (ok) {
        this.scene.start("Run", { floor: this.payload.floor, daily: this.payload.daily });
      }
    });
    addSecondary(this, 920, COPY.skip, () => {
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
