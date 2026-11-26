const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{ const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}); const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2.625,isMobile:true,hasTouch:true}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push('C:'+m.text()); });
 await p.goto('http://localhost:18611/index.html'); await p.evaluate(()=>{ localStorage.clear(); localStorage.setItem('lifetime_intro_seen','1'); }); await p.reload(); await p.waitForTimeout(2500);
 await p.tap('#t-new'); await p.waitForTimeout(1200);
 for(const bi of ['wald','wueste','oedland']){ await p.evaluate(bi=>{ const s=G.w.feat.biomes.find(x=>x.b===bi); const x=Math.round((s.x0+s.x1)/2); const P=G.player; P.x=x*T; P.y=(surfaceY(x)-3)*T; G.time=0.72; G.day=4; P.hp=9999; },bi); 
   // laufen + springen
   for(let i=0;i<10;i++){ await p.evaluate(i=>{ INPUT.jx=i%4<2?1:-1; if(i%3===0) INPUT.jumpPressed=true; },i); await p.waitForTimeout(500); }
   console.log(bi,await p.evaluate(()=>{ const m=G.ents.filter(e=>!e.dead&&e.kind==='mob'); return m.length+' '+[...new Set(m.map(e=>e.t))].join(','); })); }
 await p.evaluate(()=>{ INPUT.jx=0; saveGame(true); toTitle(); }); await p.waitForTimeout(800); await p.tap('#t-cont'); await p.waitForTimeout(1500);
 console.log('loaded',await p.evaluate(()=>[G.state,!!G.w.feat.biomes,G.w.feat.veh.length]));
 await p.screenshot({path:'/workspace/lifetime/shots/v05/night_play.png'});
 console.log('errs',errs.slice(0,10)); await b.close(); })();
