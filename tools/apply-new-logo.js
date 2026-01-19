const fs = require('fs');
const path = require('path');

const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const logoRegex = /<a href="index\.html" class="logo">[\s\S]*?<\/a>/g;

const newLogo = `<a href="index.html" class="logo">
                <div class="logo-icon">
                    <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                        <g transform="scale(1)">
                            <!-- Outer Arch -->
                            <path d="M 50 380 L 50 200 A 150 150 0 0 1 350 200 L 350 380" fill="none" stroke="#A67C00" stroke-width="20" stroke-linecap="round"/>
                            <!-- Mountains -->
                            <path d="M 50 380 L 160 220 L 270 380 Z" fill="#A67C00" />
                            <path d="M 200 380 L 310 240 L 420 380 Z" fill="#8B4513" opacity="0.8"/>
                            <!-- Compass Star -->
                            <g transform="translate(200, 180)">
                                <path d="M 0 -80 L 15 -15 L 80 0 L 15 15 L 0 80 L -15 15 L -80 0 L -15 -15 Z" fill="#F4A460" />
                                <path d="M 0 -95 L 12 -12 L 95 0 L 12 12 L 0 95 L -12 12 L -95 0 L -12 -12 Z" fill="#A67C00" />
                                <text x="0" y="-110" font-family="Arial, sans-serif" font-size="40" fill="#A67C00" text-anchor="middle" font-weight="900">N</text>
                                <text x="120" y="15" font-family="Arial, sans-serif" font-size="40" fill="#A67C00" text-anchor="middle" font-weight="900">E</text>
                                <text x="-120" y="15" font-family="Arial, sans-serif" font-size="40" fill="#A67C00" text-anchor="middle" font-weight="900">W</text>
                            </g>
                        </g>
                    </svg>
                </div>
                <div class="logo-text">
                    <div class="logo-brand">
                        <span class="brand-main">MOROCCO</span>
                        <span class="brand-sub">TOURS GATE</span>
                    </div>
                    <span class="logo-subtitle">Your Gateway to Authentic Adventures</span>
                </div>
            </a>`;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    if (logoRegex.test(content)) {
        content = content.replace(logoRegex, newLogo);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
});
