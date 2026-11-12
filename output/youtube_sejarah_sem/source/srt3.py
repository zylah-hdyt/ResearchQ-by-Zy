"""SRT (Indonesian + English) from the same phrase cues the video shows."""
import json
W=json.load(open('work/words.json')); S=json.load(open('subs.json')); CU=[]
for k,w in enumerate(W):
    wi=0
    for en,i in S[k]:
        n=len(en.split()); CU.append(dict(k=k,a=w['words'][wi][1]-.1,en=en,id=i.replace('*',''))); wi+=n
for j,c in enumerate(CU):
    nx=CU[j+1] if j+1<len(CU) else None
    c['b']=(nx['a'] if nx and nx['k']==c['k'] else (min(nx['a']-.05,W[c['k']]['e']+.6) if nx else W[c['k']]['e']+.9))
ts=lambda t:'%02d:%02d:%02d,%03d'%(t//3600,t%3600//60,int(t%60),round((t%1)*1000)%1000)
for lang,f in [('id','subtitle_id.srt'),('en','subtitle_en.srt')]:
    open(f,'w').write('\n'.join(f"{j+1}\n{ts(max(0,c['a']))} --> {ts(c['b'])}\n{c[lang]}\n" for j,c in enumerate(CU)))
print(len(CU),'cues')
