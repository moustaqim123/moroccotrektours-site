const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/user/.gemini/antigravity/playground/tensor-coronal';

function updateLogoInFiles(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                updateLogoInFiles(filePath);
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Pattern to match the current logo structure
            // Captures the href, the img src/alt, and the subtitle content
            const logoPattern = /<a href="([^"]+)" class="logo">\s*<img([^>]*)src="([^"]+)"([^>]*)alt="([^"]+)"([^>]*)class="logo-img">([\s\S]*?)<div class="logo-subtitle">([\s\S]*?)<\/div>\s*<\/a>/g;

            const updatedContent = content.replace(logoPattern, (match, href, beforeSrc, src, middle, alt, afterClass, padding, subtitle) => {
                // Ensure we don't double wrap if already updated (though unlikely)
                if (content.includes('class="logo-text"')) {
                    if (match.includes('class="logo-text"')) return match;
                }

                return `<a href="${href}" class="logo">
                <img${beforeSrc}src="${src}"${middle}alt="${alt}"${afterClass}class="logo-img">
                <div class="logo-text">
                    <div class="logo-title">
                        <span class="morocco">Morocco</span>
                        <div class="trek-tours">
                            <span class="trek">Trek</span>
                            <span class="tours">Tours</span>
                        </div>
                    </div>
                    <div class="logo-subtitle">${subtitle.trim()}</div>
                </div>
            </a>`;
            });

            if (content !== updatedContent) {
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`Updated logo in: ${filePath}`);
            }
        }
    });
}

updateLogoInFiles(directoryPath);
