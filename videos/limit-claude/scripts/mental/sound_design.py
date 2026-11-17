"""Procedural score + SFX for the cinematic Mental video (numpy only).
Writes public/music_mental.wav (59 s, ducked under the VO) and public/sfx/cine/*.wav."""
import subprocess, wave
import numpy as np

SR = 48000
DUR = 59.0
rng = np.random.default_rng(7)

def write(path, x):
    x = np.clip(x, -1, 1)
    if x.ndim == 1: x = np.stack([x, x], 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def t_(d): return np.arange(int(d * SR)) / SR
def midi(n): return 440 * 2 ** ((n - 69) / 12)
def lp(x, cutoff):  # one-pole low-pass, vectorised via exponential smoothing in blocks
    a = np.exp(-2 * np.pi * cutoff / SR); y = np.empty_like(x); s = 0.0
    for i in range(0, len(x), 4096):
        seg = x[i:i + 4096]; out = np.empty_like(seg)
        for j, v in enumerate(seg): s = (1 - a) * v + a * s; out[j] = s
        y[i:i + 4096] = out
    return y

# ---------------- instruments ----------------
def piano(f, d=2.2, vel=1.0):
    t = t_(d)
    env = np.exp(-t * 2.2) * (1 - np.exp(-t * 400))
    x = sum(a * np.sin(2 * np.pi * f * k * t + k) * np.exp(-t * (1.5 + k * 0.9)) for k, a in [(1, 1), (2, .45), (3, .22), (4, .1)])
    return x * env * vel * 0.35

def pad(freqs, d, att=1.2, rel=1.5, bright=3):
    t = t_(d)
    env = np.minimum(1, t / att) * np.minimum(1, np.maximum(0, (d - t) / rel))
    x = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0.12):
            for k in range(1, bright + 1):
                x += np.sin(2 * np.pi * (f + det) * k * t + rng.random() * 6) / (k * 1.6)
    return x * env / (len(freqs) * 2 * bright) * 0.9

def kick(d=0.45):
    t = t_(d); f = 48 + 70 * np.exp(-t * 28)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) * 0.8

def place(buf, x, at, gain=1.0):
    i = int(at * SR); j = min(len(buf), i + len(x))
    if i < len(buf): buf[i:j] += x[: j - i] * gain

# ---------------- score ----------------
N = int(DUR * SR)
L = np.zeros(N); R = np.zeros(N)
BEAT = 60 / 72
CH = {'Am': [57, 60, 64], 'F': [53, 57, 60], 'C': [48, 55, 60, 64], 'G': [55, 59, 62], 'Dm': [50, 57, 62], 'E': [52, 56, 59]}

def section(t0, t1, prog, piano_on=True, arp=False, pad_gain=1.0, bright=3, oct_shift=0):
    t, i = t0, 0
    while t < t1 - 0.2:
        name = prog[i % len(prog)]; d = min(BEAT * 4, t1 - t)
        notes = [n + oct_shift for n in CH[name]]
        p = pad([midi(n - 12) for n in notes], d + 1.2, bright=bright) * pad_gain
        place(L, p, t, 0.9); place(R, p, t, 0.9)
        if piano_on:
            if arp:
                seq = notes + [notes[1] + 12, notes[2]] if len(notes) == 3 else notes + [notes[1] + 12]
                for k in range(8):
                    n = seq[k % len(seq)] + 12
                    place(L if k % 2 else R, piano(midi(n), 1.6, 0.55 + 0.1 * (k == 0)), t + k * BEAT / 2, 1.0)
                    place(R if k % 2 else L, piano(midi(n), 1.6, 0.25), t + k * BEAT / 2 + 0.012, 1.0)
            else:
                place(L, piano(midi(notes[0] + 12), 3.0, 0.7), t, 1); place(R, piano(midi(notes[2] + 12), 3.0, 0.45), t + BEAT * 2, 1)
        t += BEAT * 4; i += 1

# Act 1 · the problem (dark, sparse)
section(0.0, 14.45, ['Am', 'F', 'Am', 'E'], piano_on=True, pad_gain=0.8, bright=2)
# Act 2 · the truth (warm, moving)
section(14.45, 36.85, ['F', 'C', 'G', 'Am'], arp=True, pad_gain=1.0, bright=3)
# Act 3 · build
section(36.85, 49.45, ['F', 'C', 'G', 'Am'], arp=True, pad_gain=1.15, bright=4)
for b in np.arange(41.85, 49.3, BEAT):
    place(L, kick(), b, 0.55); place(R, kick(), b, 0.55)
sw = pad([midi(69), midi(72), midi(76)], 49.45 - 41.85, att=7.0, rel=0.3, bright=5)
place(L, sw, 41.85, 0.9); place(R, sw, 41.85, 0.9)
# the drop · warning
section(49.45, 54.05, ['Am', 'Dm'], piano_on=False, pad_gain=0.9, bright=2)
place(L, piano(midi(45), 4.0, 0.9), 49.45, 1); place(R, piano(midi(45), 4.0, 0.9), 49.45, 1)
# resolve · CTA
section(54.05, DUR, ['C', 'F', 'C'], arp=True, pad_gain=1.0, bright=3)

