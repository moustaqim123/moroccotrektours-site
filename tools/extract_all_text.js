const fs = require('fs');
const path = require('path');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));
const strings = new Set();

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Basic regex to find text inside common tags
    const regex = />\s*([^<>\n\r]+?)\s*</g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const text = match[1].trim();
        if (text && text.length > 1 && !text.includes('{') && !text.includes('}')) {
            strings.add(text);
        }
    }
});

fs.writeFileSync('all_strings.txt', Array.from(strings).join('\n'));
console.log(`Extracted ${strings.size} strings.`);
