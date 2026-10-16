# "Jurusan kamu apa?" Skills Library short (25s, 750 frames @30fps) — SFX only, on a 120 BPM grid (1 beat = 15 f).
# Cuts: hook 0 · montage 60/90/120/150 · 4-tile beat 180 (tiles 186/201/216/231) · PRISM 240 · demo 270 · wall 450 · CTA 600.
# Skill chips everywhere use ONE identical pop (by request). Every hard cut gets the same cut-hit + whoosh.
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; N=int(SR*750/30); rng=np.random.default_rng(25); F=lambda f: f/30
T=lambda n: np.arange(n)/SR; f2=lambda x,k,f: sosfilt(butter(2,f,k,fs=SR,output='sos'),x)
noise=lambda n: rng.normal(0,1,n)
def env(n,a,d): t=T(n); return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
out=np.zeros((N,2))
def put(t0,s,g=1.0,pan=0.0):
    i=int(t0*SR); n=min(len(s),N-i)
    if n<=0 or i<0: return
    a=(pan+1)*np.pi/4; out[i:i+n,0]+=s[:n]*g*np.cos(a); out[i:i+n,1]+=s[:n]*g*np.sin(a)
def pop(f0=480,f1=1300,dur=.075,click=.5,air=.25):
    n=int(dur*SR); t=T(n); f=f0+(f1-f0)*(t/dur)**.55
    s=np.sin(2*np.pi*np.cumsum(f)/SR)*np.minimum(1,t/.002)*np.exp(-t/(dur*.45))
    k=int(.004*SR); s[:k]+=f2(noise(k),'band',[3000,9000])*click*np.linspace(1,0,k)
    m=int(.06*SR); a=np.zeros(max(n,m)); a[:n]+=s; a[:m]+=f2(noise(m),'band',[4000,11000])*np.exp(-T(m)/.02)*air; return a
POP=pop()
def tick(fr=4000,d=.005):
    n=int(.03*SR); t=T(n); return np.sin(2*np.pi*fr*t)*np.exp(-t/d)+f2(noise(n),'high',5000)*np.exp(-t/.002)*.3
def tap():
    n=int(.02*SR); t=T(n); return np.sin(2*np.pi*1900*t)*np.exp(-t/.004)*.7+f2(noise(n),'high',4000)*np.exp(-t/.002)*.3
def key():
    n=int(.045*SR); t=T(n); f0=rng.uniform(170,240); s=np.sin(2*np.pi*f0*t)*np.exp(-t/.018)*.9
    k=int(.004*SR); s[:k]+=f2(noise(k),'band',[2500,6500])*.6*np.linspace(1,0,k); return s
def whoosh(dur=.4,lo=250,hi=3600,rise=False):
    n=int(dur*SR); x=noise(n); y=np.zeros(n); ch=int(.008*SR)
    for s0 in range(0,n,ch):
        c=s0/n; w=c if rise else np.sin(np.pi*c)**2; y[s0:s0+ch]=f2(x[s0:s0+ch],'band',[lo+(hi-lo)*w*.5,lo+(hi-lo)*w+60])
    return y*(np.minimum(1,T(n)/(dur*.7)) if rise else np.sin(np.pi*T(n)/dur)**2)
def cut_hit():   # punchy edit hit: low thump + crack
    n=int(.35*SR); t=T(n); f=140*np.exp(-t*14)+48
    return np.tanh(1.6*np.sin(2*np.pi*np.cumsum(f)/SR))*env(n,.001,.09)+f2(noise(n),'band',[1500,7000])*np.exp(-t/.012)*.55
def boom(base=30,dec=.7,dur=1.6):
    n=int(dur*SR); t=T(n); f=80*np.exp(-t*3)+base; return np.tanh(1.4*np.sin(2*np.pi*np.cumsum(f)/SR))*env(n,.002,dec)
def thud(f0=120):
    n=int(.25*SR); t=T(n); f=f0*np.exp(-t*8)+50; return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.002,.06)+f2(noise(n),'low',800)*np.exp(-t/.01)*.4
