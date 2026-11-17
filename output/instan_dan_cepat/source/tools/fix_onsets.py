import json,sys,numpy as np,soundfile as sf
P=sys.argv[1];W=json.load(open(f'{P}/work/words.json'));y,sr=sf.read(f'{P}/vf16.wav');n=int(.02*sr)
db=20*np.log10(np.array([np.sqrt(np.mean(y[i:i+n]**2))+1e-9 for i in range(0,len(y)-n,n)]))
sp=db>-45
def onset(a,b):
    i0,i1=int(a/.02),int(b/.02)
    for i in range(i0,i1):
        if sp[i:i+3].all(): return i*.02
    return a
def offset(a,b):
    i0,i1=int(a/.02),int(b/.02)
    for i in range(i1,i0,-1):
        if sp[i-3:i].all(): return i*.02
    return b
for s in W:
    ws=s['words'];a=onset(s['s'],s['e']);e=offset(s['s'],s['e'])
    if abs(ws[0][1]-a)>.12: print('first word',ws[0][0],ws[0][1],'->',round(a,2)); ws[0][1]=round(a,3)
    # monotonic
    for k in range(1,len(ws)): ws[k][1]=max(ws[k][1],ws[k-1][1]+.06)
    # squeezed runs at the end: spread by characters up to speech end
    k=len(ws)-1
    while k>0 and ws[k][1]-ws[k-1][1]<.12: k-=1
    if k<len(ws)-1:
        run=ws[k:];t0=run[0][1];t1=e-.18*len(run[-1][0])/6;L=sum(len(w[0]) for w in run[:-1]) or 1;acc=0
        if t1>t0+.1*len(run):
            for j,w in enumerate(run): w[1]=round(t0+(t1-t0)*acc/L,3) if j else t0;acc+=len(w[0]) if j<len(run)-1 else 0
            print('spread',[x[0] for x in run],[x[1] for x in run])
json.dump(W,open(f'{P}/work/words.json','w'),ensure_ascii=False)
