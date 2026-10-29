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

# ---------------- UI + transition SFX (v6: one distinct sound per transition) ----------------
def click(): return tick(3200,.06)+thump(400,180,.06,.012)*.6
for c in [2.57,9.0,12.86,14.57,19.71,24.43,28.29,31.29]: put(c, click(), -14, rev=.12)
for i in range(9): put(0.75+i/12, tick(rs.uniform(2600,3600),.016), -23, pan=rs.uniform(-.2,.2), rev=.05)
put(3.0, whoosh(.45,180,1400,.95), -14)                          # iris swells from the button
put(3.43, impact(1.4,.6), -20, rev=.3); put(3.45, whoosh(.5,1400,250,.3), -22)   # iris collapses
put(6.45, glass(mtof(88),1.4)+glass(mtof(95),1.4)*.5, -20, rev=.35)
put(6.45, whoosh(.45,300,3000,.9), -17); put(6.86, impact(1.2,.5), -19)        # ring burst
put(9.85, whoosh(.6,120,2200,.85), -14, pan_sweep=(.5,-.6))       # cursor flies into camera
put(10.32, glass(mtof(91),.6), -22)
put(13.42, sweep_noise(.5,800,6000)*np.hanning(int(.5*SR)), -16, pan_sweep=(-.2,.2))  # light band wipe
put(13.6, tick(4200,.03), -22)
put(16.86, whoosh(.32,600,2600,.85), -16, pan_sweep=(-.7,.7)); put(17.14, paper(.25,500,5000,20), -20)  # 3D flip
put(20.28, whoosh(.32,2600,300,.9), -17); put(20.58, glass(mtof(84),1.0)+glass(mtof(91),1.0)*.5, -19, rev=.4)   # defocus bloom
put(22.92, whoosh(.3,900,6000,.8), -14, pan_sweep=(.8,-.8))      # whip pan
put(25.0, glass(mtof(84),.9)+glass(mtof(88),.9)*.6, -18)
put(25.32, whoosh(.38,200,2500,.95), -16); put(25.7, impact(1.0,.4), -21)       # toast bloom
for i in range(9): put(28.8+i*.035, sweep_noise(.32,3000,7000)*np.hanning(int(.32*SR)), -27, pan=-.8+i*.2)   # neon trails
put(28.75, glass(mtof(95),.6), -24)
put(32.15, whoosh(.42,150,1800,.95), -14)                         # push into play button
put(32.57, thump(70,38,.9,.2), -16)
put(35.5, whoosh(.5,2400,200,.85), -16); put(35.85, whoosh(.5,200,1500,.4), -20)  # converge + warm wash
put(15.2, sweep_noise(.5,2500,5000)*np.hanning(int(.5*SR)), -28)
put(19.8, whoosh(.7,300,2500,.6), -26)
for i in range(5): put(26.3+i*.2, tick(2200+i*90,.02), -24)
put(28.75, glass(mtof(84),.9)+glass(mtof(88),.9)*.6, -19)
put(31.35, glass(mtof(81),.8), -21)
put(36.1, glass(mtof(81),2.0)+glass(mtof(88),2.0)*.5, -22, rev=.4)
sf.write(sys.argv[2], out, SR, subtype='FLOAT')
print('sfx peak dBFS %.1f' % (20*np.log10(np.abs(out).max())))
