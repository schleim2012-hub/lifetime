// Lifetime 0.5 – Teil C: Petes eigene Gegner (art-src/pete/<name>/ -> js/artpete.js)
'use strict';
// Werte je Gegner. Neue Ordner ohne Eintrag bekommen automatisch Standardwerte (leichter Zombie).
const PETE_MOBDEF={
  hippie:{n:'Flower-Power-Fritz',hp:55,spd:30,dmg:8,w:14,h:40,xp:20,zombie:true,pete:true,joints:true,rainbow:true,talk:'hippie',tiers:[0,1,2,3]},
  nurse:{n:'Schwester Schocktherapie',hp:85,spd:36,dmg:11,w:14,h:40,xp:30,zombie:true,pete:true,defi:true,talk:'nurse',tiers:[2,3,4]},
  // 0.7: Endboss + Mini-Gegner aus dem Fernseher (Werte/Verhalten in v07.js; tiers:[] = spawnen nie von selbst)
  tvzombie:{n:'Mainstream-TV-Zombie',hp:3200,spd:34,dmg:26,w:40,h:118,xp:1500,zombie:false,pete:true,boss:true,tiers:[]},
  mini_slasher:{n:'Hackebeil-Hannes',hp:30,spd:62,dmg:7,w:12,h:24,xp:12,zombie:true,pete:true,mini:true,tiers:[]},
  mini_vampir:{n:'Graf Bissfest',hp:26,spd:70,dmg:6,w:12,h:24,xp:12,zombie:true,pete:true,mini:true,tiers:[]},
  mini_mumie:{n:'Mumien-Manni',hp:40,spd:40,dmg:6,w:12,h:24,xp:12,zombie:true,pete:true,mini:true,tiers:[]},
  mini_clown:{n:'Clownchen Grinsekatz',hp:24,spd:66,dmg:5,w:12,h:24,xp:12,zombie:true,pete:true,mini:true,tiers:[]},
  mini_affe:{n:'Affenkönig Bumbum',hp:45,spd:55,dmg:8,w:14,h:26,xp:15,zombie:true,pete:true,mini:true,tiers:[]}
};
const PETEI={};
(function(){ const mk=u=>{ const i=new Image(); i.src=u; return i; };
  for(const k in PETE_ART){ PETEI[k]={}; for(const f in PETE_ART[k]) PETEI[k][f]=mk(PETE_ART[k][f]);
    const d=Object.assign({n:k[0].toUpperCase()+k.slice(1),hp:45,spd:30,dmg:8,w:14,h:40,xp:15,zombie:true,pete:true,tiers:[1,2]},PETE_MOBDEF[k]||{}); MOBS[k]=d;
    for(const t of d.tiers){ const pool=TIER_POOLS.surf[Math.min(TIER_POOLS.surf.length-1,t)]; if(pool) pool.push(k); } }
  // alte Schwester seltener, die neue ersetzt sie teilweise
  for(const pool of TIER_POOLS.surf){ const i=pool.indexOf('schwester'); if(i>=0&&PETE_ART.nurse) pool.splice(i,1,'nurse'); }
  // Startzone (Stufe 0) ohne Schwester
  TIER_POOLS.surf[0]=TIER_POOLS.surf[0].filter(t=>t!=='nurse'); })();
const _getSprite5=getSprite;
getSprite=function(id,fr,rad){ const A=PETEI[id]; if(A&&A.stand&&A.stand.complete&&A.stand.naturalWidth){ const key='pete|'+id+'|'+fr; let s=SPR.cache.get(key); if(s) return s;
    let img=A.stand; if(fr[0]==='w'){ const n=(parseInt(fr.slice(1))>>1)&3; img=[A.walk1,A.stand,A.walk2,A.stand][n]||A.stand; } else if(fr[0]==='a'){ img=A.attack||A.walk1||A.stand; } else if(fr==='j') img=A.walk2||A.stand;
    if(!img.complete||!img.naturalWidth) img=A.stand; const c=mkCanvas(img.naturalWidth,img.naturalHeight); c.getContext('2d').drawImage(img,0,0);
    s={cv:c,w:c.width,h:c.height,hand:null}; if(fr==='i') s.anc={ax:Math.round(c.width/2),ay:c.height-1,top:0}; SPR.cache.set(key,s); return s; }
  return _getSprite5(id,fr,rad); };
