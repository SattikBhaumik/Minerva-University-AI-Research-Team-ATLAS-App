#!/usr/bin/env python3
"""Extract Minerva FAQs from a saved copy of https://www.minerva.edu/faqs/ into JSON.
Usage: extract_faq.py faqs.html out.json YYYY-MM-DD"""
import json, re, sys
from html.parser import HTMLParser
from html import unescape

html = open(sys.argv[1], encoding="utf-8").read()

def text_of(frag):
    frag = re.sub(r'<br\s*/?>', '\n', frag)
    frag = re.sub(r'</(p|li|h\d|div)>', '\n', frag)
    frag = re.sub(r'<li[^>]*>', '- ', frag)
    t = unescape(re.sub(r'<[^>]+>', '', frag))
    t = re.sub(r'[ \t ]+', ' ', t)
    t = re.sub(r' ?\n ?', '\n', t)
    return re.sub(r'\n{2,}', '\n\n', t).strip()

starts = [m.start() for m in re.finditer(r'<div role="list" class="w-dyn-items', html)]
cats = []
for i, s in enumerate(starts):
    before = html[max(0, s - 700):s]
    parts = [p.strip() for p in re.sub(r'<[^>]+>', '|', before).split('|') if p.strip() and 'Back to top' not in p and '%22' not in p and 'class=' not in p]
    name = unescape(parts[-1])
    end = starts[i + 1] if i + 1 < len(starts) else len(html)
    seg = html[s:end]
    items = []
    for it in re.split(r'<div role="listitem" class="w-dyn-item">', seg)[1:]:
        q = re.search(r'line-break---pre-wrap">(.*?)</div>', it, re.S)
        a = re.search(r'<div class="w-richtext">(.*?)</div></div></div></nav>', it, re.S)
        links = []
        for l in re.findall(r'<a [^>]*?href="([^"]+)"', a.group(1)):
            l = unescape(l)
            if l not in links:
                links.append(l)
        items.append({"q": text_of(q.group(1)), "a": text_of(a.group(1)), "links": links})
    cats.append({"name": name, "items": items})

out = {"readOn": sys.argv[3], "source": {"label": "Minerva University FAQs", "url": "https://www.minerva.edu/faqs/"}, "categories": cats}
json.dump(out, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(len(cats), sum(len(c["items"]) for c in cats))
for c in cats: print(len(c["items"]), c["name"])
