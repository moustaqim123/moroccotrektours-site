const fs = require('fs');
const path = require('path');

// 1. Load Translations
const translations = require('../js/i18n.js');
const LANGUAGES = ['Français'];
const LANG_CODES = {
    'Français': 'fr'
};

const ROOT_DIR = path.join(__dirname, '..');
const IGNORE_DIRS = ['node_modules', '.git', 'tools', 'js', 'css', 'images', 'assets', 'audits', 'fr'];

// Ensure target directories exist
Object.values(LANG_CODES).forEach(code => {
    const dir = path.join(ROOT_DIR, code);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
});

// Helper: Escape Regex special characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper: Fix relative paths for assets (css, js, images)
// We need to prepend "../" to standard asset paths because we are moving 1 level down
function fixAssetPaths(html) {
    return html
        .replace(/(href|src)="css\//g, '$1="../css/')
        .replace(/(href|src)="js\//g, '$1="../js/')
        .replace(/(href|src)="images\//g, '$1="../images/')
        .replace(/(href|src)="assets\//g, '$1="../assets/');
}

// Helper: Update internal links? 
// If we have `href="about.html"`, in `/fr/` it resolves to `/fr/about.html` which is CORRECT.
// So we generally don't need to change navigation links unless they go to root.
// However, `href="index.html"` or `href="./"` might need care.
// Let's assume relative links are fine for sibling pages.

// 2. Process HTML files
fs.readdir(ROOT_DIR, (err, files) => {
    if (err) throw err;

    files.filter(f => f.endsWith('.html')).forEach(file => {
        const filePath = path.join(ROOT_DIR, file);
        const originalContent = fs.readFileSync(filePath, 'utf8');

        LANGUAGES.forEach(langName => {
            const langCode = LANG_CODES[langName];
            const dict = translations[langName];

            console.log(`Generating ${langCode}/${file}...`);

            let newContent = originalContent;

            // A. Update HTML tag
            const dir = (langCode === 'ar') ? 'rtl' : 'ltr';
            newContent = newContent.replace(/<html lang="en">/i, `<html lang="${langCode}" dir="${dir}">`);
            if (langCode === 'ar') {
                newContent = newContent.replace(/<html/i, '<html class="rtl-active"');
            }

            // B. Fix Paths
            newContent = fixAssetPaths(newContent);

            // C. Translate Text (Simple "Between Tags" Parser)
            // We search for >TEXT< and replace TEXT if it matches dictionary
            // This is safer than global replace

            // Regex to find text between > and <
            // Captures: > (Group 1: text) <
            newContent = newContent.replace(/>([^<]+)</g, (match, text) => {
                const trimmed = text.trim();
                // Skip empty or scripts (though script usually don't have < inside without tags)
                if (!trimmed) return match;

                // Check if we have exact translation
                if (dict[trimmed]) {
                    return `>${text.replace(trimmed, dict[trimmed])}<`;
                }

                // Check if we have translation for the clean single-line version (sometimes whitespace differs)
                // This is a naive check
                return match;
            });

            // DATA-I18N overrides (stronger match)
            // Regex: data-i18n="KEY" ... >DEFAULT<
            // or just replace based on attribute presence
            // We iterate strictly over data-i18n attributes
            newContent = newContent.replace(/data-i18n="([^"]+)"([^>]*)>([^<]*)<\//g, (match, key, attrs, content) => {
                if (dict[key]) {
                    return `data-i18n="${key}"${attrs}>${dict[key]}</`;
                }
                return match;
            });

            // Handle placeholders
            newContent = newContent.replace(/placeholder="([^"]+)"/g, (match, text) => {
                // Inverse lookup or check if text is a key? A bit hard.
                // Ideally we traverse keys and replace.
                // For now, let's skip placeholders unless we do global replacement.
                return match;
            });

            // GLOBAL REPLACEMENT Strategy (Fallback & Power)
            // Iterate over all keys in dictionary and replace unique occurrences
            // ONLY if they are long enough to be unique (to avoid replacing "Home" in "Hometown")
            // We'll wrap in word boundary if short? No, "Home" is short.
            // Let's rely on the >TEXT< replacement mostly. 
            // BUT: Some text is in attributes like alt="...".

            Object.keys(dict).forEach(sourceText => {
                const targetText = dict[sourceText];
                if (sourceText.length > 20) {
                    // Safe to replace globally for long sentences
                    newContent = newContent.split(sourceText).join(targetText);
                } else {
                    // Short text: careful replacement in attributes
                    // alt="sourceText"
                    // placeholder="sourceText"
                    // title="sourceText"
                    const attrs = ['alt', 'placeholder', 'title', 'content'];
                    attrs.forEach(attr => {
                        const re = new RegExp(`${attr}="${escapeRegExp(sourceText)}"`, 'g');
                        newContent = newContent.replace(re, `${attr}="${targetText}"`);
                    });

                    // Also meta content
                    // <meta name="description" content="...">
                }
            });

            // D. inject hreflang tags
            const hreflangs = `
    <link rel="alternate" hreflang="en" href="http://localhost:3000/${file}" />
    <link rel="alternate" hreflang="fr" href="http://localhost:3000/fr/${file}" />
            `;
            `;
            newContent = newContent.replace('</head>', `${hreflangs}\n</head>`);


            // E. Update Language Switcher Links
            // We need to find the specific "English", "Français" links and update their hrefs
            // Current HTML structure:
            // <a href="#" data-lang="En">English</a>
            // We want: <a href="/index.html">English</a>
            // <a href="#">Français</a> -> <a href="/fr/index.html">Français</a>

            // Determine relative path to root: "../"
            // So link to English: "../index.html" (or whatever current file is)
            // Link to French: "index.html" (if current is fr) - Actually all files in folders.

            // Since we are in `/fr/file.html`:
            // English: `../file.html`
            // French: `file.html` (active)
            // Spanish: `../es/file.html`

            const linkMap = {
                'English': `../${file}`,
                'Français': (langCode === 'fr') ? '#' : `../fr/${file}`
            };

            // Regex replace the links in the dropdown
            // Looking for <a href="#" ...>LANGUAGE</a>
            Object.keys(linkMap).forEach(lang => {
                // Loose match for the link
                // <a href="#" ...>English</a>
                const re = new RegExp(`<a[^>]*>${lang}</a>`, 'g');
                newContent = newContent.replace(re, `<a href="${linkMap[lang]}" class="${langName === lang ? 'active' : ''}">${lang}</a>`);
            });

            // Write File
            const targetPath = path.join(ROOT_DIR, langCode, file);
            fs.writeFileSync(targetPath, newContent);
        });
    });
    console.log('Site generation complete.');
});
