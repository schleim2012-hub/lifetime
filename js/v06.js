// Lifetime 0.6 – Alles abbaubar + Physik (fallender Sand/Kies, Wasser, Statik, Trümmer, Ragdolls, Explosionen, Drops)
'use strict';
const V06={fq:[],sq:[],fb:[],rags:[],sc:0};
// ---------- 1) Kacheln: fehlende Drops, Kies ----------
defT(83,{n:'Kies',h:1.2,tool:'hand',drop:['kies',1],c:'#8a8680',falls:true});
I('kies',{n:'Kies',type:'block',tile:83,d:'Rieselt nach unten, wenn nichts darunter ist.'});
I('schnee',{n:'Schnee',type:'block',tile:47,d:'Kalt. Stapelbar.'});
I('asphalt',{n:'Asphaltbrocken',type:'block',tile:33});
TILES[4].falls=true; TILES[83].falls=true;
const DROP6={12:['glas',1],47:['schnee',1],29:['bretter',2],42:['eisen',2],43:['schrott',3],44:['bretter',2],48:['knochen',2],38:['stahl',3],33:['asphalt',1],80:['holz',2],81:['verkohltes_holz',2]};
for(const k in DROP6){ if(TILES[k]&&!TILES[k].drop) TILES[k].drop=DROP6[k]; } TILES[33].drop=['asphalt',1];
NATURAL.add(83); NATURAL.add(76);
(function(){ const c=[0,1,2,3].map(v=>{ const cv=mkCanvas(T,T), g=cv.getContext('2d'); const r=rngSeed(830+v*17); g.fillStyle='#7a7670'; g.fillRect(0,0,T,T); for(let i=0;i<34;i++){ g.fillStyle=['#9a968e','#5e5a54','#aaa69e','#6e6a64'][i%4]; const s=1+(r()*2|0); g.fillRect(r()*T|0,r()*T|0,s,s); } return cv; }); GFX.tiles[83]=c; })();
// Wände: alle abbaubar, auch mit der Hand (langsamer); passende Drops
const WALLDROP={1:'erde',2:'holzwand',3:'ziegelwand',4:'betonwand',5:'steinwand',6:'stoff',7:'stoff'};
// ---------- 2) Deko abbauen (Flugzeug, Masten, Zäune, Bäume im Hintergrund, Felsen …) ----------
const DECO6={plane:{n:'Flugzeugwrack',h:40,tool:'pick',drops:[['schrott',20,30],['eisen',6,10],['kabel',3,5],['elektronik',2,4],['stoff',3,5],['reifen',2,3],['stahl',1,3]]},
  mast:{n:'Strommast',h:6,tool:'axe',drops:[['holz',5,7],['kabel',2,4],['eisen',1,1]]}, zaun:{n:'Zaun',h:1.5,tool:'axe',drops:[['bretter',1,2]]}, maschenzaun:{n:'Maschendrahtzaun',h:3,tool:'pick',drops:[['draht',1,1],['eisen',1,1]]},
  gatter:{n:'Holzgatter',h:1.5,tool:'axe',drops:[['holz',1,2]]}, schild:{n:'Schild',h:2,tool:'pick',drops:[['eisen',1,1],['schrott',1,2]]}, kaktus:{n:'Kaktus',h:0.8,tool:'hand',drops:[['kaktusfrucht',1,2],['faser',1,2]]},
  totbaum:{n:'Toter Baum',h:3,tool:'axe',drops:[['holz',3,5]]}, kiefer:{n:'Kiefer',h:4,tool:'axe',drops:[['holz',4,6],['faser',1,2]]}, schneekiefer:{n:'Verschneite Kiefer',h:4,tool:'axe',drops:[['holz',4,6],['eiskristall',0,1]]},
  fass2:{n:'Fass',h:2,tool:'pick',drops:[['schrott',2,3],['eisen',1,1],['benzin',0,1]]}, reifenstapel:{n:'Reifenstapel',h:2,tool:'hand',drops:[['reifen',2,3]]}, fels:{n:'Felsen',h:4,tool:'pick',drops:[['stein',4,7],['eisenerz',0,1]]},
  schaedel:{n:'Schädel',h:0.5,tool:'hand',drops:[['knochen',1,3]]}, laterne2:{n:'Straßenlaterne',h:4,tool:'pick',drops:[['eisen',2,3],['kabel',1,2],['glas',0,1]]}, pylone:{n:'Leitkegel',h:0.5,tool:'hand',drops:[['schrott',1,1]]},
  briefkasten:{n:'Briefkasten',h:2,tool:'pick',drops:[['eisen',1,1],['schrott',1,1]]}};
