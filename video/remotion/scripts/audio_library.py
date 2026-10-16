# ResearchQ Skills Library (51s, 1530 frames @30fps) — beat-driven score + SFX.
# 131 BPM, 1 beat = 13.75 frames, 1 bar = 55 frames, downbeats at 10 + 55k (so 120, 285, 1275, 1330, 1385 are downbeats).
# Arrangement: 0–120 filtered build + snare roll + gap → DROP 120 (logo) · 285–1275 full groove (9 systems, 2 bars each;
# energy lift with 16th arp from KERNEL) · 1275 breakdown + roll → DROP 1330 ("44 skill") · 1385 flash impact · CTA groove
# · final hit 1495 + tail. Skill reveals = sidechained synth stab + snap + swish on the 8th-note grid, rising in pitch.
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; N=int(SR*1530/30); rng=np.random.default_rng(131)
T=lambda n: np.arange(n)/SR; mf=lambda m: 440*2**((m-69)/12)
f2=lambda x,k,f: sosfilt(butter(2,f,k,fs=SR,output='sos'),x)
noise=lambda n: rng.normal(0,1,n)
def env(n,a,d): t=T(n); return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
BEAT=60/131; FR=lambda f: f/30; DB=lambda k: FR(10)+k*4*BEAT   # k-th bar downbeat (seconds)
def bar_of(frame): return (frame-10)/55
tracks={k:np.zeros((N,2)) for k in ('kick','drums','bass','pad','lead','sfx')}
kenv=np.zeros(N)
def put(name,t0,s,g=1.0,pan=0.0):
    i=int(t0*SR); n=min(len(s),N-i)
    if n<=0 or i<0: return
    a=(pan+1)*np.pi/4; tracks[name][i:i+n,0]+=s[:n]*g*np.cos(a); tracks[name][i:i+n,1]+=s[:n]*g*np.sin(a)

# ---------- instruments ----------
def kick(punch=1.0):
    n=int(.42*SR); t=T(n); f=48+110*np.exp(-t*30)+60*np.exp(-t*90); ph=2*np.pi*np.cumsum(f)/SR
    k=np.tanh(1.8*np.sin(ph))*env(n,.001,.16); c=int(.004*SR); k[:c]+=f2(noise(c),'band',[2500,6000])*.6*punch; return k
def clap():
    n=int(.25*SR); t=T(n); x=f2(noise(n),'band',[900,4200])
    e=sum(np.exp(-np.maximum(0,t-d)/.008)*(t>=d) for d in (0,.009,.018))*.6+np.exp(-np.maximum(0,t-.026)/.07)*(t>=.026)
    body=np.sin(2*np.pi*190*t)*np.exp(-t/.03)*.4; return x*e+body
def snare_hit():
    n=int(.18*SR); t=T(n); return f2(noise(n),'band',[1200,7000])*np.exp(-t/.05)+np.sin(2*np.pi*210*t)*np.exp(-t/.03)*.5
def hat(open_=False):
    n=int((.22 if open_ else .05)*SR); t=T(n); return f2(noise(n),'high',7500)*np.exp(-t/(.07 if open_ else .012))
def crash(dur=1.8):
    n=int(dur*SR); t=T(n); x=f2(noise(n),'high',4500); return x*np.exp(-t/.6)*np.minimum(1,t/.002)
def saw(f,t): return 2*((f*t)%1)-1
def bass_note(m,dur):
    n=int(dur*SR); t=T(n); s=saw(mf(m),t)*.6+np.sin(2*np.pi*mf(m)*t)*.8
    return f2(s,'low',600)*env(n,.003,dur*.6)
def pad(chord,dur,bright=2200):
    n=int(dur*SR); t=T(n); s=np.zeros(n)
    for m in chord:
        for d in (.993,1.0,1.007): s+=saw(mf(m)*d,t+rng.uniform(0,1))
    e=np.minimum(1,t/.05)*np.minimum(1,np.maximum(0,(dur-t)/.08)); return f2(s*e/len(chord)/3,'low',bright)
def pluck(m,dur=.22):
    n=int(dur*SR); t=T(n); s=saw(mf(m),t)*.5+np.sin(2*np.pi*mf(m)*t); return f2(s,'low',3500)*env(n,.002,.07)
def stab(chord,dur=.32,bright=4200):  # skill reveal: bright detuned supersaw chord stab
    n=int(dur*SR); t=T(n); s=np.zeros(n)
    for m in chord:
        for d in (.99,.997,1.0,1.003,1.01): s+=saw(mf(m)*d,t+rng.uniform(0,1))
    s=f2(s/len(chord)/5,'low',bright)*env(n,.002,.09)
    return s
def snap():
    n=int(.06*SR); t=T(n); return f2(noise(n),'band',[2000,6500])*np.exp(-t/.01)+np.sin(2*np.pi*1400*t)*np.exp(-t/.008)*.4
