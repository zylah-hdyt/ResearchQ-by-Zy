const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const out=__dirname+'/'+process.argv[2];fs.mkdirSync(out,{recursive:true});const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('PAGEERR',String(e).slice(0,300)));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text().slice(0,200))});
await p.goto('file://'+__dirname+'/video.html?render');await p.evaluate(async()=>{await document.fonts.ready;await window.READY});
for(const t of process.argv[3].split(',').map(Number)){const t0=Date.now();await p.evaluate(t=>render(t),t);await p.screenshot({path:`${out}/t_${t.toFixed(2).padStart(6,'0')}.jpg`,type:'jpeg',quality:75});if(process.env.TIME)console.log('t',t,Date.now()-t0,'ms')}await b.close()})();
