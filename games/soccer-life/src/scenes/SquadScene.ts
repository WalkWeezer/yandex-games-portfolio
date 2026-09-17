import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../gameConfig';
import { FORMATIONS } from '../data/formations';
import { SCENE, POS_RU, type Player } from '../types';
import { assignToLineupSlot, getPlayerClub } from '../state/GameState';
import {
  COLORS,
  addButton,
  addLabel,
  addMuted,
  addTitle,
  drawPitchBg,
} from '../ui/theme';

/** SC_Squad — list players, tap to set into lineup slots */
export class SquadScene extends Phaser.Scene {
  private selectedId: string | null = null;
  private slotMode = false;
  private scrollY = 0;
  private content!: Phaser.GameObjects.Container;
  private headerHint!: Phaser.GameObjects.Text;
  private contentHeight = 0;

  constructor() {
    super(SCENE.Squad);
  }

  init(data?: { selectedId?: string | null; slotMode?: boolean; scrollY?: number }): void {
    this.selectedId = data?.selectedId ?? null;
    this.slotMode = data?.slotMode ?? false;
    this.scrollY = data?.scrollY ?? 0;
  }

  create(): void {
    const w = GAME_WIDTH;
    const h = GAME_HEIGHT;
    drawPitchBg(this, w, h);

    // Fixed chrome
    this.add.rectangle(w / 2, 60, w, 120, COLORS.navyDeep, 0.92).setDepth(10);
    addTitle(this, w / 2, 40, 'Состав', 36).setDepth(11);
    addButton(this, {
      x: 100,
      y: 40,
      w: 120,
      h: 48,
      label: '← Хаб',
      fill: 0x2a3a5a,
      fontSize: 20,
      onClick: () => this.scene.start(SCENE.Hub),
    }).setDepth(11);

    this.headerHint = addMuted(
      this,
      w / 2,
      88,
      this.slotMode ? 'Теперь нажмите слот основы (1–11)' : 'Выберите игрока, затем слот основы',
      18,
    );
    this.headerHint.setDepth(11);
    if (this.slotMode) this.headerHint.setColor('#e8a838');

    this.content = this.add.container(0, this.scrollY);
    this.buildContent();

    let dragging = false;
    let lastY = 0;
    this.input.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      if (ptr.y > 110) {
        dragging = true;
        lastY = ptr.y;
      }
    });
    this.input.on('pointerup', () => {
      dragging = false;
    });
    this.input.on('pointermove', (ptr: Phaser.Input.Pointer) => {
      if (!dragging || !ptr.isDown) return;
      const dy = ptr.y - lastY;
      lastY = ptr.y;
      const minY = Math.min(0, h - this.contentHeight - 20);
      this.scrollY = Phaser.Math.Clamp(this.scrollY + dy, minY, 0);
      this.content.y = this.scrollY;
    });
  }

  private rebuild(): void {
    this.scene.restart({
      selectedId: this.selectedId,
      slotMode: this.slotMode,
      scrollY: this.scrollY,
    });
  }

  private buildContent(): void {
    const club = getPlayerClub();
    const { lineup, bench, formation } = club.tactics;
    const slots = FORMATIONS[formation];
    const w = GAME_WIDTH;
    const c = this.content;

    c.removeAll(true);

    const panel = this.add.rectangle(w / 2, 200, w - 40, 168, COLORS.panel, 0.92).setStrokeStyle(2, COLORS.panelBorder);
    c.add(panel);
    c.add(
      this.add.text(36, 120, 'ОСНОВА (11)', {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '16px',
        color: '#9aacbf',
      }),
    );

    lineup.forEach((pid, i) => {
      const p = club.players.find((x) => x.id === pid);
      const slot = slots[i];
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 36 + col * 340;
      const y = 150 + row * 28;
      const label = p
        ? `${i + 1}.${slot.label} ${shortName(p.name)} ${ovr(p)}`
        : `${i + 1}.${slot.label} — пусто`;
      const t = this.add
        .text(x, y, label, {
          fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
          fontSize: '18px',
          color: this.slotMode ? '#e8a838' : '#e8eef5',
        })
        .setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => this.onSlotTap(i));
      c.add(t);
    });

    c.add(
      this.add.text(36, 300, 'ЗАПАС', {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '16px',
        color: '#9aacbf',
      }),
    );
    const benchNames = bench
      .map((id) => club.players.find((p) => p.id === id))
      .filter((p): p is Player => !!p)
      .map((p) => shortName(p.name))
      .join(', ');
    c.add(
      this.add.text(36, 328, benchNames || '—', {
        fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
        fontSize: '18px',
        color: '#e8eef5',
        wordWrap: { width: w - 72 },
      }),
    );

    c.add(addLabel(this, w / 2, 390, 'ВСЯ КОМАНДА', 18));

    const startY = 430;
    const rowH = 56;
    const sorted = [...club.players].sort((a, b) => posOrder(a) - posOrder(b) || ovr(b) - ovr(a));

    sorted.forEach((p, i) => {
      const y = startY + i * rowH;
      const inXi = lineup.includes(p.id);
      const inBench = bench.includes(p.id);
      const tag = inXi ? 'XI' : inBench ? 'ЗАП' : '';
      const bg = this.add
        .rectangle(w / 2, y, w - 40, rowH - 6, inXi ? 0x1a4a3a : COLORS.panel, 0.95)
        .setStrokeStyle(1, this.selectedId === p.id ? COLORS.amber : COLORS.panelBorder)
        .setInteractive({ useHandCursor: true });
      bg.on('pointerdown', () => this.onPlayerTap(p.id));

      const left = this.add
        .text(48, y, `${POS_RU[p.pos]}  ${p.name}`, {
          fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
          fontSize: '20px',
          color: '#e8eef5',
        })
        .setOrigin(0, 0.5);

      const right = this.add
        .text(w - 48, y, `${ovr(p)}  ${tag}`, {
          fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
          fontSize: '20px',
          color: '#e8a838',
          fontStyle: 'bold',
        })
        .setOrigin(1, 0.5);

      c.add(bg);
      c.add(left);
      c.add(right);
    });

    this.contentHeight = startY + sorted.length * rowH + 40;
  }

  private onPlayerTap(playerId: string): void {
    this.selectedId = playerId;
    this.slotMode = true;
    this.rebuild();
  }

  private onSlotTap(slotIndex: number): void {
    if (!this.selectedId || !this.slotMode) {
      this.headerHint.setText('Сначала выберите игрока из списка');
      return;
    }
    assignToLineupSlot(this.selectedId, slotIndex);
    this.selectedId = null;
    this.slotMode = false;
    this.rebuild();
  }
}

function ovr(p: Player): number {
  const a = p.attrs;
  return Math.round((a.pac + a.sht + a.pas + a.def + a.phy + a.men) / 6);
}

function shortName(name: string): string {
  const parts = name.split(' ');
  if (parts.length < 2) return name;
  return `${parts[0][0]}. ${parts[1]}`;
}

function posOrder(p: Player): number {
  const order = ['GK', 'CB', 'FB', 'DM', 'CM', 'AM', 'W', 'ST'];
  return order.indexOf(p.pos);
}
