// Lifetime – Grafik: prozedurale Pixel-Texturen, Icons, Figuren
'use strict';
const GFX = {tiles:[], walls:{}, icons:{}, iconURL:{}};
function rngSeed(s){ return function(){ s|=0; s=s+0x6D2B79F5|0; let t=Math.imul(s^s>>>15,1|s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function hexA(h,a){ const c=parseInt(h.slice(1).length===3?h.slice(1).split('').map(x=>x+x).join(''):h.slice(1),16); return `rgba(${c>>16&255},${c>>8&255},${c&255},${a})`; }
function shade(h,f){ let s=h.slice(1); if(s.length===3) s=s.split('').map(x=>x+x).join(''); const c=parseInt(s,16); const r=Math.max(0,Math.min(255,(c>>16&255)*f|0)),g=Math.max(0,Math.min(255,(c>>8&255)*f|0)),b=Math.max(0,Math.min(255,(c&255)*f|0)); return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1); }
function mkCanvas(w,h){ const c=document.createElement('canvas'); c.width=w; c.height=h; return c; }
function noiseFill(g,base,amt,r,w,h){ for(let y=0;y<h;y++)for(let x=0;x<w;x++){ g.fillStyle=shade(base,1+(r()-0.5)*amt); g.fillRect(x,y,1,1);} }
function px(g,c,x,y,w,h){ g.fillStyle=c; g.fillRect(x,y,w||1,h||1); }

function buildTileTex(){
  const VAR=4;
  for(let id=0;id<TILES.length;id++){
    const t=TILES[id]; if(!t) continue; GFX.tiles[id]=[];
    for(let v=0;v<VAR;v++){
      const c=mkCanvas(T,T), g=c.getContext('2d'), r=rngSeed(id*97+v*13+5);
      drawTile(id,g,r,t,v); GFX.tiles[id].push(c);
    }
  }
  for(const k in WALLS){ const c=mkCanvas(T,T), g=c.getContext('2d'), r=rngSeed(k*31+7); const b=WALLS[k].c;
    noiseFill(g,b,0.25,r,T,T);
    if(k==2){ for(let y=0;y<T;y+=4) px(g,shade(b,0.7),0,y,T,1); }
    if(k==3){ for(let y=0;y<T;y+=4){ px(g,shade(b,0.6),0,y,T,1); const o=(y/4)%2?0:8; px(g,shade(b,0.6),o,y,1,4); px(g,shade(b,0.6),o+8>=T?o-8:o+8,y,1,4);} }
    if(k==4){ px(g,shade(b,0.8),0,0,T,1); px(g,shade(b,0.8),0,0,1,T); }
    if(k==6){ for(let x=0;x<T;x+=4) px(g,shade(b,1.15),x,0,1,T); }
    if(k==7){ for(let x=0;x<T;x+=3) px(g,shade(b,0.85),x,0,1,T); }
    GFX.walls[k]=c; }
}
function drawTile(id,g,r,t,v){
  const b=t.c;
  switch(id){
  case 1: case 46: noiseFill(g,b,0.3,r,T,T); for(let i=0;i<3;i++) px(g,shade(b,0.7),r()*14|0,r()*14|0,2,1); break;
  case 2: noiseFill(g,'#7a4b2a',0.3,r,T,T); for(let x=0;x<T;x++){ const d=3+(r()*3|0); px(g,shade('#4e9a3a',0.9+r()*0.3),x,0,1,d);} break;
  case 3: case 9: noiseFill(g,b,0.25,r,T,T); for(let i=0;i<4;i++){ px(g,shade(b,0.75),r()*14|0,r()*14|0,3,1);} if(id==9){ px(g,shade(b,0.6),0,7,T,1); px(g,shade(b,0.6),7,0,1,7); px(g,shade(b,0.6),3,8,1,8);} break;
  case 4: noiseFill(g,b,0.15,r,T,T); break;
  case 5: g.fillStyle=hexA('#2c6fb5',0.75); g.fillRect(0,0,T,T); px(g,hexA('#9fd3ff',0.5),(v*4)%T,2,5,1); break;
  case 6: px(g,shade(b,0.8),3,0,10,T); for(let y=0;y<T;y++){ px(g,shade(b,0.9+r()*0.3),4+(r()*8|0),y,1,1);} px(g,shade(b,0.6),3,0,1,T); px(g,shade(b,0.6),12,0,1,T); break;
  case 7: for(let i=0;i<70;i++){ px(g,shade(b,0.7+r()*0.6),r()*T|0,r()*T|0,2,2);} break;
  case 8: case 32: noiseFill(g,b,0.15,r,T,id==32?5:T); for(let y=0;y<(id==32?5:T);y+=4) px(g,shade(b,0.7),0,y+3,T,1); px(g,shade(b,0.6),(v*5)%T,0,1,id==32?5:T); if(id==32){px(g,shade(b,0.6),2,5,2,4);px(g,shade(b,0.6),12,5,2,4);} break;
  case 10: noiseFill(g,b,0.12,r,T,T); for(let y=0;y<T;y+=4){ px(g,'#c8b8a0',0,y,T,1); const o=(y/4)%2?3:11; px(g,'#c8b8a0',o,y,1,4);} break;
  case 11: noiseFill(g,b,0.08,r,T,T); px(g,shade(b,0.8),0,0,T,1); px(g,shade(b,0.85),0,0,1,T); if(v==1) px(g,shade(b,0.7),5,6,4,1); break;
  case 12: g.fillStyle=hexA('#bfe6f2',0.45); g.fillRect(0,0,T,T); px(g,'#e8f8ff',2,2,1,5); px(g,'#e8f8ff',3,2,4,1); px(g,'#7a8a90',0,0,T,1); px(g,'#7a8a90',0,0,1,T); break;
  case 13: noiseFill(g,b,0.08,r,T,T); px(g,shade(b,1.3),0,0,T,1); px(g,shade(b,0.6),0,T-1,T,1); px(g,'#9aa',2,2,1,1);px(g,'#9aa',13,2,1,1);px(g,'#9aa',2,13,1,1);px(g,'#9aa',13,13,1,1); break;
  case 14: case 15: case 16: case 40: noiseFill(g,'#7d7d85',0.25,r,T,T); for(let i=0;i<5;i++){ const x=r()*12|0,y=r()*12|0; px(g,b,x,y,3,2); px(g,shade(b,1.3),x,y,1,1);} break;
  case 17: noiseFill(g,b,0.4,r,T,T); break;
  case 18: px(g,b,3,0,2,T); px(g,b,11,0,2,T); for(let y=2;y<T;y+=5) px(g,shade(b,1.1),3,y,10,2); break;
  case 19: noiseFill(g,b,0.1,r,T,T); px(g,shade(b,0.7),0,0,T,1); px(g,'#d4af37',11,8,2,2); px(g,shade(b,0.8),2,2,12,1); break;
  case 20: px(g,b,0,0,3,T); px(g,shade(b,0.7),2,0,1,T); break;
  case 21: px(g,'#6b4428',7,6,2,10); px(g,'#ffcc33',6,2,4,4); px(g,'#fff2a0',7,3,2,2); break;
  case 22: px(g,'#555',1,13,14,3); px(g,'#6b4428',2,11,12,2); px(g,'#e25822',4,5+(v%2),8,6); px(g,'#ffb300',6,4,4,6); px(g,'#fff59d',7,7,2,3); break;
  case 23: px(g,'#8b5a2b',0,5,T,4); px(g,'#5c3a1b',1,9,2,7); px(g,'#5c3a1b',13,9,2,7); px(g,'#aaa',3,3,4,2); px(g,'#6b4428',9,2,1,3); break;
  case 24: px(g,'#555',1,3,14,13); px(g,'#333',3,7,10,6); px(g,'#ff6a00',4,9,8,3); px(g,'#ffcc00',6,10,4,1); px(g,'#444',6,0,4,3); break;
  case 25: px(g,'#6b4a2a',0,8,T,3); px(g,'#4a3a2a',1,11,2,5); px(g,'#4a3a2a',13,11,2,5); px(g,'#9fd',3,3,3,5); px(g,'#6c6',9,2,4,6); px(g,'#eee',4,2,1,1); break;
  case 26: px(g,'#9b6b35',1,4,14,12); px(g,'#5c3a1b',1,4,14,1); px(g,'#5c3a1b',1,9,14,1); px(g,'#d4af37',7,8,2,3); break;
  case 27: for(let x=1;x<T;x+=4){ px(g,'#8b5a2b',x,8,2,8); px(g,'#c8a070',x,5,2,3); px(g,'#eee',x,4,2,1);} break;
  case 28: px(g,'#6b4428',0,8,T,2); px(g,'#6b4428',0,4,2,12); px(g,'#6b4428',14,8,2,8); px(g,'#b33',2,6,12,3); px(g,'#eee',2,5,4,2); break;
  case 29: px(g,'#a5793f',1,6,14,10); px(g,'#7a5530',1,6,14,2); px(g,'#7a5530',1,11,14,1); px(g,'#333',7,9,2,2); break;
  case 30: noiseFill(g,b,0.12,r,T,T); px(g,'#888',0,5,T,1); px(g,'#d33',0,8,T,2); if(v==2){px(g,'#9cd',3,2,4,3);px(g,'#9cd',9,2,4,3);} break;
  case 31: for(let i=0;i<50;i++) px(g,shade(b,0.7+r()*0.6),2+r()*12|0,4+r()*12|0,2,2); for(let i=0;i<5;i++) px(g,'#c2185b',3+r()*10|0,6+r()*9|0,2,2); break;
  case 33: noiseFill(g,b,0.12,r,T,T); if(v==0) px(g,'#ddd',4,0,8,2); break;
  case 34: noiseFill(g,b,0.4,r,T,T); break;
  case 35: for(let x=1;x<T;x+=2){ const hh=5+(r()*9|0); px(g,shade(b,0.8+r()*0.4),x,T-hh,1,hh);} break;
  case 36: px(g,'#888',4,12,5,4); px(g,'#aaa',5,12,3,1); px(g,'#777',9,13,4,3); break;
  case 37: px(g,'#3d6a9a',2,3,12,13); px(g,'#2a4a6a',2,6,12,1); px(g,'#2a4a6a',2,12,12,1); px(g,'#8cf',3,3,10,1); break;
  case 38: px(g,'#4a4f55',1,1,14,15); px(g,'#6a7075',2,2,12,12); px(g,'#333',9,6,3,4); px(g,'#d4af37',4,7,2,2); break;
  case 39: for(let i=0;i<9;i++){ px(g,'#e8e0c8',2+r()*11|0,8+r()*7|0,3,1);} px(g,'#e8e0c8',6,6,4,4); px(g,'#222',7,7,1,1); px(g,'#222',9,7,1,1); break;
  case 41: for(let x=0;x<T;x+=3){ px(g,'#999',x,10+(x%2),2,1); px(g,'#bbb',x+1,9,1,3);} px(g,'#666',0,11,T,1); break;
  case 42: px(g,'#6d7a80',2,0,12,T); px(g,'#4d5a60',2,5,12,1); px(g,'#4d5a60',2,10,12,1); px(g,'#ccc',7,2,2,1); px(g,'#ccc',7,7,2,1); px(g,'#ccc',7,12,2,1); break;
  case 43: px(g,'#e5e5e5',2,0,12,T); px(g,'#bbb',2,6,12,1); px(g,'#999',12,2,1,3); px(g,'#999',12,8,1,4); break;
  case 44: px(g,'#6b4a2a',1,5,14,11); px(g,'#3a2a1a',1,5,14,2); px(g,'#d33',5,9,6,3); break;
  case 45: px(g,'#6b4428',7,4,2,12); px(g,'#e8e0c8',5,1,6,5); px(g,'#222',6,2,1,2); px(g,'#222',9,2,1,2); px(g,'#c22',4,8,8,1); px(g,'#e8e0c8',4,9,8,1); break;
  case 47: noiseFill(g,b,0.05,r,T,T); break;
  case 48: px(g,'#6b4a2a',2,6,12,10); px(g,'#8a6',3,4,10,3); px(g,'#e8e0c8',5,8,6,2); break;
  default: noiseFill(g,b,0.2,r,T,T);
  }
}
// Item-Icons 16x16
function drawIcon(id){
  const it=ITEMS[id]; const c=mkCanvas(16,16), g=c.getContext('2d'); const col=it.col||'#ccc';
  if(it.type==='block' && it.tile!=null){ g.drawImage(GFX.tiles[it.tile][0],0,0); if(id==='holz'){ g.clearRect(0,0,16,16); px(g,'#6b4428',1,4,14,8); px(g,'#c8a070',12,4,3,8); px(g,'#8b5a2b',13,6,1,4); px(g,'#5c3a1b',1,6,11,1);} }
  else if(it.type==='wall'){ g.drawImage(GFX.walls[it.wall],0,0); px(g,'#000',0,0,16,1); }
  else switch(it.ic){
   case 'fist': px(g,col,4,5,8,8); px(g,shade(col,0.8),4,7,8,1); px(g,shade(col,0.8),4,10,8,1); break;
   case 'axe': px(g,'#8b5a2b',7,3,2,12); px(g,col,3,2,6,5); px(g,shade(col,1.3),3,2,1,5); break;
   case 'pick': px(g,'#8b5a2b',7,4,2,11); px(g,col,2,2,12,2); px(g,col,1,4,2,2); px(g,col,13,4,2,2); break;
   case 'chainsaw': px(g,col,1,6,7,6); px(g,'#aaa',8,7,7,3); px(g,'#333',8,10,7,1); px(g,'#222',2,4,4,2); break;
   case 'sword': px(g,col,7,1,2,10); px(g,shade(col,1.2),7,1,1,10); px(g,'#8b5a2b',4,11,8,2); px(g,'#5c3a1b',7,13,2,3); break;
   case 'club': px(g,'#8b5a2b',7,8,2,7); px(g,col,5,1,5,8); if(col!=='#8b5a2b'){px(g,'#ccc',4,3,1,1);px(g,'#ccc',10,5,1,1);} break;
   case 'spear': for(let i=0;i<12;i++) px(g,'#8b5a2b',2+i,14-i,2,1); px(g,col,12,1,3,4); break;
   case 'bow': for(let i=0;i<12;i++){ const x=4+Math.round(Math.sin(i/11*Math.PI)*5); px(g,col,x,2+i,2,1);} px(g,'#eee',4,2,1,12); break;
   case 'gun': px(g,col,2,4,12,3); px(g,col,3,7,4,6); px(g,'#222',13,4,1,1); break;
   case 'shotgun': px(g,'#555',1,5,14,2); px(g,col,1,7,6,3); px(g,col,1,9,3,4); break;
   case 'arrow': for(let i=0;i<10;i++) px(g,'#8b5a2b',3+i,12-i,1,1); px(g,col,12,2,2,2); px(g,'#eee',2,12,2,2); break;
   case 'ammo': for(let i=0;i<3;i++){ px(g,col,3+i*4,6,3,8); px(g,'#d4af37',3+i*4,4,3,3);} break;
   case 'can': px(g,col,4,3,8,11); px(g,shade(col,0.7),4,3,8,1); px(g,'#e33',4,7,8,3); break;
   case 'bag': px(g,col,3,2,10,12); px(g,'#e33',5,6,6,4); break;
   case 'bowl': px(g,'#8b5a2b',2,8,12,5); px(g,col,3,6,10,3); break;
   case 'bottle': px(g,col,5,6,6,9); px(g,shade(col,1.2),6,7,1,6); px(g,'#ccc',6,2,4,4); break;
   case 'meat': px(g,col,3,4,9,8); px(g,shade(col,1.2),4,5,4,3); px(g,'#eee',11,10,3,2); break;
   case 'berry': px(g,col,4,6,4,4); px(g,col,8,8,4,4); px(g,col,6,10,4,4); px(g,'#3a3',7,3,2,3); break;
   case 'cookie': px(g,col,3,4,10,8); px(g,shade(col,0.6),5,6,2,2); px(g,shade(col,0.6),9,8,2,2); break;
   case 'bandage': px(g,col,2,6,12,5); px(g,'#e33',7,6,2,5); break;
   case 'medkit': px(g,col,2,4,12,10); px(g,'#fff',7,6,2,6); px(g,'#fff',5,8,6,2); px(g,'#333',6,2,4,2); break;
   case 'heart': px(g,col,3,4,4,4); px(g,col,9,4,4,4); px(g,col,4,7,8,4); px(g,col,6,11,4,2); px(g,shade(col,1.4),4,5,2,1); break;
   case 'fiber': for(let i=0;i<5;i++) px(g,col,3+i*2,3,1,11); px(g,shade(col,0.7),2,8,12,1); break;
   case 'cloth': px(g,col,2,4,12,9); px(g,shade(col,0.8),2,7,12,1); px(g,shade(col,0.8),6,4,1,9); break;
   case 'scrap': px(g,col,2,8,6,4); px(g,shade(col,0.7),7,5,6,6); px(g,'#a63',4,9,2,1); px(g,'#bbb',9,6,3,1); break;
   case 'ore': px(g,'#777',2,4,12,9); px(g,col,4,6,3,3); px(g,col,9,8,3,3); break;
   case 'bar': px(g,col,2,6,12,6); px(g,shade(col,1.3),3,6,10,1); px(g,shade(col,0.7),2,11,12,1); break;
   case 'powder': px(g,'#c8a070',3,5,10,9); px(g,col,5,3,6,3); break;
   case 'feather': for(let i=0;i<10;i++) px(g,col,4+i,13-i,2,2); px(g,'#888',4,13,1,2); break;
   case 'bone': px(g,col,4,7,8,2); px(g,col,2,5,3,3); px(g,col,2,8,3,3); px(g,col,11,5,3,3); px(g,col,11,8,3,3); break;
   case 'coin': px(g,col,4,4,8,8); px(g,shade(col,0.7),5,5,6,6); px(g,col,6,6,4,4); break;
   case 'jacket': px(g,col,3,3,10,11); px(g,col,1,4,2,8); px(g,col,13,4,2,8); px(g,shade(col,0.7),7,3,2,11); break;
   case 'vest': px(g,col,3,3,10,11); px(g,'#eee',5,7,6,2); break;
   case 'helmet': px(g,col,3,4,10,6); px(g,col,2,9,12,2); px(g,shade(col,1.3),5,5,3,1); break;
   case 'wing': for(let i=0;i<6;i++){ px(g,col,2+i,3+i,2,8-i); px(g,col,12-i,3+i,2,8-i);} break;
   case 'offering': px(g,'#8b5a2b',2,11,12,3); px(g,col,4,5,8,6); px(g,'#7a2a5a',6,6,4,3); break;
   case 'whistle': px(g,col,2,6,10,4); px(g,'#333',12,7,3,2); px(g,'#eee',5,5,2,1); break;
   case 'book': px(g,shade(col,0.6),2,2,12,13); px(g,col,3,2,10,12); px(g,'#f5ecd0',4,4,8,4); px(g,'#333',5,5,6,1); px(g,'#333',5,7,4,1); px(g,shade(col,1.3),3,13,10,1); px(g,'#e8e0c8',12,3,1,11); break;
   case 'shroom': px(g,'#d8e4f4',7,8,3,7); px(g,col,3,4,11,5); px(g,shade(col,1.4),5,4,4,1); px(g,'#fff',6,6,1,1); px(g,'#fff',10,5,1,1); break;
   case 'radio': px(g,col,3,5,10,10); px(g,'#888',11,1,1,5); px(g,'#7c7',5,7,6,3); break;
   default: px(g,col,3,3,10,10);
  }
  GFX.icons[id]=c; GFX.iconURL[id]=c.toDataURL();
}
function buildIcons(){ for(const id in ITEMS) drawIcon(id); }

// ===== Figuren zeichnen (direkt in den Spiel-Canvas, Pixel-Look durch kleine Auflösung) =====
// e: Entity mit x,y(Fuß-Mitte unten), dir, anim, def(MOBS/NPCs), hurt
function drawHumanoid(g,x,y,o){
  // o: skin, shirt, pants, hair, cap, helmet, dir, walk(0..1 phase), zombie, h(Höhe), w, attack, nurse, paint, armsFwd, fat
  const H=o.h||26, W=o.w||10; const d=o.dir||1; const ph=o.walk||0;
  const top=Math.round(y-H), cx=Math.round(x);
  const leg=Math.round(Math.sin(ph)*3);
  const bw=o.fat?W:Math.max(8,W-2);
  // Beine
  const legH=Math.round(H*0.38), bodyH=Math.round(H*0.36), headH=H-legH-bodyH;
  const pants=o.pants||'#333';
  px(g,pants,cx-3+leg*(d>0?1:-1)*0.5|0,y-legH,3,legH); px(g,shade(pants,0.8),cx+0-leg*(d>0?1:-1)*0.5|0,y-legH,3,legH);
  px(g,'#2a2018',cx-3+leg*(d>0?1:-1)*0.5|0,y-2,3,2); px(g,'#2a2018',cx-leg*(d>0?1:-1)*0.5|0,y-2,3,2);
  // Körper
  const by=y-legH-bodyH;
  px(g,o.shirt||o.skin,cx-bw/2|0,by,bw,bodyH);
  if(o.nurse){ px(g,'#d22',cx-1,by+3,2,4); px(g,'#d22',cx-2,by+4,4,2);} 
  if(o.paint){ px(g,o.paint,cx-3,by+2,6,1); px(g,o.paint,cx-2,by+5,4,1);} 
  if(o.vest){ px(g,'#eee',cx-3,by+4,6,2); }
  if(o.belt) px(g,'#222',cx-bw/2|0,by+bodyH-2,bw,1);
  // Arme
  const armCol=o.shirt&&!o.sleeveless?shade(o.shirt,0.85):o.skin;
  if(o.armsFwd){ px(g,armCol,cx+(d>0?1:-7),by+2,6,3); px(g,o.skin,cx+(d>0?7:-9),by+2,2,3); }
  else { const sw=o.attack?-4:Math.round(Math.sin(ph+Math.PI)*2); px(g,armCol,cx+(d>0?-1:-2)+sw*d*0.5|0,by+1,3,bodyH-2); px(g,o.skin,cx+(d>0?-1:-2)+sw*d*0.5|0,by+bodyH-2,3,2); }
  // Kopf
  const hy=by-headH; const hw=Math.max(6,Math.min(8,W-2));
  px(g,o.skin,cx-hw/2|0,hy,hw,headH);
  px(g,o.zombie?'#c22':'#111',cx+(d>0?1:-3),hy+3,2,1+(o.zombie?0:1));
  if(o.zombie) px(g,'#311',cx+(d>0?0:-3),hy+headH-2,3,1);
  if(o.hair) px(g,o.hair,cx-hw/2|0,hy,hw,2), o.mohawk?px(g,o.hair,cx-1,hy-3,2,3):(o.longhair?px(g,o.hair,cx-(d>0?hw/2:-hw/2+2)|0,hy,2,headH+4):0);
  if(o.cap){ px(g,o.cap,cx-hw/2|0,hy-1,hw,3); px(g,o.cap,cx+(d>0?hw/2:-hw/2-3)|0,hy+1,3,1); }
  if(o.helmet){ px(g,o.helmet,cx-hw/2-1|0,hy-2,hw+2,3); px(g,shade(o.helmet,1.3),cx-2,hy-2,3,1); }
  if(o.nurse){ px(g,'#fff',cx-3,hy-2,6,2); px(g,'#d22',cx,hy-2,1,1); }
  if(o.blood){ px(g,'#8a0000',cx-2,by+2,2,3); px(g,'#8a0000',cx+1,hy+headH-1,2,2); }
  if(o.held){ drawHeld(g,cx,by,d,o.held,o.attack); }
}
function drawHeld(g,cx,by,d,id,att){
  const ic=GFX.icons[id]; if(!ic||id==='hand') return;
  g.save(); g.translate(cx+(d>0?4:-4),by+6); g.scale(d,1); g.rotate(att?0.9:-0.6); g.drawImage(ic,-2,-12,12,12); g.restore();
}
