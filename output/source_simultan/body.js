// ---------- scene backgrounds (per sentence): dark / cream / orange
const BG=['#141311','#F2EFE9','#EE6A1F','#F2EFE9','#141311','#F2EFE9','#141311','#F2EFE9','#141311'];
const bgType=c=>c==='#141311'?'d':c==='#EE6A1F'?'o':'l';let BGT='d';
function BGF(t){let k=0;for(let i=0;i<N;i++)if(t>=ST[i]-.25)k=i;const prev=BG[Math.max(0,k-1)],cur=BG[k];const p=k?o3(P(t,ST[k]-.25,ST[k]+.3)):1;
  $('#bga').style.background=prev;const b=$('#bgb');b.style.background=cur;b.style.clipPath=`circle(${(p*2300).toFixed(1)}px at 540px 900px)`;
  BGT=bgType(p>.5?cur:prev);const g=$('#dots');g.style.opacity=1;g.style.backgroundImage=`radial-gradient(circle, ${BGT==='l'?'rgba(27,26,24,.09)':'rgba(255,255,255,.10)'} 1.7px, transparent 2px)`;
  g.style.backgroundPosition=`${(t*6).toFixed(1)}px ${(t*10).toFixed(1)}px`;
  $('#blob1').style.transform=`translate(${(60*Math.sin(t*.35)).toFixed(1)}px,${(40*Math.cos(t*.3)).toFixed(1)}px)`;$('#blob2').style.transform=`translate(${(-50*Math.sin(t*.28)).toFixed(1)}px,${(60*Math.sin(t*.22)).toFixed(1)}px)`;
  op($('#blob1'),BGT==='o'?.0:1);op($('#blob2'),BGT==='o'?.0:1);return BGT==='l'?0:1}

// ---------- kinetic captions: 1-3 word chunks, words land as they are spoken
const EMS=[["simultan.","ada?"],["Hair,"],["simultan","bersamaan."],["bersama-sama"],["F.","nggak"],["R","kuadrat.","gabungan"],["0,62,","62","persen"],["R","kuadrat,","beda."],["panduan","ebook,"]];
const CH=[];WORDS.forEach((s,k)=>{let cur=[];s.words.forEach(([w],i)=>{cur.push(i);const txt=cur.map(j=>s.words[j][0]).join(' ');
  const last=i===s.words.length-1,rem=s.words.length-1-i;if(last||/[,.?:;!]$/.test(w)||cur.length>=3||txt.length>=17){if(rem===1&&!/[,.?:;!]$/.test(w)&&cur.length<3)return;CH.push({k,ids:cur});cur=[]}})});
CH.forEach((c,i)=>{c.a=W(c.k,c.ids[0])-.1;c.v=i%4});CH.forEach((c,i)=>{c.b=i<CH.length-1?CH[i+1].a:END});
$('#kin').innerHTML=CH.map((c,i)=>`<div class="kc" id="kc${i}">${c.ids.map(j=>{const w=WORDS[c.k].words[j][0];return `<span class="kw${EMS[c.k].includes(w)?' em':''}">${w}</span>`}).join('')}</div>`).join('');
function CAP(t,dk){const nc=BGT==='l'?'#1B1A18':'#FFFFFF',ec=BGT==='l'?'#EE6A1F':BGT==='o'?'#1B1A18':'#FF8A3D';
  CH.forEach((c,i)=>{const el=$('#kc'+i);const on=t>=c.a-.05&&t<c.b&&t<END-2.75;if(!sh(el,on))return;el.style.display='flex';
  const q=P(t,c.b-.13,c.b);el.style.opacity=(1-q).toFixed(3);el.style.transform=`translateY(${(-60*o3(q)).toFixed(1)}px) scale(${(1-.06*q).toFixed(3)})`;
  [...el.children].forEach((sp,j)=>{const o=W(c.k,c.ids[j]),p=P(t,o-.07,o+.23),e=o4(p),b=p>0?bk(p,1.4):0;let tr='',f='none';
    if(c.v===0)tr=`translateY(${((1-e)*70).toFixed(1)}px) rotate(${((1-e)*6).toFixed(2)}deg)`;
    else if(c.v===1){tr=`scale(${(1.6-.6*b).toFixed(3)})`;f=`blur(${((1-e)*12).toFixed(1)}px)`}
    else if(c.v===2)tr=`translateX(${((1-e)*90).toFixed(1)}px)`;
    else tr=`translateY(${((1-b)*-60).toFixed(1)}px)`;
    const em=sp.classList.contains('em');if(em)tr+=` scale(${(1+.08*Math.sin(Math.PI*P(t,o+.15,o+.5))).toFixed(3)})`;
    sp.style.opacity=cl(p*2.5).toFixed(3);sp.style.transform=tr;sp.style.filter=f;sp.style.color=em?ec:nc})})}

