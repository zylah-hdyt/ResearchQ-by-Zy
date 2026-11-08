import base64, json, sys
S=sys.argv[1]; P=f'{S}/yt2'; F=f'{S}/fonts'
b=lambda p: base64.b64encode(open(p,'rb').read()).decode()
h=open(f'{P}/template.html').read()
fonts={'INTER500':'inter-5.0.18/files/inter-latin-500-normal.woff2','INTER600':'inter-5.0.18/files/inter-latin-600-normal.woff2','INTER700':'inter-5.0.18/files/inter-latin-700-normal.woff2',
 'PJS800':'plus-jakarta-sans-5.0.20/files/plus-jakarta-sans-latin-800-normal.woff2','JBM500':'jetbrains-mono-5.0.20/files/jetbrains-mono-latin-500-normal.woff2',
 'IS400I':'instrument-serif-5.0.19/files/instrument-serif-latin-400-italic.woff2','ANTON':'anton-5.0.18/files/anton-latin-400-normal.woff2'}
for k,p in fonts.items(): h=h.replace('{{'+k+'}}',b(f'{F}/fontsource-{p}'))
POS=['m_open','m_thumb','m_think','m_point','m_warn','n_present','n_idea','n_shrug','n_wink']
h=h.replace('{{MASCOT}}',json.dumps({n:'data:image/png;base64,'+b(f'{P}/lip/b_{n}.png') for n in POS}))
h=h.replace('{{MOUTHS}}',json.dumps({n:'data:image/png;base64,'+b(f'{P}/lip/mo_{n}.png') for n in POS}))
h=h.replace('{{MOUTHINFO}}',open(f'{P}/lip/mouth.json').read()).replace('{{LIP}}',open(f'{P}/lip/lip.json').read())
h=h.replace('{{LOGOS}}',json.dumps({n:'data:image/png;base64,'+b(f'{S}/p4/assets/{n}.png') for n in ['tiktok','instagram','youtube']}))
H={'cover':'data:image/png;base64,'+b(f'{P}/hair/cover-001.png'),'ex61':'data:image/png;base64,'+b(f'{P}/hair/ex61.png'),'info':json.load(open(f'{P}/hair/excerpts.json'))}
for k in H['info']: H[k]='data:image/png;base64,'+b(f'{P}/hair/ex_{k}.png')
h=h.replace('{{HAIR}}',json.dumps(H))
h=h.replace('{{WORDS}}',json.dumps(json.load(open(f'{P}/work/words.json')),ensure_ascii=False))
open(f'{P}/video.html','w').write(h); print('built',len(h)//1024,'KB')
