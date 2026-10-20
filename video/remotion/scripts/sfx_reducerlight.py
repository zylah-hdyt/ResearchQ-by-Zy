# AI Detection Reducer light ad (ReducerLight, 17.3s, 520 frames @30fps) — SFX sound design, built from scratch with DSP
# (no sample packs): layered whooshes with a moving band and stereo sweep, a riser into the drop at 6.0s, a sub-boom
# impact, a morph "bloop" (same one for all three cards), glass chimes and shimmer, all through a shared stereo reverb.
# Mixed to sit under the creator's VO + music. Usage: python3 sfx_reducerlight.py out.wav
import numpy as np, wave, sys
from scipy.signal import fftconvolve, butter, sosfilt

SR = 48000
N = int(SR * 520 / 30)
rng = np.random.default_rng(21)
T = lambda d: np.arange(int(d * SR)) / SR

def pink(n):
    X = np.fft.rfft(rng.standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR); f[0] = f[1]
    x = np.fft.irfft(X / np.sqrt(f), n); return x / np.abs(x).max()

def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)
def lp(x, fc, order=2): return sosfilt(butter(order, fc, btype="low", fs=SR, output="sos"), x)
def hp(x, fc, order=2): return sosfilt(butter(order, fc, btype="high", fs=SR, output="sos"), x)

def sweep_band(x, fc, bw_oct):
    """Moving gaussian band-pass over a noise signal (STFT, 75% overlap). fc: per-sample centre frequency."""
    n = len(x); W = 2048; H = W // 4; win = np.hanning(W)
    out = np.zeros(n + W); norm = np.zeros(n + W)
    xp = np.concatenate([x, np.zeros(W)])
    freqs = np.fft.rfftfreq(W, 1 / SR); lf = np.log2(np.maximum(freqs, 1))
    for i in range(0, n, H):
        j = min(i + W // 2, n - 1); c = fc[j]
        bw = bw_oct[j] if np.ndim(bw_oct) else bw_oct
        mask = np.exp(-0.5 * ((lf - np.log2(c)) / bw) ** 2)
        seg = np.fft.irfft(np.fft.rfft(xp[i:i + W] * win) * mask, W) * win
        out[i:i + W] += seg; norm[i:i + W] += win ** 2
    return out[:n] / np.maximum(norm[:n], 1e-6)

def pan(x, p):
    p = np.broadcast_to(p, x.shape); a = (p + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1)

def norm(x): return x / (np.abs(x).max() + 1e-9)

# shared reverb (stereo, decorrelated exponential-noise IR, darkened)
def make_ir(dur=1.6, tau=0.45):
    t = T(dur); ir = np.stack([lp(rng.standard_normal(len(t)), 6500) * np.exp(-t / tau) for _ in range(2)], 1)
    ir[: int(0.012 * SR)] *= np.linspace(0, 1, int(0.012 * SR))[:, None]
    return ir / np.sqrt((ir ** 2).sum(0))
IR = make_ir()
def verb(st, wet):
    w = np.stack([fftconvolve(st[:, c], IR[:, c])[: len(st) + len(IR) - 1] for c in range(2)], 1)
    d = np.zeros_like(w); d[: len(st)] = st
    return d * (1 - wet * 0.5) + w * wet

# ---------------- sound designs ----------------
def whoosh(dur=0.7, f0=220, f1=4200, peak=0.62, p0=-0.7, p1=0.7, reverse=False):
    t = T(dur); u = t / dur
    bell = np.exp(-0.5 * ((u - peak) / 0.22) ** 2)
    x = sweep_band(pink(len(t)), f0 * (f1 / f0) ** bell, 0.55)
    body = lp(pink(len(t)), 180) * 0.5                      # low air body
    env = bell ** 1.4
    y = norm((x + body) * env)
    st = pan(y, p0 + (p1 - p0) * u)
    st = verb(st, 0.18)
    return st[::-1].copy() if reverse else st

def sub_boom(f_a=68, f_b=34, dur=1.6, drop=0.35, tau=0.55, click=True):
    t = T(dur)
    f = f_b + (f_a - f_b) * np.exp(-t / (drop / 3))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + 0.22 * np.sin(2 * ph)
    env = np.minimum(1, t / 0.004) * np.exp(-t / tau)
    x = np.tanh(2.2 * x * env) / np.tanh(2.2)
    if click:
        c = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t / 0.004) * 0.35
        k = np.sin(2 * np.pi * 170 * t) * np.exp(-t / 0.03) * 0.4
        x = x + c + k
    return pan(norm(x), 0.0)

def impact(gain_tail=0.35):
    b = sub_boom()
    t = T(1.6)
    n = bp(rng.standard_normal(len(t)), 250, 4200) * np.exp(-t / 0.12)
    st = b * 0.9 + pan(norm(n), 0.0) * 0.45
    return verb(st, gain_tail)

