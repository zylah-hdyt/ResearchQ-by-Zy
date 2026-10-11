# EP06 — minimal, soft UI sound design for the chat/screen-UI style (no music):
# a warm stamp hit + soft counter ticks (hook), quiet key taps, muted taps on buttons, bubble pops, soft plucks, gentle whooshes.
import numpy as np, wave, json, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; D=50.0; N=int(SR*D); rng=np.random.default_rng(11)
cue=json.load(open(sys.argv[1]))['c']
L=np.zeros(N); Rr=np.zeros(N)
f2=lambda x,k,f: sosfilt(butter(2,f,k,fs=SR,output='sos'),x)
mf=lambda m:440*2**((m-69)/12); T=lambda n:np.arange(n)/SR
def env(n,a,d): t=T(n); return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
def add(t0,s,g,pan=0.0):
    i=int(t0*SR); n=min(len(s),N-i)
    if n>0: a=(pan+1)*np.pi/4; L[i:i+n]+=s[:n]*g*np.cos(a); Rr[i:i+n]+=s[:n]*g*np.sin(a)
def tone(m,dur,dec):
    f=mf(m); n=int(dur*SR); t=T(n)
    return (np.sin(2*np.pi*f*t)+0.15*np.sin(4*np.pi*f*t)*np.exp(-t/0.06))*env(n,0.004,dec)
pluck=lambda m,dur=0.7: tone(m,dur,0.2)
def ping():                    # soft two-note notification (glassy, short)
    a=tone(84,0.5,0.12); b=tone(88,0.6,0.16); o=np.zeros(int(0.7*SR)); o[:len(a)]+=a; k=int(0.075*SR); o[k:k+len(b)]+=b*0.9; return o
def click():                   # muted tap
    n=int(0.03*SR); return f2(rng.normal(0,1,n),'band',[900,2600])*env(n,0.0008,0.005)
def key():                     # very soft key tap
    n=int(0.035*SR); return f2(rng.normal(0,1,n),'band',[700,2000])*env(n,0.001,0.007)
def pop():                     # bubble pop: quick upward blip
    n=int(0.12*SR); t=T(n); f=500+900*t/0.12; ph=2*np.pi*np.cumsum(f)/SR; return np.sin(ph)*env(n,0.002,0.03)
def whoosh(dur=0.6):
    n=int(dur*SR); x=rng.normal(0,1,n); y=np.zeros(n); ch=int(0.01*SR)
    for s0 in range(0,n,ch): c=s0/n; y[s0:s0+ch]=f2(x[s0:s0+ch],'low',300+1800*np.sin(np.pi*c)**2)
    return y*np.sin(np.pi*T(n)/dur)**2
def hit():                     # warm low stamp hit
    n=int(0.6*SR); t=T(n); f=150*np.exp(-t*5)+90; ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)+0.4*np.sin(2*ph)+0.2*np.sin(3*ph))*env(n,0.003,0.16)
for t0 in cue['hit']: add(t0,hit(),0.4); add(t0,click(),0.3)
for i,t0 in enumerate(cue['tick']): add(t0,tone(88+(i%2)*2,0.12,0.03),0.07)
for t0 in cue['key']:
    for j in range(4): add(t0+j*0.07+rng.uniform(0,0.02),key(),0.16,rng.uniform(-0.3,0.3))
for t0 in cue['tap']: add(t0,click(),0.32)
for t0 in cue['pop']: add(t0,pop(),0.13)
for t0,m in cue['pl']: add(t0,pluck(m,0.8),0.13)
for t0 in cue['wh']: add(t0,whoosh(0.55),0.12)
f=cue['follow']; add(f,click(),0.4); add(f+0.12,pluck(79,0.8),0.14); add(f+0.24,pluck(84,1.0),0.12)
ir=rng.normal(0,1,int(0.5*SR))*np.exp(-T(int(0.5*SR))/0.12)*0.015; ir[0]=1; ir=f2(ir,'low',5000)
L=fftconvolve(L,ir)[:N]; Rr=fftconvolve(Rr,ir)[:N]
L=f2(L,'high',80); Rr=f2(Rr,'high',80)
m=max(np.abs(L).max(),np.abs(Rr).max()); L/=m; Rr/=m
pcm=(np.stack([L,Rr],1)*32767*0.5).astype(np.int16)
w=wave.open(sys.argv[2],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('sfx ep06 ok')
