const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{
 const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+e.stack)); p.on('console',m=>{ if(m.type()==='error') errs.push('CE '+m.text()); });
 await p.goto('http://localhost:18611/index.html'); await p.waitForTimeout(800);
 await p.tap('#t-new'); for(let i=0;i<5;i++){ await p.waitForTimeout(100); await p.tap('#introskip'); }
 await p.waitForTimeout(1200); await p.screenshot({path:'shots/02_start.png'});
 // Interact with loot crate
 const r=await p.evaluate(()=>{ const P=G.player; const it=findInteract(); return {it:it&&it.lbl, pos:[P.x/T|0,P.y/T|0]}; }); console.log('interact',JSON.stringify(r));
 // walk left to crate
 await p.evaluate(()=>{ INPUT.jx=-1; }); await p.waitForTimeout(700); await p.evaluate(()=>{ INPUT.jx=0; });
 const r2=await p.evaluate(()=>{ const it=findInteract(); return it&&it.lbl; }); console.log('near',r2);
 await p.tap('#btn-e'); await p.waitForTimeout(300); await p.screenshot({path:'shots/03_loot.png'});
 await p.evaluate(()=>{ document.querySelector('[data-act=takeall]').click(); UI.close(); });
 // teleport to tree and chop
 const tree=await p.evaluate(()=>{ const P=G.player; const px=Math.floor(P.x/T); for(let d=3;d<60;d++){ for(const s of [1,-1]){ const x=px+s*d; const y=surfaceY(x); if(tget(x,y-1)===6||tget(x,y-1)===6){ } let yy=y; for(let k=-15;k<3;k++){ if(tget(x,surfaceY(x)+k)===6){ } } } } 
   for(let d=3;d<80;d++){ for(const s of [1,-1]){ const x=px+s*d; for(let y=60;y<120;y++){ if(tget(x,y)===6&&TILES[tget(x,y+1)].s){ P.x=(x-s)*T+3; P.y=(y+1)*T-P.h; P.dir=s; return [x,y]; } } } } return null; });
 console.log('tree',tree); await p.waitForTimeout(300);
 await p.evaluate(()=>{ INPUT.act=true; INPUT.actFresh=true; }); await p.waitForTimeout(3500); await p.evaluate(()=>{ INPUT.act=false; });
 await p.waitForTimeout(1500);
 console.log('holz',await p.evaluate(()=>countItem('holz')));
 await p.screenshot({path:'shots/04_chop.png'});
 // craft
 await p.evaluate(()=>{ addItem('stein',10); addItem('faser',10); addItem('holz',40); UI.open('craft'); });
 await p.waitForTimeout(300); await p.screenshot({path:'shots/05_craft.png'});
 await p.evaluate(()=>{ for(const o of ['steinaxt','steinhacke','lagerfeuer','werkbank']){ const i=RECIPES.findIndex(r=>r.o===o); craft(i,1);} UI.open('inv'); });
 await p.waitForTimeout(300); await p.screenshot({path:'shots/06_inv.png'});
 await p.evaluate(()=>UI.close());
 // place campfire
 await p.evaluate(()=>{ const P=G.player; const i=P.inv.findIndex(s=>s&&s.id==='lagerfeuer'); const t=P.inv[P.sel]; P.inv[P.sel]=P.inv[i]; P.inv[i]=t; UI.refreshHot(); INPUT.act=true; INPUT.actFresh=true; });
 await p.waitForTimeout(300); await p.evaluate(()=>{ INPUT.act=false; });
 console.log('fire placed', await p.evaluate(()=>countItem('lagerfeuer')));
 // night
 await p.evaluate(()=>{ G.time=0.62; }); await p.waitForTimeout(4000); await p.screenshot({path:'shots/07_night.png'});
 console.log(await p.evaluate(()=>({n:G.ents.filter(e=>!e.dead&&e.kind==='mob'&&MOBS[e.t].zombie&&Math.abs(e.x-G.player.x)<60*T).length,hp:G.player.hp|0, warm:G.player.warm|0, temp:G.temp})));
 console.log(errs.join('\n'));
 await b.close();
})();
