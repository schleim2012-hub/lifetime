// Lifetime 0.5 – Teil A: Fehlerbehebungen, Gegnerkurve, Licht-Schutz, Störsender, Bewegung, Werkzeuge
'use strict';
const V05={ver:'0.5'};
// ---------- Nebel: keine senkrechten Streifen mehr ----------
drawFog=function(ox,oy){ if(!FXS.fog) buildFog(); const sky=G.w.sky; const h=hour(); const morning=h>=4&&h<9; const night=isNight(); const a=(morning?0.85:night?0.6:0.38)*(G.bloodmoon?1.2:1);
  const x0=Math.max(0,Math.floor(-ox/T)), x1=Math.min(G.w.W-1,Math.ceil((G.VW-ox)/T)); const drift=G.clock*6; ctx.save(); ctx.globalAlpha=a;
  // geglättete Bodenlinie: Ausreißer (Dächer, Pfosten, Wrack) ignorieren
  const W=G.w.W; const gl=k=>{ const v=[]; for(let i=-3;i<=3;i++){ const xx=Math.max(0,Math.min(W-1,k+i)); v.push(sky[xx]); } v.sort((p,q)=>p-q); return v[5]; };
  for(let x=x0;x<=x1;x++){ const g=gl(x); const sy=g*T+oy-38; if(sy>G.VH||sy<-60) continue; const hh=40; // nur oberhalb des Bodens
    const src=((x*T+drift)%512+512)%512; const w=Math.min(T,512-src); ctx.drawImage(FXS.fog,src,0,w,hh,x*T+ox,sy,w,hh); if(w<T) ctx.drawImage(FXS.fog,0,0,T-w,hh,x*T+ox+w,sy,T-w,hh); }
  ctx.restore(); };
// ---------- Baum fällen: nur dieser eine Baum, inkl. Stumpf ----------
const _fellTree4=fellTree;
fellTree=function(tx,ty){ fxEnsure(); const isLog=t=>t===6||t===V05T.kstamm||t===V05T.vstamm; const isLeaf=t=>TILES[t]&&TILES[t].leaf;
  // Stamm-Spalte(n): nach oben und unten (Stumpf!) bis zum Boden
  const logs=[]; const seenL=new Set(); const st=[[tx,ty]];
  while(st.length&&logs.length<80){ const [x,y]=st.pop(); const k=x+','+y; if(seenL.has(k)) continue; seenL.add(k); if(!isLog(tget(x,y))||Math.abs(x-tx)>2) continue; logs.push([x,y]); st.push([x,y-1],[x,y+1],[x-1,y],[x+1,y]); }
  if(!logs.length) logs.push([tx,ty]);
  const top=logs.reduce((a,b)=>b[1]<a[1]?b:a); const bot=logs.reduce((a,b)=>b[1]>a[1]?b:a);
  // Nachbarstämme schützen: Spalten mit fremdem Stamm
  const foreign=new Set(); for(let x=tx-7;x<=tx+7;x++){ if(Math.abs(x-tx)<=2&&logs.some(l=>l[0]===x)) continue; for(let y=top[1]-8;y<=bot[1];y++){ if(isLog(tget(x,y))&&!seenL.has(x+','+y)){ foreign.add(x); break; } } }
  const leaves=[]; const seen=new Set(); const st2=logs.map(l=>[l[0],l[1]]);
  while(st2.length&&leaves.length<160){ const [x,y]=st2.pop(); const k=x+','+y; if(seen.has(k)) continue; seen.add(k); const t=tget(x,y);
    const own=seenL.has(k); if(!own&&!isLeaf(t)) continue; if(!own){ if(Math.abs(x-tx)>4||y>bot[1]||y<top[1]-7) continue; let nearF=false; for(const f of foreign) if(Math.abs(f-x)<Math.abs(tx-x)) nearF=true; if(nearF) continue; leaves.push([x,y,t]); }
    st2.push([x,y-1],[x-1,y],[x+1,y],[x,y+1]); }
  for(const [x,y] of logs) tset(x,y,0); for(const [x,y] of leaves) tset(x,y,0);
  const P=G.player; const fdir=(P.x+P.w/2)<(tx*T+8)?1:-1;
  for(const [x,y] of logs){ const h=Math.max(0,ty-y); const stump=y>ty; G.debris.push({tile:6,v:(x*7+y*13)&3,x:x*T+8,y:y*T+8,vx:stump?(rnd()-0.5)*30:fdir*(20+h*26)+(rnd()-0.5)*40,vy:stump?-60:-40-rnd()*90-h*6,rot:0,vr:fdir*(1.5+h*0.5)*(0.6+rnd()*0.8),t:0,drop:tget(x,y)===V05T.vstamm?'verkohltes_holz':'holz',n:stump?1:2}); }
  let lc=0; for(const [x,y,t] of leaves){ const c=TILES[t].c||'#2f6a2f'; for(let i=0;i<2&&lc<140;i++,lc++) G.parts.push({x:x*T+rnd()*16,y:y*T+rnd()*16,vx:(rnd()-0.5)*90+fdir*40,vy:-rnd()*90,life:1.6+rnd()*1.6,col:i?c:shadeHex(c,0.75),sz:2,grav:110,leaf:true,ph:rnd()*6}); }
  if(leaves.length>4&&rnd()<0.6) spawnDrop('faser',1+rnd()*3|0,top[0]*T+8,top[1]*T); if(rnd()<0.3) spawnDrop('beeren',1,top[0]*T,top[1]*T-10);
  sfx('treefall'); G.cam.shake=Math.max(G.cam.shake,4);
  for(let i=0;i<10;i++) G.parts.push({x:tx*T+8+(rnd()-0.5)*16,y:bot[1]*T+14,vx:(rnd()-0.5)*60,vy:-rnd()*30,life:0.8+rnd()*0.6,col:'#6a5a48',sz:2,grav:-20,dust:true});
  for(const x of new Set(logs.map(l=>l[0]).concat(leaves.map(l=>l[0])))) updSky(x);
  if(!G.flags.tree){ G.flags.tree=true; msg('Holz! Sammle die Stücke ein und stell dir im Rucksack eine Steinaxt her.','#ffcc80'); } };
