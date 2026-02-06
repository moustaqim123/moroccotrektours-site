const fs = require('fs');
const path = require('path');

const directoryPath = 'c:\\Users\\user\\.gemini\\antigravity\\playground\\tensor-coronal';
const files = fs.readdirSync(directoryPath);

files.forEach(file => {
    if (file.startsWith('tour-') && file.endsWith('.html') && file !== 'tour-template.html') {
        const filePath = path.join(directoryPath, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // 1. Add mobile-fixes.css if missing
        if (!content.includes('css/mobile-fixes.css')) {
            content = content.replace('css/styles.css">', 'css/styles.css">\n    <link rel="stylesheet" href="css/mobile-fixes.css">');
        }

        // 2. Add internal style block for consistency
        if (!content.includes('/* Modern Hero Styling */')) {
            const styleBlock = `
    <style>
        /* Modern Hero Styling */
        .tour-hero {
            height: 100vh !important;
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
            background-attachment: fixed !important;
            margin-top: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            position: relative !important;
        }

        @media (max-width: 768px) {
            .tour-hero {
                background-attachment: scroll !important;
                height: 60vh !important;
            }
        }
    </style>\n`;
            content = content.replace('</head>', styleBlock + '</head>');
        }

        // 4. Ensure margin-top 0 on the header tag itself if any
        // (The CSS above covers it with !important)

        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
});
