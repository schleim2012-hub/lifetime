// Lifetime – Pixel-Sprites: eigene Chibi-Figuren mit Umriss und 4 Schattierungsstufen
'use strict';
const SPR={cache:new Map(),rgb:new Map()};
function toRGB(h){ let v=SPR.rgb.get(h); if(v) return v; let s=h.slice(1); if(s.length===3) s=s.split('').map(x=>x+x).join(''); const c=parseInt(s,16); v=[c>>16&255,c>>8&255,c&255]; SPR.rgb.set(h,v); return v; }
function tones(b){ return {hi:shade(b,1.25),b,md:shade(b,0.8),dk:shade(b,0.62)}; }
// ---- Raster ----
function Ras(w,h){ this.w=w; this.h=h; this.c=new Array(w*h).fill(null); }
Ras.prototype.set=function(x,y,col){ x=Math.round(x); y=Math.round(y); if(!col||x<0||y<0||x>=this.w||y>=this.h) return; this.c[y*this.w+x]=col; };
Ras.prototype.get=function(x,y){ if(x<0||y<0||x>=this.w||y>=this.h) return null; return this.c[y*this.w+x]; };
Ras.prototype.clr=function(x,y){ if(x<0||y<0||x>=this.w||y>=this.h) return; this.c[y*this.w+x]=null; };
Ras.prototype.rect=function(x,y,w,h,col){ for(let j=0;j<h;j++)for(let i=0;i<w;i++) this.set(x+i,y+j,col); };
// schattiertes Rechteck: Licht von vorne oben (rechts oben)
Ras.prototype.srect=function(x,y,w,h,base,o){ const t=tones(base); o=o||{}; for(let j=0;j<h;j++)for(let i=0;i<w;i++){ let c=t.b; if(i===0) c=t.md; if(i===w-1&&w>2) c=t.hi; if(j===h-1&&!o.noBottom) c=t.dk; if(j===0&&o.topHi) c=t.hi; if(w>4&&i===1&&j>0) c=c===t.b?t.md:c; this.set(x+i,y+j,c);} };
Ras.prototype.ell=function(cx,cy,rx,ry,base,o){ const t=tones(base); o=o||{}; for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++){ const dx=(x-cx)/rx, dy=(y-cy)/ry; const d=dx*dx+dy*dy; if(d>1) continue; let c=t.b; const l=dx*0.5-dy*0.8; if(l>0.55) c=t.hi; else if(dy>0.45||l<-0.55) c=t.md; if(d>0.8&&dy>0.2) c=t.dk; if(o.flat) c=t.b; this.set(x,y,c);} };
// Gliedmaße: Winkel 0 = nach unten, positiv = nach vorne
Ras.prototype.limb=function(x0,y0,a,len,th,base,end,endLen,edge){ const t=tones(base), te=end?tones(end):null; if(edge){ t.hi=shade(base,0.55); } const sx=Math.sin(a), sy=Math.cos(a); const px=-sy, py=sx; // senkrecht
  for(let s=0;s<=len;s+=0.5){ const isEnd=te&&s>len-(endLen||3); const tt=isEnd?te:t; for(let k=0;k<th;k++){ const off=k-(th-1)/2; const c=k===0?tt.hi:(k===th-1?tt.dk:tt.b); this.set(x0+sx*s+px*off,y0+sy*s+py*off,c); } }
  return {x:x0+sx*len,y:y0+sy*len}; };
Ras.prototype.mask=function(x,y,rows,map){ for(let j=0;j<rows.length;j++)for(let i=0;i<rows[j].length;i++){ const ch=rows[j][i]; if(ch==='.'||ch===' ') continue; const c=map[ch]; if(c==='CLR') this.clr(x+i,y+j); else this.set(x+i,y+j,c);} };
Ras.prototype.toCanvas=function(outline,olCol){ const w=this.w,h=this.h; const cv=mkCanvas(w,h), g=cv.getContext('2d'); const id=g.createImageData(w,h), D=id.data; const out=this.c.slice();
  if(outline!==false){ for(let y=0;y<h;y++)for(let x=0;x<w;x++){ if(this.c[y*w+x]) continue; let n=null; for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const v=this.get(x+a,y+b); if(v){ n=v; break; } } if(n) out[y*w+x]=olCol||shade(n,0.3); } }
  for(let i=0;i<w*h;i++){ const c=out[i]; if(!c) continue; const r=toRGB(c); D[i*4]=r[0]; D[i*4+1]=r[1]; D[i*4+2]=r[2]; D[i*4+3]=255; }
  g.putImageData(id,0,0); return cv; };
