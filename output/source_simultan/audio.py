"""SFX for the 'teknik ATM' video, timed from the same word onsets the animation uses. Then mix under the cleaned VO."""
import numpy as np, soundfile as sf, sys, json
S = sys.argv[1]; P = f'{S}/p4'; R = f'{S}/sfxref'
WD = json.load(open(f'{P}/work/words.json'))
ST = [w['s'] for w in WD]; N = len(WD); END = WD[-1]['e'] + 3.2
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
def nz(t, d=.25, g=-24, f0=1500, f1=4500): put(t, sweep_noise(d, f0, f1) * np.hanning(int(d * SR)), g)
# background circle wipes
BGs = ['d','l','o','l','d','l','d','l','d']
for k in range(1, len(BGs)):
    if BGs[k] != BGs[k - 1]: putS(ST[k] - .25, fit(swoosh, rate=1.3, trim=.45), -29)
# 0 hook
putS(ST[0] + .05, fit(pop1, rate=.9), -26)
for i in range(3): putS(ST[0] + .1 + i * .1, fit(tap, rate=1.2 + .1 * i), -27)
putS(W(0, 6) - .1, fit(pop1, rate=1.2), -23); stampS(W(0, 4) - .05)
# 1 Hair cover
putS(ST[1], fit(flut, rate=1.3), -22); putS(W(1, 6) - .05, fit(pop1), -27)
# 2 KBBI
putS(ST[2] + .05, fit(boom, rate=1.6, trim=.3), -23); nz(W(2, 3) - .05, .3, -24)
putS(W(2, 4), fit(pop1), -25); swish(W(2, 6) - .1, -26); nz(W(2, 9) - .05, .3, -32, 2500, 5000)
# 3 X1, X2 -> Y together
for i in range(3): putS(ST[3] + .05 + i * .12, fit(pop1, rate=.95 + .08 * i), -26)
dg(W(3, 5) - .05, 1, -22); putS(W(3, 9) - .1, fit(tap, rate=1.1), -24)
# 4 regression vs PLS
swish(ST[4] + .05, -27); dg(W(4, 4) - .05, 0, -23); swish(W(4, 7) - .1, -27); stampS(W(4, 12) - .1)
# 5 R2 + Hair sentence
putS(W(5, 3) - .08, fit(boom, rate=1.5, trim=.3), -23); swish(W(5, 5) - .1, -27)
for i in range(3): nz(W(5, 7) + i * .25, .25, -33, 2500, 5000)
putS(W(5, 11) - .05, fit(pop1, rate=1.1), -25)
# 6 gauge
put(W(6, 1) - .1, sweep_noise(1.0, 600, 3200) * np.hanning(int(1.0 * SR)), -30); dg(W(6, 3) + .2, 2, -22)
putS(W(6, 5) - .1, fit(pop1), -26); nz(W(6, 7) - .1, .6, -33, 800, 2500)
# 7 sidang
putS(ST[7] + .05, fit(blips, rate=1.3, trim=.2), -26); putS(W(7, 5) - .1, fit(blips, rate=1.5, trim=.2), -26)
stampS(W(7, 11) - .05); dg(W(7, 11) + .25, 3, -21)
# 8 ebook + comment
putS(ST[8] + .05, fit(flut, rate=1.4), -23); putS(W(8, 5), fit(typing, trim=.4), -24)
putS(W(8, 6) - .01, fit(clk2), -19); putS(W(8, 6) + .03, fit(ding, rate=1.25), -22)
# CTA
a = END - 2.75; putS(a, fit(swoosh, rate=.9), -22)
for i in range(3): putS(a + .5 + i * .16, fit(pop1, rate=1.0 + .1 * i), -21)
putS(a + 1.0, fit(hit, trim=1.6), -24)

sf.write(f'{P}/work/sfx.wav', SFX, SR, subtype='FLOAT')
print('END', round(END, 2), 'sfx peak %.1f dB' % (20 * np.log10(np.abs(SFX).max())))
