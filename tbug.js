const pw=require('/usr/local/lib/pnpm/5/.pnpm/playwright-core@1.59.1/node_modules/playwright-core');
const D='/workspace/lifetime/shots/v05/';
(async()=>{ const b=await pw.chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']}); const ctx=await b.newContext({viewport:{width:915,height:412},deviceScaleFactor:2.625,isMobile:true,hasTouch:true}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:18611/index.html'); await p.waitForTimeout(1500); await p.tap('#t-new'); for(let i=0;i<6;i++){ await p.waitForTimeout(150); await p.tap('#introskip').catch(()=>{}); } await p.waitForTimeout(1200);
 await p.evaluate(()=>{ hurtPlayer=function(){}; G.day=5; });
 const pre=process.argv[2]||'before';
 for(const [n,t,dx] of [['a',0.35,0],['b',0.35,-25],['c',0.35,25],['d',0.62,0],['e',0.35,50]]){ await p.evaluate(([t,dx])=>{ G.time=t; const P=G.player; const s=G.w.spawn; P.x=(s.x+dx)*T; P.y=(surfaceY(s.x+dx)-3)*T; P.vy=0; G.ents=G.ents.filter(e=>e.kind!=='mob'); },[t,dx]); await p.waitForTimeout(900); await p.screenshot({path:`${D}${pre}_${n}.png`}); }
 console.log(errs); await b.close(); })();