const _spriteAnchor5=spriteAnchor; spriteAnchor=function(id,rad){ if(PETEI[id]){ const s=getSprite(id,'i',rad); if(s.anc) return s.anc; } return _spriteAnchor5(id,rad); };
// Tod: umkippen statt plattdrücken, Blumen/Funken
const _killMob5=killMob;
killMob=function(e,src){ const was=e.dead; _killMob5(e,src); if(was) return; const d=MOBS[e.t]; if(!d||!d.pete) return; const c=G.corpses[G.corpses.length-1]; if(c&&c.id===e.t) c.crea=false;
  if(d.rainbow) for(let i=0;i<14;i++) G.parts.push({x:e.x+e.w/2,y:e.y+10,vx:(Math.random()-0.5)*120,vy:-Math.random()*140,life:1.4,col:RAINBOW[i%6],sz:2,grav:300});
  if(d.defi) for(let i=0;i<10;i++) G.parts.push({x:e.x+e.w/2,y:e.y+16,vx:(Math.random()-0.5)*160,vy:-Math.random()*120,life:0.5,col:i%2?'#9ad8ff':'#ffffff',sz:1,grav:200,light:0.6});
  sfx(d.talk==='hippie'?'hippieDie':'nurseDie'); };
const RAINBOW=['#ff4a4a','#ff9a2a','#ffe83a','#4ae85a','#3aa0ff','#b05aff'];
// ---------- Verhalten ----------
const _updateMob5=updateMob;
updateMob=function(e,dt){ _updateMob5(e,dt); const d=MOBS[e.t]; if(!d||!d.pete||e.dead||e.sleep) return; const P=G.player; if(!P||P.dead) return;
  const dx=(P.x+P.w/2)-(e.x+e.w/2), dy=(P.y+P.h/2)-(e.y+e.h/2), ad=Math.abs(dx);
  e.mutT=(e.mutT==null?2+Math.random()*4:e.mutT)-dt; if(e.mutT<=0&&ad<16*T){ e.mutT=4+Math.random()*5; sfx(d.talk==='hippie'?'hippie':'nurse'); }
  if(d.joints){ e.jcd=(e.jcd==null?2.5:e.jcd)-dt; if(e.jcd<=0&&ad>3.5*T&&ad<11*T&&Math.abs(dy)<4*T){ e.jcd=3.2+Math.random()*1.8; e.dir=dx>0?1:-1; e.attackT=0.25; const t=0.85; const sx=e.x+e.w/2+e.dir*6, sy=e.y+12; const tx=P.x+P.w/2, ty=P.y+14;
      G.proj.push({x:sx,y:sy,vx:(tx-sx)/t,vy:(ty-sy)/t-0.5*380*t,grav:380,dmg:3,own:'e',type:'joint',life:2.6,light:0.25}); sfx('puff'); } }
  if(d.rainbow){ e.rcd=(e.rcd==null?2:e.rcd)-dt; if(e.rbT>0){ e.rbT-=dt; e.vomitT=0.2; e.vx*=0.2; const mx=e.x+e.w/2+e.dir*7, my=e.y+13;
      for(let i=0;i<3;i++) G.parts.push({x:mx,y:my,vx:e.dir*(110+Math.random()*80),vy:-20+Math.random()*50,life:0.55,col:RAINBOW[(Math.random()*6)|0],sz:2,grav:260,light:0.35});
      if(Math.random()<0.4) G.parts.push({x:mx+e.dir*Math.random()*30,y:my+Math.random()*8,vx:0,vy:-10,life:0.5,col:'#ffffff',sz:1,light:0.6});
      const inBeam=(dx*e.dir>0)&&ad<3.4*T&&Math.abs((P.y+P.h/2)-my)<2*T; e.rbHit=(e.rbHit||0)-dt; if(inBeam&&e.rbHit<=0){ e.rbHit=0.35; hurtPlayer(Math.max(1,Math.round(2*(e.dmgMul||1))),e); }
      if(e.rbT<=0) addRainbowPuddle(e.x+e.w/2+e.dir*2.2*T,e.y+e.h-2); }
    else if(e.rcd<=0&&ad<2.6*T&&Math.abs(dy)<2*T){ e.rcd=6+Math.random()*3; e.rbT=0.9; e.dir=dx>0?1:-1; sfx('rainbow'); } }
  if(d.defi){ e.dcd=(e.dcd==null?1.5:e.dcd)-dt; if(e.zapT>0){ e.zapT-=dt; e.atk=1; e.vx*=0.1; if(e.zapT<=0.25&&!e.zapped){ e.zapped=true; zapFX(e.x+e.w/2+e.dir*9,e.y+16,10);
        if((dx*e.dir>0)&&ad<2.4*T&&Math.abs(dy)<1.6*T){ hurtPlayer(Math.round(d.dmg*(e.dmgMul||1)),e); stunPlayer(1.0); } } }
    else if(e.dcd<=0&&ad<2.2*T&&Math.abs(dy)<1.6*T){ e.dcd=3.4+Math.random()*1.5; e.zapT=0.6; e.zapped=false; e.dir=dx>0?1:-1; sfx('charge'); } } };
