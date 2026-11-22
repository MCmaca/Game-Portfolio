# Game builds

Put each Unity WebGL build in its own folder, e.g. `games/grim-soul-tales/index.html`,
then set `build: "games/grim-soul-tales/index.html"` for that game in `js/config.js`.

- With a build: clicking the game opens it in a browser tab, and Play in Game Trailers launches it.
- Without a build: a fullscreen trailer plays first, and Play shakes red.

Unity tips: build with Gzip compression (or Decompression Fallback) so it runs on
static hosts, and test with a local server (WebGL builds don't run from file://).
