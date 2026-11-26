// Lifetime – Update-Schleife, KI, Spawns, Überleben
'use strict';
const INPUT={jx:0,jy:0,jump:false,jumpPressed:false,act:false,actFresh:false,aim:null,aimFresh:false,keys:{}};
const GRAV=900;
function updatePlayer(dt){ const P=G.player; if(P.dead) return;
  const wet=inWater(P), head=inWater(P,true), lad=onLadder(P); const a=armorStats();
  const spd=95*(P.stam<5?0.7:1)*(wet?0.6:1)*SKILLFX.speed()*(1+(a.speed||0));
  const jx=INPUT.jx; P.vx+=((jx*spd)-P.vx)*Math.min(1,dt*(P.onGround?14:6));
  if(Math.abs(jx)>0.2) P.dir=jx>0?1:-1;
  P.dropPlat=INPUT.jy>0.6;
  if(lad&&Math.abs(INPUT.jy)>0.3){ P.climb=true; } if(!lad) P.climb=false;
  if(P.climb){ P.vy=INPUT.jy*90; if(INPUT.jumpPressed){ P.climb=false; P.vy=-220; } }
  else if(wet){ P.vy=Math.min(P.vy+GRAV*0.3*dt,70); if(INPUT.jump) P.vy=Math.max(P.vy-500*dt,-130); }
  else { P.vy=Math.min(P.vy+GRAV*dt,520);
    if(P.onGround){ P.jumps=0; P.glide=false; }
    if(INPUT.jumpPressed){ if(P.onGround){ P.vy=-305; P.stam-=3; sfx('jump'); P.jumps=1; } else if(a.wings&&P.jumps<2){ P.vy=-290; P.jumps=2; sfx('jump'); partBurst(P.x+P.w/2,P.y+P.h,'#ccc',6); } }
    if(a.wings&&INPUT.jump&&P.vy>40&&!P.onGround){ P.vy=40; }
  }
  if(INPUT.jy<-0.6&&P.onGround&&!lad&&!INPUT.jumpHeldUp){ /* hoch = springen */ P.vy=-305; P.stam-=3; sfx('jump'); INPUT.jumpHeldUp=true; }
  if(INPUT.jy>-0.3) INPUT.jumpHeldUp=false;
  INPUT.jumpPressed=false;
  const vyBefore=P.vy; moveBody(P,dt);
  // Fallschaden
  if(P.onGround||P.climb||wet){ const fell=(P.y-P.fallY)/T; if(fell>11&&!wet&&!P.climb) { hurtPlayer(Math.round((fell-11)*6)); msg('Autsch! Zu tief gefallen.'); } P.fallY=P.y; } else if(P.vy<=0||a.wings&&INPUT.jump) P.fallY=P.y;
  if(Math.abs(P.vx)>10&&P.onGround) P.walk+=dt*Math.abs(P.vx)*0.12; else P.walk=0;
  // Atem
  if(head){ P.breath-=dt*10; if(P.breath<=0){ P.breath=0; P.drownT=(P.drownT||0)+dt; if(P.drownT>1){ P.drownT=0; hurtPlayer(10); msg('Du ertrinkst!','#80d8ff'); } } } else P.breath=Math.min(100,P.breath+dt*40);
  // Fallen (eigene Stacheln verletzen nicht)
  P.cd-=dt; P.inv_t-=dt; P.hurtT-=dt; P.attackT-=dt;
  // Item-Benutzung
  if(INPUT.aim){ if(INPUT.aimFresh) INPUT.aimItem=heldItem(); if(heldItem()===INPUT.aimItem) useHeld(dt,INPUT.aim.x,INPUT.aim.y,INPUT.aimFresh); INPUT.aimFresh=false; }
  else if(INPUT.act){ if(INPUT.actFresh) INPUT.actItem=heldItem(); if(heldItem()===INPUT.actItem) useHeld(dt,null,null,INPUT.actFresh); INPUT.actFresh=false; }
  else G.mineT=null;
  // Ausdauer
  const acting=INPUT.act||INPUT.aim; P.stam=Math.max(0,Math.min(maxStam(),P.stam+(acting?2:14)*dt*(P.hu<15?0.4:1)*(P.warm<=0?0.5:1)));
  // Welt-Grenzen
  P.x=Math.max(3*T,Math.min((G.w.W-4)*T,P.x)); if(P.y>(G.w.H-4)*T) P.y=(G.w.H-4)*T;
  // Erkunden
  const ex=Math.floor(P.x/T/8), ey=Math.floor(P.y/T/8); for(let a1=-3;a1<=3;a1++)for(let b=-2;b<=2;b++){ const k=(ey+b)*EXS()+(ex+a1); if(k>=0) G.explored[k]=1; }
}
function survival(dt){ const P=G.player; if(P.dead) return; const ue=(1-P.sk.ueberleben*0.12)*SKILLFX.hunger();
  P.hu=Math.max(0,P.hu-dt*0.1*ue); P.th=Math.max(0,P.th-dt*0.145*ue);
  if(P.hu<=0||P.th<=0){ P.starveT=(P.starveT||0)+dt; if(P.starveT>1){ P.starveT=0; P.hp-=1; if(P.hp<=0) die(); } }
  else if(P.hu>60&&P.th>60&&P.hp<maxHp()){ P.hp=Math.min(maxHp(),P.hp+dt*0.6); }
  // Temperatur
  const tx=Math.floor((P.x+P.w/2)/T), ty=Math.floor((P.y+P.h/2)/T); let temp=isNight()?3:17; if(G.bloodmoon) temp=1;
  const depth=ty-G.w.sky[tx]; if(depth>14) temp=12;
  if(inWater(P)) temp-=12;
  if(bget(tx,ty)&&ty>=G.w.sky[tx]) temp+=7;
  let fire=false; for(let y=ty-3;y<=ty+3&&!fire;y++)for(let x=tx-4;x<=tx+4;x++){ if(TILES[tget(x,y)].warm){ fire=true; break; } } if(fire) temp+=22;
  temp+=armorStats().warm/4; G.temp=temp;
  if(temp<10) P.warm=Math.max(0,P.warm-(10-temp)*0.1*dt*ue); else P.warm=Math.min(100,P.warm+dt*3);
  if(P.warm<=0){ P.coldT=(P.coldT||0)+dt; if(P.coldT>1.25){ P.coldT=0; P.hp-=1; if(P.hp<=0) die(); } if(!G.flags.coldMsg){ G.flags.coldMsg=true; msg('Du erfrierst! Feuer, Kleidung oder ein Haus helfen.','#80d8ff'); } }
  if(P.hp>maxHp()) P.hp=maxHp();
}
// ---- Zeit ----
function newDay(){ G.day++; G.stats.days++; if(G.cannAngry>0) { G.cannAngry--; if(G.cannAngry<=0) msg('Die Kannibalen haben sich beruhigt.','#a5d6a7'); }
  msg(`Tag ${G.day}`,'#fff59d');
  for(const e of G.ents){ if(e.kind==='npc'&&e.recruited&&NPCS[e.t].skill==='bauen'){ addItem('holz',4); addItem('stein',3); msg(`${NPCS[e.t].n} hat Holz und Stein gesammelt.`,'#a5d6a7'); } }
  saveGame(true); }
