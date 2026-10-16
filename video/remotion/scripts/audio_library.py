# ResearchQ Skills Library (51s, 1530 frames @30fps) — cinematic score + SFX in one pass, modelled on the reference:
# dark sub-bass drone, booms on the big moments, near-silence on the logo, precise UI ticks, bright sparkle on the white
# flash. Systems sit on a 131 BPM grid (2 bars = 110 frames), so every system entry lands on a downbeat.
# Timeline: hook 0–150 · logo 135–285 · systems 285 + i·110 · wall 1275 · flash ~1395 · CTA 1395–1530.
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; N=int(SR*1530/30); rng=np.random.default_rng(44); F=lambda f: f/30
T=lambda n: np.arange(n)/SR; mf=lambda m: 440*2**((m-69)/12)
f2=lambda x,k,f: sosfilt(butter(2,f,k,fs=SR,output='sos'),x)
def env(n,a,d): t=T(n); return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
mus=np.zeros((N,2)); sfx=np.zeros((N,2))
def put(buf,t0,s,g=1.0,pan=0.0):
    i=int(t0*SR); n=min(len(s),N-i)
    if n<=0 or i<0: return
    a=(pan+1)*np.pi/4; buf[i:i+n,0]+=s[:n]*g*np.cos(a); buf[i:i+n,1]+=s[:n]*g*np.sin(a)
noise=lambda n: rng.normal(0,1,n)

# ---------------- score ----------------
def pad(chord,dur,a=0.6,r=0.8,bright=900):
    n=int(dur*SR); t=T(n); s=np.zeros(n)
    for m in chord:
        for d in (0.996,1.0,1.004):
            ph=2*np.pi*mf(m)*d*t+rng.uniform(0,6); s+=np.sin(ph)+0.25*np.sin(2*ph)
    e=np.minimum(1,t/a)*np.minimum(1,np.maximum(0,(dur-t)/r))
    return f2(s*e/len(chord)/3,'low',bright)
def sub(m,dur,a=0.5,r=0.6):
    n=int(dur*SR); t=T(n); e=np.minimum(1,t/a)*np.minimum(1,np.maximum(0,(dur-t)/r))
    return (np.sin(2*np.pi*mf(m)*t)+0.3*np.sin(4*np.pi*mf(m)*t))*e
# hook: dark Dm(add9) drone that swells into the push-in
put(mus,0,pad([50,57,62,64,65],4.9,a=1.2,r=0.3,bright=700),0.9)
put(mus,0,sub(26,4.9,a=1.5,r=0.2),0.55)
# logo: near silence, only a high airy pad (the reference's breathing room)
put(mus,4.5,pad([74,77,81,84],4.6,a=0.8,r=1.0,bright=3500),0.22)
# systems: 2-bar chords (110 frames) cycling Dm9 · Bbmaj7 · Fmaj7 · C6, with a soft muted-bass 8th pulse
CH=[[50,53,57,60,64],[46,50,53,57,62],[41,48,52,57,60],[48,52,55,57,62]]
RT=[38,34,41,36]
beat=60/131
for i in range(9):
    t0=F(285+i*110); dur=F(124); ch=CH[i%4]
    put(mus,t0,pad(ch,dur,a=0.25,r=0.5,bright=1500+i*120),0.75)
    put(mus,t0,sub(RT[i%4]-12,dur,a=0.08,r=0.4),0.5)
    for k in range(16):
        n=int(0.18*SR); tt=T(n); m=RT[i%4]+(12 if k%4==2 else 0)
        put(mus,t0+k*beat/2,np.tanh(2*np.sin(2*np.pi*mf(m)*tt))*env(n,0.004,0.06),0.16 if k%2 else 0.24)
        if k%2: put(mus,t0+k*beat/2,f2(noise(int(.05*SR)),'band',[6000,11000])*env(int(.05*SR),.004,.012),0.05)
