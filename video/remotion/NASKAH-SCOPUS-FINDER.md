# "Satu prompt, referensinya asli." · Skill Scopus Finder · 44,7 detik (Remotion)

Format meniru video referensi "Satu prompt → hasil jadi" (krem editorial, aksen lime, serif italic, label langkah di
kiri bawah), versi 9:16. Teks di layar sudah bercerita sendiri tanpa voiceover. **Tambahkan sound yang sedang tren
di TikTok.** SFX bawaan dibuat pelan (−20 LUFS) supaya tidak bentrok dengan musik.

| Detik | Di layar |
|---|---|
| 0–2,5 | **HOOK:** kartu "contoh referensi karangan AI" kena stempel **DOI tidak ditemukan ✗**, lalu "AI suka *ngarang* referensi?" |
| 2,5–5 | "Satu prompt, *referensinya asli.*" · Skill Scopus Finder · ini buktinya 👇 |
| 5–8 | Rekaman layar Claude. **01 Nyalakan Web Search** (toggle ON) |
| 8–11 | **02 Pilih skill Scopus Finder** dari menu skill |
| 11–13,6 | **03 Tulis topik, lalu kirim** (prompt diketik) |
| 13,6–19 | **04 Claude cari & verifikasi**: 2× "Mencari web" ✓, GATE VERIFIKASI (tahun 2022–2026 ✓, sumber kredibel ✓, DOI ✓, kuartil terlihat? ⚠️ cek Scimago) |
| 19–22 | **05 Plus link pencarian siap klik**: Google Scholar · Scopus · Garuda · DOAJ |
| 22–34 | "3 artikel *asli,* bukan karangan." Tiga kartu referensi (lihat di bawah) |
| 34–39 | "Search *mati?*" Claude menolak menulis daftar pustaka karangan dan memberi link pencarian, lalu "Skill-nya *nggak ngarang.*" |
| 39–44,7 | "Cuma satu *kalimat.*" Kartu prompt, 3 hasil ✓, 🔖 Simpan dulu · Komen topik skripsimu 👇 · @researchq.id + Follow |

**Prompt:** Carikan artikel Scopus 2022–2026 tentang pengaruh social media marketing terhadap purchase intention

## Referensi di video (hasil pencarian web asli, 11 Okt 2026)
1. Ali, I., & Naushad, M. (2023). Examining the influence of social media marketing on purchase intention: The mediating
   role of brand image. *Innovative Marketing, 19*(4), 145–157. https://doi.org/10.21511/im.19(4).2023.12
2. Salhab, H. A., Al-Amarneh, A., Aljabaly, S. M., Al Zoubi, M. M., & Othman, M. D. (2023). The impact of social media
   marketing on purchase intention: The mediating role of brand trust and image. *International Journal of Data and
   Network Science, 7*(2), 591–600. https://doi.org/10.5267/j.ijdns.2023.3.012
3. Alnaser, F., Alghizzawi, M., Abualfalayeh, G., Omeish, F., Alharthi, S., & Al Koni, S. R. (2024). The impact of social
   media marketing activities on purchase intention. *International Review of Management and Marketing, 14*(6), 288–300.
   https://doi.org/10.32479/irmm.16839

Kuartil ketiga jurnal tidak terlihat di hasil pencarian. Sesuai aturan skill, di video ditandai "⚠️ cek Scimago", bukan
ditebak. Kartu "contoh referensi karangan" (Pratama, 2021) **sengaja fiktif** dan dilabeli sebagai contoh.

## Caption TikTok (saran)
AI sering ngarang referensi? Skill ini cari yang ASLI: ada DOI, dicek tahunnya, dan kalau Search mati dia nolak ngarang 🔍 Simpan dulu, komen topik skripsimu 👇
#skripsi #tesis #referensi #scopus #jurnal #claude #mahasiswaakhir

## Versi VO Inggris + subtitle Indonesia (`ScopusFinderDemoEN`)

