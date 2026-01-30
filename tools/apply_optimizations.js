const fs = require('fs');
const path = require('path');

const rootDir = __dirname + '/../'; // Up one level from tools/

// Links to inject (in order)
const cssLinks = [
    {
        file: 'css/logo-entrance.css',
        tag: '<link rel="stylesheet" href="css/logo-entrance.css">',
        comment: '<!-- Logo Entrance Animation -->'
    },
    {
        file: 'css/mobile-fixes.css',
        tag: '<link rel="stylesheet" href="css/mobile-fixes.css">',
        comment: '<!-- Mobile Optimizations -->'
    }
];

const targetMarker = '<link rel="stylesheet" href="css/styles.css">';

// Recursive function to find HTML files
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'tools') {
                findHtmlFiles(filePath, fileList);
            }
        } else {
            if (path.extname(file) === '.html') {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

const htmlFiles = findHtmlFiles(rootDir);
let updatedCount = 0;

console.log(`Scanning ${htmlFiles.length} HTML files...`);

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;
    let modified = false;

    if (!content.includes(targetMarker)) {
        console.warn(`Skipping ${path.basename(file)}: 'css/styles.css' link not found.`);
        return;
    }

    // We insert after styles.css. 
    // We want the order: styles.css -> logo-entrance -> mobile-fixes

    // Check and Insert Logo Entrance
    if (!content.includes(cssLinks[0].file)) {
        const insertion = `\n    ${cssLinks[0].comment}\n    ${cssLinks[0].tag}`;
        content = content.replace(targetMarker, targetMarker + insertion);
        modified = true;
    }

    // Refresh content for next check to find the correct insertion point if needed,
    // but actually we can just append after the *new* last css or just after styles.css if we iterate carefuly.
    // Simplest approach: Replace the target marker (which might be followed by other stuff now) is risky if we just did a replace.
    // Better: We replaced content. Now 'targetMarker' is still there, but followed by logo-entrance.

    // Check and Insert Mobile Fixes
    if (!content.includes(cssLinks[1].file)) {
        // Find the "last" CSS link we know of, or default to styles.css
        let relativeMarker = targetMarker;
        if (content.includes(cssLinks[0].file)) {
            relativeMarker = cssLinks[0].tag;
        }

        const insertion = `\n    ${cssLinks[1].comment}\n    ${cssLinks[1].tag}`;
        content = content.replace(relativeMarker, relativeMarker + insertion);
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${path.basename(file)}`);
        updatedCount++;
    }
});

console.log(`\nOperation complete. Updated ${updatedCount} files.`);
