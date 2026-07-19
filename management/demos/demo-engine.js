/**
 * Feel-demo engine v2 — mobile-first, playable prototypes.
 */
(function (global) {
  function clamp(v, a, b) {
    return Math.max(a, Math.min(b, v));
  }
  function dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  function rand(a, b) {
    return a + Math.random() * (b - a);
  }
  function pick(arr) {
    return arr[(Math.random() * arr.length) | 0];
  }

  function createInput(canvas) {
    const keys = Object.create(null);
    const stick = { active: false, dx: 0, dy: 0, ox: 0, oy: 0, id: null };
    // Right-side aim stick for twin-stick demos (ignored if unused)
    const aim = { active: false, dx: 0, dy: 0, ox: 0, oy: 0, id: null };
    const mouse = { x: 0, y: 0, down: false };
    const tapButtons = [];
    const pointers = new Map();
    let tapQueue = [];
    let swipeQueue = [];
    let swipeStart = null;

    function onKey(e, down) {
      keys[e.code] = down;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(e.code)) e.preventDefault();
    }
    window.addEventListener("keydown", (e) => onKey(e, true));
    window.addEventListener("keyup", (e) => onKey(e, false));

    function pos(e, touch) {
      const r = canvas.getBoundingClientRect();
      const t = touch || (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
      return {
        x: ((t.clientX - r.left) / r.width) * canvas.width,
        y: ((t.clientY - r.top) / r.height) * canvas.height,
        id: t.identifier != null ? t.identifier : "mouse",
      };
    }

    function hitBtn(p) {
      for (let i = tapButtons.length - 1; i >= 0; i--) {
        const b = tapButtons[i];
        if (p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h) return b;
      }
      return null;
    }

    function applyStick(target, p) {
      let dx = p.x - target.ox;
      let dy = p.y - target.oy;
      const len = Math.hypot(dx, dy) || 1;
      const max = 58;
      if (len > max) {
        dx = (dx / len) * max;
        dy = (dy / len) * max;
      }
      target.dx = dx / max;
      target.dy = dy / max;
    }

    function down(e) {
      const list = e.changedTouches ? [...e.changedTouches] : [null];
      for (const t of list) {
        const p = pos(e, t);
        mouse.x = p.x;
        mouse.y = p.y;
        if (!e.changedTouches) mouse.down = true;
        const b = hitBtn(p);
        if (b) {
          b.pressed = true;
          b._held = true;
          b._id = p.id;
          e.preventDefault();
          continue;
        }
        // left half = move stick; right half = aim stick (twin-stick)
        if (p.x < canvas.width * 0.5) {
          stick.active = true;
          stick.ox = p.x;
          stick.oy = p.y;
          stick.dx = 0;
          stick.dy = 0;
          stick.id = p.id;
        } else {
          aim.active = true;
          aim.ox = p.x;
          aim.oy = p.y;
          aim.dx = 0;
          aim.dy = 0;
          aim.id = p.id;
        }
        swipeStart = { x: p.x, y: p.y, id: p.id, t: performance.now() };
        pointers.set(p.id, p);
        e.preventDefault();
      }
    }

    function move(e) {
      const list = e.changedTouches ? [...e.changedTouches] : [null];
      for (const t of list) {
        const p = pos(e, t);
        mouse.x = p.x;
        mouse.y = p.y;
        if (stick.active && (stick.id === p.id || stick.id === "mouse")) applyStick(stick, p);
        if (aim.active && (aim.id === p.id || aim.id === "mouse")) applyStick(aim, p);
        pointers.set(p.id, p);
      }
      if (e.cancelable) e.preventDefault();
    }

    function up(e) {
      const list = e.changedTouches ? [...e.changedTouches] : [null];
      for (const t of list) {
        const p = pos(e, t);
        if (!e.changedTouches) mouse.down = false;
        for (const b of tapButtons) {
          if (b._id === p.id || (b._id === "mouse" && p.id === "mouse")) {
            b._held = false;
            b._id = null;
          }
        }
        if (stick.active && (stick.id === p.id || stick.id === "mouse")) {
          stick.active = false;
          stick.dx = 0;
          stick.dy = 0;
          stick.id = null;
        }
        if (aim.active && (aim.id === p.id || aim.id === "mouse")) {
          aim.active = false;
          aim.dx = 0;
          aim.dy = 0;
          aim.id = null;
        }
        if (swipeStart && swipeStart.id === p.id) {
          const dx = p.x - swipeStart.x;
          const dy = p.y - swipeStart.y;
          const abs = Math.hypot(dx, dy);
          const dt = performance.now() - swipeStart.t;
          if (abs < 18 && dt < 350) {
            tapQueue.push({ x: p.x, y: p.y });
          } else if (abs > 36 && dt < 500) {
            if (Math.abs(dx) > Math.abs(dy)) swipeQueue.push(dx > 0 ? "right" : "left");
            else swipeQueue.push(dy > 0 ? "down" : "up");
          }
          swipeStart = null;
        }
        pointers.delete(p.id);
      }
    }

    canvas.addEventListener("mousedown", down);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    canvas.addEventListener("touchstart", down, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", up, { passive: false });
    canvas.addEventListener("touchcancel", up, { passive: false });

    function normAxis(x, y, dead = 0.18) {
      if (Math.abs(x) < dead) x = 0;
      if (Math.abs(y) < dead) y = 0;
      const len = Math.hypot(x, y);
      if (len > 1) {
        x /= len;
        y /= len;
      }
      return { x, y };
    }

    return {
      keys,
      stick,
      aim,
      mouse,
      tapButtons,
      addButton(btn) {
        const b = Object.assign({ pressed: false, _held: false }, btn);
        // edge-trigger: pressed true for one frame via consume
        Object.defineProperty(b, "clicked", {
          get() {
            if (b.pressed) {
              b.pressed = false;
              return true;
            }
            return false;
          },
        });
        tapButtons.push(b);
        return b;
      },
      axis() {
        let x = 0;
        let y = 0;
        if (keys.ArrowLeft || keys.KeyA) x -= 1;
        if (keys.ArrowRight || keys.KeyD) x += 1;
        if (keys.ArrowUp || keys.KeyW) y -= 1;
        if (keys.ArrowDown || keys.KeyS) y += 1;
        if (stick.active) {
          x += stick.dx;
          y += stick.dy;
        }
        return normAxis(x, y);
      },
      /** Twin-stick aim: right stick, else {0,0} (demos may fall back to mouse). */
      aimAxis() {
        if (!aim.active) return { x: 0, y: 0 };
        return normAxis(aim.dx, aim.dy, 0.15);
      },
      consumeTap() {
        return tapQueue.shift() || null;
      },
      consumeSwipe() {
        return swipeQueue.shift() || null;
      },
      peekTaps() {
        return tapQueue;
      },
      drawStick(ctx) {
        // ghost zones: move (left) + aim (right)
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.beginPath();
        ctx.arc(70, canvas.height - 90, 50, 0, Math.PI * 2);
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(canvas.width - 70, canvas.height - 90, 50, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        function paint(s) {
          if (!s.active) return;
          ctx.save();
          ctx.globalAlpha = 0.4;
          ctx.beginPath();
          ctx.arc(s.ox, s.oy, 54, 0, Math.PI * 2);
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 3;
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(s.ox + s.dx * 54, s.oy + s.dy * 54, 22, 0, Math.PI * 2);
          ctx.fillStyle = "#fff";
          ctx.fill();
          ctx.restore();
        }
        paint(stick);
        paint(aim);
      },
      drawButtons(ctx) {
        for (const b of tapButtons) {
          ctx.save();
          ctx.globalAlpha = b._held || b.pressed ? 0.85 : 0.55;
          ctx.fillStyle = b.color || "#5db0ff";
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(b.x, b.y, b.w, b.h, 14);
          else ctx.rect(b.x, b.y, b.w, b.h);
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.fillStyle = "#fff";
          ctx.font = "bold 15px Segoe UI, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(b.label || "", b.x + b.w / 2, b.y + b.h / 2);
          ctx.restore();
        }
      },
    };
  }

  function mount(slug, canvas, hudEl) {
    const demo = global.FEEL_DEMOS?.[slug];
    if (!demo) {
      if (hudEl) hudEl.textContent = "Демка не найдена: " + slug;
      return null;
    }
    const ctx = canvas.getContext("2d");
    const input = createInput(canvas);
    let last = performance.now();
    let raf = 0;
    const api = {
      canvas,
      ctx,
      input,
      clamp,
      dist,
      rand,
      pick,
      w: canvas.width,
      h: canvas.height,
      setHud(text) {
        if (hudEl) hudEl.textContent = text;
      },
      drawBanner(ctx, text, color) {
        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = color || "#fff";
        ctx.font = "bold 22px Segoe UI, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 8);
        ctx.fillStyle = "#ddd";
        ctx.font = "14px Segoe UI, sans-serif";
        ctx.fillText("Тап / кнопка — продолжить", canvas.width / 2, canvas.height / 2 + 24);
      },
    };
    let state = demo.create(api);
    api.setHud(demo.hint || "Играй");

    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      demo.update(state, api, dt);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      demo.draw(state, api);
      input.drawStick(ctx);
      input.drawButtons(ctx);
      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return {
      destroy() {
        cancelAnimationFrame(raf);
      },
      restart() {
        state = demo.create(api);
        api.setHud(demo.hint || "Играй");
      },
    };
  }

  global.FeelDemo = { mount, clamp, dist, rand, pick };
})(window);
