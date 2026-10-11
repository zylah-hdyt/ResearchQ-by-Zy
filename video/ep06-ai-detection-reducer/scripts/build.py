# Build EP03: embed fonts (assets/fonts), emoji (assets/emoji), brand images (assets/brand) and VO timing.
#   python scripts/build.py src/ep03.tpl.html project/index.html scripts/vo_ep03.json
import base64, json, os, re, shutil, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
t = open(sys.argv[1]).read()
for n in set(re.findall(r'\{\{F_([^}]+)\}\}', t)):
    t = t.replace('{{F_%s}}' % n, b64(os.path.join(HERE, 'assets', 'fonts', n + '.woff2')))
for n in set(re.findall(r'\{\{E_([^}]+)\}\}', t)):
    t = t.replace('{{E_%s}}' % n, 'data:image/webp;base64,' + b64(os.path.join(HERE, 'assets', 'emoji', n + '.webp')))
for n in set(re.findall(r'\{\{IMG_([^}]+)\}\}', t)):
    t = t.replace('{{IMG_%s}}' % n, 'data:image/png;base64,' + b64(os.path.join(HERE, 'assets', 'brand', n + '.png')))
vo = json.load(open(sys.argv[3]))
t = t.replace('{{VO_JSON}}', json.dumps({'lines': [{k: l[k] for k in ('id', 'start', 'end', 'text')} for l in vo['lines']]}, ensure_ascii=False))
out = sys.argv[2]; open(out, 'w').write(t)
g = os.path.join(HERE, '..', 'ep01-judul-generator', 'node_modules', 'gsap', 'dist', 'gsap.min.js')
if os.path.exists(g): shutil.copy(g, os.path.join(os.path.dirname(out), 'gsap.min.js'))
print('built', out)
