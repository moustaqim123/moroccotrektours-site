const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/user/.gemini/antigravity/playground/tensor-coronal';

function revertToPreviousLogo(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                revertToPreviousLogo(filePath);
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Revert vector SVG back to original PNG
            const updatedContent = content.replace(/src="images\/assets\/logo_icon_vector\.svg"/g, 'src="images/assets/logo.png"');

            if (content !== updatedContent) {
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`Reverted logo to PNG in: ${filePath}`);
            }
        }
    });
}

revertToPreviousLogo(directoryPath);
