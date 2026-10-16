# "Claude Free vs Pro" VO video (ClaudeProVO, 31s, 930 frames @30fps). Sparse SFX under the creator's VO: 10 cues,
# whooshes only on the four big section changes. Real CC0 samples from uisfx (sfx/uisfx/, see LICENSE-AUDIO.txt).
import numpy as np, subprocess, wave, sys, os
SR=48000; N=int(SR*930/30); F=lambda f: f/30
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

whoosh(95,.75,.3)                      # hook -> free
put(245,'studio-check',.6)             # "udah cukup" check
whoosh(265,.75,-.3)                    # -> "tapi kalau..."
put(307,'studio-notification',.6)      # usage limit toast
put(473,'cinematic-snap',.7)           # "Pro" lands
whoosh(525,.75,.3)                     # -> Anthropic docs
whoosh(712,.75,-.3)                    # -> close
put(851,'studio-press',.7)             # cursor clicks Upgrade
put(860,'cinematic-snap',.7)           # white mark
put(892,'cinematic-complete',.6)       # follow

out/=np.abs(out).max()
pcm=(out*32767*.89).astype(np.int16); w=wave.open(sys.argv[1],'wb')
w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print('claudepro sfx ok')
