// Lifetime 0.7 – neuer Titel + Intro im HD-Pixel-Stil, große Welt, Generator + Endboss „Mainstream-TV-Zombie“
'use strict';
const V07={img:{},glowO:null,puff:null,tp:[],cine:[],say:null,banner:0,stat:0,voiceBuf:null};
(function(){ for(const k of ['title_bg','title_fg','intro1','intro2','intro3','intro4']){ const i=new Image(); i.src=ART7[k]; V07.img[k]=i; }
  const mkGlow=(r,g,b)=>{ const c=mkCanvas(32,32), x=c.getContext('2d'); const gr=x.createRadialGradient(16,16,0,16,16,16); gr.addColorStop(0,`rgba(${r},${g},${b},1)`); gr.addColorStop(0.35,`rgba(${r},${g},${b},0.45)`); gr.addColorStop(1,`rgba(${r},${g},${b},0)`); x.fillStyle=gr; x.fillRect(0,0,32,32); return c; };
  V07.glowO=mkGlow(255,140,40); V07.glowT=mkGlow(90,255,230); V07.glowW=mkGlow(255,240,210);
  const p=mkCanvas(48,48), g=p.getContext('2d'); const gr=g.createRadialGradient(24,24,2,24,24,24); gr.addColorStop(0,'rgba(40,34,38,0.55)'); gr.addColorStop(1,'rgba(40,34,38,0)'); g.fillStyle=gr; g.fillRect(0,0,48,48); V07.puff=p; })();
const ok7=i=>i&&i.complete&&i.naturalWidth>0;
// ======================= 1) Titel-Hintergrund =======================
titleFrame5=function(dt){ TT.t+=dt; const VW=G.VW, VH=G.VH, t=TT.t; ctx.imageSmoothingEnabled=false; const bg=V07.img.title_bg, fg=V07.img.title_fg, P=ART7.pts;
  ctx.fillStyle='#050812'; ctx.fillRect(0,0,VW,VH);
  const s=Math.max(VW/480,VH/270)*1.07; const bw=480*s, bh=270*s;
  const sway=Math.sin(t*0.05), swy=Math.cos(t*0.037);
  const ox=(VW-bw)/2+sway*(bw-VW)*0.42, oy=(VH-bh)/2+swy*(bh-VH)*0.35;
  const X=px=>ox+px*s, Y=py=>oy+py*s;
  if(ok7(bg)) ctx.drawImage(bg,Math.round(ox),Math.round(oy),Math.round(bw),Math.round(bh));
  ctx.save(); ctx.globalCompositeOperation='lighter';
  // Krater-Glut pulsiert
  { const k=0.55+0.25*Math.sin(t*1.3)+0.1*Math.sin(t*3.7); ctx.globalAlpha=k*0.8; const r=70*s; ctx.drawImage(V07.glowO,X(305)-r,Y(124)-r,r*2,r*2); }
  // Mondschein
  ctx.globalAlpha=0.18+0.04*Math.sin(t*0.7); { const r=60*s; ctx.drawImage(V07.glowW,X(108)-r,Y(40)-r,r*2,r*2); }
  // Komet funkelt
  ctx.globalAlpha=0.5+0.3*Math.sin(t*5); { const r=12*s; ctx.drawImage(V07.glowT,X(352)-r,Y(77)-r,r*2,r*2); }
  // Feuer flackern
  for(let i=0;i<P.fire_bg.length;i++){ const q=P.fire_bg[i]; const f=0.5+0.5*Math.sin(t*(4+i%5)+i*1.7); ctx.globalAlpha=0.18+f*0.35; const r=(3+(i%3))*s*0.7; ctx.drawImage(V07.glowO,X(q[0])-r,Y(q[1])-r,r*2,r*2); }
  // Wasser glitzert
  for(let i=0;i<P.water.length;i++){ const q=P.water[i]; const f=Math.sin(t*2.2+i*2.39); if(f<0.6) continue; ctx.globalAlpha=(f-0.6)*1.6; ctx.fillStyle='#bffff4'; ctx.fillRect(Math.round(X(q[0]+Math.sin(t+i)*0.6)),Math.round(Y(q[1])),Math.max(1,Math.round(s)),1); }
  ctx.restore();
  // Wasserfall: fallende Gischt-Streifen
  if(P.fall.length){ let x0=1e9,x1=-1,y0=1e9,y1=-1; for(const q of P.fall){ x0=Math.min(x0,q[0]); x1=Math.max(x1,q[0]); y0=Math.min(y0,q[1]); y1=Math.max(y1,q[1]); }
    ctx.save(); for(let i=0;i<46;i++){ const fx=x0+((i*37)%Math.max(1,x1-x0+1)); const len=4+(i%4)*2; const yy=y0+((t*38+i*19)%(y1-y0+8)); ctx.globalAlpha=0.35+((i*7)%5)*0.1; ctx.fillStyle=i%3?'#e6fbff':'#9ee8f0'; ctx.fillRect(Math.round(X(fx)),Math.round(Y(yy)),Math.max(1,Math.round(s*0.8)),Math.round(len*s*0.5)); }
      ctx.globalAlpha=0.25+0.1*Math.sin(t*3); ctx.globalCompositeOperation='lighter'; const r=26*s; ctx.drawImage(V07.glowT,X((x0+x1)/2)-r,Y(y1+6)-r,r*2,r*1.2); ctx.restore(); }
  // Rauchschwaden über der Stadt
  while(V07.tp.length<26){ const src=P.fire_bg[(Math.random()*P.fire_bg.length)|0]||[300,120]; V07.tp.push({x:src[0],y:src[1],vx:2+Math.random()*3,vy:-4-Math.random()*4,life:0,max:7+Math.random()*7,sz:10+Math.random()*12}); }
  for(const p of V07.tp){ p.life+=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; const k=p.life/p.max; ctx.globalAlpha=Math.sin(Math.PI*Math.min(1,k))*0.55; const r=(p.sz+k*20)*s*0.5; ctx.drawImage(V07.puff,X(p.x)-r,Y(p.y)-r,r*2,r*2); }
  V07.tp=V07.tp.filter(p=>p.life<p.max); ctx.globalAlpha=1;
  // Vordergrund (Wrack, Ruinen) mit stärkerer Parallaxe
  if(ok7(fg)){ const fs=s*1.02, fw=480*fs, fh=270*fs; const fx=(VW-fw)/2+sway*(fw-VW)*0.5, fy=VH-fh*0.86+swy*3; ctx.drawImage(fg,Math.round(fx),Math.round(fy),Math.round(fw),Math.round(fh));
    ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<P.fire_fg.length;i++){ const q=P.fire_fg[i]; const f=0.5+0.5*Math.sin(t*(6+i%4)+i*2.1); ctx.globalAlpha=0.25+f*0.45; const r=(4+i%3)*fs*0.8; ctx.drawImage(V07.glowO,fx+q[0]*fs-r,fy+q[1]*fs-r,r*2,r*2); } ctx.restore();
    // Funken aus dem Wrack
    if(Math.random()<0.5&&P.fire_fg.length){ const q=P.fire_fg[(Math.random()*P.fire_fg.length)|0]; TT.parts.push({x:fx+q[0]*fs,y:fy+q[1]*fs,vx:(Math.random()-0.5)*10,vy:-18-Math.random()*26,em:true,life:2+Math.random()*3,ph:Math.random()*6}); } }
  // Glühwürmchen / Glut
  while(TT.parts.length<70){ TT.parts.push({x:Math.random()*VW,y:VH*(0.35+Math.random()*0.6),vx:(Math.random()-0.5)*8,vy:-3-Math.random()*6,em:true,ff:true,life:5+Math.random()*7,ph:Math.random()*6}); }
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(const p of TT.parts){ p.life-=dt; p.x+=(p.vx+Math.sin(t*0.8+p.ph)*(p.ff?7:4))*dt; p.y+=(p.vy+(p.ff?Math.cos(t*1.1+p.ph)*5:0))*dt; const f=0.5+0.5*Math.sin(t*(p.ff?2.5:8)+p.ph); ctx.globalAlpha=Math.min(1,p.life)*(0.35+0.65*f); const r=p.ff?4+f*2:2.5; ctx.drawImage(V07.glowO,p.x-r,p.y-r,r*2,r*2); ctx.fillStyle='#ffd9a0'; ctx.fillRect(Math.round(p.x),Math.round(p.y),1,1); }
  TT.parts=TT.parts.filter(p=>p.life>0&&p.y>-10&&p.x>-20&&p.x<VW+20); ctx.restore();
  // Bodennebel
  ctx.save(); for(let i=0;i<3;i++){ const y=VH*(0.8+i*0.07)+Math.sin(t*0.3+i)*3; const gr2=ctx.createLinearGradient(0,y-20,0,y+20); gr2.addColorStop(0,'rgba(40,70,90,0)'); gr2.addColorStop(0.5,`rgba(40,70,90,${0.16+i*0.05})`); gr2.addColorStop(1,'rgba(40,70,90,0)'); ctx.fillStyle=gr2; ctx.fillRect(0,y-20,VW,40); } ctx.restore();
  // Wetterleuchten am Horizont
  TT.flash-=dt; if(TT.flash<-7-Math.random()*7) TT.flash=0.3; if(TT.flash>0){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=TT.flash; const r=VW*0.5; ctx.drawImage(V07.glowW,X(300)-r,Y(60)-r*0.5,r*2,r); ctx.restore(); }
  const bar=Math.round(VH*0.06*Math.min(1,t/2)); ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,bar); ctx.fillRect(0,VH-bar,VW,bar);
  if(typeof drawVignette==='function') drawVignette(); };
