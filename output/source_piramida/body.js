// ---------- build captions
const EMS=[["piramida","terbalik"],["luas,"],["mengerucut","masalah"],["film."],["konflik","memperkenalkan"],["situasinya,","cerita","utama."],["latar","belakang"],["fenomena","umum,"],["spesifik,"],["masalah","fokus","penelitian."],["gambaran","besarnya"],["umum","khusus."],["Follow","metodologi","analisis"]];
(function(){$('#caps').innerHTML=WORDS.map((s,k)=>`<div class="cap" id="cap${k}">${s.words.map(([w],i)=>`<span class="${EMS[k].includes(w)?'em':''}">${w}</span>`).join('')}</div>`).join('')})();
function CAP(t){let k=-1;for(let i=0;i<N;i++)if(t>=ST[i]-.05)k=i;for(let i=0;i<N;i++)sh($('#cap'+i),i===k&&t<END-2.6);if(k<0)return;
  const dk=+($('#dark').style.opacity||0);[...$('#cap'+k).children].forEach((sp,i)=>{const o=W(k,i),p=P(t,o-.04,o+.1);sp.style.opacity=(p>0?.25+.75*p:0).toFixed(3);
    if(!sp.classList.contains('em'))sp.style.color=dk>.5?'#FFFFFF':'#13294B'})}
const LBL=['// 01 · istilah','// 02 · konsepnya','// 02 · konsepnya','// 03 · analogi film','// 03 · analogi film','// 03 · analogi film','// 04 · latar belakang','// 05 · piramida terbalik','// 05 · piramida terbalik','// 05 · piramida terbalik','// 06 · jangan langsung','// 07 · ringkasnya','// 08 · follow'];
const CTR=['','LUAS','<b>→</b> MENGERUCUT','','ADEGAN <b>1</b>/3','ADEGAN <b>3</b>/3','BAB I','LAPIS <b>1</b>/4','LAPIS <b>2</b>/4','LAPIS <b>4</b>/4','','UMUM <b>→</b> KHUSUS',''];
const POSE=['m_think','m_point','m_open','m_point','m_open','m_thumb','m_point','m_point','m_open','m_thumb','m_warn','m_point','m_thumb'];
const SC=[];for(let k=0;k<N;k++){const d=document.createElement('div');d.className='sc';d.id='s'+k;$('#scenes').appendChild(d);SC.push(d)}
function H(k,html){SC[k].insertAdjacentHTML('beforeend',html)}
const lines=(n,ws,gap=22,col='#DDE5EF')=>Array.from({length:n},(_,i)=>`<i style="display:block;height:14px;border-radius:7px;width:${ws[i%ws.length]}%;margin-top:${i?gap:0}px;background:${col}"></i>`).join('');

// S0 hook: triangle outline + chip
H(0,`<div class="chip" id="ch0" style="left:72px;top:600px">PENELITIAN KUANTITATIF</div>
  <div class="ab" id="qm0" style="left:800px;top:640px;font-family:IS;font-style:italic;font-size:200px;color:var(--acc)">?</div>`);
SC[0].appendChild(mkStamp('st0',[['PIRAMIDA',0],['TERBALIK',1]],1130,112));

// S1+S2 broad -> narrow funnel
H(1,`<div class="ab" id="br1" style="left:70px;top:620px;width:940px;height:100px;border-radius:20px;background:var(--accl);transform-origin:50% 50%"><div class="ab" style="left:0;width:940px;top:22px;text-align:center;font-family:Anton;font-size:56px;color:var(--ink);letter-spacing:.04em">LUAS</div></div>
  ${[0,1,2].map(i=>`<div class="ab nb1" style="left:${540-(330-i*95)}px;top:${770+i*115}px;width:${2*(330-i*95)}px;height:70px;border-radius:16px;border:3px dashed #B8C6D8"></div>`).join('')}
  <div class="ab" id="tg1" style="left:470px;top:1130px;width:140px;height:140px;border-radius:50%;background:var(--ink)"><i class="ab" style="left:46px;top:46px;width:48px;height:48px;border-radius:50%;background:var(--acc)"></i></div>
  <div class="ab" id="tl1" style="left:640px;top:1172px;font-family:Anton;font-size:46px;color:var(--ink);letter-spacing:.04em">MASALAH</div>
  <i class="ab" id="rg1" style="left:470px;top:1130px;width:140px;height:140px;border-radius:50%;border:4px solid var(--acc)"></i>`);

