// Lifetime 0.2 – neuer Look: Kachelränder, Gras, Baumkronen, Parallax, Farblicht
'use strict';
const NATURAL=new Set([1,2,3,4,9,14,15,16,17,34,40,46,47,54,56]);
const LOOK={framed:new Map(),blades:[],clumps:{},bigShroom:[],layers:null,clouds:[],glow:{},roots:null,caveWall:{}};
// ---- bessere Grundtexturen ----
const _drawTileOld=drawTile;
drawTile=function(id,g,r,t,v){
  const speck=(base,n,cols,sz)=>{ for(let i=0;i<n;i++){ const x=r()*15|0,y=r()*15|0; px(g,cols[i%cols.length],x,y,sz||2,1+(r()<0.5?1:0)); } };
  switch(id){
  case 1: noiseFill(g,'#8a5a36',0.12,r,T,T); speck('#8a5a36',7,['#6e4426','#a06c42','#5e3a20']); if(v===1){ px(g,'#7d7d85',3,9,3,2); px(g,'#9a9aa2',3,9,1,1);} if(v===3){ px(g,'#7d7d85',10,4,2,2);} return;
  case 2: noiseFill(g,'#8a5a36',0.12,r,T,T); speck('#8a5a36',5,['#6e4426','#a06c42']); for(let x=0;x<T;x++){ const d=3+((x*7+v*3)%3===0?2:x%4===0?1:0); px(g,'#3fae2a',x,0,1,d); px(g,'#6ad83c',x,0,1,1); px(g,'#2a8a1e',x,d,1,1);} return;
  case 3: noiseFill(g,'#80808a',0.1,r,T,T); for(let i=0;i<4;i++){ const x=r()*12|0,y=r()*13|0; px(g,'#9a9aa6',x,y,4,2); px(g,'#b4b4bf',x,y,2,1); px(g,'#62626c',x,y+2,4,1);} return;
  case 4: noiseFill(g,'#e0c888',0.08,r,T,T); speck('#e0c888',6,['#c9b070','#f0dca0']); return;
  case 46: noiseFill(g,'#a8684a',0.1,r,T,T); speck('',6,['#8a5038','#c07a58']); return;
  case 6: px(g,'#6e4a2a',2,0,12,T); px(g,'#8a5e36',3,0,8,T); px(g,'#a87444',3,0,2,T); px(g,'#54361e',11,0,2,T); px(g,'#3e2714',2,0,1,T); px(g,'#3e2714',13,0,1,T);
    for(let i=0;i<4;i++){ const x=5+(r()*5|0), y=r()*12|0; px(g,'#5e3e22',x,y,1,3+(r()*3|0)); } if(v===2){ px(g,'#4a2e18',7,6,3,2); px(g,'#2e1c0e',8,7,1,1);} return;
  case 52: for(let y=0;y<T;y++){ const w=Math.max(1,Math.round(10*(1-y/T))); const x0=8-Math.ceil(w/2); px(g,'#8a8a96',x0,y,w,1); px(g,'#b0b0bc',x0,y,1,1); px(g,'#5a5a66',x0+w-1,y,1,1);} return;
  case 53: for(let y=0;y<T;y++){ const x=7+Math.round(Math.sin((y+v*4)*0.5)*1.5); px(g,'#2f7a22',x,y,2,1);} for(let k=0;k<3;k++){ const y=2+k*5+(v&1); const x=7+Math.round(Math.sin((y+v*4)*0.5)*1.5); px(g,'#4cae3a',x+(k%2?2:-3),y,3,2); px(g,'#7ad84e',x+(k%2?2:-3),y,1,1);} return;
  case 54: noiseFill(g,'#4a4258',0.15,r,T,T); for(let x=0;x<T;x++){ const d=3+((x*5+v)%3===0?2:0); px(g,'#3a6fd8',x,0,1,d); px(g,'#7ab8ff',x,0,1,1);} return;
  case 56: noiseFill(g,'#4a4258',0.15,r,T,T); speck('',5,['#3a3448','#5e5670']); return;
  case 55: px(g,'#c8d8f0',7,8,2,8); px(g,'#3a8aff',3,4,10,4); px(g,'#9ad0ff',5,4,4,1); return;
  }
  _drawTileOld(id,g,r,t,v);
};
// ---- gerahmte Kacheln (gerundet, schuppig, Umriss) ----
function framedTile(id,v,m){
  const key=(id*4+v)*16+m; let c=LOOK.framed.get(key); if(c) return c;
  c=mkCanvas(T,T); const g=c.getContext('2d'); g.drawImage(GFX.tiles[id][v],0,0);
  const im=g.getImageData(0,0,T,T), D=im.data; const nat=NATURAL.has(id);
  const A=(x,y)=>D[(y*T+x)*4+3]; const clr=(x,y)=>{ D[(y*T+x)*4+3]=0; };
  if(nat){ const U=m&1,R=m&2,Dn=m&4,L=m&8;
    for(let i=0;i<T;i++){ const j=((i+v*3+id)>>1)%3===0?1:0;
      if(U&&j) clr(i,0); if(Dn&&j) clr(i,T-1); if(L&&j) clr(0,i); if(R&&j) clr(T-1,i); }
    const corner=(cx,cy,sx,sy)=>{ for(let y=0;y<3;y++)for(let x=0;x<3;x++){ if(x+y<3) clr(cx+sx*x,cy+sy*y);} };
    if(U&&L) corner(0,0,1,1); if(U&&R) corner(T-1,0,-1,1); if(Dn&&L) corner(0,T-1,1,-1); if(Dn&&R) corner(T-1,T-1,-1,-1);
  }
  const ex=(x,y)=>{ if(x<0) return !!(m&8); if(x>=T) return !!(m&2); if(y<0) return !!(m&1); if(y>=T) return !!(m&4); return A(x,y)===0; };
  const out=new Uint8ClampedArray(D);
  const grassTop=(id===2||id===54)&&(m&1);
  for(let y=0;y<T;y++)for(let x=0;x<T;x++){ const k=(y*T+x)*4; if(D[k+3]===0) continue;
    const e=ex(x-1,y)||ex(x+1,y)||ex(x,y-1)||ex(x,y+1);
    if(e){ if(grassTop&&y<5){ out[k]=id===2?28:30; out[k+1]=id===2?96:60; out[k+2]=id===2?20:140; } else { out[k]=D[k]*0.42; out[k+1]=D[k+1]*0.42; out[k+2]=D[k+2]*0.45; } }
    else if(ex(x,y-2)||ex(x-2,y)){ out[k]=Math.min(255,D[k]*1.14); out[k+1]=Math.min(255,D[k+1]*1.14); out[k+2]=Math.min(255,D[k+2]*1.14); }
    else if(ex(x,y+2)||ex(x+2,y)){ out[k]=D[k]*0.82; out[k+1]=D[k+1]*0.82; out[k+2]=D[k+2]*0.82; } }
  im.data.set(out); g.putImageData(im,0,0);
  // Gras läuft an Seitenkanten etwas herunter
  if(id===2&&(m&1)){ if(m&8){ px(g,'#3fae2a',0,2,2,4); px(g,'#1c6014',0,2,1,4);} if(m&2){ px(g,'#3fae2a',14,2,2,4); px(g,'#1c6014',15,2,1,4);} }
  LOOK.framed.set(key,c); return c;
}
function buildLook(){
  // Grashalme + Blumen
  for(let v=0;v<4;v++){ const c=mkCanvas(16,8), g=c.getContext('2d'), r=rngSeed(400+v);
    for(let x=0;x<16;x++){ if(r()<0.35) continue; const h=1+(r()*5|0); const col=r()<0.5?'#3fae2a':r()<0.5?'#56c836':'#2a8a1e'; px(g,col,x,8-h,1,h); if(h>2) px(g,'#7ae24e',x,8-h,1,1); }
    if(v!==1){ const x=2+(r()*11|0), cl=['#ff5a6e','#ffd54f','#ffffff','#b388ff'][v]; px(g,'#2a8a1e',x+1,3,1,5); px(g,cl,x,1,3,2); px(g,cl,x+1,0,1,4); px(g,'#ffeb3b',x+1,1,1,1); }
    LOOK.blades.push(c); }
  // Baumkronen-Büschel
  const leafCols={7:['#4cae3a','#2c7a24'],49:['#f48fb1','#c2557e'],50:['#f2b630','#c07818'],51:['#2a8a5a','#195a3a']};
  for(const id in leafCols){ LOOK.clumps[id]=[]; const [b,d]=leafCols[id];
    for(let v=0;v<3;v++){ const r=rngSeed(id*7+v); const R=new Ras(28,28);
      if(id==51){ for(let k=0;k<3;k++){ const y=6+k*6, hw=5+k*3; for(let x=-hw;x<=hw;x++){ const hh=4+((x+k+v)&1); for(let j=0;j<hh;j++){ const yy=y+j-Math.round(Math.abs(x)*0.25); R.set(14+x,yy,j===0?shade(b,1.3):j===hh-1?d:b);} } } }
      else { const n=6; for(let k=0;k<n;k++){ const a=k/n*Math.PI*2+v; R.ell(14+Math.cos(a)*6.5,14+Math.sin(a)*5.5,6+r()*1.5,5.5+r()*1.5,b); } R.ell(14,13,7,6,b);
        for(let i=0;i<60;i++){ const x=4+r()*20|0,y=4+r()*20|0; if(R.c[y*28+x]) R.set(x,y,r()<0.5?shade(b,1.25):shade(b,0.78)); }
        if(id==49) for(let i=0;i<10;i++){ const x=5+r()*18|0,y=5+r()*18|0; if(R.c[y*28+x]) R.set(x,y,'#fff0f6'); }
        if(id==7&&v===1){ R.set(10,9,'#e33'); R.set(17,15,'#e33'); R.set(13,19,'#e33'); } }
      LOOK.clumps[id].push(R.toCanvas(true,shade(d,0.5))); } }
  // Wurzeln
  { const R=new Ras(26,6); R.rect(4,0,18,2,'#6e4a2a'); R.rect(1,2,6,2,'#6e4a2a'); R.rect(19,2,6,2,'#6e4a2a'); R.rect(0,4,3,1,'#5e3e22'); R.rect(23,4,3,1,'#5e3e22'); R.rect(5,0,3,2,'#a87444'); LOOK.roots=R.toCanvas(true,'#2e1c0e'); }
  // große Leuchtpilze
  for(let v=0;v<3;v++){ const R=new Ras(22,30); const h=14+v*3, cw=8+v*2; R.rect(10,30-h,3,h,'#c8d8f0'); R.rect(10,30-h,1,h,'#e8f0ff'); R.ell(11,30-h,cw,4+v,'#3a8aff'); for(let i=-cw+2;i<cw-1;i+=3) R.set(11+i,30-h-1,'#bfe4ff'); R.rect(9,30-h+3,6,1,'#7aaaff');
    LOOK.bigShroom.push(R.toCanvas(true,'#0c1a40')); }
  // Glühen
  for(const [k,col] of [['warm','255,170,70'],['blue','90,170,255'],['red','255,60,40'],['neon','110,255,60']]){ const c=mkCanvas(64,64), g=c.getContext('2d'); const gr=g.createRadialGradient(32,32,0,32,32,32); gr.addColorStop(0,`rgba(${col},0.55)`); gr.addColorStop(0.4,`rgba(${col},0.2)`); gr.addColorStop(1,`rgba(${col},0)`); g.fillStyle=gr; g.fillRect(0,0,64,64); LOOK.glow[k]=c; }
  // Höhlenwand ohne Wandblock
  for(const [k,b] of [['dirt','#3a2618'],['stone','#2a2a32']]){ const c=mkCanvas(T,T), g=c.getContext('2d'), r=rngSeed(k.length*99); noiseFill(g,b,0.25,r,T,T); for(let i=0;i<3;i++) px(g,shade(b,0.7),r()*13|0,r()*14|0,3,1); LOOK.caveWall[k]=c; }
  buildLayers(); buildClouds();
}
// ---- Parallax-Schichten (1024 px breit, kachelbar) ----
function buildLayers(){
  const W=1024; const mk=(h)=>{ const c=mkCanvas(W,h); return [c,c.getContext('2d')]; };
  const per=(x,f,ph)=>Math.sin((x/W)*Math.PI*2*f+ph);
  const L=[];
  // ferne türkise Berge
  { const H=170; const [c,g]=mk(H); for(let x=0;x<W;x++){ const h=Math.round(92+per(x,2,0.3)*30+per(x,5,1.1)*14+per(x,11,2)*5); const top=H-h;
      for(let y=top;y<H;y++){ const d=y-top; let col=d<2?'#bff3ef':d<5?'#8fe0da':'#5fc4c4'; if(((x+Math.floor(y/2))%23)<3&&d>6) col='#52b2b6'; if(d>60) col='#4aa8b0'; px(g,col,x,y,1,1);} }
    L.push({c,f:0.08,H,base:'#4aa8b0',y:0.62}); }
  // nähere Berge
  { const H=150; const [c,g]=mk(H); for(let x=0;x<W;x++){ const h=Math.round(70+per(x,3,2)*24+per(x,7,0.5)*10+per(x,17,1)*4); const top=H-h;
      for(let y=top;y<H;y++){ const d=y-top; let col=d<2?'#7ad6c8':d<4?'#4fb8ac':'#3a9a94'; if(((x*3+y)%31)<2&&d>4) col='#338a86'; px(g,col,x,y,1,1);} }
    L.push({c,f:0.16,H,base:'#3a9a94',y:0.7}); }
  // dunkle Nadelwald-Silhouette
  const forest=(H,col,hi,seed,dens,f,yy)=>{ const [c,g]=mk(H); const r=rngSeed(seed); g.fillStyle=col; g.fillRect(0,H-26,W,26);
    for(let x=0;x<W;x+=dens){ const th=40+r()*(H-56); const bx=x+(r()*dens|0); for(let y=0;y<th;y++){ const hw=Math.round(1+y*0.28+((y%7)<2?-1:0)); g.fillStyle=col; g.fillRect((bx-hw+W)%W,H-26-th+y,hw*2+1,1); if(bx-hw<0||bx+hw>=W){ g.fillRect(bx-hw-W,H-26-th+y,hw*2+1,1); g.fillRect(bx-hw+W,H-26-th+y,hw*2+1,1);} if(y%7===2) { g.fillStyle=hi; g.fillRect(bx-hw,H-26-th+y,2,1);} } }
    L.push({c,f,H,base:col,y:yy}); };
  forest(130,'#1f6a5a','#2c8070',11,22,0.28,0.8);
  forest(120,'#14463a','#1c5a4a',23,15,0.42,0.9);
  LOOK.layers=L;
}
function buildClouds(){ for(let v=0;v<5;v++){ const r=rngSeed(900+v); const w=50+v*12, h=22+v*3; const R=new Ras(w,h);
    for(let k=0;k<5+v;k++){ const cx=8+r()*(w-16), cy=h*0.55+(r()-0.5)*h*0.3; R.ell(cx,cy,6+r()*8,4+r()*5,'#ffffff'); }
    for(let i=0;i<w*h;i++){ if(R.c[i]){ const y=Math.floor(i/w); R.c[i]=y>h*0.62?'#d6e4f2':y>h*0.5?'#eef4fb':'#ffffff'; } }
    LOOK.clouds.push(R.toCanvas(true,'#b8cce0')); } }
