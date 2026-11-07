"""Builds the YouTube script PDF (HTML -> Chromium print)."""
import base64, sys, html
S = sys.argv[1]; F = f'{S}/fonts'
b = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
fonts = {
    ('Inter', 400, 'normal'): 'inter-5.0.18/files/inter-latin-400-normal.woff2',
    ('Inter', 600, 'normal'): 'inter-5.0.18/files/inter-latin-600-normal.woff2',
    ('Inter', 700, 'normal'): 'inter-5.0.18/files/inter-latin-700-normal.woff2',
    ('PJS', 800, 'normal'): 'plus-jakarta-sans-5.0.20/files/plus-jakarta-sans-latin-800-normal.woff2',
    ('JBM', 500, 'normal'): 'jetbrains-mono-5.0.20/files/jetbrains-mono-latin-500-normal.woff2',
    ('IS', 400, 'italic'): 'instrument-serif-5.0.19/files/instrument-serif-latin-400-italic.woff2',
}
ff = ''.join(f"@font-face{{font-family:'{n}';font-weight:{w};font-style:{s};src:url(data:font/woff2;base64,{b(F + '/fontsource-' + p)}) format('woff2')}}" for (n, w, s), p in fonts.items())

# ---- the script: (time, title, VO paragraphs, visual notes, on-screen text)
SEC = [
 ('0:00 – 0:25', 'Hook', [
   'Pernah ngisi kuesioner penelitian punya teman? Kamu baca pertanyaannya, mikir sebentar, terus klik… angka empat. Setuju. Selesai.',
   'Tapi pernah kepikiran nggak, setelah kamu klik, jawaban itu pergi ke mana?',
   'Ternyata, satu angka kecil itu menempuh perjalanan yang panjang, dan ikut menentukan kesimpulan sebuah penelitian. Di video ini kita pakai satu cerita sederhana, dan di akhir kamu bakal paham alur penelitian kuantitatif dari awal sampai akhir. Yuk, kita ikutin perjalanannya.'],
  ['Layar HP 3D: kuesioner online, jari menekan angka 4.', 'Angka “4” lepas dari layar, menyala, lalu terbang masuk ke dunia 3D.', 'Judul video muncul.'],
  ['Ke mana jawabanmu pergi?', 'Perjalanan Satu Jawaban']),
 ('0:25 – 1:05', 'Asal-usul sebuah pertanyaan', [
   'Kenalan dulu sama tokoh utama kita: si Empat. Dia lahir dari jawaban Sari, responden penelitian Dimas tentang kepuasan pelanggan kedai kopi.',
   'Pertanyaan yang dijawab Sari bunyinya: “Pelayan merespons pesanan saya dengan cepat.”',
   'Tapi pertanyaan itu nggak muncul begitu saja. Dimas menurunkannya dari <b>teori</b>. Teori bilang kualitas pelayanan punya beberapa aspek, salah satunya ketanggapan. Aspek itu jadi <b>indikator</b>, dan indikator diubah jadi <b>pertanyaan</b>.',
   'Teori itu biasanya diambil dari buku atau jurnal yang sudah diuji peneliti sebelumnya. Makanya, pertanyaan kuesioner yang baik nggak dibuat asal, tapi punya dasar.',
   'Jadi sebelum si Empat lahir, ada teori yang menjadi “orang tuanya”.'],
  ['Pohon 3D: akar = teori, batang = variabel, cabang = indikator, daun = butir pertanyaan.', 'Satu daun bertuliskan pertanyaan, si Empat jatuh dari daun itu.'],
  ['Teori → Variabel → Indikator → Pertanyaan']),
 ('1:05 – 1:40', 'Bergabung dengan ratusan jawaban', [
   'Si Empat nggak sendirian. Ada ratusan responden lain yang mengisi kuesioner yang sama. Semua jawaban mereka dikumpulkan dalam satu tabel besar.',
   'Satu baris untuk satu responden, satu kolom untuk satu pertanyaan. Inilah yang disebut <b>tabulasi data</b>.',
   'Kebayang kan, kalau ada dua ratus responden dan dua puluh pertanyaan, berarti ada empat ribu angka seperti si Empat di dalam tabel ini.',
   'Di tabel ini si Empat dapat “alamat”: baris ke-57, kolom pertanyaan nomor tiga.'],
  ['Hujan angka dari langit jatuh rapi ke grid raksasa seperti kota.', 'Kamera menyorot si Empat di sel “baris 57, P3”.'],
  ['Tabulasi: baris = responden, kolom = pertanyaan']),
 ('1:40 – 2:20', 'Pos pemeriksaan pertama: data bersih', [
   'Sebelum dianalisis, data harus melewati pos pemeriksaan. Ada responden yang jawabannya nggak lengkap. Ada juga yang jawab angka sama terus dari awal sampai akhir. Kemungkinan dia ngisi asal-asalan.',
   'Data seperti ini perlu dicek dan, kalau memang bermasalah, dikeluarkan. Proses ini disebut <b>pembersihan data</b>. Kenapa penting? Karena data yang kacau bisa menggeser hasil seluruh penelitian. Ibaratnya satu bahan basi bisa merusak satu panci masakan.',
   'Untungnya Sari menjawab dengan serius. Si Empat lolos.'],
  ['Gerbang scanner 3D; baris data lewat satu per satu.', 'Baris kosong & baris “4-4-4-4-4…” menyala merah lalu terlempar keluar.', 'Baris Sari menyala hijau.'],
  ['Data tidak lengkap', 'Jawaban asal-asalan', '✓ Lolos']),
 ('2:20 – 3:05', 'Ujian alat ukur: valid dan reliabel', [
   'Pos berikutnya lebih ketat. Kali ini yang diuji bukan respondennya, tapi <b>pertanyaannya</b>.',
   '<b>Validitas</b> mengecek apakah sebuah pertanyaan benar-benar mengukur hal yang dimaksud. <b>Reliabilitas</b> mengecek apakah alat ukurnya konsisten, misalnya jawabannya stabil kalau diukur dengan cara yang sama.',
   'Gampangnya begini. Valid itu kayak menimbang beras pakai timbangan, bukan pakai penggaris. Reliabel itu kalau kamu menimbang beras yang sama dua kali, hasilnya tetap sama.',
   'Di sini ada kejadian sedih. Satu pertanyaan lain ternyata nggak valid, karena jawabannya nggak sejalan dengan pertanyaan-pertanyaan sejenis. Pertanyaan itu harus gugur.',
   'Pertanyaan si Empat? Valid dan reliabel. Perjalanan berlanjut.'],
  ['Timbangan 3D & penggaris raksasa mengukur tiap kolom pertanyaan.', 'Satu kolom retak dan jatuh (item gugur).', 'Kolom si Empat diberi cap “VALID”.'],
  ['Validitas: mengukur yang dimaksud?', 'Reliabilitas: konsisten?', 'Timbangan, bukan penggaris', 'Item tidak valid → gugur']),
 ('3:05 – 3:35', 'Bersatu jadi satu variabel', [
   'Setelah lolos, si Empat bergabung dengan jawaban Sari di pertanyaan lain tentang pelayanan. Nilai-nilai itu digabung jadi satu skor: skor <b>kualitas pelayanan</b> menurut Sari.',
   'Di titik ini, si Empat bukan lagi angka yang berdiri sendiri. Dia sudah jadi bagian dari sebuah <b>variabel</b>.',
   'Hal yang sama terjadi pada jawaban-jawaban tentang kepuasan. Sekarang ada dua variabel yang siap dipertemukan: kualitas pelayanan dan kepuasan pelanggan.'],
  ['Beberapa angka bercahaya bergabung membentuk satu bola besar berlabel “Kualitas Pelayanan”.', 'Di seberang, bola lain terbentuk: “Kepuasan Pelanggan”.'],
  ['Skor item → skor variabel']),
 ('3:35 – 4:15', 'Ujian terakhir: uji hipotesis', [
   'Sekarang ujian paling penting. Dimas punya hipotesis: kualitas pelayanan berpengaruh terhadap kepuasan pelanggan.',
   'Ratusan skor pelayanan dan ratusan skor kepuasan diuji bersama. Pertanyaannya sederhana: apakah pola hubungan yang terlihat cukup kuat, atau cuma kebetulan?',
   'Hasilnya: pengaruhnya <b>signifikan</b>. Hipotesis Dimas diterima.',
   'Kalau ternyata nggak signifikan, apakah perjalanan si Empat sia-sia? Nggak juga. Hasil yang tidak signifikan tetap informasi penting, asal dibahas dengan jujur dan dikaitkan dengan teori.'],
  ['Jembatan cahaya terbentuk di antara dua bola variabel.', 'Bayangan “kebetulan” mencoba memutus jembatan, tapi jembatan bertahan.', 'Stempel: H<sub>1</sub> DITERIMA.'],
  ['Hipotesis: Pelayanan → Kepuasan', 'Kuat atau kebetulan?', 'H1 diterima', 'Tidak signifikan ≠ gagal']),
 ('4:15 – 4:45', 'Sampai di kesimpulan', [
   'Akhirnya si Empat tiba di tujuan: BAB 5. Kesimpulan Dimas berbunyi: semakin baik kualitas pelayanan, semakin tinggi kepuasan pelanggan. Lalu muncul saran untuk pemilik kedai: perbaiki kecepatan pelayanan.',
   'Bayangin, satu klik dari Sari ikut membentuk kesimpulan itu.',
   'Jadi kalau kamu ngisi kuesioner teman, isilah dengan jujur. Dan kalau kamu yang meneliti, ingat bahwa setiap tahap punya alasan, dan setiap jawaban berharga.'],
  ['Si Empat naik ke puncak menara, menjadi satu titik cahaya di dokumen BAB 5.', 'Kamera mundur: kedai kopi 3D, pelayan bergerak lebih cepat.'],
  ['BAB 5: Kesimpulan & Saran', 'Isi kuesioner dengan jujur']),
 ('4:45 – 5:00', 'Penutup & CTA', [
   'Kalau video ini membantu kamu memahami alur penelitian, subscribe <b>NotYourLecture</b>, dan follow juga TikTok dan Instagram <b>@researchq.id</b>. Sampai ketemu di perjalanan berikutnya!'],
  ['Layar CTA dengan logo YouTube, TikTok, Instagram.', 'Si Empat melambai bersama maskot.'],
  ['Subscribe NotYourLecture', 'TikTok & IG @researchq.id']),
]
import re
plain = lambda s: re.sub(r'<[^>]+>', '', s)
words = sum(len(plain(p).split()) for s in SEC for p in s[2])

