import base64,json,sys,glob,os,io
from PIL import Image
PK,P=sys.argv[1:3];b=lambda p:base64.b64encode(open(p,'rb').read()).decode()
h=open(f'{P}/template_ref.html').read();F=f'{PK}/assets/fonts'
for k,f in {'INTER500':'inter-latin-500-normal.woff2','INTER600':'inter-latin-600-normal.woff2','INTER700':'inter-latin-700-normal.woff2','PJS800':'plus-jakarta-sans-latin-800-normal.woff2','JBM500':'jetbrains-mono-latin-500-normal.woff2'}.items(): h=h.replace('{{'+k+'}}',b(f'{F}/{f}'))
POS=['m_open','m_thumb','m_think','m_point','m_warn','n_present','n_idea','n_shrug','n_wink'];M=f'{PK}/assets/mascot'
h=h.replace('{{MASCOT}}',json.dumps({n:'data:image/png;base64,'+b(f'{M}/poses/b_{n}.png') for n in POS})).replace('{{MOUTHS}}',json.dumps({n:'data:image/png;base64,'+b(f'{M}/mouths/mo_{n}.png') for n in POS}))
h=h.replace('{{MOUTHINFO}}',open(f'{M}/mouth.json').read()).replace('{{LIP}}',open(f'{P}/lip/lip.json').read())
PH={}
for f in sorted(glob.glob(f'{P}/assets/*/*.jpg')):
    n=os.path.basename(f)[:-4]
    if "'"+n+"'" not in h: continue
    im=Image.open(f).convert('RGB');im.thumbnail((1500,1500));bio=io.BytesIO();im.save(bio,'JPEG',quality=86);PH[n]='data:image/jpeg;base64,'+base64.b64encode(bio.getvalue()).decode()
import re
COL={'claude':'#D97757','openai':'#111111','googlegemini':'url(#gg)','perplexity':'#1FB8CD','githubcopilot':'#111111'}
AIL={}
for k,c in COL.items():
    sv=open(f'{P}/assets/logos_ai/{k}.svg').read();sv=re.sub(r'<title>.*?</title>','',sv)
    defs='<defs><linearGradient id="gg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4796E3"/><stop offset=".55" stop-color="#9168C0"/><stop offset="1" stop-color="#D96570"/></linearGradient></defs>' if k=='googlegemini' else ''
    sv=sv.replace('<path ',defs+f'<path fill="{c}" ',1);AIL[k]=sv
YTT={os.path.basename(f)[:-4]:'data:image/jpeg;base64,'+b(f) for f in glob.glob(f'{P}/assets/yt_thumbs/*.jpg') if not os.path.basename(f).startswith('_')}
h=h.replace('{{AILOGOS}}',json.dumps(AIL)).replace('{{YTTHUMBS}}',json.dumps(YTT))
h=h.replace('{{PHOTOS}}',json.dumps(PH)).replace('{{WORDS}}',open(f'{P}/work/words.json').read())
open(f'{P}/video_ref.html','w').write(h);print('built',len(h)//1024,'KB photos',sorted(PH))
