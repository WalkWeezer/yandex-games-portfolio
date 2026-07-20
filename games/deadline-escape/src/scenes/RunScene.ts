import Phaser from "phaser";
import { cellTexture, registerPlaceholders } from "../assets/placeholders";
import {
  COFFEE_SCALE,
  COFFEE_SEC,
  COPY,
  FOG_BORDER,
  LOGICAL_H,
  LOGICAL_W,
  MINUTES_PER_SECOND,
  MOVE_DUR,
  SHIELD_IFRAMES,
  START_IFRAMES,
  TIME_SCALE,
  TOTAL_MIN,
  clockOf,
  phaseOf,
} from "../data/canon";
import { getSdk } from "../sdk/yandex";
import {
  advanceThreat,
  pickSpawnEdge,
  threatHitsPlayer,
  trySpawnThreat,
  type Threat,
  type Zone,
} from "../systems/ThreatSystem";
import { buildMap, findStart, gridSizeForFloor, walkable } from "../systems/GridMap";
import { loadMeta, saveMeta } from "../systems/MetaSave";
import { FONT, MU, addProgressBar, fillSafeBg, setProgress } from "../ui/UiKit";

interface RunInit {
  floor?: number;
  daily?: boolean;
}

export class RunScene extends Phaser.Scene {
  private floor = 1;
  private daily = false;
  private map: number[][] = [];
  private border = FOG_BORDER;
  private cols = 0;
  private rows = 0;

  private playerCol = 0;
  private playerRow = 0;
  private playerPx = 0;
  private playerPy = 0;
  private moving = false;
  private moveFrom = { c: 0, r: 0 };
  private moveTo = { c: 0, r: 0 };
  private moveT = 0;
  private moveDur = MOVE_DUR;

  private gameMin = 0;
  private coffeeLeft = 0;
  private shield = false;
  private iframes = 0;
  private coinsRun = 0;
  private tipOn = true;
  private paused = false;
  private ended = false;

  private threats: Threat[] = [];
  private zones: Zone[] = [];
  private pickups: { col: number; row: number; kind: "coin" | "coffee" | "badge" }[] = [];
  private spawnAcc = 0;
  private spawnSeed = 1;

  private cell = 64;
  private ox = 0;
  private oy = 0;
  private fieldTop = 180;
  private fieldH = 900;

  private layerMap!: Phaser.GameObjects.Container;
  private layerEnt!: Phaser.GameObjects.Container;
  private hero!: Phaser.GameObjects.Image;
  private hudClock!: Phaser.GameObjects.Text;
  private hudPhase!: Phaser.GameObjects.Text;
  private dayFill!: Phaser.GameObjects.Rectangle;
  private dayTrack!: Phaser.GameObjects.Rectangle;
  private buffCoffee!: Phaser.GameObjects.Container;
  private buffShield!: Phaser.GameObjects.Container;
  private tipLayer!: Phaser.GameObjects.Container;
  private threatSprites = new Map<string, Phaser.GameObjects.Image>();
  private pickupSprites: Phaser.GameObjects.Image[] = [];

  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private latch = new Set<string>();

  constructor() {
    super("Run");
  }

  init(data: RunInit): void {
    this.floor = Math.max(1, data?.floor || loadMeta().floor || 1);
    this.daily = !!data?.daily;
  }

  create(): void {
    registerPlaceholders(this);
    fillSafeBg(this);
    this.ended = false;
    this.paused = false;
    this.tipOn = !loadMeta().tutSeen;
    this.gameMin = 0;
    this.coffeeLeft = 0;
    this.shield = false;
    this.iframes = START_IFRAMES;
    this.coinsRun = 0;
    this.threats = [];
    this.zones = [];
    this.pickups = [];
    this.spawnAcc = 0;
    this.spawnSeed = this.floor * 9973 + 17;
    this.threatSprites.clear();
    this.pickupSprites = [];
    this.latch.clear();
    this.moving = false;

    const grid = gridSizeForFloor(this.floor);
    this.border = grid.border;
    this.cols = grid.cols;
    this.rows = grid.rows;
    this.map = buildMap(this.floor, grid);
    const start = findStart(this.map, this.border);
    this.playerCol = start.col;
    this.playerRow = start.row;
    this.playerPx = start.col;
    this.playerPy = start.row;

    this.buildHud();
    this.layoutMetrics();
    this.drawPlayfieldFrame();
    this.layerMap = this.add.container(0, 0).setDepth(2);
    this.layerEnt = this.add.container(0, 0).setDepth(5);
    this.drawMap();
    this.spawnFloorPickups();

    this.hero = this.add.image(0, 0, "char_hero").setDepth(10);
    this.placeHero();

    const kb = this.input.keyboard!;
    this.keys = {
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      esc: kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC),
    };

