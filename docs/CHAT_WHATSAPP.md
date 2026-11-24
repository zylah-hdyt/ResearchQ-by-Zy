# Catat lewat WhatsApp (chat channel)

Kirim pesan ke nomor MyFi di WhatsApp, dan transaksinya masuk ke akun masing-masing.

```
makan siang 25rb            → pengeluaran Rp 25.000, kategori Makan & minum
gaji 5jt                    → pemasukan Rp 5.000.000, kategori Gaji
bensin 50rb pakai bca       → dompet BCA
kopi 18rb kemarin           → tanggal kemarin
transfer 500rb bca ke gopay → transfer antar dompet (mata uang sama)
saldo · hari ini · bulan ini · anggaran · batal · bantuan
```

## Cara kerja
```
WhatsApp ──► gateway (Fonnte) ──► Edge Function chat-webhook ──► Supabase (tabel yang sama dengan aplikasi)
                                         │
                                         └── balasan lewat API gateway ──► WhatsApp
```
- `supabase/functions/chat-webhook/parser.ts` membaca pesan (nominal `25rb/1,5jt/25.000`, kategori, dompet, tanggal). Tidak pernah menebak diam-diam: dua nominal berbeda atau tanpa nominal = tidak dicatat, pengguna ditanya.
- `core.ts` percakapan dan balasan (ID/EN sesuai bahasa akun), `provider.ts` satu-satunya file yang tahu bentuk pesan gateway, `index.ts` menghubungkan ke Supabase.
- Nomor pengirim = identitas. Menghubungkan: Pengaturan → Catat lewat WhatsApp → kode 6 angka (berlaku 10 menit, sekali pakai) → kirim `MYFI-123456` dari nomor itu.
- Keamanan: URL webhook memuat kunci rahasia (`?key=`), dibandingkan constant-time; pesan grup dan pesan dari perangkat sendiri diabaikan; pengiriman ganda dicegah (`chat_events`); `batal` hanya menghapus catatan terakhir yang dibuat lewat chat; tabel kode dan event tidak bisa dibaca klien (RLS tanpa policy).
- Zona waktu "hari ini" = WIB. Transfer beda mata uang ditolak (perlu nominal diterima), nominal di atas Rp 10 miliar ditolak.

## Yang diuji
- 80 tes unit untuk pembaca pesan, percakapan (penyimpanan dalam memori), dan pembaca pesan gateway.
- Migrasi dijalankan di Postgres 16 lokal bersama semua migrasi sebelumnya; diuji: pengguna A tidak bisa melihat atau mengubah data pengguna B, klien tidak bisa menulis tautan atau membaca kode, nomor ganda dan nomor tidak valid ditolak, tabrakan kode ditangani, hapus akun menghapus tautan, foreign key komposit menolak dompet milik pengguna lain.
- Fungsi lolos `deno check`; jalur HTTP (kunci salah, metode salah, pesan grup, isi tidak dikenal) diuji dengan server Deno lokal.

## Belum bisa diuji dari sini (harus Anda cek setelah setup)
- **Format pesan Fonnte.** Dokumentasi Fonnte tidak bisa dibuka dari lingkungan pengembangan, jadi nama field (`sender`, `message`, `device`, `member`) dan API kirim (`POST https://api.fonnte.com/send`, header `Authorization`) ditulis dari pengetahuan umum dan belum dicocokkan. Pembacanya longgar, dan pesan yang tidak terbaca dicatat (hanya nama field, bukan isi) di log fungsi. Kalau ada yang berbeda, cukup `provider.ts` yang diubah.
- Batas paket gratis Fonnte (jumlah pesan, penambahan tulisan "sent via fonnte") belum bisa saya verifikasi.
- Alur lengkap dari WhatsApp sungguhan.

## Risiko yang perlu Anda tahu
- Fonnte adalah gateway tidak resmi: menyambungkan nomor WhatsApp lewat QR seperti WhatsApp Web. WhatsApp bisa membatasi atau memblokir nomor yang dipakai bot. **Pakai nomor khusus, bukan nomor pribadi.**
- Isi pesan dan nomor pengguna melewati pihak ketiga (Fonnte). Kebijakan Privasi harus menyebutnya sebelum fitur dibuka untuk pengguna lain (ubah `app/src/lib/legal.ts` dan naikkan `TERMS_VERSION`: semua pengguna akan diminta menyetujui ulang).
- Cara resmi (Meta WhatsApp Cloud API) lebih aman terhadap pemblokiran, tetapi butuh akun Meta Business dan biayanya belum bisa dipastikan gratis. Hanya `provider.ts` yang perlu diganti.

## Setup (urutan)
1. **Supabase → SQL Editor:** jalankan isi `supabase/migrations/20261124000000_chat_channel.sql`.
2. **Fonnte:** daftar, sambungkan nomor WhatsApp khusus bot (scan QR), salin token perangkat.
3. **Edge Function:** deploy `supabase/functions/chat-webhook` dengan verifikasi JWT dimatikan (`supabase functions deploy chat-webhook --no-verify-jwt`).
4. **Secrets** (Supabase → Edge Functions → Secrets): `CHAT_WEBHOOK_SECRET` = teks acak panjang, `FONNTE_TOKEN` = token dari langkah 2.
5. **Fonnte → Webhook:** `https://<project-ref>.supabase.co/functions/v1/chat-webhook?key=<CHAT_WEBHOOK_SECRET>`; aktifkan "auto read" bila ada.
6. **Netlify → Environment variables:** `VITE_CHAT_NUMBER` = nomor bot (format `628…`), lalu deploy ulang. Kartu "Catat lewat WhatsApp" baru muncul di Pengaturan setelah ini diisi.
7. Uji: hubungkan dari Pengaturan, kirim `bantuan`, lalu `makan siang 25rb`.
