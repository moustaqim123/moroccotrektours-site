const fs = require('fs');
const path = require('path');

const manifestPath = './cms-manifest.json';
const imagesDir = './images';

if (!fs.existsSync(manifestPath)) {
    console.error('Manifest not found');
    process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const missing = [];

function checkFile(filePath) {
    if (!filePath) return false;
    const fullPath = path.join('.', filePath);
    return fs.existsSync(fullPath);
}

// Audit images
if (manifest.images) {
    for (const [key, value] of Object.entries(manifest.images)) {
        if (!value || !checkFile(value)) {
            missing.push({ category: 'image', key, value });
        }
    }
}

// Audit backgrounds
if (manifest.backgrounds) {
    for (const [key, value] of Object.entries(manifest.backgrounds)) {
        if (!value || (!value.startsWith('http') && !checkFile(value))) {
            missing.push({ category: 'background', key, value });
        }
    }
}

console.log(JSON.stringify(missing, null, 2));
