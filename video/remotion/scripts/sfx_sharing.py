# "Akun Claude sharing" (SharingClaude, 64.05s, 1922 frames @30fps): sparse DSP-designed SFX under the creator's VO.
# Reuses the sound designs from sfx_reducerlight.py (whoosh, sub boom, bloop, tick, chime, brush, shimmer).
# Usage: python3 sfx_sharing.py out.wav
import sys, os, numpy as np, wave
HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'sfx_reducerlight.py')).read().split('# ---------------- placement ----------------')[0]
exec(compile(src.replace('N = int(SR * 586 / 30)', 'N = int(SR * 64.05)'), 'designs', 'exec'))
N = int(SR * 64.05)
out = np.zeros((N + SR * 3, 2))
def put(sec, st, g):
    i = int(sec * SR); out[i:i + len(st)] += st * g
# (scene-transition whooshes removed on request: scene changes are silent)

# hook: weight on "sharing", the "3" lands
for k in range(5): put(1.29 + 0.13 + k * 0.13, bloop(), 0.16)
# risiko 1
put(9.97, tick(0.0), 0.22)                      # price lands
for k in range(5): put(10.87 + k * 0.13, bloop(), 0.16)
put(14.09, tick(0.2), 0.24)                     # US$4 each
put(22.95, sub_boom(60, 34, 0.9, 0.2, 0.25), 0.40)   # limit hit
# risiko 2
for t in (28.29, 30.65, 31.29): put(t, bloop(), 0.20)
put(32.85, chime((1046.5, 1568.0)), 0.16)       # memory active
put(38.97, brush(), 0.22)                       # mismatched answer
# risiko 3
for t in (42.5, 43.0, 43.6, 44.1): put(t, tick(0.0), 0.16)
put(46.85, bloop(), 0.22)                       # someone else gets in
put(47.9, sub_boom(66, 36, 0.9, 0.2, 0.25), 0.38)  # PENTING
# rangkuman
put(51.5, chime((1568.0, 2093.0), 0.05), 0.16)  # hemat
for t in (54.49, 55.05, 55.49): put(t, tick(0.0), 0.22)
# akun pribadi
put(58.0, thump(), 0.28)
put(58.83, chime((1046.5, 1568.0, 2093.0), 0.06), 0.20)  # jelas: check
# end card
put(60.67, sub_boom(78, 40, 1.0, 0.22, 0.28), 0.40); put(60.8, shimmer(0.6, 14), 0.14)

mix = out[:N]
mix = np.stack([hp(mix[:, c], 28) for c in range(2)], 1)
mix = np.tanh(1.3 * mix / (np.abs(mix).max() + 1e-9)) / np.tanh(1.3)
pcm = (mix * 32767 * 0.89).astype(np.int16)
w = wave.open(sys.argv[1], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
print('sharing sfx ok')
