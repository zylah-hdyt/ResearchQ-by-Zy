"""SFX v2 for SPSS Doctor: clearer and more varied (sample library + light synthesis)."""
import numpy as np, soundfile as sf, json, sys
S=sys.argv[1]; R=f'{S}/sfxref'; SR=48000
E=json.load(open('work/events.json')); END=E['END']
OUT=np.zeros((int((END+1)*SR),2)); N_=len(OUT); rs=np.random.default_rng(9)
def load(p):
    x,sr=sf.read(p,dtype='float64'); x=x.mean(1) if x.ndim>1 else x
    if sr!=SR: n=int(len(x)*SR/sr); x=np.interp(np.linspace(0,len(x)-1,n),np.arange(len(x)),x)
    return x
def fit(x,rate=1.0,trim=None):
    if trim: x=x[:int(trim*SR)]
    if rate!=1.0: n=int(len(x)/rate); x=np.interp(np.linspace(0,len(x)-1,n),np.arange(len(x)),x)
    f=int(.006*SR); w=np.ones(len(x)); w[:f]=np.linspace(0,1,f); w[-f:]=np.linspace(1,0,f); return x*w
def put(t,y,g,pan=0.):
    y=y/(np.abs(y).max()+1e-9)*10**(g/20); i=int(max(0,t)*SR); j=min(N_,i+len(y)); y=y[:j-i]
    OUT[i:j,0]+=y*np.sqrt((1-pan)/2)*1.414; OUT[i:j,1]+=y*np.sqrt((1+pan)/2)*1.414
def tone(f,d,dec):
    t=np.arange(int(d*SR))/SR; return (np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*f*2.01*t))*np.exp(-t/dec)*np.minimum(1,t/.003)
K={n:load(f'{R}/s{i:02d}.wav') for i,n in enumerate(['spark','boom','ding','clk1','pop1','clk2','rise','tap','blipT','flut','typing','clk3','blips','swoosh','hit'])}
for k,t in E['ev']:
    p=rs.uniform(-.35,.35)
    if k=='swoosh': put(t-.12,fit(K['swoosh'],rate=rs.uniform(1.0,1.25),trim=.45),-22,p)
    elif k=='pop': put(t,fit(K['pop1'],rate=rs.uniform(.9,1.15)),-24,p)
    elif k=='popbig': put(t,fit(K['pop1'],rate=.8),-21); put(t+.02,fit(K['spark'],rate=1.3,trim=.5),-30)
    elif k=='click': put(t,fit(K['clk1']),-22,p)
    elif k=='tap': put(t,fit(K['tap'],rate=1.2),-24,p)
    elif k.startswith('card'): i=int(k[-1]); put(t,fit(K['pop1'],rate=[.92,1.04,1.16][i]),-23,[-.3,0,.3][i]); put(t+.03,fit(K['clk2'],rate=1.1),-30,[-.3,0,.3][i])
    elif k=='blips': put(t,fit(K['blips'],rate=1.1),-28,p)
    elif k=='paper': put(t,fit(K['flut'],rate=1.05),-22)
    elif k=='fly': put(t,fit(K['swoosh'],rate=1.5,trim=.35),-25)
    elif k=='send': put(t,tone(1046.5,.18,.05)+.7*np.pad(tone(1568,.14,.04),(int(.05*SR),0))[:int(.18*SR)],-27)
    elif k=='typing': put(t,fit(K['typing'],trim=1.5),-27)
    elif k=='morph': put(t,fit(K['rise'],rate=1.6),-25); put(t+.25,fit(K['swoosh'],rate=1.3,trim=.35),-27)
    elif k=='ding': put(t,fit(K['ding']),-23)
    elif k=='confirm': put(t,fit(K['ding']),-21); put(t+.05,fit(K['spark'],rate=1.2,trim=.7),-28)
    elif k=='riser': put(t,fit(K['rise'],rate=.9),-24)
    elif k=='hit': put(t,fit(K['hit'],trim=1.4),-25)
sf.write('work/sfx.wav',OUT,SR,subtype='FLOAT'); print('END',round(END,2),'peak %.1f dB'%(20*np.log10(np.abs(OUT).max())),'events',len(E['ev']))