function decoBox(d){ const img=d.k==='plane'?ART5I.plane:d.k==='mast'?ART5I.props.mast:ART5I.props[d.k]; if(!img||!img.naturalWidth) return null; const w=img.naturalWidth,h=img.naturalHeight; return d.k==='mast'?{x0:d.x-6,x1:d.x+6,y0:d.y-h+2,y1:d.y}:{x0:d.x-w/2+(d.k==='plane'?20:2),x1:d.x+w/2-(d.k==='plane'?20:2),y0:d.y-h+(d.k==='plane'?30:2),y1:d.y}; }
function decoAt(wx,wy,pad){ const f=G.w.feat; if(!f.deco) return null; pad=pad||0; let best=null;
  const test=(d,kind)=>{ if(d.gone||!DECO6[kind]) return; const b=decoBox(kind==='mast'?{k:'mast',x:d.x,y:d.y}:d); if(!b) return; if(wx>=b.x0-pad&&wx<=b.x1+pad&&wy>=b.y0-pad&&wy<=b.y1+pad){ const area=(b.x1-b.x0)*(b.y1-b.y0); if(!best||area<best.area) best={d,kind,area,b}; } };
  for(const d of f.deco) test(d,d.k); for(const p of f.poles||[]) test(p,'mast'); return best; }
function mineDeco(hit,dt){ const P=G.player; const D=DECO6[hit.kind]; const cx=(hit.b.x0+hit.b.x1)/2; if(Math.abs(cx-(P.x+P.w/2))>Math.max(5*T,(hit.b.x1-hit.b.x0)/2+3*T)) return false;
  const it=heldDef(); const tools=it.tool||{}; let pw=tools[D.tool]||(D.tool==='hand'?(tools.hand||1):Math.max(0.2,(tools.pick||tools.axe||0)*0.6||0.15));
  pw*=(1+P.sk.staerke*0.15); const m=G.decoT&&G.decoT.d===hit.d?G.decoT:(G.decoT={d:hit.d,p:0,snd:0}); m.p+=dt*pw/(D.h*0.55); m.snd-=dt; P.attackT=0.2; P.stam-=dt*4; P.dir=cx>P.x+P.w/2?1:-1;
  if(m.snd<=0){ m.snd=0.25; sfx(D.tool==='axe'?'chop':D.tool==='pick'?'mine':'hit'); partBurst(cx+(Math.random()-0.5)*(hit.b.x1-hit.b.x0)*0.6,hit.b.y0+(hit.b.y1-hit.b.y0)*Math.random(),hit.kind==='plane'?'#bbb':'#7a6a52',4,90); G.cam.shake=Math.max(G.cam.shake,1); }
  hit.d.dmg=m.p; if(m.p>=1){ hit.d.gone=true; G.decoT=null; for(const [id,a,b] of D.drops){ const n=a+Math.floor(Math.random()*(b-a+1)); if(n>0&&ITEMS[id]) spawnDrop(id,n,cx+(Math.random()-0.5)*20,hit.b.y1-12); }
    const w=hit.b.x1-hit.b.x0, h=hit.b.y1-hit.b.y0; for(let i=0;i<Math.min(60,8+w*h/300);i++) G.parts.push({x:hit.b.x0+Math.random()*w,y:hit.b.y0+Math.random()*h,vx:(Math.random()-0.5)*140,vy:-Math.random()*140,life:0.9,col:hit.kind==='plane'?['#ccc','#888','#a33'][i%3]:['#7a6a52','#5a4a3a','#9a8a72'][i%3],sz:2,grav:500});
    sfx('brk'); if(hit.kind==='plane'||hit.kind==='mast'){ sfx('treefall'); G.cam.shake=6; } msg(D.n+' abgebaut.','#cfd8dc'); }
  return true; }