// ======================= 2) Intro im gleichen Stil =======================
function cineImg7(img,zoom,fx,fy,sx,sy,rot,alpha){ const VW=G.VW, VH=G.VH; if(!ok7(img)) return null; const s=Math.max(VW/480,VH/270)*zoom; const w=480*s, h=270*s;
  // Fokuspunkt (fx,fy in Bildkoordinaten) bleibt nahe der Bildmitte, ohne Ränder zu zeigen
  let ox=VW/2-fx*s, oy=VH/2-fy*s; ox=Math.min(0,Math.max(VW-w,ox)); oy=Math.min(0,Math.max(VH-h,oy));
  ctx.save(); ctx.globalAlpha=alpha==null?1:alpha; ctx.translate(VW/2+sx,VH/2+sy); if(rot) ctx.rotate(rot); ctx.translate(-VW/2,-VH/2); ctx.drawImage(img,Math.round(ox),Math.round(oy),Math.round(w),Math.round(h)); ctx.restore();
  return {X:px=>ox+px*s+sx, Y:py=>oy+py*s+sy, s}; }
function fireGlow7(map,pts,t,amp,col){ if(!map) return; ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<pts.length;i++){ const q=pts[i]; const f=0.5+0.5*Math.sin(t*(5+i%5)+i*1.9); ctx.globalAlpha=(0.15+f*0.4)*amp; const r=(3+i%3)*map.s*0.7; ctx.drawImage(col||V07.glowO,map.X(q[0])-r,map.Y(q[1])-r,r*2,r*2); } ctx.restore(); }
cineFrame5=function(dt){ CINE.t+=dt; const t=CINE.t, VW=G.VW, VH=G.VH; ctx.imageSmoothingEnabled=false; const P=ART7.pts; const I=V07.img;
  ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,VH);
  const shake=t<9?0.5:t<13.6?1.2:t<18.4?3.5+(t-13.6)*1.3:0; const sx=(Math.random()-0.5)*shake*2, sy=(Math.random()-0.5)*shake*2+Math.sin(t*1.3)*1.0;
  // Szene 1: Kabine, Blick zum Fenster (0–6.6 s)
  if(t<6.8){ const k=t/6.6; const a=t>6.2?1-(t-6.2)/0.6:1; const m=cineImg7(I.intro1,1.04+k*0.16,95+k*10,110,sx,sy,Math.sin(t*0.8)*0.004,a);
    if(m){ fireGlow7(m,P.fire_i1,t,a); ctx.save(); ctx.globalCompositeOperation='lighter'; const f=0.5+0.5*Math.sin(t*6)+0.2*Math.sin(t*13); ctx.globalAlpha=(0.12+f*0.08)*a; const r=110*m.s; ctx.drawImage(V07.glowO,m.X(90)-r,m.Y(105)-r,r*2,r*2); ctx.globalAlpha=(0.5+0.4*Math.sin(t*7))*a; const r2=10*m.s; ctx.drawImage(V07.glowT,m.X(59)-r2,m.Y(94)-r2,r2*2,r2*2); ctx.restore(); } }
  // Szene 2: Blick aus dem Fenster – Komet stürzt in die Stadt (6.2–13.9 s)
  if(t>6.2&&t<14.2){ const k=(t-6.2)/7.4; const a=Math.min(1,(t-6.2)/0.6); const m=cineImg7(I.intro2,1.06+k*0.14,250+k*30,140-k*10,sx,sy,0,a);
    if(m){ fireGlow7(m,P.fire_i2,t,a); ctx.save(); ctx.globalCompositeOperation='lighter'; const pulse=0.6+0.4*Math.sin(t*9)+Math.max(0,(t-11.5))*0.6; ctx.globalAlpha=Math.min(1,0.5*pulse)*a; const r=(40+Math.max(0,t-11.5)*30)*m.s; ctx.drawImage(V07.glowT,m.X(277)-r,m.Y(112)-r,r*2,r*2); ctx.globalAlpha=0.35*a; const r3=60*m.s; ctx.drawImage(V07.glowO,m.X(300)-r3,m.Y(150)-r3,r3*2,r3*2); ctx.restore();
      if(Math.random()<0.8) V07.cine.push({x:m.X(277+(Math.random()-0.5)*30),y:m.Y(112+(Math.random()-0.5)*30),vx:-(40+Math.random()*90),vy:-(30+Math.random()*60),life:1.2+Math.random(),c:Math.random()<0.5?'#ffb347':'#7fffe0'});
      // Einschlag: Druckwelle
      if(t>13.4){ const q=(t-13.4)/0.8; ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=Math.max(0,1-q); ctx.strokeStyle='#fff3d0'; ctx.lineWidth=3; ctx.beginPath(); ctx.ellipse(m.X(310),m.Y(200),q*VW*0.6,q*VW*0.18,0,0,Math.PI*2); ctx.stroke(); ctx.restore(); } } }
  if(t>13.6&&t<14.4){ ctx.fillStyle=`rgba(255,250,235,${1-(t-13.6)/0.8})`; ctx.fillRect(0,0,VW,VH); }
  // Szene 3: Sturzflug, Masken, Alarm (14.0–18.4 s)
  if(t>14.0&&t<18.6){ const k=(t-14)/4.4; const a=Math.min(1,(t-14)/0.3); const rot=Math.sin(t*1.7)*0.05+k*0.06; const m=cineImg7(I.intro3,1.12+k*0.08,230,140,sx,sy,rot,a);
    if(m){ fireGlow7(m,P.fire_i3,t,a); ctx.fillStyle=`rgba(255,20,20,${(Math.sin(t*9)*0.5+0.5)*0.2})`; ctx.fillRect(0,0,VW,VH);
      if(Math.random()<0.5) V07.cine.push({x:VW+10,y:Math.random()*VH,vx:-(200+Math.random()*300),vy:(Math.random()-0.5)*80,life:1.5,c:Math.random()<0.6?'#2a2224':'#ffb347',big:Math.random()<0.3}); } }
  // Absturz: Weißblitz -> Schwarz
  if(t>18.4&&t<19.4){ const kk=Math.min(1,(t-18.4)/0.3); ctx.fillStyle=t<18.9?`rgba(255,250,240,${kk})`:'#000'; ctx.fillRect(0,0,VW,VH); }
  // Szene 4: Erwachen im Wald neben dem Wrack (19.3–21.5 s)
  if(t>19.3){ const a=Math.min(1,(t-19.3)/0.9)*(t>21?Math.max(0,1-(t-21)/0.5):1); const br=Math.sin(t*1.4)*2; const m=cineImg7(I.intro4,1.05,240,150,0,br,Math.sin(t*0.9)*0.01,a);
    if(m){ fireGlow7(m,P.fire_i4,t,a); if(Math.random()<0.7&&P.fire_i4.length){ const q=P.fire_i4[(Math.random()*P.fire_i4.length)|0]; V07.cine.push({x:m.X(q[0]),y:m.Y(q[1]),vx:(Math.random()-0.5)*12,vy:-(15+Math.random()*25),life:1.5+Math.random()*1.5,c:'#ffb347',glow:true}); }
      // Blinzeln
      const bl=t<20.2?Math.max(0,1-(t-19.3)/0.9):0; if(bl>0){ ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,VH*bl*0.5); ctx.fillRect(0,VH-VH*bl*0.5,VW,VH*bl*0.5); } } }
  // Partikel
  ctx.save(); for(const p of V07.cine){ p.life-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; if(p.glow||p.c==='#ffb347'||p.c==='#7fffe0'){ ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=Math.min(1,p.life); ctx.drawImage(p.c==='#7fffe0'?V07.glowT:V07.glowO,p.x-3,p.y-3,6,6); } else { ctx.globalCompositeOperation='source-over'; ctx.globalAlpha=1; } ctx.fillStyle=p.c; ctx.fillRect(Math.round(p.x),Math.round(p.y),p.big?4:1,p.big?3:1); }
  V07.cine=V07.cine.filter(p=>p.life>0&&p.x>-20); ctx.restore();
  if(t<1){ ctx.fillStyle=`rgba(0,0,0,${1-t})`; ctx.fillRect(0,0,VW,VH); }
  const bar=Math.round(VH*0.09); ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,bar); ctx.fillRect(0,VH-bar,VW,bar);
  // Untertitel + Kauderwelsch-Durchsagen + Geräusche (wie bisher)
  let sub=''; for(const [a,b,who,txt] of CINE_SUBS){ if(t>=a&&t<b){ sub=`<span class="who">${who}</span> ${txt}`; if(!CINE.said[a]){ CINE.said[a]=1; pilotBabble5(b-a-0.6, a>14); } } }
  if(t>19&&t<21.2) sub='<span class="who"></span> …'; const el=$('cinesub'); if(el._s!==sub){ el._s=sub; el.innerHTML=sub; }
  if(t>13.6&&!CINE.said.boom1){ CINE.said.boom1=1; sfx('boom'); alarm5(true); }
  if(t>18.4&&!CINE.said.crash){ CINE.said.crash=1; sfx('boom'); setTimeout(()=>sfx('boom'),120); setTimeout(()=>sfx('brk'),260); alarm5(false); stopCabin5(); }
  if(t>=CINE_LEN) endCine5(); };
