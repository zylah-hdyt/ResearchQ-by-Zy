# Problem Master short (40s) — punchier SFX for the dark thumbnail style; cue times are global frames @30fps.
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; D=40.0; N=int(SR*D); rng=np.random.default_rng(55); F=lambda f: f/30
L=np.zeros(N); Rr=np.zeros(N)
f2=lambda x,k,f: sosfilt(butter(2,f,k,fs=SR,output='sos'),x)
mf=lambda m:440*2**((m-69)/12); T=lambda n:np.arange(n)/SR
def env(n,a,d): t=T(n); return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
def add(t0,s,g,pan=0.0):
    i=int(t0*SR); n=min(len(s),N-i)
    if n>0: a=(pan+1)*np.pi/4; L[i:i+n]+=s[:n]*g*np.cos(a); Rr[i:i+n]+=s[:n]*g*np.sin(a)
def tone(m,dur=0.6,dec=0.15):
    f=mf(m); n=int(dur*SR); t=T(n); return (np.sin(2*np.pi*f*t)+0.2*np.sin(4*np.pi*f*t)*np.exp(-t/0.05))*env(n,0.003,dec)
def boom(base=55,dec=0.35):
    n=int(1.2*SR); t=T(n); f=180*np.exp(-t*9)+base; ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)+0.3*np.sin(2*ph))*env(n,0.002,dec)+f2(rng.normal(0,1,n),'low',2500)*env(n,0.001,0.03)*0.6
def snap():
    n=int(0.08*SR); return f2(rng.normal(0,1,n),'band',[1500,7000])*env(n,0.0005,0.012)
def click():
    n=int(0.03*SR); return f2(rng.normal(0,1,n),'band',[900,3000])*env(n,0.0008,0.005)
def tick():
    n=int(0.02*SR); return f2(rng.normal(0,1,n),'band',[2000,6000])*env(n,0.0005,0.003)
def whoosh(dur=0.5,up=True):
    n=int(dur*SR); x=rng.normal(0,1,n); y=np.zeros(n); ch=int(0.008*SR)
    for s0 in range(0,n,ch):
        c=s0/n; fc=300+5000*(c if up else 1-c)**1.5; y[s0:s0+ch]=f2(x[s0:s0+ch],'band',[max(80,fc*0.4),fc+200])
    return y*np.sin(np.pi*T(n)/dur)**1.5
def riser(dur=1.4):
    n=int(dur*SR); t=T(n); f=200+1400*(t/dur)**2; s=np.sin(2*np.pi*np.cumsum(f)/SR)*0.25+f2(rng.normal(0,1,n),'high',3000)*0.3*(t/dur)
    return s*(t/dur)**2
def glitch():
    n=int(0.25*SR); x=np.sign(np.sin(2*np.pi*np.cumsum(np.repeat(rng.uniform(80,900,25),n//25+1)[:n])/SR))*0.5
    return f2(x,'band',[300,4000])*env(n,0.001,0.08)
# hook
add(0,boom(48,0.45),0.9); add(0,glitch(),0.35); add(F(14),boom(70,0.25),0.7); add(F(14),snap(),0.6)
add(F(18),riser(0.85),0.5); add(F(44),whoosh(0.35),0.6); add(F(45),boom(52,0.4),0.9); add(F(45),snap(),0.7)
add(F(52),boom(65,0.2),0.5)
for i,t in enumerate((58,62,66,70)): add(F(t),snap(),0.4,[-.5,.5,-.4,.4][i]); add(F(t),tone([76,79,83,88][i],0.3,0.06),0.12)
# prompt
add(F(96),whoosh(0.4),0.45); add(F(106),whoosh(0.6,False),0.3)
for t in range(122,189,2): add(F(t)+rng.uniform(0,.01),click(),0.18,rng.uniform(-.3,.3))
for i,t in enumerate(range(194,219,6)): add(F(t),snap(),0.3); add(F(t),tone(72+i*2,0.3,0.07),0.1)
# flow
add(F(246),whoosh(0.4),0.45)
for i in range(8): add(F(260+14*i),tick(),0.5); add(F(260+14*i),tone(64+[0,2,4,5,7,9,11,12][i],0.35,0.08),0.12)
add(F(376),tone(84,0.8,0.2),0.12)
# data panels
for i in range(4):
    t0=420+97*i; add(F(t0),whoosh(0.45),0.5,[0.4,-0.4][i%2]); add(F(t0+6),boom(60,0.2),0.4)
    for k in range(10): add(F(t0+8+k*2.4),tick(),0.25)
    add(F(t0+40),tone(79+i,0.5,0.12),0.12)
# gap
add(F(810),boom(50,0.35),0.7); add(F(820),snap(),0.5,-0.4); add(F(832),snap(),0.5,0.4); add(F(840),boom(62,0.3),0.6); add(F(854),tone(72,0.7,0.2),0.12)
# done
add(F(930),whoosh(0.35),0.4)
for i in range(8): add(F(942+6*i),tone(72+[0,2,4,5,7,9,11,12][i],0.25,0.06),0.12); add(F(942+6*i),click(),0.3)
# youtube
add(F(1020),whoosh(0.5),0.5)
for k in range(26):
    p=k/26; t=1036+76*(1-(1-p)**0.45)
    add(F(t),tick(),0.22*(1-p*0.5))
add(F(1112),boom(70,0.15),0.4); add(F(1126),snap(),0.35); add(F(1130),click(),0.6); add(F(1134),tone(79,0.6,0.15),0.14); add(F(1138),tone(84,1.0,0.3),0.12)
ir=rng.normal(0,1,int(0.5*SR))*np.exp(-T(int(0.5*SR))/0.1)*0.02; ir[0]=1; ir=f2(ir,'low',6000)
L=fftconvolve(L,ir)[:N]; Rr=fftconvolve(Rr,ir)[:N]; L=f2(L,'high',35); Rr=f2(Rr,'high',35)
m=max(np.abs(L).max(),np.abs(Rr).max()); L/=m; Rr/=m
pcm=(np.stack([L,Rr],1)*32767*0.6).astype(np.int16)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('sfx problem ok')
