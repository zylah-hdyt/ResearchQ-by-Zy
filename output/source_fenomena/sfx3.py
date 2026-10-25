import numpy as np, soundfile as sf, sys
SR = 48000
rs = np.random.default_rng(3)
voice, vsr = sf.read(sys.argv[1], dtype='float64')
assert vsr == SR
N = len(voice)
out = np.zeros((N, 2))

def db(x): return 10 ** (x / 20)
def env_exp(n, tau): return np.exp(-np.arange(n) / SR / tau)
def att(n, a=0.002): return np.minimum(1, np.arange(n) / SR / a)

def bandnoise(dur, f_lo, f_hi):
    n = int(dur * SR); X = np.fft.rfft(rs.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    X *= ((f > f_lo) & (f < f_hi)) * 1.0
    y = np.fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)

def sweep_noise(dur, f0, f1, bw=0.6):
    """noise whose band centre glides f0->f1 (log), processed in overlapping blocks"""
    n = int(dur * SR); B = 2048; H = 512; y = np.zeros(n + B); w = np.hanning(B)
    src = rs.standard_normal(n + B)
    for i in range(0, n, H):
        p = i / max(1, n); fc = f0 * (f1 / f0) ** p
        X = np.fft.rfft(src[i:i + B] * w); f = np.fft.rfftfreq(B, 1 / SR)
        X *= np.exp(-0.5 * (np.log(f + 1) - np.log(fc)) ** 2 / bw ** 2)
        y[i:i + B] += np.fft.irfft(X, B) * w
    y = y[:n]; return y / (np.abs(y).max() + 1e-9)

def whoosh(dur, f0=300, f1=2200, shape=0.5):
    y = sweep_noise(dur, f0, f1); t = np.linspace(0, 1, len(y))
    e = np.where(t < shape, np.sin(np.pi / 2 * t / shape) ** 2, np.cos(np.pi / 2 * (t - shape) / (1 - shape)) ** 2)
    return y * e

def glass(f, dur=0.9):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) + .45 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / .05)) * att(n, .001) * np.exp(-t / .22)

def mtof(m): return 440 * 2 ** ((m - 69) / 12)

def tick(f=2400, dur=0.03):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * t) * .6 + bandnoise(dur, 2000, 9000) * .5) * np.exp(-t / .006)