def swish(dur=.12):
    n=int(dur*SR); t=T(n); x=noise(n); y=np.zeros(n); ch=int(.005*SR)
    for s0 in range(0,n,ch): c=s0/n; y[s0:s0+ch]=f2(x[s0:s0+ch],'band',[800+5000*c,1600+8000*c])
    return y*(t/dur)**2
def riser(dur=1.0):
    n=int(dur*SR); t=T(n); x=noise(n); y=np.zeros(n); ch=int(.01*SR)
    for s0 in range(0,n,ch): c=s0/n; y[s0:s0+ch]=f2(x[s0:s0+ch],'band',[300+6000*c**2,600+10000*c**2])
    return (y+np.sin(2*np.pi*np.cumsum(180+1600*(t/dur)**2)/SR)*.35)*(t/dur)**2.4
def boom(base=30,dec=.7,dur=1.8):
    n=int(dur*SR); t=T(n); f=80*np.exp(-t*3)+base; return np.tanh(1.5*np.sin(2*np.pi*np.cumsum(f)/SR))*env(n,.002,dec)
def rev_cym(dur=.9):
    c=crash(dur)[::-1]; return c*np.linspace(0,1,len(c))**1.5
def glass(m,dur=.8):
    f=mf(m); n=int(dur*SR); t=T(n); return (np.sin(2*np.pi*f*t)*np.exp(-t/.3)+.3*np.sin(2*np.pi*f*2.32*t)*np.exp(-t/.08))
def tick(f=4200,d=.005):
    n=int(.03*SR); t=T(n); return np.sin(2*np.pi*f*t)*np.exp(-t/d)
def tap():
    n=int(.02*SR); t=T(n); return np.sin(2*np.pi*1900*t)*np.exp(-t/.004)*.7+f2(noise(n),'high',4000)*np.exp(-t/.002)*.3
def chop(m):  # pitched vocal-like "hey" chop for the re-hook
    n=int(.22*SR); t=T(n); f=mf(m); s=sum(np.sin(2*np.pi*f*h*t)/h for h in range(1,8))
    form=f2(s,'band',[600,2400]); return form*env(n,.01,.08)