def riser(dur=.5):
    n=int(dur*SR); t=T(n); x=noise(n); y=np.zeros(n); ch=int(.01*SR)
    for s0 in range(0,n,ch): c=s0/n; y[s0:s0+ch]=f2(x[s0:s0+ch],'band',[300+6000*c**2,600+10000*c**2])
    return (y+np.sin(2*np.pi*np.cumsum(200+1600*(t/dur)**2)/SR)*.3)*(t/dur)**2.3
def bloop(f0=260,f1=820,dur=.16):
    n=int(dur*SR); t=T(n); f=f0+(f1-f0)*(t/dur)**.6; return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.002,dur/2.5)
def swell(dur=2.0):
    n=int(dur*SR); t=T(n); return f2(noise(n),'low',500)*np.sin(np.pi*t/dur)**2*.6+np.sin(2*np.pi*55*t)*np.sin(np.pi*t/dur)**2*.4

# hook
for k,t in enumerate((0,6,12)): put(F(t),tick(3200+k*400,.008),.2,(k-1)*.3)
put(F(12),pop(400,1100,.09),.3)
for t in (24,30): put(F(t),tap(),.18)
put(F(46),riser(F(14)),.3)
# montage cuts (same cut sound each time) + the one skill pop
for t in (60,90,120,150,240):
    put(F(t)-.08,whoosh(.18,600,5000,True),.18); put(F(t),cut_hit(),.6)
    put(F(t+8),thud(150),.28); put(F(t+14),POP,.42)
# four-tile beat
put(F(180),cut_hit(),.55)
for k in range(8): put(F(180+k*4),tick(3000+k*220,.005),.14,(k%2-.5)*.4)
for t in (186,201,216,231): put(F(t),cut_hit(),.4); put(F(t+2),POP,.38)
# demo (slow moment)
for k,t in enumerate((270,274,278)): put(F(t),tick(2800+k*300,.008),.18)
put(F(270),cut_hit(),.5)
for t in range(278,314,2):
    if rng.random()<.85: put(F(t)+rng.uniform(0,.02),key(),.22,rng.uniform(-.2,.2))
put(F(316),tap(),.4); put(F(318),whoosh(.35,400,5000,True),.25)
put(F(322),whoosh(.5,150,1800),.2); put(F(334),thud(100),.45); put(F(334),swell(2.5),.22)
for k in range(2): put(F(370+k*8),bloop(240+k*40,780+k*80),.25)
for t in (360,375,390): put(F(t),POP,.42)
# wall
put(F(450),cut_hit(),.55); put(F(450),boom(34,.4,1.0),.35)
for j in range(44): put(F(450+rng.uniform(0,14)),tick(rng.uniform(3200,6800),.004),.08,rng.uniform(-.7,.7))
put(F(496),riser(.45),.22)
put(F(510),boom(28,.8),.6); put(F(510),cut_hit(),.4); put(F(525),cut_hit(),.4); put(F(540),tick(2600,.01),.15)
# CTA
put(F(600),cut_hit(),.45)
for k,t in enumerate((600,605,609)): put(F(t),tick(3000+k*300,.008),.16)
put(F(615),thud(140),.4); put(F(615),POP,.35)
for t in range(634,650,3): put(F(t),tap(),.35,rng.uniform(-.1,.1))
put(F(652),whoosh(.15,800,5000,True),.12); put(F(652),POP,.42)
put(F(666),POP,.42); put(F(671),POP,.3)
put(F(690),thud(150),.35); put(F(690),POP,.3)
put(F(736),boom(32,.6),.4)

ir=noise(int(.8*SR))*np.exp(-T(int(.8*SR))/.22)*.018; ir[0]=1; ir=f2(ir,'low',7000)
out=np.stack([fftconvolve(out[:,c],ir)[:N] for c in (0,1)],1); out=f2(out.T,'high',30).T; out/=np.abs(out).max()
pcm=(out*32767*.89).astype(np.int16); w=wave.open(sys.argv[1],'wb')
w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('short sfx ok')