const _startCine7=startCine5; startCine5=function(){ V07.cine=[]; _startCine7(); };
// ======================= 3) Große Welt: Biome, Karte, alte Spielstände =======================
const _planBiomes7=planBiomes;
planBiomes=function(w){ const W=w.W; if(W<=1600) return _planBiomes7(w);
  const fl=w.spawn.x>W/2; const m=v=>fl?W-v:v; const cx=m(w.spawn.x); const c0=w.feat.city||{x0:Math.round(W*0.2),x1:Math.round(W*0.27)}; const c={x0:Math.min(m(c0.x0),m(c0.x1)),x1:Math.max(m(c0.x0),m(c0.x1))};
  const a=cx+80, b=cx+190, mid=Math.round((b+c.x0-10)/2);
  const L=[{b:'wald',x0:0,x1:a},{b:'kiefer',x0:a,x1:b},{b:'wueste',x0:b,x1:mid},{b:'verbrannt',x0:mid,x1:c.x0-8},{b:'stadt',x0:c.x0-8,x1:c.x1+8}];
  const st=c.x1+8, rest=W-st; const seq=[['wald',0.08],['kiefer',0.12],['schnee',0.2],['wueste',0.14],['verbrannt',0.18],['oedland',0.28]]; let x=st;
  for(const [bb,f] of seq){ const x1=bb==='oedland'?W:Math.round(x+rest*f); L.push({b:bb,x0:x,x1}); x=x1; }
  let out=L.filter(s=>s.x1>s.x0); if(fl) out=out.map(s=>({b:s.b,x0:W-s.x1,x1:W-s.x0})).reverse(); return out; };
