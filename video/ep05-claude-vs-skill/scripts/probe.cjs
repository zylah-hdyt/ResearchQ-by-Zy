const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});const p=await b.newPage();
const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file://'+process.argv[2]);await p.waitForTimeout(600);
const r=await p.evaluate(()=>({c:window.__cues,k:window.__keys}));console.log(JSON.stringify({...r,errs}));await b.close()})();