// Deko mit Schadensanzeige zeichnen + entfernte ausblenden
const _drawDeco6=drawDeco5;
drawDeco5=function(){ const f=G.w&&G.w.feat; if(!f||!f.deco) return; const keepD=f.deco, keepP=f.poles; f.deco=keepD.filter(d=>!d.gone); if(keepP) f.poles=keepP.filter(p=>!p.gone); try{ _drawDeco6(); } finally { f.deco=keepD; f.poles=keepP; }
  const m=G.decoT; if(m&&m.p>0){ const hit=decoAt(m.d.x,m.d.y-4,40); if(hit){ const ox=-Math.round(G.cam.x), oy=-Math.round(G.cam.y); const b=hit.b; ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(Math.round((b.x0+b.x1)/2+ox-12),Math.round(b.y0+oy-6),24,3); ctx.fillStyle='#ffd54f'; ctx.fillRect(Math.round((b.x0+b.x1)/2+ox-12),Math.round(b.y0+oy-6),Math.round(24*m.p),3); } } };
// Benutzen/Abbauen erweitern: Deko und alle Hintergrundwände
const _useHeld6=useHeld;
useHeld=function(dt,wx,wy,fresh){ const P=G.player; if(P.dead||!G.w) return _useHeld6(dt,wx,wy,fresh); const id=heldItem(); const d=ITEMS[id]||ITEMS.hand;
  const isTool=!(d.type==='block'||d.type==='wall'||d.type==='food'||d.type==='book'||d.type==='summon'||d.ranged||d.type==='throw'||id==='flasche'||d.type==='ammo'||d.type==='misc');
  if(isTool){ let px=wx, py=wy; if(px==null){ px=P.x+P.w/2+P.dir*14; py=P.y+P.h*0.6; }
    const tx=Math.floor(px/T), ty=Math.floor(py/T); const t=tget(tx,ty);
    if(t===0||t===5){ // kein Block getroffen: Gegner zuerst, dann Deko, dann Wand
      const e=wx!=null?entAt(wx,wy,8):nearestHostile((d.reach||2)*T+6,true); if(!e){
        const hit=decoAt(px,py,wx==null?10:2); if(hit&&mineDeco(hit,dt)) return;
        const b=bget(tx,ty); if(b&&reachOK(tx,ty,5)){ const tools=d.tool||{}; const sp=tools.pick||tools.axe?2:1.1; G.wallT=G.wallT&&G.wallT.x===tx&&G.wallT.y===ty?G.wallT:{x:tx,y:ty,p:0}; G.wallT.p+=dt*sp; P.attackT=0.2; if(G.wallT.snd==null||(G.wallT.snd-=dt)<=0){ G.wallT.snd=0.25; sfx('hit'); partBurst(tx*T+8,ty*T+8,WALLS[b].c,3,60); }
          if(G.wallT.p>=1){ bset(tx,ty,0); const it=WALLS[b].item||WALLDROP[b]; if(it&&ITEMS[it]) spawnDrop(it,1,tx*T+8,ty*T+8); sfx('brk'); G.wallT=null; } return; } } } }
  G.decoT=null; return _useHeld6(dt,wx,wy,fresh); };
// ---------- 3) Abbau-Ergänzungen: Blätter einzeln, Halter fallen ab, Statik, Rieseln ----------
const NEEDS_FLOOR=new Set([22,23,24,25,26,27,28,29,31,35,36,37,39,41,42,43,44,45,48,52,55,79,21]);
const _breakTile6=breakTile;
breakTile=function(tx,ty,byP){ const t=tget(tx,ty); const d=TILES[t]; if(!t||t===17) return;
  if(d&&d.leaf){ // einzelnes Blatt: nicht den ganzen Baum fällen
    tset(tx,ty,0); sfx('hit'); for(let i=0;i<5;i++) G.parts.push({x:tx*T+Math.random()*16,y:ty*T+Math.random()*16,vx:(Math.random()-0.5)*60,vy:-Math.random()*40,life:1.4,col:d.c,sz:2,grav:110,leaf:true,ph:Math.random()*6});
    if(byP&&Math.random()<0.35) spawnDrop('faser',1,tx*T+8,ty*T); if(byP&&t===7&&Math.random()<0.06) spawnDrop('beeren',1,tx*T+8,ty*T); updSky(tx); return; }
  const wasSolid=d&&d.s; _breakTile6(tx,ty,byP); if(tget(tx,ty)!==0) return; afterRemove6(tx,ty,wasSolid); };