// Weiter weg = gefährlicher (zweiter Wald/Kiefernwald hinter der Stadt sind härter)
const _tierAt7=tierAt; tierAt=function(tx,ty){ let v=_tierAt7(tx,ty); const w=G.w; if(w&&w.W>1600&&w.feat&&w.feat.city){ const c=w.feat.city; const far=Math.min(Math.abs(tx-c.x0),Math.abs(tx-c.x1)); const sx=w.spawn.x; const beyond=(sx<c.x0&&tx>c.x1)||(sx>c.x1&&tx<c.x0); if(beyond) v=Math.min(5,Math.max(v,2+Math.floor(far/700))); } return v; };
// Karte: breite Welt scrollbar statt winzig
const _renderMap7=UI.renderMap; UI.renderMap=function(){ _renderMap7.apply(UI,arguments); const c=$('mapc'); if(!c||G.w.W<=1600) return; c.style.width=Math.round(G.w.W*0.62)+'px'; c.style.maxWidth='none'; c.style.height='auto'; c.style.imageRendering='pixelated';
  const wrap=document.createElement('div'); wrap.style.cssText='overflow-x:auto;overflow-y:hidden;width:100%;-webkit-overflow-scrolling:touch'; c.parentNode.insertBefore(wrap,c); wrap.appendChild(c);
  setTimeout(()=>{ wrap.scrollLeft=Math.max(0,G.player.x/T*0.62-wrap.clientWidth/2); },0); };
const _loadGame7=loadGame; loadGame=function(){ const r=_loadGame7.apply(this,arguments); if(r&&G.w&&G.w.W<=1600) setTimeout(()=>msg('Alter Spielstand (kleine Karte). Für die neue, viel größere Welt: „Neues Spiel“.','#ffcc80'),1500); return r; };
// ======================= 4) Generator (Strom) =======================
defT(84,{n:'Generator',s:false,h:3,tool:'pick',drop:['generator',1],c:'#c89a20',gen:true,light:0});
I('generator',{n:'Benzin-Generator',type:'block',tile:84,st:5,ic:'radio',col:'#d8a020',d:'Erzeugt Strom. Mit Benzin befüllen (Generator antippen). Laut – und Strom lockt Dinge an …'});
I('akku',{n:'Akku-Zelle',type:'ammo',st:99,ic:'radio',col:'#5c5',d:'Munition für die Fernbedienung.'});
I('fernbedienung',{n:'Fernbedienung des Grauens',type:'weapon',st:1,ic:'radio',col:'#888',dmg:34,rate:0.32,ranged:{ammo:'akku',spd:620,grav:0},d:'Die Fernbedienung des TV-Zombies. Schießt Fernsehstrahlen.'});
I('bildroehre',{n:'Flimmernde Bildröhre',type:'misc',st:5,ic:'radio',col:'#333',d:'Trophäe vom Mainstream-TV-Zombie. Brummt leise.'});
RECIPES.push({o:'generator',i:{motorteil:1,kabel:3,eisen:8,zuendkerze:1},at:'werkbank'},{o:'akku',n:10,i:{elektronik:1,kabel:1,schrott:2},at:'werkbank'});
if(typeof NEEDS_FLOOR!=='undefined') NEEDS_FLOOR.add(84);
(function(){ GFX.tiles[84]=[0,1,2,3].map(v=>{ const c=mkCanvas(T,T), g=c.getContext('2d');
  g.fillStyle='#1d1a16'; g.fillRect(1,5,14,11); g.fillStyle='#c89a20'; g.fillRect(2,5,12,9); g.fillStyle='#e8c040'; g.fillRect(2,5,12,2); g.fillStyle='#3a342c'; g.fillRect(4,8,6,5); g.fillStyle='#777'; g.fillRect(11,8,2,2); g.fillStyle=v&1?'#5f5':'#2a2'; g.fillRect(12,11,1,1);
  g.fillStyle='#444'; g.fillRect(12,2,2,3); g.fillStyle='#2a2622'; g.fillRect(1,14,3,2); g.fillRect(12,14,3,2); return c; }); })();
