/**
 * UI kit locked to Beta mock (`deadline-mock-ui.css`).
 * Logical 720×1280 = 2× beta 360×640.
 */
import Phaser from "phaser";
import { COPY, LOGICAL_H, LOGICAL_W, PALETTE } from "../data/canon";

export const FONT = "Trebuchet MS, Avenir Next, Segoe UI, sans-serif";

export const MU = {
  bg0: 0xc5d0df,
  bg1: 0xdce5f0,
  panel: 0xe8eef5,
  panelHi: 0xf7fafc,
  ink: 0x1d3557,
  muted: 0x5b6b82,
  line: 0xb7c4d4,
  cta: 0xe9c46a,
  ctaHi: 0xf3d78a,
  ctaLo: 0xb8903a,
  ctaInk: 0x3d2e0a,
  danger: 0xe63946,
  dangerBg: 0xffe8ea,
  ok: 0x2a9d8f,
  okBg: 0xe6f6f3,
  padX: 24,
  padTop: 32,
  contentW: LOGICAL_W - 48,
  radius: 16,
} as const;

export function fillSafeBg(scene: Phaser.Scene): void {
  // Soft vertical wash like .mu-safe (three bands)
  scene.add.rectangle(LOGICAL_W / 2, 200, LOGICAL_W, 400, 0xeaf0f7);
  scene.add.rectangle(LOGICAL_W / 2, 640, LOGICAL_W, 560, MU.bg1);
  scene.add.rectangle(LOGICAL_W / 2, 1100, LOGICAL_W, 400, MU.bg0);
  scene.add.ellipse(LOGICAL_W / 2, -20, LOGICAL_W * 1.15, 320, 0xffffff, 0.28);
}

/** @deprecated use fillSafeBg */
export function fillBg(scene: Phaser.Scene, _color?: number): void {
  void _color;
  fillSafeBg(scene);
}

function txt(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size: number,
  color: string,
  opts: Phaser.Types.GameObjects.Text.TextStyle = {},
): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, text, {
      fontFamily: FONT,
      fontSize: `${size}px`,
      color,
      fontStyle: "bold",
      ...opts,
    })
    .setOrigin(0.5);
}