function updateTime(dt){ const before=hour(); G.time+=dt/DAYLEN; if(G.time>=1){ G.time-=1; newDay(); } const h=hour();
  const bmDay=G.day%7===0; 
  if(!G.bloodmoon&&bmDay&&h>=20&&!G.flags['bm'+G.day]){ G.flags['bm'+G.day]=true; G.bloodmoon=true; G.bmSpawned=0; G.bmKills=0; msg('BLUTMOND! Die Horde kommt!','#ff1744'); sfx('scream'); G.cam.shake=6; }
  if(G.bloodmoon&&h>=5&&h<12){ G.bloodmoon=false; msg('Du hast den Blutmond überlebt!','#69f0ae'); gainXP(150+G.day*10); sfx('level'); for(const e of G.ents) if(e.bm&&!e.dead){ e.bm=false; } }
  if(bmDay&&h>=18&&h<20&&!G.flags['bmwarn'+G.day]){ G.flags['bmwarn'+G.day]=true; msg('Der Himmel färbt sich rot … heute Nacht ist Blutmond!','#ff5252'); }
}
// ---- Spawns ----
let spawnT=0;
function spawnLogic(dt){ spawnT-=dt; if(spawnT>0) return; spawnT=1.2; const P=G.player; if(P.dead) return;
  const near=G.ents.filter(e=>!e.dead&&Math.abs(e.x-P.x)<70*T);
  const hostN=near.filter(e=>e.kind==='mob'&&MOBS[e.t].zombie).length; const animN=near.filter(e=>e.kind==='mob'&&MOBS[e.t].animal).length;
  const tx=Math.floor(P.x/T); const city=G.w.feat.city; const inCity=city&&tx>city.x0-20&&tx<city.x1+20; const under=Math.floor(P.y/T)>G.w.sky[tx]+12;
  let max=isNight()?10+Math.min(8,G.day):3+(inCity?4:0); if(G.day===1&&!isNight()) max=1;
  if(G.bloodmoon){ max=14+Math.min(10,G.day/2|0); const total=24+G.day*3; if(G.bmSpawned<total&&hostN<max){ for(let i=0;i<2;i++){ const e=spawnZombieNear(under,inCity,true); if(e){ e.bm=true; G.bmSpawned++; } } } return; }
  if(hostN<max&&Math.random()<(isNight()?0.7:0.25)) spawnZombieNear(under,inCity,false);
  if(!isNight()&&animN<5&&!inCity&&!under&&Math.random()<0.2){ const sx=tx+(Math.random()<0.5?-1:1)*(30+Math.random()*15|0); const sy=surfaceY(sx)-1; if(tget(sx,sy+1)===2) G.ents.push(makeMob(['hase','hirsch','huhn','hase'][Math.random()*4|0],sx,sy)); }
  // wandernde Mutanten
  if(isNight()&&G.day>=4&&tierAt(tx,Math.floor(P.y/T))>=2&&!G.ents.some(e=>!e.dead&&MOBS[e.t]&&MOBS[e.t].mutant&&!e.sleep)&&Math.random()<0.004){ const sx=tx+(Math.random()<0.5?-40:40); const sy=surfaceY(sx)-1; const e=makeMob(inCity&&Math.random()<0.6?'mantelmann':['doppelkopf','armige','spinnenfrau','brocken','mantelmann'][Math.random()*5|0],sx,sy); e.wander=true; G.ents.push(e); msg('Etwas Großes streift durch die Nacht …','#e040fb'); }
  // Aufräumen weit entfernter Zombies
  for(const e of G.ents){ if(!e.dead&&e.kind==='mob'&&e.spawned&&Math.abs(e.x-P.x)>110*T) e.dead=true; }
}
// Schwierigkeit: je weiter vom Absturzort und je tiefer, desto härter
function tierAt(tx,ty){ const f=G.w.feat; const ref=f&&f.wreck?f.wreck.x+7:G.w.W/2; const depth=Math.max(0,ty-(G.w.sky[tx]||0)); return Math.max(0,Math.min(5,Math.floor(Math.abs(tx-ref)/110)+Math.floor(depth/35))); }
const TIER_POOLS={
 surf:[['schlurfer','schlurfer','kriecher'],['schlurfer','kriecher','schwester','bauarbeiter','hund','geier'],['schlurfer','schwester','bauarbeiter','hund','geier','brandmeister','springer','clown','bulle'],['brandmeister','springer','clown','bulle','fettsack','soldat','kreischerin','rammbock','kotzer','spinne'],['fettsack','soldat','kreischerin','rammbock','kotzer','springer','spinne','bulle']],
 under:[['kriecher','schlurfer'],['kriecher','schlurfer','bauarbeiter','spinne'],['kriecher','spinne','bauarbeiter','springer','kotzer'],['spinne','springer','kotzer','fettsack','kreischerin'],['spinne','kotzer','fettsack','kreischerin','rammbock','springer']]};
