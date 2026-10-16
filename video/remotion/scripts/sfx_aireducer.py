# AI Detection Reducer ad (AiReducerAd, 15s, 450 frames @30fps). SFX only, kept sparse so the creator's VO sits on top:
# 12 cues, no pitch/speed tricks. Real CC0 samples from uisfx (sfx/uisfx/, see LICENSE-AUDIO.txt).
# Hook 0 · detector 75 · skill 150 · rewrite 240 · re-scan 330 · CTA 390.
import numpy as np, subprocess, wave, sys, os
SR=48000; N=int(SR*450/30); F=lambda f: f/30
FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
DIR=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','sfx','uisfx')
def S(name):
    raw=subprocess.run([FF,'-loglevel','error','-i',os.path.join(DIR,name+'.mp3'),'-f','s16le','-ac','1','-ar',str(SR),'-'],capture_output=True,check=True).stdout
    return np.frombuffer(raw,np.int16).astype(float)/32768
out=np.zeros((N,2))
def put(frame,name,g=1.0,pan=0.0):
    s=S(name); i=int(F(frame)*SR); n=min(len(s),N-i)
    a=(pan+1)*np.pi/4; out[i:i+n,0]+=s[:n]*g*np.cos(a); out[i:i+n,1]+=s[:n]*g*np.sin(a)
def whoosh(t,g=.8,pan=0.0): put(t-5,'cinematic-swipe',g,pan)

put(24,'cinematic-drop',.9); put(24,'cinematic-snap',.6)   # "100%" lands
whoosh(75,.7,.3)                                           # into the detector
put(115,'studio-notification',.6)                          # gauge hits 100%
whoosh(150,.7,-.3)                                         # into the skill
put(220,'cinematic-send',.6)                               # prompt sent
whoosh(240,.7,.3)                                          # into the rewrite
put(288,'studio-check',.6)                                 # first check
whoosh(330,.7,-.3)                                         # into the re-scan
put(368,'cinematic-level-up',.75)                          # lands on 15%
put(392,'cinematic-snap',.6)                               # CTA
put(430,'cinematic-complete',.55)                          # brand

out/=np.abs(out).max()
pcm=(out*32767*.89).astype(np.int16); w=wave.open(sys.argv[1],'wb')
w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('aireducer sfx ok')
