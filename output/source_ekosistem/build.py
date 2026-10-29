import base64, json, sys
S=sys.argv[1]; V=f'{S}/v7'; F=f'{S}/fonts'
b=lambda p: base64.b64encode(open(p,'rb').read()).decode()
h=open(f'{V}/template.html').read()
for k,p in {'PJS500':'plus-jakarta-sans-5.0.20/files/plus-jakarta-sans-latin-500-normal.woff2','PJS700':'plus-jakarta-sans-5.0.20/files/plus-jakarta-sans-latin-700-normal.woff2',
  'PJS800':'plus-jakarta-sans-5.0.20/files/plus-jakarta-sans-latin-800-normal.woff2','JBM500':'jetbrains-mono-5.0.20/files/jetbrains-mono-latin-500-normal.woff2'}.items():
    h=h.replace('{{'+k+'}}',b(f'{F}/fontsource-{p}'))
img=lambda f:'data:image/jpeg;base64,'+b(f'{V}/assets/{f}')
for k,f in {**{f'YT{i}':f'yt{i}.jpg' for i in range(6)},'EB0':'eb_spss.jpg','EB1':'eb_allinone.jpg','EB2':'eb_sempls_guide.jpg','SITE':'sk_site.jpg','JUDUL':'sk_judul.jpg','YT':'yt_header.jpg'}.items(): h=h.replace('{{'+k+'}}',img(f))
h=h.replace('{{GRAIN}}',json.dumps(['data:image/jpeg;base64,'+b(f'{S}/video/assets/grain{i}.jpg') for i in range(8)]))
open(f'{V}/video.html','w').write(h); print('built',len(h)//1024,'KB')
