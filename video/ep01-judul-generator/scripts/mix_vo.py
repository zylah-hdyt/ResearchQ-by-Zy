# Place VO lines on the timeline, duck the SFX under speech, write a stereo mix.
#   python scripts/mix_vo.py out/vo/manifest.json project/sfx.wav out/mix.wav
# Then loudness + mux (TikTok ~ -14 LUFS):
#   ffmpeg -i out/mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=9 -ar 48000 out/mix_norm.wav
#   ffmpeg -i video.mp4 -i out/mix_norm.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest final.mp4
import json, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, resample_poly


def read(p):
    w = wave.open(p); sr = w.getframerate(); ch = w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return (x.reshape(-1, ch) if ch > 1 else x[:, None]), sr


man = json.load(open(sys.argv[1]))
sfx, SR = read(sys.argv[2])
if sfx.shape[1] == 1:
    sfx = np.repeat(sfx, 2, 1)
N = len(sfx)
vo = np.zeros(N, np.float32)
for m in man:
    x, sr = read(m['file']); x = x[:, 0]
    if sr != SR:
        x = resample_poly(x, SR, sr).astype(np.float32)
    i = int(m['start'] * SR); n = min(len(x), N - i)
    vo[i:i + n] += x[:n]

# voice polish: gentle high-pass, presence lift, soft compression
hp = butter(2, 80, 'high', fs=SR, output='sos'); vo = sosfilt(hp, vo)
pres = sosfilt(butter(2, [2500, 6000], 'band', fs=SR, output='sos'), vo); vo = vo + 0.18 * pres
peak = np.max(np.abs(vo)) or 1; vo = vo / peak
vo = np.tanh(1.4 * vo) / np.tanh(1.4)

# ducking: SFX -7 dB while voice is active (smoothed envelope)
env = np.abs(vo); k = int(0.04 * SR)
env = np.convolve(env, np.ones(k) / k, 'same')
act = (env > 0.02).astype(np.float32)
sm = int(0.12 * SR); act = np.convolve(act, np.ones(sm) / sm, 'same')
duck = 1 - 0.55 * np.clip(act, 0, 1)

mix = sfx * duck[:, None] * 0.9 + np.stack([vo, vo], 1) * 0.8
mix /= max(1e-6, np.max(np.abs(mix)) / 0.89)
w = wave.open(sys.argv[3], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
w.writeframes((mix * 32767).astype(np.int16).tobytes()); w.close()
print('mix ok', sys.argv[3])
