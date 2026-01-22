const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/user/.gemini/antigravity/playground/tensor-coronal';

function updateToVectorIcon(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                updateToVectorIcon(filePath);
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Replace old logo.png with high-quality vector SVG
            const updatedContent = content.replace(/src="images\/assets\/logo\.png"/g, 'src="images/assets/logo_icon_vector.svg"');

            if (content !== updatedContent) {
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`Vector icon applied to: ${filePath}`);
            }
        }
    });
}

updateToVectorIcon(directoryPath);
