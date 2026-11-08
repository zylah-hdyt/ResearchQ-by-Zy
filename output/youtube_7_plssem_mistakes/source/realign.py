"""Re-time every word of the final VO: inside each synthesized chunk (known start/end), anchor Whisper prefix-decodes at
every pause and interpolate between anchors. Fixes number words (two/2, five percent/5%) that broke the first pass."""
import sys, json, re, difflib, sherpa_onnx, soundfile as sf, numpy as np
S = sys.argv[1]; SR = 24000
x_all, sr = sf.read('work/vo_raw_v3.wav', dtype='float32'); assert sr == SR
d = f'{S}/asr/sherpa-onnx-whisper-turbo'
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/turbo-encoder.int8.onnx", decoder=f"{d}/turbo-decoder.int8.onnx", tokens=f"{d}/turbo-tokens.txt", language='en', task="transcribe", num_threads=4)
L = json.load(open('lines.json')); W = json.load(open('work/words.json'))
nrm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
NW = {'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'ten': '10'}
NUM = {'0.2': ['0', 'point', '2', '02'], '155': ['155'], '5%': ['5'], '0.90': ['09', '090'], '0.85': ['085'], '0.97': ['097'], '0.70': ['07', '070'], '0.95': ['095'], '0.10': ['01', '010'], '0.65': ['065']}
def toks(w):
    k = w.rstrip('.,:?!')
    out = [nrm(p) for p in k.replace('-', ' ').split() if nrm(p)]
    out += [NW[t] for t in out if t in NW] + NUM.get(k, [])
    return out
def hyp_tokens(h):
    h = h.replace('%', ' percent').replace('-', ' ')
    return [nrm(p) for p in h.split() if nrm(p)]
def match(hw, w):
    return any(t and (hw == t or difflib.SequenceMatcher(None, hw, t).ratio() > .6 or (len(t) >= 3 and hw.startswith(t[:3])) or (len(hw) >= 3 and t.startswith(hw[:3]))) for t in toks(w))
def count(hyp, words):
    """words of the script covered by the hypothesis; tolerates 'a' heard as 'i' and one garbled word if the next one matches"""
    h = hyp_tokens(hyp); j = 0; n = 0; k = 0
    while k < len(words):
        w = words[k]; hit = next((jj for jj in range(j, min(len(h), j + 4)) if match(h[jj], w)), None)
        if hit is None and k + 1 < len(words):
            nxt = next((jj for jj in range(j, min(len(h), j + 5)) if match(h[jj], words[k + 1])), None)
            if nxt is not None and (nrm(w) in ('a', 'an', 'the') or nxt <= j + 2):
                n = k + 2; j = nxt + 1; k += 2; continue
        if hit is None: break
        j = hit + 1; n = k + 1; k += 1
    return n
def asr(x):
    n = int(len(x) * 16000 / SR); y = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype('float32')
    s = rec.create_stream(); s.accept_waveform(16000, y); rec.decode_stream(s); return s.result.text.strip()
def wt(w):
    b = len(nrm(w)) + 1.5
    if re.search(r'[,;]$', w): b += 3
    if re.search(r'[.:?!]$', w): b += 5
    if re.search(r'\d', w): b += 6
    return b
# same chunk grouping as the synthesis pass
chunks = []
for i, l in enumerate(L):
    if chunks and chunks[-1]['sec'] == l[0] and sum(len(L[j][1]) for j in chunks[-1]['lines']) + len(l[1]) <= 300: chunks[-1]['lines'].append(i)
    else: chunks.append({'sec': l[0], 'lines': [i]})
for c in chunks:
    a = W[c['lines'][0]]['words'][0][1]; b = W[c['lines'][-1]]['e'] + .05
    x = x_all[int(a * SR):int(b * SR)]; words = [w for i in c['lines'] for w in L[i][1].split()]
    h = int(.02 * SR); db = np.array([20 * np.log10(np.sqrt(np.mean(x[k * h:(k + 1) * h] ** 2)) + 1e-9) for k in range(len(x) // h)])
    gaps = []; k = 0
    while k < len(db):
        if db[k] < -38:
            j = k
            while j < len(db) and db[j] < -38: j += 1
            if (j - k) * .02 >= .08 and k > 5: gaps.append(((k + j) / 2 * .02, j * .02))
            k = j
        else: k += 1
    anchors = [(0.0, 0)]
    for mid, gend in gaps:
        n = count(asr(x[:int(mid * SR)]), words)
        if anchors[-1][1] < n < len(words): anchors.append((gend - .02, n))
    full = count(asr(x), words)
    anchors.append((len(x) / SR, len(words)))
    on = []
    for (ta, na), (tb, nb) in zip(anchors, anchors[1:]):
        seg = words[na:nb]; tot = sum(wt(w) for w in seg); acc = 0
        for w in seg: on.append(ta + (tb - ta) * acc / tot); acc += wt(w)
    pos = 0
    for i in c['lines']:
        n = len(L[i][1].split())
        W[i]['words'] = [[w, round(a + on[pos + q], 3)] for q, w in enumerate(L[i][1].split())]
        W[i]['s'] = W[i]['words'][0][1]
        if pos + n < len(on): W[i]['e'] = round(a + on[pos + n] - .05, 3)
        pos += n
    print(c['sec'], c['lines'][0], '-', c['lines'][-1], 'full-coverage %.2f' % (full / len(words)), 'anchors', len(anchors) - 2, 'of', len(gaps), 'pauses', flush=True)
json.dump(W, open('work/words.json', 'w'), ensure_ascii=False); print('done')