// ---- Hintergrund ----
function skyGrad(){ const h=hour(), dl=dayLight();
  if(G.bloodmoon) return ['#1a0204','#5a0a0a'];
  if(h>=18&&h<20.5) return ['#2a3a7a','#ff9a5a'];
  if(h>=4.8&&h<7) return ['#34508a','#ffb07a'];
  const mix=(a,b,t)=>{ const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16); const f=(s)=>Math.round(((A>>s)&255)*(1-t)+((B>>s)&255)*t); return `rgb(${f(16)},${f(8)},${f(0)})`; };
  return [mix('#020614','#1662d8',dl), mix('#0c1838','#8ad0ff',dl)]; }
drawBackground=function(){
  const cam=G.cam, VW=G.VW, VH=G.VH; const [c1,c2]=skyGrad(); const gr=ctx.createLinearGradient(0,0,0,VH); gr.addColorStop(0,c1); gr.addColorStop(0.75,c2); gr.addColorStop(1,c2); ctx.fillStyle=gr; ctx.fillRect(0,0,VW,VH);
  const h=hour(), dl=dayLight();
  // Sterne
  if(dl<0.5){ ctx.fillStyle=`rgba(255,255,255,${(0.5-dl)*1.6})`; for(let i=0;i<70;i++){ const x=((i*137.5-cam.x*0.01)%VW+VW)%VW, y=(i*71.3)%(VH*0.6); ctx.fillRect(x|0,y|0,i%9===0?2:1,i%9===0?2:1);} }
  // Sonne / Mond
  const ang=((h-6)/24)*Math.PI*2; const sx=VW/2-Math.cos(ang)*VW*0.42, sy=VH*0.8-Math.sin(ang)*VH*0.68;
  if(sy<VH*0.9){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.drawImage(LOOK.glow.warm,sx-70,sy-70,140,140); ctx.restore();
    ctx.fillStyle='#fff3a0'; ctx.fillRect(sx-11,sy-13,22,26); ctx.fillRect(sx-13,sy-11,26,22); ctx.fillStyle='#fffbe0'; ctx.fillRect(sx-8,sy-10,16,20); ctx.fillRect(sx-10,sy-8,20,16); ctx.fillStyle='#ffffff'; ctx.fillRect(sx-6,sy-6,8,8); }
  const mx=VW/2+Math.cos(ang)*VW*0.42, my=VH*0.8+Math.sin(ang)*VH*0.68;
  if(my<VH*0.9){ const bm=G.bloodmoon; if(bm){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.drawImage(LOOK.glow.red,mx-60,my-60,120,120); ctx.restore(); }
    ctx.fillStyle=bm?'#e02020':'#eef0f8'; ctx.fillRect(mx-9,my-11,18,22); ctx.fillRect(mx-11,my-9,22,18); ctx.fillStyle=bm?'#a01010':'#c8cce0'; ctx.fillRect(mx-5,my-5,4,4); ctx.fillRect(mx+3,my+2,3,3); ctx.fillRect(mx-2,my+5,2,2); }
  // Wolken
  const span=VW+400; for(let i=0;i<8;i++){ const cl=LOOK.clouds[i%5]; let x=((i*331+G.clock*(3+i%3)-cam.x*0.05)%span+span)%span-200; const y=14+((i*53)%70)-Math.max(0,(84*T-cam.y-VH*0.55))*0.02; ctx.globalAlpha=0.35+dl*0.65; ctx.drawImage(cl,x|0,y|0); ctx.globalAlpha=1; }
  // Parallax
  const surf=84*T-cam.y; // Oberflächenlinie auf dem Bildschirm
  for(const Ly of LOOK.layers){ const off=-(((cam.x*Ly.f)%1024)+1024)%1024; const by=Math.round(VH*Ly.y+(surf-VH*0.55)*Ly.f*1.6);
    if(by-Ly.H>VH) continue; for(let x=off;x<VW;x+=1024) ctx.drawImage(Ly.c,Math.round(x),by-Ly.H); ctx.fillStyle=Ly.base; ctx.fillRect(0,by,VW,VH-by+1); }
  // Stadt-Silhouette
  const city=G.w&&G.w.feat.city; if(city){ const ccx=(city.x0+city.x1)/2*T; const by=Math.round(VH*0.86+(surf-VH*0.55)*0.5*1.6); ctx.fillStyle='#24384a';
    for(let b=-14;b<14;b++){ const wx=ccx+b*30; const x=Math.round(wx-cam.x*0.5-(ccx*0.5)); const bh=40+((b*7919)%50+50)%50; if(x<-40||x>VW) continue; ctx.fillRect(x,by-bh,24,bh); ctx.fillStyle='#2e4a5e'; ctx.fillRect(x,by-bh,2,bh); ctx.fillStyle='#24384a'; } }
  // Nacht-Tönung über Hintergrund
  const tint=(1-dl)*0.72; if(tint>0.01){ ctx.fillStyle=G.bloodmoon?`rgba(40,0,0,${tint})`:`rgba(6,10,30,${tint})`; ctx.fillRect(0,0,VW,VH); }
};
// ---- Welt ----
function exposedMask(x,y){ const s=(a,b)=>{ const t=tget(a,b); const d=TILES[t]; return d&&d.s&&!d.glass&&!d.plat&&t!==19&&t!==20; }; return (s(x,y-1)?0:1)|(s(x+1,y)?0:2)|(s(x,y+1)?0:4)|(s(x-1,y)?0:8); }
drawWorld=function(){
  const cam=G.cam, w=G.w; const x0=Math.floor(cam.x/T)-1, y0=Math.floor(cam.y/T)-1, x1=x0+Math.ceil(G.VW/T)+2, y1=y0+Math.ceil(G.VH/T)+2;
  const ox=-Math.round(cam.x), oy=-Math.round(cam.y);
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){ const b=bget(x,y); const sx=x*T+ox, sy=y*T+oy;
    if(b&&GFX.walls[b]) ctx.drawImage(GFX.walls[b],sx,sy);
    else if(x>=0&&x<w.W&&y>w.sky[x]+3&&tget(x,y)===0) ctx.drawImage(y>w.sky[x]+25?LOOK.caveWall.stone:LOOK.caveWall.dirt,sx,sy); }
  ctx.fillStyle='rgba(0,0,0,0.38)'; for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){ if(bget(x,y)) ctx.fillRect(x*T+ox,y*T+oy,T,T); }
  const leaves=[], deco=[];
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){ const t=tget(x,y); if(!t) continue; const tex=GFX.tiles[t]; if(!tex) continue; const v=((x*7+y*13)&3); const sx=x*T+ox, sy=y*T+oy; const d=TILES[t];
    if(d.leaf) continue;
    if(t===5){ const above=tget(x,y-1); ctx.drawImage(tex[(v+((G.clock*3)|0))&3],sx,sy); if(above===0){ ctx.fillStyle='rgba(190,230,255,0.75)'; ctx.fillRect(sx,sy,T,1); ctx.fillStyle='rgba(120,190,255,0.35)'; ctx.fillRect(sx,sy+1,T,1);} continue; }
    if(t===55){ deco.push(LOOK.bigShroom[(x+y)%3],sx-3,sy+T-30); if(Math.random()<0.02) G.parts.push({x:x*T+8+(Math.random()-0.5)*12,y:y*T,vx:(Math.random()-0.5)*6,vy:-8-Math.random()*8,life:2,col:Math.random()<0.5?'#7ac8ff':'#bfe4ff',sz:1,light:0.35}); continue; }
    if(d.s&&!d.glass&&!d.plat&&t!==19&&t!==20&&(NATURAL.has(t)||t<48)){ let id=t; if(t===2&&TILES[tget(x,y-1)].s) id=1; if(t===54&&TILES[tget(x,y-1)].s) id=56; const m=exposedMask(x,y);
      ctx.drawImage(m?framedTile(id,v,m):GFX.tiles[id][v],sx,sy);
      if((id===2||id===54)&&(m&1)){ const up=tget(x,y-1); if(up===0) deco.push(id===2?LOOK.blades[(x*3+y)&3]:null,sx,sy-7); } }
    else { ctx.drawImage(tex[v],sx,sy); if(t===6&&TILES[tget(x,y+1)].s&&tget(x,y+1)!==6) deco.push(LOOK.roots,sx-5,sy+T-4); }
    if(t===22||t===24){ if(Math.random()<0.15) G.parts.push({x:x*T+8+(Math.random()-0.5)*6,y:y*T+4,vx:0,vy:-20,life:0.6,col:Math.random()<0.5?'#ffb300':'#ff6a00',sz:1}); }
    const dm=G.dmg.get(y*w.W+x); if(dm){ const f=dm/(d.h*25); if(!FXS.crack.length) buildCracks(); ctx.drawImage(FXS.crack[Math.min(4,f*5|0)],sx,sy); }
  }
  for(let i=0;i<deco.length;i+=3) if(deco[i]) ctx.drawImage(deco[i],deco[i+1],deco[i+2]);
  drawCrowns(x0,y0,x1,y1,ox,oy);
  if(G.mineT&&G.mineT.p>0){ const m=G.mineT; const sx=m.x*T+ox, sy=m.y*T+oy; ctx.strokeStyle='rgba(255,240,200,0.55)'; ctx.strokeRect(sx+0.5,sy+0.5,T-1,T-1); if(!FXS.crack.length) buildCracks(); ctx.drawImage(FXS.crack[Math.min(4,m.p*5|0)],sx,sy); }
  return {x0,y0,x1,y1,ox,oy};
};
// ---- Licht mit weichem Abfall + farbigem Glühen ----
drawLight=function(v){
  const w=v.x1-v.x0+1, h=v.y1-v.y0+1; computeLight(v.x0,v.y0,w,h);
  if(!lightCv||lightCv.width!==w||lightCv.height!==h){ lightCv=mkCanvas(w,h); lightCtx=lightCv.getContext('2d'); }
  const id=lightCtx.createImageData(w,h); const D=id.data; const bm=G.bloodmoon;
  for(let i=0;i<w*h;i++){ const l=Math.min(1,LG[i]); const a=Math.round(Math.pow(1-l,1.35)*255); D[i*4]=bm?30:0; D[i*4+1]=0; D[i*4+2]=bm?0:6; D[i*4+3]=a; }
  lightCtx.putImageData(id,0,0);
  ctx.save(); ctx.imageSmoothingEnabled=true; ctx.drawImage(lightCv,v.x0*T+v.ox-T/2,v.y0*T+v.oy-T/2,w*T,h*T);
  ctx.globalCompositeOperation='lighter';
  for(let y=v.y0;y<=v.y1;y++)for(let x=v.x0;x<=v.x1;x++){ const t=tget(x,y); const d=TILES[t]; if(!d||!d.light) continue; const k=d.lcol==='blue'?'blue':'warm'; const r=(t===55?44:t===21?52:70)*(0.92+Math.sin(G.clock*7+x*3)*0.05);
    ctx.globalAlpha=t===55?0.55:0.5; ctx.drawImage(LOOK.glow[k],x*T+v.ox+8-r,y*T+v.oy+8-r,r*2,r*2); }
  const P=G.player; if(P&&heldItem()==='fackel'){ const r=56+Math.sin(G.clock*9)*3; ctx.globalAlpha=0.5; ctx.drawImage(LOOK.glow.warm,P.x+P.w/2+v.ox-r,P.y+14+v.oy-r,r*2,r*2); }
  for(const p of G.proj){ if(p.light){ const n=p.type==='kotze'; ctx.globalAlpha=n?0.7:0.4; const r=n?26:20; ctx.drawImage(n?LOOK.glow.neon:LOOK.glow.warm,p.x+v.ox-r,p.y+v.oy-r,r*2,r*2);} }
  for(const q of (G.puddles||[])){ const r=q.w*0.9+Math.sin(G.clock*3+q.x)*3; ctx.globalAlpha=0.55*Math.min(1,q.life/3); ctx.drawImage(LOOK.glow.neon,q.x+v.ox-r,q.y+v.oy-r*0.6,r*2,r*1.2); }
  for(const e of G.ents){ if(e.dead) continue; const glow=e.rad||(e.kind==='mob'&&MOBS[e.t].glow); if(!glow) continue; const x=e.x+e.w/2+v.ox, y=e.y+e.h/2+v.oy; if(x<-80||x>G.VW+80) continue; const r=Math.max(e.w,e.h)*1.1+10+Math.sin(G.clock*4+e.x)*4; ctx.globalAlpha=0.5; ctx.drawImage(LOOK.glow.neon,x-r,y-r,r*2,r*2); }
  ctx.restore(); ctx.imageSmoothingEnabled=false;
};

