// node recp.js <frameStart> <frameEnd>   (60 fps, 3 sub-frames, 180deg shutter)
const {chromium}=require('playwright');const fs=require('fs');const [s,e]=process.argv.slice(2).map(Number);
const FPS=60,OFF=[-1/6,0,1/6];fs.mkdirSync(__dirname+'/sub',{recursive:true});
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
await p.goto('file://'+__dirname+'/video.html?render');await p.evaluate(()=>document.fonts.ready);
for(let n=s;n<e;n++){const tc=n/FPS;for(let k=0;k<3;k++){const f=`${__dirname}/sub/f${String(n).padStart(5,'0')}_${k}.jpg`;if(fs.existsSync(f))continue;
 const t=Math.max(0,tc+OFF[k]/FPS);await p.evaluate(([t,n,tc])=>render(t,n,tc),[t,n,tc]);await p.screenshot({path:f+'.tmp',type:'jpeg',quality:94});fs.renameSync(f+'.tmp',f)}}
await b.close()})();
