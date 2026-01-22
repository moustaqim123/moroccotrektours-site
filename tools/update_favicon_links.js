const fs = require('fs');
const path = require('path');

const directoryPath = 'c:/Users/user/.gemini/antigravity/playground/tensor-coronal';

function updateAssets(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git') {
                updateAssets(filePath);
            }
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(filePath, 'utf8');

            // Update Favicon Link
            const updatedContent = content.replace(/href="images\/assets\/logo_icon\.svg"/g, 'href="images/assets/favicon.svg"');

            if (content !== updatedContent) {
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                console.log(`Updated assets in: ${filePath}`);
            }
        }
    });
}

updateAssets(directoryPath);
