import sys,json,sherpa_onnx,soundfile as sf,numpy as np
S=sys.argv[1];a,b=int(sys.argv[2]),int(sys.argv[3]);d=f'{S}/asr/sherpa-onnx-whisper-turbo'
rec=sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/turbo-encoder.int8.onnx",decoder=f"{d}/turbo-decoder.int8.onnx",tokens=f"{d}/turbo-tokens.txt",language='en',task="transcribe",num_threads=4)
x,sr=sf.read('work/vo_raw_v3.wav',dtype='float32');W=json.load(open('work/words.json'))
s,e=W[a]['words'][0][1],W[b]['e']+.1;y=x[int(s*sr):int(e*sr)];n=int(len(y)*16000/sr);y=np.interp(np.linspace(0,len(y)-1,n),np.arange(len(y)),y).astype('float32')
st=rec.create_stream();st.accept_waveform(16000,y);rec.decode_stream(st);print(round(s,2),round(e,2),st.result.text)