// Angriffsframe auch während Zap/Wurf
const _frameFor5=frameFor; frameFor=function(e,isP){ if(!isP&&e&&MOBS[e.t]&&MOBS[e.t].pete){ if(e.zapT>0||e.rbT>0||e.attackT>0) return 'a1'; } return _frameFor5(e,isP); };
// ---------- Effekte ----------
function zapFX(x,y,n){ G.zaps=G.zaps||[]; for(let k=0;k<2;k++) G.zaps.push({x,y,life:0.25,seed:Math.random()*999,len:14+Math.random()*10,a:Math.random()*6.28}); for(let i=0;i<n;i++) G.parts.push({x,y,vx:(Math.random()-0.5)*180,vy:(Math.random()-0.5)*180,life:0.3,col:i%3?'#9ad8ff':'#ffffff',sz:1,light:0.7}); sfx('zap'); }
function stunPlayer(t){ const P=G.player; P.stunT=Math.max(P.stunT||0,t); msg('Elektroschock! Du bist kurz gelähmt.','#80d8ff'); }
function addRainbowPuddle(x,y){ G.rpud=G.rpud||[]; let ty=Math.floor(y/T); for(let k=0;k<4&&!isSolid(x,(ty+1)*T+1);k++) ty++; G.rpud.push({x,y:(ty+1)*T,w:22+Math.random()*8,life:10,ph:Math.random()*6}); if(G.rpud.length>8) G.rpud.shift(); sfx('splash'); }
const _updateProj5=updateProj;
updateProj=function(dt){ const P=G.player;
  for(const p of G.proj){ if(p.type!=='joint'||p.life<=0) continue; if(Math.random()<0.7) G.parts.push({x:p.x,y:p.y,vx:(Math.random()-0.5)*8,vy:-8-Math.random()*8,life:0.9,col:Math.random()<0.5?'#c8c8c8':'#9a9a9a',sz:1,grav:-6,dust:true});
    const nx=p.x+p.vx*dt, ny=p.y+p.vy*dt+(p.grav||0)*dt*dt;
    if(P&&!P.dead&&nx>P.x-2&&nx<P.x+P.w+2&&ny>P.y&&ny<P.y+P.h){ p.life=-1; smokeCloud(nx,ny); hurtPlayer(p.dmg,{x:p.x-p.vx}); G.dizzy=Math.max(G.dizzy||0,3.2); if(!G.flags.dizzyMsg){ G.flags.dizzyMsg=1; msg('Puh … eine süßliche Rauchwolke. Alles dreht sich!','#ce93d8'); } sfx('smokehit'); continue; }
    const t=tget(Math.floor(nx/T),Math.floor(ny/T)); if(TILES[t]&&TILES[t].s){ p.life=-1; smokeCloud(nx,ny-2); } }
  G.proj=G.proj.filter(p=>p.life>0); _updateProj5(dt);
  if(G.rpud){ for(const q of G.rpud){ q.life-=dt; if(Math.random()<dt*4) G.parts.push({x:q.x+(Math.random()-0.5)*q.w,y:q.y-2,vx:0,vy:-12,life:0.7,col:Math.random()<0.5?'#ffffff':RAINBOW[(Math.random()*6)|0],sz:1,light:0.4});
      if(P&&!P.dead&&Math.abs(P.x+P.w/2-q.x)<q.w/2+3&&Math.abs(P.y+P.h-q.y)<6){ q.tick=(q.tick||0)-dt; if(q.tick<=0){ q.tick=0.7; hurtPlayer(2,null); } } } G.rpud=G.rpud.filter(q=>q.life>0); }
  if(G.zaps){ for(const z of G.zaps) z.life-=dt; G.zaps=G.zaps.filter(z=>z.life>0); }
  if(G.dizzy>0) G.dizzy-=dt; if(P&&P.stunT>0){ P.stunT-=dt; P.vx*=0.5; INPUT.jumpPressed=false; if(Math.random()<0.5) G.parts.push({x:P.x+Math.random()*P.w,y:P.y+Math.random()*P.h,vx:0,vy:0,life:0.15,col:Math.random()<0.5?'#9ad8ff':'#ffffff',sz:1,light:0.6}); }
};
function smokeCloud(x,y){ for(let i=0;i<14;i++) G.parts.push({x:x+(Math.random()-0.5)*8,y:y+(Math.random()-0.5)*6,vx:(Math.random()-0.5)*40,vy:-6-Math.random()*16,life:1.2+Math.random(),col:['#d8d8d8','#b8b8b8','#a8b8a0'][i%3],sz:2+(i%2),grav:-8,dust:true}); }
// Lähmung: Eingaben blockieren
const _updatePlayer5c=updatePlayer; updatePlayer=function(dt){ const P=G.player; if(P&&P.stunT>0){ const jx=INPUT.jx, jp=INPUT.jumpPressed; INPUT.jx=0; INPUT.jumpPressed=false; _updatePlayer5c(dt); INPUT.jx=jx; return; }
  if(G.dizzy>0){ const jx=INPUT.jx; INPUT.jx=Math.max(-1,Math.min(1,jx+Math.sin(G.clock*2.3)*0.35)); _updatePlayer5c(dt); INPUT.jx=jx; return; } _updatePlayer5c(dt); };