// ---- Baumkronen als zusammenhängende Blobs ----
LOOK.crown=new Map();
const LEAFCOL={7:['#4cae3a','#2c7a24'],49:['#f48fb1','#b04870'],50:['#f2b630','#b06a10'],51:['#2a8a5a','#174a32']};
function drawCrowns(x0,y0,x1,y1,ox,oy){ const M=7; const W=G.w.W; const seen=new Set();
  for(let y=y0-M;y<=y1+M;y++)for(let x=x0-M;x<=x1+M;x++){ const t=tget(x,y); if(!TILES[t]||!TILES[t].leaf) continue; const k=y*W+x; if(seen.has(k)) continue;
    // Gruppe suchen
    const st=[[x,y]], cells=[]; seen.add(k); let gx0=x,gx1=x,gy0=y,gy1=y; let h=t*7;
    while(st.length){ const [a,b]=st.pop(); cells.push(a,b); h=(h*31+a*7+b*13)|0; if(a<gx0)gx0=a; if(a>gx1)gx1=a; if(b<gy0)gy0=b; if(b>gy1)gy1=b;
      for(const [da,db] of [[1,0],[-1,0],[0,1],[0,-1]]){ const na=a+da, nb=b+db; const nk=nb*W+na; if(seen.has(nk)) continue; const nt=tget(na,nb); if(nt===t){ seen.add(nk); st.push([na,nb]); } } }
    const key=t+':'+gx0+':'+gy0+':'+cells.length+':'+h; let cv=LOOK.crown.get(key);
    if(!cv){ if(LOOK.crown.size>400) LOOK.crown.clear(); cv=paintCrown(t,cells,gx0,gy0,gx1,gy1); LOOK.crown.set(key,cv); }
    ctx.drawImage(cv,gx0*T+ox-10,gy0*T+oy-10); } }
