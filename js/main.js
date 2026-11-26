// Lifetime – Start, Schleife, Eingabe, Speichern
'use strict';
const SAVE_KEY='lifetime_save_v1', OPT_KEY='lifetime_opts';
function resize(){ const w=innerWidth,h=innerHeight; const dpr=window.devicePixelRatio||1; const sc=Math.max(1,Math.round(h*dpr/G.opts.zoomVH)); // ganzzahlige Pixel-Skalierung
  G.VH=Math.ceil(h*dpr/sc); G.VW=Math.ceil(w*dpr/sc); cv.width=G.VW; cv.height=G.VH; cv.style.width=(G.VW*sc/dpr)+'px'; cv.style.height=(G.VH*sc/dpr)+'px'; ctx.imageSmoothingEnabled=false;
  const portrait=h>w*1.05; $('rot').classList.toggle('hide',!portrait||G.rotOK); }
function saveOpts(){ try{ localStorage.setItem(OPT_KEY,JSON.stringify(G.opts)); }catch(e){} }
function applyCtrl(){ const s=G.opts.ctrl; $('stick').style.transform=`scale(${s})`; $('stick').style.transformOrigin='left bottom'; $('btns').style.transform=`scale(${s})`; $('btns').style.transformOrigin='right bottom'; }
// ---- RLE ----
function rleEnc(a){ const out=[]; let i=0; while(i<a.length){ const v=a[i]; let n=1; while(i+n<a.length&&a[i+n]===v&&n<255) n++; out.push(v,n); i+=n; } const u=new Uint8Array(out); let s=''; for(let k=0;k<u.length;k+=8192) s+=String.fromCharCode.apply(null,u.subarray(k,k+8192)); return btoa(s); }
function rleDec(str,len){ const s=atob(str); const a=new Uint8Array(len); let p=0; for(let k=0;k<s.length;k+=2){ const v=s.charCodeAt(k), n=s.charCodeAt(k+1); a.fill(v,p,p+n); p+=n; } return a; }
function saveGame(quiet){ if(!G.w||G.state!=='play') return; try{ const w=G.w; const P=G.player;
  const ents=G.ents.filter(e=>!e.dead&&(e.kind==='npc'||!e.spawned)&&!(e.kind==='mob'&&MOBS[e.t].boss)).map(e=>{ const o={kind:e.kind,t:e.t,x:Math.round(e.x),y:Math.round(e.y),hp:Math.round(e.hp)}; if(e.sleep) o.sleep=1; if(e.camp!=null) o.camp=e.camp; if(e.rad) o.rad=1; if(e.kind==='npc'){ o.home=e.home; o.mode=e.mode; o.recruited=e.recruited; o.met=e.met; } return o; });
  const data={v:2,seed:w.seed,W:w.W,H:w.H,tiles:rleEnc(w.tiles),bg:rleEnc(w.bg),feat:w.feat,ents,player:Object.assign({},P,{inv:P.inv}),containers:G.containers,time:G.time,day:G.day,cannAngry:G.cannAngry,flags:G.flags,stats:G.stats,explored:rleEnc(G.explored),bloodmoon:G.bloodmoon,bmSpawned:G.bmSpawned,bmKills:G.bmKills};
  localStorage.setItem(SAVE_KEY,JSON.stringify(data)); if(!quiet) sfx('craft'); return true; }catch(e){ console.error(e); msg('Speichern fehlgeschlagen: '+e.message,'#ff5252'); return false; } }
function migrateV1(w){ // 0.1-Spielstände: Türen auf 3 Felder erweitern
  const W=w.W; for(let x=0;x<W;x++) for(let y=2;y<w.H-1;y++){ const t=w.tiles[y*W+x]; if((t===19||t===20)&&w.tiles[(y+1)*W+x]===t&&w.tiles[(y-1)*W+x]!==t&&w.tiles[(y+2)*W+x]!==t){ w.tiles[(y-1)*W+x]=t; } } }