// ---------- mascot pose timeline (9 poses)
const PT=[[0,'m_think'],[W(0,6)-.1,'n_shrug'],[ST[1]-.05,'n_present'],[ST[2]-.05,'n_idea'],[ST[3]-.05,'m_point'],[ST[4]-.05,'n_shrug'],[W(4,6)-.1,'m_warn'],[ST[5]-.05,'n_idea'],[ST[6]-.05,'m_open'],[ST[7]-.05,'n_present'],[W(7,11)-.1,'m_thumb'],[ST[8]-.05,'n_wink']];
const SC=[];for(let k=0;k<N;k++){const d=document.createElement('div');d.className='sc';d.id='s'+k;$('#scenes').appendChild(d);SC.push(d)}
function H(k,html){SC[k].insertAdjacentHTML('beforeend',html)}
const circ=(id,x,y,r,txt,cls='')=>`<div class="ab nd ${cls}" id="${id}" style="left:${x-r}px;top:${y-r}px;width:${2*r}px;height:${2*r}px;border-radius:50%;background:#FBFAF7;border:5px solid #1B1A18;font-family:Anton;font-size:${r*.8}px;line-height:${2*r-10}px;text-align:center;box-shadow:0 18px 30px -14px rgba(0,0,0,.35)">${txt}</div>`;

// S0 hook (dark): mini SEM-PLS path model + "?"
H(0,`<div class="chip" id="ch0" style="left:72px;top:620px;background:#EE6A1F">SEM-PLS · SMARTPLS</div>
  ${circ('x10',260,760,70,'X1')}${circ('x20',260,960,70,'X2')}${circ('y0',720,860,90,'Y')}
  <div class="ab" id="qm0" style="left:830px;top:640px;font-family:IS;font-style:italic;font-size:220px;color:#FF8A3D">?</div>`);
SC[0].appendChild(mkStamp('st0',[['UJI',0],['SIMULTAN?',1]],1110,130));$('#st0').style.color='#FFFFFF';

// S1 Hair cover (cream)
H(1,`<div class="ab" id="bk1" style="left:325px;top:625px;width:430px;height:556px;perspective:1400px"><img id="cv1" src="${HAIR.cover}" style="width:430px;height:556px;border-radius:6px;box-shadow:0 40px 70px -20px rgba(0,0,0,.55),0 6px 14px rgba(0,0,0,.2)"></div>
  <div class="ab mono" id="cit1" style="left:0;width:1080px;top:1215px;text-align:center;font-size:24px;color:#8C877E">Hair, Hult, Ringle & Sarstedt (2022) · 3rd edition</div>`);

// S2 KBBI (orange)
H(2,`<div class="ab" id="sw2" style="left:0;width:1080px;top:600px;text-align:center;font-family:Anton;font-size:150px;line-height:1;color:#FFFFFF">SIMULTAN</div>
  <i class="ab" id="sk2" style="left:250px;top:675px;width:580px;height:14px;border-radius:7px;background:#1B1A18;transform-origin:0 50%"></i>
  <div class="chip" id="nu2" style="left:390px;top:790px;background:#1B1A18;font-size:30px">≠ nama uji statistik</div>
  <div class="card" id="kb2" style="left:110px;top:900px;width:860px;height:300px;padding:34px 44px"><div class="mono" style="font-size:22px;color:#8C877E">KBBI</div>
   <div style="font-family:PJS;font-weight:800;font-size:60px;letter-spacing:-.02em">si·mul·tan <span style="font-family:IS;font-style:italic;font-weight:400;font-size:44px;color:#8C877E">a</span></div>
   <div style="font-size:38px;line-height:1.35;margin-top:8px">terjadi atau berlaku pada waktu yang <span id="hb2" style="position:relative;font-weight:700">bersamaan<i id="mk2" style="position:absolute;left:-6px;right:-6px;bottom:2px;height:22px;background:rgba(238,106,31,.35);z-index:-1;transform-origin:0 50%"></i></span>; serentak</div></div>`);

