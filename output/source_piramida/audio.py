"""SFX for the 'teknik ATM' video, timed from the same word onsets the animation uses. Then mix under the cleaned VO."""
import numpy as np, soundfile as sf, sys, json
S = sys.argv[1]; P = f'{S}/p3'; R = f'{S}/sfxref'
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
# 0 hook: chip, triangle draws, ?, stamp
put(W(0, 3) - .1, sweep_noise(.6, 1200, 3500) * np.hanning(int(.6 * SR)), -34)
putS(W(0, 6) - .05, fit(pop1), -25); putS(W(0, 7) - .1, fit(tap, rate=1.2), -24); stampS(W(0, 4) - .05)
# 1-2 wide bar, funnel narrows, target
putS(W(1, 4) - .1, fit(pop1, rate=.9), -25); swish(W(1, 9) - .25, -25, 1.2)
for i in range(3): putS(W(2, 1) + i * .18, fit(clk3, rate=1.4, trim=.07), -29)
dg(W(2, 4) - .1, 0, -21)
# 3 clapper
putS(ST[3] - .32, fit(rise, rate=1.2), -21); putS(ST[3] + .05, fit(pop1, rate=.9), -25)
putS(W(3, 5) - .05, fit(boom, rate=1.6, trim=.25), -20); putS(W(3, 5) - .04, fit(clk2), -18)
# 4-5 film strip frames light up
swish(ST[4], -26, 1.2)
for i, x in enumerate([W(4, 7), W(5, 1), W(5, 6)]): dg(x - .1, i, -22)
# 6 latar belakang doc
swish(W(6, 1) - .1, -26)
for i in range(3): putS(W(6, 3) + i * .22, fit(pop1, rate=.95 + .08 * i), -26)
putS(W(6, 6) - .05, fit(tap, rate=1.1), -24)
# 7-9 pyramid layers fill top -> bottom, pin slides
putS(ST[7] - .32, fit(rise, rate=1.25), -21)
for i, x in enumerate([W(7, 4) - .12, W(8, 6) - .15, W(9, 8) - .1, W(9, 11) - .1]):
    swish(x, -28, 1.5 - .1 * i); dg(x + .1, i, -21)
for i, k in enumerate((2, 4, 6)): putS(W(9, k) - .05, fit(pop1, rate=1.0 + .08 * i), -27)
# 10 dark: wrong vs right
putS(ST[10], fit(boom, rate=1.1, trim=.6), -24)
put(W(10, 3), sweep_noise(.18, 1500, 4500) * np.hanning(int(.18 * SR)), -22); put(W(10, 3) + .1, sweep_noise(.18, 1500, 4500) * np.hanning(int(.18 * SR)), -22)
swish(W(10, 8) - .12, -26); dg(W(10, 9), 2, -21)
# 11 recap: pyramid returns, arrow umum -> khusus
swish(ST[11] - .3, -25, 1.2); putS(W(11, 6) - .1, fit(pop1), -24)
put(W(11, 6), sweep_noise(max(.3, W(11, 8) - W(11, 6)), 1500, 3500) * np.hanning(int(max(.3, W(11, 8) - W(11, 6)) * SR)), -34)
dg(W(11, 8) - .1, 3, -21)
# 12 follow tap
putS(ST[12], fit(pop1, rate=.9), -24); ck = W(12, 0) + .3; putS(ck - .01, fit(clk2), -18); putS(ck + .03, fit(ding, rate=1.25), -21)
# CTA
a = END - 2.75; putS(a, fit(swoosh, rate=.9), -22)
for i in range(3): putS(a + .35 + i * .18, fit(pop1, rate=1.0 + .1 * i), -21)
putS(a + 1.0, fit(hit, trim=1.6), -24)

sf.write(f'{P}/work/sfx.wav', SFX, SR, subtype='FLOAT')
print('END', round(END, 2), 'sfx peak %.1f dB' % (20 * np.log10(np.abs(SFX).max())))