function spawnPool(tier,under,inCity){ const P=under?TIER_POOLS.under:TIER_POOLS.surf; let pool=P[Math.min(P.length-1,tier)].slice(); if(inCity) pool=pool.filter(t=>!MOBS[t].fly||Math.random()<0.5); return pool; }
function spawnZombieNear(under,inCity,bm){ const P=G.player; const tx=Math.floor(P.x/T), ty=Math.floor(P.y/T);
  for(let tries=0;tries<8;tries++){ const sx=tx+(Math.random()<0.5?-1:1)*(28+Math.random()*16|0); if(sx<5||sx>G.w.W-5) continue; let sy;
    if(under){ sy=ty+(Math.random()*20-10|0); let ok=false; for(let k=0;k<15;k++){ if(!solidAt(sx,sy)&&!solidAt(sx,sy-1)&&!solidAt(sx,sy-2)&&solidAt(sx,sy+1)&&tget(sx,sy)!==5){ ok=true; break;} sy++; } if(!ok) continue; }
    else { sy=surfaceY(sx)-1; if(tget(sx,sy+1)===5) continue; }
    let tier=tierAt(sx,sy); if(isNight()) tier++; if(bm) tier+=2; if(inCity) tier=Math.max(tier,2); tier=Math.min(6,tier);
    const pool=spawnPool(tier,under,inCity);
    const t=pool[Math.random()*pool.length|0]; const rad=!!MOBS[t].glow||(tier>=3&&Math.random()<Math.min(0.4,(tier-2)*0.08+(bm?0.1:0)));
    const e=makeMob(t,sx,MOBS[t].fly?sy-6:sy,{rad,spawned:true,tier}); const k=1+0.18*Math.max(0,tier-1); e.hp*=k; e.maxhp=e.hp; e.dmgMul=1+0.12*Math.max(0,tier-1); G.ents.push(e); return e; }
  return null; }
