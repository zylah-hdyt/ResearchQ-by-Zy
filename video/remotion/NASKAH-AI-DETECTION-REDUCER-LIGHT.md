# AI Detection Reducer — Iklan versi "product film" terang (15 detik, 9:16)

Komposisi `ReducerLight` (`src/ads/ReducerLight.tsx`), 450 frame @30fps. SFX saja (10 bunyi, `scripts/sfx_reducerlight.py`);
VO dan musik ditambahkan kreator. Teks di layar = naskah VO, jadi sekaligus berfungsi sebagai subtitle.

## Analisis video referensi (jup.creatives, konsep iklan Apple Health)
**Format:** 1024×576 (16:9), 16,45 dtk. Isi ±12,5 dtk + "made by jup" + outro TikTok (14–16,4 dtk). Loudness −16,8 LUFS.

**VO (perempuan, bahasa Inggris, tenang ala iklan Apple):**
"Your body is constantly changing. Your heart beats, your sleep shifts, and your activity tells a story. But how do you see
the bigger picture? Apple Health brings it all together. Health. Listen to your body."

| Detik | VO | Visual |
|---|---|---|
| 0–1,9 | Your body is constantly changing. | Latar putih bersih. Kata muncul satu per satu: tiap kata terbelah dua (atas/bawah) lalu menyatu dari blur. Kata yang sedang diucapkan merah + glow merah lembut di belakangnya. |
| 2,4–5,9 | Your heart beats, your sleep shifts, and your activity tells a story. | Gumpalan merah berubah bentuk (morph) jadi kartu UI watch: detak jantung 67 BPM → skor tidur 84 → ring aktivitas. Kartu berjajar; teks kecil "tells a story" dengan garis tipis di pojok. |
| 6,1–7,9 | But how do you see the bigger picture? | **Musik drop.** Kolase foto orang (olahraga, tidur, cek jam) mengelilingi kotak teks tengah bergaris bantu, di atas pink lembut; foto terbang masuk sambil berputar, lalu blur keluar. |
| 8,0–10,0 | Apple Health brings it all together. | Flash warna merah → pemandangan gunung dan padang bunga + kartu kaca (glassmorphism): jantung, tidur, aktivitas, jam 3D dengan hati. |
| 10,1–11,0 | Health. | Gradien pink/merah + ikon app putih di tengah, membesar. |
| 11,0–12,3 | Listen to your body. | Kembali ke putih; kata per kata, "body." merah dengan glow. |
| 12,5–14 | — | Tanda tangan "made by jup". |

**Audio:**
- Musik sekitar 125 BPM (ketukan tiap ±0,24 dtk).
- 0–6 dtk ringan, didominasi frekuensi menengah (VO + pluck).
- Mulai 6,5 dtk bass masuk dan mendominasi (60–90% energi di bawah 200 Hz); loudness naik dari sekitar −23 ke −14 dB.
- SFX halus: glitch/tick saat kata terbelah, whoosh saat morph, boom di drop.
- 14,5 dtk: suara outro TikTok.

**Kenapa efektif:** satu kalimat per adegan, teks = VO, transisi selalu "berubah bentuk" (tidak pernah cut kasar), ritme naik di detik 6 tepat saat pertanyaan besar, ditutup ikon brand + satu kalimat janji.

## Iklan kita (struktur dan ritme yang sama)
| Detik | VO / teks | Visual |
|---|---|---|
| 0.0–2.2 | Draf skripsimu dibantu AI? |
| 2.2–6.0 | Kalimatnya kaku, polanya ketebak, statusnya ikut naik. |
| 6.0–8.0 | Gimana biar kedengeran kayak kamu? |
| 8.0–10.0 | AI Detection Reducer merapikan semuanya. |
| 10.0–11.0 | ResearchQ. |
| 11.0–12.7 | Tulisanmu, versi paling natural. |
| 12.7–15.0 | Komen AI, nanti aku kirim link-nya. |

Detail visual:
- **0–2,2:** kata terbelah dua lalu menyatu, kata aktif oranye + glow.
- **2,2–6:** gumpalan oranye berubah jadi 3 kartu gelap: **Klise** (frasa "Seiring dengan perkembangan zaman" disorot), **Ketebak** (P0/P1/P2 dari panduan), **AI-pattern status: HIGH**.
- **6–8 (drop):** kolase 14 frasa AI-ism bahasa Indonesia dari panduan ("Tidak dapat dipungkiri bahwa…", "Selain itu,", dll.) mengelilingi pertanyaan, lalu dicoret.
- **8–10:** flash oranye → dunia gradien hangat + kartu kaca: Makna tetap ✓, Sitasi utuh ✓, Gaya bahasamu ✓, **AI-pattern status HIGH → LOW**.
- **10–11:** ikon ResearchQ di gradien oranye.
- **11–12,7:** "Tulisanmu, versi paling natural." ("natural." oranye + glow).
- **12,7–15:** "Komen AI 👇 nanti aku kirim link-nya", catatan kecil, "made by researchq.id".

## Klaim (sesuai panduan PDF)
- HIGH → LOW adalah metrik **AI-pattern status** milik skill (bagian Format Output di panduan), bukan skor detektor eksternal.
- Catatan di CTA: "Alat bantu editorial, bukan jaminan lolos AI detector. Tetap ikuti aturan kampus soal penggunaan AI."
  (Panduan: "bukan mesin cheat AI detector", "Jangan menganggap output skill ini otomatis lolos AI detector".)

## Rekaman VO & musik
- Rekam VO mengikuti tabel di atas; file `renders/ResearchQ-AI-Detection-Reducer-Light-15s.srt` berisi timing yang sama.
- Pilih musik ±120–125 BPM yang **drop di detik 6** (frame 180), seperti referensi.
