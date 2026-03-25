import os

html_dir = r"C:\Users\jayar\OneDrive\Desktop\Ravi kiran\html_files"
files = [f for f in os.listdir(html_dir) if f.endswith('.html')]

# The CSS palette replacement
def replace_theme(content, filename):
    # 1. Update font imports
    import_old_1 = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');"
    import_new = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;1,500&display=swap');"
    content = content.replace(import_old_1, import_new)
    
    # 2. Update :root block (handle both single line and multiline)
    if ":root { --bg-color: #1a1a2e;" in content:
        # single line
        old_root = ":root { --bg-color: #1a1a2e; --card-bg: #16213e; --accent: #e94560; --accent-secondary: #0f3460; --text-main: #eee; --text-muted: #aaa; --success: #2ecc71; }"
        old_root_2 = ":root { --bg-color: #1a1a2e; --card-bg: #16213e; --accent: #e94560; --accent-secondary: #0f3460; --text-main: #eee; --text-muted: #aaa; }"
    else:
        # multi line
        pass
    
    # Actually, a simpler approach is str.replace directly for specific components
    
    # Globals
    content = content.replace("#1a1a2e;", "#21201e;")
    content = content.replace("#16213e;", "#292825;")
    content = content.replace("#e94560;", "#df7c58;")
    content = content.replace("#0f3460;", "#42413e;")
    content = content.replace("#eee;", "#e8e4dc;")
    content = content.replace("#aaa;", "#9b9a97;")
    
    # Headings formatting
    content = content.replace("h1, h2, h3, h4, h5 { color: var(--accent); margin-top: 0; }", "h1, h2, h3, h4, h5 { font-family: 'Playfair Display', ui-serif, Georgia, serif; color: var(--text-main); font-weight: 500; margin-top: 0; }")
    content = content.replace("h1, h2 { color: var(--accent); margin-top: 0; }", "h1, h2 { font-family: 'Playfair Display', ui-serif, Georgia, serif; color: var(--text-main); font-weight: 500; margin-top: 0; }")
    content = content.replace("h1, h2, h3, h4 { color: var(--accent); margin-top: 0; margin-bottom: 10px; }", "h1, h2, h3, h4 { font-family: 'Playfair Display', ui-serif, Georgia, serif; color: var(--text-main); font-weight: 500; margin-top: 0; margin-bottom: 10px; }")
    content = content.replace("h1, h2, h3, h4 { color: var(--accent); margin-top: 0; }", "h1, h2, h3, h4 { font-family: 'Playfair Display', ui-serif, Georgia, serif; color: var(--text-main); font-weight: 500; margin-top: 0; }")

    # Asterisks to H1
    if "<h1>" in content:
        content = content.replace("<h1>", "<h1 style='display:flex; align-items:center; justify-content:center; gap:8px;'><span style='color:var(--accent); font-size:1.2em; padding-top:4px;'>✺</span> ")
    
    # Cards Design
    content = content.replace("box-shadow: 0 4px 6px rgba(0,0,0,0.3);", "border: 1px solid var(--accent-secondary); box-shadow: none;")
    content = content.replace("box-shadow: 0 2px 4px rgba(0,0,0,0.3);", "border: 1px solid var(--accent-secondary); box-shadow: none;")
    content = content.replace("border-radius: 8px;", "border-radius: 12px;")
    content = content.replace("border-radius: 6px;", "border-radius: 12px;")
    
    # Sticky Nav overrides
    content = content.replace("background-color: rgba(26, 26, 46, 0.95);", "background-color: rgba(33, 32, 30, 0.95);")
    content = content.replace("border-bottom: 2px solid var(--accent);", "border-bottom: 1px solid var(--accent-secondary);")
    content = content.replace("backdrop-filter: blur(5px);", "backdrop-filter: blur(8px); padding: 12px 0;")
    
    # Nav Buttons
    content = content.replace("background: var(--bg-color); color: var(--text-main); border: 1px solid var(--accent); padding: 8px 12px; border-radius: 4px;", "background: transparent; color: var(--text-muted); border: 1px solid var(--accent-secondary); padding: 8px 16px; border-radius: 20px;")
    content = content.replace("background: var(--accent); color: #fff;", "background: #fff; color: #000; border-color: #fff;")
    
    # Back to Top 
    content = content.replace("background: var(--accent); color: #fff; border: none; padding: 12px 18px; border-radius: 5px;", "background: #fff; color: #000; border: none; padding: 12px 18px; border-radius: 24px;")
    
    # File Specific Adjustments:
    if "03_Questions_Bank.html" in filename:
        content = content.replace("border: 1px solid var(--accent);", "border: none;")
        content = content.replace("background: var(--bg-color); border: 1px solid var(--accent-secondary); color: #fff; border-radius: 4px;", "background: transparent; border: 2px solid var(--search-outline); color: var(--text-main); border-radius: 24px; padding: 12px 20px; outline: none;")
        content = content.replace(".search-bar { flex: 1; min-width: 200px; padding: 10px;", ".search-bar { flex: 1; min-width: 200px; padding: 12px 20px;")
        
        # filters bg
        content = content.replace("background: rgba(22, 33, 62, 0.95);", "background: rgba(33, 32, 30, 0.95);")
        # q-card formatting
        content = content.replace(".q-card { background: var(--card-bg); margin-bottom: 5px; border-radius: 4px; overflow: hidden; border-left: 4px solid var(--accent-secondary); transition: 0.2s; }", ".q-card { background: var(--card-bg); margin-bottom: 10px; border-radius: 12px; border: 1px solid var(--accent-secondary); transition: 0.2s; overflow: hidden; }")
        
        # fix cat filters to match claude components
        content = content.replace("padding: 10px; background: var(--bg-color); border: 1px solid var(--accent-secondary); color: #fff; border-radius: 4px;", "padding: 12px 20px; background: var(--card-bg); border: 1px solid var(--accent-secondary); color: var(--text-main); border-radius: 20px; outline: none; cursor: pointer;")

    return content

for filename in files:
    path = os.path.join(html_dir, filename)
    with open(path, 'r', encoding='utf-8') as f:
        html = f.read()

    html = replace_theme(html, filename)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)

print("Theme successfully updated!")
