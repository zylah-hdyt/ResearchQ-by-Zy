import type { Language } from '../data/types';

/** Bump when the Terms or Privacy Policy change in a way users must re-accept. Format: YYYY-MM-DD. */
export const TERMS_VERSION = '2026-11-22';

/** Public contact address shown in the legal pages (set VITE_CONTACT_EMAIL at build time; empty = not shown). */
export const CONTACT_EMAIL = (import.meta.env.VITE_CONTACT_EMAIL as string | undefined)?.trim() ?? '';

export interface LegalSection { h: string; p?: string[]; list?: string[] }
export interface LegalDoc { title: string; intro: string; sections: LegalSection[] }

const contactLine = (lang: Language) =>
  CONTACT_EMAIL
    ? lang === 'id' ? `Pertanyaan atau permintaan terkait data Anda dapat dikirim ke ${CONTACT_EMAIL}.` : `Questions or requests about your data can be sent to ${CONTACT_EMAIL}.`
    : lang === 'id' ? 'Pertanyaan atau permintaan terkait data Anda dapat disampaikan kepada pengembang (Zy) melalui kanal tempat Anda memperoleh tautan aplikasi ini.' : 'Questions or requests about your data can be sent to the developer (Zy) through the channel where you received the link to this app.';

export function legalDocs(lang: Language): { terms: LegalDoc; privacy: LegalDoc } {
  return lang === 'id' ? ID(contactLine('id')) : EN(contactLine('en'));
}

