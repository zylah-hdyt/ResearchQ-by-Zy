"""SFX for the SEM history video: events exported from the page (work/events.json) + whooshes derived from camera speed."""
import numpy as np, soundfile as sf, json, sys
S=sys.argv[1]; R=f'{S}/sfxref'; SR=48000
E=json.load(open('work/events.json')); END=E['END']; sp=np.array(E['sp'])
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
def put(t,x,g,pan=0.):
    x=x/(np.abs(x).max()+1e-9)*10**(g/20); i=int(max(0,t)*SR); j=min(N_,i+len(x)); x=x[:j-i]
    OUT[i:j,0]+=x[:,0]*np.sqrt((1-pan)/2)*1.414; OUT[i:j,1]+=x[:,1]*np.sqrt((1+pan)/2)*1.414
def sweep(t,d,g,f0,f1,pan=0.):
    n=int(d*SR); rs=np.random.default_rng(int(t*1000)%2**31); src=rs.standard_normal(n+2048); y=np.zeros(n+2048); B=2048; H=512; w=np.hanning(B)
    for i in range(0,n,H):
        p=i/max(1,n); fc=f0*(f1/f0)**p; X=np.fft.rfft(src[i:i+B]*w); f=np.fft.rfftfreq(B,1/SR); X*=np.exp(-.5*(np.log(f+1)-np.log(fc))**2/.5**2); y[i:i+B]+=np.fft.irfft(X,B)*w
    y=y[:n]; tt=np.linspace(0,1,n); env=np.sin(np.pi*tt)**1.5; y=y*env; put(t,np.stack([y,y],1),g,pan)
K={k:load(f'{R}/s{k:02d}.wav') for k in range(15)}
spark,boom,ding,clk1,pop1,clk2,rise,tap,blipT,flut,typing,clk3,blips,swoosh,hit=[K[k] for k in range(15)]
for k,t,x in E['ev']:
    pan=[-.3,.3,-.15,.15][int(x)%4] if isinstance(x,(int,float)) else 0
    if k=='hit': put(t,fit(hit,trim=1.5),-27)
    elif k=='pop': put(t,fit(pop1,rate=.92+.05*(int(x)%4)),-29,pan)
    elif k=='boom': put(t,fit(boom,rate=1.1,trim=.55),-26); put(t+.02,fit(spark,rate=1.2,trim=.6),-36)
    elif k=='paper': put(t,fit(flut,rate=1.1),-28)
    elif k=='tap': put(t,fit(tap,rate=1.1+.08*x),-30,pan)
    elif k=='tick': put(t,fit(clk3,rate=1.5,trim=.07),-32,pan)
    elif k=='stamp': put(t+.04,fit(boom,rate=1.6,trim=.3),-23); put(t+.02,fit(tap,rate=.85),-25)
    elif k=='type': put(t,fit(typing,trim=min(1.9,x)),-29)
    elif k=='swoosh': put(t,fit(swoosh,rate=1.3,trim=.4),-30,pan)
    elif k=='swish': sweep(t,.7,-34,700,4200)
    elif k=='click': put(t,fit(clk1),-25)
    elif k=='road': sweep(t,2.2,-33,250,1800)
    elif k=='ding': put(t,fit(ding,rate=1+.06*(int(x)%6)),-30,pan)
    elif k=='blips': put(t,fit(blips),-31)
    elif k=='rise': put(t,fit(rise,rate=.6),-28); sweep(t,1.8,-33,180,1200)
# camera whooshes: every fast move gets a sweep shaped to its length and speed
fast=sp>60; i=0
while i<len(sp):
    if fast[i]:
        j=i
        while j<len(sp) and fast[j]: j+=1
        d=(j-i)/30
        if d>=.25:
            pk=sp[i:j].max(); g=-30+min(6,(pk-60)/120)
            sweep(i/30-.08,d+.25,g,300,2600)
        i=j
    else: i+=1
sf.write('work/sfx.wav',OUT,SR,subtype='FLOAT'); print('END',round(END,2),'peak %.1f dB'%(20*np.log10(np.abs(OUT).max())))
