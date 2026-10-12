# EP.04 — Claude Bukan Cuma Chat (TikTok 9:16, 48 detik, tanpa VO)

Edukasi untuk orang yang belum kenal Claude sama sekali, gaya "product launch" sinematik: UI gelap,
glow biru-ungu, kolom chat kaca, kamera sedikit bergoyang seperti layar yang direkam.

Alur:
1. 0–4 s: kolom chat mengetik "Hey Claude, kamu cuma chatbot ya?", pilih model (Haiku / Sonnet / Opus),
   kirim. Audio hampir sunyi (ketikan, klik) lalu **hit + sub** saat terkirim dan musik masuk.
2. 4–7 s: logo Claude + "Claude bukan cuma chat." (kata *chat* dicoret).
3. 7–9,5 s: pemilih mode Chat · Cowork · Claude Code.
4. 9,5–41 s: 9 kartu fitur (3,5 s/kartu), tiap kartu = pill + satu kalimat + mockup animasi + catatan:
   Chat, Projects, Artifacts, Skills, Connectors, MCP, Memory, Cowork, Claude Code.
5. 41–44 s: rekap 9 fitur. 44–48 s: "COBA CLAUDE · claude.ai · @researchq.id".

Fakta (ketersediaan Cowork/Claude Code di paket Pro ke atas, Memory bisa diedit/dimatikan, MCP standar
terbuka di balik Connectors) mengikuti *Claude Guide Book* ResearchQ (Sep 2026).

- `src/ep04.tpl.html` — komposisi. Semua perubahan teks pakai `tl.set` (renderer seek dengan event ditekan).
- `scripts/sfx_ep04.py` — musik 120 BPM + sound design dari `window.__cues` (whoosh tiap kartu, chime yang
  nadanya mengikuti akord, pop, tick, zap, ding, ketikan).

## Pipeline

```bash
npm install
python scripts/build.py src/ep04.tpl.html project/index.html
node scripts/probe.cjs $PWD/project/index.html > out/cues.json
python scripts/sfx_ep04.py out/cues.json project/sfx.wav
(cd project && npx hyperframes render -q high -w 4 -o ../out/video.mp4)
ffmpeg -i project/sfx.wav -af "loudnorm=I=-14:TP=-2:LRA=11,alimiter=limit=0.8:level=false" -ar 48000 out/mix_norm.wav
ffmpeg -i out/video.mp4 -i out/mix_norm.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p \
  -movflags +faststart -c:a aac -b:a 192k -shortest renders/EP04-claude-bukan-cuma-chat.mp4
```

## Cover (thumbnail TikTok)

`src/cover.tpl.html` berisi dua varian hook; render ke `renders/EP04-cover-A.png` dan `EP04-cover-B.png`
(1080×1920, teks penting di area tengah 3:4 supaya aman di grid profil).
- **A** — "Hey Claude, kamu cuma chatbot ya?" → **BUKAN.** · 9 fitur Claude yang jarang orang tahu.
- **B** — "Claude bukan cuma ~~chat~~." + 9 pill fitur · "Kamu baru pakai 1 dari 9?"

```bash
python scripts/build.py src/cover.tpl.html out/cover.html
# buka out/cover.html, set <body data-v="A"> atau "B", screenshot 1080x1920
```
