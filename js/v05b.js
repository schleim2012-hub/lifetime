// Lifetime 0.5 – Teil B: Biome, Wrack, Fahrzeuge, Deko, Straßen, Strommasten
'use strict';
const BIOME_NAMES={wald:'Mischwald',kiefer:'Kiefernwald',wueste:'Wüste',verbrannt:'Verbrannte Zone',stadt:'Stadt',schnee:'Schneefeld',oedland:'Ödland'};
// ---------- Bilder ----------
const ART5I={veh:{},props:{},plane:null,logo:null,titlebg:null};
(function(){ const mk=u=>{ const i=new Image(); i.src=u; return i; };
  for(const k in ART5.veh) ART5I.veh[k]=mk(ART5.veh[k]); for(const k in ART5.props) ART5I.props[k]=mk(ART5.props[k]);
  ART5I.plane=mk(ART5.plane); ART5I.logo=mk(ART5.logo); ART5I.titlebg=mk(ART5.titlebg);
  for(const k in ART5.icons){ ART.icons[k]=ART5.icons[k]; ARTI.icons[k]=mk(ART5.icons16[k]||ART5.icons[k]); }
  ARTI.furn.kaktus=ART5I.props.kaktus; })();
// ---------- Kachel-Texturen ----------
function buildTex5(){ const mkT=(seed,fn)=>[0,1,2,3].map(v=>{ const c=mkCanvas(T,T), g=c.getContext('2d'); const r=rngSeed(seed+v*31); fn(g,r,v); return c; });
  const noise=(g,r,base,cols,n)=>{ g.fillStyle=base; g.fillRect(0,0,T,T); for(let i=0;i<n;i++){ g.fillStyle=cols[i%cols.length]; g.fillRect(r()*T|0,r()*T|0,1+(r()*2|0),1); } };
  GFX.tiles[74]=mkT(740,(g,r)=>{ noise(g,r,'#3a3634',['#2a2624','#4a4440','#55504a','#1e1a18'],60); for(let i=0;i<3;i++){ g.fillStyle=r()<0.5?'#ff6a20':'#c03a10'; g.fillRect(r()*T|0,r()*T|0,1,1); } g.fillStyle='#5a5450'; g.fillRect(0,0,T,2); g.fillStyle='#6e6862'; for(let x=0;x<T;x+=3) g.fillRect(x+(r()*2|0),0,1,1); });
  GFX.tiles[75]=mkT(750,(g,r)=>{ noise(g,r,'#8a6248',['#7a5440','#9a7058','#6a4836','#a87e62'],50); g.fillStyle='#5a3a28'; let x=r()*T|0,y=3; for(let i=0;i<10;i++){ g.fillRect(x,y,1,1); x+=r()<0.5?1:-1; y+=r()<0.6?1:0; } g.fillStyle='#b08a6a'; g.fillRect(0,0,T,1); });
  GFX.tiles[76]=mkT(760,(g,r)=>{ noise(g,r,'#c8a464',['#b8945a','#d8b878','#a88450'],40); g.fillStyle='#a8844e'; g.fillRect(0,5,T,1); g.fillRect(0,11,T,1); });
  GFX.tiles[82]=mkT(820,(g,r)=>{ noise(g,r,'#7a5a3a',['#6a4a30','#8a6a48'],30); g.fillStyle='#f4f8fc'; g.fillRect(0,0,T,5); g.fillStyle='#dce6f0'; for(let x=0;x<T;x++){ const h=4+(r()*3|0); g.fillRect(x,h-1,1,1); g.fillStyle=r()<0.5?'#dce6f0':'#c8d4e2'; g.fillRect(x,h,1,1+(r()*2|0)); g.fillStyle='#dce6f0'; } g.fillStyle='#ffffff'; g.fillRect(r()*T|0,1,2,1); });
  GFX.tiles[77]=mkT(770,(g,r,v)=>{ g.fillStyle='#2a3440'; g.fillRect(3,6,10,10); g.fillStyle='#4a6a8a'; g.fillRect(4,7,8,8); g.fillStyle='#9ad0ff'; g.fillRect(5,9,2,2); g.fillStyle=v&1?'#ff5252':'#5aff8a'; g.fillRect(10,9,1,1); g.fillStyle='#8a9aa8'; g.fillRect(7,0,1,6); g.fillRect(5,1,5,1); g.fillStyle='#c8d8e8'; g.fillRect(6,12,4,1); });
  GFX.tiles[78]=[0,1,2,3].map(()=>mkCanvas(T,T)); GFX.tiles[79]=[0,1,2,3].map(()=>mkCanvas(T,T));
  const tint=(src,col,a)=>src.map(s=>{ const c=mkCanvas(T,T), g=c.getContext('2d'); g.drawImage(s,0,0); g.globalCompositeOperation='source-atop'; g.globalAlpha=a; g.fillStyle=col; g.fillRect(0,0,T,T); return c; });
  GFX.tiles[80]=tint(GFX.tiles[6],'#3a2010',0.35); GFX.tiles[81]=tint(GFX.tiles[6],'#141010',0.72);
  for(const id of [74,75,76,82]) NATURAL.add(id); if(LOOK.framed) LOOK.framed.clear(); }
