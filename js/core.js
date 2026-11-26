// Lifetime – Kern: Welt, Physik, Licht, Zeichnen
'use strict';
const G={state:'title',w:null,ents:[],proj:[],parts:[],drops:[],nums:[],msgs:[],time:0.05,day:1,cam:{x:0,y:0,shake:0},
  VW:640,VH:300,zoom:1,dmg:new Map(),containers:{},explored:null,cannAngry:0,bloodmoon:false,bmKills:0,bmSpawned:0,boss:null,stats:{kills:0,days:0}, mineT:null, rumor:0, opts:{zoomVH:300,mus:0.5,sfx:0.8,ctrl:1}};
const DAYLEN=480; // Sekunden pro Tag
let cv,ctx,lightCv,lightCtx;
function W(){ return G.w; }
function tget(x,y){ const w=G.w; if(x<0||y<0||x>=w.W||y>=w.H) return 17; return w.tiles[y*w.W+x]; }
function bget(x,y){ const w=G.w; if(x<0||y<0||x>=w.W||y>=w.H) return 0; return w.bg[y*w.W+x]; }
function solidAt(x,y){ const t=TILES[tget(x,y)]; return t&&t.s; }
function tset(x,y,t){ const w=G.w; if(x<0||y<0||x>=w.W||y>=w.H) return; const i=y*w.W+x; w.tiles[i]=t; G.dmg.delete(i);
  if(t!==0&&TILES[t].s&&tget(x,y+1)===2) w.tiles[i+w.W]=1; // Gras wird Erde
  updSky(x); }
