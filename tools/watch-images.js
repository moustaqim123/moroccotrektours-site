#!/usr/bin/env node
/**
 * Advanced image watcher
 * - Generates images.json with metadata
 * - Produces thumbnails under images/thumbs/
 * - Watches images/ recursively and regenerates JSON + thumbs on changes
 * - Uses chokidar and sharp for robust behavior
 */
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { exec } = require('child_process');
const chokidar = require('chokidar');
const sharp = require('sharp');
const mime = require('mime-types');

const ROOT = path.join(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'images', 'gallery');
const THUMBS_DIR = path.join(ROOT, 'images', 'thumbs', 'gallery');
const OUT_FILE = path.join(ROOT, 'images.json');
const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const DEBOUNCE_MS = 200;

function now() { return new Date().toISOString(); }

async function ensureDir(dir) { if (!fsSync.existsSync(dir)) await fs.mkdir(dir, { recursive: true }); }

async function walkImages(dir) {
  const items = [];
  async function walk(d) {
    let entries = [];
    try { entries = await fs.readdir(d, { withFileTypes: true }); } catch { return; }
    for (const ent of entries) {
      const full = path.join(d, ent.name);
      if (ent.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!ent.isFile()) continue;
      const ext = path.extname(ent.name).toLowerCase();
      if (!ALLOWED.has(ext)) continue;
      try {
        const stat = await fs.stat(full);
        items.push({ full, name: ent.name, mtime: stat.mtimeMs, size: stat.size });
      } catch (err) {
        console.warn(now(), 'Skipping unreadable file', full, err.message);
      }
    }
  }
  await walk(dir);
  return items;
}

async function generate() {
  try {
    await ensureDir(IMAGES_DIR);
    await ensureDir(THUMBS_DIR);

    const files = await walkImages(IMAGES_DIR);
    const out = [];

    for (const f of files) {
      const relFromGallery = path.relative(IMAGES_DIR, f.full).split(path.sep).join('/');
      const url = 'images/gallery/' + relFromGallery;

      // thumbnail path: images/thumbs/gallery/<relFromGallery>.jpg
      const thumbRelPath = 'images/thumbs/gallery/' + relFromGallery + '.jpg';
      const thumbFull = path.join(THUMBS_DIR, relFromGallery + '.jpg');
      const thumbDir = path.dirname(thumbFull);
      await ensureDir(thumbDir);

      let generateThumb = true;
      try {
        const tstat = await fs.stat(thumbFull);
        if (tstat.mtimeMs >= f.mtime) generateThumb = false;
      } catch { generateThumb = true; }

      if (generateThumb) {
        try {
          await sharp(f.full)
            .resize({ width: 600, withoutEnlargement: true })
            .jpeg({ quality: 82 })
            .toFile(thumbFull);
          console.log(now(), 'Wrote thumbnail', path.relative(ROOT, thumbFull));
        } catch (err) {
          console.error(now(), 'Thumbnail failed for', f.full, err.message);
        }
      }

      // metadata
      let width = null, height = null, format = null;
      try {
        const meta = await sharp(f.full).metadata();
        width = meta.width || null;
        height = meta.height || null;
        format = meta.format || path.extname(f.name).slice(1).toLowerCase();
      } catch (err) {
        format = path.extname(f.name).slice(1).toLowerCase();
      }

      out.push({
        name: f.name,
        url,
        thumb: thumbRelPath,
        mtime: f.mtime,
        width,
        height,
        size: f.size,
        type: mime.lookup(f.name) || format || ''
      });
    }

    out.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    await fs.writeFile(OUT_FILE, JSON.stringify(out, null, 2), 'utf8');
    console.log(now(), `Generated ${path.basename(OUT_FILE)} with ${out.length} entries`);

    if (process.env.WATCHER_GIT_COMMIT === 'true') {
      exec(`git add "${OUT_FILE}" && git commit -m "chore: update images.json"`, { cwd: ROOT }, (err, stdout, stderr) => {
        if (err) console.error(now(), 'Git commit failed:', stderr || err.message);
        else console.log(now(), 'Committed images.json to git');
      });
    }

    return out;
  } catch (err) {
    console.error(now(), 'Failed to generate images.json:', err);
    return [];
  }
}

let regen = null;
function scheduleGenerate() {
  if (regen) clearTimeout(regen);
  regen = setTimeout(async () => { await generate(); regen = null; }, DEBOUNCE_MS);
}

async function start() {
  await generate();

  try {
    const watcher = chokidar.watch(IMAGES_DIR, {
      ignored: /(^|[\/\\])\.DS_Store$/,
      persistent: true,
      ignoreInitial: true,
      depth: 10,
      awaitWriteFinish: { stabilityThreshold: 200, pollInterval: 100 }
    });

    watcher.on('all', (event, p) => {
      console.log(now(), 'Change detected (', event, ')', p);
      scheduleGenerate();
    });

    watcher.on('error', (err) => console.error(now(), 'Watcher error:', err));

    console.log(now(), 'Watching', IMAGES_DIR, 'for changes');
  } catch (err) {
    console.error(now(), 'Failed to start watcher, falling back to polling:', err.message);
    setInterval(() => { console.log(now(), 'Polling gallery folder...'); scheduleGenerate(); }, 5000);
  }
}

start();

process.on('SIGINT', () => { console.log('\nInterrupted, exiting.'); process.exit(0); });
