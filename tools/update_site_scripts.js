const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\user\\.gemini\\antigravity\\playground\\tensor-coronal';

function getAllHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                getAllHtmlFiles(filePath, fileList);
            }
        } else {
            if (path.extname(file) === '.html') {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

const htmlFiles = getAllHtmlFiles(rootDir);

htmlFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    const newScripts = `    <script src="js/main.js"></script>
    <script src="js/french-translator.js"></script>
</body>`;

    // Skip if already has translated script
    if (content.includes('js/french-translator.js')) {
        console.log(`Skipping ${path.basename(filePath)}: already updated.`);
        return;
    }

    // List of old scripts to remove
    const scriptsToRemove = [
        /<script src="js\/i18n\.js"><\/script>\s*/g,
        /<script src="js\/language-filter\.js"><\/script>\s*/g,
        /<script src="js\/auto-translate\.js"><\/script>\s*/g,
        /<script src="js\/main\.js"><\/script>\s*/g // Remove main.js to re-insert correctly
    ];

    scriptsToRemove.forEach(regex => {
        if (regex.test(content)) {
            content = content.replace(regex, '');
            updated = true;
        }
    });

    // Inject before </body>
    if (content.includes('</body>')) {
        content = content.replace('</body>', `    <script src="js/main.js"></script>
    <script src="js/french-translator.js"></script>
</body>`);
        updated = true;
    } else if (content.includes('</html>')) { // Fallback for malformed
        content = content.replace('</html>', `    <script src="js/main.js"></script>
    <script src="js/french-translator.js"></script>
</html>`);
        updated = true;
    }

    if (updated) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated scripts in ${path.basename(filePath)}`);
    }
});
