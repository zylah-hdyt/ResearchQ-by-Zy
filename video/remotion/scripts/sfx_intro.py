# ResearchQ dark intro (15s) — minimal soft SFX, cue times in frames @30fps (match src/intro/*).
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; D=15.0; N=int(SR*D); rng=np.random.default_rng(21); F=lambda f: f/30
L=np.zeros(N); Rr=np.zeros(N)
f2=lambda x,k,f: sosfilt(butter(2,f,k,fs=SR,output='sos'),x)
mf=lambda m:440*2**((m-69)/12); T=lambda n:np.arange(n)/SR
def env(n,a,d): t=T(n); return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
def add(t0,s,g,pan=0.0):
    i=int(t0*SR); n=min(len(s),N-i)
    if n>0: a=(pan+1)*np.pi/4; L[i:i+n]+=s[:n]*g*np.cos(a); Rr[i:i+n]+=s[:n]*g*np.sin(a)
def tone(m,dur,dec):
    f=mf(m); n=int(dur*SR); t=T(n); return (np.sin(2*np.pi*f*t)+0.15*np.sin(4*np.pi*f*t)*np.exp(-t/0.06))*env(n,0.004,dec)
def pop():
    n=int(0.12*SR); t=T(n); f=420+800*t/0.12; return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.002,0.03)
def click():
    n=int(0.03*SR); return f2(rng.normal(0,1,n),'band',[900,2600])*env(n,0.0008,0.005)
def hit(base=90):
    n=int(0.7*SR); t=T(n); f=150*np.exp(-t*5)+base; ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)+0.4*np.sin(2*ph)+0.2*np.sin(3*ph))*env(n,0.003,0.18)
def whoosh(dur=0.6,up=False):
    n=int(dur*SR); x=rng.normal(0,1,n); y=np.zeros(n); ch=int(0.01*SR)
    for s0 in range(0,n,ch):
        c=s0/n; fc=(400+3000*c) if up else 300+1800*np.sin(np.pi*c)**2; y[s0:s0+ch]=f2(x[s0:s0+ch],'low',fc)
    return y*np.sin(np.pi*T(n)/dur)**2
pad=lambda m,dur: sum(tone(m+k,dur,dur*0.5)*w for k,w in ((0,1),(7,.5),(12,.35)))
# scene 1: pills + headline
for i,f in enumerate([4,12,20,28,36,44]): add(F(f),pop(),0.14,-0.4+0.16*i); add(F(f),tone(76+[0,2,4,5,7,9][i],0.3,0.08),0.05)
add(F(54),hit(80),0.22)
# scene 2: collapse, dot, rings, launch
add(F(122),whoosh(0.5),0.16); add(F(144),hit(110),0.32); add(F(144),tone(72,1.2,0.4),0.1)
add(F(152),tone(79,0.8,0.25),0.06); add(F(162),tone(84,0.8,0.25),0.05); add(F(176),whoosh(0.4,True),0.16)
# scene 3: letters, dot landing, tagline, marquee, handle, follow
for i in range(9): add(F(197+i*2),click(),0.12,-0.4+0.1*i)
add(F(219),hit(100),0.38); add(F(219),pad(72,2.4),0.07); add(F(219.5),tone(84,1.0,0.3),0.08)
add(F(231),tone(76,0.8,0.22),0.08); add(F(297),whoosh(0.7),0.13)
add(F(351),tone(79,0.8,0.22),0.08); add(F(363),pop(),0.14)
add(F(414),click(),0.4); add(F(418),tone(79,0.8,0.22),0.1); add(F(422),tone(84,1.2,0.35),0.09)
ir=rng.normal(0,1,int(0.6*SR))*np.exp(-T(int(0.6*SR))/0.15)*0.02; ir[0]=1; ir=f2(ir,'low',5000)
L=fftconvolve(L,ir)[:N]; Rr=fftconvolve(Rr,ir)[:N]; L=f2(L,'high',70); Rr=f2(Rr,'high',70)
m=max(np.abs(L).max(),np.abs(Rr).max()); L/=m; Rr/=m
pcm=(np.stack([L,Rr],1)*32767*0.5).astype(np.int16)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('sfx intro ok')
