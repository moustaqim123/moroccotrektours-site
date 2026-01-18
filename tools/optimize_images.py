from PIL import Image
from pathlib import Path
import sys

root = Path(__file__).resolve().parent.parent
img_dir = root / 'images'
if not img_dir.exists():
    print('images directory not found')
    sys.exit(1)

# Rules for max width
hero_names = {'hero_home.jpg','hero_tours.jpg','hero_customize.jpg','hero_about.jpg','hero_guide.jpg'}

for img_path in img_dir.iterdir():
    if not img_path.is_file():
        continue
    suffix = img_path.suffix.lower()
    if suffix not in ['.jpg', '.jpeg', '.png']:
        continue
    name = img_path.name
    try:
        with Image.open(img_path) as im:
            w, h = im.size
            if name in hero_names or 'hero_' in name:
                max_w = 1920
            elif any(k in name for k in ['toubkal','mgoun','sahara','erg','summit','todra','dades','volcanic','todra_dades']):
                max_w = 1600
            else:
                max_w = 1200
            if w > max_w:
                new_h = int((max_w / w) * h)
                im = im.resize((max_w, new_h), Image.LANCZOS)
                w,h = im.size
            # Save with optimization
            if suffix in ['.jpg', '.jpeg']:
                im.save(img_path, format='JPEG', quality=85, optimize=True)
            else:
                # PNG
                im.save(img_path, format='PNG', optimize=True)
            print(f'Optimized {name}: {w}x{h}')
    except Exception as e:
        print('Error processing', img_path, e)

print('Done optimizing images')
