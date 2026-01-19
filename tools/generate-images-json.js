const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

(async function(){
  try{
    const imagesDir = fsSync.existsSync(path.join(__dirname, '..', 'public', 'images')) ? path.join(__dirname, '..', 'public', 'images') : path.join(__dirname, '..', 'images');
    if(!fsSync.existsSync(imagesDir)){
      console.error('Images directory not found:', imagesDir);
      process.exit(2);
    }
    const files = await fs.readdir(imagesDir, { withFileTypes: true });
    const exts = ['.jpg','.jpeg','.png','.svg','.gif','.webp'];
    const out = [];
    for(const f of files){
      if(!f.isFile()) continue;
      const ext = path.extname(f.name).toLowerCase();
      if(!exts.includes(ext)) continue;
      const full = path.join(imagesDir, f.name);
      const stat = await fs.stat(full);
      // If images are under public/images, URL should be /images/..., otherwise /images/...
      const url = '/images/' + encodeURIComponent(f.name);
      out.push({ name: f.name, url, mtime: stat.mtimeMs });
    }
    // default sort by name
    out.sort((a,b)=> a.name.localeCompare(b.name));
    await fs.writeFile(path.join(__dirname, '..', 'images.json'), JSON.stringify(out, null, 2), 'utf8');
    console.log('Wrote images.json with', out.length, 'entries');
  }catch(err){
    console.error('Failed to generate images.json', err);
    process.exit(1);
  }
})();
