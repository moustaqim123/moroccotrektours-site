const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../');

// Get all files
const files = fs.readdirSync(rootDir).filter(f => f.startsWith('tour-') && f.endsWith('.html'));
const pairs = {};

// Group
files.forEach(file => {
    let baseName = file.replace('-fr.html', '').replace('.html', '');
    if (file === 'tour-10-days.html') baseName = 'tour-10-days';
    if (file === 'tour-10-jours.html') baseName = 'tour-10-days';

    if (!pairs[baseName]) pairs[baseName] = { en: null, fr: null };

    if (file.endsWith('-fr.html') || file === 'tour-10-jours.html') {
        pairs[baseName].fr = file;
    } else {
        pairs[baseName].en = file;
    }
});

Object.keys(pairs).forEach(key => {
    const p = pairs[key];
    if (p.en && p.fr) {
        const enPath = path.join(rootDir, p.en);
        const frPath = path.join(rootDir, p.fr);

        let enContent = fs.readFileSync(enPath, 'utf8');
        let frContent = fs.readFileSync(frPath, 'utf8');

        // Extract English Image URL
        const imgMatch = enContent.match(/background-image:\s*url\(['"]?([^'"\)]+)['"]?\)/);

        if (imgMatch && imgMatch[1]) {
            const validUrl = imgMatch[1];

            // Find the French header line to replace/update
            // We look for <header class="tour-hero" ... >

            // Regex to find the opening header tag up to the closing >
            // It might cover multiple lines.
            const frHeaderRegex = /<header[^>]*class=["']tour-hero["'][^>]*>/s;
            const frMatch = frContent.match(frHeaderRegex);

            if (frMatch) {
                let frHeaderTag = frMatch[0];

                // Does it already have the correct image?
                if (!frHeaderTag.includes(validUrl)) {
                    console.log(`Fixing image for ${p.fr} -> ${validUrl}`);

                    // Replace existing background-image or add it
                    if (frHeaderTag.includes('background-image:')) {
                        frHeaderTag = frHeaderTag.replace(/background-image:\s*url\(['"]?[^'"\)]+['"]?\)/, `background-image: url('${validUrl}')`);
                    } else {
                        // If style exists but no bg image
                        if (frHeaderTag.includes('style="')) {
                            frHeaderTag = frHeaderTag.replace('style="', `style="background-image: url('${validUrl}'); `);
                        } else {
                            // No style attribute
                            frHeaderTag = frHeaderTag.replace('class="tour-hero"', `class="tour-hero" style="background-image: url('${validUrl}');"`);
                        }
                    }

                    // Replace the tag in the content
                    frContent = frContent.replace(frMatch[0], frHeaderTag);
                    fs.writeFileSync(frPath, frContent, 'utf8');
                } else {
                    // console.log(`Image match for ${p.fr} (Good)`);
                }
            }
        }
    }
});
