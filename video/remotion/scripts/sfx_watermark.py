# Watermark story (30s) — cartoon SFX; cue times are global frames @30fps (see src/watermark/*).
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; D=900/30; N=int(SR*D); rng=np.random.default_rng(77); F=lambda f: f/30
L=np.zeros(N); Rr=np.zeros(N)
f2=lambda x,k,f: sosfilt(butter(2,f,k,fs=SR,output='sos'),x)
mf=lambda m:440*2**((m-69)/12); T=lambda n:np.arange(n)/SR
def env(n,a,d): t=T(n); return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
def add(t0,s,g,pan=0.0):
    i=int(t0*SR); n=min(len(s),N-i)
    if n>0: a=(pan+1)*np.pi/4; L[i:i+n]+=s[:n]*g*np.cos(a); Rr[i:i+n]+=s[:n]*g*np.sin(a)
def tone(m,dur=0.8,dec=0.2):
    f=mf(m); n=int(dur*SR); t=T(n); return (np.sin(2*np.pi*f*t)+0.15*np.sin(4*np.pi*f*t)*np.exp(-t/0.06))*env(n,0.004,dec)
def pop():
    n=int(0.12*SR); t=T(n); f=420+800*t/0.12; return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.002,0.03)
def click():
    n=int(0.03*SR); return f2(rng.normal(0,1,n),'band',[900,2600])*env(n,0.0008,0.005)
def key():
    n=int(0.035*SR); return f2(rng.normal(0,1,n),'band',[700,2000])*env(n,0.001,0.007)
def hit(base=90):
    n=int(0.6*SR); t=T(n); f=150*np.exp(-t*5)+base; ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)+0.4*np.sin(2*ph)+0.2*np.sin(3*ph))*env(n,0.003,0.16)
def whoosh(dur=0.55):
    n=int(dur*SR); x=rng.normal(0,1,n); y=np.zeros(n); ch=int(0.01*SR)
    for s0 in range(0,n,ch): c=s0/n; y[s0:s0+ch]=f2(x[s0:s0+ch],'low',300+1800*np.sin(np.pi*c)**2)
    return y*np.sin(np.pi*T(n)/dur)**2
def alarm():
    n=int(0.5*SR); t=T(n); f=np.where((t*8).astype(int)%2==0,880,660); return np.sign(np.sin(2*np.pi*np.cumsum(f)/SR))*0.3*env(n,0.003,0.3)
def stamp():
    n=int(0.25*SR); return (hit(70)[:n]*0.8+f2(rng.normal(0,1,n),'low',900)*env(n,0.001,0.03))
def boing():
    n=int(0.35*SR); t=T(n); f=300+200*np.sin(2*np.pi*12*t)*np.exp(-t*6)+300*t; return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.003,0.12)
# S1 hook
add(F(0),hit(85),0.34); add(F(0),pop(),0.12); add(F(16),pop(),0.12); add(F(14),boing(),0.14)
add(F(30),tone(76,0.4,0.1),0.06); add(F(38),tone(79,0.4,0.1),0.06)
# S2 search
add(F(92),whoosh(0.4),0.14)
for t in range(96,127,3): add(F(t)+rng.uniform(0,.02),key(),0.12,rng.uniform(-.3,.3))
add(F(128),click(),0.3)
for i,t in enumerate(range(130,146,5)): add(F(t),pop(),0.1); add(F(t),tone([64,63,62,61][i],0.3,0.08),0.06)
# S3 myth
add(F(170),whoosh(0.5),0.13); add(F(180),whoosh(0.35),0.1)
add(F(220),pop(),0.14); add(F(221),tone(72,0.6,0.15),0.1)
for t in (246,256,266): add(F(t),click(),0.3); add(F(t),tone(55,0.3,0.06),0.08)
# S4 explain
add(F(302),whoosh(0.5),0.12)
for i,t in enumerate(range(318,361,7)): add(F(t),pop(),0.07,rng.uniform(-.4,.4)); add(F(t),tone([67,69,71,72,74,76,79][i%7],0.3,0.07),0.05)
add(F(368),pop(),0.14); add(F(369),tone(84,0.8,0.25),0.09); add(F(384),tone(79,0.4,0.1),0.06)
# S5 paraphrase edit
add(F(428),whoosh(0.4),0.12)
for k,t in enumerate((450,462,474,486)):
    add(F(t),click(),0.26); add(F(t+1),pop(),0.08)
    for j in range(5): add(F(t+4+j*1.5),key(),0.1,rng.uniform(-.3,.3))
    add(F(t+2),tone([76,74,72,69][k],0.35,0.08),0.06)
add(F(502),pop(),0.13); add(F(503),tone(79,0.6,0.2),0.08)
# S6 right way
add(F(530),whoosh(0.5),0.12)
for i,t in enumerate((544,554,564)): add(F(t),pop(),0.12); add(F(t),tone([72,76,79][i],0.4,0.1),0.08)
for t in range(592,671,3): add(F(t)+rng.uniform(0,.02),key(),0.1,rng.uniform(-.3,.3))
add(F(600),tone(84,0.6,0.2),0.07)
# S7 disclose
add(F(680),whoosh(0.4),0.12); add(F(684),pop(),0.13); add(F(710),stamp(),0.4); add(F(716),tone(79,0.6,0.2),0.08)
# S8 cta
add(F(775),whoosh(0.4),0.12)
for t in (789,797): add(F(t),pop(),0.13)
add(F(795),boing(),0.1); add(F(805),tone(72),0.1); add(F(813),tone(79),0.09); add(F(830),tone(84,1.0,0.3),0.08)
ir=rng.normal(0,1,int(0.5*SR))*np.exp(-T(int(0.5*SR))/0.12)*0.015; ir[0]=1; ir=f2(ir,'low',5000)
L=fftconvolve(L,ir)[:N]; Rr=fftconvolve(Rr,ir)[:N]; L=f2(L,'high',80); Rr=f2(Rr,'high',80)
m=max(np.abs(L).max(),np.abs(Rr).max()); L/=m; Rr/=m
pcm=(np.stack([L,Rr],1)*32767*0.5).astype(np.int16)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('sfx watermark ok')
