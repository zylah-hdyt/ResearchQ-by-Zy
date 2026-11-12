set -e
S=$1; cd $S/yt3
python3 -I realign.py $S 2>&1 | grep -v "^/project" | grep -v "^$"
ffmpeg -hide_banner -loglevel error -y -i work/vo_raw_v3.wav -af "aresample=48000,highpass=f=70,equalizer=f=180:t=q:w=1:g=1,equalizer=f=3500:t=q:w=1.2:g=1,deesser=i=0.3:m=0.5:f=0.5,acompressor=threshold=-22dB:ratio=2:attack=8:release=120:knee=6:makeup=1.5" -c:a pcm_f32le work/vo_eq.wav
L=$(ffmpeg -hide_banner -i work/vo_eq.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | awk '{print $2}'); G=$(python3 -c "print(-16.0-($L))")
ffmpeg -hide_banner -loglevel error -y -i work/vo_eq.wav -af "volume=${G}dB,alimiter=limit=0.84:attack=2:release=50:level=disabled" -ar 48000 -c:a pcm_f32le work/vo_final.wav
python3 -I lipdata.py $PWD
python3 -I build.py $S
NODE_PATH=$(npm root -g) node dumpev.js
python3 -I audio.py $S
W=$PWD/work; LS=$(ffmpeg -hide_banner -i $W/sfx.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | awk '{print $2}'); LV=$(ffmpeg -hide_banner -i $W/vo_final.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | awk '{print $2}')
GS=$(python3 -c "print(($LV-11.0)-($LS))"); ENDT=$(python3 -c "import json;print(json.load(open('$W/events.json'))['END'])"); NF=$(python3 -c "print(int($ENDT*30))")
ffmpeg -hide_banner -loglevel error -y -i $W/vo_final.wav -i $W/sfx.wav -filter_complex "[0:a]aformat=channel_layouts=stereo,apad[v];[1:a]volume=${GS}dB[s];[v][s]amix=inputs=2:normalize=0:duration=longest,atrim=0:$ENDT,volume=2.2dB,alimiter=limit=0.87:attack=1.5:release=40:level=disabled" -ar 48000 -c:a pcm_s24le $W/mix_final.wav
echo "NF $NF ENDT $ENDT GS $GS"