// S3 clapperboard
H(3,`<div class="ab" id="cl3" style="left:240px;top:640px;width:600px;height:500px">
  <div class="ab" style="left:0;top:110px;width:600px;height:390px;border-radius:24px;background:var(--ink);box-shadow:0 26px 50px -16px rgba(19,41,75,.5)">
   <div class="ab mono" style="left:44px;top:60px;font-size:24px;color:#9FB3CF">PRODUKSI</div><div class="ab" style="left:44px;top:96px;font-family:Anton;font-size:64px;color:#fff">FILM KAMU</div>
   <div class="ab mono" style="left:44px;top:220px;font-size:24px;color:#9FB3CF">SCENE</div><div class="ab" style="left:44px;top:254px;font-family:Anton;font-size:72px;color:var(--acc)">01</div>
   <div class="ab mono" style="left:300px;top:220px;font-size:24px;color:#9FB3CF">TAKE</div><div class="ab" style="left:300px;top:254px;font-family:Anton;font-size:72px;color:#fff">1</div></div>
  <div class="ab" style="left:0;top:40px;width:600px;height:76px;border-radius:12px;overflow:hidden;background:#fff;border:6px solid var(--ink)">${[0,1,2,3,4,5].map(i=>`<i class="ab" style="left:${i*110-20}px;top:-10px;width:56px;height:100px;background:var(--ink);transform:skewX(-30deg)"></i>`).join('')}</div>
  <div class="ab" id="arm3" style="left:0;top:-30px;width:600px;height:76px;border-radius:12px;overflow:hidden;background:#fff;border:6px solid var(--ink);transform-origin:0 100%">${[0,1,2,3,4,5].map(i=>`<i class="ab" style="left:${i*110}px;top:-10px;width:56px;height:100px;background:var(--acc);transform:skewX(30deg)"></i>`).join('')}</div></div>`);

// S4+S5 film strip
const FS=[['PENGENALAN','tentang apa','M20 64 C20 44 60 44 60 64 M40 38 a12 12 0 1 0 0.1 0'],['SITUASI','di mana · kapan','M12 66 L12 36 L40 14 L68 36 L68 66 Z M32 66 L32 48 L48 48 L48 66'],['KONFLIK UTAMA','inti cerita','M46 8 L22 44 L40 44 L32 72 L60 32 L42 32 Z']];
H(4,`<div class="ab" id="fs4" style="left:40px;top:620px;width:1000px;height:400px;border-radius:18px;background:var(--ink);box-shadow:0 26px 50px -16px rgba(19,41,75,.5)">
  ${[0,1].map(r=>Array.from({length:14},(_,i)=>`<i class="ab" style="left:${22+i*70}px;top:${r?362:18}px;width:34px;height:22px;border-radius:5px;background:#F3F6FA;opacity:.85"></i>`).join('')).join('')}
  ${FS.map(([a,b,d],i)=>`<div class="ab fr4" style="left:${30+i*318}px;top:58px;width:304px;height:284px;border-radius:12px;background:#1E3A63;overflow:hidden">
   <svg class="ab" style="left:112px;top:46px" width="80" height="80" viewBox="0 0 80 80"><path d="${d}" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/></svg>
   <div class="ab" style="left:0;width:304px;top:150px;text-align:center;font-family:Anton;font-size:38px;color:#fff;letter-spacing:.03em">${a}</div><div class="ab mono" style="left:0;width:304px;top:204px;text-align:center;font-size:20px;color:#CFE0F2">${b}</div>
   <div class="ab mono" style="left:16px;top:12px;font-size:20px;color:#CFE0F2">0${i+1}</div></div>`).join('')}</div>
  <div class="ab" style="left:40px;top:1070px;width:1000px;height:10px;border-radius:5px;background:var(--line)"><i class="ab" id="pr4" style="left:0;top:0;height:10px;border-radius:5px;background:var(--acc)"></i><i class="ab" id="ph4" style="top:-13px;width:36px;height:36px;border-radius:50%;background:#fff;border:6px solid var(--acc)"></i></div>`);