    this.input.on("pointerup", (p: Phaser.Input.Pointer) => {
      if (this.tipOn || this.paused || this.ended || this.moving) return;
      const { col, row } = this.screenToCell(p.x, p.y);
      const dc = Math.sign(col - this.playerCol);
      const dr = Math.sign(row - this.playerRow);
      if (Math.abs(col - this.playerCol) + Math.abs(row - this.playerRow) === 1) {
        this.tryStep(dc, dr);
      } else if (Math.abs(col - this.playerCol) >= Math.abs(row - this.playerRow) && dc) {
        this.tryStep(dc, 0);
      } else if (dr) {
        this.tryStep(0, dr);
      }
    });

    this.buildTip();
    if (!this.tipOn) this.tipLayer.setVisible(false);
    getSdk().gameplayStart();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (!this.ended) getSdk().gameplayStop();
    });
  }

  resumeFromPause(): void {
    this.paused = false;
    getSdk().gameplayStart();
  }

  quitToHub(): void {
    getSdk().gameplayStop();
    this.scene.stop("Pause");
    this.scene.start("Hub");
  }

  private buildHud(): void {
    this.add
      .rectangle(LOGICAL_W / 2, 56, MU.contentW, 72, MU.panelHi, 0.96)
      .setStrokeStyle(2, MU.line)
      .setDepth(40);
    this.hudClock = this.add
      .text(56, 56, "09:00", {
        fontFamily: FONT,
        fontSize: "28px",
        color: "#1d3557",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setDepth(41);

    this.add
      .text(LOGICAL_W / 2, 56, `эт.${this.floor}`, {
        fontFamily: FONT,
        fontSize: "22px",
        color: "#5b6b82",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(41);

    const pauseBg = this.add
      .rectangle(LOGICAL_W - 68, 56, 72, 56, MU.panelHi)
      .setStrokeStyle(2, MU.line)
      .setDepth(41)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(LOGICAL_W - 68, 56, "⏸", {
        fontFamily: FONT,
        fontSize: "28px",
        color: "#1d3557",
      })
      .setOrigin(0.5)
      .setDepth(42);
    pauseBg.on("pointerup", () => this.openPause());

    this.hudPhase = this.add
      .text(56, 118, "УТРО", {
        fontFamily: FONT,
        fontSize: "18px",
        color: "#5b6b82",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5)
      .setDepth(41);

    this.buffCoffee = this.makeBuff(LOGICAL_W - 160, 118, "☕");
    this.buffShield = this.makeBuff(LOGICAL_W - 88, 118, "🪪");

    const bar = addProgressBar(this, 156, 0, MU.contentW);
    this.dayTrack = bar.track.setDepth(40);
    this.dayFill = bar.fill.setDepth(41);
  }

  private makeBuff(x: number, y: number, glyph: string): Phaser.GameObjects.Container {
    const bg = this.add.rectangle(0, 0, 60, 60, MU.panel).setStrokeStyle(2, MU.line);
    const t = this.add.text(0, 0, glyph, { fontFamily: FONT, fontSize: "26px" }).setOrigin(0.5);
    return this.add.container(x, y, [bg, t]).setDepth(41).setAlpha(0.35);
  }

  private setBuffOn(c: Phaser.GameObjects.Container, on: boolean): void {
    c.setAlpha(on ? 1 : 0.35);
    const bg = c.list[0] as Phaser.GameObjects.Rectangle;
    if (on) {
      bg.setFillStyle(0xfff8e6);
      bg.setStrokeStyle(2, 0xc9a24a);
    } else {
      bg.setFillStyle(MU.panel);
      bg.setStrokeStyle(2, MU.line);
    }
  }

  private drawPlayfieldFrame(): void {
    this.add
      .rectangle(LOGICAL_W / 2, this.fieldTop + this.fieldH / 2, MU.contentW, this.fieldH, 0xc8d2e0)
      .setStrokeStyle(2, MU.line)
      .setDepth(1);
  }

  private layoutMetrics(): void {
    this.fieldTop = 180;
    this.fieldH = LOGICAL_H - this.fieldTop - 40;
    const maxW = MU.contentW - 24;
    const maxH = this.fieldH - 24;
    this.cell = Math.floor(Math.min(maxW / this.cols, maxH / this.rows));
    this.ox = (LOGICAL_W - this.cols * this.cell) / 2;
    this.oy = this.fieldTop + (this.fieldH - this.rows * this.cell) / 2;
  }

  private drawMap(): void {
    this.layerMap.removeAll(true);
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const code = this.map[r][c];
        const fog =
          c < this.border ||
          r < this.border ||
          c >= this.cols - this.border ||
          r >= this.rows - this.border;
        const key = fog && code === 0 ? "tile_fog" : cellTexture(code, c, r);
        const img = this.add
          .image(this.ox + c * this.cell + this.cell / 2, this.oy + r * this.cell + this.cell / 2, key)
          .setDisplaySize(this.cell - 1, this.cell - 1);
        this.layerMap.add(img);
        if (fog && code === 0) img.setAlpha(0.75);
      }
    }
  }

  private spawnFloorPickups(): void {
    const spots: { col: number; row: number }[] = [];
    for (let r = this.border; r < this.rows - this.border; r++) {
      for (let c = this.border; c < this.cols - this.border; c++) {
        if (this.map[r][c] === 0 && !(c === this.playerCol && r === this.playerRow)) {
          spots.push({ col: c, row: r });
        }
      }
    }
    Phaser.Utils.Array.Shuffle(spots);
    const kinds: Array<"coin" | "coffee" | "badge"> = ["coffee", "badge", "coin", "coin", "coin"];
    for (let i = 0; i < kinds.length && i < spots.length; i++) {
      this.pickups.push({ ...spots[i], kind: kinds[i] });
    }
    this.redrawPickups();
  }

  private redrawPickups(): void {
    for (const s of this.pickupSprites) s.destroy();
    this.pickupSprites = [];
    for (const p of this.pickups) {
      const key = p.kind === "coffee" ? "pu_coffee" : p.kind === "badge" ? "pu_badge" : "pu_coin";
      const img = this.add
        .image(
          this.ox + p.col * this.cell + this.cell / 2,
          this.oy + p.row * this.cell + this.cell / 2,
          key,
        )
        .setDisplaySize(this.cell * 0.55, this.cell * 0.55)
        .setDepth(8);
      this.pickupSprites.push(img);
      this.layerEnt.add(img);
    }
  }

  private buildTip(): void {
    this.tipLayer = this.add.container(0, 0).setDepth(50);
    const dim = this.add.rectangle(LOGICAL_W / 2, LOGICAL_H / 2, LOGICAL_W, LOGICAL_H, 0x1d3557, 0.28);
    const panelH = 320;
    const panelY = LOGICAL_H - 40 - panelH / 2;
    const panel = this.add
      .rectangle(LOGICAL_W / 2, panelY, MU.contentW, panelH, MU.panelHi, 0.97)
      .setStrokeStyle(2, MU.line);
    const label = this.add
      .text(56, panelY - 120, COPY.tutTitle.toUpperCase(), {
        fontFamily: FONT,
        fontSize: "16px",
        color: "#5b6b82",
        fontStyle: "bold",
      })
      .setOrigin(0, 0.5);
    const rules = this.add
      .text(56, panelY - 60, COPY.tutRules, {
        fontFamily: FONT,
        fontSize: "22px",
        color: "#1d3557",
        fontStyle: "bold",
        wordWrap: { width: MU.contentW - 64 },
        lineSpacing: 6,
      })
      .setOrigin(0, 0.5);
    const controls = this.add
      .text(56, panelY + 20, COPY.tutControls, {
        fontFamily: FONT,
        fontSize: "18px",
        color: "#5b6b82",
        fontStyle: "bold",
        wordWrap: { width: MU.contentW - 64 },
      })
      .setOrigin(0, 0.5);
    const shadow = this.add.rectangle(LOGICAL_W / 2, panelY + 108, MU.contentW - 48, 64, MU.ctaLo);
    const btn = this.add
      .rectangle(LOGICAL_W / 2, panelY + 102, MU.contentW - 48, 64, MU.cta)
      .setStrokeStyle(2, 0xc9a24a);
    const btnT = this.add
      .text(LOGICAL_W / 2, panelY + 102, COPY.tutOk, {
        fontFamily: FONT,
        fontSize: "24px",
        color: "#3d2e0a",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    btn.setInteractive({ useHandCursor: true }).on("pointerup", () => {
      this.tipOn = false;
      this.tipLayer.setVisible(false);
      const m = loadMeta();
      m.tutSeen = true;
      saveMeta(m);
    });
    this.tipLayer.add([dim, panel, label, rules, controls, shadow, btn, btnT]);
  }

  private openPause(): void {
    if (this.tipOn || this.ended || this.paused) return;
    this.paused = true;
    getSdk().gameplayStop();
    this.scene.launch("Pause");
  }

  private screenToCell(x: number, y: number): { col: number; row: number } {
    return {
      col: Math.floor((x - this.ox) / this.cell),
      row: Math.floor((y - this.oy) / this.cell),
    };
  }

  private placeHero(): void {
    this.hero.setPosition(
      this.ox + this.playerPx * this.cell + this.cell / 2,
      this.oy + this.playerPy * this.cell + this.cell / 2,
    );
    this.hero.setDisplaySize(this.cell * 0.78, this.cell * 0.78);
  }

  private tryStep(dc: number, dr: number): void {
    if (this.moving || this.tipOn || this.paused || this.ended) return;
    const nc = this.playerCol + dc;
    const nr = this.playerRow + dr;
    if (!walkable(this.map, this.border, nc, nr)) return;
    this.moving = true;
    this.moveFrom = { c: this.playerCol, r: this.playerRow };
    this.moveTo = { c: nc, r: nr };
    this.moveT = 0;
    this.moveDur = MOVE_DUR;
    this.playerCol = nc;
    this.playerRow = nr;
  }

  update(_t: number, dtMs: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      if (this.paused) {
        const pause = this.scene.get("Pause");
        if (pause && pause.scene.isActive()) {
          this.resumeFromPause();
          this.scene.stop("Pause");
        }
      } else {
        this.openPause();
      }
    }

    if (this.tipOn || this.paused || this.ended) {
      this.refreshHud();
      return;
    }

    const dt = Math.min(0.05, dtMs / 1000);
    const worldScale = this.coffeeLeft > 0 ? COFFEE_SCALE : 1;
    if (this.coffeeLeft > 0) this.coffeeLeft = Math.max(0, this.coffeeLeft - dt);
    if (this.iframes > 0) this.iframes = Math.max(0, this.iframes - dt);

    this.handleKeys();
    this.tickMove(dt);
    this.tickThreats(dt * worldScale);
    this.gameMin += MINUTES_PER_SECOND * TIME_SCALE * dt * worldScale;
    this.collectPickups();
    this.refreshThreatSprites();
    this.refreshHud();
    this.checkHits();

    if (this.gameMin >= TOTAL_MIN) this.win();
  }

  private handleKeys(): void {
    const press = (id: string, down: boolean, dc: number, dr: number) => {
      if (!down) {
        this.latch.delete(id);
        return;
      }
      if (this.latch.has(id)) return;
      this.latch.add(id);
      this.tryStep(dc, dr);
    };
    press("L", this.keys.left.isDown || this.keys.a.isDown, -1, 0);
    press("R", this.keys.right.isDown || this.keys.d.isDown, 1, 0);
    press("U", this.keys.up.isDown || this.keys.w.isDown, 0, -1);
    press("D", this.keys.down.isDown || this.keys.s.isDown, 0, 1);
  }

  private tickMove(dt: number): void {
    if (!this.moving) {
      this.playerPx = this.playerCol;
      this.playerPy = this.playerRow;
      this.placeHero();
      return;
    }
    this.moveT += dt;
    const u = Math.min(1, this.moveT / this.moveDur);
    const e = 1 - (1 - u) * (1 - u);
    this.playerPx = this.moveFrom.c + (this.moveTo.c - this.moveFrom.c) * e;
    this.playerPy = this.moveFrom.r + (this.moveTo.r - this.moveFrom.r) * e;
    this.placeHero();
    if (u >= 1) this.moving = false;
  }

  private tickThreats(dt: number): void {
    const phase = phaseOf(this.gameMin);
    this.threats = this.threats.filter((t) => !t.dead);
    const baseInterval = 1.15 * phase.spawnMul;
    this.spawnAcc += dt;
    if (this.spawnAcc >= baseInterval) {
      this.spawnAcc = 0;
      this.spawnSeed += 1;
      const t = trySpawnThreat(this.map, this.border, this.floor, this.threats, this.spawnSeed);
      if (t) this.threats.push(t);
      void pickSpawnEdge;
    }
    for (const t of this.threats) {
      advanceThreat(t, this.map, this.border, this.playerCol, this.playerRow, dt, this.floor, phase.speedMul);
    }
    for (const z of this.zones) z.life -= dt;
    this.zones = this.zones.filter((z) => z.life > 0);
  }

  private refreshThreatSprites(): void {
    const seen = new Set<string>();
    for (const t of this.threats) {
      if (t.dead) continue;
      seen.add(t.id);
      let spr = this.threatSprites.get(t.id);
      if (!spr) {
        spr = this.add.image(0, 0, `boss_${t.kind.id}`).setDepth(9);
        this.threatSprites.set(t.id, spr);
        this.layerEnt.add(spr);
      }
      spr.setPosition(
        this.ox + t.px * this.cell + this.cell / 2,
        this.oy + t.py * this.cell + this.cell / 2,
      );
      const wide = t.kind.pattern === "wide" ? 1.35 : 1;
      spr.setDisplaySize(this.cell * 0.82 * wide, this.cell * 0.82);
      spr.setAlpha(t.entered ? 1 : 0.55);
    }
    for (const [id, spr] of this.threatSprites) {
      if (!seen.has(id)) {
        spr.destroy();
        this.threatSprites.delete(id);
      }
    }
  }

  private collectPickups(): void {
    const before = this.pickups.length;
    this.pickups = this.pickups.filter((p) => {
      if (p.col !== this.playerCol || p.row !== this.playerRow) return true;
      if (p.kind === "coffee") this.coffeeLeft = COFFEE_SEC;
      else if (p.kind === "badge") this.shield = true;
      else this.coinsRun += 1;
      return false;
    });
    if (this.pickups.length !== before) this.redrawPickups();
  }

  private checkHits(): void {
    if (this.iframes > 0) return;
    const hitThreat = this.threats.some((t) => threatHitsPlayer(t, this.playerPx, this.playerPy));
    const hitZone = this.zones.some(
      (z) => Math.abs(z.col - this.playerPx) < 0.55 && Math.abs(z.row - this.playerPy) < 0.55,
    );
    if (!hitThreat && !hitZone) return;
    if (this.shield) {
      this.shield = false;
      this.iframes = SHIELD_IFRAMES;
      return;
    }
    this.fail();
  }

  private refreshHud(): void {
    this.hudClock.setText(clockOf(this.gameMin));
    this.hudPhase.setText(phaseOf(this.gameMin).label.toUpperCase());
    this.setBuffOn(this.buffCoffee, this.coffeeLeft > 0);
    this.setBuffOn(this.buffShield, this.shield);
    setProgress(this.dayFill, this.dayTrack, this.gameMin / TOTAL_MIN);
  }

  private fail(): void {
    if (this.ended) return;
    this.ended = true;
    getSdk().gameplayStop();
    this.scene.stop("Pause");
    this.scene.start("Caught", {
      floor: this.floor,
      clock: clockOf(this.gameMin),
      coins: this.coinsRun,
      daily: this.daily,
    });
  }

  private win(): void {
    if (this.ended) return;
    this.ended = true;
    getSdk().gameplayStop();
    const meta = loadMeta();
    const next = this.floor + 1;
    meta.floor = next;
    meta.bestFloor = Math.max(meta.bestFloor, next);
    meta.unlocked = Math.max(meta.unlocked, next);
    meta.coins += this.coinsRun + 25;
    meta.runsSinceInterstitial += 1;
    saveMeta(meta);
    this.scene.stop("Pause");
    this.scene.start("Result", {
      win: true,
      floor: next,
      coins: meta.coins,
      clock: clockOf(TOTAL_MIN),
    });
    this.maybeInterstitial(meta);
  }

  private maybeInterstitial(meta: ReturnType<typeof loadMeta>): void {
    if (meta.removeAds) return;
    if (meta.runsSinceInterstitial < 2) return;
    meta.runsSinceInterstitial = 0;
    saveMeta(meta);
    void getSdk().showInterstitial("between_runs");
  }
}
