import base64
import os

png_path = r'c:\Users\user\.gemini\antigravity\playground\tensor-coronal\images\assets\logo.png'
svg_files = [
    r'c:\Users\user\.gemini\antigravity\playground\tensor-coronal\logo-symbol-only.svg',
    r'c:\Users\user\.gemini\antigravity\playground\tensor-coronal\images\assets\logo.svg',
    r'c:\Users\user\.gemini\antigravity\playground\tensor-coronal\images\assets\logo_icon.svg',
    r'c:\Users\user\.gemini\antigravity\playground\tensor-coronal\logo-graphic-only.svg',
    r'c:\Users\user\.gemini\antigravity\playground\tensor-coronal\logo-symbol-only.svg',
    r'c:\Users\user\.gemini\antigravity\playground\tensor-coronal\logo-symbol-compact.svg'
]

with open(png_path, 'rb') as f:
    data = f.read()
    b64_data = base64.b64encode(data).decode('utf-8')

# Minimal SVG wrapper to embed the PNG
svg_content = f'''<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <image href="data:image/png;base64,{b64_data}" height="100%" width="100%" preserveAspectRatio="xMidYMid meet"/>
</svg>'''

for svg_path in svg_files:
    if os.path.exists(svg_path) or True: # Force create/overwrite
        with open(svg_path, 'w') as f:
            f.write(svg_content)
        print(f"Updated: {svg_path}")

print("All logo files updated successfully.")
