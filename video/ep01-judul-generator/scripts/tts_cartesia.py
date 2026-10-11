# Cartesia TTS voiceover: one WAV per line, fitted to its time window.
#   CARTESIA_API_KEY=... CARTESIA_VOICE_ID=... python scripts/tts_cartesia.py scripts/vo_ep01.json out/vo
# Optional: CARTESIA_MODEL (default sonic-3), CARTESIA_VERSION (default 2025-04-16).
# Needs network access to api.cartesia.ai. Output manifest is the same format as tts_azure.py,
# so scripts/mix_vo.py works unchanged.
import io, json, os, re, ssl, subprocess, sys, urllib.error, urllib.request, wave
import numpy as np

KEY = os.environ.get('CARTESIA_API_KEY')
VOICE = os.environ.get('CARTESIA_VOICE_ID')
MODEL = os.environ.get('CARTESIA_MODEL', 'sonic-3')
VERSION = os.environ.get('CARTESIA_VERSION', '2025-04-16')
if not KEY or not VOICE:
    sys.exit('CARTESIA_API_KEY dan CARTESIA_VOICE_ID wajib di-set')
CTX = ssl.create_default_context(cafile=os.environ.get('SSL_CERT_FILE') or None)
SR = 48000


def plain(ssml):
    # vo_ep01.json is written for SSML: use the pronunciation alias, turn breaks into pauses
    t = re.sub(r"<sub alias='([^']+)'>[^<]*</sub>", r'\1', ssml)
    t = re.sub(r"<break[^>]*/>", ' ', t)
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', '', t)).strip()


def synth(text, speed=None):
    body = {'model_id': MODEL, 'transcript': text, 'language': 'id',
            'voice': {'mode': 'id', 'id': VOICE},
            'output_format': {'container': 'wav', 'encoding': 'pcm_s16le', 'sample_rate': SR}}
    if speed:
        body['generation_config'] = {'speed': speed}
    req = urllib.request.Request('https://api.cartesia.ai/tts/bytes', data=json.dumps(body).encode(), method='POST',
                                 headers={'X-API-Key': KEY, 'Cartesia-Version': VERSION, 'Content-Type': 'application/json'})
    with urllib.request.urlopen(req, context=CTX, timeout=90) as r:
        w = wave.open(io.BytesIO(r.read()))
    return np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768


def trim(x, th=0.01):
    idx = np.where(np.abs(x) > th)[0]
    return x if len(idx) == 0 else x[max(0, idx[0] - int(0.02 * SR)):idx[-1] + int(0.06 * SR)]


def tempo(x, f):
    # fallback time-stretch (pitch preserved) when the API ignores the speed setting
    p = subprocess.run(['ffmpeg', '-v', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '1', '-i', '-',
                        '-filter:a', f'atempo={f:.3f}', '-f', 's16le', '-'],
                       input=(np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes(), capture_output=True, check=True)
    return np.frombuffer(p.stdout, dtype=np.int16).astype(np.float32) / 32768


cfg = json.load(open(sys.argv[1])); outdir = sys.argv[2]; os.makedirs(outdir, exist_ok=True)
manifest = []
for ln in cfg['lines']:
    text = plain(ln['ssml']); window = ln['end'] - ln['start']
    x = trim(synth(text)); dur = len(x) / SR; how = 'normal'
    if dur > window:
        f = min(1.3, dur / window * 1.03)
        try:
            y = trim(synth(text, round(f, 2)))
            if len(y) / SR < dur * 0.97:
                x, how = y, f'speed {f:.2f}'
        except urllib.error.HTTPError:
            pass
        if len(x) / SR > window:
            x = trim(tempo(x, min(1.3, len(x) / SR / window * 1.02))); how += ' + atempo'
        dur = len(x) / SR
    p = os.path.join(outdir, ln['id'] + '.wav')
    w = wave.open(p, 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()
    print(f"{ln['id']:4} {how:18} {dur:.2f}s / jendela {window:.2f}s  {'OK' if dur <= window + 0.05 else 'LEWAT'}")
    manifest.append({'id': ln['id'], 'start': ln['start'], 'file': p, 'dur': round(dur, 3)})
json.dump(manifest, open(os.path.join(outdir, 'manifest.json'), 'w'), indent=1)
