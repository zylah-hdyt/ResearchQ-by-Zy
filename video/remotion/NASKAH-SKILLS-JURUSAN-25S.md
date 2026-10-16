# "Jurusan kamu apa?" — ResearchQ Skills Library · 25 detik (@researchq.id)

**Font: Poppins** (judul 800, aksen Poppins italic 500/600, label kecil JetBrains Mono).
Composition: `SkillsShort` · File: `renders/ResearchQ-Skills-Jurusan-25s.mp4` · 1080×1920, 30 fps.
**Tanpa musik (SFX saja)**, jadi musik dipilih sendiri. File SFX terpisah: `renders/ResearchQ-Skills-Jurusan-25s-SFX.wav`.

Konsepnya revisi total dari versi katalog 51 detik. Penonton diajak menunggu jurusannya muncul (retensi), lalu ada satu momen bukti (demo output), payoff 44 skill, dan CTA yang memancing komentar.

## Grid ketukan
Semua potongan dikunci ke **120 BPM** (1 ketukan = 0,5 detik = 15 frame). Pakai musik 120 BPM (atau 60/240), lalu taruh ketukan pertama musik di detik 0. Potongan utama ada di detik **2 · 3 · 4 · 5 · 6 (6,2 · 6,7 · 7,2 · 7,7) · 8 · 9 · 15 · 17 · 20**.

| Detik | Adegan |
|---|---|
| 0–2 | **Hook:** "*Jurusan kamu apa?*" + "**S1 · S2 · S3 · Dosen**" + "tunggu jurusanmu muncul ↓", lalu push-in |
| 2 | **Teknik Informatika** → KERNEL · ✦ Scaffold Designer (latar tosca penuh) |
| 3 | **Ilmu Hukum** → VERDICT · ✦ Statute Scanner (komposisi dibalik ke kanan) |
| 4 | **Pendidikan · PTK** → SPIRAL · ✦ Cycle Designer |
| 5 | **Kesehatan & Kedokteran** → VITALS · ✦ Power Calculator |
| 6–8 | **Jurusan lain?** 16 nama jurusan berganti sangat cepat (Manajemen, Akuntansi, Psikologi, Komunikasi, Ekonomi, Sosiologi, Ilmu Politik, Bahasa & Sastra, Agama Islam, Pertanian, Teknik Sipil, Arsitektur, Farmasi, Keperawatan, Statistika, Pariwisata), lalu "Semua jurusan." + 4 kartu (GENESIS, CATALYST, NEXUS, ORACLE) muncul satu per ketukan |
| 8 | **Dosen & Peneliti** → PRISM · ✦ Journal Matcher ("Dari manuskrip sampai terbit jurnal.") |
| 9–14 | **Momen bukti (melambat):** "1 prompt → draft BAB 1." Prompt Problem Master diketik, kirim, lalu dokumen BAB 1 terbang naik cepat dan mendarat pelan (speed ramp) dengan grafik + 3 cap ✓ |
| 14–15 | **Jenjang:** 4 pita warna masuk bergantian per setengah ketukan: **S1 · Skripsi → S2 · Tesis → S3 · Disertasi → Dosen · Publikasi & penelitian** |
| 15–20 | **Dinding 44 skill** meledak masuk, zoom out, lalu "**44 skill · 9 sistem** · semua jurusan · S1–S3 · dosen" |
| 20–25 | **CTA:** "*Jurusanmu yang mana?* Komen di bawah 👇" + chip S1 · S2 · S3 · Dosen. Contoh: komen "Hukum" → dibalas @researchq.id "pakai **VERDICT** ⚖️". Lalu "Mulai Rp29.000 / skill · akun Claude gratis · lynk.id/resq" |

## Kenapa lebih tidak membosankan
- Penonton punya alasan untuk bertahan: menunggu jurusannya muncul.
- Ritme bervariasi: montage cepat (1 detik per potongan), lalu melambat di demo, lalu ledakan dinding skill.
- Komposisi berganti tiap potongan: latar warna penuh, rata kiri/kanan bergantian, grid 4 kartu, dokumen 3D, dinding chip.
- Ada bukti nyata (dokumen BAB 1 dengan grafik bersumber), bukan sekadar daftar nama.
- CTA "komen jurusanmu" memancing komentar.

## SFX (`scripts/sfx_short.py`, sekitar −16 LUFS)
- Setiap hard cut memakai bunyi yang sama: whoosh pendek + cut-hit (thump + crack).
- **Semua chip skill memakai satu popup yang sama.**
- Lainnya: tick saat jurusan berganti, keyboard saat mengetik prompt, swoosh kirim, thud saat dokumen mendarat + swell pelan, bloop grafik, kaskade tick 44 chip + boom, ketukan HP saat komen, dan boom penutup.
- Saran mixing: musik sekitar 6–10 dB di bawah SFX.

Data grafik di dokumen: e-Conomy SEA 2024 (Google, Temasek, Bain & Company). Nama sistem dan skill: ResearchQ_Library_Skills.pdf.
