const fs = require('fs');
const path = require('path');

/**
 * Configuration
 */
const CONFIG = {
    rootDir: path.join(__dirname, '..'),
    scriptsToRemove: [
        'js/i18n.js',
        'js/language-filter.js',
        'js/auto-translate.js'
    ],
    scriptsToEnsure: [
        'js/main.js',
        'js/french-translator.js'
    ],
    ignoreDirs: [
        'node_modules',
        '.git',
        '.vscode',
        'dist',
        'build',
        'tools',
        'css',
        'images',
        'fonts'
    ]
};

/**
 * Walk directory recursively to find HTML files
 */
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!CONFIG.ignoreDirs.includes(file)) {
                findHtmlFiles(filePath, fileList);
            }
        } else {
            if (path.extname(file).toLowerCase() === '.html') {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

/**
 * Process a single HTML file
 */
function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Remove old legacy scripts
    CONFIG.scriptsToRemove.forEach(scriptName => {
        // Regex to match script tags with this src, handling varied whitespace/quotes
        // e.g. <script src="js/i18n.js"></script>
        const regex = new RegExp(`<script\\s+src=["']${scriptName.replace('.', '\\.')}["']\\s*><\\/script>\\s*`, 'gi');
        if (regex.test(content)) {
            content = content.replace(regex, '');
            modified = true;
            // console.log(`  - Removed ${scriptName}`);
        }
    });

    // 2. Ensure new scripts are present in correct order before </body>
    // We want main.js then french-translator.js

    // First, check if they exist anywhere
    const hasMain = /<script\s+src=["']js\/main\.js["']/.test(content);
    const hasTranslator = /<script\s+src=["']js\/french-translator\.js["']/.test(content);

    if (!hasTranslator) {
        // We need to inject.
        // If main.js is present, we might want to put translator after it.
        // If main.js is NOT present, we inject both.

        // Remove main.js if it exists to re-inject properly paired (optional, but cleaner)
        if (hasMain) {
            content = content.replace(/<script\s+src=["']js\/main\.js["']\s*><\/script>\s*/gi, '');
        }

        const newBlock = `    <script src="js/main.js"></script>\n    <script src="js/french-translator.js"></script>\n</body>`;

        if (content.includes('</body>')) {
            content = content.replace('</body>', newBlock);
        } else if (content.includes('</html>')) {
            content = content.replace('</html>', newBlock);
        } else {
            content += '\n' + newBlock;
        }

        modified = true;
        // console.log(`  - Injected translation scripts`);
    } else {
        // If translator exists, ensure order? 
        // For now, assume if it exists, it was likely placed correctly or we shouldn't touch it too much.
        // But let's check if main.js is missing but translator is there (rare).
        if (!hasMain) {
            // Inject main.js before french-translator.js
            content = content.replace(/<script\s+src=["']js\/french-translator\.js["']/, '<script src="js/main.js"></script>\n<script src="js/french-translator.js"');
            modified = true;
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

/**
 * Main execution
 */
function run() {
    console.log('Starting French Translation System Deployment...');
    console.log(`Searching in: ${CONFIG.rootDir}`);

    const htmlFiles = findHtmlFiles(CONFIG.rootDir);
    console.log(`Found ${htmlFiles.length} HTML files.`);

    let updatedCount = 0;

    htmlFiles.forEach(file => {
        const relativePath = path.relative(CONFIG.rootDir, file);
        try {
            const wasUpdated = processFile(file);
            if (wasUpdated) {
                console.log(`[UPDATED] ${relativePath}`);
                updatedCount++;
            } else {
                console.log(`[OK]      ${relativePath}`);
            }
        } catch (err) {
            console.error(`[ERROR]   Failed to process ${relativePath}: ${err.message}`);
        }
    });

    console.log('------------------------------------------------');
    console.log(`Deployment Complete.`);
    console.log(`Files Updated: ${updatedCount}`);
    console.log(`Total Scanned: ${htmlFiles.length}`);
    console.log('------------------------------------------------');
}

run();
