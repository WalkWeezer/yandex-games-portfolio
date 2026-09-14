/** DualSense-mappable keyboard + optional Gamepad */

const KEY = {
  KeyW: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  KeyJ: 'attackA',
  KeyK: 'attackB',
  KeyQ: 'skill1',
  KeyE: 'skill2',
  Space: 'dodge', ShiftLeft: 'dodge', ShiftRight: 'dodge',
  KeyF: 'block',
  KeyR: 'swap', Tab: 'swap',
  KeyX: 'interact',
  KeyV: 'envRead',
  KeyT: 'lock',
  Escape: 'pause', KeyP: 'pause',
};

export function createInput(canvas) {
  const down = new Set();
  const pressed = new Set();
  const released = new Set();
  const holdTime = Object.create(null);
  const mouse = { x: 0, y: 0, lmb: false, rmb: false, mmb: false, lmbPressed: false, rmbPressed: false };
  let blurPause = false;

  function setHold(action, isDown, dt) {
    if (isDown) {
      holdTime[action] = (holdTime[action] || 0) + dt;
    } else {
      holdTime[action] = 0;
    }
  }

  window.addEventListener('keydown', (e) => {
    const a = KEY[e.code];
    if (!a) return;
    if (a === 'swap' || a === 'dodge' || a === 'pause') e.preventDefault();
    if (!down.has(a)) pressed.add(a);
    down.add(a);
  });
  window.addEventListener('keyup', (e) => {
    const a = KEY[e.code];
    if (!a) return;
    down.delete(a);
    released.add(a);
  });
  window.addEventListener('blur', () => { down.clear(); blurPause = true; });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  canvas.addEventListener('mousedown', (e) => {
    canvas.focus();
    if (e.button === 0) { mouse.lmb = true; mouse.lmbPressed = true; }
    if (e.button === 2) { mouse.rmb = true; mouse.rmbPressed = true; }
    if (e.button === 1) { mouse.mmb = true; pressed.add('lock'); }
  });
  window.addEventListener('mouseup', (e) => {
    if (e.button === 0) mouse.lmb = false;
    if (e.button === 2) mouse.rmb = false;
    if (e.button === 1) mouse.mmb = false;
  });
  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width;
    const sy = canvas.height / r.height;
    mouse.x = (e.clientX - r.left) * sx;
    mouse.y = (e.clientY - r.top) * sy;
  });

  function pollGamepad(dt) {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads && pads[0];
    if (!gp) return null;
    const dz = 0.12;
    const lx = Math.abs(gp.axes[0]) > dz ? gp.axes[0] : 0;
    const ly = Math.abs(gp.axes[1]) > dz ? gp.axes[1] : 0;
    const rx = Math.abs(gp.axes[2]) > dz ? gp.axes[2] : 0;
    const ry = Math.abs(gp.axes[3]) > dz ? gp.axes[3] : 0;
    // Standard mapping approx DualSense on Chrome
    const b = (i) => !!gp.buttons[i]?.pressed;
    const bv = (i) => gp.buttons[i]?.value || 0;
    return {
      moveX: lx,
      moveY: ly,
      aimX: rx,
      aimY: ry,
      attackA: b(5) || bv(5) > 0.3, // RB / R1
      attackB: bv(7) > 0.3, // RT / R2
      skill1: b(4) || bv(4) > 0.3, // LB / L1
      skill2: bv(6) > 0.3, // LT / L2
      dodge: b(1), // ○ / B / Circle
      block: b(2), // □ / X / Square
      swap: b(3), // △ / Y / Triangle
      interact: b(0), // × / A / Cross
      pause: b(9),
      lock: b(11),
      envRead: b(17) || false,
    };
  }

  return {
    mouse,
    holdTime,
    consumeBlurPause() {
      const v = blurPause;
      blurPause = false;
      return v;
    },
    beginFrame(dt) {
      const actions = ['up', 'down', 'left', 'right', 'attackA', 'attackB', 'skill1', 'skill2', 'dodge', 'block', 'swap', 'interact', 'envRead', 'lock', 'pause'];
      for (const a of actions) {
        const isDown = down.has(a) || (a === 'attackA' && mouse.lmb) || (a === 'attackB' && mouse.rmb);
        setHold(a, isDown, dt);
      }
      const gp = pollGamepad(0);
      if (gp) {
        if (gp.skill1) setHold('skill1', true, dt);
        if (gp.skill2) setHold('skill2', true, dt);
      }
    },
    endFrame() {
      pressed.clear();
      released.clear();
      mouse.lmbPressed = false;
      mouse.rmbPressed = false;
    },
    isDown(a) {
      if (a === 'attackA' && mouse.lmb) return true;
      if (a === 'attackB' && mouse.rmb) return true;
      return down.has(a);
    },
    wasPressed(a) {
      if (a === 'attackA' && mouse.lmbPressed) return true;
      if (a === 'attackB' && mouse.rmbPressed) return true;
      return pressed.has(a);
    },
    wasReleased(a) {
      return released.has(a);
    },
    moveVec() {
      let x = 0, y = 0;
      if (down.has('left')) x -= 1;
      if (down.has('right')) x += 1;
      if (down.has('up')) y -= 1;
      if (down.has('down')) y += 1;
      const gp = pollGamepad(0);
      if (gp && (gp.moveX || gp.moveY)) {
        x = gp.moveX;
        y = gp.moveY;
      }
      const len = Math.hypot(x, y) || 1;
      if (Math.abs(x) + Math.abs(y) === 0 && !(gp && (gp.moveX || gp.moveY))) return { x: 0, y: 0 };
      return { x: x / len, y: y / len };
    },
    gamepad() {
      return pollGamepad(0);
    },
    skill1Down() {
      const gp = pollGamepad(0);
      return down.has('skill1') || !!(gp && gp.skill1);
    },
    skill2Down() {
      const gp = pollGamepad(0);
      return down.has('skill2') || !!(gp && gp.skill2);
    },
    attackADown() {
      const gp = pollGamepad(0);
      return down.has('attackA') || mouse.lmb || !!(gp && gp.attackA);
    },
    attackBDown() {
      const gp = pollGamepad(0);
      return down.has('attackB') || mouse.rmb || !!(gp && gp.attackB);
    },
    dodgePressed() {
      const gp = pollGamepad(0);
      return pressed.has('dodge') || !!(gp && gp.dodge && !this._gpDodgeLatch);
    },
    blockDown() {
      const gp = pollGamepad(0);
      return down.has('block') || !!(gp && gp.block);
    },
    pausePressed() {
      const gp = pollGamepad(0);
      return pressed.has('pause') || !!(gp && gp.pause && !this._gpPauseLatch);
    },
  };
}
