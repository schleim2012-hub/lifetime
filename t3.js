const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{
 const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+e.stack)); p.on('console',m=>{ if(m.type()==='error') errs.push('CE '+m.text()); });
 await p.goto('http://localhost:18611/index.html'); await p.waitForTimeout(800);
 await p.evaluate(()=>{ newGame(); });
 await p.waitForTimeout(500);
 const tp=async(fn,name,wait)=>{ const r=await p.evaluate(fn); await p.waitForTimeout(wait||1500); await p.screenshot({path:'shots/'+name+'.png'}); return r; };
 // Stadt
 console.log('city',await tp(()=>{ const c=G.w.feat.city; const tw=G.w.feat.towers[1]; const P=G.player; P.x=(tw.x0+4)*T; P.y=(tw.gy-6-1)*T-P.h+T; G.player.inv_t=999; G.time=0.2; return [c.x0,c.x1,tw.floors]; },'10_city'));
 // Hochhaus innen Nacht
 await tp(()=>{ G.time=0.65; },'11_city_night',2500);
 // NPC sprechen
 console.log('npc',await tp(()=>{ const n=G.ents.find(e=>e.kind==='npc'&&e.t==='kalle'); const P=G.player; P.x=n.x+20; P.y=n.y; G.time=0.2; UI.talk(n); UI.npcAct('theory'); return n.t; },'12_talk',500));
 await p.evaluate(()=>UI.close());
 // Kannibalen
 console.log('cann',await tp(()=>{ const c=G.w.feat.cann; const P=G.player; P.x=(c.x0+8)*T; P.y=(c.y-2)*T; return c; },'13_cann',2500));
 // Camp
 await tp(()=>{ const c=G.w.feat.camps[0]; const P=G.player; P.x=(c.x0-8)*T; P.y=(c.y-3)*T; },'14_camp',2500);
 // Mutant-Höhle
 await tp(()=>{ const l=G.w.feat.lairs[0]; const P=G.player; P.x=(l.x-8)*T; P.y=(l.y-2)*T; },'15_lair',2500);
 // Boss
 await tp(()=>{ const P=G.player; const s=G.w.spawn; P.x=s.x*T; P.y=(s.y-1)*T; G.time=0.7; addItem('opfergabe',1); summon('opfergabe'); },'16_boss',3500);
 await tp(()=>{ G.boss.dead=true; G.boss=null; addItem('aaspfeife',1); summon('aaspfeife'); },'17_boss2',3500);
 // Blutmond
 await tp(()=>{ G.boss.dead=true; G.boss=null; G.day=7; G.time=0.58; },'18_bm',6000);
 console.log(await p.evaluate(()=>({bm:G.bloodmoon,spawned:G.bmSpawned,n:G.ents.filter(e=>!e.dead&&e.bm).length})));
 // Speichern/laden
 console.log('save',await p.evaluate(()=>{ const ok=saveGame(); const sz=localStorage.getItem(SAVE_KEY).length; const ok2=loadGame(); return [ok,sz,ok2,G.ents.length]; }));
 const fps=await p.evaluate(()=>new Promise(r=>{ let n=0; const t0=performance.now(); function f(){ n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r(n/2); } requestAnimationFrame(f); })); console.log('fps',fps);
 console.log(errs.slice(0,5).join('\n'));
 await b.close();
})();
