"""SFX for SPSS Doctor: soft whooshes, subtle digital ticks, a soft confirmation when the .sav forms, short riser before closing."""
import numpy as np, soundfile as sf, json, sys
S=sys.argv[1]; R=f'{S}/sfxref'; SR=48000
E=json.load(open('work/events.json')); END=E['END']
OUT=np.zeros((int((END+1)*SR),2)); N_=len(OUT); rs=np.random.default_rng(5)
def put(t,y,g,pan=0.):
    y=y/(np.abs(y).max()+1e-9)*10**(g/20); i=int(max(0,t)*SR); j=min(N_,i+len(y)); y=y[:j-i]
    OUT[i:j,0]+=y*np.sqrt((1-pan)/2)*1.414; OUT[i:j,1]+=y*np.sqrt((1+pan)/2)*1.414
def sweep(d,f0,f1,bw=.45):
    n=int(d*SR); src=rs.standard_normal(n+2048); y=np.zeros(n+2048); B=2048; H=512; w=np.hanning(B)
    for i in range(0,n,H):
        p=i/max(1,n); fc=f0*(f1/f0)**p; X=np.fft.rfft(src[i:i+B]*w); f=np.fft.rfftfreq(B,1/SR); X*=np.exp(-.5*(np.log(f+1)-np.log(fc))**2/bw**2); y[i:i+B]+=np.fft.irfft(X,B)*w
    y=y[:n]; tt=np.linspace(0,1,n); return y*np.sin(np.pi*tt)**1.6
def tone(f,d,dec,a=.003):
    t=np.arange(int(d*SR))/SR; return (np.sin(2*np.pi*f*t)+.25*np.sin(2*np.pi*f*2.01*t))*np.exp(-t/dec)*np.minimum(1,t/a)
def tick(): return tone(2600,.09,.018)+.5*tone(1800,.09,.025)
def confirm():
    a=tone(880,.7,.22); b=np.pad(tone(1318.5,.6,.22),(int(.11*SR),0)); n=max(len(a),len(b)); return np.pad(a,(0,n-len(a)))+.8*np.pad(b,(0,n-len(b)))
for k,t in E['ev']:
    if k=='whoosh': put(t-.1,sweep(.5,300,1600),-31,rs.uniform(-.3,.3))
    elif k=='tick': put(t,tick(),-34,rs.uniform(-.2,.2))
    elif k=='pop': put(t,tone(520,.18,.05)+.6*tone(780,.18,.04),-32)
    elif k=='morph': put(t,sweep(.9,250,2400,.35),-33)
    elif k=='confirm': put(t,confirm(),-30)
    elif k=='riser': put(t,sweep(.9,200,1400,.5),-34)
sf.write('work/sfx.wav',OUT,SR,subtype='FLOAT'); print('END',round(END,2),'peak %.1f dB'%(20*np.log10(np.abs(OUT).max())),'events',len(E['ev']))
