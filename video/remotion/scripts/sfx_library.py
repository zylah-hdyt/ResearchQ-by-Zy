# ResearchQ Skills Library (51s, 1530 frames @30fps) — SFX ONLY (no music; the creator adds their own backsound).
# Every skill reveal has a sound, and each system has its own timbre that fits its field:
#   GENESIS glass sonar · CATALYST marimba blips · NEXUS digital data blips · ORACLE warm bells · KERNEL 8-bit square
#   beeps · VERDICT wood/gavel knocks · SPIRAL kalimba · VITALS heart-monitor beeps · PRISM crystal chimes.
# Each transition has its own sound too (iris ring, block-wipe thwack, shutter, push-up whoosh, blinds ratchet, dive,
# swing, slices, sonar ring, card drop). Scene starts: hook 0 · logo 120 · systems 285 + i·110 · wall 1275 · CTA 1383.
# (scripts/audio_library.py is the earlier beat-driven version, kept for reference.)
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; N=int(SR*1530/30); rng=np.random.default_rng(909); F=lambda f: f/30
T=lambda n: np.arange(n)/SR; mf=lambda m: 440*2**((m-69)/12)
f2=lambda x,k,f: sosfilt(butter(2,f,k,fs=SR,output='sos'),x)
noise=lambda n: rng.normal(0,1,n)
def env(n,a,d): t=T(n); return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
out=np.zeros((N,2))
def put(t0,s,g=1.0,pan=0.0):
    i=int(t0*SR); n=min(len(s),N-i)
    if n<=0 or i<0: return
    a=(pan+1)*np.pi/4; out[i:i+n,0]+=s[:n]*g*np.cos(a); out[i:i+n,1]+=s[:n]*g*np.sin(a)

# ---------- per-system skill timbres ----------
def glass(m,dur=.9):
    f=mf(m); n=int(dur*SR); t=T(n); return (np.sin(2*np.pi*f*t)*np.exp(-t/.32)+.3*np.sin(2*np.pi*f*2.32*t)*np.exp(-t/.08))*np.minimum(1,t/.001)
def sonar(m):
    a=glass(m,1.0); e=np.zeros(len(a)+int(.12*SR)); e[:len(a)]+=a; e[int(.12*SR):]+=a*.25; return e
def marimba(m,dur=.5):
    f=mf(m); n=int(dur*SR); t=T(n); s=np.sin(2*np.pi*f*t)*np.exp(-t/.16)+.35*np.sin(2*np.pi*f*4*t)*np.exp(-t/.025)
    k=int(.005*SR); s[:k]+=f2(noise(k),'band',[1500,4000])*.4; return s
def bubble_blip(m):
    n=int(.09*SR); t=T(n); f=mf(m)*(0.7+0.6*(t/.09)**.5); return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.002,.035)
def data_blip(m):
    n=int(.11*SR); s=np.zeros(n)
    for k,mm in enumerate((m,m+12,m+7)):
        a=int(k*.03*SR); b=int((k*.03+.03)*SR); tt=T(b-a); s[a:b]=np.sign(np.sin(2*np.pi*mf(mm)*tt))*.35*np.exp(-tt/.02)
    return f2(s,'low',6000)
def bell(m,dur=1.3):
    f=mf(m); n=int(dur*SR); t=T(n)
    return sum(a*np.sin(2*np.pi*f*r*t)*np.exp(-t/d) for r,a,d in ((1,1,.6),(2.76,.4,.22),(5.4,.2,.08),(8.93,.1,.035)))*np.minimum(1,t/.002)
def square_beep(m):
    n=int(.13*SR); t=T(n); s=np.sign(np.sin(2*np.pi*mf(m)*t))*.3*(t<.09)*np.exp(-t/.08)
    k=int(.012*SR); s[:k]+=f2(noise(k),'band',[2500,6000])*.4*np.linspace(1,0,k); return f2(s,'low',7000)
def gavel(m):
    f=mf(m); n=int(.16*SR); t=T(n)
    body=np.sin(2*np.pi*f*t)*np.exp(-t/.035)+.5*np.sin(2*np.pi*f*2.7*t)*np.exp(-t/.015)
    knock=f2(noise(n),'band',[f*.8,f*3])*np.exp(-t/.008)*.7; low=np.sin(2*np.pi*110*t)*np.exp(-t/.05)*.5
    return body+knock+low
def kalimba(m,dur=.7):
    f=mf(m); n=int(dur*SR); t=T(n); return (np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*f*6.27*t)*np.exp(-t/.02))*np.exp(-t/.22)*np.minimum(1,t/.001)
def monitor(m):
    n=int(.16*SR); t=T(n); return np.sin(2*np.pi*mf(m)*t)*np.minimum(1,t/.003)*(t<.11)*np.exp(-np.maximum(0,t-.09)/.01)
