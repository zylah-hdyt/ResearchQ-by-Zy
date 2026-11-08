"""SRT files from the same phrase cues used in the video (EN + matching ID), timed by aligned word onsets."""
import json
W=json.load(open('work/words.json'));SUBS=json.load(open('subs.json'))
def ts(t):
    h=int(t//3600);m=int(t%3600//60);s=t%60;ms=int(round((s-int(s))*1000))
    if ms==1000: ms=999
    return f'{h:02d}:{m:02d}:{int(s):02d},{ms:03d}'
def wrap(txt,n=42):
    lines=['']
    for w in txt.split():
        if lines[-1] and len(lines[-1])+1+len(w)>n: lines.append(w)
        else: lines[-1]=(lines[-1]+' '+w).strip()
    return '\n'.join(lines)
cues=[]
for k,(L,cs) in enumerate(zip(W,SUBS)):
    wi=0
    for en,idt in cs:
        a=L['words'][wi][1]-.05;cues.append([a,None,en,idt,k]);wi+=len(en.split())
for i,c in enumerate(cues):
    nx=cues[i+1] if i+1<len(cues) else None
    c[1]=(nx[0]-.03) if nx and nx[4]==c[4] else min((nx[0]-.03) if nx else 1e9,W[c[4]]['e']+.7)
for name,col in [('subtitle_en.srt',2),('subtitle_id.srt',3)]:
    with open(name,'w') as f:
        for i,c in enumerate(cues): f.write(f'{i+1}\n{ts(c[0])} --> {ts(c[1])}\n{wrap(c[col])}\n\n')
print('cues',len(cues),'monotonic',all(cues[i][1]<=cues[i+1][0] for i in range(len(cues)-1)))
