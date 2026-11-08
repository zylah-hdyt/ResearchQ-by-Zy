"""SFX bed for the 7 PLS-SEM mistakes video (long-form: calm, sparse), timed from the same line onsets as the visuals."""
import numpy as np, soundfile as sf, json, sys
S=sys.argv[1]; P=f'{S}/yt2'; R=f'{S}/sfxref'; SR=48000
WD=json.load(open(f'{P}/work/words.json')); ST=[w['s'] for w in WD]; END=WD[-1]['e']+8.5
SL={}
for i,w in enumerate(WD): SL.setdefault(w['sec'],[]).append(i)
LN=lambda s,j: ST[SL[s][j]]
def W(k,i): ws=WD[k]['words']; return ws[min(i,len(ws)-1)][1]
LW=lambda s,j,i: W(SL[s][j],i)
SS={s:(0 if s=='intro' else LN(s,0)-1.15) for s in SL}
OUT=np.zeros((int((END+1)*SR),2)); N_=len(OUT)
def load(p):
    x,sr=sf.read(p,dtype='float64'); x=np.stack([x,x],1) if x.ndim==1 else x
    if sr!=SR:
        n=int(len(x)*SR/sr); idx=np.linspace(0,len(x)-1,n); x=np.stack([np.interp(idx,np.arange(len(x)),x[:,c]) for c in range(2)],1)
    return x
def fit(x,rate=1.0,trim=None):
    if trim: x=x[:int(trim*SR)]
    if rate!=1.0:
        n=int(len(x)/rate); idx=np.linspace(0,len(x)-1,n); x=np.stack([np.interp(idx,np.arange(len(x)),x[:,c]) for c in range(2)],1)
    f=int(.008*SR); w=np.ones(len(x)); w[:f]=np.linspace(0,1,f); w[-f:]=np.linspace(1,0,f); return x*w[:,None]
def put(t,x,g):
    x=x/(np.abs(x).max()+1e-9)*10**(g/20); i=int(max(0,t)*SR); j=min(N_,i+len(x)); OUT[i:j]+=x[:j-i]
def nz(t,d,g,f0=1200,f1=4000):
    n=int(d*SR); rs=np.random.default_rng(int(t*100)); w=rs.standard_normal(n); X=np.fft.rfft(w); f=np.fft.rfftfreq(n,1/SR); X[(f<f0)|(f>f1)]=0
    y=np.fft.irfft(X,n)*np.hanning(n); put(t,np.stack([y,y],1),g)
K={k:load(f'{R}/s{k:02d}.wav') for k in range(15)}
spark,boom,ding,clk1,pop1,clk2,rise,tap,blipT,flut,typing,clk3,blips,swoosh,hit=[K[k] for k in range(15)]
def stamp(t): put(t+.04,fit(boom,rate=1.6,trim=.3),-24); put(t+.02,fit(tap,rate=.85),-26)
def dg(t,i=0,g=-26): put(t,fit(ding,rate=1+.1*i),g)
# intro
put(.15,fit(hit,trim=1.4),-27); put(LN('intro',2)+.15,fit(flut,rate=1.3),-27)
for i in range(7): put(LN('intro',2)+.1+i*.12,fit(pop1,rate=.9+.05*i),-31)
for s in ['m1','m2','m3','m4','m5','m6','m7']:
    a=SS[s]; put(a-.05,fit(swoosh,rate=1.2,trim=.45),-28); put(a+.12,fit(boom,rate=1.3,trim=.5),-27)   # title card
    put(LN(s,0)+.05,fit(pop1,rate=.95),-30); put(LN(s,0)+.55,fit(swoosh,rate=1.7,trim=.25),-33)        # myth + source cards
EV={'m1':[('stamp',LN('m1',1)+.3),('pop',LN('m1',2)-.1),('stamp',LN('m1',3)),('pop',LN('m1',4)-.05),('nz',LW('m1',4,10)),('do',LN('m1',5)-.1,2)],
    'm2':[('pop',LN('m2',1)),('stamp',LN('m2',2)),('nz',LN('m2',2)),('do',LN('m2',5)-.1,3)],
    'm3':[('stamp',LN('m3',1)),('pop',LN('m3',1)-.1),('nz',LN('m3',1)),('tap',LN('m3',2)),('pop',LN('m3',3)-.1),('bar',LW('m3',3,15)),('ding',LN('m3',4))],
    'm4':[('stamp',LN('m4',2)),('pop',LN('m4',2)-.1),('nz',LW('m4',2,3)),('pop',LN('m4',3)-.1),('slide',LN('m4',3)+.4),('tap',LN('m4',4)+.5)],
    'm5':[('stamp',LN('m5',1)+.3),('pop',LN('m5',1)-.1),('nz',LW('m5',1,4)),('pop',LN('m5',2)),('do',LN('m5',3)-.1,2)],
    'm6':[('pop',LN('m6',1)-.1),('slide',LN('m6',1)+.3),('stamp',LN('m6',2)+.3),('pop',LN('m6',2)+1.6),('nz',LN('m6',2)+1.8),('pop',LN('m6',3)+.8),('pop',LN('m6',3)+1.2)],
    'm7':[('stamp',LN('m7',1)),('pop',LN('m7',1)-.1),('nz',LN('m7',1)+.3),('pop',LN('m7',2)-.1),('pop',LN('m7',2)+1.6),('tap',LN('m7',3)),('ding',LN('m7',4))]}
for s,evs in EV.items():
    for e in evs:
        k,t=e[0],e[1]
        if k=='stamp': stamp(t)
        elif k=='pop': put(t,fit(pop1,rate=1.05),-30)
        elif k=='nz': nz(t,.6,-40,2500,5500)
        elif k=='tap': put(t,fit(tap,rate=1.2),-29)
        elif k=='ding': dg(t,2)
        elif k=='bar': nz(t,1.5,-40,600,2400); dg(t+1.0,0,-28); dg(t+1.6,2,-28)
        elif k=='slide': nz(t,1.2,-40,500,2200)
        elif k=='do':
            put(t,fit(swoosh,rate=1.5,trim=.3),-31)
            for i in range(e[2]): dg(t+.15+i*.35,i,-27)
# outro
put(SS['outro']-.05,fit(swoosh,rate=1.1,trim=.45),-27)
ws=WD[SL['outro'][1]]['words']
for j,i in enumerate([0,3,5,9,12,15,21]): dg(ws[min(i,len(ws)-1)][1],j%4,-29)
put(LN('outro',2)-.1,fit(flut,rate=1.3),-28); put(LN('outro',3),fit(clk2),-25)
a=END-8; put(a,fit(swoosh,rate=.9),-25)
for i in range(3): put(a+.5+i*.18,fit(pop1,rate=1+.1*i),-25)
put(a+1.0,fit(hit,trim=1.6),-27)
sf.write(f'{P}/work/sfx.wav',OUT,SR,subtype='FLOAT'); print('END',round(END,2),'peak %.1f dB'%(20*np.log10(np.abs(OUT).max())))
