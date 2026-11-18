// node recp.js <start> <end>   30 fps, WebGL (SwiftShader), waits for textures
const {chromium}=require('playwright');const fs=require('fs');const [s,e]=process.argv.slice(2).map(Number);const OUT=__dirname+'/'+(process.env.SUB||'full');fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',x=>console.log('PAGEERR',String(x).slice(0,300)));
await p.goto('file://'+__dirname+'/video_full.html?render');await p.evaluate(async()=>{await document.fonts.ready;await window.READY});
for(let n=s;n<e;n++){const f=`${OUT}/f${String(n).padStart(5,'0')}.jpg`;if(fs.existsSync(f))continue;await p.evaluate(t=>render(t),n/30);await p.screenshot({path:f+'.tmp',type:'jpeg',quality:93});fs.renameSync(f+'.tmp',f)}
await b.close()})();
