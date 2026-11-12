// node snap.js <outdir> [t1,t2,...]   default: middle and end of every line, plus mid-transitions
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const out=__dirname+'/'+process.argv[2];fs.mkdirSync(out,{recursive:true});const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,300)));
await p.goto('file://'+__dirname+'/video.html?render');await p.evaluate(()=>document.fonts.ready);
let ts=process.argv[3]?process.argv[3].split(',').map(Number):await p.evaluate(()=>{const W=JSON.parse(JSON.stringify(window.__W||[]));return []});
if(!process.argv[3]){ts=await p.evaluate(()=>{const r=[];const W=window.WORDSX;W.forEach((w,i)=>{r.push((w.s+w.e)/2,w.e-.15);if(i<W.length-1&&W[i+1].sec!==w.sec)r.push((w.e+W[i+1].s)/2)});r.push(window.END-3);return r})}
for(const t of ts){await p.evaluate(t=>render(t,Math.round(t*30)),t);await p.screenshot({path:`${out}/t_${t.toFixed(2).padStart(7,'0')}.jpg`,type:'jpeg',quality:70})}
console.log(ts.length,'shots');await b.close()})();
