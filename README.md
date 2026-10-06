# Destiny Gardens

Vanilla HTML/CSS/JS site. No build step. Serve the folder with any static server (e.g. `python3 -m http.server`).

- `data/` holds editable content: `site.js`, `services.js`, `events.js`, `gallery.js`.
- Add real photos and videos under `assets/` and point the paths in `data/` at them. Missing files show a colour block, not a broken image.
- After changing cached files, bump `V` in `sw.js`.
