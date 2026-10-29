"""v8 audio: English male VO + user's SFX pack (adapted) + a few synthesized transition sounds. No music."""
import numpy as np, soundfile as sf, sys
S = sys.argv[1]; V = f'{S}/v8'; R = f'{S}/sfxref'
src = open(f'{S}/video/sfx.py').read()
sys.argv = ['x', f'{V}/silence.wav']
exec(src[:src.index('# ---------------- timeline')])      # synth helpers + out buffer (N samples @48k)
SFX = out; out = None
VO = np.zeros((N, 2))

def load(p):
    x, sr = sf.read(p, dtype='float64')
    if x.ndim == 1: x = np.stack([x, x], 1)
    if sr != SR:
        n = int(len(x) * SR / sr); idx = np.linspace(0, len(x) - 1, n)
        x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(2)], 1)
    return x

def fit(x, rate=1.0, trim=None, fade=.01):
    """adapt a pack sample: optional trim (s), playback-rate pitch shift, short fades"""
    if trim: x = x[:int(trim * SR)]
    if rate != 1.0:
        n = int(len(x) / rate); idx = np.linspace(0, len(x) - 1, n)
        x = np.stack([np.interp(idx, np.arange(len(x)), x[:, c]) for c in range(2)], 1)
    f = int(fade * SR); w = np.ones(len(x)); w[:f] = np.linspace(0, 1, f); w[-f:] = np.linspace(1, 0, f)
    return x * w[:, None]

def putS(t, x, gain_db, pan=0.0):
    x = x / (np.abs(x).max() + 1e-9) * db(gain_db)
    i = int(t * SR); j = min(N, i + len(x)); x = x[:j - i]
    SFX[i:j, 0] += x[:, 0] * np.sqrt((1 - pan) / 2) * 1.414; SFX[i:j, 1] += x[:, 1] * np.sqrt((1 + pan) / 2) * 1.414

P = {k: load(f'{R}/s{k:02d}.wav') for k in range(15)}
spark, boom, ding, clk1, pop1, clk2, rise, tap, blipT, flut, typing, clk3, blips, swoosh, hit = [P[k] for k in range(15)]
out = SFX   # synth helper `put` writes into `out`

# ---- clicks (pack clicks, alternated)
for c, k in zip([2.57, 9.0, 12.86, 14.57, 19.71, 24.43, 28.29, 31.29], [clk1, clk2, clk3, clk1, clk2, clk1, clk3, clk2]):
    putS(c - .01, fit(k), -15)
putS(0.72, fit(typing, trim=.85), -21)                        # typing "researchq"
# ---- A -> B : iris
putS(3.43 - .45, fit(rise), -15)                              # swell into the button
putS(3.42, fit(boom), -13)                                    # iris collapses
putS(6.40, fit(spark, rate=1.06), -18)                        # logo shimmer
# ---- B -> C : ring burst + defocus
putS(6.50, fit(swoosh, rate=.85), -17); putS(6.84, fit(boom, rate=1.25), -19)
# ---- C -> D : cursor fly-through
put(9.85, whoosh(.6, 120, 2200, .85), -17, pan_sweep=(.5, -.6)); putS(10.05, fit(swoosh), -15, pan=-.2)
putS(12.55, fit(pop1, rate=1.1), -21)                         # card hover
# ---- D -> E : light band wipe (synth, keeps its own colour)
put(13.42, sweep_noise(.5, 800, 6000) * np.hanning(int(.5 * SR)), -17, pan_sweep=(-.2, .2))
for i, t in enumerate([15.15, 15.70, 16.25]): putS(t, fit(tap, rate=1 + .06 * i), -21)   # results stream in
# ---- E -> F : 3D flip
putS(16.86, fit(flut, rate=1.2), -16); put(16.86, whoosh(.32, 600, 2600, .85), -20, pan_sweep=(-.7, .7))
putS(20.45, fit(ding, rate=.95), -20)                         # ebook ready
# ---- F -> G : defocus bloom
put(20.28, whoosh(.32, 2600, 300, .9), -19); putS(20.58, fit(spark, rate=.9, trim=.7), -21)
for i, t in enumerate([21.17, 21.42, 21.67]): putS(t, fit(pop1, rate=1.3 + .1 * i), -24)  # significant rows light up
putS(22.95, fit(swoosh, rate=1.15), -15, pan=.3)              # whip pan
putS(24.50, fit(blips, rate=1.05), -22)                       # calculating
putS(24.98, fit(ding), -18)                                   # toast
# ---- G -> H : toast bloom
putS(25.30, fit(blipT), -17); putS(25.68, fit(boom, rate=1.4), -22)
putS(26.21, fit(pop1), -21)                                   # day picked
for i in range(5): putS(26.3 + i * .2, fit(clk3, rate=1.4, trim=.08), -27)                 # wheel ticks
putS(28.70, fit(ding, rate=1.05), -18)
# ---- H -> I : neon trails (synth)
for i in range(9): put(28.8 + i * .035, sweep_noise(.32, 3000, 7000) * np.hanning(int(.32 * SR)), -28, pan=-.8 + i * .2)
putS(31.35, fit(ding, rate=1.1), -20)                         # subscribed
# ---- I -> J : push into the play button -> sphere
putS(32.57 - .45, fit(rise, rate=.9), -15); putS(32.55, fit(boom, rate=.8), -16)
for i, t in enumerate([32.9, 33.05, 33.2, 33.35]): putS(t, fit(pop1, rate=.8 + .08 * i), -24, pan=(-.4, .4)[i % 2])
# ---- J -> K : converge + warm wash, logo hit
put(35.5, whoosh(.5, 2400, 200, .85), -18); putS(36.05, fit(hit), -16)

# ---- voice-over (male, en) — light clean-up then placement
exec(open(f'{V}/vo/lines.py').read())
for i, (a, e, en, idn) in enumerate(L):
    x = load(f'{V}/vo/l{i:02d}.wav')
    i0 = int(a * SR); j = min(N, i0 + len(x)); VO[i0:j] += x[:j - i0]

sf.write(f'{V}/vo_bus.wav', VO, SR, subtype='FLOAT'); sf.write(f'{V}/sfx_bus.wav', SFX, SR, subtype='FLOAT')
print('vo peak %.1f dB, sfx peak %.1f dB' % (20 * np.log10(np.abs(VO).max()), 20 * np.log10(np.abs(SFX).max())))
