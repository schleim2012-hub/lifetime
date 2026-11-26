// Lifetime – Spieler, Gegner, Aktionen, Überleben
'use strict';
const INV_N=32, HOT_N=8;
function newPlayer(x,y){ return {x:x*T+3,y:y*T-26+T,w:10,h:26,vx:0,vy:0,dir:1,onGround:false,canStep:true,hp:100,maxhp:100,hu:100,th:100,stam:100,warm:100,breath:100,xp:0,lvl:1,sp:0,sk:{staerke:0,ausdauer:0,handwerk:0,schuetze:0,pluenderer:0,ueberleben:0},
  inv:new Array(INV_N).fill(null),sel:0,cd:0,walk:0,hurtT:0,spawn:{x,y},fallY:y*T,bonusHp:0,jumps:0,glide:false,attackT:0,inv_t:0}; }
function maxHp(){ const P=G.player; return 100+P.sk.ausdauer*15+P.bonusHp; }
function maxStam(){ return 100+G.player.sk.ausdauer*15; }
function heldItem(){ const s=G.player.inv[G.player.sel]; return s?s.id:'hand'; }
function heldDef(){ return ITEMS[heldItem()]||ITEMS.hand; }
function countItem(id){ let n=0; for(const s of G.player.inv) if(s&&s.id===id) n+=s.n; return n; }
function addItem(id,n,silent,noDrop){ const P=G.player; const st=ITEMS[id].st;
  for(const s of P.inv){ if(n<=0) break; if(s&&s.id===id&&s.n<st){ const k=Math.min(n,st-s.n); s.n+=k; n-=k; } }
  for(let i=0;i<INV_N&&n>0;i++){ if(!P.inv[i]){ const k=Math.min(n,st); P.inv[i]={id,n:k}; n-=k; } }
  if(n>0&&!noDrop){ spawnDrop(id,n,P.x+P.w/2,P.y); G.drops[G.drops.length-1].t=-3; n=0; }
  if(!silent) UI.refreshHot(); return n; }
function removeItem(id,n){ const P=G.player; for(let i=INV_N-1;i>=0&&n>0;i--){ const s=P.inv[i]; if(s&&s.id===id){ const k=Math.min(n,s.n); s.n-=k; n-=k; if(s.n<=0) P.inv[i]=null; } } UI.refreshHot(); }
function armorStats(){ const best={}; for(const s of G.player.inv){ if(!s) continue; const d=ITEMS[s.id]; if(d.type==='armor'){ const c=best[d.slot]; if(!c||(d.def+d.warm/3)>(c.def+c.warm/3)) best[d.slot]=d; } } let def=0,warm=0,wings=false; for(const k in best){ def+=best[k].def; warm+=best[k].warm; if(best[k].wings) wings=true; } return {def,warm,wings,best}; }
function msg(t,col){ G.msgs.push({t,col:col||'#fff',life:4}); if(G.msgs.length>5) G.msgs.shift(); UI.msgs(); }
function gainXP(n){ const P=G.player; P.xp+=n; let need=xpNeed(P.lvl); while(P.xp>=need){ P.xp-=need; P.lvl++; P.sp++; msg(`Stufe ${P.lvl}! +1 Skillpunkt`,'#ffd54f'); sfx('level'); need=xpNeed(P.lvl);} }
function xpNeed(l){ return Math.round(80*Math.pow(l,1.35)); }
function spawnDrop(id,n,x,y){ G.drops.push({id,n,x:x-4,y:y-4,w:8,h:8,vx:(Math.random()-0.5)*60,vy:-120,t:0}); }
function num(x,y,t,col){ G.nums.push({x,y,t:String(t),col:col||'#fff',life:0.9}); }
function partBurst(x,y,col,n,spd){ for(let i=0;i<(n||6);i++) G.parts.push({x,y,vx:(Math.random()-0.5)*(spd||120),vy:-Math.random()*(spd||120),life:0.4+Math.random()*0.4,col,sz:Math.random()<0.5?1:2,grav:400}); }
function dist(a,b){ const dx=(a.x+a.w/2)-(b.x+b.w/2), dy=(a.y+a.h/2)-(b.y+b.h/2); return Math.sqrt(dx*dx+dy*dy); }
function nearStation(st){ if(st==='hand') return true; const P=G.player; const cx=Math.floor((P.x+P.w/2)/T), cy=Math.floor((P.y+P.h/2)/T); for(let y=cy-4;y<=cy+4;y++)for(let x=cx-5;x<=cx+5;x++){ const d=TILES[tget(x,y)]; if(d&&d.station===st) return true; } return false; }
// ---- Entitäten ----
function makeMob(t,tx,ty,o){ const d=MOBS[t]; const e=Object.assign({kind:'mob',t,x:tx*T+T/2-d.w/2,y:(ty+1)*T-d.h,w:d.w,h:d.h,vx:0,vy:0,dir:Math.random()<0.5?1:-1,hp:d.hp,maxhp:d.hp,canStep:!d.fly,cd:1,walk:0,stuck:0,ai:0,hurtT:0,sleep:false},o||{});
  if(e.rad){ e.hp*=2; e.maxhp=e.hp; } return e; }