def thump(f0=95, f1=42, dur=0.7, tau=.16):
    n = int(dur * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(f1 + (f0 - f1) * np.exp(-t / .05)) / SR
    return np.sin(ph) * np.exp(-t / tau) * att(n, .003)

def impact(dur=1.8, big=1.0):
    n = int(dur * SR); t = np.arange(n) / SR
    sub = thump(110, 36, dur, .42 * big)
    crack = bandnoise(dur, 300, 7000) * np.exp(-t / .03)
    body = bandnoise(dur, 60, 600) * np.exp(-t / .18)
    return sub * 1.0 + crack * .55 + body * .35

def paper(dur=0.35, lo=1200, hi=7000, grains=40):
    n = int(dur * SR); base = bandnoise(dur, lo, hi); e = np.zeros(n)
    for _ in range(grains):
        c = rs.integers(0, n); w = rs.integers(200, 1600); a = rs.random()
        e[c:c + w] += a * np.hanning(min(w, n - c))
    e = np.convolve(e, np.hanning(300) / 150, 'same'); tt = np.linspace(0, 1, n)
    return base * e * np.sin(np.pi * tt) ** .6

def crackle(dur, density0=20, density1=140):
    n = int(dur * SR); y = np.zeros(n)
    t = 0.0
    while t < dur:
        p = t / dur; rate = density0 + (density1 - density0) * p
        t += rs.exponential(1 / rate); i = int(t * SR)
        if i >= n - 400: break
        k = tick(rs.uniform(1500, 4200), .012) * rs.uniform(.3, 1)
        y[i:i + len(k)] += k
    return y

def slash(dur=.28):
    return whoosh(dur, 1800, 6000, .35)

def blip(f=1320, dur=.09):
    n = int(dur * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t) * att(n, .002) * np.exp(-t / .03)

def reverb(x, sec=.7, wet=.18):
    n = int(sec * SR); ir = rs.standard_normal(n) * np.exp(-np.arange(n) / SR / (sec / 5))
    ir[:int(.012 * SR)] = 0; ir /= np.sqrt((ir ** 2).sum())
    M = len(x) + n; w = np.fft.irfft(np.fft.rfft(x, M) * np.fft.rfft(ir, M), M)
    y = np.zeros(len(x) + n); y[:len(x)] += x; y += w * wet; return y

def put(t, sig, gain_db, pan=0.0, rev=.18, pan_sweep=None):
    s = reverb(sig / (np.abs(sig).max() + 1e-9), wet=rev) * db(gain_db)
    i = int(t * SR); j = min(N, i + len(s)); s = s[:j - i]
    if pan_sweep:
        pp = np.linspace(pan_sweep[0], pan_sweep[1], len(s))
    else:
        pp = np.full(len(s), pan)
    out[i:j, 0] += s * np.sqrt((1 - pp) / 2); out[i:j, 1] += s * np.sqrt((1 + pp) / 2)

# ---------------- timeline: Apa itu fenomena (no voice-over) ----------------
n=N; t=np.arange(n)/SR; rt=bandnoise(n/SR,70,500)*db(-46); rt*=np.minimum(1,t/1.0)*np.minimum(1,(n/SR-t)/1.5)
out[:,0]+=rt; out[:,1]+=np.roll(rt,977)
put(0.02, whoosh(.55,250,1800,.6), -26)
put(0.08, tick(2200), -30); put(0.25, thump(85,45,.5,.1), -22); put(0.5, tick(2600), -30)
put(0.85, sweep_noise(.6,2600,5200)*np.hanning(int(.6*SR)), -27)           # pen circles the paragraph
put(1.45, impact(1.4,.7), -16, rev=.25); put(1.5, glass(mtof(79),1.0), -27)
put(2.33, whoosh(.45,300,3200,.85), -24)
put(2.55, thump(90,45,.5,.1), -22); put(2.8, tick(2400), -29)
put(2.92, whoosh(.5,600,2600,.5), -27, pan_sweep=(-.6,0)); put(3.17, whoosh(.5,600,2600,.5), -27, pan_sweep=(.6,0))
put(3.05, blip(1200,.08), -30)
put(4.0, whoosh(.35,1200,500,.5), -27); put(4.22, glass(mtof(76),1.1)+glass(mtof(83),1.1)*.5, -24, rev=.3)
put(4.93, whoosh(.45,400,2800,.6), -26)
put(5.1, thump(90,45,.5,.1), -22); put(5.32, tick(2400), -29)
put(5.55, whoosh(.7,200,1200,.7), -27)
put(6.25, whoosh(.35,2500,5000,.5), -30); put(6.5, slash(.25), -28); put(6.75, blip(1500,.08), -28)
put(7.0, glass(mtof(81),1.2), -26)
put(7.93, whoosh(.45,400,2800,.6), -26)
put(8.05, thump(90,45,.5,.1), -21); put(8.2, tick(2400), -29)
for k,a in enumerate([8.35,8.5,8.65]): put(a+.25, thump(130,70,.25,.05), -26); put(a+.25, paper(.15,600,4000,10), -30)
for k,a in enumerate([8.95,9.1,9.25]): put(a, slash(.22), -27)
for k,a in enumerate([9.95,10.03,10.11]): put(a, whoosh(.45,800,3000,.8), -27, pan_sweep=(0,.8))
put(10.33, whoosh(.5,400,2000,.5), -25); put(10.4, paper(.35,700,5000,24), -29)
put(10.6, thump(85,45,.5,.1), -21); put(10.75, tick(2400), -29)
for k in range(4): put(11.35+k*.06, tick(1800+k*250,.02), -31)
for k,(a,m) in enumerate(zip([11.5,14,16.5,19,21.5],[72,74,76,79,81])):
    put(a-.05, whoosh(.45,500,3000,.6), -27, pan_sweep=(.5,-.3)); put(a+.05, glass(mtof(m),.9), -27)
for k,a in enumerate([11.62,11.78,11.94]): put(a, paper(.25,800,6000,16), -29, pan=(k-1)*.5)
put(14.3, sweep_noise(.75,700,3500)*np.hanning(int(.75*SR)), -30)
for k in range(4): put(14.45+k*.18, blip(1000+k*200,.06), -31)
for k,a in enumerate([15.15,15.35,15.55]): put(a, tick(2200+k*200), -29)
put(16.65, whoosh(.65,200,1200,.7), -27); put(17.3, whoosh(.35,2500,5000,.5), -30); put(17.55, slash(.25), -28); put(17.85, blip(1500,.08), -28)
put(19.15, blip(900,.09), -27); put(19.4, blip(1200,.07), -29); put(19.55, blip(1350,.07), -29)
put(19.75, whoosh(.5,1500,4000,.5), -31); put(19.9, whoosh(.5,1500,4000,.5), -31); put(20.2, glass(mtof(84),.9), -28)
put(21.85, paper(.2,800,5000,12), -29); put(22.35, paper(.2,800,5000,12), -29)
put(23.93, whoosh(.55,300,2600,.7), -24); put(24.0, thump(70,40,.7,.15), -22)
put(24.25, thump(90,45,.5,.1), -21); put(24.5, glass(mtof(79),1.0), -27)
for k,a in enumerate([24.95,25.2]): put(a, whoosh(.45,500,2600,.5), -27, pan_sweep=(-.6,0)); put(a+.35, blip(1400+k*200,.07), -28)
put(25.75, tick(2400), -29)
put(26.6, thump(95,45,.6,.12), -19); put(26.85, tick(2600), -29)
put(27.5, glass(mtof(76),1.8)+glass(mtof(83),1.8)*.6+glass(mtof(88),1.8)*.4, -28, rev=.35)

sf.write(sys.argv[2], out, SR, subtype='FLOAT')
print('sfx peak dBFS %.1f' % (20*np.log10(np.abs(out).max())))
