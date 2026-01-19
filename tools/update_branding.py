import os
import re

directory = r'c:\Users\user\.gemini\antigravity\playground\tensor-coronal'
brand_name_old = 'Morocco Tours Gate'
brand_name_new = 'Morocco Trek Tours'

# Logo replacement pattern
logo_pattern = re.compile(
    r'(<a\s+href="index\.html"\s+class="logo">)\s*(<img\s+src="images/assets/logo\.png"\s+alt=")[^"]*("\s+style="height:\s*60px;\s*width:\s*auto;"[^>]*>)\s*(<span\s+class="logo-subtitle">.*?</span>)',
    re.DOTALL
)

logo_replacement = r'''\1
                \2Morocco Trek Tours\3
                <div class="brand-text">
                    <span class="brand-morocco">Morocco</span>
                    <span class="brand-trek">Trek</span>
                    <span class="brand-tours">Tours</span>
                </div>'''

def update_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Replace Title and Meta
    new_content = content.replace(brand_name_old, brand_name_new)
    
    # 2. Replace Logo structure
    # We need to be careful with indentation in the regex.
    # The DOTALL flag handles multi-line spans.
    new_content = logo_pattern.sub(logo_replacement, new_content)
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

for filename in os.listdir(directory):
    if filename.endswith('.html'):
        filepath = os.path.join(directory, filename)
        if update_file(filepath):
            print(f'Updated: {filename}')
