const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '../');

const linksToInject = [
    {
        comment: '<!-- Logo Entrance Animation -->',
        tag: '<link rel="stylesheet" href="css/logo-entrance.css">',
        checkText: 'css/logo-entrance.css'
    },
    {
        comment: '<!-- Mobile Optimizations -->',
        tag: '<link rel="stylesheet" href="css/mobile-fixes.css">',
        checkText: 'css/mobile-fixes.css'
    }
];

const targetMarker = 'css/styles.css';

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let modified = false;

    // We rely on Finding the main stylesheet to place ours after it.
    // However, some files might define it differently. We look for the line containing styles.css
    const styleIndex = content.indexOf(targetMarker);

    if (styleIndex === -1) {
        // Fallback: Try looking for </head>
        // console.log(`Skipping ${path.basename(filePath)} (no styles.css marker)`);
        return;
    }

    // Find the end of the line where styles.css is defined
    let insertionPoint = content.indexOf('>', styleIndex) + 1;

    linksToInject.forEach(linkObj => {
        if (!content.includes(linkObj.checkText)) {
            const insertion = `\n    ${linkObj.comment}\n    ${linkObj.tag}`;
            // safe insert
            content = content.slice(0, insertionPoint) + insertion + content.slice(insertionPoint);
            // Move insertion point forward so next link comes after this one
            insertionPoint += insertion.length;
            modified = true;
        }
    });

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${path.basename(filePath)}`);
    }
}

// Walk function
function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'tools') {
                walkDir(fullPath);
            }
        } else {
            if (path.extname(file) === '.html') {
                processFile(fullPath);
            }
        }
    });
}

console.log("Starting Injection...");
walkDir(rootDir);
console.log("Injection Complete.");