// ---- Aussehen (Looks) ----
const SW=40, SH=60, FX=20, FY=57; // Canvas, Fußpunkt
const LOOKS={
 player:{skin:'#eab58e',hair:'#6b3b1c',hairStyle:'messy',shirt:'#c86a2c',shirtStyle:'jacket',shirt2:'#e8dcc0',pants:'#3a4a70',shoes:'#4a2e1a',belt:true,backpack:'#6b5a30'},
 // NPCs (Hommagen mit eigenen Namen)
 kalle:{skin:'#e3a87c',hair:'#3a2616',hairStyle:'short',hat:'cap',hatCol:'#c62828',shirt:'#5d7fae',shirtStyle:'overalls',shirt2:'#2f4d7a',pants:'#2f4d7a',shoes:'#3a2a1a',beard:'#3a2616',tool:'schraube'},
 gerda:{skin:'#f0c8a8',hair:'#d8d8d8',hairStyle:'bun',hat:'feather',hatCol:'#556b2f',feather:'#c62828',shirt:'#6b7a3a',shirtStyle:'vest',shirt2:'#8a6a3a',pants:'#4a3a2a',shoes:'#2a1a10',belt:true},
 brems:{skin:'#f2d0b0',hair:'#6d5640',hairStyle:'short',glasses:true,shirt:'#f4f4f4',shirtStyle:'labcoat',shirt2:'#7aa9d6',pants:'#555b66',shoes:'#222',mirror:true},
 mecki:{skin:'#dba070',hair:'#36c13a',hairStyle:'mohawk',shirt:'#222226',shirtStyle:'vest',shirt2:'#8a2a2a',pants:'#28407a',shoes:'#111',studs:true,belt:true},
 uschi:{skin:'#f5d2b4',hair:'#d2642a',hairStyle:'curly',shirt:'#c93a9a',shirtStyle:'apron',shirt2:'#f0e6d0',pants:'#333',shoes:'#5a2a2a'},
 willi:{skin:'#deb08a',hair:'#4a3628',hairStyle:'short',beard:'#4a3628',hat:'beanie',hatCol:'#7a5a3a',shirt:'#6a7f5a',shirtStyle:'jacket',shirt2:'#c8b890',pants:'#3a3f4a',shoes:'#3a2a1a',backpack:'#8a6a3a'},
 funker:{skin:'#e8c098',hair:'#2a2a2a',hairStyle:'short',hat:'army',hatCol:'#4f5f3a',headset:true,shirt:'#5a6a42',shirtStyle:'uniform',pants:'#4a5536',shoes:'#222',backpack:'#3a4a2a',belt:true},
 rudi:{skin:'#e6b48c',hair:'#4a3020',hairStyle:'short',hat:'sheriff',hatCol:'#8a6a3a',beard:'#5a3a20',shirt:'#c8a878',shirtStyle:'uniform2',pants:'#4a3a2a',shoes:'#3a2010',belt:true,badge:true},
 doris:{skin:'#e8b890',hair:'#2e2018',hairStyle:'pony',shirt:'#4a4a4a',shirtStyle:'vest',shirt2:'#2a2a2a',pants:'#3a3a52',shoes:'#1a1a1a',belt:true,wings:true},
 // Zombies
 schlurfer:{zombie:true,skin:'#8fa67a',hair:'#3a3020',hairStyle:'short',shirt:'#5a7090',shirtStyle:'tee',pants:'#3d3d55',shoes:'#2a2a2a',blood:true},
 schwester:{zombie:true,skin:'#a3b090',hair:'#5a4030',hairStyle:'bun',hat:'nursecap',mask:'surgical',shirt:'#e8e8e8',shirtStyle:'dress',pants:'#e0e0e0',shoes:'#ddd',blood:true},
 brandmeister:{zombie:true,skin:'#8a9f76',hair:'#2a2a2a',hairStyle:'short',hat:'helmet',hatCol:'#c62828',shirt:'#c8a020',shirtStyle:'coat',shirt2:'#e0e0e0',pants:'#8a7018',shoes:'#222',blood:true,stripes:true},
 fettsack:{zombie:true,fat:true,skin:'#9aaa7a',hair:null,hairStyle:'bald',shirt:'#e8e0d0',shirtStyle:'tank',pants:'#3a4a7a',shoes:'#333',blood:true},
 bulle:{zombie:true,skin:'#8aa47c',hair:'#2a2a2a',hairStyle:'short',hat:'cap',hatCol:'#1a2550',shirt:'#2b3f7a',shirtStyle:'uniform2',pants:'#1a2550',shoes:'#111',blood:true,badge:true,belt:true},
 kreischerin:{zombie:true,skin:'#c3cbb8',hair:'#e6e6e6',hairStyle:'long',shirt:'#f0f0f0',shirtStyle:'dress',pants:'#ddd',shoes:'#ccc',blood:true,glow:'#ff3030'},
 bauarbeiter:{zombie:true,skin:'#94a67c',hair:'#4a3020',hairStyle:'short',hat:'hardhat',hatCol:'#f2c40c',shirt:'#ff7a00',shirtStyle:'hivis',pants:'#3a4a6a',shoes:'#5a3a1a',blood:true},
 soldat:{zombie:true,skin:'#8a9a78',hair:'#222',hairStyle:'short',hat:'army',hatCol:'#4f5a36',mask:'gas',shirt:'#55603d',shirtStyle:'uniform',pants:'#4a5534',shoes:'#1a1a1a',belt:true,backpack:'#3d4628',blood:true},
 clown:{zombie:true,skin:'#e8e8e0',hair:'#e53935',hairStyle:'clown',mask:'clown',shirt:'#7b1fa2',shirtStyle:'clown',shirt2:'#ffeb3b',pants:'#1e88e5',shoes:'#e53935',bigshoes:true,blood:true},
 springer:{zombie:true,skin:'#8fa07a',hair:'#222',hairStyle:'bald',hat:'hood',hatCol:'#3d4a5c',shirt:'#3d4a5c',shirtStyle:'hoodie',pants:'#2a2a33',shoes:'#ddd',blood:true},
 // Menschen
 hinterwaeldler:{skin:'#dba070',hair:'#5a3a1a',hairStyle:'short',beard:'#5a3a1a',hat:'cap',hatCol:'#556b2f',shirt:'#9a3a2a',shirtStyle:'flannel',shirt2:'#5a1a10',pants:'#3a4a6a',shoes:'#3a2a1a',belt:true},
 schlaeger:{skin:'#c98a56',hair:'#2a1a0a',hairStyle:'bald',beard:'#2a1a0a',hat:'bandana',hatCol:'#b71c1c',shirt:'#556b2f',shirtStyle:'tank',pants:'#3a3a3a',shoes:'#222',belt:true},
 saegesepp:{skin:'#c98a56',hair:null,hairStyle:'bald',mask:'sack',shirt:'#8a7a6a',shirtStyle:'overalls',shirt2:'#3a5a7a',pants:'#3a5a7a',shoes:'#2a1a0a',blood:true,apronBlood:true},
 kannibale:{skin:'#c08050',hair:'#1e120a',hairStyle:'messy',shirt:null,shirtStyle:'bare',pants:'#6b4a2a',shoes:null,paint:'#d32f2f',bone:true},
};
// ---- Köpfe, Haare, Hüte ----
function drawHead(r,L,bob,ox){ ox=ox||0; const sk=tones(L.skin); const hx=10+ox, hy=13+bob; // Kopf 15x14
  for(let y=0;y<14;y++)for(let x=0;x<15;x++){ if((y===0||y===13)&&(x<2||x>12)) continue; if((y===1||y===12)&&(x===0||x===14)) continue; let c=sk.b; if(x<2) c=sk.md; if(y>=11) c=sk.md; if(y===13) c=sk.dk; if(x>=11&&y<5) c=sk.hi; r.set(hx+x,hy+y,c); }
  r.set(hx+15,hy+7,sk.b); r.set(hx+15,hy+8,sk.md); // Nase
  r.set(hx+4,hy+7,sk.md); r.set(hx+4,hy+8,sk.md); r.set(hx+5,hy+8,sk.dk); // Ohr
  // Augen
  const ey=hy+5; if(L.zombie){ r.set(hx+10,ey,'#f0e8c0'); r.set(hx+11,ey,'#f0e8c0'); r.set(hx+10,ey+1,'#f0e8c0'); r.set(hx+11,ey+1,L.glow||'#c0101a'); r.set(hx+10,ey-1,sk.dk); r.set(hx+11,ey-1,sk.dk);
      r.rect(hx+10,hy+10,4,2,'#3a0a0a'); r.set(hx+11,hy+10,'#e8e0c0'); r.set(hx+13,hy+10,'#e8e0c0'); r.set(hx+3,hy+3,sk.dk); r.set(hx+7,hy+11,sk.dk); r.set(hx+2,hy+9,'#6a1010'); }
  else { r.set(hx+10,ey,'#fff'); r.set(hx+11,ey,'#fff'); r.set(hx+10,ey+1,'#fff'); r.set(hx+11,ey+1,'#2a1a3a'); r.set(hx+11,ey,'#4a3a6a'); r.set(hx+10,ey-1,shade(L.hair||'#3a2a1a',0.7)); r.set(hx+11,ey-1,shade(L.hair||'#3a2a1a',0.7)); r.set(hx+12,ey-1,shade(L.hair||'#3a2a1a',0.7));
      r.set(hx+12,hy+10,sk.dk); r.set(hx+13,hy+10,sk.dk); if(!L.beard) r.set(hx+9,hy+8,shade(L.skin,0.92)); }
  if(L.paint){ r.set(hx+8,hy+7,L.paint); r.set(hx+9,hy+7,L.paint); r.set(hx+12,hy+8,L.paint); r.set(hx+13,hy+8,L.paint); }
  return {hx,hy}; }