const _attack5=typeof doAttack==='function'?doAttack:null;
// Zeichnen: Joints, Pfützen, Blitze
const _drawProj5=drawProj;
drawProj=function(ox,oy){ _drawProj5(ox,oy); for(const p of G.proj){ if(p.type!=='joint') continue; const x=Math.round(p.x+ox), y=Math.round(p.y+oy); ctx.save(); ctx.translate(x,y); ctx.rotate(G.clock*14); ctx.fillStyle='#f4efe4'; ctx.fillRect(-3,-1,6,2); ctx.fillStyle='#c8b896'; ctx.fillRect(-3,-1,1,2); ctx.fillStyle=(G.clock*20|0)%2?'#ff6a20':'#ffb040'; ctx.fillRect(3,-1,1,2); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=0.5; ctx.drawImage(LOOK.glow.warm,x-6,y-6,12,12); ctx.restore(); } };
const _drawPuddles5=drawPuddles;
drawPuddles=function(ox,oy){ _drawPuddles5(ox,oy); if(!G.rpud) return; for(const q of G.rpud){ const a=Math.min(1,q.life/2); const x=Math.round(q.x+ox), y=Math.round(q.y+oy), w=Math.round(q.w); ctx.globalAlpha=a*0.9;
    for(let i=0;i<w;i++){ const c=RAINBOW[((i+Math.floor(G.clock*8+q.ph))>>1)%6]; ctx.fillStyle=c; const h=(i<3||i>w-4)?1:2; ctx.fillRect(x-(w>>1)+i,y-h,1,h); }
    ctx.fillStyle='#ffffff'; const b=Math.floor(G.clock*5+q.ph)%w; ctx.fillRect(x-(w>>1)+b,y-3,1,1); ctx.globalAlpha=1; } };
