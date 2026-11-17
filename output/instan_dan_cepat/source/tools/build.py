import base64,json,sys,glob,os
PK,P=sys.argv[1:3];b=lambda p:base64.b64encode(open(p,'rb').read()).decode()
h=open(f'{P}/template.html').read();F=f'{PK}/assets/fonts'
for k,f in {'INTER500':'inter-latin-500-normal.woff2','INTER600':'inter-latin-600-normal.woff2','INTER700':'inter-latin-700-normal.woff2','PJS800':'plus-jakarta-sans-latin-800-normal.woff2','ISERIF':'instrument-serif-latin-400-italic.woff2'}.items(): h=h.replace('{{'+k+'}}',b(f'{F}/{f}'))
POS=['m_open','m_thumb','m_think','m_point','m_warn','n_present','n_idea','n_shrug','n_wink'];M=f'{PK}/assets/mascot'
h=h.replace('{{MASCOT}}',json.dumps({n:'data:image/png;base64,'+b(f'{M}/poses/b_{n}.png') for n in POS})).replace('{{MOUTHS}}',json.dumps({n:'data:image/png;base64,'+b(f'{M}/mouths/mo_{n}.png') for n in POS}))
h=h.replace('{{MOUTHINFO}}',open(f'{M}/mouth.json').read()).replace('{{LIP}}',open(f'{P}/lip/lip.json').read())
MED={}
for f in sorted(glob.glob(f'{P}/media/*.jpg')):
    n=os.path.basename(f)[:-4]
    if "'"+n+"'" not in h: continue
    MED[n]={'img':'data:image/jpeg;base64,'+b(f),'dep':'data:image/png;base64,'+b(f[:-4]+'_d.png')}
T=f'{PK}/assets/textures';h=h.replace('{{PAPER}}','data:image/jpeg;base64,'+b(f'{T}/paper.jpg')).replace('{{GRAIN}}',json.dumps(['data:image/jpeg;base64,'+b(f'{T}/grain{i}.jpg') for i in range(8)]))
h=h.replace('{{MEDIA}}',json.dumps(MED)).replace('{{WORDS}}',open(f'{P}/work/words.json').read())
open(f'{P}/video.html','w').write(h);print('built',len(h)//1024,'KB media',len(MED),sorted(MED))
