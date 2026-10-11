# EP01 v2 — premium sound design (no music). New palette: FM mallet, thock keys, reverse swells,
# sub drops, paper flicks, digital blips, click-locks, stereo placement.
import numpy as np, wave, json, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; D=40.0; N=int(SR*D); rng=np.random.default_rng(2026)
C=json.load(open(sys.argv[1])); cue=C['c']; keys=C['k']; E=cue['enter']
L=np.zeros(N); Rr=np.zeros(N)
def f2(x,kind,f): return sosfilt(butter(2,f,kind,fs=SR,output='sos'),x)
mf=lambda m:440*2**((m-69)/12)
T=lambda n:np.arange(n)/SR
def env(n,a,d): t=T(n); return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
def add(t0,s,g,pan=0.0):
    i=int(t0*SR); n=min(len(s),N-i)
    if n<=0 or i<0: return
    a=(pan+1)*np.pi/4; L[i:i+n]+=s[:n]*g*np.cos(a); Rr[i:i+n]+=s[:n]*g*np.sin(a)
def mallet(f,dur=0.9,bright=1.0):          # FM woody mallet
    n=int(dur*SR); t=T(n); idx=bright*3.2*np.exp(-t/0.035)
    s=np.sin(2*np.pi*f*t+idx*np.sin(2*np.pi*f*4.0*t))+0.25*np.sin(2*np.pi*f*2*t)*np.exp(-t/0.12)
    return s*env(n,0.002,0.22)
def thock(p=1.0):                          # mechanical keycap
    n=int(0.07*SR); t=T(n)
    body=np.sin(2*np.pi*(150*p)*t)*env(n,0.001,0.018)
    clk=f2(rng.normal(0,1,n),'band',[900*p,3200*p])*env(n,0.0005,0.006)
    return f2(body*0.9+clk*0.55,'low',5000)
def softkey(p=1.0):                        # typing (rounded, quiet)
    n=int(0.045*SR); t=T(n)
    return f2(f2(rng.normal(0,1,n),'band',[700*p,2600*p])*env(n,0.0008,0.007)+np.sin(2*np.pi*220*p*t)*env(n,0.001,0.01)*0.5,'low',4500)
def revswell(dur=0.6):                     # reverse air into a hit
    n=int(dur*SR); x=rng.normal(0,1,n); y=np.zeros(n); ch=int(0.01*SR)
    for s0 in range(0,n,ch):
        c=s0/n; y[s0:s0+ch]=f2(x[s0:s0+ch],'low',300+5000*c**2)
    return y*(np.linspace(0,1,n)**2.5)
def air(dur=0.5,up=True):                  # soft whoosh, lowpass sweep
    n=int(dur*SR); x=rng.normal(0,1,n); y=np.zeros(n); ch=int(0.01*SR)
    for s0 in range(0,n,ch):
        c=s0/n; c=c if up else 1-c; y[s0:s0+ch]=f2(x[s0:s0+ch],'low',250+3500*np.sin(np.pi*c/1.0)**2)
    return y*np.sin(np.pi*T(n)/dur)**2
def sub(dur=0.7,f0=72,f1=38):              # sub drop
    n=int(dur*SR); t=T(n); f=f1+(f0-f1)*np.exp(-t*7)
    return np.tanh(1.6*np.sin(2*np.pi*np.cumsum(f)/SR))*env(n,0.004,0.22)
def flick():                               # paper / card flip
    n=int(0.12*SR); x=rng.normal(0,1,n)
    a=f2(x,'band',[1500,7000])*env(n,0.0005,0.012); b=np.roll(f2(x,'band',[800,4000])*env(n,0.0005,0.02),int(0.035*SR))
    return a+0.7*b
def blip(f=1200):                          # digital blip, pitch drop
    n=int(0.06*SR); t=T(n); fr=f*(1-0.45*t/0.06); return np.sin(2*np.pi*np.cumsum(fr)/SR)*env(n,0.001,0.014)
def lock():                                # click-lock
    n=int(0.09*SR); t=T(n)
    a=f2(rng.normal(0,1,n),'band',[2500,9000])*env(n,0.0003,0.003)
    b=np.roll(np.sin(2*np.pi*90*t)*env(n,0.001,0.03),int(0.018*SR))+np.roll(f2(rng.normal(0,1,n),'band',[1200,4000])*env(n,0.0003,0.004),int(0.018*SR))
    return a+0.8*b
def shimmer(base=88,dur=1.2):              # airy success cluster
    n=int(dur*SR); t=T(n); s=np.zeros(n)
    for k,m in enumerate([base,base+4,base+7,base+11]):
        s+=np.sin(2*np.pi*mf(m)*t+0.3*k)*np.minimum(1,t/(0.03+0.04*k))*np.exp(-t/0.35)
    return s/4
def zip_(dur=0.28):
    n=int(dur*SR); x=rng.normal(0,1,n); y=np.zeros(n); ch=int(0.008*SR)
    for s0 in range(0,n,ch): c=s0/n; f=900+4500*c; y[s0:s0+ch]=f2(x[s0:s0+ch],'band',[f*0.7,min(SR/2-200,f*1.3)])
    return y*np.sin(np.pi*T(n)/dur)
# scale: A major pentatonic, low register (warm)
P=[57,59,61,64,66,69,71,73,76,78,81]
# ---------- S1 ----------
add(0.05,revswell(0.25),0.10); add(0.12,mallet(mf(57),1.0,0.7),0.10,-0.2)
add(0.72,flick(),0.06,0.2)
add(1.12,mallet(mf(64),1.0),0.09,0.1); add(1.12,sub(0.5,60,40),0.10)
add(2.2,blip(900),0.05)
for i,(t0,pan) in enumerate([(2.95,-0.5),(3.1,0),(3.25,0.5)]): add(t0,thock(0.7),0.10,pan)
for (t0,m,pan) in [(3.2,69,-0.5),(3.45,73,0),(3.78,76,0.5)]:
    add(t0,thock(1.0),0.20,pan); add(t0+0.01,mallet(mf(m),0.8),0.07,pan)
