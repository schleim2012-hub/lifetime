const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{ const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}); const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2.625,isMobile:true,hasTouch:true}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
await p.goto('https://schleim2012-hub.github.io/lifetime/?nc='+Date.now()); await p.waitForTimeout(2500);
await p.tap('#t-new'); for(let i=0;i<5;i++){ await p.waitForTimeout(150); await p.tap('#introskip'); } await p.waitForTimeout(2500);
const r=await p.evaluate(()=>{ const P=G.player; const tx=Math.floor(P.x/T); const z=makeMob('kotzer',tx+4,surfaceY(tx+4)-1,{rad:true}); G.ents.push(z); hurtMob(z,10,P,150); return [document.getElementById('tver').textContent, typeof equipItem, !!SND.ctx, Object.keys(SND.samples||{}), G.state]; });
await p.waitForTimeout(1500); await p.screenshot({path:'shots/v03/24_live_pages.png'}); console.log(r, 'errors:', errs); await b.close(); })();
