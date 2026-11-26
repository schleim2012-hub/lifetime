const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{
 const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const p=await ctx.newPage(); await p.goto('http://localhost:18611/index.html'); await p.waitForTimeout(600);
 await p.evaluate(()=>{ newGame(); const P=G.player; addItem('steinaxt',1); P.sel=P.inv.findIndex(s=>s&&s.id==='steinaxt'); G.ents.forEach(e=>{}); });
 for(const d of [1,-1]){ await p.evaluate((d)=>{ INPUT.jx=d; },d); await p.waitForTimeout(500);
   const c=await p.evaluate(()=>{ const P=G.player; const r=cv.getBoundingClientRect(); return {x:r.left+(P.x-G.cam.x)/G.VW*r.width, y:r.top+(P.y-G.cam.y)/G.VH*r.height, dir:P.dir}; });
   console.log(c); await p.screenshot({path:`shots/v02/before_walk_${d>0?'right':'left'}.png`,clip:{x:Math.max(0,c.x-60),y:Math.max(0,c.y-40),width:140,height:110}}); }
 await b.close();
})();