// ---------- Biome-Aufteilung + Umbau der Welt ----------
function planBiomes(w){ const W=w.W; const fl=w.spawn.x>W/2; const m=v=>fl?W-v:v; const cx=m(w.spawn.x); const c0=w.feat.city||{x0:Math.round(W*0.6),x1:Math.round(W*0.8)}; const c={x0:Math.min(m(c0.x0),m(c0.x1)),x1:Math.max(m(c0.x0),m(c0.x1))};
  const a=cx+60, b=cx+150, mid=Math.round((b+c.x0-10)/2);
  const L=[{b:'wald',x0:0,x1:a},{b:'kiefer',x0:a,x1:b},{b:'wueste',x0:b,x1:mid},{b:'verbrannt',x0:mid,x1:c.x0-8},{b:'stadt',x0:c.x0-8,x1:c.x1+8}];
  const rest=W-(c.x1+8); const s1=c.x1+8+Math.round(rest*0.5); L.push({b:'schnee',x0:c.x1+8,x1:s1},{b:'oedland',x0:s1,x1:W});
  let out=L.filter(s=>s.x1>s.x0); if(fl) out=out.map(s=>({b:s.b,x0:W-s.x1,x1:W-s.x0})).reverse(); return out; }
function biome5(w,x){ for(const s of w.feat.biomes) if(x>=s.x0&&x<s.x1) return s.b; return 'wald'; }
function worldPost5(w,seed){ const W=w.W,H=w.H, R=rngSeed((seed|0)+505); const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
  const I=(x,y)=>y*W+x; const get=(x,y)=>(x<0||y<0||x>=W||y>=H)?17:w.tiles[I(x,y)]; const set=(x,y,t)=>{ if(x>=0&&y>=0&&x<W&&y<H) w.tiles[I(x,y)]=t; }; const setbg=(x,y,t)=>{ if(x>=0&&y>=0&&x<W&&y<H) w.bg[I(x,y)]=t; };
  const f=w.feat; f.biomes=planBiomes(w); f.deco=[]; f.veh=[]; f.jammers=[]; f.poles=[];
  const surf=x=>{ let y=0; while(y<H&&!(TILES[get(x,y)].s||get(x,y)===5)) y++; return y; };
  const natural=x=>{ const s=surf(x); for(let y=s-14;y<s;y++){ const t=get(x,y); if(t&&!(t===6||t===35||t===31||t===36||TILES[t].leaf)) return false; if(w.bg[I(x,Math.max(0,y))]) return false; } const t=get(x,s); return t===2||t===1||t===4||t===74||t===75||t===82||t===76; };
  // --- 1) Wrack neu: Flugzeug-Grafik statt Kachel-Treppe ---
  const wr=f.wreck; if(wr){ const cx=w.spawn.x, fy=wr.y+1;
    for(let x=cx-17;x<=cx+17;x++){ for(let y=fy-12;y<fy;y++){ const t=get(x,y); if(t===30||t===12||t===34){ set(x,y,0); } setbg(x,y,0); } if(get(x,fy)===30||get(x,fy)===34) set(x,fy,2); }
    // Kisten + Feuer bleiben am Boden (y=fy-1); Flugzeug als Bild
    for(let x=cx-11;x<=cx+11;x++){ const t=get(x,fy-1); if(t===29||t===22) continue; if(t&&!TILES[t].s) set(x,fy-1,0); }
    set(cx-7,fy-1,29); set(cx-3,fy-1,29); set(cx+3,fy-1,22); set(cx+6,fy-1,29);
    f.deco.push({k:'plane',x:cx*T+8,y:fy*T+5,z:0});
    // Trümmerteile verstreut (klein, am Boden)
    f.deco.push({k:'fass2',x:(cx+15)*T,y:fy*T+1},{k:'reifenstapel',x:(cx-15)*T,y:fy*T+1});
    // Kanten rund um die Lichtung glätten (keine Stufen)
    smoothRange(cx-34,cx-14,fy,true); smoothRange(cx+14,cx+34,fy,false); }
  function clearTree(x){ const hasTrunk=(c,y)=>{ for(let k=0;k<=8;k++){ { const q=get(c,y+k); if(q===6||q===80||q===81) return true; } } return false; };
    const kill=[]; for(let xx=x-3;xx<=x+3;xx++) for(let y=0;y<H;y++){ const t=get(xx,y); if(xx===x&&(t===6||t===80||t===81)){ kill.push([xx,y]); continue; } if(t&&TILES[t].leaf){ let best=null,bd=9; for(let c=xx-3;c<=xx+3;c++){ if(hasTrunk(c,y)&&Math.abs(c-xx)<bd){ bd=Math.abs(c-xx); best=c; } } if(best===x) kill.push([xx,y]); } }
    for(const [a,b] of kill) set(a,b,0); }
  function smoothRange(x0,x1,fy,left){ const n=x1-x0; for(let x=x0;x<=x1;x++){ const s=surf(x); const k0=left?(x1-x)/n:(x-x0)/n; if(get(x,s-1)===6&&Math.round(fy*(1-k0)+s*k0)!==s) clearTree(x); const k=left?(x1-x)/n:(x-x0)/n; const tgt=Math.round(fy*(1-k)+s*k); fillCol(x,tgt); } }
  function fillCol(x,tgt){ const s=surf(x); if(tgt===s) return; const top=get(x,s); if(tgt<s){ for(let y=tgt;y<s;y++) set(x,y,1); set(x,tgt,top===4?4:2); if(s<H) set(x,s,1); } else { for(let y=s;y<tgt;y++){ set(x,y,0); setbg(x,y,0);} set(x,tgt,2); } }
  // --- 2) einzelne Pfeiler/Löcher an der Oberfläche glätten ---
  for(let x=2;x<W-2;x++){ if(!natural(x)||!natural(x-1)||!natural(x+1)) continue; const s=surf(x), l=surf(x-1), r=surf(x+1); if(get(x,s-1)===6) continue;
    if(s<l-1&&s<r-1) fillCol(x,Math.min(l,r)); else if(s>l+1&&s>r+1) fillCol(x,Math.max(l,r)); }
  // --- 3) Oberfläche je Biom ---
  for(let x=0;x<W;x++){ let b=biome5(w,x); const sb=f.biomes.find(q=>x>=q.x0&&x<q.x1); if(sb){ const e=Math.min(x-sb.x0,sb.x1-x); if(e<5&&R()<0.5-e*0.1){ const nb=x-sb.x0<sb.x1-x?f.biomes[f.biomes.indexOf(sb)-1]:f.biomes[f.biomes.indexOf(sb)+1]; if(nb) b=nb.b; } }
    if(b==='wald'||b==='stadt') continue; const s=surf(x); const top=get(x,s);
    const repl=(a,bTop,bSub,depth)=>{ if(top!==2&&top!==1) return; set(x,s,bTop); for(let y=s+1;y<s+depth;y++){ if(get(x,y)===1) set(x,y,bSub); } };
    if(b==='wueste'){ repl(0,4,4,4); for(let y=s+4;y<s+11;y++) if(get(x,y)===1||get(x,y)===3) set(x,y,76); }
    if(b==='schnee') repl(0,82,1,1);
    if(b==='verbrannt') repl(0,74,74,2);
    if(b==='oedland') repl(0,75,75,3);
    if(b==='kiefer') {}
    // Vegetation umbauen
    for(let y=Math.max(0,s-26);y<s;y++){ const t=get(x,y); if(!t) continue; const d=TILES[t];
      if(b==='kiefer'||b==='schnee'){ if(d.leaf) set(x,y,51); else if(t===6) set(x,y,80); if(t===31&&b==='schnee') set(x,y,0); }
      if(b==='wueste'||b==='oedland'){ if(d.leaf||t===6||t===31||t===35) set(x,y,0); }
      if(b==='verbrannt'){ if(d.leaf||t===31||t===35) set(x,y,0); else if(t===6) set(x,y,81); } } }
  // zusätzliche Kiefern im Kiefernwald und Schneefeld
  for(let x=4;x<W-4;){ const b=biome5(w,x); x+=b==='kiefer'?ri(5,8):b==='schnee'?ri(7,12):3; if(x>=W-4) break; const bb=biome5(w,x); if(bb!=='kiefer'&&bb!=='schnee') continue; if(!natural(x)) continue; const s=surf(x); let free=true; for(let dx=-2;dx<=2;dx++) for(let y=s-12;y<s;y++) if(get(x+dx,y)!==0&&get(x+dx,y)!==35) free=false; if(!free) continue;
    const h=ri(6,10); for(let y=s-h;y<s;y++) set(x,y,80); for(let k=0;k<h-2;k++){ const y=s-h-1+k; const hw=Math.min(2,Math.floor(k/2.2)); if(k>=h-3) break; for(let dx=-hw;dx<=hw;dx++) if(dx!==0||k<1) { if(get(x+dx,y)===0) set(x+dx,y,51); } } set(x,s-h-1,51); set(x,s-h-2,51); }
  // Schnee auf Nadeln: Kiefern im Schnee bekommen helle Spitzen (über Deko)
  // --- 4) Straßen mit glattem Gelände, Masten, Fahrzeuge ---
  const runs=[]; let st=-1; for(let x=6;x<W-6;x++){ const bb=biome5(w,x); const tr=[get(x,surf(x)-1)].some(t=>t===6||t===80||t===81)||get(x+1,surf(x+1)-1)===6||get(x-1,surf(x-1)-1)===6; const ok=natural(x)&&!tr&&(bb==='wueste'||bb==='verbrannt'||bb==='oedland'||bb==='schnee'||bb==='kiefer')&&Math.abs(x-w.spawn.x)>22; if(ok&&st<0) st=x; if((!ok||x===W-7)&&st>=0){ if(x-st>=24) runs.push([st,x-1]); st=-1; } }
  for(const [a,b] of runs){ // Höhe glätten
    const hs=[]; for(let x=a;x<=b;x++) hs.push(surf(x)); const sm=hs.map((_,i)=>{ let s=0,n=0; for(let k=-7;k<=7;k++){ const j=Math.max(0,Math.min(hs.length-1,i+k)); s+=hs[j]; n++; } return Math.round(s/n); });
    for(let i=0;i<hs.length;i++){ const x=a+i; for(let y=sm[i]-24;y<sm[i];y++){ const t=get(x,y); if(t===6||t===80||t===81||(t&&TILES[t].leaf)) {} } }
    // Bäume, die auf der Straße stehen, entfernen
    for(let i=2;i<hs.length-2;i++){ const x=a+i; for(let y=sm[i]-26;y<sm[i]+1;y++){ const t=get(x,y); if(t===6||t===80||t===81||t===79||(t&&TILES[t].leaf)||t===35||t===31) set(x,y,0); } }
    for(let i=0;i<hs.length;i++){ const x=a+i; const tgt=sm[i]; const s=surf(x); const top=get(x,s); if(tgt<s){ for(let y=tgt;y<s;y++) set(x,y,top===4?4:1); } else if(tgt>s){ for(let y=s;y<tgt;y++) set(x,y,0); }
      const edge=i<2||i>hs.length-3; if(!edge){ set(x,tgt,33); if(get(x,tgt+1)===0) set(x,tgt+1,1); } else { const b=biome5(w,x); set(x,tgt,b==='wueste'?4:b==='schnee'?82:b==='verbrannt'?74:b==='oedland'?75:2); } }
    // Strommasten
    for(let x=a+4;x<=b-4;x+=ri(13,16)){ const y=surf(x); f.poles.push({x:x*T+8,y:y*T}); }
    // Fahrzeuge
    let x=a+ri(6,14); while(x<b-12){ const kinds=['auto','pickup','camper','bus','auto','pickup']; const k=kinds[ri(0,kinds.length-1)]; const img=ART5.vehW&&ART5.vehW[k]; const wpx={auto:92,pickup:96,camper:118,bus:170}[k]; const wt=Math.ceil(wpx/T);
      if(x+wt>b-2) break; const y=surf(x+(wt>>1)); let flat=true; for(let k2=0;k2<wt;k2++){ if(Math.abs(surf(x+k2)-y)>1) flat=false; } if(flat){ for(let k2=0;k2<wt;k2++){ const xx=x+k2, s2=surf(xx); if(s2<y){ for(let yy=s2;yy<y;yy++) set(xx,yy,0); } else if(s2>y){ for(let yy=y;yy<s2;yy++) set(xx,yy,1); } set(xx,y,33); for(let yy=y-6;yy<y;yy++) set(xx,yy,0); } }
      if(flat){ const id=f.veh.length; f.veh.push({id,k,x0:x,x1:x+wt-1,y,flip:R()<0.5,gone:false}); for(let k2=1;k2<wt-1;k2++) set(x+k2,y-1,78); }
      x+=wt+ri(28,60); } }
  // --- 5) Deko je Biom ---
  const DECO={wald:[['fels',.5],['totbaum',.15],['gatter',.1]],kiefer:[['kiefer',1],['kiefer',1],['fels',.4],['gatter',.2],['briefkasten',.1]],wueste:[['kaktus',1],['fels',.6],['schaedel',.4],['totbaum',.3],['reifenstapel',.2],['schild',.15]],
    verbrannt:[['totbaum',1],['totbaum',.8],['fass2',.4],['reifenstapel',.4],['schaedel',.3],['pylone',.2]],stadt:[['laterne2',.6],['briefkasten',.3],['pylone',.4],['schild',.2],['fass2',.2]],
    schnee:[['schneekiefer',1],['schneekiefer',.8],['fels',.4],['totbaum',.2]],oedland:[['totbaum',.6],['schaedel',.6],['reifenstapel',.5],['fass2',.5],['fels',.6],['gatter',.3],['maschenzaun',.3]]};
  for(let x=4;x<W-4;){ const b=biome5(w,x); const tab=DECO[b]; const step=b==='kiefer'||b==='schnee'?ri(4,9):b==='stadt'?ri(8,16):ri(7,15); x+=step; if(!tab) continue; if(!natural(x)&&b!=='stadt') continue; const s=surf(x); const t=get(x,s); if(!TILES[t].s||t===12) continue; if(get(x,s-1)!==0&&get(x,s-1)!==35) continue;
    let tot=0; for(const [,p] of tab) tot+=p; let q=R()*tot, k=tab[0][0]; for(const [kk,p] of tab){ q-=p; if(q<=0){ k=kk; break; } }
    if(k==='kaktus'&&R()<0.5){ set(x,s-1,79); continue; } // echter Kaktus (Frucht)
    f.deco.push({k,x:x*T+8,y:s*T+1,flip:R()<0.5}); }
  // Zäune an Häusern
  for(const h of f.houses||[]){ const s=surf(h.x0-2); if(natural(h.x0-3)) f.deco.push({k:R()<0.5?'zaun':'maschenzaun',x:(h.x0-3)*T,y:s*T+1}); const s2=surf(h.x1+3); if(natural(h.x1+3)) f.deco.push({k:'zaun',x:(h.x1+3)*T+8,y:s2*T+1}); }
  // Häuser in der verbrannten Zone: angekokelt (Bretter -> teils weg, verkohlt)
  for(const h of f.houses||[]){ const b=biome5(w,h.x0); if(b!=='verbrannt'&&b!=='oedland') continue; for(let x=h.x0;x<=h.x1;x++) for(let y=h.y-14;y<h.y;y++){ const t=get(x,y); if((t===8||t===12)&&R()<0.22) set(x,y,0); } }
  // schwebende Stämme (durch Geländeglättung) entfernen
  for(let x=1;x<W-1;x++) for(let y=1;y<H-1;y++){ const t=get(x,y); if((t===6||t===80||t===81)){ const b=get(x,y+1); if(!(b===6||b===80||b===81)&&!TILES[b].s){ clearTree(x); break; } } }
  f.deco.sort((p,q)=>(p.k==='kiefer'||p.k==='schneekiefer'?0:1)-(q.k==='kiefer'||q.k==='schneekiefer'?0:1));
  f.v05=true; return w; }
