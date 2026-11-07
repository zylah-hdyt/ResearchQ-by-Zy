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
 ('0:00 – 0:30', 'Hook', [
   'Bayangin kamu lagi ngerjain skripsi, terus dosen bilang, “Populasi penelitian kamu seribu orang.”',
   'Terus… kamu harus nanya seribu orang itu satu per satu?',
   'Banyak mahasiswa panik di tahap ini. Padahal konsepnya sederhana banget.',
   'Tenang. Kamu nggak perlu. Di video ini kita ikutin cerita Dimas, dan kamu bakal paham populasi, sampel, sampai cara milih responden, tanpa ribet.'],
  ['Kamera 3D terbang di atas kota mini, ribuan orang kecil bergerak.', 'Angka 1.000 muncul besar di langit kota.', 'Judul video muncul.'],
  ['1.000 ORANG?', 'Kenapa kamu nggak perlu wawancarai semuanya']),
 ('0:30 – 1:00', 'Masalah Dimas', [
   'Ini Dimas, mahasiswa semester tujuh. Judul skripsinya: <i>Pengaruh Harga terhadap Kepuasan Pelanggan Kedai Kopi</i>.',
   'Di kotanya ada sekitar seribu pelanggan kedai kopi. Masalahnya, waktunya tinggal tiga bulan, dan uangnya… ya, uang mahasiswa.',
   'Nyebar kuesioner ke seribu orang? Jelas nggak realistis.',
   'Dimas sempat kepikiran, “Apa aku tanya teman-teman di kafe dekat kampus aja, ya?” Hmm… simpan dulu ide itu. Nanti kita lihat akibatnya.'],
  ['Dimas (karakter 3D sederhana) di meja belajar, laptop terbuka.', 'Kalender deadline mendekat, dompet tipis.', 'Tumpukan 1.000 kuesioner menggunung lalu runtuh.'],
  ['Deadline: 3 bulan', '1.000 kuesioner = ✕']),
 ('1:00 – 1:45', 'Populasi vs Sampel', [
   'Pertama, kenalan dulu sama dua istilah penting.',
   '<b>Populasi</b> adalah seluruh orang atau objek yang ingin kamu teliti. Di cerita ini, populasinya seribu pelanggan kedai kopi di kota Dimas.',
   '<b>Sampel</b> adalah sebagian dari populasi yang benar-benar kamu ambil datanya.',
   'Ibaratnya kayak nyicip sup. Kamu nggak perlu ngabisin satu panci buat tahu rasanya asin atau nggak. Cukup satu sendok, asal supnya diaduk dulu.',
   'Jadi sebelum ngitung apa pun, tulis dulu populasimu dengan jelas: siapa, di mana, dan kapan.',
   'Nah, soal sup tadi, “diaduk dulu” ini penting banget. Nanti kamu tahu kenapa.'],
  ['Seluruh kota menyala biru muda = populasi.', 'Sebagian orang terangkat dan menyala biru terang = sampel.', 'Transisi ke panci sup 3D, sendok mengaduk lalu mencicip.'],
  ['POPULASI = semua', 'SAMPEL = sebagian yang mewakili']),
 ('1:45 – 2:30', 'Berapa banyak yang ditanya?', [
   'Pertanyaan berikutnya: berapa orang yang harus ditanya?',
   'Salah satu rumus yang sering dipakai di skripsi adalah <b>rumus Slovin</b>: n sama dengan N dibagi satu tambah N kali e kuadrat. N itu jumlah populasi, e itu batas kesalahan yang kamu toleransi.',
   'Kalau populasinya seribu dan batas kesalahannya lima persen, hasilnya sekitar dua ratus delapan puluh enam orang.',
   'Semakin kecil batas kesalahan, semakin banyak sampel yang dibutuhkan. Kalau Dimas pakai sepuluh persen, cukup sekitar sembilan puluh satu orang, tapi hasilnya jadi kurang presisi.',
   'Dari seribu jadi dua ratus delapan puluh enam. Jauh lebih masuk akal, kan? Tapi ingat, rumus yang dipakai sebaiknya disesuaikan dengan pedoman kampus dan arahan dosen pembimbingmu.'],
  ['Papan rumus 3D berdiri di alun-alun kota.', 'Angka dimasukkan satu per satu, hasil dihitung naik ke 286.', 'Orang-orang di kota: 286 menyala, sisanya redup.'],
  ['n = N / (1 + N·e²)', 'N = 1.000 · e = 5% → n ≈ 286']),
 ('2:30 – 3:40', 'Cara memilih responden', [
   'Oke, Dimas udah tahu jumlahnya. Sekarang, siapa aja yang dipilih? Di sinilah <b>teknik sampling</b> berperan. Secara umum ada dua kelompok besar.',
   'Yang pertama, <b>probability sampling</b>: setiap anggota populasi punya peluang yang sama untuk terpilih.',
   'Contohnya <b>simple random sampling</b>, kayak undian. Semua nama dimasukkan, lalu diambil secara acak.',
   'Ada juga <b>stratified sampling</b>. Populasi dibagi dulu ke beberapa kelompok, misalnya berdasarkan wilayah atau usia, lalu sampel diambil dari setiap kelompok secara proporsional. Misalnya kota Dimas punya empat kecamatan. Kecamatan yang pelanggannya lebih banyak, sampelnya juga lebih banyak. Jadi semua kelompok terwakili.',
   'Dan <b>cluster sampling</b>, yang memilih beberapa wilayah secara acak, lalu meneliti orang-orang di wilayah itu.',
   'Yang kedua, <b>non-probability sampling</b>: tidak semua orang punya peluang yang sama. Yang paling sering dipakai mahasiswa adalah <b>purposive sampling</b>, yaitu responden dipilih berdasarkan kriteria tertentu.',
   'Misalnya Dimas cuma mau responden yang beli kopi minimal dua kali sebulan. Yang nggak memenuhi kriteria, nggak dipilih.',
   'Ada juga <b>accidental sampling</b>: siapa yang kebetulan ditemui, itu yang ditanya. Praktis, tapi hati-hati, karena teknik ini paling gampang bikin hasil penelitian jadi bias.'],
  ['Lampu sorot acak menyapu kota, menyinari orang secara acak (random).', 'Kota terbagi 4 kecamatan warna; dari tiap kecamatan diambil orang sebanding ukurannya (stratified).', 'Dua wilayah dipilih acak lalu menyala penuh (cluster).', 'Hanya orang yang memegang cangkir kopi yang menyala (purposive).', 'Dimas berdiri di satu sudut jalan, hanya orang yang lewat yang menyala (accidental).'],
  ['PROBABILITY: random · stratified · cluster', 'NON-PROBABILITY: purposive · accidental', 'Kriteria: beli kopi ≥ 2×/bulan']),
 ('3:40 – 4:15', 'Plot twist: sampel bias', [
   'Tapi di sinilah Dimas bikin kesalahan. Karena buru-buru, dia cuma nyebar kuesioner di satu kafe mahal dekat kampus.',
   'Hasilnya? Hampir semua responden bilang harga kopinya murah.',
   'Padahal yang nongkrong di kafe mahal ya memang orang-orang yang nggak masalah sama harga mahal.',
   'Inilah yang disebut <b>sampel bias</b>: sampelnya nggak mewakili populasi. Ibarat nyicip sup tanpa diaduk, kamu cuma kena bagian atasnya. Dan kesimpulan dari sampel yang bias bisa menyesatkan.',
   'Solusinya? Sebar kuesioner ke beberapa kedai kopi dengan kisaran harga berbeda, atau pakai stratified sampling supaya semua kelompok terwakili.'],
  ['Kamera zoom ke satu kafe mewah; semua responden datang dari situ.', 'Grafik batang hasil miring ke “murah”.', 'Kembali ke panci sup tanpa diaduk; stempel SAMPEL BIAS.', 'Solusi: titik sampel menyebar ke kedai murah, sedang, mahal; grafik kembali seimbang.'],
  ['Semua responden dari 1 kafe', 'SAMPEL BIAS → hasil menyesatkan']),
 ('4:15 – 4:45', 'Rangkuman', [
   'Jadi, sebelum nyebar kuesioner, ingat tiga langkah ini.',
   'Satu, tentukan populasi dengan jelas. Dua, hitung jumlah sampel yang kamu butuhkan. Tiga, pilih teknik sampling yang tepat, supaya sampelmu benar-benar mewakili populasi.',
   'Dan satu lagi: tulis alasan kamu memilih teknik sampling itu di BAB 3, karena bagian ini sering ditanyakan saat sidang.'],
  ['Kamera naik tinggi, kota terlihat utuh.', 'Tiga kartu langkah melayang di atas kota, muncul satu per satu.'],
  ['1. Tentukan populasi', '2. Hitung jumlah sampel', '3. Pilih teknik sampling', 'Tulis alasannya di BAB 3']),
 ('4:45 – 5:00', 'Penutup & CTA', [
   'Kalau video ini membantu, subscribe <b>NotYourLecture</b>, dan follow juga TikTok dan Instagram <b>@researchq.id</b>. Sampai ketemu di video berikutnya!'],
  ['Layar CTA dengan logo YouTube, TikTok, Instagram.', 'Maskot melambaikan tangan / jempol.'],
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

doc = f'''<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Script YouTube: Populasi & Sampel</title><style>{ff}
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
<h1>Kenapa Kamu Nggak Perlu Wawancarai <i>1.000 Orang?</i></h1>
<div style="font-size:12pt;color:var(--mut)">Populasi, sampel, dan teknik sampling dijelaskan lewat cerita kota mini 3D</div>
<div class="meta"><div><b>DURASI</b>± 5 menit</div><div><b>FORMAT</b>16:9 · 1920×1080</div><div><b>PANJANG NASKAH</b>± {words} kata</div><div><b>GAYA</b>Storytelling + 3D</div></div>
<div class="box"><h3>Judul alternatif</h3><ul><li>1 Kota, 1.000 Orang: Siapa yang Jadi Responden Skripsimu?</li><li>Salah Pilih Sampel, Hasil Penelitian Bisa Bohong</li><li>Populasi vs Sampel: Penjelasan Paling Gampang (Animasi 3D)</li></ul></div>
<div class="box"><h3>Tips rekaman (cukup pakai HP)</h3><ul>
<li>Rekam di ruangan kecil yang tenang (kamar dengan kasur/lemari baju lebih bagus dari ruangan kosong). Matikan kipas/AC kalau bisa.</li>
<li>Jarak HP ± 15–20 cm dari mulut, sedikit di samping supaya bunyi “p/b” tidak meletup.</li>
<li>Diam 2 detik di awal rekaman (untuk sampel suara ruangan, dipakai saat membersihkan noise).</li>
<li>Beri jeda ± 1 detik antar babak. Kalau salah ucap, diam sebentar lalu <b>ulangi seluruh kalimat</b>, nanti saya potong.</li>
<li>Gaya bicara santai seperti ngobrol, tempo sedang. Boleh rekam per babak (8 file) atau satu file utuh.</li>
<li>Kirim file aslinya (.m4a / .wav), jangan lewat WhatsApp karena kualitasnya dikompres.</li></ul></div>
{''.join(sec_html(i, s) for i, s in enumerate(SEC))}
<div class="box" style="margin-top:22px"><h3>Catatan fakta</h3><ul>
<li>Rumus Slovin: n = N / (1 + N·e²). Untuk N = 1.000 dan e = 5%: 1.000 / 3,5 = 285,7 → dibulatkan ke atas menjadi 286 responden. Untuk e = 10%: 1.000 / 11 = 90,9 → 91 responden.</li>
<li>Slovin populer di skripsi Indonesia, tetapi sebagian dosen memakai rumus lain (mis. tabel Krejcie & Morgan). Karena itu naskah menyebut “sesuaikan dengan pedoman kampus dan arahan dosen”.</li>
<li>Dimas, kota, dan angka 1.000 pelanggan adalah cerita ilustrasi; di layar akan diberi label <i>*ilustrasi</i>.</li></ul></div>
<div class="foot">Setelah rekaman dikirim: suara dibersihkan & dirapikan, timing per kata diambil otomatis, lalu seluruh visual 3D, caption kinetic, SFX, chapter YouTube, dan thumbnail dibuat menyesuaikan suaramu.</div>
</body></html>'''
open(f'{S}/yt1/script.html', 'w').write(doc)
print('words', words)