function makeNPC(id,tx,ty){ const d=NPCS[id]; return {kind:'npc',t:id,x:tx*T+3,y:(ty+1)*T-26,w:10,h:26,vx:0,vy:0,dir:-1,hp:d.hp,maxhp:d.hp,canStep:true,walk:0,cd:0,home:{x:tx,y:ty},mode:'home',trust:0,met:false,down:0,ai:0}; }
function hostile(e){ if(e.kind!=='mob') return false; const d=MOBS[e.t]; if(d.animal) return false; if(d.cann) return G.cannAngry>0; return true; }
function hurtMob(e,dmg,src,kb){ if(e.dead) return; const d=MOBS[e.t]; if(e.kind==='npc'){ return; }
  if(d.cann&&G.cannAngry<=0){ G.cannAngry=2; msg('Die Kannibalen sind jetzt feindlich!','#ff5252'); }
  e.sleep=false; e.hp-=dmg; e.hurtT=0.2; num(e.x+e.w/2,e.y,Math.round(dmg),'#ffeb3b'); partBurst(e.x+e.w/2,e.y+e.h/3,d.animal?'#a33':'#7a0000',5); sfx('hit');
  if(kb&&!d.boss){ e.vx=kb*(src&&src.x<e.x?1:-1); e.vy=-120; }
  if(d.animal) e.flee=3;
  if(e.hp<=0) killMob(e,src); }
function killMob(e,src){ e.dead=true; const d=MOBS[e.t]; partBurst(e.x+e.w/2,e.y+e.h/2,'#7a0000',14,180);
  if(src===G.player||src==='player'){ gainXP(Math.round(d.xp*(e.rad?1.8:1))); G.stats.kills++; }
  if(d.drop) for(const [id,n] of d.drop) spawnDrop(id,n,e.x+e.w/2,e.y);
  if(d.zombie){ const r=Math.random(); if(r<0.25) spawnDrop('stoff',1,e.x+e.w/2,e.y); else if(r<0.35) spawnDrop('kronkorken',1+Math.random()*4|0,e.x+e.w/2,e.y); else if(r<0.4) spawnDrop(['konserve','verband','muni','cola'][Math.random()*4|0],1,e.x+e.w/2,e.y); if(e.t==='geier') spawnDrop('federn',2,e.x,e.y); if(e.t==='brandmeister'&&Math.random()<0.15) spawnDrop('helm',1,e.x,e.y); if(e.t==='bulle'&&Math.random()<0.1) spawnDrop('polizeiweste',1,e.x,e.y); }
  if(d.human){ spawnDrop('kronkorken',3+Math.random()*8|0,e.x,e.y); if(d.gang){ if(Math.random()<0.5) spawnDrop('muni',3+Math.random()*6|0,e.x,e.y); if(Math.random()<0.2) spawnDrop('pistole',1,e.x,e.y);} if(d.cann){ spawnDrop('knochen',2,e.x,e.y); if(Math.random()<0.4) spawnDrop('kekse',1,e.x,e.y);} }
  if(e.camp!=null){ const left=G.ents.filter(o=>!o.dead&&o.camp===e.camp).length; const c=G.w.feat.camps[e.camp]; if(left===0&&c&&!c.cleared){ c.cleared=true; msg(`${c.name} überfallen! Die Kisten gehören dir.`,'#69f0ae'); gainXP(250); sfx('level'); } }
  if(d.mutant) { msg(`${d.n} besiegt! Es hinterlässt etwas Besonderes.`,'#e040fb'); }
  if(d.boss){ msg(`${d.n} ist besiegt!`,'#ffd54f'); G.boss=null; G.flags=G.flags||{}; G.flags['boss_'+e.t]=true; sfx('level'); }
  if(e.bm) G.bmKills++;
}
function hurtPlayer(dmg,src){ const P=G.player; if(P.inv_t>0||P.dead) return; const a=armorStats(); const red=Math.max(1,dmg-a.def*0.5); P.hp-=red; P.inv_t=0.5; P.hurtT=0.25; num(P.x+P.w/2,P.y,Math.round(red),'#ff5252'); partBurst(P.x+P.w/2,P.y+10,'#9a0000',5); sfx('hurt'); G.cam.shake=Math.max(G.cam.shake,3);
  if(src){ P.vx=(src.x<P.x?1:-1)*150; P.vy=-140; }
  if(P.hp<=0) die(); }
