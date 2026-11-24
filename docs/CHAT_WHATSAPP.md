# Catat lewat WhatsApp (chat channel)

Pengguna mengirim pesan ke bot WhatsApp, Fonnte meneruskan pesan mentah ke database, **database yang memprosesnya**, dan hasilnya langsung tampil di web.

```
makan siang 25rb            → pengeluaran Rp 25.000, kategori Makan & minum
gaji 5jt                    → pemasukan Rp 5.000.000, kategori Gaji
bensin 50rb pakai bca       → dompet BCA
kopi 18rb kemarin           → tanggal kemarin
transfer 500rb bca ke gopay → transfer antar dompet (mata uang sama)
saldo · hari ini · bulan ini · anggaran · batal · bantuan
```

## Alur
```
Pengguna ──WhatsApp──► Bot (nomor yang sudah disiapkan) ──► Fonnte
                                                              │ webhook (POST, pesan mentah)
                                                              ▼
                                   Edge Function chat-webhook  (hanya relay: cek kunci, tanpa logika)
                                                              │ INSERT pesan mentah
                                                              ▼
   ┌──────────────────────── DATABASE (Postgres / Supabase) ───────────────────────┐
   │ chat_inbox  ── trigger BEFORE INSERT ──► chat_process():                       │
   │   • kenali nomor → akun  • baca pesan (chat_parse)  • tulis transaksi           │
   │   • hitung saldo/total   • susun balasan (ID/EN)    • simpan status + balasan   │
   └──────────────────────────────────────────────────────────────────────────────┘
                     │ baris balasan                                  │ Realtime
                     ▼                                                ▼
        Edge Function mengirim balasan ke Fonnte          Web MyFi memuat ulang data otomatis
                     │                                    + riwayat pesan di Pengaturan
                     ▼
              Balasan di WhatsApp
```
- **Pesan mentah disimpan** apa adanya (`chat_inbox` untuk pesan + hasil, `chat_inbox_raw` untuk payload asli dari gateway, hanya service role).
- **Semua pemrosesan di database**: fungsi `chat_parse` (membaca nominal `25rb/1,5jt/25.000`, kategori, dompet, tanggal), `chat_process` (percakapan, perintah, balasan), `chat_balances`. Edge Function tidak mengurai pesan.
- **Tampil di web**: transaksi masuk lewat tabel yang sama dengan aplikasi, jadi muncul di Dasbor, Transaksi, Dompet, Anggaran, Laporan, dan Excel. Web mendengarkan Realtime pada `chat_inbox` dan memuat ulang data (juga saat tab kembali dibuka). Kartu Pengaturan menampilkan 5 pesan terakhir beserta apakah dipahami.
- Menghubungkan: Pengaturan → Catat lewat WhatsApp → kode 6 angka (10 menit, sekali pakai) → kirim `MYFI-123456` dari nomor yang ingin dihubungkan.
- Pesan yang tidak jelas (tanpa nominal, dua nominal berbeda, nama dompet salah) tidak dicatat; pengguna ditanya. Transfer beda mata uang ditolak. Nominal di atas Rp 10 miliar ditolak. "Hari ini" mengikuti WIB.
- Keamanan: URL webhook memuat kunci rahasia (`?key=`, dibandingkan constant-time); pesan grup dan dari perangkat sendiri diabaikan; pengiriman ganda tidak dicatat dua kali (kunci per id pesan + advisory lock); kegagalan memproses membatalkan semua perubahan untuk pesan itu dan pengirim mendapat permintaan maaf; klien tidak bisa membaca nomor, payload mentah, atau kode, dan tidak bisa menulis ke inbox.
- Retensi: pesan tertaut 90 hari, pesan dari nomor asing 7 hari.

## Yang diuji
- **100 pemeriksaan SQL** (`supabase/tests/run.sh`) pada Postgres 16 dengan semua migrasi: pembaca pesan (nominal, kategori, dompet, tanggal, transfer, perintah), percakapan terhadap tabel sungguhan (pencatatan dalam satuan terkecil, saldo dihitung independen, transfer tidak mengubah total, batal, laporan, anggaran, bahasa, kegagalan membatalkan semuanya, pengiriman ganda), dan hak akses (pengguna A tidak bisa melihat/mengubah data B, klien tidak bisa menulis inbox/tautan/kode, hapus akun menghapus pesan dan tautan). Dijalankan otomatis di CI.
- Edge Function: lolos `deno check`; jalur HTTP (kunci salah, metode salah, pesan grup, isi tidak dikenal) diuji di server Deno lokal.
- Pembaca pesan gateway: 7 tes unit.

## Belum bisa diuji dari sini (cek setelah setup)
- **Format pesan Fonnte.** Dokumentasi Fonnte tidak bisa dibuka dari lingkungan pengembangan, jadi nama field (`sender`, `message`, `device`, `member`) dan API kirim (`POST https://api.fonnte.com/send`, header `Authorization`) ditulis dari pengetahuan umum, belum dicocokkan. Pembacanya longgar; pesan yang tidak terbaca dicatat (nama field saja) di log fungsi, dan payload asli tersimpan di `chat_inbox_raw`. Kalau berbeda, cukup `provider.ts` yang diubah.
- Jalur Edge Function → PostgREST → trigger (diuji hanya sampai trigger, lewat SQL), Realtime di web, dan alur lengkap dari WhatsApp sungguhan.
- Batas paket gratis Fonnte.

## Risiko
- Fonnte tidak resmi: nomor disambungkan lewat QR seperti WhatsApp Web, WhatsApp bisa membatasi nomor yang dipakai bot. Pakai nomor khusus bot.
- Isi pesan dan nomor melewati pihak ketiga. Kebijakan Privasi harus menyebutnya sebelum dibuka untuk pengguna lain (`app/src/lib/legal.ts`, naikkan `TERMS_VERSION`: semua pengguna diminta menyetujui ulang).
- Mengubah kata kunci kategori: edit tabel `chat_keywords` (tanpa deploy ulang).

## Setup (urutan)
1. **Supabase → SQL Editor:** jalankan `supabase/migrations/20261124000000_chat_channel.sql`.
2. **Fonnte:** sambungkan nomor bot, salin token perangkat.
3. **Edge Function:** deploy `supabase/functions/chat-webhook` dengan verifikasi JWT dimatikan (`--no-verify-jwt`).
4. **Secrets** (Supabase → Edge Functions): `CHAT_WEBHOOK_SECRET` = teks acak panjang, `FONNTE_TOKEN`.
5. **Fonnte → Webhook:** `https://<project-ref>.supabase.co/functions/v1/chat-webhook?key=<CHAT_WEBHOOK_SECRET>`.
6. **Netlify → Environment variables:** `VITE_CHAT_NUMBER` = nomor bot (`628…`), deploy ulang. Kartu di Pengaturan baru muncul setelah ini diisi.
7. Uji: hubungkan dari Pengaturan, kirim `bantuan`, lalu `makan siang 25rb`.