function afterRemove6(tx,ty,wasSolid){ V06.sq.push([tx,ty-1]); // Rieseln über der Lücke
  const up=tget(tx,ty-1); if(NEEDS_FLOOR.has(up)||(TILES[up]&&TILES[up].furn&&TILES[up].fa==='floor')) V06.fq.push([tx,ty-1]);
  if(wasSolid){ for(const [dx,dy] of [[0,-1],[1,0],[-1,0],[0,1]]) structCheck6(tx+dx,ty+dy); } }
// Statik: Bau-Blöcke ohne Verbindung zu natürlichem Boden stürzen ein
const BUILD6=new Set([8,10,11,12,13,18,30,32,19,20,77]);
function grounded6(t){ const d=TILES[t]; return t===17||NATURAL.has(t)||!!(d&&d.s&&!BUILD6.has(t)&&!d.tree&&!d.leaf&&!d.liquid); }
// Vorgefertigte Ruinen der Weltgenerierung gelten als verankert (sonst würden sie bei der ersten Berührung einstürzen)
function anchScan6(w){ const W=w.W,H=w.H, seen=new Uint8Array(W*H), out=[];
  for(let i=0;i<W*H;i++){ if(seen[i]||!BUILD6.has(w.tiles[i])) continue; const st=[i], comp=[]; let sup=false; while(st.length){ const k=st.pop(); if(seen[k]) continue; seen[k]=1; comp.push(k); const x=k%W,y=(k/W)|0; for(const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]]){ const nk=(y+dy)*W+x+dx; if(nk<0||nk>=W*H) continue; const nt=w.tiles[nk]; if(grounded6(nt)&&!(dy===-1&&TILES[nt].falls)) sup=true; if(BUILD6.has(nt)&&!seen[nk]) st.push(nk); } }
    if(!sup&&comp.length<=700) for(const k of comp) out.push(k); }
  return out; }
function anchSet6(){ const w=G.w; if(V06.anW!==w){ if(!w.feat.anch) w.feat.anch=anchScan6(w); V06.anS=new Set(w.feat.anch); V06.anW=w; } return V06.anS; }
function structCheck6(sx,sy){ const t0=tget(sx,sy); if(!BUILD6.has(t0)) return; const seen=new Set(), list=[], st=[[sx,sy]]; const W=G.w.W; const AN=anchSet6();
  while(st.length){ const [x,y]=st.pop(); const k=y*W+x; if(seen.has(k)) continue; seen.add(k); const t=tget(x,y); if(!BUILD6.has(t)) continue; list.push([x,y,t]); if(list.length>700||AN.has(k)) return; // groß genug = trägt
    for(const [dx,dy] of [[0,1],[1,0],[-1,0],[0,-1]]){ const nt=tget(x+dx,y+dy); if(grounded6(nt)&&!(dy===-1&&TILES[nt].falls)) return; if(BUILD6.has(nt)) st.push([x+dx,y+dy]); } }
  if(!list.length) return; collapse6(list); }
function collapse6(list){ list.sort((a,b)=>b[1]-a[1]); msg(list.length>6?'Die Konstruktion stürzt ein!':'Das bricht weg!','#ffab40'); sfx('treefall'); G.cam.shake=Math.max(G.cam.shake,Math.min(9,2+list.length/6));
  for(const [x,y,t] of list){ _tset5(x,y,0); if(V06.fb.length<260) V06.fb.push({t,x:x*T,y:y*T,vx:(Math.random()-0.5)*20,vy:-Math.random()*30,rot:0,vr:(Math.random()-0.5)*2,mode:'break',delay:Math.random()*0.25}); else { const dr=TILES[t].drop; if(dr&&Math.random()<0.5) spawnDrop(dr[0],1,x*T+8,y*T); } V06.fq.push([x,y-1]); V06.sq.push([x,y-1]); }
  for(const [x] of list) updSky(x); }
