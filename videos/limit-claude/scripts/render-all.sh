#!/bin/bash
# Renders compositions to out/*.mp4 (1080x1920, 30 fps, H.264 + AAC). Pass ids to render a subset.
set -e
cd "$(dirname "$0")/.."
npx remotion bundle src/index.ts --out-dir=out/bundle >/dev/null
for id in ${@:-V1-Cinematic3D V2-KineticType V3-Documentary V4-TechUI V5-PaperCraft V6-UiDemo V7-SocialCut V8-Whiteboard V9-SwissPoster}; do
  echo "== $id $(date +%T)"
  npx remotion render out/bundle "$id" "out/$id.mp4" --codec=h264 --crf=17 --audio-codec=aac --audio-bitrate=256k --concurrency=3 --log=error
  echo "   done $(date +%T)"
done
