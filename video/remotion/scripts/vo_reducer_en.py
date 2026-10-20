# English VO for the ReducerLight ad via Cartesia TTS (key from the CARTESIA_API_KEY env var only).
# One wav per line -> sfx/vo/<outdir>/lineN.wav, with a per-line emotion on sonic-3.
# Usage: python3 vo_reducer_en.py [voice_id] [outdir] [model] [only_lines e.g. 7 or 2,7]
import json, os, sys, urllib.request
VOICE = sys.argv[1] if len(sys.argv) > 1 else "a33f7a4c-100f-41cf-a1fd-5822e8fc253f"  # Lauren - Lively Narrator
OUTDIR = sys.argv[2] if len(sys.argv) > 2 else "reducer_en_v2"
MODEL = sys.argv[3] if len(sys.argv) > 3 else "sonic-3"
ONLY = {int(x) for x in sys.argv[4].split(",")} if len(sys.argv) > 4 else None
LINES = [
    ("Wrote your thesis with a little help from AI?", "curious"),
    ("Stiff sentences. Predictable patterns. Rising AI signals.", "serious"),
    ("So how do you make it sound like you?", "curious"),
    ("AI Detection Reducer cleans it all up.", "confident"),
    ("ResearchQ.", "proud"),
    ("Your writing, at its most natural.", "warm"),
    ("Tap the link in bio. Or comment AI, and I'll send you the link.", "excited"),
]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "sfx", "vo", OUTDIR)
os.makedirs(out, exist_ok=True)
for i, (text, emo) in enumerate(LINES):
    if ONLY and i + 1 not in ONLY: continue
    body = {"model_id": MODEL, "transcript": text, "voice": {"mode": "id", "id": VOICE}, "language": "en",
            "output_format": {"container": "wav", "encoding": "pcm_s16le", "sample_rate": 48000}}
    if MODEL == "sonic-3":
        body["generation_config"] = {"speed": 1.0, "emotion": emo}
    req = urllib.request.Request("https://api.cartesia.ai/tts/bytes", data=json.dumps(body).encode(), method="POST", headers={
        "X-API-Key": os.environ["CARTESIA_API_KEY"], "Cartesia-Version": "2025-04-16", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        open(os.path.join(out, f"line{i + 1}.wav"), "wb").write(r.read())
print("vo ok ->", out)
