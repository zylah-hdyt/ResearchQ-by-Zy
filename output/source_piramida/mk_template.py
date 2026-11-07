h=open('../p2/template.html').read()
head=h[:h.index('// ---------- build captions')]
tail=h[h.index('// mascot'):]
def rep(s,a,b):
    assert a in s,a[:50]; return s.replace(a,b)
head=rep(head,'<title>Teknik ATM</title>','<title>Piramida Terbalik</title>')
head=rep(head,":root{--bg:#F2EFE9;--paper:#FBFAF7;--ink:#1B1A18;--muted:#8C877E;--faint:#CBC5BA;--line:#E3DED5;--acc:#EE6A1F;--dk:#1C1B1A}",
 ":root{--bg:#F3F6FA;--paper:#FFFFFF;--ink:#13294B;--muted:#7A879B;--faint:#C3CEDC;--line:#DDE5EF;--acc:#3AA8F0;--accl:#D6ECFB;--dk:#13294B}")
head=rep(head,"mix-blend-mode:multiply;opacity:.35}","mix-blend-mode:multiply;opacity:.10}")
head=rep(head,"#dark{position:absolute;inset:0;background:#151413;opacity:0}","#dark{position:absolute;inset:0;background:#13294B;opacity:0}")
head=rep(head,".card{position:absolute;background:var(--paper);border-radius:22px;border:2px solid rgba(27,26,24,.08);box-shadow:0 22px 44px -16px rgba(60,40,20,.32),0 2px 0 rgba(0,0,0,.03)}",
 ".card{position:absolute;background:var(--paper);border-radius:22px;border:2px solid rgba(19,41,75,.08);box-shadow:0 22px 44px -16px rgba(19,41,75,.28),0 2px 0 rgba(0,0,0,.03)}")
head=rep(head,"#stage{position:relative;width:1080px;height:1920px;overflow:hidden;background:var(--bg);font-family:Inter,sans-serif;color:var(--ink);transform-origin:0 0}",
 "#stage{position:relative;width:1080px;height:1920px;overflow:hidden;background:var(--bg);font-family:Inter,sans-serif;color:var(--ink);transform-origin:0 0}\n#pyr{position:absolute;left:0;top:0;width:1080px;height:1920px;display:none;transform-origin:1010px 600px}\n#pyr .lb{position:absolute;left:0;width:1080px;text-align:center;font-family:PJS;font-weight:800;letter-spacing:-.02em;white-space:nowrap}\n#pyr .nm{display:block;font-family:JBM;font-weight:500;font-size:20px;letter-spacing:.14em;margin-bottom:6px}\n.pin{position:absolute;padding:10px 18px;border-radius:30px;background:var(--ink);color:#fff;font-family:JBM;font-size:22px;white-space:nowrap;box-shadow:0 10px 20px -8px rgba(19,41,75,.5)}")
head=rep(head,'<canvas id="ht" width="1080" height="1920"></canvas>','<div id="pyr"></div>\n<canvas id="ht" width="1080" height="1920"></canvas>')
body=open('body.js').read()
tail=rep(tail,"const dk=(t>=ST[13]-.05&&t<SEND(13))?1:0;op($('#dark'),dk);$('#lbl').style.color=dk?'#8C877E':'';$('#brand').style.color=dk?'#F2EFE9':'#1B1A18';",
 "const dk=BGF(t);op($('#dark'),0);$('#brand').style.color=dk?'#FFFFFF':'#13294B';$('#handle').style.color=dk?'#9FB3CF':'';")
tail=rep(tail,"let k=0;for(let i=0;i<N;i++)if(t>=ST[i]-.05)k=i;$('#lbl').textContent=LBL[k];$('#ctr').innerHTML=CTR[k];","")
tail=rep(tail,"CAP(t);","CAP(t,dk);")
head=rep(head,"END=WORDS[N-1].e+2.9;","END=WORDS[N-1].e+3.2;")
head=rep(head,'<div id="paper"></div><div id="dark"></div>','<div id="bga" class="bgl"></div><div id="bgb" class="bgl"></div><div id="dots" class="bgl"></div><div id="blob1"></div><div id="blob2"></div><div id="paper"></div><div id="dark"></div>')
head=rep(head,'<div id="caps"></div>','<div id="caps"></div><div id="kin"></div>')
head=rep(head,"mix-blend-mode:multiply;opacity:.10}","mix-blend-mode:multiply;opacity:.06}")
head=rep(head,".pin{position:absolute;padding:10px 18px;border-radius:30px;background:var(--ink);color:#fff;font-family:JBM;font-size:22px;white-space:nowrap;box-shadow:0 10px 20px -8px rgba(19,41,75,.5)}",
 ".pin{position:absolute;width:34px;height:34px;border-radius:50%;background:#3AA8F0;border:5px solid #fff;box-shadow:0 0 0 7px rgba(58,168,240,.25),0 8px 18px -4px rgba(19,41,75,.5)}\n.bgl{position:absolute;inset:0}#dots{background-size:38px 38px}#lbl,#ctr{display:none!important}\n#blob1{position:absolute;left:-260px;top:260px;width:980px;height:980px;border-radius:50%;background:radial-gradient(circle,rgba(58,168,240,.20),rgba(58,168,240,0) 68%)}\n#blob2{position:absolute;left:420px;top:900px;width:1000px;height:1000px;border-radius:50%;background:radial-gradient(circle,rgba(124,200,248,.22),rgba(124,200,248,0) 68%)}\n#kin{position:absolute;left:50px;top:215px;width:980px;height:370px}\n.kc{position:absolute;inset:0;display:none;flex-wrap:wrap;align-items:center;justify-content:center;align-content:center;text-align:center}\n.kw{display:inline-block;margin:0 .13em;font-family:PJS;font-weight:800;font-size:86px;line-height:1.1;letter-spacing:-.035em;will-change:transform}\n.kw.em{font-family:IS;font-style:italic;font-weight:400;font-size:110px;letter-spacing:-.01em;line-height:1}")
open('template.html','w').write(head+body+tail)
print('ok')
