/* =========================================================
   SITE CONFIG — edit this file to change your info, games and art.
   Paths are relative to app/index.html.
   ========================================================= */

window.SITE = {
  owner: {
    name: "Your Name",
    monogram: "YN",                 // shown when there's no photo
    role: "Game Developer & Artist",
    photo: "",                      // e.g. "assets/profile.jpg"
  },

  // Shown in the browser's (read-only) address bar.
  domain: "yourname.studio",

  greeting: {
    title: "hi, i'm",
    lines: ["welcome to my desktop", "double-click anything to explore"],
  },

  about: {
    headline: "Hi, I'm",
    sub: "Game developer & artist making cozy-dark worlds, spooky little heroes, and the art that brings them to life.",
    body: "I design, draw, and build games from first sketch to playable build. My favorite projects mix soft color with a little bit of dread — like the Grim series, where a tiny reaper tries very hard to be helpful.",
    facts: [
      ["Based in", "City, Country"],
      ["Currently", "Building Grim Soul Tales"],
      ["Open to", "Freelance & studio roles"],
    ],
    email: "hello@example.com",
    resume: "",                     // e.g. "assets/resume.pdf" — leave empty to hide the download
    skills: [
      { icon: "gamepad", title: "Game Development", text: "Unity & WebGL builds, gameplay systems, level design." },
      { icon: "image", title: "2D Art & Illustration", text: "Characters, environments, icons and UI for games." },
      { icon: "film", title: "Animation & VFX", text: "Sprite animation, juicy feedback and game feel." },
    ],
  },

  /*
    GAMES
    build:   path to a WebGL build's index.html (e.g. "games/grim-soul-tales/index.html").
             Leave "" while there's no build → the trailer plays fullscreen instead,
             and the Play button in Game Trailers shakes red.
    trailer: path to a video (e.g. "assets/trailers/grim-soul-tales.mp4"). "" = poster only.
    poster:  image shown behind/before the trailer. Defaults to the icon.
    likes:   starting (fake) like count. Visitor likes are stored in their own browser.
    info:    game info page content — leave null for the "coming soon" placeholder.
             { genre, platform, status, madeWith, description }
  */
  games: [
    {
      id: "grim-soul-tales",
      title: "Grim Soul Tales",
      icon: "assets/icons/grim-soul-tales.png",
      poster: "",
      trailer: "",
      build: "",
      description: "A tiny reaper, a big world, and a lot of lost souls to guide home. First look at combat and exploration.",
      tech: ["Unity 2D", "C#", "Adobe Photoshop"],
      likes: 8214,
      info: null,
    },
    {
      id: "grim-untold-stories",
      title: "Grim Untold Stories",
      icon: "assets/icons/grim-untold-stories.png",
      poster: "",
      trailer: "",
      build: "",
      description: "Short, spooky stories from the reaper's past — told one lantern at a time.",
      tech: ["Unity 2D", "C#", "Aseprite"],
      likes: 5120,
      info: null,
    },
    {
      id: "deadmans-garden",
      title: "Deadmans Garden",
      icon: "assets/icons/deadmans-garden.png",
      poster: "",
      trailer: "",
      build: "",
      description: "Grow strange plants in a graveyard that doesn't stay quiet after dark.",
      tech: ["Unity 2D", "C#", "Adobe Photoshop"],
      likes: 3307,
      info: null,
    },
  ],

  /*
    ART WORKS (phone-style gallery)
    src:    image or video path (e.g. "assets/art/lantern-keeper.webp"). "" = colored placeholder.
    type:   "image" | "video"
    album:  must match one of `albums`
    date:   "YYYY-MM" — used for the month headings
    colors: placeholder gradient while there's no src
  */
  art: {
    albums: ["Characters", "Environments", "Fan art", "Sketches"],
    items: [
      { title: "Grim Soul Tales — key art", album: "Characters", date: "2026-11", src: "assets/icons/grim-soul-tales.png" },
      { title: "Lantern Keeper", album: "Characters", date: "2026-11", colors: ["#FFF1C4", "#EDBE4E"] },
      { title: "Deadmans Garden — sprout", album: "Environments", date: "2026-11", src: "assets/icons/deadmans-garden.png" },
      { title: "Moth Library", album: "Environments", date: "2026-11", colors: ["#E9DAF7", "#A86CC1"] },
      { title: "Soft Graveyard", album: "Environments", date: "2026-11", colors: ["#F7E9A8", "#C9A2DE"] },
      { title: "Grim Untold Stories — cover", album: "Characters", date: "2026-11", src: "assets/icons/grim-untold-stories.png" },
      { title: "Walk cycle test", album: "Sketches", date: "2026-10", type: "video", colors: ["#FFF7D9", "#E3CCF5"] },
      { title: "Little Reaper doodles", album: "Sketches", date: "2026-10", colors: ["#C9A2DE", "#5A3270"] },
      { title: "Fan art — forest spirit", album: "Fan art", date: "2026-10", colors: ["#F6DD91", "#A86CC1"] },
      { title: "Night market", album: "Environments", date: "2026-10", colors: ["#2C2533", "#7B4E99"] },
      { title: "Color study", album: "Sketches", date: "2026-10", colors: ["#E9DAF7", "#B88BE0"] },
      { title: "Fan art — sunflower knight", album: "Fan art", date: "2026-10", colors: ["#FFE9A8", "#F2CF63"] },
    ],
  },

  // Song for the Music toggle (drop the file in assets/music/).
  music: { src: "assets/music/song.mp3" },
};
