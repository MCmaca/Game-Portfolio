/* The in-site browser: tabs, back/forward, read-only address bar, History,
   and untab / retab (drag a tab out to its own window, or onto another browser's tab strip). */
(function () {
  const { ICON, h, store, WC, tile } = UI;
  const browsers = [];   // { el, tabs: [], active }
  let tabSeq = 0, cascade = 0;

  const routeOf = t => t.history[t.index];
  const byEl = el => browsers.find(b => b.el === el);

  /* ---------- window ---------- */
  function createWindow(pos) {
    const el = h(`<section class="win browser" aria-label="Browser">
      <div class="tabstrip" data-handle>
        ${WC}
        <div class="tabs" role="tablist"></div>
        <button type="button" class="ibtn newtab" title="New tab" aria-label="New tab">${ICON.plus}</button>
      </div>
      <div class="toolbar">
        <button type="button" class="ibtn" data-nav="back" title="Back" aria-label="Back">${ICON.back}</button>
        <button type="button" class="ibtn" data-nav="forward" title="Forward" aria-label="Forward">${ICON.forward}</button>
        <button type="button" class="ibtn" data-nav="reload" title="Reload" aria-label="Reload">${ICON.reload}</button>
        <div class="address" aria-label="Address (read-only)"><span class="lock">${ICON.lock}</span><span class="url"></span><span class="star" title="Bookmarked">${ICON.star}</span></div>
        <button type="button" class="ibtn" data-nav="history" title="History" aria-label="History" aria-haspopup="true">${ICON.history}</button>
        <button type="button" class="ibtn" data-nav="more" title="More" aria-label="More" aria-haspopup="true">${ICON.more}</button>
      </div>
      <div class="bookmarks"><button type="button" class="bm" data-route="about"><span class="fav">${tile("about")}</span>About Me</button></div>
      <div class="viewport"></div>
      <div class="popover history-pop" hidden></div>
      <div class="popover more-pop" hidden>
        <button type="button" data-more="newtab">${ICON.plus}<span>New tab</span></button>
        <button type="button" data-more="closetab">${ICON.close}<span>Close tab</span></button>
      </div>
    </section>`);
    const b = { el, tabs: [], active: null };
    browsers.push(b);

    el.querySelector(".newtab").addEventListener("click", () => attach(b, makeTab("about")));
    el.querySelector(".bm").addEventListener("click", () => b.active && navigate(b.active, "about"));
    el.querySelector(".toolbar").addEventListener("click", e => {
      const btn = e.target.closest("[data-nav]");
      if (!btn || btn.disabled || !b.active) return;
      const t = b.active, a = btn.dataset.nav;
      if (a === "back" && t.index > 0) { t.index--; render(t); }
      else if (a === "forward" && t.index < t.history.length - 1) { t.index++; render(t); }
      else if (a === "reload") render(t);
      else if (a === "history") togglePop(b, ".history-pop", renderHistory);
      else if (a === "more") togglePop(b, ".more-pop");
    });
    el.querySelector(".more-pop").addEventListener("click", e => {
      const a = e.target.closest("[data-more]")?.dataset.more;
      if (a === "newtab") attach(b, makeTab("about"));
      if (a === "closetab" && b.active) closeTab(b.active);
      closePops(b);
    });
    el.querySelector(".history-pop").addEventListener("click", e => {
      if (e.target.closest("[data-route]") && b.active) { navigate(b.active, "about"); closePops(b); }
    });
    el.addEventListener("wm:close", () => {
      b.tabs.forEach(t => t.page.remove());
      browsers.splice(browsers.indexOf(b), 1);
    });
    el.addEventListener("wm:minimize", () => pauseMedia(el));

    const { w, h: hh } = WM.fit(1080, 790);
    const x = pos?.x ?? Math.max(24, innerWidth - w - 40) - (cascade % 4) * 32;
    const y = pos?.y ?? 40 + (cascade % 4) * 28;
    if (!pos) cascade++;
    WM.add(el, "browser", { w, h: hh, x, y, minW: 480, minH: 320 });
    return b;
  }

  /* ---------- popovers ---------- */
  function closePops(b) { b.el.querySelectorAll(".popover").forEach(p => (p.hidden = true)); }
  function togglePop(b, sel, fill) {
    const p = b.el.querySelector(sel), open = p.hidden;
    closePops(b);
    if (open) { if (fill) fill(p); p.hidden = false; }
  }
  function renderHistory(p) {
    const last = store.get("pf.visit.about", Date.now());
    const d = new Date(last);
    const day = d.toDateString() === new Date().toDateString() ? "Today" : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).toLowerCase();
    p.innerHTML = `<div class="pop-head">${ICON.history}<b>History</b></div>
      <p class="pop-label">${day}</p>
      <button type="button" class="pop-item" data-route="about"><span class="fav">${tile("about")}</span><span><b>About Me</b><small>${SITE.domain}/about-me · ${time}</small></span></button>`;
  }
  document.addEventListener("pointerdown", e => {
    browsers.forEach(b => { if (!e.target.closest(".popover, [data-nav=history], [data-nav=more]") || !b.el.contains(e.target)) closePops(b); });
  });

  /* ---------- tabs ---------- */
  function makeTab(route) {
    const t = {
      id: ++tabSeq, history: [route], index: 0, browser: null,
      page: h(`<div class="page" role="tabpanel"></div>`),
      el: h(`<div class="tab" role="tab" tabindex="0"><span class="fav"></span><span class="ttl"></span><button type="button" class="tclose" aria-label="Close tab">${ICON.close}</button></div>`),
    };
    t.el.querySelector(".tclose").addEventListener("click", e => { e.stopPropagation(); closeTab(t); });
    t.el.addEventListener("pointerdown", e => tabPointerDown(t, e));
    t.el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") activate(t.browser, t); });
    render(t);
    return t;
  }

  function render(t) {
    const route = routeOf(t);
    const m = Pages.meta(route);
    t.page.querySelectorAll("video").forEach(v => v.pause());
    t.page.replaceChildren(Pages.render(route));
    t.el.querySelector(".fav").innerHTML = m.fav;
    t.el.querySelector(".ttl").textContent = m.title;
    t.el.title = m.title;
    if (route === "about") store.set("pf.visit.about", Date.now());
    if (t.browser && t.browser.active === t) syncToolbar(t.browser);
  }

  function navigate(t, route) {
    if (!Pages.allowed(route)) return;
    if (routeOf(t) === route) { render(t); return; }
    t.history = t.history.slice(0, t.index + 1);
    t.history.push(route);
    t.index++;
    render(t);
  }

  function syncToolbar(b) {
    const t = b.active;
    if (!t) return;
    b.el.querySelector(".url").textContent = Pages.meta(routeOf(t)).url;
    b.el.querySelector('[data-nav="back"]').disabled = t.index === 0;
    b.el.querySelector('[data-nav="forward"]').disabled = t.index >= t.history.length - 1;
  }

  function pauseMedia(root) { root.querySelectorAll("video").forEach(v => v.pause()); }

  function attach(b, t) {
    t.browser = b;
    b.tabs.push(t);
    b.el.querySelector(".tabs").appendChild(t.el);
    b.el.querySelector(".viewport").appendChild(t.page);
    activate(b, t);
  }

  function activate(b, t) {
    b.active = t;
    b.tabs.forEach(x => {
      const on = x === t;
      x.el.classList.toggle("active", on);
      x.el.setAttribute("aria-selected", on);
      x.page.hidden = !on;
      if (!on) pauseMedia(x.page);
    });
    syncToolbar(b);
  }

  /** Remove a tab from its browser. Closes the window when it was the last tab. */
  function detach(t) {
    const b = t.browser;
    const i = b.tabs.indexOf(t);
    b.tabs.splice(i, 1);
    t.el.remove();
    t.page.remove();
    t.browser = null;
    if (!b.tabs.length) { WM.close(b.el); return; }
    if (b.active === t) activate(b, b.tabs[Math.min(i, b.tabs.length - 1)]);
  }

  function closeTab(t) { pauseMedia(t.page); detach(t); }

  /* ---------- untab / retab ---------- */
  function stripUnder(x, y, exceptB) {
    return browsers
      .filter(b => b !== exceptB && !b.el.hidden)
      .sort((a, c) => (+c.el.style.zIndex || 0) - (+a.el.style.zIndex || 0))
      .find(b => { const r = b.el.querySelector(".tabstrip").getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; });
  }

  function mergeOnDrop(src, t, ev) {
    const target = stripUnder(ev.clientX, ev.clientY, src);
    if (!target) return;
    detach(t);                // closes src (it only had this tab)
    attach(target, t);
    WM.focus(target.el);
  }

  function tabPointerDown(t, e) {
    if (e.button !== 0 || e.target.closest(".tclose")) return;
    const b = t.browser;
    activate(b, t);
    const sx = e.clientX, sy = e.clientY;
    const tr = t.el.getBoundingClientRect();
    const move = ev => {
      const dx = ev.clientX - sx, dy = ev.clientY - sy;
      if (b.tabs.length === 1) {
        if (Math.hypot(dx, dy) < 6) return;
        cleanup();
        // Only tab → the tab drags the whole window; drop it on another tab strip to retab.
        const r = b.el.getBoundingClientRect();
        WM.startDrag(b.el, ev, { ox: sx - r.left, oy: sy - r.top, onDrop: d => mergeOnDrop(b, t, d) });
      } else if (Math.abs(dy) > 28 || WM.small() && Math.hypot(dx, dy) > 28) {
        cleanup();
        // Pull the tab out into its own window, then keep dragging that window.
        detach(t);
        const ox = sx - tr.left + 84, oy = 24;
        const nb = createWindow({ x: ev.clientX - ox, y: ev.clientY - oy });
        attach(nb, t);
        WM.startDrag(nb.el, ev, { ox, oy, onDrop: d => mergeOnDrop(nb, t, d) });
      }
    };
    const cleanup = () => { removeEventListener("pointermove", move); removeEventListener("pointerup", cleanup); removeEventListener("pointercancel", cleanup); };
    addEventListener("pointermove", move);
    addEventListener("pointerup", cleanup);
    addEventListener("pointercancel", cleanup);
  }

  /* ---------- public ---------- */
  function topBrowser() {
    const el = WM.top("browser");
    if (el) return byEl(el);
    const any = WM.all("browser").sort((a, c) => (+c.style.zIndex || 0) - (+a.style.zIndex || 0))[0];
    return any ? byEl(any) : null;
  }

  /** Open a route: reuse a tab that already shows it, otherwise add a tab to the front browser. */
  function open(route) {
    if (!Pages.allowed(route)) return;
    for (const b of browsers) {
      const t = b.tabs.find(x => routeOf(x) === route);
      if (t) { WM.focus(b.el); activate(b, t); return t; }
    }
    let b = topBrowser();
    if (!b) b = createWindow();
    else WM.focus(b.el);
    const t = makeTab(route);
    attach(b, t);
    return t;
  }

  window.Browser = { open };
})();
