// fx.js – Lifetime 0.3: Kampfgefühl, Trümmer, Blut, Leichen, Nebel, Strahlung
'use strict';
const FXS={crack:[],fog:null,leafCols:{}};
const BLOOD=['#6e0505','#4e0303','#8e0c0c','#3a0202'], NEON=['#8cff3a','#5ed020','#c8ff80','#3aa010'];
const rnd=Math.random;
function fxEnsure(){ if(G._fxW!==G.w){ G._fxW=G.w; G.decals=[]; G.corpses=[]; G.debris=[]; G.puddles=[]; G.hitstop=0; } }
function isSolid(px,py){ const t=tget(Math.floor(px/T),Math.floor(py/T)); return !!(t&&TILES[t]&&TILES[t].s&&!TILES[t].plat); }
// ---- Blut & Brocken ----
function bloodSpray(x,y,dir,n,spd,neon){ const C=neon?NEON:BLOOD; for(let i=0;i<n;i++) G.parts.push({x,y,vx:dir*(30+rnd()*spd)+(rnd()-0.5)*70,vy:-rnd()*spd*0.9-30,life:0.9+rnd()*0.7,col:C[i%4],sz:rnd()<0.35?2:1,grav:650,stick:true,light:neon?0.35:0}); }
function gibs(x,y,n,neon){ const C=neon?['#4a8a20','#8cff3a','#d8ccb0']:['#5a1414','#7a2a22','#d8ccb0','#3a0808']; for(let i=0;i<n;i++) G.parts.push({x,y,vx:(rnd()-0.5)*260,vy:-80-rnd()*220,life:1.4+rnd(),col:C[i%C.length],sz:2+(rnd()<0.4?1:0),grav:800,stick:true}); }
function addDecal(x,y,col,sz){ const tx=Math.floor(x/T), ty=Math.floor(y/T); G.decals.push({x:Math.round(x),y:Math.round(y),col,sz:sz||1,tx,ty}); if(G.decals.length>500) G.decals.splice(0,G.decals.length-500); }
// ---- Treffer-Feedback ----
const _hurtMob=hurtMob;
hurtMob=function(e,dmg,src,kb){ if(e.dead||e.kind==='npc') return _hurtMob(e,dmg,src,kb); fxEnsure(); const d=MOBS[e.t];
  const fromP=src===G.player||src==='player'||(src&&src.own==='p'); const P=G.player;
  const dir=(src&&src.x!=null)?((src.x+(src.w||0)/2)<(e.x+e.w/2)?1:-1):((P.x<e.x)?1:-1);
  _hurtMob(e,dmg,src,kb);
  const neon=e.rad||d.glow; bloodSpray(e.x+e.w/2,e.y+Math.min(16,e.h*0.35),dir,d.animal?8:(d.boss?16:12),170,neon);
  if(!e.dead&&!d.boss){ e.stagger=d.mutant?0.12:0.28; e.stagT=e.stagger; if(!e.lunge&&!d.mutant&&!d.fly){ e.vx=dir*Math.max(Math.abs(kb||0),150); e.vy=-140; } }
  if(fromP){ G.hitstop=Math.max(G.hitstop,e.dead?0.085:0.045); G.cam.shake=Math.max(G.cam.shake,e.dead?5:2.5); }
};
const _killMob=killMob;
killMob=function(e,src){ fxEnsure(); if(!e.dead){ const d=MOBS[e.t]; const neon=e.rad||d.glow;
    G.corpses.push({id:e.t,fr:e.climb?'i':frameFor(e,false),x:e.x+e.w/2,y:e.y+e.h,dir:e.dir||1,rad:e.rad,age:0,vy:0,boss:!!d.boss,crea:!LOOKS[e.t],w:e.w,h:e.h});
    gibs(e.x+e.w/2,e.y+e.h*0.4,d.boss?24:(d.animal?5:9),neon); bloodSpray(e.x+e.w/2,e.y+e.h*0.3,(e.dir||1)*-1,d.boss?30:14,220,neon);
    if(G.corpses.length>14) G.corpses.shift(); sfx(d.animal?'hit':'splat'); }
  _killMob(e,src); };
