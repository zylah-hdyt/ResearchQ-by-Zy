# ResearchQ Skills Library — cinematic dark version (SkillsCine, 25s, 750 frames @30fps). SFX only, real CC0 samples
# from uisfx (sfx/uisfx/, see LICENSE-AUDIO.txt). Whooshes ride the camera moves; every skill chip uses the SAME pop.
# Grid 120 BPM (15 f). Hook 0 · core flow 60 · levels 120 · field cuts 150/180/210/240 · dosen 270 · demo 300
# · wall 450 · CTA 600 · white mark 712 · wordmark 722. Streak accents at 56/146/296/446/596.
import numpy as np, subprocess, wave, sys, os
SR=48000; N=int(SR*750/30); F=lambda f: f/30; rng=np.random.default_rng(11)
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
POP='studio-reaction'
def whoosh(t,g=.85,pan=0.0,rate=1.0): put(t-5,'cinematic-swipe',g,pan,rate)
def streak(t,pan=0.0): put(t,'cinematic-swipe',.75,pan,.85)   # slower, darker swipe for the light streak

# hook: four words, mark lands, "semua ada skill-nya", ribbon underline, dive
put(0,'cinematic-start',.5)
for k,t in enumerate((0,6,12,18)): put(t,'studio-hover',.75,[-.3,.3,-.2,.2][k])
put(29,'cinematic-snap',.75); put(29,'cinematic-open',.5)
put(39,POP,.8); put(42,'cinematic-expand',.45)
streak(56,.4); whoosh(60,.8)
# core flow: panel flies up, four systems tick on the beat
put(62,'cinematic-drop',.6)
for k in range(20): put(60+k*3,'studio-hover',.2,(k%2-.5)*.3)
for t in (66,81,96,111): put(t,'cinematic-select',.5); put(t+9,POP,.75)
# levels picker
streak(146,-.4); whoosh(120,.75)
for k,t in enumerate((120,127,135,142)): put(t,'studio-press',.6,(k-1.5)/3)
# field cuts + dosen: whip, system lands, skill pop (same pop every time)
for k,t in enumerate((150,180,210,240,270)):
    whoosh(t,.9,(-1)**k*.5); put(t,'cinematic-press',.45); put(t+8,'cinematic-select',.4); put(t+14,POP,.85)
# demo: ribbons, typing, send, dive into the doc, streaming keys, checks
streak(296,.4); whoosh(300,.8)
put(302,'cinematic-expand',.45)
for t in range(308,344,2):
    if rng.random()<.85: put(t+rng.uniform(0,.6),'mechanical-typing',.85,rng.uniform(-.15,.15),rate=rng.uniform(.93,1.07))
put(346,'studio-press',.75); put(348,'cinematic-send',.75)
whoosh(354,.85); put(358,'cinematic-drop',.7)
for k,t in enumerate(range(362,416,4)): put(t,'soft-typing',.45,((k%2)-.5)*.2)
for t in (392,407,422): put(t,'studio-check',.8)
# wall: fly-over, chips burst, count lands
streak(446,-.4); whoosh(450,.9,0,.9)
for j in range(16): put(450+rng.uniform(0,14),'studio-hover',.32,rng.uniform(-.7,.7),rate=rng.uniform(.9,1.15))
put(500,'cinematic-expand',.55); put(510,'cinematic-level-up',.8); put(525,'cinematic-snap',.55)
# CTA: price, pills, ribbons round the input, typing NEXUS, sent, heart
streak(596,.4); whoosh(600,.75); put(606,'cinematic-purchase',.7)
put(624,'cinematic-open',.55)
for i in range(9): put(634+i*2,'studio-progress-step',.32,(i-4)/8)
put(652,'cinematic-expand',.4)
for t in range(662,677,3): put(t,'soft-typing',1.0,rng.uniform(-.1,.1))
put(680,'studio-send',.75); put(680,POP,.65); put(688,'studio-notification',.55)
# white mark → wordmark → handle
whoosh(712,.8); put(712,'cinematic-snap',.8)
put(722,'cinematic-swipe',.5)
for k in range(9): put(725+k*1.5,'studio-progress-step',.25,(k-4)/8)
put(737,'cinematic-complete',.75)

out/=np.abs(out).max()
pcm=(out*32767*.89).astype(np.int16); w=wave.open(sys.argv[1],'wb')
w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('cine sfx ok')
