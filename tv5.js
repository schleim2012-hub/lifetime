const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
const S='/workspace/lifetime/shots/v05/';
(async()=>{ const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']}); const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2.625,isMobile:true,hasTouch:true}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push('C:'+m.text()); });
 await p.goto('http://localhost:18611/index.html'); await p.evaluate(()=>localStorage.clear()); await p.reload(); await p.waitForTimeout(4500);
 await p.screenshot({path:S+'title.png'});
 await p.tap('#t-new'); for(const s of [2,7,11,15,18.6]){ await p.evaluate(s=>{ CINE.t=s; },s); await p.waitForTimeout(250); await p.screenshot({path:S+'intro_'+String(s).replace('.','_')+'.png'}); }
 await p.evaluate(()=>{ CINE.t=21.4; }); await p.waitForTimeout(1500);
 console.log('state',await p.evaluate(()=>[G.state,G.w&&G.w.feat.biomes.map(b=>b.b+':'+b.x0+'-'+b.x1).join(' '),G.w&&G.w.feat.veh.length,G.w&&G.w.feat.deco.length]));
 await p.evaluate(()=>{ hurtPlayer=function(){}; G.time=0.3; }); await p.waitForTimeout(1200); await p.screenshot({path:S+'after_wreck.png'});
 // Speichern, zurück zum Titel, Neues Spiel mit vorhandenem Spielstand
 await p.evaluate(()=>{ saveGame(true); toTitle(); }); await p.waitForTimeout(800); await p.tap('#t-new'); await p.waitForTimeout(400); await p.screenshot({path:S+'newgame_modal.png'});
 const seed1=await p.evaluate(()=>JSON.parse(localStorage.getItem(SAVE_KEY)).seed); await p.tap('#ng-yes'); await p.waitForTimeout(1500);
 console.log('newgame2',await p.evaluate(()=>[G.state,G.w.seed]),seed1);
 console.log(errs.slice(0,10)); await b.close(); })();