function die(){ const P=G.player; P.dead=true; P.hp=0; UI.death(); }
function respawn(){ const P=G.player; P.dead=false; P.hp=Math.round(maxHp()*0.6); P.hu=Math.max(P.hu,50); P.th=Math.max(P.th,50); P.warm=80; P.stam=maxStam(); P.x=P.spawn.x*T+3; P.y=(P.spawn.y+1)*T-P.h; P.vx=P.vy=0; P.fallY=P.y; const k=countItem('kronkorken'); if(k>0){ removeItem('kronkorken',Math.ceil(k/2)); msg(`Du hast ${Math.ceil(k/2)} Kronkorken verloren.`,'#ff8a80'); } }
// ---- Aktionen ----
function reachOK(tx,ty,r){ const P=G.player; const cx=(P.x+P.w/2)/T, cy=(P.y+P.h/2)/T; return Math.hypot(tx+0.5-cx,ty+0.5-cy)<=r; }
function entAt(px,py,pad){ pad=pad||4; for(const e of G.ents){ if(e.dead) continue; if(px>=e.x-pad&&px<=e.x+e.w+pad&&py>=e.y-pad&&py<=e.y+e.h+pad) return e; } return null; }
function interactAt(tx,ty,wx,wy){ // gibt true zurück, wenn interagiert wurde
  const P=G.player; const e=wx!=null?entAt(wx,wy,6):null;
  if(e&&e.kind==='npc'&&dist(e,P)<4*T){ UI.talk(e); return true; }
  if(e&&e.kind==='mob'&&MOBS[e.t].cann&&G.cannAngry<=0&&dist(e,P)<4*T){ UI.toastTalk(e); return true; }
  const t=tget(tx,ty), d=TILES[t]; if(!reachOK(tx,ty,5.5)) return false;
  if(d.door){ toggleDoor(tx,ty); return true; }
  if(d.chest||d.loot){ openContainer(tx,ty); return true; }
  if(d.station==='tonne'){ if(countItem('flasche')>0){ removeItem('flasche',1); addItem('wasser',1); msg('Regenwasser abgefüllt – sauber!','#80d8ff'); sfx('drink'); } else msg('Du brauchst eine leere Flasche.'); return true; }
  if(d.station){ UI.open('craft'); return true; }
  if(d.bed){ useBed(tx,ty); return true; }
  return false; }
