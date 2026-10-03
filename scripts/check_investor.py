import requests
import re

url = 'https://yaiinfraventure.online/assets/index-DpVSNU1m.js'
try:
    r = requests.get(url, timeout=10)
    print('Status:', r.status_code, 'Length:', len(r.text))
    text = r.text
    # Search for headings, titles, descriptions
    keywords = ['invest', 'venture', 'infra', 'fund', 'stage', 'portfolio', 'about', 'partner', 'contact', 'mission', 'focus', 'yai']
    lines = set()
    # Find string literals
    for match in re.finditer(r'"([^"\\]*(?:\\.[^"\\]*)*)"', text):
        val = match.group(1).encode('utf-8').decode('unicode_escape', errors='ignore').strip()
        if 15 < len(val) < 250:
            if any(k in val.lower() for k in keywords):
                lines.add(val)
    print('Found relevant strings:')
    for l in sorted(lines):
        print('>', l)
except Exception as e:
    print('Error:', e)
