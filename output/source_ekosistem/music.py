"""Original 140 BPM electronic track for the ResearchQ ecosystem promo (A minor, 27 bars)."""
import numpy as np, soundfile as sf, sys
from scipy.signal import butter, sosfilt

SR = 48000
BPM = 140
BEAT = 60 / BPM
BAR = BEAT * 4
NBARS = 23
DUR = NBARS * BAR + 0.35
N = int(DUR * SR)
rs = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)

def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def add(t, sig, g=1.0, pan=0.0):
    i = int(t * SR); j = min(N, i + len(sig)); s = sig[:j - i] * g
    L[i:j] += s * np.sqrt((1 - pan) / 2) * 1.414; R[i:j] += s * np.sqrt((1 + pan) / 2) * 1.414
def mtof(m): return 440 * 2 ** ((m - 69) / 12)
def saw_add(f, n, harm=12, det=0.0):
    t = np.arange(n) / SR; y = np.zeros(n)
    for k in range(1, harm + 1):
        if f * k > 16000: break
        y += np.sin(2 * np.pi * f * k * (1 + det) * t) / k
    return y * 0.6

# ---- section map -------------------------------------------------------
# bars: 0-1 intro | 2-3 logo | 4-5 search | 6-8 ebook | 9 break | 10-12 skills | 13-15 olah data
#       16 break | 17-19 bimbel | 20-22 youtube | 23-24 spheres (half-time) | 25-26 outro
def sec(b):
    if b < 2: return 'intro'
    if b in (19, 20): return 'half'
    if b >= 21: return 'outro'
    return 'full'
CH = [(57, [57, 60, 64]), (53, [53, 57, 60]), (48, [60, 64, 67]), (55, [55, 59, 62])]  # Am F C G (root midi for bass)

# ---- instruments --------------------------------------------------------
def kick():
    n = int(.42 * SR); t = np.arange(n) / SR
    f = 45 + 110 * np.exp(-t / .035); ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-t / .16) + .3 * bp(rs.standard_normal(n), 1500, 6000) * np.exp(-t / .004)
def clap():
    n = int(.3 * SR); t = np.arange(n) / SR; nz = bp(rs.standard_normal(n), 900, 5200)
    e = np.exp(-t / .12);
    for d in (0, .011, .022): e += .6 * np.exp(-np.maximum(t - d, 0) / .006) * (t >= d)
    return nz * e * .6
def hat(op=False):
    n = int((.16 if op else .045) * SR); t = np.arange(n) / SR
    return hp(rs.standard_normal(n), 7500) * np.exp(-t / (.05 if op else .012)) * .35
def bass_note(m, dur):
    n = int(dur * SR); t = np.arange(n) / SR; f = mtof(m - 12)
    y = saw_add(f, n, 18) + .5 * np.sin(2 * np.pi * f * t)
    env = np.minimum(1, t / .005) * np.exp(-t / .22)
    return lp(y, 900) * env
def pluck(m, dur=.22):
    n = int(dur * SR); t = np.arange(n) / SR
    y = saw_add(mtof(m), n, 10) + .3 * saw_add(mtof(m), n, 10, .006)
    return lp(y * np.exp(-t / .08), 4200) * np.minimum(1, t / .002)
def pad(chord, dur):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n)
    for m in chord:
        for d in (-.004, 0, .005): y += saw_add(mtof(m), n, 10, d)
    env = np.minimum(1, t / .35) * np.minimum(1, (dur - t) / .3)
    return lp(y, 1600) * env * .12
def riser(dur):
    n = int(dur * SR); t = np.arange(n) / SR; y = np.zeros(n); B = 2048; H = 512
    src = rs.standard_normal(n + B); w = np.hanning(B); out = np.zeros(n + B)
    for i in range(0, n, H):
        fc = 300 * (9000 / 300) ** (i / n); X = np.fft.rfft(src[i:i + B] * w); f = np.fft.rfftfreq(B, 1 / SR)
        X *= np.exp(-.5 * (np.log(f + 1) - np.log(fc)) ** 2 / .35); out[i:i + B] += np.fft.irfft(X, B) * w
    out = out[:n]; out /= np.abs(out).max() + 1e-9
    return out * (t / dur) ** 2