function hasSave(){ try{ return !!localStorage.getItem(SAVE_KEY); }catch(e){ return false; } }
function loadGame(){ let d; try{ d=JSON.parse(localStorage.getItem(SAVE_KEY)); }catch(e){ return false; } if(!d) return false;
  const w={W:d.W,H:d.H,seed:d.seed,feat:d.feat,tiles:rleDec(d.tiles,d.W*d.H),bg:rleDec(d.bg,d.W*d.H)}; G.w=w; initSky();
  if((d.v||1)<2) migrateV1(w);
  G.player=Object.assign(newPlayer(0,0),d.player); G.player.dead=false; ensureSkills(G.player); if(G.player.h!==40){ G.player.y-=40-G.player.h; G.player.x-=2; G.player.w=14; G.player.h=40; } if(G.player.hp<=0) G.player.hp=30;
  G.ents=d.ents.map(o=>{ if(o.kind==='npc'){ const n=makeNPC(o.t,o.home.x,o.home.y); Object.assign(n,{x:o.x,y:o.y-((d.v||1)<2?14:0),hp:o.hp,mode:o.mode||'home',recruited:o.recruited,met:o.met}); return n; } const m=makeMob(o.t,0,0,{camp:o.camp,rad:!!o.rad}); m.x=o.x; m.y=o.y-((d.v||1)<2?Math.max(0,m.h-26):0); m.hp=o.hp; m.sleep=!!o.sleep; return m; });
  G.containers=d.containers||{}; G.time=d.time; G.day=d.day; G.cannAngry=d.cannAngry||0; G.flags=d.flags||{}; G.stats=d.stats||{kills:0,days:0}; G.explored=d.explored?rleDec(d.explored,200*40):new Uint8Array(8000);
  G.bloodmoon=!!d.bloodmoon; G.bmSpawned=d.bmSpawned||0; G.bmKills=d.bmKills||0; G.proj=[]; G.parts=[]; G.drops=[]; G.nums=[]; G.boss=null; G.dmg=new Map(); G.msgs=[];
  startPlay(); return true; }
function newGame(){ const seed=(Math.random()*1e9)|0; G.w=genWorld(seed); initSky(); const w=G.w;
  G.player=newPlayer(w.spawn.x,w.spawn.y); ensureSkills(G.player); G.ents=[]; G.containers={}; G.time=0.04; G.day=1; G.cannAngry=0; G.flags={}; G.stats={kills:0,days:0}; G.explored=new Uint8Array(8000); G.bloodmoon=false; G.proj=[]; G.parts=[]; G.drops=[]; G.nums=[]; G.boss=null; G.dmg=new Map(); G.msgs=[];
  for(const e of w.ents){ if(e.k==='npc') G.ents.push(makeNPC(e.t,Math.round(e.x),Math.round(e.y))); else if(e.k==='mob') { const m=makeMob(e.t,Math.round(e.x),Math.round(e.y),{camp:e.camp,sleep:!!e.sleep}); G.ents.push(m); } }
  // Startausrüstung
  const P=G.player; P.inv[0]={id:'flasche',n:1}; P.inv[1]={id:'beeren',n:3}; P.inv[2]={id:'fackel',n:3}; P.sel=3;
  startPlay(); G.cam.x=P.x-G.VW/2; G.cam.y=P.y-G.VH/2;
  setTimeout(()=>{ msg('Du lebst! Plündere das Wrack (✋ an den Kisten).','#ffcc80'); },800);
  setTimeout(()=>{ msg('Dann: Bäume fällen mit ⚒ und im 🎒 Werkzeug herstellen.','#ffcc80'); },6000);
}
function startPlay(){ G.state='play'; G.paused=false; $('title').classList.add('hide'); $('hud').classList.remove('hide'); UI.refreshHot(); audioInit(); }
function toTitle(){ G.state='title'; $('title').classList.remove('hide'); $('hud').classList.add('hide'); $('t-cont').classList.toggle('hide',!hasSave()); musicMode('titel'); setupTitleWorld(); }
function setupTitleWorld(){ G.w=genWorld(12345+((Math.random()*5)|0)); initSky(); G.player=null; G.ents=[]; G.proj=[]; G.parts=[]; G.drops=[]; G.nums=[]; G.time=0.55; G.bloodmoon=false; const c=G.w.feat.city; G.titleX=(c?c.x0-60:400)*T; G.cam.y=(surfaceY(G.titleX/T)-12)*T; }
// ---- Intro ----
const INTRO=['Flug LT-707. Kurz nach dem Start.<br>Die Stewardess verteilt Erdnüsse. Jemand schnarcht.','Dann: ein grelles Licht am Himmel.<br>Alle Bildschirme gehen gleichzeitig aus. Funkstille.','Die Maschine sackt ab. Schreie. Bäume.<br><b>Krach.</b>','Du wachst im Wrack auf. Es ist still. Zu still.<br>Irgendwo im Wald stöhnt etwas, das kein Mensch mehr ist.','<b>Tag 1.</b><br>Niemand weiß, was passiert ist.<br>Aber eins ist klar: Ab jetzt zählt jeder Tag.'];
function playIntro(){ let i=0; $('intro').classList.remove('hide'); const show=()=>{ $('introtxt').innerHTML=INTRO[i]; if(i===2){ sfx('boom'); } };
  show(); $('introskip').onclick=()=>{ i++; sfx('click'); if(i>=INTRO.length){ $('intro').classList.add('hide'); newGame(); UI.fade(); } else show(); }; }
