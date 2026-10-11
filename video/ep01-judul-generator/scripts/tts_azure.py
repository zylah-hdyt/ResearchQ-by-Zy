# Azure TTS voiceover: one WAV per line, auto-fitted to its time window.
#   AZURE_SPEECH_KEY=... AZURE_SPEECH_REGION=southeastasia python scripts/tts_azure.py scripts/vo_ep01.json out/vo
# Needs network access to <region>.tts.speech.microsoft.com.
import io, json, math, os, ssl, sys, urllib.request, wave
import numpy as np

KEY = os.environ.get('AZURE_SPEECH_KEY')
REGION = os.environ.get('AZURE_SPEECH_REGION', 'southeastasia')
if not KEY:
    sys.exit('AZURE_SPEECH_KEY belum di-set')
URL = f'https://{REGION}.tts.speech.microsoft.com/cognitiveservices/v1'
CTX = ssl.create_default_context(cafile=os.environ.get('SSL_CERT_FILE') or None)

cfg = json.load(open(sys.argv[1]))
outdir = sys.argv[2]
os.makedirs(outdir, exist_ok=True)
VOICE = cfg.get('voice', 'id-ID-ArdiNeural')


def synth(ssml_body, rate_pct, pitch='-2%'):
    ssml = (f"<speak version='1.0' xml:lang='id-ID' xmlns='http://www.w3.org/2001/10/synthesis'>"
            f"<voice name='{VOICE}'><prosody rate='{rate_pct:+d}%' pitch='{pitch}'>{ssml_body}</prosody></voice></speak>")
    req = urllib.request.Request(URL, data=ssml.encode('utf-8'), method='POST', headers={
        'Ocp-Apim-Subscription-Key': KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'riff-48khz-16bit-mono-pcm',
        'User-Agent': 'researchq-motion'})
    with urllib.request.urlopen(req, context=CTX, timeout=60) as r:
        data = r.read()
    w = wave.open(io.BytesIO(data))
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return x, w.getframerate()


def trim(x, sr, th=0.01):
    idx = np.where(np.abs(x) > th)[0]
    if len(idx) == 0:
        return x
    a = max(0, idx[0] - int(0.02 * sr)); b = min(len(x), idx[-1] + int(0.06 * sr))
    return x[a:b]


manifest = []
for ln in cfg['lines']:
    window = ln['end'] - ln['start']
    rate = 4  # sedikit lebih cepat dari default: terasa lebih natural untuk konten pendek
    x, sr = synth(ln['ssml'], rate); x = trim(x, sr)
    dur = len(x) / sr
    if dur > window:
        rate = min(35, rate + math.ceil((dur / window - 1) * 100) + 3)
        x, sr = synth(ln['ssml'], rate); x = trim(x, sr)
        dur = len(x) / sr
    p = os.path.join(outdir, ln['id'] + '.wav')
    w = wave.open(p, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
    fit = 'OK' if dur <= window + 0.05 else f'LEWAT {dur - window:.2f}s'
    print(f"{ln['id']:4} rate {rate:+d}%  {dur:.2f}s / jendela {window:.2f}s  {fit}")
    manifest.append({'id': ln['id'], 'start': ln['start'], 'file': p, 'dur': round(dur, 3)})
json.dump(manifest, open(os.path.join(outdir, 'manifest.json'), 'w'), indent=1)