// ---------- Neue Kacheln (ab 74) ----------
const V05T={asche:74,oed:75,sandstein:76,stoer:77,fzg:78,kaktus:79,kstamm:80,vstamm:81,schneeg:82};
defT(74,{n:'Asche',h:1,tool:'hand',drop:['erde',1],c:'#3a3634'});
defT(75,{n:'Ödland-Erde',h:1.4,tool:'hand',drop:['erde',1],c:'#8a6248'});
defT(76,{n:'Sandstein',h:3,tool:'pick',drop:['stein',1],c:'#c8a464'});
defT(77,{n:'Störsender',s:false,h:2,tool:'pick',drop:['stoersender',1],light:0.35,lcol:'blue',c:'#4a6a8a',jammer:true});
defT(78,{n:'Fahrzeugwrack',s:false,h:9,tool:'pick',drop:null,c:'#6a5a4a',loot:'fahrzeug',veh:true});
defT(79,{n:'Kaktus',s:false,h:0.8,tool:'hand',drop:['kaktusfrucht',1],c:'#4a8a3a',furn:'kaktus',fa:'floor',trap:4});
defT(80,{n:'Kiefernstamm',s:false,h:2,tool:'axe',drop:['holz',2],c:'#5a3a24',tree:true});
defT(81,{n:'Verkohlter Stamm',s:false,h:1.5,tool:'axe',drop:['verkohltes_holz',2],c:'#2a2220',tree:true});
defT(82,{n:'Schneegras',h:1,tool:'hand',drop:['erde',1],c:'#e8eef4'});
// ---------- Neue Gegenstände ----------
I('autobatterie',{n:'Autobatterie',d:'Schwer, sauer, voller Strom.'}); I('reifen',{n:'Altreifen',d:'Brennt lange und stinkt.'});
I('elektronik',{n:'Elektronik',d:'Platinen aus Radios und Armaturen.'}); I('kabel',{n:'Kabelbund',d:'Kupfer ist das neue Gold.'});
I('zuendkerze',{n:'Zündkerze',d:'Funkt noch.'}); I('motorteil',{n:'Motorteil',d:'Kolben, Zahnräder, Öl.'});
I('werkzeugkasten',{n:'Werkzeugkasten',d:'Öffnen im Rucksack: Werkzeugteile.',type:'food',food:{hu:0,th:0},box:true});
I('nummernschild',{n:'Nummernschild',d:'Gutes Blech.'}); I('felge',{n:'Felge',d:'Stahl. Viel Stahl.'}); I('filter',{n:'Luftfilter',d:'Für Gasmasken brauchbar.'});
I('wolfsfell',{n:'Wolfsfell',d:'Warm und zottelig.'}); I('eiskristall',{n:'Eiskristall',d:'Schmilzt nicht. Seltsam.'}); I('verkohltes_holz',{n:'Verkohltes Holz',d:'Gute Holzkohle.'});
I('kaktusfrucht',{n:'Kaktusfrucht',type:'food',food:{hu:8,th:14},d:'Saftig. Stachelig.'}); I('gurkenglas',{n:'Gurkenglas',type:'food',food:{hu:14,th:6},d:'Saure Gurken. Ewig haltbar.'});
I('stoersender',{n:'Störsender',type:'block',tile:77,st:5,d:'Stört die Signale der Untoten. Kein Spawn im Umkreis von 30 Feldern – auch in fernen Gebieten.'});
const _eat5=eat; eat=function(id){ const d=ITEMS[id]; if(d&&d.box){ removeItem(id,1); const pool=[['eisen',2,4],['kabel',1,2],['zuendkerze',1,1],['kleber',1,2],['schrott',3,6]]; for(const [i,a,b] of pool) if(Math.random()<0.7) addItem(i,a+(Math.random()*(b-a+1)|0)); msg('Werkzeugkasten geöffnet!','#ffd54f'); sfx('craft'); return; } return _eat5(id); };
RECIPES.push({o:'stoersender',i:{elektronik:3,kabel:2,autobatterie:1,schrott:6},at:'werkbank'},
  {o:'kohle',n:2,i:{verkohltes_holz:2},at:'feuer'},{o:'eisen',n:2,i:{felge:1},at:'esse'},{o:'eisen',n:1,i:{nummernschild:2},at:'esse'},
  {o:'fellmantel',i:{wolfsfell:3,stoff:2},at:'werkbank'},{o:'fackel',n:6,i:{reifen:1,holz:2},at:'hand'});