function drawHair(r,L,hx,hy){ const st=L.hairStyle; if(!L.hair&&st!=='clown') return; const h=tones(L.hair||'#e53935');
  const strand=(x,y)=> (x%3===0?h.md:(y===0?h.hi:h.b));
  if(st==='short'||st==='messy'||st==='long'||st==='bun'||st==='pony'){
    for(let x=-1;x<=15;x++){ const top=(x<1||x>13)?2:(x<3||x>11?0:-1); for(let y=top;y<4;y++) r.set(hx+x,hy+y,strand(x,y-top)); }
    for(let y=4;y<9;y++)for(let x=-1;x<4;x++) if(!(y>6&&x===3)) r.set(hx+x,hy+y,x===3?h.dk:h.b); // hinten
    for(let x=6;x<15;x++){ const d=(x%2===0)?5:4; for(let y=4;y<d;y++) r.set(hx+x,hy+y,h.md); } // Pony
    if(st==='messy'){ for(const x of [1,4,7,10,13]){ r.set(hx+x,hy-2,h.b); r.set(hx+x+1,hy-2,h.hi); r.set(hx+x,hy-3,h.hi);} for(let y=9;y<11;y++){ r.set(hx-1,hy+y,h.md); r.set(hx+1,hy+y,h.dk);} }
    if(st==='long'){ for(let y=4;y<21;y++)for(let x=-2;x<4;x++){ if(y>17&&(x+y)%2) continue; r.set(hx+x,hy+y,x===-2?h.md:(x%2?h.b:h.md)); } }
    if(st==='bun'){ r.ell(hx-3,hy+2,3,3,L.hair); }
    if(st==='pony'){ for(let y=3;y<16;y++){ const xx=hx-3-Math.floor(y/6); r.set(xx,hy+y,h.b); r.set(xx+1,hy+y,h.md); r.set(xx-1,hy+y,h.hi);} r.set(hx-2,hy+3,'#c62828'); }
  } else if(st==='mohawk'){ for(let x=2;x<12;x++){ const t=-5+Math.abs(x-7)/2|0; for(let y=t;y<2;y++) r.set(hx+x,hy+y,y===t?h.hi:(x%2?h.b:h.md)); } for(let x=0;x<14;x++) r.set(hx+x,hy+1,shade(L.skin,0.75)); }
  else if(st==='curly'){ for(let k=0;k<11;k++){ const a=Math.PI*(0.9+k*0.13); r.ell(hx+7+Math.cos(a)*7.5,hy+4+Math.sin(a)*6,2.4,2.4,L.hair); } for(let y=4;y<14;y++){ r.ell(hx-1,hy+y,2,1.5,L.hair);} }
  else if(st==='clown'){ r.ell(hx-1,hy+5,4,4,'#e53935'); r.ell(hx+3,hy+1,3.5,3,'#e53935'); for(let x=5;x<14;x++) r.set(hx+x,hy,shade(L.skin,0.9)); }
}
function drawHat(r,L,hx,hy){ const t=L.hat; if(!t) return; const c=tones(L.hatCol||'#555');
  if(t==='cap'){ for(let x=0;x<14;x++)for(let y=-2;y<3;y++){ if(y===-2&&(x<3||x>10)) continue; r.set(hx+x,hy+y,y===-2?c.hi:(x<2?c.md:c.b)); } for(let x=12;x<19;x++){ r.set(hx+x,hy+2,c.md); r.set(hx+x,hy+3,c.dk);} r.set(hx+7,hy-2,c.dk); }
  if(t==='feather'){ for(let x=-3;x<18;x++){ r.set(hx+x,hy+1,c.b); r.set(hx+x,hy+2,c.dk);} for(let x=1;x<13;x++)for(let y=-5;y<1;y++){ if(y===-5&&(x<3||x>10)) continue; r.set(hx+x,hy+y,x<3?c.md:(y===-5?c.hi:c.b)); } for(let x=1;x<13;x++) r.set(hx+x,hy,'#3a2a1a'); const f=tones(L.feather||'#c62828'); for(let k=0;k<9;k++){ r.set(hx+1-k,hy-2-k,f.b); r.set(hx+2-k,hy-2-k,f.hi); r.set(hx-k,hy-1-k,f.md);} }
  if(t==='tophat'){ for(let x=-2;x<17;x++){ r.set(hx+x,hy+1,c.b); r.set(hx+x,hy+2,c.dk);} for(let x=2;x<13;x++)for(let y=-9;y<1;y++) r.set(hx+x,hy+y,x<4?c.md:(x>10?c.hi:c.b)); for(let x=2;x<13;x++) r.set(hx+x,hy-1,'#8a1c1c'); }
  if(t==='helmet'){ for(let x=-1;x<16;x++)for(let y=-3;y<3;y++){ if(y===-3&&(x<3||x>11)) continue; r.set(hx+x,hy+y,y===-3?c.hi:(x<1?c.md:c.b)); } for(let x=-5;x<0;x++){ r.set(hx+x,hy+2,c.b); r.set(hx+x,hy+3,c.dk);} r.rect(hx+10,hy-2,3,4,'#e0c060'); r.set(hx+7,hy-4,c.hi); }
  if(t==='hardhat'){ for(let x=0;x<15;x++)for(let y=-3;y<2;y++){ if(y===-3&&(x<3||x>11)) continue; r.set(hx+x,hy+y,y===-3?c.hi:(x<2?c.md:c.b)); } for(let x=-1;x<17;x++) r.set(hx+x,hy+2,c.dk); for(let y=-3;y<2;y++) r.set(hx+7,hy+y,c.hi); }
  if(t==='sheriff'){ for(let x=-4;x<19;x++){ r.set(hx+x,hy+1,c.b); r.set(hx+x,hy+2,c.dk);} r.set(hx-5,hy,c.b); r.set(hx+19,hy,c.b); for(let x=2;x<13;x++)for(let y=-5;y<1;y++){ if(y===-5&&(x===7)) continue; r.set(hx+x,hy+y,x<4?c.md:(y===-5?c.hi:c.b)); } for(let x=2;x<13;x++) r.set(hx+x,hy-1,'#3a2a1a'); r.set(hx+11,hy-3,'#e0c050'); }
  if(t==='beanie'){ for(let x=0;x<15;x++)for(let y=-3;y<3;y++){ if(y===-3&&(x<3||x>11)) continue; r.set(hx+x,hy+y,(x%2&&y<2)?c.md:c.b); } for(let x=-1;x<16;x++) r.set(hx+x,hy+2,c.hi); r.ell(hx+7,hy-4,1.6,1.6,shade(L.hatCol,1.3)); }
  if(t==='nursecap'){ for(let x=2;x<12;x++)for(let y=-2;y<1;y++) r.set(hx+x,hy+y,y===-2?'#fff':'#e8e8e8'); r.set(hx+7,hy-1,'#d32f2f'); r.set(hx+6,hy-1,'#d32f2f'); r.set(hx+8,hy-1,'#d32f2f'); r.set(hx+7,hy-2,'#d32f2f'); r.set(hx+7,hy,'#d32f2f'); }
  if(t==='army'){ for(let x=-1;x<16;x++)for(let y=-3;y<3;y++){ if(y===-3&&(x<3||x>11)) continue; r.set(hx+x,hy+y,((x*7+y*3)%5===0)?c.dk:(y===-3?c.hi:c.b)); } for(let x=-2;x<17;x++) r.set(hx+x,hy+2,c.dk); }
  if(t==='bandana'){ for(let x=0;x<15;x++){ r.set(hx+x,hy+1,c.b); r.set(hx+x,hy+2,c.md);} for(let x=0;x<14;x+=3) r.set(hx+x,hy+1,'#fff'); r.set(hx-1,hy+2,c.b); r.set(hx-2,hy+3,c.b); r.set(hx-3,hy+4,c.md); r.set(hx-1,hy+4,c.md); }
  if(t==='hood'){ for(let y=-2;y<16;y++)for(let x=-2;x<15;x++){ if(y>=3&&x>5) continue; if(y===-2&&(x<2||x>10)) continue; if(y<3&&x>13) continue; r.set(hx+x,hy+y,x<0?c.md:(y<0?c.hi:c.b)); } for(let y=3;y<12;y++) r.set(hx+6,hy+y,c.dk); for(let x=6;x<15;x++) r.set(hx+x,hy+3,c.dk); }
}
function drawMask(r,L,hx,hy){ const m=L.mask; if(!m) return;
  if(m==='gas'){ r.rect(hx+7,hy+4,9,9,'#3a3d40'); r.rect(hx+7,hy+4,9,1,'#55595c'); r.rect(hx+9,hy+4,4,3,'#9ad0e0'); r.set(hx+12,hy+4,'#d8f4ff'); r.rect(hx+13,hy+9,4,4,'#6a6d70'); r.rect(hx+14,hy+10,3,2,'#2a2c2e'); for(let x=0;x<7;x++) r.set(hx+x,hy+6,'#2a2c2e'); }
  if(m==='surgical'){ r.rect(hx+8,hy+8,8,4,'#a8d8ea'); r.rect(hx+8,hy+8,8,1,'#c8eef8'); r.set(hx+9,hy+10,'#7ab8cc'); for(let x=4;x<8;x++) r.set(hx+x,hy+8,'#7ab8cc'); r.set(hx+12,hy+10,'#7a1010'); }
  if(m==='sack'){ const s=tones('#b8a070'); for(let y=-2;y<15;y++)for(let x=-1;x<16;x++){ if(y===-2&&(x<3||x>11)) continue; let c=((x+y)%4===0)?s.md:s.b; if(x<1) c=s.md; if(y===14&&x%2) continue; r.set(hx+x,hy+y,c);} r.rect(hx+9,hy+4,3,3,'#120a06'); r.set(hx+10,hy+5,'#ff3030'); for(let x=8;x<15;x+=2){ r.set(hx+x,hy+10,'#5a3a1a'); r.set(hx+x+1,hy+11,'#5a3a1a'); } for(let y=0;y<14;y+=2) r.set(hx+4,hy+y,'#6a4a2a'); r.rect(hx-1,hy+12,16,1,'#6a4a2a'); }
  if(m==='clown'){ r.rect(hx+9,hy+3,4,5,'#fafafa'); r.set(hx+10,hy+3,'#1565c0'); r.set(hx+11,hy+7,'#1565c0'); r.ell(hx+15,hy+8,1.6,1.6,'#e53935'); r.rect(hx+9,hy+10,6,1,'#c62828'); r.set(hx+8,hy+9,'#c62828'); r.set(hx+15,hy+9,'#c62828'); }
}
// ---- Körper ----
function drawTorso(r,L,bob,ox){ ox=ox||0; const st=L.shirtStyle; const x0=(L.fat?10:13)+ox, w=L.fat?14:9, y0=27+bob, h=13; const shirt=st==='bare'?L.skin:L.shirt;
  r.srect(x0,y0,w,h,shirt);
  const t=tones(shirt); r.set(x0+3,y0+4,t.md); r.set(x0+4,y0+5,t.md); r.set(x0+5,y0+9,t.md); r.set(x0+6,y0+10,t.md); // Falten
  if(L.fat){ r.ell(x0+w-1,y0+8,3,4,shirt); }
  if(st==='bare'){ r.set(x0+5,y0+4,t.md); r.set(x0+6,y0+4,t.md); r.set(x0+5,y0+7,t.md); if(L.paint){ for(let x=1;x<w-1;x+=2) r.set(x0+x,y0+3,L.paint); r.set(x0+4,y0+8,L.paint); r.set(x0+6,y0+9,L.paint);} if(L.bone){ for(let x=1;x<w;x++) r.set(x0+x,y0+1,x%2?'#eee4c8':'#8a6a4a'); } }
  if(st==='jacket'||st==='coat'||st==='labcoat'){ const s2=tones(L.shirt2||'#ddd'); for(let y=1;y<h-1;y++){ r.set(x0+w-3,y0+y,s2.b); r.set(x0+w-2,y0+y,s2.md);} r.set(x0+w-4,y0,t.hi); r.set(x0+w-3,y0+1,t.hi); r.set(x0+2,y0,t.hi); r.set(x0+3,y0+1,t.hi);
    if(st!=='jacket'){ for(let y=h;y<h+6;y++)for(let x=-1;x<w+1;x++){ if(x>=w-3&&x<w-1) continue; r.set(x0+x,y0+y,x<1?t.md:(y===h+5?t.dk:t.b)); } }
    if(st==='labcoat'){ r.rect(x0+1,y0+5,3,3,t.md); r.set(x0+2,y0+4,s2.b); }
    if(L.stripes){ for(let x=0;x<w;x++){ r.set(x0+x,y0+7,'#e0e0e0'); r.set(x0+x,y0+h+3,'#e0e0e0'); } } }
  if(st==='overalls'){ const p=tones(L.shirt2||L.pants); for(let y=4;y<h;y++)for(let x=2;x<w-1;x++) r.set(x0+x,y0+y,y===4?p.hi:(x===2?p.md:p.b)); for(let y=0;y<4;y++){ r.set(x0+2,y0+y,p.b); r.set(x0+w-2,y0+y,p.b);} r.set(x0+w-2,y0+4,'#e0c050'); r.set(x0+2,y0+4,'#e0c050'); r.rect(x0+4,y0+7,3,2,p.md);
    if(L.apronBlood){ r.set(x0+4,y0+9,'#7a0a0a'); r.set(x0+5,y0+10,'#7a0a0a'); r.set(x0+6,y0+8,'#8a1010'); } }
  if(st==='vest'||st==='hivis'){ const v=tones(st==='hivis'?L.shirt:(L.shirt2||'#333')); for(let y=0;y<h-1;y++)for(let x=0;x<w;x++){ if(x>=w-4&&x<=w-3) continue; if(st==='vest'&&x>2&&x<w-4&&y>1) continue; r.set(x0+x,y0+y,x===0?v.md:v.b);} if(st==='hivis'){ for(let x=0;x<w;x++){ r.set(x0+x,y0+5,'#e8e8e8'); r.set(x0+x,y0+9,'#e8e8e8'); } } if(L.studs){ for(let y=1;y<h-2;y+=2) r.set(x0+w-1,y0+y,'#e0e0e0'); } if(L.wings){ r.set(x0+1,y0+4,'#ddd'); r.set(x0+2,y0+3,'#ddd'); r.set(x0+3,y0+4,'#ddd'); } }
  if(st==='hoodie'){ r.rect(x0+3,y0+8,5,3,t.md); r.set(x0+w-2,y0+1,'#ddd'); r.set(x0+w-2,y0+2,'#ddd'); r.set(x0+w-2,y0+3,'#ddd'); }
  if(st==='apron'){ const a=tones(L.shirt2||'#eee'); for(let y=3;y<h+5;y++)for(let x=3;x<w+1;x++) r.set(x0+x,y0+y,x===3?a.md:(y===h+4?a.dk:a.b)); r.rect(x0+5,y0+7,3,2,a.md); }
  if(st==='dress'){ for(let y=h-2;y<h+6;y++){ const sp=Math.floor((y-h+2)/2); for(let x=-sp;x<w+sp;x++) r.set(x0+x,y0+y,x<-sp+1?t.md:(y===h+5?t.dk:t.b)); } }
  if(st==='uniform'){ for(let k=0;k<14;k++){ r.set(x0+((k*37)%w),y0+((k*17)%h),k%2?t.dk:t.hi); } r.rect(x0+w-4,y0+3,3,3,t.md); }
  if(st==='uniform2'){ r.rect(x0+1,y0+3,3,2,t.md); r.rect(x0+w-4,y0+3,3,2,t.md); for(let y=1;y<h-1;y+=3) r.set(x0+w-2,y0+y,'#d8c080'); }
  if(st==='flannel'){ const s2=L.shirt2||'#400'; for(let y=0;y<h;y++)for(let x=0;x<w;x++){ if(x%3===0||y%3===0) r.set(x0+x,y0+y,s2);} }
  if(st==='clown'){ for(let y=1;y<h;y+=3) r.ell(x0+w/2,y0+y,1,1,L.shirt2||'#ff0',{flat:true}); for(let x=-1;x<w+1;x++) r.set(x0+x,y0,x%2?'#fff':'#ffeb3b'); }
  if(st==='tank'){ r.set(x0+1,y0,L.skin); r.set(x0+w-2,y0,L.skin); r.set(x0+w-3,y0,L.skin); }
  if(L.collar!==false&&st!=='bare'&&st!=='tank'&&st!=='dress'){ r.set(x0+w-4,y0,t.hi); r.set(x0+w-3,y0,t.hi); }
  if(L.belt){ for(let x=0;x<w;x++) r.set(x0+x,y0+h-2,'#2a1a12'); r.set(x0+w-3,y0+h-2,'#e0c050'); r.set(x0+w-2,y0+h-2,'#a08030'); }
  if(L.badge){ r.set(x0+w-3,y0+3,'#f0d050'); r.set(x0+w-2,y0+3,'#c8a020'); r.set(x0+w-3,y0+4,'#c8a020'); }
  if(L.blood){ r.set(x0+5,y0+3,'#7a0a0a'); r.set(x0+6,y0+3,'#8a1010'); r.set(x0+6,y0+4,'#6a0808'); r.set(x0+2,y0+9,'#7a0a0a'); r.clr(x0+w-1,y0+h-3); }
  return {x0,w,y0}; }