// ---- KI ----
function targetsFor(e){ const arr=[G.player]; for(const o of G.ents) if(o.kind==='npc'&&o.recruited&&!o.down&&!o.dead) arr.push(o); return arr; }
function updateMob(e,dt){ const d=MOBS[e.t]; const P=G.player; e.cd-=dt; e.hurtT-=dt; e.ai-=dt;
  const night=isNight(); const mult=(night?1.35:1)*(e.rad?1.2:1)*(G.bloodmoon?1.15:1);
  if(e.sleep){ const dd=dist(e,P); if(dd<(INPUT.jx===0?3:6)*T*SKILLFX.wake()||(dd<10*T&&P.attackT>0)){ e.sleep=false; if(d.zombie) sfx('groan'); if(d.mutant) { msg(`${d.n} ist erwacht!`,'#e040fb'); sfx('roar'); } } else { e.vx=0; e.vy=Math.min(e.vy+GRAV*dt,500); moveBody(e,dt); return; } }
  if(d.boss) return updateBoss(e,dt);
  // Ziel wählen
  let tgt=null,td=1e9; const sense=(d.zombie?(night?32*SKILLFX.nightSense():16):d.mutant?18:14)*T*SKILLFX.wake()**0.5*(G.bloodmoon&&e.bm?5:1);
  if(hostile(e)||d.mutant){ for(const o of targetsFor(e)){ if(o.dead) continue; const dd=dist(e,o); if(dd<td&&dd<sense){ td=dd; tgt=o; } } }
  if(d.gang&&tgt&&e.camp!=null){ const c=G.w.feat.camps[e.camp]; const ptx=(tgt.x)/T; if((ptx<c.x0-25||ptx>c.x1+25)) tgt=null; }
  let mv=0; let spd=d.spd*mult;
  if(d.animal){ e.flee=(e.flee||0)-dt; const dd=dist(e,P); if(dd<6*T||e.flee>0){ mv=P.x<e.x?1:-1; spd*=1; if(e.onGround&&e.hitWall) e.vy=-260; } else { if(e.ai<=0){ e.ai=1+Math.random()*3; e.wdir=Math.random()<0.4?0:(Math.random()<0.5?-1:1);} mv=e.wdir||0; spd*=0.35; } }
  else if(d.cann&&G.cannAngry<=0){ // zurückhaltend: beobachten
    const dd=dist(e,P); const v=G.w.feat.cann; if(dd<12*T){ e.dir=P.x>e.x?1:-1; e.watch=true; if(dd>7*T&&Math.random()<0.02) e.wdir=e.dir; else if(dd<4*T) e.wdir=-e.dir; else e.wdir=0; mv=e.wdir; spd*=0.5; }
    else { e.watch=false; if(e.ai<=0){ e.ai=2+Math.random()*3; e.wdir=Math.random()<0.5?0:(Math.random()<0.5?-1:1);} mv=e.wdir||0; spd*=0.3; if(v){ if(e.x/T<v.x0) mv=1; if(e.x/T>v.x1) mv=-1; } }
  }
  else if(tgt){ const dx=(tgt.x+tgt.w/2)-(e.x+e.w/2), dy=(tgt.y+tgt.h/2)-(e.y+e.h/2); mv=Math.abs(dx)>4?Math.sign(dx):0; e.dir=dx>0?1:-1;
    // Fernkampf
    if(d.gun&&td<12*T&&td>2.5*T&&e.cd<=0&&Math.abs(dy)<4*T){ const a=Math.atan2(dy,dx); G.proj.push({x:e.x+e.w/2,y:e.y+17,vx:Math.cos(a)*420,vy:Math.sin(a)*420,grav:0,dmg:d.dmg,own:'e',type:'bullet',life:1.4}); e.cd=1.8; sfx('shoot'); mv=0; }
    if(d.spit&&td<9*T&&td>2*T&&e.cd<=0){ const t=0.9; G.proj.push({x:e.x+e.w/2,y:e.y+8,vx:dx/t,vy:dy/t-0.5*400*t,grav:400,dmg:d.dmg*0.8,own:'e',type:'acid',life:2.5}); e.cd=3.2; sfx('groan'); }
    if(d.scream&&!e.screamed&&td<14*T){ e.screamed=true; sfx('scream'); msg('Die Kreischerin ruft Verstärkung!','#ff8a80'); for(let i=0;i<3;i++) { const z=spawnZombieNear(false,false,false); if(z) z.x=e.x+(i-1)*40; } }
    if(d.blowup&&e.hp<e.maxhp*0.3&&td<2.5*T){ explode(e.x+e.w/2,e.y+e.h/2,2.2,30,'e'); e.dead=true; return; }
    if(d.mutant&&d.slam&&td<5*T&&e.cd<=0&&e.onGround){ e.cd=3; e.vy=-200; e.slamming=true; }
    if(d.jump&&e.onGround&&e.cd<=0&&td<9*T&&Math.random()<0.03){ e.vy=-d.jump*(d.mutant?1:0.9); e.vx=Math.sign(dx)*spd*2.2; e.cd=1.2; }
    if(d.pounce&&e.onGround&&e.cd<=0&&td<8*T&&td>2*T&&Math.abs(dy)<3*T){ e.vy=-290; e.vx=Math.sign(dx)*310; e.lunge=0.7; e.cd=2.6; sfx('scream'); }
    if(d.charge&&e.onGround&&e.cd<=0&&td<11*T&&td>3*T&&Math.abs(dy)<1.5*T){ e.lunge=1.2; e.vx=Math.sign(dx)*300; e.cd=4.5; sfx('roar'); }
    if(d.rocks&&td<15*T&&td>4*T&&e.cd<=0){ const t=1.1; G.proj.push({x:e.x+e.w/2,y:e.y+4,vx:dx/t,vy:dy/t-0.5*400*t,grav:400,dmg:d.dmg*0.7,own:'e',type:'stein',life:3}); e.cd=3.2; sfx('groan'); }
    if(d.chainsaw&&td<12*T){ if(!e.revved){ e.revved=true; msg('Säge-Sepp wirft die Kettensäge an!','#ff8a65'); } if(Math.random()<dt*0.8) sfx('saw'); }
    if(d.honk&&Math.random()<dt*0.07) sfx('giggle');
    // Nahkampf
    if(td<(d.w/2+8+(tgt.w/2))&&Math.abs(dy)<d.h&&e.atk<=0||(td<e.w/2+14&&(e.atk||0)<=0)){ e.atk=1.0; const dmg=d.dmg*mult*(e.dmgMul||1); if(tgt===P) hurtPlayer(dmg,e); else npcHurt(tgt,dmg); if(e.lunge>0&&d.charge){ tgt.vx=(tgt.vx||0)*2.2; tgt.vy=-240; e.lunge=0; G.cam.shake=Math.max(G.cam.shake,6); sfx('thud'); } }
    e.atk=(e.atk||0)-dt;
    // Blöcke einreißen, wenn blockiert
    if(e.hitWall&&!d.fly){ e.stuck+=dt; if(e.stuck>0.5&&d.spider){ e.vy=-130; } if(e.stuck>(d.human?99:0.9)){ const fx=Math.floor((e.x+e.w/2)/T)+e.hitWall; const ys=[Math.floor((e.y+e.h-1)/T),Math.floor((e.y+e.h-17)/T),Math.floor((e.y+e.h-33)/T)]; for(const yy of ys){ const t=tget(fx,yy); if(t&&TILES[t].s){ if(TILES[t].door&&d.human){ continue; } e.bang=(e.bang||0)-dt; if(e.bang<=0){ e.bang=1; doorBang(e,fx,yy,(d.dmg*mult)*(d.mutant?3:1)); } break; } } } }
    else e.stuck=0;
    // Graben nach unten / oben
    if(dy<-2*T&&e.onGround&&Math.abs(dx)<2*T&&e.cd<=0&&!d.fly){ e.vy=-300; e.cd=1; }
  } else { // umherwandern
    if(e.ai<=0){ e.ai=2+Math.random()*4; e.wdir=Math.random()<0.5?0:(Math.random()<0.5?-1:1);} mv=e.wdir||0; spd*=0.4;
    if(d.gang&&e.camp!=null){ const c=G.w.feat.camps[e.camp]; if(e.x/T<c.x0+2) mv=1; if(e.x/T>c.x1-2) mv=-1; }
  }
  if(mv) e.dir=mv;
  if(d.fly){ // Geier
    if(tgt){ const dx=(tgt.x)-(e.x), dy=(tgt.y-10+Math.sin(G.clock*3+e.x)*20)-(e.y); const L=Math.hypot(dx,dy)||1; e.vx+=(dx/L*spd-e.vx)*dt*2; e.vy+=(dy/L*spd-e.vy)*dt*2; }
    else { e.vx=mv*spd; e.vy=Math.sin(G.clock+e.x)*20; }
    e.x+=e.vx*dt; e.y+=e.vy*dt; if(solidAt(Math.floor((e.x+e.w/2)/T),Math.floor((e.y+e.h/2)/T))) e.y-=60*dt; e.walk+=dt*10; return; }
  const acc=e.onGround?10:3; if(e.lunge>0){ e.lunge-=dt; } else e.vx+=(mv*spd-e.vx)*Math.min(1,dt*acc);
  if(mv&&e.onGround&&e.hitWall&&!e.stepped&&e.cd<=0.5&&tgt){ if(Math.random()<0.05) e.vy=-280; }
  if(inWater(e)){ e.vy=Math.max(e.vy-600*dt,-80); }
  e.vy=Math.min(e.vy+GRAV*dt,520); const wasAir=!e.onGround; moveBody(e,dt);
  if(e.lunge>0&&e.hitWall&&d.charge){ const fx=Math.floor((e.x+e.w/2)/T)+e.hitWall; for(const yy of [Math.floor((e.y+e.h-1)/T),Math.floor((e.y+e.h-17)/T),Math.floor((e.y+e.h-33)/T)]){ if(TILES[tget(fx,yy)].s) dmgTile(fx,yy,80); } e.lunge=0; e.cd=2; G.cam.shake=Math.max(G.cam.shake,5); sfx('thud'); }
  if(e.slamming&&e.onGround&&wasAir){ e.slamming=false; G.cam.shake=6; sfx('boom'); partBurst(e.x+e.w/2,e.y+e.h,'#7a5a3a',20,200); for(const o of targetsFor(e)) if(dist(e,o)<4.5*T&&(o.onGround||o.climb)) { if(o===P) hurtPlayer(d.dmg,e); else npcHurt(o,d.dmg);} }
  if(Math.abs(e.vx)>5) e.walk+=dt*Math.abs(e.vx)*0.15;
  if(d.zombie&&Math.random()<dt*0.04&&dist(e,P)<16*T) sfx('groan');
  // Fallen
  overlapTiles(e,(x,y,t)=>{ const td2=TILES[t]; if(td2.trap&&(e.trapT||0)<=0&&!d.fly){ e.trapT=0.6; hurtMob(e,td2.trap,null,0); dmgTile(x,y,2); return true; } return false; }); e.trapT=(e.trapT||0)-dt;
  if(e.y>G.w.H*T) e.dead=true;
}
function explode(x,y,r,dmg,own){ sfx('boom'); G.cam.shake=8; for(let i=0;i<30;i++) G.parts.push({x,y,vx:(Math.random()-0.5)*300,vy:(Math.random()-0.7)*300,life:0.6+Math.random()*0.4,col:['#ff6a00','#ffb300','#555','#fff59d'][i%4],sz:2,grav:200,light:0.8});
  const P=G.player; if(Math.hypot(P.x+P.w/2-x,P.y+P.h/2-y)<r*T) hurtPlayer(dmg,{x});
  for(const e of G.ents){ if(e.dead||e.kind!=='mob') continue; if(Math.hypot(e.x+e.w/2-x,e.y+e.h/2-y)<r*T*1.2) hurtMob(e,dmg*(own==='p'?1:0.6),own==='p'?P:null,200); }
  if(own==='p'){ const tx=Math.floor(x/T),ty=Math.floor(y/T); for(let a=-2;a<=2;a++)for(let b=-2;b<=2;b++){ if(a*a+b*b<=r*r){ const t=tget(tx+a,ty+b); if(t&&t!==17&&t!==5&&TILES[t].h<8&&!TILES[t].loot) breakTile(tx+a,ty+b,Math.random()<0.4);} } } }