// Rieseln: Sand/Kies ohne Halt werden fallende Blöcke
function fallTick6(){ let n=0; while(V06.sq.length&&n<60){ n++; const [x,y]=V06.sq.shift(); const t=tget(x,y); if(!TILES[t]||!TILES[t].falls) continue; const b=tget(x,y+1); if(b===0||b===5||(TILES[b]&&!TILES[b].s&&!TILES[b].plat&&!NEEDS_FLOOR.has(b)&&!TILES[b].tree)){ _tset5(x,y,0); updSky(x); V06.fb.push({t,x:x*T,y:y*T,vx:0,vy:0,rot:0,vr:0,mode:'settle',delay:0}); V06.sq.push([x,y-1]); } }
  let m=0; while(V06.fq.length&&m<40){ m++; const [x,y]=V06.fq.shift(); const t=tget(x,y); const d=TILES[t]; if(!t||!d) continue; if(!(NEEDS_FLOOR.has(t)||(d.furn&&d.fa==='floor'))) continue; const b=TILES[tget(x,y+1)]; if(b&&(b.s||b.plat)) continue; if(t===21&&bget(x,y)) continue; // Fackel an Wand hält
    _breakTile6(x,y,true); afterRemove6(x,y,false); } }
// Fallende Blöcke
function fbUpdate6(dt){ const P=G.player; for(const f of V06.fb){ if(f.delay>0){ f.delay-=dt; continue; } f.vy=Math.min(f.vy+GRAV*dt,560); f.x+=f.vx*dt; const ny=f.y+f.vy*dt; f.rot+=f.vr*dt;
    const tx=Math.floor((f.x+8)/T), tyB=Math.floor((ny+T)/T); const bt=tget(tx,tyB);
    if(P&&!P.dead&&f.vy>120&&f.x+14>P.x&&f.x+2<P.x+P.w&&ny+T>P.y&&ny<P.y+P.h){ if(!(P.hitFB>0)){ hurtPlayer(f.mode==='break'?8:5,{x:f.x}); P.hitFB=0.5; } }
    for(const e of G.ents){ if(e.dead||e.kind!=='mob'||f.vy<120) continue; if(f.x+14>e.x&&f.x+2<e.x+e.w&&ny+T>e.y&&ny<e.y+e.h&&!(e.hitFB>0)){ e.hitFB=0.5; hurtMob(e,14,null,60); } }
    if(TILES[bt]&&(TILES[bt].s||bt===5&&f.mode==='settle'&&false)){ const gy=tyB-1; if(f.mode==='settle'){ let yy=gy; while(yy>0&&tget(tx,yy)!==0&&tget(tx,yy)!==5) yy--; _tset5(tx,yy,f.t); updSky(tx); V06.sq.push([tx,yy]); sfx('thud'); partBurst(tx*T+8,yy*T+14,TILES[f.t].c,4,50); }
      else { const dr=TILES[f.t].drop; if(dr&&Math.random()<0.6) spawnDrop(dr[0],Math.max(1,Math.round(dr[1]*0.6)),f.x+8,gy*T+4); sfx('brk'); partBurst(f.x+8,gy*T+12,TILES[f.t].c,8,140); for(let q=0;q<4;q++) G.debris.push({tile:f.t,v:q,x:f.x+8,y:gy*T+8,vx:(Math.random()-0.5)*120,vy:-60-Math.random()*80,rot:0,vr:(Math.random()-0.5)*12,t:0,chip:true,q,life:0.8+Math.random()*0.5}); }
      f.done=true; continue; } f.y=ny; if(f.y>G.w.H*T) f.done=true; }
  V06.fb=V06.fb.filter(f=>!f.done); if(P&&P.hitFB>0) P.hitFB-=dt; for(const e of G.ents) if(e.hitFB>0) e.hitFB-=dt; }
