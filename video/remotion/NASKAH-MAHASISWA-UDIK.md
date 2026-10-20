# Mahasiswa Udik — Tanya Claude Langsung (48,5 detik, 9:16)

Dibuat dari rekaman suaramu (`sfx/vo/Mahasiswa_udik.m4a`). Komposisi `MahasiswaUdik` (`src/udik/Udik.tsx`), 1455 frame @30fps.

## Suara dibuat lebih jelas
Rekaman aslinya pelan (−26 LUFS) dan nadanya agak "mengendap". Proses: potong 2,35 detik hening di awal → high-pass 80 Hz → denoise (afftdn) →
kurangi gaung di 250 Hz (−3 dB) → angkat kejelasan konsonan di 3,4 kHz (+4 dB) dan treble (+2 dB) → kompresor → loudnorm −15 LUFS.
Pengukuran: suara +9 dB lebih keras, rasio suara-ke-noise naik dari 39,8 dB ke 41,5 dB. File suara bersih: `renders/ResearchQ-Mahasiswa-Udik-VO-clean.wav`.
SFX sangat sedikit (tanpa suara transisi): tik halus saat prompt diketik per kata, pop tiap gelembung chat, satu chime di "Beres", satu dentuman halus di "disuapin".

## Transkrip (sudah dikoreksi)
Katanya masih mahasiswa, tapi mau pake AI aja semua harus nunggu dijelasin orang lain. Claude bisa buat skripsi nggak? Limitnya biar gak cepet habis
gimana? Fiturnya apa aja? Harga paketnya berapa? Apakah kelebihannya dibandingkan AI lain? Bro, kenapa gak lu tanya langsung ke Claude-nya langsung?
Tinggal tanya, Claude, jelasin dong fitur-fitur lu apa aja? Harga paket, kelebihan, dan cara memaksimalkan penggunaan. Gimana biar limitnya nggak cepet
habis? Apa bedanya Claude dibandingkan AI lainnya? Beres, lo bisa dapet penjelasan awal tanpa harus nunggu orang lain bikin tutorial. Lo masih mahasiswa,
punya rasa ingin tahu itu penting. Jangan semua hal harus disuapin. Kalau semuanya harus dijelaskan orang lain, kapan lo belajar mencari tahu sendiri?

## Peta visual
| Detik | VO | Visual |
|---|---|---|
| 0,15–6 | Katanya masih mahasiswa, tapi mau pake AI aja semua harus nunggu dijelasin orang lain. | Teks per kata; avatar "Kamu" + jam berputar (menunggu) + tiga orang dengan titik "mengetik…" |
| 6–17,4 | Claude bisa buat skripsi nggak? Limitnya… Fiturnya… Harga paketnya… Apakah kelebihannya… Bro, kenapa gak lu tanya langsung ke Claude-nya langsung? | Grup chat: lima pertanyaan muncul satu per satu tepat saat disebut; teman membalas "…tanya langsung ke Claude-nya" |
| 16,8–30,7 | Tinggal tanya, Claude, jelasin dong fitur-fitur lu… Gimana biar limitnya nggak cepet habis? Apa bedanya Claude dibandingkan AI lainnya? | **Layar bergaya Claude** (iris dari tengah): "Mau tanya apa hari ini?", kolom input, prompt diketik kata demi kata tepat saat diucapkan, dikirim → balasan (garis kerangka, judul: Fitur / Harga paket / Kelebihan / Cara memaksimalkan penggunaan), lalu dua pertanyaan berikutnya, chat bergulir |
| 30,7–35,9 | Beres, lo bisa dapet penjelasan awal tanpa harus nunggu orang lain bikin tutorial. | "Beres ✓", kartu "Penjelasan awal", "Tanpa nunggu orang lain", dan "tutorial orang lain" dicoret saat kata "tutorial" |
| 35,9–40,1 | Lo masih mahasiswa, punya rasa ingin tahu itu penting. Jangan semua hal harus disuapin. | Teks per kata; ikon sendok + "disuapin" dicoret merah saat diucapkan |
| 40,1–44 | Kalau semuanya harus dijelaskan orang lain, kapan lo belajar mencari tahu sendiri? | Teks besar; kolom pencarian bergaya Claude mengetik "belajar mencari tahu sendiri?" |
| 44–48,5 | — | Logo + RESEARCHQ + Follow @researchq.id |

## Catatan kejujuran
- Isi balasan Claude di layar sengaja berupa garis kerangka (bukan teks jawaban) supaya tidak ada klaim fitur, harga, atau limit yang dikarang. Diberi label "ILUSTRASI TAMPILAN".
- Tafsir transkrip yang perlu kamu cek: "script si inget" → **skripsi nggak?**, "jalan si dong" → **jelasin dong**, "swa" → **mahasiswa**. Kata "Beres," di awal kalimat payoff terdengar jelas, tapi kalau maksudmu lain (mis. "Begitu,"), bilang saja.

## Versi 2 — gaya cinematic gelap (`MahasiswaUdikCine`, `src/udik/UdikCine.tsx`)
Suara, transkrip, timing kata, dan SFX sama persis dengan versi terang. Yang berbeda hanya visualnya, mengikuti gaya video Cursor (jup.creatives):
panggung hitam + cahaya oranye, kamera 3D bergerak di atas layar Claude versi gelap, garis cahaya oranye mengitari kolom input saat prompt mulai diketik dan saat dikirim,
kamera menyelam ke kata "Claude-nya" untuk pindah dari grup chat ke layar Claude, dan penutup logo putih → wordmark.
File: `renders/ResearchQ-Mahasiswa-Udik-Cinematic.mp4` (subtitle karaoke) dan `-Cinematic-NoSub.mp4`.

## Versi 3 — gaya referensi @jipraks "Full otomatis" (`MahasiswaUdikRef`, `src/udik/UdikRef.tsx`, `src/udik/backdrops.tsx`)
Analisis referensi (50,8 dtk, 9:16, −15 LUFS, VO laki-laki tenang):
- **Latar:** hampir hitam, tapi tiap bagian punya tint berbeda (hijau di atas, biru di bawah, lantai grid dengan pantulan) sehingga tidak monoton.
- **Judul:** huruf condensed tebal (outline redup dulu, lalu terisi warna aksen tepat saat kata diucapkan), tetap di atas sepanjang bagian.
- **Struktur:** label mono kecil bernomor ("01 PRODUKSI") + angka hantu besar; diagram node yang disusun berurutan dengan panah; kartu kecil dihubungkan garis lengkung dengan titik yang berjalan menuju pill "VIDEO"; kartu "Tinjauan independen" dengan sudut viewfinder, baris centang/silang, garis scan, stempel "BELUM" → "LAYAK TAYANG"; jendela terminal mengetik; kartu jadwal.
- **Caption:** gaya TikTok, 2–3 kata per layar, kata yang sedang diucapkan masuk kotak putih, kata kunci kotak aksen, diletakkan sekitar 70% tinggi layar.
Penerapan di sini: warna tetap ResearchQ (hitam, oranye, putih) dan latar berganti tiap bagian — ember (hook), navy (pertanyaan), grid lantai (layar Claude), scan oranye (hasil), dot-matrix (ingat), plum (pertanyaan akhir), grid + pantulan wordmark (penutup).
Kartu pertanyaan → garis + titik → pill "JAWABAN ?" yang menyala jadi "▸ CLAUDE" saat temanmu menyebut Claude-nya; kartu hasil punya stempel BERES.
File: `renders/ResearchQ-Mahasiswa-Udik-Ref.mp4` (caption) dan `-Ref-NoCaption.mp4`.
