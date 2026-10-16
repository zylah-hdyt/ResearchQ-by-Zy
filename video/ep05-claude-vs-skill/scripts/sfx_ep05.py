# EP05 audio: the owner's voice-over (leading silence trimmed, cleaned up) + cue-driven sound effects ducked
# under the voice. No music.
#   node scripts/probe.cjs $PWD/project/index.html > out/cues.json
#   python scripts/sfx_ep05.py out/cues.json assets/audio/vo_raw.m4a project/sfx.wav
import json, subprocess, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

C = json.load(open(sys.argv[1]))['c']
SR = 48000; D = C['dur']; N = int(SR * D); rng = np.random.default_rng(505)
TRIM = 2.55                      # seconds of silence before the first word in the raw recording
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


sfx, verb = Bus(), Bus()

def bell(f, dur=1.2, bright=1.0):
    n = int(dur * SR); t = T(n)
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d) for r, a, d in ((1, 1, 0.45 * dur), (2.0, 0.35 * bright, 0.18), (3.01, 0.2 * bright, 0.08), (4.2, 0.1 * bright, 0.04)))


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
    out = sum(bell(mf(m), 1.3, 0.8) * g for m, g in ((88, 0.6), (83, 0.4)))
    top = bell(mf(95), 0.8, 0.4); out[:len(top)] += top * 0.25
    return out


def ding():
    n = int(1.0 * SR); t = T(n); f = 1760
    return sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d) for r, a, d in ((1, 1, 0.45), (2.76, 0.35, 0.18), (5.4, 0.15, 0.07)))


def shimmer():
    out = np.zeros(int(1.8 * SR))
    for k, m in enumerate([81, 84, 88, 93, 96]):
        s = bell(mf(m), 1.3, 0.5); i = int(k * 0.06 * SR); out[i:i + len(s)] += s[:len(out) - i] * (0.5 - k * 0.06)
    return out



for t in C['whoosh']: sfx.add(t - 0.42, whoosh(0.45), 0.55); verb.add(t - 0.2, whoosh(0.2)[:, 0], 0.1)
for t in C['swoosh']: sfx.add(t - 0.2, whoosh(0.25), 0.45)
for t in C['type']:   sfx.add(t, keypress(), 0.3, rng.uniform(-0.2, 0.2))
for t in C['click']:  sfx.add(t, click(), 0.4, 0.2)
for i, t in enumerate(C['pop']): sfx.add(t, pop(i), 0.38, rng.uniform(-0.4, 0.4))
for t in C['tick']:   sfx.add(t, tick(), 0.35, rng.uniform(-0.3, 0.3))
for t in C['zap']:    sfx.add(t, zap(), 0.2, rng.uniform(-0.5, 0.5))
for t in C['chime']:  s = chime(t); sfx.add(t, s, 0.16); verb.add(t, s, 0.25)
for t in C['ding']:   sfx.add(t, ding(), 0.14); verb.add(t, ding(), 0.18)
for t in C['shimmer']: sfx.add(t, shimmer(), 0.22); verb.add(t, shimmer(), 0.3)

n_ir = int(1.6 * SR); tt = T(n_ir)
ir = np.stack([rng.normal(0, 1, n_ir), rng.normal(0, 1, n_ir)], 1) * np.exp(-tt / 0.4)[:, None]
ir = filt(ir, 'low', 6500); ir /= np.sqrt((ir ** 2).sum(0))
fxmix = sfx.x + 0.35 * np.stack([fftconvolve(verb.x[:, k], ir[:, k])[:N] for k in range(2)], 1)

# ---- voice-over: trim, clean (high-pass, gentle compression), centre ----
raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', str(TRIM), '-t', str(D), '-i', sys.argv[2], '-ac', '1', '-ar', str(SR),
                      '-af', 'highpass=f=80,lowpass=f=15000,acompressor=threshold=-22dB:ratio=3:attack=8:release=160:makeup=3',
                      '-f', 's16le', '-'], capture_output=True, check=True).stdout
vo = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
vo = np.pad(vo, (0, max(0, N - len(vo))))[:N]
vo /= max(1e-6, np.max(np.abs(vo))) / 0.9

# duck SFX by ~7 dB while the voice is active (smoothed envelope)
e = np.convolve(np.abs(vo), np.ones(int(0.03 * SR)) / int(0.03 * SR), 'same')
act = np.convolve((e > 0.03).astype(np.float32), np.ones(int(0.15 * SR)) / int(0.15 * SR), 'same')
duck = 1 - 0.55 * np.clip(act, 0, 1)
mix = np.stack([vo, vo], 1) * 0.85 + fxmix * duck[:, None] * 0.8
mix = filt(mix, 'high', 25)
mix /= max(1e-6, np.max(np.abs(mix)) / 0.89)
w = wave.open(sys.argv[3], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
print('audio ok', sys.argv[3], {k: len(v) for k, v in C.items() if isinstance(v, list)})