function toggleDoor(tx,ty){ let y=ty; while(TILES[tget(tx,y-1)].door) y--; const open=tget(tx,y)===19; const nt=open?20:19;
  if(!open){ // schließen nur, wenn niemand drin steht
    const box={x:tx*T,y:y*T,w:T,h:2*T}; for(const e of [G.player,...G.ents]) if(!e.dead&&e.x<box.x+box.w&&e.x+e.w>box.x&&e.y<box.y+box.h&&e.y+e.h>box.y) return; }
  for(let k=y;TILES[tget(tx,k)].door;k++) tset(tx,k,nt); sfx('door'); }
function useBed(tx,ty){ const P=G.player; P.spawn={x:tx,y:ty}; msg('Hier wachst du ab jetzt auf.','#a5d6a7');
  if(isNight()){ if(G.bloodmoon){ msg('Beim Blutmond kann niemand schlafen!','#ff5252'); return; } const near=G.ents.some(e=>!e.dead&&hostile(e)&&dist(e,P)<14*T); if(near){ msg('Du kannst nicht schlafen, Gegner sind in der Nähe.'); return; }
    const h=hour(); let add=((29-h)%24)/24; G.time+=add; if(G.time>=1){ G.time-=1; newDay(); } P.hu-=10; P.th-=12; P.hp=Math.min(maxHp(),P.hp+30); msg('Du hast geschlafen. Guten Morgen!','#fff59d'); UI.fade(); } }
function openContainer(tx,ty){ const key=tx+','+ty; const t=tget(tx,ty), d=TILES[t];
  if(d.cann&&G.cannAngry<=0){ G.cannAngry=2; msg('Du plünderst die Kannibalen – sie werden wütend!','#ff5252'); }
  if(t===44){ const c=G.w.feat.camps.find(c=>tx>=c.x0-2&&tx<=c.x1+2); if(c&&!c.cleared&&G.ents.some(e=>!e.dead&&e.camp===c.id&&dist(e,G.player)<20*T)) msg('Die Sumpfbrüder sehen dich – Überfall!','#ff5252'); }
  if(!G.containers[key]){ const arr=[]; if(d.loot){ let tab=LOOT[d.loot]; if(t===29&&G.w.feat.wreck&&Math.abs(tx-G.w.feat.wreck.x)<12&&Math.abs(ty-G.w.feat.wreck.y)<4) tab=LOOT.wrack; else if(t===29&&ty<surfaceY(tx)+1&&isRoof(tx,ty)) tab=LOOT.dach;
      const bonus=1+G.player.sk.pluenderer*0.25; if(tab===LOOT.wrack){ if(G.flags.notaxt) tab=tab.filter(r=>r[0]!=='notaxt'); G.flags.notaxt=true; } for(const [id,a,b,ch] of tab){ if(Math.random()<Math.min(1,ch*bonus)){ arr.push({id,n:a+Math.floor(Math.random()*(b-a+1))}); } }
      if(!arr.length) arr.push({id:'stoff',n:1}); if(t===38){ msg('Das geheime Lager! Jackpot!','#ffd54f'); gainXP(300); sfx('level'); } }
    G.containers[key]=arr; }
  UI.openContainer(key, d.n); }
function isRoof(tx,ty){ for(const tw of G.w.feat.towers){ if(tx>=tw.x0&&tx<tw.x1&&ty===tw.top-1) return true; } return false; }
function canPlaceAt(tx,ty,id){ const d=ITEMS[id]; const t=tget(tx,ty); if(d.type==='wall'){ return bget(tx,ty)===0&&(t===0||!TILES[t].s); }
  if(!(t===0||t===5||t===35)) return false; if(tx<1||ty<1||tx>=G.w.W-1||ty>=G.w.H-1) return false;
  const bt=TILES[d.tile]; const P=G.player; const box={x:tx*T,y:ty*T,w:T,h:T*(d.tile===19?2:1)};
  if(bt.s||d.tile===19){ for(const e of [P,...G.ents]) if(!e.dead&&e.x<box.x+box.w&&e.x+e.w>box.x&&e.y<box.y+box.h&&e.y+e.h>box.y) return false; }
  if(d.tile===19){ if(tget(tx,ty+1)!==0&&tget(tx,ty+1)!==5) { /* Tür von oben nach unten */ } }
  // Nachbar nötig
  const nb=[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{ const n=tget(tx+a,ty+b); return n&&n!==5&&n!==35; })||bget(tx,ty)>0;
  return nb; }