const _genWorld5=genWorld;
genWorld=function(seed){ const w=_genWorld5(seed); try{ worldPost5(w,seed); }catch(e){ console.error('worldPost5',e); } return w; };
// ---------- Deko zeichnen (hinter den Kacheln) ----------
function drawDeco5(){ const f=G.w&&G.w.feat; if(!f||!f.deco) return; const ox=-Math.round(G.cam.x), oy=-Math.round(G.cam.y); const VW=G.VW, VH=G.VH;
  // Strommasten + Leitungen
  if(f.poles&&ART5I.props.mast.complete){ const m=ART5I.props.mast; let prev=null; ctx.strokeStyle='rgba(20,16,14,0.85)'; ctx.lineWidth=1;
    for(const p of f.poles){ const x=p.x+ox, y=p.y+oy; if(prev&&Math.abs(p.x-prev.x)<20*T&&x>-260&&prev.x+ox<VW+260){ const ax=prev.x+ox, ay=prev.y+oy-m.naturalHeight+6; const bx=x, by=y-m.naturalHeight+6; for(const dy of [0,5]){ ctx.beginPath(); ctx.moveTo(ax-10,ay+dy); ctx.quadraticCurveTo((ax+bx)/2,(ay+by)/2+dy+12,bx-10,by+dy); ctx.stroke(); ctx.beginPath(); ctx.moveTo(ax+10,ay+dy); ctx.quadraticCurveTo((ax+bx)/2,(ay+by)/2+dy+12,bx+10,by+dy); ctx.stroke(); } }
      prev=p; if(x<-60||x>VW+60) continue; ctx.drawImage(m,Math.round(x-m.naturalWidth/2),Math.round(y-m.naturalHeight+2)); } }
  for(const d of f.deco){ const img=d.k==='plane'?ART5I.plane:ART5I.props[d.k]; if(!img||!img.complete||!img.naturalWidth) continue; const w=img.naturalWidth,h=img.naturalHeight; const x=Math.round(d.x+ox-w/2), y=Math.round(d.y+oy-h);
    if(x>VW||x+w<0||y>VH||y+h<0) continue; if(d.flip){ ctx.save(); ctx.translate(x+w,y); ctx.scale(-1,1); ctx.drawImage(img,0,0); ctx.restore(); } else ctx.drawImage(img,x,y);
    if(d.k==='plane'){ // Rauch + Glut am Wrack
      if(Math.random()<0.25) G.parts.push({x:d.x-60+Math.random()*30,y:d.y-h*0.55,vx:6+Math.random()*6,vy:-16-Math.random()*10,life:2.4,col:Math.random()<0.5?'#5a5450':'#3a3634',sz:2,grav:-4,dust:true});
      if(Math.random()<0.12) G.parts.push({x:d.x-50+Math.random()*30,y:d.y-h*0.5,vx:(Math.random()-0.5)*10,vy:-30,life:1,col:'#ff8a30',sz:1,light:0.4}); } }
  for(const v of f.veh){ if(v.gone) continue; const img=ART5I.veh[v.k]; if(!img||!img.complete) continue; const w=img.naturalWidth,h=img.naturalHeight; const cxp=(v.x0+v.x1+1)/2*T; const x=Math.round(cxp+ox-w/2), y=Math.round(v.y*T+oy-h+3);
    if(x>VW||x+w<0||y>VH||y+h<0) continue; if(v.flip){ ctx.save(); ctx.translate(x+w,y); ctx.scale(-1,1); ctx.drawImage(img,0,0); ctx.restore(); } else ctx.drawImage(img,x,y);
    if(v.hit>0){ v.hit-=0.016; ctx.fillStyle=`rgba(255,240,200,${v.hit})`; ctx.fillRect(x,y,w,h); } } }
