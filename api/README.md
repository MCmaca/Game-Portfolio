# api/ (reserved)

Nothing here yet. Likes and favorites currently live only in each visitor's
browser (localStorage), so every visitor sees the starting counts from
`app/js/config.js` plus their own like.

When a backend is chosen (shared like counts, comments, analytics, …),
put it in this folder. The places that would call it are:

- `app/js/trailers.js` → `setLiked()` / the like button handler
- `app/js/gallery.js`  → `toggleFav()`