function drawLeg(r,L,hipx,hipy,a,back){ const pants=back?shade(L.pants,0.82):L.pants; const e=r.limb(hipx,hipy,a,9,4,pants); const sh=L.shoes||L.skin; const st=tones(back?shade(sh,0.85):sh);
  const fx=Math.round(e.x), fy=Math.round(e.y); const bw=L.bigshoes?7:4; for(let i=-1;i<bw;i++){ r.set(fx+i,fy+1,st.b); r.set(fx+i,fy+2,i===-1?st.md:st.dk);} r.set(fx+bw-1,fy+1,st.hi);
  if(L.zombie&&!back){ r.set(fx+1,fy-1,L.skin); } }
function drawArm(r,L,sx,sy,a,back){ const sleeve=(L.shirtStyle==='tank'||L.shirtStyle==='bare')?L.skin:(L.shirtStyle==='tee'||L.shirtStyle==='dress'||L.shirtStyle==='vest'||L.shirtStyle==='hivis'?null:L.shirt);
  const skin=back?shade(L.skin,0.85):L.skin; let arm;
  if(sleeve){ arm=r.limb(sx,sy,a,10,3,back?shade(sleeve,0.82):sleeve,skin,3,!back); } else { const sl=L.shirtStyle==='vest'||L.shirtStyle==='hivis'?(L.shirtStyle==='hivis'?'#f2f2f2':L.shirt):L.shirt; r.limb(sx,sy,a,3,4,back?shade(sl,0.82):sl); arm=r.limb(sx,sy,a,10,3,skin); }
  if(L.fat) r.limb(sx,sy,a,7,5,back?shade(L.shirt||L.skin,0.82):(L.shirtStyle==='tank'?L.skin:L.shirt));
  return arm; }
