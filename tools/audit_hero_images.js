const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../');

// Get all files matching tour-*.html
const files = fs.readdirSync(rootDir).filter(f => f.startsWith('tour-') && f.endsWith('.html'));

const pairs = {};

// Group by base name
files.forEach(file => {
    let baseName = file.replace('-fr.html', '').replace('.html', '');
    // Handle the specific case of 10-days vs 10-jours if standard logic fails, 
    // but the user's specific naming seems to be:
    // tour-10-days.html -> tour-10-jours.html? No, find_by_name showed `tour-10-days.html` and `tour-10-jours.html`.
    // I need to manually map these or just look for matches.

    // special handling for the known divergence
    if (file === 'tour-10-days.html') baseName = 'tour-10-days';
    if (file === 'tour-10-jours.html') baseName = 'tour-10-days'; // Map to same key

    if (!pairs[baseName]) {
        pairs[baseName] = { en: null, fr: null };
    }

    if (file.endsWith('-fr.html') || file === 'tour-10-jours.html') {
        pairs[baseName].fr = file;
    } else {
        pairs[baseName].en = file;
    }
});

function extractHeroImage(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8');

    // Regex to find background-image in tour-hero
    // Matches: class="tour-hero" ... style="background-image: url('...')"
    // Note: Attributes can be in any order.

    const heroRegex = /class=["']tour-hero["'][^>]*style=["']background-image:\s*url\(['"]([^'"]+)['"]\)/i;
    const match = content.match(heroRegex);

    if (match) return match[1];

    // Try simpler search if the above complex one fails due to attribute order
    // Just search for the line containing tour-hero and extract url
    const lines = content.split('\n');
    for (const line of lines) {
        if (line.includes('tour-hero') && line.includes('background-image')) {
            const urlMatch = line.match(/url\(['"]?([^'"\)]+)['"]?\)/);
            if (urlMatch) return urlMatch[1];
        }
    }

    return null;
}

console.log("Analyzing Hero Images...");

Object.keys(pairs).forEach(key => {
    const p = pairs[key];
    if (p.en && p.fr) {
        const imgEn = extractHeroImage(path.join(rootDir, p.en));
        const imgFr = extractHeroImage(path.join(rootDir, p.fr));

        console.log(`\nTour: ${key}`);
        console.log(`  EN (${p.en}): ${imgEn}`);
        console.log(`  FR (${p.fr}): ${imgFr}`);

        if (imgEn && imgFr && imgEn !== imgFr) {
            console.log(`  MISMATCH detected!`);
        }
        if (imgEn && !imgFr) {
            console.log(`  MISSING in French!`);
        }
    } else {
        // Singular files (like template)
        // console.log(`Skipping single file ${key}`);
    }
});
