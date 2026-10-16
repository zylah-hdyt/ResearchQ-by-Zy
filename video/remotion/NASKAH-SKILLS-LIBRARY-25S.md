# ResearchQ Skills Library · 25 detik (@researchq.id)

Composition: `SkillsShort` · File: `renders/ResearchQ-Skills-Library-25s.mp4` · 1080×1920, 30 fps · **Font: Poppins**.
**Tanpa musik (SFX saja).** File SFX terpisah: `renders/ResearchQ-Skills-Library-25s-SFX.wav`.

Prinsipnya: bagian **universal duluan** (semua jenjang, semua jurusan), baru bagian khusus bidang. Dengan begitu tidak ada penonton yang merasa "ini bukan buat saya" di detik-detik awal.

## Grid ketukan
Semua potongan dikunci ke **120 BPM** (1 ketukan = 15 frame). Pakai musik 120 BPM (atau 60/240) dan taruh ketukan pertamanya di detik 0.

| Detik | Adegan |
|---|---|
| 0–2 | **Hook universal:** "*Skripsi, tesis, disertasi, jurnal.*" → "**Semua ada skill-nya.**" (coretan oranye), lalu push-in |
| 2–4 | **Dari judul sampai sidang.** "Semua jurusan · kuanti & kuali", chip "untuk ___" berganti 16 jurusan, lalu 4 kartu sistem inti (GENESIS, CATALYST, NEXUS, ORACLE) muncul satu per ketukan |
| 4–5 | **Jenjang:** 4 pita warna S1 · Skripsi → S2 · Tesis → S3 · Disertasi → Dosen · Publikasi & penelitian |
| 5–9 | **Sistem khusus bidang:** Teknik Informatika → KERNEL · Ilmu Hukum → VERDICT · Pendidikan/PTK → SPIRAL · Kesehatan & Kedokteran → VITALS (1 detik per potongan, latar warna penuh) |
| 9–10 | **Publikasi jurnal:** Dosen & Peneliti → PRISM · Journal Matcher |
| 10–15 | **Momen bukti (melambat):** "1 prompt → draft BAB 1". Prompt Problem Master diketik, lalu dokumen BAB 1 terbang naik dan mendarat pelan, dengan grafik bersumber + 3 cap ✓ |
| 15–20 | **Dinding 44 skill**, lalu "44 skill · 9 sistem · semua jurusan · S1–S3 · dosen" |
| 20–25 | **CTA (opsi B):** "Mulai dari **Rp29.000** per skill · akun Claude gratis · sekali beli" → "**Komen nama sistemnya** 👇" (9 chip sistem menyala bergantian) → contoh komen "NEXUS" → "nanti aku kirim link-nya" · lynk.id/resq |

## SFX: rekaman asli, bukan sintesis (`scripts/sfx_short.py`, sekitar −16 LUFS)
Semua bunyi diambil dari library **uisfx** (lisensi CC0 1.0, bebas dipakai komersial, tanpa atribusi wajib). Filenya ada di `sfx/uisfx/`. Pack yang dipakai: **studio** (UI), **cinematic** (impact/transisi), dan **mechanical/soft** (ketikan).

| Momen | Bunyi |
|---|---|
| Kata di hook | studio · hover |
| "Semua ada skill-nya" | cinematic · open |
| **Setiap chip skill (semua sama)** | **studio · reaction** |
| Setiap hard cut / transisi | cinematic · swipe + snap + press |
| 4 kartu sistem inti | cinematic · select |
| Pita S1/S2/S3/Dosen | cinematic · swipe |
| Mengetik prompt | mechanical · typing (pitch sedikit acak) |
| Kirim prompt | studio · press + cinematic · send |
| Dokumen mendarat | cinematic · drop + start |
| Cap ✓ | studio · check |
| "44 skill" | cinematic · level-up |
| Harga | cinematic · purchase |
| Chip 9 sistem | studio · progress-step |
| Ketik komen | soft · typing |
| Komen terkirim / hati | studio · send + reaction |
| Penutup | cinematic · complete |

Saran mixing: musik sekitar 6–10 dB di bawah SFX.

Data grafik: e-Conomy SEA 2024 (Google, Temasek, Bain & Company). Nama sistem dan skill: ResearchQ_Library_Skills.pdf.