// S3 X1, X2 -> Y together (cream)
H(3,`${circ('x13',230,700,85,'X1')}${circ('x23',230,1060,85,'X2')}${circ('y3',800,880,105,'Y')}
  <div class="chip" id="bs3" style="left:72px;top:850px;background:#EE6A1F;font-size:26px">bersama-sama</div>
  <div class="ab" id="qm3" style="left:900px;top:640px;font-family:IS;font-style:italic;font-size:200px;color:#EE6A1F">?</div>`);

// S4 regression vs PLS-SEM (dark)
H(4,`<div class="card" id="rg4" style="left:80px;top:620px;width:420px;height:600px;padding:36px 34px"><div class="chip" style="position:relative;display:inline-block">REGRESI</div>
   ${['Uji t (parsial)','Uji F (simultan)','R²'].map((r,i)=>`<div class="rr4" style="position:relative;margin-top:${i?18:34}px;height:96px;border-radius:16px;background:#F2EFE9;font-family:PJS;font-weight:800;font-size:32px;line-height:96px;padding-left:24px">${r}${i===1?'<span class="ok4" style="position:absolute;right:20px;top:20px;width:56px;height:56px;border-radius:50%;background:#2E9E5B;color:#fff;font-size:34px;line-height:56px;text-align:center">✓</span>':''}</div>`).join('')}</div>
  <div class="card" id="pl4" style="left:540px;top:620px;width:460px;height:600px;padding:30px 30px"><div class="chip" style="position:relative;display:inline-block;background:#EE6A1F">PLS-SEM · HAIR BAB 6</div>
   <img src="${HAIR.ex}" style="display:block;width:400px;margin-top:24px;border-radius:6px;border:2px solid #E3DED5"></div>
  <div class="ab" id="nf4" style="left:560px;top:880px;width:420px;padding:22px 10px;border:8px solid #E5463A;border-radius:18px;background:rgba(255,255,255,.92);color:#E5463A;font-family:Anton;font-size:64px;line-height:1.05;text-align:center;transform:rotate(-8deg)">UJI F?<br>TIDAK ADA</div>`);

// S5 R² + Hair's sentence (cream)
const QH=HAIR.qh,qs=940/QH.w;
H(5,`<div class="ab" id="r25" style="left:72px;top:590px;font-family:Anton;font-size:200px;line-height:1;color:#EE6A1F">R²</div>
  <div class="ab" id="rl5" style="left:330px;top:640px;font-family:PJS;font-weight:800;font-size:44px;line-height:1.15;letter-spacing:-.02em">koefisien<br>determinasi</div>
  <div class="card" id="qp5" style="left:70px;top:830px;width:940px;height:${(QH.h*qs+20).toFixed(0)}px;padding:10px 0;overflow:hidden"><img src="${HAIR.q}" style="display:block;width:940px">
   ${QH.lines.map((l,i)=>`<i class="ab hl5" style="left:${(l[0]*qs).toFixed(1)}px;top:${(10+l[1]*qs).toFixed(1)}px;width:${(l[2]*qs).toFixed(1)}px;height:${(l[3]*qs).toFixed(1)}px;background:rgba(238,106,31,.38);transform-origin:0 50%;mix-blend-mode:multiply"></i>`).join('')}</div>
  <div class="ab" id="tq5" style="left:70px;top:${(840+QH.h*qs+30).toFixed(0)}px;width:940px;font-family:IS;font-style:italic;font-size:46px;line-height:1.2">“…the exogenous latent variables’ <span style="color:#EE6A1F">combined effects</span> on the endogenous latent variable.”</div>
  <div class="chip" id="id5" style="left:70px;top:${(840+QH.h*qs+150).toFixed(0)}px;font-size:28px">= pengaruh gabungan semua X ke Y</div>`);