mix = np.stack([L, R], 1)
mix /= np.abs(mix).max() + 1e-9
# fade in/out
fade = np.ones(N); fade[: int(0.6 * SR)] = np.linspace(0, 1, int(0.6 * SR)); fade[-int(2.5 * SR):] = np.linspace(1, 0, int(2.5 * SR))
mix *= fade[:, None]

# duck under the VO: -6 dB when the voice is present (envelope from the processed VO)
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'public/vo_mental.wav', '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, np.int16).astype(np.float64) / 32768
vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
win = int(0.08 * SR)
env = np.sqrt(np.convolve(vo ** 2, np.ones(win) / win, 'same'))
speak = (env > 0.02).astype(float)
k = int(0.25 * SR); speak = np.convolve(speak, np.ones(k) / k, 'same')
gain = 1 - 0.5 * np.clip(speak, 0, 1)
mix *= gain[:, None]
write('public/music_mental.wav', mix * 0.5)

# ---------------- SFX ----------------
def noise(d): return rng.standard_normal(int(d * SR))
def env_ad(d, a, dec):
    t = t_(d); return np.minimum(1, t / a) * np.exp(-np.maximum(0, t - a) * dec)

def whoosh(d, f0, f1):
    n = noise(d); t = t_(d)
    sweep = np.sin(2 * np.pi * np.cumsum(np.linspace(f0, f1, len(t))) / SR)
    shape = np.sin(np.pi * t / d) ** 2
    return lp(n, 2500) * shape * 0.9 + sweep * shape * 0.05

def boom(d=2.2):
    t = t_(d); f = 32 + 60 * np.exp(-t * 6)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) + lp(noise(d), 300) * np.exp(-t * 6) * 0.6) * 0.9

def riser(d=2.0):
    t = t_(d); n = noise(d)
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (2 * t / d)) / SR)
    return (n * 0.5 + tone * 0.3) * (t / d) ** 2.4 * 0.8

def heartbeat():
    t = t_(0.9)
    beat = lambda o: np.sin(2 * np.pi * 52 * (t - o)) * np.exp(-np.maximum(0, t - o) * 18) * (t >= o)
    return (beat(0) + 0.7 * beat(0.22)) * 0.8

def tick():
    t = t_(0.08); return (np.sin(2 * np.pi * 3200 * t) * np.exp(-t * 120) + np.sin(2 * np.pi * 1500 * t) * np.exp(-t * 80) * 0.4) * 0.7

def notif():
    t = t_(0.5); a = np.sin(2 * np.pi * 1318 * t) * env_ad(0.5, 0.005, 14) * (t < .2)
    b = np.sin(2 * np.pi * 1760 * t) * env_ad(0.5, 0.005, 10) * (t >= .12)
    return (a + b) * 0.4

def chime(base=880):
    t = t_(2.5)
    x = sum(np.sin(2 * np.pi * base * r * t) * np.exp(-t * (1.6 + i)) / (i + 1) for i, r in enumerate([1, 2.01, 2.76, 4.07]))
    return x * (1 - np.exp(-t * 300)) * 0.35

def sparkle():
    t = t_(1.6); x = np.zeros_like(t)
    for i, f in enumerate([2093, 2637, 3136, 3951, 4186]):
        o = i * 0.07; x += np.sin(2 * np.pi * f * (t - o)) * np.exp(-np.maximum(0, t - o) * 5) * (t >= o)
    return x * 0.18

def scribble():
    d = 0.7; t = t_(d); n = noise(d)
    am = 0.5 + 0.5 * np.sin(2 * np.pi * 11 * t) ** 2
    return (n - lp(n, 1800)) * am * np.sin(np.pi * t / d) * 0.35

def step():
    t = t_(0.18); return (np.sin(2 * np.pi * 70 * t) * np.exp(-t * 30) + lp(noise(0.18), 900) * np.exp(-t * 40) * 0.6) * 0.7

def swell(d=1.6):
    t = t_(d); x = pad([midi(60), midi(64), midi(67), midi(72)], d, att=d * 0.9, rel=0.1, bright=4)
    return x * 2.2

def glitch():
    d = 0.3; t = t_(d); n = noise(d) * (np.sin(2 * np.pi * 37 * t) > 0)
    return np.round(n * 4) / 4 * np.exp(-t * 8) * 0.35

def thud():
    t = t_(0.6); return (np.sin(2 * np.pi * np.cumsum(60 + 90 * np.exp(-t * 25)) / SR) * np.exp(-t * 9) + lp(noise(0.6), 500) * np.exp(-t * 20) * 0.5) * 0.85

S = {
    'whoosh_soft': whoosh(0.9, 300, 900) * 0.6,
    'whoosh': whoosh(0.6, 200, 1400),
    'whoosh_fast': whoosh(0.35, 400, 2400),
    'boom': boom(), 'riser': riser(2.0), 'riser_short': riser(1.0), 'heartbeat': heartbeat(), 'tick': tick(),
    'notif': notif(), 'chime': chime(), 'chime_low': chime(587), 'sparkle': sparkle(), 'scribble': scribble(),
    'step': step(), 'swell': swell(), 'glitch': glitch(), 'thud': thud(),
}
for k, v in S.items():
    write(f'public/sfx/cine/{k}.wav', v / (np.abs(v).max() + 1e-9) * 0.9)
print('ok', len(S), 'sfx')