def crystal(m):
    a=bell(m+12,1.4)*.7; t=T(len(a))
    sh=sum(np.sin(2*np.pi*mf(m+24+o)*t+rng.uniform(0,6))*np.exp(-t/rng.uniform(.15,.4)) for o in (0,4,7))*.15
    return a+sh
def swish(dur=.1):
    n=int(dur*SR); t=T(n); x=noise(n); y=np.zeros(n); ch=int(.005*SR)
    for s0 in range(0,n,ch): c=s0/n; y[s0:s0+ch]=f2(x[s0:s0+ch],'band',[1500+3000*c,3000+7000*c])
    return y*(t/dur)**1.5
SCALES=[[74,77,79,81,84,86],[67,69,72,74,76,79],[72,74,76,79,81,84],[69,72,74,76,79,81],
        [72,76,79,84,88,91],[55,57,60,62,64,67],[74,76,79,81,83,86],[81,81,81,81,81,81],[79,83,86,88,91,93]]
COUNTS=[4,5,6,5,5,5,4,4,6]
def skill_sound(i,j):
    m=SCALES[i][j]
    if i==0: return sonar(m)
    if i==1: b=bubble_blip(m+12)*.4; s=marimba(m); s[:len(b)]+=b; return s
    if i==2: return data_blip(m)
    if i==3: return bell(m)
    if i==4: return square_beep(m)
    if i==5: return gavel(m)
    if i==6: return kalimba(m)
    if i==7: return monitor(86 if j==COUNTS[7]-1 else 81)   # flat beeps, last one higher like a monitor alert
    return crystal(m)
GAIN=[.16,.2,.22,.12,.13,.3,.2,.14,.12]

# ---------- generic ----------
def tick(f=4200,d=.005):
    n=int(.03*SR); t=T(n); return np.sin(2*np.pi*f*t)*np.exp(-t/d)+f2(noise(n),'high',5000)*np.exp(-t/.002)*.3
def tap():
    n=int(.02*SR); t=T(n); return np.sin(2*np.pi*1900*t)*np.exp(-t/.004)*.7+f2(noise(n),'high',4000)*np.exp(-t/.002)*.3
def whoosh(dur=.45,lo=250,hi=3000,rise=False):
    n=int(dur*SR); x=noise(n); y=np.zeros(n); ch=int(.008*SR)
    for s0 in range(0,n,ch):
        c=s0/n; w=c if rise else np.sin(np.pi*c)**2; y[s0:s0+ch]=f2(x[s0:s0+ch],'band',[lo+(hi-lo)*w*.5,lo+(hi-lo)*w+60])
    return y*(np.minimum(1,T(n)/(dur*.7)) if rise else np.sin(np.pi*T(n)/dur)**2)
def boom(base=32,dec=.6,dur=1.5):
    n=int(dur*SR); t=T(n); f=75*np.exp(-t*3)+base; return np.tanh(1.4*np.sin(2*np.pi*np.cumsum(f)/SR))*env(n,.003,dec)
def thud(f0=120):
    n=int(.25*SR); t=T(n); f=f0*np.exp(-t*8)+50; return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,.002,.06)+f2(noise(n),'low',800)*np.exp(-t/.01)*.4
def riser(dur=1.0):
    n=int(dur*SR); t=T(n); x=noise(n); y=np.zeros(n); ch=int(.01*SR)
    for s0 in range(0,n,ch): c=s0/n; y[s0:s0+ch]=f2(x[s0:s0+ch],'band',[300+6000*c**2,600+10000*c**2])
    return (y+np.sin(2*np.pi*np.cumsum(200+1500*(t/dur)**2)/SR)*.3)*(t/dur)**2.3
def shutter():
    n=int(.3*SR); s=np.zeros(n)
    for d,g in ((0,1),(.07,.8)):
        k=int(.02*SR); i=int(d*SR); tt=T(k); s[i:i+k]+=(f2(noise(k),'band',[1200,5000])*np.exp(-tt/.004)+np.sin(2*np.pi*700*tt)*np.exp(-tt/.006))*g
    s+=f2(noise(n),'band',[400,2000])*env(n,.01,.08)*.25; return s
def zap(f0=2400,f1=300,dur=.09):
    n=int(dur*SR); t=T(n); f=f0+(f1-f0)*(t/dur); return np.sign(np.sin(2*np.pi*np.cumsum(f)/SR))*.25*env(n,.001,dur/2)+f2(noise(n),'high',5000)*np.exp(-t/.01)*.2
def sparkle(dur=.9):
    n=int(dur*SR); o=np.zeros(n)
    for _ in range(14):
        b=glass(rng.choice([96,98,100,103,105]),.5)*rng.uniform(.2,.5); s0=int(rng.uniform(0,dur*.6)*SR); o[s0:s0+len(b)]+=b[:n-s0]
    k=int(.004*SR); o[:k]+=f2(noise(k),'high',9000)*3; return o
