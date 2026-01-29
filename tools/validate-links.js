const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT_DIR = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

const brokenLinks = [];
const missingAssets = [];

htmlFiles.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content);

    // Check links
    $('a[href]').each((i, el) => {
        const href = $(el).attr('href');
        if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('whatsapp:')) return;

        const targetPath = path.join(ROOT_DIR, href.split('#')[0]);
        if (!fs.existsSync(targetPath)) {
            brokenLinks.push({ file, href });
        }
    });

    // Check images
    $('img[src]').each((i, el) => {
        const src = $(el).attr('src');
        if (!src || src.startsWith('http') || src.startsWith('data:')) return;

        const targetPath = path.join(ROOT_DIR, src);
        if (!fs.existsSync(targetPath)) {
            missingAssets.push({ file, src, type: 'img' });
        }
    });

    // Check scripts
    $('script[src]').each((i, el) => {
        const src = $(el).attr('src');
        if (!src || src.startsWith('http')) return;

        const targetPath = path.join(ROOT_DIR, src);
        if (!fs.existsSync(targetPath)) {
            missingAssets.push({ file, src, type: 'script' });
        }
    });

    // Check CSS
    $('link[rel="stylesheet"]').each((i, el) => {
        const href = $(el).attr('href');
        if (!href || href.startsWith('http')) return;

        const targetPath = path.join(ROOT_DIR, href);
        if (!fs.existsSync(targetPath)) {
            missingAssets.push({ file, href, type: 'css' });
        }
    });
});

console.log('--- Broken Internal Links ---');
console.log(JSON.stringify(brokenLinks, null, 2));
console.log('\n--- Missing Assets ---');
console.log(JSON.stringify(missingAssets, null, 2));