function paintIcons7(){ const P=(id,fn)=>{ const c=GFX.icons[id]; if(!c) return false; const g=c.getContext('2d'); g.clearRect(0,0,16,16); fn(g); GFX.iconURL[id]=c.toDataURL(); return true; };
  const r=(g,c,x,y,w,h)=>{ g.fillStyle=c; g.fillRect(x,y,w,h); };
  const a=P('generator',g=>{ r(g,'#1d1a16',1,5,14,10); r(g,'#d8a020',2,5,12,8); r(g,'#f0c848',2,5,12,2); r(g,'#3a342c',4,8,5,4); r(g,'#888',11,8,2,2); r(g,'#555',12,2,2,3); });
  P('akku',g=>{ r(g,'#222',4,3,8,12); r(g,'#3c3',5,6,6,8); r(g,'#9f9',5,6,6,2); r(g,'#bbb',6,1,4,2); });
  P('fernbedienung',g=>{ r(g,'#1a1a1a',5,1,6,15); r(g,'#8a8a8a',6,2,4,13); r(g,'#e33',6,4,2,2); r(g,'#e33',8,7,2,1); r(g,'#e33',6,9,2,1); r(g,'#444',7,0,1,2); });
  P('bildroehre',g=>{ r(g,'#111',2,3,12,10); r(g,'#9aa',3,4,9,8); r(g,'#ddd',4,5,3,2); r(g,'#e80',12,5,1,1); r(g,'#555',5,1,1,2); r(g,'#555',10,1,1,2); });
  return a; }
(function wait(){ if(!paintIcons7()) setTimeout(wait,300); })();
// Generatoren in der Welt verfolgen (Treibstoff in Tagen)
function gens7(){ const f=G.w.feat; if(!f.gens) f.gens=[]; return f.gens; }
const _tset7=tset; tset=function(x,y,t){ const old=G.w?tget(x,y):0; _tset7(x,y,t); if(!G.w) return; if(t===84&&old!==84){ gens7().push({x,y,fuel:0}); } else if(old===84&&t!==84){ const L=gens7(); const i=L.findIndex(g=>g.x===x&&g.y===y); if(i>=0) L.splice(i,1); } };
const _findInteract7=findInteract; findInteract=function(){ const r=_findInteract7(); if(r&&r.e) return r; const P=G.player; const cx=Math.floor((P.x+P.w/2)/T), cy=Math.floor((P.y+P.h/2)/T); let best=null,bd=r?((r.x-cx)**2+(r.y-cy)**2):9; for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++){ if(tget(x,y)===84){ const d=(x-cx)**2+(y-cy)**2; if(d<bd){ bd=d; best={lbl:'Generator',x,y}; } } } return best||r; };
const _interactAt7=interactAt; interactAt=function(tx,ty,wx,wy){ if(tget(tx,ty)===84&&reachOK(tx,ty,5.5)){ fuelGen7(tx,ty); return true; } return _interactAt7(tx,ty,wx,wy); };
function genAt7(x,y){ return gens7().find(g=>g.x===x&&g.y===y)||(gens7().push({x,y,fuel:0}),gens7()[gens7().length-1]); }
function fuelGen7(x,y){ const g=genAt7(x,y); if(countItem('benzin')>0){ removeItem('benzin',1); UI.refreshHot&&UI.refreshHot(); g.fuel=Math.min(3,g.fuel+0.5); sfx('click'); msg(`Generator läuft – Strom! (Tank: ${Math.round(g.fuel*24)} Std.)`,'#ffe082'); }
  else msg(g.fuel>0?`Generator läuft noch ${Math.round(g.fuel*24)} Std. Für mehr: Benzin.`:'Der Generator braucht Benzin.','#ffcc80'); }
let GEN7T=0;
function genTick7(dt){ if(!G.w||!G.w.feat) return; const L=gens7(); if(!L.length) return; const P=G.player; let running=0; const dd=dt/DAYLEN;
  for(const g of L){ if(g.fuel>0){ g.fuel=Math.max(0,g.fuel-dd); running++; if(g.fuel===0&&Math.abs(g.x*T-P.x)<30*T) msg('Der Generator ist aus. Kein Benzin mehr.','#ffcc80');
      if(Math.random()<dt*3) G.parts.push({x:g.x*T+13,y:g.y*T+2,vx:(Math.random()-0.5)*6,vy:-18,life:1.4,col:'rgba(70,70,70,0.6)',sz:2}); } }
  if(running){ const fl=G.flags; if(fl.tvGenAt==null){ fl.tvGenAt=G.day+G.time; msg('Der Generator brummt laut durch die Nacht. Strom … das lockt bestimmt etwas an.','#ffe082'); }
    GEN7T-=dt; const near=L.find(g=>g.fuel>0&&Math.hypot(g.x*T-P.x,g.y*T-P.y)<14*T); if(near&&GEN7T<=0&&SND.ctx){ GEN7T=0.5; const t=now(); osc('sawtooth',52,t,0.55,0.025,{}); osc('square',104,t,0.5,0.008,{}); } } }
const _drawDebris7=drawDebris; drawDebris=function(ox,oy){ _drawDebris7(ox,oy); if(!G.w||!G.w.feat||!G.w.feat.gens) return; ctx.save(); ctx.globalCompositeOperation='lighter'; for(const g of G.w.feat.gens){ if(!(g.fuel>0)) continue; const x=g.x*T+8+ox, y=g.y*T+8+oy; if(x<-60||x>G.VW+60) continue; ctx.globalAlpha=0.28+0.08*Math.sin(G.clock*20); ctx.drawImage(V07.glowW,x-26,y-26,52,52); } ctx.restore(); };
// ======================= 5) Endboss: Mainstream-TV-Zombie =======================
Object.assign(MOBS.tvzombie,{col:'#6a8a3a',drop:[['fernbedienung',1],['akku',60],['bildroehre',1],['kronkorken',300],['elektronik',8],['kabel',6]]});
for(const k of ['mini_slasher','mini_vampir','mini_mumie','mini_clown','mini_affe']) Object.assign(MOBS[k],{drop:[['kronkorken',3]]});
const TV_SAYS=['Bla bla bla …','Nach der Werbung!','Bleiben Sie dran!','Eilmeldung!','Jetzt kaufen!',"Gleich geht's weiter!",'Sie sehen: nichts.','Kanal gewechselt!','Quote! Quote!','Nur heute!'];
const MINIS7=['mini_slasher','mini_vampir','mini_mumie','mini_clown','mini_affe'];
// Pose-Sprites (e.look='tvz:attack' usw.)
const _getSprite7=getSprite; getSprite=function(id,fr,rad){ if(typeof id==='string'&&id.startsWith('tvz:')){ const pose=id.slice(4); const A=PETEI.tvzombie; const img=A&&A[pose]; if(img&&img.complete&&img.naturalWidth){ const key='tvz|'+pose; let s=SPR.cache.get(key); if(s) return s; const c=mkCanvas(img.naturalWidth,img.naturalHeight); c.getContext('2d').drawImage(img,0,0); s={cv:c,w:c.width,h:c.height,hand:null,anc:{ax:Math.round(c.width/2),ay:c.height-1,top:0}}; SPR.cache.set(key,s); return s; } return _getSprite7('tvzombie',fr,rad); } return _getSprite7(id,fr,rad); };
const _spriteAnchor7=spriteAnchor; spriteAnchor=function(id,rad){ if(typeof id==='string'&&id.startsWith('tvz:')){ const s=getSprite(id,'i',rad); return s.anc||_spriteAnchor7('tvzombie',rad); } return _spriteAnchor7(id,rad); };
function tvVoice7(){ if(!SND.ctx) return; const c=SND.ctx; const play=b=>{ const s=c.createBufferSource(); s.buffer=b; const g=c.createGain(); g.gain.value=1.4; s.connect(g); g.connect(SND.sfx); s.start(); const t=now(); nz(t,2.2,0.06,{type:'highpass',f:3000}); nz(t+0.05,0.25,0.12,{type:'bandpass',f:1800,q:0.6}); };
  if(V07.voiceBuf) return play(V07.voiceBuf); try{ const b64=ART7.voice_bb.split(',')[1]; const bin=atob(b64); const u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); c.decodeAudioData(u.buffer,b=>{ V07.voiceBuf=b; play(b); },()=>{}); }catch(e){} }
