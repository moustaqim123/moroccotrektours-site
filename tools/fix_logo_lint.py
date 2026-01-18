import os
import re

def update_logo_styles():
    directory = '.'
    files = [f for f in os.listdir(directory) if f.endswith('.html')]
    
    # Pattern to match the logo img tag with inline style
    # We want to replace style="..." with class="logo-img"
    # Also ensure alt text is correct
    
    style_pattern = re.compile(r'style=["\']height:\s*60px;\s*width:\s*auto;?["\']')
    alt_pattern = re.compile(r'alt=["\']Morocco Tours Gate["\']')
    
    for filename in files:
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = style_pattern.sub('class="logo-img"', content)
        new_content = alt_pattern.sub('alt="Morocco Trek Tours"', new_content)
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {filename}")
        else:
            print(f"No changes for {filename}")

if __name__ == "__main__":
    update_logo_styles()
