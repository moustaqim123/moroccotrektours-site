const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/user/.gemini/antigravity/playground/tensor-coronal';

function updateLogoToCustom(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                updateLogoToCustom(filePath);
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Regex to match the logo link and its entire internal structure
            const logoPattern = /<a href="([^"]+)" class="logo">([\s\S]*?)<\/a>/g;

            const updatedContent = content.replace(logoPattern, (match, href) => {
                // If it already has the specfic line class, skip
                if (match.includes('class="line"')) return match;

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
                console.log(`Custom logo applied to: ${filePath}`);
            }
        }
    });
}

updateLogoToCustom(directoryPath);
