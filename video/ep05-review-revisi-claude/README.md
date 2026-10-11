# EP.05 — Master Reviewer & Auto Revision (chat / screen-UI style)

30 detik, 1080×1920. Style baru: mockup layar chat dengan tap cursor, zoom punch-in, bubble chat, dan teks streaming.
Naskah VO ada di `NASKAH-EP05.md`.

Build & render (lihat EP04 untuk setup PATH/ffmpeg/browser):

    python scripts/build.py src/ep05.tpl.html <proj>/index.html scripts/vo_ep05.json
    node probe2.cjs <proj>/index.html > cues.json        # window.__cues → timing SFX
    python scripts/sfx_ep05.py cues.json <proj>/sfx_raw.wav
    ffmpeg -i <proj>/sfx_raw.wav -af loudnorm=I=-20:TP=-2:LRA=11 <proj>/sfx.wav
    hyperframes lint <proj> && hyperframes render -q high -w 4 -o renders/EP05-review-revisi-claude.mp4 <proj>

Fonts: Plus Jakarta Sans, JetBrains Mono, Caveat (tulisan tangan), semua OFL via @fontsource. Emoji: Fluent 3D (MIT).