function placeAt(tx,ty){ const id=heldItem(); const d=ITEMS[id]; if(!d||(d.type!=='block'&&d.type!=='wall')) return false; if(!reachOK(tx,ty,6.5)) return false;
  if(d.type==='wall'){ if(!canPlaceAt(tx,ty,id)) return false; bset(tx,ty,d.wall); removeItem(id,1); sfx('place'); return true; }
  if(d.tile===19){ // Tür braucht 2 Felder
    let y=ty; if(!(tget(tx,y+1)===0)) y=ty-1; if(tget(tx,y)!==0||tget(tx,y+1)!==0) return false; const P=G.player; const box={x:tx*T,y:y*T,w:T,h:2*T}; if(P.x<box.x+box.w&&P.x+P.w>box.x&&P.y<box.y+box.h&&P.y+P.h>box.y) return false;
    tset(tx,y,19); tset(tx,y+1,19); removeItem(id,1); sfx('place'); return true; }
  if(!canPlaceAt(tx,ty,id)) return false; tset(tx,ty,d.tile); removeItem(id,1); sfx('place');
  if(d.tile===28){ G.player.spawn={x:tx,y:ty}; msg('Bett aufgestellt: Hier wachst du ab jetzt auf.','#a5d6a7'); }
  if(d.tile===22&&!G.flags.fire){ G.flags.fire=true; msg('Ein Feuer! Wärme, Licht und Kochen (Rucksack → Herstellen).','#ffcc80'); }
  return true; }
function mineTick(tx,ty,dt){ const t=tget(tx,ty); const d=TILES[t]; if(!t||t===5||d.tool==='none') { G.mineT=null; return false; } if(!reachOK(tx,ty,5)) { G.mineT=null; return false; }
  const P=G.player; const it=heldDef(); const tools=it.tool||(it.type==='weapon'?{hand:1,axe:0.6}:{}); let pw=tools[d.tool]; if(!pw){ pw=d.tool==='hand'?(tools.hand||1):(tools.hand?0.12:0.1); }
  if(d.tool==='pick'&&!tools.pick&&d.h>=3&&it.id!=='hand'){ pw=0.1; }
  pw*=1+P.sk.staerke*0.15; if(P.stam<5) pw*=0.5;
  if(!G.mineT||G.mineT.x!==tx||G.mineT.y!==ty) G.mineT={x:tx,y:ty,p:0,snd:0};
  G.mineT.p+=dt*pw/(d.h*0.55); G.mineT.snd-=dt; P.stam-=dt*5; P.attackT=0.2;
  if(G.mineT.snd<=0){ G.mineT.snd=0.25; sfx(d.tool==='axe'?'chop':d.tool==='pick'?'mine':'hit'); partBurst(tx*T+8,ty*T+8,d.c,3,80); }
  if(d.tool==='pick'&&!tools.pick&&d.h>=3&&!G.flags.pickHint){ G.flags.pickHint=true; msg('Ohne Spitzhacke geht das kaum. Bau dir eine (Steinchen sammeln)!','#ffcc80'); }
  if(G.mineT.p>=1){ breakTile(tx,ty,true); G.mineT=null; } return true; }