function npcHurt(n,dmg){ if(n.down) return; n.hp-=dmg; n.hurtT=0.2; num(n.x+n.w/2,n.y,Math.round(dmg),'#ff8a80'); if(n.hp<=0){ n.down=20; n.hp=0; msg(`${NPCS[n.t].n} ist k.o. und braucht kurz Pause!`,'#ff8a80'); } }
function updateNPC(n,dt){ const d=NPCS[n.t]; const P=G.player; n.cd-=dt; n.ai-=dt; n.hurtT-=dt;
  if(n.down>0){ n.down-=dt; n.vx=0; n.vy=Math.min(n.vy+GRAV*dt,500); moveBody(n,dt); if(n.down<=0){ n.down=0; n.hp=n.maxhp*0.5; msg(`${d.n} steht wieder auf.`,'#a5d6a7'); } return; }
  let goal=null; if(n.recruited&&n.mode==='follow') goal=P; else if(n.recruited&&n.mode==='base') goal={x:P.spawn.x*T,y:P.spawn.y*T,w:0,h:0};
  // Feind suchen
  let foe=null,fd=(d.ranged?13:8)*T; if(n.recruited||d.trader||true){ for(const e of G.ents){ if(e.dead||e.kind!=='mob'||!hostile(e)) continue; const dd=dist(n,e); if(dd<fd){ fd=dd; foe=e; } } }
  if(!n.recruited&&foe&&fd>5*T) foe=null;
  let mv=0;
  if(foe&&(n.recruited||fd<4*T)){ const dx=foe.x-n.x; n.dir=dx>0?1:-1;
    if(d.ranged){ if(n.cd<=0){ const a=Math.atan2((foe.y+foe.h/2)-(n.y+17),(foe.x+foe.w/2)-(n.x+n.w/2)); G.proj.push({x:n.x+n.w/2,y:n.y+17,vx:Math.cos(a)*600,vy:Math.sin(a)*600,grav:0,dmg:d.dmg,own:'n',type:'bullet',life:1.3}); n.cd=1.1; sfx('shoot'); } if(fd<3*T) mv=-n.dir; }
    else { if(fd>T*1.4) mv=n.dir; else if(n.cd<=0){ hurtMob(foe,d.dmg,null,120); n.cd=0.8; n.attackT=0.2; } }
  }
  else if(goal){ const dx=goal.x-n.x; const far=Math.abs(dx); if(goal===P&&far>45*T){ n.x=P.x-P.dir*30; n.y=P.y; n.vy=0; } if(far>(goal===P?3:1)*T) mv=Math.sign(dx); if(goal===P&&Math.abs(goal.y-n.y)>10*T&&far<6*T){ n.x=P.x-P.dir*20; n.y=P.y; } }
  else if(!d.trader){ if(n.ai<=0){ n.ai=3+Math.random()*4; n.wdir=Math.random()<0.5?0:(Math.random()<0.5?-1:1);} mv=n.wdir||0; const hx=n.home.x*T; if(n.x<hx-4*T) mv=1; if(n.x>hx+4*T) mv=-1; if(!mv&&dist(n,P)<6*T) n.dir=P.x>n.x?1:-1; }
  else { if(dist(n,P)<6*T) n.dir=P.x>n.x?1:-1; }
  if(mv) n.dir=mv; const spd=(goal===P?105:55); n.vx+=(mv*spd-n.vx)*Math.min(1,dt*10);
  if(mv&&n.onGround&&n.hitWall){ const fx=Math.floor((n.x+n.w/2)/T)+n.hitWall, fy=Math.floor((n.y+n.h-1)/T); if(TILES[tget(fx,fy)].door&&tget(fx,fy)===19) toggleDoor(fx,fy); else n.vy=-300; }
  if(inWater(n)) n.vy=Math.max(n.vy-600*dt,-90);
  n.vy=Math.min(n.vy+GRAV*dt,520); moveBody(n,dt); if(Math.abs(n.vx)>5) n.walk+=dt*Math.abs(n.vx)*0.15;
  // Fähigkeiten
  if(n.recruited){ if(d.skill==='heilen'&&n.cd<=0&&dist(n,P)<6*T&&P.hp<maxHp()){ P.hp=Math.min(maxHp(),P.hp+6); num(P.x+P.w/2,P.y,'+6','#69f0ae'); n.cd=3; }
    if(d.skill==='bauen'&&n.ai<=0){ n.ai=1; const tx=Math.floor(n.x/T),ty=Math.floor(n.y/T); for(let y=ty-6;y<=ty+6;y++)for(let x=tx-8;x<=tx+8;x++){ const i=y*G.w.W+x; if(G.dmg.has(i)){ const v=G.dmg.get(i)-15; if(v<=0) G.dmg.delete(i); else G.dmg.set(i,v); partBurst(x*T+8,y*T+8,'#69f0ae',2,40);} } }
    if(d.skill==='sammeln'){ n.gath=(n.gath||0)+dt; if(n.gath>90){ n.gath=0; const it=['beeren','fleisch_roh','faser','federn'][Math.random()*4|0]; addItem(it,2); msg(`${d.n} bringt dir ${ITEMS[it].n}.`,'#a5d6a7'); } }
  }
}
function updateBoss(e,dt){ const d=MOBS[e.t]; const P=G.player; e.pt-=dt; const enr=e.hp<e.maxhp*0.5; const tgt=P;
  const dx=(tgt.x+tgt.w/2)-(e.x+e.w/2), dy=(tgt.y+tgt.h/2)-(e.y+e.h/2); e.dir=dx>0?1:-1;
  if(e.t==='fleischberg'){ // springt, stampft, ruft Zombies
    const gy=(()=>{ const x=Math.floor((e.x+e.w/2)/T); let y=Math.floor((e.y+e.h)/T); for(let k=0;k<60;k++){ if(TILES[tget(x,y)].s) return y*T; y++; } return e.y+e.h+200; })();
    if(e.air){ e.vy+=GRAV*dt; e.x+=e.vx*dt; e.y+=e.vy*dt; if(e.vy>0&&e.y+e.h>=gy){ e.y=gy-e.h; e.air=false; G.cam.shake=9; sfx('boom'); partBurst(e.x+e.w/2,e.y+e.h,'#7a5a3a',30,260); if(Math.abs(P.y+P.h-gy)<T*1.5&&Math.abs(dx)<10*T&&P.onGround) hurtPlayer(d.dmg*0.8,e);
        // Landung zerdrückt weiche Blöcke
        const x0=Math.floor(e.x/T),x1=Math.floor((e.x+e.w)/T); for(let x=x0;x<=x1;x++){ const yy=Math.floor(gy/T); const t=tget(x,yy); if(t&&TILES[t].h<3&&Math.random()<0.3) breakTile(x,yy,false);} } }
    else { e.x+=Math.sign(dx)*d.spd*(enr?1.6:1)*dt; if(Math.abs(e.y+e.h-gy)>2) { e.y+=Math.min(400*dt,gy-(e.y+e.h)); }
      if(e.pt<=0){ e.pt=enr?2.2:3.2; e.air=true; e.vy=-480-Math.min(200,Math.abs(dy)); e.vx=dx/1.1; sfx('roar'); }
      if(enr&&(e.summonT=(e.summonT||8)-dt)<=0){ e.summonT=10; for(let i=0;i<3;i++){ const z=makeMob('schlurfer',Math.floor(e.x/T)+i*2,Math.floor(e.y/T)+2,{spawned:true}); z.y=e.y+e.h-z.h; G.ents.push(z);} msg('Der Fleischberg spuckt Schlurfer aus!','#ff8a80'); } }
  } else { // Geierkönigin
    e.phaseT=(e.phaseT||0)+dt;
    if(e.dash>0){ e.dash-=dt; e.x+=e.vx*dt; e.y+=e.vy*dt; }
    else { const hx=tgt.x+Math.cos(e.phaseT*0.8)*140-e.w/2, hy=tgt.y-110+Math.sin(e.phaseT*1.6)*25; e.vx+=((hx-e.x)*2-e.vx)*dt*2; e.vy+=((hy-e.y)*2-e.vy)*dt*2; e.x+=e.vx*dt; e.y+=e.vy*dt;
      if(e.pt<=0){ e.pt=enr?1.8:3; const L=Math.hypot(dx,dy)||1; e.vx=dx/L*(enr?420:340); e.vy=dy/L*(enr?420:340); e.dash=Math.min(1.2,L/340+0.2); sfx('scream'); }
      if((e.eggT=(e.eggT||5)-dt)<=0){ e.eggT=enr?4:6; for(let i=0;i<(enr?3:2);i++) G.proj.push({x:e.x+e.w/2,y:e.y+e.h,vx:(Math.random()-0.5)*120,vy:-60,grav:500,dmg:8,own:'e',type:'egg',life:4}); } }
    e.walk+=dt*12;
  }
  if(Math.abs(dx)<(e.w/2+8)&&Math.abs(dy)<(e.h/2+14)&&(e.atk=(e.atk||0)-dt)<=0){ e.atk=0.8; hurtPlayer(d.dmg,e); }
  for(const o of targetsFor(e)) if(o!==P&&dist(o,e)<e.w*0.6&&Math.random()<dt) npcHurt(o,d.dmg*0.5);
  if(Math.hypot(dx,dy)>90*T){ e.dead=true; G.boss=null; msg(`${d.n} hat sich zurückgezogen.`); }
}
function updateProj(dt){ const P=G.player;
  for(const p of G.proj){ p.life-=dt; p.vy+=(p.grav||0)*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; if(p.type==='molotow'&&Math.random()<0.5) G.parts.push({x:p.x,y:p.y,vx:0,vy:-20,life:0.3,col:'#ff6a00',sz:1});
    const tx=Math.floor(p.x/T), ty=Math.floor(p.y/T); const t=tget(tx,ty);
    const hitTile=TILES[t].s&&!(TILES[t].glass&&p.type==='bullet');
    if(TILES[t].glass&&p.type==='bullet'&&p.own==='p'){ breakTile(tx,ty,false); }
    if(hitTile||p.life<=0){ if(p.type==='rohrbombe') explode(p.x,p.y,2.5,ITEMS.rohrbombe.dmg,'p'); else if(p.type==='molotow') fireArea(p.x,p.y-4); else if(p.type==='egg'){ if(G.ents.filter(e=>!e.dead&&e.t==='geier').length<8) G.ents.push(Object.assign(makeMob('geier',tx,ty-1,{spawned:true}),{})); partBurst(p.x,p.y,'#eee',5); } else if(p.type==='arrow'&&Math.random()<0.5&&p.own==='p') spawnDrop('pfeil',1,p.x,p.y-8); else if(p.back&&p.own==='p'&&Math.random()<p.back) spawnDrop(p.type,1,p.x-p.vx*0.02,p.y-8); else partBurst(p.x,p.y,'#ccc',2,60); p.life=-1; continue; }
    if(p.own==='e'){ if(p.x>P.x&&p.x<P.x+P.w&&p.y>P.y&&p.y<P.y+P.h){ hurtPlayer(p.dmg,{x:p.x-p.vx}); if(p.type==='acid') partBurst(p.x,p.y,'#9c3',6); p.life=-1; continue; } for(const n of G.ents){ if(n.kind==='npc'&&n.recruited&&!n.down&&p.x>n.x&&p.x<n.x+n.w&&p.y>n.y&&p.y<n.y+n.h){ npcHurt(n,p.dmg); p.life=-1; break; } } }
    else { for(const e of G.ents){ if(e.dead||e.kind!=='mob') continue; const md=MOBS[e.t]; if(!(hostile(e)||md.animal||md.cann)) continue; if(p.own==='n'&&!hostile(e)) continue; if(p.x>e.x-2&&p.x<e.x+e.w+2&&p.y>e.y-2&&p.y<e.y+e.h+2){ if(p.type==='rohrbombe'){ explode(p.x,p.y,2.5,ITEMS.rohrbombe.dmg,'p'); } else if(p.type==='molotow') fireArea(p.x,p.y); else { hurtMob(e,p.dmg,p.own==='p'?P:null,p.spin?110:70); if(p.back&&Math.random()<p.back*0.6) spawnDrop(p.type,1,e.x+e.w/2,e.y+e.h-10); } p.life=-1; break; } } }
  }
  G.proj=G.proj.filter(p=>p.life>0);
  // Feuerflächen
  for(const f of (G.fires||[])){ f.t-=dt; if(Math.random()<0.6) G.parts.push({x:f.x+(Math.random()-0.5)*f.r*2,y:f.y,vx:0,vy:-40-Math.random()*40,life:0.5,col:Math.random()<0.5?'#ff6a00':'#ffcc00',sz:2,light:0.7});
    f.tick-=dt; if(f.tick<=0){ f.tick=0.4; for(const e of G.ents){ if(!e.dead&&e.kind==='mob'&&Math.abs(e.x+e.w/2-f.x)<f.r&&Math.abs(e.y+e.h-f.y)<24) hurtMob(e,8,P,0);} if(Math.abs(P.x+P.w/2-f.x)<f.r&&Math.abs(P.y+P.h-f.y)<24) hurtPlayer(5); } }
  G.fires=(G.fires||[]).filter(f=>f.t>0);
}
function fireArea(x,y){ sfx('boom'); G.fires=G.fires||[]; G.fires.push({x,y:Math.floor(y/T+1)*T,r:40,t:4,tick:0}); }
function updateDrops(dt){ const P=G.player;
  for(const d of G.drops){ d.t+=dt; const dx=(P.x+P.w/2)-(d.x+4), dy=(P.y+P.h/2)-(d.y+4); const L=Math.hypot(dx,dy);
    if(L<3*T&&d.t>0.4&&!P.dead){ d.vx=dx/L*200; d.vy=dy/L*200; d.x+=d.vx*dt; d.y+=d.vy*dt; if(L<10){ const left=addItem(d.id,d.n,true,true); UI.refreshHot(); if(left<d.n){ sfx('pick'); pickupText(d.id,d.n-left); } d.n=left; if(left<=0) d.gone=true; } continue; }
    d.vy=Math.min(d.vy+GRAV*dt,400); d.vx*=0.95; moveBody(d,dt); if(d.t>300) d.gone=true; }
  G.drops=G.drops.filter(d=>!d.gone);
  // zusammenführen
  if(G.drops.length>120) G.drops.splice(0,G.drops.length-120);
}
function updateWater(){ if(((G.clock*7)|0)===G.lastWater) return; G.lastWater=(G.clock*7)|0; const c=G.cam; const x0=Math.floor(c.x/T)-20,x1=x0+Math.ceil(G.VW/T)+40,y0=Math.floor(c.y/T)-15,y1=y0+Math.ceil(G.VH/T)+30;
  for(let y=y1;y>=y0;y--)for(let x=x0;x<=x1;x++){ if(tget(x,y)!==5) continue; if(tget(x,y+1)===0){ G.w.tiles[(y+1)*G.w.W+x]=5; G.w.tiles[y*G.w.W+x]=0; } else if(TILES[tget(x,y+1)].s||tget(x,y+1)===5){ const dir=Math.random()<0.5?-1:1; if(tget(x+dir,y)===0&&tget(x+dir,y+1)===0){ G.w.tiles[y*G.w.W+x+dir]=5; G.w.tiles[y*G.w.W+x]=0; } } } }
