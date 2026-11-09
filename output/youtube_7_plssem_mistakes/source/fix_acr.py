"""Re-synthesize every chunk that mentions PLS-SEM / SEM-PLS with fluent acronym spelling, verify with Whisper, splice back."""
import sys, json, re, sherpa_onnx, soundfile as sf, numpy as np
S=sys.argv[1]; SR=24000; M=f'{S}/tts/zvf/sherpa-onnx-zipvoice-zh-en-emilia'; LEX=f'{S}/tts/zv/sherpa-onnx-zipvoice-distill-int8-zh-en-emilia/lexicon.txt'
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(zipvoice=sherpa_onnx.OfflineTtsZipvoiceModelConfig(tokens=f'{M}/tokens.txt',encoder=f'{M}/text_encoder.onnx',decoder=f'{M}/fm_decoder.onnx',vocoder=f'{S}/tts/zv/vocos_24khz.onnx',data_dir=f'{M}/espeak-ng-data',lexicon=LEX),num_threads=4))
tts=sherpa_onnx.OfflineTts(cfg);ref,rsr=sf.read(f'{S}/ref3/prompt_pad.wav',dtype='float32');PT="R square, F square, and Q square may sound similar, but they measure different things."
d=f'{S}/asr/sherpa-onnx-whisper-turbo';rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/turbo-encoder.int8.onnx",decoder=f"{d}/turbo-decoder.int8.onnx",tokens=f"{d}/turbo-tokens.txt",language='en',task="transcribe",num_threads=4)
L=json.load(open('lines.json'));W=json.load(open('work/words.json'));x_all,_=sf.read('work/vo_raw_v3.wav',dtype='float32')
def fluent(t): return t.replace('SEM P.L.S.','SEM PLS').replace('P.L.S. SEM','PLS SEM').replace('P.L.S.','PLS').replace('H.T.M.T.','H T M T').replace('G.O.F.','G O F').replace("Hair's advice is direct:","Hair's advice is direct.")
def asr(x):
    n=int(len(x)*16000/SR);y=np.interp(np.linspace(0,len(x)-1,n),np.arange(len(x)),x).astype('float32');s=rec.create_stream();s.accept_waveform(16000,y);rec.decode_stream(s);return s.result.text.strip()
chunks=[]
for i,l in enumerate(L):
    if chunks and chunks[-1]['sec']==l[0] and sum(len(L[j][1]) for j in chunks[-1]['lines'])+len(l[1])<=300: chunks[-1]['lines'].append(i)
    else: chunks.append({'sec':l[0],'lines':[i]})
for c in chunks:
    if not any('P.L.S.' in L[i][2] for i in c['lines']): continue
    text=' '.join(fluent(L[i][2]) for i in c['lines']); need=sum(L[i][1].count('PLS')+L[i][1].count('SEM-PLS')*0 for i in c['lines'])
    best=None
    for steps,speed in [(32,1.0),(32,.97),(28,.95)]:
        g=sherpa_onnx.GenerationConfig();g.reference_audio=ref.tolist();g.reference_sample_rate=rsr;g.reference_text=PT;g.num_steps=steps;g.speed=speed
        x=np.array(tts.generate(text,g).samples,dtype=np.float32);idx=np.nonzero(np.abs(x)>.006)[0];x=x[max(0,idx[0]-int(.03*SR)):min(len(x),idx[-1]+int(.08*SR))]
        h=asr(x).lower();got=len(re.findall(r'pls',h.replace(' ','').replace('-','').replace('.','')))
        ok=got>=need and ('advice' not in ' '.join(L[i][1] for i in c['lines']).lower() or 'advice' in h)
        if best is None or (ok,got)>(best[0],best[1]): best=(ok,got,x,h)
        if ok: break
    ok,got,x,h=best
    a=W[c['lines'][0]]['words'][0][1];b=W[c['lines'][-1]]['e']+.05;ia,ib=int(a*SR),int(b*SR);delta=(len(x)-(ib-ia))/SR
    x_all=np.concatenate([x_all[:ia],x,x_all[ib:]])
    for i,Ln in enumerate(W):
        if i>c['lines'][-1]: Ln['s']=round(Ln['s']+delta,3);Ln['e']=round(Ln['e']+delta,3);Ln['words']=[[w,round(o+delta,3)] for w,o in Ln['words']]
    W[c['lines'][-1]]['e']=round(a+len(x)/SR-.05,3)
    print(c['sec'],c['lines'][0],'-',c['lines'][-1],'ok' if ok else 'CHECK','pls %d/%d'%(got,need),'delta %+.2f |'%delta,h[:110],flush=True)
sf.write('work/vo_raw_v3.wav',x_all,SR,subtype='FLOAT');json.dump(W,open('work/words.json','w'),ensure_ascii=False);print('total %.1f s |'%(len(x_all)/SR))
