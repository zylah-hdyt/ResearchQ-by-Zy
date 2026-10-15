# Problem Master BAB 1 (48s) — varied SFX bank; cue times are global frames @30fps (see src/bab1/*).
# Scene starts 0/120/420/600/900/1020/1200. Every kind of on-screen action gets its own sound family so nothing repeats:
# popups = bells/glass, lists = marimba/kalimba, typing = mechanical keyboard (thock + spacebar), phone comments = soft
# phone taps, price = ka-ching, checks = rising bell dings, scroll = paper swipes / wheel ticks, cards = card flicks.
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt, fftconvolve
SR=48000; D=1440/30; N=int(SR*D); rng=np.random.default_rng(48); F=lambda f: f/30
L=np.zeros(N); Rr=np.zeros(N)
f2=lambda x,k,f: sosfilt(butter(2,f,k,fs=SR,output='sos'),x)
mf=lambda m:440*2**((m-69)/12); T=lambda n:np.arange(n)/SR
def env(n,a,d): t=T(n); return np.minimum(1,t/max(a,1e-4))*np.exp(-t/d)
def add(t0,s,g,pan=0.0):
    i=int(t0*SR); n=min(len(s),N-i)
    if n>0 and i>=0: a=(pan+1)*np.pi/4; L[i:i+n]+=s[:n]*g*np.cos(a); Rr[i:i+n]+=s[:n]*g*np.sin(a)
def noise(n): return rng.normal(0,1,n)

# ---- tonal family ----
def bell(m,dur=1.4):  # glockenspiel-like: inharmonic partials, bright strike
    f=mf(m); n=int(dur*SR); t=T(n)
    s=sum(a*np.sin(2*np.pi*f*r*t)*np.exp(-t/d) for r,a,d in ((1,1,.55),(2.76,.45,.22),(5.4,.25,.09),(8.93,.12,.04)))
    return s*np.minimum(1,t/0.002)
def glass(m,dur=1.2):
    f=mf(m); n=int(dur*SR); t=T(n)
    return (np.sin(2*np.pi*f*t)*np.exp(-t/.45)+.3*np.sin(2*np.pi*f*2.32*t)*np.exp(-t/.12))*np.minimum(1,t/0.001)
def marimba(m,dur=0.6):
    f=mf(m); n=int(dur*SR); t=T(n)
    s=np.sin(2*np.pi*f*t)*np.exp(-t/.18)+.35*np.sin(2*np.pi*f*4*t)*np.exp(-t/.03)
    k=int(.006*SR); s[:k]+=f2(noise(k),'band',[1500,4000])*.4
    return s
def kalimba(m,dur=0.7):
    f=mf(m); n=int(dur*SR); t=T(n)
    return (np.sin(2*np.pi*f*t)+.4*np.sin(2*np.pi*f*6.27*t)*np.exp(-t/.02))*np.exp(-t/.25)*np.minimum(1,t/0.001)
def ding2(m1,m2):  # notification: two-tone bell
    a=bell(m1,0.9); b=bell(m2,1.3); out=np.zeros(int(.09*SR)+len(b)); out[:len(a)]+=a; out[int(.09*SR):]+=b; return out
def arp(notes,step=0.06,fn=None):
    fn=fn or marimba; parts=[fn(m) for m in notes]; n=int(step*SR)*(len(notes)-1)+max(len(p) for p in parts); out=np.zeros(n)
    for i,p in enumerate(parts): out[int(step*SR)*i:int(step*SR)*i+len(p)]+=p
    return out
def bloop(f0=260,f1=820,dur=0.12):
    n=int(dur*SR); t=T(n); f=f0+(f1-f0)*(t/dur)**0.6; return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.002,dur/2.5)
def bubble(): return bloop(300,1100,0.06)
def sweep_up(dur=0.35):
    n=int(dur*SR); t=T(n); f=380+1500*(t/dur)**2
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.sin(np.pi*t/dur)**1.5*.6+f2(noise(n),'band',[2000,6000])*np.sin(np.pi*t/dur)**2*.25
def kaching():
    a=bell(91,1.0)*.8; b=bell(96,1.4); out=np.zeros(int(.07*SR)+len(b)); out[:len(a)]+=a; out[int(.07*SR):]+=b
    n=int(.35*SR); t=T(n); rat=sum(np.sin(2*np.pi*rng.uniform(3500,7500)*t+rng.uniform(0,6)) for _ in range(6))*np.abs(np.sin(2*np.pi*22*t))*np.exp(-t/.12)/6
    out[:n]+=rat*.5; return out
def shimmer(dur=0.8):
    n=int(dur*SR); out=np.zeros(n)
    for i in range(7):
        b=glass(rng.choice([84,88,91,93,96]),0.6)*.35; o=int(rng.uniform(0,dur-0.3)*SR); out[o:o+len(b)]+=b[:n-o]
    return out
