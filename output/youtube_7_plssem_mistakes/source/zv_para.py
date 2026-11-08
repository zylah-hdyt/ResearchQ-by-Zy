import sys, json, sherpa_onnx, soundfile as sf, numpy as np
S=sys.argv[1]; model=sys.argv[2]; texts=json.loads(sys.argv[3]); out=sys.argv[4]; steps=int(sys.argv[5]); speed=float(sys.argv[6])
Z=f'{S}/tts'; m=model; full='zvf' in m
enc='text_encoder.onnx' if full else 'encoder.int8.onnx'; dec='fm_decoder.onnx' if full else 'decoder.int8.onnx'; lex=f'{S}/tts/zv/sherpa-onnx-zipvoice-distill-int8-zh-en-emilia/lexicon.txt'
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(zipvoice=sherpa_onnx.OfflineTtsZipvoiceModelConfig(tokens=f'{m}/tokens.txt',encoder=f'{m}/{enc}',decoder=f'{m}/{dec}',vocoder=f'{Z}/zv/vocos_24khz.onnx',data_dir=f'{m}/espeak-ng-data',lexicon=lex),num_threads=4))
tts=sherpa_onnx.OfflineTts(cfg); ref,rsr=sf.read(f'{S}/ref3/prompt_pad.wav',dtype='float32')
PT="R square, F square, and Q square may sound similar, but they measure different things."
for i,t in enumerate(texts):
    g=sherpa_onnx.GenerationConfig();g.reference_audio=ref.tolist();g.reference_sample_rate=rsr;g.reference_text=PT;g.num_steps=steps;g.speed=speed
    a=tts.generate(t,g);sf.write(f'{out}_{i}.wav',np.array(a.samples,dtype=np.float32),a.sample_rate);print(i,round(len(a.samples)/a.sample_rate,2),flush=True)