function paintCrown(t,cells,gx0,gy0,gx1,gy1){ const [b,d]=LEAFCOL[t]||LEAFCOL[7]; const R=new Ras((gx1-gx0+1)*T+20,(gy1-gy0+1)*T+20); const r=rngSeed(gx0*131+gy0*17+cells.length);
  const order=[]; for(let i=0;i<cells.length;i+=2) order.push([cells[i],cells[i+1]]); order.sort((p,q)=>p[1]-q[1]);
  for(const [a,c] of order){ const cx=(a-gx0)*T+18+(r()-0.5)*5, cy=(c-gy0)*T+18+(r()-0.5)*4;
    if(t===51){ for(let j=0;j<10;j++){ const hw=4+j*0.9+r(); for(let xx=-hw;xx<=hw;xx++){ const col=j<2?shade(b,1.3):j>7?d:(xx<-hw+2?shade(b,1.15):xx>hw-2?shade(b,0.8):b); R.set(cx+xx,cy-8+j,col);} } }
    else R.ell(cx,cy,10.5+r()*2,9+r()*2,b); }
  if(t!==51){ for(let i=0;i<R.w*R.h/9;i++){ const x=r()*R.w|0,y=r()*R.h|0; const c=R.c[y*R.w+x]; if(c&&c!==shade(b,0.62)) R.set(x,y,r()<0.5?shade(b,1.22):shade(b,0.82)); }
    if(t===49) for(let i=0;i<R.w*R.h/60;i++){ const x=r()*R.w|0,y=r()*R.h|0; if(R.c[y*R.w+x]) R.set(x,y,'#fff0f6'); }
    if(t===7&&r()<0.4) for(let i=0;i<cells.length/6;i++){ const x=r()*R.w|0,y=r()*R.h|0; if(R.c[y*R.w+x]){ R.set(x,y,'#e33'); R.set(x+1,y,'#c22'); } } }
  return R.toCanvas(true,shade(d,0.45)); }
