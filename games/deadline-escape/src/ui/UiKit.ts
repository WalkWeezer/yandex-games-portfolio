import Phaser from "phaser";
import { COPY, LOGICAL_H, LOGICAL_W, PALETTE } from "../data/canon";

export function fillBg(scene: Phaser.Scene, color = 0xdce5f0): void {
  scene.add.rectangle(LOGICAL_W / 2, LOGICAL_H / 2, LOGICAL_W, LOGICAL_H, color);
}

export function addTitle(scene: Phaser.Scene, y: number, text: string, size = 42): Phaser.GameObjects.Text {
  return scene.add
    .text(LOGICAL_W / 2, y, text, {
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
      fontSize: `${size}px`,
      color: "#1d3557",
      fontStyle: "bold",
      align: "center",
    })
    .setOrigin(0.5);
}

export function addMuted(scene: Phaser.Scene, y: number, text: string): Phaser.GameObjects.Text {
  return scene.add
    .text(LOGICAL_W / 2, y, text, {
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
      fontSize: "22px",
      color: "#5b6b82",
      align: "center",
      wordWrap: { width: LOGICAL_W - 80 },
    })
    .setOrigin(0.5);
}

export function addCta(
  scene: Phaser.Scene,
  y: number,
  label: string,
  onClick: () => void,
  width = 420,
): Phaser.GameObjects.Container {
  const bg = scene.add.rectangle(0, 0, width, 72, PALETTE.uiCta).setStrokeStyle(2, 0xc9a24a);
  const txt = scene.add
    .text(0, 0, label, {
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
      fontSize: "28px",
      color: "#3d2e0a",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  const c = scene.add.container(LOGICAL_W / 2, y, [bg, txt]);
  bg.setInteractive({ useHandCursor: true }).on("pointerup", onClick);
  return c;
}

export function addSecondary(
  scene: Phaser.Scene,
  y: number,
  label: string,
  onClick: () => void,
  width = 420,
): Phaser.GameObjects.Container {
  const bg = scene.add.rectangle(0, 0, width, 64, 0xf7fafc).setStrokeStyle(2, 0xb7c4d4);
  const txt = scene.add
    .text(0, 0, label, {
      fontFamily: "Trebuchet MS, Segoe UI, sans-serif",
      fontSize: "24px",
      color: "#1d3557",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  const c = scene.add.container(LOGICAL_W / 2, y, [bg, txt]);
  bg.setInteractive({ useHandCursor: true }).on("pointerup", onClick);
  return c;
}

export function addPanel(scene: Phaser.Scene, y: number, h: number, w = 560): Phaser.GameObjects.Rectangle {
  return scene.add
    .rectangle(LOGICAL_W / 2, y, w, h, PALETTE.uiPanel)
    .setStrokeStyle(2, 0xb7c4d4);
}

export { COPY, LOGICAL_H, LOGICAL_W, PALETTE };
