import sys, json, sherpa_onnx, soundfile as sf, numpy as np
Z=sys.argv[1]; prompt_wav=sys.argv[2]; prompt_txt=sys.argv[3]; texts=json.loads(sys.argv[4]); out=sys.argv[5]; steps=int(sys.argv[6]) if len(sys.argv)>6 else 16; speed=float(sys.argv[7]) if len(sys.argv)>7 else 1.0
m=f'{Z}/sherpa-onnx-zipvoice-distill-int8-zh-en-emilia'
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(zipvoice=sherpa_onnx.OfflineTtsZipvoiceModelConfig(tokens=f'{m}/tokens.txt',encoder=f'{m}/encoder.int8.onnx',decoder=f'{m}/decoder.int8.onnx',vocoder=f'{Z}/vocos_24khz.onnx',data_dir=f'{m}/espeak-ng-data',lexicon=f'{m}/lexicon.txt'),num_threads=4))
tts=sherpa_onnx.OfflineTts(cfg); ref,rsr=sf.read(prompt_wav,dtype='float32')
for i,t in enumerate(texts):
    g=sherpa_onnx.GenerationConfig(); g.reference_audio=ref.tolist(); g.reference_sample_rate=rsr; g.reference_text=prompt_txt; g.num_steps=steps; g.speed=speed
    a=tts.generate(t,g); sf.write(f'{out}_{i}.wav',np.array(a.samples,dtype=np.float32),a.sample_rate); print(i,round(len(a.samples)/a.sample_rate,2),a.sample_rate,flush=True)
