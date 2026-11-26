const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{ const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}); const p=await b.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); await p.goto('http://localhost:18611/index.html'); await p.waitForTimeout(2000);
 for(let k=0;k<6;k++){ console.log(await p.evaluate(k=>{ const w0=_genWorld5(1000+k*7919); let t0=0; for(let i=0;i<w0.tiles.length;i++) if(w0.tiles[i]===6) t0++; const w=genWorld(1000+k*7919); G.w=w; initSky(); let bare=0,float=0,floatT=0; const sx=w.spawn.x; const isT=t=>t===6||t===80||t===81;
   for(let x=1;x<w.W-1;x++) for(let y=1;y<w.H-1;y++){ const t=tget(x,y); if(isT(t)){ const b=tget(x,y+1); if(!isT(b)&&!TILES[b].s) float++; if(!isT(tget(x,y-1))&&t!==81){ let lf=0; for(let dx=-3;dx<=3;dx++) for(let dy=-4;dy<=1;dy++){ const q=tget(x+dx,y+dy); if(TILES[q]&&TILES[q].leaf) lf++; } if(!lf) bare++; } }
     if((t===30||t===12||t===34)&&Math.abs(x-sx)<18&&y<w.sky[x]+2) floatT++; }
   let tr=0; for(let i=0;i<w.tiles.length;i++) if(w.tiles[i]===6||w.tiles[i]===80) tr++; return 'orig='+t0+' trunks='+tr+' seed'+k+' bareTrunks='+bare+' floatingTrunks='+float+' wreckTiles='+floatT+' veh='+w.feat.veh.length; },k)); }
 console.log(errs); await b.close(); })();
