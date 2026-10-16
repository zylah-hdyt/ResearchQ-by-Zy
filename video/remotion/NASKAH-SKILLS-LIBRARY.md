# ResearchQ Skills Library — 9 Sistem · 44 Skill · 51 detik (@researchq.id)

Composition: `SkillsLibrary` · File: `renders/ResearchQ-Skills-Library.mp4` · 1080×1920, 30 fps. Tanpa VO.
Gaya mengikuti analisis video referensi (@robiimotion):
- Panggung gelap dengan cakrawala hangat dan teks serif italic yang muncul kata per kata.
- Kamera push-in dengan defocus dan sedikit chromatic split.
- Logo asterisk 3D di latar krem.
- Fly-through 9 sistem, kilatan putih, lalu CTA.
- Film grain dan vignette.
- Taste pass (supaya tidak terkesan AI): tanpa glow/cakrawala berpendar, garis tipis ala editorial, angka sistem besar dalam bentuk outline, strip warna sistem di tepi kiri, dan easing yang bervariasi.

| Detik | Adegan |
|---|---|
| 0–4,5 | Hook: "Skripsi, tesis, disertasi, jurnal." → "Semua ada **skill-nya.**" (coretan oranye), lalu push-in besar |
| 4,5–9,5 | Latar krem: asterisk 3D berputar, "RESEARCHQ SKILLS LIBRARY", hitungan naik **44 SKILL · 9 SISTEM**, "Satu workspace. Dari ide sampai terbit." |
| 9,5–42 | 9 sistem (±3,7 detik per sistem): nomor & kata kerja, ikon garis yang tergambar, peran, bidang, nama besar, tagline, lalu skill-nya muncul satu per satu. Track 9 titik di bawah. Di KERNEL: "Itu baru 4 dari 9. Lanjut per bidang →" |
| 42,5–46,5 | Dinding 44 nama skill (warna per sistem), kamera zoom out, lalu "44 skill · 9 sistem · S1 · S2 · S3 · dosen & peneliti", ditutup kilatan putih |
| 46,5–51 | CTA: "Mulai dari Rp29.000 per skill · akun Claude gratis · sekali beli" → "Komen nama sistemnya" (9 chip sistem menyala bergantian) → contoh komen "NEXUS" → "nanti aku kirim link-nya" · lynk.id/resq → tanda tangan ResearchQ. |

## Data (dari ResearchQ_Library_Skills.pdf)
| Sistem | Kata kerja | Peran | Tagline | Skill |
|---|---|---|---|---|
| GENESIS | Discover | Research Explorer | Find what to research. | Judul Generator, Gap Finder, Scopus Finder, Problem Master |
| CATALYST | Design | Research Architect | Design how to research. | Hipotesis Checker, Theory Master, Method Master, Kuesioner Builder, Inquiry Architect |
| NEXUS | Analyze | Research Analyst | Turn output into findings. | SPSS Doctor, SmartPLS Doctor, BAB 4 Writer, Humanizer, Pattern Coder, Trust Validator |
| ORACLE | Finish | Research Mentor | Review, revise, defend. | Pembimbing Simulator, Master Reviewer, Auto Revision, Paraphrase Akademik, Anti AI Detection |
| KERNEL | Engineer | Research Engineer | Design it. Test it. Prove it works. | Scaffold Designer, Sandbox Tester, Benchmark Analyzer, Delta Comparator, Changelog Writer |
| VERDICT | Adjudicate | Research Counsel | Where argument becomes verdict. | Statute Scanner, Doctrine Builder, Method Curator, Verdict Reader, Reasoning Architect |
| SPIRAL | Reflect | Research Practitioner | Plan it. Act it. Reflect on it. | Strategy Selector, Cycle Designer, Cycle Analyzer, Reflection Writer |
| VITALS | Validate | Research Clinician | From symptom to significance. | Design Selector, Power Calculator, Biostatistics Doctor, PRISMA Reviewer |
| PRISM | Publish | The Research Publisher | From zero to publication. | Journal Matcher, Manuscript Architect, Article Converter, Abstract Master, Citation, Rebuttal Letter |

"Mulai dari Rp29.000" sesuai harga satuan di PDF (PRISM per skill Rp49.000, jadi "mulai dari" tetap akurat).

## Transisi (beda di tiap pergantian)
| Detik | Dari → ke | Transisi |
|---|---|---|
| 9,5 | Logo → GENESIS | Iris terbuka dari kotak ikon + cincin warna sistem |
| 13,2 | GENESIS → CATALYST | Blok warna hijau menyapu layar |
| 16,8 | CATALYST → NEXUS | Split shutter, layar terbelah atas-bawah |
| 20,5 | NEXUS → ORACLE | Push ke atas dengan blur kecepatan |
| 24,2 | ORACLE → KERNEL | Venetian blinds, bilah horizontal terbuka |
| 27,8 | KERNEL → VERDICT | Dive, kamera menyelam ke ikon |
| 31,5 | VERDICT → SPIRAL | Card swing berengsel |
| 35,2 | SPIRAL → VITALS | 5 irisan horizontal bergantian |
| 38,8 | VITALS → PRISM | Cincin terbuka dari titik track |
| 42,5 | PRISM → dinding | Mengecil jadi kartu lalu jatuh |

## Audio: SFX saja, tanpa backsound (`scripts/sfx_library.py`, sekitar −17 LUFS)
Backsound dihapus supaya kreator bisa memasang musik sendiri. File SFX terpisah: `renders/ResearchQ-Skills-Library-SFX.wav`.

**Setiap skill punya suara**, dan timbre-nya khas per sistem:

| Sistem | Suara tiap skill |
|---|---|
| GENESIS | Sonar kaca (ping + gema) |
| CATALYST | Marimba + bubble blip |
| NEXUS | Data blip digital (3 nada cepat) |
| ORACLE | Bell hangat |
| KERNEL | Beep 8-bit |
| VERDICT | Ketukan palu/kayu |
| SPIRAL | Kalimba |
| VITALS | Beep monitor jantung (yang terakhir lebih tinggi) |
| PRISM | Chime kristal |

- **Transisi:** tiap transisi punya bunyi sendiri:
  - nada cincin untuk iris
  - whoosh + thud untuk blok warna
  - klik shutter
  - whoosh naik untuk push
  - ratchet untuk blinds
  - whoosh dalam + boom untuk dive
  - whoosh berpindah kiri-kanan untuk swing
  - zap untuk irisan
  - bell sonar untuk cincin titik
  - thud untuk kartu jatuh
- **Lainnya:** tick per kata di hook, riser + boom saat logo, tick hitungan + bell, kaskade tick 44 chip, boom "44 skill", kilau saat kilatan putih, ketukan HP saat mengetik komen, dan hit penutup.
- **Saran mixing:** taruh musik sekitar 6–10 dB di bawah SFX supaya suara skill tetap terdengar.
