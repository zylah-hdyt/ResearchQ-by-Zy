#!/bin/bash
# QA for a rendered video: specs, loudness, and a contact sheet of 16 frames (every 1 s).
V=$1; T=$(basename "$V" .mp4); mkdir -p out/qa
ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,nb_frames:format=duration -of compact "$V"
ffmpeg -hide_banner -i "$V" -af ebur128 -f null - 2>&1 | grep -E "^\s+(I|LRA|Peak):" | tr -s ' ' | tr '\n' ' '; echo
ffmpeg -v error -y -i "$V" -vf "select='not(mod(n\,30))+eq(n\,449)',scale=216:384,drawtext=text='%{n}':x=4:y=4:fontsize=18:fontcolor=yellow:box=1:boxcolor=black,tile=8x2" -frames:v 1 -fps_mode vfr out/qa/${T}_sheet.jpg
