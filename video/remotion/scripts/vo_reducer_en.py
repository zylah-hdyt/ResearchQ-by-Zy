# English VO for the ReducerLight ad via Cartesia TTS. Reads the key from the CARTESIA_API_KEY env var only.
# One wav per line -> sfx/vo/reducer_en/lineN.wav. Usage: python3 vo_reducer_en.py [voice_id] [model]
import json, os, sys, urllib.request
VOICE = sys.argv[1] if len(sys.argv) > 1 else "273f9ef7-9fc2-4def-88bb-ab108c6249ca"  # Julia - Gentle Guide
MODEL = sys.argv[2] if len(sys.argv) > 2 else "sonic-2"
LINES = [
    "Wrote your thesis with a little help from AI?",
    "Stiff sentences. Predictable patterns. Rising AI signals.",
    "So how do you make it sound like you?",
    "AI Detection Reducer cleans it all up.",
    "ResearchQ.",
    "Your writing, at its most natural.",
    "Just twenty-nine thousand rupiah. Or comment AI for the link.",
]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "sfx", "vo", "reducer_en")
for i, text in enumerate(LINES):
    body = json.dumps({"model_id": MODEL, "transcript": text, "voice": {"mode": "id", "id": VOICE}, "language": "en",
                       "output_format": {"container": "wav", "encoding": "pcm_s16le", "sample_rate": 48000}}).encode()
    req = urllib.request.Request("https://api.cartesia.ai/tts/bytes", data=body, method="POST", headers={
        "X-API-Key": os.environ["CARTESIA_API_KEY"], "Cartesia-Version": "2025-04-16", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        open(os.path.join(out, f"line{i + 1}.wav"), "wb").write(r.read())
    print("line", i + 1, "ok")
