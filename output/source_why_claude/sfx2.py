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

# ---------------- timeline: Why Claude ----------------
for i,t in enumerate([0.05,0.3,0.55]): put(t, whoosh(.9,200,900,.6), -36, pan=(i-1)*.5)   # cards drift in
put(1.56, thump(85,45,.5,.1), -24)                          # KENAPA
put(2.88, glass(mtof(76),1.2)+glass(mtof(83),1.2)*.5, -27, rev=.3)   # Claude
put(3.36, tick(2200), -33)
put(4.28, whoosh(1.0,900,200,.3), -30)                      # other AI recede
put(5.56, impact(1.6,.9), -15, rev=.25)                     # 3
put(5.84, whoosh(.4,600,2600,.6), -31)                      # FITUR
for k,t in enumerate([6.18,6.28,6.38]): put(t, paper(.2,900,6000,14), -30, pan=(k-1)*.45)
put(6.8, whoosh(.4,300,2800,.85), -25)                      # dive into slot 01
put(7.38, glass(mtof(72),.9), -31)                          # Project
for k,t in enumerate([7.92,8.14,8.36]): put(t, paper(.3,800,6000,20), -29, pan=.4)
for k in range(4): put(9.05+k*.22, blip(1100+k*180,.07), -34, pan=(-.4 if k%2==0 else .4))
put(10.34, whoosh(.5,500,3500,.5), -24, pan_sweep=(.5,-.5)) # pan to panel 2
put(11.0, glass(mtof(74),.9), -31)
put(10.95, tick(2000), -36)
for k,t in enumerate([12.45,12.54,12.63,12.72]): put(t, tick(2400,.02), -36, pan=(-.4 if k%2==0 else .4))
put(12.5, whoosh(1.4,800,2400,.5), -36)                     # lens sweeps
for k in range(4): put(13.65+k*.15, blip(880+k*110,.08), -33)
put(14.6, tick(2600), -34)
put(15.4, whoosh(.5,500,3500,.5), -24, pan_sweep=(.5,-.5))  # pan to panel 3
put(16.1, glass(mtof(76),1.0), -29)                         # Skill
for k in range(5): put(17.3+k*.38, tick(1800+k*150,.025), -34, pan=(-.3 if k%2==0 else .3))
put(17.95, tick(2200), -35)
put(20.25, tick(2200), -35); put(21.2, slash(.25), -30)
put(22.0, whoosh(.45,400,1400,.5), -33)
put(22.35, paper(.6,700,6000,50), -28, rev=.25)            # long prompt unrolls
put(23.05, paper(.4,500,4000,40), -28)                      # prompt collapses
put(23.38, glass(mtof(84),.9), -29)                         # /skill
put(24.05, whoosh(.3,1500,4000,.5), -33)
put(24.44, impact(2.0,1.2), -13, rev=.3)                    # hard cut: caveat
for k,t in enumerate([25.45,25.85,26.25]): put(t, glass(mtof([79,81,84][k]),.7), -31)
put(26.95, whoosh(.45,2200,400,.6), -29)                    # doc flies out
put(27.88, thump(80,45,.5,.1), -25)                         # SKILL AI
put(29.5, tick(2000), -35)
put(29.85, whoosh(1.05,600,3000,.5), -33, pan_sweep=(-.6,.6))  # range bar
for k in range(5): put(29.85+k*.26, blip(1000+k*160,.06), -36, pan=-.6+k*.3)
put(31.85, thump(95,45,.6,.12), -21)                        # CEK LINK DI BIO
put(32.1, tick(2600), -34)
for k in range(6): put(32.82+k*.08, tick(2000+k*120,.02), -37, pan=(-.4,0,.4)[k%3])
put(33.86, blip(1400,.07), -31); put(33.9, glass(mtof(88),1.2), -31, rev=.3)  # pick skill
put(34.7, glass(mtof(76),1.6)+glass(mtof(83),1.6)*.5, -33, rev=.35)

sf.write(sys.argv[2], out, SR, subtype='FLOAT')
print('sfx peak dBFS %.1f' % (20*np.log10(np.abs(out).max())))
