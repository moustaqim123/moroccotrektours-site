const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT_DIR = path.join(__dirname, '..');
const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
    const filePath = path.join(ROOT_DIR, file);
    let content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content);
    let changed = false;

    // 1. Standardize Language Switcher Links
    const cleanName = file.replace('-fr.html', '').replace('.html', '');
    const enFile = cleanName + '.html';
    const frFile = cleanName + '-fr.html';

    $('.lang-dropdown a').each((i, el) => {
        const $el = $(el);
        const text = $el.text().trim();
        if (text === 'English') {
            if ($el.attr('href') !== enFile) {
                $el.attr('href', enFile);
                changed = true;
            }
        } else if (text === 'Français') {
            if ($el.attr('href') !== frFile) {
                $el.attr('href', frFile);
                changed = true;
            }
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, $.html());
        console.log(`Updated ${file}`);
    }
});