def scribble(dur=.3):
    n=int(dur*SR); return f2(noise(n),'band',[1500,5500])*np.abs(np.sin(2*np.pi*14*T(n)))*env(n,.01,dur)

# ---------- hook 0–120 ----------
for i,t in enumerate((6,16,26,36)): put(F(t),tick(3400+i*350),.16,[-.3,.3,-.2,.2][i]); put(F(t),glass(84+i*2,.5),.05)
for i,t in enumerate((60,66,74)): put(F(t),tick(2400+i*250,.012),.18,(i-1)*.3)
put(F(74),glass(91,1.0),.09); put(F(84),scribble(),.1,.2)
put(F(96),riser(F(24)),.22)
# ---------- logo 120–285 ----------
put(F(120),boom(30,.7),.55); put(F(120),sparkle(1.0),.16)
for k in range(24): t=156+36*(1-(1-k/24)**2); put(F(t),tick(5200,.004),.07,rng.uniform(-.3,.3))
put(F(192),bell(81),.14); put(F(200),bell(76),.12)
for t in (208,212,220,224,228,232): put(F(t),tap(),.14)
# ---------- transitions ----------
TS=[285+i*110 for i in range(9)]+[1275]
put(F(TS[0]),glass(86,1.2),.14); put(F(TS[0]),whoosh(.4,300,2500,True),.12); put(F(TS[0]+4),glass(93,1.0),.08)  # iris ring
put(F(TS[1]),whoosh(.35,300,3500),.2,-.6); put(F(TS[1]+6),thud(160),.35,.4)                                     # block wipe
put(F(TS[2]+2),shutter(),.4); put(F(TS[2]+2),whoosh(.3,200,1500),.1)                                             # split shutter
put(F(TS[3]),whoosh(.45,300,5000,True),.22)                                                                     # push up
for k in range(12): put(F(TS[4])+k*.025,tick(2600+k*120,.006),.12,(k%2-.5)*.4)                                  # blinds ratchet
put(F(TS[5]),whoosh(.45,120,1200,True),.2); put(F(TS[5]+12),boom(34,.4,1.0),.4)                                 # dive
put(F(TS[6]),whoosh(.45,250,2600),.2,.7); put(F(TS[6]+5),whoosh(.35,200,1800),.12,-.7)                          # swing
for k in range(5): put(F(TS[7])+k*.035,zap(2600-k*250,400),.3,(-1)**k*.5)                                       # slices
put(F(TS[8]),bell(74,1.6),.12); put(F(TS[8]),glass(98,1.2),.08); put(F(TS[8])+.18,glass(98,1.0),.04)            # ring from dot
put(F(TS[9]),whoosh(.5,200,1600),.16); put(F(TS[9]+11),thud(90),.4)                                              # card drop
# ---------- skills: one sound per skill, timbre per system ----------
for i in range(9):
    t0=TS[i]
    for k in range(6): put(F(t0+6+k*2),tick(2200+k*260,.003),.05,(k%2-.5)*.4)   # name assembling
    for j in range(COUNTS[i]):
        t=F(t0+round(27.5+j*6.875))
        put(t-.08,swish(.08),.05,.5)
        put(t,skill_sound(i,j),GAIN[i],(j%2-.5)*.45)
    if i==4: put(F(t0+3),glass(88,.8),.1); put(F(t0+8),glass(93,1.0),.1)
# ---------- wall ----------
for j in range(44): put(F(1286+j*0.9),tick(rng.uniform(3200,6800),.004),.07,rng.uniform(-.7,.7))
put(F(1330),boom(28,.7),.55); put(F(1330),bell(74,2.0),.1)
put(F(1360),riser(.55),.16); put(F(1384),sparkle(1.0),.24); put(F(1385),boom(40,.3,.8),.35)
# ---------- CTA ----------
for t in (1389,1392): put(F(t),tap(),.12)
put(F(1395),thud(140),.32); put(F(1395),bell(86,1.3),.1)
for t in (1409,1413,1417): put(F(t),tap(),.12)
for i in range(9): put(F(1421+i*2),tick(3900+i*150,.004),.08,(i-4)/8)
for t in range(1443,1459,3): put(F(t),tap(),.32,rng.uniform(-.1,.1))
put(F(1465),swish(.12),.1); put(F(1465),glass(91,.8),.12); put(F(1475),bubble_blip(84),.12)
put(F(1513),boom(34,.6),.4); put(F(1513),bell(74,2.2),.1)

ir=noise(int(.9*SR))*np.exp(-T(int(.9*SR))/.25)*.02; ir[0]=1; ir=f2(ir,'low',7000)
out=np.stack([fftconvolve(out[:,c],ir)[:N] for c in (0,1)],1)
out=f2(out.T,'high',30).T; out/=np.abs(out).max()
pcm=(out*32767*.89).astype(np.int16); w=wave.open(sys.argv[1],'wb')
w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('library sfx ok')
