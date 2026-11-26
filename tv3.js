const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
const URL=process.argv[2]||'http://localhost:18611/index.html';
(async()=>{
 const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2.625,isMobile:true,hasTouch:true});
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1])); p.on('console',m=>{ if(m.type()==='error') errs.push('CE '+m.text()); });
 await p.goto(URL); await p.waitForTimeout(1500);
 const S=async(n)=>{ await p.screenshot({path:`shots/v03/${n}.png`}); console.log('shot',n); };
 await S('01_title');
 await p.tap('#t-new'); for(let i=0;i<5;i++){ await p.waitForTimeout(120); await p.tap('#introskip'); }
 await p.waitForTimeout(1500); await p.evaluate(()=>{ G.time=0.32; }); await p.waitForTimeout(400); await S('02_start');
 const fps=await p.evaluate(()=>new Promise(r=>{ let n=0; const t0=performance.now(); function f(){ n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r(n/2); } requestAnimationFrame(f); }));
 console.log('fps',fps, await p.evaluate(()=>[G.VW,G.VH,typeof SND.samples]));
 const heal=()=>p.evaluate(()=>{ const P=G.player; P.fallY=P.y; P.hp=maxHp(); P.hu=100; P.th=100; });
 // Schwierigkeit
 console.log('tiers', await p.evaluate(()=>{ const f=G.w.feat; const x=f.wreck.x+7; return {spawn:tierAt(x,G.w.sky[x]), far150:tierAt(Math.min(G.w.W-1,x+150),G.w.sky[Math.min(G.w.W-1,x+150)]), far300:tierAt(Math.max(0,x-300),G.w.sky[Math.max(0,x-300)]), deep:tierAt(x,G.w.sky[x]+70), pool0:spawnPool(0,false,false), pool0u:spawnPool(0,true,false)}; }));
 // Kampf
 await p.evaluate(()=>{ addItem('machete',1); const P=G.player; P.sel=P.inv.findIndex(s=>s&&s.id==='machete'); if(P.sel<0) P.sel=0; UI.refreshHot(); G.ents=G.ents.filter(e=>e.kind!=='mob'); const tx=Math.floor(P.x/T); P.dir=1; const z=makeMob('schlurfer',tx+3,surfaceY(tx+3)-1,{}); z.hp=500; z.maxhp=500; G.ents.push(z); window._z=z; const z2=makeMob('bulle',tx+6,surfaceY(tx+6)-1,{}); G.ents.push(z2); });
 await heal();
 for(let i=0;i<3;i++){ await p.evaluate(()=>{ const P=G.player; P.attackT=0.2; hurtMob(window._z,18,P,150); }); await p.waitForTimeout(140); }
 await p.waitForTimeout(30); await S('03_combat_hit');
 await p.evaluate(()=>{ const P=G.player; window._z.hp=5; hurtMob(window._z,30,P,150); }); await p.waitForTimeout(260); await S('04_combat_death');
 await p.waitForTimeout(900); await S('05_corpse_blood');
 // Baum fällen
 const tree=await p.evaluate(()=>{ const P=G.player; const x0=Math.floor(P.x/T); for(let d=4;d<200;d++) for(const s of [1,-1]){ const x=x0+s*d; const y=G.w.sky[x]-1; if(tget(x,y)===6&&tget(x,y-3)===6){ P.x=(x-3*s)*T; P.y=(surfaceY(x-3*s)-3)*T; P.vy=0; P.dir=s; G.ents=G.ents.filter(e=>e.kind!=='mob'); return [x,y]; } } return null; });
 await heal(); await p.waitForTimeout(700); await S('06_tree_before');
 await p.evaluate(([x,y])=>{ breakTile(x,y,true); },tree); await p.waitForTimeout(280); await S('07_tree_falling');
 await p.waitForTimeout(1500); await S('08_tree_pieces_drops');
 console.log('drops after tree', await p.evaluate(()=>G.drops.map(d=>d.id+':'+d.n).join(',')));
 // Abbau: Risse, Splitter, Funken
 const st=await p.evaluate(()=>{ const P=G.player; const tx=Math.floor((P.x+P.w/2)/T)+P.dir, ty=Math.floor((P.y+P.h)/T); for(let y=ty;y<ty+6;y++){ if(tget(tx,y)===3||tget(tx,y)===1||tget(tx,y)===2) return [tx,y,tget(tx,y)]; } return [tx,ty+1,tget(tx,ty+1)]; });
 await p.evaluate(([x,y])=>{ tset(x,y,3); G.mineT={x,y,p:0.7,snd:0}; },st); await p.waitForTimeout(60); await S('09_mine_cracks');
 await p.evaluate(([x,y])=>{ breakTile(x,y,true); sparks(x*T+8,y*T+8,10); },st); await p.waitForTimeout(120); await S('10_mine_break');
 // Nacht, Nebel, Glüh-Kotzer
 await p.evaluate(()=>{ G.time=0.9; G.mineT=null; const P=G.player; const tx=Math.floor(P.x/T); const k=makeMob('kotzer',tx+7,surfaceY(tx+7)-1,{rad:true}); G.ents.push(k); window._k=k; const m=makeMob('armige',tx-9,surfaceY(tx-9)-1,{rad:true}); G.ents.push(m); });
 await heal(); await p.waitForTimeout(500); await p.evaluate(()=>{ const P=G.player; vomitAt(window._k,P.x+P.w/2+20,P.y+P.h-4); }); await p.waitForTimeout(500); await S('11_night_kotzer_vomit');
 await p.waitForTimeout(800); await heal(); await S('12_puddle_glow');
 await p.evaluate(()=>{ G.time=0.22; G.ents=G.ents.filter(e=>e.kind!=='mob'); G.puddles=[]; }); await p.waitForTimeout(600); await S('13_morning_fog');
 // Ausrüstung
 await p.evaluate(()=>{ for(const id of ['kampfstiefel','cargohose','lederjacke','stahlhelm','stirnlampe','gasmaske','jeans']) addItem(id,1); const P=G.player; for(const id of ['kampfstiefel','cargohose','lederjacke','stahlhelm','stirnlampe']){ const i=P.inv.findIndex(s=>s&&s.id===id); equipItem(i); } UI.open('inv'); const i=P.inv.findIndex(s=>s&&s.id==='gasmaske'); UI.pick={i,src:'p'}; UI.renderInv(); });
 await p.waitForTimeout(400); await S('14_inventory_equipment');
 await p.evaluate(()=>{ UI.close(); }); await p.waitForTimeout(400);
 const c=await p.evaluate(()=>{ const P=G.player; const r=cv.getBoundingClientRect(); return {x:r.left+(P.x-G.cam.x)/G.VW*r.width, y:r.top+(P.y-G.cam.y)/G.VH*r.height}; });
 await p.screenshot({path:'shots/v03/15_player_equipped_zoom.png',clip:{x:Math.max(0,c.x-90),y:Math.max(0,c.y-70),width:200,height:190}});
 // Craft-Tab & Menü
 await p.evaluate(()=>UI.open('craft')); await p.waitForTimeout(300); await S('16_craft_ui');
 await p.evaluate(()=>{ UI.close(); UI.open('menu'); }); await p.waitForTimeout(300); await S('17_menu_ui'); await p.evaluate(()=>UI.close());
 // NPC-Dialog
 const npc=await p.evaluate(()=>{ const n=G.ents.find(e=>e.kind==='npc'&&NPCS[e.t].trade)||G.ents.find(e=>e.kind==='npc'); UI.talk(n); return n.t; }); console.log('npc',npc);
 await p.waitForTimeout(250); await S('18_dialog_typing');
 await p.waitForTimeout(3000); await S('19_dialog_done');
 await p.evaluate(()=>UI.npcAct('theory')); await p.waitForTimeout(3500); await S('20_dialog_theory_page1');
 const pages=await p.evaluate(()=>UI.dlg&&UI.dlg.pages.length); console.log('theory pages',pages);
 await p.tap('.say .next').catch(()=>{}); await p.waitForTimeout(150); await p.tap('.say .next').catch(()=>{}); await p.waitForTimeout(3500); await S('21_dialog_theory_page2');
 await p.evaluate(()=>UI.npcAct('trade')); await p.waitForTimeout(3000); await p.evaluate(()=>{ const D=UI.dlg; if(D){ D.i=D.pages.length-1; D.shown=99999; UI.renderNPC(); } }); await p.waitForTimeout(200); await S('22_trader');
 await p.evaluate(()=>UI.close()); await p.waitForTimeout(300);
 // Pinch-Zoom über CDP
 const cdp=await ctx.newCDPSession(p);
 const tp=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((q,i)=>({x:q[0],y:q[1],id:i}))});
 await tp('touchStart',[[380,200],[540,200]]); for(let k=1;k<=6;k++){ await tp('touchMove',[[380+k*12,200],[540-k*12,200]]); await p.waitForTimeout(30); } await tp('touchEnd',[]);
 await p.waitForTimeout(500); console.log('zoomOut', await p.evaluate(()=>[G.zoomOut,G.VW,G.VH])); await S('23_pinch_zoomed_out');
 await tp('touchStart',[[440,200],[480,200]]); for(let k=1;k<=6;k++){ await tp('touchMove',[[440-k*14,200],[480+k*14,200]]); await p.waitForTimeout(30); } await tp('touchEnd',[]);
 await p.waitForTimeout(300); console.log('zoomIn', await p.evaluate(()=>[G.zoomOut,G.VW,G.VH]));
 // Blutmond-Musik-Datei vorhanden?
 console.log('music', await p.evaluate(()=>MUSIC_FILES));
 const fps2=await p.evaluate(()=>new Promise(r=>{ let n=0; const t0=performance.now(); function f(){ n++; if(performance.now()-t0<2000) requestAnimationFrame(f); else r(n/2); } requestAnimationFrame(f); })); console.log('fps end',fps2);
 console.log('ERRORS',errs.length?errs:'none');
 await b.close();
})();
