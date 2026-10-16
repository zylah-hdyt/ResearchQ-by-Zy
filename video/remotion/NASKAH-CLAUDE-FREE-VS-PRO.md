# Claude Free vs Pro — video dari VO (31 detik, 9:16)

Komposisi `ClaudeProVO` (`src/claudepro/ClaudePro.tsx`), 930 frame @30fps, gaya cinematic gelap (kit `src/cine/Cine.tsx`).
Audio: VO asli `sfx/vo/Track_1.m4a`. **7,85 detik pertama dipotong** karena isinya hanya noise ruangan (suara baru mulai di
detik 8,1), lalu high-pass 70 Hz + loudnorm −16 LUFS → `public/claudepro-vo.wav`. Ekor setelah "Thank you" dipakai untuk end card.
SFX hanya 10 bunyi, ~−27 LUFS di bawah VO (`scripts/sfx_claudepro.py`, sampel CC0 uisfx).

Timing visual dikunci ke kata yang diucapkan: transkrip lokal Whisper-small, dikoreksi manual → `src/claudepro/words.ts`.

## Transkrip (sudah dikoreksi)
Jangan buang duit buat Claude Pro kalau lu belum butuh. Kalau lu cuma cari ide judul, brainstorming, atau memperbaiki
tulisan, akun free bisa jadi udah cukup. Tapi kalau lu sering kehabisan kuota saat kerjain skripsi, perlu menganalisis
banyak dokumen atau butuh fitur Research buat menelusuri sumber, Pro layak dipertimbangkan. Menurut dokumentasi resmi
Anthropic, Pro menawarkan kapasitas penggunaan lebih besar dan akses ke fitur tambahan tertentu. Jadi upgrade bukan karena
ikut-ikutan, tapi karena kebutuhan riset lu memang udah meningkat. Thank you.

## Peta visual
| Detik | VO | Visual |
|---|---|---|
| 0–3,2 | Jangan buang duit buat Claude Pro kalau lu belum butuh. | Judul per kata + kartu "Claude Pro"; kursor mendekati "Upgrade ke Pro", lalu mundur, tombol jadi abu, "✋ Cek kebutuhanmu dulu" |
| 3,2–8,8 | Kalau lu cuma cari ide judul, brainstorming, memperbaiki tulisan… akun free bisa jadi udah cukup. | 3 kartu ikon (lampu, sparkle, pensil) muncul tepat di tiap kata + badge "Free bisa jadi udah cukup ✓" |
| 8,8–11,7 | Tapi kalau lu sering kehabisan kuota saat kerjain skripsi | Bar sisa penggunaan (ILUSTRASI) habis → "Batas penggunaan tercapai" |
| 11,7–13,4 | perlu menganalisis banyak dokumen | 5 file (PDF/XLSX/DOCX) terbang masuk |
| 13,4–15,6 | atau butuh fitur Research buat menelusuri sumber | Panel "Menelusuri sumber…" dengan baris sumber tercentang |
| 15,6–17,5 | Pro layak dipertimbangkan. | Ikon timbangan miring + "Pro" + chip ringkasan 3 sinyal |
| 17,5–23,7 | Menurut dokumentasi resmi Anthropic, … kapasitas lebih besar … fitur tambahan tertentu. | Kartu dokumentasi; baris disorot saat diucapkan; batang Free vs Pro (ditandai "ilustrasi, bukan angka resmi"); gembok terbuka; "cek halaman resmi Anthropic" |
| 23,7–26 | Jadi upgrade bukan karena ikut-ikutan, | Barisan orang ikut-ikutan → dicoret ✕ |
| 26–28,7 | tapi karena kebutuhan riset lu memang udah meningkat. | Grafik naik + kursor klik "Upgrade ke Pro" di kata "meningkat" |
| 28,7–31 | Thank you. | Logo putih → RESEARCHQ · Follow @researchq.id |

Subtitle karaoke (kata yang sedang diucapkan oranye) tertanam; versi `-NoSub.mp4` tersedia.

## Catatan kejujuran
- Tidak ada harga atau angka kuota; batang perbandingan diberi label ilustrasi.
- Klaim dokumentasi hanya sebatas yang diucapkan di VO.