// Biome-Hintergründe (Parallaxe) + Deko vor dem Licht
const BG5={};
function buildBG5(){ const W=1024; const mk=H=>{ const c=mkCanvas(W,H); return [c,c.getContext('2d')]; }; const per=(x,f,ph)=>Math.sin((x/W)*Math.PI*2*f+ph);
  const ridge=(H,cols,fn,f,yy)=>{ const [c,g]=mk(H); for(let x=0;x<W;x++){ const h=Math.round(fn(x)); const top=H-h; for(let y=top;y<H;y++){ const d=y-top; g.fillStyle=d<2?cols[0]:d<6?cols[1]:cols[2]; g.fillRect(x,y,1,1);} } return {c,f,H,base:cols[2],y:yy}; };
  BG5.wueste=[ridge(150,['#f0d49a','#d8b070','#c09058'],x=>70+per(x,2,1)*22+per(x,5,0.2)*9+Math.abs(per(x,9,0.7))*10,0.1,0.66), ridge(110,['#e8c080','#c89a5a','#a87a44'],x=>44+per(x,3,2)*14+per(x,8,1)*6,0.22,0.78), ridge(80,['#d0a060','#a87a44','#8a5e34'],x=>28+per(x,6,0.5)*9+per(x,13,2)*3,0.4,0.9)];
  BG5.schnee=[ridge(170,['#ffffff','#e4ecf6','#b8c8dc'],x=>100+per(x,2,0.3)*34+Math.abs(per(x,7,1.3))*24,0.08,0.64), ridge(130,['#f4f8fc','#c8d6e6','#8aa0ba'],x=>64+per(x,4,2)*20+Math.abs(per(x,11,0.5))*14,0.18,0.76), ridge(90,['#e8eef4','#9ab0c4','#5a7088'],x=>30+per(x,7,1)*10+per(x,17,0.2)*4,0.36,0.9)];
  BG5.verbrannt=[ridge(150,['#6a5a54','#4a3e3a','#2e2624'],x=>80+per(x,2,1.7)*26+per(x,6,0.4)*10,0.1,0.66), ridge(110,['#4a3a34','#2e2420','#1e1816'],x=>44+per(x,5,0.9)*14+per(x,12,2)*6,0.24,0.8), ridge(80,['#2e2420','#1e1816','#141010'],x=>26+per(x,9,0.1)*8+per(x,21,1)*4,0.42,0.92)];
  BG5.oedland=[ridge(160,['#d89070','#b86a4c','#8a4a34'],x=>{ const v=per(x,3,0.5); return 60+(v>0.3?50:v>-0.2?30:10)+per(x,13,1)*3; },0.1,0.66), ridge(110,['#b8704e','#8a4e36','#6a3a28'],x=>40+per(x,4,1.2)*16+per(x,10,0.3)*5,0.24,0.8), ridge(80,['#8a5a40','#6a4230','#4a2e20'],x=>24+per(x,8,2)*8,0.42,0.92)];
  BG5.kiefer=[ridge(150,['#5a8a7a','#3e7062','#2e5a50'],x=>84+per(x,2,2.1)*26+per(x,6,1)*10,0.1,0.64)];
  const pines=(H,col,seed,dens,f,yy)=>{ const [c,g]=mk(H); const r=rngSeed(seed); g.fillStyle=col; g.fillRect(0,H-20,W,20); for(let x=0;x<W;x+=dens){ const th=50+r()*(H-66); const bx=x+(r()*dens|0); for(let y=0;y<th;y++){ const hw=Math.round(1+y*0.22+((y%6)<2?-1:0)); g.fillRect((bx-hw+W)%W,H-20-th+y,hw*2+1,1); } } return {c,f,H,base:col,y:yy}; };
  BG5.kiefer.push(pines(150,'#173a30',31,12,0.3,0.82),pines(140,'#0e2a22',47,9,0.45,0.92));
  BG5.schnee.push(pines(120,'#2a3e4a',61,18,0.5,0.95)); }
