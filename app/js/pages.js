/* Browser page content (About Me, game tab, game info) and the shared trailer player. */
(function () {
  const { ICON, esc, h, tile, gameById, toast, fmtTime } = UI;

  /* ---------------- Trailer player (used in a tab and fullscreen) ---------------- */
  const Player = {
    /** mode: "tab" | "fullscreen". actions: { info, fullscreen, tab, exit } */
    create(g, mode, actions = {}) {
      const hasVid = !!g.trailer;
      const el = h(`<div class="player player--${mode}${hasVid ? "" : " no-video"}">
        <img class="p-backdrop" src="${esc(g.poster || g.icon)}" alt="">
        ${hasVid ? `<video class="p-video" src="${esc(g.trailer)}" playsinline preload="metadata"></video>` : ""}
        <div class="p-vignette"></div>
        <div class="p-card">
          ${tile("game:" + g.id)}
          <h2>${esc(g.title)}</h2>
          <p>${hasVid ? "Official trailer — the playable build is on its way." : "Trailer coming soon — the playable build is on its way."}</p>
          ${hasVid ? `<button type="button" class="p-bigplay" aria-label="Play trailer">${ICON.play}</button>` : ""}
        </div>
        <div class="p-controls">
          <button type="button" class="p-btn" data-p="toggle" aria-label="Play" ${hasVid ? "" : "disabled"}>${ICON.play}</button>
          <span class="p-time p-cur">0:00</span>
          <input class="p-scrub" type="range" min="0" max="1000" value="0" aria-label="Seek" ${hasVid ? "" : "disabled"}>
          <span class="p-time p-dur">0:00</span>
          <button type="button" class="p-btn" data-p="mute" aria-label="Mute" ${hasVid ? "" : "disabled"}>${ICON.volume}</button>
          ${mode === "fullscreen"
            ? `<button type="button" class="p-btn" data-p="tab" title="Open as a browser tab" aria-label="Open as a browser tab">${ICON.popout}</button>
               <button type="button" class="p-btn" data-p="exit" title="Exit fullscreen (Esc)" aria-label="Exit fullscreen">${ICON.exitFullscreen}</button>`
            : `<button type="button" class="p-btn" data-p="info" title="Game info" aria-label="Game info">${ICON.info}</button>
               <button type="button" class="p-btn" data-p="fullscreen" title="Fullscreen" aria-label="Fullscreen">${ICON.fullscreen}</button>`}
        </div>
      </div>`);

      const v = el.querySelector("video");
      const toggleBtn = el.querySelector('[data-p="toggle"]');
      const scrub = el.querySelector(".p-scrub");
      const sync = () => {
        const playing = !!v && !v.paused;
        el.classList.toggle("is-playing", playing);
        toggleBtn.innerHTML = playing ? ICON.pause : ICON.play;
        toggleBtn.setAttribute("aria-label", playing ? "Pause" : "Play");
      };
      if (v) {
        ["play", "pause", "ended"].forEach(ev => v.addEventListener(ev, sync));
        v.addEventListener("loadedmetadata", () => { el.querySelector(".p-dur").textContent = fmtTime(v.duration); });
        v.addEventListener("timeupdate", () => {
          el.querySelector(".p-cur").textContent = fmtTime(v.currentTime);
          if (v.duration) scrub.value = Math.round(v.currentTime / v.duration * 1000);
        });
        v.addEventListener("error", () => { el.classList.add("no-video"); toggleBtn.disabled = true; scrub.disabled = true; });
        v.addEventListener("click", () => (v.paused ? el.play() : v.pause()));
        scrub.addEventListener("input", () => { if (v.duration) v.currentTime = scrub.value / 1000 * v.duration; });
      }
      el.addEventListener("click", e => {
        const b = e.target.closest("[data-p], .p-bigplay");
        if (!b || b.disabled) return;
        const a = b.dataset.p || "toggle";
        if (a === "toggle") { if (v) v.paused ? el.play() : v.pause(); }
        else if (a === "mute") { if (v) { v.muted = !v.muted; b.innerHTML = v.muted ? ICON.mute : ICON.volume; } }
        else if (actions[a]) actions[a]();
      });

      el.play = () => { if (!v) return; v.play().catch(() => { v.muted = true; el.querySelector('[data-p="mute"]').innerHTML = ICON.mute; v.play().catch(() => {}); }); };
      el.pause = () => { if (v) v.pause(); };
      return el;
    },
  };

  /* ---------------- Pages ---------------- */
  const person = `<svg class="person" viewBox="0 0 300 380" aria-hidden="true"><circle cx="150" cy="185" r="55"/><ellipse cx="150" cy="370" rx="115" ry="105"/></svg>`;

  function about() {
    const O = SITE.owner, A = SITE.about;
    const el = h(`<div class="pg pg-about">
      <div class="about-hero">
        <div class="about-photo">${O.photo ? `<img src="${esc(O.photo)}" alt="Photo of ${esc(O.name)}">` : person}</div>
        <div class="about-intro">
          <p class="eyebrow">About me</p>
          <h1>${esc(A.headline)} <span class="hl">${esc(O.name)}</span>.</h1>
          <p class="about-sub">${esc(A.sub)}</p>
          <p class="about-body">${esc(A.body)}</p>
          <dl class="facts">${A.facts.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>
          <div class="about-actions">
            <a class="btn btn--primary" href="mailto:${esc(A.email)}">${ICON.mail}<span>Say hello</span></a>
            ${A.resume ? `<a class="btn" href="${esc(A.resume)}" download>${ICON.download}<span>Download résumé</span></a>` : ""}
          </div>
        </div>
      </div>
      <section class="about-section">
        <h2>What I do</h2>
        <div class="cards">${A.skills.map(s => `<article class="card"><span class="card-badge">${ICON[s.icon] || ICON.image}</span><h3>${esc(s.title)}</h3><p>${esc(s.text)}</p></article>`).join("")}</div>
      </section>
      <section class="about-section">
        <h2>My games</h2>
        <div class="game-row">${SITE.games.map(g => `<button type="button" class="game-link" data-game="${esc(g.id)}">${tile("game:" + g.id)}<span>${esc(g.title)}</span></button>`).join("")}</div>
      </section>
    </div>`);
    el.querySelectorAll("[data-game]").forEach(b => b.addEventListener("click", () => Games.launch(b.dataset.game)));
    return el;
  }

  function game(g) {
    if (g.build) {
      return h(`<div class="pg pg-game"><iframe class="game-frame" src="${esc(g.build)}" title="${esc(g.title)}" allow="fullscreen; autoplay; gamepad" allowfullscreen></iframe></div>`);
    }
    const el = h(`<div class="pg pg-game"></div>`);
    const p = Player.create(g, "tab", {
      info: () => Browser.open("info:" + g.id),
      fullscreen: () => { p.pause(); Fullscreen.open(g, { fromTab: true }); },
    });
    el.appendChild(p);
    el.player = p;
    return el;
  }

  function info(g) {
    const I = g.info || {};
    const cells = [["Genre", I.genre], ["Platform", I.platform], ["Status", I.status || (g.build ? "Playable" : "In development")], ["Made with", I.madeWith || g.tech.join(", ")]];
    const el = h(`<div class="pg pg-info">
      <div class="info-hero">
        ${tile("game:" + g.id)}
        <div>
          <p class="eyebrow">Game info</p>
          <h1>${esc(g.title)}</h1>
          ${g.info ? "" : `<p class="info-note">Details coming soon.</p>`}
        </div>
      </div>
      <div class="info-grid">${cells.map(([k, v]) => `<div class="info-cell"><span>${k}</span>${v ? `<b>${esc(v)}</b>` : `<i class="skel"></i>`}</div>`).join("")}</div>
      <div class="info-desc">${I.description ? `<p>${esc(I.description)}</p>` : `<i class="skel w90"></i><i class="skel w80"></i><i class="skel w85"></i><i class="skel w50"></i>`}</div>
      <div class="info-actions">
        <button type="button" class="btn btn--primary" data-act="play">${ICON.play}<span>${g.build ? "Play" : "Watch trailer"}</span></button>
        <div class="chips">${g.tech.map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
      </div>
    </div>`);
    el.querySelector('[data-act="play"]').addEventListener("click", () => Browser.open("game:" + g.id));
    return el;
  }

  /** Only these routes exist. The address bar is read-only, so nothing else can be reached. */
  function allowed(route) {
    const [k, id] = route.split(":");
    return k === "about" || ((k === "game" || k === "info") && !!gameById(id));
  }

  function meta(route) {
    const [k, id] = route.split(":");
    const D = SITE.domain;
    if (k === "about") return { title: "About Me", url: `${D}/about-me`, fav: tile("about") };
    const g = gameById(id);
    if (k === "game") return { title: g.title, url: `${D}/games/${g.id}`, fav: tile("game:" + g.id) };
    return { title: `${g.title} · Info`, url: `${D}/games/${g.id}/info`, fav: tile("game:" + g.id) };
  }

  function render(route) {
    const [k, id] = route.split(":");
    if (k === "about") return about();
    const g = gameById(id);
    return k === "game" ? game(g) : info(g);
  }

  window.Player = Player;
  window.Pages = { render, meta, allowed };
})();
