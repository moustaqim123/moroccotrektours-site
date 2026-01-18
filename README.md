Image Gallery Project

Overview
- Drop images into the `images/` folder (or `public/images/` when using the Node server).
- The gallery at `index.html` will load images automatically.
- Works with a Node API (`/api/images`) if you run the server, or with a static `images.json` file.

Files
- index.html — gallery container and lightbox markup.
- css/styles.css — gallery layout, captions, lightbox styles.
- js/main.js — client script: fetches `/api/images` then falls back to `images.json`, renders captions, provides lightbox, sort, and polling watch mode.
- server.js — optional Express server (serves `public` or project root and exposes `GET /api/images`).
- package.json — includes `start` and `generate-images` scripts.
- tools/generate-images-json.js — Node script that writes `images.json` based on files in `images/` or `public/images/`.
- tools/watch-images.js — Node watcher that generates and continuously updates `images.json` on changes (preferred for development).

Run with Node (recommended)
1. Install dependencies:

```bash
npm install
```

2. Start server:

```bash
npm start
```

3. Open http://localhost:3000 in a browser.

Notes:
- The server reads the `images/` folder (or `public/images/` if present) on each `/api/images` request, so adding images updates the gallery immediately.
- The client also polls periodically (5s) so changes are reflected soon after adding files.

Advanced features
- Live reload: server notifies connected browsers when `images.json` changes (Socket.IO).
- Thumbnails: `tools/watch-images.js` generates JPEG thumbnails under `images/thumbs/` for faster loading.
- Metadata: generated `images.json` contains `width`, `height`, `size`, and `type` for each image.

Notes on installation
- `sharp` (used to generate thumbnails) includes native bindings. On most systems `npm install` will fetch prebuilt binaries. On some Windows setups you may need additional build tools — see https://sharp.pixelplumbing.com/install for guidance.

Development workflow (recommended)

1. In one terminal run the watcher (generates thumbnails and images.json automatically):

```bash
npm run watch-images
```

2. In another terminal start the server:

```bash
npm start
```

Now open `http://localhost:3000`. The browser will receive live-reload events when `images.json` updates and refresh the gallery automatically.

Features
- Automatic discovery of images (recursive) and live updates.
- Lightbox with keyboard navigation (Left/Right arrows) and Esc to close.
- Captions under thumbnails (filename without extension).
- Preloads nearby images for fast navigation.
- Sorting: Name, Date, Random via the dropdown.

Static-only usage (no Node)
1. Place image files into the `images/` folder.
2. Generate `images.json` with the Node generator or PowerShell script in `tools/` (or run the watcher to auto-update):

```bash
# generate once (static)
node tools/generate-images-json.js

# run watcher (preferred during development, regenerates automatically)
npm run watch-images
```

3. Serve the folder via any static server (or open `index.html` locally; some browsers block `fetch()` from file:// so use a tiny static server).

Questions / Next steps
If you'd like, I can also add:
- Auto-run `tools/generate-images-json.js` on file change (watch mode for static setups).
- Arrow key thumbnails overlay, swipe support for touch, or keyboard controls for thumbnails list.
