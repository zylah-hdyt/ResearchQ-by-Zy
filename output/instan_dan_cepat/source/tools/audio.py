"""Cinematic SFX for 'Instan dan Cepat'. usage: audio.py <PACK> <PROJECT>"""
import numpy as np, soundfile as sf, json, sys
PK,PJ=sys.argv[1:3];R=f'{PK}/assets/sfx';SR=48000
E=json.load(open(f'{PJ}/work/events.json'));END=E['END'];OUT=np.zeros((int((END+1)*SR),2));N_=len(OUT);rs=np.random.default_rng(21)
def load(p):
    x,sr=sf.read(p,dtype='float64');x=x.mean(1) if x.ndim>1 else x
    if sr!=SR: n=int(len(x)*SR/sr);x=np.interp(np.linspace(0,len(x)-1,n),np.arange(len(x)),x)
    return x
def fit(x,rate=1.,trim=None):
    if trim: x=x[:int(trim*SR)]
    if rate!=1.: n=int(len(x)/rate);x=np.interp(np.linspace(0,len(x)-1,n),np.arange(len(x)),x)
    f=int(.006*SR);w=np.ones(len(x));w[:f]=np.linspace(0,1,f);w[-f:]=np.linspace(1,0,f);return x*w
def put(t,y,g,pan=0.):
    y=y/(np.abs(y).max()+1e-9)*10**(g/20);i=int(max(0,t)*SR);j=min(N_,i+len(y));y=y[:j-i]
    OUT[i:j,0]+=y*np.sqrt((1-pan)/2)*1.414;OUT[i:j,1]+=y*np.sqrt((1+pan)/2)*1.414
def bpnoise(d,f0,f1,q=.5):
    n=int(d*SR);src=rs.standard_normal(n+2048);y=np.zeros(n+2048);B=2048;H=512;w=np.hanning(B);f=np.fft.rfftfreq(B,1/SR)
    for i in range(0,n,H):
        p=i/max(1,n);fc=f0*(f1/f0)**p;X=np.fft.rfft(src[i:i+B]*w);X*=np.exp(-.5*(np.log(f+1)-np.log(fc))**2/q**2);y[i:i+B]+=np.fft.irfft(X,B)*w
    return y[:n]
def env(n,a,r):t=np.arange(n)/SR;return np.minimum(1,t/a)*np.exp(-t/r)
NM=['spark','boom','ding','clk1','pop1','clk2','rise','tap','blipT',None,'typing','clk3','blips','swoosh','hit']
K={n:load(f'{R}/s{i:02d}.wav') for i,n in enumerate(NM) if n}
for k,t in E['ev']:
    p=rs.uniform(-.3,.3)
    if k=='whoosh': n=int(.55*SR);y=bpnoise(.55,500,4200,.6)*np.sin(np.pi*np.arange(n)/n)**1.5;put(t-.2,y,-24,p)
    elif k=='swoosh': put(t-.1,fit(K['swoosh'],rate=rs.uniform(1.,1.2),trim=.45),-25,p)
    elif k=='hit':
        n=int(.9*SR);tt=np.arange(n)/SR;sub=np.sin(2*np.pi*(55*np.exp(-tt*2.5)+38)*tt)*np.exp(-tt/.22);put(t,sub+.6*bpnoise(.9,1800,300,.8)*env(n,.002,.08),-21)
    elif k=='hit2': put(t,fit(K['boom'],rate=1.1,trim=.5),-25); put(t+.01,fit(K['spark'],rate=1.2,trim=.5),-31)
    elif k=='boom': put(t,fit(K['boom'],rate=.9,trim=.55),-22)
    elif k=='boom2': put(t,fit(K['boom'],rate=1.0,trim=.45),-25)
    elif k=='pop': put(t,fit(K['pop1'],rate=rs.uniform(.95,1.1)),-26,p)
    elif k=='pop2': put(t,fit(K['pop1'],rate=1.18),-26,.25)
    elif k.startswith('card'): i=int(k[-1]); put(t,fit(K['pop1'],rate=[.95,1.06,1.17][i]),-27,[-.3,.3,0][i])
    elif k=='rewind':
        n=int(1.0*SR);tt=np.arange(n)/SR;y=bpnoise(1.0,900,2600,.35)*(.55+.45*np.sin(2*np.pi*(9+14*tt)*tt));y*=np.minimum(1,tt/.08)*np.minimum(1,(1-tt)/.12);put(t,y,-27)
    elif k=='flash': put(t,fit(K['spark'],rate=.9,trim=.7),-29)
    elif k=='tick': put(t,fit(K['clk3'],rate=1.0),-26)
    elif k=='marker': n=int(.3*SR);y=bpnoise(.3,3000,6000,.4)*np.sin(np.pi*np.arange(n)/n)**2;put(t,y,-32,p)
    elif k=='soft': n=int(.7*SR);y=bpnoise(.7,700,1800,.5)*np.sin(np.pi*np.arange(n)/n)**2;put(t-.3,y,-31,p)
    elif k=='step': put(t,fit(K['tap'],rate=.85),-29)
    elif k=='shutter': put(t,fit(K['clk1'],rate=1.1),-25,p); put(t+.07,fit(K['clk3'],rate=1.3),-29,p)
    elif k=='chime':
        n=int(1.6*SR);tt=np.arange(n)/SR;y=sum(a*np.sin(2*np.pi*f*tt)*np.exp(-tt/d) for f,a,d in [(1046.5,1,.6),(1568,.5,.45),(2093,.25,.3),(2637,.12,.25)])*np.minimum(1,tt/.004);put(t,y,-30)
    elif k=='riser': put(t,fit(K['rise'],rate=.95),-26); n=int(1.1*SR);put(t,bpnoise(1.1,400,5000,.5)*np.linspace(0,1,n)**2,-30)
    elif k=='typing': put(t,fit(K['typing'],trim=2.2),-29)
    elif k=='typing2': put(t,fit(K['typing'],rate=1.1,trim=.9),-30)
    elif k=='live': put(t,fit(K['ding'],rate=1.0),-27); 
    elif k=='blip': put(t,fit(K['blipT'],rate=rs.uniform(1.,1.15),trim=.25),-30,p)
    elif k=='slide': n=int(.6*SR);y=bpnoise(.6,300,2500,.6)*np.sin(np.pi*np.arange(n)/n)**1.2;put(t-.1,y,-26)
    elif k=='drone': n=int(3.2*SR);tt=np.arange(n)/SR;y=bpnoise(3.2,90,160,.6)*np.minimum(1,tt/.8)*np.minimum(1,(3.2-tt)/1.2);put(t,y,-33)
sf.write(f'{PJ}/work/sfx.wav',OUT,SR,subtype='FLOAT');print('END',round(END,2),'peak %.1f dB'%(20*np.log10(np.abs(OUT).max()+1e-9)),'events',len(E['ev']))
