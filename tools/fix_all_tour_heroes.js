const fs = require('fs');
const path = require('path');

const dir = 'c:\\Users\\user\\.gemini\\antigravity\\playground\\tensor-coronal';
const files = fs.readdirSync(dir).filter(f => f.startsWith('tour-') && f.endsWith('.html'));

const styleBlock = `
    <style>
        /* Modern Hero Styling - Force Full Height & Fixed Background */
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
    </style>
`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove any existing "Modern Hero Styling" block to avoid duplicates
    content = content.replace(/<style>\s*\/\* Modern Hero Styling \*\/[\s\S]*?<\/style>/g, '');
    content = content.replace(/<style>\s*\/\* Modern Hero Styling - Force Full Height[\s\S]*?<\/style>/g, '');

    // Inject the new style block before </head>
    content = content.replace('</head>', styleBlock + '</head>');

    // Ensure mobile-fixes.css is present if missing
    if (!content.includes('mobile-fixes.css')) {
        content = content.replace('styles.css">', 'styles.css">\n    <link rel="stylesheet" href="css/mobile-fixes.css">');
    }

    fs.writeFileSync(filePath, content);
    console.log(`Successfully updated: ${file}`);
});
