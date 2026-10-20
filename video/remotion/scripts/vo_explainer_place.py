# Lay the explainer VO lines end to end (light 1.04x tempo, short gaps) and write the timeline the composition reads:
# public/explainer-vo.wav + src/explainer/timeline.json (scene + line start/end in seconds, total frames).
import numpy as np, wave, subprocess, os, json
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
SR = 48000; D = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
TEMPO, LINE_GAP, SCENE_GAP, LEAD, TAIL = 1.04, 0.22, 0.38, 0.35, 2.2
script = json.load(open(f'{D}/src/explainer/script.json'))
def load(p):
    raw = subprocess.run([FF, '-loglevel', 'error', '-i', p, '-af', f'atempo={TEMPO}', '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.int16).astype(float) / 32768
    blk = int(SR * 0.01); e = np.sqrt(np.mean(a[:len(a) // blk * blk].reshape(-1, blk) ** 2, 1)); on = np.where(e > 0.01)[0]
    return a[max(0, on[0] * blk - int(0.02 * SR)):(on[-1] + 1) * blk + int(0.06 * SR)]
t = LEAD; n = 0; pieces = []; scenes = []
for si, sc in enumerate(script['scenes']):
    if si: t += SCENE_GAP
    s0 = t; lines = []
    for li, ln in enumerate(sc['lines']):
        if li: t += LINE_GAP
        n += 1; a = load(f'{D}/sfx/vo/explainer/line{n:02d}.wav')
        pieces.append((t, a)); lines.append({'n': n, 'start': round(t, 3), 'end': round(t + len(a) / SR, 3), 'en': ln['en'], 'id': ln['id']})
        t += len(a) / SR
    scenes.append({'name': sc['name'], 'start': round(s0, 3), 'end': round(t, 3), 'lines': lines})
total = t + TAIL; frames = int(np.ceil(total * 30))
for k in range(len(scenes) - 1): scenes[k]['end'] = scenes[k + 1]['start']  # scenes butt up against each other
scenes[-1]['end'] = round(frames / 30, 3)
out = np.zeros(int(frames / 30 * SR) + SR)
for st, a in pieces: i = int(st * SR); out[i:i + len(a)] += a
out = out[:int(frames / 30 * SR)]
st2 = np.stack([out, out], 1); pcm = (st2 / np.abs(st2).max() * 32767 * 0.9).astype(np.int16)
w = wave.open('/tmp/claude-0/exp_vo_raw.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
subprocess.run([FF, '-loglevel', 'error', '-y', '-i', '/tmp/claude-0/exp_vo_raw.wav', '-af',
    'highpass=f=80,equalizer=f=3500:t=q:w=1.2:g=2.5,acompressor=threshold=-20dB:ratio=3:attack=6:release=120,loudnorm=I=-16:TP=-1.5',
    '-ar', str(SR), f'{D}/public/explainer-vo.wav'], check=True)
json.dump({'fps': 30, 'frames': frames, 'scenes': scenes}, open(f'{D}/src/explainer/timeline.json', 'w'), ensure_ascii=False, indent=1)
for s in scenes: print(f"{s['name']:9s} {s['start']:6.2f} -> {s['end']:6.2f}")
print('total', round(frames / 30, 2), 's,', frames, 'frames')