const _hurtPlayer=hurtPlayer;
hurtPlayer=function(dmg,src){ const P=G.player; const before=P.hp; _hurtPlayer(dmg,src); if(P.hp<before){ fxEnsure(); G.hitstop=Math.max(G.hitstop,0.04); G.hurtFlash=0.35; bloodSpray(P.x+P.w/2,P.y+14,src&&src.x<P.x?1:-1,8,140,false); } };
// ---- Taumeln ----
const _updateMob=updateMob;
updateMob=function(e,dt){ if(e.stagger>0){ const d=MOBS[e.t]; e.stagger-=dt; e.hurtT-=dt; e.cd=Math.max(e.cd,0.1); e.atk=Math.max(e.atk||0,0.2);
    if(d.fly){ e.vx*=Math.pow(0.05,dt); e.vy*=Math.pow(0.05,dt); e.x+=e.vx*dt; e.y+=e.vy*dt; } else { e.vy=Math.min(e.vy+GRAV*dt,600); e.vx*=Math.pow(0.08,dt); moveBody(e,dt); } return; }
  _updateMob(e,dt); };
// ---- Baum zerfällt in Stücke ----
fellTree=function(tx,ty){ fxEnsure(); const seen=new Set(); const st=[[tx,ty]]; const logs=[], leaves=[];
  while(st.length&&seen.size<300){ const [x,y]=st.pop(); const k=x+','+y; if(seen.has(k)) continue; const t=tget(x,y); if(t!==6&&!(TILES[t]&&TILES[t].leaf)) continue; if(y>ty) continue; seen.add(k); if(t===6) logs.push([x,y]); else leaves.push([x,y,t]); tset(x,y,0);
    st.push([x,y-1],[x-1,y],[x+1,y]); if(t!==6) st.push([x,y+1]); }
  const P=G.player; const fdir=(P.x+P.w/2)<(tx*T+8)?1:-1;
  for(const [x,y] of logs){ const h=ty-y; G.debris.push({tile:6,v:(x*7+y*13)&3,x:x*T+8,y:y*T+8,vx:fdir*(20+h*26)+(rnd()-0.5)*40,vy:-40-rnd()*90-h*6,rot:0,vr:fdir*(1.5+h*0.5)*(0.6+rnd()*0.8),t:0,drop:'holz',n:2}); }
  let lc=0; for(const [x,y,t] of leaves){ const c=TILES[t].c||'#2f6a2f'; for(let i=0;i<2&&lc<140;i++,lc++) G.parts.push({x:x*T+rnd()*16,y:y*T+rnd()*16,vx:(rnd()-0.5)*90+fdir*40,vy:-rnd()*90,life:1.6+rnd()*1.6,col:i?c:shadeHex(c,0.75),sz:2,grav:110,leaf:true,ph:rnd()*6}); }
  const top=logs.length?logs.reduce((a,b)=>b[1]<a[1]?b:a):[tx,ty];
  if(leaves.length>4&&rnd()<0.6) spawnDrop('faser',1+rnd()*3|0,top[0]*T+8,top[1]*T); if(rnd()<0.3) spawnDrop('beeren',1,top[0]*T,top[1]*T-10);
  sfx('treefall'); G.cam.shake=Math.max(G.cam.shake,4);
  for(let i=0;i<10;i++) G.parts.push({x:tx*T+8+(rnd()-0.5)*16,y:ty*T+14,vx:(rnd()-0.5)*60,vy:-rnd()*30,life:0.8+rnd()*0.6,col:'#6a5a48',sz:2,grav:-20,dust:true});
  if(!G.flags.tree){ G.flags.tree=true; msg('Holz! Sammle die Stücke ein und stell dir im Rucksack eine Steinaxt her.','#ffcc80'); } };
