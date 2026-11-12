set -e
S=$1; cd $S/yt3; NF=$(python3 -c "import json;print(int(json.load(open('work/events.json'))['END']*30))")
export SUB=frames; mkdir -p frames; Q=$(( (NF+3)/4 ))
for i in 0 1 2 3; do a=$((i*Q)); b=$(( (i+1)*Q )); [ $b -gt $NF ] && b=$NF; NODE_PATH=$(npm root -g) node recp.js $a $b > rw_$i.log 2>&1 & done; wait
echo frames $(ls frames | grep -c 'jpg$') / $NF
ffmpeg -hide_banner -loglevel error -y -framerate 30 -i frames/f%05d_0.jpg -i work/mix_final.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 21 -pix_fmt yuv420p -profile:v high -g 60 -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest final.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 final.mp4; ffmpeg -hide_banner -i final.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):"; ls -la final.mp4