function update(dt){ G.clock+=dt; updateTime(dt); updatePlayer(dt); survival(dt); spawnLogic(dt);
  const P=G.player; const act=70*T;
  for(const e of G.ents){ if(e.dead) continue; if(Math.abs(e.x-P.x)>act&&!(e.kind==='mob'&&MOBS[e.t].boss)) continue; if(e.kind==='npc') updateNPC(e,dt); else updateMob(e,dt); }
  if(G.ents.length>300||Math.random()<0.01) G.ents=G.ents.filter(e=>!e.dead||e.kind==='npc');
  updateProj(dt); updateDrops(dt); updateWater();
  for(const p of G.parts){ p.life-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; if(p.grav) p.vy+=p.grav*dt; } G.parts=G.parts.filter(p=>p.life>0); if(G.parts.length>400) G.parts.splice(0,G.parts.length-400);
  for(const n of G.nums){ n.life-=dt; n.y-=(n.key?12:22)*dt; } G.nums=G.nums.filter(n=>n.life>0);
  // Kamera
  const tx=P.x+P.w/2-G.VW/2, ty=P.y+P.h/2-G.VH*0.55; G.cam.x+=(tx-G.cam.x)*Math.min(1,dt*8); G.cam.y+=(ty-G.cam.y)*Math.min(1,dt*8);
  G.cam.x=Math.max(0,Math.min(G.w.W*T-G.VW,G.cam.x)); G.cam.y=Math.max(0,Math.min(G.w.H*T-G.VH,G.cam.y));
  if(G.cam.shake>0) G.cam.shake=Math.max(0,G.cam.shake-dt*15);
  // Musik
  const under=Math.floor(P.y/T)>G.w.sky[Math.floor(P.x/T)]+14; if(G.ents.some(e=>!e.dead&&e.kind==='mob'&&!e.sleep&&hostile(e)&&Math.abs(e.x-P.x)<5*T&&Math.abs(e.y-P.y)<3*T)||G.fightT>0) G.combatT=4.5; else G.combatT=(G.combatT||0)-dt; G.fightT=(G.fightT||0)-dt;
  musicMode(G.boss&&!G.boss.dead?'boss':G.bloodmoon?'blut':G.combatT>0?'kampf':under?'hoehle':isNight()?'nacht':'tag');
  G.autosave=(G.autosave||0)+dt; if(G.autosave>120){ G.autosave=0; saveGame(true); }
}
