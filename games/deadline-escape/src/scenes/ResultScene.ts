import Phaser from "phaser";
import { COPY } from "../data/canon";
import {
  FONT,
  LOGICAL_W,
  MU,
  addCta,
  addLabel,
  addPanel,
  addSecondary,
  fillSafeBg,
} from "../ui/UiKit";

interface ResultData {
  win: boolean;
  floor: number;
  coins: number;
  clock?: string;
}

export class ResultScene extends Phaser.Scene {
  private payload!: ResultData;

  constructor() {
    super("Result");
  }

  init(data: ResultData): void {
    this.payload = data;
  }

  create(): void {
    fillSafeBg(this);
    const win = this.payload.win;

    addPanel(this, 160, 140, MU.contentW, win ? MU.okBg : MU.dangerBg, win ? 0x9ed9d0 : 0xf1a0a6);
    addLabel(this, 80, 110, "Result", 0);
    this.add
      .text(LOGICAL_W / 2, 175, win ? COPY.promote : COPY.failTitle, {
        fontFamily: FONT,
        fontSize: "40px",
        color: win ? "#115e59" : "#7a1520",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const rows = win
      ? [`Этаж → ${this.payload.floor}`, "Время до 18:00 ✓", `🪙 итого ${this.payload.coins}`]
      : [`Этаж ${this.payload.floor}`, `Время ${this.payload.clock || "—"}`, `🪙 ${this.payload.coins}`];

    rows.forEach((line, i) => {
      const y = 360 + i * 110;
      addPanel(this, y, 88);
      this.add
        .text(LOGICAL_W / 2, y, line, {
          fontFamily: FONT,
          fontSize: "26px",
          color: "#1d3557",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
    });

    addCta(this, 820, win ? COPY.nextFloor : COPY.again, () => {
      this.scene.start("Run", { floor: this.payload.floor });
    });
    addSecondary(this, 960, COPY.toHub, () => this.scene.start("Hub"));
  }
}
