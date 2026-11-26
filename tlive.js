const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{
 const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2.6,isMobile:true,hasTouch:true});
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push('CE '+m.text()); });
 await p.goto('https://schleim2012-hub.github.io/lifetime/'); await p.waitForTimeout(1500);
 await p.screenshot({path:'shots/live_title.png'});
 await p.tap('#t-new'); for(let i=0;i<5;i++){ await p.waitForTimeout(150); await p.tap('#introskip'); }
 await p.waitForTimeout(1500); await p.screenshot({path:'shots/live_start.png'});
 const info=await p.evaluate(()=>({pos:[G.player.x/T|0,G.player.y/T|0],ents:G.ents.length,segs:G.w.segs, fps:0}));
 console.log(JSON.stringify(info));
 // FPS messen
 const fps=await p.evaluate(()=>new Promise(r=>{ let n=0; const t0=performance.now(); function f(){ n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r(n/2); } requestAnimationFrame(f); }));
 console.log('fps',fps);
 console.log(errs.join('\n'));
 await b.close();
})();
