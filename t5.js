const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{
 const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message)); 
 await p.goto('http://localhost:18611/index.html'); await p.waitForTimeout(800);
 await p.evaluate(()=>{ newGame(); });
 await p.waitForTimeout(500);
 console.log(await p.evaluate(()=>{ const s=G.w.feat.stash; const P=G.player; P.x=(s.x)*T; P.y=(s.y+1)*T-P.h; G.time=0.2; return s; }));
 await p.waitForTimeout(1500); await p.screenshot({path:'shots/30_stash.png'});
 await p.evaluate(()=>{ const s=G.w.feat.stash; interactAt(s.x-1,s.y); }); await p.waitForTimeout(400); await p.screenshot({path:'shots/31_tresor.png'});
 await p.evaluate(()=>{ UI.close(); const P=G.player; P.sp=2; UI.open('skills'); }); await p.waitForTimeout(300); await p.screenshot({path:'shots/32_skills.png'});
 await p.evaluate(()=>{ UI.tab='map'; UI.renderPanel(); }); await p.waitForTimeout(300); await p.screenshot({path:'shots/33_map.png'});
 await p.evaluate(()=>{ UI.close(); const n=G.ents.find(e=>e.t==='uschi'); const P=G.player; P.x=n.x+20; P.y=n.y; addItem('kronkorken',50); addItem('schrott',5); UI.talk(n); UI.npcAct('trade'); }); await p.waitForTimeout(300); await p.screenshot({path:'shots/34_trade.png'});
 await p.evaluate(()=>{ UI.close(); }); 
 await p.setViewportSize({width:412,height:915}); await p.waitForTimeout(400); await p.screenshot({path:'shots/35_portrait.png'});
 console.log(errs.join('\n'));
 await b.close();
})();
