#!/bin/bash
# Final audio mastering: true-peak limit to -1 dBTP, video stream copied untouched.
mkdir -p final
GAIN=${GAIN:-0}
for id in "$@"; do
  ffmpeg -v error -y -i out/$id.mp4 -c:v copy -af "volume=${GAIN}dB,alimiter=limit=0.85:attack=2:release=40:level=disabled,aresample=48000" -c:a aac -b:a 256k -movflags +faststart final/$id.mp4
  echo -n "$id "; ffmpeg -hide_banner -i final/$id.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tr -s ' ' | tr '\n' ' '; echo
done
