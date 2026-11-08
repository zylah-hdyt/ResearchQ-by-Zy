"""Word onsets by prefix-probing Whisper on each phrase (no native timestamps in sherpa whisper)."""
import sys, json, re, difflib, sherpa_onnx, soundfile as sf
S, P = sys.argv[1:3]
d = f'{S}/asr/sherpa-onnx-whisper-turbo'
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/turbo-encoder.int8.onnx", decoder=f"{d}/turbo-decoder.int8.onnx",
                                                 tokens=f"{d}/turbo-tokens.txt", language="en", task="transcribe", num_threads=2)
x, sr = sf.read(f'{P}/vf16.wav', dtype='float32')
SENT = json.load(open(f'{P}/sentences.json'))          # [[start, end, "text"], ...]
R0, R1 = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (0, len(SENT))
norm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
def dec(a, b):
    s = rec.create_stream(); s.accept_waveform(sr, x[int(a * sr):int(b * sr)]); rec.decode_stream(s); return s.result.text
def count(hyp, target):
    """how many target words are covered by the hypothesis (fuzzy, partial last word allowed)"""
    h = [norm(w) for w in hyp.split() if norm(w)]; n = 0; j = 0
    for k, tw in enumerate(target):
        if j >= len(h): break
        best = None
        for jj in range(j, min(len(h), j + 3)):
            if difflib.SequenceMatcher(None, h[jj], tw).ratio() > .6 or (len(h[jj]) >= 3 and tw.startswith(h[jj][:3])):
                best = jj; break
        if best is None: break
        n = k + 1; j = best + 1
    return n
out = []
for (a, b, text) in SENT[R0:R1]:
    words = text.split(); target = [norm(w) for w in words]; onset = [None] * len(words)
    t = a + .12
    while t <= b + .1:
        c = count(dec(max(0, a - .05), t), target)
        for k in range(c):
            if onset[k] is None: onset[k] = round(t - .14, 3)
        t += .1
    # fill gaps: interpolate missing onsets by character weight
    for k in range(len(words)):
        if onset[k] is None:
            prev = onset[k - 1] if k else a
            nxt = next((onset[m] for m in range(k + 1, len(words)) if onset[m] is not None), b)
            onset[k] = round(prev + (nxt - prev) * .5, 3)
    onset[0] = max(a - .02, min(onset[0], a + .05))
    for k in range(1, len(words)): onset[k] = max(onset[k], onset[k - 1] + .06)
    out.append({'s': a, 'e': b, 'words': [[w, o] for w, o in zip(words, onset)]})
    print(f'{a:6.2f}', ' '.join(f'{w}@{o:.2f}' for w, o in zip(words, onset)), flush=True)
json.dump(out, open(f'{P}/words_{R0}_{R1}.json', 'w'), ensure_ascii=False, indent=0)
