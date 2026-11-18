# Instan dan Cepat · catatan produksi

**Format:** TikTok 9:16, 1080×1920, 30 fps, ±75,9 dtk. VO asli user (`Instant_dan_Cepat.m4a`), isi dan timing tidak diubah. Hanya highpass, EQ ringan, de-esser, kompresi lembut, dan normalisasi loudness.
**Gaya (v2, setelah revisi user):** cinematic educational storytelling + presenter (maskot ResearchQ, lip-sync). Hanya **8 foto** realistis (dibuat bergerak 2.5D). Sebagian besar adegan berupa **komponen animasi** di latar grafis sinematik (night navy / kertas hangat 2021 / modern electric-blue + grain film). Subtitle kinetic tanpa kotak. **Tanpa suara kaget** (tidak ada boom/hit/impact/riser).
**Hasil:** `Instan_dan_Cepat_FINAL.mp4` (H.264 2-pass ±9 Mbps, 85 MB; -14.7 LUFS, peak -1.6 dBFS) · subtitle terpisah `subtitle_id.srt`.

## Sumber aset & lisensi
- Semua foto berasal dari **Unsplash** (CDN resmi `images.unsplash.com`), dengan **Unsplash License**: bebas dipakai komersial dan tanpa wajib atribusi. Daftar per file ada di `assets/CREDITS.csv` (adegan, nama file, URL sumber, lisensi).
- Foto dipilih manual: tiap kandidat diunduh sebagai thumbnail, dicek isinya, lalu yang relevan diambil dalam resolusi penuh (tinggi 2200 px).
- Nama fotografer tidak tercatat. Sesi ini tidak punya akses API Unsplash, dan halaman foto tidak bisa dibuka dari sandbox. Lisensi Unsplash tidak mewajibkan atribusi.
- **Pexels/Pixabay video tidak dipakai.** API keduanya butuh API key, dan permintaan key ditolak di sesi ini. Pencarian tanpa API (scraping) tidak dilakukan.
- **Image generation tidak dipakai.** Kredit Gamma di akun habis (0). Semua visual adalah foto asli + motion graphics buatan kode.
- Tidak ada logo merek pihak ketiga yang digambar. "TikTok" dan "YouTube" hanya ditulis sebagai teks. Kartu AI bernama generik "Asisten AI".

## Bagaimana foto dibuat seperti footage
1. Depth map per foto dibuat dengan model **Depth-Anything v2 small** (ONNX, `tools/depth.py`).
2. Shader WebGL (di `template.html`) menggabungkan beberapa lapisan:
   - parallax 2.5D (latar depan dan belakang bergeser berbeda);
   - zoom/pan sinematik;
   - depth of field;
   - whip-pan dengan motion blur;
   - flash transisi;
   - split-screen;
   - color grading per era: `night/dark` dramatis, `warm` nostalgia 2021, `modern` terang, `cool`, `dusk` reflektif;
   - grain film, vignette, dan light leak hangat untuk masa lalu.

## Alur adegan (detik)
| detik | VO | visual |
|---|---|---|
| 0–5.3 | Kenapa mahasiswa… instan dan cepat? | mahasiswa frustrasi (grade gelap) · presenter besar · "serba instan & cepat?" |
| 5.3–8.9 | …sedikit aja udah menyerah | sticky notes kewalahan (whip) → laptop menutup · "menyerah." + boom |
| 8.9–12.9 | Save & follow | presenter besar · ikon Save/Follow sejajar |
| 12.9–18.9 | ingat kuliah 2021, belum ada AI | flash + bunyi rewind · angka **2026→2021** · perpustakaan hangat · "AI" dicoret |
| 18.9–27.7 | TikTok belum seramai… belum banyak kreator, live tanya-jawab | tangan & HP · kelas kosong · aula kuliah · kartu "LIVE" pudar |
| 27.7–31.0 | ya harus cari sendiri | mahasiswa di lorong perpustakaan · presenter samping |
| 31.0–35.7 | buku, jurnal, YouTube, referensi | montase cepat 4 foto + shutter (01–04) |
| 35.7–38.1 | informasi saat itu benar-benar berharga | membaca buku di cahaya matahari · "berharga." |
| 38.1–51.3 | Sekarang coba lihat… AI, tutorial, jurnal online, kreator & diskusi gratis | whip ke grade terang · presenter · chat Asisten AI · kartu tutorial · jurnal Open Access · LIVE + chat · diskusi |
| 51.3–55.0 | sumber belajar jauh lebih mudah ditemukan | presenter besar · "jauh lebih **MUDAH** ditemukan" |
| 55.0–59.3 | nggak paham… masih bingung tanya AI | close-up mengetik · abstrak AI |
| 59.3–63.8 | …sudah merasa gak mampu? | mahasiswa termenung (cool) · presenter samping · "gak mampu?" |
| 63.8–68.7 | Dulu terbatas · Sekarang di mana-mana | **split-screen**: tumpukan buku (hangat) vs kelas online (terang) |
| 68.7–75.9 | Jangan sampai… kemauan belajar berkurang | siluet membaca saat senja → meja belajar berbagai sumber (dusk) · presenter · "kemauan belajar yang berkurang." · @researchq.id |

