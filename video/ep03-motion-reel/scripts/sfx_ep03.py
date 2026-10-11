# EP03 audio: a 144 BPM half-time beat (808 kick, clap, hats, sub bass, detuned pad, plucks) plus transition
# sound design (whoosh into every cut, impact on the cut, risers, glitch stutter, pops, ticks, dings, shimmer).
# Every SFX time comes from window.__cues in the template, so sound always lands on the picture.
#   node scripts/probe.cjs $PWD/project/index.html > out/cues.json
#   python scripts/sfx_ep03.py out/cues.json project/sfx.wav
import json, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000; D = 32.0; N = int(SR * D); rng = np.random.default_rng(303)
C = json.load(open(sys.argv[1]))['c']
BPM = C.get('bpm', 144); B = 60 / BPM
T = lambda n: np.arange(n) / SR
mf = lambda m: 440 * 2 ** ((m - 69) / 12)


def filt(x, kind, f, order=2): return sosfilt(butter(order, f, kind, fs=SR, output='sos'), x, axis=0)


def env(n, a, d):
    t = T(n); return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


class Bus:
    def __init__(self): self.x = np.zeros((N, 2))

    def add(self, t0, s, g=1.0, pan=0.0):
        i = int(round(t0 * SR))
        if s.ndim == 1:
            a = (pan + 1) * np.pi / 4; s = np.stack([s * np.cos(a), s * np.sin(a)], 1) * np.sqrt(2)
        if i < 0: s = s[-i:]; i = 0
        n = min(len(s), N - i)
        if n > 0: self.x[i:i + n] += s[:n] * g


music, drums, sfx, verb = Bus(), Bus(), Bus(), Bus()

# ---------------- instruments ----------------
def kick():
    n = int(0.55 * SR); t = T(n); f = 42 + 110 * np.exp(-t * 32)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.30)
    click = filt(rng.normal(0, 1, n), 'high', 2500) * env(n, 0.0003, 0.004) * 0.5
    return np.tanh(1.8 * (body + click))


def clap():
    n = int(0.35 * SR); x = filt(rng.normal(0, 1, n), 'band', [900, 3200]); e = np.zeros(n)
    for k, d in enumerate([0, 0.011, 0.022]):
        i = int(d * SR); e[i:] += env(n - i, 0.0005, 0.006 if k < 2 else 0.09)
    return x * e


def hat(open_=False):
    n = int((0.22 if open_ else 0.05) * SR)
    return filt(rng.normal(0, 1, n), 'high', 7000) * env(n, 0.0005, 0.06 if open_ else 0.012)


def saw(f, n, det=0.0):
    ph = np.cumsum(np.full(n, f * 2 ** (det / 1200)) / SR) + rng.uniform(0, 1)
    return 2 * (ph % 1) - 1


def pad_chord(notes, dur, cutoff):
    n = int(dur * SR); s = np.zeros((n, 2))
    for m in notes:
        for det, pan in ((-9, -0.6), (0, 0), (9, 0.6)):
            v = saw(mf(m), n, det); a = (pan + 1) * np.pi / 4
            s[:, 0] += v * np.cos(a); s[:, 1] += v * np.sin(a)
    s = filt(s, 'low', cutoff); t = T(n)
    e = np.minimum(1, t / 0.25) * np.minimum(1, (dur - t) / 0.3).clip(0, 1)
    return s * e[:, None] / len(notes)


def pluck(f, dur=0.5):
    n = int(dur * SR); t = T(n)
    return (np.sin(2 * np.pi * f * t + 1.3 * np.exp(-t / 0.05) * np.sin(2 * np.pi * f * 2 * t))) * env(n, 0.002, 0.16)


def bass(f, dur):
    n = int(dur * SR); t = T(n); v = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    return np.tanh(1.4 * v) * env(n, 0.004, dur * 0.6)


CH = [  # 2 bars each: (bass midi, pad notes)
    (45, [57, 60, 64, 67, 71]), (41, [57, 60, 64, 65, 67]), (48, [55, 59, 62, 64, 67]), (43, [55, 59, 62, 64, 66])]
