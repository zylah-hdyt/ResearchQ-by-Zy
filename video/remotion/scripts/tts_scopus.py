# Generate the VO (English or Indonesian, per the JSON "language") with Cartesia (reads CARTESIA_API_KEY from env; key is never written to disk),
# place lines sequentially from their earliest start, and write vo.wav + timing JSON for the subtitles.
#   python scripts/tts_scopus.py scripts/vo_scopus_en.json <workdir> public/scopus-vo-en.wav src/scopus/subs-en.json
#   python scripts/tts_scopus.py scripts/vo_scopus_id.json <workdir> public/scopus-vo-id.wav src/scopus/subs-id.json
import json, os, sys, subprocess, urllib.request, wave, numpy as np
cfg = json.load(open(sys.argv[1])); work = sys.argv[2]; out_wav = sys.argv[3]; out_json = sys.argv[4]
os.makedirs(work, exist_ok=True); SR = 44100; TOTAL = 1342 / 30
LANG = cfg.get("language", "en")
VOICE = os.environ[cfg["voice"][4:]] if cfg["voice"].startswith("env:") else cfg["voice"]
def tts(text, path):
    body = {"model_id": os.environ.get("CARTESIA_MODEL", "sonic-3"), "transcript": text, "language": LANG,
            "voice": {"mode": "id", "id": VOICE},
            "output_format": {"container": "wav", "encoding": "pcm_s16le", "sample_rate": SR}}
    req = urllib.request.Request("https://api.cartesia.ai/tts/bytes", data=json.dumps(body).encode(), method="POST",
        headers={"X-API-Key": os.environ["CARTESIA_API_KEY"], "Cartesia-Version": os.environ.get("CARTESIA_VERSION", "2025-04-16"), "Content-Type": "application/json"})
    open(path, "wb").write(urllib.request.urlopen(req, timeout=60).read())
def read(path):
    w = wave.open(path); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    if w.getnchannels() == 2: a = a.reshape(-1, 2).mean(1)
    return a
def trim(a, th=0.01):
    idx = np.where(np.abs(a) > th)[0]
    return a[max(0, idx[0] - 400): idx[-1] + 2000] if len(idx) else a
mix = np.zeros(int(SR * TOTAL)); t = 0.0; subs = []
for i, L in enumerate(cfg["lines"]):
    p = os.path.join(work, f"l{i:02d}.wav")
    if not os.path.exists(p): tts(L.get("say", L.get("en")), p)
    a = trim(read(p)); start = max(L["at"], t + 0.12)
    nxt = cfg["lines"][i + 1]["at"] if i + 1 < len(cfg["lines"]) else TOTAL - 0.3
    room = nxt - start - 0.08
    if len(a) / SR > room and room > 0:  # speed up (max 1.25×) if the line would overrun the next one
        f = min(1.25, (len(a) / SR) / room); q = p.replace(".wav", "_fast.wav")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", p, "-af", f"atempo={f:.3f}", q], check=True); a = trim(read(q))
    s = int(start * SR); n = min(len(a), len(mix) - s); mix[s:s + n] += a[:n]
    t = start + n / SR; subs.append({"start": round(start, 2), "end": round(t, 2), "vo": L.get("en", L.get("say")), "id": L["id"]})
    print(f"{i:02d} {start:6.2f}-{t:6.2f}  {L['id']}")
pcm = (np.clip(mix / max(1e-6, np.abs(mix).max()) * 0.9, -1, 1) * 32767).astype(np.int16)
w = wave.open(out_wav, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes()); w.close()
json.dump(subs, open(out_json, "w"), ensure_ascii=False, indent=1); print("ok", out_wav, out_json)
