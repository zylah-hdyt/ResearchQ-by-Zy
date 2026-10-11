# EP03 — minimal, soft sound design (no music). Few events only, mid-range so it is audible on phones:
# soft pluck notes, a quiet UI click, one gentle whoosh for the dark->light switch, a warm low hit for the hook.
import numpy as np, wave, json, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; D=30.0; N=int(SR*D); rng=np.random.default_rng(7)
cue=json.load(open(sys.argv[1]))['c']
L=np.zeros(N); Rr=np.zeros(N)
f2=lambda x,k,f: sosfilt(butter(2,f,k,fs=SR,output='sos'),x)
mf=lambda m:440*2**((m-69)/12); T=lambda n:np.arange(n)/SR
def env(n,a,d): t=T(n); return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
def add(t0,s,g,pan=0.0):
    i=int(t0*SR); n=min(len(s),N-i)
    if n>0: a=(pan+1)*np.pi/4; L[i:i+n]+=s[:n]*g*np.cos(a); Rr[i:i+n]+=s[:n]*g*np.sin(a)
def pluck(m,dur=0.7):          # soft round pluck (sine + gentle 2nd harmonic, slow-ish attack)
    f=mf(m); n=int(dur*SR); t=T(n)
    return (np.sin(2*np.pi*f*t)+0.18*np.sin(4*np.pi*f*t)*np.exp(-t/0.08))*env(n,0.006,0.22)
def click():                   # muted UI click
    n=int(0.03*SR); return f2(rng.normal(0,1,n),'band',[900,2600])*env(n,0.0008,0.005)
def hit():                     # warm low hit with harmonics (reads on small speakers)
    n=int(0.6*SR); t=T(n); f=150*np.exp(-t*5)+90; ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)+0.4*np.sin(2*ph)+0.2*np.sin(3*ph))*env(n,0.003,0.16)
def whoosh(dur=0.9):           # gentle airy swell, lowpassed
    n=int(dur*SR); x=rng.normal(0,1,n); y=np.zeros(n); ch=int(0.01*SR)
    for s0 in range(0,n,ch): c=s0/n; y[s0:s0+ch]=f2(x[s0:s0+ch],'low',300+1800*np.sin(np.pi*c)**2)
    return y*np.sin(np.pi*T(n)/dur)**2
def key():                     # very soft key tap
    n=int(0.04*SR); return f2(rng.normal(0,1,n),'band',[600,1800])*env(n,0.001,0.008)
# hook
add(0.1,click(),0.3,0.4); add(0.55,click(),0.25,-0.4); add(1.15,pluck(69,0.8),0.16)
add(2.05,hit(),0.3)
# connector hub
add(cue['hub'],hit(),0.35); add(cue['hub']+0.02,pluck(72,0.9),0.16)
add(cue['colokan'],pluck(76,0.8),0.13)
for i,t0 in enumerate(cue['nodes']): add(t0,pluck([72,74,76,79,81,84][i],0.5),0.07,-0.6+0.24*i)
# research cards
for t0,m in zip(cue['cards'],[72,76,79]): add(t0,whoosh(0.5),0.14); add(t0+0.2,pluck(m,0.8),0.15)
# how-to clicks
for t0 in cue['clicks']: add(t0,click(),0.4,0.3)
add(cue['clicks'][-1]+0.12,pluck(79,0.7),0.13); add(cue['clicks'][-1]+0.24,pluck(84,0.9),0.11)
# cta
add(27.35,pluck(72,0.8),0.14); add(cue['follow'],click(),0.4); add(cue['follow']+0.12,pluck(79,0.8),0.14); add(cue['follow']+0.24,pluck(84,1.0),0.12)
# small room
ir=rng.normal(0,1,int(0.5*SR))*np.exp(-T(int(0.5*SR))/0.12)*0.015; ir[0]=1; ir=f2(ir,'low',5000)
L=fftconvolve(L,ir)[:N]; Rr=fftconvolve(Rr,ir)[:N]
L=f2(L,'high',80); Rr=f2(Rr,'high',80)
m=max(np.abs(L).max(),np.abs(Rr).max()); L/=m; Rr/=m
pcm=(np.stack([L,Rr],1)*32767*0.5).astype(np.int16)
w=wave.open(sys.argv[2],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('sfx ep03 ok')
