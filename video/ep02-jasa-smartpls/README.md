# EP.02 — Jasa Olah Data SmartPLS (TikTok 9:16, 42 detik, soft-selling)

Komposisi HyperFrames (HTML + GSAP). Gaya: latar berganti warna per adegan, subtitle karaoke per kata,
stiker emoji 3D (Microsoft Fluent Emoji 3D, lisensi MIT, via `@lobehub/fluent-emoji-3d`), kotak seleksi
ala aplikasi desain, adegan 3D (tabel output, kartu metrik, flip nilai merah→hijau, network 15 variabel).

- `src/ep02.tpl.html` — template. `scripts/build.py` menyematkan font (dari EP01), emoji, dan timing VO.
- `scripts/vo_ep02.json` — naskah VO + jendela waktu (dipakai juga untuk subtitle karaoke).
- `scripts/sfx_ep02.py` — SFX (palet premium yang sama dengan EP01 v2, cue sheet sendiri).
- `renders/EP02-jasa-smartpls.mp4`, `renders/sfx_ep02.wav` — hasil render (tanpa VO).

Catatan isi: angka di tabel adalah ilustrasi (ditandai di layar). Video tidak menjanjikan hipotesis "jadi diterima";
yang diperbaiki adalah kualitas model/data sesuai kaidah, dan hipotesis yang tetap ditolak dibahas dengan benar.

VO (sama seperti EP01): `python ../ep01-judul-generator/scripts/tts_cartesia.py scripts/vo_ep02.json out/vo`,
lalu `python ../ep01-judul-generator/scripts/mix_vo.py out/vo/manifest.json renders/sfx_ep02.wav out/mix.wav`,
loudnorm + mux ke `renders/EP02-jasa-smartpls.mp4` (lihat README EP01).
