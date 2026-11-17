import sys,json,glob,re
P=sys.argv[1];SENT=json.load(open(f'{P}/sentences.json'));out={}
for f in glob.glob(f'{P}/words_*_*.json'):
    for s in json.load(open(f)): out[round(s['s'],2)]=s
for f in glob.glob(f'{P}/al_*_done.log'):
    for line in open(f):
        m=re.match(r'\s*([\d.]+)\s+(.*)',line)
        if not m or '@' not in line: continue
        a=float(m.group(1));k=[i for i,s in enumerate(SENT) if abs(s[0]-a)<.01][0]
        ws=[[w.rsplit('@',1)[0],float(w.rsplit('@',1)[1])] for w in m.group(2).split()]
        out.setdefault(round(a,2),{'s':a,'e':SENT[k][1],'words':ws})
W=[out[round(s[0],2)] for s in SENT]
json.dump(W,open(f'{P}/work/words.json','w'),ensure_ascii=False)
print('sentences',len(W),'words',sum(len(s['words']) for s in W))