export function addBrand(scene: Phaser.Scene, y: number, sub = "Employee of the Month"): Phaser.GameObjects.Container {
  const title = scene.add
    .text(0, -18, COPY.brand, {
      fontFamily: FONT,
      fontSize: "34px",
      color: "#1d3557",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  const small = scene.add
    .text(0, 22, sub.toUpperCase(), {
      fontFamily: FONT,
      fontSize: "16px",
      color: "#5b6b82",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  return scene.add.container(LOGICAL_W / 2, y, [title, small]);
}

export function addLabel(scene: Phaser.Scene, x: number, y: number, text: string, originX = 0.5): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, text.toUpperCase(), {
      fontFamily: FONT,
      fontSize: "16px",
      color: "#5b6b82",
      fontStyle: "bold",
    })
    .setOrigin(originX, 0.5);
}

export function addTitle(scene: Phaser.Scene, y: number, text: string, size = 38): Phaser.GameObjects.Text {
  return txt(scene, LOGICAL_W / 2, y, text, size, "#1d3557");
}

export function addMuted(scene: Phaser.Scene, y: number, text: string): Phaser.GameObjects.Text {
  return scene.add
    .text(LOGICAL_W / 2, y, text, {
      fontFamily: FONT,
      fontSize: "20px",
      color: "#5b6b82",
      fontStyle: "bold",
      align: "center",
      wordWrap: { width: MU.contentW - 24 },
    })
    .setOrigin(0.5);
}

export function addPanel(
  scene: Phaser.Scene,
  y: number,
  h: number,
  w = MU.contentW,
  fill: number = MU.panelHi,
  stroke: number = MU.line,
): Phaser.GameObjects.Rectangle {
  return scene.add.rectangle(LOGICAL_W / 2, y, w, h, fill).setStrokeStyle(2, stroke);
}

export function addPanelBlock(
  scene: Phaser.Scene,
  y: number,
  h: number,
  opts: { fill?: number; stroke?: number; w?: number } = {},
): Phaser.GameObjects.Rectangle {
  return addPanel(scene, y, h, opts.w ?? MU.contentW, opts.fill ?? MU.panelHi, opts.stroke ?? MU.line);
}

export function addChip(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  w = 200,
): Phaser.GameObjects.Container {
  const bg = scene.add.rectangle(0, 0, w, 48, MU.panel).setStrokeStyle(2, MU.line);
  const t = scene.add
    .text(0, 0, label, {
      fontFamily: FONT,
      fontSize: "22px",
      color: "#1d3557",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  return scene.add.container(x, y, [bg, t]);
}

export function addCta(
  scene: Phaser.Scene,
  y: number,
  label: string,
  onClick: () => void,
  width = MU.contentW,
): Phaser.GameObjects.Container {
  const shadow = scene.add.rectangle(0, 5, width, 72, MU.ctaLo);
  const bg = scene.add.rectangle(0, 0, width, 72, MU.cta).setStrokeStyle(2, 0xc9a24a);
  // faux gradient highlight
  const hi = scene.add.rectangle(0, -18, width - 8, 28, MU.ctaHi, 0.55);
  const t = scene.add
    .text(0, 0, label, {
      fontFamily: FONT,
      fontSize: "28px",
      color: "#3d2e0a",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  const c = scene.add.container(LOGICAL_W / 2, y, [shadow, bg, hi, t]);
  bg.setInteractive({ useHandCursor: true })
    .on("pointerover", () => bg.setFillStyle(MU.ctaHi))
    .on("pointerout", () => bg.setFillStyle(MU.cta))
    .on("pointerup", onClick);
  return c;
}

export function addSecondary(
  scene: Phaser.Scene,
  y: number,
  label: string,
  onClick: () => void,
  width = MU.contentW,
): Phaser.GameObjects.Container {
  const shadow = scene.add.rectangle(0, 3, width, 64, 0x1d3557, 0.08);
  const bg = scene.add.rectangle(0, 0, width, 64, MU.panelHi).setStrokeStyle(2, MU.line);
  const t = scene.add
    .text(0, 0, label, {
      fontFamily: FONT,
      fontSize: "24px",
      color: "#1d3557",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  const c = scene.add.container(LOGICAL_W / 2, y, [shadow, bg, t]);
  bg.setInteractive({ useHandCursor: true }).on("pointerup", onClick);
  return c;
}

export function addRowButtons(
  scene: Phaser.Scene,
  y: number,
  left: { label: string; onClick: () => void },
  right: { label: string; onClick: () => void },
): void {
  const gap = 16;
  const w = (MU.contentW - gap) / 2;
  const mk = (x: number, label: string, onClick: () => void) => {
    const shadow = scene.add.rectangle(0, 3, w, 64, 0x1d3557, 0.08);
    const bg = scene.add.rectangle(0, 0, w, 64, MU.panelHi).setStrokeStyle(2, MU.line);
    const t = scene.add
      .text(0, 0, label, {
        fontFamily: FONT,
        fontSize: "24px",
        color: "#1d3557",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    const c = scene.add.container(x, y, [shadow, bg, t]);
    bg.setInteractive({ useHandCursor: true }).on("pointerup", onClick);
    return c;
  };
  const cx = LOGICAL_W / 2;
  mk(cx - w / 2 - gap / 2, left.label, left.onClick);
  mk(cx + w / 2 + gap / 2, right.label, right.onClick);
}

export function addIconBtn(
  scene: Phaser.Scene,
  x: number,
  y: number,
  glyph: string,
  onClick: () => void,
): Phaser.GameObjects.Container {
  const bg = scene.add.rectangle(0, 0, 84, 84, MU.panelHi).setStrokeStyle(2, MU.line);
  const t = scene.add
    .text(0, 0, glyph, {
      fontFamily: FONT,
      fontSize: "32px",
      color: "#1d3557",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  const c = scene.add.container(x, y, [bg, t]);
  bg.setInteractive({ useHandCursor: true }).on("pointerup", onClick);
  return c;
}

export function addHeaderBar(
  scene: Phaser.Scene,
  y: number,
  title: string,
  onBack: () => void,
  rightChip?: string,
): void {
  addIconBtn(scene, MU.padX + 42, y, "←", onBack);
  const panelW = rightChip ? MU.contentW - 220 : MU.contentW - 110;
  const panelX = rightChip ? LOGICAL_W / 2 - 40 : LOGICAL_W / 2 + 20;
  scene.add.rectangle(panelX, y, panelW, 84, MU.panelHi).setStrokeStyle(2, MU.line);
  scene.add
    .text(panelX - panelW / 2 + 20, y, title, {
      fontFamily: FONT,
      fontSize: "30px",
      color: "#1d3557",
      fontStyle: "bold",
    })
    .setOrigin(0, 0.5);
  if (rightChip) {
    addChip(scene, LOGICAL_W - MU.padX - 100, y, rightChip, 180);
  }
}

export function addArtFrame(scene: Phaser.Scene, y: number, h = 360): Phaser.GameObjects.Container {
  const w = MU.contentW;
  const bg = scene.add.rectangle(0, 0, w, h, 0xc5d0df).setStrokeStyle(2, MU.line);
  const wash = scene.add.rectangle(0, 0, w - 8, h - 8, 0xeef3f8, 0.65);
  const hero = scene.add.image(0, -10, "char_hero").setScale(5.5);
  const captionBg = scene.add.rectangle(-w / 2 + 90, h / 2 - 28, 160, 36, MU.panelHi, 0.92);
  const caption = scene.add
    .text(-w / 2 + 90, h / 2 - 28, "офис · top-down", {
      fontFamily: FONT,
      fontSize: "16px",
      color: "#5b6b82",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  const stub = scene.add
    .text(0, h / 2 - 70, COPY.placeholder + " · key-art", {
      fontFamily: FONT,
      fontSize: "18px",
      color: "#5b6b82",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  return scene.add.container(LOGICAL_W / 2, y, [bg, wash, hero, captionBg, caption, stub]);
}

export function addProgressBar(
  scene: Phaser.Scene,
  y: number,
  ratio: number,
  w = MU.contentW,
): { track: Phaser.GameObjects.Rectangle; fill: Phaser.GameObjects.Rectangle } {
  const track = scene.add.rectangle(LOGICAL_W / 2, y, w, 22, 0xc5d0df).setStrokeStyle(2, MU.line);
  const fillW = Math.max(8, w * Phaser.Math.Clamp(ratio, 0, 1));
  const fill = scene.add
    .rectangle(LOGICAL_W / 2 - w / 2 + fillW / 2, y, fillW, 16, MU.ok)
    .setOrigin(0.5);
  return { track, fill };
}

export function setProgress(fill: Phaser.GameObjects.Rectangle, track: Phaser.GameObjects.Rectangle, ratio: number): void {
  const w = track.width;
  const fillW = Math.max(8, w * Phaser.Math.Clamp(ratio, 0, 1));
  fill.setPosition(track.x - w / 2 + fillW / 2, track.y);
  fill.width = fillW;
}

export { COPY, LOGICAL_H, LOGICAL_W, PALETTE };
