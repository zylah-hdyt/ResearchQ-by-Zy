import base64, json, sys, glob
S=sys.argv[1]; P=f'{S}/parnpar'; F=f'{S}/fonts'
b=lambda p: base64.b64encode(open(p,'rb').read()).decode()
h=open(f'{P}/template.html').read()
for k,p in {'INTER500':'inter-5.0.18/files/inter-latin-500-normal.woff2','INTER600':'inter-5.0.18/files/inter-latin-600-normal.woff2','INTER700':'inter-5.0.18/files/inter-latin-700-normal.woff2','PJS800':'plus-jakarta-sans-5.0.20/files/plus-jakarta-sans-latin-800-normal.woff2'}.items(): h=h.replace('{{'+k+'}}',b(f'{F}/fontsource-{p}'))
POS=['m_open','m_thumb','m_think','m_point','m_warn','n_present','n_idea','n_shrug','n_wink']; L=f'{S}/p4/lip'
h=h.replace('{{MASCOT}}',json.dumps({n:'data:image/png;base64,'+b(f'{L}/b_{n}.png') for n in POS})).replace('{{MOUTHS}}',json.dumps({n:'data:image/png;base64,'+b(f'{L}/mo_{n}.png') for n in POS}))
h=h.replace('{{MOUTHINFO}}',open(f'{L}/mouth.json').read()).replace('{{LIP}}',open(f'{P}/lip/lip.json').read())
W=[]
for f in sorted(glob.glob(f'{P}/words_*_*.json'),key=lambda f:int(f.split('_')[-2])): W+=json.load(open(f))
h=h.replace('{{EXCERPTS}}',open(f'{P}/pdf/excerpts.json').read()).replace('{{IMG}}',json.dumps({k:'data:image/png;base64,'+b(f'{P}/pdf/ex_{k}.png') for k in ['title','def','table']}))
h=h.replace('{{WORDS}}',json.dumps(W,ensure_ascii=False))
open(f'{P}/video.html','w').write(h); print('built',len(h)//1024,'KB, sentences',len(W))
