# SPSS atau SmartPLS? — Explainer 60 detik (@researchq.id)

Format: gelap sinematik (navy, aksen biru SPSS & amber SmartPLS, HUD dokumenter, tanpa glow), 1080×1920, 30 fps, 60 detik.
Tanpa karakter dan tanpa VO: info disampaikan lewat teks layar + caption, diiringi backsound + SFX.
File: `renders/SPSS-vs-SmartPLS.mp4` · Composition: `SpssVsPls`

## Sentuhan premium
- Transisi bervariasi:
  - push-cut + flash di detik 4 dan 48
  - wipe + stinger bar diagonal biru/amber di detik 14
  - zoom-through blur di detik 24 dan 55
  - slide + stinger di detik 36
- Kamera bergerak pelan (drift/zoom halus) di setiap adegan, judul muncul dengan efek mask reveal, dan ada guncangan kamera kecil saat "VS" muncul.
- Film grain + vignette halus, plus progress bar tipis di HUD. Tanpa neon atau glow.
- CTA: mockup 3D ebook dengan stempel FREE, bonus "Ebook Panduan SEM-PLS & SPSS", dan tombol "↑ Klik link di bio ya".
- SFX transisi: sub boom, whoosh stereo kiri→kanan untuk stinger, dan stempel untuk badge FREE.

Adegan: Pembuka (0–4) · SPSS (4–14) · SmartPLS (14–24) · Analisis (24–36) · Plus & minus (36–48) · Keputusan (48–55) · Penutup/CTA teks (55–60).

## Audio
- Backsound lo-fi edukasi, sintesis sendiri (bebas hak cipta), 120 BPM, kunci A minor/C mayor. 1 bar = 2 detik, jadi setiap pergantian adegan jatuh tepat di ketukan.
  - Struktur lagu: intro dengan riser sampai beat masuk di detik 4 · groove · lift di detik 36 · breakdown di detik 48 · riser ke CTA di detik 55 · ekor akor penutup.
  - Ada swell sebelum tiap pergantian adegan (detik 14/24/36/48).
- SFX (klik, pop, whoosh, tone) disetel ke nada pentatonik C supaya selaras dengan musik.
- Audio akhir dinormalisasi ke sekitar −14 LUFS (standar TikTok). Generator: `scripts/music_spss_pls.py` + `scripts/sfx_spss_pls.py`.

## Caption di layar

| Detik | Caption |
|---|---|
| 4.1–8.6 | SPSS itu software statistik umum. Tampilannya mirip Excel: data di tabel, analisis lewat menu. |
| 8.7–13.8 | Cocok buat regresi linear berganda, uji t, uji F, sampai ANOVA. |
| 14.1–18.8 | SmartPLS beda. Kamu gambar modelnya: variabel jadi lingkaran, indikator jadi kotak. |
| 18.9–23.8 | Lalu SmartPLS menghitung semua hubungan antarvariabel sekaligus, pakai metode PLS-SEM. |
| 24.1–29.8 | Di SPSS, kamu uji validitas, reliabilitas, asumsi klasik, baru regresi. |
| 29.9–35.8 | Di SmartPLS ada outer model buat ngecek indikator, dan inner model buat uji hipotesis lewat bootstrapping. |
| 36.1–41.8 | SPSS mudah dipelajari dan tutorialnya banyak, tapi asumsi klasik wajib terpenuhi, dan mediasi perlu macro tambahan. |
| 41.9–47.8 | SmartPLS nggak wajib data normal dan enak buat model kompleks, tapi kamu harus paham outer dan inner model. |
| 48.1–54.8 | Jadi, variabel diukur banyak indikator dan ada mediasi atau moderasi? Pakai SmartPLS. Model sederhana atau uji beda? SPSS. |

## Catatan
- Angka di output SPSS dan model SmartPLS adalah **contoh ilustrasi** (berlabel di video).
- Threshold PLS mengikuti cut-off umum Hair et al. (2022), dengan catatan "ikuti acuan dosenmu".
- CTA berupa teks "Mau? Klik link di bio ya" + bonus free ebook. Tidak ada harga atau klaim lisensi software di video.
- Isi ebook yang ditampilkan (langkah analisis, cara baca output, contoh interpretasi) perlu disesuaikan dengan isi ebook aslinya.