const ID = (contact: string) => ({
  terms: {
    title: 'Syarat Layanan MyFi',
    intro: 'MyFi (My Financial) adalah aplikasi pencatatan keuangan pribadi yang dikembangkan oleh Zy ("kami"). Dengan membuat akun atau memakai MyFi, Anda menyetujui Syarat Layanan ini.',
    sections: [
      { h: '1. Tentang layanan', p: ['MyFi membantu Anda mencatat pemasukan, pengeluaran, transfer, anggaran, dan dompet, melihat laporan, serta mengekspor data ke Excel.', 'MyFi masih dalam tahap pengembangan awal. Fitur dapat berubah, dan layanan dapat mengalami gangguan.'] },
      { h: '2. Akun Anda', list: ['Anda berusia minimal 17 tahun dan memberikan informasi yang benar.', 'Anda menjaga kerahasiaan kata sandi dan bertanggung jawab atas aktivitas di akun Anda.', 'Satu orang satu akun. Beri tahu kami jika Anda curiga akun Anda dipakai orang lain.'] },
      { h: '3. Bukan nasihat keuangan', p: ['Angka, grafik, dan wawasan di MyFi bersifat informasi umum dari data yang Anda masukkan. Ini bukan nasihat keuangan, pajak, hukum, atau investasi.', 'MyFi tidak menyimpan atau memindahkan uang, dan tidak terhubung ke rekening bank Anda.'] },
      { h: '4. Data Anda', list: ['Data yang Anda masukkan tetap milik Anda. Anda memberi kami izin terbatas untuk menyimpan dan memprosesnya semata-mata untuk menjalankan layanan.', 'Anda bertanggung jawab atas keakuratan data tersebut.', 'Kami berupaya menjaga data, tetapi tidak dapat menjamin tidak akan pernah ada kehilangan data. Ekspor data ke Excel secara berkala sebagai cadangan Anda sendiri.'] },
      { h: '5. Penggunaan yang dilarang', list: ['Mengakses akun atau data orang lain tanpa izin.', 'Mengganggu atau membebani layanan, termasuk lewat bot atau pendaftaran massal otomatis.', 'Menguji kerentanan keamanan tanpa izin tertulis, atau menggunakan layanan untuk melanggar hukum.'] },
      { h: '6. Ketersediaan dan penghentian', p: ['Layanan diberikan "sebagaimana adanya" dan tanpa biaya. Kami dapat mengubah, menangguhkan, atau menghentikan fitur atau akun yang melanggar syarat ini.', 'Anda dapat menghapus akun kapan saja di Pengaturan akun; data Anda akan dihapus permanen.'] },
      { h: '7. Batasan tanggung jawab', p: ['Sejauh diizinkan hukum, kami tidak bertanggung jawab atas kerugian tidak langsung, kehilangan data, atau keputusan keuangan yang Anda ambil berdasarkan informasi di MyFi.'] },
      { h: '8. Kekayaan intelektual', p: ['Aplikasi, nama MyFi, dan logo adalah milik pengembang. Data keuangan Anda tetap milik Anda.'] },
      { h: '9. Perubahan syarat', p: ['Kami dapat memperbarui syarat ini. Untuk perubahan penting, kami meminta persetujuan Anda kembali saat Anda masuk. Memakai MyFi setelah itu berarti Anda menerima versi terbaru.'] },
      { h: '10. Hukum yang berlaku', p: ['Syarat ini tunduk pada hukum Republik Indonesia. Perselisihan diselesaikan secara musyawarah terlebih dahulu; jika tidak tercapai, melalui pengadilan yang berwenang di Indonesia.'] },
      { h: '11. Kontak', p: [contact] },
    ],
  },
  privacy: {
    title: 'Kebijakan Privasi MyFi',
    intro: 'Kebijakan ini menjelaskan data apa yang dikumpulkan MyFi, untuk apa, di mana disimpan, dan hak Anda sesuai Undang-Undang Pelindungan Data Pribadi (UU No. 27 Tahun 2022). Pengendali data: Zy, pengembang MyFi.',
    sections: [
      { h: '1. Data yang kami kumpulkan', list: ['Data akun: alamat email, nama lengkap, dan kata sandi. Kata sandi hanya disimpan dalam bentuk hash oleh layanan autentikasi; kami tidak dapat membacanya.', 'Data profil (opsional): nama panggilan, foto profil, nomor telepon, negara, tanggal lahir, serta preferensi bahasa, mata uang, dan tema.', 'Data keuangan yang Anda masukkan: dompet, transaksi, kategori, anggaran, dan kurs mata uang.', 'Data teknis: token sesi dan preferensi di penyimpanan browser Anda, serta log teknis dari penyedia infrastruktur (misalnya alamat IP dan waktu akses) untuk keamanan.'], p: ['Kami tidak meminta data rekening bank, PIN, atau kata sandi bank Anda.'] },
      { h: '2. Untuk apa data dipakai', list: ['Menjalankan fitur: masuk, menyimpan dan menampilkan catatan, laporan, dan ekspor Excel.', 'Menjaga keamanan dan mencegah penyalahgunaan.', 'Menghubungi Anda terkait layanan jika diperlukan.'], p: ['Kami tidak menjual data Anda, tidak menampilkan iklan, dan tidak membagikan data keuangan Anda kepada pihak ketiga untuk pemasaran.'] },
      { h: '3. Di mana data disimpan dan siapa pemrosesnya', p: ['Basis data dan autentikasi dijalankan oleh Supabase (server di wilayah Singapura). Situs dihosting oleh Netlify. Data dikirim lewat koneksi terenkripsi (HTTPS), dan akses basis data dibatasi per pengguna sehingga pengguna lain tidak dapat membaca data Anda.', 'Karena penyedia tersebut dapat memproses data di luar Indonesia, dengan memakai MyFi Anda menyetujui pemrosesan itu.'] },
      { h: '4. Penyimpanan di perangkat Anda', p: ['MyFi menyimpan token sesi masuk serta pilihan bahasa dan tema di penyimpanan browser agar Anda tetap masuk dan pengaturan terjaga. Kami tidak memakai cookie pelacak atau iklan.'] },
      { h: '5. Berapa lama data disimpan', p: ['Selama akun Anda aktif. Jika Anda menghapus akun di Pengaturan akun, akun dan seluruh data keuangan Anda dihapus permanen dari basis data. Log teknis dan salinan cadangan penyedia, jika ada, mengikuti siklus penyedia tersebut.'] },
      { h: '6. Hak Anda', list: ['Mengakses dan memperoleh salinan data: gunakan fitur Ekspor ke Excel.', 'Memperbaiki data: ubah profil dan catatan Anda kapan saja.', 'Menghapus data dan menarik persetujuan: hapus akun di Pengaturan akun.', 'Mengajukan pertanyaan atau keberatan: hubungi kami (lihat bagian Kontak).'] },
      { h: '7. Keamanan', p: ['Kami memakai koneksi terenkripsi, pembatasan akses per pengguna, dan penyimpanan kata sandi dalam bentuk hash. Tidak ada sistem yang sepenuhnya aman; jaga kerahasiaan kata sandi Anda. Jika terjadi insiden yang memengaruhi data Anda, kami akan memberi tahu sesuai ketentuan yang berlaku.'] },
      { h: '8. Anak-anak', p: ['MyFi tidak ditujukan bagi pengguna di bawah 17 tahun. Jika kami mengetahui data anak di bawah usia tersebut, kami akan menghapusnya.'] },
      { h: '9. Perubahan kebijakan', p: ['Versi dan tanggal pembaruan tertera di halaman ini. Untuk perubahan penting, kami meminta persetujuan Anda kembali saat masuk.'] },
      { h: '10. Kontak', p: [contact] },
    ],
  },
});