SFX.tvstatic=function(){ const t=now(); nz(t,0.35,0.18,{type:'bandpass',f:2400,q:0.5}); osc('square',880,t,0.08,0.03,{to:440}); };
SFX.tvbeam=function(){ const t=now(); osc('sawtooth',1400,t,0.25,0.05,{to:300}); nz(t,0.2,0.08,{type:'highpass',f:2500}); };
SFX.tvgrab=function(){ const t=now(); nz(t,0.5,0.15,{type:'bandpass',f:900,fTo:3000,q:1}); osc('triangle',200,t,0.4,0.06,{to:800}); };
function spawnTV7(){ const P=G.player; const W=G.w.W; let side=Math.random()<0.5?-1:1; let x=Math.floor(P.x/T)+side*10; if(x<10||x>W-10){ side=-side; x=Math.floor(P.x/T)+side*10; }
  const sy=surfaceY(x); const b=makeMob('tvzombie',x,sy-1,{boss:true}); b.canStep=true; b.st='intro'; b.stT=3.6; b.look='tvz:stand'; b.dir=-side; G.ents.push(b); G.boss=b; G.flags.tvSpawned=(G.flags.tvSpawned||0)+1;
  V07.banner=4.2; V07.stat=1.2; G.cam.shake=10; sfx('tvstatic'); setTimeout(()=>sfx('tvstatic'),300); setTimeout(tvVoice7,500); V07.say={e:b,txt:'Big Brother is watching you!!',t:3.4};
  msg('Der Mainstream-TV-Zombie ist erschienen! Der Strom hat ihn angelockt!','#ff5252'); return b; }
function bossTrigger7(dt){ const f=G.flags; if(!G.w||G.state!=='play'||f.tvGenAt==null||f.boss_tvzombie) return; if(G.boss&&!G.boss.dead) return; const nowD=G.day+G.time;
  if(!f.tvHint&&nowD>=f.tvGenAt+1.4){ f.tvHint=1; msg('In der Ferne rauscht ein Fernseher … obwohl hier keiner sein dürfte.','#b0bec5'); sfx('tvstatic'); }
  const due=f.tvRetry!=null?f.tvRetry:f.tvGenAt+2; if(nowD<due) return; const P=G.player; const tx=Math.floor(P.x/T); if(P.dead||P.y/T>G.w.sky[tx]+14) return; spawnTV7(); }
