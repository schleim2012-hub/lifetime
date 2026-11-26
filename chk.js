const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
(async()=>{ const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}); const p=await b.newPage(); p.on('pageerror',e=>console.log('PE',e.message)); p.on('console',m=>console.log('C',m.type(),m.text()));
await p.goto('http://localhost:18611/index.html'); await p.waitForTimeout(1500); console.log(await p.evaluate(()=>[typeof fxUpdate,typeof sparks,typeof equipItem,typeof uiTex,typeof tierAt])); await b.close(); })();
