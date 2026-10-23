import numpy as np, subprocess, sys
from PIL import Image
from concurrent.futures import ThreadPoolExecutor
V=sys.argv[1]; NF=int(sys.argv[2]); out=sys.argv[3]; audio=sys.argv[4]
cmd=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s','1080x1920','-r','60','-i','-','-i',audio,
     '-map','0:v','-map','1:a','-c:v','libx264','-preset','slow','-crf','16','-pix_fmt','yuv420p','-profile:v','high','-r','60','-g','120',
     '-c:a','aac','-b:a','320k','-ar','48000','-movflags','+faststart','-shortest',out]
p=subprocess.Popen(cmd,stdin=subprocess.PIPE)
def load(n):
    acc=None
    for k in range(3):
        a=np.asarray(Image.open(f'{V}/sub/f{n:05d}_{k}.jpg').convert('RGB'),dtype=np.float32)
        acc=a if acc is None else acc+a
    return np.clip(acc/3+.5,0,255).astype(np.uint8).tobytes()
with ThreadPoolExecutor(4) as ex:
    for i,buf in enumerate(ex.map(load,range(NF))):
        p.stdin.write(buf)
        if i%600==0: print('frame',i,flush=True)
p.stdin.close(); print('ffmpeg exit',p.wait())