LOOT.fahrzeug=[['schrott',2,5,.9],['autobatterie',1,1,.25],['reifen',1,2,.35],['elektronik',1,2,.4],['kabel',1,3,.45],['zuendkerze',1,1,.3],['motorteil',1,1,.25],['benzin',1,2,.3],['werkzeugkasten',1,1,.12],['nummernschild',1,1,.25],['filter',1,1,.2],['konserve',1,1,.15],['gurkenglas',1,1,.12],['kronkorken',2,10,.3]];
LOOT.wueste=[['kaktusfrucht',1,2,.4],['wasser',1,1,.35],['muni',3,8,.2],['schrott',1,3,.5],['gurkenglas',1,1,.2],['stoff',1,2,.4]];
LOOT.schnee=[['wolfsfell',1,1,.35],['eiskristall',1,2,.3],['muetze',1,1,.15],['konserve',1,2,.4],['kaffee',1,1,.3],['benzin',1,1,.2]];
LOOT.verbrannt=[['verkohltes_holz',2,4,.6],['schrott',2,4,.5],['elektronik',1,1,.2],['kabel',1,2,.3],['medkit',1,1,.08],['muni',4,10,.25]];
LOOT.oedland=[['schrott',3,6,.6],['elektronik',1,2,.35],['kabel',1,3,.4],['autobatterie',1,1,.15],['muni',6,14,.3],['medkit',1,1,.12],['schrot',3,8,.2]];
for(const k of ['haus','buero']) LOOT[k].push(['gurkenglas',1,1,.12],['kabel',1,1,.1],['elektronik',1,1,.06]);
// ---------- Ausrüstung: verschieben statt kopieren (abgesichert) ----------
const _equipItem5=equipItem; equipItem=function(i){ const P=G.player; const s=P.inv[i]; const id=s&&s.id; const before=countItem5(id); _equipItem5(i); if(id&&P.equip&&Object.values(P.equip).includes(id)){ const after=countItem5(id); if(after>=before){ // Sicherheitsnetz
      removeItem(id,1); } msg(ITEMS[id].n+' angezogen.','#a5d6a7'); } };