# ---------- S2 ----------
add(4.0,revswell(0.45),0.12); add(4.5,air(0.6),0.13,0.3); add(4.95,sub(0.8),0.12)
for k,t0 in enumerate(keys): add(t0,softkey(0.85+0.3*rng.random()),0.05+0.025*rng.random(),-0.15+0.3*rng.random())
for s,m,pan in [('#t1',69,0.6),('#t2',73,-0.6),('#t3',76,0.6)]:
    add(cue[s],blip(1400),0.06,pan); add(cue[s]+0.02,mallet(mf(m),0.7,0.6),0.055,pan)
add(E-0.75,air(0.6),0.04,0.5)
add(E,lock(),0.22,0.4); add(E+0.04,shimmer(81,0.9),0.035,0.3)
add(E+0.06,air(0.4,False),0.06)
for t0,pan in zip(cue['hl'],(-0.3,0,0.3)): add(t0,blip(1600),0.05,pan)
add(E+0.95,mallet(mf(64),0.8,0.5),0.05)
# ---------- S3 ----------
add(10.62,revswell(0.38),0.09); add(11.0,sub(0.6,64,40),0.11); add(11.0,lock(),0.06)
for t0,m,pan in [(12.1,69,-0.4),(12.55,73,0),(12.95,76,0.4)]:
    add(t0,air(0.45),0.06,pan); add(t0+0.12,mallet(mf(m),0.8),0.06,pan)
    for j in range(7): add(t0+0.22+0.11*j*(1+j*0.12),blip(1800+120*j),0.016,pan)
add(14.3,flick(),0.09); add(14.42,mallet(mf(61),1.0),0.06); add(14.86,zip_(0.6),0.025)
# ---------- S4 ----------
add(16.42,revswell(0.38),0.08); add(16.95,sub(0.6,58,36),0.10); add(16.95,air(0.5),0.06)
add(17.86,zip_(0.3),0.10,0.2)
add(18.5,air(0.8),0.12,-0.3); add(18.62,flick(),0.08,0.3); add(19.3,lock(),0.12); add(19.32,mallet(mf(69),1.0),0.07)
add(20.5,air(0.7,True),0.07,0.4); add(21.05,thock(0.8),0.09,0.4)
# ---------- S5 ----------
add(22.95,air(0.55),0.13,-0.5); add(22.6,revswell(0.35),0.06)
for j in range(10): add(23.4+0.7*(1-(1-j/10)**2),blip(1100+60*j),0.03)
for j,t0 in enumerate(cue['rows']): add(t0,thock(1.1+0.03*j),0.045,-0.6+1.2*j/len(cue['rows']))
add(26.25,revswell(0.6),0.06); add(26.85,sub(0.5,70,40),0.16); add(26.86,thock(0.6),0.18); add(26.9,flick(),0.06)
add(27.45,flick(),0.07); add(27.55,mallet(mf(73),1.0),0.06)
for j in range(3): add(28.6+0.14*j,blip(1300+200*j),0.04,-0.4+0.4*j)
# ---------- S6 ----------
add(30.5,revswell(0.35),0.07); add(30.85,sub(0.9,60,34),0.12)
for k,m in enumerate([57,64,68,71]): add(30.9+0.06*k,mallet(mf(m),1.4,0.5),0.045,-0.3+0.2*k)
rn=int(1.4*SR); rot=f2(rng.normal(0,1,rn),'band',[400,2500])*(0.5+0.5*np.sin(2*np.pi*np.linspace(9,2,rn)*T(rn)))*np.exp(-T(rn)/0.6)
add(31.9,rot,0.05); add(33.05,lock(),0.08); add(33.8,blip(1000),0.04)
# ---------- S7 ----------
add(34.75,revswell(0.35),0.08); add(35.3,mallet(mf(69),1.0),0.07); add(35.3,sub(0.6,62,38),0.08)
for j in range(6): add(35.8+0.06*j,flick(),0.025,-0.5+0.2*j)
add(36.7,thock(0.8),0.12); add(37.75,air(0.6),0.04,0.5)
add(38.4,thock(0.9),0.22); add(38.42,lock(),0.12); add(38.55,shimmer(85,1.4),0.06)
for k,m in enumerate([69,73,76,81]): add(38.6+0.07*k,mallet(mf(m),1.0,0.6),0.05,-0.3+0.2*k)
# ---------- mix ----------
def verb(x,seed):
    r=np.random.default_rng(seed); n=int(1.1*SR); ir=r.normal(0,1,n)*np.exp(-T(n)/0.32)*0.02
    for d,g in [(0.011,0.5),(0.019,0.35),(0.027,0.25),(0.041,0.18)]: ir[int(d*SR)]+=g*0.15
    ir=f2(ir,'low',6000); ir[0]=1; return fftconvolve(x,ir)[:N]
L=f2(verb(L,1),'high',30); Rr=f2(verb(Rr,2),'high',30)
L=f2(L,'low',14000); Rr=f2(Rr,'low',14000)
m=np.max(np.abs(np.r_[L,Rr])); L/=m; Rr/=m
pcm=(np.stack([L,Rr],1)*32767*0.56).astype(np.int16)
w=wave.open(sys.argv[2],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('sfx v2 ok')
