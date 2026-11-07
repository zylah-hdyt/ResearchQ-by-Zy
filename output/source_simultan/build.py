import base64, json, sys
S=sys.argv[1]; P=f'{S}/p4'; F=f'{S}/fonts'
b=lambda p: base64.b64encode(open(p,'rb').read()).decode()
h=open(f'{P}/template.html').read()
fonts={'INTER500':'inter-5.0.18/files/inter-latin-500-normal.woff2','INTER600':'inter-5.0.18/files/inter-latin-600-normal.woff2','INTER700':'inter-5.0.18/files/inter-latin-700-normal.woff2',
 'PJS800':'plus-jakarta-sans-5.0.20/files/plus-jakarta-sans-latin-800-normal.woff2','JBM500':'jetbrains-mono-5.0.20/files/jetbrains-mono-latin-500-normal.woff2',
 'IS400I':'instrument-serif-5.0.19/files/instrument-serif-latin-400-italic.woff2','ANTON':'anton-5.0.18/files/anton-latin-400-normal.woff2'}
for k,p in fonts.items(): h=h.replace('{{'+k+'}}',b(f'{F}/fontsource-{p}'))
h=h.replace('{{PAPER}}','data:image/jpeg;base64,'+b(f'{S}/video/assets/paper.jpg'))
h=h.replace('{{GRAIN}}',json.dumps(['data:image/jpeg;base64,'+b(f'{S}/video/assets/grain{i}.jpg') for i in range(8)]))
POS=['m_open','m_thumb','m_think','m_point','m_warn','n_present','n_idea','n_shrug','n_wink']
h=h.replace('{{MOUTHS}}',json.dumps({n:'data:image/png;base64,'+b(f'{P}/lip/mo_{n}.png') for n in POS})).replace('{{MOUTHINFO}}',open(f'{P}/lip/mouth.json').read()).replace('{{LIP}}',open(f'{P}/lip/lip.json').read())
h=h.replace('{{MASCOT}}',json.dumps({n:'data:image/png;base64,'+b(f'{P}/lip/b_{n}.png') for n in POS}))
h=h.replace('{{LOGOS}}',json.dumps({n:'data:image/png;base64,'+b(f'{P}/assets/{n}.png') for n in ['tiktok','instagram','youtube']}))
import json as _j
h=h.replace('{{HAIR}}',json.dumps({'cover':'data:image/png;base64,'+b(f'{P}/hair/cover-001.png'),'ex':'data:image/png;base64,'+b(f'{P}/hair/ex61.png'),'q':'data:image/png;base64,'+b(f'{P}/hair/quote.png'),'qh':_j.load(open(f'{P}/hair/quote_hl.json'))}))
h=h.replace('{{WORDS}}',json.dumps(json.load(open(f'{P}/work/'+(sys.argv[2] if len(sys.argv)>2 else 'words.json'))),ensure_ascii=False))
open(f'{P}/video.html','w').write(h); print('built',len(h)//1024,'KB')
