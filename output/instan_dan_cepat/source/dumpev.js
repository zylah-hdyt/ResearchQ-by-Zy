const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('PAGEERR',String(e)));
await p.goto('file://'+__dirname+'/video.html?render');const r=await p.evaluate(()=>({ev:SFXLIST(),END}));
fs.writeFileSync(__dirname+'/work/events.json',JSON.stringify(r));console.log('events',r.ev.length,'END',r.END.toFixed(2));await b.close()})();