function countItem5(id){ let n=0; for(const s of G.player.inv) if(s&&s.id===id) n+=s.n; return n; }
// ---------- Gegner: sanfte Kurve, Licht-Schutz, Störsender ----------
const BIOME_TIER={wald:0,kiefer:1,wueste:2,verbrannt:3,stadt:3,schnee:3,oedland:4};
function biomeAt(tx){ const b=G.w&&G.w.feat&&G.w.feat.biomes; if(!b) return 'wald'; for(const s of b) if(tx>=s.x0&&tx<s.x1) return s.b; return tx<(b[0]?b[0].x0:0)?b[0].b:b[b.length-1].b; }
tierAt=function(tx,ty){ const depth=Math.max(0,ty-(G.w.sky[tx]||0)); let base; if(G.w.feat&&G.w.feat.biomes) base=BIOME_TIER[biomeAt(tx)]||0; else { const f=G.w.feat; const ref=f&&f.wreck?f.wreck.x+7:G.w.W/2; base=Math.floor(Math.abs(tx-ref)/110); } return Math.max(0,Math.min(5,base+Math.floor(depth/35))); };
function lightNear(tx,ty,r){ for(let y=ty-r;y<=ty+r;y++) for(let x=tx-r;x<=tx+r;x++){ const t=tget(x,y); const d=TILES[t]; if(d&&d.light>=0.5&&!d.jammer&&(x-tx)*(x-tx)+(y-ty)*(y-ty)<=r*r) return true; } return false; }
function jammerNear(tx,ty,r){ const J=G.w.feat.jammers||[]; for(const j of J){ if(tget(j.x,j.y)!==77) continue; if(Math.abs(j.x-tx)<=r&&Math.abs(j.y-ty)<=r) return true; } return false; }
function spawnBlocked(sx,sy){ if(G.bloodmoon) return false; if(jammerNear(sx,sy,30)) return 'jammer'; const tier=tierAt(sx,sy); if(tier<=2&&lightNear(sx,sy,13)) return 'light'; return false; }
function earlyMul(){ const d=G.day||1; return {hp:Math.min(1,0.55+0.08*(d-1)), dmg:Math.min(1,0.5+0.085*(d-1))}; }
const _spawnZombieNear5=spawnZombieNear;
spawnZombieNear=function(under,inCity,bm){ const e=_spawnZombieNear5(under,inCity,bm); if(!e) return e; const tx=Math.floor((e.x+e.w/2)/T), ty=Math.floor((e.y+e.h-1)/T);
  if(!bm&&spawnBlocked(tx,ty)){ e.dead=true; return null; }
  const m=earlyMul(); if(!bm){ e.hp=Math.max(8,Math.round(e.hp*m.hp)); e.maxhp=e.hp; e.dmgMul=(e.dmgMul||1)*m.dmg; } return e; };
