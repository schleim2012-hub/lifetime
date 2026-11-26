const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
const only=process.argv[2];
(async()=>{
 const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2.625,isMobile:true,hasTouch:true});
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1])); p.on('console',m=>{ if(m.type()==='error') errs.push('CE '+m.text()); });
 await p.goto('http://localhost:18611/index.html'); await p.waitForTimeout(1200);
 const S=async(n)=>{ await p.screenshot({path:`shots/v02/after_${n}.png`}); };
 await S('01_title');
 await p.tap('#t-new'); for(let i=0;i<5;i++){ await p.waitForTimeout(120); await p.tap('#introskip'); }
 await p.waitForTimeout(1500); await S('02_start');
 const fps=await p.evaluate(()=>new Promise(r=>{ let n=0; const t0=performance.now(); function f(){ n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r(n/2); } requestAnimationFrame(f); }));
 console.log('fps',fps, await p.evaluate(()=>[G.VW,G.VH]));
 // Laufrichtung
 await p.evaluate(()=>{ addItem('steinaxt',1); const P=G.player; P.sel=P.inv.findIndex(s=>s&&s.id==='steinaxt'); UI.refreshHot(); });
 for(const d of [1,-1]){ await p.evaluate((d)=>{ INPUT.jx=d; },d); await p.waitForTimeout(450);
   const c=await p.evaluate(()=>{ const P=G.player; const r=cv.getBoundingClientRect(); return {x:r.left+(P.x-G.cam.x)/G.VW*r.width, y:r.top+(P.y-G.cam.y)/G.VH*r.height, dir:P.dir, fr:frameFor(P,true)}; });
   console.log('walk',d,JSON.stringify(c)); await p.screenshot({path:`shots/v02/after_walk_${d>0?'right':'left'}.png`,clip:{x:Math.max(0,c.x-80),y:Math.max(0,c.y-50),width:170,height:150}}); }
 await p.evaluate(()=>{ INPUT.jx=0; });
 const tp=async(fn,name,wait)=>{ const r=await p.evaluate(fn); await p.evaluate(()=>{ const P=G.player; P.fallY=P.y; P.vy=0; P.hp=100; P.hu=100; P.th=100; }); await p.waitForTimeout(wait||900); await p.evaluate(()=>{ G.player.hp=100; }); await S(name); console.log(name,JSON.stringify(r)); };
 // Wald mit Bäumen
 await tp(()=>{ const P=G.player; const w=G.w; let best=null,bc=0; for(let x=60;x<w.W-60;x+=10){ let c=0; for(let k=0;k<30;k++){ const y=w.sky[x+k]; for(let j=1;j<16;j++){ const t=tget(x+k,y-j); if(TILES[t].leaf){ c++; break; } } } if(c>bc){ bc=c; best=x; } } P.x=(best+15)*T; P.y=(surfaceY(best+15)-3)*T; G.time=0.3; return {best,bc}; },'03_forest');
 // Stadt
 await tp(()=>{ const c=G.w.feat.city; const P=G.player; const x=(c.x0+c.x1)/2|0; P.x=x*T; P.y=(c.y-3)*T; G.time=0.35; return c; },'04_city');
 // Lager
 await tp(()=>{ const c=G.w.feat.camps[0]; const P=G.player; const x=c.x0-6; P.x=x*T; P.y=(c.y-3)*T; return c; },'05_camp',1400);
 // Kannibalen
 await tp(()=>{ const c=G.w.feat.cann; const P=G.player; P.x=(c.x0+4)*T; P.y=(c.y-3)*T; return c; },'06_cann');
 // Pilz-Biom
 await tp(()=>{ const s=G.w.feat.shroom; const P=G.player; for(let x=s.x0+20;x<s.x1;x++) for(let y=s.y-20;y<s.y+20;y++){ if(tget(x,y)===54&&tget(x,y-1)===0&&tget(x,y-2)===0&&tget(x,y-3)===0){ P.x=x*T; P.y=(y-3)*T; P.vy=0; return [x,y]; } } return s; },'07_shroom',1500);
 // Höhle mit Fackel
 await tp(()=>{ const P=G.player; addItem('fackel',5); P.sel=P.inv.findIndex(s=>s&&s.id==='fackel'); UI.refreshHot(); const x0=Math.floor(P.x/T)+120; for(let x=x0;x<x0+200;x++) for(let y=G.w.sky[x]+25;y<G.w.sky[x]+60;y++){ if(!solidAt(x,y)&&!solidAt(x,y-1)&&!solidAt(x,y-2)&&solidAt(x,y+1)&&tget(x,y)===0){ let c=0; for(let k=-6;k<6;k++) if(tget(x+k,y-6)===52||tget(x+k,y-4)===52||tget(x+k,y-5)===53) c++; if(c){ P.x=x*T; P.y=(y-2)*T; tset(x+2,y,21); return [x,y]; } } } return null; },'08_cave',1500);
 // Nacht + Zombies (alle Typen)
 await tp(()=>{ const P=G.player; const x=G.w.feat.city.x0-30; P.x=x*T; P.y=(surfaceY(x)-3)*T; G.time=0.85; const ty=surfaceY(x)-1; const L=['schlurfer','schwester','bauarbeiter','soldat','clown','springer','rammbock','fettsack']; L.forEach((t,i)=>{ const e=makeMob(t,x+3+i*2,surfaceY(x+3+i*2)-1,{spawned:true}); e.sleep=true; G.ents.push(e); }); tset(x-2,surfaceY(x-2)-1,22); return x; },'09_night',1200);
 // Mutanten
 await tp(()=>{ const P=G.player; const x=Math.floor(P.x/T); G.time=0.3; G.ents.forEach(e=>{ if(e.spawned) e.dead=true; }); ['brocken','mantelmann','saegesepp'].forEach((t,i)=>{ const e=makeMob(t,x+4+i*4,surfaceY(x+4+i*4)-1,{spawned:true}); e.sleep=true; G.ents.push(e); }); return x; },'10_mutants',1200);
 // Kampf
 await p.evaluate(()=>{ const P=G.player; P.sel=P.inv.findIndex(s=>s&&s.id==='steinaxt'); UI.refreshHot(); G.ents.forEach(e=>{ if(e.spawned) e.sleep=false; }); P.dir=1; INPUT.act=true; INPUT.actFresh=true; });
 await p.waitForTimeout(700); await S('11_fight'); await p.evaluate(()=>{ INPUT.act=false; G.player.hp=100; G.ents.forEach(e=>{ if(e.spawned) e.dead=true; }); });
 // NPC Gespräch
 await tp(()=>{ const n=G.ents.find(e=>e.kind==='npc'&&e.t==='rudi')||G.ents.find(e=>e.kind==='npc'); const P=G.player; P.x=n.x-20; P.y=n.y; G.time=0.35; return n.t; },'12_npc',900);
 await p.evaluate(()=>{ const n=G.ents.find(e=>e.kind==='npc'&&e.t==='rudi')||G.ents.find(e=>e.kind==='npc'); UI.talk? UI.talk(n): doInteract(findInteract()); }); await p.waitForTimeout(400); await S('13_talk'); await p.evaluate(()=>UI.close());
 // Blutmond
 await tp(()=>{ G.bloodmoon=true; G.time=0.9; return 1; },'14_bloodmoon',1500);
 console.log('errs:\n'+errs.join('\n'));
 await b.close();
})();
