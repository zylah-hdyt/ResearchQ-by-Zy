"""Natural VO: synthesize 2-3 lines at a time (flowing intonation) with the full ZipVoice model, then time every word
by anchoring Whisper prefix-decodes at each pause inside the chunk. Writes work/vo_raw_v3.wav and work/words.json."""
import sys, json, re, random, difflib, sherpa_onnx, soundfile as sf, numpy as np
S = sys.argv[1]; SR = 24000
M = f'{S}/tts/zvf/sherpa-onnx-zipvoice-zh-en-emilia'; LEX = f'{S}/tts/zv/sherpa-onnx-zipvoice-distill-int8-zh-en-emilia/lexicon.txt'
cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(zipvoice=sherpa_onnx.OfflineTtsZipvoiceModelConfig(
    tokens=f'{M}/tokens.txt', encoder=f'{M}/text_encoder.onnx', decoder=f'{M}/fm_decoder.onnx', vocoder=f'{S}/tts/zv/vocos_24khz.onnx',
    data_dir=f'{M}/espeak-ng-data', lexicon=LEX), num_threads=4))
tts = sherpa_onnx.OfflineTts(cfg); ref, rsr = sf.read(f'{S}/ref3/prompt_pad.wav', dtype='float32')
PT = "R square, F square, and Q square may sound similar, but they measure different things."
d = f'{S}/asr/sherpa-onnx-whisper-turbo'
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/turbo-encoder.int8.onnx", decoder=f"{d}/turbo-decoder.int8.onnx", tokens=f"{d}/turbo-tokens.txt", language='en', task="transcribe", num_threads=4)
L = json.load(open('lines.json'))
nrm = lambda w: re.sub(r'[^a-z0-9]', '', w.lower())
def asr(x):
    n = int(len(x) * 16000 / SR); y = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype('float32')
    s = rec.create_stream(); s.accept_waveform(16000, y); rec.decode_stream(s); return s.result.text.strip()
NUM = {'0.2': 'zero point two', '155': 'one hundred fifty five', '5%': 'five percent', '0.90': 'zero point nine', '0.85': 'zero point eight five', '0.97': 'zero point nine seven',
       '0.70': 'zero point seven', '0.95': 'zero point nine five', '0.10': 'zero point one', '0.65': 'zero point six five'}
def spoken(w):  # how Whisper may write each script word
    k = w.rstrip('.,:?!')
    return [nrm(x) for x in NUM.get(k, k).replace('-', ' ').split()] if k in NUM else [nrm(x) for x in w.replace('-', ' ').split() if nrm(x)]
def count(hyp, words):
    """how many script words are covered by the hypothesis (fuzzy, tolerant of numbers/acronyms)"""
    h = [nrm(x) for x in re.sub(r'(\d)\.(\d)', r'\1point\2', hyp).replace('-', ' ').split() if nrm(x)]; j = 0; n = 0
    for k, w in enumerate(words):
        toks = spoken(w); ok = False
        for jj in range(j, min(len(h), j + 4)):
            if any(difflib.SequenceMatcher(None, h[jj], t).ratio() > .6 or h[jj].startswith(t[:3]) or t.startswith(h[jj][:3]) for t in toks if t):
                ok = True; j = jj + 1; break
            if nrm(w.rstrip('.,')) and re.sub(r'\D', '', w) and re.sub(r'\D', '', w) in h[jj]: ok = True; j = jj + 1; break
        if not ok: break
        n = k + 1
    return n
def wt(w):
    b = len(nrm(w)) + 1.5
    if re.search(r'[,;]$', w): b += 3
    if re.search(r'[.:?!]$', w): b += 5
    if re.search(r'\d', w): b += 6
    return b
# group lines: per section, chunks of consecutive lines up to ~300 chars (< 25 s of speech)
chunks = []
for i, l in enumerate(L):
    if chunks and chunks[-1]['sec'] == l[0] and sum(len(L[j][1]) for j in chunks[-1]['lines']) + len(l[1]) <= 300: chunks[-1]['lines'].append(i)
    else: chunks.append({'sec': l[0], 'lines': [i]})
rnd = random.Random(11); out = [np.zeros(int(.6 * SR))]; t = .6; WORDS = []
for ci, c in enumerate(chunks):
    text = ' '.join(L[i][2].replace('H.T.M.T.', 'H T M T').replace('G.O.F.', 'G O F') for i in c['lines'])
    words = [w for i in c['lines'] for w in L[i][1].split()]
    best = None
    for steps, speed in [(32, 1.0), (28, .98), (32, .96)]:
        g = sherpa_onnx.GenerationConfig(); g.reference_audio = ref.tolist(); g.reference_sample_rate = rsr; g.reference_text = PT; g.num_steps = steps; g.speed = speed
        a = tts.generate(text, g); x = np.array(a.samples, dtype=np.float32)
        idx = np.nonzero(np.abs(x) > .006)[0]; x = x[max(0, idx[0] - int(.03 * SR)):min(len(x), idx[-1] + int(.08 * SR))]
        heard = asr(x); cov = count(heard, words) / len(words)
        if best is None or cov > best[0]: best = (cov, x, heard)
        if cov > .97: break
    cov, x, heard = best
    # pauses inside the chunk -> anchors (time, words covered so far)
    h = int(.02 * SR); db = np.array([20 * np.log10(np.sqrt(np.mean(x[k * h:(k + 1) * h] ** 2)) + 1e-9) for k in range(len(x) // h)])
    gaps = []; k = 0
    while k < len(db):
        if db[k] < -38:
            j = k
            while j < len(db) and db[j] < -38: j += 1
            if (j - k) * .02 >= .10 and k > 5: gaps.append(((k + j) / 2 * .02, j * .02))
            k = j
        else: k += 1
    anchors = [(0.0, 0)]
    for mid, gend in gaps:
        n = count(asr(x[:int(mid * SR)]), words)
        if n > anchors[-1][1] and n < len(words): anchors.append((gend - .02, n))
    anchors.append((len(x) / SR, len(words)))
    onsets = []
    for (ta, na), (tb, nb) in zip(anchors, anchors[1:]):
        seg = words[na:nb]; tot = sum(wt(w) for w in seg); acc = 0
        for w in seg: onsets.append(ta + (tb - ta) * acc / tot); acc += wt(w)
    pos = 0
    for i in c['lines']:
        n = len(L[i][1].split()); ws = [[w, round(t + onsets[pos + q], 3)] for q, w in enumerate(L[i][1].split())]
        end = t + (onsets[pos + n] if pos + n < len(onsets) else len(x) / SR) - .05
        WORDS.append({'s': ws[0][1], 'e': round(end, 3), 'sec': L[i][0], 'id': L[i][3], 'words': ws}); pos += n
    out.append(x); t += len(x) / SR
    nxt = chunks[ci + 1]['sec'] if ci + 1 < len(chunks) else None
    gap = .8 if nxt is None else (1.3 + rnd.uniform(0, .15) if nxt != c['sec'] else .42 + rnd.uniform(0, .12))
    out.append(np.zeros(int(gap * SR))); t += gap
    print(ci, c['sec'], 'lines', c['lines'][0], '-', c['lines'][-1], 'dur %.1f' % (len(x) / SR), 'coverage %.2f' % cov, 'anchors', len(anchors) - 2, flush=True)
sf.write('work/vo_raw_v3.wav', np.concatenate(out), SR, subtype='FLOAT'); json.dump(WORDS, open('work/words.json', 'w'), ensure_ascii=False)
print('total %.1f s, lines %d' % (t, len(WORDS)))
