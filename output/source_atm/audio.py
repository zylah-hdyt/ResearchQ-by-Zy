"""SFX for the 'teknik ATM' video, timed from the same word onsets the animation uses. Then mix under the cleaned VO."""
import numpy as np, soundfile as sf, sys, json
S = sys.argv[1]; P = f'{S}/p2'; R = f'{S}/sfxref'
WD = json.load(open(f'{P}/work/words.json'))
ST = [w['s'] for w in WD]; N = len(WD); END = WD[-1]['e'] + 2.9
def W(k, i): ws = WD[k]['words']; return ws[min(i, len(ws) - 1)][1]
SEND = lambda k: ST[k + 1] if k < N - 1 else END

sf.write(f'{P}/work/sil.wav', np.zeros((int((END + .2) * 48000), 2)), 48000, subtype='FLOAT')
src = open(f'{S}/video/sfx.py').read(); sys.argv = ['x', f'{P}/work/sil.wav']
exec(src[:src.index('# ---------------- timeline')])
SFX = out

def load(p):
    x, sr = sf.read(p, dtype='float64'); x = np.stack([x, x], 1) if x.ndim == 1 else x
    if sr != SR:
        n = int(len(x) * SR / sr); idx = np.linspace(0, len(x) - 1, n); x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(2)], 1)
    return x
def fit(x, rate=1.0, trim=None):
    if trim: x = x[:int(trim * SR)]
    if rate != 1.0:
        n = int(len(x) / rate); idx = np.linspace(0, len(x) - 1, n); x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(2)], 1)
    f = int(.008 * SR); w = np.ones(len(x)); w[:f] = np.linspace(0, 1, f); w[-f:] = np.linspace(1, 0, f); return x * w[:, None]
def putS(t, x, g, pan=0.0):
    x = x / (np.abs(x).max() + 1e-9) * db(g); i = int(max(0, t) * SR); j = min(N_, i + len(x)); x = x[:j - i]
    SFX[i:j, 0] += x[:, 0] * np.sqrt((1 - pan) / 2) * 1.414; SFX[i:j, 1] += x[:, 1] * np.sqrt((1 + pan) / 2) * 1.414
N_ = len(SFX)
Pk = {k: load(f'{R}/s{k:02d}.wav') for k in range(15)}
spark, boom, ding, clk1, pop1, clk2, rise, tap, blipT, flut, typing, clk3, blips, swoosh, hit = [Pk[k] for k in range(15)]
def stampS(t): putS(t + .05, fit(boom, rate=1.5, trim=.35), -19); putS(t + .02, fit(tap, rate=.8), -22)

def swish(t, g=-26, rate=1.6): putS(t, fit(swoosh, rate=rate, trim=.3), g)
def dg(t, i=0, g=-22): putS(t, fit(ding, rate=1.0 + .12 * i), g)
# 0 empty doc, ? pops, stamp
putS(ST[0] + .05, fit(pop1, rate=.9), -24)
for i in range(3): putS(W(0, 4) + i * .12, fit(tap, rate=1.3 + .1 * i), -26)
stampS(W(0, 9) - .12)
# 1 halftone in, chip, ATM tiles flip
putS(ST[1] - .32, fit(rise, rate=1.2), -21); putS(W(1, 3) - .05, fit(pop1), -25)
for i in range(3): putS(W(1, 10) - .1 + i * .12, fit(flut, rate=1.5, trim=.3), -24)
# 2 amati / tiru / modifikasi
for i, k in enumerate((0, 1, 3)): dg(W(2, k) - .05, i, -21)
# 3 two studies + magnifier + relevan
swish(ST[3] + .05); swish(W(3, 5) - .05)
put(W(3, 1), sweep_noise(1.2, 1500, 3500) * np.hanning(int(1.2 * SR)), -38)
putS(W(3, 10) - .05, fit(spark, rate=1.15, trim=.6), -23)
# 4 three skeletons, blocks light up, stamp
for i in range(3): putS(W(4, 6) + i * .12, fit(pop1, rate=.95 + .06 * i), -25)
for j in range(5): putS(W(4, 11) + j * .08, fit(clk3, rate=1.5, trim=.07), -29)
stampS(W(4, 13) - .05)
# 5-6 research flow rows
for i, x in enumerate([W(5, 3), W(5, 5), W(5, 8), W(6, 1), W(6, 4)]): putS(x - .12, fit(pop1, rate=.95 + .08 * i), -24)
# 7 A vs B
putS(ST[7] - .32, fit(rise, rate=1.25), -21); swish(ST[7] + .05, -27); swish(W(7, 5), -27)
putS(W(7, 3) - .05, fit(tap, rate=.9), -22); stampS(W(7, 8) - .1)
# 8-9 comparison rows
swish(ST[8], -26, 1.2)
for i, x in enumerate([W(8, 2), W(8, 5), W(9, 0), W(9, 1), W(9, 4)]): putS(x - .08, fit(clk1, rate=1.1 + .05 * i), -26)
# 10 zero, slash, stamp
putS(ST[10], fit(boom, rate=1.5, trim=.35), -24)
put(W(10, 2), sweep_noise(.25, 1500, 4500) * np.hanning(int(.25 * SR)), -24)
stampS(W(10, 7) - .05)
# 11-12 ATM process
for i in range(3): putS(ST[11] + i * .08, fit(tap, rate=1.2 + .1 * i), -27)
for i, x in enumerate([W(11, 0), W(11, 5), W(12, 1)]): dg(x - .05, i, -22)
swish(W(11, 0), -28); swish(W(11, 5) - .05, -28)
for j in range(5): putS(W(11, 5) + .1 + j * .1, fit(clk3, rate=1.4, trim=.07), -30)
putS(W(12, 3) - .05, fit(pop1, rate=1.05), -23); putS(W(12, 5) - .05, fit(pop1, rate=1.15), -23)
# 13 dark: copy-paste, X, stamp
putS(ST[13], fit(boom, rate=1.1, trim=.6), -23); putS(W(13, 1), fit(clk2), -22)
put(W(13, 2), sweep_noise(.18, 1500, 4500) * np.hanning(int(.18 * SR)), -21); put(W(13, 2) + .1, sweep_noise(.18, 1500, 4500) * np.hanning(int(.18 * SR)), -21)
stampS(W(13, 4) - .08)
# 14 two must-haves, checks
for i, x in enumerate([W(14, 3), W(14, 7)]): swish(x - .1, -27); dg(x + .38, i + 1, -22)
# 15 follow tap
putS(ST[15], fit(pop1, rate=.9), -24); ck = W(15, 0) + .3; putS(ck - .01, fit(clk2), -18); putS(ck + .03, fit(ding, rate=1.25), -21)
putS(W(15, 11) - .1, fit(pop1, rate=1.1), -24)
# CTA
a = END - 2.75; putS(a, fit(swoosh, rate=.9), -22)
for i in range(3): putS(a + .35 + i * .18, fit(pop1, rate=1.0 + .1 * i), -21)
putS(a + 1.0, fit(hit, trim=1.6), -24)

sf.write(f'{P}/work/sfx.wav', SFX, SR, subtype='FLOAT')
print('END', round(END, 2), 'sfx peak %.1f dB' % (20 * np.log10(np.abs(SFX).max())))
