# EP04 audio. 0-4 s is near silence (room tone, keyboard, mouse clicks, a reverse swell); the send button
# lands a hit + sub at 4 s and a 120 BPM cinematic-electronic bed starts (kick, clap, hats, sub bass, pad,
# high bell arps). Every transition/UI sound comes from window.__cues: whoosh into each card, a bell chime
# tuned to the current chord when a feature pill lights up, pops, ticks, zaps, dings.
#   node scripts/probe.cjs $PWD/project/index.html > out/cues.json
#   python scripts/sfx_ep04.py out/cues.json project/sfx.wav
import json, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

C = json.load(open(sys.argv[1]))['c']
SR = 48000; D = C.get('dur', 48.0); N = int(SR * D); rng = np.random.default_rng(404)
B = 60 / C.get('bpm', 120); S0 = C.get('start', 4.0)       # music starts on the send hit
T = lambda n: np.arange(n) / SR
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
bt = lambda b: S0 + b * B                                    # beat -> seconds, beat 0 = the hit


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
    n = int(0.5 * SR); t = T(n); f = 45 + 95 * np.exp(-t * 30)
    return np.tanh(1.6 * (np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.26) + filt(rng.normal(0, 1, n), 'high', 3000) * env(n, 0.0003, 0.003) * 0.4))


def clap():
    n = int(0.4 * SR); x = filt(rng.normal(0, 1, n), 'band', [1000, 3500]); e = np.zeros(n)
    for k, d in enumerate([0, 0.012, 0.024]):
        i = int(d * SR); e[i:] += env(n - i, 0.0005, 0.006 if k < 2 else 0.12)
    return x * e


def hat():
    n = int(0.05 * SR); return filt(rng.normal(0, 1, n), 'high', 8000) * env(n, 0.0005, 0.010)


def saw(f, n, det=0.0):
    ph = np.cumsum(np.full(n, f * 2 ** (det / 1200)) / SR) + rng.uniform(0, 1); return 2 * (ph % 1) - 1


def pad_chord(notes, dur, cutoff):
    n = int(dur * SR); s = np.zeros((n, 2))
    for m in notes:
        for det, pan in ((-8, -0.7), (0, 0), (8, 0.7)):
            v = saw(mf(m), n, det); a = (pan + 1) * np.pi / 4; s[:, 0] += v * np.cos(a); s[:, 1] += v * np.sin(a)
    s = filt(s, 'low', cutoff); t = T(n)
    return s * (np.minimum(1, t / 0.6) * np.clip(np.minimum(1, (dur - t) / 0.5), 0, 1))[:, None] / len(notes)


def bell(f, dur=1.2, bright=1.0):
    n = int(dur * SR); t = T(n)
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d) for r, a, d in ((1, 1, 0.45 * dur), (2.0, 0.35 * bright, 0.18), (3.01, 0.2 * bright, 0.08), (4.2, 0.1 * bright, 0.04)))


def bass(f, dur):
    n = int(dur * SR); t = T(n); return np.tanh(1.3 * (np.sin(2 * np.pi * f * t) + 0.2 * np.sin(4 * np.pi * f * t))) * env(n, 0.005, dur * 0.7)


