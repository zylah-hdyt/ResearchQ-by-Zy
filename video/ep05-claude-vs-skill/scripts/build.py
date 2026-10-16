# Embed fonts, logos and the word timings into the template and write the HyperFrames project's index.html.
#   python scripts/build.py src/ep05.tpl.html project/index.html
import base64, json, os, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
b64 = lambda p: base64.b64encode(open(os.path.join(ROOT, p), 'rb').read()).decode()
ASSETS = {
    'ISI': 'assets/fonts/instrument-serif-latin-400-italic.woff2',
    'PJS500': 'assets/fonts/plus-jakarta-sans-latin-500-normal.woff2',
    'PJS700': 'assets/fonts/plus-jakarta-sans-latin-700-normal.woff2',
    'PJS800': 'assets/fonts/plus-jakarta-sans-latin-800-normal.woff2',
    'JBM': 'assets/fonts/jetbrains-mono-latin-500-normal.woff2',
    'CLOGO': 'assets/claude_logo_mask.png',
    'GEMINI': 'assets/logos/gemini-color.svg',
}
src, out = sys.argv[1], sys.argv[2]
t = open(src).read()
for k, p in ASSETS.items():
    t = t.replace('{{%s}}' % k, b64(p))
# OpenAI mark is monochrome currentColor: bake it white for <img> use
openai = open(os.path.join(ROOT, 'assets/logos/openai.svg')).read().replace('fill="currentColor"', 'fill="#ffffff"')
t = t.replace('{{OPENAI}}', base64.b64encode(openai.encode()).decode())
t = t.replace('{{WORDS}}', json.dumps(json.load(open(os.path.join(ROOT, 'src/words.json'))), ensure_ascii=False))
open(out, 'w').write(t)
gsap = os.path.join(ROOT, 'node_modules/gsap/dist/gsap.min.js')
if not os.path.exists(gsap):
    gsap = os.path.join(ROOT, '../ep01-judul-generator/node_modules/gsap/dist/gsap.min.js')
shutil.copy(gsap, os.path.join(os.path.dirname(out), 'gsap.min.js'))
print('built', out)
