/** Shared palette + UI helpers for navy/green sports shell */

export const COLORS = {
  navy: 0x0b1f3a,
  navyDeep: 0x061428,
  pitch: 0x1a7a3a,
  pitchDark: 0x0f5a28,
  ink: 0xe8eef5,
  muted: 0x9aacbf,
  amber: 0xe8a838,
  danger: 0xd64545,
  panel: 0x122a4a,
  panelBorder: 0x2a4a6e,
  btn: 0x1a7a3a,
  btnAlt: 0x1a4a7a,
  btnDanger: 0x8a2030,
} as const;

export type ButtonOpts = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  fill?: number;
  fontSize?: number;
  onClick: () => void;
};

export function addPanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: number = COLORS.panel,
): Phaser.GameObjects.Rectangle {
  const r = scene.add.rectangle(x, y, w, h, fill, 0.92).setStrokeStyle(2, COLORS.panelBorder);
  return r;
}

export function addTitle(scene: Phaser.Scene, x: number, y: number, text: string, size = 36): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, text, {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: `${size}px`,
      color: '#e8eef5',
      fontStyle: 'bold',
    })
    .setOrigin(0.5);
}

export function addLabel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size = 22,
  originX = 0.5,
): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, text, {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: `${size}px`,
      color: '#e8eef5',
    })
    .setOrigin(originX, 0.5);
}

export function addMuted(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  size = 18,
  originX = 0.5,
): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, text, {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: `${size}px`,
      color: '#9aacbf',
    })
    .setOrigin(originX, 0.5);
}

export function addButton(scene: Phaser.Scene, opts: ButtonOpts): Phaser.GameObjects.Container {
  const { x, y, w, h, label, onClick } = opts;
  const fill = opts.fill ?? COLORS.btn;
  const fontSize = opts.fontSize ?? 26;

  const bg = scene.add.rectangle(0, 0, w, h, fill).setStrokeStyle(2, 0xffffff, 0.25);
  const txt = scene.add
    .text(0, 0, label, {
      fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
      fontSize: `${fontSize}px`,
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
    })
    .setOrigin(0.5);

  const c = scene.add.container(x, y, [bg, txt]);
  c.setSize(w, h);
  bg.setInteractive({ useHandCursor: true });
  bg.on('pointerover', () => bg.setFillStyle(Phaser.Display.Color.IntegerToColor(fill).brighten(12).color));
  bg.on('pointerout', () => bg.setFillStyle(fill));
  bg.on('pointerdown', () => {
    scene.tweens.add({ targets: c, scaleX: 0.96, scaleY: 0.96, duration: 60, yoyo: true });
    onClick();
  });
  return c;
}

export function formatCash(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} млн ₽`;
  if (n >= 1_000) return `${Math.round(n / 1_000)} тыс ₽`;
  return `${n} ₽`;
}

export function drawPitchBg(scene: Phaser.Scene, w: number, h: number): void {
  const g = scene.add.graphics();
  g.fillGradientStyle(COLORS.navyDeep, COLORS.navyDeep, COLORS.pitchDark, COLORS.navy, 1);
  g.fillRect(0, 0, w, h);
  // subtle pitch stripes at bottom
  g.fillStyle(COLORS.pitch, 0.12);
  for (let i = 0; i < 8; i++) {
    g.fillRect(0, h * 0.55 + i * 40, w, 20);
  }
}
