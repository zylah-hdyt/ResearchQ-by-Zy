"""Per-frame (60fps) mouth openness + width from the processed VO."""
import numpy as np, soundfile as sf, json, sys
from scipy.signal import butter, sosfiltfilt
P = sys.argv[1]; FPS = 60
x, sr = sf.read(f'{P}/work/vo_final.wav', dtype='float64'); x = x.mean(1) if x.ndim > 1 else x
v = sosfiltfilt(butter(4, [200, 3500], 'bandpass', fs=sr, output='sos'), x)      # voice band
hi = sosfiltfilt(butter(4, 2500, 'highpass', fs=sr, output='sos'), x)             # 'i/e/s' brightness
NF = int(len(x) / sr * FPS) + FPS * 3
win = int(.035 * sr); op = np.full(NF, -100.0); wd = np.zeros(NF)
for n in range(NF):
    c = int((n / FPS + .02) * sr)            # look 20 ms ahead: mouth leads sound slightly
    a, b = max(0, c - win // 2), min(len(x), c + win // 2)
    if b <= a: continue
    r = np.sqrt((v[a:b] ** 2).mean() + 1e-12); db = 20 * np.log10(r)
    op[n] = db
    wd[n] = np.clip(np.sqrt((hi[a:b] ** 2).mean()) / (r + 1e-9) * 2.2, 0, 1)
dbv = op.copy()
sp = dbv > -45                                         # speech frames
lo, hi_ = np.percentile(dbv[sp], 10), np.percentile(dbv[sp], 97)
# local mean over ~250 ms: open on syllable peaks, close in the dips between them
k = 15; loc = np.convolve(dbv, np.ones(k) / k, 'same')
rel = np.clip((dbv - loc + 5) / 9, 0, 1)                # syllable modulation
lev = np.clip((dbv - lo) / (hi_ - lo), 0, 1)            # overall loudness
op = np.where(sp, .25 * lev + .75 * rel * lev ** .5, 0)
print('db p10 %.1f p97 %.1f' % (lo, hi_))
# fast attack, ~70 ms release, then emphasise syllable peaks
sm = np.zeros(NF); s = 0
for n in range(NF):
    s = op[n] if op[n] > s else s + (op[n] - s) * .5
    sm[n] = s
sm = np.clip(sm, 0, 1)
wd = np.convolve(wd, np.ones(5) / 5, 'same')
json.dump({'o': [round(a, 2) for a in sm], 'w': [round(a, 2) for a in wd]}, open(f'{P}/lip/lip.json', 'w'))
print('frames', NF, 'mean open %.2f, frames open>0.5: %.0f%%' % (sm.mean(), 100 * (sm > .5).mean()))
