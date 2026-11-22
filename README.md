# Game & Art Portfolio — desktop site

A portfolio that opens as a little desktop: draggable windows, a browser with an
About Me page, a Game Trailers feed, an Art Works gallery, a Music toggle, and
your games. Plain HTML/CSS/JavaScript, no build step.

```
app/            ← the website (upload this folder to host it)
  index.html
  css/styles.css
  js/config.js  ← EDIT THIS: your name, about text, games, art, song
  js/*.js       ← desktop, windows, browser, trailers, gallery
  assets/       ← icons, art, trailers, music, cursors
  games/        ← Unity WebGL builds (one folder per game)
api/            ← reserved for a future backend (empty for now)
```

## Run it locally
Double-click `app/index.html`, or (needed once you add WebGL builds) serve the folder:
`npx serve app` or VS Code's Live Server.

## Adding your stuff
All in `app/js/config.js`:
- **Photo / name / about** → `owner`, `about`
- **Game trailer** → put the MP4 in `assets/trailers/`, set the game's `trailer`
- **Game build** → put the WebGL build in `games/<id>/`, set the game's `build`
- **Art** → put files in `assets/art/`, list them in `art.items`
- **Song** → `assets/music/song.mp3`

Likes and art favorites are stored in each visitor's own browser for now.

## Publish
Upload the `app/` folder to Netlify Drop, GitHub Pages, or itch.io (HTML project).