function fbDraw6(ox,oy){ for(const f of V06.fb){ const tex=GFX.tiles[f.t]&&GFX.tiles[f.t][((f.x/T)|0)&3]; if(!tex) continue; ctx.save(); ctx.translate(Math.round(f.x+ox+8),Math.round(f.y+oy+8)); if(f.rot) ctx.rotate(f.rot); ctx.drawImage(tex,-8,-8); ctx.restore(); } }
// ---------- 4) Wasser: fließt seitlich, füllt Becken ----------
updateWater=function(){ if(((G.clock*8)|0)===G.lastWater) return; G.lastWater=(G.clock*8)|0; const w=G.w, W=w.W, c=G.cam; const x0=Math.max(1,Math.floor(c.x/T)-24), x1=Math.min(W-2,x0+Math.ceil(G.VW/T)+48), y0=Math.max(1,Math.floor(c.y/T)-16), y1=Math.min(w.H-2,y0+Math.ceil(G.VH/T)+32);
  const moved=new Set(); const flip=(G.lastWater&1)?1:-1; let ops=0;
  for(let y=y1;y>=y0;y--){ for(let i=0;i<=x1-x0;i++){ const x=flip>0?x0+i:x1-i; const k=y*W+x; if(w.tiles[k]!==5||moved.has(k)) continue;
      const below=w.tiles[k+W]; if(below===0){ w.tiles[k+W]=5; w.tiles[k]=0; moved.add(k+W); ops++; continue; }
      if(below===5||TILES[below].s){ // seitlich: erst schräg runter, dann flach, aber nur wenn dadurch der Pegel sinkt
        const dirs=Math.random()<0.5?[1,-1]:[-1,1]; let done=false; for(const dr of dirs){ if(w.tiles[k+dr]===0&&w.tiles[k+dr+W]===0){ w.tiles[k+dr+W]=5; w.tiles[k]=0; moved.add(k+dr+W); done=true; ops++; break; } } if(done) continue;
        for(const dr of dirs){ if(w.tiles[k+dr]!==0) continue; // flach verteilen: nur wenn oben keine Wassersäule drückt oder Nachbar tiefer frei ist
          let far=0; for(let s=1;s<12;s++){ const kk=k+dr*s; if(w.tiles[kk]!==0) break; if(w.tiles[kk+W]===0){ far=s; break; } }
          const above=w.tiles[k-W]===5; if(far||above){ w.tiles[k+dr]=5; w.tiles[k]=0; moved.add(k+dr); ops++; break; } } } }
    if(ops>900) break; } };
// ---------- 5) Explosionen zerstören Blöcke + Trümmer ----------
const _explode6=explode;
explode=function(x,y,r,dmg,own){ sfx('boom'); G.cam.shake=8; for(let i=0;i<30;i++) G.parts.push({x,y,vx:(Math.random()-0.5)*300,vy:(Math.random()-0.7)*300,life:0.6+Math.random()*0.4,col:['#ff6a00','#ffb300','#555','#fff59d'][i%4],sz:2,grav:200,light:0.8});
  const P=G.player; if(Math.hypot(P.x+P.w/2-x,P.y+P.h/2-y)<r*T) hurtPlayer(dmg,{x});
  for(const e of G.ents){ if(e.dead||e.kind!=='mob') continue; if(Math.hypot(e.x+e.w/2-x,e.y+e.h/2-y)<r*T*1.2){ e.lastHitBig=1; e.lastHitDir=e.x+e.w/2>x?1:-1; hurtMob(e,dmg*(own==='p'?1:0.6),own==='p'?P:{x},260); } }
  const tx=Math.floor(x/T), ty=Math.floor(y/T), R=Math.ceil(r); const hits=[];
  for(let a=-R;a<=R;a++) for(let b=-R;b<=R;b++){ if(a*a+b*b>r*r) continue; const t=tget(tx+a,ty+b); const d=TILES[t]; if(!t||t===17||t===5||!d||d.h>=12) continue; if(d.loot&&t!==29) continue; hits.push([tx+a,ty+b,t]); }
  for(const [hx,hy,t] of hits){ const d=TILES[t]; if(d.tree){ breakTile(hx,hy,false); continue; } _tset5(hx,hy,0); updSky(hx);
    if(V06.fb.length<260&&d.s&&Math.random()<0.45){ const ang=Math.atan2(hy*T-y,hx*T-x); V06.fb.push({t,x:hx*T,y:hy*T,vx:Math.cos(ang)*(120+Math.random()*120),vy:Math.sin(ang)*160-120,rot:0,vr:(Math.random()-0.5)*14,mode:'break',delay:0}); }
    else if(d.drop&&Math.random()<0.35) spawnDrop(d.drop[0],1,hx*T+8,hy*T+8); }
  for(const [hx,hy] of hits){ afterRemove6(hx,hy,true); }
  // Ragdoll-Schub für Gegner in der Nähe
  for(const e of G.ents){ if(e.kind!=='mob') continue; const dx=e.x+e.w/2-x, dy=e.y+e.h/2-y, L=Math.hypot(dx,dy)||1; if(L<r*T*1.6){ const k=(1-L/(r*T*1.6)); e.vx+=dx/L*360*k; e.vy-=220*k; e.lastHitBig=1; } }
  G.cam.shake=Math.max(G.cam.shake,10); };
