/* Shared helpers: icons, app tiles, toast, local storage. */
(function () {
  const S = 'fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
  const F = 'fill="currentColor"';
  const svg = body => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
  const HEART = "M12 20.5s-7.5-4.6-9.3-9.2C1.4 7.9 3.6 4.5 7 4.5c2.1 0 3.6 1.2 5 3 1.4-1.8 2.9-3 5-3 3.4 0 5.6 3.4 4.3 6.8-1.8 4.6-9.3 9.2-9.3 9.2z";

  const ICON = {
    back: svg(`<path d="M15 18l-6-6 6-6" ${S}/>`),
    forward: svg(`<path d="M9 18l6-6-6-6" ${S}/>`),
    reload: svg(`<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" ${S}/>`),
    lock: svg(`<rect x="5" y="11" width="14" height="10" rx="2.5" ${S}/><path d="M8 11V8a4 4 0 0 1 8 0v3" ${S}/>`),
    star: svg(`<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" fill="currentColor" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>`),
    history: svg(`<circle cx="12" cy="12" r="8.5" ${S}/><path d="M12 7.5V12l3 2" ${S}/>`),
    plus: svg(`<path d="M12 5v14M5 12h14" ${S}/>`),
    close: svg(`<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" ${S}/>`),
    more: svg(`<circle cx="5.5" cy="12" r="1.6" ${F}/><circle cx="12" cy="12" r="1.6" ${F}/><circle cx="18.5" cy="12" r="1.6" ${F}/>`),
    heart: svg(`<path d="${HEART}" ${S}/>`),
    heartFilled: svg(`<path d="${HEART}" fill="currentColor" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"/>`),
    download: svg(`<path d="M12 4v11M7 10.5l5 5 5-5M5 20h14" ${S}/>`),
    play: svg(`<path d="M8 5.5v13l10.5-6.5z" ${F}/>`),
    pause: svg(`<rect x="6.5" y="5" width="4" height="14" rx="1.2" ${F}/><rect x="13.5" y="5" width="4" height="14" rx="1.2" ${F}/>`),
    volume: svg(`<path d="M11 5.5L6.5 9H3.5v6h3l4.5 3.5z" ${S}/><path d="M15.5 9a4.5 4.5 0 0 1 0 6M18.5 6a8.5 8.5 0 0 1 0 12" ${S}/>`),
    mute: svg(`<path d="M11 5.5L6.5 9H3.5v6h3l4.5 3.5z" ${S}/><path d="M16 9.5l5 5M21 9.5l-5 5" ${S}/>`),
    fullscreen: svg(`<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" ${S}/>`),
    exitFullscreen: svg(`<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" ${S}/>`),
    popout: svg(`<path d="M14 4h6v6M20 4l-8.5 8.5M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" ${S}/>`),
    globe: svg(`<circle cx="12" cy="12" r="8.5" ${S}/><path d="M3.5 12h17M12 3.5c2.5 2.5 3.5 5.3 3.5 8.5s-1 6-3.5 8.5c-2.5-2.5-3.5-5.3-3.5-8.5s1-6 3.5-8.5z" ${S}/>`),
    film: svg(`<rect x="3" y="5" width="18" height="14" rx="3.5" ${S}/><path d="M10 9.2v5.6l4.6-2.8z" ${F}/>`),
    image: svg(`<rect x="3" y="4.5" width="18" height="15" rx="3" ${S}/><circle cx="9" cy="10" r="1.8" ${S}/><path d="M21 16l-5-5-8.5 8.5" ${S}/>`),
    music: svg(`<path d="M9 17.5V6l10-2v11.5" ${S}/><circle cx="6.5" cy="17.5" r="2.5" ${F}/><circle cx="16.5" cy="15.5" r="2.5" ${F}/>`),
    user: svg(`<circle cx="12" cy="8" r="3.8" ${S}/><path d="M4.5 20a7.5 7.5 0 0 1 15 0" ${S}/>`),
    moon: svg(`<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" ${F}/>`),
    sun: svg(`<circle cx="12" cy="12" r="4.5" ${F}/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" ${S}/>`),
    wifi: svg(`<path d="M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.8 16a5 5 0 0 1 6.4 0" ${S}/><circle cx="12" cy="19.2" r="1.2" ${F}/>`),
    mail: svg(`<rect x="3" y="5" width="18" height="14" rx="3" ${S}/><path d="M3.5 7l8.5 6 8.5-6" ${S}/>`),
    gamepad: svg(`<path d="M6 11h4M8 9v4M15 12h.01M18 10h.01" ${S}/><path d="M17.3 5H6.7a4 4 0 0 0-4 3.6L2 15.3A2.8 2.8 0 0 0 4.8 18.5c.9 0 1.7-.4 2.2-1.1L8.5 15h7l1.5 2.4c.5.7 1.3 1.1 2.2 1.1a2.8 2.8 0 0 0 2.8-3.2l-.7-6.7A4 4 0 0 0 17.3 5z" ${S}/>`),
    info: svg(`<circle cx="12" cy="12" r="8.5" ${S}/><path d="M12 11v5.5" ${S}/><circle cx="12" cy="7.8" r="1.2" ${F}/>`),
    grid: svg(`<rect x="4" y="4" width="6.5" height="6.5" rx="2" ${S}/><rect x="13.5" y="4" width="6.5" height="6.5" rx="2" ${S}/><rect x="4" y="13.5" width="6.5" height="6.5" rx="2" ${S}/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" ${S}/>`),
    search: svg(`<circle cx="11" cy="11" r="6.5" ${S}/><path d="M20 20l-4.2-4.2" ${S}/>`),
    chevronLeft: svg(`<path d="M15 18l-6-6 6-6" ${S}/>`),
    chevronRight: svg(`<path d="M9 18l6-6-6-6" ${S}/>`),
  };

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /** Build one element from an HTML string. */
  const h = html => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };

  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked */ } },
  };

  let toastTimer;
  function toast(msg, kind = "") {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.className = "toast show " + kind;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = "toast " + kind; }, 2600);
  }

  const gameById = id => SITE.games.find(g => g.id === id);
  const fmtTime = s => (!isFinite(s) || s < 0) ? "0:00" : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const fmtCount = n => n.toLocaleString("en-US");

  /** App tile markup. Size comes from the --ts CSS variable of the context. */
  function tile(kind) {
    if (kind.startsWith("game:")) {
      const g = gameById(kind.slice(5));
      return `<span class="tile tile--img"><img src="${esc(g.icon)}" alt="" draggable="false"></span>`;
    }
    switch (kind) {
      case "browser": return `<span class="tile tile--primary">${ICON.globe}</span>`;
      case "trailers": return `<span class="tile tile--soft">${ICON.film}</span>`;
      case "art": return `<span class="tile tile--base tile--art"><i></i><i></i><i></i><i></i></span>`;
      case "music": return `<span class="tile tile--soft tile--music">${ICON.music}<span class="eq"><i></i><i></i><i></i></span></span>`;
      case "profile": return `<span class="tile tile--primary">${ICON.user}</span>`;
      case "about":
        return SITE.owner.photo
          ? `<span class="tile tile--img"><img src="${esc(SITE.owner.photo)}" alt="" draggable="false"></span>`
          : `<span class="tile tile--soft tile--mono">${esc(SITE.owner.monogram)}</span>`;
      case "theme": return `<span class="tile tile--theme"><span class="t-moon">${ICON.moon}</span><span class="t-sun">${ICON.sun}</span></span>`;
      default: return `<span class="tile tile--soft"></span>`;
    }
  }

  /** Window controls (close / minimize / maximize). */
  const WC = `<div class="wc">
    <button type="button" class="wc-btn wc-close" data-wc="close" title="Close" aria-label="Close window"></button>
    <button type="button" class="wc-btn wc-min" data-wc="min" title="Minimize" aria-label="Minimize window"></button>
    <button type="button" class="wc-btn wc-max" data-wc="max" title="Maximize" aria-label="Maximize window"></button>
  </div>`;

  window.UI = { ICON, esc, h, store, toast, gameById, fmtTime, fmtCount, tile, WC };
})();
