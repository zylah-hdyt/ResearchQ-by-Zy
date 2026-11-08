"""Clone-voice VO: synthesize every line with ZipVoice (reference = user's own video), verify with Whisper, assemble with natural pauses."""
import sys, json, re, random, difflib, sherpa_onnx, soundfile as sf, numpy as np
S=sys.argv[1]; Z=f'{S}/tts/zv'; m=f'{Z}/sherpa-onnx-zipvoice-distill-int8-zh-en-emilia'
L=json.load(open('lines.json')); PT="R square, F square, and Q square may sound similar, but they measure different things."
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(zipvoice=sherpa_onnx.OfflineTtsZipvoiceModelConfig(tokens=f'{m}/tokens.txt',encoder=f'{m}/encoder.int8.onnx',decoder=f'{m}/decoder.int8.onnx',vocoder=f'{Z}/vocos_24khz.onnx',data_dir=f'{m}/espeak-ng-data',lexicon=f'{m}/lexicon.txt'),num_threads=4))
tts=sherpa_onnx.OfflineTts(cfg); ref,rsr=sf.read(f'{S}/ref3/prompt_pad.wav',dtype='float32')
d=f'{S}/asr/sherpa-onnx-whisper-turbo'
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/turbo-encoder.int8.onnx",decoder=f"{d}/turbo-decoder.int8.onnx",tokens=f"{d}/turbo-tokens.txt",language='en',task="transcribe",num_threads=4)
norm=lambda s: re.sub(r'[^a-z ]','',s.lower()).split()
def asr(x,sr):
    n=int(len(x)*16000/sr);y=np.interp(np.linspace(0,len(x)-1,n),np.arange(len(x)),x).astype('float32');s=rec.create_stream();s.accept_waveform(16000,y);rec.decode_stream(s);return s.result.text.strip()
def gen(t,steps,speed):
    g=sherpa_onnx.GenerationConfig();g.reference_audio=ref.tolist();g.reference_sample_rate=rsr;g.reference_text=PT;g.num_steps=steps;g.speed=speed
    a=tts.generate(t,g);return np.array(a.samples,dtype=np.float32),a.sample_rate
def trim(x,sr,th=.006):
    idx=np.nonzero(np.abs(x)>th)[0]
    return x if len(idx)==0 else x[max(0,idx[0]-int(.03*sr)):min(len(x),idx[-1]+int(.08*sr))]
out=[];t=.6;tl=[];SR=24000;rnd=random.Random(7);out.append(np.zeros(int(.6*SR)))
for i,(sec,en,tx,idn) in enumerate(L):
    tx=tx.replace("H.T.M.T.","H T M T").replace("G.O.F.","G O F")
    best=None
    for steps,speed in [(16,1.0),(20,1.0),(24,.98),(16,.97)]:
        x,sr=gen(tx,steps,speed);x=trim(x,sr);heard=asr(x,sr)
        exp=norm(en);got=norm(heard);first_ok=bool(got) and difflib.SequenceMatcher(None,' '.join(exp[:3]),' '.join(got[:3])).ratio()>.6
        score=difflib.SequenceMatcher(None,' '.join(exp),' '.join(got)).ratio()
        if best is None or (first_ok,score)>(best[0],best[1]): best=(first_ok,score,x,heard,steps)
        if first_ok and score>.8: break
    x=best[2];sf.write(f'zvall/l{i:02d}.wav',x,SR)
    tl.append({'i':i,'sec':sec,'s':round(t,3),'e':round(t+len(x)/SR,3),'en':en,'id':idn});out.append(x);t+=len(x)/SR
    nxt=L[i+1][0] if i+1<len(L) else None
    gap=.8 if nxt is None else (1.25+rnd.uniform(0,.2) if nxt!=sec else (.55+rnd.uniform(0,.1) if en.endswith(('?',':')) else .32+rnd.uniform(0,.16)))
    out.append(np.zeros(int(gap*SR)));t+=gap
    print(i,sec,'ok' if best[0] else 'CHECK','%.2f'%best[1],'steps',best[4],'|',best[3][:90],flush=True)
y=np.concatenate(out);sf.write('work/vo_raw_zv.wav',y,SR,subtype='FLOAT');json.dump(tl,open('work/timeline_zv.json','w'),ensure_ascii=False,indent=0)
print('total %.1f s'%(len(y)/SR))
