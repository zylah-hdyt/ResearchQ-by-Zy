# ResearchQ Skills Library short (25s, 750 frames @30fps) — SFX only, built from real sound files:
# uisfx (CC0 1.0, https://github.com/romainsimon/uisfx), packs "studio" (UI) + "cinematic" (impacts) + "mechanical" (keys).
# Files live in sfx/uisfx/ (see LICENSE-AUDIO.txt). No synthesis — every cue is a placed sample.
# Grid: 120 BPM (1 beat = 15 f). Cuts: hook 0 · core flow 60 (tiles 66/81/96/111) · levels 120 · field cuts
# 150/180/210/240 · dosen 270 · demo 300 · wall 450 · CTA 600. Every skill chip uses the SAME pop (studio/reaction).
import numpy as np, subprocess, wave, sys, os
SR=48000; N=int(SR*750/30); F=lambda f: f/30; rng=np.random.default_rng(7)
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

POP='studio-reaction'          # the one skill sound, used for every skill chip
def cut(t): put(t-4,'cinematic-swipe',.9); put(t,'cinematic-snap',.8); put(t,'cinematic-press',.5)

# hook: words, then "semua ada skill-nya", then push-in
for k,t in enumerate((0,6,12,18)): put(t,'studio-hover',.8,[-.3,.3,-.2,.2][k])
put(30,'cinematic-open',.7); put(38,POP,.8)
put(50,'cinematic-expand',.7); put(56,'cinematic-swipe',.8)
# core flow: heading + majors ticking + 4 tiles on the beat
cut(60)
for k in range(20): put(60+k*3,'studio-hover',.25,(k%2-.5)*.3)
for t in (66,81,96,111): put(t,'cinematic-select',.6); put(t+2,POP,.7)
# levels: four bands
for k in range(4): put(120+round(k*7.5),'cinematic-swipe',.8,(-1)**k*.5); put(122+round(k*7.5),'cinematic-press',.45)
# field-specific cuts + dosen: same cut each time, system lands, then the skill pop
for t in (150,180,210,240,270):
    cut(t); put(t+8,'cinematic-select',.45); put(t+14,POP,.85)
# demo: typing, send, document lands, check stamps
cut(300)
for t in range(308,344,2):
    if rng.random()<.85: put(t+rng.uniform(0,.6),'mechanical-typing',.9,rng.uniform(-.15,.15),rate=rng.uniform(.93,1.07))
put(346,'studio-press',.8); put(348,'cinematic-send',.8)
put(352,'cinematic-swipe',.7); put(364,'cinematic-drop',.8); put(364,'cinematic-start',.55)
for t in (390,405,420): put(t,'studio-check',.85)
# wall: chips burst, then "44 skill" / "9 sistem"
cut(450)
for j in range(16): put(450+rng.uniform(0,14),'studio-hover',.35,rng.uniform(-.7,.7),rate=rng.uniform(.9,1.15))
put(500,'cinematic-expand',.6)
put(510,'cinematic-level-up',.85); put(525,'cinematic-snap',.6)
# CTA: price, prompt line, chips, typing NEXUS, sent, heart, link line, end
cut(600); put(606,'cinematic-purchase',.75)
put(624,'cinematic-open',.6)
for i in range(9): put(634+i*2,'studio-progress-step',.35,(i-4)/8)
for t in range(664,680,3): put(t,'soft-typing',1.0,rng.uniform(-.1,.1))
put(682,'studio-send',.8); put(682,POP,.7); put(692,'studio-reaction',.5)
put(698,'studio-notification',.6)
put(735,'cinematic-complete',.7)

out/=np.abs(out).max()
pcm=(out*32767*.89).astype(np.int16); w=wave.open(sys.argv[1],'wb')
w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('short sfx (uisfx) ok')
