import os
import re

source_dir = r"C:\Users\jayar\OneDrive\Desktop\Ravi kiran\html_files"
target_dir = os.path.join(source_dir, "glass_theme_files")

if not os.path.exists(target_dir):
    os.makedirs(target_dir)

files = [f for f in os.listdir(source_dir) if f.endswith('.html') and not f.startswith('glass_')]


def apply_glass_theme(content, filename):
    # 1. Update font imports to a modern premium geometric font (Outfit)
    import_regex = r"@import url\([^\)]+\);"
    new_import = "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Inter:wght@400;500&display=swap');"
    content = re.sub(import_regex, new_import, content)
    
    # 2. Update :root variables
    root_regex = r":root\s*\{[^}]*\}"
    new_root = """
        /* Premium Aurora Glass Theme */
        :root {
            --bg-gradient: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
            --glass-bg: rgba(255, 255, 255, 0.05);
            --glass-border: rgba(255, 255, 255, 0.15);
            --glass-border-top: rgba(255, 255, 255, 0.25);
            --accent: #38bdf8;
            --accent-glow: rgba(56, 189, 248, 0.4);
            --accent-secondary: #818cf8;
            --text-main: #f8fafc;
            --text-muted: #cbd5e1;
            --search-outline: #38bdf8;
            --success: #10b981;
            --danger: #f43f5e;
            --shadow-glass: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }
    """
    content = re.sub(root_regex, new_root.strip(), content)
    
    # 3. Body style
    body_regex = r"body\s*\{[^}]*background-color:[^}]*\}"
    new_body = """body {
            font-family: 'Outfit', 'Inter', -apple-system, sans-serif;
            background: var(--bg-gradient);
            background-attachment: fixed;
            color: var(--text-main);
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }"""
    content = re.sub(body_regex, new_body, content)
    
    # 4. Headings styling
    content = re.sub(
        r"h1,\s*h2,\s*h3,\s*h4(?:,\s*h5)?\s*\{[^}]*\}",
        "h1, h2, h3, h4, h5 { font-family: 'Outfit', sans-serif; color: var(--text-main); font-weight: 600; margin-top: 0; margin-bottom: 15px; letter-spacing: -0.5px; }",
        content
    )
    content = re.sub(
        r"h1,\s*h2\s*\{[^}]*\}",
        "h1, h2 { font-family: 'Outfit', sans-serif; color: var(--text-main); font-weight: 600; margin-top: 0; margin-bottom: 15px; letter-spacing: -0.5px; }",
        content
    )
    
    # Remove the Claude Code asterisk if it exists
    content = re.sub(r"<span style='color:var\(--accent\); font-size:1\.2em; padding-top:4px;'>✺</span>\s*", "", content)
    content = re.sub(r"<h1 style='display:flex; align-items:center; justify-content:center; gap:8px;'>", "<h1>", content)
    
    # 5. Cards styling for Glassmorphism
    card_regex = r"\.card\s*\{[^\}]*\}"
    new_card = """
        .card { 
            background: var(--glass-bg); 
            backdrop-filter: blur(16px); 
            -webkit-backdrop-filter: blur(16px); 
            padding: 2rem; 
            border-radius: 16px; 
            border: 1px solid var(--glass-border); 
            border-top: 1px solid var(--glass-border-top); 
            margin-bottom: 1.5rem; 
            box-shadow: var(--shadow-glass); 
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease; 
        }
    """
    content = re.sub(card_regex, new_card.strip(), content)
    
    # Override card hover if present
    hover_regex = r"\.card:hover\s*\{[^\}]*\}"
    new_hover = ".card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.45), 0 0 20px 0 rgba(129, 140, 248, 0.2); }"
    content = re.sub(hover_regex, new_hover, content)

    # 6. Navigation sticky navbar
    nav_regex = r"nav\.sticky\s*\{[^\}]*\}"
    new_nav = """
        nav.sticky { 
            position: sticky; top: 15px; 
            background: var(--glass-bg); 
            padding: 10px 15px; z-index: 100; 
            border: 1px solid var(--glass-border); 
            border-top: 1px solid var(--glass-border-top); 
            border-radius: 30px; 
            display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; 
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); 
            box-shadow: var(--shadow-glass); 
            margin: 0 auto 2rem auto; 
            max-width: 95%; 
        }
    """
    content = re.sub(nav_regex, new_nav.strip(), content)
    
    # Nav buttons styling
    nav_btn_regex = r"\.nav-btn\s*\{[^\}]*\}"
    new_nav_btn = """
        .nav-btn { 
            background: transparent; color: var(--text-muted); 
            border: 1px solid transparent; 
            padding: 8px 18px; border-radius: 24px; cursor: pointer; text-decoration: none; 
            font-size: 0.95rem; font-weight: 500; transition: all 0.3s ease; white-space: nowrap; 
        }
    """
    content = re.sub(nav_btn_regex, new_nav_btn.strip(), content)
    
    nav_btn_active_regex = r"\.nav-btn\.active,\s*\.nav-btn:hover\s*\{[^\}]*\}"
    new_nav_btn_active = ".nav-btn.active, .nav-btn:hover { background: rgba(255,255,255,0.1); color: var(--text-main); border-color: var(--glass-border); box-shadow: 0 0 15px var(--accent-glow); }"
    content = re.sub(nav_btn_active_regex, new_nav_btn_active, content)
    
    # 7. Tables updates for Glass Theme
    table_bg_regex = r"table\s*\{[^}]*background-color:[^}]*\}"
    content = re.sub(table_bg_regex, "table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; background-color: transparent; }", content)
    content = re.sub(r"th\s*\{\s*background-color:\s*var\(--accent-secondary\)[^}]*\}", "th { background-color: rgba(255,255,255,0.1); color: var(--text-main); font-weight: 600; }", content)
    content = re.sub(r"th,\s*td\s*\{\s*padding[^b]*border:\s*1px\s*solid\s*var\(--accent-secondary\)[^}]*\}", "th, td { padding: 12px; border: 1px solid rgba(255,255,255,0.1); text-align: left; vertical-align: top; }", content)
    
    # 8. File Specific Glass Adjustments
    
    # Master Plan specifics
    content = content.replace("background-color: var(--accent-secondary); color: var(--text-main);", "background: rgba(255,255,255,0.1); color: var(--text-main); border: 1px solid var(--glass-border); backdrop-filter: blur(8px);")
    content = content.replace("background-color: var(--card-bg); border-radius: 0 0 4px 4px;", "background: rgba(0,0,0,0.2); border-radius: 0 0 12px 12px;")
    content = content.replace("background-color: rgba(233, 69, 96, 0.1);", "background-color: rgba(56, 189, 248, 0.1);")
    content = content.replace("background: var(--accent-secondary);", "background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border);")

    # Questions Bank specifics
    if "03_Questions_Bank.html" in filename:
        content = re.sub(r"\.search-bar\s*\{[^\}]*\}", ".search-bar { flex: 1; min-width: 200px; padding: 14px 24px; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); color: var(--text-main); border-radius: 30px; outline: none; font-family: 'Outfit', sans-serif; backdrop-filter: blur(8px); transition: all 0.3s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); } .search-bar:focus { border-color: var(--accent); box-shadow: 0 0 15px var(--accent-glow); }", content)
        content = re.sub(r"\.filters\s*\{[^\}]*\}", ".filters { position: sticky; top: 80px; background: var(--glass-bg); padding: 15px; z-index: 90; border-radius: 16px; margin-bottom: 20px; display: flex; gap: 10px; flex-wrap: wrap; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--glass-border); shadow: var(--shadow-glass); }", content)
        content = re.sub(r"\.cat-select\s*\{[^\}]*\}", ".cat-select { padding: 12px 20px; background: rgba(0,0,0,0.2); border: 1px solid var(--glass-border); color: var(--text-main); border-radius: 20px; outline: none; cursor: pointer; transition: 0.3s; font-family: 'Outfit', sans-serif;} .cat-select:focus { border-color: var(--accent); }", content)
        content = re.sub(r"\.q-card\s*\{[^\}]*\}", ".q-card { background: rgba(0,0,0,0.15); margin-bottom: 12px; border-radius: 12px; border: 1px solid var(--glass-border); transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; backdrop-filter: blur(4px); } .q-card:hover { transform: translateX(4px); box-shadow: -4px 4px 15px rgba(0,0,0,0.2); border-left: 2px solid var(--accent); }", content)

    # General specific cleanups
    content = content.replace("border-left: 3px solid var(--accent);", "border-left: 2px solid var(--accent);")
    content = content.replace("border-left: 4px solid var(--accent);", "border-left: 2px solid var(--accent);")
    content = content.replace("border-bottom: 1px solid var(--accent-secondary);", "border-bottom: 1px solid rgba(255,255,255,0.1);")
    
    return content


for filename in files:
    source_path = os.path.join(source_dir, filename)
    target_path = os.path.join(target_dir, filename)
    
    with open(source_path, 'r', encoding='utf-8') as f:
        html = f.read()

    html = apply_glass_theme(html, filename)

    with open(target_path, 'w', encoding='utf-8') as f:
        f.write(html)

print("Glass Theme Successfully Implemented in a New Folder!")