# ---- percussive / foley family ----
def thock(space=False):  # mechanical keyboard key
    n=int((0.07 if space else 0.045)*SR); t=T(n); f0=rng.uniform(170,240)*(0.7 if space else 1)
    body=np.sin(2*np.pi*f0*t)*np.exp(-t/(.03 if space else .018))
    k=int(.004*SR); clk=np.zeros(n); clk[:k]=f2(noise(k),'band',[2500,6500])*np.linspace(1,0,k)
    rattle=f2(noise(n),'band',[900,1800])*np.exp(-t/.01)*.25
    return body*.9+clk*.6+rattle
def phone_tap():
    n=int(.02*SR); t=T(n); return np.sin(2*np.pi*1900*t)*np.exp(-t/.004)*.7+f2(noise(n),'high',4000)*np.exp(-t/.002)*.3
def mouse_click():
    n=int(.03*SR); t=T(n); a=f2(noise(n),'band',[1800,4200])*np.exp(-t/.003); b=np.zeros(n); k=int(.012*SR); b[k:]=a[:n-k]*.5; return a+b
def toggle():
    a=mouse_click(); b=bloop(500,700,0.05); out=np.zeros(int(.05*SR)+len(b)); out[:len(a)]+=a; out[int(.05*SR):]+=b*.6; return out
def wood(m=79):
    f=mf(m); n=int(.08*SR); t=T(n); return np.sin(2*np.pi*f*t)*np.exp(-t/.025)+f2(noise(n),'band',[f*.8,f*1.6])*np.exp(-t/.01)*.5
def paper_swipe(dur=0.3):
    n=int(dur*SR); x=noise(n); y=np.zeros(n); ch=int(.01*SR)
    for s0 in range(0,n,ch): c=s0/n; y[s0:s0+ch]=f2(x[s0:s0+ch],'band',[600+3000*(1-c),1500+5000*(1-c)])
    return y*np.sin(np.pi*T(n)/dur)
def card_flick():
    n=int(.07*SR); t=T(n); return f2(noise(n),'band',[1200,3800])*(np.exp(-t/.008)+.6*np.exp(-np.maximum(0,t-.025)/.01)*(t>.025))
def thud():
    n=int(.25*SR); t=T(n); f=110*np.exp(-t*6)+55; return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.002,0.07)
def hit(base=90):
    n=int(0.6*SR); t=T(n); f=150*np.exp(-t*5)+base; ph=2*np.pi*np.cumsum(f)/SR
    return (np.sin(ph)+0.4*np.sin(2*ph)+0.2*np.sin(3*ph))*env(n,0.003,0.16)
def whoosh(dur=0.55):
    n=int(dur*SR); x=noise(n); y=np.zeros(n); ch=int(0.01*SR)
    for s0 in range(0,n,ch): c=s0/n; y[s0:s0+ch]=f2(x[s0:s0+ch],'low',300+1800*np.sin(np.pi*c)**2)
    return y*np.sin(np.pi*T(n)/dur)**2
def boom():
    n=int(0.9*SR); t=T(n); f=55*np.exp(-t*2)+32; return np.sin(2*np.pi*np.cumsum(f)/SR)*env(n,0.004,0.35)
def rise_up(dur=0.45):
    n=int(dur*SR); t=T(n); f=300+1500*(t/dur)**2; return np.sin(2*np.pi*np.cumsum(f)/SR)*(t/dur)**2*np.exp(-np.maximum(0,t-dur*0.9)/0.02)

# ===== S1 hook (0) =====
add(F(0),hit(85),0.28); add(F(0),glass(88),0.06)
for i,(t,m,p) in enumerate(((10,81,-.4),(18,84,.4),(26,79,-.3),(34,86,.3))):          # question chips → bells
    add(F(t),bell(m),0.11,p)
add(F(62),hit(95),0.2); add(F(62),shimmer(0.7),0.12)                                   # orange flash
add(F(72),ding2(84,91),0.12)                                                           # Claude card
for i,m in enumerate((72,76,79,83)): add(F(90+i*3),wood(m+7),0.09,[-.3,-.1,.1,.3][i])  # feature chips → wood blocks
# ===== S2 demo (120) =====
B=120; add(F(B+4),paper_swipe(0.35),0.08)
add(F(B+16),mouse_click(),0.35); add(F(B+19),bloop(420,620,0.08),0.07)                 # open picker
add(F(B+40),mouse_click(),0.35); add(F(B+44),glass(91),0.08)                           # pick Problem Master
for i,t in enumerate(range(64,138,2)):                                                  # mechanical typing, spacebar every ~6th
    if rng.random()<0.82: add(F(B+t)+rng.uniform(0,.025),thock(space=(i%6==5)),0.16,rng.uniform(-.25,.25))
