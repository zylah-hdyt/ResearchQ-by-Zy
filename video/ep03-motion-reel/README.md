# EP.03 — ResearchQ Motion Reel (TikTok 9:16, 32 detik)

Gaya **motion reel**: HUD tipis (bracket sudut, label mono, timecode, progress), potongan cepat yang
dikunci ke ketukan 144 BPM, campuran serif italic + sans tebal, aksen stabilo lime, angka bergulir, lalu
bidang warna penuh (hitam / oranye / biru) dengan huruf raksasa dan stutter glitch. Tanpa voiceover:
teks kinetik + musik + **sound transisi**.

Alur (ketukan → detik, 1 ketukan = 0,4167 s):
1. 0–8 intro: titik lime berdenyut → meledak jadi logo Claude (riser + hit + shimmer)
2. 8–16 "Deadline": hitung mundur + chip tugas riset (pop per 1/8)
3. 16–20 prinsip: "Riset lebih cepat, tanpa mengorbankan integritas."
4. 20–28 alur human-in-the-loop (5 kartu, hanya satu langkah AI)
5. 28–36 ResearchQ Skills (kartu gelap + 6 produk)
6. 36–40 data: 111 juta referensi dianalisis (sumber di layar)
7. 40–52 potongan warna: CEK. / VERIFIKASI. / TRANSPARAN. / PUTUSKAN. / stutter "KAMU TETAP PENELITI-NYA."
8. 52–60 tiga zona (bola hijau lolos, kuning cek dulu, merah mentok)
9. 60–76 loader → logo Claude + wordmark ResearchQ + "AI mempercepat, kamu tetap penelitinya." + Follow @researchq.id

- `src/ep03.tpl.html` — komposisi HyperFrames. **Catatan:** renderer seek dengan `totalTime(t, true)`
  (event ditekan), jadi semua perubahan teks (timecode, hitung mundur, angka) dibuat dengan `tl.set` per frame,
  bukan `onUpdate`/`call`.
- `scripts/sfx_ep03.py` — musik prosedural (kick 808, clap, hat, sub bass, pad, pluck, sidechain) + SFX transisi
  (whoosh ke tiap potongan, impact di potongan, riser, glitch, pop, tick, ding, buzz, shimmer, sub drop). Semua waktu
  dari `window.__cues`, jadi suara selalu pas dengan gambar.

## Pipeline

```bash
npm install
python scripts/build.py src/ep03.tpl.html project/index.html
node scripts/probe.cjs $PWD/project/index.html > out/cues.json
python scripts/sfx_ep03.py out/cues.json project/sfx.wav
(cd project && npx hyperframes render -q high -w 4 -o ../out/video.mp4)
ffmpeg -i project/sfx.wav -af "loudnorm=I=-14:TP=-2:LRA=9,alimiter=limit=0.8:level=false" -ar 48000 out/mix_norm.wav
ffmpeg -i out/video.mp4 -i out/mix_norm.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/EP03-motion-reel.mp4
```
