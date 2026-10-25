import base64, json, sys, os
S=sys.argv[1]; V=f'{S}/v3'; F=f'{S}/fonts'
b=lambda p: base64.b64encode(open(p,'rb').read()).decode()
h=open(f'{V}/template.html').read()
rep={'PJS500':f'{F}/fontsource-plus-jakarta-sans-5.0.20/files/plus-jakarta-sans-latin-500-normal.woff2',
     'PJS700':f'{F}/fontsource-plus-jakarta-sans-5.0.20/files/plus-jakarta-sans-latin-700-normal.woff2',
     'PJS800':f'{F}/fontsource-plus-jakarta-sans-5.0.20/files/plus-jakarta-sans-latin-800-normal.woff2',
     'JBM500':f'{F}/fontsource-jetbrains-mono-5.0.20/files/jetbrains-mono-latin-500-normal.woff2',
     'IS400I':f'{F}/fontsource-instrument-serif-5.0.19/files/instrument-serif-latin-400-italic.woff2'}
for k,p in rep.items(): h=h.replace('{{'+k+'}}',b(p))
h=h.replace('{{PAPER}}','data:image/jpeg;base64,'+b(f'{S}/video/assets/paper.jpg'))
h=h.replace('{{GRAIN}}',json.dumps(['data:image/jpeg;base64,'+b(f'{S}/video/assets/grain{i}.jpg') for i in range(8)]))
open(f'{V}/video.html','w').write(h); print('built',len(h)//1024,'KB')
