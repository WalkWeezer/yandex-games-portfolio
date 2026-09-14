# DEMO_RUN — playable combat arena

Vertical slice implementing `COMBAT_MECHANICS.md` (canon v2).  
**Branch:** `cursor/demo-arena-combat-gdd-0581`

## How to run

From repo root:

```bash
python3 -m http.server 8765
```

Open:

```
http://127.0.0.1:8765/docs/combat-demo-arena/play/index.html
```

Any static file server works (modules need HTTP, not `file://`).

Click the canvas once so keyboard focus sticks, then **Enter** on the prefight bench.

## Prefight bench

| Key | Action |
|-----|--------|
| `1` / `2` | Chassis: **Cleaver** (martial) / **Staff** (magic) |
| `3` / `4` / `5` | Presets **M1** / **M2** / **M3** (forces + recommended chassis) |
| Click cards | Same as above |
| `Enter` / `Space` | Start arena |

Presets (slice):

| ID | Chassis | Skill1+Skill2 | Fantasy |
|----|---------|---------------|---------|
| M1 | Cleaver | Root + Ash | Pure melee |
| M2 | Staff | Spark + Tide | Pure magic → Water Tier-2 |
| M3 | Cleaver | Spark + Root | Hybrid → RootAnchor Tier-2 |

## DualSense → keyboard map

Shown on **Esc** pause screen.

| DualSense | Action | Keyboard |
|-----------|--------|----------|
| L stick | Move | WASD / Arrows |
| R stick | Soft-aim | Mouse |
| **R1** | Attack A | **J** / LMB |
| **R2** | Attack B | **K** / RMB |
| **L1** | Skill1 | **Q** |
| **L2** | Skill2 | **E** |
| **L1+L2 ≥120ms** | **Combine** | Hold **Q+E** |
| ○ | Dodge | Space / Shift |
| □ | Block / Parry | F |
| △ | Weapon swap | R / Tab |
| × | Interact (re-light Torch) | X |
| Touchpad hold | Env Read (carrier labels) | Hold V |
| R3 | Soft-lock | T / MMB |
| Options | Pause | Esc / P |

**Hard rule:** Combine is **L1+L2 only**. R1+R2 is Attack B priority, never a phenomenon.

## Arena script

1. Ash Grunt + Tide Wretch spawn; Gate Saint behind grate (invulnerable silhouette).
2. Both adds dead **or** 45s → grate rises, boss walks in (2s invuln) → fight.
3. Boss phases per canon (cleave unblockable, bolt, phase-2 snare in circle, phase-3 Ash wave).
4. Boss death → victory / door cue. Player death → restart same loadout (`R`).

## Carriers in this build

Canon names; demo labels for readability:

| Canon | Demo label | Role |
|-------|------------|------|
| Water | Wet pit | Spark+Tide → **Грозовой столб** (Tier-2) |
| Conductive plate | Conductive plate | Also accepts Spark+Tide Tier-2 |
| Oil | AshBed | Spark+Ash Tier-2 fuel |
| Torch ×3 | Torch | Spark+Ash; Ash Tier-0 extinguishes; × re-lights |
| RootedGround | RootedGround | Soft RootAnchor stand-in for M3 readability |
| RootAnchor | from Root skill | Spark+Root → **Проводная казнь** |
| Corpse | on add death | Present; full Corpse Tier-2 catalog cut |
| Geometry Shadow | under columns | Visual only (not Tier-2) |

## Phenomena shipped (≥3, one env-upgraded)

1. **Грозовая плёнка** (Spark+Tide Tier-1) / **Грозовой столб** (Tier-2 on Water/Conductive)
2. **Искровой капкан** (Spark+Root Tier-1) / **Проводная казнь** (Tier-2 on RootAnchor/RootedGround)
3. **Мёртвая поросль** (Ash+Root Tier-1)

Plus Tier-0 casts for Spark, Tide, Ash, Root.

## Smoke check (optional)

```bash
node docs/combat-demo-arena/play/js/smoke.mjs
```

## Cut from full v0 canon (next iteration)

- Spear, Twin Knives, Orb, Grimoire (swap spare is Cleaver↔Staff only)
- Full 10 Tier-1 + all Tier-2 pairs
- Weapon/Armor rune catalog + loadout UI conflicts
- DualSense haptic / adaptive triggers
- Exact balance acceptance medians (§13 playtest)
- Isometric projection (slice is top-down readable grid)