function groundTV7(e){ const x0=Math.floor((e.x+4)/T), x1=Math.floor((e.x+e.w-4)/T); let best=1e9; for(let x=x0;x<=x1;x++){ let y=Math.floor((e.y+e.h-2)/T); let k=0; while(k<6&&solidAt(x,y)){ y--; k++; } k=0; while(k<40&&!solidAt(x,y+1)){ y++; k++; } best=Math.min(best,(y+1)*T); } return best; }
const _updateBoss7=updateBoss;
updateBoss=function(e,dt){ if(e.t!=='tvzombie') return _updateBoss7(e,dt); const d=MOBS[e.t]; const P=G.player; const enr=e.hp<e.maxhp*0.5;
  if(P.dead){ e.dead=true; G.boss=null; V07.say=null; G.flags.tvRetry=G.day+G.time+0.5; msg('Rauschen … Der TV-Zombie schaltet um. Er kommt wieder.','#b0bec5'); return; }
  const dx=(P.x+P.w/2)-(e.x+e.w/2), dy=(P.y+P.h/2)-(e.y+e.h/2); if(e.st!=='beam'&&e.st!=='grab') e.dir=dx>0?1:-1; e.stT-=dt;
  // Schwerkraft + Boden
  const gy=groundTV7(e); if(e.y+e.h<gy-1){ e.vy=Math.min(e.vy+GRAV*dt,600); e.y+=e.vy*dt; if(e.y+e.h>gy){ e.y=gy-e.h; if(e.vy>300){ G.cam.shake=6; sfx('boom'); partBurst(e.x+e.w/2,e.y+e.h,'#7a5a3a',16,200); } e.vy=0; } } else { e.y=gy-e.h; e.vy=0; }
  if(e.st==='intro'){ e.vx=0; e.look=(Math.floor(G.clock*8)%5===0)?'tvz:grab':'tvz:stand'; if(e.stT<=0){ e.st='walk'; e.stT=2; e.look=null; e.beamCD=1.2; e.grabCD=5; } return; }
  if(e.st==='walk'){ e.look=null; const sp=d.spd*(enr?1.45:1); const want=Math.abs(dx)>3*T?Math.sign(dx):0; e.vx=want*sp; const nx=e.x+e.vx*dt;
    // Wand im Weg? Kleine Stufen hochsteigen, weiche Blöcke zertrümmern
    const fx=Math.floor((want>0?nx+e.w:nx)/T); let blocked=false; for(let y=Math.floor(e.y/T);y<Math.floor((e.y+e.h-T*3)/T);y++) if(solidAt(fx,y)) blocked=true;
    if(want&&blocked){ e.stuck=(e.stuck||0)+dt; if(e.stuck>0.8){ e.stuck=0; for(let y=Math.floor(e.y/T);y<Math.floor((e.y+e.h)/T);y++){ const t=tget(fx,y); if(t&&TILES[t].s&&TILES[t].h<=4&&!TILES[t].loot&&t!==17) breakTile(fx,y,false); } G.cam.shake=4; sfx('boom'); } }
    else { e.stuck=0; e.x=nx; } e.walk=(e.walk||0)+dt*Math.abs(e.vx)*0.12;
    e.beamCD-=dt; e.grabCD-=dt; const L=Math.hypot(dx,dy);
    if(e.grabCD<=0&&L<26*T){ e.st='grab'; e.stT=1.0; e.vx=0; e.look='tvz:grab'; sfx('tvgrab'); e.thrown=false; }
    else if(e.beamCD<=0&&L<24*T){ e.st='beam'; e.stT=0.6; e.vx=0; e.look='tvz:attack'; e.fired=false; }
  } else if(e.st==='beam'){ e.vx=0; e.look='tvz:attack'; if(!e.fired&&e.stT<0.3){ e.fired=true; const hx=e.x+e.w/2+e.dir*44, hy=e.y+e.h*0.36; const n=enr?3:1; const ang=Math.atan2(P.y+P.h*0.4-hy,P.x+P.w/2-hx);
      for(let i=0;i<n;i++){ const a=ang+(i-(n-1)/2)*0.16; G.proj.push({x:hx,y:hy,vx:Math.cos(a)*430,vy:Math.sin(a)*430,grav:0,dmg:13,own:'e',type:'tvbeam',life:2.4,trail:[]}); } sfx('tvbeam'); }
    if(e.stT<=0){ e.st='walk'; e.stT=1; e.beamCD=enr?1.5:2.4; e.look=null; }
  } else if(e.st==='grab'){ e.vx=0; e.look='tvz:grab'; if(Math.random()<0.5) G.parts.push({x:e.x+e.w/2+(Math.random()-0.5)*20,y:e.y+10+Math.random()*16,vx:(Math.random()-0.5)*40,vy:-30,life:0.5,col:Math.random()<0.5?'#cfe8ff':'#8aa0b0',sz:1});
    if(!e.thrown&&e.stT<0.35){ e.thrown=true; const alive=G.ents.filter(m=>!m.dead&&MOBS[m.t]&&MOBS[m.t].mini).length; const n=Math.min(enr?3:2,6-alive);
      for(let i=0;i<n;i++){ const k=MINIS7[(Math.random()*MINIS7.length)|0]; const m=makeMob(k,Math.floor((e.x+e.w/2)/T),Math.floor(e.y/T)+1,{spawned:true}); m.x=e.x+e.w/2-m.w/2; m.y=e.y+12; const tt=0.9+i*0.15; m.vx=(P.x-m.x)/tt+(Math.random()-0.5)*60; m.vy=-280-Math.random()*80; m.thrownT=2; m.spin=0; m.dir=Math.sign(m.vx)||1; G.ents.push(m); if(i===0) msg(`${MOBS[k].n} springt aus dem Fernseher!`,'#ffab40'); }
      sfx('tvstatic'); V07.stat=0.35; }
    if(e.stT<=0){ e.st='walk'; e.stT=1; e.grabCD=enr?6:8.5; e.look=null; } }
  // Nahkampf: Fernseher-Kopfnuss
  if(Math.abs(dx)<(e.w/2+10)&&Math.abs(dy)<(e.h/2+10)&&(e.atkCD=(e.atkCD||0)-dt)<=0){ e.atkCD=1.1; hurtPlayer(d.dmg,e); G.cam.shake=4; }
  // zu weit weg: kommt hinterher statt zu verschwinden
  if(Math.abs(dx)>60*T){ const x=Math.floor(P.x/T)-Math.sign(dx)*22; e.x=x*T; e.y=(surfaceY(x)-1)*T-e.h+T; V07.stat=0.5; sfx('tvstatic'); } };
// Mini-Gegner fliegen aus dem TV (eigene Flugphase)
const _updateMob7=updateMob; updateMob=function(e,dt){ if(e.thrownT>0){ e.thrownT-=dt; e.vy=Math.min(e.vy+GRAV*dt,600); moveBody(e,dt); e.spin+=dt*12*Math.sign(e.vx||1); if(e.onGround||e.thrownT<=0){ e.thrownT=0; e.spin=0; e.vx*=0.2; partBurst(e.x+e.w/2,e.y+e.h,'#bbb',6,80); } return; } return _updateMob7(e,dt); };
// Intro: unverwundbar
const _hurtMob7=hurtMob; hurtMob=function(e,dmg,src,kb){ if(e&&e.t==='tvzombie'&&e.st==='intro') return; if(e&&e.t==='tvzombie') kb=Math.min(kb||0,20); return _hurtMob7(e,dmg,src,kb); };
const _killMob7=killMob; killMob=function(e,src){ const was=e.dead; _killMob7(e,src); if(was||e.t!=='tvzombie') return; G.flags.boss_tvzombie=true; V07.say=null; V07.stat=1.5; sfx('tvstatic'); G.cam.shake=12;
  for(const m of G.ents) if(!m.dead&&MOBS[m.t]&&MOBS[m.t].mini) m.dead=true;
  setTimeout(()=>msg('SENDESCHLUSS! Der Mainstream-TV-Zombie ist abgeschaltet. Seine Fernbedienung gehört jetzt dir!','#ffd54f'),600); };