const EN = (contact: string) => ({
  terms: {
    title: 'MyFi Terms of Service',
    intro: 'MyFi (My Financial) is a personal finance app developed by Zy ("we"). By creating an account or using MyFi you agree to these Terms of Service.',
    sections: [
      { h: '1. The service', p: ['MyFi helps you record income, expenses, transfers, budgets and wallets, view reports, and export your data to Excel.', 'MyFi is at an early stage of development. Features may change and the service may be interrupted.'] },
      { h: '2. Your account', list: ['You are at least 17 years old and give accurate information.', 'You keep your password confidential and are responsible for activity on your account.', 'One person, one account. Tell us if you suspect someone else is using your account.'] },
      { h: '3. Not financial advice', p: ['The numbers, charts and insights in MyFi are general information based on the data you enter. They are not financial, tax, legal or investment advice.', 'MyFi does not hold or move money and does not connect to your bank accounts.'] },
      { h: '4. Your data', list: ['The data you enter remains yours. You grant us a limited permission to store and process it solely to run the service.', 'You are responsible for the accuracy of that data.', 'We work to protect your data but cannot guarantee it will never be lost. Export to Excel regularly as your own backup.'] },
      { h: '5. Prohibited use', list: ['Accessing another person\'s account or data without permission.', 'Disrupting or overloading the service, including with bots or automated mass sign-ups.', 'Testing for security vulnerabilities without written permission, or using the service to break the law.'] },
      { h: '6. Availability and termination', p: ['The service is provided "as is" and free of charge. We may change, suspend or discontinue features, or suspend accounts that break these terms.', 'You can delete your account at any time in Account settings; your data is then permanently deleted.'] },
      { h: '7. Limitation of liability', p: ['To the extent permitted by law, we are not liable for indirect losses, loss of data, or financial decisions you make based on information in MyFi.'] },
      { h: '8. Intellectual property', p: ['The app, the MyFi name and the logo belong to the developer. Your financial data remains yours.'] },
      { h: '9. Changes to these terms', p: ['We may update these terms. For important changes we ask you to accept again when you sign in. Continuing to use MyFi means you accept the latest version.'] },
      { h: '10. Governing law', p: ['These terms are governed by the laws of the Republic of Indonesia. Disputes are first settled by discussion; if that fails, by the competent courts in Indonesia.'] },
      { h: '11. Contact', p: [contact] },
    ],
  },
  privacy: {
    title: 'MyFi Privacy Policy',
    intro: 'This policy explains what data MyFi collects, why, where it is stored, and your rights under Indonesia\'s Personal Data Protection Law (Law No. 27 of 2022). Data controller: Zy, the developer of MyFi.',
    sections: [
      { h: '1. Data we collect', list: ['Account data: email address, full name and password. Passwords are stored only as a hash by the authentication service; we cannot read them.', 'Profile data (optional): display name, profile photo, phone number, country, date of birth, and language, currency and theme preferences.', 'Financial data you enter: wallets, transactions, categories, budgets and exchange rates.', 'Technical data: a session token and preferences in your browser storage, and technical logs from our infrastructure providers (for example IP address and access time) for security.'], p: ['We do not ask for your bank account details, PINs or banking passwords.'] },
      { h: '2. How we use data', list: ['To run the features: sign-in, storing and showing your records, reports and Excel export.', 'To keep the service secure and prevent abuse.', 'To contact you about the service when necessary.'], p: ['We do not sell your data, show ads, or share your financial data with third parties for marketing.'] },
      { h: '3. Where data is stored and who processes it', p: ['The database and authentication run on Supabase (servers in the Singapore region). The site is hosted by Netlify. Data travels over encrypted connections (HTTPS), and database access is restricted per user so other users cannot read your data.', 'Because these providers may process data outside Indonesia, by using MyFi you agree to that processing.'] },
      { h: '4. Storage on your device', p: ['MyFi keeps a sign-in session token and your language and theme choices in browser storage so you stay signed in and your settings persist. We use no tracking or advertising cookies.'] },
      { h: '5. How long we keep data', p: ['For as long as your account is active. If you delete your account in Account settings, the account and all your financial data are permanently deleted from the database. Provider logs and backups, if any, follow the provider\'s own cycles.'] },
      { h: '6. Your rights', list: ['Access and obtain a copy of your data: use Export to Excel.', 'Correct your data: edit your profile and records at any time.', 'Delete your data and withdraw consent: delete your account in Account settings.', 'Ask questions or object: contact us (see Contact).'] },
      { h: '7. Security', p: ['We use encrypted connections, per-user access restrictions and hashed password storage. No system is perfectly secure; keep your password confidential. If an incident affects your data, we will notify you as required by applicable rules.'] },
      { h: '8. Children', p: ['MyFi is not intended for users under 17. If we learn we hold data of a child under that age, we will delete it.'] },
      { h: '9. Changes to this policy', p: ['The version and update date are shown on this page. For important changes we ask you to accept again when you sign in.'] },
      { h: '10. Contact', p: [contact] },
    ],
  },
});
