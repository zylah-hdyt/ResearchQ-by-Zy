#!/bin/bash
# Procedural sound design beds and hits (no samples needed).
set -e
O=public/sfx; R=48000
ff(){ ffmpeg -v error -y "$@"; }
# deep cinematic drone, 15 s
ff -f lavfi -i "aevalsrc='0.22*sin(2*PI*55*t)*(0.7+0.3*sin(2*PI*0.13*t))+0.12*sin(2*PI*82.5*t+sin(2*PI*0.2*t))+0.06*sin(2*PI*110.3*t)':s=$R:d=15" -f lavfi -i "anoisesrc=c=brown:a=0.05:r=$R:d=15" -filter_complex "[0][1]amix=inputs=2:normalize=0,lowpass=f=900,afade=t=in:d=1.2,afade=t=out:st=13.6:d=1.4,aformat=channel_layouts=stereo" $O/drone.wav
# airy tech bed, 15 s
ff -f lavfi -i "aevalsrc='0.08*sin(2*PI*220*t)*(0.5+0.5*sin(2*PI*0.5*t))+0.06*sin(2*PI*330*t)+0.05*sin(2*PI*440.5*t)*(0.5+0.5*sin(2*PI*2*t))':s=$R:d=15" -f lavfi -i "anoisesrc=c=pink:a=0.03:r=$R:d=15" -filter_complex "[0][1]amix=inputs=2:normalize=0,highpass=f=120,afade=t=in:d=0.8,afade=t=out:st=14:d=1,aformat=channel_layouts=stereo" $O/techbed.wav
# room tone / projector hum, 15 s
ff -f lavfi -i "anoisesrc=c=pink:a=0.06:r=$R:d=15" -f lavfi -i "aevalsrc='0.04*sin(2*PI*24*t)*sin(2*PI*48*t)+0.03*sin(2*PI*60*t)':s=$R:d=15" -filter_complex "[0]bandpass=f=1800:w=1400[n];[n][1]amix=inputs=2:normalize=0,afade=t=in:d=0.6,afade=t=out:st=14:d=1,aformat=channel_layouts=stereo" $O/projector.wav
# sub hit
ff -f lavfi -i "aevalsrc='0.9*sin(2*PI*(38+70*exp(-12*t))*t)*exp(-3.2*t)':s=$R:d=1.6" -af "aformat=channel_layouts=stereo" $O/subhit.wav
# riser 1.4 s
ff -f lavfi -i "anoisesrc=c=white:a=0.5:r=$R:d=1.4" -af "highpass=f=400,lowpass=f=6000,volume='pow(t/1.4,2.2)':eval=frame,aformat=channel_layouts=stereo" $O/riser.wav
# clock tick
ff -f lavfi -i "aevalsrc='0.8*sin(2*PI*3100*t)*exp(-90*t)+0.4*sin(2*PI*1400*t)*exp(-60*t)':s=$R:d=0.12" -af "aformat=channel_layouts=stereo" $O/tick.wav
# glitch burst
ff -f lavfi -i "anoisesrc=c=white:a=0.6:r=$R:d=0.35" -f lavfi -i "aevalsrc='0.5*sgn(sin(2*PI*180*t))*sgn(sin(2*PI*7*t))':s=$R:d=0.35" -filter_complex "[0][1]amix=inputs=2:normalize=0,acrusher=bits=5:samples=12,afade=t=out:st=0.2:d=0.15,aformat=channel_layouts=stereo" $O/glitch.wav
# paper rustle
ff -f lavfi -i "anoisesrc=c=white:a=0.7:r=$R:d=0.45" -af "bandpass=f=3500:w=3000,volume='0.3+0.7*abs(sin(2*PI*9*t))':eval=frame,afade=t=in:d=0.03,afade=t=out:st=0.25:d=0.2,aformat=channel_layouts=stereo" $O/rustle.wav
# stamp thump
ff -f lavfi -i "aevalsrc='0.9*sin(2*PI*(70+120*exp(-30*t))*t)*exp(-14*t)':s=$R:d=0.5" -f lavfi -i "anoisesrc=c=brown:a=0.6:r=$R:d=0.5" -filter_complex "[1]lowpass=f=700,volume='exp(-20*t)':eval=frame[n];[0][n]amix=inputs=2:normalize=0,aformat=channel_layouts=stereo" $O/thump.wav
# soft pop
ff -f lavfi -i "aevalsrc='0.7*sin(2*PI*(900-600*t*8)*t)*exp(-28*t)':s=$R:d=0.18" -af "aformat=channel_layouts=stereo" $O/pop.wav
# shimmer for reset
ff -f lavfi -i "aevalsrc='0.25*(sin(2*PI*1320*t)+sin(2*PI*1760*t)+0.6*sin(2*PI*2640*t))*exp(-2.5*t)*(1-exp(-60*t))':s=$R:d=1.4" -af "aecho=0.8:0.6:90|170:0.35|0.2,aformat=channel_layouts=stereo" $O/shimmer.wav
