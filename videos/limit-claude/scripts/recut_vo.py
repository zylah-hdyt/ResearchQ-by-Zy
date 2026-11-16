"""Recut the 46.7 s voice-over into a 15.0 s version.
Keeps sentences 1-5 (hook, two limits, auto reset), tightens pauses, tempo 1.2x (pitch preserved)."""
import subprocess, sys
src, out = sys.argv[1], sys.argv[2]
# (start, end, gap_after) in source seconds; islands found with silencedetect -38 dB
islands = [
 (1.36,1.89,0.14),(2.23,3.13,0.12),(3.26,5.15,0.22),(5.83,6.36,0.12),(6.52,8.56,0.22),
 (9.32,9.77,0.16),(10.01,10.73,0.16),(11.07,14.47,0.20),(14.92,16.44,0.24),
 (17.18,17.54,0.14),(17.82,18.42,0.16),(19.05,21.58,0.0)]
parts=[];f=[]
for i,(s,e,g) in enumerate(islands):
    f.append(f"[0:a]atrim={s}:{e},asetpts=PTS-STARTPTS,afade=t=in:d=0.012,afade=t=out:st={e-s-0.02:.3f}:d=0.02[a{i}]")
    parts.append(f"[a{i}]")
    if g>0:
        f.append(f"anullsrc=r=48000:cl=stereo,atrim=0:{g}[g{i}]"); parts.append(f"[g{i}]")
lead="anullsrc=r=48000:cl=stereo,atrim=0:0.12[lead]"
f.append(lead)
f.append("[lead]"+"".join(parts)+f"concat=n={len(parts)+1}:v=0:a=1,atempo=1.2,loudnorm=I=-15:TP=-1.5:LRA=9,aresample=48000,apad=whole_dur=15,atrim=0:15,afade=t=out:st=14.85:d=0.15[out]")
cmd=["ffmpeg","-v","error","-y","-i",src,"-filter_complex",";".join(f),"-map","[out]","-ac","2","-ar","48000",out]
subprocess.run(cmd,check=True)
