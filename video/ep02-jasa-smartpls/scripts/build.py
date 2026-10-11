# Embed fonts (shared with EP01), Fluent 3D emoji (MIT, @lobehub/fluent-emoji-3d) and the VO timing JSON.
#   python scripts/build.py src/ep02.tpl.html project/index.html [scripts/vo_ep02.json]
import base64, json, os, re, shutil, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS = os.path.join(HERE, '..', 'ep01-judul-generator', 'assets', 'fonts')
F = {'PJS500': 'plus-jakarta-sans-latin-500-normal.woff2', 'PJS700': 'plus-jakarta-sans-latin-700-normal.woff2',
     'PJS800': 'plus-jakarta-sans-latin-800-normal.woff2', 'JBM500': 'jetbrains-mono-latin-500-normal.woff2',
     'ISI': 'instrument-serif-latin-400-italic.woff2'}
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
t = open(sys.argv[1]).read()
for k, f in F.items():
    t = t.replace('{{%s}}' % k, b64(os.path.join(FONTS, f)))
for code in set(re.findall(r'\{\{E_([^}]+)\}\}', t)):
    t = t.replace('{{E_%s}}' % code, 'data:image/webp;base64,' + b64(os.path.join(HERE, 'assets', 'emoji', code + '.webp')))
vo = json.load(open(sys.argv[3] if len(sys.argv) > 3 else os.path.join(HERE, 'scripts', 'vo_ep02.json')))
t = t.replace('{{VO_JSON}}', json.dumps({'lines': [{k: l[k] for k in ('id', 'start', 'end', 'text')} for l in vo['lines']]}, ensure_ascii=False))
out = sys.argv[2]; open(out, 'w').write(t)
for g in (os.path.join(HERE, 'node_modules/gsap/dist/gsap.min.js'), os.path.join(HERE, '..', 'ep01-judul-generator', 'node_modules/gsap/dist/gsap.min.js')):
    if os.path.exists(g):
        shutil.copy(g, os.path.join(os.path.dirname(out), 'gsap.min.js')); break
print('built', out)