CH = [(45, [57, 60, 64, 67, 71]), (41, [57, 60, 64, 65, 71]), (48, [55, 59, 62, 64, 67]), (40, [52, 55, 59, 62, 64])]
chord_at = lambda beat: CH[int(beat // 8) % 4]
TOTAL = int((D - S0) / B)            # beats after the hit (88)
END_GROOVE = 80                      # beat where the groove stops (CTA tail, 44 s)

# room tone in the quiet intro
n0 = int(S0 * SR); rt = filt(rng.normal(0, 1, (n0, 2)), 'low', 900) * 0.012
music.x[:n0] += rt

# pad (one chord per 2 bars), opens up during the features, wider for the recap
for c0 in range(0, TOTAL, 8):
    _, notes = chord_at(c0); cutoff = 900 if c0 < 11 else (2400 if c0 >= 64 else 1600)
    music.add(bt(c0), pad_chord(notes, 8 * B + 0.6, cutoff), 0.22)
music.add(bt(TOTAL - 8), pad_chord(chord_at(0)[1], 8 * B + 1.5, 1800), 0.05)

kicks = []
def groove(b0, b1, four=False):
    for b in np.arange(b0, b1, 0.5):
        bar = b % 4
        k = bar in (0, 1, 2, 3) if four else bar in (0, 1.5, 2.5)
        if k:
            drums.add(bt(b), kick(), 0.8); kicks.append(bt(b)); bm, _ = chord_at(b); music.add(bt(b), bass(mf(bm), B * 1.3), 0.28)
        if bar in (1, 3) and (four or bar == 3) or (not four and bar == 1 and int(b // 4) % 2):
            drums.add(bt(b), clap(), 0.36); verb.add(bt(b), clap(), 0.22)
        drums.add(bt(b), hat(), 0.12 if bar % 1 else 0.07, rng.uniform(-0.4, 0.4))
groove(11, 74); groove(74, END_GROOVE, four=True)   # features half-time, recap four-on-the-floor

# high bell arpeggio (the sparkly UI tones of the reference), 8ths, sparse
for i, b in enumerate(np.arange(11, END_GROOVE, 0.5)):
    if rng.uniform() < 0.55:
        _, notes = chord_at(b); m = notes[[4, 2, 3, 1, 4, 0, 2, 3][i % 8]] + 24
        s = bell(mf(m), 0.6, 0.6); music.add(bt(b), s, 0.05, rng.uniform(-0.6, 0.6)); verb.add(bt(b), s, 0.05)

# sidechain pump
pump = np.ones(N)
for tk in kicks:
    i = int(tk * SR); n = min(int(0.28 * SR), N - i); t = T(n); pump[i:i + n] = np.minimum(pump[i:i + n], 1 - 0.5 * np.exp(-t / 0.09))
music.x *= pump[:, None]
i0 = int(bt(END_GROOVE) * SR); music.x[i0:] *= np.linspace(1, 0.0, N - i0)[:, None] ** 1.2

# ---------------- UI + transition sound design ----------------
def whoosh(dur=0.45):
    n = int(dur * SR); x = rng.normal(0, 1, (n, 2)); y = np.zeros((n, 2)); ch = int(0.008 * SR)
    for s0 in range(0, n, ch):
        c = s0 / n; f = 250 + 4800 * c ** 2; y[s0:s0 + ch] = filt(x[s0:s0 + ch], 'band', [f * 0.6, min(f * 1.6, 20000)])
    e = (T(n) / dur) ** 2.2; pan = np.linspace(0.7, -0.7, n); a = (pan + 1) * np.pi / 4
    y[:, 0] *= np.cos(a) * e; y[:, 1] *= np.sin(a) * e; return y * 1.5


def hit():
    n = int(1.2 * SR); t = T(n); f = 32 + 55 * np.exp(-t * 14)
    return np.tanh(1.5 * (np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.002, 0.4) + 0.6 * filt(rng.normal(0, 1, n), 'high', 1500) * env(n, 0.0005, 0.05)))


def subdrop():
    n = int(1.6 * SR); t = T(n); f = 28 + 40 * np.exp(-t * 2.5); return np.tanh(1.2 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * env(n, 0.003, 0.7)


def swell(dur):
    n = int(dur * SR); x = rng.normal(0, 1, n); y = np.zeros(n); ch = int(0.01 * SR)
    for s0 in range(0, n, ch):
        c = s0 / n; y[s0:s0 + ch] = filt(x[s0:s0 + ch], 'low', 300 + 7000 * c ** 2)
    tone = sum(np.sin(2 * np.pi * mf(m) * T(n)) for m in (57, 64, 69)) / 3
    return (y * 0.7 + tone * 0.3) * (T(n) / dur) ** 3


def keypress():
    n = int(0.05 * SR); t = T(n)
    return filt(rng.normal(0, 1, n), 'band', [1200, 4500]) * env(n, 0.0005, 0.006) + np.sin(2 * np.pi * rng.uniform(170, 230) * t) * env(n, 0.001, 0.012) * 0.6


def click():
    n = int(0.04 * SR); t = T(n); return np.sin(2 * np.pi * 3200 * t) * env(n, 0.0003, 0.004) + filt(rng.normal(0, 1, n), 'high', 2000) * env(n, 0.0003, 0.003) * 0.6


def pop(i=0):
    n = int(0.1 * SR); t = T(n); f = (900 + 70 * (i % 5)) * np.exp(-t * 20) + 360; return np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.035)


def tick():
    n = int(0.03 * SR); return filt(rng.normal(0, 1, n), 'band', [2500, 6500]) * env(n, 0.0003, 0.004) + np.sin(2 * np.pi * 2300 * T(n)) * env(n, 0.0003, 0.006) * 0.5


def zap():
    n = int(0.16 * SR); t = T(n); f = 600 + 2600 * (t / 0.16) ** 2
    return np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * 0.3 * env(n, 0.002, 0.05)


def chime(t):
    beat = (t - S0) / B; _, notes = chord_at(max(0, beat))
    out = sum(bell(mf(notes[k] + 24), 1.4, 0.8) * g for k, g in ((4, 0.6), (2, 0.4)))
    top = bell(mf(notes[0] + 36), 0.8, 0.4); out[:len(top)] += top * 0.25
    return out


def ding():
    n = int(1.0 * SR); t = T(n); f = 1760
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d) for r, a, d in ((1, 1, 0.45), (2.76, 0.35, 0.18), (5.4, 0.15, 0.07)))


def shimmer():
    out = np.zeros(int(1.8 * SR))
    for k, m in enumerate([81, 84, 88, 93, 96]):
        s = bell(mf(m), 1.3, 0.5); i = int(k * 0.06 * SR); out[i:i + len(s)] += s[:len(out) - i] * (0.5 - k * 0.06)
    return out


for t in C['whoosh']: sfx.add(t - 0.42, whoosh(0.45), 0.6); verb.add(t - 0.2, whoosh(0.2)[:, 0], 0.12)
for t in C['hit']:    sfx.add(t, hit(), 0.9); verb.add(t, hit(), 0.35)
for t in C['sub']:    sfx.add(t, subdrop(), 0.6)
for t0, t1 in C['swell']: sfx.add(t0, swell(t1 - t0), 0.45)
for t in C['type']:   sfx.add(t, keypress(), 0.35, rng.uniform(-0.2, 0.2))
for t in C['click']:  sfx.add(t, click(), 0.45, 0.2)
for i, t in enumerate(C['pop']): sfx.add(t, pop(i), 0.4, rng.uniform(-0.4, 0.4))
for t in C['tick']:   sfx.add(t, tick(), 0.4, rng.uniform(-0.3, 0.3))
for t in C['zap']:    sfx.add(t, zap(), 0.25, rng.uniform(-0.5, 0.5))
for t in C['chime']:  s = chime(t); sfx.add(t, s, 0.2); verb.add(t, s, 0.3)
for t in C['ding']:   sfx.add(t, ding(), 0.16); verb.add(t, ding(), 0.2)
for t in C['shimmer']: sfx.add(t, shimmer(), 0.28); verb.add(t, shimmer(), 0.4)

# ---------------- reverb + master ----------------
n_ir = int(1.8 * SR); tt = T(n_ir)
ir = np.stack([rng.normal(0, 1, n_ir), rng.normal(0, 1, n_ir)], 1) * np.exp(-tt / 0.45)[:, None]
ir = filt(ir, 'low', 6500); ir /= np.sqrt((ir ** 2).sum(0))
wet = np.stack([fftconvolve(verb.x[:, k], ir[:, k])[:N] for k in range(2)], 1)
mix = music.x * 0.95 + drums.x * 0.6 + sfx.x + wet * 0.38
mix = filt(mix, 'high', 25); mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix /= max(1e-6, np.max(np.abs(mix)) / 0.89)
w = wave.open(sys.argv[2], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
print('audio ok', sys.argv[2], {k: len(v) for k, v in C.items() if isinstance(v, list)})
