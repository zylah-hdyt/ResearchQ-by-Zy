# AI Detection Reducer ad (AiReducerAd, 15s, 450 frames @30fps). SFX only, real CC0 samples from uisfx
# (sfx/uisfx/, see LICENSE-AUDIO.txt). 120 BPM grid. Hook 0 · detector 75 · skill 150 · rewrite 240 · re-scan 330 · CTA 390.
import numpy as np, subprocess, wave, sys, os
SR=48000; N=int(SR*450/30); F=lambda f: f/30; rng=np.random.default_rng(5)
FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
DIR=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','sfx','uisfx')
_cache={}
def S(name):
    if name not in _cache:
        raw=subprocess.run([FF,'-loglevel','error','-i',os.path.join(DIR,name+'.mp3'),'-f','s16le','-ac','1','-ar',str(SR),'-'],capture_output=True,check=True).stdout
        _cache[name]=np.frombuffer(raw,np.int16).astype(float)/32768
    return _cache[name]
out=np.zeros((N,2))
def put(frame,name,g=1.0,pan=0.0,rate=1.0):
    s=S(name)
    if rate!=1.0: s=np.interp(np.arange(0,len(s),rate),np.arange(len(s)),s)
    i=int(F(frame)*SR); n=min(len(s),N-i)
    if n<=0 or i<0: return
    a=(pan+1)*np.pi/4; out[i:i+n,0]+=s[:n]*g*np.cos(a); out[i:i+n,1]+=s[:n]*g*np.sin(a)
def whoosh(t,g=.85,pan=0.0,rate=1.0): put(t-5,'cinematic-swipe',g,pan,rate)
def streak(t,pan=0.0): put(t,'cinematic-swipe',.7,pan,.85)

# hook: words, "100%?" hits hard
for k,t in enumerate((0,3,6,9,11)): put(t,'studio-hover',.7,[-.3,.3,-.2,.2,0][k])
put(16,'studio-hover',.5)
put(24,'cinematic-drop',.9); put(24,'cinematic-snap',.7)
put(30,'studio-notification',.5)
streak(71,.4); whoosh(75,.8)
# detector: gauge climbs (progress ticks), phrases flagged, alert at 100
for i in range(12): put(81+i*3,'studio-progress-step',.25+.02*i,(i-6)/12,rate=1+.03*i)
for k in range(4): put(97+k*8,'studio-hover',.45,(k-1.5)/3)
put(115,'studio-notification',.7); put(115,'cinematic-press',.5)
# skill: title, typing, send
streak(146,-.4); whoosh(150,.8); put(152,'cinematic-open',.55)
for t in range(164,212,2):
    if rng.random()<.85: put(t+rng.uniform(0,.6),'mechanical-typing',.8,rng.uniform(-.15,.15),rate=rng.uniform(.93,1.07))
put(218,'studio-press',.7); put(220,'cinematic-send',.75)
# rewrite: strikes, swap, checks
streak(236,.4); whoosh(240,.85)
for k in range(4): put(246+k*6,'cinematic-select',.4,(k-1.5)/3)
put(270,'cinematic-expand',.55)
for t in (288,300,312): put(t,'studio-check',.8)
# re-scan: gauge falls, lands on 15
streak(326,-.4); whoosh(330,.8)
for i in range(10): put(336+i*3,'studio-progress-step',.3-.015*i,(4-i)/10,rate=1.25-.04*i)
put(368,'cinematic-level-up',.8); put(368,'studio-reaction',.6)
# CTA
streak(386,.4); whoosh(390,.75); put(392,'cinematic-snap',.7)
put(402,'studio-notification',.5); put(410,'cinematic-open',.4)
put(430,'cinematic-complete',.65)

out/=np.abs(out).max()
pcm=(out*32767*.89).astype(np.int16); w=wave.open(sys.argv[1],'wb')
w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('aireducer sfx ok')