// S6 latar belakang = same flow
H(6,`<div class="card" id="lb6" style="left:170px;top:620px;width:740px;height:560px;padding:44px 50px"><div class="mono" style="font-size:22px;color:var(--muted)">BAB I</div><div style="font-family:PJS;font-weight:800;font-size:56px;letter-spacing:-.03em;margin:6px 0 30px">Latar Belakang</div>
  ${['umum','spesifik','masalah'].map((s,i)=>`<div class="pg6" style="position:relative;margin-top:${i?22:0}px;height:${[110,90,70][i]}px;border-radius:14px;background:${['#D6ECFB','#9AD2F6','#3AA8F0'][i]};width:${[100,82,64][i]}%"><span class="mono" style="position:absolute;left:20px;top:16px;font-size:20px;color:${i>1?'#fff':'#13294B'}">${s}</span></div>`).join('')}</div>
  <div class="chip" id="eq6" style="left:560px;top:590px;background:var(--acc);font-size:26px">alurnya = film 🎬</div>`);

// S10 dark: don't jump straight to variables
H(10,`<div class="card" id="w10" style="left:110px;top:620px;width:860px;height:250px;background:#1E3A63;border-color:rgba(255,255,255,.08);padding:36px 40px"><div class="mono" style="font-size:22px;color:#9FB3CF">PARAGRAF PERTAMA</div><div style="font-size:38px;font-weight:600;color:#fff;margin:14px 0 22px;white-space:nowrap">"Variabel X berpengaruh terhadap Y…"</div>${lines(2,[90,70],18,'rgba(255,255,255,.18)')}</div>
  <div class="card" id="r10" style="left:110px;top:920px;width:860px;height:250px;padding:36px 40px"><div class="mono" style="font-size:22px;color:var(--muted)">MULAI DARI</div><div style="font-family:PJS;font-weight:800;font-size:46px;letter-spacing:-.02em;margin-top:10px">Gambaran besar dulu</div>
   <svg class="ab" style="right:150px;top:56px" width="140" height="140" viewBox="0 0 140 140">${[0,1,2,3].map(i=>{const y=10+i*32,a=60-i*13,b=60-(i+1)*13+2;return `<path d="M${70-a} ${y} L${70+a} ${y} L${70+b} ${y+28} L${70-b} ${y+28} Z" fill="${['#D6ECFB','#9AD2F6','#3AA8F0','#13294B'][i]}"/>`}).join('')}</svg>
   <div class="ab ok10" style="right:40px;top:80px;width:90px;height:90px;border-radius:50%;background:var(--acc)"><svg width="90" height="90" viewBox="0 0 90 90"><path d="M24 47 L39 62 L66 30" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>`);

// S11 recap arrow (the pyramid itself is #pyr)
H(11,`<div class="ab" id="um11" style="left:72px;top:600px;font-family:Anton;font-size:44px;color:var(--ink)">UMUM</div><div class="ab" id="kh11" style="left:72px;top:1180px;font-family:Anton;font-size:44px;color:var(--acc)">KHUSUS</div>`);

// S12 follow card
H(12,`<div class="card" id="pf12" style="left:130px;top:620px;width:820px;height:440px">
  <div class="ab" style="left:50px;top:50px;width:130px;height:130px;border-radius:50%;background:var(--ink);color:#fff;font-family:PJS;font-weight:800;font-size:52px;line-height:130px;text-align:center">RQ</div>
  <div class="ab" style="left:214px;top:62px;font-family:PJS;font-weight:800;font-size:50px;letter-spacing:-.03em">ResearchQ<span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--acc);margin-left:4px"></span></div>
  <div class="ab mono" style="left:214px;top:130px;font-size:24px;color:var(--muted)">@researchq.id</div>
  <div class="ab" style="left:50px;top:220px;width:720px;font-size:32px;font-weight:500;line-height:1.35">Metodologi & analisis penelitian, lebih mudah.</div>
  <div class="ab" id="fb12" style="left:50px;top:320px;width:720px;height:84px;border-radius:42px;background:var(--acc);color:#fff;font-family:PJS;font-weight:800;font-size:36px;line-height:84px;text-align:center">Follow</div>
  <div class="cur" id="cu12">${CUR}</div></div>`);

