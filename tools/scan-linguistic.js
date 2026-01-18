const fs = require('fs');
const path = require('path');

const commonMistakes = [
    { regex: /accomodation/gi, correct: 'accommodation' },
    { regex: /itinary/gi, correct: 'itinerary' },
    { regex: /unforgetable/gi, correct: 'unforgettable' },
    { regex: /\byoure\b/gi, correct: 'your/you\'re' },
    { regex: /\bdont\b/gi, correct: 'don\'t' },
    { regex: /\bcant\b/gi, correct: 'can\'t' },
    { regex: /guarent/gi, correct: 'guarant' },
    { regex: /beautifull/gi, correct: 'beautiful' },
    { regex: /mountaneer/gi, correct: 'mountaineer' },
    { regex: /adventur\b/gi, correct: 'adventure' },
    { regex: /trecking/gi, correct: 'trekking' }
];

const files = fs.readdirSync('.').filter(f => f.endsWith('.html') || f.endsWith('.js') || f.endsWith('.json'));

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    commonMistakes.forEach(mistake => {
        const matches = content.match(mistake.regex);
        if (matches) {
            console.log(`File: ${file} | Pattern: ${mistake.regex} | Found: ${matches.join(', ')} | Suggested: ${mistake.correct}`);
        }
    });
});