function shadeHex(h,f){ if(!h||h[0]!=='#') return h; let r,g,b; if(h.length===4){ r=parseInt(h[1]+h[1],16); g=parseInt(h[2]+h[2],16); b=parseInt(h[3]+h[3],16);} else { r=parseInt(h.slice(1,3),16); g=parseInt(h.slice(3,5),16); b=parseInt(h.slice(5,7),16);} const c=v=>Math.max(0,Math.min(255,Math.round(v*f))); return `rgb(${c(r)},${c(g)},${c(b)})`; }
// ---- Blöcke: Splitter, Staub, Funken ----
function tileBits(tx,ty,t,n,big){ const d=TILES[t]; const v=(tx*7+ty*13)&3;
  for(let k=0;k<4;k++) G.debris.push({tile:t,v,q:k,x:tx*T+4+(k%2)*8,y:ty*T+4+(k>>1)*8,vx:((k%2)?1:-1)*(30+rnd()*70),vy:-70-rnd()*110,rot:0,vr:(rnd()-0.5)*14,t:0,chip:true,life:0.8+rnd()*0.3});
  const dc=d.tool==='pick'?'#6a6660':'#5e4c3a'; for(let i=0;i<8;i++) G.parts.push({x:tx*T+rnd()*16,y:ty*T+rnd()*16,vx:(rnd()-0.5)*50,vy:-rnd()*30,life:0.7+rnd()*0.7,col:dc,sz:2,grav:-15,dust:true});
  if(d.tool==='pick'&&d.h>=2) sparks(tx*T+8,ty*T+8,8); }
function sparks(x,y,n){ for(let i=0;i<n;i++) G.parts.push({x,y,vx:(rnd()-0.5)*260,vy:-rnd()*200,life:0.2+rnd()*0.25,col:i%2?'#ffd27a':'#fff4c8',sz:1,grav:500,light:0.45}); }
const _breakTile=breakTile;
breakTile=function(tx,ty,byP){ fxEnsure(); const t=tget(tx,ty), d=TILES[t]; if(t&&d&&!d.tree&&!d.door&&GFX.tiles[t]&&!d.liquid) tileBits(tx,ty,t); _breakTile(tx,ty,byP); };
const _mineTick=mineTick;
mineTick=function(tx,ty,dt){ const r=_mineTick(tx,ty,dt); const m=G.mineT; if(m&&m.snd>0.24){ const t=tget(tx,ty), d=TILES[t]; if(d){ const px=tx*T+8-G.player.dir*6, py=ty*T+4+rnd()*8;
      for(let i=0;i<3;i++) G.parts.push({x:px,y:py,vx:-G.player.dir*(20+rnd()*60),vy:-rnd()*90,life:0.4+rnd()*0.3,col:i?d.c:'#2a2420',sz:1+(rnd()<0.4?1:0),grav:500});
      G.parts.push({x:px,y:py,vx:(rnd()-0.5)*20,vy:-10,life:0.6,col:'#6a6458',sz:2,grav:-10,dust:true});
      if(d.tool==='pick'&&d.h>=2) sparks(px,py,4); G.cam.shake=Math.max(G.cam.shake,0.8); } } return r; };
