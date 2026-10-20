# Render a NASKAH-*.md script to a styled HTML (ResearchQ colours, Poppins), ready for Chromium --print-to-pdf.
# Usage: python3 naskah_pdf.py in.md out.html
import markdown, sys, os, re
src, out = sys.argv[1], sys.argv[2]
fonts = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "public", "fonts"))
md = open(src, encoding="utf-8").read()
# python-markdown needs a blank line before a list that follows a paragraph line
lst = re.compile(r"^\s*(?:[-*]|\d+\.)\s")
kind = lambda l: "ol" if re.match(r"^\d+\.", l) else "ul"
lines, prev = [], ""
for ln in md.split("\n"):
    if lst.match(ln) and prev.strip() and not prev.startswith((" ", ">", "|", "`")) and (not lst.match(prev) or kind(prev) != kind(ln)): lines.append("")
    lines.append(ln); prev = ln
md = "\n".join(lines)
body = markdown.markdown(md, extensions=["tables", "fenced_code", "sane_lists"])
# narration blockquotes get their own look; segment headings keep an orange tag
body = re.sub(r"<h3>((?:S|D)\d+)", r'<h3><span class="tag">\1</span>', body)
face = lambda fam, f, w, s="normal": f"@font-face{{font-family:{fam};src:url('file://{fonts}/{f}');font-weight:{w};font-style:{s}}}"
css = "\n".join([
    face("Poppins", "poppins-latin-400-normal.woff2", 400), face("Poppins", "poppins-latin-500-normal.woff2", 500),
    face("Poppins", "poppins-latin-600-normal.woff2", 600), face("Poppins", "poppins-latin-700-normal.woff2", 700),
    face("Poppins", "poppins-latin-800-normal.woff2", 800), face("Poppins", "poppins-latin-500-italic.woff2", 500, "italic"),
    face("JBM", "jetbrains-mono-latin-500-normal.woff2", 500),
]) + """
@page{size:A4;margin:16mm 15mm 18mm}
:root{--or:#F28A2E;--ink:#141414;--mut:#6b6b6b;--line:#e6e2dc;--soft:#fbf5ef}
body{font-family:Poppins,sans-serif;font-size:10pt;line-height:1.55;color:var(--ink);background:#fff;margin:0}
.cover{background:#0b0b0b;color:#fff;border-radius:14px;padding:26px 28px;margin-bottom:18px;position:relative;overflow:hidden}
.cover:after{content:"";position:absolute;right:-90px;bottom:-110px;width:260px;height:260px;border-radius:50%;background:radial-gradient(circle,rgba(242,138,46,.45),transparent 70%)}
.cover .k{font-size:9pt;letter-spacing:.18em;text-transform:uppercase;color:var(--or);font-weight:600}
.cover h1{font-size:22pt;line-height:1.15;margin:6px 0 4px;font-weight:800;color:#fff;border:0;padding:0}
.cover .meta{display:grid;grid-template-columns:1fr 1fr;gap:4px 18px;margin-top:12px;color:#cfcfcf;font-size:9pt;position:relative;z-index:1}
.cover .meta b{color:#fff;font-weight:600}
.cover h1{position:relative;z-index:1}
h1{font-size:17pt;font-weight:800;margin:0 0 8px}
h2{font-size:13.5pt;font-weight:800;margin:22px 0 8px;padding-bottom:5px;border-bottom:2px solid var(--or);break-after:avoid}
h3{font-size:11pt;font-weight:700;margin:16px 0 6px;break-after:avoid}
.tag{display:inline-block;background:var(--or);color:#fff;font-size:8.5pt;border-radius:5px;padding:1px 7px;margin-right:7px;vertical-align:1px}
blockquote{margin:6px 0 8px;padding:9px 14px;background:var(--soft);border-left:4px solid var(--or);border-radius:0 8px 8px 0;font-size:10.5pt;break-inside:avoid}
blockquote p{margin:3px 0}
blockquote strong{color:#c4600f}
pre{background:#111;color:#f2f2f2;border-radius:8px;padding:10px 12px;font-family:JBM,monospace;font-size:8.6pt;line-height:1.5;white-space:pre-wrap;word-break:break-word;break-inside:avoid}
code{font-family:JBM,monospace;font-size:8.8pt;background:#f1ece6;border-radius:4px;padding:0 4px}
pre code{background:none;padding:0;font-size:inherit}
table{border-collapse:collapse;width:100%;font-size:9pt;margin:8px 0}
tr{break-inside:avoid}
th{background:#0b0b0b;color:#fff;text-align:left;font-weight:600;padding:6px 8px}
td{border-bottom:1px solid var(--line);padding:5px 8px;vertical-align:top}
tr:has(strong) td{background:#fff3e8}
p:has(+pre),h2+p,h3+p{break-after:avoid}
hr{border:0;border-top:1px dashed var(--line);margin:18px 0}
ul,ol{padding-left:20px;margin:4px 0}
li{margin:2px 0}
a{color:var(--or)}
"""
# first H1 + following bold meta paragraph -> cover block
m = re.match(r"\s*<h1>(.*?)</h1>\s*(<p>.*?</p>)", body, re.S)
if m:
    items = re.split(r"\s*·\s*|\s*<br\s*/?>\s*|\n", m.group(2)[3:-4])
    meta = "".join(f"<div>{i.replace('<strong>','<b>').replace('</strong>','</b>')}</div>" for i in items if i.strip())
    title = m.group(1); parts = title.split("—", 1)
    k, t = (parts[0].strip(), parts[1].strip()) if len(parts) == 2 else ("ResearchQ", title)
    body = f'<div class="cover"><div class="k">{k}</div><h1>{t}</h1><div class="meta">{meta}</div></div>' + body[m.end():]
open(out, "w", encoding="utf-8").write(f"<!doctype html><html lang='id'><head><meta charset='utf-8'><style>{css}</style></head><body>{body}</body></html>")
print("html ok")
