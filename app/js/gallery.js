/* Art Works: phone-style photo gallery with albums, favorites (local), search and a viewer. */
(function () {
  const { ICON, esc, h, store, WC } = UI;
  let win = null;
  const state = { tab: "library", album: "All", q: "", list: [], index: 0 };

  const items = () => SITE.art.items.map((it, i) => ({ ...it, i, type: it.type || "image" }));
  const favs = () => new Set(store.get("pf.favs", []));
  const toggleFav = i => { const s = favs(); s.has(i) ? s.delete(i) : s.add(i); store.set("pf.favs", [...s]); return s.has(i); };
  const monthLabel = d => { const [y, m] = (d || "").split("-").map(Number); return y ? new Date(y, (m || 1) - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Undated"; };
  const bg = it => it.colors ? `background:linear-gradient(135deg, ${esc(it.colors[0])}, ${esc(it.colors[1])})` : "";

  function thumb(it, fav) {
    return `<button type="button" class="thumb" data-i="${it.i}" style="${it.src ? "" : bg(it)}" aria-label="${esc(it.title)}">
      ${it.src ? (it.type === "video" ? `<video src="${esc(it.src)}" muted preload="metadata"></video>` : `<img src="${esc(it.src)}" alt="" loading="lazy" draggable="false">`) : ""}
      ${it.type === "video" ? `<span class="t-vid">${ICON.play}</span>` : ""}
      ${fav ? `<span class="t-fav">${ICON.heartFilled}</span>` : ""}
    </button>`;
  }

  function grid(list) {
    if (!list.length) return `<p class="g-empty">${state.tab === "favorites" ? "Tap the heart on a piece to save it here." : "Nothing here yet."}</p>`;
    const f = favs(), groups = new Map();
    list.forEach(it => { const k = monthLabel(it.date); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(it); });
    return [...groups].map(([k, arr]) => `<h3 class="g-month">${esc(k)}</h3><div class="g-grid">${arr.map(it => thumb(it, f.has(it.i))).join("")}</div>`).join("");
  }

  function render() {
    const all = items(), body = win.querySelector(".g-body"), chips = win.querySelector(".albums");
    let list = all;
    chips.hidden = state.tab !== "library";
    win.querySelector(".g-search").hidden = state.tab !== "search";
    win.querySelectorAll(".g-tab").forEach(b => b.classList.toggle("on", b.dataset.tab === state.tab));
    chips.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.dataset.album === state.album));

    if (state.tab === "library") list = state.album === "All" ? all : all.filter(it => it.album === state.album);
    if (state.tab === "favorites") { const f = favs(); list = all.filter(it => f.has(it.i)); }
    if (state.tab === "search") { const q = state.q.trim().toLowerCase(); list = q ? all.filter(it => (it.title + " " + it.album).toLowerCase().includes(q)) : all; }
    if (state.tab === "albums") {
      body.innerHTML = `<div class="g-albums">${SITE.art.albums.map(a => {
        const arr = all.filter(it => it.album === a), cover = arr[0];
        return `<button type="button" class="g-album" data-album="${esc(a)}"><span class="g-cover" style="${cover && !cover.src ? bg(cover) : ""}">${cover && cover.src && cover.type !== "video" ? `<img src="${esc(cover.src)}" alt="" loading="lazy">` : ""}</span><b>${esc(a)}</b><small>${arr.length}</small></button>`;
      }).join("")}</div>`;
      state.list = [];
      return;
    }
    state.list = list;
    body.innerHTML = grid(list);
  }

  function open() {
    if (win) { WM.focus(win); return; }
    const all = items();
    win = h(`<section class="win art" aria-label="Art Works">
      <div class="phone-status" data-handle>${WC}<span class="island"></span><span class="ptime"><b class="ptime-t"></b>${ICON.wifi}</span></div>
      <header class="g-head"><div><h2>Art Works</h2><p>${all.length} pieces · ${SITE.art.albums.length} albums</p></div></header>
      <div class="albums" role="tablist">${["All", ...SITE.art.albums].map(a => `<button type="button" data-album="${esc(a)}">${esc(a)}</button>`).join("")}</div>
      <label class="g-search" hidden>${ICON.search}<input type="search" placeholder="Search art" aria-label="Search art"></label>
      <div class="g-body"></div>
      <nav class="g-tabs">
        <button type="button" class="g-tab" data-tab="library">${ICON.image}<span>Library</span></button>
        <button type="button" class="g-tab" data-tab="favorites">${ICON.heartFilled}<span>Favorites</span></button>
        <button type="button" class="g-tab" data-tab="albums">${ICON.grid}<span>Albums</span></button>
        <button type="button" class="g-tab" data-tab="search">${ICON.search}<span>Search</span></button>
      </nav>
      <div class="viewer" hidden>
        <div class="v-top"><button type="button" class="v-btn v-close" aria-label="Close">${ICON.close}</button><span class="v-count"></span><span></span></div>
        <div class="v-stage"></div>
        <button type="button" class="v-nav v-prev" aria-label="Previous">${ICON.chevronLeft}</button>
        <button type="button" class="v-nav v-next" aria-label="Next">${ICON.chevronRight}</button>
        <div class="v-info"><div><b class="v-title"></b><small class="v-album"></small></div>
          <div class="v-acts"><button type="button" class="v-btn v-fav" aria-label="Favorite"></button><a class="v-btn v-dl" aria-label="Download">${ICON.download}</a></div></div>
      </div>
    </section>`);

    const t = win.querySelector(".ptime-t");
    t.textContent = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/ [AP]M$/, "");

    win.querySelector(".albums").addEventListener("click", e => { const b = e.target.closest("[data-album]"); if (b) { state.album = b.dataset.album; render(); } });
    win.querySelector(".g-tabs").addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (b) { state.tab = b.dataset.tab; render(); if (state.tab === "search") win.querySelector(".g-search input").focus(); } });
    win.querySelector(".g-search input").addEventListener("input", e => { state.q = e.target.value; render(); });
    win.querySelector(".g-body").addEventListener("click", e => {
      const a = e.target.closest(".g-album");
      if (a) { state.tab = "library"; state.album = a.dataset.album; render(); return; }
      const th = e.target.closest(".thumb");
      if (th) openViewer(state.list.findIndex(it => it.i === +th.dataset.i));
    });
    win.querySelector(".v-close").addEventListener("click", closeViewer);
    win.querySelector(".v-prev").addEventListener("click", () => step(-1));
    win.querySelector(".v-next").addEventListener("click", () => step(1));
    win.querySelector(".v-fav").addEventListener("click", () => { toggleFav(state.list[state.index].i); paintViewer(); });
    win.addEventListener("keydown", e => {
      if (win.querySelector(".viewer").hidden) return;
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "Escape") { e.stopPropagation(); closeViewer(); }
    });
    win.addEventListener("wm:close", () => { win = null; });
    win.addEventListener("wm:minimize", () => win.querySelectorAll("video").forEach(v => v.pause()));

    const { w, h: hh } = WM.fit(440, 900, true);
    WM.add(win, "art", { w, h: hh, x: Math.max(24, innerWidth - w - 120), y: 40, minW: 300, minH: 480 });
    render();
  }

  function openViewer(i) {
    if (i < 0) return;
    state.index = i;
    win.querySelector(".viewer").hidden = false;
    paintViewer();
    win.querySelector(".v-close").focus();
  }
  function closeViewer() {
    const vw = win.querySelector(".viewer");
    vw.querySelectorAll("video").forEach(v => v.pause());
    vw.hidden = true;
    render();
  }
  function step(d) { state.index = (state.index + d + state.list.length) % state.list.length; paintViewer(); }
  function paintViewer() {
    const it = state.list[state.index], stage = win.querySelector(".v-stage");
    stage.innerHTML = it.src
      ? (it.type === "video" ? `<video src="${esc(it.src)}" controls autoplay playsinline></video>` : `<img src="${esc(it.src)}" alt="${esc(it.title)}">`)
      : `<div class="v-ph" style="${bg(it)}"><span>${esc(it.title)}</span></div>`;
    win.querySelector(".v-count").textContent = `${state.index + 1} / ${state.list.length}`;
    win.querySelector(".v-title").textContent = it.title;
    win.querySelector(".v-album").textContent = it.album;
    const on = favs().has(it.i), fav = win.querySelector(".v-fav");
    fav.innerHTML = on ? ICON.heartFilled : ICON.heart;
    fav.classList.toggle("on", on);
    fav.setAttribute("aria-pressed", on);
    const dl = win.querySelector(".v-dl");
    dl.hidden = !it.src;
    if (it.src) { dl.href = it.src; dl.download = it.src.split("/").pop(); }
    const multi = state.list.length > 1;
    win.querySelector(".v-prev").hidden = win.querySelector(".v-next").hidden = !multi;
  }

  window.Gallery = { open };
})();