// Fernsehstrahlen: eigene Bewegung, Treffer -> TV-Spruch über dem Spieler
const _updateProj7=updateProj; updateProj=function(dt){ const beams=G.proj.filter(p=>p.type==='tvbeam'); if(beams.length) G.proj=G.proj.filter(p=>p.type!=='tvbeam'); _updateProj7(dt); const P=G.player;
  for(const p of beams){ p.life-=dt; p.trail.push([p.x,p.y]); if(p.trail.length>9) p.trail.shift(); p.x+=p.vx*dt; p.y+=p.vy*dt;
    if(solidAt(Math.floor(p.x/T),Math.floor(p.y/T))){ partBurst(p.x,p.y,'#9ef',6,80); p.life=-1; }
    else if(!P.dead&&p.x>P.x-2&&p.x<P.x+P.w+2&&p.y>P.y&&p.y<P.y+P.h){ hurtPlayer(p.dmg,{x:p.x-p.vx}); p.life=-1; V07.tvsay={txt:TV_SAYS[(Math.random()*TV_SAYS.length)|0],t:1.5}; sfx('tvstatic'); partBurst(p.x,p.y,'#cfe8ff',10,120); }
    if(p.life>0) G.proj.push(p); } };
const _drawProj7=drawProj; drawProj=function(ox,oy){ _drawProj7(ox,oy); ctx.save(); for(const p of G.proj){ if(p.type!=='tvbeam'&&!p.tv) continue; const x=p.x+ox, y=p.y+oy; ctx.globalCompositeOperation='lighter';
    if(p.trail&&p.trail.length){ for(let i=0;i<p.trail.length;i++){ const q=p.trail[i]; ctx.globalAlpha=(i+1)/p.trail.length*0.6; ctx.fillStyle=i%2?'#bfe9ff':'#ffffff'; ctx.fillRect(Math.round(q[0]+ox)-1,Math.round(q[1]+oy+(Math.random()-0.5)*3),3,2); } }
    ctx.globalAlpha=0.9; ctx.drawImage(V07.glowT,x-8,y-8,16,16); ctx.fillStyle='#fff'; ctx.fillRect(Math.round(x)-1,Math.round(y)-1,3,3); } ctx.restore(); };
// Spieler-Fernbedienung: Strahl-Optik
const _fireAt7=fireAt; fireAt=function(d,tx,ty){ const n=G.proj.length; _fireAt7(d,tx,ty); if(d===ITEMS.fernbedienung){ for(let i=n;i<G.proj.length;i++) G.proj[i].tv=true; sfx('tvbeam'); } };
// Mini-Gegner drehen sich im Flug
const _drawEnt7=drawEnt; drawEnt=function(e,ox,oy){ if(e.thrownT>0&&e.spin){ ctx.save(); const cx=e.x+e.w/2+ox, cy=e.y+e.h/2+oy; ctx.translate(cx,cy); ctx.rotate(e.spin); ctx.translate(-cx,-cy); _drawEnt7(e,ox,oy); ctx.restore(); return; } _drawEnt7(e,ox,oy); };
// Overlays: Sprechblase, TV-Sprüche, Auftritts-Banner, Bildrauschen
function bubble7(x,y,txt,col,tv){ ctx.font='bold 8px monospace'; const w=Math.ceil(ctx.measureText(txt).width)+10, h=13; const bx=Math.round(Math.min(G.VW-w-2,Math.max(2,x-w/2))), by=Math.round(y-h);
  ctx.fillStyle=tv?'#111':'#fff'; ctx.fillRect(bx-1,by-1,w+2,h+2); ctx.fillStyle=tv?'#2a3440':'#f4f0e6'; ctx.fillRect(bx,by,w,h); if(tv){ for(let i=0;i<14;i++){ ctx.fillStyle=Math.random()<0.5?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.15)'; ctx.fillRect(bx+Math.random()*w,by+Math.random()*h,2,1); } }
  if(!tv){ ctx.fillStyle='#f4f0e6'; ctx.fillRect(Math.round(x)-2,by+h,4,3); ctx.fillStyle='#fff'; ctx.fillRect(Math.round(x)-1,by+h+3,2,2); }
  ctx.textAlign='center'; ctx.fillStyle=col; ctx.fillText(txt,bx+w/2,by+9); ctx.textAlign='left'; }
const _renderAfter7=renderAfter5; renderAfter5=function(){ _renderAfter7(); if(G.state!=='play') return; const dt=1/60; const ox=-Math.round(G.cam.x), oy=-Math.round(G.cam.y);
  if(V07.say){ V07.say.t-=dt; const e=V07.say.e; if(V07.say.t<=0||e.dead) V07.say=null; else bubble7(e.x+e.w/2+ox,e.y+oy-6,V07.say.txt,'#b00020',false); }
  if(V07.tvsay){ V07.tvsay.t-=dt; const P=G.player; if(V07.tvsay.t<=0) V07.tvsay=null; else bubble7(P.x+P.w/2+ox,P.y+oy-8-(1.5-V07.tvsay.t)*6,V07.tvsay.txt,'#8ff',true); }
  if(V07.stat>0){ V07.stat-=dt; ctx.save(); ctx.globalAlpha=Math.min(0.5,V07.stat*0.5); for(let i=0;i<260;i++){ ctx.fillStyle=Math.random()<0.5?'#fff':'#000'; ctx.fillRect((Math.random()*G.VW)|0,(Math.random()*G.VH)|0,2+(Math.random()*6|0),1); } ctx.restore(); }
  if(V07.banner>0){ V07.banner-=dt; const a=Math.min(1,V07.banner,(4.2-V07.banner)*2); ctx.save(); ctx.globalAlpha=a; ctx.fillStyle='rgba(0,0,0,0.55)'; const by=Math.round(G.VH*0.6); ctx.fillRect(0,by,G.VW,34); ctx.textAlign='center'; ctx.font='bold 14px monospace'; ctx.fillStyle='#000'; ctx.fillText('MAINSTREAM-TV-ZOMBIE',G.VW/2+1,by+17); ctx.fillStyle='#ff5252'; ctx.fillText('MAINSTREAM-TV-ZOMBIE',G.VW/2,by+16); ctx.font='8px monospace'; ctx.fillStyle='#cfd8dc'; ctx.fillText('— jetzt live auf allen Kanälen —',G.VW/2,by+28); ctx.restore(); ctx.textAlign='left'; } };
const _update7=update; update=function(dt){ _update7(dt); if(G.state!=='play'||!G.w) return; try{ genTick7(dt); bossTrigger7(dt); }catch(err){ console.error(err); } };
// Version
$('tver').textContent='Version 0.7 · Der TV-Zombie';
