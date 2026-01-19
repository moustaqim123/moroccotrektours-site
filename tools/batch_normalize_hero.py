from PIL import Image, ImageOps
from pathlib import Path
import os

TARGET_W = 1600
TARGET_H = 900
TARGET_SIZE = (TARGET_W, TARGET_H)

root = Path(__file__).resolve().parent.parent
img_dir = root / 'images'

if not img_dir.exists():
    print('images directory not found')
    raise SystemExit(1)

supported = ['.jpg', '.jpeg', '.png', '.webp']

processed = 0
errors = []

for img_path in sorted(img_dir.iterdir()):
    if not img_path.is_file():
        continue
    suffix = img_path.suffix.lower()
    if suffix not in supported:
        print(f'Skipping unsupported file: {img_path.name}')
        continue
    try:
        with Image.open(img_path) as im:
            orig_mode = im.mode
            w, h = im.size
            # Convert to RGB for consistency
            if im.mode not in ('RGB', 'RGBA'):
                im = im.convert('RGB')
            # Compute scale to fit inside target (no stretching)
            scale = min(TARGET_W / w, TARGET_H / h)
            new_w = max(1, int(round(w * scale)))
            new_h = max(1, int(round(h * scale)))
            im_resized = im.resize((new_w, new_h), Image.LANCZOS)

            # If resized matches target exactly, save directly
            if (new_w, new_h) == TARGET_SIZE:
                final = im_resized
            else:
                # Create background (black) and paste centered (minimal padding)
                background = Image.new('RGB', TARGET_SIZE, (0,0,0))
                offset_x = (TARGET_W - new_w) // 2
                offset_y = (TARGET_H - new_h) // 2
                background.paste(im_resized, (offset_x, offset_y))
                final = background

            # Save to temp then replace to avoid corruption
            tmp_path = img_path.with_suffix(img_path.suffix + '.tmp')
            if suffix in ('.jpg', '.jpeg'):
                final.save(tmp_path, format='JPEG', quality=85, optimize=True)
            elif suffix == '.webp':
                final.save(tmp_path, format='WEBP', quality=85, method=6)
            else:  # PNG
                final.save(tmp_path, format='PNG', optimize=True)

        # Replace original
        os.replace(str(tmp_path), str(img_path))
        processed += 1
        print(f'Processed {img_path.name}: {w}x{h} -> {TARGET_W}x{TARGET_H}')
    except Exception as e:
        errors.append((img_path.name, str(e)))
        print(f'Error processing {img_path.name}: {e}')

print('\nBatch complete.')
print(f'Files processed: {processed}')
if errors:
    print('Errors:')
    for n, e in errors:
        print('-', n, e)
