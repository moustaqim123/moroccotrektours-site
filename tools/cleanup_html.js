const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const files = fs.readdirSync(rootDir).filter(file => file.endsWith('.html'));

const newHeadContent = `
    <link rel="icon" type="image/png" href="images/assets/icon-square.png">
    <link rel="apple-touch-icon" href="images/assets/icon-square.png">

    <meta property="og:title" content="Morocco Trek Tours">
    <meta property="og:description" content="Gateway To Authentic Adventures">
    <meta property="og:image" content="images/assets/icon-square.png">
`;

files.forEach(file => {
    const filePath = path.join(rootDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // 1. Clean HEAD
    // Remove existing favicons/icons
    content = content.replace(/<link[^>]*rel=["'](icon|apple-touch-icon|shortcut icon)["'][^>]*>/gi, '');
    // Remove existing OG tags
    content = content.replace(/<meta[^>]*property=["']og:(title|description|image)["'][^>]*>/gi, '');

    // Inject new head content before </head>
    if (content.includes('</head>')) {
        content = content.replace('</head>', `${newHeadContent}\n</head>`);
    }

    // 2. Global Replacements
    // Logo and Icon paths
    content = content.replace(/images\/assets\/logo\.png/g, 'images/assets/logo-horizontal.png');
    // Also catch bare filenames if they are used
    content = content.replace(/(?<=src=["']|url\(['"]?)logo\.png/g, 'images/assets/logo-horizontal.png');
    content = content.replace(/images\/assets\/logo_profile\.png/g, 'images/assets/icon-square.png');
    content = content.replace(/(?<=src=["']|url\(['"]?)logo_profile\.png/g, 'images/assets/icon-square.png');

    // Remove references to other deleted assets
    content = content.replace(/images\/assets\/(cheich_icon\.jpg|favicon\.svg|logo_icon\.svg|logo_icon_vector\.svg|team4b\.jpg)/g, '');

    // 3. CSS Classes & Structure
    if (content.includes('class="logo"') && !content.includes('logo-container')) {
        content = content.replace('class="logo"', 'class="logo logo-container"');
    }
    // Remove logo-img class but keep the tag clean
    content = content.replace(/class=["']logo-img["']/g, '');

    // 4. File-Specific Cleaning
    if (file.startsWith('about')) {
        const teamStart = content.search(/<!-- Team Section -->|<section[^>]*>[^]*?Meet Our Guides/i);
        if (teamStart !== -1) {
            const remaining = content.substring(teamStart);
            const sectionEndMatch = remaining.match(/<\/section>/i);
            if (sectionEndMatch) {
                const totalEnd = teamStart + sectionEndMatch.index + 10;
                content = content.substring(0, teamStart) + content.substring(totalEnd);
                console.log(`Removed Team Section from ${file}`);
            }
        }
    }

    if (file.startsWith('contact')) {
        content = content.replace(/images\/team4\.jpg/g, 'images/hero/hero_home.jpg');
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
});
console.log('HTML cleanup complete.');