// ---- Kotze & Pfützen ----
function vomitAt(e,tx,ty){ const sx=e.x+e.w/2+e.dir*6, sy=e.y+12; const t=0.8; G.proj.push({x:sx,y:sy,vx:(tx-sx)/t,vy:(ty-sy)/t-0.5*420*t,grav:420,dmg:(MOBS[e.t].dmg||10)*0.6*(e.dmgMul||1),own:'e',type:'kotze',life:3,light:0.6}); sfx('vomit'); }
function addPuddle(x,y){ const tx=Math.floor(x/T); let ty=Math.floor(y/T); for(let k=0;k<4&&!isSolid(x,(ty+1)*T+1);k++) ty++; const gy=(ty+1)*T; const ex=G.puddles.find(q=>Math.abs(q.x-x)<14&&Math.abs(q.y-gy)<4); if(ex){ ex.life=Math.max(ex.life,14); ex.w=Math.min(30,ex.w+4); return; } G.puddles.push({x,y:gy,w:12+rnd()*8,life:14,ph:rnd()*6}); if(G.puddles.length>24) G.puddles.shift(); }
// ---- Update ----
const _update=update;
update=function(dt){ fxEnsure(); if(G.hurtFlash>0) G.hurtFlash-=dt; if(G.hitstop>0){ G.hitstop-=dt; return; } _update(dt); fxUpdate(dt); };
function fxUpdate(dt){ const P=G.player;
  for(const p of G.parts){ if(p.leaf){ p.vx+=Math.sin(G.clock*5+p.ph)*120*dt; p.vx*=Math.pow(0.3,dt); if(p.vy>40) p.vy=40; }
    if(p.dust){ p.vx*=Math.pow(0.2,dt); }
    if(p.stick&&p.vy>-20&&isSolid(p.x,p.y)){ addDecal(p.x-(p.vx>0?1:0),p.y-1,p.col,p.sz); p.life=0; } }
  // Kotz-Projektile → Pfütze
  for(const p of G.proj){ if(p.type==='kotze'){ if(rnd()<0.6) G.parts.push({x:p.x,y:p.y,vx:(rnd()-0.5)*20,vy:0,life:0.4,col:NEON[(rnd()*4)|0],sz:2,grav:300,light:0.4}); if(!p.splat&&(isSolid(p.x,p.y+3)||p.life<0.05)){ p.splat=true; p.life=0; addPuddle(p.x,p.y); for(let i=0;i<10;i++) G.parts.push({x:p.x,y:p.y,vx:(rnd()-0.5)*140,vy:-rnd()*120,life:0.6,col:NEON[i%4],sz:2,grav:600,light:0.4}); sfx('splash'); } } }
  for(const q of G.puddles){ q.life-=dt; if(rnd()<dt*2) G.parts.push({x:q.x+(rnd()-0.5)*q.w,y:q.y-2,vx:0,vy:-14-rnd()*10,life:0.9,col:'#b8ff70',sz:1,light:0.3});
    if(P&&!P.dead&&Math.abs(P.x+P.w/2-q.x)<q.w/2+4&&Math.abs(P.y+P.h-q.y)<6){ q.tick=(q.tick||0)-dt; if(q.tick<=0){ q.tick=0.6; if(!(armorStats().gas)) { hurtPlayer(4,null); msg('Leuchtende Kotze! Das ätzt!','#8cff3a'); } } } }
  G.puddles=G.puddles.filter(q=>q.life>0);
  // Trümmer
  for(const b of G.debris){ b.t+=dt; b.vy=Math.min(b.vy+GRAV*dt,600); const nx=b.x+b.vx*dt; if(isSolid(nx+Math.sign(b.vx)*5,b.y)){ b.vx=-b.vx*0.3; } else b.x=nx;
    const ny=b.y+b.vy*dt; if(b.vy>0&&isSolid(b.x,ny+(b.chip?3:6))){ if(b.vy>140&&!b.chip){ for(let i=0;i<3;i++) G.parts.push({x:b.x,y:ny+6,vx:(rnd()-0.5)*50,vy:-rnd()*20,life:0.6,col:'#6a5a48',sz:2,grav:-15,dust:true}); if(!b.thud){ b.thud=1; sfx('woodthud'); } } b.vy=-b.vy*0.28; b.vx*=0.55; b.vr*=0.5; b.ground=true; } else { b.y=ny; b.ground=false; }
    b.rot+=b.vr*dt; if(b.ground) b.rot+=((Math.round(b.rot/(Math.PI/2))*(Math.PI/2))-b.rot)*Math.min(1,dt*8);
    if(b.chip){ b.life-=dt; if(b.life<=0) b.gone=true; }
    else if((b.ground&&Math.abs(b.vy)<30&&b.t>0.7)||b.t>4){ b.gone=true; spawnDrop(b.drop,b.n,b.x,b.y); const dd=G.drops[G.drops.length-1]; dd.vx=0; dd.vy=-60; dd.t=0.1; for(let i=0;i<4;i++) G.parts.push({x:b.x+(rnd()-0.5)*12,y:b.y+4,vx:(rnd()-0.5)*40,vy:-rnd()*20,life:0.5,col:'#7a6a52',sz:2,grav:-10,dust:true}); } }
  G.debris=G.debris.filter(b=>!b.gone);
  // Leichen
  for(const c of G.corpses){ c.age+=dt; if(!isSolid(c.x,c.y+1)){ c.vy=Math.min(c.vy+GRAV*dt,500); c.y+=c.vy*dt; if(isSolid(c.x,c.y+1)){ c.y=Math.floor((c.y+1)/T)*T; c.vy=0; } }
    if(!c.pool&&c.age>0.5){ c.pool=true; for(let i=-6;i<=6;i+=1) if(rnd()<0.7) addDecal(c.x+i,c.y+1,BLOOD[(rnd()*4)|0],1); } }
  G.corpses=G.corpses.filter(c=>c.age<4.2);
  // Strahlende Mutanten & Kotzer
  for(const e of G.ents){ if(e.dead||e.kind!=='mob') continue; const d=MOBS[e.t]; const glow=e.rad||d.glow; if(glow&&rnd()<dt*3) G.parts.push({x:e.x+rnd()*e.w,y:e.y+rnd()*e.h,vx:0,vy:-12,life:0.8,col:NEON[(rnd()*4)|0],sz:1,light:0.3});
    if(d.zombie&&!d.fly&&rnd()<dt*0.6&&Math.abs(e.x-P.x)<G.VW) G.parts.push({x:e.x+e.w/2+(rnd()-0.5)*10,y:e.y+4,vx:0,vy:0,life:1.2,col:'#1a1a14',sz:1,fly:true,ox:e,ph:rnd()*6});
    if((d.vomit||(e.rad&&!d.boss&&!d.fly))&&!e.sleep&&!P.dead){ e.vcd=(e.vcd==null?2+rnd()*2:e.vcd)-dt; const dx=P.x-e.x, dy=P.y-e.y; if(e.vcd<=0&&Math.abs(dx)<9*T&&Math.abs(dx)>1.5*T&&Math.abs(dy)<4*T){ e.vcd=(d.vomit?3.2:5.5)+rnd()*2; e.dir=dx>0?1:-1; e.vomitT=0.5; vomitAt(e,P.x+P.w/2,P.y+P.h-4); } if(e.vomitT>0) e.vomitT-=dt; } }
  for(const p of G.parts){ if(p.fly&&p.ox){ const e=p.ox; p.x=e.x+e.w/2+Math.sin(G.clock*9+p.ph)*9; p.y=e.y+2+Math.cos(G.clock*13+p.ph)*5; } }
}
// ---- Risse ----
function buildCracks(){ const R=rngSeed(1337); for(let s=0;s<5;s++){ const c=mkCanvas(T,T), g=c.getContext('2d'); g.fillStyle='rgba(0,0,0,0.62)'; const lines=2+s*2; const R2=rngSeed(77);
    for(let l=0;l<lines;l++){ let x=7+((R2()*3)|0), y=7+((R2()*3)|0); const a=R2()*Math.PI*2; const len=3+s*1.6+R2()*3; for(let k=0;k<len;k++){ g.fillRect(x|0,y|0,1,1); x+=Math.cos(a+(R2()-0.5)*1.2); y+=Math.sin(a+(R2()-0.5)*1.2); } }
    if(s>=3){ g.fillStyle='rgba(255,255,255,0.12)'; for(let i=0;i<6;i++) g.fillRect((R()*14)|0,(R()*14)|0,1,1); } FXS.crack.push(c); } }