## Audio
- VO -17.7 LUFS (setelah proses ringan), SFX ±9 LU di bawah VO, master `loudnorm I=-14.5 TP=-2`.
- SFX: whoosh/whip saat cut, sub-hit & boom pendek di aksen, tape-rewind ke 2021, shutter untuk montase, chime lembut "berharga", riser → "Sekarang", typing di kartu AI, pop kartu. **Tidak ada** buzzer atau drone rendah panjang (spektrum sudah dicek). Tanpa musik: tambahkan musik di TikTok.

## Catatan teknis
- ASR sempat "mendengar" pengulangan "TikTok juga belum seramai" dan "Terima kasih" di akhir. Setelah dicek dengan energi suara, keduanya halusinasi ASR dan tidak dimasukkan ke subtitle.
- Timing kata: Whisper (prefix-probing, `align.py`), lalu dikoreksi onset tiap kalimat dari energi suara (`tools/fix_onsets.py`).
- Render: `node recp.js <awal> <akhir>` (Chromium + WebGL SwiftShader, 4 worker), build: `python3 tools/build.py <pack> <proyek>`.

## Revisi v2 (feedback user)
- Foto dikurangi dari 28 jadi **8**: hoodie (hook), perpustakaan hangat (2021 + split), lorong perpustakaan (cari sendiri), membaca di cahaya (berharga), lorong terang (sekarang + split), video-call (kreator live), mahasiswa termenung (gak mampu), siluet senja (penutup).
- Adegan lain diganti komponen animasi:
  - progress bar "memahami materi" yang macet di 18% dan kursor menekan "Tutup" (menyerah);
  - timeline 2021→sekarang dengan penanda "kamu di sini";
  - mockup HP dengan feed yang masih sepi;
  - grid slot kreator yang kebanyakan masih kosong;
  - kartu LIVE yang pudar;
  - 4 kartu ikon beranimasi (buku membuka halaman, jurnal di-highlight, video berjalan, kartu referensi menyebar);
  - chat Asisten AI dengan teks mengetik;
  - kartu tutorial dengan progress tontonan;
  - pencarian jurnal online + Open Access;
  - jaringan "kamu → AI / YouTube / Jurnal online / Live diskusi / Komunitas";
  - flowchart "Nggak paham? → Cari penjelasan lain → Masih bingung? → Tanya AI";
  - meter akses Dulu vs Sekarang;
  - grafik "kemudahan ↑ / kemauan belajar ↓".
- SFX tanpa impact: swoosh lembut, pop/klik UI, tick, typing, rewind lembut, chime. Spektrum dicek: tidak ada bagian yang didominasi frekuensi rendah.

## Versi gaya referensi (InsiderForce "5 Free Claude Code Plugins" / "8 Commands")
File: `Instan_dan_Cepat_REFSTYLE.mp4` (sumber: `source/template_ref.html`, build `source/tools/build_ref.py`, render `source/recp_ref.js`).
- Latar abu-terang polos konsisten. Satu elemen visual di zona atas-tengah berupa kartu melayang dengan bayangan lembut besar dan sedikit miring 3D (kartu UI gelap/terang, kartu foto, HP, angka besar).
- Caption hitam di bawah visual: kata muncul satu per satu dari abu ke hitam, kata kunci tebal dan lebih besar. Watermark `researchq.id` abu pucat.
- Daftar ✦ yang dicoret ("belum ada 2021") dan daftar sumber belajar. Langkah bernomor dalam lingkaran biru. Label pill monospace gaya `/perintah`.
- **Presenter (maskot lip-sync) hanya 5 kali**, di dalam kartu presenter dengan label pill: `/serba-instan` (0–5 dtk), `/save-dan-follow` (9–13), `/lebih-mudah` (51–55), `/gak-mampu?` (59–64), `/kemauan-belajar` (71–76).
- 6 foto Unsplash sebagai kartu foto (library hangat, lorong perpustakaan, membaca, lorong terang, video-call, siluet). SFX lembut tanpa suara kaget.

### Revisi REFSTYLE (feedback user)
- **YouTube:** daftar video asli channel NotYourLecture yang bergulir (thumbnail + judul dari screenshot channel).
- **AI:** deretan logo Claude · ChatGPT · Gemini · Perplexity · Copilot (glyph resmi Simple Icons, diwarnai warna merek), lalu chat `/tanya-ai`.
- **TikTok:** feed "Untuk Anda" penuh konten yang bergulir; tile "edukasi" jarang muncul.
- **Live:** UI live streaming "Kelas Riset" lengkap:
  - badge LIVE dan jumlah penonton yang naik (ilustrasi);
  - hati beterbangan;
  - chat bergulir berisi pertanyaan riset;
  - pertanyaan disematkan "uji validitas → outer loading & AVE";
  - kolom "Tulis pertanyaan…".
- **Backsound cerita (12,6–39,2 dtk):** musik sinematik storyteller hasil sintesis (`tools/music.py`): piano arpeggio, string pad, cello, reverb, progresi Am–F–C–G, 72 bpm. Volume ±17 LU di bawah VO, fade in/out.
- **SFX:** desis "soft" (noise swell, sempat terdengar di 49–52 dtk) dihapus dan dilarang permanen. Transisi memakai swoosh sampel pelan atau tanpa suara; chat live memakai ketukan halus.
