from PIL import Image
from pathlib import Path
import os

root = Path(__file__).resolve().parent.parent
img_dir = root / 'images'
out_md = root / 'image-processing-summary.md'

# Original dimensions inferred from the batch normalization run
originals = {
    'agafay_desert.jpg':'1024x682',
    'ait_bougmez.jpg':'640x427',
    'atlas_village.jpg':'612x408',
    'guide_coastal_vibes.jpg':'1024x682',
    'guide_culture_flavors.jpg':'550x413',
    'guide_high_atlas.jpg':'1024x576',
    'guide_sahara_desert.jpg':'1024x680',
    'happy_valley_main.jpg':'1000x667',
    'hero_about.jpg':'612x408',
    'hero_customize.jpg':'612x408',
    'hero_guide.jpg':'1024x1024',
    'hero_home.jpg':'612x396',
    'hero_tours.jpg':'1024x682',
    'logo.png':'340x142',
    'mgoun.jpg':'612x408',
    'mgoun_main.jpg':'1024x1012',
    'saghro_bab_nali.jpg':'1200x800',
    'saghro_cathedral.jpg':'612x345',
    'saghro_main.jpg':'612x412',
    'saghro_sunset_rocks.jpg':'612x406',
    'sahara_erg_chebbi.jpg':'640x427',
    'siroua_main.jpg':'400x400',
    'siroua_volcanic_pools.jpg':'1600x1067',
    'team4.jpg':'1200x800',
    'todra_dades.jpg':'683x1024',
    'toubkal_summit.jpg':'612x408',
    'volcanic_canyon.jpg':'612x345'
}

rows = []
for p in sorted(img_dir.iterdir()):
    if not p.is_file():
        continue
    name = p.name
    try:
        with Image.open(p) as im:
            w,h = im.size
            final = f"{w}x{h}"
    except Exception as e:
        final = 'ERROR'
    size_kb = round(os.path.getsize(p) / 1024, 1)
    orig = originals.get(name, 'unknown')
    rows.append((name, orig, final, f"{size_kb} KB"))

with open(out_md, 'w', encoding='utf-8') as f:
    f.write('# Image Processing Summary\n\n')
    f.write('| Filename | Original Dimensions | Final Dimensions | Final Size (KB) |\n')
    f.write('|---|---:|---:|---:|\n')
    for r in rows:
        f.write(f'| {r[0]} | {r[1]} | {r[2]} | {r[3]} |\n')

print('Wrote', out_md)
