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
tail=rep(tail,"const dk=(t>=ST[13]-.05&&t<SEND(13))?1:0;","const dk=(t>=ST[10]-.05&&t<SEND(10))?1:0;")
tail=rep(tail,"$('#brand').style.color=dk?'#F2EFE9':'#1B1A18';","$('#brand').style.color=dk?'#FFFFFF':'#13294B';")
open('template.html','w').write(head+body+tail)
print('ok')
