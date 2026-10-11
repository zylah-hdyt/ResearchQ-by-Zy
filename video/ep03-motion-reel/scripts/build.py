# Embed fonts (base64) into the template and write the HyperFrames project's index.html.
#   python scripts/build.py src/ep03.tpl.html project/index.html
import base64, os, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = {
    'ANTON': 'assets/fonts/anton-latin-400-normal.woff2',
    'ISR': 'assets/fonts/instrument-serif-latin-400-normal.woff2',
    'ISI': 'assets/fonts/instrument-serif-latin-400-italic.woff2',
    'PJS500': 'assets/fonts/plus-jakarta-sans-latin-500-normal.woff2',
    'PJS700': 'assets/fonts/plus-jakarta-sans-latin-700-normal.woff2',
    'PJS800': 'assets/fonts/plus-jakarta-sans-latin-800-normal.woff2',
    'JBM': 'assets/fonts/jetbrains-mono-latin-500-normal.woff2',
    'CLOGO': 'assets/claude_logo_mask.png',
}
src, out = sys.argv[1], sys.argv[2]
t = open(src).read()
for k, p in ASSETS.items():
    t = t.replace('{{%s}}' % k, base64.b64encode(open(os.path.join(ROOT, p), 'rb').read()).decode())
open(out, 'w').write(t)
# GSAP is loaded locally (CDNs may be blocked in sandboxes)
gsap = os.path.join(ROOT, 'node_modules/gsap/dist/gsap.min.js')
if not os.path.exists(gsap):  # fall back to the sibling EP01 install
    gsap = os.path.join(ROOT, '../ep01-judul-generator/node_modules/gsap/dist/gsap.min.js')
shutil.copy(gsap, os.path.join(os.path.dirname(out), 'gsap.min.js'))
print('built', out)
