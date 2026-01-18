import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
html_files = list(root.glob('*.html'))
pattern = re.compile(r'<img\b([^>]*?)src="(images/[^"]+)"([^>]*?)>', re.IGNORECASE | re.DOTALL)

changed_files = []
for f in html_files:
    text = f.read_text(encoding='utf-8')
    def repl(m):
        before = m.group(1) or ''
        src = m.group(2)
        after = m.group(3) or ''
        tag = '<img' + before + 'src="' + src + '"' + after + '>'
        if 'loading=' in tag:
            return tag
        # insert loading before closing >, preserving trailing spaces
        # build new tag ensuring single space before loading
        new_tag = '<img' + before + 'src="' + src + '"' + after
        # if tag already ends with '/', keep it self-closing
        new_tag = new_tag.rstrip()
        # add loading attr
        new_tag = new_tag + ' loading="lazy">'
        return new_tag
    new_text = pattern.sub(repl, text)
    if new_text != text:
        f.write_text(new_text, encoding='utf-8')
        changed_files.append(str(f.relative_to(root)))

print('Updated files:', changed_files)
sys.exit(0)
