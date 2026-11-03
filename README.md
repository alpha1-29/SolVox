# SolVox Companion

Companion app for SolVox solar hearing aids. Plain HTML, CSS and JavaScript. No build step, works offline.

## Files

| File | What it does |
|---|---|
| `index.html` | Page structure |
| `css/styles.css` | Layout, components and the default Solar Gold look |
| `css/looks.css` | Colour packs, card styles, corner shapes, high contrast |
| `js/app.js` | All app logic (audio, Bluetooth, transcriber, find my device) |
| `sw.js` | Offline support. Change `CACHE` to `solvox-v4` after every update |
| `manifest.webmanifest` | Lets phones install it as an app |

## Deploy on GitHub Pages

1. Put all these files at the root of your repository.
2. Repository Settings > Pages > Deploy from a branch > `main` > `/ (root)` > Save.
3. Open `https://YOUR-NAME.github.io/YOUR-REPO/` on the phone. GitHub Pages is https, which iPhone needs for microphone access.
4. Safari: Share > Add to Home Screen. Android Chrome: menu > Install app.

## Change the look

Open `css/looks.css`. Each look is two short blocks (light and dark). To add one, copy a block, rename `data-look="ocean"` to your name, and change the colours. Then add one line to the `LOOKS` list in `js/app.js` so it shows in Personalisation.

Core colours (change them in `css/styles.css` under `:root`): `--gold` accent, `--g1` and `--g2` button gradient, `--glow` accent as R,G,B, `--bg` page, `--card` cards.
