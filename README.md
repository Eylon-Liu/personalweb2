# LifeMap — Eylon Liu's personal website

An editorial-atlas personal site: interactive world map of cities lived and traveled,
work projects, life chapters, and photography.

## Run locally
Just open `index.html` in a browser (it's fully self-contained — React/Babel load from CDN).

## Editing
Source lives in the `.jsx` files + `LifeMap.html`; `index.html` is the bundled
single-file build of those. To work on the source version, serve the folder
(`python3 -m http.server`) and open `LifeMap.html`.

## Photos
Images live in `images/` and are wired in `app.jsx` (`PHOTOS`, `CHAPTERS`, hero avatar).
