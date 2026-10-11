# EP.02 — Jasa Olah Data SmartPLS (TikTok 9:16, 42 detik, soft-selling)

Komposisi HyperFrames (HTML + GSAP). Gaya: latar berganti warna per adegan, subtitle karaoke per kata,
stiker emoji 3D (Microsoft Fluent Emoji 3D, lisensi MIT, via `@lobehub/fluent-emoji-3d`), kotak seleksi
ala aplikasi desain, adegan 3D (tabel output, kartu metrik, flip nilai merah→hijau, network 15 variabel).

- `src/ep02.tpl.html` — template. `scripts/build.py` menyematkan font (dari EP01), emoji, dan timing VO.
- `scripts/vo_ep02.json` — naskah VO + jendela waktu (dipakai juga untuk subtitle karaoke).
- `scripts/sfx_ep02.py` — SFX (palet premium, cue sheet sendiri). Setelah sintesis, normalkan supaya terdengar di speaker HP:
  `ffmpeg -i sfx_raw.wav -af "highpass=f=90,acompressor=threshold=-24dB:ratio=3:attack=3:release=120:makeup=4,loudnorm=I=-14:TP=-1.5:LRA=7" -ar 48000 sfx.wav`
- `renders/EP02-jasa-smartpls.mp4`, `renders/sfx_ep02.wav` — hasil render (tanpa VO).

Catatan isi: angka di tabel adalah ilustrasi (ditandai di layar). Video tidak menjanjikan hipotesis "jadi diterima";
yang diperbaiki adalah kualitas model/data sesuai kaidah, dan hipotesis yang tetap ditolak dibahas dengan benar.

VO (sama seperti EP01): `python ../ep01-judul-generator/scripts/tts_cartesia.py scripts/vo_ep02.json out/vo`,
lalu `python ../ep01-judul-generator/scripts/mix_vo.py out/vo/manifest.json renders/sfx_ep02.wav out/mix.wav`,
loudnorm + mux ke `renders/EP02-jasa-smartpls.mp4` (lihat README EP01).

## Versi 2 (case-based, dark → light) — `src/ep02b.tpl.html`
- Alur: kasus (HTMT merah, loading merah, hipotesis ditolak semua) → "ada yang salah" (model/indikator/data)
  → layar berubah terang: "di ResearchQ bisa diatasi" (nilai kualitas model dibenahi) → testimoni → S1–S3 → CTA komen "PLS".
- Kartu testimoni sengaja berupa slot buram (tidak ada teks testimoni karangan). Ganti dengan screenshot testimoni asli.
- Build: `python scripts/build.py src/ep02b.tpl.html project/index.html scripts/vo_ep02b.json`
- SFX minimal: `scripts/sfx_ep02b.py` lalu `ffmpeg -i sfx_raw.wav -af loudnorm=I=-20:TP=-3:LRA=10 -ar 48000 sfx.wav`
- Render: `renders/EP02-v2-jasa-smartpls.mp4`, SFX `renders/sfx_ep02_v2.wav`, naskah VO `scripts/vo_ep02b.json`.

## Versi 3 (warna SmartPLS + logo) — `src/ep02c.tpl.html`
- Sama dengan v2, palet diganti warna SmartPLS: biru #057AF1, cyan #36D5FC, kuning #FDFE38; bagian gelap navy, bagian terang biru muda.
- Logo dari user: `assets/brand/smartpls-wordmark.png` (chip di pembuka) dan `assets/brand/pls-round.png` (ikon jendela, stiker, koin 3D di CTA).
- Build: `python scripts/build.py src/ep02c.tpl.html project/index.html scripts/vo_ep02b.json` (SFX & VO sama dengan v2).
- Render: `renders/EP02-v3-smartpls-blue.mp4`.
