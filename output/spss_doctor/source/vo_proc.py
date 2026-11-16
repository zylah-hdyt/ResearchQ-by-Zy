"""Clean and tighten a raw phone voice-over: denoise, trim long pauses, then (ffmpeg) EQ/de-ess/compress/normalize."""
import sys, json, numpy as np, soundfile as sf, noisereduce as nr

src, out_wav, out_map = sys.argv[1:4]
x, sr = sf.read(src, dtype='float64')
if x.ndim > 1: x = x.mean(1)

# 1) noise reduction from the room tone at the head of the file
head = x[int(.15 * sr):int(1.25 * sr)]
y = nr.reduce_noise(y=x, sr=sr, y_noise=head, stationary=True, prop_decrease=.85, n_fft=2048)

# 2) find pauses (20 ms RMS below -42 dBFS for >= 180 ms)
h = int(.02 * sr); n = len(y) // h
rms = np.array([np.sqrt(np.mean(y[i * h:(i + 1) * h] ** 2)) for i in range(n)])
quiet = 20 * np.log10(rms + 1e-9) < -42
pauses = []; i = 0
while i < n:
    if quiet[i]:
        j = i
        while j < n and quiet[j]: j += 1
        if (j - i) * .02 >= .18: pauses.append((i * h, j * h))
        i = j
    else: i += 1

# 3) rebuild with tightened pauses (head .10 s, tail .45 s, inner .20-.30 s), 12 ms crossfades
fade = int(.012 * sr); segs = []; tmap = []; cur = 0; t_new = 0.0
def keep_len(a, b):
    d = (b - a) / sr
    if a == 0: return .10
    if b >= len(y) - h: return .45
    return min(d, .30 if d > .45 else .20)
for (a, b) in pauses:
    k = int(keep_len(a, b) * sr)
    if b - a <= k: continue
    left_end = a + k // 2; right_start = b - (k - k // 2)
    seg = y[cur:left_end].copy(); segs.append(seg); tmap.append([cur / sr, left_end / sr, t_new]); t_new += len(seg) / sr
    cur = right_start
seg = y[cur:]; segs.append(seg); tmap.append([cur / sr, len(y) / sr, t_new])
outv = segs[0]
for s in segs[1:]:
    f = min(fade, len(outv), len(s))
    w = np.linspace(0, 1, f)
    outv = np.concatenate([outv[:-f], outv[-f:] * (1 - w) + s[:f] * w, s[f:]])
sf.write(out_wav, outv, sr, subtype='FLOAT')
json.dump(tmap, open(out_map, 'w'))
print(f'in {len(y)/sr:.2f}s -> out {len(outv)/sr:.2f}s, {len(pauses)} pauses tightened')
