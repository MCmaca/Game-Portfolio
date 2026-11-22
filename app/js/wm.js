/* Window manager: drag, focus/z-order, minimize, maximize, close.
   Each app builds its own <section class="win"> and registers it with WM.add().
   A child with [data-handle] is the drag handle (title bar / tab strip). */
(function () {
  const layer = document.getElementById("windows");
  const wins = [];
  let z = 10;

  const tbH = () => document.getElementById("taskbar").offsetHeight;
  const small = () => innerWidth < 900 || innerHeight < 560;
  const emit = () => document.dispatchEvent(new CustomEvent("wm:change"));
  const zOf = el => +el.style.zIndex || 0;

  /** Keep at least part of the window (and its title bar) on screen. */
  function place(el, x, y) {
    const w = el.offsetWidth || parseFloat(el.style.width) || 400;
    const maxX = innerWidth - 80, maxY = innerHeight - tbH() - 48;
    x = Math.min(Math.max(x, 80 - w), maxX);
    y = Math.min(Math.max(y, 0), Math.max(0, maxY));
    el.style.left = Math.round(x) + "px";
    el.style.top = Math.round(y) + "px";
  }

  function add(el, app, { w, h, x, y, minW = 320, minH = 240 }) {
    el.dataset.app = app;
    el.style.width = w + "px";
    el.style.height = h + "px";
    layer.appendChild(el);
    place(el, x, y);
    wins.push(el);
    addResizeHandles(el, { w: Math.min(minW, w), h: Math.min(minH, h) });

    el.addEventListener("pointerdown", () => focus(el), true);
    el.querySelectorAll("[data-wc]").forEach(b => b.addEventListener("click", e => { e.stopPropagation(); control(el, b.dataset.wc); }));

    const handle = el.querySelector("[data-handle]");
    if (handle) {
      handle.addEventListener("pointerdown", e => {
        if (e.button !== 0 || e.target.closest("button, a, input, .tab")) return;
        startDrag(el, e);
      });
      handle.addEventListener("dblclick", e => { if (!e.target.closest("button, a, input, .tab")) control(el, "max"); });
    }
    if (small()) el.classList.add("maximized");
    focus(el);
    return el;
  }

  function focus(el) {
    el.hidden = false;
    const top = wins.reduce((m, w) => Math.max(m, zOf(w)), 0);
    if (zOf(el) < top || !el.style.zIndex) el.style.zIndex = ++z;
    wins.forEach(w => w.classList.toggle("is-focused", w === el));
    emit();
  }

  function close(el) {
    el.dispatchEvent(new CustomEvent("wm:close"));
    el.remove();
    const i = wins.indexOf(el);
    if (i >= 0) wins.splice(i, 1);
    const next = top();
    if (next) next.classList.add("is-focused");
    emit();
  }

  function minimize(el) {
    el.hidden = true;
    el.classList.remove("is-focused");
    el.dispatchEvent(new CustomEvent("wm:minimize"));
    const next = top();
    if (next) next.classList.add("is-focused");
    emit();
  }

  function control(el, what) {
    if (what === "close") close(el);
    else if (what === "min") minimize(el);
    else if (what === "max") { el.classList.toggle("maximized"); el.dispatchEvent(new CustomEvent("wm:resize")); emit(); }
  }

  /** Top-most visible window (optionally of one app). */
  function top(app) {
    return wins.filter(w => !w.hidden && (!app || w.dataset.app === app)).sort((a, b) => zOf(b) - zOf(a))[0] || null;
  }
  const all = app => wins.filter(w => !app || w.dataset.app === app);

  /** Taskbar behavior: open if closed, minimize if in front, otherwise bring to front. */
  function toggleApp(app, opener) {
    const mine = all(app);
    if (!mine.length) return opener();
    const front = top();
    if (front && front.dataset.app === app) { mine.forEach(minimize); return; }
    mine.sort((a, b) => zOf(a) - zOf(b)).forEach(w => { w.hidden = false; });
    focus(mine[mine.length - 1]);
  }

  /** Drag a window with the pointer. ox/oy = grab offset inside the window. */
  function startDrag(el, e, opts = {}) {
    if (el.classList.contains("maximized")) return;
    const r = el.getBoundingClientRect();
    const ox = opts.ox ?? e.clientX - r.left;
    const oy = opts.oy ?? e.clientY - r.top;
    document.body.classList.add("is-dragging");
    el.classList.add("dragging");
    const move = ev => { place(el, ev.clientX - ox, ev.clientY - oy); };
    const up = ev => {
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      document.body.classList.remove("is-dragging");
      el.classList.remove("dragging");
      if (opts.onDrop) opts.onDrop(ev);
    };
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
    e.preventDefault();
  }

  /* ---------- resizing: drag any edge or corner ---------- */
  const DIRS = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
  function addResizeHandles(el, min) {
    DIRS.forEach(d => {
      const hd = document.createElement("div");
      hd.className = "rz rz-" + d;
      hd.setAttribute("aria-hidden", "true");
      hd.addEventListener("pointerdown", e => startResize(el, d, e, min));
      el.appendChild(hd);
    });
  }

  function startResize(el, dir, e, min) {
    if (e.button !== 0 || el.classList.contains("maximized")) return;
    e.preventDefault();
    e.stopPropagation();
    focus(el);
    const sx = e.clientX, sy = e.clientY;
    const x0 = parseFloat(el.style.left) || 0, y0 = parseFloat(el.style.top) || 0;
    const w0 = el.offsetWidth, h0 = el.offsetHeight;
    const maxW = innerWidth, maxH = innerHeight - tbH();
    const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));
    document.body.classList.add("is-dragging", "is-resizing-" + dir);
    el.classList.add("resizing");

    const move = ev => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      let x = x0, y = y0, w = w0, h = h0;
      if (dir.includes("e")) w = clamp(w0 + dx, min.w, maxW - x0);
      if (dir.includes("w")) { w = clamp(w0 - dx, min.w, x0 + w0); x = x0 + w0 - w; }
      if (dir.includes("s")) h = clamp(h0 + dy, min.h, maxH - y0);
      if (dir.includes("n")) { h = clamp(h0 - dy, min.h, y0 + h0); y = y0 + h0 - h; }
      el.style.left = Math.round(x) + "px";
      el.style.top = Math.round(y) + "px";
      el.style.width = Math.round(w) + "px";
      el.style.height = Math.round(h) + "px";
    };
    const up = () => {
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      document.body.classList.remove("is-dragging", "is-resizing-" + dir);
      el.classList.remove("resizing");
      el.dispatchEvent(new CustomEvent("wm:resize"));
    };
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
  }

  addEventListener("resize", () => {
    wins.forEach(w => { if (!w.classList.contains("maximized")) place(w, parseFloat(w.style.left) || 0, parseFloat(w.style.top) || 0); });
  });

  /** Fit a design size into the free desktop area. keepRatio scales both sides together. */
  function fit(w, h, keepRatio) {
    const aw = innerWidth - 48, ah = innerHeight - tbH() - 48;
    if (keepRatio) { const s = Math.min(1, aw / w, ah / h); return { w: Math.round(w * s), h: Math.round(h * s) }; }
    return { w: Math.round(Math.min(w, aw)), h: Math.round(Math.min(h, ah)) };
  }

  window.WM = { add, focus, close, minimize, top, all, toggleApp, startDrag, place, fit, small, tbH };
})();
