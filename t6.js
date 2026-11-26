const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{
 const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:1,isMobile:true,hasTouch:true});
 const p=await ctx.newPage(); await p.goto('http://localhost:18611/index.html'); await p.waitForTimeout(600);
 for(let i=0;i<6;i++){
  await p.evaluate(()=>{ newGame(); G.player.inv_t=999; });
  const res={};
  for(const dir of [-1,1]){
   await p.evaluate((d)=>{ const s=G.w.spawn; const P=G.player; P.x=s.x*T+3; P.y=(s.y+1)*T-P.h; P.vx=P.vy=0; INPUT.jx=d; },dir);
   await p.waitForTimeout(2500);
   res[dir]=await p.evaluate(()=>{ INPUT.jx=0; return Math.round(G.player.x/T-G.w.spawn.x); });
  }
  console.log(JSON.stringify(res));
  if(i===0) await p.screenshot({path:'shots/40_exit.png'});
 }
 await b.close();
})();