function bset(x,y,b){ const w=G.w; if(x<0||y<0||x>=w.W||y>=w.H) return; w.bg[y*w.W+x]=b; }
function opaque(t){ const d=TILES[t]; return d&&d.s&&!d.glass; }
function updSky(x){ const w=G.w; let y=0; while(y<w.H&&!opaque(w.tiles[y*w.W+x])) y++; w.sky[x]=y; }
function initSky(){ const w=G.w; w.sky=new Int16Array(w.W); for(let x=0;x<w.W;x++) updSky(x); }
function surfaceY(x){ x=Math.max(0,Math.min(G.w.W-1,x|0)); let y=0; while(y<G.w.H&&!(TILES[tget(x,y)].s||tget(x,y)===5)) y++; return y; }
function hour(){ return (6+G.time*24)%24; }
function isNight(){ const h=hour(); return h>=20||h<5; }
function dayLight(){ const h=hour(); if(h>=7&&h<19) return 1; if(h>=19&&h<21) return 1-(h-19)/2*0.7; if(h>=4&&h<7) return 0.3+(h-4)/3*0.7; return 0.3; }
// ---- Körper-Physik ----
function overlapTiles(b,fn){ const x0=Math.floor(b.x/T),x1=Math.floor((b.x+b.w-0.01)/T),y0=Math.floor(b.y/T),y1=Math.floor((b.y+b.h-0.01)/T); for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){ if(fn(x,y,tget(x,y))) return true;} return false; }
function hitsSolid(b,dropPlat){ return overlapTiles(b,(x,y,t)=>{ const d=TILES[t]; if(d.s) return true; return false; }); }
function platHit(b,pb){ if(b.dropPlat) return false; const yb=Math.floor((b.y+b.h-0.001)/T); if(pb>yb*T+0.001) return false; const x0=Math.floor(b.x/T),x1=Math.floor((b.x+b.w-0.01)/T); for(let x=x0;x<=x1;x++) if(TILES[tget(x,yb)].plat) return true; return false; }
function moveBody(b,dt){
  const wasGround=b.onGround; b.onGround=false; b.hitWall=0; b.stepped=false;
  let dx=b.vx*dt, dy=b.vy*dt;
  const sx=Math.sign(dx); let rx=Math.abs(dx);
  while(rx>0){ const s=Math.min(1,rx); rx-=s; b.x+=sx*s; if(hitsSolid(b)){
      if(b.canStep&&wasGround&&b.vy>=0){ b.y-=T; if(!hitsSolid(b)){ b.stepped=true; continue; } b.y+=T; }
      b.x-=sx*s; b.hitWall=sx; b.vx=0; break; } }
  const sy=Math.sign(dy); let ry=Math.abs(dy);
  while(ry>0){ const s=Math.min(1,ry); ry-=s; const pb=b.y+b.h; b.y+=sy*s; let col=hitsSolid(b); if(!col&&sy>0) col=platHit(b,pb);
    if(col){ b.y-=sy*s; if(sy>0) b.onGround=true; b.vy=0; break; } }
  if(!b.onGround&&b.vy>=0){ const pb=b.y+b.h; b.y+=1; if(hitsSolid(b)||platHit(b,pb)) b.onGround=true; b.y-=1; }
}
function inWater(b,head){ const x=Math.floor((b.x+b.w/2)/T), y=Math.floor((head?b.y+3:b.y+b.h*0.6)/T); return tget(x,y)===5; }
function onLadder(b){ return overlapTiles(b,(x,y,t)=>TILES[t].climb); }
// ---- Licht ----
let LG=null;
function computeLight(x0,y0,w,h){
  const n=w*h; if(!LG||LG.length<n) LG=new Float32Array(n);
  const sky=G.w.sky; const dl=dayLight();
  for(let j=0;j<h;j++){ const y=y0+j; for(let i=0;i<w;i++){ const x=x0+i; let l=0; const t=tget(x,y);
      if(x>=0&&x<G.w.W&&y<sky[x]){ l=bget(x,y)?dl*0.55:dl; }
      const d=TILES[t]; if(d&&d.light) l=Math.max(l,d.light);
      LG[j*w+i]=l; } }
  // Lichtquellen aus Entitäten
  const P=G.player; if(P){ const qx=Math.floor((P.x+P.w/2)/T)-x0, qy=Math.floor((P.y+10)/T)-y0; if(qx>=0&&qy>=0&&qx<w&&qy<h) LG[qy*w+qx]=Math.max(LG[qy*w+qx],0.3); const it=heldItem(); if(it==='fackel'){ const px0=Math.floor((P.x+P.w/2)/T)-x0, py0=Math.floor((P.y+8)/T)-y0; if(px0>=0&&py0>=0&&px0<w&&py0<h) LG[py0*w+px0]=Math.max(LG[py0*w+px0],0.9);} }
  for(const p of G.parts){ if(p.light){ const a=Math.floor(p.x/T)-x0,b=Math.floor(p.y/T)-y0; if(a>=0&&b>=0&&a<w&&b<h) LG[b*w+a]=Math.max(LG[b*w+a],p.light);} }
  for(const e of G.proj){ if(e.light){ const a=Math.floor(e.x/T)-x0,b=Math.floor(e.y/T)-y0; if(a>=0&&b>=0&&a<w&&b<h) LG[b*w+a]=Math.max(LG[b*w+a],e.light);} }
  // Ausbreitung
  const dec=(x,y)=>{ const t=tget(x,y); return TILES[t].s&&!TILES[t].glass?0.22:0.075; };
  for(let pass=0;pass<2;pass++){
    for(let j=0;j<h;j++){ let v=0; for(let i=0;i<w;i++){ const k=j*w+i; v=Math.max(LG[k],v); LG[k]=v; v-=dec(x0+i,y0+j);} v=0; for(let i=w-1;i>=0;i--){ const k=j*w+i; v=Math.max(LG[k],v); LG[k]=v; v-=dec(x0+i,y0+j);} }
    for(let i=0;i<w;i++){ let v=0; for(let j=0;j<h;j++){ const k=j*w+i; v=Math.max(LG[k],v); LG[k]=v; v-=dec(x0+i,y0+j);} v=0; for(let j=h-1;j>=0;j--){ const k=j*w+i; v=Math.max(LG[k],v); LG[k]=v; v-=dec(x0+i,y0+j);} }
  }
}
// ---- Zeichnen ----
function skyColors(){ const h=hour(); const dl=dayLight();
  if(G.bloodmoon) return ['#2a0505','#5a0a0a'];
  if(h>=18&&h<21) return ['#2a3a6a','#e08050'];
  if(h>=4.5&&h<7) return ['#3a4a7a','#f0a070'];
  const a=Math.round(10+dl*110),b=Math.round(20+dl*160),c=Math.round(50+dl*200);
  return [`rgb(${a*0.5|0},${b*0.6|0},${c*0.8|0})`,`rgb(${a+40},${b+40},${Math.min(255,c+20)})`]; }
