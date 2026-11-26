const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{
 const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1])); p.on('console',m=>{ if(m.type()==='error') errs.push('CE '+m.text()); });
 await p.goto('http://localhost:18611/index.html'); await p.waitForTimeout(800);
 await p.evaluate(()=>{ newGame(); });
 // Kampf: Zombie direkt vor Spieler
 const r=await p.evaluate(()=>{ const P=G.player; addItem('machete',1); P.sel=P.inv.findIndex(s=>s&&s.id==='machete'); const z=makeMob('schlurfer',Math.floor(P.x/T)+3,Math.floor((P.y+P.h)/T)-1); z.y=P.y+P.h-z.h; G.ents.push(z); P.dir=1; INPUT.act=true; INPUT.actFresh=true; return z.hp; });
 await p.waitForTimeout(2500); await p.screenshot({path:'shots/20_fight.png'});
 console.log('fight',await p.evaluate(()=>{ INPUT.act=false; const z=G.ents[G.ents.length-1]; return {dead:z.dead,hp:z.hp,kills:G.stats.kills,php:G.player.hp|0}; }));
 // Gun
 console.log('gun',await p.evaluate(()=>{ const P=G.player; addItem('pistole',1); addItem('muni',20); P.sel=P.inv.findIndex(s=>s&&s.id==='pistole'); const z=makeMob('bulle',Math.floor(P.x/T)+8,Math.floor((P.y+P.h)/T)-1); z.y=P.y+P.h-z.h; G.ents.push(z); INPUT.act=true; INPUT.actFresh=true; return countItem('muni'); }));
 await p.waitForTimeout(2500); await p.screenshot({path:'shots/21_gun.png'});
 console.log('gun2',await p.evaluate(()=>{ INPUT.act=false; return {muni:countItem('muni'),k:G.stats.kills}; }));
 // Touch auf Welt: tap aim to mine dirt below
 const box=await p.evaluate(()=>{ const P=G.player; const tx=Math.floor((P.x+P.w/2)/T)+1, ty=Math.floor((P.y+P.h)/T); const r=cv.getBoundingClientRect(); return {x:r.left+((tx*T+8)-G.cam.x)/G.VW*r.width, y:r.top+((ty*T+8)-G.cam.y)/G.VH*r.height, t:tget(tx,ty)}; });
 console.log('aim tile',box);
 const cdp=await ctx.newCDPSession(p);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x,y:box.y}]}); await p.waitForTimeout(3000); await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 console.log('after aim',await p.evaluate((b)=>{ const P=G.player; const tx=Math.floor((P.x+P.w/2)/T)+1; return 0; },box), await p.evaluate(()=>countItem('erde')));
 // Joystick drag
 const st=await p.evaluate(()=>{ const r=$('stick').getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; });
 const x0=await p.evaluate(()=>G.player.x);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:st.x,y:st.y,id:5}]}); await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:st.x+60,y:st.y,id:5}]}); await p.waitForTimeout(1000); await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 console.log('moved',await p.evaluate((x0)=>G.player.x-x0,x0));
 // Soak: Boss + Blutmond, unverwundbar
 await p.evaluate(()=>{ const P=G.player; P.maxInv=true; G.day=7; G.time=0.59; addItem('opfergabe',1); setTimeout(()=>{ summon('opfergabe'); },3000); setInterval(()=>{ P.hp=maxHp(); P.hu=100; P.th=100; },500); });
 for(let i=0;i<6;i++){ await p.waitForTimeout(5000); }
 await p.screenshot({path:'shots/22_soak.png'});
 console.log('soak',await p.evaluate(()=>({bm:G.bloodmoon,sp:G.bmSpawned,k:G.bmKills,ents:G.ents.length,boss:G.boss&&G.boss.hp|0,dmg:G.dmg.size})));
 await p.evaluate(()=>{ G.boss&&(G.boss.hp=1); addItem('aaspfeife',1); });
 await p.waitForTimeout(500);
 await p.evaluate(()=>{ if(G.boss){ hurtMob(G.boss,10,G.player,0);} summon('aaspfeife'); });
 for(let i=0;i<4;i++){ await p.waitForTimeout(5000); }
 await p.screenshot({path:'shots/23_soak2.png'});
 console.log('soak2',await p.evaluate(()=>({ents:G.ents.length,boss:G.boss&&G.boss.t, drops:G.drops.length, flags:G.flags})));
 console.log(errs.slice(0,8).join('\n'));
 await b.close();
})();
