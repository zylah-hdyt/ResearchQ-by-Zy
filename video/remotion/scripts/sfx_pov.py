# ResearchQ POV (14s, 420 frames @30fps) — SFX-only layer meant to sit UNDER the reference TikTok sound.
# Real CC0 samples from uisfx (sfx/uisfx/, see LICENSE-AUDIO.txt). Kept light: whooshes on camera moves,
# clicks on UI actions, a build-up before the doc stream, and one impact on the signature.
# Scene map: cube 0 · white mark 30 · window 45 · doc 120 · sidebar 156 · streaks 222 · picker 270 ·
# prompt 300 · white mark 330 · wordmark 360 · signature 405.
import numpy as np, subprocess, wave, sys, os
SR=48000; N=int(SR*420/30); F=lambda f: f/30
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
def whoosh(t,g=.8,pan=0.0,rate=1.0): put(t-5,'cinematic-swipe',g,pan,rate)

# cube spin-in, then flash to the white mark
put(0,'cinematic-start',.55); whoosh(30,.7); put(30,'cinematic-snap',.6)
# window reveal + pan across the app
whoosh(45,.85); put(47,'cinematic-open',.6)
whoosh(80,.45,-.4,.92)
# build-up into the doc view (riser moment), lands on 120
put(96,'cinematic-expand',.7); put(108,'cinematic-level-up',.55); put(120,'cinematic-drop',.75)
# doc streaming: soft keys
for k,t in enumerate(range(124,152,3)): put(t,'soft-typing',.55,((k%2)-.5)*.2)
# sidebar macro: tasks tick done
whoosh(156,.8,.3); 
for t in (176,192,208): put(t,'studio-check',.6)
# orange streaks around the input
whoosh(222,.9,0,.9); put(226,'cinematic-expand',.5)
# model picker opens, NEXUS selected
whoosh(270,.6); put(272,'studio-press',.6); put(288,'cinematic-select',.6)
# prompt typed + selection sweep + send
for t in range(300,318,2): put(t,'mechanical-typing',.6)
put(318,'studio-hover',.5); put(326,'studio-send',.7)
# white mark, wordmark letter reveal
whoosh(330,.8); put(330,'cinematic-snap',.6)
whoosh(360,.7); 
for k in range(9): put(364+k*2,'studio-progress-step',.28,(k-4)/8)
# signature impact
put(405,'cinematic-snap',.9); put(405,'cinematic-complete',.75)

out/=np.abs(out).max()
pcm=(out*32767*.89).astype(np.int16); w=wave.open(sys.argv[1],'wb')
w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('pov sfx ok')
