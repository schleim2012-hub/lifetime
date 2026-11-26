const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{ const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}); const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:18611/index.html'); await p.waitForTimeout(2500);
 const url=await p.evaluate(()=>{ const ids=['notaxt','steinaxt','eisenaxt','steinhacke','eisenhacke','machete','knueppel','speer','kettensaege','pistole','fackel']; const frs=['i','w2','a0','a1','a2','a3'];
   const c=document.createElement('canvas'); c.width=ids.length*44; c.height=frs.length*56+8; const g=c.getContext('2d'); g.imageSmoothingEnabled=false; g.fillStyle='#8899aa'; g.fillRect(0,0,c.width,c.height);
   ids.forEach((id,i)=>frs.forEach((f,j)=>{ drawSprite(g,typeof playerLook==='function'?'player':'player',f,i*44+22,j*56+52,1,{held:id}); }));
   const z=document.createElement('canvas'); z.width=c.width*3; z.height=c.height*3; const zg=z.getContext('2d'); zg.imageSmoothingEnabled=false; zg.drawImage(c,0,0,z.width,z.height); return z.toDataURL(); });
 require('fs').writeFileSync(process.argv[2]||'/tmp/held.png',Buffer.from(url.split(',')[1],'base64')); console.log(errs); await b.close(); })();
