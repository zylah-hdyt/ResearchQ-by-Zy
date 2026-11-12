# (section, English on screen / for alignment, text sent to TTS, Indonesian meaning)
L = [
 ('intro', "Every PLS-SEM model you run today stands on more than a hundred years of ideas.", "Every PLS SEM model you run today stands on more than a hundred years of ideas.", "Setiap model PLS-SEM yang kamu jalankan hari ini berdiri di atas ide lebih dari seratus tahun."),
 ('intro', "It's a story about intelligence tests, guinea pigs, economists, and a teacher and his student who took two different roads.", "It's a story about intelligence tests, guinea pigs, economists, and a teacher and his student who took two different roads.", "Ceritanya tentang tes kecerdasan, marmut, ekonom, serta guru dan muridnya yang memilih dua jalan berbeda."),
 ('intro', "Let's go back to the beginning.", "Let's go back to the beginning.", "Yuk, kita mulai dari awal."),
 ('s1', "1904. British psychologist Charles Spearman noticed that children who did well on one school subject tended to do well on the others.", "Nineteen oh four. British psychologist Charles Spearman noticed that children who did well on one school subject tended to do well on the others.", ""),
 ('s1', "He argued that one hidden factor sat behind all of those scores. He called it g, for general intelligence.", "He argued that one hidden factor sat behind all of those scores. He called it G, for general intelligence.", ""),
 ('s1', "That was the birth of factor analysis: measuring something you cannot see through the things you can.", "That was the birth of factor analysis: measuring something you cannot see, through the things you can.", ""),
 ('s2', "A few years later, American geneticist Sewall Wright was studying the coat patterns of guinea pigs.", "A few years later, American geneticist Sewall Wright was studying the coat patterns of guinea pigs.", ""),
 ('s2', "To separate heredity from environment, he drew arrows between variables and turned those arrows into equations.", "To separate heredity from environment, he drew arrows between variables, and turned those arrows into equations.", ""),
 ('s2', "In 1921, he published Correlation and Causation. Path analysis was born.", "In nineteen twenty-one, he published Correlation and Causation. Path analysis was born.", ""),
 ('s3', "In the 1940s, economists like Trygve Haavelmo showed how whole systems of equations could be estimated together.", "In the nineteen forties, economists like Trygve Haavelmo showed how whole systems of equations could be estimated together.", ""),
 ('s3', "And in the 1960s, sociologists such as Otis Dudley Duncan brought path analysis into the social sciences.", "And in the nineteen sixties, sociologists such as Otis Dudley Duncan brought path analysis into the social sciences.", ""),
 ('s3', "Factors, paths, and equations. All the pieces were on the table. Someone just had to put them together.", "Factors, paths, and equations. All the pieces were on the table. Someone just had to put them together.", ""),
 ('s4', "In the early 1970s, Swedish statistician Karl Jöreskog combined factor analysis and path analysis into one framework, and his program, LISREL, put it on computers.", "In the early nineteen seventies, Swedish statistician Karl Yoreskog combined factor analysis and path analysis into one framework, and his program, Lisrel, put it on computers.", ""),
 ('s4', "This is covariance-based SEM. It asks one big question: does my theory fit the data?", "This is covariance based S E M. It asks one big question: does my theory fit the data?", ""),
 ('s4', "But Jöreskog's own doctoral advisor, Herman Wold, took another road.", "But Yoreskog's own doctoral advisor, Herman Wold, took another road.", ""),
 ('s4', "Wold built a softer method that maximizes the variance explained in the outcomes. He called it soft modeling. Today we call it PLS-SEM.", "Wold built a softer method, that maximizes the variance explained in the outcomes. He called it soft modeling. Today, we call it PLS SEM.", ""),
 ('s5', "So there are two types of SEM.", "So, there are two types of S E M.", ""),
 ('s5', "Covariance-based SEM is built to confirm theory. It treats constructs as common factors and judges the model by its overall fit.", "Covariance based S E M is built to confirm theory. It treats constructs as common factors, and judges the model by its overall fit.", ""),
 ('s5', "PLS-SEM is built to explain and predict. It treats constructs as composites and focuses on R squared and predictive power.", "PLS SEM is built to explain and predict. It treats constructs as composites, and focuses on R squared and predictive power.", ""),
 ('s5', "Neither one is better. Choose by your research goal, not by your sample size.", "Neither one is better. Choose by your research goal, not by your sample size.", ""),
 ('s6', "Then came the software.", "Then came the software.", ""),
 ('s6', "LISREL in the 1970s. Jan-Bernd Lohmöller's LVPLS, the first PLS path modeling program, in the 1980s. And EQS in 1985.", "Lisrel in the nineteen seventies. Jan Bernd Lohmoller's L V P L S, the first PLS path modeling program, in the nineteen eighties. And E Q S in nineteen eighty-five.", ""),
 ('s6', "In the 1990s, Amos brought drag-and-drop path diagrams, Wynne Chin's PLS-Graph did the same for PLS, and Mplus arrived in 1998.", "In the nineteen nineties, Amos brought drag and drop path diagrams, Wynne Chin's PLS Graph did the same for PLS, and M plus arrived in nineteen ninety-eight.", ""),
 ('s6', "In 2005, SmartPLS put PLS-SEM within reach of almost every student.", "In two thousand five, Smart PLS put PLS SEM within reach of almost every student.", ""),
 ('s6', "Then WarpPLS in 2009, the free R package lavaan in 2012, and SmartPLS 4 in 2022.", "Then Warp PLS in two thousand nine, the free R package lavaan in twenty twelve, and Smart PLS four in twenty twenty-two.", ""),
 ('outro', "So the next time you open SmartPLS, remember: you are standing on more than a century of work, from Spearman's g to the model on your screen.", "So the next time you open Smart PLS, remember: you are standing on more than a century of work, from Spearman's G, to the model on your screen.", ""),
 ('outro', "Subscribe to Not Your Lecture for more research stories that actually make sense.", "Subscribe to Not Your Lecture, for more research stories that actually make sense.", ""),
]
if __name__ == '__main__':
    import json; json.dump([[s, e, t, i, k] for k, (s, e, t, i) in enumerate(L)], open('lines.json', 'w'), ensure_ascii=False)
    print(len(L), 'lines', sum(len(e.split()) for _, e, _, _ in L), 'words')