// ---- Nebel ----
function buildFog(){ const W=512,H=56; const c=mkCanvas(W,H), g=c.getContext('2d'); const R=rngSeed(4242);
  for(let i=0;i<70;i++){ const x=R()*W, y=H*0.45+R()*H*0.4, r=14+R()*26; for(const xx of [x,x-W,x+W]){ const gr=g.createRadialGradient(xx,y,0,xx,y,r); gr.addColorStop(0,'rgba(200,205,210,0.16)'); gr.addColorStop(1,'rgba(200,205,210,0)'); g.fillStyle=gr; g.fillRect(xx-r,y-r,r*2,r*2); } }
  const lg=g.createLinearGradient(0,0,0,H); lg.addColorStop(0,'rgba(0,0,0,1)'); lg.addColorStop(0.35,'rgba(0,0,0,1)'); lg.addColorStop(1,'rgba(0,0,0,0.5)'); g.globalCompositeOperation='destination-in'; g.fillStyle=lg; g.fillRect(0,0,W,H); FXS.fog=c; }
function drawFog(ox,oy){ if(!FXS.fog) buildFog(); const sky=G.w.sky; const h=hour(); const morning=h>=4&&h<9; const night=isNight(); const a=(morning?0.85:night?0.6:0.38)*(G.bloodmoon?1.2:1);
  const x0=Math.max(0,Math.floor(-ox/T)), x1=Math.min(G.w.W-1,Math.ceil((G.VW-ox)/T)); const drift=G.clock*6; ctx.save(); ctx.globalAlpha=a; if(G.bloodmoon) ctx.filter='none';
  for(let x=x0;x<=x1;x++){ const sy=sky[x]*T+oy-38; if(sy>G.VH||sy<-60) continue; const src=((x*T+drift)%512+512)%512; const w=Math.min(T,512-src); ctx.drawImage(FXS.fog,src,0,w,56,x*T+ox,sy,w,56); if(w<T) ctx.drawImage(FXS.fog,0,0,T-w,56,x*T+ox+w,sy,T-w,56); }
  ctx.restore(); }
