# AI Detection Reducer — Iklan versi "product film" terang (16,5 detik, 9:16)

Komposisi `ReducerLight` (`src/ads/ReducerLight.tsx`), 495 frame @30fps. SFX dirancang ulang dari nol (`scripts/sfx_reducerlight.py`);
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
| 11.0–12.5 | Tulisanmu, versi paling natural. |
| 12.5–16.5 | AI Detection Reducer cuma Rp29.000. Atau komen AI, aku kirim link-nya. |

Detail visual:
- **0–2,2:** kata terbelah dua lalu menyatu, kata aktif oranye + glow.
- **2,2–6:** gumpalan oranye berubah jadi 3 kartu gelap: **Klise** (frasa "Seiring dengan perkembangan zaman" disorot), **Ketebak** (P0/P1/P2 dari panduan), **AI-pattern status: HIGH**.
- **6–8 (drop):** kolase 14 frasa AI-ism bahasa Indonesia dari panduan ("Tidak dapat dipungkiri bahwa…", "Selain itu,", dll.) mengelilingi pertanyaan, lalu dicoret.
- **8–10:** flash oranye → dunia gradien hangat + kartu kaca: Makna tetap ✓, Sitasi utuh ✓, Gaya bahasamu ✓, **AI-pattern status HIGH → LOW**.
- **10–11:** ikon ResearchQ di gradien oranye.
- **11–12,5:** "Tulisanmu, versi paling natural." ("natural." oranye + glow).
- **12,5–16,5 (CTA):** badge ORACLE · Research Mentor + kartu produk AI Detection Reducer (dipotong dari poster resmi) melayang masuk 3D → "cuma **Rp29.000**" → "atau komen AI 👇 aku kirim link-nya" → catatan kecil → researchq.id.

## Klaim (sesuai panduan PDF)
- HIGH → LOW adalah metrik **AI-pattern status** milik skill (bagian Format Output di panduan), bukan skor detektor eksternal.
- Catatan di CTA: "Alat bantu editorial, bukan jaminan lolos AI detector. Tetap ikuti aturan kampus soal penggunaan AI."
  (Panduan: "bukan mesin cheat AI detector", "Jangan menganggap output skill ini otomatis lolos AI detector".)

## Rekaman VO & musik
- Rekam VO mengikuti tabel di atas; file `renders/ResearchQ-AI-Detection-Reducer-Light.srt` berisi timing yang sama.

## Sound design (baru, tanpa sample pack)
Semua bunyi dirancang dengan DSP lalu dilewatkan reverb stereo yang sama, jadi terdengar satu "ruang":
- 0–1,2 dtk: tick halus di tiap kata + sub "dum" pendek di "AI?"
- 2,0 dtk: whoosh berlapis (pita frekuensi bergerak + sapuan stereo kiri→kanan) masuk ke kartu
- 2,6 / 3,6 / 4,6 dtk: bloop morph (sama untuk ketiga kartu)
- 5,0→6,0 dtk: **riser** naik (noise + nada meluncur, vibrato makin cepat) lalu putus tepat di drop
- 6,0 dtk: **impact** (sub-boom 68→34 Hz + hentakan + ekor reverb)
- 7,1 dtk: sapuan "coret" saat frasa AI dicoret
- 8,0 dtk: reverse whoosh tersedot ke flash oranye + shimmer kaca
- 9,3 dtk: chime dua nada saat HIGH → LOW
- 10,0 dtk: whoosh + sub + chime tinggi di ikon
- 12,0 dtk: shimmer kecil di "natural."
- 12,5 dtk: whoosh ke CTA, 12,9 dtk kartu mendarat, 13,4 dtk hentakan + chime di "Rp29.000"
Level −18 LUFS, supaya VO dan musik tetap di depan.
- Pilih musik ±120–125 BPM yang **drop di detik 6** (frame 180), seperti referensi.