// ---------- 6) Ragdolls: starke Treffer schleudern Gegner weg ----------
const _hurtMob6=hurtMob;
hurtMob=function(e,dmg,src,kb){ if(e&&e.kind==='mob'&&!e.dead){ const big=dmg>=Math.max(18,e.maxhp*0.35)||kb>=200; e.lastHitBig=big?1:(e.lastHitBig||0); if(src&&src.x!=null){ e.lastHitDir=(e.x>src.x?1:-1); } if(big&&!e.dead){ const d=MOBS[e.t]; if(!d.boss){ e.vy=Math.min(e.vy,-140); e.vx+=(e.lastHitDir||1)*120; } } }
  return _hurtMob6(e,dmg,src,kb); };
const _killMob6=killMob;
killMob=function(e,src){ const was=e.dead; const n0=G.corpses?G.corpses.length:0; _killMob6(e,src); if(was) return; const d=MOBS[e.t]; if(!d||d.boss||d.fly) return;
  if(e.lastHitBig&&G.corpses&&G.corpses.length>n0){ const c=G.corpses[G.corpses.length-1]; if(c&&c.id===e.t){ G.corpses.pop(); const dir=e.lastHitDir||(src&&src.x!=null?(e.x>src.x?1:-1):1);
      V06.rags.push({id:e.t,x:e.x+e.w/2,y:e.y+e.h,dir:e.dir||1,vx:dir*(160+Math.random()*120)+e.vx*0.3,vy:-200-Math.random()*120,rot:0,vr:dir*(6+Math.random()*6),age:0,h:e.h,rad:e.rad,fr:c.crea?c.fr:'i'}); if(V06.rags.length>10) V06.rags.shift(); } } };
function ragUpdate6(dt){ for(const r of V06.rags){ r.age+=dt; r.vy=Math.min(r.vy+GRAV*dt,600); const nx=r.x+r.vx*dt, ny=r.y+r.vy*dt;
    if(isSolid(nx+Math.sign(r.vx)*6,r.y-6)){ r.vx=-r.vx*0.35; r.vr*=-0.5; } else r.x=nx;
    if(r.vy>0&&isSolid(r.x,ny+1)){ r.y=Math.floor((ny+1)/T)*T; if(r.vy>140){ r.vy=-r.vy*0.32; sfx('hit'); for(let i=0;i<4;i++) G.parts.push({x:r.x,y:r.y,vx:(Math.random()-0.5)*80,vy:-Math.random()*60,life:0.5,col:'#6a0000',sz:2,grav:500}); if(typeof addDecal==='function') addDecal(r.x,r.y+1,'#5a0000',2); } else r.vy=0; r.vx*=0.7; r.vr*=0.6; const tgt=Math.PI/2*Math.sign(r.rot||1); if(Math.abs(r.vy)<30) r.rot+=(tgt-r.rot)*Math.min(1,dt*10); }
    else r.y=ny; r.rot+=r.vr*dt; }
  V06.rags=V06.rags.filter(r=>r.age<5); }
