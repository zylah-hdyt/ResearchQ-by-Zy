# Scopus Finder demo (44.7s) — minimal soft UI SFX; cue times are global frames @30fps (see src/scopus/*).
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; D=1342/30; N=int(SR*D); rng=np.random.default_rng(33); F=lambda f: f/30
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
# hook
add(F(0),pop(),0.12); add(F(20),hit(85),0.38); add(F(20),click(),0.3); add(F(64),whoosh(),0.14)
add(F(72),tone(72),0.12); add(F(82),tone(76),0.12); add(F(92),tone(81,1.0,0.3),0.1)
# chat
add(F(150),whoosh(0.6),0.14)
for t in (195,230,260,390): add(F(t),click(),0.34)
add(F(196),tone(79),0.1); add(F(262),pop(),0.12)
for t in range(285,376,3): add(F(t)+rng.uniform(0,.02),key(),0.12,rng.uniform(-.3,.3))
add(F(402),pop(),0.13); add(F(416),whoosh(0.4),0.08); add(F(452),whoosh(0.4),0.08)
add(F(448),tone(76),0.11); add(F(480),tone(79),0.11)
for i,t in enumerate((498,510,522)): add(F(t),pop(),0.1); add(F(t),tone([72,74,76][i],0.5,0.12),0.07)
add(F(534),tone(67,0.6,0.15),0.1); add(F(554),whoosh(),0.12)
for i,t in enumerate((584,596,608,620)): add(F(t),pop(),0.09,-0.3+0.2*i)
# reveal
for i,t in enumerate((684,760,836)): add(F(t),whoosh(0.45),0.12,[0.3,-0.3,0.3][i]); add(F(t+6),tone([72,76,79][i],0.9,0.25),0.13); add(F(t+20),tone(84,0.4,0.1),0.05)
add(F(896),tone(84,1.2,0.35),0.08)
# honest
add(F(1020),hit(95),0.25); add(F(1038),pop(),0.12)
for t in (1102,1110): add(F(t),pop(),0.1)
add(F(1120),tone(76),0.12); add(F(1132),tone(81,1.0,0.3),0.1)
# outro
add(F(1170),tone(72),0.12); add(F(1190),pop(),0.12)
for i,t in enumerate((1210,1218,1226)): add(F(t),tone([76,79,84][i],0.5,0.12),0.08)
add(F(1250),tone(79),0.1); add(F(1320),click(),0.4); add(F(1324),tone(79),0.12); add(F(1328),tone(84,1.2,0.35),0.1)
ir=rng.normal(0,1,int(0.5*SR))*np.exp(-T(int(0.5*SR))/0.12)*0.015; ir[0]=1; ir=f2(ir,'low',5000)
L=fftconvolve(L,ir)[:N]; Rr=fftconvolve(Rr,ir)[:N]; L=f2(L,'high',80); Rr=f2(Rr,'high',80)
m=max(np.abs(L).max(),np.abs(Rr).max()); L/=m; Rr/=m
pcm=(np.stack([L,Rr],1)*32767*0.5).astype(np.int16)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('sfx scopus ok')