def sec_html(i, s):
    t, title, vo, vis, ost = s
    return f'''<section class="sec"><div class="hd"><span class="tm">{t}</span><span class="no">BABAK {i+1}</span></div><h2>{title}</h2>
 <div class="grid"><div class="vo"><div class="lab">NASKAH VO, dibaca kamu</div>{''.join(f'<p>{p}</p>' for p in vo)}</div>
 <div class="side"><div class="lab">VISUAL, dibuat Claude</div><ul>{''.join(f'<li>{v}</li>' for v in vis)}</ul>
 <div class="lab" style="margin-top:14px">TEKS DI LAYAR</div>{''.join(f'<div class="ost">{o}</div>' for o in ost)}</div></div></section>'''

doc = f'''<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Script YouTube: Perjalanan Satu Jawaban</title><style>{ff}
@page{{size:A4;margin:16mm 15mm 16mm 15mm}}
:root{{--ink:#13294B;--mut:#6B7A90;--line:#DDE5EF;--acc:#2E9BE6;--accl:#E6F2FC;--org:#EE6A1F}}
*{{box-sizing:border-box}} body{{margin:0;font-family:Inter;color:var(--ink);font-size:10.5pt;line-height:1.55}}
h1{{font-family:PJS;font-weight:800;font-size:26pt;line-height:1.08;letter-spacing:-.02em;margin:8px 0 6px}}
h1 i{{font-family:IS;font-style:italic;font-weight:400;color:var(--acc)}}
h2{{font-family:PJS;font-weight:800;font-size:15pt;margin:2px 0 10px;letter-spacing:-.01em}}
.kick{{font-family:JBM;font-size:8.5pt;letter-spacing:.14em;color:var(--mut)}}
.meta{{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:16px 0 14px}}
.meta div{{background:var(--accl);border-radius:10px;padding:9px 12px}} .meta b{{display:block;font-family:JBM;font-weight:500;font-size:7.5pt;letter-spacing:.12em;color:var(--mut)}}
.box{{border:1.5px solid var(--line);border-radius:12px;padding:12px 16px;margin:10px 0}} .box h3{{font-family:PJS;font-weight:800;font-size:11pt;margin:0 0 6px}}
.box ul{{margin:0;padding-left:18px}} .box li{{margin:2px 0}}
.sec{{border-top:2px solid var(--ink);padding-top:10px;margin-top:18px;break-inside:avoid;page-break-inside:avoid}}
.hd{{display:flex;justify-content:space-between;font-family:JBM;font-size:8.5pt;letter-spacing:.1em}} .tm{{color:var(--acc)}} .no{{color:var(--mut)}}
.grid{{display:grid;grid-template-columns:1.55fr 1fr;gap:16px}}
.vo p{{margin:0 0 7px;font-size:11.5pt;line-height:1.6}} .vo b{{color:var(--acc)}}
.lab{{font-family:JBM;font-size:7.5pt;letter-spacing:.12em;color:var(--mut);margin-bottom:6px}}
.side{{background:#F5F8FC;border-radius:10px;padding:10px 12px;font-size:9.5pt;align-self:start;break-inside:avoid}} .side ul{{margin:0;padding-left:16px}} .side li{{margin:2px 0}}
.ost{{display:inline-block;background:var(--ink);color:#fff;border-radius:6px;padding:2px 8px;margin:2px 4px 2px 0;font-size:8.5pt;font-weight:600}}
.brand{{font-family:PJS;font-weight:800}} .brand i{{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--org);margin-left:2px}}
.foot{{margin-top:20px;font-size:8.5pt;color:var(--mut)}}
</style></head><body>
<div class="kick">SCRIPT YOUTUBE · NOTYOURLECTURE × <span class="brand">ResearchQ<i></i></span></div>
<h1>Ke Mana Jawabanmu Pergi Setelah <i>Mengisi Kuesioner?</i></h1>
<div style="font-size:12pt;color:var(--mut)">Alur penelitian kuantitatif dari pertanyaan sampai kesimpulan, lewat perjalanan satu jawaban di dunia 3D</div>
<div class="meta"><div><b>DURASI</b>± 5 menit</div><div><b>FORMAT</b>16:9 · 1920×1080</div><div><b>PANJANG NASKAH</b>± {words} kata</div><div><b>GAYA</b>Storytelling + 3D</div></div>
<div class="box"><h3>Judul alternatif</h3><ul><li>Perjalanan Satu Jawaban: Dari Kuesioner Sampai Kesimpulan Penelitian</li><li>Satu Klik yang Menentukan Hasil Skripsi</li><li>Alur Penelitian Kuantitatif, Diceritakan dari Sudut Pandang Data</li></ul></div>
<div class="box"><h3>Tips rekaman (cukup pakai HP)</h3><ul>
<li>Rekam di ruangan kecil yang tenang (kamar dengan kasur/lemari baju lebih bagus dari ruangan kosong). Matikan kipas/AC kalau bisa.</li>
<li>Jarak HP ± 15–20 cm dari mulut, sedikit di samping supaya bunyi “p/b” tidak meletup.</li>
<li>Diam 2 detik di awal rekaman (untuk sampel suara ruangan, dipakai saat membersihkan noise).</li>
<li>Beri jeda ± 1 detik antar babak. Kalau salah ucap, diam sebentar lalu <b>ulangi seluruh kalimat</b>, nanti saya potong.</li>
<li>Gaya bicara santai seperti ngobrol, tempo sedang. Boleh rekam per babak (9 file) atau satu file utuh.</li>
<li>Kirim file aslinya (.m4a / .wav), jangan lewat WhatsApp karena kualitasnya dikompres.</li></ul></div>
{''.join(sec_html(i, s) for i, s in enumerate(SEC))}
<div class="box" style="margin-top:22px"><h3>Catatan isi</h3><ul>
<li>Konsepnya umum dan tidak bergantung software tertentu; di layar tidak ditampilkan merek aplikasi statistik.</li>
<li>Urutan teori → variabel → indikator → butir pertanyaan, pembersihan data, uji validitas & reliabilitas, skor variabel, lalu uji hipotesis adalah alur umum penelitian kuantitatif berbasis kuesioner. Detail teknisnya (jenis uji, rumus) bisa berbeda tiap metode dan pedoman kampus, jadi naskah sengaja tidak menyebut angka batas tertentu.</li>
<li>“Jawaban sama terus dari awal sampai akhir” disebut <i>kemungkinan</i> asal-asalan, karena tetap perlu dicek, bukan otomatis dibuang.</li>
<li>Dimas, Sari, kedai kopi, dan hasil “signifikan” adalah cerita ilustrasi; di layar akan diberi label <i>*ilustrasi</i>.</li></ul></div>
<div class="foot">Setelah rekaman dikirim: suara dibersihkan & dirapikan, timing per kata diambil otomatis, lalu seluruh visual 3D, caption kinetic, SFX, chapter YouTube, dan thumbnail dibuat menyesuaikan suaramu.</div>
</body></html>'''
open(f'{S}/yt1/script2.html', 'w').write(doc)
print('words', words)
