const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{ const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 const p=await b.newPage({viewport:{width:915,height:412}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:18611/index.html'); await p.waitForTimeout(800);
 const r=await p.evaluate(()=>{ newGame(); G.state='play'; saveGame(true); const d=JSON.parse(localStorage.getItem(SAVE_KEY)); d.v=1; d.player.h=26; d.player.w=10; d.player.y+=14; delete d.player.attr; delete d.player.perk; delete d.player.books; d.player.sk.staerke=2; d.player.sk.handwerk=1; d.player.sp=0; localStorage.setItem(SAVE_KEY,JSON.stringify(d)); const ok=loadGame(); const P=G.player; return {ok,sp:P.sp,h:P.h,attr:!!P.attr,sk:P.sk}; });
 console.log(JSON.stringify(r), errs); await b.close(); })();