Suara: Cartesia **Brandon - Confident Guy** (sonic-3), dibuat dengan `scripts/tts_scopus.py`. Script ini membaca
`CARTESIA_API_KEY` dari environment; key tidak pernah ditulis ke file. Hasil mix: −14 LUFS, SFX diturunkan di bawah VO.
Timing subtitle tersimpan di `src/scopus/subs-en.json`.

| Detik | VO (English) | Subtitle (Indonesia) |
|---|---|---|
| 0,25 | AI keeps making up references? | AI suka ngarang referensi? |
| 2,55 | One prompt, and every reference is real. | Satu prompt, dan semua referensinya asli. |
| 5,35 | Step one: turn on web search, so Claude actually searches. | Langkah satu: nyalakan web search, biar Claude benar-benar mencari. |
| 8,66 | Step two: pick the Scopus Finder skill. | Langkah dua: pilih skill Scopus Finder. |
| 10,94 | Then type your topic in one sentence, and hit send. | Lalu tulis topikmu dalam satu kalimat, dan kirim. |
| 14,0 | Claude searches the web, then checks every result: the year, the source, the DOI. | Claude mencari di web, lalu mengecek tiap hasil: tahun, sumber, dan DOI-nya. |
| 18,35 | Quartile not visible? It flags it instead of guessing. | Kuartil nggak kelihatan? Ditandai, bukan ditebak. |
| 21,1 | Plus search links, ready to click. | Plus link pencarian yang siap diklik. |
| 22,94 | Three real articles. Not made up. | Tiga artikel asli. Bukan karangan. |
| 25,79 | Each one comes straight from the search results, with a DOI you can open and check yourself. | Semuanya langsung dari hasil pencarian, dengan DOI yang bisa kamu buka dan cek sendiri. |
| 30,3 | Always open the paper before you cite it. | Tetap buka artikelnya sebelum kamu sitasi. |
| 34,2 | And if search is turned off? | Terus kalau search-nya mati? |
| 36,0 | It refuses to invent citations, and gives you search links instead. | Skill-nya menolak ngarang sitasi, dan kasih link pencarian sebagai gantinya. |
| 39,25 | Just one sentence. | Cuma satu kalimat. |
| 40,9 | Save this, and comment your thesis topic below. | Simpan video ini, dan komen topik skripsimu di bawah. |

## Versi VO Indonesia (`ScopusFinderDemoID`)

Suara: Cartesia **Andi - Dynamic Presenter** (bahasa Indonesia, diambil dari `CARTESIA_VOICE_ID`). Subtitle Indonesia
tetap tampil supaya bisa ditonton tanpa suara. Kolom `say` di `scripts/vo_scopus_id.json` berisi ejaan pelafalan
(Klod, Skopus, de-o-i). Kolom `id` adalah teks yang tampil di layar. Mix −14 LUFS.

| Detik | VO + subtitle |
|---|---|
| 0,25 | AI suka ngarang referensi? |
| 2,4 | Satu prompt, dan semua referensinya asli. |
| 5,35 | Pertama, nyalakan web search, biar Claude beneran nyari. |
| 8,6 | Kedua, pilih skill Scopus Finder. |
| 10,94 | Lalu tulis topikmu, cukup satu kalimat, dan kirim. |
| 14,0 | Claude nyari di web, lalu ngecek tiap hasil: tahun, sumber, dan DOI-nya. |
| 18,35 | Kuartil nggak kelihatan? Ditandai, bukan ditebak. |
| 20,82 | Plus link pencarian yang siap diklik. |
| 22,35 | Tiga artikel asli. Bukan karangan. |
| 25,1 | Semuanya langsung dari hasil pencarian, lengkap dengan DOI yang bisa kamu buka dan cek sendiri. |
| 30,4 | Tetap buka artikelnya sebelum kamu sitasi, ya. |
| 34,2 | Terus, kalau search-nya mati? |
| 36,0 | Skill-nya nolak ngarang sitasi, dan ngasih link pencarian sebagai gantinya. |
| 39,25 | Cuma satu kalimat. |
| 40,9 | Simpan video ini, dan komen topik skripsimu di bawah. |
