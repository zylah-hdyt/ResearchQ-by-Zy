"""SFX for the 'pedoman kampus' video, timed from the same word onsets the animation uses. Then mix under the cleaned VO."""
import numpy as np, soundfile as sf, sys, json
S = sys.argv[1]; P = f'{S}/p1'; R = f'{S}/sfxref'
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

# 0 bingung: cards drop in, ? pops, loop, stamp
for i in range(6): putS(ST[0] + .08 + i * .1, fit(pop1, rate=.9 + .05 * i), -25, pan=(-.4, .4)[i % 2])
for i in range(3): putS(W(0, 1) + i * .12, fit(tap, rate=1.3 + .1 * i), -26)
stampS(W(0, 5) - .05)
# 1 satu hal: tile flip + stamp
putS(ST[1], fit(flut, rate=1.3), -21); stampS(W(1, 3) - .06)
# 2 messy pile, X
for i in range(5): putS(ST[2] + .05 + i * .11, fit(swoosh, rate=1.6, trim=.25), -27, pan=(-.6, .6)[i % 2])
put(W(2, 4), sweep_noise(.22, 1800, 4500) * np.hanning(int(.22 * SR)), -24); put(W(2, 4) + .12, sweep_noise(.22, 1800, 4500) * np.hanning(int(.22 * SR)), -24)
# 3 halftone in, booklet opens, loop, stamp
putS(ST[3] - .32, fit(rise, rate=1.2), -20); putS(W(3, 0) - .05, fit(pop1), -23)
put(W(3, 3), paper(.5, 600, 5000, 30), -24)
stampS(W(3, 6) + .1)
# 4 browser: typing, click, results, pdf saved
putS(W(4, 4), fit(typing, trim=.65), -22)
ck = max(W(4, 7) + .05, W(4, 4) + .7); putS(ck - .01, fit(clk1), -17)
for i in range(3): putS(ck + .15 + i * .08, fit(tap, rate=1.2 + .1 * i), -27)
putS(SEND(4) - .6, fit(ding), -21)
# 5 checklist
# cards pop in, each check gets a ding that steps up in pitch (no blip)
for i, t in enumerate((ST[5], W(5, 0), W(5, 4))): putS(t - .02, fit(pop1, rate=.95 + .08 * i), -26)
for i, t in enumerate((ST[5] - .3, W(5, 0), W(5, 4))): putS(t + .17, fit(ding, rate=1.0 + .12 * i), -22)
# 6 table of contents + scan + loop
putS(ST[6], fit(swoosh, rate=1.2), -24)
for i in range(7): putS(ST[6] + .35 + i * .18, fit(clk3, rate=1.5, trim=.07), -30)
put(ST[6] + .4, sweep_noise(1.6, 1500, 3500) * np.hanning(int(1.6 * SR)), -36)
# 7 spec cards
for i, t in enumerate((W(7, 2), W(7, 3), W(7, 4))): putS(t - .08, fit(pop1, rate=.95 + .1 * i), -22)
# 8 chat bubbles + stamp
for i in range(3): putS(ST[8] + .35 + i * .45, fit(blips, rate=1.3, trim=.2), -26)
stampS(W(8, 6))
# 9 campus columns + stamp
for i, k in enumerate((1, 4, 7)): putS(W(9, k) - .05, fit(pop1, rate=.9 + .08 * i), -23)
stampS(W(9, 11) - .05)
# 10 dark: X + shake + stamp
putS(ST[10], fit(boom, rate=1.1, trim=.6), -22)
put(W(10, 1), sweep_noise(.18, 1500, 4500) * np.hanning(int(.18 * SR)), -21); put(W(10, 1) + .1, sweep_noise(.18, 1500, 4500) * np.hanning(int(.18 * SR)), -21)
stampS(W(10, 4) - .1)
# 11 check
putS(W(11, 3), fit(spark, rate=1.1, trim=.6), -21); stampS(W(11, 4) - .05)
# 12 halftone + ?! + stamp
putS(ST[12] - .32, fit(rise, rate=1.25), -20); putS(W(12, 8) - .05, fit(tap, rate=.9), -22); stampS(W(12, 11) - .05)
# 13 save tap + counter, CTA pops
ck = W(13, 0) + .15; putS(ck - .01, fit(clk2), -17); putS(ck + .02, fit(ding, rate=1.1), -20)
a = END - 2.75; putS(a, fit(swoosh, rate=.9), -22)
for i in range(3): putS(a + .35 + i * .18, fit(pop1, rate=1.0 + .1 * i), -21)
putS(a + 1.0, fit(hit, trim=1.6), -24)

sf.write(f'{P}/work/sfx.wav', SFX, SR, subtype='FLOAT')
print('END', round(END, 2), 'sfx peak %.1f dB' % (20 * np.log10(np.abs(SFX).max())))
