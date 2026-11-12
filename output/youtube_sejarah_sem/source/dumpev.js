const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.log('PAGEERR',String(e)));
await p.goto('file://'+__dirname+'/video.html?render');
const r=await p.evaluate(()=>{const ev=SFXLIST();const sp=[];for(let f=0;f<END*30;f++){const t=f/30,c=cam(t),c2=cam(t+1/30);sp.push(Math.hypot((c2.x-c.x)*c.z,(c2.y-c.y)*c.z)+Math.abs(Math.log(c2.z/c.z))*900)}return {ev,sp,END}});
fs.writeFileSync(__dirname+'/work/events.json',JSON.stringify(r));console.log('events',r.ev.length,'END',r.END.toFixed(2));await b.close()})();