function ragDraw6(ox,oy){ for(const r of V06.rags){ const a=r.age>4?1-(r.age-4):1; ctx.save(); ctx.globalAlpha=Math.max(0,a); ctx.translate(Math.round(r.x+ox),Math.round(r.y+oy-r.h/2)); ctx.rotate(r.rot); try{ drawSprite(ctx,r.id,r.fr||'i',0,r.h/2,r.dir,{flash:r.age<0.1,rad:r.rad}); }catch(e){} ctx.restore(); } }
// ---------- 7) Drops: springen und rollen ----------
updateDrops=function(dt){ const P=G.player;
  for(const d of G.drops){ d.t+=dt; const dx=(P.x+P.w/2)-(d.x+4), dy=(P.y+P.h/2)-(d.y+4); const L=Math.hypot(dx,dy);
    if(L<3*T&&d.t>0.4&&!P.dead){ d.vx=dx/L*200; d.vy=dy/L*200; d.x+=d.vx*dt; d.y+=d.vy*dt; if(L<10){ const left=addItem(d.id,d.n,true,true); UI.refreshHot(); if(left<d.n){ sfx('pick'); pickupText(d.id,d.n-left); } d.n=left; if(left<=0) d.gone=true; } continue; }
    const vy0=d.vy, vx0=d.vx; d.vy=Math.min(d.vy+GRAV*dt,420); moveBody(d,dt);
    if(d.onGround){ if(vy0>90){ d.vy=-vy0*0.38; d.vx=vx0*0.8+(Math.random()-0.5)*20; d.spin=(d.spin||0)+vx0*0.02; } else { d.vx*=Math.pow(0.08,dt); // rollen an Kanten
        const tx=Math.floor((d.x+4)/T), ty=Math.floor((d.y+d.h+1)/T); if(!solidAt(tx+1,ty)&&solidAt(tx,ty)&&((d.x+4)%T)>11) d.vx+=40*dt*6; else if(!solidAt(tx-1,ty)&&solidAt(tx,ty)&&((d.x+4)%T)<5) d.vx-=40*dt*6; } }
    else d.vx*=Math.pow(0.6,dt); if(d.hitWall) d.vx=-vx0*0.4; d.rot=(d.rot||0)+d.vx*dt*0.12; if(d.t>300) d.gone=true; }
  G.drops=G.drops.filter(d=>!d.gone); if(G.drops.length>120) G.drops.splice(0,G.drops.length-120); };
// ---------- Einhängen in Update + Zeichnen ----------
const _update6=update; update=function(dt){ _update6(dt); if(G.hitstop>0) return; try{ fallTick6(); fbUpdate6(dt); ragUpdate6(dt); }catch(e){ console.error(e); } };
const _drawDebris6=drawDebris; drawDebris=function(ox,oy){ _drawDebris6(ox,oy); fbDraw6(ox,oy); ragDraw6(ox,oy); };
// Neue Welt: Kiesnester
const _genWorld6=genWorld; genWorld=function(seed){ const w=_genWorld6(seed); try{ const R=rngSeed((seed|0)+606); const W=w.W,H=w.H; for(let n=0;n<70;n++){ const cx=8+Math.floor(R()*(W-16)); let s=0; while(s<H&&!(TILES[w.tiles[s*W+cx]].s)) s++; const cy=s+4+Math.floor(R()*16); const r=1.5+R()*2.5;
    for(let y=Math.floor(cy-r);y<=cy+r;y++) for(let x=Math.floor(cx-r*1.4);x<=cx+r*1.4;x++){ if(x<1||y<1||x>=W-1||y>=H-1) continue; if(((x-cx)/1.4)**2+(y-cy)**2>r*r) continue; const k=y*W+x; if(w.tiles[k]===1||w.tiles[k]===3) w.tiles[k]=83; } } }catch(e){ console.error(e); } try{ w.feat.anch=anchScan6(w); }catch(e){ console.error(e); } return w; };
// Version
$('tver').textContent='Version 0.6 · Physik';
