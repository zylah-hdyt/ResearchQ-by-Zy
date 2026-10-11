import numpy as np, wave, json, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=44100; D=40.0; N=int(SR*D); rng=np.random.default_rng(101)
K=json.load(open(sys.argv[1])); E=K['e']; keys=K['k']
def bp(x,a,b): return sosfilt(butter(2,[a,b],'band',fs=SR,output='sos'),x)
def lp(x,f): return sosfilt(butter(2,f,'low',fs=SR,output='sos'),x)
mf=lambda m:440*2**((m-69)/12)
def env(n,a,d): t=np.arange(n)/SR; return np.minimum(1,t/a)*np.exp(-t/d)
out=np.zeros(N)
def add(t0,s,g):
    i=int(t0*SR); n=min(len(s),N-i)
    if n>0 and i>=0: out[i:i+n]+=s[:n]*g
def swish(dur):
    n=int(dur*SR); t=np.arange(n)/SR; x=rng.normal(0,1,n); y=np.zeros(n); ch=int(0.015*SR)
    for s0 in range(0,n,ch):
        c=s0/n; f=400+2200*np.sin(np.pi*c); y[s0:s0+ch]=bp(x[s0:s0+ch],f*0.6,min(SR/2-100,f*1.5))
    return y*np.sin(np.pi*t/dur)**3
def glass(f,dur=0.6):
    n=int(dur*SR); t=np.arange(n)/SR
    return (np.sin(2*np.pi*f*t)+0.4*np.sin(2*np.pi*f*2.76*t)*np.exp(-t/0.05))*env(n,0.001,0.14)
def key(pitch=1.0):
    n=int(0.03*SR); t=np.arange(n)/SR
    click=bp(rng.normal(0,1,n),1500*pitch,6000*pitch)*env(n,0.0004,0.005)
    body=np.sin(2*np.pi*(180*pitch)*t)*env(n,0.001,0.012)*0.6
    return click+body
def tap():
    n=int(0.025*SR); t=np.arange(n)/SR; return (np.sin(2*np.pi*2600*t)+bp(rng.normal(0,1,n),2000,7000))*env(n,0.0003,0.004)
def thump():
    n=int(0.45*SR); t=np.arange(n)/SR; f=100*np.exp(-t*12)+48; return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.002,0.14)
def pop(f=520):
    n=int(0.09*SR); t=np.arange(n)/SR; fr=f*(1+1.1*(t/0.09)**0.5); return np.sin(2*np.pi*np.cumsum(fr)/SR)*env(n,0.002,0.025)
def scratch(dur=0.35):
    n=int(dur*SR); t=np.arange(n)/SR; x=bp(rng.normal(0,1,n),1800,5000)
    return x*(0.6+0.4*np.sin(2*np.pi*26*t))*np.minimum(1,t/0.02)*np.minimum(1,(dur-t)/0.08)
# hook
add(0.12,glass(mf(67),0.5),0.04); add(0.78,tap(),0.12); add(1.12,glass(mf(76),0.5),0.05)
add(2.52,thump(),0.16); add(2.56,glass(mf(84)),0.06)
for t,f in [(3.05,480),(3.22,520),(3.46,580)]: add(t,pop(f),0.08)
add(4.42,swish(0.55),0.16)
# typing (soft, varied)
prev=None
for i,t in enumerate(keys):
    back = prev is not None and t-prev>0 and 0.055<t-prev<0.065 and 37<=i<=41
    add(t,key(0.8 if back else 0.9+0.25*rng.random()),0.07+0.03*rng.random()); prev=t
add(E,key(0.7),0.16); add(E+0.02,thump(),0.1); add(E+0.08,glass(mf(79)),0.05)
for d in (0.62,0.84,1.0): add(E+d,tap(),0.05)
# analisis
add(10.9,thump(),0.12)
for t,m in [(12.15,72),(12.62,76),(12.98,79)]: add(t,swish(0.35),0.07); add(t+0.18,glass(mf(m),0.5),0.045)
add(14.25,tap(),0.1); add(14.75,scratch(0.6),0.05)
# objek
add(17.0,pop(440),0.1); add(17.85,scratch(0.32),0.1); add(18.45,swish(0.4),0.08); add(20.4,swish(0.4),0.07)
# board
add(22.95,swish(0.55),0.16)
for i in range(10): add(24.25+i*0.13,tap(),0.035)
add(26.25,swish(0.5),0.06); add(26.85,thump(),0.22); add(26.87,tap(),0.15); add(27.45,glass(mf(81)),0.05)
# genesis
add(30.85,glass(mf(72),0.8),0.05); add(30.9,glass(mf(79),0.8),0.035); add(31.25,scratch(0.5),0.03); add(32.85,tap(),0.08)
# cta
add(35.3,pop(480),0.11); add(35.8,glass(mf(84)),0.05); add(36.7,pop(560),0.11); add(37.3,pop(620),0.07)
add(38.4,tap(),0.3); add(38.55,glass(mf(86),1.0),0.06); add(38.6,glass(mf(93),1.0),0.04)
out=lp(out,9500)
ir=lambda: (lambda a:(a.__setitem__(0,1),a)[1])(np.exp(-np.arange(int(0.6*SR))/SR/0.18)*rng.normal(0,1,int(0.6*SR))*0.022)
L=fftconvolve(out,ir())[:N]; Rr=fftconvolve(out,ir())[:N]
m=np.max(np.abs(np.r_[L,Rr])); L/=m; Rr/=m
pcm=(np.stack([L,Rr],1)*32767*0.56).astype(np.int16)
w=wave.open(sys.argv[2],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('sfx ok')