function biomeWeights5(){ const f=G.w.feat; if(!f.biomes) return null; const cxT=(G.cam.x+G.VW/2)/T; const res={}; for(const s of f.biomes){ const d=Math.max(s.x0-cxT,cxT-s.x1,0); const wgt=Math.max(0,1-d/30); if(wgt>0) res[s.b]=Math.max(res[s.b]||0,wgt); } return res; }
const _drawBackground5=drawBackground;
drawBackground=function(){ _drawBackground5(); if(!G.w||!G.w.feat||!G.w.feat.biomes) return; try{ if(!BG5.wueste) buildBG5(); const ws=biomeWeights5(); const cam=G.cam, VW=G.VW, VH=G.VH; const surf=84*T-cam.y; const dl=dayLight();
    for(const b in ws){ const Ls=BG5[b]; if(!Ls) continue; ctx.save(); ctx.globalAlpha=Math.min(1,ws[b]); for(const Ly of Ls){ const off=-(((cam.x*Ly.f)%1024)+1024)%1024; const by=Math.round(VH*Ly.y+(surf-VH*0.55)*Ly.f*1.6); if(by-Ly.H>VH) continue; for(let x=off;x<VW;x+=1024) ctx.drawImage(Ly.c,Math.round(x),by-Ly.H); ctx.fillStyle=Ly.base; ctx.fillRect(0,by,VW,VH-by+1); } ctx.restore(); }
    // Rauchsäulen in der verbrannten Zone
    if(ws.verbrannt){ ctx.save(); ctx.globalAlpha=0.35*ws.verbrannt; for(let i=0;i<5;i++){ const x=((i*260-cam.x*0.15)%(VW+300)+VW+300)%(VW+300)-150; for(let k=0;k<14;k++){ const yy=VH*0.7-k*14-(G.clock*6%14); const r=8+k*2.2; ctx.fillStyle=k%2?'#2a2422':'#3a3230'; ctx.beginPath(); ctx.arc(x+Math.sin(k*0.7+G.clock*0.3+i)*6+k*3,yy,r,0,7); ctx.fill(); } } ctx.restore(); }
    const tint=(1-dl)*0.72; if(tint>0.01){ ctx.fillStyle=G.bloodmoon?`rgba(40,0,0,${tint})`:`rgba(6,10,30,${tint})`; ctx.fillRect(0,0,VW,VH); }
    // Biome-Farbstich
    const T5={wueste:'rgba(255,190,90,0.10)',schnee:'rgba(200,225,255,0.12)',verbrannt:'rgba(60,20,10,0.18)',oedland:'rgba(200,90,40,0.10)'}; for(const b in ws){ if(T5[b]){ ctx.globalAlpha=ws[b]; ctx.fillStyle=T5[b]; ctx.fillRect(0,0,VW,VH); ctx.globalAlpha=1; } }
    drawDeco5(); }catch(e){ console.error(e); } };
