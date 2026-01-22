const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/user/.gemini/antigravity/playground/tensor-coronal';

function updateToHQSVG(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                updateToHQSVG(filePath);
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Switch to high-quality SVG version for perfect clarity
            const updatedContent = content.replace(/src="images\/assets\/logo\.png"/g, 'src="images/assets/logo_hq.svg"');

            if (content !== updatedContent) {
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`Higher quality SVG logo applied to: ${filePath}`);
            }
        }
    });
}

updateToHQSVG(directoryPath);
