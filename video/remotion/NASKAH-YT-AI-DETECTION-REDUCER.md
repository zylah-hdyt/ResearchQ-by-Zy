# NotYourLecture — Tutorial AI Detection Reducer (YouTube, landscape 16:9)

**Format:** 1920×1080, 30 fps · **Target durasi:** 5–7 menit · **Gaya:** ResearchQ (hitam / oranye #F28A2E / putih, Poppins + JetBrains Mono)
**Narasi:** suara kamu sendiri · **Tujuan:** tutorial murni (tanpa harga, tanpa jualan)
**Sumber materi:** *Panduan Lengkap Pengguna AI Detection Reducer v5.0.0* (ResearchQ, Okt 2026)

Cara kerja:
1. Kamu rekam **narasi motion** per segmen (S01–S10) di bawah. Satu file per segmen.
2. Kamu rekam **demo layar** (D1–D4) langsung di Claude kamu, pakai prompt & paragraf contoh di bawah.
3. Kirim semua file narasi. Aku bikin motion-nya di Remotion, sinkron ke suaramu kata per kata, lalu aku siapkan slot demo (slate "DEMO" + durasi) di timeline supaya tinggal kamu tempel rekaman layarnya.

---

## Panduan rekaman

**Narasi (S01–S10)**
- Satu file per segmen, nama file `S01.m4a`, `S02.m4a`, dst. Kalau ada kalimat yang salah, ulang saja kalimatnya di file yang sama. Nanti aku potong.
- Diam 1 detik sebelum mulai bicara dan 1 detik setelah selesai.
- Bebas ubah kata-kata supaya terdengar seperti kamu. Kasih tahu saja kalau ada istilah yang kamu ganti, karena visualnya ikut kata kunci.
- Kalimat di **tebal** = kata kunci yang nanti muncul sebagai teks besar di layar.

**Demo layar (D1–D4)**
- Rekam di 1920×1080, browser fullscreen, zoom 110–125% supaya teks terbaca di HP.
- Mulai chat baru di setiap demo. Pastikan skill AI Detection Reducer sudah aktif.
- Kamu bisa ngomong langsung sambil demo, atau rekam diam lalu isi suara belakangan. Dua-duanya bisa aku masukkan.
- Kalau jawaban Claude panjang, scroll pelan-pelan. Bagian yang lama nanti bisa aku percepat (speed ramp) dengan label "dipercepat".

---

## Struktur & perkiraan durasi

| # | Segmen | Isi | Perkiraan |
|---|---|---|---|
| S01 | Hook | Masalah: tulisan bantuan AI yang kerasa "AI banget" | 0:00–0:25 |
| S02 | Intro channel | NotYourLecture + apa yang dibahas | 0:25–0:40 |
| S03 | Apa itu skill ini | Audit + rewrite, menjaga makna/sitasi; bukan cheat detector | 0:40–1:20 |
| S04 | Cara mengaktifkan | Kata kunci pemicu | 1:20–1:40 |
| **D1** | **Demo 1** | **Perintah dasar "remove AI-isms"** | **1:40–2:20** |
| S05 | Tiga mode + flag | Rewrite / Detect / Edit, flag penting | 2:20–3:05 |
| **D2** | **Demo 2** | **Detect mode: scan dulu, jangan rewrite** | **3:05–3:40** |
| S06 | Pola AI | Tier kata, P0/P1/P2, frasa khas AI Bahasa Indonesia | 3:40–4:30 |
| S07 | Mode skripsi | Fokus pengeditan per BAB | 4:30–4:55 |
| **D3** | **Demo 3** | **Rewrite BAB 1: --context thesis** | **4:55–5:45** |
| S08 | Author sample + status report | Meniru gaya kamu, cara baca laporan | 5:45–6:15 |
| **D4** | **Demo 4** | **Author sample + status report** | **6:15–6:50** |
| S09 | Tips & etika | Do / jangan | 6:50–7:20 |
| S10 | Penutup | Rangkuman + subscribe | 7:20–7:35 |

Total sekitar 7 menit. Kalau mau lebih pendek (±5,5 menit), D4 bisa dipotong dan S08 cukup bagian status report saja.

> Catatan: rencana awal punya 5 demo. Setelah dicocokkan dengan panduan, demo "Rewrite thesis" dan "BAB 1" isinya sama (Contoh 1 di panduan), jadi aku gabung jadi D3. Status report masuk ke D4 supaya tidak ada demo yang mengulang.

---

## NASKAH NARASI

### S01 — Hook (±25 dtk)
> Kamu pernah nulis pakai bantuan AI, terus pas dibaca ulang... kok kerasa **"AI banget"**?
> Kalimat pembukanya **"Dalam era digital yang semakin berkembang"**. Tiap paragraf diawali **"Selain itu"**. Semua hal katanya **"sangat penting"**.
> Dosen yang baca juga bisa langsung ngerasa. Nah, di video ini kita bahas satu skill Claude yang khusus **mengaudit dan merapikan pola-pola itu**.

**Visual:** paragraf contoh muncul, frasa klise menyala oranye satu per satu sesuai disebut, lalu stempel "AI banget?". Ditutup logo Claude + nama skill.

### S02 — Intro channel (±15 dtk)
> Ini **NotYourLecture**. Bukan kuliah, cuma tutorial yang langsung kepake.
> Hari ini: **AI Detection Reducer**. Apa itu, cara pakainya, tiga modenya, dan demo langsung di Claude.

**Visual:** wordmark NotYourLecture, lalu daftar isi 4 poin yang muncul berurutan.

### S03 — Apa itu AI Detection Reducer (±40 dtk)
> AI Detection Reducer adalah skill yang kerjanya dua: **mengaudit** tulisan untuk mencari pola khas AI, yang biasa disebut **AI-isms**, lalu **menulis ulang** supaya terdengar lebih natural.
> Yang penting, yang dijaga itu **makna asli, suara penulis, dan sitasi**. Jadi bukan bikin tulisan baru, tapi merapikan yang sudah ada.
> Dan ini perlu jelas dari awal: skill ini **bukan mesin cheat AI detector**. Pola AI itu sinyal, bukan bukti. Detektor AI sendiri sering salah, terutama ke penulis yang bahasa Inggrisnya bukan bahasa ibu.
> Jadi anggap ini **editor**, bukan alat buat ngakalin sistem.
> Skill ini bisa dipakai buat skripsi, tesis, disertasi, manuskrip jurnal, tinjauan pustaka, sampai konten profesional kayak LinkedIn atau email.

**Visual:** dua kartu "Audit" → "Rewrite"; tiga gembok "Makna · Suara · Sitasi"; kartu peringatan "Bukan mesin cheat AI detector"; lalu grid jenis tulisan.
**Catatan data (on-screen kecil):** "Studi: detektor GPT rata-rata salah menandai ±61% esai TOEFL penulis non-native sebagai tulisan AI. Liang et al., 2023, *Patterns*." (Panduan menyebutnya ">60%".)

### S04 — Cara mengaktifkan (±20 dtk)
> Cara aktifinnya gampang. Nggak perlu perintah khusus, cukup ketik permintaan biasa di chat Claude.
> Skill ini aktif sendiri kalau kamu nyebut kata-kata kayak **"remove AI-isms"**, **"clean up AI writing"**, **"make this sound less like AI"**, atau **"scan paragraf ini untuk pola AI"**.
> Langsung kita coba.

**Visual:** kolom chat bergaya Claude, frasa pemicu diketik satu per satu, tiap frasa dapat chip oranye "skill aktif".

### D1 — Demo 1: perintah dasar (±40 dtk)
Lihat **Shot list D1** di bawah.

### S05 — Tiga mode + flag (±45 dtk)
> Skill ini punya tiga mode.
> Pertama, **Rewrite**. Ini mode default. Claude mengaudit, menulis ulang, kasih ringkasan perubahan, lalu ngecek ulang sekali lagi buat nangkep sisa pola. Itu namanya **second-pass**.
> Kedua, **Detect**. Cuma deteksi, nggak nulis ulang. Hasilnya daftar pola AI yang dikelompokkan dari yang paling parah: **P0, P1, P2**.
> Ketiga, **Edit**. Langsung edit file, tapi cuma bagian yang bermasalah. Bagian yang sudah natural nggak disentuh.
> Kalau mau lebih presisi, ada **flag**. Yang paling kepake: **--context** buat jenis tulisan, misalnya thesis atau journal. **--voice** buat gaya suara. Dan **--intensity** buat seberapa agresif editnya. Defaultnya **light**.

**Visual:** tiga kartu mode (Rewrite / Detect / Edit) yang menyala bergantian, alur 4 langkah Rewrite, lalu "terminal" berisi `--context thesis --voice professional --intensity moderate`; tiap flag menyala saat disebut.

### D2 — Demo 2: detect mode (±35 dtk)
Lihat **Shot list D2** di bawah.

### S06 — Pola AI yang dideteksi (±50 dtk)
> Terus, sebenarnya pola AI itu apa aja?
> Di level kata, ada kata yang muncul jauh lebih sering di teks AI, kayak **delve, robust, comprehensive, leverage**. Ada juga kata yang baru dianggap masalah kalau muncul **bergerombol** dalam satu paragraf.
> Di level kalimat, polanya dibagi tiga.
> **P0**, yang merusak kredibilitas. Misalnya sisa chatbot kayak "Great question!", klaim **"Studi menunjukkan"** tanpa sumber, atau placeholder yang lupa diisi.
> **P1**, yang jelas kecium AI. Pembuka template, kata penguat kosong, em dash di mana-mana.
> **P2**, polesan gaya. Kesimpulan generik, apa-apa dibikin tiga, panjang paragraf yang seragam.
> Untuk Bahasa Indonesia, frasa yang sering kena itu **"Tidak dapat dipungkiri bahwa"**, **"Hal ini menunjukkan bahwa"** yang diulang-ulang, **"memiliki peran yang sangat penting"**, sama **"tentunya"**.

**Visual:** awan kata Tier 1A, kluster Tier 2; tiga tingkat P0 (merah) / P1 (oranye) / P2 (abu) dengan contoh dicoret; lalu kartu frasa Indonesia yang dicoret dan diberi saran pengganti ("sebutkan perannya", "hapus", "langsung tulis klaimnya").

### S07 — Mode skripsi per BAB (±25 dtk)
> Buat yang lagi skripsian, skill ini ngerti struktur BAB.
> **BAB 1**: alurnya fenomena, masalah, bukti, gap, urgensi. **BAB 2**: pisahin teori, temuan, dan sintesis. **BAB 3**: angka, instrumen, dan prosedur dijaga. **BAB 4**: angka harus tepat. **BAB 5**: simpulan harus dari temuan.
> Kita coba rewrite paragraf latar belakang.

**Visual:** lima tab BAB 1–5 yang terbuka bergantian, alur BAB 1 sebagai 5 node berpanah.

### D3 — Demo 3: rewrite BAB 1 (±50 dtk)
Lihat **Shot list D3** di bawah.

### S08 — Author sample + status report (±30 dtk)
> Dua fitur lagi yang sering dilewatin.
> **Author sample**: kasih contoh tulisanmu sendiri, nanti Claude meniru gayamu. Panjang kalimat, pilihan kata, semuanya. Jadi hasilnya bukan gaya generik.
> Dan **status report**. Di sini kelihatan status pola AI, dari **HIGH** sampai **CLEAN**, plus cek apakah **makna, suara, dan sitasi** kamu masih aman. Kalau ada yang **REVIEW**, itu tandanya kamu perlu cek manual.

**Visual:** kartu "contoh tulisanmu" → sidik jari "Author Voice"; lalu tabel status report yang terisi baris per baris, indikator HIGH → LOW → CLEAN.

### D4 — Demo 4: author sample + status report (±35 dtk)
Lihat **Shot list D4** di bawah.

### S09 — Tips & etika (±30 dtk)
> Sebelum pakai, ingat beberapa hal.
> Pakai **--context thesis** atau journal buat tulisan akademik. Kalau ragu, **detect dulu** baru rewrite. Dan selalu ambil hasil **second-pass**, karena itu versi finalnya.
> Yang jangan: jangan anggap hasilnya otomatis lolos AI detector. **Jangan ubah data atau klaim penelitian**, dan jangan hapus sitasi.
> Ini alat bantu editorial. **Ide, data, dan tanggung jawabnya tetap di kamu.**

**Visual:** dua kolom DO (centang hijau) / JANGAN (silang merah) yang terisi sesuai disebut; kalimat terakhir sebagai kartu besar.

### S10 — Penutup (±15 dtk)
> Jadi: audit, rewrite, dan cek status report. Tulisanmu tetap tulisanmu, cuma lebih rapi.
> Kalau video ini kepake, subscribe **NotYourLecture**. Sampai ketemu di tutorial berikutnya.

**Visual:** recap tiga ikon, lalu end screen dengan wordmark NotYourLecture + area 2 video rekomendasi YouTube (20 detik terakhir dikosongkan untuk end screen element).

---

## SHOT LIST DEMO

> Semua paragraf contoh di bawah **sengaja ditulis penuh pola AI untuk keperluan demo**. Isinya fiktif, tanpa data dan sitasi asli. Sebaiknya di video tampilkan label kecil "Paragraf contoh untuk demo". Kalau kamu mau pakai paragraf skripsimu sendiri, juga boleh.

### Paragraf contoh A (dipakai D1 & D2)
```
Dalam era digital yang semakin berkembang, media sosial memiliki peran yang sangat penting dalam kehidupan mahasiswa. Tidak dapat dipungkiri bahwa platform seperti Instagram dan TikTok tidak hanya menjadi sarana hiburan, namun juga menjadi sumber informasi utama. Selain itu, studi menunjukkan bahwa mahasiswa menghabiskan banyak waktu di media sosial — bahkan lebih lama dibandingkan waktu belajar. Hal ini menunjukkan bahwa media sosial memberikan kontribusi yang signifikan terhadap pola belajar mahasiswa. Tentunya, fenomena ini perlu dikaji secara komprehensif.
```
Pola yang seharusnya tertangkap (untuk kamu cek, bukan dibacakan): pembuka formulaic, "memiliki peran yang sangat penting", "Tidak dapat dipungkiri bahwa", "tidak hanya… namun juga…", "Selain itu", **"studi menunjukkan" tanpa sumber (P0)**, em dash, "Hal ini menunjukkan bahwa", "kontribusi yang signifikan", "Tentunya", "secara komprehensif".

### D1 — Perintah dasar (±40 dtk)
1. Chat baru. Ketik prompt ini lalu tempel **Paragraf A** di bawahnya:
```
Tolong remove AI-isms dari paragraf ini:

[tempel Paragraf A]
```
2. Tunggu jawaban. Scroll pelan lewat 4 bagian: **Issues Found → Rewritten Version → What Changed → Second-Pass Audit**.
3. Berhenti 2–3 detik di **Rewritten Version** supaya penonton sempat baca.
- Yang ditunjukkan: skill aktif tanpa perintah khusus, dan output-nya punya 4 bagian.
- Kalau sambil ngomong, contoh: "Lihat, dia nandain dulu polanya, baru nulis ulang, terus ngecek ulang."

### D2 — Detect mode (±35 dtk)
1. Chat baru. Prompt:
```
Scan paragraf ini, jangan rewrite. Saya mau lihat apa saja yang perlu diperbaiki.

[tempel Paragraf A]
```
2. Tunjukkan hasil yang dikelompokkan **P0 / P1 / P2** dan bagian **Assessment**.
3. Sorot (hover / blok teks) temuan **"studi menunjukkan"** di P0, karena itu klaim tanpa sumber.
- Yang ditunjukkan: detect mode tidak mengubah teks, hanya melaporkan.

### Paragraf contoh B (dipakai D3, gaya latar belakang BAB 1)
```
Seiring dengan perkembangan zaman, belanja online telah menjadi bagian yang tidak terpisahkan dari kehidupan generasi Z. Hal ini menunjukkan bahwa perilaku konsumen mengalami perubahan yang sangat signifikan. Tidak dapat dipungkiri bahwa ulasan produk memiliki peran yang sangat penting dalam keputusan pembelian — bukan hanya sebagai sumber informasi, tetapi juga sebagai bentuk validasi sosial. Selain itu, banyak penelitian telah membahas topik ini secara komprehensif. Namun demikian, penelitian mengenai pengaruh ulasan produk terhadap minat beli mahasiswa di Indonesia masih terbatas. Oleh karena itu, penelitian ini tentunya sangat penting untuk dilakukan.
```

### D3 — Rewrite BAB 1 dengan flag (±50 dtk)
1. Chat baru. Prompt (dari Contoh 1 di panduan):
```
Tolong rewrite paragraf latar belakang skripsi saya ini, gunakan --context thesis, --voice professional, dan --intensity moderate.

[tempel Paragraf B]
```
2. Tunjukkan bahwa variabel (ulasan produk, minat beli, mahasiswa) tetap ada di hasil rewrite.
3. Tunjukkan **What Changed** dan **Second-Pass Audit**.
4. Opsional: taruh versi asli dan hasil berdampingan (split screen). Aku bisa bikin layout split-nya di edit kalau kamu kirim dua screenshot atau satu rekaman yang scroll ke dua-duanya.
- Perhatikan: "banyak penelitian telah membahas" juga klaim tanpa sumber. Kalau Claude menandainya atau meminta sumber, itu momen bagus untuk disorot: skill ini **tidak mengarang sitasi**.

### D4 — Author sample + status report (±35 dtk)
1. Chat baru. Tempel 2–3 paragraf **tulisanmu sendiri** yang asli (misalnya caption panjang, artikel blog, atau bagian skripsi yang kamu tulis tanpa AI), lalu:
```
Ini contoh tulisan saya:

[tempel 2–3 paragraf tulisanmu]

Sekarang rewrite paragraf ini agar cocok dengan gaya saya, --context thesis. Tampilkan juga status report-nya.

[tempel Paragraf B]
```
2. Scroll ke **status report** dan berhenti di tabel (AI-pattern status, Voice, Semantic, Epistemic, Citation integrity, Genre fit, Over-editing).
- Kalau status report tidak muncul otomatis, ketik lanjutan: `Tampilkan status report untuk hasil rewrite tadi.`

---

## Untuk YouTube

**Chapters** (perkiraan; aku update ke timestamp asli setelah video final):
```
0:00 Tulisan kerasa "AI banget"?
0:25 Intro NotYourLecture
0:40 Apa itu AI Detection Reducer
1:20 Cara mengaktifkan
1:40 Demo 1: remove AI-isms
2:20 Tiga mode & flag
3:05 Demo 2: Detect mode
3:40 Pola AI yang dideteksi (P0/P1/P2)
4:30 Mode skripsi per BAB
4:55 Demo 3: Rewrite BAB 1
5:45 Author sample & status report
6:15 Demo 4: Gaya tulisanmu sendiri
6:50 Tips & etika
7:20 Penutup
```

**Ide judul** (tutorial, tanpa klaim "lolos detector"):
1. Cara Bikin Tulisan Bantuan AI Nggak Kerasa "AI Banget" | Tutorial Claude Skill
2. Tutorial AI Detection Reducer: Audit & Rapikan Pola Tulisan AI di Skripsi
3. Stop Nulis "Dalam Era Digital yang Semakin…": Tutorial AI Detection Reducer di Claude

**Teks thumbnail:** "AI BANGET?" dengan frasa "Dalam era digital…" dicoret.

**Catatan jujur di deskripsi (disarankan):**
> Skill ini alat bantu editorial untuk merapikan pola tulisan AI. Skill ini tidak menjamin tulisan lolos AI detector dan tidak boleh dipakai untuk mengubah data atau klaim penelitian. Paragraf di video adalah contoh fiktif untuk demo.
