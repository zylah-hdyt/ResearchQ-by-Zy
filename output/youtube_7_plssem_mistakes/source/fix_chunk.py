import sys, json, sherpa_onnx, soundfile as sf, numpy as np
S=sys.argv[1]; SR=24000; M=f'{S}/tts/zvf/sherpa-onnx-zipvoice-zh-en-emilia'; LEX=f'{S}/tts/zv/sherpa-onnx-zipvoice-distill-int8-zh-en-emilia/lexicon.txt'
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(zipvoice=sherpa_onnx.OfflineTtsZipvoiceModelConfig(tokens=f'{M}/tokens.txt',encoder=f'{M}/text_encoder.onnx',decoder=f'{M}/fm_decoder.onnx',vocoder=f'{S}/tts/zv/vocos_24khz.onnx',data_dir=f'{M}/espeak-ng-data',lexicon=LEX),num_threads=4))
tts=sherpa_onnx.OfflineTts(cfg);ref,rsr=sf.read(f'{S}/ref3/prompt_pad.wav',dtype='float32');PT="R square, F square, and Q square may sound similar, but they measure different things."
d=f'{S}/asr/sherpa-onnx-whisper-turbo';rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/turbo-encoder.int8.onnx",decoder=f"{d}/turbo-decoder.int8.onnx",tokens=f"{d}/turbo-tokens.txt",language='en',task="transcribe",num_threads=4)
L=json.load(open('lines.json'))
base=' '.join(L[i][2].replace('G.O.F.','G O F') for i in range(10,14))
variants=[base.replace("Hair's advice is direct:","Hair's advice is direct."),base.replace("Hair's advice is direct:","Hair's advice, is direct."),base.replace("Hair's advice is direct:","The advice from Hair is direct.")]
for vi,(txt,speed) in enumerate([(variants[0],.95),(variants[1],.97),(variants[0],1.0)]):
    g=sherpa_onnx.GenerationConfig();g.reference_audio=ref.tolist();g.reference_sample_rate=rsr;g.reference_text=PT;g.num_steps=32;g.speed=speed
    x=np.array(tts.generate(txt,g).samples,dtype=np.float32);idx=np.nonzero(np.abs(x)>.006)[0];x=x[max(0,idx[0]-int(.03*SR)):min(len(x),idx[-1]+int(.08*SR))]
    n=int(len(x)*16000/SR);y=np.interp(np.linspace(0,len(x)-1,n),np.arange(len(x)),x).astype('float32');s=rec.create_stream();s.accept_waveform(16000,y);rec.decode_stream(s);h=s.result.text.strip()
    sf.write(f'fix/m2_{vi}.wav',x,SR);print(vi,'%.1f'%(len(x)/SR),'|',h,flush=True)
    if "hair's advice" in h.lower(): print('GOOD',vi,'|');break