// Biome-Atmosphäre (Partikel + Tönung) – vor dem Licht
const _drawFog5=drawFog;
drawFog=function(ox,oy){ _drawFog5(ox,oy); if(!G.w||!G.w.feat.biomes) return; const ws=biomeWeights5(); const VW=G.VW, VH=G.VH;
  const P=G.player; if(P&&G.state==='play'){ const under=Math.floor(P.y/T)>G.w.sky[Math.floor(P.x/T)]+12; if(!under){
    if(ws.schnee&&Math.random()<ws.schnee*0.9) for(let i=0;i<2;i++) G.parts.push({x:G.cam.x+Math.random()*VW,y:G.cam.y-4,vx:-10+Math.random()*6,vy:22+Math.random()*14,life:7,col:Math.random()<0.7?'#ffffff':'#dce8f4',sz:1,leaf:true,ph:Math.random()*6});
    if(ws.verbrannt&&Math.random()<ws.verbrannt*0.7){ G.parts.push({x:G.cam.x+Math.random()*VW,y:G.cam.y-4,vx:6,vy:14+Math.random()*8,life:7,col:Math.random()<0.85?'#4a4440':'#ff7a30',sz:1,leaf:true,ph:Math.random()*6,light:Math.random()<0.15?0.4:0}); }
    if((ws.wueste||ws.oedland)&&Math.random()<0.35*Math.max(ws.wueste||0,ws.oedland||0)) G.parts.push({x:G.cam.x-4,y:G.cam.y+VH*(0.3+Math.random()*0.6),vx:60+Math.random()*40,vy:(Math.random()-0.5)*6,life:8,col:ws.oedland?'#c88a6a':'#e8cc90',sz:1}); } }
  // Hitzeflimmern/Kältehauch
  if(ws.verbrannt){ ctx.fillStyle=`rgba(40,14,6,${0.12*ws.verbrannt})`; ctx.fillRect(0,0,VW,VH); } };
