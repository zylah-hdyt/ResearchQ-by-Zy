# EP.05 — Claude vs Skill (TikTok 9:16, 38,7 detik, 60 fps, voiceover pemilik channel)

Video penjelas dari rekaman suara `assets/audio/vo_raw.m4a`: apa itu Claude (AI seperti ChatGPT & Gemini),
apa itu Skill (keahlian khusus di Claude), dan beda prompt vs Skill. Gaya gelap-sinematik seperti EP04,
wordmark ResearchQ di kiri atas dan di kartu penutup.

- **Sinkron per kata.** Rekaman ditranskrip lewat Cartesia STT (`ink-whisper`, timestamp per kata), dikoreksi
  (cloud → Claude, prom → prompt) di `src/words.json`. Semua cue animasi diambil dari kata yang diucapkan lewat
  `at("kata")` di template, dan subtitle karaoke dibuat dari file yang sama.
- **Hening awal dipotong** 2,55 s (`TRIM` di `scripts/sfx_ep05.py`; waktu di `words.json` sudah dikurangi TRIM).
- **Logo:** Claude dari file pemilik channel; ChatGPT (OpenAI) dan Gemini dari `@lobehub/icons-static-svg` (MIT),
  lihat `assets/logos/SOURCE.txt`.
- **Audio:** VO dibersihkan (high-pass, kompresi ringan) + SFX dari `window.__cues` yang di-duck ~7 dB saat ada suara.
  Tanpa musik.

Adegan (mengikuti narasi): hook kartu Claude/Skill (tertukar saat "ketuker") → Claude itu AI, sama kayak ChatGPT
dan Gemini → fitur Skills di menu Claude → Skill = keahlian khusus (Skill masuk ke Claude, tugas & langkah kerja) →
prompt diketik ulang setiap kali → Skill = paket (instruksi, alur kerja, panduan) dipakai berkali-kali →
"Gampangnya: prompt = perintahnya, Skill = paket keahliannya" → "Udah paham kan? Komen yang belum paham" + ResearchQ.

## Pipeline

```bash
npm install
python scripts/build.py src/ep05.tpl.html project/index.html
node scripts/probe.cjs $PWD/project/index.html > out/cues.json
python scripts/sfx_ep05.py out/cues.json assets/audio/vo_raw.m4a project/sfx.wav
(cd project && npx hyperframes render -q high -w 4 --fps 60 -o ../out/video.mp4)
ffmpeg -i project/sfx.wav -af "loudnorm=I=-14:TP=-2:LRA=11,alimiter=limit=0.85:level=false" -ar 48000 out/mix_norm.wav
ffmpeg -i out/video.mp4 -i out/mix_norm.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -r 60 -movflags +faststart -c:a aac -b:a 192k -shortest renders/EP05-claude-vs-skill.mp4

# cover TikTok
python scripts/build.py src/cover.tpl.html out/cover.html   # lalu screenshot 1080x1920 -> renders/EP05-cover.png
```
