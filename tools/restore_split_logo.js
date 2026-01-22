const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/user/.gemini/antigravity/playground/tensor-coronal';

function restoreSplitLogo(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                restoreSplitLogo(filePath);
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Pattern to match the single image logo I just implemented
            const largeImagePattern = /<a href="([^"]+)" class="logo">\s*<img src="images\/assets\/main_logo\.png" alt="Morocco Trek Tours" style="width: 300px; height: auto;" class="logo-img">\s*<\/a>/g;

            const updatedContent = content.replace(largeImagePattern, (match, href) => {
                return `<a href="${href}" class="logo">
                <img loading="lazy" src="images/assets/logo.png" alt="Morocco Trek Tours" class="logo-img">
                <div class="logo-text">
                    <span class="line">MOROCCO</span>
                    <span class="line">TREK</span>
                </div>
            </a>`;
            });

            if (content !== updatedContent) {
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`Restored split logo HTML in: ${filePath}`);
            }
        }
    });
}

restoreSplitLogo(directoryPath);
