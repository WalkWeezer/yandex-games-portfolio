import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../gameConfig';
import { FORMATIONS } from '../data/formations';
import {
  SCENE,
  FORMATION_LABELS,
  INSTR_LABELS,
  type FormationId,
  type InstrLevel,
} from '../types';
import { getPlayerClub, updatePlayerTactics } from '../state/GameState';
import {
  COLORS,
  addButton,
  addMuted,
  addTitle,
  drawPitchBg,
} from '../ui/theme';

type InstrKey = 'press' | 'width' | 'tempo' | 'risk';

const INSTR_KEYS: { key: InstrKey; title: string }[] = [
  { key: 'press', title: 'Прессинг' },
  { key: 'width', title: 'Ширина' },
  { key: 'tempo', title: 'Темп' },
  { key: 'risk', title: 'Риск' },
];

/** SC_Tactics — formation + 4 instruction controls */
export class TacticsScene extends Phaser.Scene {
  constructor() {
    super(SCENE.Tactics);
  }

  create(): void {
    const w = GAME_WIDTH;
    drawPitchBg(this, w, GAME_HEIGHT);

    addTitle(this, w / 2, 48, 'Тактика', 36);
    addButton(this, {
      x: 100,
      y: 48,
      w: 120,
      h: 48,
      label: '← Хаб',
      fill: 0x2a3a5a,
      fontSize: 20,
      onClick: () => this.scene.start(SCENE.Hub),
    });

    this.renderAll();
  }

  private renderAll(): void {
    const old = this.children.getByName('dyn') as Phaser.GameObjects.Container | null;
    if (old) old.destroy(true);

    const dyn = this.add.container(0, 0).setName('dyn');
    const w = GAME_WIDTH;
    const club = getPlayerClub();
    const tactics = club.tactics;
    const slots = FORMATIONS[tactics.formation];

    const formTitle = addMuted(this, w / 2, 100, 'ФОРМАЦИЯ', 16);
    dyn.add(formTitle);

    const forms: FormationId[] = ['433', '442', '352'];
    forms.forEach((f, i) => {
      const x = 140 + i * 200;
      const active = tactics.formation === f;
      const btn = addButton(this, {
        x,
        y: 150,
        w: 170,
        h: 56,
        label: FORMATION_LABELS[f],
        fill: active ? COLORS.pitch : COLORS.btnAlt,
        fontSize: 24,
        onClick: () => {
          updatePlayerTactics({ formation: f });
          this.renderAll();
        },
      });
      dyn.add(btn);
    });

    const pitchX = w / 2;
    const pitchY = 420;
    const pitchW = 520;
    const pitchH = 360;
    const pitch = this.add
      .rectangle(pitchX, pitchY, pitchW, pitchH, COLORS.pitch, 0.55)
      .setStrokeStyle(2, 0xffffff, 0.3);
    dyn.add(pitch);
    dyn.add(this.add.circle(pitchX, pitchY, 40, 0x000000, 0).setStrokeStyle(1, 0xffffff, 0.25));

    slots.forEach((slot, i) => {
      const px = pitchX - pitchW / 2 + slot.x * pitchW;
      const py = pitchY - pitchH / 2 + slot.y * pitchH;
      const pid = tactics.lineup[i];
      const p = club.players.find((x) => x.id === pid);
      dyn.add(this.add.circle(px, py, 22, COLORS.navy, 0.9).setStrokeStyle(2, COLORS.amber));
      dyn.add(
        this.add
          .text(px, py, p ? String(i + 1) : '?', {
            fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
            fontSize: '16px',
            color: '#ffffff',
            fontStyle: 'bold',
          })
          .setOrigin(0.5),
      );
      dyn.add(
        this.add
          .text(px, py + 28, slot.label, {
            fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
            fontSize: '12px',
            color: '#c8d4e0',
          })
          .setOrigin(0.5),
      );
    });

    dyn.add(addMuted(this, w / 2, 640, 'ИНСТРУКЦИИ', 16));

    INSTR_KEYS.forEach((item, idx) => {
      const y = 690 + idx * 100;
      const level = tactics[item.key] as InstrLevel;

      const title = this.add
        .text(48, y - 24, item.title, {
          fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
          fontSize: '22px',
          color: '#e8eef5',
        })
        .setOrigin(0, 0.5);
      dyn.add(title);

      const hint = this.add
        .text(48, y + 4, INSTR_LABELS[item.key][level], {
          fontFamily: 'Trebuchet MS, Segoe UI, sans-serif',
          fontSize: '16px',
          color: '#9aacbf',
        })
        .setOrigin(0, 0.5);
      dyn.add(hint);

      ([0, 1, 2] as InstrLevel[]).forEach((lv) => {
        const labels = ['Низ', 'Срд', 'Выс'];
        const x = 320 + lv * 120;
        const active = level === lv;
        const b = addButton(this, {
          x,
          y,
          w: 100,
          h: 52,
          label: labels[lv],
          fill: active ? COLORS.amber : COLORS.btnAlt,
          fontSize: 20,
          onClick: () => {
            updatePlayerTactics({ [item.key]: lv });
            this.renderAll();
          },
        });
        dyn.add(b);
      });
    });

    dyn.add(
      addButton(this, {
        x: w / 2,
        y: 1120,
        w: w - 64,
        h: 64,
        label: 'Сохранено ✓  →  Хаб',
        fill: COLORS.pitch,
        onClick: () => this.scene.start(SCENE.Hub),
      }),
    );
  }
}
