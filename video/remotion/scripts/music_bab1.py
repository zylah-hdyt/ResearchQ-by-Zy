# Problem Master BAB 1 (48s) — lo-fi edu music bed, 120 BPM (1 bar = 2s = 60 frames), key A minor / C major.
# Sections follow the scene grid: intro 0–4s · groove 4–36s (lift at 30s) · breakdown + riser 36–40s · CTA 40–48s with tail.
import numpy as np, wave, sys
from scipy.signal import butter, sosfilt
SR = 48000; DUR = 48.0; N = int(SR * DUR); BEAT = 0.5; BAR = 2.0
rng = np.random.default_rng(121)
T = lambda n: np.arange(n) / SR
mf = lambda m: 440 * 2 ** ((m - 69) / 12)
f2 = lambda x, k, f: sosfilt(butter(2, f, k, fs=SR, output="sos"), x)
def env(n, a, d): t = T(n); return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def put(buf, t0, s, g=1.0):
    i = int(t0 * SR); n = min(len(s), N - i)
    if n > 0 and i >= 0: buf[i:i + n] += s[:n] * g

# Am7 · Fmaj7 · Cmaj7 · G(add6) — one chord per bar
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 55, 59, 64], [55, 59, 62, 64]]
ROOT = [45, 41, 48, 43]
pad = np.zeros(N); pl = np.zeros(N); bass = np.zeros(N); kick = np.zeros(N); clap = np.zeros(N); hat = np.zeros(N); fx = np.zeros(N)
kenv = np.zeros(N)

nb = int(DUR / BAR)
for b in range(nb):
    t0 = b * BAR; ch = CH[b % 4]
    # pad: detuned saws, soft attack, overlaps into next bar
    n = int((BAR + 0.6) * SR); t = T(n)
    a = np.minimum(1, t / 0.35) * np.minimum(1, np.maximum(0, (BAR + 0.6 - t) / 0.6))
    s = sum(((t * mf(m) * d) % 1 * 2 - 1) for m in ch for d in (0.997, 1.003))
    put(pad, t0, s * a / 8)
    groove = 2 <= b < 18 or b >= 20
    lift = 15 <= b < 18
    # pluck arpeggio (8ths), quieter in intro, octave up in the lift section
    if b < 18 or b >= 20:
        seq = [0, 2, 1, 3, 2, 1, 3, 2]
        for k, ix in enumerate(seq):
            m = ch[ix] + (24 if lift and k % 2 else 12)
            n = int(0.45 * SR); t = T(n); fr = mf(m)
            s = (np.sin(2 * np.pi * fr * t) + 0.25 * np.sin(4 * np.pi * fr * t) * np.exp(-t / 0.05)) * env(n, 0.003, 0.16)
            sw = 0.03 if k % 2 else 0.0
            put(pl, t0 + k * 0.25 + sw, s, 0.5 if b < 2 else 1.0)
    if groove:
        for q in range(4):
            tb = t0 + q * BEAT
            # bass on beats 1 and 3, pickup on the "and" of 4
            if q in (0, 2):
                n = int(0.45 * SR); t = T(n); fr = mf(ROOT[b % 4])
                s = np.tanh(1.6 * np.sin(2 * np.pi * fr * t)) * env(n, 0.006, 0.28)
                put(bass, tb, s)
            # kick on 1 and 3, plus "and" of 2 every other bar
            if q in (0, 2):
                n = int(0.3 * SR); t = T(n); fr = 45 + 90 * np.exp(-t * 28)
                put(kick, tb, np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, 0.001, 0.12))
                put(kenv, tb, env(int(0.3 * SR), 0.001, 0.09))
            if q in (1, 3):
                n = int(0.18 * SR)
                put(clap, tb, f2(rng.normal(0, 1, n), "band", [900, 3200]) * env(n, 0.002, 0.045))
            # hats on 8ths (swung)
            for e in range(2):
                n = int(0.04 * SR)
                put(hat, tb + e * 0.25 + (0.03 if e else 0), f2(rng.normal(0, 1, n), "high", 7000) * env(n, 0.0005, 0.012), 0.6 if e else 1.0)
        if b % 2 == 1:
            n = int(0.3 * SR); t = T(n); fr = 45 + 90 * np.exp(-t * 28)
            put(kick, t0 + 1.25, np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, 0.001, 0.12), 0.7)
    n_b = int(0.45 * SR); t = T(n_b)
    if 18 <= b < 20:  # breakdown: soft bass pulse only on beat 1
        put(bass, t0, np.tanh(1.4 * np.sin(2 * np.pi * mf(ROOT[b % 4]) * t)) * env(n_b, 0.01, 0.4), 0.7)

# risers: into the first drop (2–4s) and into the CTA (52.5–55s)
def riser(t0, dur):
    n = int(dur * SR); t = T(n); x = rng.normal(0, 1, n); y = np.zeros(n); ch = int(0.01 * SR)
    for s0 in range(0, n, ch): y[s0:s0 + ch] = f2(x[s0:s0 + ch], "band", [400 + 5000 * (s0 / n) ** 2, 600 + 7000 * (s0 / n) ** 2])
    put(fx, t0, y * (t / dur) ** 2)
riser(2.0, 2.0); riser(37.5, 2.5)
# reverse-cymbal swells into the scene changes at 14 / 24 / 36 / 48s
for tc in (14, 20, 30, 34):
    n = int(0.8 * SR); t = T(n)
    put(fx, tc - 0.8, f2(rng.normal(0, 1, n), "high", 5000) * (t / 0.8) ** 3, 0.35)
# final chord ring-out after the CTA
n = int(3.5 * SR); t = T(n)
s = sum(np.sin(2 * np.pi * mf(m + 12) * t) for m in CH[0]) * env(n, 0.01, 1.2)
put(pad, 45.0, s / 4, 0.8)

# sidechain-ish ducking of pad/bass by the kick
duck = 1 - 0.35 * np.clip(kenv, 0, 1)
pad = f2(pad, "low", 1400) * duck
bass = f2(bass, "low", 400) * duck
pl = f2(pl, "low", 5000)
mix = pad * 0.55 + pl * 0.16 + bass * 0.42 + kick * 0.55 + clap * 0.10 + hat * 0.05 + fx * 0.12
# fade in / out
t = T(N); mix *= np.minimum(1, t / 0.3) * np.clip((DUR - t) / 1.8, 0, 1)
# light stereo widening: pluck panned via short delay
L = mix + pl * 0.04; R = mix + np.concatenate([np.zeros(int(0.012 * SR)), pl[: N - int(0.012 * SR)]]) * 0.04
L = f2(L, "high", 35); R = f2(R, "high", 35)
m = max(np.abs(L).max(), np.abs(R).max()); L /= m; R /= m
pcm = (np.stack([L, R], 1) * 32767 * 0.8).astype(np.int16)
w = wave.open(sys.argv[1], "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close(); print("music ok")