chord_at = lambda beat: CH[int(beat // 8) % 4]
bt = lambda b: b * B

# ---------------- arrangement ----------------
TOTAL_B = int(D / B)
for c0 in range(0, TOTAL_B, 8):
    bm, notes = chord_at(c0)
    cutoff = 650 if c0 < 8 else (2200 if 40 <= c0 < 52 else 1500)
    music.add(bt(c0), pad_chord(notes, bt(8) + 0.3, cutoff), 0.20)

def groove(b0, b1, mode='half'):
    for b in np.arange(b0, b1, 0.5):
        bar = b % 4; bi = int(b // 4)
        k = (bar in (0, 1.5) or (bar == 2.75 and bi % 2)) if mode == 'half' else bar in (0, 1, 2, 3)
        if mode == 'half' and bar == 2.5 and bi % 2 == 0: k = True
        if k:
            drums.add(bt(b), kick(), 0.85); bm, _ = chord_at(b)
            music.add(bt(b), bass(mf(bm), bt(1.2)), 0.30)
        if bar == 2 or (mode == 'four' and bar in (1, 3)):
            drums.add(bt(b), clap(), 0.42 if mode == 'half' else 0.36); verb.add(bt(b), clap(), 0.25)
        drums.add(bt(b), hat(open_=(bar % 1 == 0.5 and bar == 3.5)), 0.16 if bar % 1 else 0.10, rng.uniform(-0.3, 0.3))
        if bi % 4 == 3 and bar >= 3:  # 16th hat roll into the next phrase
            drums.add(bt(b + 0.25), hat(), 0.12, 0.3)
    return

for b in np.arange(2, 6, 0.5): drums.add(bt(b), hat(), 0.07, rng.uniform(-0.3, 0.3))   # intro hats
groove(8, 38); groove(40, 50, 'four'); groove(52, 60); groove(62, 72)

# plucks: 8th-note arpeggio an octave up, with a dotted-8th echo
for b0, b1 in ((8, 38), (40, 50), (52, 60), (62, 74)):
    for i, b in enumerate(np.arange(b0, b1, 0.5)):
        _, notes = chord_at(b); m = notes[[0, 2, 4, 3, 1, 3, 4, 2][i % 8]] + 12
        s = pluck(mf(m)); g = 0.07 if b < 62 else 0.05
        music.add(bt(b), s, g, rng.uniform(-0.5, 0.5)); music.add(bt(b + 0.75), s, g * 0.35, 0.6); verb.add(bt(b), s, g * 0.6)

# sidechain pump: duck music under every kick
pump = np.ones(N)
for b0, b1, mode in ((8, 38, 'half'), (40, 50, 'four'), (52, 60, 'half'), (62, 72, 'half')):
    for b in np.arange(b0, b1, 0.5):
        bar = b % 4; bi = int(b // 4)
        k = (bar in (0, 1.5) or (bar == 2.75 and bi % 2) or (bar == 2.5 and bi % 2 == 0)) if mode == 'half' else bar in (0, 1, 2, 3)
        if k:
            i = int(bt(b) * SR); n = min(int(0.3 * SR), N - i); t = T(n)
            pump[i:i + n] = np.minimum(pump[i:i + n], 1 - 0.55 * np.exp(-t / 0.09))
music.x *= pump[:, None]

# glitch stutter on the music during the fast cuts: gate each 8th to its first 60%
for b in np.arange(50, 52, 0.5):
    i0 = int(bt(b) * SR); i1 = int(bt(b + 0.5) * SR); cut = i0 + int((i1 - i0) * 0.6)
    music.x[cut:i1] *= 0.08; drums.x[cut:i1] *= 0.1
# pre-drop and logo break: drums out, music filtered
for b0, b1 in ((38, 40), (60, 62)):
    i0, i1 = int(bt(b0) * SR), int(bt(b1) * SR)
    music.x[i0:i1] = filt(music.x[i0:i1], 'low', 500) * np.linspace(1, 0.4, i1 - i0)[:, None]
# outro fade
i0 = int(bt(72) * SR); music.x[i0:] *= np.linspace(1, 0, N - i0)[:, None] ** 1.5; drums.x[i0:] *= 0

# ---------------- transition sound design ----------------
def whoosh(dur=0.42):
    n = int(dur * SR); x = rng.normal(0, 1, (n, 2)); y = np.zeros((n, 2)); ch = int(0.008 * SR)
    for s0 in range(0, n, ch):
        c = s0 / n; f = 300 + 5200 * c ** 2
        y[s0:s0 + ch] = filt(x[s0:s0 + ch], 'band', [f * 0.6, min(f * 1.6, 20000)])
    e = (T(n) / dur) ** 2.2; pan = np.linspace(-0.8, 0.8, n); a = (pan + 1) * np.pi / 4
    y[:, 0] *= np.cos(a) * e; y[:, 1] *= np.sin(a) * e
    return y * 1.6


def hit():
    n = int(0.9 * SR); t = T(n); f = 34 + 50 * np.exp(-t * 18)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.28)
    crack = filt(rng.normal(0, 1, n), 'high', 1800) * env(n, 0.0005, 0.03)
    return np.tanh(1.5 * (boom + 0.55 * crack))


def riser(dur):
    n = int(dur * SR); t = T(n); c = t / dur; x = rng.normal(0, 1, n); y = np.zeros(n); ch = int(0.01 * SR)
    for s0 in range(0, n, ch):
        f = 400 + 6000 * c[s0] ** 2; y[s0:s0 + ch] = filt(x[s0:s0 + ch], 'band', [f * 0.7, min(f * 1.5, 20000)])
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (c * 2.5)) / SR) * 0.25
    return (y * 0.8 + tone) * c ** 2.5


def pop(i=0):
    n = int(0.09 * SR); t = T(n); f = (950 + 80 * (i % 5)) * np.exp(-t * 18) + 380
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.03)


def tick():
    n = int(0.03 * SR); return filt(rng.normal(0, 1, n), 'band', [2500, 6500]) * env(n, 0.0003, 0.004) + np.sin(2 * np.pi * 2100 * T(n)) * env(n, 0.0003, 0.006) * 0.5


