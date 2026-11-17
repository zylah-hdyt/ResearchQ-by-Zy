import sys,glob,numpy as np,onnxruntime as ort
from PIL import Image, ImageFilter
M,A=sys.argv[1:3]
s=ort.InferenceSession(M,providers=['CPUExecutionProvider']);inp=s.get_inputs()[0].name
mean=np.array([.485,.456,.406]);std=np.array([.229,.224,.225])
for f in sorted(glob.glob(A+'/*/*.jpg')):
    if f.endswith('_depth.jpg'): continue
    im=Image.open(f).convert('RGB');w,h=im.size;k=518/min(w,h);W,H=int(round(w*k/14))*14,int(round(h*k/14))*14
    x=(np.asarray(im.resize((W,H),Image.BICUBIC))/255.-mean)/std;x=x.transpose(2,0,1)[None].astype(np.float32)
    d=s.run(None,{inp:x})[0][0];d=(d-d.min())/(d.max()-d.min()+1e-9)  # relative inverse depth: 1 = near
    o=Image.fromarray((d*255).astype(np.uint8)).resize((w//2,h//2),Image.BICUBIC).filter(ImageFilter.GaussianBlur(3))
    o.save(f[:-4]+'_depth.png');print('ok',f.split('/assets/')[1],flush=True)
