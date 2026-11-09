set -e
S=$1; cd $S/yt2
python3 -I realign.py $S 2>&1 | grep -v "^/project" | grep -v "^$"
ffmpeg -hide_banner -loglevel error -y -i work/vo_raw_v3.wav -af "aresample=48000,highpass=f=70,equalizer=f=180:t=q:w=1:g=1,equalizer=f=3500:t=q:w=1.2:g=1,deesser=i=0.3:m=0.5:f=0.5,acompressor=threshold=-22dB:ratio=2:attack=8:release=120:knee=6:makeup=1.5" -c:a pcm_f32le work/vo_eq.wav
L=$(ffmpeg -hide_banner -i work/vo_eq.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | awk '{print $2}'); G=$(python3 -c "print(-16.0-($L))")
ffmpeg -hide_banner -loglevel error -y -i work/vo_eq.wav -af "volume=${G}dB,alimiter=limit=0.84:attack=2:release=50:level=disabled" -ar 48000 -c:a pcm_f32le work/vo_final.wav
python3 -I lip/lipdata.py $PWD; python3 -I audio.py $S
W=$PWD/work; LS=$(ffmpeg -hide_banner -i $W/sfx.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | awk '{print $2}'); LV=$(ffmpeg -hide_banner -i $W/vo_final.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | awk '{print $2}')
GS=$(python3 -c "print(($LV-11.0)-($LS))"); ENDT=$(python3 -c "import json;w=json.load(open('$W/words.json'));print(round(w[-1]['e']+8.5,3))"); NF=$(python3 -c "print(int($ENDT*30))")
ffmpeg -hide_banner -loglevel error -y -i $W/vo_final.wav -i $W/sfx.wav -filter_complex "[0:a]aformat=channel_layouts=stereo,apad[v];[1:a]volume=${GS}dB[s];[v][s]amix=inputs=2:normalize=0:duration=longest,atrim=0:$ENDT,volume=2.2dB,alimiter=limit=0.87:attack=1.5:release=40:level=disabled" -ar 48000 -c:a pcm_s24le $W/mix_final.wav
python3 srt2.py
python3 - <<'PY'
import json,re
W=json.load(open('work/words.json'));SL={}
for i,w in enumerate(W): SL.setdefault(w['sec'],[]).append(i)
SS={s:(0 if s=='intro' else W[SL[s][0]]['s']-1.15) for s in SL}
T={'intro':'Intro','m1':'Mistake 1: The simultaneous F-test','m2':'Mistake 2: Reporting the GoF index','m3':'Mistake 3: "My sample is small"','m4':'Mistake 4: Relying on Fornell-Larcker','m5':'Mistake 5: The Sobel test','m6':'Mistake 6: Reliability that is too high','m7':'Mistake 7: One R² cutoff for all','outro':'Recap'}
ch='\n'.join(f'{int(SS[s]//60)}:{int(SS[s]%60):02d} {T[s]}' for s in ['intro','m1','m2','m3','m4','m5','m6','m7','outro'])
d=open('youtube_description.txt').read();d=re.sub(r'CHAPTERS\n(.*\n)+?\n','CHAPTERS\n'+ch+'\n\n',d);open('youtube_description.txt','w').write(d);print(ch)
PY
python3 -I build.py $S
rm -rf $S/yt2/sub4; mkdir -p sub4; export SUB=sub4; Q=$(( (NF+3)/4 ))
for i in 0 1 2 3; do a=$((i*Q)); b=$(( (i+1)*Q )); [ $b -gt $NF ] && b=$NF; node recp.js $a $b > w5_$i.log 2>&1 & done; wait
echo frames $(ls sub4 | grep -c 'jpg$') / $NF
python3 -c "
from PIL import Image;import glob
bad=0
for f in glob.glob('sub4/*.jpg'):
  try: Image.open(f).verify()
  except Exception: bad+=1
print('bad',bad)"
ffmpeg -hide_banner -loglevel error -y -framerate 30 -i sub4/f%05d_0.jpg -i work/mix_final.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -profile:v high -g 60 -c:a aac -b:a 192k -ar 48000 -movflags +faststart -shortest final4.mp4
ffprobe -v error -show_entries stream=codec_name,width,height,duration -of compact final4.mp4; ffmpeg -hide_banner -i final4.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):"; ls -la final4.mp4
