import numpy as np, sys
from PIL import Image, ImageFilter
out=sys.argv[1]; rs=np.random.default_rng(7)
# paper texture (tileable-ish): fibers + mottling, grayscale around 1.0 for multiply
N=512
def tile_noise(scale):
    a=rs.random((N//scale+1,N//scale+1)); a[-1]=a[0]; a[:,-1]=a[:,0]
    im=Image.fromarray((a*255).astype(np.uint8)).resize((N+scale,N+scale),Image.BICUBIC).crop((0,0,N,N))
    return np.asarray(im,dtype=np.float32)/255
m=.5*tile_noise(64)+.3*tile_noise(16)+.2*tile_noise(4)
fib=np.zeros((N,N),np.float32)
for _ in range(900):
    x,y=rs.integers(0,N,2); ang=rs.random()*np.pi; L=rs.integers(8,40)
    for k in range(L):
        xx=int(x+np.cos(ang)*k)%N; yy=int(y+np.sin(ang)*k)%N; fib[yy,xx]+=rs.random()*.6
fib=np.asarray(Image.fromarray((np.clip(fib,0,1)*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.6)),np.float32)/255
fine=rs.random((N,N)).astype(np.float32)
v=1-(m-.5)*.10-fib*.10-(fine-.5)*.05
Image.fromarray((np.clip(v,0,1)*255).astype(np.uint8)).convert('RGB').save(f'{out}/paper.jpg',quality=88)
# film grain tiles 540x960, neutral 128
for i in range(8):
    g=rs.normal(0,1,(960,540)).astype(np.float32)
    g=np.asarray(Image.fromarray(np.clip(128+g*40,0,255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(.55)),np.float32)
    g=128+(g-128)*1.9
    Image.fromarray(np.clip(g,0,255).astype(np.uint8)).convert('RGB').save(f'{out}/grain{i}.jpg',quality=80)
print('ok')
