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

# ---------------- timeline (derived from the HTML schedule) ----------------
put(0.855, impact(1.8, 1.0), -12, rev=.25)                    # STOP!
put(2.45, whoosh(.9, 900, 220, .35), -27, pan_sweep=(.1, -.1))  # STOP recedes
for k, (t, m) in enumerate([(3.72, 72), (4.30, 74), (5.36, 76), (6.50, 79)]):   # promo cards
    put(t - .05, whoosh(.38, 500, 2600, .6), -30, pan=(-.35 if k % 2 == 0 else .35))
    put(t + .08, glass(mtof(m), .8), -31, pan=(-.2 if k % 2 == 0 else .2))
put(7.33, glass(mtof(84), 1.0), -29)                         # 0% focus
put(7.615, thump(120, 50, .6, .1), -15, rev=.2)               # stamp slam
put(7.62, paper(.18, 300, 4000, 12), -22)
put(7.92, crackle(.5, 25, 160), -30)                          # cracks spread
put(8.52, paper(.75, 900, 8000, 90), -22, rev=.3)            # paper shatter
put(8.52, crackle(.18, 200, 400), -27)
for k, t in enumerate([8.72, 8.90, 9.08]):                    # strips slide in
    put(t - .04, whoosh(.45, 700, 3200, .55), -27, pan_sweep=((.5, -.1) if k % 2 == 0 else (-.5, .1)))
    put(t + .22, paper(.2, 800, 5000, 14), -30)
put(10.0, tick(2000), -33)
put(12.08, whoosh(.75, 400, 3000, .7), -26)                  # strips fly up
put(12.80, thump(70, 45, .6, .12), -24)                       # spotlight on
put(12.80, tick(3200, .02), -30)
put(14.15, whoosh(2.4, 180, 900, .5), -31)                    # dolly back
put(15.22, glass(mtof(79), .9), -31)                          # ≠
put(17.5, whoosh(.55, 600, 2500, .5), -29)
for k, t in enumerate([17.9, 18.14, 18.38]):                  # docs dealt
    put(t, paper(.22, 900, 6000, 18), -28, pan=(k - 1) * .45)
for k, (t, m) in enumerate([(18.85, 76), (19.55, 79), (20.2, 81)]):
    put(t, glass(mtof(m), .8), -33, pan=(k - 1) * .4)
put(21.12, whoosh(.75, 1500, 5000, .4), -33, pan_sweep=(-.5, .5))  # line draws
for k, t in enumerate([22.5, 22.62, 22.74]):
    put(t, blip(1320 + k * 220), -33, pan=(k - 1) * .45)
put(24.02, blip(880, .08), -29, pan=.45); put(24.12, blip(660, .12), -29, pan=.45)  # flag
put(24.95, tick(2600), -33, pan=.4)
put(26.30, whoosh(.68, 250, 2400, .85), -26)                  # dive into doc
put(26.95, whoosh(.35, 2500, 4500, .5), -33)                  # marker
put(27.5, whoosh(.35, 2500, 4500, .5), -33)
put(28.15, slash(.22), -32); put(28.75, slash(.22), -32)      # strike-through
for t in (28.5, 28.85, 29.2): put(t, tick(2200), -34)
put(29.55, whoosh(.55, 300, 1600, .7), -30)                   # 0% rises
put(31.1, slash(.3), -27); put(31.14, thump(110, 60, .4, .07), -26)
put(32.375, impact(2.2, 1.3), -11, rev=.3)                    # hard cut: BISA MEMBANTU
put(32.8, thump(100, 45, .6, .12), -20)                       # 0%
put(33.95, whoosh(.5, 400, 2000, .5), -28)                    # cream panel slides up
put(34.0, paper(.3, 700, 5000, 20), -31)
put(35.02, tick(1800), -36); put(35.55, tick(1500), -34)
for i in range(0, 58, 2): put(35.68 + i / 43, tick(rs.uniform(2600, 3600), .018), -40, pan=rs.uniform(-.2, .2), rev=.08)
put(35.85, blip(990, .08), -33, pan=-.4); put(36.95, blip(1180, .08), -33, pan=.4)
put(37.15, whoosh(.6, 600, 1800, .5), -32); put(37.7, paper(.15, 800, 4000, 8), -33)
put(38.22, thump(80, 45, .6, .14), -24)                       # "Ingat"
put(38.95, whoosh(.45, 2200, 4200, .5), -32)                  # underline
put(41.2, glass(mtof(79), .9), -31); put(41.25, blip(1500, .06), -35)
put(41.8, glass(mtof(84), .9), -31); put(41.85, blip(1700, .06), -35)
put(42.85, tick(2200), -35); put(45.4, tick(2200), -35)
put(46.3, slash(.25), -31)
put(47.0, whoosh(.65, 2400, 300, .85), -25)                   # converge to a point
put(47.3, glass(mtof(72), 1.2), -29)
put(47.5, whoosh(.8, 300, 1200, .4), -32)                     # ring expands
put(49.40, thump(90, 45, .6, .12), -21)                       # KOMEN
put(49.55, blip(1200, .07), -32)
put(49.92, tick(2800, .02), -34); put(50.42, tick(2800, .02), -34)  # cursor blinks
put(50.95, glass(mtof(84), 1.4) + glass(mtof(88), 1.4) * .6 + glass(mtof(91), 1.4) * .4, -31, rev=.35)

sf.write(sys.argv[2], out, SR, subtype='FLOAT')
mix = voice + out
pk = np.abs(mix).max()
print('sfx peak dBFS %.1f  voice peak %.1f  mix peak %.1f' % (20*np.log10(np.abs(out).max()), 20*np.log10(np.abs(voice).max()), 20*np.log10(pk)))
if pk > .98: mix *= .98 / pk; print('WARNING: mix scaled to avoid clipping')
sf.write(sys.argv[3], mix, SR, subtype='PCM_24')