// ---- Eingabe ----
function screenToWorld(cx,cy){ const r=cv.getBoundingClientRect(); return {x:(cx-r.left)/r.width*G.VW+G.cam.x, y:(cy-r.top)/r.height*G.VH+G.cam.y}; }
const touches={};
function setupInput(){
  const stick=$('stick'), knob=$('knob');
  const stickMove=(t)=>{ const r=stick.getBoundingClientRect(); const cx=r.left+r.width/2, cy=r.top+r.height/2; let dx=t.clientX-cx, dy=t.clientY-cy; const L=Math.hypot(dx,dy), M=r.width/2*0.8; if(L>M){ dx=dx/L*M; dy=dy/L*M; } const s=G.opts.ctrl; knob.style.left=(40+dx/s)+'px'; knob.style.top=(40+dy/s)+'px'; INPUT.jx=Math.abs(dx/M)>0.2?dx/M:0; INPUT.jy=Math.abs(dy/M)>0.25?dy/M:0; };
  const stickEnd=()=>{ knob.style.left='40px'; knob.style.top='40px'; INPUT.jx=0; INPUT.jy=0; };
  const bind=(el,down,up)=>{ el.addEventListener('touchstart',e=>{ e.preventDefault(); audioInit(); for(const t of e.changedTouches){ touches[t.identifier]=el.id; down(t);} },{passive:false});
    el.addEventListener('touchmove',e=>{ e.preventDefault(); for(const t of e.changedTouches) if(touches[t.identifier]===el.id) down(t,true); },{passive:false});
    const end=e=>{ e.preventDefault(); for(const t of e.changedTouches){ if(touches[t.identifier]===el.id){ delete touches[t.identifier]; up(t);} } }; el.addEventListener('touchend',end,{passive:false}); el.addEventListener('touchcancel',end,{passive:false});
    el.addEventListener('mousedown',e=>{ audioInit(); down(e); const mu=()=>{ up(e); removeEventListener('mouseup',mu); }; addEventListener('mouseup',mu); }); };
  bind(stick,(t)=>stickMove(t),stickEnd);
  bind($('btn-j'),(t,mv)=>{ if(!mv){ INPUT.jump=true; INPUT.jumpPressed=true; $('btn-j').classList.add('on'); } },()=>{ INPUT.jump=false; $('btn-j').classList.remove('on'); });
  bind($('btn-a'),(t,mv)=>{ if(!mv){ INPUT.act=true; INPUT.actFresh=true; $('btn-a').classList.add('on'); } },()=>{ INPUT.act=false; $('btn-a').classList.remove('on'); });
  bind($('btn-e'),(t,mv)=>{ if(!mv&&G.state==='play'&&!G.paused){ doInteract(); } },()=>{});
  // Tippen auf die Welt
  const aim=(t,mv)=>{ if(G.state!=='play'||G.paused) return; const p=screenToWorld(t.clientX,t.clientY); if(!mv){ const tx=Math.floor(p.x/T),ty=Math.floor(p.y/T); if(interactAt(tx,ty,p.x,p.y)){ INPUT.aim=null; return; } INPUT.aimFresh=true; } INPUT.aim=p; };
  bind(cv,aim,()=>{ INPUT.aim=null; });
  $('mm').onclick=()=>UI.open('map'); $('mm-in').onclick=()=>{ UI.mmZoom=Math.max(0.5,UI.mmZoom/2); sfx('click'); }; $('mm-out').onclick=()=>{ UI.mmZoom=Math.min(8,UI.mmZoom*2); sfx('click'); }; $('btn-inv').onclick=()=>UI.open('inv'); $('btn-map').onclick=()=>UI.open('map'); $('btn-menu').onclick=()=>UI.open('menu'); $('pclose').onclick=()=>UI.close();
  $('hot').addEventListener('touchstart',e=>{ const s=e.target.closest('.slot'); if(s){ e.preventDefault(); G.player.sel=+s.dataset.i; UI.refreshHot(); sfx('click'); } },{passive:false});
  // Tastatur (PC)
  addEventListener('keydown',e=>{ const k=e.key.toLowerCase(); if(INPUT.keys[k]) return; INPUT.keys[k]=true; audioInit();
    if(G.state!=='play') return; if(k==='escape'){ if(!$('panel').classList.contains('hide')) UI.close(); else UI.open('menu'); }
    if(G.paused) { if(k==='i'||k==='tab'){ e.preventDefault(); UI.close(); } return; }
    if(k===' '||k==='w'){ INPUT.jump=true; INPUT.jumpPressed=true; } if(k==='e') doInteract(); if(k==='i'||k==='tab'){ e.preventDefault(); UI.open('inv'); } if(k==='m') UI.open('map'); if(k==='f'){ INPUT.act=true; INPUT.actFresh=true; }
    if(k>='1'&&k<='8'){ G.player.sel=+k-1; UI.refreshHot(); } keyAxis(); });
  addEventListener('keyup',e=>{ const k=e.key.toLowerCase(); INPUT.keys[k]=false; if(k===' '||k==='w') INPUT.jump=false; if(k==='f') INPUT.act=false; keyAxis(); });
  addEventListener('wheel',e=>{ if(G.state==='play'&&!G.paused){ G.player.sel=(G.player.sel+(e.deltaY>0?1:-1)+HOT_N)%HOT_N; UI.refreshHot(); } });
  function keyAxis(){ const K=INPUT.keys; if(K.a||K.d||K.arrowleft||K.arrowright||K.s||K.arrowdown) { INPUT.jx=(K.d||K.arrowright?1:0)-(K.a||K.arrowleft?1:0); INPUT.jy=(K.s||K.arrowdown?1:0); INPUT.kb=true; } else if(INPUT.kb){ INPUT.jx=0; INPUT.jy=0; INPUT.kb=false; } }
  $('t-new').onclick=()=>{ audioInit(); if(hasSave()&&!confirm('Neues Spiel starten? Der alte Spielstand wird überschrieben.')) return; playIntro(); };
  $('t-cont').onclick=()=>{ audioInit(); if(!loadGame()) alert('Kein Spielstand gefunden.'); };
  $('t-help').onclick=()=>{ audioInit(); UI.tab='help'; G.titlePanel=true; $('panel').classList.remove('hide'); UI.renderPanel(); };
  $('t-opt').onclick=()=>{ audioInit(); UI.tab='opt'; $('panel').classList.remove('hide'); UI.renderPanel(); };
  $('rot-ok').onclick=()=>{ G.rotOK=true; resize(); };
  document.addEventListener('input',e=>{ if(e.target.id==='o-mus'){ G.opts.mus=+e.target.value; setVol('mus',G.opts.mus); saveOpts(); } if(e.target.id==='o-sfx'){ G.opts.sfx=+e.target.value; setVol('sfx',G.opts.sfx); saveOpts(); sfx('click'); } });
  document.addEventListener('visibilitychange',()=>{ if(document.hidden){ saveGame(true); if(SND.ctx) SND.ctx.suspend(); } else if(SND.ctx) SND.ctx.resume(); });
}
window.goBack=function(){ if(!$('panel').classList.contains('hide')){ UI.close(); return true; } if(G.state==='play'){ UI.open('menu'); return true; } return false; };
// ---- Schleife ----
let last=0;
function loop(t){ requestAnimationFrame(loop); const dt=Math.min(0.05,(t-last)/1000||0.016); last=t;
  try{
  if(G.state==='play'){ if(!G.paused&&!G.player.dead) update(dt); else if(G.player.dead){ G.clock+=dt; } render(); UI.hud(dt); }
  else if(G.w){ G.clock=(G.clock||0)+dt; G.time+=dt/DAYLEN*3; if(G.time>=1) G.time-=1; G.titleX+=dt*25; G.cam.x=G.titleX; const sy=(surfaceY(Math.floor((G.cam.x+G.VW/2)/T))-11)*T; G.cam.y+=(sy-G.cam.y)*dt; ctx.imageSmoothingEnabled=false; drawBackground(); const v=drawWorld(); for(const p of G.parts){ p.life-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt;} G.parts=G.parts.filter(p=>p.life>0); drawParts(v.ox,v.oy); drawLight(v); }
  }catch(err){ console.error(err); if(!G.errShown){ G.errShown=true; msg('Fehler: '+err.message,'#ff5252'); } }
}
function boot(){ cv=$('c'); ctx=cv.getContext('2d'); try{ Object.assign(G.opts,JSON.parse(localStorage.getItem(OPT_KEY)||'{}')); }catch(e){}
  SND.vol.mus=G.opts.mus; SND.vol.sfx=G.opts.sfx; G.clock=0;
  buildTileTex(); buildIcons(); buildLook(); resize(); addEventListener('resize',resize); setupInput(); applyCtrl(); toTitle(); requestAnimationFrame(loop); }
boot();
