# Embed fonts (base64) into the template and write the HyperFrames project's index.html.
#   python scripts/build.py src/ep02.tpl.html project/index.html
import base64, os, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = {
    'PM': 'assets/fonts/permanent-marker-latin-400-normal.woff2',
    'PH': 'assets/fonts/patrick-hand-latin-400-normal.woff2',
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
