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
