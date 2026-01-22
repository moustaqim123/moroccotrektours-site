const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/user/.gemini/antigravity/playground/tensor-coronal';

function addSubtitleToLogo(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                addSubtitleToLogo(filePath);
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Pattern to match the logo text container
            const logoTextPattern = /<div class="logo-text">([\s\S]*?)<\/div>/g;

            const updatedContent = content.replace(logoTextPattern, (match, inner) => {
                // Check if subtitle already exists
                if (inner.includes('logo-subtitle')) return match;

                return `<div class="logo-text">
                    ${inner.trim()}
                    <span class="logo-subtitle">Your Gateway to Authentic Adventures</span>
                </div>`;
            });

            if (content !== updatedContent) {
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`Subtitle added to: ${filePath}`);
            }
        }
    });
}

addSubtitleToLogo(directoryPath);