function drawBackground(){
  const [c1,c2]=skyColors(); const gr=ctx.createLinearGradient(0,0,0,G.VH); gr.addColorStop(0,c1); gr.addColorStop(1,c2); ctx.fillStyle=gr; ctx.fillRect(0,0,G.VW,G.VH);
  const h=hour(); const cam=G.cam;
  // Sonne/Mond
  const ang=((h-6)/24)*Math.PI*2; const sx=G.VW/2-Math.cos(ang)*G.VW*0.45, sy=G.VH*0.75-Math.sin(ang)*G.VH*0.65;
  if(sy<G.VH) { ctx.fillStyle='#fff6b0'; ctx.fillRect(sx-8,sy-8,16,16); }
  const mx=G.VW/2+Math.cos(ang)*G.VW*0.45, my=G.VH*0.75+Math.sin(ang)*G.VH*0.65;
  if(my<G.VH){ ctx.fillStyle=G.bloodmoon?'#d01010':'#e8e8f0'; ctx.fillRect(mx-7,my-7,14,14); ctx.fillStyle=G.bloodmoon?'#901010':'#c8c8d8'; ctx.fillRect(mx-3,my-2,3,3); }
  if(isNight()&&!G.bloodmoon){ ctx.fillStyle='#fff'; for(let i=0;i<40;i++){ const x=((i*137.5+(-cam.x*0.02))%G.VW+G.VW)%G.VW, y=(i*71)%(G.VH*0.6); ctx.fillRect(x,y,1,1);} }
  // Parallax-Hügel und Silhouetten
  const groundY=(84*T-cam.y)*0.6+G.VH*0.35;
  const dl=dayLight(); const under=G.player&&(G.player.y/T>G.w.sky[Math.floor((G.player.x)/T)]+12);
  const layers=[[0.15,'#3a4a5a',40,0.9],[0.3,'#2a3a3a',25,0.8],[0.5,'#1e2a22',12,0.7]];
  const city=G.w&&G.w.feat.city; const ccx=city?((city.x0+city.x1)/2*T):0;
  for(const [f,col,amp,dk] of layers){ ctx.fillStyle=shade(col,0.4+dl*0.6*(G.bloodmoon?0.5:1)); const off=cam.x*f; const base=groundY+G.VH*0.12*f-20;
    ctx.beginPath(); ctx.moveTo(0,G.VH); for(let x=0;x<=G.VW;x+=4){ const wx=x+off; let y=base-Math.sin(wx*0.004/f)*amp-Math.sin(wx*0.013)*amp*0.3;
      // Skyline
      if(city&&f===0.3){ const d=Math.abs((x+cam.x)-ccx); if(d<(city.x1-city.x0)*T*0.7){ const b=Math.floor(wx/22); y=base-40-((b*7919)%60); } }
      // Bäume
      if(f===0.5){ const k=Math.floor(wx/9); if((k*2654435761>>>0)%3===0) y-=14+((k*97)%10); }
      ctx.lineTo(x,y);} ctx.lineTo(G.VW,G.VH); ctx.fill(); }
  if(under){ ctx.fillStyle='rgba(20,14,10,0.0)'; }
}
function drawWorld(){
  const cam=G.cam, w=G.w; const x0=Math.floor(cam.x/T)-1, y0=Math.floor(cam.y/T)-1, x1=x0+Math.ceil(G.VW/T)+2, y1=y0+Math.ceil(G.VH/T)+2;
  const ox=-Math.round(cam.x), oy=-Math.round(cam.y);
  // Höhlenhintergrund (unter der Oberfläche ohne Wand)
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){ const b=bget(x,y); const sx=x*T+ox, sy=y*T+oy;
      if(b&&GFX.walls[b]){ ctx.drawImage(GFX.walls[b],sx,sy); }
      else if(x>=0&&x<w.W&&y>w.sky[x]+3&&tget(x,y)===0){ ctx.fillStyle='#24180f'; ctx.fillRect(sx,sy,T,T); } }
  ctx.fillStyle='rgba(0,0,0,0.35)'; for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){ if(bget(x,y)) ctx.fillRect(x*T+ox,y*T+oy,T,T);} // Wände abdunkeln
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){ const t=tget(x,y); if(!t) continue; const tex=GFX.tiles[t]; if(!tex) continue; const v=((x*7+y*13)&3); const sx=x*T+ox, sy=y*T+oy;
      if(t===2&&TILES[tget(x,y-1)].s){ ctx.drawImage(GFX.tiles[1][v],sx,sy); continue; }
      if(t===5){ const above=tget(x,y-1); ctx.drawImage(tex[(v+((G.clock*3)|0))&3],sx,sy); if(above===0){ ctx.fillStyle='rgba(160,210,255,0.6)'; ctx.fillRect(sx,sy,T,1);} continue; }
      ctx.drawImage(tex[v],sx,sy);
      const d=TILES[t]; if(d.s&&!d.glass){ if(!TILES[tget(x,y-1)].s){ ctx.fillStyle='rgba(255,255,255,0.12)'; ctx.fillRect(sx,sy,T,1);} if(!TILES[tget(x,y+1)].s){ ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.fillRect(sx,sy+T-2,T,2);} if(!TILES[tget(x-1,y)].s){ ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.fillRect(sx,sy,1,T);} if(!TILES[tget(x+1,y)].s){ ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.fillRect(sx+T-1,sy,1,T);} }
      if(t===22||t===24){ if(Math.random()<0.15) G.parts.push({x:x*T+8+(Math.random()-0.5)*6,y:y*T+4,vx:0,vy:-20,life:0.6,col:Math.random()<0.5?'#ffb300':'#ff6a00',sz:1}); }
      const dm=G.dmg.get(y*w.W+x); if(dm){ const f=dm/(d.h*25); ctx.fillStyle='rgba(0,0,0,0.55)'; const n=Math.min(4,1+f*4|0); for(let k=0;k<n;k++){ ctx.fillRect(sx+3+k*3,sy+2+(k*5)%11,1,5); ctx.fillRect(sx+2+k*3,sy+6+(k*3)%8,4,1);} }
  }
  // Abbaufortschritt
  if(G.mineT&&G.mineT.p>0){ const m=G.mineT; const sx=m.x*T+ox, sy=m.y*T+oy; ctx.strokeStyle='rgba(255,255,255,0.8)'; ctx.strokeRect(sx+0.5,sy+0.5,T-1,T-1); ctx.fillStyle='rgba(0,0,0,0.5)'; const f=m.p; for(let k=0;k<f*6;k++){ ctx.fillRect(sx+2+(k*5)%12,sy+2+(k*7)%12,3,1); ctx.fillRect(sx+3+(k*3)%10,sy+3+(k*5)%10,1,3);} }
  return {x0,y0,x1,y1,ox,oy};
}
function drawLight(v){
  const w=v.x1-v.x0+1, h=v.y1-v.y0+1; computeLight(v.x0,v.y0,w,h);
  if(!lightCv||lightCv.width!==w||lightCv.height!==h){ lightCv=mkCanvas(w,h); lightCtx=lightCv.getContext('2d'); }
  const id=lightCtx.createImageData(w,h); const D=id.data; const bm=G.bloodmoon;
  for(let i=0;i<w*h;i++){ const l=Math.min(1,LG[i]); const a=Math.round((1-l)*(1-l*0.15)*255*0.97); D[i*4]=bm?40:0; D[i*4+1]=0; D[i*4+2]=bm?0:10; D[i*4+3]=a; }
  lightCtx.putImageData(id,0,0);
  ctx.save(); ctx.imageSmoothingEnabled=true; ctx.drawImage(lightCv,v.x0*T+v.ox-T/2,v.y0*T+v.oy-T/2,w*T,h*T); ctx.restore(); ctx.imageSmoothingEnabled=false;
}
function lightAt(px,py){ return 1; }
