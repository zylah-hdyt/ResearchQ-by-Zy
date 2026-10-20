# Landscape explainer (AI Detection Reducer guide, ~60s): English VO via Cartesia sonic-3 (key from CARTESIA_API_KEY env only).
# Lines + Indonesian subtitles live in src/explainer/script.json; one wav per line -> sfx/vo/explainer/lineNN.wav
# Usage: python3 vo_explainer.py [only_line_numbers e.g. 3,7]
import json, os, sys, urllib.request
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
VOICE = "a33f7a4c-100f-41cf-a1fd-5822e8fc253f"  # Lauren - Lively Narrator
script = json.load(open(f"{D}/src/explainer/script.json"))
only = {int(x) for x in sys.argv[1].split(",")} if len(sys.argv) > 1 else None
out = f"{D}/sfx/vo/explainer"; os.makedirs(out, exist_ok=True)
n = 0
for scene in script["scenes"]:
    for line in scene["lines"]:
        n += 1
        if only and n not in only: continue
        body = {"model_id": "sonic-3", "transcript": line["en"], "voice": {"mode": "id", "id": VOICE}, "language": "en",
                "output_format": {"container": "wav", "encoding": "pcm_s16le", "sample_rate": 48000},
                "generation_config": {"speed": 1.1, "emotion": line.get("emo", "calm")}}
        req = urllib.request.Request("https://api.cartesia.ai/tts/bytes", data=json.dumps(body).encode(), method="POST", headers={
            "X-API-Key": os.environ["CARTESIA_API_KEY"], "Cartesia-Version": "2025-04-16", "Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=60) as r:
            open(f"{out}/line{n:02d}.wav", "wb").write(r.read())
print("explainer vo ok:", n, "lines")