// Rahmen: i, w0..w7, j, a0..a3, c0..c1 (Klettern)
function poseFor(fr,L){ let lf=0,lb=0,af=0,ab=0,bob=0; const z=L.zombie;
  if(fr[0]==='w'){ const k=+fr.slice(1); const p=k/8*Math.PI*2; lf=Math.sin(p)*0.62; lb=-lf; af=-Math.sin(p)*0.7; ab=-af; bob=(k%4===1||k%4===2)?-1:0; }
  else if(fr==='j'){ lf=0.7; lb=-0.4; af=2.6; ab=-0.6; }
  else if(fr[0]==='a'){ const k=+fr.slice(1); af=[3.0,2.2,1.3,0.5][k]; ab=-0.3; lf=0.25; lb=-0.25; }
  else if(fr[0]==='c'){ const k=+fr.slice(1); af=k?2.9:2.4; ab=k?2.4:2.9; lf=k?0.3:-0.1; lb=k?-0.1:0.3; }
  if(z&&fr[0]!=='a'){ af=1.45+(fr[0]==='w'?Math.sin(+fr.slice(1)/8*6.28)*0.12:0); ab=1.35; if(fr[0]==='w'){ lf*=0.7; lb*=0.7; } }
  if(z&&fr[0]==='a'){ const k=+fr.slice(1); af=[1.9,1.6,1.2,0.9][k]; ab=af-0.2; }
  return {lf,lb,af,ab,bob}; }
