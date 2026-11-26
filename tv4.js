const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
const URL=process.argv[2]||'http://localhost:18611/index.html'; const ONLY=process.argv[3]||'';
const D='/workspace/lifetime/shots/v04/';
(async()=>{
 const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2.625,isMobile:true,hasTouch:true});
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n').slice(1,3).join('|'))); p.on('console',m=>{ if(m.type()==='error') errs.push('CE '+m.text()); });
 await p.goto(URL); await p.waitForTimeout(2000);
 const S=async(n)=>{ await p.screenshot({path:D+n+'.png'}); console.log('shot',n); };
 await S('01_title');
 await p.tap('#t-new'); for(let i=0;i<5;i++){ await p.waitForTimeout(120); await p.tap('#introskip').catch(()=>{}); }
 await p.waitForTimeout(1500); await p.evaluate(()=>{ G.time=0.32; }); await p.waitForTimeout(400); await S('02_start');
 const fps=await p.evaluate(()=>new Promise(r=>{ let n=0; const t0=performance.now(); function f(){ n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r(n/2); } requestAnimationFrame(f); }));
 console.log('fps',fps,'furn',await p.evaluate(()=>{ let n=0; for(const t of G.w.tiles) if(TILES[t]&&TILES[t].furn) n++; return n; }));
 const heal=()=>p.evaluate(()=>{ const P=G.player; P.fallY=P.y; P.hp=maxHp(); P.hu=100; P.th=100; P.st=100; P.stam=100; });
 console.log('errs so far',errs);
 if(ONLY==='quick'){ await b.close(); return; }
 const go=async(src)=>{ await p.evaluate(src); };
 // Haus mit Möbeln
 const house=await p.evaluate(()=>{ const w=G.w; let best=null,bn=0; for(let x=30;x<w.W-30;x+=4){ let n=0; for(let y=0;y<w.H;y++) for(let a=0;a<12;a++){ const t=tget(x+a,y); if(TILES[t]&&TILES[t].furn) n++; } if(n>bn){ bn=n; best=x; } } if(best==null) return null; let y=0; for(let yy=0;yy<w.H;yy++){ const t=tget(best+5,yy); if(TILES[t]&&TILES[t].furn){ y=yy; break; } } const P=G.player; P.x=(best+5)*T; P.y=(y-1)*T; P.vy=0; P.fallY=P.y; G.cam.x=P.x-G.VW/2; G.cam.y=P.y-G.VH/2; return [best,y,bn]; });
 console.log('house',house); await p.evaluate(()=>{ window._hp=hurtPlayer; hurtPlayer=function(){}; }); await heal(); await p.evaluate(()=>{ G.time=0.92; }); await p.waitForTimeout(900); await heal(); await S('03_house_night');
 await p.evaluate(()=>{ G.time=0.4; }); await p.waitForTimeout(600); await heal(); await S('04_house_day');
 // Kampf: Schwung
 await p.evaluate(()=>{ addItem('vorschlaghammer',1); addItem('wurfmesser',20); const P=G.player; P.sel=P.inv.findIndex(s=>s&&s.id==='vorschlaghammer'); UI.refreshHot(); G.ents=G.ents.filter(e=>e.kind!=='mob'); P.x=G.w.feat.wreck.x*T+300; P.y=(surfaceY(Math.floor(P.x/T))-3)*T; P.vy=0; P.dir=1; const tx=Math.floor(P.x/T); for(const o of [2,3]){ const z=makeMob('schlurfer',tx+o,surfaceY(tx+o)-1,{}); z.sleep=false; G.ents.push(z);} });
 await heal(); await p.waitForTimeout(600);
 await p.evaluate(()=>{ G.player.cd=0; useHeld(0.016,null,null,true); }); await p.waitForTimeout(90); await S('05_swing_mid');
 await p.waitForTimeout(200); await S('06_swing_hit_numbers');
 await p.evaluate(()=>{ const P=G.player; P.cd=0; P.sel=P.inv.findIndex(s=>s&&s.id==='wurfmesser'); UI.refreshHot(); const e=G.ents.find(e=>e.kind==='mob'&&!e.dead); useHeld(0.016,(e?e.x:P.x+100)+40,P.y+10,true); }); await p.waitForTimeout(70); await S('07_throw');
 // Ghule
 await p.evaluate(()=>{ const c=G.w.feat.cann; const P=G.player; P.x=(c.x0+12)*T; P.y=(c.y-4)*T; P.vy=0; G.time=0.45; G.ents=G.ents.filter(e=>!(e.kind==='mob'&&!MOBS[e.t].cann)); const tx=Math.floor(P.x/T); for(const o of [-5,-3,4,6]){ const g=makeMob('kannibale',tx+o,surfaceY(tx+o)-1,{}); g.sleep=false; g.talkT=o<0?0:0.3; G.ents.push(g);} });
 await heal(); await p.waitForTimeout(1500); await heal(); await S('08_ghouls');
 await p.evaluate(()=>{ G.cannAngry=2; for(const e of G.ents) if(e.kind==='mob'&&MOBS[e.t].cann) e.talkT=0; }); await p.waitForTimeout(1600); await heal(); await S('09_ghouls_angry');
 await p.evaluate(()=>{ G.cannAngry=0; G.ents=G.ents.filter(e=>!(e.kind==='mob'&&MOBS[e.t].cann)); G.bubbles=[]; });
 // Tür & Horde
 const door=await p.evaluate(()=>{ const P=G.player; const tx=Math.floor(P.x/T)+6; const gy=surfaceY(tx); for(let y=gy-6;y<gy;y++) for(let x=tx-1;x<=tx+1;x++) tset(x,y,0); for(let y=gy-3;y<gy;y++){ tset(tx,y,3);} tset(tx,gy-1,19); tset(tx,gy-2,3); G.dmg.clear(); { const z=makeMob('schlurfer',tx+2,gy-1,{}); z.sleep=false; z.x=(tx+1)*T; G.ents.push(z); } P.x=(tx-4)*T; P.y=(gy-3)*T; P.vy=0; return [tx,gy-1]; });
 await heal(); await p.evaluate(()=>{ G.time=0.9; }); await p.waitForTimeout(4000); await heal(); console.log('single door dmg',await p.evaluate(([x,y])=>[tget(x,y),G.dmg.get(y*G.w.W+x)],door)); await S('10a_door_single');
 await p.evaluate(([tx,y])=>{ for(let i=0;i<3;i++){ const z=makeMob('schlurfer',tx+2+i,y,{}); z.sleep=false; z.x=(tx+1)*T+4+i*3; G.ents.push(z);} },door); await p.waitForTimeout(2500); await heal(); console.log('door dmg',await p.evaluate(([x,y])=>[tget(x,y),G.dmg.get(y*G.w.W+x)],door)); await S('10_door_horde');
 await p.evaluate(()=>{ G.ents=G.ents.filter(e=>e.kind!=='mob'); });
 // Komet
 await p.evaluate(()=>{ G.time=0.9; G.day=3; G.cometNight=3; cometLaunch(); }); await p.waitForTimeout(1300); await heal(); await S('11_comet_fall');
 await p.waitForTimeout(1900); await heal(); await S('12_comet_impact');
 await p.evaluate(()=>{ const f=G.flags.comet; if(f){ const P=G.player; P.x=f.x*T-40; P.y=(f.y-3)*T; P.vy=0; } }); await p.waitForTimeout(1200); await heal(); await S('13_crater');
 // Boss
 await p.evaluate(()=>{ hurtPlayer=window._hp; }); await p.evaluate(()=>{ G.time=0.92; const P=G.player; const tx=Math.floor(P.x/T); const bb=makeMob('brocken',tx+8,surfaceY(tx+8)-1,{}); bb.sleep=false; G.ents.push(bb); G.boss=bb; G.bloodmoon=true; G.bmKills=9; G.bmSpawned=15; hurtMob(bb,120,P,0); });
 await heal(); await p.waitForTimeout(800); await heal(); await S('14_boss_wave');
 await p.evaluate(()=>{ G.ents=G.ents.filter(e=>e.kind!=='mob'); G.boss=null; G.bloodmoon=false; });
 // Inventar, Skills, NPC
 await p.evaluate(()=>{ for(const id of ['eisenaxt','titanhacke','schrotflinte','medkit','konserve','kronleuchter','bild_mann','sternenherz','kometensplitter','knochenspeer','hackebeil','lederjacke']) addItem(id,id==='konserve'?7:1); UI.open('inv'); UI.pick={i:2}; UI.renderPanel(); }); await p.waitForTimeout(400); await S('15_inventory');
 await p.evaluate(()=>{ G.player.sp=4; UI.tab='skills'; UI.skA='staerke'; UI.skP='pruegelknabe'; UI.renderPanel(); }); await p.waitForTimeout(300); await S('16_skills');
 await p.evaluate(()=>{ UI.skA='fitness'; UI.skP=null; UI.renderPanel(); }); await p.waitForTimeout(200); await S('17_skills_attr');
 await p.evaluate(()=>{ UI.close(); const n=G.ents.find(e=>e.kind==='npc'); if(n) UI.talk(n); }); await p.waitForTimeout(700); await S('18_npc_dialog');
 await p.waitForTimeout(2500); await S('19_npc_dialog_later');
 await p.evaluate(()=>{ UI.close(); }); await p.waitForTimeout(200); await S('20_hud');
 // Musik
 console.log('music', await p.evaluate(()=>({mode:SND.mode,tr:Object.keys(MUSX.tr).map(k=>[k,!!MUSX.tr[k].buf,MUSX.tr[k].target,MUSX.tr[k].g?MUSX.tr[k].g.gain.value.toFixed(2):null])})));
 console.log('errs',errs); await b.close(); })();
