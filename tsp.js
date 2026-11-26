const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{ const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--allow-file-access-from-files']});
 const p=await b.newPage({viewport:{width:1400,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file:///workspace/lifetime/spritetest.html'); await p.waitForTimeout(800); await p.screenshot({path:'shots/v02/sprites_sheet.png'}); console.log(errs.join('\n')); await b.close(); })();
