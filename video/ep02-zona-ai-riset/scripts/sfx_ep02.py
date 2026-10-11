# EP02 sound design (no music) for the notebook-doodle look: marker scribbles, highlighter squeak,
# paper flips, sticker pops, stamp thuds, pen ticks. Cue times come from window.__cues in the template.
#   node scripts/probe.cjs $PWD/project/index.html > out/cues.json
#   python scripts/sfx_ep02.py out/cues.json project/sfx.wav
import json, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt

SR = 48000; D = 40.0; N = int(SR * D); rng = np.random.default_rng(2002)
C = json.load(open(sys.argv[1]))['c']
L = np.zeros(N); R = np.zeros(N)
T = lambda n: np.arange(n) / SR


def filt(x, kind, f): return sosfilt(butter(2, f, kind, fs=SR, output='sos'), x)


def env(n, a, d):
    t = T(n); return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def add(t0, s, g, pan=0.0):
    i = int(t0 * SR); n = min(len(s), N - i)
    if n <= 0 or i < 0: return
    a = (pan + 1) * np.pi / 4; L[i:i + n] += s[:n] * g * np.cos(a); R[i:i + n] += s[:n] * g * np.sin(a)


def scribble(dur):            # marker on paper: scratchy band noise with stroke-rate amplitude wobble
    n = int(dur * SR); t = T(n); x = filt(rng.normal(0, 1, n), 'band', [1400, 5200])
    stroke = 0.55 + 0.45 * np.abs(np.sin(2 * np.pi * rng.uniform(7, 11) * t + rng.uniform(0, 6)))
    return x * stroke * np.sin(np.pi * np.minimum(1, t / dur)) ** 0.6 * np.minimum(1, (dur - t) / 0.06)


def squeak(dur):              # highlighter swipe: soft broadband swish + faint tonal squeal
    n = int(dur * SR); t = T(n); sw = filt(rng.normal(0, 1, n), 'band', [600, 3000]) * np.sin(np.pi * t / dur) ** 1.5
    f = 1700 + 500 * (t / dur); sq = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / dur) ** 3 * 0.12
    return sw * 0.9 + sq


def pop(f0=320, f1=760):      # sticker pop
    n = int(0.16 * SR); t = T(n); f = f1 + (f0 - f1) * np.exp(-t * 40)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.05) + filt(rng.normal(0, 1, n), 'band', [1500, 4500]) * env(n, 0.0005, 0.01) * 0.25


def stamp():                  # rubber stamp thud + paper slap
    n = int(0.45 * SR); t = T(n); f = 52 + 60 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.11)
    slap = filt(rng.normal(0, 1, n), 'band', [500, 2400]) * env(n, 0.0008, 0.03)
    return np.tanh(1.5 * (body * 1.0 + slap * 0.7))


def flip():                   # page turn: rustle sweeping upward
    n = int(0.38 * SR); t = T(n); x = rng.normal(0, 1, n); y = np.zeros(n); ch = int(0.01 * SR)
    for s0 in range(0, n, ch):
        c = s0 / n; y[s0:s0 + ch] = filt(x[s0:s0 + ch], 'band', [300 + 1200 * c, 1800 + 4200 * c])
    return y * np.sin(np.pi * t / 0.38) ** 1.4 * (0.7 + 0.3 * np.abs(np.sin(2 * np.pi * 24 * t)))


def tick():                   # pen tap / check tick
    n = int(0.09 * SR); t = T(n)
    return (np.sin(2 * np.pi * 1850 * t) * env(n, 0.0006, 0.014) + np.sin(2 * np.pi * 820 * t) * env(n, 0.0006, 0.02) * 0.6
            + filt(rng.normal(0, 1, n), 'high', 2500) * env(n, 0.0004, 0.004) * 0.3)


for i, t in enumerate(C['flip']):  add(t, flip(), 0.55, (-0.25, 0.25)[i % 2])
for i, t in enumerate(C['draw']):  add(t, scribble(rng.uniform(0.38, 0.6)), 0.5, rng.uniform(-0.4, 0.4))
for t in C['write']:               add(t, scribble(0.65), 0.38, rng.uniform(-0.3, 0.3))
for t in C['swipe']:               add(t, squeak(0.55), 0.55, 0.0)
for i, t in enumerate(C['pop']):   add(t, pop(300 + 40 * (i % 4), 720 + 60 * (i % 3)), 0.55, rng.uniform(-0.35, 0.35))
for t in C['stamp']:               add(t, stamp(), 0.9, 0.0)
for t in C['tick']:                add(t, tick(), 0.5, rng.uniform(-0.3, 0.3))

m = np.stack([L, R], 1); m /= max(1e-6, np.max(np.abs(m))) / 0.8
w = wave.open(sys.argv[2], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((m * 32767).astype(np.int16).tobytes()); w.close()
print('sfx ok', sys.argv[2], {k: len(v) for k, v in C.items()})
