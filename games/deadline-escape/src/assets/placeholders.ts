import Phaser from "phaser";
import { CELL, KINDS, PALETTE, TILE } from "../data/canon";

/** Runtime placeholder textures — IDs match DESIGN asset naming. Swap files later, keep keys. */
export function registerPlaceholders(scene: Phaser.Scene): void {
  const g = scene.make.graphics({ x: 0, y: 0 }, false);

  const square = (key: string, fill: number, label?: string, stroke = 0x1d3557) => {
    if (scene.textures.exists(key)) return;
    g.clear();
    g.fillStyle(fill, 1);
    g.fillRoundedRect(1, 1, TILE - 2, TILE - 2, 4);
    g.lineStyle(2, stroke, 0.85);
    g.strokeRoundedRect(1, 1, TILE - 2, TILE - 2, 4);
    g.generateTexture(key, TILE, TILE);
    if (label) stampLabel(scene, key, label);
  };

  const circle = (key: string, fill: number, label?: string) => {
    if (scene.textures.exists(key)) return;
    g.clear();
    g.fillStyle(fill, 1);
    g.fillCircle(TILE / 2, TILE / 2, TILE / 2 - 2);
    g.lineStyle(2, 0xffffff, 0.55);
    g.strokeCircle(TILE / 2, TILE / 2, TILE / 2 - 2);
    g.generateTexture(key, TILE, TILE);
    if (label) stampLabel(scene, key, label);
  };

  // Env tiles — DESIGN §8
  square("tile_floor_a", PALETTE.carpet);
  square("tile_floor_b", PALETTE.carpetAlt);
  square("tile_desk", PALETTE.desk, "стол");
  square("tile_desk2", PALETTE.desk, "2×1");
  square("tile_plant", PALETTE.plant, "раст");
  square("tile_cooler", PALETTE.cooler, "кул");
  square("tile_fog", PALETTE.fog, "fog");
  square("tile_wall", PALETTE.wall, "стен");
  square("tile_window", PALETTE.window, "окн");

  circle("char_hero", PALETTE.player, "ГГ");
  circle("char_colleague", PALETTE.ally, "кол");

  for (const k of KINDS) {
    circle(`boss_${k.id}`, k.color, k.label.slice(0, 4));
  }

  circle("pu_coin", PALETTE.coin, "🪙");
  circle("pu_coffee", PALETTE.coffee, "☕");
  circle("pu_badge", PALETTE.badge, "ID");

  uiPanel(scene, g, "ui_panel", 240, 120, PALETTE.uiPanel);
  uiPanel(scene, g, "ui_btn_cta", 200, 48, PALETTE.uiCta);
  uiPanel(scene, g, "ui_btn_secondary", 200, 48, 0xffffff);

  g.destroy();
}

function uiPanel(
  scene: Phaser.Scene,
  g: Phaser.GameObjects.Graphics,
  key: string,
  w: number,
  h: number,
  fill: number,
): void {
  if (scene.textures.exists(key)) return;
  g.clear();
  g.fillStyle(fill, 1);
  g.fillRoundedRect(0, 0, w, h, 12);
  g.lineStyle(2, 0xb7c4d4, 1);
  g.strokeRoundedRect(0, 0, w, h, 12);
  g.generateTexture(key, w, h);
}

function stampLabel(scene: Phaser.Scene, key: string, text: string): void {
  const tex = scene.textures.get(key);
  const src = tex.getSourceImage() as HTMLCanvasElement | HTMLImageElement;
  const canvas = document.createElement("canvas");
  canvas.width = TILE;
  canvas.height = TILE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(src as CanvasImageSource, 0, 0);
  ctx.fillStyle = "rgba(29,53,87,0.92)";
  ctx.font = "bold 9px Trebuchet MS, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, TILE / 2, TILE / 2);
  if (scene.textures.exists(key)) scene.textures.remove(key);
  scene.textures.addCanvas(key, canvas);
}

export function cellTexture(code: number, col: number, row: number): string {
  switch (code) {
    case CELL.DESK:
      return "tile_desk";
    case CELL.DESK2_W:
    case CELL.DESK2_E:
      return "tile_desk2";
    case CELL.PLANT:
      return "tile_plant";
    case CELL.COOLER:
      return "tile_cooler";
    case CELL.WALL:
      return "tile_wall";
    case CELL.WINDOW:
      return "tile_window";
    default:
      return (col + row) % 2 === 0 ? "tile_floor_a" : "tile_floor_b";
  }
}
