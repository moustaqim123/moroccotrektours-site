const fs = require('fs');
const path = require('path');

const rootDir = __dirname + '/../'; // Up one level from tools/

// CSS to inject
const logoAnimationLink = '    <!-- Logo Entrance Animation -->\n    <link rel="stylesheet" href="css/logo-entrance.css">';
const targetMarker = '<link rel="stylesheet" href="css/styles.css">';

// Find all HTML files
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'tools') {
                findHtmlFiles(filePath, fileList);
            }
        } else {
            if (path.extname(file) === '.html') {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

const htmlFiles = findHtmlFiles(rootDir);
let updatedCount = 0;

console.log(`Found ${htmlFiles.length} HTML files.`);

htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Check if already applied
    if (content.includes('logo-entrance.css')) {
        console.log(`Skipping ${path.basename(file)} (already present)`);
        return;
    }

    // Inject after main styles
    if (content.includes(targetMarker)) {
        const newContent = content.replace(targetMarker, targetMarker + '\n' + logoAnimationLink);
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated ${path.basename(file)}`);
        updatedCount++;
    } else {
        console.warn(`Warning: Could not find insertion point in ${path.basename(file)}`);
    }
});

console.log(`\nOperation complete. Updated ${updatedCount} files.`);
