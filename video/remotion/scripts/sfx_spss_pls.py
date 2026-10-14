# SPSS vs SmartPLS story (60s) — cartoon SFX; cue times are global frames @30fps (see src/stats/*).
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; D=1800/30; N=int(SR*D); rng=np.random.default_rng(88); F=lambda f: f/30
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
add(F(0),hit(85),0.32); add(F(0),whoosh(0.45),0.10); add(F(8),pop(),0.13); add(F(14),pop(),0.13); add(F(20),hit(110),0.14); add(F(20),pop(),0.1)
add(F(34),whoosh(0.3),0.06); add(F(40),tone(76,0.4,0.1),0.06); add(F(46),tone(79,0.4,0.1),0.06)
# S2 SPSS (start 120)
B=120; add(F(B),whoosh(0.45),0.13); add(F(B+8),pop(),0.1)
for i in range(8): add(F(B+14+i*4),click(),0.12,rng.uniform(-.3,.3))
add(F(B+70),click(),0.3); add(F(B+84),pop(),0.11); add(F(B+100),click(),0.25); add(F(B+108),pop(),0.12)
add(F(B+128),pop(),0.14); add(F(B+129),tone(79,0.5,0.15),0.08)
for i in range(4): add(F(B+150+i*12),pop(),0.1); add(F(B+150+i*12),tone([72,74,76,79][i],0.3,0.08),0.06)
# S3 SmartPLS (start 420)
B=420; add(F(B),whoosh(0.5),0.13)
for i in range(3): add(F(B+18+i*10),pop(),0.13); add(F(B+18+i*10),tone([67,71,74][i],0.35,0.1),0.07)
for i in range(9): add(F(B+48+i*4),click(),0.12,rng.uniform(-.4,.4))
add(F(B+70),pop(),0.09); add(F(B+84),pop(),0.09)
for t in (110,124): add(F(B+t),whoosh(0.3),0.07)
add(F(B+150),pop(),0.1); add(F(B+168),click(),0.35)
for i in range(6): add(F(B+180+i*3),tone([72,76,79,84,79,84][i],0.25,0.06),0.05)
add(F(B+196),pop(),0.12); add(F(B+197),tone(88,0.8,0.25),0.06)
# S4 analysis (start 720)
B=720; add(F(B),whoosh(0.45),0.12)
for i in range(4): add(F(B+16+i*22),pop(),0.09); add(F(B+16+i*22),tone([67,69,71,72][i],0.3,0.08),0.05)
add(F(B+176),whoosh(0.3),0.08)
for i in range(4): add(F(B+186+i*22),pop(),0.09); add(F(B+186+i*22),tone([72,74,76,79][i],0.3,0.08),0.05)
# S5 pros/cons (start 1080)
B=1080; add(F(B),whoosh(0.45),0.12)
for k,(at,oks) in enumerate(((14,(1,1,0,0)),(186,(1,1,1,0)))):
    for i,ok in enumerate(oks):
        add(F(B+at+i*16),pop(),0.1); add(F(B+at+i*16),tone(79 if ok else 57,0.3,0.08),0.06)
# S6 when (start 1440)
B=1440; add(F(B),whoosh(0.45),0.12); add(F(B+10),pop(),0.12)
add(F(B+30),whoosh(0.25),0.07); add(F(B+40),pop(),0.12); add(F(B+41),tone(79,0.4,0.1),0.07)
for i in range(3): add(F(B+50+i*6),click(),0.12)
add(F(B+60),whoosh(0.25),0.07); add(F(B+70),pop(),0.12); add(F(B+71),tone(74,0.4,0.1),0.07)
for i in range(3): add(F(B+80+i*6),click(),0.12)
add(F(B+110),tone(72,0.4,0.1),0.05)
# S7 CTA (start 1650)
B=1650; add(F(B),hit(90),0.3); add(F(B+2),pop(),0.12); add(F(B+8),pop(),0.12); add(F(B+12),pop(),0.14)
add(F(B+22),pop(),0.14); add(F(B+23),tone(84,0.8,0.25),0.09); add(F(B+30),whoosh(0.3),0.07); add(F(B+31),tone(79,0.5,0.15),0.06)
ir=rng.normal(0,1,int(0.5*SR))*np.exp(-T(int(0.5*SR))/0.12)*0.015; ir[0]=1; ir=f2(ir,'low',5000)
L=fftconvolve(L,ir)[:N]; Rr=fftconvolve(Rr,ir)[:N]; L=f2(L,'high',80); Rr=f2(Rr,'high',80)
m=max(np.abs(L).max(),np.abs(Rr).max()); L/=m; Rr/=m
pcm=(np.stack([L,Rr],1)*32767*0.5).astype(np.int16)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('sfx spss-pls ok')