// ---------- pyramid (shared by S7-S9 and S11)
const PY={y0:600,H:150,G:14,wt:940,wb:240};const PT=4*PY.H+3*PY.G;const pw=y=>PY.wt-(PY.wt-PY.wb)*y/PT;
const PL=[['Fenomena Umum',46,'#D6ECFB','#13294B'],['Fenomena Spesifik',42,'#9AD2F6','#13294B'],['Permasalahan Penelitian',32,'#3AA8F0','#FFFFFF'],['Fokus Penelitian',30,'#13294B','#FFFFFF']];
$('#pyr').innerHTML=`<svg class="ab" style="left:0;top:0" width="1080" height="1920">${PL.map((l,i)=>{const a=i*(PY.H+PY.G),b=a+PY.H,ta=pw(a)/2,tb=pw(b)/2,y=PY.y0;const d=`M${540-ta} ${y+a} L${540+ta} ${y+a} L${540+tb} ${y+b} L${540-tb} ${y+b} Z`;
   return `<path class="po" d="${d}" fill="none" stroke="#B8C6D8" stroke-width="3" stroke-dasharray="12 10" stroke-linejoin="round"/><path class="pf" d="${d}" fill="${l[2]}" stroke="${l[2]}" stroke-width="3" stroke-linejoin="round"/>`}).join('')}</svg>
  ${PL.map((l,i)=>`<div class="lb" style="top:${PY.y0+i*(PY.H+PY.G)+[34,36,44,50][i]}px;font-size:${l[1]}px;color:${l[3]}"><span class="nm" style="color:${i<2?'#5C7397':'#CFE6F8'};font-size:${i<3?20:16}px">0${i+1}</span>${l[0]}</div>`).join('')}
  <div class="pin" id="pin" style="left:0;top:0">◀ 01</div>
  ${['pembaca','penulis','penguji'].map((s,i)=>`<div class="chip rd9" style="left:860px;top:${1100+i*62}px;background:#fff;color:var(--ink);border:2px solid var(--line);font-size:22px;padding:8px 18px">${s}</div>`).join('')}`;
const D={};D.tri0=mkDraw(SC[0],'M190 720 L890 720 L540 1090 Z',8);D.tri0.style.stroke='#13294B';
D.l1=mkDraw(SC[1],'M70 720 L470 1200',5);D.r1=mkDraw(SC[1],'M1010 720 L610 1200',5);D.l1.style.stroke=D.r1.style.stroke='#13294B';
D.xw=mkDraw(SC[10],'M140 640 L940 850',12);D.xw2=mkDraw(SC[10],'M940 640 L140 850',12);D.xw.style.stroke=D.xw2.style.stroke='#FF8A8A';
D.ar11=mkDraw(SC[11],'M118 670 L118 1160 M96 1136 L118 1166 L140 1136',8);D.ar11.style.stroke='#3AA8F0';

// ---------- halftone transitions (navy dots)
const HT=[ST[3],ST[7]];const htx=$('#ht').getContext('2d');
function HALF(t){htx.clearRect(0,0,1080,1920);let p=-1;for(const h of HT)if(t>h-.32&&t<h+.32)p=(t-(h-.32))/.64;if(p<0)return;
  htx.fillStyle='#13294B';const g=40;for(let y=0;y<1920+g;y+=g)for(let x=0;x<1080+g;x+=g){const d=(x/1080)*.55+(y/1920)*.45;const cov=p<.5?(p*2*1.6-d):(1.6-(p-.5)*2*1.6-d+.0);
    const r=cl(cov*1.6)*g*.78;if(r>.4){htx.beginPath();htx.arc(x+(y/g%2?g/2:0),y,r,0,7);htx.fill()}}}

