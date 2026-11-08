# YouTube: 7 PLS-SEM Mistakes (Hair et al., 2022). Each line: (section, english subtitle, tts text, indonesian subtitle)
# Every factual claim was checked against A Primer on PLS-SEM, 3rd ed. (2022): Ch.1 (sample size), Ch.4 (reliability, FL, HTMT), Ch.6 (structural model, GoF, R2), Ch.7 (Sobel).
L = [
 ('intro', "If you're using PLS-SEM for your thesis, there's a good chance you're making at least one of these seven mistakes.",
  "If you're using P.L.S. SEM for your thesis, there's a good chance you're making at least one of these seven mistakes.",
  "Kalau kamu pakai PLS-SEM untuk skripsi atau tesis, besar kemungkinan kamu melakukan setidaknya satu dari tujuh kesalahan ini."),
 ('intro', "And I'm not guessing.", "And I'm not guessing.", "Dan ini bukan tebakan."),
 ('intro', "Every point in this video comes straight from one of the most widely used references on PLS-SEM: A Primer on Partial Least Squares Structural Equation Modeling, third edition, by Hair, Hult, Ringle, and Sarstedt.",
  "Every point in this video comes straight from one of the most widely used references on P.L.S. SEM: A Primer on Partial Least Squares Structural Equation Modeling, third edition, by Hair, Hult, Ringle, and Sarstedt.",
  "Semua poin di video ini diambil langsung dari salah satu rujukan PLS-SEM yang paling banyak dipakai: A Primer on PLS-SEM edisi ketiga, karya Hair, Hult, Ringle, dan Sarstedt."),
 ('intro', "Let's get into it.", "Let's get into it.", "Yuk, kita bahas."),

 ('m1', "Mistake number one: running a simultaneous F-test.", "Mistake number one: running a simultaneous F test.", "Kesalahan pertama: melakukan uji F atau uji simultan."),
 ('m1', "The F-test belongs to multiple regression.", "The F test belongs to multiple regression.", "Uji F itu milik regresi berganda."),
 ('m1', "In chapter six, Hair lays out how to evaluate a structural model: check collinearity, test the path coefficients, assess explanatory power, and assess predictive power.",
  "In chapter six, Hair lays out how to evaluate a structural model: check collinearity, test the path coefficients, assess explanatory power, and assess predictive power.",
  "Di Bab 6, Hair menjelaskan cara menilai model struktural: cek kolinearitas, uji koefisien jalur, nilai daya jelas model, dan nilai daya prediksinya."),
 ('m1', "There's no F-test on that list.", "There's no F test on that list.", "Tidak ada uji F di daftar itu."),
 ('m1', "If you want the combined effect of your predictors, look at R squared. Hair describes it as the exogenous variables' combined effects on the endogenous variable.",
  "If you want the combined effect of your predictors, look at R squared. Hair describes it as the exogenous variables' combined effects on the endogenous variable.",
  "Kalau ingin melihat pengaruh gabungan variabel bebas, lihat R kuadrat. Hair menyebutnya pengaruh gabungan variabel eksogen terhadap variabel endogen."),
 ('m1', "So instead of an F-test, report R squared together with the significance of each path.", "So instead of an F test, report R squared, together with the significance of each path.", "Jadi, alih-alih uji F, laporkan R kuadrat bersama signifikansi tiap jalur."),

 ('m2', "Mistake number two: reporting a goodness-of-fit index.", "Mistake number two: reporting a goodness of fit index.", "Kesalahan kedua: melaporkan indeks goodness-of-fit (GoF)."),
 ('m2', "The GoF was proposed early on as a way to validate PLS models globally.", "The G.O.F. was proposed early on as a way to validate P.L.S. models globally.", "GoF dulu diusulkan sebagai cara memvalidasi model PLS secara keseluruhan."),
 ('m2', "But research showed it can't separate valid models from invalid ones.", "But research showed it can't separate valid models from invalid ones.", "Tapi penelitian menunjukkan GoF tidak bisa membedakan model yang valid dari yang tidak."),
 ('m2', "Hair's advice is direct: researchers are advised not to use this measure in PLS-SEM.", "Hair's advice is direct: researchers are advised not to use this measure in P.L.S. SEM.", "Saran Hair jelas: peneliti disarankan tidak memakai ukuran ini di PLS-SEM."),
 ('m2', "And the other proposed fit measures? In their current form, they offer little value for applied research.", "And the other proposed fit measures? In their current form, they offer little value for applied research.", "Lalu ukuran fit lainnya? Dalam bentuknya sekarang, ukuran itu kurang bermanfaat untuk penelitian terapan."),
 ('m2', "Focus on R squared, effect sizes, and predictive power instead.", "Focus on R squared, effect sizes, and predictive power instead.", "Fokuslah pada R kuadrat, ukuran efek, dan daya prediksi."),

 ('m3', "Mistake number three: choosing PLS-SEM just because your sample is small.", "Mistake number three: choosing P.L.S. SEM just because your sample is small.", "Kesalahan ketiga: memilih PLS-SEM hanya karena sampelnya kecil."),
 ('m3', "Hair calls this probably the most often misused argument for using PLS-SEM. No method has magic capabilities.", "Hair calls this probably the most often misused argument for using P.L.S. SEM. No method has magic capabilities.", "Hair menyebut ini mungkin alasan yang paling sering disalahgunakan untuk memakai PLS-SEM. Tidak ada metode yang ajaib."),
 ('m3', "The popular ten-times rule is only a rough guideline.", "The popular ten times rule is only a rough guideline.", "Aturan sepuluh kali yang populer itu hanya patokan kasar."),
 ('m3', "Think in terms of statistical power instead. With the inverse square root method, if your weakest expected path is about 0.2, you need around 155 observations at a 5% significance level.",
  "Think in terms of statistical power instead. With the inverse square root method, if your weakest expected path is about zero point two, you need around one hundred and fifty five observations, at a five percent significance level.",
  "Pertimbangkan power statistik. Dengan metode inverse square root, kalau jalur terlemah yang diharapkan sekitar 0,2, kamu butuh sekitar 155 responden pada taraf signifikansi 5%."),
 ('m3', "And if you ran a pilot study, use its smallest path coefficient as your starting point.", "And if you ran a pilot study, use its smallest path coefficient as your starting point.", "Kalau kamu sempat melakukan uji coba (pilot study), pakai koefisien jalur terkecilnya sebagai titik awal hitungan."),

 ('m4', "Mistake number four: relying on the Fornell-Larcker criterion.", "Mistake number four: relying on the Fornell Larcker criterion.", "Kesalahan keempat: mengandalkan kriteria Fornell-Larcker."),
 ('m4', "For decades, it was the go-to test for discriminant validity.", "For decades, it was the go to test for discriminant validity.", "Selama puluhan tahun, kriteria ini jadi andalan untuk validitas diskriminan."),
 ('m4', "But Hair notes it performs very poorly when indicator loadings are similar, which is usually the case with real data.", "But Hair notes it performs very poorly when indicator loadings are similar, which is usually the case with real data.", "Tapi menurut Hair, kriteria ini bekerja sangat buruk saat loading indikatornya mirip, dan itu yang biasanya terjadi di data nyata."),
 ('m4', "Use the HTMT instead: below 0.90, or below 0.85 when your constructs are conceptually distinct.", "Use the H.T.M.T. instead: below zero point nine, or below zero point eight five when your constructs are conceptually distinct.", "Gunakan HTMT: di bawah 0,90, atau di bawah 0,85 kalau konstruknya jelas berbeda secara konsep."),
 ('m4', "In other words, an HTMT above 0.90 is a red flag for discriminant validity.", "In other words, an H.T.M.T. above zero point nine, is a red flag for discriminant validity.", "Artinya, HTMT di atas 0,90 adalah tanda bahaya untuk validitas diskriminan."),

 ('m5', "Mistake number five: testing mediation with the Sobel test.", "Mistake number five: testing mediation with the Sobel test.", "Kesalahan kelima: menguji mediasi dengan uji Sobel."),
 ('m5', "Hair is blunt here: the Sobel test should no longer be used.", "Hair is blunt here: the Sobel test should no longer be used.", "Di sini Hair tegas: uji Sobel sebaiknya tidak dipakai lagi."),
 ('m5', "It assumes a normal distribution, which doesn't fit a nonparametric method like PLS-SEM.", "It assumes a normal distribution, which doesn't fit a nonparametric method like P.L.S. SEM.", "Uji ini mengasumsikan distribusi normal, yang tidak cocok dengan metode nonparametrik seperti PLS-SEM."),
 ('m5', "Bootstrap the indirect effect instead.", "Bootstrap the indirect effect instead.", "Sebagai gantinya, uji efek tidak langsung dengan bootstrapping."),
 ('m5', "Bootstrapping makes no distributional assumptions, which is exactly why it suits PLS-SEM.", "Bootstrapping makes no distributional assumptions, which is exactly why it suits P.L.S. SEM.", "Bootstrapping tidak mengasumsikan distribusi tertentu, karena itulah cocok untuk PLS-SEM."),

 ('m6', "Mistake number six: celebrating a reliability of 0.97.", "Mistake number six: celebrating a reliability of zero point nine seven.", "Kesalahan keenam: bangga dengan reliabilitas 0,97."),
 ('m6', "Values between 0.70 and 0.90 are satisfactory.", "Values between zero point seven, and zero point nine, are satisfactory.", "Nilai antara 0,70 dan 0,90 sudah memuaskan."),
 ('m6', "But values above 0.90, and definitely above 0.95, are not desirable.", "But values above zero point nine, and definitely above zero point nine five, are not desirable.", "Tapi nilai di atas 0,90, apalagi di atas 0,95, justru tidak diinginkan."),
 ('m6', "They usually mean your items are redundant, slightly rephrasing the very same question.", "They usually mean your items are redundant, slightly rephrasing the very same question.", "Biasanya itu tanda butir pertanyaanmu berulang, hanya mengulang pertanyaan yang sama dengan kata lain."),
 ('m6', "So if your reliability looks too perfect, check whether two items are asking the same thing.", "So if your reliability looks too perfect, check whether two items are asking the same thing.", "Jadi kalau reliabilitasmu terlihat terlalu sempurna, cek apakah ada dua butir yang menanyakan hal yang sama."),

 ('m7', "Mistake number seven: judging R squared with one universal cutoff.", "Mistake number seven: judging R squared with one universal cutoff.", "Kesalahan ketujuh: menilai R kuadrat dengan satu batas yang berlaku untuk semua."),
 ('m7', "Hair says acceptable R squared values are based on the context.", "Hair says acceptable R squared values are based on the context.", "Hair menyebut nilai R kuadrat yang dapat diterima bergantung pada konteks."),
 ('m7', "In some disciplines, 0.10 is satisfactory. In others, researchers expect values above 0.65.", "In some disciplines, zero point one is satisfactory. In others, researchers expect values above zero point six five.", "Di beberapa bidang, 0,10 sudah memuaskan. Di bidang lain, peneliti mengharapkan nilai di atas 0,65."),
 ('m7', "Also remember: the more predictors you add, the higher R squared tends to get.", "Also remember: the more predictors you add, the higher R squared tends to get.", "Ingat juga: makin banyak variabel prediktor, R kuadrat cenderung makin tinggi."),
 ('m7', "So compare your R squared with similar studies, not with a magic number.", "So compare your R squared with similar studies, not with a magic number.", "Jadi bandingkan R kuadratmu dengan penelitian sejenis, bukan dengan angka ajaib."),

 ('outro', "Quick recap.", "Quick recap.", "Rangkuman singkat."),
 ('outro', "No F-test. No GoF. No small-sample excuse. HTMT over Fornell-Larcker. Bootstrapping over Sobel. Watch out for reliability that's too high. And read R squared in context.",
  "No F test. No G.O.F. No small sample excuse. H.T.M.T. over Fornell Larcker. Bootstrapping over Sobel. Watch out for reliability that's too high. And read R squared in context.",
  "Tanpa uji F. Tanpa GoF. Bukan alasan sampel kecil. HTMT, bukan Fornell-Larcker. Bootstrapping, bukan Sobel. Waspadai reliabilitas yang terlalu tinggi. Dan baca R kuadrat sesuai konteks."),
 ('outro', "If you want all of this in one practical guide, check out the SEM-PLS guide in the description.", "If you want all of this in one practical guide, check out the SEM P.L.S. guide in the description.", "Kalau mau semua ini dalam satu panduan praktis, cek panduan SEM-PLS di deskripsi."),
 ('outro', "And subscribe to Not Your Lecture for more research tips that actually hold up.", "And subscribe to Not Your Lecture for more research tips that actually hold up.", "Dan subscribe Not Your Lecture untuk tips riset lainnya yang benar-benar bisa dipertanggungjawabkan."),
]
if __name__ == '__main__':
    import json
    json.dump(L, open('lines.json', 'w'), ensure_ascii=False, indent=0)
    print(len(L), 'lines,', sum(len(e.split()) for _, e, _, _ in L), 'words')