function paintHumanoid(L,fr){ const r=new Ras(SW,SH); const p=poseFor(fr,L); const b=p.bob; const shX=17, shY=30+b;
  if(L.backpack){ const bp=tones(L.backpack); for(let y=0;y<12;y++)for(let x=0;x<6;x++) r.set(8+x,28+b+y,x===0?bp.md:(y===0?bp.hi:(y===11?bp.dk:bp.b))); r.rect(9,32+b,4,1,bp.dk); r.set(11,33+b,'#c0a040'); }
  drawArm(r,L,shX+1,shY,p.ab,true);
  drawLeg(r,L,16,40+b,p.lb,true);
  drawLeg(r,L,18,40+b,p.lf,false);
  drawTorso(r,L,b);
  const {hx,hy}=drawHead(r,L,b); drawHair(r,L,hx,hy); drawMask(r,L,hx,hy); drawHat(r,L,hx,hy);
  if(L.beard){ const bd=tones(L.beard); for(let y=8;y<15;y++)for(let x=5;x<15;x++){ if(y>12&&(x<8||x>13)) continue; if(y===14&&x%2) continue; if(y===8&&x<11) continue; r.set(hx+x,hy+y,(x+y)%3===0?bd.md:bd.b);} r.set(hx+12,hy+10,'#3a1a1a'); r.set(hx+13,hy+10,'#3a1a1a'); }
  if(L.glasses){ r.rect(hx+9,hy+4,5,1,'#222'); r.rect(hx+9,hy+5,1,2,'#222'); r.rect(hx+13,hy+5,1,2,'#222'); r.set(hx+10,hy+5,'#bfe6ff'); r.set(hx+12,hy+5,'#bfe6ff'); r.rect(hx+3,hy+4,6,1,'#222'); }
  if(L.mirror){ r.ell(hx+8,hy-1,2,2,'#dfe8ee'); r.set(hx+8,hy-1,'#fff'); }
  if(L.headset){ for(let x=1;x<14;x++) r.set(hx+x,hy-1,'#222'); r.rect(hx+3,hy+5,3,4,'#333'); r.set(hx+6,hy+9,'#333'); r.set(hx+7,hy+10,'#333'); r.set(hx+8,hy+10,'#555'); }
  const hand=drawArm(r,L,shX,shY,p.af,false);
  if(L.tool==='schraube'&&fr[0]!=='a'){ r.limb(hand.x,hand.y,p.af+1.2,4,2,'#9aa4ac'); }
  return {cv:r.toCanvas(true,L.rad?'#8cff3a':null),hand:{x:hand.x,y:hand.y,a:p.af}}; }