// ---- Zeichnen ----
function drawDecals(ox,oy){ const ds=G.decals; let rm=false; for(const d of ds){ const t=tget(d.tx,d.ty); if(!t||!TILES[t].s){ d.gone=true; rm=true; continue; } const x=d.x+ox, y=d.y+oy; if(x<-4||y<-4||x>G.VW+4||y>G.VH+4) continue; ctx.fillStyle=d.col; ctx.fillRect(x,y,d.sz,d.sz); } if(rm) G.decals=ds.filter(d=>!d.gone); }
function drawPuddles(ox,oy){ for(const q of G.puddles){ const a=Math.min(1,q.life/3); const x=Math.round(q.x+ox), y=Math.round(q.y+oy); const w=Math.round(q.w); ctx.globalAlpha=a; ctx.fillStyle='#3aa010'; ctx.fillRect(x-w/2|0,y-2,w,2); ctx.fillStyle='#8cff3a'; ctx.fillRect((x-w/2|0)+2,y-3,w-4,2); ctx.fillStyle='#d8ffb0'; const b=Math.floor(G.clock*3+q.ph)%w; ctx.fillRect((x-w/2|0)+((b*7)%(w-2)),y-3,1,1); ctx.globalAlpha=1; } }
function drawDebris(ox,oy){ for(const b of G.debris){ const tex=GFX.tiles[b.tile]&&GFX.tiles[b.tile][b.v]; if(!tex) continue; ctx.save(); ctx.translate(Math.round(b.x+ox),Math.round(b.y+oy)); ctx.rotate(b.rot); if(b.chip){ ctx.globalAlpha=Math.min(1,b.life*3); const q=b.q; ctx.drawImage(tex,(q%2)*8,(q>>1)*8,8,8,-3,-3,6,6); } else { ctx.drawImage(tex,0,2,16,12,-8,-6,16,12); ctx.fillStyle='#c8a878'; ctx.fillRect(-8,-6,1,12); ctx.fillRect(7,-6,1,12); } ctx.restore(); } }
function drawCorpses(ox,oy){ for(const c of G.corpses){ const k=Math.min(1,c.age/0.4); const e=k<1?1-Math.pow(1-k,3):1; const bounce=c.age>0.4&&c.age<0.6?Math.sin((c.age-0.4)/0.2*Math.PI)*2:0; const alpha=c.age>3?Math.max(0,1-(c.age-3)/1.2):1;
    ctx.save(); ctx.globalAlpha=alpha; ctx.translate(Math.round(c.x+ox),Math.round(c.y+oy-bounce));
    if(c.boss){ ctx.translate(0,Math.round(c.age*6)); drawSprite(ctx,c.id,'i',0,0,c.dir,{flash:Math.floor(c.age*10)%2===0,rad:c.rad}); }
    else if(c.crea){ ctx.translate(0,-c.h/2); ctx.scale(1,1-2*e); ctx.translate(0,c.h/2); drawSprite(ctx,c.id,c.fr,0,0,c.dir,{flash:c.age<0.12,rad:c.rad}); }
    else { ctx.rotate(-c.dir*e*Math.PI/2); ctx.translate(0,-Math.round(e*5)); drawSprite(ctx,c.id,'i',0,0,c.dir,{flash:c.age<0.12,rad:c.rad}); }
    ctx.restore(); } }
function drawSwing(ox,oy){ const P=G.player; const d=heldDef(); if(!(P.attackT>0)||!d||d.ranged||P.dead) return; if(!(d.type==='weapon'||d.tool)) return; if(G.mineT&&!d.dmg) return;
  const prog=1-Math.max(0,P.attackT)/0.2; const cx=P.x+P.w/2+ox, cy=P.y+18+oy; const a0=-2.0, a1=0.6; const cur=a0+(a1-a0)*Math.min(1,prog); const R=d.type==='weapon'?20:16;
  for(let i=0;i<12;i++){ const a=cur-i*0.11; if(a<a0) break; const al=(1-i/12)*0.75*(1-prog*0.5); const x=cx+Math.cos(a)*R*P.dir, y=cy+Math.sin(a)*R; ctx.globalAlpha=al; ctx.fillStyle=i<2?'#fff':'#d8d0c0'; ctx.fillRect(Math.round(x),Math.round(y),2,2); const x2=cx+Math.cos(a)*(R-3)*P.dir, y2=cy+Math.sin(a)*(R-3); ctx.fillRect(Math.round(x2),Math.round(y2),1,1); } ctx.globalAlpha=1; }
