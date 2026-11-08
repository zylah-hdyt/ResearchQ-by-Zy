"""Synthesize every line, then assemble with natural, varied pauses. Writes work/vo_raw.wav + work/timeline.json"""
import sys, json, sherpa_onnx, soundfile as sf, numpy as np, random
d=sys.argv[1]; L=json.load(open('lines.json')); SID=16; SPEED=.96
cfg=sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(kokoro=sherpa_onnx.OfflineTtsKokoroModelConfig(model=f"{d}/model.int8.onnx",voices=f"{d}/voices.bin",tokens=f"{d}/tokens.txt",data_dir=f"{d}/espeak-ng-data",lexicon=f"{d}/lexicon-us-en.txt",lang="en-us"),num_threads=4))
tts=sherpa_onnx.OfflineTts(cfg); SR=24000; rnd=random.Random(7)
def trim(x,th=.004):
    idx=np.nonzero(np.abs(x)>th)[0]
    if len(idx)==0: return x
    a=max(0,idx[0]-int(.03*SR)); b=min(len(x),idx[-1]+int(.06*SR)); return x[a:b]
out=[np.zeros(int(.6*SR))]; t=.6; tl=[]
for i,(sec,en,tx,idn) in enumerate(L):
    a=tts.generate(tx,sid=SID,speed=SPEED); x=trim(np.array(a.samples,dtype=np.float32))
    tl.append({'i':i,'sec':sec,'s':round(t,3),'e':round(t+len(x)/SR,3),'en':en,'id':idn}); out.append(x); t+=len(x)/SR
    nxt=L[i+1][0] if i+1<len(L) else None
    if nxt is None: gap=.8
    elif nxt!=sec: gap=1.25+rnd.uniform(0,.2)          # section change: room for the title card
    elif en.endswith('?') or en.endswith(':'): gap=.55+rnd.uniform(0,.1)
    else: gap=.32+rnd.uniform(0,.16)
    out.append(np.zeros(int(gap*SR))); t+=gap
    print(i,sec,round(len(x)/SR,2),flush=True)
y=np.concatenate(out); sf.write('work/vo_raw.wav',y,SR,subtype='FLOAT'); json.dump(tl,open('work/timeline.json','w'),ensure_ascii=False,indent=0)
print('total %.1f s'%(len(y)/SR))
