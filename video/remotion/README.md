# Remotion workspace (@researchq.id)

[Remotion](https://github.com/remotion-dev/remotion) 4.0.534: video dari komponen React. Workspace ini terpisah
dari proyek HyperFrames di folder EP lain.

    npm install
    export REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell   # cloud container
    npx remotion studio                                  # preview interaktif (butuh browser lokal)
    npx remotion render HelloRQ out/HelloRQ.mp4          # render MP4 1080×1920
    npx remotion still HelloRQ out/frame.png --frame=60  # render 1 frame

- Komposisi didaftarkan di `src/Root.tsx`. Contoh uji: `src/HelloRQ.tsx`, 5 detik dengan palet chat/screen-UI.
- Di laptop sendiri tidak perlu `REMOTION_BROWSER`, karena Remotion mengunduh Chrome Headless Shell sendiri.
- Lisensi: gratis untuk perorangan dan perusahaan dengan maksimal 3 karyawan. Di atas itu wajib Company License
  (lihat remotion.dev/license).

## ResearchQ Intro (dark, 15 detik)

Komposisi `ResearchQIntro` (`src/intro/`), dibuat mengikuti skill resmi Remotion (remotion-dev/skills: best practices,
create, markup, multi-scene). Tiap scene adalah file sendiri dan juga didaftarkan sebagai komposisi di folder
`Intro-scenes` supaya bisa di-preview dan diedit terpisah di Studio.

| Scene | Detik | Isi |
|---|---|---|
| Pain | 0–4,2 | Pertanyaan riset muncul (judul, sampel, SmartPLS merah, revisi, dibilang AI, deadline), lalu "Riset bikin pusing?" |
| Converge | 4,2–6,5 | Semua pertanyaan tersedot jadi titik oranye ResearchQ, muncul ring pulse dan "tenang.", lalu titik melesat ke atas |
| Brand | 6,5–15 | Wordmark "ResearchQ" naik, titik jatuh jadi tanda titik, "Teman riset mahasiswa · S1 · S2 · S3", marquee skill, @researchq.id + Follow |

    python scripts/sfx_intro.py raw.wav && ffmpeg -i raw.wav -af loudnorm=I=-18:TP=-2:LRA=11 public/intro-sfx.wav
    npx remotion render ResearchQIntro renders/ResearchQ-Intro-Dark.mp4
