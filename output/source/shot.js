// node shot.js t1,t2,...  -> shots/t_<t>.jpg + overflow report
const {chromium}=require('playwright');const fs=require('fs');
const ts=process.argv[2].split(',').map(Number);const OUT=__dirname+'/'+(process.argv[3]||'shots');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--disable-web-security']});const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+__dirname+'/video.html?render');await p.evaluate(()=>document.fonts.ready);
for(const t of ts){const t0=Date.now();await p.evaluate(t=>render(t,Math.round(t*30),t),t);
 const ov=await p.evaluate(()=>{const out=[];document.querySelectorAll('#stage .w, #stage .chip, #stage .chip4, #stage .chip5, #stage .fc, #stage .strip, #stage #box6, #stage .m6').forEach(e=>{const st=getComputedStyle(e);let v=e;let vis=true;while(v&&v.id!=='stage'){const cs=getComputedStyle(v);if(cs.display==='none'||+cs.opacity<.05){vis=false;break}v=v.parentElement}
   if(!vis)return;const r=e.getBoundingClientRect();if(r.width<2)return;if(r.left<60||r.right>1020||r.top<180||r.bottom>1560)out.push((e.id||e.className)+` [${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.right)},${Math.round(r.bottom)}]`)});return out});
 await p.screenshot({path:`${OUT}/t_${t.toFixed(2)}.jpg`,type:'jpeg',quality:80});
 console.log(t.toFixed(2),(Date.now()-t0)+'ms',ov.length?'OVER: '+ov.join(' | '):'')}
if(errs.length)console.log('ERRORS',errs.slice(0,5));await b.close()})();
