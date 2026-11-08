import json
W=json.load(open('work/words.json'))
def ts(t):
    h=int(t//3600);m=int(t%3600//60);s=t%60;return f'{h:02d}:{m:02d}:{int(s):02d},{int(round((s-int(s))*1000))%1000:03d}'
def wrap(txt,n):
    lines=['']
    for w in txt.split():
        if lines[-1] and len(lines[-1])+1+len(w)>n: lines.append(w)
        else: lines[-1]=(lines[-1]+' '+w).strip()
    return lines
en=[];idc=[]
for k,L in enumerate(W):
    end=min(W[k+1]['s']-.05,L['e']+.8) if k<len(W)-1 else L['e']+1.5
    cues=[];cur=[]
    for w,o in L['words']:
        if cur and len(wrap(' '.join([x for x,_ in cur]+[w]),42))>2: cues.append(cur);cur=[]
        cur.append((w,o))
    cues.append(cur)
    for j,c in enumerate(cues):
        a=c[0][1];b=cues[j+1][0][1]-.02 if j<len(cues)-1 else end
        en.append((a,b,'\n'.join(wrap(' '.join(x for x,_ in c),42))))
    lines=wrap(L['id'],48);parts=['\n'.join(lines[j:j+2]) for j in range(0,len(lines),2)]
    dur=end-L['s'];tot=sum(len(p) for p in parts);t0=L['s']
    for p in parts: d=dur*len(p)/tot;idc.append((t0,t0+d-.02,p));t0+=d
for name,cues in [('subtitle_en.srt',en),('subtitle_id.srt',idc)]:
    with open(name,'w') as f:
        for i,(a,b,t) in enumerate(cues): f.write(f'{i+1}\n{ts(a)} --> {ts(b)}\n{t}\n\n')
# verify no words lost
src=' '.join(' '.join(w for w,_ in L['words']) for L in W).split();got=' '.join(t.replace('\n',' ') for _,_,t in en).split()
srcid=' '.join(L['id'] for L in W).split();gotid=' '.join(t.replace('\n',' ') for _,_,t in idc).split()
print('EN cues',len(en),'words ok',src==got,'| ID cues',len(idc),'words ok',srcid==gotid,'| monotonic',all(en[i][1]<=en[i+1][0]+1e-6 for i in range(len(en)-1)))