// ---- Kreaturen ----
function paintCreature(t,fr,o){ o=o||{}; const k=fr[0]==='w'?+fr.slice(1):0; const ph=k/8*Math.PI*2; let r, ol=null;
  if(t==='hund'){ r=new Ras(SW,SH); const c='#6a5038'; const leg=(x,a,bk)=>{ r.limb(x,46,a,8,3,bk?shade(c,0.8):c); }; leg(12,Math.sin(ph)*0.5,true); leg(24,-Math.sin(ph)*0.5,true); r.ell(18,44,10,4,c); for(let x=12;x<24;x+=3) r.set(x,45,shade(c,0.65)); r.set(16,42,'#8a0a0a'); r.set(17,42,'#6a0808'); leg(14,-Math.sin(ph)*0.5); leg(26,Math.sin(ph)*0.5);
    r.ell(29,40,5,4,c); r.rect(31,42,5,3,shade(c,0.9)); r.set(35,43,'#e8e0c0'); r.set(33,44,'#e8e0c0'); r.set(30,38,'#ff2020'); r.set(26,35,c); r.set(27,36,c); r.set(26,36,shade(c,0.7)); r.limb(8,42,-2.0+Math.sin(ph)*0.3,6,2,c); }
  else if(t==='geier'||t==='geierkoenigin'){ const big=t==='geierkoenigin'; r=new Ras(big?96:SW,big?60:SH); const s=big?2.4:1, cx=big?48:20, cy=big?40:44; const c=big?'#4a3838':'#3a3030'; const flap=Math.sin(ph)*(big?14:6);
    r.limb(cx-2*s,cy-2*s,-1.9-flap*0.04,12*s,Math.round(4*s),shade(c,0.8)); r.ell(cx,cy,7*s,4*s,c); r.limb(cx-6*s,cy,-1.3,5*s,Math.round(3*s),shade(c,0.7));
    r.limb(cx+5*s,cy-2*s,-2.6,5*s,Math.round(2*s),'#c89a9a'); r.ell(cx+8*s,cy-7*s,2.6*s,2.4*s,'#d4a0a0'); r.set(cx+9*s,cy-8*s,'#ff2020'); r.limb(cx+10*s,cy-7*s,1.7,3*s,Math.round(1.5*s)||1,'#d8b040');
    r.limb(cx+1*s,cy-2*s,-2.0+flap*0.05,13*s,Math.round(4*s),c); for(let i=0;i<3;i++) r.set(cx-6*s-i*2*s,cy-4*s-flap*0.3*s,'#eee');
    if(big){ const kx=Math.round(cx+8*s-6), ky=Math.round(cy-9.4*s-6); for(let i=0;i<4;i++){ r.rect(kx+i*3,ky,2,4,'#f0c030'); } r.rect(kx,ky+3,12,3,'#e0a020'); r.set(kx+5,ky+4,'#e02020'); } }
  else if(t==='hase'){ r=new Ras(SW,SH); const c='#c8b090'; r.ell(18,51,5,3.5,c); r.ell(24,48,3,2.6,c); r.limb(23,46,-2.9,5,2,c); r.limb(25,46,-2.6,5,2,shade(c,1.1)); r.set(25,47,'#222'); r.ell(13,50,1.5,1.5,'#fff'); r.set(16+Math.round(Math.sin(ph)*2),54,c); r.set(21,54,c); }
  else if(t==='huhn'){ r=new Ras(SW,SH); const c='#e8e8e8'; r.limb(18,51,Math.sin(ph)*0.4,3,1,'#e0a020'); r.limb(20,51,-Math.sin(ph)*0.4,3,1,'#e0a020'); r.ell(19,48,5,4,c); r.ell(23,43,2.5,2.5,c); r.set(24,42,'#222'); r.rect(25,43,2,1,'#e0a020'); r.set(23,40,'#e53935'); r.set(22,40,'#e53935'); r.limb(14,46,-2.2,4,2,shade(c,0.85)); }
  else if(t==='hirsch'){ r=new Ras(SW+8,SH); const c='#9a6a3a'; const leg=(x,a,bk)=>r.limb(x,42,a,12,3,bk?shade(c,0.8):c,'#3a2a1a',2); leg(12,Math.sin(ph)*0.5,1); leg(28,-Math.sin(ph)*0.5,1); r.ell(20,40,11,5,c); r.ell(14,38,3,2,'#f0e8d8'); leg(14,-Math.sin(ph)*0.5); leg(30,Math.sin(ph)*0.5);
    r.limb(29,37,-2.6,8,4,c); r.ell(34,29,4,3,c); r.set(36,28,'#222'); r.set(38,30,'#222'); for(let i=0;i<5;i++){ r.set(31-i,25-i,'#d8c8a8'); r.set(33+i,25-i,'#d8c8a8'); } r.set(29,22,'#d8c8a8'); r.set(37,22,'#d8c8a8'); }
  else if(t==='kriecher'){ r=new Ras(SW+8,SH); const L=LOOKS.schlurfer; const sk=L.skin; r.ell(16,50,9,3.5,'#5a6a7a'); r.rect(8,50,5,3,'#3d3d55'); r.limb(26,49,1.5+Math.sin(ph)*0.5,9,3,sk); r.limb(22,51,1.3-Math.sin(ph)*0.5,8,3,shade(sk,0.85)); r.ell(28,45,5,4.5,sk); r.set(31,44,'#c0101a'); r.set(30,44,'#f0e8c0'); r.rect(30,47,3,1,'#3a0a0a'); r.set(14,49,'#7a0a0a'); r.set(15,50,'#7a0a0a'); r.rect(24,41,6,2,'#3a3020'); }
  else if(t==='spinne'){ r=new Ras(SW,SH); const sk='#9aabaa'; for(const [x,a] of [[12,-0.6],[16,-0.3],[22,0.4],[26,0.7]]) { const e=r.limb(x,40,a+Math.sin(ph+x)*0.3,8,2,sk); r.limb(e.x,e.y,a*0.3,7,2,shade(sk,0.85)); } r.ell(19,38,7,5,'#555'); r.ell(26,32,4.5,4.5,sk); r.set(28,31,'#ff2020'); r.set(29,31,'#ff2020'); r.rect(27,34,3,1,'#3a0a0a'); r.limb(13,38,-1.0,8,2,sk); }
  else if(t==='doppelkopf'){ r=new Ras(SW+8,SH); const c='#d8a0a0'; r.limb(18,42,Math.sin(ph)*0.4,10,5,shade(c,0.85)); r.limb(22,42,-Math.sin(ph)*0.4,10,5,c); r.ell(20,34,9,9,c); for(let i=0;i<4;i++) r.set(16+i*2,31+i,'#8a4a5a'); r.limb(12,30,1.2+Math.sin(ph)*0.3,11,4,shade(c,0.8)); r.limb(28,30,1.5-Math.sin(ph)*0.3,11,4,c);
    r.ell(15,22,5,5,c); r.ell(26,21,5,5,c); r.set(18,21,'#300'); r.set(29,20,'#300'); r.rect(17,24,3,1,'#300'); r.rect(28,23,3,1,'#300'); r.set(14,19,'#8a6a6a'); r.set(25,18,'#8a6a6a'); }
  else if(t==='armige'){ r=new Ras(SW+16,SH+4); const c='#c89080'; r.limb(22,46,Math.sin(ph)*0.3,11,6,shade(c,0.85)); r.limb(28,46,-Math.sin(ph)*0.3,11,6,c); r.ell(25,34,11,12,c); r.ell(28,19,5,5,c); r.set(31,18,'#300'); r.rect(30,21,3,1,'#300');
    for(let i=0;i<3;i++){ r.limb(15,26+i*6,0.9+i*0.3+Math.sin(ph+i)*0.2,12,4,shade(c,0.8-i*0.05)); r.limb(35,26+i*6,1.2+i*0.3-Math.sin(ph+i)*0.2,12,4,c); } for(let i=0;i<5;i++) r.set(20+i*2,30+((i*3)%5),'#8a5a4a'); }
  else if(t==='spinnenfrau'){ r=new Ras(SW+8,SH); const c='#e0b0b0'; for(let i=0;i<4;i++){ const x=10+i*6; const e=r.limb(x,42,(-0.8+i*0.5)+Math.sin(ph+i)*0.3,7,3,shade(c,0.85)); r.limb(e.x,e.y,(-0.3+i*0.2),8,2,shade(c,0.75)); } r.ell(20,40,10,5,c); r.ell(30,32,5,5,c); r.rect(26,27,9,4,'#2a1a0a'); r.limb(27,29,-0.3,10,3,'#2a1a0a'); r.set(32,32,'#300'); r.set(34,32,'#300'); r.rect(31,35,3,1,'#300'); }
  else if(t==='mantelmann'){ r=new Ras(SW+8,SH+12); const c='#6f6f6f', coat='#3a3a40'; const yo=12; r.limb(21,46+yo-10,Math.sin(ph)*0.35,12,5,'#26262a'); r.limb(25,46+yo-10,-Math.sin(ph)*0.35,12,5,'#2e2e33'); for(let y=0;y<26;y++)for(let x=0;x<14;x++) r.set(16+x,20+yo-6+y,x<2?shade(coat,0.8):(y>23?shade(coat,0.6):coat)); for(let y=0;y<26;y++) r.set(24,20+yo-6+y,shade(coat,0.6));
    r.limb(18,17+yo,-Math.sin(ph)*0.3+0.2,14,5,coat,c,4); r.ell(23,8+yo,6,6,c); r.set(26,7+yo,'#e0e0e0'); r.set(27,7+yo,'#333'); r.rect(25,11+yo,3,1,'#333'); for(let x=13;x<34;x++){ r.set(x,3+yo,'#26262a'); } for(let x=17;x<29;x++)for(let y=-3;y<3;y++) r.set(x,y+yo,y===-3?'#3e3e44':'#2a2a2e'); r.limb(28,17+yo,0.4+Math.sin(ph)*0.3,14,5,coat,c,4); }
  else if(t==='brocken'){ r=new Ras(SW+16,SH+4); const c='#8a9a72'; r.limb(22,46,Math.sin(ph)*0.3,10,6,'#3a3a4a'); r.limb(30,46,-Math.sin(ph)*0.3,10,6,'#444458'); r.ell(26,32,13,13,c); for(let i=0;i<6;i++) r.set(20+i*3,26+(i%3)*4,shade(c,0.7)); r.ell(34,19,4,4,c); r.set(36,18,'#c00'); r.rect(35,21,3,1,'#300');
    r.limb(14,24,0.4+Math.sin(ph)*0.3,18,9,shade(c,0.85)); r.limb(38,24,0.6-Math.sin(ph)*0.3,18,9,c); r.ell(42,42,5,4,c); r.set(28,32,'#6a0a0a'); r.set(29,33,'#6a0a0a'); }
  else if(t==='rammbock'){ r=new Ras(SW+12,SH); const L=Object.assign({},LOOKS.schlurfer,{shirt:'#6a5a4a',shirtStyle:'tank',skin:'#94a07a'}); const p=poseFor(fr,L); drawLeg(r,L,16,40+p.bob,p.lb,true); drawLeg(r,L,18,40+p.bob,p.lf,false); r.limb(17,31,0.5,6,3,shade(L.skin,0.8)); drawTorso(r,L,p.bob); const {hx,hy}=drawHead(r,L,p.bob); drawHair(r,L,hx,hy); r.limb(20,30,1.35+Math.sin(ph)*0.15,14,9,L.skin); r.ell(36,34,5,5,L.skin); r.set(35,31,shade(L.skin,0.7)); }
  else if(t==='fleischberg'){ r=new Ras(96,76); const c='#b86a6a'; const s=Math.round(Math.sin(ph)*1.5); r.limb(30,62,0,10,9,shade(c,0.75)); r.limb(64,62,0,10,9,shade(c,0.75)); r.ell(48,42+s,38,28-s,c); r.ell(38,30,10,7,shade(c,1.1)); r.ell(62,50,12,6,shade(c,1.08));
    for(let i=0;i<8;i++){ r.set(20+i*7,24+((i*5)%9),'#5a2a2a'); r.set(21+i*7,25+((i*5)%9),'#5a2a2a'); } for(let y=0;y<14;y++) r.set(26,30+y,(y%2)?'#3a1a1a':'#e8d8c8');
    r.ell(38,32,5,5,'#fff59d'); r.ell(60,30,6,6,'#fff59d'); r.ell(39,33,2,2,'#300',{flat:true}); r.ell(61,31,2.4,2.4,'#300',{flat:true}); r.rect(34,44,30,9,'#3a0505'); for(let i=0;i<7;i++){ r.rect(35+i*4,44,2,3,'#f0ead0'); r.rect(37+i*4,50,2,3,'#f0ead0'); }
    r.limb(12,40,0.6+Math.sin(ph)*0.3,14,7,shade(c,0.85)); r.limb(84,40,-0.6-Math.sin(ph)*0.3,14,7,c); }
  return {cv:r.toCanvas(true,o.rad?'#8cff3a':null),w:r.w,h:r.h}; }
