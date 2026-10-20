# "Mahasiswa udik" (MahasiswaUdik, 48.5s, 1455 frames @30fps): very sparse SFX under the creator's VO — no scene-transition whooshes.
# Soft key ticks when the prompts are typed word by word, a pop for each chat bubble, a tick on send, one chime on "Beres",
# one soft thump on the struck-through "disuapin". Reuses the sound designs from sfx_reducerlight.py.
# Usage: python3 sfx_udik.py out.wav
import sys, os, re, json, numpy as np, wave
HERE = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(HERE, 'sfx_reducerlight.py')).read().split('# ---------------- placement ----------------')[0]
exec(compile(src.replace('N = int(SR * 586 / 30)', 'N = int(SR * 48.5)'), 'designs', 'exec'))
N = int(SR * 48.5)
out = np.zeros((N + SR * 3, 2))
def put(sec, st, g):
    i = int(sec * SR); out[i:i + len(st)] += st * g
W = json.loads(open(os.path.join(HERE, '..', 'src', 'udik', 'words.ts')).read().split('][] = ')[1].rsplit(';', 1)[0])
def at(word, n=0):
    c = 0
    for w, t in W:
        if re.sub(r'[.,?!]', '', w.lower()) == word:
            if c == n: return t
            c += 1
    raise KeyError(word)
def span(a, an, b, bn): 
    ia = next(i for i, (w, t) in enumerate(W) if t == at(a, an)); ib = next(i for i, (w, t) in enumerate(W) if t == at(b, bn))
    return W[ia:ib + 1]

# bubbles: the five questions and the friend's reply
for w, n in (('claude', 0), ('limitnya', 0), ('fiturnya', 0), ('harga', 0), ('apakah', 0), ('bro', 0)): put(at(w, n), bloop(), 0.18)
# typing: a soft tick per word, then send
for toks, send in ((span('claude', 1, 'penggunaan', 0), at('penggunaan') + 0.55), (span('gimana', 1, 'habis', 1), at('habis', 1) + 0.5), (span('apa', 2, 'lainnya', 0), at('lainnya') + 0.5)):
    for w, t in toks: put(t + 0.04, tick(0.0), 0.10)
    put(send, tick(0.2), 0.20)
put(at('beres'), chime((1046.5, 1568.0)), 0.16)          # Beres.
put(at('disuapin') + 0.05, thump(), 0.24)                # the spoon is crossed out
for w, t in span('belajar', 0, 'sendiri', 0): put(t + 0.04, tick(0.0), 0.10)
put(44.0, shimmer(0.5, 10), 0.12)                        # end card

mix = out[:N]
mix = np.stack([hp(mix[:, c], 28) for c in range(2)], 1)
mix = np.tanh(1.3 * mix / (np.abs(mix).max() + 1e-9)) / np.tanh(1.3)
pcm = (mix * 32767 * 0.89).astype(np.int16)
w = wave.open(sys.argv[1], 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
print('udik sfx ok')
