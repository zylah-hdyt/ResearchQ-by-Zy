# EP.01 — Judul Generator (TikTok 9:16, 40 detik)

Video motion graphic @researchq.id, dibangun sebagai komposisi **HyperFrames** (HTML + GSAP).

- `src/v2.tpl.html` — versi premium (3D, ikon animasi, kursor interaktif). `src/v1.tpl.html` — versi awal.
- `scripts/sfx_v2.py` — sound design v2 (FM mallet, thock, reverse swell, sub, flick, blip, click-lock).
- `scripts/vo_ep01.json` — naskah voiceover per kalimat + jendela waktunya.
- `scripts/tts_azure.py` — voiceover pria Indonesia (Azure `id-ID-ArdiNeural`), auto-fit ke jendela waktu.
- `scripts/tts_cartesia.py` — alternatif Cartesia (butuh `CARTESIA_API_KEY`, `CARTESIA_VOICE_ID`, akses `api.cartesia.ai`).
- `scripts/mix_vo.py` — tempel VO ke timeline, ducking SFX, lalu loudnorm + mux dengan ffmpeg.

## Pipeline

```bash
npm install
python scripts/build.py src/v2.tpl.html project/index.html
node scripts/probe.cjs $PWD/project/index.html > out/cues.json      # cue typing & animasi untuk SFX
python scripts/sfx_v2.py out/cues.json project/sfx.wav
(cd project && npx hyperframes render -q high -w 4 -o ../out/video.mp4)

# voiceover (butuh AZURE_SPEECH_KEY, AZURE_SPEECH_REGION, dan akses ke <region>.tts.speech.microsoft.com)
python scripts/tts_azure.py scripts/vo_ep01.json out/vo
python scripts/mix_vo.py out/vo/manifest.json project/sfx.wav out/mix.wav
ffmpeg -i out/mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=9 -ar 48000 out/mix_norm.wav
ffmpeg -i out/video.mp4 -i out/mix_norm.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/final.mp4
```

Catatan sandbox: CDN dan unduhan Chrome bisa diblokir — GSAP disalin lokal oleh `build.py`, dan render bisa
diarahkan ke Chromium yang ada lewat `HYPERFRAMES_BROWSER_PATH`. HyperFrames butuh `ffmpeg` dan `ffprobe` di PATH.

## Render yang sudah jadi
- `renders/EP01-judul-generator-v2-premium.mp4` — video v2 (SFX saja, tanpa voiceover).
- `renders/sfx_v2.wav` — track SFX v2 untuk mixing VO.

Menambah voiceover tanpa render ulang:
```bash
python scripts/tts_cartesia.py scripts/vo_ep01.json out/vo
python scripts/mix_vo.py out/vo/manifest.json renders/sfx_v2.wav out/mix.wav
ffmpeg -i out/mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=9 -ar 48000 out/mix_norm.wav
ffmpeg -i renders/EP01-judul-generator-v2-premium.mp4 -i out/mix_norm.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/EP01-final-vo.mp4
```
