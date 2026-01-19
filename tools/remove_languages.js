const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Lines to remove (trimmed)
const linesToRemove = [
    '<li><a href="#">Español</a></li>',
    '<li><a href="#">Deutsch</a></li>',
    '<li><a href="#">العربية</a></li>'
];

function cleanFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    const lines = content.split('\n');
    const newLines = lines.filter(line => {
        const trimmed = line.trim();
        return !linesToRemove.includes(trimmed);
    });

    if (lines.length !== newLines.length) {
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
        console.log(`Updated: ${path.basename(filePath)}`);
    }
}

fs.readdirSync(rootDir).forEach(file => {
    if (file.endsWith('.html')) {
        cleanFile(path.join(rootDir, file));
    }
});