function drawZaps(ox,oy){ const P=G.player; const list=(G.zaps||[]).slice(); if(P&&P.stunT>0) list.push({x:P.x+P.w/2,y:P.y+P.h/2,life:0.2,seed:Math.random()*999,len:16,a:Math.random()*6.28,around:true});
  if(!list.length) return; ctx.save(); ctx.globalCompositeOperation='lighter';
  for(const z of list){ const r=rngSeed((z.seed*1000)|0); for(let k=0;k<3;k++){ let x=z.x+ox, y=z.y+oy; const a=z.a+k*2.1; ctx.strokeStyle=k?'rgba(120,200,255,0.8)':'rgba(255,255,255,0.95)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,y); for(let i=0;i<5;i++){ x+=Math.cos(a)*z.len/5+(r()-0.5)*6; y+=Math.sin(a)*z.len/5+(r()-0.5)*6; ctx.lineTo(Math.round(x),Math.round(y)); } ctx.stroke(); } ctx.globalAlpha=0.5; ctx.drawImage(LOOK.glow.blue,z.x+ox-14,z.y+oy-14,28,28); ctx.globalAlpha=1; }
  ctx.restore(); }
const _drawParts5=drawParts; drawParts=function(ox,oy){ _drawParts5(ox,oy); drawZaps(ox,oy); };
// Schwindel: verschwommene, wabernde Sicht
function renderAfter5(){ if(!(G.dizzy>0)||G.state!=='play') return; const k=Math.min(1,G.dizzy/1.5); ctx.save(); ctx.globalAlpha=0.32*k; const dx=Math.sin(G.clock*3.1)*4*k, dy=Math.cos(G.clock*2.3)*2*k; ctx.drawImage(cv,Math.round(dx),Math.round(dy)); ctx.globalAlpha=0.22*k; ctx.drawImage(cv,-Math.round(dx),-Math.round(dy));
  ctx.globalAlpha=0.10*k; ctx.fillStyle=`hsl(${(G.clock*90)%360},70%,60%)`; ctx.fillRect(0,0,G.VW,G.VH); ctx.restore(); }
// ---------- Sounds ----------
SFX.hippie=function(){ const t=now(); for(let i=0;i<4;i++){ const f=95+Math.random()*30; voice(t+i*0.22,f,0.26,0.07,[[480+Math.random()*200,5,1],[900+Math.random()*300,6,0.5]],{to:f*(0.8+Math.random()*0.4),vib:4,vibD:0.06,a:0.05,rev:0.4}); } };
SFX.hippieDie=function(){ const t=now(); voice(t,120,0.9,0.12,[[520,4,1],[1000,6,0.5]],{to:60,vib:3,vibD:0.1,a:0.05,rev:0.6}); for(let i=0;i<5;i++) osc('sine',880*Math.pow(1.26,i),t+0.3+i*0.06,0.2,0.03,{rev:0.5}); };
SFX.nurse=function(){ const t=now(); voice(t,180,0.6,0.08,[[700,5,1],[1400,7,0.6]],{to:140,vib:7,vibD:0.08,a:0.08,rev:0.5}); nz(t,0.4,0.03,{f:2500,q:3}); };
SFX.nurseDie=function(){ const t=now(); voice(t,200,0.8,0.12,[[750,5,1],[1500,7,0.5]],{to:80,vib:9,vibD:0.15,a:0.03,rev:0.6}); nz(t+0.1,0.3,0.06,{f:5000,q:1.5}); };
SFX.puff=function(){ const t=now(); nz(t,0.18,0.06,{f:700,fTo:1800,q:0.8}); osc('sine',300,t+0.05,0.08,0.02,{to:180}); };
SFX.smokehit=function(){ const t=now(); nz(t,0.4,0.08,{f:600,fTo:300,q:0.6,type:'lowpass'}); nz(t+0.12,0.12,0.05,{f:1200,q:2}); nz(t+0.3,0.1,0.04,{f:1100,q:2}); };
SFX.rainbow=function(){ const t=now(); for(let i=0;i<8;i++) osc('triangle',523*Math.pow(1.1225,i),t+i*0.05,0.18,0.04,{rev:0.5}); voice(t,110,0.8,0.1,[[400,4,1],[800,5,0.6]],{to:70,vib:30,vibD:0.3,a:0.02,rev:0.4}); nz(t,0.7,0.05,{f:900,q:1.2}); };
SFX.charge=function(){ const t=now(); osc('sawtooth',300,t,0.45,0.035,{to:2400,lp:3000}); };
SFX.zap=function(){ const t=now(); nz(t,0.22,0.16,{f:3500,q:0.7,type:'highpass'}); osc('square',90,t,0.18,0.08,{to:60}); osc('sawtooth',1800,t,0.12,0.04,{to:400}); };