// S6 R² gauge (dark)
H(6,`<svg class="ab" style="left:190px;top:640px" width="700" height="400" viewBox="0 0 700 400"><path d="M50 360 A300 300 0 0 1 650 360" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="48" stroke-linecap="round"/><path id="ga6" d="M50 360 A300 300 0 0 1 650 360" fill="none" stroke="#EE6A1F" stroke-width="48" stroke-linecap="round"/></svg>
  <div class="ab" id="nv6" style="left:0;width:1080px;top:830px;text-align:center;font-family:Anton;font-size:150px;line-height:1;color:#FFFFFF">0,00</div>
  <div class="ab mono" style="left:0;width:1080px;top:990px;text-align:center;font-size:26px;color:#BDB6AA">R² · ilustrasi</div>
  <div class="ab" id="bar6" style="left:110px;top:1070px;width:860px;height:84px;border-radius:42px;background:rgba(255,255,255,.12);overflow:hidden"><i id="bf6" class="ab" style="left:0;top:0;height:84px;background:#EE6A1F;border-radius:42px"></i>
   <div class="ab" style="left:30px;top:20px;font-family:PJS;font-weight:800;font-size:34px;color:#fff">X1 + X2 → 62% variasi Y</div></div>
  <div class="ab mono" id="ot6" style="left:110px;top:1170px;font-size:22px;color:#BDB6AA">sisanya dijelaskan faktor lain di luar model</div>`);

// S7 sidang (cream)
H(7,`<div class="ab" id="pg7" style="left:72px;top:620px;max-width:700px;padding:26px 32px;border-radius:30px 30px 30px 8px;background:#1B1A18;color:#F2EFE9;font-size:38px;font-weight:600"><span class="mono" style="display:block;font-size:20px;color:#8C877E;margin-bottom:6px">PENGUJI</span>"Mana uji simultannya?"</div>
  <div class="ab" id="ms7" style="right:72px;top:830px;max-width:760px;padding:26px 32px;border-radius:30px 30px 8px 30px;background:#EE6A1F;color:#fff;font-size:38px;font-weight:700;line-height:1.25"><span class="mono" style="display:block;font-size:20px;color:#FFE1CC;margin-bottom:6px;font-weight:500">KAMU</span>"Pengaruh bersama-sama dilihat dari nilai R², Pak/Bu 🙏"</div>`);
SC[7].appendChild(mkStamp('st7',[['BERES.',1]],1100,140));
// S8 CTA build-up (dark): own ebook mock + comment box
H(8,`<div class="ab" id="eb8" style="left:350px;top:610px;width:380px;height:480px;border-radius:10px;background:linear-gradient(160deg,#F2EFE9,#E9E2D6);box-shadow:0 40px 70px -20px rgba(0,0,0,.6);overflow:hidden">
   <i style="position:absolute;left:0;top:0;bottom:0;width:30px;background:#EE6A1F"></i><div class="mono" style="position:absolute;left:62px;top:54px;font-size:20px;color:#8C877E;letter-spacing:.12em">PANDUAN</div>
   <div style="position:absolute;left:62px;top:90px;width:290px;font-family:Anton;font-size:80px;line-height:1">SEM-PLS</div><div style="position:absolute;left:62px;top:190px;width:280px;font-size:28px;font-weight:600;line-height:1.3">dari baca output sampai jawab penguji</div>
   <div style="position:absolute;left:62px;bottom:44px;font-family:PJS;font-weight:800;font-size:30px">ResearchQ<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#EE6A1F;margin-left:3px"></span></div></div>
  <div class="ab" id="cb8" style="left:110px;top:1150px;width:860px;height:100px;border-radius:50px;background:#2A2826;border:2px solid rgba(255,255,255,.12)"><div class="ab" id="ct8" style="left:40px;top:28px;font-size:38px;font-weight:600;color:#8C877E;white-space:nowrap">Tambahkan komentar…</div>
   <div class="ab" id="sb8" style="right:12px;top:12px;width:76px;height:76px;border-radius:50%;background:#EE6A1F;color:#fff;font-size:40px;line-height:76px;text-align:center">➤</div></div>`);
