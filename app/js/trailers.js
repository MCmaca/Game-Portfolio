/* Game Trailers: vertical, scroll-snapping trailer feed.
   Rail: Like (local only), Save (download trailer), Play (open build; shakes red if none), Info. */
(function () {
  const { ICON, esc, h, store, toast, tile, WC, gameById, fmtTime, fmtCount } = UI;
  let win = null, observer = null;

  const liked = () => new Set(store.get("pf.likes", []));
  function setLiked(id, on) {
    const s = liked();
    on ? s.add(id) : s.delete(id);
    store.set("pf.likes", [...s]);
  }

  function reel(g, i) {
    const isLiked = liked().has(g.id);
    return `<article class="reel" data-id="${esc(g.id)}" data-index="${i}">
      <div class="r-media">
        <img class="r-poster" src="${esc(g.poster || g.icon)}" alt="">
        ${g.trailer ? `<video class="r-video" src="${esc(g.trailer)}" muted loop playsinline preload="metadata"></video>` : ""}
      </div>
      <div class="r-tint"></div>
      ${g.trailer ? `<button type="button" class="r-bigplay" aria-label="Play trailer">${ICON.play}</button>` : `<p class="r-soon">Trailer coming soon</p>`}
      <div class="r-caption">
        <span class="r-badge">${ICON.play}${g.trailer ? `TRAILER<span class="r-dur"></span>` : "TRAILER · SOON"}</span>
        <h3>${esc(g.title)}</h3>
        <p>${esc(g.description)}</p>
        <div class="chips">${g.tech.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
      </div>
      <div class="r-rail">
        <div class="r-act"><button type="button" class="r-btn r-like${isLiked ? " liked" : ""}" aria-pressed="${isLiked}" aria-label="Like">${isLiked ? ICON.heartFilled : ICON.heart}</button><span class="r-lbl r-count">${fmtCount(g.likes + (isLiked ? 1 : 0))}</span></div>
        <div class="r-act"><button type="button" class="r-btn r-save" aria-label="Save trailer">${ICON.download}</button><span class="r-lbl">Save</span></div>
        <div class="r-act"><button type="button" class="r-btn r-play" aria-label="Play ${esc(g.title)}">${ICON.play}</button><span class="r-lbl r-play-lbl">Play</span></div>
        <div class="r-act"><button type="button" class="r-btn r-info" aria-label="${esc(g.title)} info">${ICON.info}</button><span class="r-lbl">Info</span></div>
      </div>
      ${g.trailer ? `<div class="r-controls">
        <button type="button" class="r-ctl r-toggle" aria-label="Pause">${ICON.pause}</button>
        <div class="r-bar"><i></i></div>
        <span class="r-time">0:00 / 0:00</span>
        <button type="button" class="r-ctl r-mute" aria-label="Unmute">${ICON.mute}</button>
      </div>` : ""}
      <div class="r-toast" role="status"></div>
    </article>`;
  }

  function open(focusId) {
    if (win) { WM.focus(win); if (focusId) jump(focusId); return; }
    const games = SITE.games;
    win = h(`<section class="win trailers" aria-label="Game Trailers">
      <div class="titlebar" data-handle>
        ${WC}
        <div class="tb-title"><span class="fav">${tile("trailers")}</span><b>Game Trailers</b><span class="count">· 1 / ${games.length}</span></div>
        <button type="button" class="ibtn grid-btn" title="All trailers" aria-label="All trailers" aria-haspopup="true">${ICON.grid}</button>
      </div>
      <div class="stage">
        <div class="feed" tabindex="0">${games.map(reel).join("")}</div>
        <div class="pager">${games.map((_, i) => `<i class="${i === 0 ? "on" : ""}"></i>`).join("")}</div>
        <div class="jump" hidden>${games.map(g => `<button type="button" data-jump="${esc(g.id)}">${tile("game:" + g.id)}<span>${esc(g.title)}</span></button>`).join("")}</div>
      </div>
    </section>`);

    const feed = win.querySelector(".feed");
    const { w, h: hh } = WM.fit(620, 940, true);
    WM.add(win, "trailers", { w, h: hh, x: Math.max(24, innerWidth - w - 40), y: 24, minW: 320, minH: 480 });
    // After a resize, snap back onto the trailer that was showing.
    let current = 0;
    feed.addEventListener("scroll", () => { if (!win.classList.contains("resizing")) current = Math.round(feed.scrollTop / Math.max(1, feed.clientHeight)); }, { passive: true });
    win.addEventListener("wm:resize", () => requestAnimationFrame(() => { feed.scrollTop = current * feed.clientHeight; }));

    feed.addEventListener("click", onClick);
    win.querySelector(".grid-btn").addEventListener("click", () => { const j = win.querySelector(".jump"); j.hidden = !j.hidden; });
    win.querySelector(".jump").addEventListener("click", e => { const b = e.target.closest("[data-jump]"); if (b) jump(b.dataset.jump); });
    feed.addEventListener("keydown", e => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); feed.scrollBy({ top: (e.key === "ArrowDown" ? 1 : -1) * feed.clientHeight, behavior: "smooth" }); }
    });

    feed.querySelectorAll(".reel").forEach(r => {
      const v = r.querySelector("video");
      if (!v) return;
      const bar = r.querySelector(".r-bar i"), time = r.querySelector(".r-time"), toggle = r.querySelector(".r-toggle");
      const sync = () => { r.classList.toggle("paused", v.paused); toggle.innerHTML = v.paused ? ICON.play : ICON.pause; toggle.setAttribute("aria-label", v.paused ? "Play" : "Pause"); };
      v.addEventListener("play", sync); v.addEventListener("pause", sync);
      v.addEventListener("loadedmetadata", () => { r.querySelector(".r-dur").textContent = " · " + fmtTime(v.duration); });
      v.addEventListener("timeupdate", () => { if (v.duration) bar.style.width = (v.currentTime / v.duration * 100) + "%"; time.textContent = `${fmtTime(v.currentTime)} / ${fmtTime(v.duration)}`; });
      v.addEventListener("error", () => r.classList.add("no-video"));
      r.querySelector(".r-bar").addEventListener("click", e => { const rect = e.currentTarget.getBoundingClientRect(); if (v.duration) v.currentTime = (e.clientX - rect.left) / rect.width * v.duration; });
    });

    // Autoplay (muted) the reel in view, pause the rest.
    observer = new IntersectionObserver(entries => {
      entries.forEach(en => {
        const r = en.target, v = r.querySelector("video");
        if (en.isIntersecting && en.intersectionRatio > 0.6) {
          const i = +r.dataset.index;
          win.querySelector(".count").textContent = `· ${i + 1} / ${games.length}`;
          win.querySelectorAll(".pager i").forEach((d, k) => d.classList.toggle("on", k === i));
          if (v && !win.hidden) v.play().catch(() => r.classList.add("paused"));
        } else if (v) v.pause();
      });
    }, { root: feed, threshold: [0, 0.6, 1] });
    feed.querySelectorAll(".reel").forEach(r => observer.observe(r));

    win.addEventListener("wm:minimize", () => feed.querySelectorAll("video").forEach(v => v.pause()));
    win.addEventListener("wm:close", () => { observer.disconnect(); feed.querySelectorAll("video").forEach(v => v.pause()); win = null; });
    if (focusId) jump(focusId);
    feed.focus({ preventScroll: true });
  }

  function jump(id) {
    const r = win.querySelector(`.reel[data-id="${CSS.escape(id)}"]`);
    if (r) r.scrollIntoView({ behavior: "smooth", block: "start" });
    win.querySelector(".jump").hidden = true;
  }

  function reelToast(r, msg) {
    const t = r.querySelector(".r-toast");
    t.textContent = msg;
    t.classList.remove("show"); void t.offsetWidth; t.classList.add("show");
  }

  function onClick(e) {
    const r = e.target.closest(".reel");
    if (!r) return;
    const g = gameById(r.dataset.id), v = r.querySelector("video");

    if (e.target.closest(".r-like")) {
      const btn = r.querySelector(".r-like"), on = !btn.classList.contains("liked");
      setLiked(g.id, on);
      btn.classList.toggle("liked", on);
      btn.setAttribute("aria-pressed", on);
      btn.innerHTML = on ? ICON.heartFilled : ICON.heart;
      r.querySelector(".r-count").textContent = fmtCount(g.likes + (on ? 1 : 0));
    } else if (e.target.closest(".r-save")) {
      if (!g.trailer) return reelToast(r, "No trailer file to save yet");
      const a = document.createElement("a");
      a.href = g.trailer; a.download = g.trailer.split("/").pop();
      document.body.appendChild(a); a.click(); a.remove();
    } else if (e.target.closest(".r-play")) {
      if (g.build) { if (v) v.pause(); Browser.open("game:" + g.id); return; }
      const btn = r.querySelector(".r-play");
      btn.classList.remove("denied"); void btn.offsetWidth; btn.classList.add("denied");
      r.querySelector(".r-play-lbl").textContent = "No build!";
      reelToast(r, "No playable build yet — check back soon!");
      clearTimeout(btn._t);
      btn._t = setTimeout(() => { btn.classList.remove("denied"); r.querySelector(".r-play-lbl").textContent = "Play"; }, 1800);
    } else if (e.target.closest(".r-info")) {
      Browser.open("info:" + g.id);
    } else if (e.target.closest(".r-toggle, .r-bigplay") || (v && e.target.closest(".r-media"))) {
      if (v) v.paused ? v.play().catch(() => {}) : v.pause();
    } else if (e.target.closest(".r-mute")) {
      v.muted = !v.muted;
      const b = r.querySelector(".r-mute");
      b.innerHTML = v.muted ? ICON.mute : ICON.volume;
      b.setAttribute("aria-label", v.muted ? "Unmute" : "Mute");
    }
  }

  window.Trailers = { open };
})();
