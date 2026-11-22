/* Desktop, taskbar, theme, music toggle, game launching and the fullscreen trailer. Boots the site. */
(function () {
  const { ICON, esc, h, store, toast, tile, gameById } = UI;
  const root = document.documentElement;

  /* ---------- theme (light by default) ---------- */
  const Theme = {
    get: () => (root.dataset.theme === "dark" ? "dark" : "light"),
    set(t) {
      if (t === "dark") root.dataset.theme = "dark"; else delete root.dataset.theme;
      store.set("pf.theme", t);
    },
    toggle() { Theme.set(Theme.get() === "dark" ? "light" : "dark"); },
  };

  /* ---------- music: simple on/off toggle ---------- */
  const Music = (() => {
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "none";
    let on = false;
    const set = v => {
      on = v;
      document.body.classList.toggle("music-on", v);
      document.querySelectorAll("[data-music-label]").forEach(el => (el.textContent = v ? "Music (playing)" : "Music"));
      document.querySelectorAll("[data-music-btn]").forEach(el => el.setAttribute("aria-pressed", v));
    };
    function toggle() {
      if (on) { audio.pause(); set(false); return; }
      if (!SITE.music?.src) { toast("Add a song in js/config.js → music.src"); return; }
      if (!audio.src) audio.src = SITE.music.src;
      set(true);
      audio.play().catch(() => { set(false); toast("No song yet — drop one in assets/music/"); });
    }
    return { toggle };
  })();

  /* ---------- fullscreen trailer (games without a build) ---------- */
  const Fullscreen = (() => {
    let overlay = null, game = null;
    function open(g) {
      close();
      game = g;
      overlay = h(`<div class="fs" role="dialog" aria-label="${esc(g.title)} trailer">
        <div class="fs-top">
          <div class="fs-now">${tile("game:" + g.id)}<div><b>${esc(g.title)}</b><small>Trailer · no playable build yet</small></div></div>
          <div class="fs-exit"><span class="fs-esc"><kbd>Esc</kbd> to exit fullscreen</span><button type="button" class="fs-close" aria-label="Close">${ICON.close}</button></div>
        </div>
      </div>`);
      const player = Player.create(g, "fullscreen", { tab: toTab, exit: toTab });
      overlay.appendChild(player);
      overlay.querySelector(".fs-close").addEventListener("click", close);
      document.body.appendChild(overlay);
      document.body.classList.add("fs-open");
      player.play();
      overlay.querySelector(".fs-close").focus();
    }
    function close() {
      if (!overlay) return;
      overlay.querySelectorAll("video").forEach(v => v.pause());
      overlay.remove();
      overlay = null;
      document.body.classList.remove("fs-open");
    }
    /** Leaving fullscreen turns the trailer into a browser tab. */
    function toTab() { const g = game; close(); if (g) Browser.open("game:" + g.id); }
    return { open, close, toTab, isOpen: () => !!overlay };
  })();

  /* ---------- games ---------- */
  const Games = {
    /** Build → open in a browser tab. No build → fullscreen trailer first. */
    launch(id) {
      const g = gameById(id);
      if (!g) return;
      if (g.build) Browser.open("game:" + g.id);
      else Fullscreen.open(g);
    },
  };

  /* ---------- desktop icons ---------- */
  function buildDesktop() {
    const O = SITE.owner;
    document.title = `${O.name} — Desktop`;
    document.getElementById("greet-title").innerHTML = `${esc(SITE.greeting.title)} <span>${esc(O.name)}</span>`;
    document.getElementById("greet-sub").innerHTML = SITE.greeting.lines.map(esc).join("<br>");

    const items = [
      { label: "Browser", tile: "browser", open: () => Browser.open("about") },
      { label: "Game Trailers", tile: "trailers", open: () => Trailers.open() },
      { label: "Art Works", tile: "art", open: () => Gallery.open() },
      { label: "Music", tile: "music", open: Music.toggle, music: true },
      ...SITE.games.map(g => ({ label: g.title, tile: "game:" + g.id, open: () => Games.launch(g.id) })),
      { label: null, tile: "theme", open: Theme.toggle, theme: true },
    ];
    const wrap = document.getElementById("icons");
    wrap.innerHTML = "";
    items.forEach(it => {
      const label = it.theme
        ? `<span class="lbl"><span class="when-light">Dark Mode</span><span class="when-dark">Light Mode</span></span>`
        : `<span class="lbl"${it.music ? " data-music-label" : ""}>${esc(it.label)}</span>`;
      const b = h(`<button type="button" class="dicon" role="listitem"${it.music ? ' data-music-btn aria-pressed="false"' : ""}>${tile(it.tile)}${label}</button>`);
      b.addEventListener("click", e => {
        if (b._justDragged) return;
        wrap.querySelectorAll(".dicon.selected").forEach(x => x.classList.remove("selected"));
        b.classList.add("selected");
        if (e.detail === 0 || b._touch) it.open();   // keyboard Enter / touch tap opens straight away
      });
      b.addEventListener("pointerdown", e => { b._touch = e.pointerType === "touch"; startIconDrag(b, wrap, e); });
      b.addEventListener("dblclick", () => { if (!b._justDragged) it.open(); });
      wrap.appendChild(b);
    });
    layoutIcons(wrap, true);
    if (document.fonts) document.fonts.ready.then(() => layoutIcons(wrap));   // labels may change height once fonts load
    addEventListener("resize", () => layoutIcons(wrap));
    document.getElementById("desktop").addEventListener("pointerdown", e => {
      if (!e.target.closest(".dicon")) wrap.querySelectorAll(".dicon.selected").forEach(x => x.classList.remove("selected"));
    });
  }

  /* ---------- desktop icons on a snap grid, like Windows (positions are not saved) ---------- */
  const GRID = { x0: 24, y0: 24, cw: 144, ch: 164, cols: 1, rows: 1 };
  const desktopRect = () => document.getElementById("desktop").getBoundingClientRect();
  const cellKey = ([c, r]) => c + "," + r;
  const clampN = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

  function measureGrid(wrap) {
    const icons = [...wrap.querySelectorAll(".dicon")];
    const d = desktopRect(), small = innerWidth < 900;
    GRID.x0 = GRID.y0 = small ? 12 : 24;
    GRID.cw = Math.max(...icons.map(b => b.offsetWidth)) + (small ? 4 : 12);
    GRID.ch = Math.max(...icons.map(b => b.offsetHeight)) + 4;
    GRID.cols = Math.max(1, Math.floor((d.width - GRID.x0) / GRID.cw));
    GRID.rows = Math.max(1, Math.floor((d.height - GRID.y0) / GRID.ch));
  }
  const cellToXY = ([c, r]) => [GRID.x0 + c * GRID.cw, GRID.y0 + r * GRID.ch];
  const xyToCell = (x, y) => [clampN(Math.round((x - GRID.x0) / GRID.cw), 0, GRID.cols - 1), clampN(Math.round((y - GRID.y0) / GRID.ch), 0, GRID.rows - 1)];
  const taken = (wrap, except) => new Set([...wrap.querySelectorAll(".dicon")].filter(b => b !== except && b._cell).map(b => cellKey(b._cell)));

  /** The target cell if it's free, otherwise the closest free one. */
  function freeCellNear(target, used) {
    if (!used.has(cellKey(target))) return target;
    let best = target, bd = Infinity;
    for (let c = 0; c < GRID.cols; c++) for (let r = 0; r < GRID.rows; r++) {
      if (used.has(c + "," + r)) continue;
      const d = (c - target[0]) ** 2 + (r - target[1]) ** 2;
      if (d < bd) { bd = d; best = [c, r]; }
    }
    return best;
  }

  function putIcon(b, cell) {
    b._cell = cell;
    const [x, y] = cellToXY(cell);
    b.style.left = x + "px";
    b.style.top = y + "px";
  }

  /** reset=true → default arrangement (columns of 4). Otherwise keep cells, pulling any off-screen icon back in. */
  function layoutIcons(wrap, reset) {
    measureGrid(wrap);
    const icons = [...wrap.querySelectorAll(".dicon")];
    const perCol = Math.min(4, GRID.rows);
    if (reset) { icons.forEach((b, i) => putIcon(b, [Math.floor(i / perCol), i % perCol])); return; }
    icons.forEach(b => {
      const [c, r] = b._cell || [0, 0];
      const inside = c < GRID.cols && r < GRID.rows;
      putIcon(b, inside ? [c, r] : freeCellNear([Math.min(c, GRID.cols - 1), Math.min(r, GRID.rows - 1)], taken(wrap, b)));
    });
  }

  function startIconDrag(b, wrap, e) {
    if (e.button !== 0) return;
    const sx = e.clientX, sy = e.clientY;
    let dragging = false, ox = 0, oy = 0, ghost = null, target = b._cell;
    const move = ev => {
      if (!dragging) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return;   // small wiggles still count as a click
        dragging = true;
        measureGrid(wrap);
        const r = b.getBoundingClientRect();
        ox = sx - r.left; oy = sy - r.top;
        b.classList.add("dragging");
        document.body.classList.add("is-dragging");
        ghost = h(`<div class="icon-ghost" aria-hidden="true"></div>`);
        ghost.style.width = b.offsetWidth + "px";
        ghost.style.height = b.offsetHeight + "px";
        wrap.appendChild(ghost);
      }
      const d = desktopRect();
      const x = clampN(ev.clientX - ox - d.left, 0, d.width - b.offsetWidth);
      const y = clampN(ev.clientY - oy - d.top, 0, d.height - b.offsetHeight);
      b.style.left = x + "px";
      b.style.top = y + "px";
      target = freeCellNear(xyToCell(x, y), taken(wrap, b));
      const [gx, gy] = cellToXY(target);
      ghost.style.left = gx + "px";
      ghost.style.top = gy + "px";
    };
    const up = () => {
      removeEventListener("pointermove", move);
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
      if (!dragging) return;
      ghost.remove();
      b.classList.remove("dragging");
      document.body.classList.remove("is-dragging");
      b.classList.add("snapping");
      putIcon(b, target);
      setTimeout(() => b.classList.remove("snapping"), 200);
      b._justDragged = true;                      // swallow the click that follows the drop
      setTimeout(() => { b._justDragged = false; }, 0);
    };
    addEventListener("pointermove", move);
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
  }

  /* ---------- taskbar ---------- */
  function buildTaskbar() {
    const logo = document.getElementById("tb-logo");
    logo.innerHTML = tile("profile");
    logo.addEventListener("click", () => Browser.open("about"));

    const apps = [
      { app: "browser", label: "Browser", tile: "browser", run: () => WM.toggleApp("browser", () => Browser.open("about")) },
      { app: "trailers", label: "Game Trailers", tile: "trailers", run: () => WM.toggleApp("trailers", () => Trailers.open()) },
      { app: "art", label: "Art Works", tile: "art", run: () => WM.toggleApp("art", () => Gallery.open()) },
      { app: "music", label: "Music", tile: "music", run: Music.toggle },
    ];
    const nav = document.getElementById("tb-apps");
    apps.forEach(a => {
      const b = h(`<button type="button" class="tb-app" data-app="${a.app}" title="${a.label}" aria-label="${a.label}"${a.app === "music" ? ' data-music-btn aria-pressed="false"' : ""}>${tile(a.tile)}<i class="ind"></i></button>`);
      b.addEventListener("click", a.run);
      nav.appendChild(b);
    });
    const sync = () => {
      const front = WM.top();
      nav.querySelectorAll(".tb-app").forEach(b => {
        const app = b.dataset.app;
        if (app === "music") return;
        b.classList.toggle("open", WM.all(app).length > 0);
        b.classList.toggle("focused", !!front && front.dataset.app === app);
      });
    };
    document.addEventListener("wm:change", sync);
    sync();

    const tick = () => {
      const d = new Date();
      document.getElementById("clock-time").textContent = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).toLowerCase();
      document.getElementById("clock-date").textContent = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }).toLowerCase();
    };
    tick();
    setInterval(tick, 15000);
  }

  /* ---------- keyboard ---------- */
  addEventListener("keydown", e => {
    if (e.key === "Escape" && Fullscreen.isOpen()) { e.preventDefault(); Fullscreen.toTab(); }
  });

  window.Theme = Theme;
  window.Music = Music;
  window.Games = Games;
  window.Fullscreen = Fullscreen;

  buildDesktop();
  buildTaskbar();
  Browser.open("about");
})();