// CTA overlay with real platform logos (user-provided)
$('#cta').innerHTML=`<div class="ab" style="inset:0;background:rgba(20,19,17,.86)"></div><div class="ab" id="ct1" style="left:0;width:1080px;top:440px;text-align:center;font-family:Anton;font-size:130px;line-height:1.05;color:#FFFFFF">KOMEN <span style="color:#EE6A1F">EBOOK</span></div>
  <div class="ab" id="ct2" style="left:0;width:1080px;top:600px;text-align:center;font-size:36px;font-weight:600;color:#BDB6AA">link panduannya gue kirim 📩</div>
  ${[['TIKTOK','@researchq.id','tiktok'],['INSTAGRAM','@researchq.id','instagram'],['YOUTUBE','NotYourLecture','youtube']].map(([n,h,l],i)=>`<div class="pl" id="pl${i}" style="top:${720+i*150}px"><img src="${LOGO[l]}"><div class="n">${n}</div><div class="h">${h}</div></div>`).join('')}`;
const D={};
D.a03=mkDraw(SC[0],'M335 775 L625 845',7);D.b03=mkDraw(SC[0],'M335 945 L625 875',7);
D.a3=mkDraw(SC[3],'M318 712 L690 860',9);D.b3=mkDraw(SC[3],'M318 1048 L690 900',9);
D.br3=mkDraw(SC[3],'M120 640 Q80 640 80 700 L80 1060 Q80 1120 120 1120',6);
const HT=[];const htx=$('#ht').getContext('2d');function HALF(t){}
const _draw=draw;draw=function(p,t,a,dur=.35){_draw(p,t,a,dur);p.style.opacity=t<a?0:1};
function PYR(){}

