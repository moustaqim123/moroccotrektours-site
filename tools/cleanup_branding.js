const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

const minimalHeadTags = `
    <link rel="icon" type="image/png" href="images/assets/icon-brand.png">
    <link rel="apple-touch-icon" href="images/assets/icon-brand.png">

    <meta property="og:title" content="Morocco Trek Tours">
    <meta property="og:description" content="Gateway To Authentic Adventures">
    <meta property="og:image" content="images/assets/icon-brand.png">`;

function processHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Cleanup Head
    content = content.replace(/<head>([\s\S]*?)<\/head>/i, (match, headSearch) => {
        let head = headSearch;

        // Remove existing icon and og/twitter tags
        head = head.replace(/<link\s+[^>]*rel="(icon|apple-touch-icon|alternate|canonical)"[^>]*>/gi, '');
        head = head.replace(/<meta\s+[^>]*property="og:[^>]*"[^>]*>/gi, '');
        head = head.replace(/<meta\s+[^>]*name="(twitter:[^>]*|description)"[^>]*>/gi, '');

        // Remove any other branding related links if they are duplicates or extra
        // But keep preconnect, stylesheet, and basic meta like viewport/charset

        return `<head>${minimalHeadTags}${head}</head>`;
    });

    // Fix Logo HTML to match CSS (.logo-container img)
    // Find <a class="logo" ...> ... <img ...> ... </a>
    // We want to ensure <img> is wrapped in <div class="logo-container">
    content = content.replace(/(<a[^>]*class="logo"[^>]*>)([\s\S]*?)(<img[^>]*>)([\s\S]*?)(<\/a>)/gi, (match, aOpen, beforeImg, imgTag, afterImg, aClose) => {
        if (beforeImg.includes('logo-container') || afterImg.includes('logo-container')) {
            // Already has it, just ensure img doesn't have extra classes that might conflict?
            // User said "No filters. No object-fit. No extra styles." - mostly CSS concerns
            return match;
        }
        return `${aOpen}${beforeImg}<div class="logo-container">${imgTag}</div>${afterImg}${aClose}`;
    });

    // Update all logo variants to new name
    content = content.replace(/logo-horizontal\.png/g, 'logo-header.png');
    content = content.replace(/icon-square\.png/g, 'icon-brand.png');
    content = content.replace(/logo\.png/g, 'logo-header.png'); // Just in case

    // Remove any <img> tags using deleted filenames (assets other than the 2 allowed)
    // Actually we don't know what was deleted, but we know ONLY 2 are allowed.
    // So if any <img> points to images/assets/ something else, remove it.
    content = content.replace(/<img[^>]*src="images\/assets\/(?!logo-header\.png|icon-brand\.png)[^"]+"[^>]*>/gi, '');

    fs.writeFileSync(filePath, content);
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                walkDir(filePath);
            }
        } else if (file.endsWith('.html')) {
            processHtmlFile(filePath);
        }
    }
}

walkDir(rootDir);

// Also update cms-manifest.json
const manifestPath = path.join(rootDir, 'cms-manifest.json');
if (fs.existsSync(manifestPath)) {
    let manifest = fs.readFileSync(manifestPath, 'utf8');
    manifest = manifest.replace(/"images\/logo\.png"/g, '"images/assets/logo-header.png"');
    manifest = manifest.replace(/"images\/assets\/logo-horizontal\.png"/g, '"images/assets/logo-header.png"');
    manifest = manifest.replace(/"images\/assets\/icon-square\.png"/g, '"images/assets/icon-brand.png"');
    fs.writeFileSync(manifestPath, manifest);
}

console.log('Cleanup complete.');
