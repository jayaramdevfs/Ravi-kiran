import os
import re

html_dir = r'C:\Users\jayar\OneDrive\Desktop\Ravi kiran\html_files'
files = [f for f in os.listdir(html_dir) if f.endswith('.html')]

new_css_vars = '''
        :root {
            --bg-color: #21201e;
            --card-bg: #292825;
            --accent: #df7c58;
            --accent-secondary: #42413e;
            --text-main: #e8e4dc;
            --text-muted: #9b9a97;
            --search-outline: #3b82f6;
            --success: #2ecc71;
            --danger: #e74c3c;
        }'''

for filename in files:
    path = os.path.join(html_dir, filename)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fonts
    content = re.sub(
        r""@import url\([^\)]+\);"",
        ""@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;1,500&display=swap');"",
        content
    )

    # Vars
    content = re.sub(
        r"":root\s*\{[^}]*\}",
        new_css_vars.strip(),
        content
    )

    # Headings
    content = re.sub(
        r""(h[1-5](?:,\s*h[1-5])*)(?:\s*|\n*)\{([^}]*color:\s*var\(--accent\);[^}]*)\}"",
        r""\1 { font-family: 'Playfair Display', ui-serif, Georgia, serif; color: var(--text-main); font-weight: 500; margin-top: 0; margin-bottom: 10px; }"",
        content
    )

    # Add Asterisk
    if ""?"" not in content:
        content = re.sub(
            r""(<h1>)(.*?)(</h1>)"",
            r""\1<span style='color:var(--accent); font-size:1.2em;'>?</span> \2\3"",
            content
        )

    # Fix Cards
    content = re.sub(
        r""(\.card\s*\{[^}]*)box-shadow:[^;]+;([^}]*\})"",
        r""\1 border: 1px solid var(--accent-secondary); box-shadow: none;\2"",
        content
    )
    content = re.sub(
        r""(\.card\s*\{[^}]*)border-radius:\s*\d+px;([^}]*\})"",
        r""\1border-radius: 12px;\2"",
        content
    )

    # Nav Sticky
    content = re.sub(
        r""(nav\.sticky\s*\{)[^}]+(\})"",
        r""\1 position: sticky; top: 0; background-color: rgba(33, 32, 30, 0.95); padding: 12px 0; z-index: 100; border-bottom: 1px solid var(--accent-secondary); display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; backdrop-filter: blur(8px); \2"",
        content
    )
    
    # Nav Btn
    content = re.sub(
        r""(\.nav-btn\s*\{)[^}]+(\})"",
        r""\1 background: transparent; color: var(--text-muted); border: 1px solid var(--accent-secondary); padding: 8px 16px; border-radius: 20px; cursor: pointer; text-decoration: none; font-size: 0.9rem; transition: all 0.2s; white-space: nowrap; \2"",
        content
    )
    content = re.sub(
        r""(\.nav-btn\.active,\s*\.nav-btn:hover\s*\{)[^}]+(\})"",
        r""\1 background: #fff; color: #000; border-color: #fff; \2"",
        content
    )

    # Top Btn
    content = re.sub(
        r""(#back-to-top\s*\{)[^}]+(\})"",
        r""\1 position: fixed; bottom: 20px; right: 20px; display: none; background: #fff; color: #000; border: none; padding: 12px 18px; border-radius: 24px; cursor: pointer; z-index: 99; font-weight: 500; transition: opacity 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.3); \2"",
        content
    )

    # 03_Questions_Bank specifics
    if ""03_Questions_Bank"" in filename:
        content = re.sub(
            r""(\.search-bar\s*\{)[^}]+(\})"",
            r""\1 flex: 1; min-width: 200px; padding: 12px 20px; background: transparent; border: 2px solid var(--search-outline); color: var(--text-main); border-radius: 24px; outline: none; font-family: 'Inter', sans-serif; \2"",
            content
        )
        content = re.sub(
            r""(\.filters\s*\{)[^}]+(\})"",
            r""\1 position: sticky; top: 60px; background: rgba(33, 32, 30, 0.95); padding: 15px; z-index: 90; border-radius: 12px; margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; backdrop-filter: blur(8px); border: none; \2"",
            content
        )
        content = re.sub(
            r""(\.q-card\s*\{)[^}]+(\})"",
            r""\1 background: var(--card-bg); margin-bottom: 10px; border-radius: 12px; border: 1px solid var(--accent-secondary); transition: 0.2s; overflow: hidden; \2"",
            content
        )
        content = re.sub(
            r""(\.cat-select\s*\{)[^}]+(\})"",
            r""\1 padding: 12px 20px; background: var(--card-bg); border: 1px solid var(--accent-secondary); color: var(--text-main); border-radius: 20px; outline: none; \2"",
            content
        )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
print('Execution Complete.')
