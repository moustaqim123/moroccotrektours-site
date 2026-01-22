const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/user/.gemini/antigravity/playground/tensor-coronal';

function finalRevertToOriginalLogo(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                finalRevertToOriginalLogo(filePath);
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Revert any SVG back to original logo.png
            const updatedContent = content.replace(/src="images\/assets\/logo_hq\.svg"/g, 'src="images/assets/logo.png"')
                .replace(/src="images\/assets\/logo_master\.svg"/g, 'src="images/assets/logo.png"');

            if (content !== updatedContent) {
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`Reverted logo to original PNG in: ${filePath}`);
            }
        }
    });
}

finalRevertToOriginalLogo(directoryPath);
