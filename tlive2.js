const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{
 const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--autoplay-policy=no-user-gesture-required']});
 const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2.625,isMobile:true,hasTouch:true});
 const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PE '+e.message+' '+(e.stack||'').split('\n')[1])); p.on('console',m=>{ if(m.type()==='error') errs.push('CE '+m.text()); });
 await p.goto('https://schleim2012-hub.github.io/lifetime/'); await p.waitForTimeout(1000);
 await p.tap('#t-new'); for(let i=0;i<5;i++){ await p.waitForTimeout(120); await p.tap('#introskip'); }
 await p.waitForTimeout(800);
 const r=await p.evaluate(()=>{ const P=G.player; gainXP(4000); const sp=P.sp; addItem('heft_schrauber1',1); addItem('heft_bote2',1); readBook('heft_schrauber1'); return {lvl:P.lvl,sp,attr:P.attr,mine:SKILLFX.mine(),snd:!!SND.ctx,mode:SND.mode,tracks:Object.keys(SND.tracks)}; });
 console.log(JSON.stringify(r));
 await p.evaluate(()=>UI.open('skills')); await p.waitForTimeout(300);
 // Attribut + Perk kaufen per Klick
 await p.tap('[data-attr="staerke"]'); await p.tap('[data-attr="staerke"]'); await p.tap('[data-perk="pruegelknabe"]'); await p.tap('[data-perk="pruegelknabe"]'); await p.waitForTimeout(200);
 console.log(JSON.stringify(await p.evaluate(()=>({attr:G.player.attr.staerke,perk:G.player.perk,sk:G.player.sk,sp:G.player.sp}))));
 await p.screenshot({path:'shots/v02/after_15_skills.png'});
 await p.evaluate(()=>{ const el=document.querySelector('#pbody'); el.scrollTop=el.scrollHeight; }); await p.waitForTimeout(200); await p.screenshot({path:'shots/v02/after_16_skills_hefte.png'});
 await p.evaluate(()=>UI.close());
 // Audio: alle SFX + Musikmodi durchspielen
 const a=await p.evaluate(async()=>{ const out=[]; for(const k in SFX){ try{ SFX[k](); }catch(e){ out.push(k+':'+e.message); } } for(const m of ['tag','nacht','kampf','blut','boss','hoehle']){ SND.mode=null; musicMode(m); await new Promise(r=>setTimeout(r,400)); } const t=SND.tracks['music/nacht.mp3']; return {out, state:SND.ctx.state, nacht:t&&{ok:t.ok,paused:t.el.paused,ready:t.el.readyState,dur:t.el.duration}}; });
 console.log(JSON.stringify(a));
 console.log('errs:\n'+errs.join('\n')); await b.close(); })();
