# HyperFrames projects (ResearchQ)

Video yang dibangun dengan [HyperFrames](https://github.com/heygen-com/hyperframes) (HTML + GSAP, dirender dengan CLI `hyperframes`).

## reducer-ad — Iklan AI Detection Reducer (17,3 dtk, 9:16)
- `reducer-ad/index.html`: satu komposisi (root `reducer-ad`, 1080×1920, 17,333 dtk), timeline GSAP yang bisa di-seek, audio VO
  bahasa Inggris (`assets/vo-en.wav`, Cartesia "Julia") + SFX (`assets/sfx.wav`), subtitle bahasa Indonesia.
- Arah desain mengikuti *house style* HyperFrames untuk menghindari kesan AI: kertas hangat (bukan putih murni), tinta ber-tint,
  satu aksen oranye, layout rata kiri (bukan semua di tengah), Montserrat + EB Garamond (halaman skripsi) + JetBrains Mono,
  garis tegas, *crop marks*, grain. Tanpa glow, kaca, gradien blob, atau emoji. Konten nyata: paragraf BAB 1 dengan
  AI-ism yang ditandai, lalu *track changes* dan tabel status dari format output skill (panduan PDF).
- Render: `renders/ResearchQ-AI-Detection-Reducer-HyperFrames.mp4`.

## Menjalankan di container ini
```bash
cd video/hyperframes && npm install
source env.sh                       # Chrome dari /opt/pw-browsers, FFmpeg/FFprobe dari npm
cd reducer-ad
npx hyperframes check               # lint + runtime + layout + kontras
npx hyperframes snapshot --at 1.9,5.6,9.8
npx hyperframes render --output ../renders/ResearchQ-AI-Detection-Reducer-HyperFrames.mp4
npx hyperframes preview             # Studio: edit teks/clip langsung di timeline
```
