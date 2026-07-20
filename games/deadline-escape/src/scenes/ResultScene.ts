import Phaser from "phaser";
import { COPY } from "../data/canon";
import { addCta, addMuted, addSecondary, addTitle, fillBg } from "../ui/UiKit";

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
    fillBg(this, this.payload.win ? 0xe6f6f3 : 0xffe8ea);
    addTitle(this, 280, this.payload.win ? COPY.promote : COPY.failTitle, 42);
    if (this.payload.win) {
      addMuted(this, 360, `Этаж → ${this.payload.floor}`);
      addMuted(this, 410, "Время до 18:00 ✓");
      addMuted(this, 460, `🪙 итого ${this.payload.coins}`);
      addCta(this, 700, COPY.nextFloor, () => this.scene.start("Run", { floor: this.payload.floor }));
    } else {
      addMuted(this, 360, `Этаж ${this.payload.floor}`);
      addMuted(this, 410, `Время ${this.payload.clock || "—"}`);
      addMuted(this, 460, `🪙 ${this.payload.coins}`);
      addCta(this, 700, COPY.again, () => this.scene.start("Run", { floor: this.payload.floor }));
    }
    addSecondary(this, 800, COPY.toHub, () => this.scene.start("Hub"));
  }
}
