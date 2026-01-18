from PIL import Image
from pathlib import Path
import csv

root = Path(__file__).resolve().parent.parent
img_dir = root / 'images'
out_csv = root / 'image_size_summary.csv'

# Known original sizes from earlier logs (where available)
known_originals = {
    'hero_home.jpg': '612x396',
    'hero_tours.jpg': '1024x682',
    'hero_customize.jpg': '612x408',
    'hero_about.jpg': '612x408',
    'hero_guide.jpg': '1024x1024',
    'team4.jpg': '1200x800',
    'guide_culture_flavors.jpg': '550x413'
}

rows = []
for p in sorted(img_dir.iterdir()):
    if not p.is_file():
        continue
    try:
        with Image.open(p) as im:
            w,h = im.size
            final = f'{w}x{h}'
    except Exception as e:
        final = 'ERROR'
    original = known_originals.get(p.name, 'unknown')
    rows.append((p.name, original, final))

with open(out_csv, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['filename','original_dimensions','final_dimensions'])
    for r in rows:
        writer.writerow(r)

print('Wrote', out_csv)