add(F(B+130),toggle(),0.22); add(F(B+132),glass(96,0.6),0.05)                          # Search ON
add(F(B+146),mouse_click(),0.35); add(F(B+148),sweep_up(0.35),0.12)                    # send
for i,(t,m) in enumerate(((182,84),(198,88),(216,91),(234,96))): add(F(B+t),bell(m,1.0),0.09)   # rows done → rising dings
add(F(B+238),arp([72,76,79,84],0.05,kalimba),0.14)                                     # Word file ready
add(F(B+284),mouse_click(),0.3)
# ===== S3 flow (420): marimba scale per block =====
B=420
for i,m in enumerate((60,62,64,67,69,72,74,76)): add(F(B+16+i*16),marimba(m),0.16,(i-3.5)/8)
add(F(B+150),arp([79,84,88],0.07,glass),0.1)
# ===== S4 data (600) =====
B=600
for k,s in enumerate((18,90,162,234)):
    add(F(B+s-14),paper_swipe(0.32),0.09,[-.3,.3,-.3,.3][k])                           # page scroll
    add(F(B+s-1),thud(),0.10)                                                          # stop
    add(F(B+s+6),bloop([220,260,300,240][k],[700,820,900,760][k],0.18),0.09)          # chart grows
    add(F(B+s+10),ding2([79,81,83,84][k],[86,88,89,91][k]),0.08)                      # note popup
for i in range(9): add(F(B+162+6+i*2),bubble(),0.07,(i-4)/8)                           # 9 of 10 dots
# ===== S5 checklist (900) =====
B=900
for i,m in enumerate((72,74,76,79,81,84,86,88)): add(F(B+10+i*6),kalimba(m),0.13,(i%2-.5)*.4)
add(F(B+64),paper_swipe(0.25),0.06); add(F(B+70),glass(91),0.06)
# ===== S6 youtube (1020) =====
B=1020; add(F(B+6),whoosh(0.6),0.1)
for i in range(18):                                                                      # scroll wheel ticks, slowing down
    t=16+76*(1-(1-i/18)**0.5); add(F(B+t),wood(96),0.035*(1-i/22),rng.uniform(-.2,.2))
add(F(B+94),thud(),0.12); add(F(B+97),bell(88),0.1); add(F(B+110),phone_tap(),0.4); add(F(B+106),arp([76,79,84],0.06,glass),0.07)
# ===== S7 CTA (1200) =====
B=1200; add(F(B+8),kaching(),0.16); add(F(B+24),paper_swipe(0.25),0.06)               # price
for t in range(46,58,3): add(F(B+t),phone_tap(),0.32,rng.uniform(-.1,.1))              # phone comment typing
add(F(B+66),sweep_up(0.25),0.1); add(F(B+66),bubble(),0.12); add(F(B+70),bloop(600,1200,0.1),0.07)   # sent + heart
add(F(B+128),hit(95),0.22); add(F(B+130),shimmer(0.6),0.08)
for i in range(4): add(F(B+140+i*6),card_flick(),0.22,(i-1.5)/4)                       # GENESIS cards stack
add(F(B+160),ding2(86,93),0.11)
for t in range(168,189,3): add(F(B+t),phone_tap(),0.32,rng.uniform(-.1,.1))
add(F(B+197),sweep_up(0.25),0.1); add(F(B+197),arp([84,88,91,96],0.045,bell),0.08)
# ===== transition accents =====
for t in (120,1200): add(F(t-10),rise_up(0.4),0.07); add(F(t+3),boom(),0.26)
for t in (420,1020): add(F(t-2),whoosh(0.35),0.15,-0.7); add(F(t+3),whoosh(0.35),0.15,0.7); add(F(t+6),boom(),0.12)
add(F(600),whoosh(0.6),0.11); add(F(610),boom(),0.18)
add(F(898),rise_up(0.35),0.06); add(F(906),glass(84),0.06); add(F(908),boom(),0.12)

ir=rng.normal(0,1,int(0.6*SR))*np.exp(-T(int(0.6*SR))/0.15)*0.02; ir[0]=1; ir=f2(ir,'low',6000)
L=fftconvolve(L,ir)[:N]; Rr=fftconvolve(Rr,ir)[:N]; L=f2(L,'high',70); Rr=f2(Rr,'high',70)
m=max(np.abs(L).max(),np.abs(Rr).max()); L/=m; Rr/=m
pcm=(np.stack([L,Rr],1)*32767*0.5).astype(np.int16)
w=wave.open(sys.argv[1],'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('sfx bab1 ok')
