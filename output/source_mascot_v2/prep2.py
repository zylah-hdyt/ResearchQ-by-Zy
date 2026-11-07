"""Lip-sync prep for the half-body poses: find mouth via tongue colour, cut sprite, inpaint base."""
import numpy as np, json
from PIL import Image
from scipy import ndimage as nd
info={}
for n in ['b_present','b_idea','b_shrug','b_wink']:
    a=np.array(Image.open(f'out/{n}.png').convert('RGBA')).astype(np.float64);H,Wd=a.shape[:2]
    R,G,B,A=[a[...,i] for i in range(4)]
    tongue=(R>190)&(G<140)&(B<140)&(G>60)&(A>200)
    tongue[int(H*.7):]=False
    lab,k=nd.label(tongue);sz=nd.sum(tongue,lab,range(1,k+1));t=lab==(1+int(np.argmax(sz)))
    ty,tx=[int(v.mean()) for v in np.nonzero(t)]
    x0,y0,x1,y1=tx-150,ty-120,tx+150,ty+80
    w=a[y0:y1,x0:x1,:3]
    br=(w[...,0]>220)&(w[...,1]>170)&(w[...,1]<225)&(w[...,2]>110)&(w[...,2]<190)
    skin=np.median(w[br],0);d=np.sqrt(((w-skin)**2).sum(-1));ns=d>55
    lab2,_=nd.label(ns);comp=lab2==lab2[ty-y0,tx-x0];comp=nd.binary_fill_holes(comp)
    ys,xs=np.nonzero(comp);bx0,bx1,by0,by1=xs.min()+x0,xs.max()+x0+1,ys.min()+y0,ys.max()+y0+1
    full=np.zeros((H,Wd),bool);full[y0:y1,x0:x1]=comp
    rim=nd.binary_dilation(full,iterations=4);soft=nd.gaussian_filter(rim.astype(float),1.5)*255
    pad=8;sx0,sx1,sy0,sy1=bx0-pad,bx1+pad,by0-pad,by1+pad
    spr=a[sy0:sy1,sx0:sx1].copy();spr[...,3]=np.minimum(spr[...,3],soft[sy0:sy1,sx0:sx1])
    Image.fromarray(spr.astype(np.uint8)).save(f'out/mo_{n}.png')
    hole=nd.binary_dilation(full,iterations=9);b=a.copy();rgb=b[...,:3];rgb[hole]=skin
    for _ in range(900):
        bl=nd.uniform_filter(rgb,size=(3,3,1));rgb[hole]=bl[hole]
    Image.fromarray(np.clip(b,0,255).astype(np.uint8)).save(f'out/base_{n}.png')
    info[n]=dict(x=int(sx0),y=int(sy0),w=int(sx1-sx0),h=int(sy1-sy0),top=int(by0-sy0),W=int(Wd),H=int(H))
    print(n,'mouth',bx0,by0,bx1-bx0,by1-by0)
json.dump(info,open('out/mouth2.json','w'))
