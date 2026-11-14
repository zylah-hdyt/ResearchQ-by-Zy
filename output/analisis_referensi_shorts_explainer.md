# Analisis 2 video referensi (Shorts explainer, kanal InsiderForce)

- **A** — "Claude Code Can Now Launch Any Website…" · 86,5 dtk · 720x1280 · 30 fps
- **B** — "8 Free Claude Code Commands… Into Plain English" · 101 dtk · 480x854 · 30 fps
- Metode: frame tiap 0,5 dtk (contact sheet), deteksi potongan adegan, transkrip Whisper, analisis loudness/spektrum/transien/pitch.

## 1. Gaya visual (sama di kedua video)
| Aspek | Temuan |
|---|---|
| Latar | Abu-abu muda polos (~#ECECEC), datar, tanpa tekstur. Hampir tidak pernah berganti warna. |
| Komposisi | Satu fokus di tengah. Visual di setengah atas (y 5–45%), teks di tengah-bawah (y 60–75%), watermark samar "insiderforce.io" di bawah (y ~85%). |
| Objek | Kartu screenshot produk asli & ikon dalam lingkaran putih, semuanya **melayang dengan bayangan lembut besar**, kadang miring 3D tipis. |
| Tata bahasa visual | **"Pohon node"**: ikon di atas → garis tipis vertikal → objek di bawah (agent, website, laptop). Diagram bertumbuh satu cabang per kalimat. |
| Karakter | Maskot pixel oranye (karakter Claude Code milik Anthropic) dengan variasi aksesori (topi detektif + kaca pembesar), memegang label perintah (`/os-done-or-not`). |
| Daftar | 3 jenis: panah "→" (proses), "✕" (hal yang tidak perlu lagi), "✦" (fitur), dan chip langkah bernomor 1–5 dengan ikon. |
| Listicle (B) | Kartu judul besar **"Number #N"** + maskot memegang tag perintah → lalu demo visual (sebelum/sesudah, laporan, checklist). |
| Potongan keras | Sangat sedikit (6 per video). Hampir semua perpindahan berupa elemen masuk/keluar di layar yang sama. |
| Transisi | Pop/scale lembut; **blur penuh layar (frosted)** tiap 15–25 dtk sebagai pemisah bagian; huruf berjarak lebar yang merapat ("A w e S h e l l" → "AweShell.AI", "N u m b e r"). |
| Tempo | Elemen visual baru tiap 1–2 dtk; teks tidak pernah berhenti. |

## 2. Caption / teks (ciri paling khas)
- **Kata muncul satu per satu mengikuti VO**: kata baru masuk abu-abu muda lalu menggelap; kalimat menumpuk sampai selesai lalu dibersihkan.
- Dalam satu baris bobot huruf bercampur: kata kunci **tebal & sedikit lebih besar** ("site", "agent", "public link"), kata lain tipis.
- Penekanan khusus: **blok hitam teks putih** untuk frasa kunci ("any website", "fixes it permanently"), *miring* untuk kalimat penegas ("all taken care of automatically", "when it is not").
- Font sans modern (gaya SF Pro/Inter), warna gelap di latar terang, rata tengah, 2–4 baris.

## 3. Suara
| Aspek | A | B |
|---|---|---|
| Loudness | -12,7 LUFS, LRA 1,1 LU | -12,6 LUFS, LRA 1,3 LU |
| Kecepatan VO | **±214 kata/menit** | **±185 kata/menit** |
| Pitch VO | Pria, F0 median ±127 Hz | Pria, F0 median ±129 Hz (suara yang sama) |
| Musik latar | Ada: energi bass (40–180 Hz) tetap ±-28 dB saat jeda bicara, stereo (VO mono). Tanpa beat yang jelas → pad/ambient bass yang rendah. | Sama |
| SFX | ±72 transien/menit (≈1 tiap 0,8 dtk): klik/tick/whoosh halus tiap elemen muncul | ±74/menit |

Catatan: VO terdengar sangat dipadatkan (kompresi berat, LRA ~1 LU) dan nyaris tanpa jeda. Kemungkinan suara AI, tetapi ini dugaan dari angka, bukan hasil mendengar.

## 4. Struktur naskah VO (bahasa Inggris)
**A (rilis alat/fitur):**
1. Hook klaim besar (0–4 dtk): "Claude Code can now launch any website it builds live on the internet."
2. Syarat sederhana: "All you need is one free tool to unlock it."
3. Manfaat ulang + sebut nama alat.
4. Cara kerja 3 langkah (copy prompt → agent setup otomatis → agent publish).
5. Penghapus keberatan: "No server to manage. No domain to register. No deployment setup to learn."
6. Fleksibilitas + daftar contoh pemakaian (portfolio, resume, demo, event page).
7. Alternatif manual.
8. Pembeda: "And here is the part that makes it genuinely different…" + 2–3 fitur.
9. Kompatibilitas ("works with … and any agent that can run commands").
10. CTA kata kunci: "Comment SHELL and I will send you the direct link. Make sure you follow… The system only sends it to followers."

**B (listicle):** hook = judul dibaca → masalah ("a wall of technical language that leaves most vibe coders completely in the dark") → solusi ("Someone just built a free pack…") → nama + "Free. Open source." + "One command installs…" → kalimat transformasi ("stops speaking engineer and starts speaking plain English") → 8 item dengan pola tetap: **"Number N is [nama]. [apa fungsinya]. [manfaatnya]."** → kompatibilitas → CTA kata kunci.

**Ciri bahasa:** kalimat deklaratif pendek (8–18 kata), "you/your" terus-menerus, kata kerja konkret, pola tiga ("deploys, migrations, payments"), kata penguat ("genuinely", "permanently", "exactly"), tanpa basa-basi pembuka.

## 5. Adaptasi untuk NotYourLecture / ResearchQ (mirip rasa, BUKAN salinan)
| Ambil | Ubah supaya khas kita |
|---|---|
| Kartu melayang + bayangan lembut, pohon node | Latar **krem hangat #F2EFE9 + tekstur kertas tipis**, aksen oranye #EE6A1F + tinta, bukan abu-abu datar |
| Caption kata-per-kata dengan bobot campur | Font kita (Plus Jakarta Sans 800 + 1 kata **Instrument Serif italic** oranye), blok penekanan oranye, bukan hitam |
| Karakter sebagai pemandu | **Maskot talking head kita (9 pose, lip-sync)** menggantikan maskot pixel; JANGAN memakai maskot Claude Code/logo pihak lain kecuali file resmi dari user |
| Listicle "Number #N" | Kartu nomor gaya kita (angka Anton besar + label) |
| Transisi blur & huruf merapat | Ganti sebagian dengan wipe kertas / geser kartu milik kita |
| Musik bed + SFX klik halus | Bed sangat pelan (bila user setuju — sebelumnya user menolak musik di TikTok), SFX dipilih manual |
| CTA kata kunci | "Komen [KATA]" + follow; tanpa harga |
| Watermark | "NotYourLecture" / "@researchq.id" |

Tata letak dengan talking head: visual di 50% atas, caption di tengah (y 55–68%), maskot kanan-bawah setinggi ±30% layar (tidak menutupi caption), watermark kiri-bawah.
