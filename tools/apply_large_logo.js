const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/user/.gemini/antigravity/playground/tensor-coronal';

function updateLogoToLargeImage(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                updateLogoToLargeImage(filePath);
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Match the entire logo link structure
            const logoPattern = /<a href="([^"]+)" class="logo">([\s\S]*?)<\/a>/g;

            const updatedContent = content.replace(logoPattern, (match, href) => {
                return `<a href="${href}" class="logo">
                <img src="images/assets/main_logo.png" alt="Morocco Trek Tours" style="width: 300px; height: auto;" class="logo-img">
            </a>`;
            });

            if (content !== updatedContent) {
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`Large image logo applied to: ${filePath}`);
            }
        }
    });
}

updateLogoToLargeImage(directoryPath);
