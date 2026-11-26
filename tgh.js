const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{ const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}); const p=await b.newPage({viewport:{width:900,height:240}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:18611/ghtest.html'); await p.waitForTimeout(1200); console.log(await p.title(),errs); await p.screenshot({path:'/workspace/lifetime/shots/v04/ghoul_sheet.png'}); await b.close(); })();