def impact():
    n = int(2.0 * SR); t = np.arange(n) / SR
    ph = 2 * np.pi * np.cumsum(32 + 80 * np.exp(-t / .06)) / SR
    return np.sin(ph) * np.exp(-t / .55) + .4 * lp(rs.standard_normal(n), 2500) * np.exp(-t / .25)

K = kick(); C = clap(); Hc = hat(); Ho = hat(True)
kicks = []
for b in range(NBARS):
    s = sec(b); t0 = b * BAR; root, chord = CH[b % 4]
    if s in ('full',):
        for q in range(4): add(t0 + q * BEAT, K, .95); kicks.append(t0 + q * BEAT)
        for q in (1, 3): add(t0 + q * BEAT, C, .55, .05)
        for e in range(8): add(t0 + e * BEAT / 2, Ho if e % 2 else Hc, .55 if e % 2 else .35, .3 if e % 2 else -.3)
        if b >= 10:  # extra 16th ghost hats from the skills section on
            for e in range(16):
                if e % 2: add(t0 + e * BEAT / 4, Hc, .16, .5)
        for e in range(8):  # offbeat bass pumps
            add(t0 + e * BEAT / 2 + (BEAT / 2 if e % 2 == 0 else 0) * 0, bass_note(root, BEAT / 2 * .95), .5 if e % 2 else .32)
        if b >= 4:
            arp = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[1] + 24]
            for e in range(16): add(t0 + e * BEAT / 4, pluck(arp[e % 4]), .16 if b >= 6 else .10, (-.4, .4)[e % 2])
        add(t0, pad(chord, BAR), .9)
    elif s == 'half':
        for q in (0, 2): add(t0 + q * BEAT, K, .9); kicks.append(t0 + q * BEAT)
        add(t0 + 3 * BEAT, C, .45)
        for e in range(4): add(t0 + e * BEAT, Ho, .3, .3)
        add(t0, bass_note(root, BAR * .9) * 1.0, .45); add(t0, pad(chord, BAR), 1.2)
    elif s == 'break':
        add(t0, pad(chord, BAR), 1.3); add(t0 + BAR - .9, riser(.9), .22)
        for e in range(8): add(t0 + BAR / 2 + e * BEAT / 4, C * .5, .12 + .05 * e)
    elif s == 'intro':
        add(t0, lp(pad(chord, BAR), 900 + 700 * b), 1.4)
        for e in range(8): add(t0 + e * BEAT / 2, Hc, .12 + .1 * b, (-.3, .3)[e % 2])
        if b == 1: add(t0 + BAR - 1.4, riser(1.4), .3)
    elif s == 'outro':
        if b == 21: add(t0, K, .9)
        add(t0, pad(CH[0][1], BAR * 2 if b == 21 else BAR), 1.3 if b == 21 else 0)
for b in (2, 12, 19, 21): add(b * BAR, impact(), .55)
for b in (11, 18): add(b * BAR + BAR - .9, riser(.9), .18)

# sidechain from kicks
t = np.arange(N) / SR; sc = np.ones(N)
for k in kicks:
    i = int(k * SR); j = min(N, i + int(.3 * SR)); tt = t[i:j] - k
    sc[i:j] = np.minimum(sc[i:j], 1 - .55 * np.exp(-tt / .09))
# apply sidechain only to non-kick material: approximate by mixing kick separately is complex; mild global duck instead
L *= (0.6 + 0.4 * sc); R *= (0.6 + 0.4 * sc)
fade = np.minimum(1, (DUR - t) / 2.2); L *= fade; R *= fade
mix = np.stack([L, R], 1); mix = np.tanh(mix / (np.abs(mix).max() + 1e-9) * 1.6) * .8
sf.write(sys.argv[1], mix, SR, subtype='FLOAT')
print('music', DUR, 's  bars', NBARS, 'bar', BAR)