spawnLogic=function(dt){ spawnT-=dt; if(spawnT>0) return; spawnT=1.2; const P=G.player; if(P.dead) return;
  const near=G.ents.filter(e=>!e.dead&&Math.abs(e.x-P.x)<70*T);
  const hostN=near.filter(e=>e.kind==='mob'&&MOBS[e.t].zombie&&e.spawned).length; const animN=near.filter(e=>e.kind==='mob'&&MOBS[e.t].animal).length;
  const tx=Math.floor(P.x/T), ty=Math.floor(P.y/T); const city=G.w.feat.city; const inCity=city&&tx>city.x0-20&&tx<city.x1+20; const under=ty>G.w.sky[tx]+12;
  const d=G.day||1; const tier=tierAt(tx,ty); const night=isNight();
  let max=night?Math.min(16,[2,3,4,5,6,7][d-1]||Math.min(16,7+Math.floor((d-6)/2)))+Math.max(0,tier-1):(d<=2?1:2)+(inCity?2:0)+(tier>=3?1:0);
  let chance=night?Math.min(0.55,0.22+0.04*d):(d<=2?0.06:0.12);
  if(G.bloodmoon){ max=12+Math.min(10,d/2|0); const total=18+d*3; if(G.bmSpawned<total&&hostN<max){ for(let i=0;i<2;i++){ const e=spawnZombieNear(under,inCity,true); if(e){ e.bm=true; G.bmSpawned++; } } } return; }
  // Spieler im Schutz?
  const prot=spawnBlocked(tx,ty);
  if(prot){ if((!G.flags.protMsg||G.flags.protMsg!==prot)&&(G.clock-(V05.protT||-99))>90){ V05.protT=G.clock; G.flags.protMsg=prot; msg(prot==='jammer'?'Der Störsender summt – hier bleibt es ruhig.':'Das Licht hält die Untoten fern.','#90caf9'); } chance=0; }
  else { if(G.flags.protMsg) G.flags.protMsg=null; if(tier>=3&&lightNear(tx,ty,13)&&!G.flags.farMsg){ G.flags.farMsg=true; msg('Hier draußen schreckt Licht die Untoten nicht ab. Du brauchst einen Störsender (Werkbank).','#ff8a65'); } }
  if(hostN<max&&Math.random()<chance) spawnZombieNear(under,inCity,false);
  if(!night&&animN<5&&!inCity&&!under&&Math.random()<0.2){ const sx=tx+(Math.random()<0.5?-1:1)*(30+Math.random()*15|0); const sy=surfaceY(sx)-1; const gt=tget(sx,sy+1); const b=biomeAt(sx);
    const pool=b==='schnee'?['hase','hirsch','hase']:b==='wueste'||b==='oedland'?['hase','huhn']:['hase','hirsch','huhn','hase']; if(gt===2||gt===4||gt===47||gt===82||gt===75) G.ents.push(makeMob(pool[Math.random()*pool.length|0],sx,sy)); }
  if(night&&d>=5&&tier>=2&&!G.ents.some(e=>!e.dead&&MOBS[e.t]&&MOBS[e.t].mutant&&!e.sleep)&&Math.random()<0.004){ const sx=tx+(Math.random()<0.5?-40:40); const sy=surfaceY(sx)-1; if(!spawnBlocked(sx,sy)){ const e=makeMob(inCity&&Math.random()<0.6?'mantelmann':['doppelkopf','armige','spinnenfrau','brocken','mantelmann'][Math.random()*5|0],sx,sy); e.wander=true; G.ents.push(e); msg('Etwas Großes streift durch die Nacht …','#e040fb'); } }
  for(const e of G.ents){ if(!e.dead&&e.kind==='mob'&&e.spawned&&Math.abs(e.x-P.x)>110*T) e.dead=true; } };
