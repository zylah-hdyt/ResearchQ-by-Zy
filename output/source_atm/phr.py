import sys, numpy as np, soundfile as sf, sherpa_onnx, json
S=sys.argv[1]; d=f'{S}/asr/sherpa-onnx-whisper-turbo'
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/turbo-encoder.int8.onnx",decoder=f"{d}/turbo-decoder.int8.onnx",tokens=f"{d}/turbo-tokens.txt",language="id",task="transcribe",num_threads=4)
x,sr=sf.read('work/vf16.wav',dtype='float32'); h=int(.02*sr)
db=np.array([20*np.log10(np.sqrt(np.mean(x[i*h:(i+1)*h]**2))+1e-9) for i in range(len(x)//h)])
q=db<-40; segs=[]; i=0; start=None
# phrases: speech runs separated by >=0.15 s quiet
runs=[];i=0;n=len(q)
while i<n:
    if not q[i]:
        j=i
        while j<n and not q[j]: j+=1
        runs.append([i*.02,j*.02]); i=j
    else: i+=1
ph=[]
for a,b in runs:
    if ph and a-ph[-1][1]<.15: ph[-1][1]=b
    else: ph.append([a,b])
ph=[p for p in ph if p[1]-p[0]>.12]
out=[]
for a,b in ph:
    s=rec.create_stream(); s.accept_waveform(sr,x[int(max(0,a-.08)*sr):int((b+.08)*sr)]); rec.decode_stream(s)
    out.append([round(a,2),round(b,2),s.result.text.strip()]); print(f'{a:6.2f}-{b:6.2f} {s.result.text.strip()}',flush=True)
json.dump(out,open('work/phrases.json','w'),ensure_ascii=False)
