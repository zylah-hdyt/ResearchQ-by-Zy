# Problem Master BAB 1 (48s) — UI SFX; cue times are global frames @30fps (see src/bab1/*). Scene starts 0/120/420/600/900/1020/1200.
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; D=1440/30; N=int(SR*D); rng=np.random.default_rng(31); F=lambda f: f/30
L=np.zeros(N); Rr=np.zeros(N)
f2=lambda x,k,f: sosfilt(butter(2,f,k,fs=SR,output='sos'),x)
mf=lambda m:440*2**((m-69)/12); T=lambda n:np.arange(n)/SR
def env(n,a,d): t=T(n); return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
def add(t0,s,g,pan=0.0):
    i=int(t0*SR); n=min(len(s),N-i)
    if n>0 and i>=0: a=(pan+1)*np.pi/4; L[i:i+n]+=s[:n]*g*np.cos(a); Rr[i:i+n]+=s[:n]*g*np.sin(a)
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
def stamp():
    n=int(0.25*SR); return (hit(70)[:n]*0.8+f2(rng.normal(0,1,n),'low',900)*env(n,0.001,0.03))
def scribble(dur=0.25):
    n=int(dur*SR); return f2(rng.normal(0,1,n),'band',[1500,5000])*np.abs(np.sin(2*np.pi*18*T(n)))*env(n,0.01,dur)
def boom():
    n=int(0.9*SR); t=T(n); f=55*np.exp(-t*2)+32; return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.004,0.35)
def rise_up(dur=0.45):
    n=int(dur*SR); t=T(n); f=300+1500*(t/dur)**2; return np.sin(2*np.pi*np.cumsum(f)/SR)*(t/dur)**2*np.exp(-np.maximum(0,t-dur*0.9)/0.02)
# S1 hook: red strikes, note, REVISI stamp, then orange flash + card
add(F(0),hit(85),0.3)
for i in range(7): add(F(6+i*3),scribble(0.2),0.06,rng.uniform(-.4,.4))
add(F(12),pop(),0.13); add(F(26),stamp(),0.4); add(F(26),hit(70),0.2)
add(F(60),whoosh(0.3),0.08); add(F(62),hit(95),0.2); add(F(72),pop(),0.14); add(F(73),tone(79,0.6,0.2),0.07)
for i in range(4): add(F(90+i*3),pop(),0.08); add(F(90+i*3),tone([72,74,76,79][i],0.3,0.08),0.05)
# S2 demo (120)
B=120; add(F(B+4),whoosh(0.4),0.1)
for t in (16,40,130,146,284): add(F(B+t),click(),0.3)
add(F(B+18),pop(),0.1); add(F(B+44),pop(),0.12); add(F(B+45),tone(76,0.4,0.1),0.07)
for t in range(64,140,3): add(F(B+t)+rng.uniform(0,.02),key(),0.1,rng.uniform(-.3,.3))
add(F(B+132),tone(84,0.4,0.1),0.06); add(F(B+150),whoosh(0.3),0.08)
for i,t in enumerate((182,198,216,234)): add(F(B+t),tone([72,74,76,79][i],0.5,0.12),0.09); add(F(B+t),pop(),0.06)
add(F(B+238),pop(),0.13); add(F(B+239),tone(84,0.8,0.25),0.08)
# S3 flow (420)
B=420
for i in range(8): add(F(B+16+i*16),pop(),0.08); add(F(B+16+i*16),tone([60,62,64,67,69,72,74,76][i],0.3,0.08),0.05)
add(F(B+150),pop(),0.1); add(F(B+151),tone(84,0.5,0.15),0.06)
# S4 data (600): scroll whooshes + chart grows + note pops
B=600
for s in (18,90,162,234):
    add(F(B+s-14),whoosh(0.4),0.07); add(F(B+s+6),tone(67,0.5,0.15),0.05); add(F(B+s+10),pop(),0.11); add(F(B+s+11),tone(79,0.4,0.1),0.06)
for i in range(9): add(F(B+162+6+i*2),click(),0.08)
# S5 checklist (900)
B=900
for i in range(8): add(F(B+10+i*6),pop(),0.09); add(F(B+10+i*6),tone([72,74,76,79,81,84,86,88][i],0.25,0.06),0.045)
add(F(B+64),whoosh(0.3),0.06)
# S6 youtube (1020)
B=1020; add(F(B+6),whoosh(0.6),0.1)
for i in range(16): add(F(B+16+i*5),click(),0.05*(1-i/16)+0.02)
add(F(B+96),pop(),0.12); add(F(B+110),click(),0.32); add(F(B+106),tone(79,0.5,0.15),0.06)
# S7 CTA (1200)
B=1200; add(F(B+8),stamp(),0.3); add(F(B+9),tone(84,0.8,0.25),0.08); add(F(B+24),whoosh(0.3),0.06)
for t in range(46,58,3): add(F(B+t),key(),0.14)
add(F(B+66),click(),0.35); add(F(B+66),pop(),0.13); add(F(B+67),tone(79,0.5,0.15),0.07)
add(F(B+128),hit(95),0.22); add(F(B+136),pop(),0.1)
for i in range(4): add(F(B+140+i*6),pop(),0.1); add(F(B+140+i*6),tone([72,76,79,84][i],0.3,0.08),0.06)
for t in range(168,189,3): add(F(B+t),key(),0.14)
add(F(B+197),click(),0.35); add(F(B+197),pop(),0.13); add(F(B+198),tone(84,0.8,0.25),0.08)
# transition accents
for t in (120,1200): add(F(t-10),rise_up(0.4),0.07); add(F(t+3),boom(),0.26)
for t in (420,1020): add(F(t-2),whoosh(0.35),0.15,-0.7); add(F(t+3),whoosh(0.35),0.15,0.7); add(F(t+6),boom(),0.12)
add(F(600),whoosh(0.6),0.11); add(F(610),boom(),0.18)
add(F(898),rise_up(0.35),0.06); add(F(904),pop(),0.12); add(F(908),boom(),0.12)
ir=rng.normal(0,1,int(0.5*SR))*np.exp(-T(int(0.5*SR))/0.12)*0.015; ir[0]=1; ir=f2(ir,'low',5000)
L=fftconvolve(L,ir)[:N]; Rr=fftconvolve(Rr,ir)[:N]; L=f2(L,'high',80); Rr=f2(Rr,'high',80)
m=max(np.abs(L).max(),np.abs(Rr).max()); L/=m; Rr/=m
pcm=(np.stack([L,Rr],1)*32767*0.5).astype(np.int16)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('sfx bab1 ok')