// ---- Zugriff mit Cache ----
const CREATURES={hund:1,geier:1,geierkoenigin:1,hase:1,huhn:1,hirsch:1,kriecher:1,spinne:1,doppelkopf:1,armige:1,spinnenfrau:1,mantelmann:1,brocken:1,rammbock:1,fleischberg:1};
function getSprite(id,fr,rad){ const key=id+'|'+fr+(rad?'|r':''); let s=SPR.cache.get(key); if(s) return s;
  if(CREATURES[id]){ s=paintCreature(id,fr,{rad}); }
  else { let L=LOOKS[id]||LOOKS.schlurfer; if(rad) L=Object.assign({},L,{rad:true,skin:'#9ad06a'}); s=paintHumanoid(L,fr); }
  SPR.cache.set(key,s); return s; }
function frameFor(e,isPlayer){ if(e.sleep) return 'i'; if(e.climb) return 'c'+((Math.floor(G.clock*6))%2);
  const att=isPlayer?e.attackT>0:(e.atk>0.7||e.attackT>0); if(att){ const t=isPlayer?Math.max(0,e.attackT)/0.2:(e.atk>0.7?(1-(e.atk-0.7)/0.3):Math.max(0,e.attackT)/0.2); return 'a'+Math.max(0,Math.min(3,Math.floor((isPlayer?1-t:t)*4))); }
  if(!e.onGround&&!(MOBS[e.t]&&MOBS[e.t].fly)&&Math.abs(e.vy)>40) return 'j';
  if(Math.abs(e.vx)>6) return 'w'+(Math.floor(e.walk)%8); return 'i'; }
// Zeichnet Figur: x = Mitte, y = Fußpunkt (Welt->Bildschirm schon umgerechnet)
function spriteBB(s){ if(s.bb) return s.bb; const cv=s.cv, w=cv.width, h=cv.height; const D=cv.getContext('2d').getImageData(0,0,w,h).data; let x0=w,x1=0,y0=h,y1=0; for(let y=0;y<h;y++)for(let x=0;x<w;x++){ if(D[(y*w+x)*4+3]>0){ if(x<x0)x0=x; if(x>x1)x1=x; if(y<y0)y0=y; if(y>y1)y1=y; } } s.bb={x0,x1,y0,y1}; return s.bb; }
function spriteAnchor(id,rad){ const idle=getSprite(id,'i',rad); if(idle.anc) return idle.anc; const bb=spriteBB(idle); idle.anc={ax:CREATURES[id]?Math.round((bb.x0+bb.x1)/2):17, ay:bb.y1+1, top:bb.y0}; return idle.anc; }
function tinted(s){ if(s.red) return s.red; const c=mkCanvas(s.cv.width,s.cv.height), g=c.getContext('2d'); g.drawImage(s.cv,0,0); g.globalCompositeOperation='source-atop'; g.fillStyle='rgba(255,70,60,0.6)'; g.fillRect(0,0,c.width,c.height); s.red=c; return c; }
function drawSprite(g,id,fr,x,y,dir,o){ o=o||{}; const s=getSprite(id,fr,o.rad); const an=spriteAnchor(id,o.rad); const ax=an.ax, ay=an.ay;
  g.save(); g.translate(Math.round(x),Math.round(y)); if(dir<0) g.scale(-1,1); if(o.alpha!=null) g.globalAlpha=o.alpha;
  g.drawImage(o.flash?tinted(s):s.cv,-ax,-ay);
  if(o.held&&s.hand){ const ic=GFX.icons[o.held]; if(ic){ const hx=s.hand.x-ax, hy=s.hand.y-ay; g.save(); g.translate(hx,hy); const att=fr[0]==='a'; const rot=att?Math.PI-s.hand.a:0.55; g.rotate(rot); if(o.held==='fackel'){ g.rotate(-rot); g.drawImage(ic,-8,-14); } else { g.scale(-1,1); g.drawImage(ic,-8,-14); } g.restore(); } }
  g.restore(); return an; }