function breakTile(tx,ty,byPlayer){ const t=tget(tx,ty), d=TILES[t]; if(!t||t===17) return;
  if(d.cann&&byPlayer&&G.cannAngry<=0){ G.cannAngry=2; msg('Du zerstörst Kannibalen-Sachen – sie werden wütend!','#ff5252'); }
  if(d.tree){ fellTree(tx,ty); return; }
  if(d.door){ let y=ty; while(TILES[tget(tx,y-1)].door) y--; let n=0; for(let k=y;TILES[tget(tx,k)].door;k++){ tset(tx,k,0); n++; } if(byPlayer) spawnDrop('tuer',1,tx*T+8,ty*T); sfx('brk'); return; }
  if(d.chest||d.loot){ const key=tx+','+ty; const c=G.containers[key]; if(c) for(const s of c) spawnDrop(s.id,s.n,tx*T+8,ty*T); delete G.containers[key]; }
  tset(tx,ty,0); sfx('brk'); partBurst(tx*T+8,ty*T+8,d.c,8,120);
  if(byPlayer&&d.drop) spawnDrop(d.drop[0],d.drop[1],tx*T+8,ty*T+6);
  if(byPlayer&&t===12&&Math.random()<0.5) spawnDrop('glas',1,tx*T+8,ty*T);
  if(byPlayer&&t===7&&Math.random()<0.15) spawnDrop('faser',1,tx*T+8,ty*T);
  if(byPlayer&&t===31&&Math.random()<0.4) spawnDrop('faser',1,tx*T+8,ty*T);
  if(byPlayer&&t===30&&Math.random()<0.3) spawnDrop('glas',1,tx*T+8,ty*T);
  // Darüberliegende "lose" Dinge fallen ab
  const up=tget(tx,ty-1), ud=TILES[up]; if(up&&!ud.s&&!ud.tree&&up!==5&&up!==18&&!ud.door&&!ud.plat) breakTile(tx,ty-1,true);
  if(up===6) fellTree(tx,ty-1);
}
function fellTree(tx,ty){ const seen=new Set(); const st=[[tx,ty]]; let logs=0,leaves=0;
  while(st.length&&seen.size<300){ const [x,y]=st.pop(); const k=x+','+y; if(seen.has(k)) continue; const t=tget(x,y); if(t!==6&&t!==7) continue; if(y>ty) continue; seen.add(k); if(t===6) logs++; else leaves++; tset(x,y,0);
    st.push([x,y-1],[x-1,y],[x+1,y]); if(t===7) st.push([x,y+1]); }
  spawnDrop('holz',logs*2,tx*T+8,ty*T); if(leaves>4&&Math.random()<0.6) spawnDrop('faser',1+Math.random()*3|0,tx*T+8,ty*T-20); if(Math.random()<0.3) spawnDrop('beeren',1,tx*T,ty*T-10);
  sfx('brk'); G.cam.shake=2; partBurst(tx*T+8,ty*T-20,'#2f7a2f',16,150); if(!G.flags.tree){ G.flags.tree=true; msg('Holz! Öffne den Rucksack und stell dir eine Steinaxt her.','#ffcc80'); } }
