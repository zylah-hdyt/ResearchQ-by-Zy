"""Crop a passage from the Hair PDF (clean, no annotations) and return highlight boxes for the key phrase."""
import pdfplumber, subprocess, json, re, sys, os
from PIL import Image
BOOK=sys.argv[1]; OUT=sys.argv[2]; DPI=200; k=DPI/72
norm=lambda w: re.sub(r'[^a-z0-9]','',w.lower())
EX={ # name: (pdf page, passage start, passage end, highlight start, highlight end)
 'm1':(221,'The most commonly used','its explained variance','The coefficient represents the','endogenous latent variable.'),
 'm2':(215,'One of the earliest proposed','not to use this measure in PLS-SEM.','Their research shows that','not to use this measure in PLS-SEM.'),
 'm3':(56,'Small sample size is probably','capabilities (Petter, 2018).','Small sample size is probably','for using PLS-SEM,'),
 'm4':(155,'2015). For example, Henseler','applications of PLS-SEM.','the criterion performs very poorly','applications of PLS-SEM.'),
 'm5':(259,'Prior testing of the significance','longer be used.','which should no','longer be used.'),
 'm6':(152,'higher levels of reliability. Specifically,','slightly rephrase the very same question.','Values above 0.90 (and definitely above 0.95) are not desirable','very same question.'),
 'm7':(221,'The R² value ranges from 0 to 1','models of similar complexity.','Acceptable R2 values are','based on the context.'),
}
pdf=pdfplumber.open(BOOK); info={}
def find(ws,phrase,start=0):
    ph=[norm(x) for x in phrase.split() if norm(x)]
    for j in range(start,len(ws)):
        ok=True;m=0;jj=j
        for p in ph:
            while jj<len(ws) and not norm(ws[jj]['text']): jj+=1
            if jj>=len(ws) or not (norm(ws[jj]['text']).startswith(p) or p.startswith(norm(ws[jj]['text'])) and len(norm(ws[jj]['text']))>=2): ok=False;break
            jj+=1
        if ok: return j,jj-1
    return None
for name,(pg,ps,pe,hs,he) in EX.items():
    p=pdf.pages[pg-1]; ws=p.extract_words(); 
    a=find(ws,ps); b=find(ws,pe,a[0] if a else 0)
    if not a or not b: print(name,'NOT FOUND',a,b); continue
    sel=ws[a[0]:b[1]+1]
    x0=min(w['x0'] for w in sel)-4; x1=max(w['x1'] for w in sel)+4; y0=min(w['top'] for w in sel)-1.2; y1=max(w['bottom'] for w in sel)+2.2
    x0=min(x0,70);x1=max(x1,545)
    png=f'{OUT}/pg{pg}.png'
    if not os.path.exists(png): subprocess.run(['pdftoppm','-f',str(pg),'-l',str(pg),'-r',str(DPI),'-hide-annotations','-png','-singlefile',BOOK,png[:-4]],check=True)
    im=Image.open(png).crop((int(x0*k),int(y0*k),int(x1*k),int(y1*k))); im.save(f'{OUT}/ex_{name}.png')
    h1=find(ws,hs,a[0]); h2=find(ws,he,h1[0] if h1 else a[0])
    lines={}
    if h1 and h2:
        for w in ws[h1[0]:h2[1]+1]:
            key=round(w['top']/3); l=lines.setdefault(key,[w['x0'],w['top'],w['x1'],w['bottom']]); l[0]=min(l[0],w['x0']);l[2]=max(l[2],w['x1']);l[3]=max(l[3],w['bottom'])
    L=[[(v[0]-x0)*k-4,(v[1]-y0)*k-3,(v[2]-v[0])*k+8,(v[3]-v[1])*k+6] for v in sorted(lines.values(),key=lambda v:v[1])]
    info[name]={'w':im.size[0],'h':im.size[1],'lines':L,'page':pg}
    print(name,'page',pg,'crop',im.size,'hl lines',len(L))
json.dump(info,open(f'{OUT}/excerpts.json','w'))