def blip(i=0):
    n = int(0.08 * SR); f = [1320, 1568, 1760, 1976][i % 4]
    return np.sign(np.sin(2 * np.pi * f * T(n))) * 0.35 * env(n, 0.001, 0.025)


def swipe():
    n = int(0.32 * SR); return filt(rng.normal(0, 1, n), 'band', [2000, 7000]) * np.sin(np.pi * T(n) / 0.32) ** 2 * 0.8


def glitch():
    n = int(0.2 * SR); hold = int(SR / rng.uniform(900, 2500)); x = rng.normal(0, 1, n)
    x = np.repeat(x[::hold], hold)[:n]; sq = np.sign(np.sin(2 * np.pi * rng.uniform(180, 420) * T(n)))
    g = (np.floor(T(n) * 60) % 2 == 0).astype(float)
    return (0.6 * x + 0.5 * sq) * g * env(n, 0.001, 0.08)


def ding():
    n = int(1.0 * SR); t = T(n); f = 1568
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d) for r, a, d in ((1, 1, 0.5), (2.76, 0.4, 0.2), (5.4, 0.2, 0.08)))


def buzz():
    n = int(0.28 * SR); t = T(n); return np.tanh(3 * np.sign(np.sin(2 * np.pi * 92 * t)) * 0.7) * env(n, 0.002, 0.12)


def shimmer():
    out = np.zeros(int(1.6 * SR))
    for k, m in enumerate([88, 91, 95, 100, 103]):
        s = ding_note(mf(m), 1.2); i = int(k * 0.05 * SR); out[i:i + len(s)] += s[:len(out) - i] * (0.5 - k * 0.06)
    return out


def ding_note(f, dur):
    n = int(dur * SR); t = T(n); return np.sin(2 * np.pi * f * t) * np.exp(-t / 0.35) + 0.3 * np.sin(2 * np.pi * f * 2.01 * t) * np.exp(-t / 0.15)


def subdrop():
    n = int(1.4 * SR); t = T(n); f = 30 + 40 * np.exp(-t * 3)
    return np.tanh(1.3 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(n, 0.003, 0.6)


def type_run(dur):
    k = int(dur / 0.045); out = np.zeros(int((dur + 0.05) * SR))
    for j in range(k):
        s = tick(); i = int(j * 0.045 * SR + rng.uniform(0, 0.01) * SR); out[i:i + len(s)] += s[:len(out) - i] * rng.uniform(0.5, 1)
    return out


for t in C['whoosh']:  sfx.add(t - 0.40, whoosh(0.42), 0.75); verb.add(t - 0.2, whoosh(0.2)[:, 0], 0.15)
for t in C['hit']:     sfx.add(t, hit(), 0.9); verb.add(t, hit(), 0.3)
for t0, t1 in C['riser']: sfx.add(t0, riser(t1 - t0), 0.32, 0.0)
for i, t in enumerate(C['pop']):   sfx.add(t, pop(i), 0.45, rng.uniform(-0.4, 0.4))
for t in C['tick']:    sfx.add(t, tick(), 0.4, rng.uniform(-0.3, 0.3))
for i, t in enumerate(C['blip']):  sfx.add(t, blip(i), 0.3, rng.uniform(-0.3, 0.3))
for t in C['swipe']:   sfx.add(t, swipe(), 0.45)
for t in C['glitch']:  sfx.add(t, glitch(), 0.55, rng.uniform(-0.5, 0.5))
for t in C['ding']:    sfx.add(t, ding(), 0.22); verb.add(t, ding(), 0.25)
for t in C['buzz']:    sfx.add(t, buzz(), 0.35)
for t in C['shimmer']: sfx.add(t, shimmer(), 0.25); verb.add(t, shimmer(), 0.4)
for t in C['sub']:     sfx.add(t, subdrop(), 0.7)
for t, d in C['type']: sfx.add(t, type_run(d), 0.28, 0.2)
for i, t in enumerate(C['roll']):  sfx.add(t, blip(i), 0.18, 0.0)

# ---------------- reverb send + master ----------------
n_ir = int(1.4 * SR); tt = T(n_ir)
ir = np.stack([rng.normal(0, 1, n_ir), rng.normal(0, 1, n_ir)], 1) * np.exp(-tt / 0.35)[:, None]
ir = filt(ir, 'low', 6000); ir /= np.sqrt((ir ** 2).sum(0))
wet = np.stack([fftconvolve(verb.x[:, k], ir[:, k])[:N] for k in range(2)], 1)

mix = music.x * 0.95 + drums.x * 0.62 + sfx.x * 1.0 + wet * 0.35
mix = filt(mix, 'high', 25)
mix = np.tanh(mix * 1.2) / np.tanh(1.2)            # gentle bus saturation
mix /= max(1e-6, np.max(np.abs(mix)) / 0.89)
w = wave.open(sys.argv[2], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
print('audio ok', sys.argv[2], {k: len(v) for k, v in C.items() if isinstance(v, list)})