# chords per 2-bar block (Dm · Bb · F · C) and roots
CH=[[62,65,69,72],[58,62,65,69],[60,65,69,72],[60,64,67,72]]
RT=[38,34,41,36]
def chord_at(frame): return int(max(0,frame-285)//110)%4 if frame>=285 else 0

# ---------- arrangement ----------
def groove(b0,b1,arp=False,bass=True,hats=True,full=True):
    for b in range(b0,b1):
        for q in range(4):
            tb=DB(b)+q*BEAT; fr=10+b*55+q*13.75
            put('kick',tb,kick(),1.0); i=int(tb*SR); kenv[i:i+int(.3*SR)]=np.maximum(kenv[i:i+int(.3*SR)],env(int(.3*SR),.001,.12)[:max(0,min(int(.3*SR),N-i))])
            if q in (1,3): put('drums',tb,clap(),.55)
            if hats:
                for e in range(4):
                    put('drums',tb+e*BEAT/4,hat(),[.18,.09,.14,.09][e],.25)
                put('drums',tb+BEAT/2,hat(True),.22,-.25)
            ci=chord_at(fr);
            if bass:
                for e in (1,3): put('bass',tb+e*BEAT/4,bass_note(RT[ci],BEAT/4*.9),.8)
            if arp:
                ch=CH[ci]
                for e in range(4): put('lead',tb+e*BEAT/4,pluck(ch[(q*4+e)%4]+12),.22,(e%2-.5)*.6)
        if full:
            ci=chord_at(10+b*55); put('pad',DB(b),pad(CH[ci],4*BEAT,2600),.55)
# intro build 0–120: dark pad, filtered kick on beats from bar 1, accelerating snare roll, riser, 1/4-bar gap
put('pad',0,f2(pad([50,57,62,65],FR(112),900),'low',900),.6)
put('bass',0,np.sin(2*np.pi*mf(26)*T(int(FR(112)*SR)))*np.minimum(1,T(int(FR(112)*SR))/1.5),.35)
for q in range(8):
    tb=DB(1)+q*BEAT
    if tb<FR(113): put('kick',tb,f2(kick(.3),'low',300),.5)
for k in range(28):
    t=FR(65)+ (FR(113)-FR(65))*(1-(1-k/28)**1.6)
    put('drums',t,snare_hit(),.06+.2*k/28)
put('sfx',FR(65),riser(FR(113)-FR(65)),.13)
put('sfx',FR(96),rev_cym(FR(24)/1.0),.25)
# DROP 120 → groove until the wall (bars 2..23), lift with arp from KERNEL (frame 725 = bar 13)
groove(2,5)                         # logo bars
groove(5,13)                        # GENESIS → ORACLE
groove(13,23,arp=True)              # KERNEL → PRISM, more energy
# wall breakdown 1275–1330: pad + riser + roll, gap, DROP 1330 → groove through CTA
put('pad',DB(23),pad([62,65,69,74],4*BEAT,1800),.6)
for k in range(24):
    t=DB(23)+4*BEAT*(1-(1-k/24)**1.5)
    if t<FR(1323): put('drums',t,snare_hit(),.1+.32*k/24)
put('sfx',DB(23),riser(FR(1323)-DB(23)),.24)
groove(24,27,arp=True)              # 1330–1495
groove(27,28,arp=False,hats=False)  # last bar lighter
# final chord tail
TL=FR(1530)-DB(27); put('pad',DB(27),pad([50,57,62,65,69],TL,1600)*np.linspace(1,0,int(TL*SR)),.6)

# ---------- SFX ----------
for i,t in enumerate((6,16,26,36)): put('sfx',FR(t),tick(3600+i*300),.12,[-.3,.3,-.2,.2][i])
for i,t in enumerate((60,66,74)): put('sfx',FR(t),glass(86+i*3,.6),.07,(i-1)*.3)
for at in (120,1330): put('sfx',FR(at),boom(30,.8),.6); put('drums',FR(at),crash(2.2),.35)
put('sfx',FR(120),glass(98,1.2),.08)
# counters (logo local 36–72 → 156–192), landing stabs
for k in range(24):
    t=156+36*(1-(1-k/24)**2); put('sfx',FR(t),tick(5200,.004),.05,rng.uniform(-.3,.3))
put('sfx',FR(192),stab([62,69,74,77],.4),.3); put('sfx',FR(203),stab([58,65,70,74],.4),.26)
# systems: reverse cymbal into each downbeat, crash + sub on it, name-assembly glitch, skill stabs
for i in range(9):
    t0=285+i*110; ci=i%4; ch=CH[ci]
    put('sfx',FR(t0)-.9,rev_cym(.9),.18); put('drums',FR(t0),crash(1.4),.22,(-1)**i*.3); put('sfx',FR(t0),boom(36,.35,.9),.3)
    for k in range(len(['x']*7)): put('sfx',FR(t0+6+k*2),tick(2500+k*350,.003),.05,(k%2-.5)*.4)
    n_sk=[4,5,6,5,5,5,4,4,6][i]
    for j in range(n_sk):
        t=FR(t0+27.5+j*6.875)
        lift=[0,2,4,5,7,9][j]
        put('sfx',t-.11,swish(.11),.12,.5)
        put('sfx',t,stab([m+lift for m in ch],.3),.34,(j%2-.5)*.5)
        put('sfx',t,snap(),.22)
    if i==4: put('sfx',FR(t0+4),chop(69),.5); put('sfx',FR(t0+10),chop(72),.45)
# wall chip cascade (32nd-note glitch ticks over the breakdown)
for j in range(44): put('sfx',FR(1275)+j*BEAT/8,tick(rng.uniform(3000,7000),.004),.06,rng.uniform(-.7,.7))
put('sfx',FR(1330),stab([62,69,74,77,81],.5),.3)
# flash 1385
put('sfx',FR(1385),boom(40,.4,1.0),.45); put('drums',FR(1385),crash(2.0),.3)
for k in range(10): put('sfx',FR(1385)+k*.04,glass(rng.choice([98,101,103,105]),.4),.08,rng.uniform(-.6,.6))
# CTA (Sequence starts 1383): price, chips, typing, sent, end hit
put('sfx',FR(1383+12),stab([58,65,70,74],.35),.25)
for i in range(9): put('sfx',FR(1383+38+i*2),tick(3800+i*160,.004),.06,(i-4)/8)
for t in range(1383+60,1383+76,3): put('sfx',FR(t),tap(),.3)
put('sfx',FR(1383+82),swish(.12),.12); put('sfx',FR(1383+82),stab([65,69,72,77],.3),.25)
put('sfx',FR(1495),boom(32,.8),.5); put('drums',FR(1495),crash(2.5),.3)

# ---------- mix ----------
duck=1-0.55*np.clip(kenv,0,1)
for k in ('pad','bass','lead'): tracks[k]*=duck[:,None]
def verb(x,dec=.35,mix=.02):
    ir=noise(int(1.0*SR))*np.exp(-T(int(1.0*SR))/dec)*mix; ir[0]=1; ir=f2(ir,'low',7000)
    return np.stack([fftconvolve(x[:,c],ir)[:N] for c in (0,1)],1)
tracks['pad']=verb(tracks['pad'],.6,.02); tracks['lead']=verb(tracks['lead'],.4,.03); tracks['sfx']=verb(tracks['sfx'],.3,.02)
gain={'kick':.9,'drums':.55,'bass':.6,'pad':.32,'lead':.4,'sfx':.75}
mix=sum(tracks[k]*g for k,g in gain.items())
mix=f2(mix.T,'high',28).T
t=T(N)[:,None]; mix*=np.minimum(1,t/.05)*np.clip((N/SR-t)/.6,0,1)
mix=np.tanh(1.3*mix/np.abs(mix).max())/np.tanh(1.3)
pcm=(mix*32767*.9).astype(np.int16); w=wave.open(sys.argv[1],'wb')
w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('library beat ok')
