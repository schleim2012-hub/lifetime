// Lifetime – Weltgenerator (jede Welt neu)
'use strict';
function genWorld(seed){
  const R=rngSeed(seed); const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
  const W=1000,H=240; const tiles=new Uint8Array(W*H), bg=new Uint8Array(W*H);
  const I=(x,y)=>y*W+x; const inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  const set=(x,y,t)=>{ if(inb(x,y)) tiles[I(x,y)]=t; }; const get=(x,y)=>inb(x,y)?tiles[I(x,y)]:17;
  const setbg=(x,y,b)=>{ if(inb(x,y)) bg[I(x,y)]=b; };
  const ents=[]; const feat={camps:[],houses:[],towers:[],cann:null,city:null,lake:null,stash:null,lairs:[]};
  // ---- Abschnitte ----
  const segs=[]; let x=30;
  const push=(type,w)=>{ segs.push({type,x0:x,x1:x+w}); x+=w; };
  push('wald',ri(70,90)); // Absturz-Wald
  const mid=[['see',ri(62,72)],['wald_haus',ri(110,140)],['camp',60],['kann',ri(110,130)]];
  // mischen (außer Absturz)
  for(let i=mid.length-1;i>0;i--){ const j=ri(0,i); [mid[i],mid[j]]=[mid[j],mid[i]]; }
  for(const m of mid) push(m[0],m[1]);
  push('wald',ri(30,40));
  const cityW=Math.min(W-30-x-70, ri(230,260)); push('stadt',cityW);
  push('camp',60);
  push('wald',W-30-x);
  // ---- Höhenprofil ----
  const base=85; const hs=new Array(W);
  const p1=R()*10,p2=R()*10,p3=R()*10;
  for(let i=0;i<W;i++){ hs[i]=base+Math.sin(i*0.021+p1)*7+Math.sin(i*0.063+p2)*3+Math.sin(i*0.17+p3)*1.2; }
  const segAt=i=>segs.find(s=>i>=s.x0&&i<s.x1)||{type:'wald'};
  for(const s of segs){
    if(s.type==='stadt'||s.type==='camp'){ const lv=Math.round(hs[s.x0]); for(let i=s.x0-8;i<s.x1+8;i++){ if(i<0||i>=W) continue; const k=i<s.x0?(s.x0-i)/8:i>=s.x1?(i-s.x1+1)/8:0; hs[i]=lv*(1-k)+hs[i]*k; } }
    if(s.type==='see'){ const c=(s.x0+s.x1)/2, hw=(s.x1-s.x0)/2-14; feat.lake={x0:s.x0,x1:s.x1,lv:Math.round(hs[s.x0])+1}; for(let i=s.x0;i<s.x1;i++){ const d=Math.abs(i-c)/hw; if(d<1) hs[i]=feat.lake.lv+Math.round(Math.cos(d*Math.PI/2)*14); } }
  }
  for(let i=0;i<W;i++) hs[i]=Math.round(hs[i]);
  // ---- Füllen ----
  for(let i=0;i<W;i++){
    const h=hs[i]; const dirt=ri(5,9);
    for(let y=h;y<H;y++){
      let t=y===h?2:(y<h+dirt?1:3);
      if(t===3){ const r=R(); const dep=y-h;
        if(r<0.012) t=14; else if(r<0.018&&dep>15) t=15; else if(r<0.022&&dep>10) t=16; else if(r<0.0245&&dep>80) t=40; else if(r<0.03&&dep<30) t=46; }
      set(i,y,t); if(y>h+1) setbg(i,y,y<h+dirt?1:5);
    }
  }
  // Erz-Adern verdicken
  for(let k=0;k<1800;k++){ const xx=ri(0,W-1), yy=ri(0,H-1); const t=get(xx,yy); if(t===14||t===15||t===16||t===40){ for(let j=0;j<4;j++){ const a=xx+ri(-1,1), b=yy+ri(-1,1); if(get(a,b)===3) set(a,b,t);} } }
  // ---- Höhlen (Würmer) ----
  const carve=(cx,cy,r)=>{ for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++){ if(a*a+b*b<=r*r+0.5){ const X=Math.round(cx+a),Y=Math.round(cy+b); if(inb(X,Y)&&Y<H-4&&get(X,Y)!==17) set(X,Y,0);} } };
  for(let k=0;k<70;k++){
    let cx=ri(40,W-40), cy=ri(base+15,H-20); let ang=R()*Math.PI*2; const len=ri(40,140); let r=ri(1,2)+R()+0.4;
    const s=segAt(cx); if(s.type==='stadt'&&cy<base+25) cy+=25;
    for(let j=0;j<len;j++){ carve(cx,cy,r); ang+=(R()-0.5)*0.5; cx+=Math.cos(ang); cy+=Math.sin(ang)*0.6; r=Math.max(1.7,Math.min(3.4,r+(R()-0.5)*0.3)); if(cy<base+10) ang=Math.abs(ang); if(cy>H-10) ang=-Math.abs(ang); }
  }
  // Höhleneingänge im Wald
  for(let k=0;k<5;k++){ const s=segs.filter(s=>s.type.startsWith('wald'))[ri(0,2)]; if(!s) continue; let cx=ri(s.x0+10,s.x1-10), cy=hs[cx]-1; let ang=Math.PI/2+(R()-0.5); for(let j=0;j<ri(25,45);j++){ carve(cx,cy,2); ang+=(R()-0.5)*0.4; cx+=Math.cos(ang)*0.8; cy+=Math.abs(Math.sin(ang)); } }
  // Mutanten-Höhlen (große Räume tief unten)
  for(let k=0;k<3;k++){ const cx=ri(80,W-80), cy=ri(170,205); for(let a=-12;a<=12;a++)for(let b=-5;b<=4;b++){ if((a*a)/144+(b*b)/25<1) set(cx+a,cy+b,0);} for(let a=-12;a<=12;a++){ for(let b=4;b<8;b++) if(get(cx+a,cy+b)===0) set(cx+a,cy+b,3);} for(let j=0;j<6;j++) set(cx+ri(-10,10),cy+4,39);
    feat.lairs.push({x:cx,y:cy+4}); ents.push({k:'mob',t:['doppelkopf','armige','spinnenfrau'][k],x:cx,y:cy+3,sleep:true});
    set(cx-6,cy+3,21); set(cx+6,cy+3,21); }
  // Pilz-Biom (blau leuchtend)
  { const mx=ri(150,W-200), my=ri(125,150); feat.shroom={x0:mx-35,x1:mx+35,y:my};
    for(let k=0;k<5;k++){ let cx2=mx-30+k*12, cy2=my+ri(-8,8); for(let j=0;j<20;j++){ carve(cx2,cy2,2.4); cx2+=1.2; cy2+=(R()-0.5)*1.5; } }
    for(let x=mx-38;x<mx+38;x++) for(let y=my-22;y<my+24;y++){ const t=get(x,y); if(t===3||t===1||t===46||t===14||t===16) { set(x,y,56); setbg(x,y,5); } }
    for(let x=mx-38;x<mx+38;x++) for(let y=my-22;y<my+24;y++){ if(get(x,y)===56&&get(x,y-1)===0){ set(x,y,54); if(R()<0.3&&get(x,y-2)===0) set(x,y-1,55); } } }
  // Tropfsteine und Ranken
  for(let x=4;x<W-4;x++) for(let y=hs[x]+6;y<H-6;y++){ const t=get(x,y); if(t!==0) continue; const up=get(x,y-1);
    if((up===3||up===56)&&get(x,y+1)===0&&get(x,y+2)===0){ const r=R(); if(r<0.07) set(x,y,52); else if(r<0.1){ const L=ri(2,6); for(let k=0;k<L&&get(x,y+k)===0;k++) set(x,y+k,53); } } }
  // Boden unten
  for(let i=0;i<W;i++) for(let y=H-3;y<H;y++) set(i,y,17);
  for(let y=0;y<H;y++){ for(let i=0;i<3;i++){ set(i,y,17); set(W-1-i,y,17);} }
  // ---- See ----
  if(feat.lake){ const L=feat.lake; for(let i=L.x0+12;i<L.x1-12;i++){ for(let y=L.lv;y<hs[i];y++){ set(i,y,5); setbg(i,y,0);} for(let y=hs[i];y<hs[i]+3;y++) if(get(i,y)!==0) set(i,y,4); }
    // Ufer sand
    for(let i=L.x0-4;i<L.x1+4;i++){ if(get(i,hs[i])===2) set(i,hs[i],4); } }
  // ---- Bäume, Büsche ----
  const tree=(tx)=>{ const h=hs[tx]; if(get(tx,h)!==2||get(tx,h-1)!==0) return; const r=R(); const kind=r<0.58?7:r<0.72?51:r<0.86?50:49;
    if(kind===51){ const th=ri(7,11); for(let y=1;y<=th;y++) set(tx,h-y,6); const top=h-th-1; for(let k=0;k<th-2;k++){ const hw=Math.min(3,1+Math.floor(k/3)) - (k%3===0&&k>2?1:0); for(let a=-hw;a<=hw;a++){ if(a===0&&k>0) continue; if(get(tx+a,top+k)===0) set(tx+a,top+k,51);} } set(tx,top,51); set(tx,top-1,51); return; }
    const th=ri(5,9); for(let y=1;y<=th;y++) set(tx,h-y,6); const top=h-th; const rr=ri(2,3);
    for(let a=-rr-1;a<=rr+1;a++)for(let b=-rr-1;b<=rr;b++){ if(a*a+b*b*1.4<=(rr+1)*(rr+1)&&get(tx+a,top+b)===0) set(tx+a,top+b,kind);} set(tx,top,6);
    // seitliche Astbüschel
    for(let y=top+rr+2;y<h-2;y++){ if(R()<0.22){ const sd=R()<0.5?-1:1; if(get(tx+sd,y)===0) set(tx+sd,y,kind); y+=2; } } };
  for(const s of segs){ if(!s.type.startsWith('wald')&&s.type!=='kann'&&s.type!=='see') continue;
    let tx=s.x0+ri(1,4); while(tx<s.x1-2){ if(s.type==='see'&&feat.lake&&tx>feat.lake.x0+3&&tx<feat.lake.x1-3){ tx+=3; continue; } const r=R(); const h=hs[tx];
      if(r<0.55) tree(tx); else if(r<0.7){ if(get(tx,h-1)===0) set(tx,h-1,31);} else if(r<0.85){ if(get(tx,h-1)===0) set(tx,h-1,35);} else if(get(tx,h-1)===0) set(tx,h-1,36);
      tx+=ri(3,6); } }
  // ---- Strukturhilfen ----
  const flatten=(x0,x1,lv)=>{ for(let i=x0;i<=x1;i++){ for(let y=lv-30;y<lv;y++){ if(get(i,y)!==17){ set(i,y,0); setbg(i,y,0);} } for(let y=lv;y<lv+4;y++){ if(get(i,y)===0||get(i,y)===5||get(i,y)===6||get(i,y)===7) set(i,y,y===lv?2:1);} } };
  const box=(x0,y0,x1,y1,t)=>{ for(let i=x0;i<=x1;i++)for(let y=y0;y<=y1;y++) set(i,y,t); };
  const door=(dx,gy)=>{ set(dx,gy-1,19); set(dx,gy-2,19); set(dx,gy-3,19); };
  const npcAt=(id,x,y)=>ents.push({k:'npc',t:id,x,y});
  // ---- Haus ----
  const house=(hx,opts)=>{ opts=opts||{}; const w=opts.w||ri(9,13); const fl=opts.fl||ri(1,2); const gy=hs[hx+(w>>1)]; flatten(hx-1,hx+w,gy);
    const brick=R()<0.5; const wt=brick?10:8, wb=brick?3:2; const fh=6; const top=gy-fl*fh;
    for(let f=0;f<fl;f++){ const fy=gy-f*fh; // Boden fy
      for(let i=hx;i<hx+w;i++){ for(let y=fy-fh+1;y<fy;y++){ set(i,y,0); setbg(i,y,R()<0.92?(f%2?6:wb):0);} set(i,fy-fh,wt); }
      for(let y=fy-fh;y<fy;y++){ set(hx,y,wt); set(hx+w-1,y,wt);} // Wände
      if(f>0){ set(hx+2,fy,0); set(hx+3,fy,32); } // Treppenloch
    }
    for(let f=1;f<fl;f++){ const fy=gy-f*fh; for(let y=fy;y<fy+fh;y++) if(get(hx+2,y)===0) set(hx+2,y,18); set(hx+2,fy,18);} 
    // Fenster
    for(let f=0;f<fl;f++){ const fy=gy-f*fh; if(R()<0.8){ set(hx,fy-3,R()<0.5?12:0); } if(R()<0.8) set(hx+w-1,fy-3,R()<0.4?0:12); }
    // Dach (Giebel)
    for(let k=0;k<=Math.ceil(w/2);k++){ for(let i=hx-1+k;i<=hx+w-k;i++) set(i,top-k,brick?10:8); }
    door(hx,gy); door(hx+w-1,gy);
    // Einrichtung
    for(let f=0;f<fl;f++){ const fy=gy-f*fh-1; const c=ri(hx+4,hx+w-3); set(c,fy,R()<0.3?43:29); if(R()<0.5) set(hx+w-3,fy,R()<0.5?28:29); if(R()<0.35) set(hx+5,fy,42); if(f==0&&R()<0.3) set(hx+w-2,fy,21);
      if(R()<0.6&&!opts.npc) ents.push({k:'mob',t:ZOMBIE_NAMES[ri(0,4)],x:hx+w/2,y:fy,sleep:true}); }
    if(opts.npc) npcAt(opts.npc,hx+w/2|0,gy-1);
    feat.houses.push({x0:hx,x1:hx+w,y:gy});
    return gy; };
  // ---- Hochhaus ----
  let stashDone=false;
  const tower=(hx,w,floors,gy,opts)=>{ opts=opts||{}; const fh=6; const top=gy-floors*fh;
    for(let i=hx;i<hx+w;i++){ for(let y=top;y<gy;y++){ set(i,y,0); setbg(i,y,4);} }
    for(let f=0;f<=floors;f++){ const fy=gy-f*fh; for(let i=hx;i<hx+w;i++) set(i,fy,11); }
    for(let y=top;y<gy;y++){ set(hx,y,11); set(hx+w-1,y,11);} 
    for(let f=0;f<floors;f++){ const fy=gy-f*fh; // Fenster
      for(const wx of [hx,hx+w-1]){ set(wx,fy-3,12); set(wx,fy-4,12);} 
      // Treppenhaus
      const sx=(f%2)?hx+2:hx+w-3; set(sx,fy-fh,0); for(let y=fy-fh;y<fy;y++) set(sx,y,18);
      const sxp=(f%2)?hx+3:hx+w-4; if(get(sxp,fy-fh)===11) set(sxp,fy-fh,32);
      // Möbel & Beute
      const n=ri(1,3); for(let j=0;j<n;j++){ const lx=ri(hx+4,hx+w-5); if(get(lx,fy-1)===0) set(lx,fy-1,[29,42,43,42][ri(0,3)]); }
      if(R()<0.25){ for(let y=fy-fh+1;y<fy;y++) setbg(hx+(w>>1),y,6); }
      if(f>0&&R()<0.7) ents.push({k:'mob',t:ZOMBIE_NAMES[ri(0,12)],x:hx+ri(4,w-5),y:fy-1,sleep:true});
      if(R()<0.3) set(hx+ri(3,w-4),fy-3,21);
    }
    door(hx,gy); door(hx+w-1,gy);
    // Dach
    set(hx+(w>>1),top-1,29); for(let i=hx;i<hx+w;i+=3) set(i,top-1,i===hx||i>=hx+w-3?0:0);
    feat.towers.push({x0:hx,x1:hx+w,top,gy,floors});
    if(opts.npc) npcAt(opts.npc,hx+(w>>1)+2,gy-(opts.npcFloor||0)*fh-1);
    if(opts.roofNpc){ npcAt(opts.roofNpc,hx+(w>>1)-2,top-1); set(hx+2,top-1,22); }
    // Geheimlager
    if(opts.stash&&!stashDone){ stashDone=true; const f=ri(2,floors-2); const fy=gy-f*fh; const sx0=hx+w-9, sx1=hx+w-2;
      // Raum abtrennen mit Beton, Zugang nur durch Durchbrechen
      for(let y=fy-fh+1;y<fy;y++){ set(sx0,y,11); for(let i=sx0+1;i<=sx1;i++){ if(get(i,y)!==11) set(i,y,0); setbg(i,y,5);} }
      for(let i=sx0;i<=sx1;i++){ set(i,fy-fh,11); set(i,fy,11);} 
      set(hx+w-1,fy-3,11); set(hx+w-1,fy-4,11); // keine Fenster
      set(sx0+2,fy-1,38); set(sx0+4,fy-1,38); set(sx0+6,fy-1,29); set(sx0+3,fy-3,21);
      feat.stash={x:sx0+3,y:fy-1,floor:f,tower:feat.towers.length-1};
    }
  };
  // ---- Absturzstelle ----
  const s0=segs[0]; const cx=Math.round((s0.x0+s0.x1)/2); const cgy=hs[cx];
  flatten(cx-14,cx+14,cgy);
  for(let i=cx-14;i<=cx+14;i++){ for(let y=cgy-12;y<cgy;y++){ set(i,y,0); setbg(i,y,0);} set(i,cgy,2); }
  const fy=cgy; // Rumpf liegt auf dem Boden
  for(let i=cx-9;i<=cx+7;i++){ set(i,fy-5,30); set(i,fy,30); }
  for(let i=cx-8;i<=cx+6;i++){ if((i-cx)%3===0) set(i,fy-4,12); }
  for(let y=fy-5;y<=fy;y++) set(cx-9,y,30);
  for(let y=fy-5;y<=fy-4;y++) set(cx+7,y,30); // vorne aufgerissen (Ausgang)
  set(cx+8,fy-4,12);
  for(let i=cx-8;i<=cx+6;i++) for(let y=fy-4;y<fy;y++){ setbg(i,y,4); if(get(i,y)!==12) set(i,y,0);} 
  for(let i=cx-8;i<=cx+6;i++) if((i-cx)%3===0) set(i,fy-4,12);
  set(cx-7,fy-1,29); set(cx-3,fy-1,29); set(cx+3,fy-1,22);
  // Heck mit Leitwerk
  for(let k=0;k<4;k++){ set(cx-10-k,fy-5-k,30); set(cx-10-k,fy-4-k,30); }
  set(cx-10,fy-1,30); set(cx-11,fy-1,30); set(cx-12,fy-1,34);
  // Flügelteile
  for(let i=cx+10;i<=cx+13;i++) set(i,fy-1,30); set(cx+12,fy-2,30); set(cx-2,fy-6,34); set(cx+1,fy-6,34);
  ents.push({k:'crash',x:cx-1,y:fy-1});
  const spawn={x:cx,y:fy-1};
  // Wrack-Beute markieren
  feat.wreck={x:cx-7,y:fy-1};
  // ---- Abschnitte füllen ----
  let npcPool=['kalle','mecki'];
  for(const s of segs){
    if(s.type==='wald_haus'){ let hx=s.x0+8; let k=0; while(hx<s.x1-20){ house(hx,{npc:k<2?npcPool[k]:null}); k++; hx+=ri(30,45);} }
    if(s.type==='see'){ house(s.x0+1,{w:9,fl:1,npc:'gerda'}); }
    if(s.type==='camp'){ const gy=hs[s.x0+30]; const a=s.x0+8,b=s.x1-8; flatten(a-2,b+2,gy);
      for(let y=gy-5;y<gy;y++){ set(a,y,8); set(b,y,8);} door(a,gy); door(b,gy); set(a,gy-4,8); set(b,gy-4,8);
      for(let i=a;i<=b;i+=2) set(i,gy-6,R()<0.5?27:0);
      // Zelte
      for(const tx of [a+6,b-14]){ for(let k=0;k<5;k++){ for(let i=tx+k;i<tx+10-k;i++) setbg(i,gy-1-k,7); } }
      set(Math.round((a+b)/2),gy-1,22); set(a+10,gy-1,44); set(b-5,gy-1,44); set(a+3,gy-1,21); set(b-3,gy-1,21); set(b-8,gy-1,28);
      const camp={x0:a,x1:b,y:gy,id:feat.camps.length,name:['Sumpfbrüder-Lager','Lager der Schrottkönige'][feat.camps.length]||'Lager'}; feat.camps.push(camp);
      for(let k=0;k<ri(4,5);k++) ents.push({k:'mob',t:R()<0.55?'hinterwaeldler':'schlaeger',x:ri(a+3,b-3),y:gy-1,camp:camp.id});
      ents.push({k:'mob',t:'saegesepp',x:Math.round((a+b)/2)+3,y:gy-1,camp:camp.id});
    }
    if(s.type==='kann'){ const c=Math.round((s.x0+s.x1)/2); const gy=hs[c]; flatten(c-24,c+24,gy); feat.cann={x0:c-26,x1:c+26,y:gy};
      for(const hx of [c-20,c-4,c+12]){ // Hütte aus Stämmen und Blättern
        for(let y=gy-5;y<gy;y++){ set(hx,y,6); set(hx+8,y,6);} for(let k=0;k<4;k++) for(let i=hx-1+k;i<=hx+9-k;i++) set(i,gy-6-k,7);
        for(let i=hx+1;i<hx+8;i++) for(let y=gy-5;y<gy;y++) setbg(i,y,7); set(hx+4,gy-1,39); }
      set(c-8,gy-1,45); set(c+8,gy-1,45); set(c+2,gy-1,22); set(c-14,gy-1,48); set(c+20,gy-1,39); set(c-24,gy-1,45);
      for(let k=0;k<5;k++) ents.push({k:'mob',t:'kannibale',x:c+ri(-20,20),y:gy-1});
    }
    if(s.type==='stadt'){ const gy=hs[s.x0+5]; flatten(s.x0,s.x1,gy); feat.city={x0:s.x0,x1:s.x1,y:gy};
      for(let i=s.x0;i<s.x1;i++){ set(i,gy,33); set(i,gy+1,11);} 
      let hx=s.x0+6; let n=0; const plan=[]; while(hx<s.x1-26){ const w=ri(14,22); plan.push({hx,w}); hx+=w+ri(5,10); }
      const stashI=ri(1,Math.max(1,plan.length-2)); let kioskI=ri(0,plan.length-1); if(kioskI===stashI) kioskI=stashI===0?1:0;
      const npcT=['brems','willi','rudi']; let ni=0;
      plan.forEach((p,i)=>{
        if(i===kioskI){ // Kiosk (kleiner Laden)
          const w=11; for(let a=p.hx;a<p.hx+w;a++){ for(let y=gy-6;y<gy;y++){ set(a,y,0); setbg(a,y,6);} set(a,gy-6,10);} for(let y=gy-6;y<gy;y++){ set(p.hx,y,10); set(p.hx+w-1,y,10);} door(p.hx,gy); door(p.hx+w-1,gy); set(p.hx+3,gy-3,12); set(p.hx+3,gy-4,12);
          for(let a=p.hx+2;a<p.hx+w-2;a++) set(a,gy-7,R()<0.5?10:0); set(p.hx+7,gy-1,43); set(p.hx+5,gy-1,21);
          npcAt('uschi',p.hx+5,gy-1); return; }
        const floors=ri(5,9);
        const opts={stash:i===stashI};
        if(ni<npcT.length&&i!==stashI&&R()<0.7){ opts.npc=npcT[ni++]; opts.npcFloor=ri(1,Math.min(3,floors-1)); }
        if(i===plan.length-1||(!feat.funker&&floors>=7)){ if(!feat.funker){ opts.roofNpc='funker'; feat.funker=true; } }
        tower(p.hx,p.w,floors,gy,opts);
      });
      while(ni<npcT.length){ const p=plan[ni]; npcAt(npcT[ni],p.hx-2,gy-1); ni++; }
      if(!feat.funker) npcAt('funker',s.x1-10,gy-1);
      // Autowracks auf der Straße
      for(let k=0;k<6;k++){ const ax=ri(s.x0+3,s.x1-8); if(get(ax,gy-1)!==0||get(ax+4,gy-1)!==0) continue; for(let i=ax;i<ax+5;i++) set(i,gy-1,13); set(ax+1,gy-2,13); set(ax+2,gy-2,12); set(ax+3,gy-2,13); }
      for(let k=0;k<20;k++){ const ax=ri(s.x0,s.x1); if(get(ax,gy-1)===0) set(ax,gy-1,34); }
      // Zombies auf der Straße
      for(let k=0;k<8;k++) ents.push({k:'mob',t:ZOMBIE_NAMES[ri(0,12)],x:ri(s.x0,s.x1),y:gy-1,sleep:R()<0.5});
    }
  }
  // Fehlende NPCs irgendwo im Wald
  for(const id of ['kalle','gerda','mecki','doris']){ if(!ents.find(e=>e.k==='npc'&&e.t===id)){ const s=segs.find(s=>s.type.startsWith('wald')&&s!==segs[0])||segs[segs.length-1]; const hx=ri(s.x0+5,Math.max(s.x0+6,s.x1-20)); house(hx,{npc:id,fl:1}); } }
  // Tiere
  for(let k=0;k<35;k++){ const s=segs[ri(0,segs.length-1)]; if(s.type==='stadt') continue; const ax=ri(s.x0,s.x1-1); ents.push({k:'mob',t:['hase','hase','hirsch','huhn'][ri(0,3)],x:ax,y:hs[ax]-1}); }
  // Spiegeln (Welt mal links, mal rechts)
  const flip=R()<0.5;
  if(flip){ const fx=v=>W-1-v; for(let y=0;y<H;y++){ const a=tiles.subarray(y*W,(y+1)*W); a.reverse(); const b=bg.subarray(y*W,(y+1)*W); b.reverse(); }
    for(const e of ents) e.x=fx(e.x); spawn.x=fx(spawn.x);
    const fr=o=>{ if(!o) return; if(o.x0!=null){ const a=fx(o.x1),b=fx(o.x0); o.x0=a; o.x1=b; } if(o.x!=null) o.x=fx(o.x); };
    feat.camps.forEach(fr); feat.houses.forEach(fr); feat.towers.forEach(fr); fr(feat.cann); fr(feat.city); fr(feat.lake); fr(feat.stash); fr(feat.wreck); feat.lairs.forEach(fr);
  }
  return {W,H,tiles,bg,seed,spawn,feat,ents,segs:segs.map(s=>s.type)};
}