// Gegner, die in Schutzzonen hineinlaufen, verlieren das Interesse (nur Tag-Spawns, nicht Blutmond)
// ---------- Störsender platzieren / merken ----------
const _tset5=tset; tset=function(x,y,t){ const old=G.w?tget(x,y):0; _tset5(x,y,t); if(!G.w||!G.w.feat) return; if(t===77){ (G.w.feat.jammers=G.w.feat.jammers||[]).push({x,y}); } else if(old===77&&G.w.feat.jammers){ G.w.feat.jammers=G.w.feat.jammers.filter(j=>!(j.x===x&&j.y===y)); } };
// ---------- Werkzeug richtig herum halten ----------
drawSprite=function(g,id,fr,x,y,dir,o){ o=o||{}; const s=getSprite(id,fr,o.rad); const an=spriteAnchor(id,o.rad); const ax=an.ax, ay=an.ay;
  g.save(); g.translate(Math.round(x),Math.round(y)); if(dir<0) g.scale(-1,1); if(o.alpha!=null) g.globalAlpha=o.alpha; if(o.tilt) g.rotate(o.tilt);
  g.drawImage(o.flash?tinted(s):s.cv,-ax,-ay);
  if(o.held&&s.hand){ const ic=GFX.icons[o.held]; if(ic){ const hx=s.hand.x-ax, hy=s.hand.y-ay; g.save(); g.translate(hx,hy); const att=fr[0]==='a'; const d=ITEMS[o.held]||{};
      if(o.held==='fackel'){ g.drawImage(ic,-8,-14); }
      else if(d.ranged||o.held==='pistole'||o.held==='schrotflinte'||o.held==='armbrust'||o.held==='bogen'){ g.rotate(att?-0.05:0.2); g.drawImage(ic,-5,-9); }
      else if(att){ g.rotate(Math.PI/2-s.hand.a); g.drawImage(ic,-3,-12); } // Schlag: Klinge zeigt in Schlagrichtung
      else { g.rotate(-0.35); g.drawImage(ic,-3,-12); } // Ruhe: Griff in der Hand, Kopf oben, Klinge nach vorn
      g.restore(); } }
  g.restore(); return an; };
// ---------- Bewegung: weicher, Kamera ohne Zittern ----------
(function(){ const src=updatePlayer.toString(); const old='P.vx+=((jx*spd)-P.vx)*Math.min(1,dt*(P.onGround?14:6));';
  if(src.includes(old)){ updatePlayer=eval('('+src.replace(old,'{ const tg=jx*spd; const rev=Math.abs(P.vx)>20&&Math.sign(tg)!==Math.sign(P.vx); const rt=Math.abs(jx)>0.2?(P.onGround?(rev?22:10):4.5):(P.onGround?16:2.2); P.vx+=(tg-P.vx)*(1-Math.exp(-dt*rt)); }')+')'); V05.smooth=true; } })();
SFX.jump=function(){ const t=now(); nz(t,0.07,0.045,{f:420,fTo:900,q:0.6,type:'lowpass'}); osc('sine',150,t,0.06,0.035,{to:210}); };
SFX.land=function(){ const t=now(); nz(t,0.06,0.04,{f:260,q:0.7,type:'lowpass'}); };
// Kamera: exponentiell, mit leichtem Blick nach vorn; Darstellung pixelgenau relativ zur Figur
V05.look=0;
const _render5=render;
render=function(){ const P=G.player; if(!P||G.state!=='play'){ return _render5(); } const cx=G.cam.x, cy=G.cam.y;
  // Kamera so runden, dass die Figur exakt pixelstabil bleibt
  const rx=Math.round(P.x-cx), ry=Math.round(P.y-cy); G.cam.x=Math.round(P.x)-rx; G.cam.y=Math.round(P.y)-ry;
  try{ _render5(); } finally { G.cam.x=cx; G.cam.y=cy; } if(typeof renderAfter5==='function') renderAfter5(); };
const _update5=update;
update=function(dt){ const P=G.player; const ox=G.cam.x, oy=G.cam.y; _update5(dt); if(!P||P.dead||G.hitstop>0) return;
  // die Originalkamera (lerp dt*8) ersetzen wir durch eine sanfte Exponential-Kamera mit Vorausblick
  V05.look+=((P.dir||1)*Math.min(1,Math.abs(P.vx)/90)*26-V05.look)*(1-Math.exp(-dt*2.2));
  const tx=P.x+P.w/2-G.VW/2+V05.look, ty=P.y+P.h/2-G.VH*0.55; const kx=1-Math.exp(-dt*6.5), ky=1-Math.exp(-dt*(P.vy>200?10:5));
  G.cam.x=ox+(tx-ox)*kx; G.cam.y=oy+(ty-oy)*ky; G.cam.x=Math.max(0,Math.min(G.w.W*T-G.VW,G.cam.x)); G.cam.y=Math.max(0,Math.min(G.w.H*T-G.VH,G.cam.y));
  if(P.onGround&&!V05.wasGround&&V05.airT>0.25) sfx('land'); V05.airT=P.onGround?0:(V05.airT||0)+dt; V05.wasGround=P.onGround; };