// ---------- pyramid driver: fill top -> bottom, pin slides down the narrowing edge
function PYR(t){const A=t>=ST[7]-.02&&t<SEND(9),B=t>=ST[11]-.02&&t<SEND(11);const el=$('#pyr');if(!sh(el,A||B))return;
  const on=B?[ST[11]-.3,ST[11]-.25,ST[11]-.2,ST[11]-.15]:[W(7,4)-.12,W(8,6)-.15,W(9,8)-.1,W(9,11)-.1];
  const fo=[...el.querySelectorAll('.pf')],ou=[...el.querySelectorAll('.po')],lb=[...el.querySelectorAll('.lb')];
  const a0=B?ST[11]:ST[7];op(el,P(t,a0-.02,a0+.2));
  const sc=B?L(1,.8,o3(P(t,ST[11],ST[11]+.5))):1;el.style.transform=`scale(${sc.toFixed(4)})`;
  fo.forEach((f,i)=>{const p=P(t,on[i],on[i]+.45),e=p>0?o3(p):0;f.style.opacity=e.toFixed(3);f.setAttribute('transform',`translate(0 ${((1-e)*-24).toFixed(1)})`);
    ou[i].style.opacity=(cl(P(t,a0,a0+.3)-e)).toFixed(3);
    const q=P(t,on[i]+.1,on[i]+.5);lb[i].style.opacity=q.toFixed(3);lb[i].style.transform=`translateY(${((1-o3(q))*16).toFixed(1)}px) scale(${(q>0?.9+.1*bk(q):.9).toFixed(3)})`;
    const act=!B&&t>=on[i]&&(i===3||t<on[i+1]);f.style.filter=act?'drop-shadow(0 14px 24px rgba(58,168,240,.55))':'none'});
  let k=0;for(let i=0;i<4;i++)if(t>=on[i])k=i;const yc=i=>i*(PY.H+PY.G)+PY.H/2,xe=i=>Math.min(540+pw(yc(i))/2+26,900);
  const mv=k>0?io3(P(t,on[k]-.05,on[k]+.4)):1,yy=k>0?L(yc(k-1),yc(k),mv):yc(0),xx=k>0?L(xe(k-1),xe(k),mv):xe(0);
  const pin=$('#pin');pin.textContent='◀ 0'+(k+1);pin.style.transform=`translate(${xx.toFixed(1)}px,${(PY.y0+yy-24).toFixed(1)}px)`;op(pin,B?0:P(t,on[0],on[0]+.3));
  document.querySelectorAll('#pyr .rd9').forEach((c,i)=>{if(B||t<ST[9]-.02){op(c,0);return}pop(c,t,W(9,[2,4,6][i])-.05,{dx:60,dy:0,s0:.8})})}