# wall: wide sustained chord + riser, CTA: warm resolve and long tail
put(mus,F(1250),pad([50,57,62,65,69,74],F(150),a=0.8,r=0.4,bright=2600),0.8)
put(mus,F(1275),sub(26,F(120),a=0.05,r=0.6),0.6)
put(mus,F(1395),pad([46,53,58,62,65,70],F(135),a=0.3,r=1.6,bright=1800),0.7)
put(mus,F(1395),sub(34,F(135),a=0.1,r=1.5),0.45)
for k in range(12):
    n=int(0.18*SR); tt=T(n)
    put(mus,F(1410)+k*beat,np.tanh(2*np.sin(2*np.pi*mf(34)*tt))*env(n,0.004,0.07),0.16)

# ---------------- sfx bank ----------------
def bell(m,dur=1.4):
    f=mf(m); n=int(dur*SR); t=T(n)
    return sum(a*np.sin(2*np.pi*f*r*t)*np.exp(-t/d) for r,a,d in ((1,1,.7),(2.76,.4,.25),(5.4,.2,.09),(8.93,.1,.04)))*np.minimum(1,t/.002)
def glass(m,dur=1.0):
    f=mf(m); n=int(dur*SR); t=T(n); return (np.sin(2*np.pi*f*t)*np.exp(-t/.35)+.3*np.sin(2*np.pi*f*2.32*t)*np.exp(-t/.1))*np.minimum(1,t/.001)
def pluck(m,dur=0.5):
    f=mf(m); n=int(dur*SR); t=T(n); return (np.sin(2*np.pi*f*t)+.35*np.sin(2*np.pi*f*3*t)*np.exp(-t/.03))*np.exp(-t/.14)*np.minimum(1,t/.001)
def tick(f=4200,d=0.006):
    n=int(.03*SR); t=T(n); return np.sin(2*np.pi*f*t)*np.exp(-t/d)+f2(noise(n),'high',5000)*np.exp(-t/.002)*.3
def tap():
    n=int(.02*SR); t=T(n); return np.sin(2*np.pi*1900*t)*np.exp(-t/.004)*.7+f2(noise(n),'high',4000)*np.exp(-t/.002)*.3
def boom(base=32,dec=0.55,dur=1.6):
    n=int(dur*SR); t=T(n); f=70*np.exp(-t*3)+base; ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)+.25*np.sin(2*ph))*env(n,.004,dec)+f2(noise(n),'low',400)*env(n,.001,.04)*.6
def thump():
    n=int(.35*SR); t=T(n); f=90*np.exp(-t*12)+45; return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.002,.09)
def whoosh(dur=0.5,lo=300,hi=2600):
    n=int(dur*SR); x=noise(n); y=np.zeros(n); ch=int(.01*SR)
    for s0 in range(0,n,ch): c=s0/n; y[s0:s0+ch]=f2(x[s0:s0+ch],'band',[lo,lo+(hi-lo)*np.sin(np.pi*c)**2+50])
    return y*np.sin(np.pi*T(n)/dur)**2
def riser(dur=1.0):
    n=int(dur*SR); t=T(n); x=noise(n); y=np.zeros(n); ch=int(.01*SR)
    for s0 in range(0,n,ch): c=s0/n; y[s0:s0+ch]=f2(x[s0:s0+ch],'band',[300+5000*c**2,500+9000*c**2])
    tone=np.sin(2*np.pi*np.cumsum(200+1400*(t/dur)**2)/SR)*.3
    return (y+tone)*(t/dur)**2.2
def sparkle(dur=0.9):
    n=int(dur*SR); out=np.zeros(n)
    for _ in range(14):
        b=glass(rng.choice([96,98,100,103,105,108]),0.5)*rng.uniform(.2,.5); o=int(rng.uniform(0,dur*0.6)*SR); out[o:o+len(b)]+=b[:n-o]
    k=int(.004*SR); out[:k]+=f2(noise(k),'high',9000)*3
    return out
def scribble(dur=0.35):
    n=int(dur*SR); return f2(noise(n),'band',[1500,5500])*np.abs(np.sin(2*np.pi*14*T(n)))*env(n,.01,dur)

