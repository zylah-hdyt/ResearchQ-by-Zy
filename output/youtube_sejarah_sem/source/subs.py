# Kinetic Indonesian subtitles: one phrase per cue. EN parts of a line joined with spaces must equal the line's English text.
# *word* = keyword (orange, bigger). Timing comes from the English words of the same phrase.
SUBS = [
 [("Every PLS-SEM model you run today", "Setiap model *PLS-SEM* yang kamu jalankan"), ("stands on more than a hundred years of ideas.", "berdiri di atas *lebih dari 100 tahun* ide.")],
 [("It's a story about intelligence tests,", "Ini kisah tentang *tes kecerdasan,*"), ("guinea pigs, economists,", "*marmut,* para ekonom,"), ("and a teacher and his student", "serta seorang *guru* dan *muridnya*"), ("who took two different roads.", "yang memilih *dua jalan* berbeda.")],
 [("Let's go back to the beginning.", "Yuk, kita mulai *dari awal.*")],
 [("1904.", "*1904.*"), ("British psychologist Charles Spearman noticed", "Psikolog Inggris *Charles Spearman* memperhatikan"), ("that children who did well on one school subject", "anak yang *bagus* di satu mata pelajaran"), ("tended to do well on the others.", "cenderung *bagus juga* di pelajaran lain.")],
 [("He argued that one hidden factor", "Menurutnya, ada satu *faktor tersembunyi*"), ("sat behind all of those scores.", "di balik semua nilai itu."), ("He called it g, for general intelligence.", "Ia menyebutnya *g,* kecerdasan umum.")],
 [("That was the birth of factor analysis:", "Lahirlah *analisis faktor:*"), ("measuring something you cannot see", "mengukur sesuatu yang *tak terlihat*"), ("through the things you can.", "lewat hal-hal yang *terlihat.*")],
 [("A few years later, American geneticist Sewall Wright", "Beberapa tahun kemudian, ahli genetika *Sewall Wright*"), ("was studying the coat patterns of guinea pigs.", "meneliti *pola bulu marmut.*")],
 [("To separate heredity from environment,", "Untuk memisahkan *keturunan* dari *lingkungan,*"), ("he drew arrows between variables", "ia menggambar *panah* antarvariabel"), ("and turned those arrows into equations.", "lalu mengubahnya jadi *persamaan.*")],
 [("In 1921, he published Correlation and Causation.", "Tahun *1921,* ia menerbitkan *Correlation and Causation.*"), ("Path analysis was born.", "Lahirlah *analisis jalur.*")],
 [("In the 1940s, economists like Trygve Haavelmo", "Tahun *1940-an,* ekonom seperti *Trygve Haavelmo*"), ("showed how whole systems of equations", "menunjukkan bahwa *sistem persamaan*"), ("could be estimated together.", "bisa diestimasi *sekaligus.*")],
 [("And in the 1960s, sociologists such as Otis Dudley Duncan", "Tahun *1960-an,* sosiolog *Otis Dudley Duncan*"), ("brought path analysis into the social sciences.", "membawa analisis jalur ke *ilmu sosial.*")],
 [("Factors, paths, and equations.", "*Faktor, jalur,* dan *persamaan.*"), ("All the pieces were on the table.", "Semua kepingan sudah ada."), ("Someone just had to put them together.", "Tinggal *menyatukannya.*")],
 [("In the early 1970s, Swedish statistician Karl Jöreskog", "Awal *1970-an,* statistikawan Swedia *Karl Jöreskog*"), ("combined factor analysis and path analysis into one framework,", "menyatukan analisis faktor dan jalur dalam *satu kerangka,*"), ("and his program, LISREL, put it on computers.", "dan programnya, *LISREL,* membawanya ke komputer.")],
 [("This is covariance-based SEM.", "Inilah *CB-SEM* (berbasis kovarians)."), ("It asks one big question:", "Pertanyaan besarnya:"), ("does my theory fit the data?", "apakah *teoriku cocok* dengan data?")],
 [("But Jöreskog's own doctoral advisor, Herman Wold,", "Tapi pembimbing doktoral Jöreskog, *Herman Wold,*"), ("took another road.", "memilih *jalan lain.*")],
 [("Wold built a softer method", "Wold membuat metode yang lebih *lunak*"), ("that maximizes the variance explained in the outcomes.", "yang *memaksimalkan varians* yang dijelaskan."), ("He called it soft modeling.", "Ia menyebutnya *soft modeling.*"), ("Today we call it PLS-SEM.", "Sekarang kita menyebutnya *PLS-SEM.*")],
 [("So there are two types of SEM.", "Jadi, ada *dua jenis* SEM.")],
 [("Covariance-based SEM is built to confirm theory.", "*CB-SEM* dibuat untuk *mengonfirmasi teori.*"), ("It treats constructs as common factors", "Konstruk dianggap *faktor bersama*"), ("and judges the model by its overall fit.", "dan model dinilai dari *kecocokan (fit)* keseluruhan.")],
 [("PLS-SEM is built to explain and predict.", "*PLS-SEM* dibuat untuk *menjelaskan* dan *memprediksi.*"), ("It treats constructs as composites", "Konstruk dianggap *komposit*"), ("and focuses on R squared and predictive power.", "dan fokus pada *R²* dan *daya prediksi.*")],
 [("Neither one is better.", "Tidak ada yang *lebih baik.*"), ("Choose by your research goal,", "Pilih berdasarkan *tujuan penelitian,*"), ("not by your sample size.", "bukan *ukuran sampel.*")],
 [("Then came the software.", "Lalu, datanglah *software-nya.*")],
 [("LISREL in the 1970s.", "*LISREL* tahun 1970-an."), ("Jan-Bernd Lohmöller's LVPLS,", "*LVPLS* karya Jan-Bernd Lohmöller,"), ("the first PLS path modeling program, in the 1980s.", "program *PLS pertama,* tahun 1980-an."), ("And EQS in 1985.", "Lalu *EQS* tahun 1985.")],
 [("In the 1990s, Amos brought drag-and-drop path diagrams,", "Tahun 1990-an, *Amos* membawa diagram jalur *drag-and-drop,*"), ("Wynne Chin's PLS-Graph did the same for PLS,", "*PLS-Graph* karya Wynne Chin melakukan hal yang sama untuk PLS,"), ("and Mplus arrived in 1998.", "dan *Mplus* hadir tahun 1998.")],
 [("In 2005, SmartPLS put PLS-SEM", "Tahun *2005,* *SmartPLS* membuat PLS-SEM"), ("within reach of almost every student.", "bisa dipakai *hampir semua mahasiswa.*")],
 [("Then WarpPLS in 2009,", "Lalu *WarpPLS* tahun 2009,"), ("the free R package lavaan in 2012,", "paket R gratis *lavaan* tahun 2012,"), ("and SmartPLS 4 in 2022.", "dan *SmartPLS 4* tahun 2022.")],
 [("So the next time you open SmartPLS, remember:", "Jadi, saat kamu membuka *SmartPLS* nanti, ingat:"), ("you are standing on more than a century of work,", "kamu berdiri di atas *lebih dari seabad* kerja keras,"), ("from Spearman's g to the model on your screen.", "dari *g*-nya Spearman sampai *model di layarmu.*")],
 [("Subscribe to Not Your Lecture", "Subscribe *Not Your Lecture*"), ("for more research stories that actually make sense.", "untuk kisah riset yang *benar-benar masuk akal.*")],
]
if __name__ == '__main__':
    import json
    L = json.load(open('lines.json')); assert len(L) == len(SUBS), (len(L), len(SUBS))
    for i, (l, c) in enumerate(zip(L, SUBS)): assert ' '.join(e for e, _ in c) == l[1], (i, ' '.join(e for e, _ in c), l[1])
    json.dump(SUBS, open('subs.json', 'w'), ensure_ascii=False); print('ok', sum(len(c) for c in SUBS), 'cues; longest ID', max(len(i) for c in SUBS for _, i in c))