drawDrops=function(ox,oy){ for(const d of G.drops){ const ic=GFX.icons[d.id]; if(!ic) continue; const x=Math.round(d.x+ox+4), y=Math.round(d.y+oy+8+Math.sin(G.clock*3+d.x)*1.5);
    ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.fillRect(x-4,Math.round(d.y+oy+8),8,1); ctx.drawImage(ic,x-6,y-12,12,12);
    const gl=(G.clock*0.7+d.x*0.01)%2; if(gl<0.25){ ctx.fillStyle='rgba(255,255,230,0.9)'; ctx.fillRect(x-5+gl*40|0,y-11+gl*36|0,1,1); ctx.fillRect(x+3,y-10,1,1); } } };
render=function(){ ctx.imageSmoothingEnabled=false; fxEnsure(); const sh=G.cam.shake; const sx=sh?(rnd()-0.5)*sh:0, sy=sh?(rnd()-0.5)*sh:0;
  ctx.save(); ctx.translate(Math.round(sx),Math.round(sy)); drawBackground(); skyHaze(); const v=drawWorld(); const ox=v.ox, oy=v.oy;
  drawDecals(ox,oy); drawPuddles(ox,oy); drawCorpses(ox,oy);
  for(const e of G.ents){ if(e.dead) continue; if(e.x+ox<-80||e.x+ox>G.VW+80||e.y+oy<-80||e.y+oy>G.VH+80) continue; drawEnt(e,ox,oy); }
  drawPlayer(ox,oy); drawSwing(ox,oy); drawDebris(ox,oy); drawDrops(ox,oy); drawProj(ox,oy); drawParts(ox,oy); drawFog(ox,oy);
  drawLight(v); drawAim(ox,oy); UI.floats(ox+Math.round(sx),oy+Math.round(sy));
  const P=G.player; if(inWater(P,true)){ ctx.fillStyle='rgba(30,90,170,0.25)'; ctx.fillRect(0,0,G.VW,G.VH); }
  if(P.warm<25){ ctx.fillStyle=`rgba(180,220,255,${(25-P.warm)/25*0.25})`; ctx.fillRect(0,0,G.VW,G.VH); }
  if(P.hp<maxHp()*0.25){ ctx.fillStyle=`rgba(160,0,0,${0.15+Math.sin(G.clock*5)*0.08})`; ctx.fillRect(0,0,G.VW,G.VH); }
  if(G.hurtFlash>0){ ctx.fillStyle=`rgba(140,0,0,${G.hurtFlash*0.6})`; ctx.fillRect(0,0,G.VW,G.VH); }
  ctx.restore(); grade(); drawVignette(); };
function skyHaze(){ const dl=dayLight(); ctx.fillStyle=G.bloodmoon?'rgba(60,0,0,0.2)':`rgba(78,64,48,${0.18+dl*0.22})`; ctx.fillRect(-8,-8,G.VW+16,G.VH+16); }
function grade(){ ctx.save(); ctx.globalCompositeOperation='saturation'; ctx.globalAlpha=0.28; ctx.fillStyle='#808080'; ctx.fillRect(0,0,G.VW,G.VH); ctx.globalCompositeOperation='multiply'; ctx.globalAlpha=1; ctx.fillStyle='#e0d4c4'; ctx.fillRect(0,0,G.VW,G.VH); ctx.restore(); }
function drawVignette(){ if(!FXS.vig||FXS.vig.width!==G.VW||FXS.vig.height!==G.VH){ const c=mkCanvas(G.VW,G.VH), g=c.getContext('2d'); const gr=g.createRadialGradient(G.VW/2,G.VH/2,Math.min(G.VW,G.VH)*0.45,G.VW/2,G.VH/2,Math.max(G.VW,G.VH)*0.72); gr.addColorStop(0,'rgba(0,0,0,0)'); gr.addColorStop(1,'rgba(8,4,2,0.55)'); g.fillStyle=gr; g.fillRect(0,0,G.VW,G.VH); FXS.vig=c; } ctx.drawImage(FXS.vig,0,0); }