# hook
for i,t in enumerate((6,16,26,36)): put(sfx,F(t),tick(3600+i*300),0.12,[-.3,.3,-.2,.2][i]); put(sfx,F(t),glass(86+i*2,0.6),0.04)
for i,t in enumerate((60,66,74)): put(sfx,F(t),tick(2600+i*200,0.01),0.14,(i-1)*.3)
put(sfx,F(74),glass(93,1.2),0.07); put(sfx,F(84),scribble(),0.08,0.2)
put(sfx,F(104),riser(1.0),0.16)
put(sfx,F(135),boom(30,0.6),0.6); put(sfx,F(135),sparkle(1.0),0.12)
# logo: counters + soft taps, then defocus
for k in range(26):
    t=36+36*(1-(1-k/26)**2); put(sfx,F(135+t),tick(5200,0.004),0.05,rng.uniform(-.3,.3))
put(sfx,F(135+72),bell(81),0.1); put(sfx,F(135+80),bell(74),0.09)
for j,t in enumerate((88,92,100,104,108,112)): put(sfx,F(135+t),tap(),0.12)
put(sfx,F(135+112),glass(91,1.0),0.06)
put(sfx,F(271),whoosh(0.5,200,1400),0.12)
# systems: whoosh in, thump on the downbeat, signature bell per system, icon draw, one pluck per skill
SIG=[62,65,67,69,72,74,77,79,81]
SCALE=[62,65,67,69,72,74,77,79,81,84]
COUNTS=[4,5,6,5,5,5,4,4,6]  # skills per system (sum 44)
for i in range(9):
    t0=285+i*110
    put(sfx,F(t0-6),whoosh(0.45,250,3000),0.12,(-1)**i*0.4); put(sfx,F(t0),thump(),0.32)
    put(sfx,F(t0+4),bell(SIG[i]+12,1.6),0.09); put(sfx,F(t0+4),f2(riser(0.6),'low',3000),0.04)
    for j in range(COUNTS[i]):
        put(sfx,F(t0+30+j*9),pluck(SCALE[(i+j*2)%len(SCALE)]+12),0.12,(j%2-.5)*.5); put(sfx,F(t0+30+j*9),tick(3000,0.004),0.04)
    if i==4: put(sfx,F(t0+2),glass(88,0.8),0.08); put(sfx,F(t0+6),glass(93,1.0),0.08)
# wall
put(sfx,F(1255),riser(0.7),0.12)
for j in range(44): put(sfx,F(1275+j*0.9),tick(rng.uniform(3500,6500),0.004),0.05,rng.uniform(-.6,.6))
put(sfx,F(1331),boom(28,0.7),0.55); put(sfx,F(1331),bell(74,2.0),0.07)
put(sfx,F(1370),riser(0.7),0.14)
put(sfx,F(1392),sparkle(1.0),0.2); put(sfx,F(1393),boom(40,0.3,0.8),0.3)
# CTA
for t in (1401,1404): put(sfx,F(t),tap(),0.1)
put(sfx,F(1407),thump(),0.3); put(sfx,F(1407),bell(86,1.4),0.09)
for t in (1421,1425,1429): put(sfx,F(t),tap(),0.1)
for i in range(9): put(sfx,F(1433+i*2),tick(4000+i*150,0.004),0.06,(i-4)/8)
for t in range(1455,1471,3): put(sfx,F(t),tap(),0.3,rng.uniform(-.1,.1))
put(sfx,F(1477),whoosh(0.25,800,4000),0.08); put(sfx,F(1478),glass(91,0.8),0.09); put(sfx,F(1487),pluck(86),0.1)
put(sfx,F(1515),boom(34,0.6),0.35); put(sfx,F(1515),bell(74,2.5),0.08)

def verb(x,dec=0.35,mix=0.02):
    ir=noise(int(1.2*SR))*np.exp(-T(int(1.2*SR))/dec)*mix; ir[0]=1; ir=f2(ir,'low',7000)
    return np.stack([fftconvolve(x[:,c],ir)[:N] for c in (0,1)],1)
mus=verb(mus,0.6,0.015); sfx=verb(sfx,0.3,0.02)
t=T(N)[:,None]; mus*=np.minimum(1,t/0.4)*np.clip((N/SR-t)/1.2,0,1)
for name,b in (('mus',mus),('sfx',sfx)):
    b=f2(b.T,'high',28).T; b/=np.abs(b).max()
    pcm=(b*32767*0.8).astype(np.int16); w=wave.open(sys.argv[1].replace('.wav',f'_{name}.wav'),'wb')
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
print('library audio ok')