// ---------- Fahrzeuge: plündern + zerlegen ----------
function vehAt(tx,ty){ const f=G.w.feat; if(!f.veh) return null; return f.veh.find(v=>!v.gone&&tx>=v.x0&&tx<=v.x1&&Math.abs(ty-(v.y-1))<=2)||null; }
const _openContainer5=openContainer;
openContainer=function(tx,ty){ const t=tget(tx,ty); if(t===78){ const v=vehAt(tx,ty); if(v){ const ax=v.x0+1; const key=ax+','+(v.y-1); const fresh=!G.containers[key]; _openContainer5(ax,v.y-1); if(fresh) msg({auto:'Ein ausgeschlachtetes Auto.',pickup:'Ein rostiger Pickup.',camper:'Ein Wohnmobil – jemand hat hier gewohnt.',bus:'Ein liegengebliebener Bus.'}[v.k]+' Mit der Spitzhacke kannst du es zu Schrott zerlegen.','#cfd8dc'); return; } }
  const key=tx+','+ty; const fresh=!G.containers[key]; _openContainer5(tx,ty);
  if(fresh&&(t===29||t===42||t===43)&&G.containers[key]){ const b=biomeAt(tx); const tab=LOOT[b]; if(tab&&!(G.w.feat.wreck&&Math.abs(tx-G.w.feat.wreck.x)<14)){ for(const [id,a,bb,ch] of tab) if(Math.random()<ch*0.6) G.containers[key].push({id,n:a+Math.floor(Math.random()*(bb-a+1))}); if(UI.renderCont&&UI.cont===key) UI.renderPanel&&UI.renderPanel(); } } };
