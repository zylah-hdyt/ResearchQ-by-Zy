# Place the Cartesia English VO lines on the ReducerLight timeline (520 frames = 17.33s) -> public/reducerlight-vo.wav.
# Each line is trimmed to its speech, line 2 has its sentence pauses shortened, lines 2 and 4 get a light tempo lift.
import numpy as np, wave, subprocess, os
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
SR = 48000; N = int(SR * 520 / 30)
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
def load(p, tempo=1.0):
    af = f'atempo={tempo}' if tempo != 1.0 else 'anull'
    raw = subprocess.run([FF, '-loglevel', 'error', '-i', p, '-af', af, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(float) / 32768
def trim(a, pad=0.03):
    blk = int(SR * 0.01); e = np.sqrt(np.mean(a[:len(a) // blk * blk].reshape(-1, blk) ** 2, 1)); on = np.where(e > 0.01)[0]
    s = max(0, on[0] * blk - int(pad * SR)); t = min(len(a), (on[-1] + 1) * blk + int(0.12 * SR)); return a[s:t]
def shorten_pauses(a, maxgap=0.10):
    blk = int(SR * 0.01); e = np.sqrt(np.mean(a[:len(a) // blk * blk].reshape(-1, blk) ** 2, 1)); quiet = e < 0.006
    out = []; run = 0
    for k, q in enumerate(quiet):
        run = run + 1 if q else 0
        if q and run * 0.01 > maxgap: continue
        out.append(a[k * blk:(k + 1) * blk])
    return np.concatenate(out)
PLAN = [  # (line, start seconds, tempo, shorten pauses)
    (1, 0.05, 1.0, False), (2, 2.32, 1.12, True), (3, 6.10, 1.0, False), (4, 7.95, 1.08, False),
    (5, 10.10, 1.0, False), (6, 11.05, 1.0, False), (7, 13.20, 1.0, False),
]
out = np.zeros(N)
for ln, st, tempo, sp in PLAN:
    a = trim(load(f'{D}/sfx/vo/reducer_en/line{ln}.wav', tempo))
    if sp: a = shorten_pauses(a)
    i = int(st * SR); n = min(len(a), N - i); out[i:i + n] += a[:n]
    print(f'line {ln}: {st:.2f}s -> {st + len(a) / SR:.2f}s')
out = np.stack([out, out], 1)
pcm = (out / np.abs(out).max() * 32767 * 0.9).astype(np.int16)
w = wave.open('/tmp/claude-0/vo_raw.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
subprocess.run([FF, '-loglevel', 'error', '-y', '-i', '/tmp/claude-0/vo_raw.wav', '-af', 'highpass=f=80,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,loudnorm=I=-16:TP=-1.5', '-ar', str(SR), f'{D}/public/reducerlight-vo.wav'], check=True)
print('vo placed')
