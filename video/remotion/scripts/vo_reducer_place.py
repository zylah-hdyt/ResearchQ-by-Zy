# Place an English VO line set on the ReducerLight timeline (520 frames = 17.33s).
# Each line is trimmed to its speech and, only if it overruns its slot, sped up (max 1.15x, pauses tightened first).
# Usage: python3 vo_reducer_place.py <voice_dir_under_sfx/vo> <out.wav>
import numpy as np, wave, subprocess, os, sys
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
SR = 48000; N = int(SR * 520 / 30)
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
VDIR, OUT = sys.argv[1], sys.argv[2]
def load(p, tempo=1.0):
    af = f'atempo={tempo:.4f}' if abs(tempo - 1) > 1e-3 else 'anull'
    raw = subprocess.run([FF, '-loglevel', 'error', '-i', p, '-af', af, '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(float) / 32768
def env(a):
    blk = int(SR * 0.01); return blk, np.sqrt(np.mean(a[:len(a) // blk * blk].reshape(-1, blk) ** 2, 1))
def trim(a):
    blk, e = env(a); on = np.where(e > 0.01)[0]
    return a[max(0, on[0] * blk - int(0.03 * SR)):min(len(a), (on[-1] + 1) * blk + int(0.10 * SR))]
def tighten(a, maxgap=0.12):
    blk, e = env(a); out = []; run = 0
    for k, q in enumerate(e < 0.006):
        run = run + 1 if q else 0
        if q and run * 0.01 > maxgap: continue
        out.append(a[k * blk:(k + 1) * blk])
    return np.concatenate(out)
SLOTS = [(0.05, 2.30), (2.32, 6.02), (6.10, 7.90), (7.95, 10.05), (10.10, 11.00), (11.05, 13.15), (13.20, 17.20)]
out = np.zeros(N)
for ln, (st, en) in enumerate(SLOTS, 1):
    p = f'{D}/sfx/vo/{VDIR}/line{ln}.wav'
    a = trim(load(p)); win = en - st
    if len(a) / SR > win: a = tighten(a)
    if len(a) / SR > win:
        tempo = min(1.15, len(a) / SR / win); a = trim(load(p, tempo)); a = tighten(a) if len(a) / SR > win else a
    i = int(st * SR); n = min(len(a), N - i); out[i:i + n] += a[:n]
    print(f'line {ln}: {st:.2f}s -> {st + len(a) / SR:.2f}s (slot ends {en:.2f})')
st2 = np.stack([out, out], 1)
pcm = (st2 / np.abs(st2).max() * 32767 * 0.9).astype(np.int16)
w = wave.open('/tmp/claude-0/vo_raw.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
subprocess.run([FF, '-loglevel', 'error', '-y', '-i', '/tmp/claude-0/vo_raw.wav', '-af',
    'highpass=f=80,equalizer=f=3500:t=q:w=1.2:g=2.5,acompressor=threshold=-20dB:ratio=3:attack=6:release=120,loudnorm=I=-16:TP=-1.5',
    '-ar', str(SR), OUT], check=True)
print('vo placed ->', OUT)