function dmgTile(tx,ty,amt){ const t=tget(tx,ty), d=TILES[t]; if(!t||t===5||t===17||!d) return; const i=ty*G.w.W+tx; const hpMax=d.h*25; const v=(G.dmg.get(i)||0)+amt; partBurst(tx*T+8,ty*T+8,d.c,2,60); if(v>=hpMax){ breakTile(tx,ty,false); } else G.dmg.set(i,v); }
// Angriff/Benutzen mit gehaltenem Item in Richtung eines Weltpunktes (wx,wy) oder automatisch (wx=null)
function useHeld(dt,wx,wy,fresh){ const P=G.player; if(P.dead) return; const id=heldItem(); const d=ITEMS[id]||ITEMS.hand; P.cd-=0; 
  // Ziel bestimmen
  const cx=P.x+P.w/2, cy=P.y+10;
  if(d.type==='food'){ if(fresh) eat(id); return; }
  if(d.type==='summon'){ if(fresh) summon(id); return; }
  if(d.type==='ammo'||d.type==='misc'){ if(fresh&&id==='funkgeraet') radio(); return; }
  if(id==='flasche'){ if(fresh) fillBottle(wx,wy); return; }
  if(d.type==='block'||d.type==='wall'){ let tx,ty; if(wx!=null){ tx=Math.floor(wx/T); ty=Math.floor(wy/T);} else { const t=frontTile(true); tx=t.x; ty=t.y; } if(P.cd<=0&&placeAt(tx,ty)) P.cd=0.12; return; }
  if(d.ranged||d.type==='throw'){ if(P.cd>0) return; let tx=wx,ty=wy; if(tx==null){ const e=nearestHostile(16*T); if(e){ tx=e.x+e.w/2; ty=e.y+e.h/2; } else { tx=cx+P.dir*100; ty=cy; } } P.dir=tx>cx?1:-1; fireAt(d,tx,ty); return; }
  // Nahkampf / Abbauen
  let target=null; const reach=(d.reach||2)*T;
  if(wx!=null){ const e=entAt(wx,wy,8); if(e&&(hostile(e)||MOBS[e.t]&&(MOBS[e.t].animal||MOBS[e.t].cann))&&dist(e,P)<reach+T) target=e; }
  else target=nearestHostile(reach+6,true);
  if(target){ if(P.cd<=0){ P.dir=target.x>P.x?1:-1; const sk=1+P.sk.staerke*0.15; let dm=d.dmg*sk*(P.stam<5?0.5:1); if(id==='zwillingsklinge') dm*=1; hurtMob(target,dm,P,d.kb?260:110); if(id==='zwillingsklinge') setTimeout(()=>{ if(!target.dead) hurtMob(target,dm*0.5,P,0); },120); P.cd=d.rate; P.stam-=4; P.attackT=0.2; } G.mineT=null; return; }
  let tx,ty; if(wx!=null){ tx=Math.floor(wx/T); ty=Math.floor(wy/T); } else { const t=frontTile(false); if(!t){ if(P.cd<=0){ P.attackT=0.2; P.cd=d.rate; sfx('jump'); } return; } tx=t.x; ty=t.y; }
  if(tget(tx,ty)===0||tget(tx,ty)===5){ if(bget(tx,ty)&&reachOK(tx,ty,5)&&bget(tx,ty)<6&&d.tool&&(d.tool.pick||d.tool.axe)){ // Hintergrundwand abbauen
      G.wallT=G.wallT&&G.wallT.x===tx&&G.wallT.y===ty?G.wallT:{x:tx,y:ty,p:0}; G.wallT.p+=dt*2; P.attackT=0.2; if(G.wallT.p>=1){ const b=bget(tx,ty); bset(tx,ty,0); const it=WALLS[b].item; if(it) spawnDrop(it,1,tx*T+8,ty*T+8); sfx('brk'); G.wallT=null; } }
    return; }
  mineTick(tx,ty,dt); }
function frontTile(place){ const P=G.player; const fx=Math.floor((P.x+P.w/2)/T); const fy=Math.floor((P.y+P.h-1)/T); const jy=INPUT.jy;
  if(jy>0.5){ return {x:fx,y:fy+1}; } if(jy<-0.5){ return {x:fx,y:Math.floor((P.y-2)/T)}; }
  const nx=fx+P.dir;
  if(place){ for(const y of [fy,fy-1,fy+1]){ if(canPlaceAt(nx,y,heldItem())) return {x:nx,y}; } return {x:nx,y:fy}; }
  for(const y of [fy-1,fy,fy+1]){ const t=tget(nx,y); if(t&&t!==5) return {x:nx,y}; }
  // Bäume vor der Figur
  return null; }
