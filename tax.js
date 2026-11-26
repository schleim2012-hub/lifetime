const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{ const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}); const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2,isMobile:true,hasTouch:true}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:18611/index.html'); await p.waitForTimeout(1500); await p.tap('#t-new'); for(let i=0;i<6;i++){ await p.waitForTimeout(150); await p.tap('#introskip').catch(()=>{}); } await p.waitForTimeout(800);
 const data=await p.evaluate(()=>{ hurtPlayer=function(){}; const out=[]; const ids=['notaxt','steinaxt','steinhacke','eisenaxt','eisenhacke','titanhacke','kettensaege','knueppel','speer','naegelschlaeger','machete','zwillingsklinge','armknochen','bogen','pistole','schrotflinte','fackel'].filter(i=>GFX.icons[i]);
   const c=document.createElement('canvas'); c.width=ids.length*40; c.height=80; const g=c.getContext('2d'); g.imageSmoothingEnabled=false; g.fillStyle='#456'; g.fillRect(0,0,c.width,80);
   ids.forEach((id,k)=>{ g.drawImage(GFX.icons[id],k*40+4,2); });
   return [ids, c.toDataURL()]; });
 console.log(data[0]); require('fs').writeFileSync('/tmp/icons.png',Buffer.from(data[1].split(',')[1],'base64'));
 for(const id of ['eisenaxt','eisenhacke','machete','speer']){ await p.evaluate(id=>{ addItem(id,1); const P=G.player; const i=P.inv.findIndex(s=>s&&s.id===id); P.sel=i<HOT_N?i:0; if(i>=HOT_N){ const t=P.inv[0]; P.inv[0]=P.inv[i]; P.inv[i]=t; P.sel=0;} UI.refreshHot&&UI.refreshHot(); },id); await p.waitForTimeout(400); await p.screenshot({path:'/tmp/held_'+id+'.png',clip:{x:400,y:150,width:120,height:110}}); }
 console.log(errs); await b.close(); })();
