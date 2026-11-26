const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{ const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}); const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,isMobile:true,hasTouch:true}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:18611/index.html'); await p.waitForTimeout(1500); await p.tap('#t-new'); for(let i=0;i<6;i++){ await p.waitForTimeout(150); await p.tap('#introskip').catch(()=>{}); } await p.waitForTimeout(800);
 await p.evaluate(()=>{ addItem('lederjacke',1); addItem('jeans',1); UI.open('inv'); });
 const idx=await p.evaluate(()=>G.player.inv.findIndex(s=>s&&s.id==='lederjacke')); await p.tap(`#pbody .slot[data-i="${idx}"]`); await p.waitForTimeout(200);
 console.log('pick',await p.evaluate(()=>JSON.stringify(UI.pick)));
 await p.tap('[data-act="equip"]'); await p.waitForTimeout(200);
 console.log(await p.evaluate(()=>[JSON.stringify(G.player.equip),G.player.inv.filter(Boolean).map(s=>s.id+':'+s.n).join(',')]));
 await p.screenshot({path:'/tmp/eq.png'}); console.log(errs); await b.close(); })();