def riser(dur=1.0):
    t = T(dur); u = t / dur
    x = sweep_band(pink(len(t)), 300 * (7000 / 300) ** u, 0.6 - 0.35 * u)
    f = 220 * (4.0 ** u); ph = 2 * np.pi * np.cumsum(f) / SR
    vib = 1 + (0.3 * u) * np.sin(2 * np.pi * (4 + 14 * u) * t)
    tone = (np.sin(ph) + np.sin(ph * 1.005)) * 0.25 * vib
    env = u ** 2.6
    y = norm((x + tone) * env)
    y[-int(0.012 * SR):] *= np.linspace(1, 0, int(0.012 * SR))
    st = pan(y, 0.35 * np.sin(2 * np.pi * 1.5 * t))
    return verb(st, 0.12)

def bell(f, dur=1.6, amp=1.0):
    t = T(dur); x = np.zeros_like(t)
    for m, a, tau in ((1, 1, 0.9), (2.0, 0.35, 0.5), (3.01, 0.18, 0.3), (4.2, 0.08, 0.18)):
        x += a * np.sin(2 * np.pi * f * m * t) * np.exp(-t / tau)
    return x * np.minimum(1, t / 0.002) * amp

def chime(notes=(1046.5, 1568.0), gap=0.07):
    out = np.zeros((int(2.2 * SR), 2))
    for k, f in enumerate(notes):
        b = pan(bell(f), (-0.25, 0.25)[k % 2]); i = int(k * gap * SR); out[i:i + len(b)] += b
    return verb(norm(out), 0.45)

def shimmer(dur=0.9, density=26):
    out = np.zeros((int((dur + 1.6) * SR), 2))
    scale = [2093, 2349, 2637, 3136, 3520, 4186, 4699]
    for k in range(density):
        tt = (k / density) ** 0.7 * dur; f = scale[rng.integers(len(scale))]
        b = pan(bell(f, 1.2, 0.25 + 0.75 * k / density), rng.uniform(-0.8, 0.8)); i = int(tt * SR); out[i:i + len(b)] += b
    return verb(norm(out), 0.6)

def tick(p=0.0):
    t = T(0.05)
    x = bp(rng.standard_normal(len(t)), 2000, 7000) * np.exp(-t / 0.0025) + np.sin(2 * np.pi * 1250 * t) * np.exp(-t / 0.012) * 0.5
    return verb(pan(norm(x), p), 0.1)

def bloop():
    t = T(0.35)
    f = 260 + 380 * (1 - np.exp(-t / 0.03)); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) * np.exp(-t / 0.06) + lp(rng.standard_normal(len(t)), 1500) * np.exp(-t / 0.035) * 0.35
    return verb(pan(norm(x), 0.0), 0.22)

def brush():
    t = T(0.28); u = t / 0.28
    x = sweep_band(rng.standard_normal(len(t)), 1800 * (2.2 ** u), 0.5) * np.sin(np.pi * u) ** 1.5
    return verb(pan(norm(x), -0.4 + 0.8 * u), 0.15)

def thump():
    return sub_boom(80, 46, 0.7, 0.18, 0.18, click=False)

# ---------------- placement ----------------
out = np.zeros((N + SR * 3, 2))
def put(frame, st, g):
    i = int(frame / 30 * SR); out[i:i + len(st)] += st * g
def put_end(frame, st, g):  # place so the sound ENDS at frame (for reversed / rising sounds)
    put(frame - len(st) / SR * 30, st, g)

for f, p in ((2, -0.2), (12, 0.2), (30, -0.1)): put(f, tick(p), 0.08)       # type ticks on the split words
put(49, tick(0.0), 0.12); put(49, sub_boom(56, 34, 1.0, 0.3, 0.35), 0.30)   # "AI?" lands with weight
put(66 - 0.62 * 0.7 * 30, whoosh(0.7), 0.45)                                # into the cards
for f in (70, 102, 136): put(f + 6, bloop(), 0.32)                          # same morph bloop x3
put(150, riser(1.0), 0.40)                                                  # riser into the drop
put(180, impact(), 0.75)                                                    # DROP
put(214, brush(), 0.22)                                                     # AI-isms get struck
rw = whoosh(0.55, peak=0.8, reverse=True); put_end(241, rw, 0.40)           # suck into the orange flash
put(240, shimmer(0.8, 22), 0.20)                                            # glass world opens
put(278, chime((1046.5, 1568.0)), 0.30)                                     # HIGH -> LOW
put(300 - 0.62 * 0.5 * 30, whoosh(0.5, 300, 5000, p0=0.4, p1=-0.4), 0.35)   # icon
put(300, sub_boom(62, 36, 1.0, 0.25, 0.3), 0.30); put(302, chime((2093.0,)), 0.18)
put(371, shimmer(0.5, 12), 0.14)                                            # "natural."
put(390 - 0.62 * 0.6 * 30, whoosh(0.6, p0=0.6, p1=-0.6), 0.40)              # into the CTA
put(396, thump(), 0.30)                                                     # card settles
put(403, sub_boom(84, 44, 0.9, 0.2, 0.25), 0.55); put(403, chime((1568.0, 2093.0), 0.05), 0.22)  # Rp29.000

mix = out[:N]
mix = np.stack([hp(mix[:, c], 28) for c in range(2)], 1)
mix = np.tanh(1.4 * mix / (np.abs(mix).max() + 1e-9)) / np.tanh(1.4)       # gentle bus saturation / limiting
pcm = (mix * 32767 * 0.89).astype(np.int16)
w = wave.open(sys.argv[1], "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
print("reducerlight sfx (designed) ok")