const _breakTile5=breakTile;
breakTile=function(tx,ty,byP){ const t=tget(tx,ty); if(t===78){ const v=vehAt(tx,ty); if(v){ v.gone=true; const key=(v.x0+1)+','+(v.y-1); const c=G.containers[key]; if(c) for(const s of c) spawnDrop(s.id,s.n,tx*T+8,ty*T); delete G.containers[key];
      for(let x=v.x0;x<=v.x1;x++) if(tget(x,v.y-1)===78) _tset5(x,v.y-1,0);
      const big=v.k==='bus'?2:v.k==='camper'?1.5:1; const drops=[['schrott',Math.round((6+Math.random()*5)*big)],['eisen',Math.round((1+Math.random()*2)*big)],['kabel',1+(Math.random()*2|0)],['reifen',v.k==='bus'?3:2]]; if(Math.random()<0.5) drops.push(['felge',1]); if(Math.random()<0.35) drops.push(['motorteil',1]); if(Math.random()<0.3) drops.push(['autobatterie',1]); if(Math.random()<0.4) drops.push(['nummernschild',1]);
      for(const [id,n] of drops) spawnDrop(id,n,(v.x0+v.x1)/2*T+(Math.random()-0.5)*40,(v.y-2)*T);
      for(let i=0;i<30;i++) G.parts.push({x:(v.x0+(v.x1-v.x0)*Math.random())*T,y:(v.y-1-Math.random()*3)*T,vx:(Math.random()-0.5)*160,vy:-Math.random()*160,life:1,col:['#8a8a8a','#6a5a4a','#b0a090','#3a3a3a'][i%4],sz:2,grav:500});
      sfx('brk'); sfx('clang'); G.cam.shake=Math.max(G.cam.shake,5); msg('Fahrzeug zerlegt: Schrott, Eisen, Teile!','#ffd54f'); if(typeof gainXP==='function') gainXP(25); return; } }
  return _breakTile5(tx,ty,byP); };
// Kaktus sticht beim Berühren leicht (über trap-Feld der Kachel)
buildTex5();
if(typeof applyArtIcons==='function'){ applyArtIcons(); if(UI.refreshHot&&G.player) UI.refreshHot(); }
