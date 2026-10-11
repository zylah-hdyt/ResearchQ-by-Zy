# EP.02 — Zona AI untuk Riset (TikTok 9:16, 40 detik)

Gaya **buku catatan coret-coretan**: kertas bergaris, spidol, stabilo, sticky note, stempel. Dibuat sebagai
komposisi **HyperFrames** (HTML + GSAP), beda dari EP01 yang UI 3D bersih. Tema umum (S1/S2/S3, dosen, peneliti),
tanpa kata "skripsi".

Isi: kerangka zona hijau / kuning / merah penggunaan AI dalam riset, lalu kenapa sitasi dari AI harus dicek,
ditutup dengan "AI itu copilot, bukan pilot". Bahan: panduan *AI Is Copilot, Not A Pilot* (ResearchQ, Sep 2026).

- `src/ep02.tpl.html` — komposisi (font di-embed lewat `scripts/build.py`).
- `scripts/vo_ep02.json` — naskah voiceover + jendela waktu (format sama dengan EP01).
- `scripts/sfx_ep02.py` — sound design: goresan spidol, stabilo, balik halaman, pop sticker, stempel, tick.
  Cue-nya diambil dari `window.__cues` di template, jadi SFX selalu ikut animasi.
- `scripts/tts_cartesia.py`, `scripts/mix_vo.py` — sama dengan EP01.

## Pipeline

```bash
npm install
python scripts/build.py src/ep02.tpl.html project/index.html
node scripts/probe.cjs $PWD/project/index.html > out/cues.json
python scripts/sfx_ep02.py out/cues.json project/sfx.wav
(cd project && npx hyperframes render -q high -w 4 -o ../out/video.mp4)

# voiceover (butuh CARTESIA_API_KEY + CARTESIA_VOICE_ID)
python scripts/tts_cartesia.py scripts/vo_ep02.json out/vo
python scripts/mix_vo.py out/vo/manifest.json project/sfx.wav out/mix.wav
ffmpeg -i out/mix.wav -af loudnorm=I=-14:TP=-1.5:LRA=9 -ar 48000 out/mix_norm.wav
ffmpeg -i out/video.mp4 -i out/mix_norm.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/EP02-final-vo.mp4
```

Jendela waktu di `vo_ep02.json` adalah estimasi. Setelah TTS jalan, cocokkan durasi tiap kalimat di
`out/vo/manifest.json` dengan cue di template (S2 baris pada 6.15 / 7.75 / 9.2 detik, S3 pada 13.15 / 14.35 / 15.5,
S4 pada 21.0 / 22.25 / 23.35) dan geser bila perlu.

Catatan: kartu sitasi di S5 sengaja fiktif (nama, judul, dan DOI karangan) untuk mendemonstrasikan sitasi palsu.