// ---------- scenes
function S(k,t,k2=k){return sh(SC[k],t>=ST[k]-.02&&t<SEND(k2))}
function scenes(t){
  if(S(0,t)){pop($('#ch0'),t,W(0,6)-.05,{dx:-60,dy:0,s0:.85});draw(D.tri0,t,W(0,3)-.1,.6);pop($('#qm0'),t,W(0,7)-.1,{s0:.2,r:20});stamp($('#st0'),t,W(0,4)-.05)}
  if(S(1,t,2)){const b=$('#br1');const pa=P(t,W(1,4)-.1,W(1,4)+.2),pw2=o4(P(t,W(1,9)-.25,W(1,9)+.3));op(b,pa);b.style.transform=`scaleX(${(.3+.7*pw2).toFixed(4)})`;
    draw(D.l1,t,W(2,1)-.1,.8);draw(D.r1,t,W(2,1)-.1,.8);document.querySelectorAll('#s1 .nb1').forEach((n,i)=>{const s=W(2,1)+i*.18;op(n,P(t,s,s+.2));n.style.transform=`scaleX(${(.6+.4*o3(P(t,s,s+.35))).toFixed(3)})`});
    pop($('#tg1'),t,W(2,4)-.1,{dy:0,s0:.3});pop($('#tl1'),t,W(2,4),{dx:-30,dy:0,s0:.8});const rp=((t-W(2,4))%1.1)/1.1;const rg=$('#rg1');if(t>W(2,4)){rg.style.opacity=(1-rp).toFixed(3);rg.style.transform=`scale(${(1+.7*rp).toFixed(3)})`}else rg.style.opacity=0}
  if(S(3,t)){pop($('#cl3'),t,ST[3]+.05,{dy:100,s0:.85});const c=W(3,5)-.05;const ang=t<c?L(-22,-28,P(t,ST[3]+.3,c-.2)):L(-28,0,o4(P(t,c,c+.1)));$('#arm3').style.transform=`rotate(${ang.toFixed(2)}deg)`}
  if(S(4,t,5)){pop($('#fs4'),t,ST[4],{dy:90,s0:.88});const on=[W(4,7)-.1,W(5,1)-.1,W(5,6)-.1];
    document.querySelectorAll('#s4 .fr4').forEach((f,i)=>{const q=P(t,on[i],on[i]+.3);f.style.background=q>0?`rgb(${Math.round(L(30,58,q))},${Math.round(L(58,168,q))},${Math.round(L(99,240,q))})`:'#1E3A63';f.style.transform=`scale(${(1+.05*Math.sin(Math.PI*q)).toFixed(3)})`;f.style.opacity=(t>=on[i]?1:.55).toFixed(3)});
    let x=0;on.forEach((o,i)=>{if(t>=o-.1)x=L(i?(i-1)*318+182:0,i*318+182,io3(P(t,o-.1,o+.4)))});$('#pr4').style.width=x.toFixed(1)+'px';$('#ph4').style.left=(x-18).toFixed(1)+'px'}
  if(S(6,t)){pop($('#lb6'),t,W(6,1)-.1,{dy:90,s0:.88});document.querySelectorAll('#s6 .pg6').forEach((g,i)=>{const s=W(6,3)+i*.22;op(g,P(t,s,s+.2));g.style.transform=`translateX(${((1-o3(P(t,s,s+.35)))*-40).toFixed(1)}px)`});pop($('#eq6'),t,W(6,6)-.05,{dy:-20,s0:.6,r:-5})}
  if(S(10,t)){pop($('#w10'),t,ST[10]+.05,{dy:70,s0:.88});const x=W(10,3);draw(D.xw,t,x,.2);draw(D.xw2,t,x+.1,.2);$('#w10').style.filter=t>x?`grayscale(${P(t,x,x+.3).toFixed(2)}) opacity(${(1-.3*P(t,x,x+.3)).toFixed(2)})`:'none';
    pop($('#r10'),t,W(10,8)-.12,{dy:70,s0:.88});const k=$('#r10 .ok10'),p=P(t,W(10,9),W(10,9)+.3);k.style.transform=`scale(${(p>0?bk(p):0).toFixed(3)})`}
  if(S(11,t)){pop($('#um11'),t,W(11,6)-.1,{dx:-40,dy:0,s0:.8});draw(D.ar11,t,W(11,6),Math.max(.3,W(11,8)-W(11,6)));pop($('#kh11'),t,W(11,8)-.1,{dx:-40,dy:0,s0:.8})}
  if(S(12,t)){pop($('#pf12'),t,ST[12],{dy:100,s0:.85,b:END-2.8});const ck=W(12,0)+.3,cu=$('#cu12'),p=o3(P(t,ST[12]+.1,ck-.05));cu.style.transform=`translate(${L(700,420,p).toFixed(1)}px,${L(520,350,p).toFixed(1)}px) scale(${(1-.15*Math.sin(Math.PI*P(t,ck-.08,ck+.08))).toFixed(3)})`;op(cu,P(t,ST[12],ST[12]+.15)*(1-P(t,ck+.6,ck+.8)));
    const fb=$('#fb12'),done=t>=ck;fb.textContent=done?'Mengikuti ✓':'Follow';fb.style.background=done?'#13294B':'#3AA8F0';fb.style.transform=`scale(${(1-.05*Math.sin(Math.PI*P(t,ck-.06,ck+.12))).toFixed(3)})`}
  PYR(t)}
$('#cta').innerHTML=`<div class="ab" style="inset:0;background:rgba(15,32,60,.80)"></div><div class="ab" id="ct1" style="left:0;width:1080px;top:470px;text-align:center;font-family:Anton;font-size:120px;color:#FFFFFF">SIMPAN & <span style="color:var(--acc)">FOLLOW</span></div>
  ${[['TIKTOK','@researchq.id','tiktok'],['INSTAGRAM','@researchq.id','instagram'],['YOUTUBE','NotYourLecture','youtube']].map(([n,h,l],i)=>`<div class="pl" id="pl${i}" style="top:${680+i*150}px"><img src="${LOGO[l]}"><div class="n">${n}</div><div class="h">${h}</div></div>`).join('')}`;
function CTA(t){const a=END-2.75;const c=$('#cta');if(!sh(c,t>=a))return;op(c,P(t,a,a+.25));pop($('#ct1'),t,a+.1,{dy:50,s0:.7});[0,1,2].forEach(i=>pop($('#pl'+i),t,a+.35+i*.18,{dx:-160,dy:0,s0:.85}))}