function nearestHostile(r,front){ const P=G.player; let best=null,bd=r; for(const e of G.ents){ if(e.dead||e.kind!=='mob') continue; const d=MOBS[e.t]; if(!(hostile(e)||d.animal)) continue; const dd=dist(e,P); if(dd<bd){ if(front&&((e.x+e.w/2)-(P.x+P.w/2))*P.dir<-8&&dd>14) continue; bd=dd; best=e; } } return best; }
function fireAt(d,tx,ty){ const P=G.player; const cx=P.x+P.w/2, cy=P.y+9;
  if(d.ranged){ const am=d.ranged.ammo; if(countItem(am)<=0){ msg(`Keine Munition (${ITEMS[am].n}).`,'#ff8a80'); P.cd=0.5; return; } removeItem(am,1);
    const n=d.ranged.pellets||1; const ang=Math.atan2(ty-cy,tx-cx); const sk=1+P.sk.schuetze*0.15;
    for(let i=0;i<n;i++){ const a=ang+(n>1?(Math.random()-0.5)*d.ranged.spread:0); G.proj.push({x:cx,y:cy,vx:Math.cos(a)*d.ranged.spd,vy:Math.sin(a)*d.ranged.spd,grav:d.ranged.grav,dmg:d.dmg*sk,own:'p',type:am==='pfeil'?'arrow':'bullet',life:1.5}); }
    sfx(am==='pfeil'?'bow':n>1?'shotgun':'shoot'); P.cd=d.rate; P.attackT=0.15; if(am!=='pfeil') G.cam.shake=Math.max(G.cam.shake,2); return; }
  // Wurf
  removeItem(d.id,1); const dx=tx-cx, dy=ty-cy; const tt=0.8; G.proj.push({x:cx,y:cy,vx:dx/tt,vy:dy/tt-0.5*500*tt,grav:500,dmg:d.dmg,own:'p',type:d.id,life:3,light:d.id==='molotow'?0.6:0}); P.cd=d.rate; sfx('bow'); }
function eat(id){ const P=G.player; const d=ITEMS[id]; const f=d.food; if(f.maxhp){ P.bonusHp+=f.maxhp; P.hp+=f.maxhp; msg('Du fühlst dich stärker! +20 max. Gesundheit','#ff8a80'); }
  P.hu=Math.min(100,P.hu+(f.hu||0)); P.th=Math.max(0,Math.min(100,P.th+(f.th||0))); P.hp=Math.min(maxHp(),P.hp+(f.hp||0)); P.stam=Math.min(maxStam(),P.stam+(f.st||0)); if(f.wa) P.warm=Math.min(100,P.warm+f.wa);
  if((f.hp||0)<0){ msg('Bäh! Dir ist übel.','#c5e1a5'); }
  removeItem(id,1); if(d.back) addItem(d.back,1); sfx(f.th>f.hu||id.includes('wasser')||id==='tee'?'drink':'eat'); }
function fillBottle(wx,wy){ const P=G.player; let found=false; const cx=Math.floor((P.x+P.w/2)/T), cy=Math.floor((P.y+P.h/2)/T); for(let y=cy-2;y<=cy+3&&!found;y++)for(let x=cx-3;x<=cx+3;x++){ if(tget(x,y)===5){ found=true; break;} if(TILES[tget(x,y)].station==='tonne'){ removeItem('flasche',1); addItem('wasser',1); msg('Regenwasser abgefüllt – sauber!','#80d8ff'); sfx('drink'); return; } }
  if(found){ removeItem('flasche',1); addItem('wasser_dreckig',1); msg('Schmutziges Wasser. Am Lagerfeuer abkochen!','#80d8ff'); sfx('splash'); } else msg('Hier ist kein Wasser. Geh zu einem See oder einer Regentonne.'); }
function radio(){ const lines=['…kkhh… hier spricht der Sender Neue Hoffnung… Überlebende sammeln sich… kkhh…','…die Armee hat das Gebiet aufgegeben… kkrr…','…hört jemand mit? Der Mond wird wieder rot… kkhh…','…Musikwunsch für alle da draußen: Lied Nummer 28… kkhh…']; msg(lines[Math.random()*lines.length|0],'#b2dfdb'); }
function summon(id){ const d=ITEMS[id]; const P=G.player; if(G.boss&&!G.boss.dead){ msg('Ein Boss ist schon da!'); return; }
  if(d.boss==='fleischberg'&&!isNight()){ msg('Die Opfergabe wirkt nur nachts.','#ff8a80'); return; }
  removeItem(id,1); const b=makeMob(d.boss,Math.floor(P.x/T)+(Math.random()<0.5?-25:25),Math.floor(P.y/T)-15,{boss:true,phase:0,pt:2}); b.canStep=false; G.ents.push(b); G.boss=b; msg(`${MOBS[d.boss].n} ist erwacht!`,'#ff1744'); sfx('roar'); G.cam.shake=8; }
