# AI Detection Reducer light ad (ReducerLight, 15s, 450 frames @30fps). Sparse SFX (10 cues) to sit under the creator's
# VO and music; the big moment is the drop at 6.0s (frame 180), mirroring the reference edit's drop at ~6.5s.
# Real CC0 samples from uisfx (sfx/uisfx/, see LICENSE-AUDIO.txt).
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

put(31,'cinematic-swipe',.55)                         # "AI?" settles
for t,p in ((72,-.4),(102,0),(132,.4)): put(t+6,'studio-reaction',.7,p)   # same pop for each card morph
put(180,'cinematic-drop',.9); put(176,'cinematic-swipe',.6)               # drop into the collage
put(235,'cinematic-swipe',.7)                         # orange flash into the glass scene
put(278,'studio-check',.7)                            # HIGH -> LOW
put(300,'cinematic-snap',.7)                          # icon
put(382,'cinematic-complete',.6)                      # CTA

out/=np.abs(out).max()
pcm=(out*32767*.89).astype(np.int16); w=wave.open(sys.argv[1],'wb')
w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('reducerlight sfx ok')
