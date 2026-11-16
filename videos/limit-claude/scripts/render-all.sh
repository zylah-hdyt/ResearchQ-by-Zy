#!/bin/bash
# Renders all five compositions to out/*.mp4 (1080x1920, 30 fps, H.264 + AAC).
set -e
cd "$(dirname "$0")/.."
npx remotion bundle src/index.ts --out-dir=out/bundle >/dev/null
for id in ${@:-V1-Cinematic3D V2-KineticType V3-Documentary V4-TechUI V5-PaperCraft}; do
  echo "== $id $(date +%T)"
  npx remotion render out/bundle "$id" "out/$id.mp4" --codec=h264 --crf=17 --audio-codec=aac --audio-bitrate=256k --concurrency=3 --log=error
  echo "   done $(date +%T)"
done
