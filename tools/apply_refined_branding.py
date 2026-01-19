import os
import re

def apply_refined_branding():
    directory = '.'
    files = [f for f in os.listdir(directory) if f.endswith('.html')]
    
    # New structure for the brand text with restored subtitle
    new_logo_html = """            <a href="index.html" class="logo">
                <img src="images/assets/logo.png" alt="Morocco Trek Tours" class="logo-img">
                <div class="brand-text">
                    <div class="brand-line-1">Morocco</div>
                    <div class="brand-line-2"><span class="brand-trek">Trek</span> Tours</div>
                    <div class="brand-subtitle">Your gateway to the authentic adventure</div>
                </div>
            </a>"""

    # Regexp to match various versions of the existing logo structure
    # This matches the entire <a> tag from <a...class="logo"> to </a>
    logo_pattern = re.compile(
        r'<a href="index\.html" class="logo">.*?</a>', 
        re.DOTALL
    )

    for filename in files:
        filepath = os.path.join(directory, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Perform replacement
        new_content = logo_pattern.sub(new_logo_html, content)
        
        # Also ensure footer mentions are correct (in case some were missed or still use old name)
        # Replacing "Morocco Tours Gate" in footer H4 and copyright P
        new_content = new_content.replace('<h4>Morocco Tours Gate</h4>', '<h4>Morocco Trek Tours</h4>')
        new_content = new_content.replace('© 2024 Morocco Tours Gate', '© 2024 Morocco Trek Tours')
        
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated branding in {filename}")
        else:
            print(f"No changes needed for {filename}")

if __name__ == "__main__":
    apply_refined_branding()
