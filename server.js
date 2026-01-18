const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Serve static from ./public if it exists, otherwise from project root
const publicDir = fsSync.existsSync(path.join(__dirname, 'public')) ? path.join(__dirname, 'public') : __dirname;
app.use(express.static(publicDir));

// Helper to resolve images directory (prefer public/images)
function imagesDirPath() {
  const publicImages = path.join(__dirname, 'public', 'images');
  const rootImages = path.join(__dirname, 'images');
  if (fsSync.existsSync(publicImages)) return publicImages;
  if (fsSync.existsSync(rootImages)) return rootImages;
  return null;
}

app.get('/api/images', async (req, res) => {
  try {
    const manifestPath = path.join(__dirname, 'images.json');
    if (fsSync.existsSync(manifestPath)) {
      const raw = await fs.readFile(manifestPath, 'utf8');
      return res.json(JSON.parse(raw));
    }

    // fallback: scan images dir as before
    const dir = imagesDirPath();
    if (!dir) return res.status(404).json({ error: 'images directory not found' });
    const exts = new Set(['.jpg','.jpeg','.png','.gif']);
    const out = [];

    async function walk(dirPath) {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      for (const ent of entries) {
        const full = path.join(dirPath, ent.name);
        if (ent.isDirectory()) {
          await walk(full);
          continue;
        }
        if (!ent.isFile()) continue;
        const ext = path.extname(ent.name).toLowerCase();
        if (!exts.has(ext)) continue;
        const stat = await fs.stat(full);
        let rel = path.relative(dir, full).split(path.sep).join('/');
        const urlPath = '/images/' + rel.split('/').map(encodeURIComponent).join('/');
        out.push({ name: ent.name, url: urlPath, mtime: stat.mtimeMs });
      }
    }
    await walk(dir);
    out.sort((a,b)=> a.name.localeCompare(b.name));
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to read images' });
  }
});

// Watch images.json and broadcast changes via Socket.IO for live-reload
const manifestPath = path.join(__dirname, 'images.json');
if (fsSync.existsSync(manifestPath)) {
  fsSync.watchFile(manifestPath, { interval: 1000 }, (curr, prev) => {
    if (curr.mtimeMs !== prev.mtimeMs) {
      io.emit('images-changed');
      console.log('images.json changed, emitted images-changed');
    }
  });
}

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
});

server.listen(PORT, ()=>{
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Static files served from: ${publicDir}`);
});
