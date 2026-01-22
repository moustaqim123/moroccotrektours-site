const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/user/.gemini/antigravity/playground/tensor-coronal';

function restoreLogoStructure(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                restoreLogoStructure(filePath);
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Pattern to match the current logo-text structure
            const logoTextPattern = /<div class="logo-text">\s*<span class="line">MOROCCO<\/span>\s*<span class="line">TREK<\/span>\s*<span class="logo-subtitle">Your Gateway to Authentic Adventures<\/span>\s*<\/div>/g;

            const newLogoStructure = `<div class="logo-text">
                    <div class="logo-title">
                        <span class="line">MOROCCO</span>
                        <span class="line"><span class="trek-word">TREK</span> TOURS</span>
                    </div>
                    <span class="logo-subtitle">Your Gateway to Authentic Adventures</span>
                </div>`;

            const updatedContent = content.replace(logoTextPattern, newLogoStructure);

            if (content !== updatedContent) {
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`Logo structure restored in: ${filePath}`);
            }
        }
    });
}

restoreLogoStructure(directoryPath);
console.log('Logo structure restoration complete!');
