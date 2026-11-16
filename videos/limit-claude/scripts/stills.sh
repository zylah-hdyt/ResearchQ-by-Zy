#!/bin/bash
# usage: scripts/stills.sh <CompId> <tag> frame1 frame2 ...  -> out/stills/<tag>_sheet.jpg
set -e
ID=$1; TAG=$2; shift 2
mkdir -p out/stills
FR=$(IFS=,; echo "$*")
npx remotion bundle src/index.ts --out-dir=out/bundle >/dev/null 2>&1 || true
for fr in "$@"; do
  npx remotion still out/bundle $ID out/stills/${TAG}_$(printf %03d $fr).jpg --frame=$fr --scale=0.4 >/dev/null 2>&1 &
  while [ $(jobs -r | wc -l) -ge 3 ]; do sleep 0.3; done
done
wait
ARGS=""; FIL=""; i=0
for fr in "$@"; do ARGS="$ARGS -i out/stills/${TAG}_$(printf %03d $fr).jpg"; FIL="$FIL[$i:v]drawtext=text='$fr':x=10:y=10:fontsize=28:fontcolor=yellow:box=1:boxcolor=black[v$i];"; i=$((i+1)); done
L=""; for j in $(seq 0 $((i-1))); do L="$L[v$j]"; done
ffmpeg -v error -y $ARGS -filter_complex "${FIL}${L}hstack=inputs=$i" out/stills/${TAG}_sheet.jpg