// ---------- scenes (each fades/lifts out in its last 0.18 s)
function S(k,t,k2=k){const e=SEND(k2),on=sh(SC[k],t>=ST[k]-.02&&t<e);if(on){const x=k2===N-1?P(t,END-2.9,END-2.7):P(t,e-.18,e);SC[k].style.opacity=(1-x).toFixed(3);SC[k].style.transform=`translateY(${(-30*x).toFixed(1)}px) scale(${(1-.03*x).toFixed(3)})`}return on}
function scenes(t){
  if(S(0,t)){pop($('#ch0'),t,ST[0]+.05,{dx:-60,dy:0,s0:.85});['x10','x20','y0'].forEach((id,i)=>pop($('#'+id),t,ST[0]+.1+i*.1,{s0:.3}));D.a03.style.stroke=D.b03.style.stroke='#BDB6AA';draw(D.a03,t,ST[0]+.4,.3);draw(D.b03,t,ST[0]+.45,.3);
    pop($('#qm0'),t,W(0,6)-.1,{s0:.2,r:20});stamp($('#st0'),t,W(0,4)-.05)}
  if(S(1,t)){const c=$('#bk1');pop(c,t,ST[1]+.02,{dy:140,s0:.8});const p=o3(P(t,ST[1],ST[1]+.8));$('#cv1').style.transform=`rotateY(${L(-28,-8,p).toFixed(2)}deg) rotateX(${L(8,2,p).toFixed(2)}deg)`;
    $('#cv1').style.transform+=` translateY(${(6*Math.sin(t*2)).toFixed(1)}px)`;pop($('#cit1'),t,W(1,6)-.05,{dy:20,s0:.95})}
  if(S(2,t)){pop($('#sw2'),t,ST[2]+.05,{dy:60,s0:.7});const k=P(t,W(2,3)-.05,W(2,3)+.25);$('#sk2').style.transform=`scaleX(${o3(k).toFixed(3)})`;op($('#sk2'),k>0?1:0);
    $('#sw2').style.opacity=(1-.45*k).toFixed(3);pop($('#nu2'),t,W(2,4),{dy:20,s0:.6});pop($('#kb2'),t,W(2,6)-.1,{dy:80,s0:.88});$('#mk2').style.transform=`scaleX(${o3(P(t,W(2,9)-.05,W(2,9)+.3)).toFixed(3)})`}
  if(S(3,t)){['x13','x23','y3'].forEach((id,i)=>pop($('#'+id),t,ST[3]+.05+i*.12,{s0:.3}));const g=W(3,5)-.05;draw(D.a3,t,g,.35);draw(D.b3,t,g,.35);draw(D.br3,t,g,.35);pop($('#bs3'),t,g+.1,{dx:-40,dy:0,s0:.7});
    const gl=t>g?.5+.5*Math.sin((t-g)*7):0;['x13','x23'].forEach(id=>$('#'+id).style.borderColor=t>g?`rgb(${Math.round(L(27,238,gl))},${Math.round(L(26,106,gl))},${Math.round(L(24,31,gl))})`:'#1B1A18');pop($('#qm3'),t,W(3,9)-.1,{s0:.2,r:20})}
  if(S(4,t)){pop($('#rg4'),t,ST[4]+.05,{dx:-120,dy:0,s0:.9});const f=W(4,4)-.05;document.querySelectorAll('#s4 .rr4').forEach((r,i)=>{r.style.background=i===1&&t>f?'#FFE1CC':'#F2EFE9'});const ok=$('#s4 .ok4'),p=P(t,f,f+.3);ok.style.transform=`scale(${(p>0?bk(p):0).toFixed(3)})`;
    pop($('#pl4'),t,W(4,7)-.1,{dx:120,dy:0,s0:.9});const n=W(4,12)-.08,q=P(t,n,n+.25);const nf=$('#nf4');op(nf,q*3);nf.style.transform=`rotate(-8deg) scale(${(q>0?2.2-1.2*bk(q,2):2.2).toFixed(3)})`}
  if(S(5,t)){pop($('#r25'),t,W(5,3)-.08,{s0:.3,r:-10});pop($('#rl5'),t,W(5,3)+.15,{dx:-40,dy:0,s0:.9});pop($('#qp5'),t,W(5,5)-.1,{dy:80,s0:.9});
    document.querySelectorAll('#s5 .hl5').forEach((h,i)=>{const s=W(5,7)+i*.25;h.style.transform=`scaleX(${o3(P(t,s,s+.3)).toFixed(3)})`});pop($('#tq5'),t,W(5,9)-.05,{dy:30,s0:.95});pop($('#id5'),t,W(5,11)-.05,{dy:20,s0:.7})}
  if(S(6,t)){const g=$('#ga6'),Lg=g.getTotalLength(),v=.62*o3(P(t,W(6,1)-.1,W(6,3)+.3));g.style.strokeDasharray=Lg;g.style.strokeDashoffset=(Lg*(1-v)).toFixed(1);$('#nv6').textContent=v.toFixed(2).replace('.',',');
    const b=o3(P(t,W(6,7)-.1,W(6,9)+.2));$('#bf6').style.width=(860*.62*b).toFixed(1)+'px';pop($('#bar6'),t,W(6,5)-.1,{dy:40,s0:.9});pop($('#ot6'),t,W(6,10),{dy:10,s0:.95})}
  if(S(7,t)){pop($('#pg7'),t,ST[7]+.05,{dx:-60,dy:20,s0:.7});pop($('#ms7'),t,W(7,5)-.1,{dx:60,dy:20,s0:.7});stamp($('#st7'),t,W(7,11)-.05);$('#st7').style.color='#2E9E5B'}
  if(S(8,t)){pop($('#eb8'),t,ST[8]+.05,{dy:120,s0:.8,r:-6});$('#eb8').style.transform+=` rotate(-4deg) translateY(${(8*Math.sin(t*2.2)).toFixed(1)}px)`;pop($('#cb8'),t,W(8,5)-.3,{dy:40,s0:.9});
    const tx='EBOOK',n=Math.floor(cl((t-W(8,5))*14,0,5));const ct=$('#ct8');ct.textContent=n?tx.slice(0,n)+(n<5?'|':''):'Tambahkan komentar…';ct.style.color=n?'#FFFFFF':'#8C877E';
    $('#sb8').style.transform=`scale(${(1-.15*Math.sin(Math.PI*P(t,W(8,6),W(8,6)+.2))).toFixed(3)})`}
}
function CTA(t){const a=END-2.75;const c=$('#cta');if(!sh(c,t>=a))return;op(c,P(t,a,a+.25));pop($('#ct1'),t,a+.1,{dy:50,s0:.7});pop($('#ct2'),t,a+.3,{dy:20,s0:.9});[0,1,2].forEach(i=>pop($('#pl'+i),t,a+.5+i*.16,{dx:-160,dy:0,s0:.85}))}
