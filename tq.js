const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{ const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}); const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2.625,isMobile:true,hasTouch:true}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:18611/index.html'); await p.waitForTimeout(1500); await p.screenshot({path:'shots/v03/01_title.png'});
await p.tap('#t-new'); for(let i=0;i<5;i++){ await p.waitForTimeout(120); await p.tap('#introskip'); } await p.waitForTimeout(1200); await p.evaluate(()=>{ G.time=0.4; G.msgs=[]; UI.msgs(); }); await p.waitForTimeout(500); await p.screenshot({path:'shots/v03/02_start.png'});
await p.evaluate(()=>{ G.time=0.22; }); await p.waitForTimeout(500); await p.screenshot({path:'shots/v03/13_morning_fog.png'});
console.log(errs); await b.close(); })();
