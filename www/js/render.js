// Lifetime – Figuren & Effekte zeichnen
'use strict';
function drawEnt(e,ox,oy){ const x=e.x+e.w/2+ox, y=e.y+e.h+oy; const dir=e.dir||1; const flash=e.hurtT>0;
  if(e.kind==='npc'){ const d=NPCS[e.t]; const held=e.attackT>0?(d.ranged?'pistole':'machete'):null; const an=drawSprite(ctx,e.t,frameFor(e,false),x,y,dir,{held,flash});
    const top=y-(an.ay-an.top)-4; if(e.down){ ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(x-8,top,16,3); }
    if(e.recruited){ ctx.fillStyle='#000'; ctx.fillRect(x-2,top-4,5,5); ctx.fillStyle='#69f0ae'; ctx.fillRect(x-1,top-3,3,3); } else { ctx.fillStyle='#000'; ctx.fillRect(x-2,top-8,4,8); ctx.fillStyle='#ffd54f'; ctx.fillRect(x-1,top-7,2,4); ctx.fillRect(x-1,top-2,2,1);} return; }
  const d=MOBS[e.t]; if(!d) return;
  let held=null; if(d.gang) held=d.chainsaw?'kettensaege':d.gun?'schrotflinte':'machete'; if(d.cann) held=e.wpn||'speer';
  const fr=e.sleep?'i':frameFor(e,false);
  const an=drawSprite(ctx,e.look||e.t,e.vomitT>0?'a2':fr,x,y,dir,{held,flash,rad:e.rad,alpha:e.sleep?0.9:null,tilt:e.stagger>0?-0.28*(e.stagger/(e.stagT||0.28)):(MOBS[e.t].zombie&&!MOBS[e.t].fly?Math.sin(G.clock*2+e.x*0.1)*0.04:0)});
  const top=y-(an.ay-an.top);
  if(e.rad){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=0.35+Math.sin(G.clock*6)*0.1; ctx.drawImage(LOOK.glow.blue,x-20,y-e.h/2-20-6,40,40); ctx.restore(); }
  if(d.cann&&e.watch&&G.cannAngry<=0){ ctx.fillStyle='#000'; ctx.fillRect(x-2,top-10,4,8); ctx.fillStyle='#fff'; ctx.fillRect(x-1,top-9,2,4); ctx.fillRect(x-1,top-4,2,1); }
  if(e.sleep){ ctx.fillStyle='#cfd8dc'; ctx.font='7px monospace'; ctx.fillText('z',x+4,top-2+Math.sin(G.clock*2)*2); ctx.fillText('z',x+8,top-7+Math.sin(G.clock*2+1)*2); }
}
function drawDog(x,y,dir,w,c){ const l=Math.sin(w*1.4)*2; px(ctx,c,x-8,y-10,15,6); px(ctx,c,x+(dir>0?5:-11),y-14,6,6); px(ctx,'#c22',x+(dir>0?8:-9),y-12,2,1); px(ctx,shade(c,0.7),x-7+l,y-4,2,4); px(ctx,shade(c,0.7),x+4-l,y-4,2,4); px(ctx,c,x+(dir>0?-10:8),y-11,3,2); px(ctx,'#8a0000',x-2,y-9,3,2); }
function drawBird(x,y,dir,w,c,s){ const f=Math.sin(w)*4*s; px(ctx,c,x-4*s,y-6*s,9*s,4*s); px(ctx,'#c9a',x+(dir>0?4:-6)*s,y-8*s,3*s,3*s); px(ctx,'#da3',x+(dir>0?7:-8)*s,y-7*s,2*s,1*s); px(ctx,shade(c,1.3),x-8*s,y-6*s-f,8*s,2*s); px(ctx,shade(c,1.3),x+1*s,y-6*s-f,8*s,2*s); }
function drawAnimal(e,x,y,dir,d){ const c=d.col, w=Math.sin(e.walk*1.5)*2;
  if(e.t==='hase'){ px(ctx,c,x-5,y-6,9,5); px(ctx,c,x+(dir>0?2:-6),y-9,4,4); px(ctx,c,x+(dir>0?3:-5),y-13,1,4); px(ctx,c,x+(dir>0?5:-3),y-13,1,4); px(ctx,'#fff',x+(dir>0?-6:4),y-6,2,2); px(ctx,'#111',x+(dir>0?4:-5),y-8,1,1); }
  else if(e.t==='huhn'){ px(ctx,c,x-4,y-7,8,5); px(ctx,c,x+(dir>0?2:-5),y-10,3,4); px(ctx,'#e33',x+(dir>0?3:-4),y-11,2,1); px(ctx,'#fa0',x+(dir>0?5:-6),y-9,2,1); px(ctx,'#fa0',x-1+w/2,y-2,1,2); }
  else { px(ctx,c,x-10,y-15,19,7); px(ctx,c,x+(dir>0?7:-13),y-21,6,8); px(ctx,shade(c,0.6),x+(dir>0?8:-12),y-25,1,4); px(ctx,shade(c,0.6),x+(dir>0?11:-9),y-25,1,4); for(const lx of [-9,-6,4,7]) px(ctx,shade(c,0.8),x+lx+(lx<0?w:-w),y-8,2,8); px(ctx,'#fff',x+(dir>0?-11:10),y-14,2,2); }
}
function drawMutant(e,x,y,dir,d){ const c=d.col, ph=Math.sin(e.walk)*3; const H=d.h;
  if(e.t==='doppelkopf'){ px(ctx,c,x-6,y-12,4,12); px(ctx,c,x+2,y-12,4,12); px(ctx,c,x-8,y-24,16,13); px(ctx,c,x-9,y-31,8,7); px(ctx,c,x+1,y-31,8,7); px(ctx,'#300',x-7,y-28,2,1); px(ctx,'#300',x+5,y-28,2,1); px(ctx,shade(c,0.8),x-12,y-23+ph,4,12); px(ctx,shade(c,0.8),x+8,y-23-ph,4,12); px(ctx,'#8a0000',x-3,y-20,6,3); }
  else if(e.t==='armige'){ px(ctx,c,x-7,y-14,5,14); px(ctx,c,x+2,y-14,5,14); px(ctx,c,x-10,y-30,20,17); px(ctx,c,x-4,y-36,8,7); px(ctx,'#300',x+(dir>0?1:-3),y-33,2,1); for(let i=0;i<3;i++){ px(ctx,shade(c,0.85),x-16-i*2,y-29+i*5+ph,6,3); px(ctx,shade(c,0.85),x+10+i*2,y-29+i*5-ph,6,3);} px(ctx,shade(c,0.7),x-20,y-12+ph,5,6); px(ctx,shade(c,0.7),x+15,y-12-ph,5,6); }
  else { for(let i=0;i<4;i++){ const a=Math.sin(e.walk+i)*3; px(ctx,c,x-12+i*7,y-10+a,2,10); px(ctx,c,x-14+i*7,y-12,6,2);} px(ctx,c,x-7,y-18,14,8); px(ctx,c,x-4,y-24,8,7); px(ctx,'#2a1a0a',x-5,y-25,10,4); px(ctx,'#300',x-2,y-21,1,1); px(ctx,'#300',x+1,y-21,1,1); }
}
function drawBoss(e,x,y,dir,d){
  if(e.t==='fleischberg'){ const s=Math.sin(G.clock*4)*2; const c=d.col; const w=e.w, h=e.h; px(ctx,shade(c,0.8),x-w/2,y-h*0.8+s,w,h*0.8-s); px(ctx,c,x-w/2+4,y-h+s,w-8,h*0.3); px(ctx,shade(c,1.15),x-w/2+8,y-h*0.7,14,10); px(ctx,shade(c,1.15),x+6,y-h*0.5,18,8);
    for(let i=0;i<5;i++) px(ctx,'#300',x-25+i*12,y-h*0.55,4,3+(i%2)*2); px(ctx,'#fff59d',x-14,y-h*0.75,5,5); px(ctx,'#fff59d',x+9,y-h*0.75,5,5); px(ctx,'#300',x-12+dir,y-h*0.73,2,2); px(ctx,'#300',x+11+dir,y-h*0.73,2,2);
    px(ctx,'#4a0000',x-18,y-h*0.42,36,7); for(let i=0;i<6;i++) px(ctx,'#eee',x-16+i*6,y-h*0.42,3,3); px(ctx,shade(c,0.7),x-w/2-6,y-20,10,20); px(ctx,shade(c,0.7),x+w/2-4,y-20,10,20); }
  else { const c=d.col; const f=Math.sin(e.walk)*10; drawBird(x,y-6,dir,e.walk,c,4);
    px(ctx,'#ffd54f',x-6,y-44,12,4); px(ctx,'#ffd54f',x-6,y-48,2,4); px(ctx,'#ffd54f',x-1,y-49,2,5); px(ctx,'#ffd54f',x+4,y-48,2,4); px(ctx,'#f00',x+(dir>0?14:-17),y-31,3,2); }
}
function drawPlayer(ox,oy){ const P=G.player; if(P.dead) return; const a=armorStats(); const x=P.x+P.w/2+ox, y=P.y+P.h+oy;
  if(P.inv_t>0&&((G.clock*20)|0)%2) return;
  if(a.wings){ const f=Math.sin(G.clock*(P.onGround?2:14))*3; const bx=x-(P.dir>0?10:-2); px(ctx,'#2a2018',bx-1,y-34-f,10,14); px(ctx,'#7a6a5a',bx,y-33-f,8,12); px(ctx,'#9a8a7a',bx,y-33-f,8,2); }
  const fr=frameFor(P,true); const it=heldItem(); const show=it&&(P.attackT>0||it==='fackel'||(ITEMS[it]&&(ITEMS[it].type==='tool'||ITEMS[it].type==='weapon'||ITEMS[it].type==='gun'||ITEMS[it].type==='bow')));
  const body=a.best.body, head=a.best.head; const lk='player|'+(body?body.id:'')+'|'+(head?head.id:'');
  if(!LOOKS[lk]){ const L=Object.assign({},LOOKS.player); if(body){ L.shirt=body.col; L.shirtStyle=body.id==='polizeiweste'?'vest':'jacket'; } if(head){ if(head.id==='helm'){ L.hat='helmet'; L.hatCol=head.col; } else { L.hat='beanie'; L.hatCol=head.col; } } LOOKS[lk]=L; }
  drawSprite(ctx,lk,fr,x,y,P.dir,{held:show?it:null,flash:P.hurtT>0});
}
function drawDrops(ox,oy){ for(const d of G.drops){ const ic=GFX.icons[d.id]; if(ic) ctx.drawImage(ic,Math.round(d.x+ox),Math.round(d.y+oy+Math.sin(G.clock*4+d.x)*1),8,8); } }
function drawProj(ox,oy){ for(const p of G.proj){ const x=p.x+ox,y=p.y+oy; if(p.type==='bullet'){ ctx.fillStyle='#ffeb3b'; ctx.fillRect(x-1,y-1,3,2);} else if(p.type==='arrow'){ ctx.strokeStyle='#ddd'; ctx.beginPath(); const L=Math.hypot(p.vx,p.vy)||1; ctx.moveTo(x,y); ctx.lineTo(x-p.vx/L*8,y-p.vy/L*8); ctx.stroke(); } else if(p.type==='acid'){ ctx.fillStyle='#9c3'; ctx.fillRect(x-2,y-2,4,4);} else if(p.type==='egg'){ ctx.fillStyle='#eee'; ctx.fillRect(x-3,y-4,6,7);} else { const ic=GFX.icons[p.type]; if(ic) ctx.drawImage(ic,x-5,y-5,10,10);} } }
function drawParts(ox,oy){ for(const p of G.parts){ ctx.globalAlpha=Math.min(1,p.life*2); ctx.fillStyle=p.col; ctx.fillRect(Math.round(p.x+ox),Math.round(p.y+oy),p.sz||1,p.sz||1);} ctx.globalAlpha=1; }
function drawNums(ox,oy){ ctx.font='bold 8px monospace'; ctx.textAlign='center'; for(const n of G.nums){ ctx.globalAlpha=Math.min(1,n.life*2); ctx.fillStyle='#000'; ctx.fillText(n.t,n.x+ox+1,n.y+oy+1); ctx.fillStyle=n.col; ctx.fillText(n.t,n.x+ox,n.y+oy);} ctx.globalAlpha=1; ctx.textAlign='left'; }
function drawAim(ox,oy){ const P=G.player; const d=heldDef(); let t=null;
  if(INPUT.aim){ t={x:Math.floor(INPUT.aim.x/T),y:Math.floor(INPUT.aim.y/T)}; }
  else if(d.type==='block'||d.type==='wall') t=frontTile(true);
  else if(G.mineT) t=G.mineT;
  if(!t) return; ctx.strokeStyle=(d.type==='block'||d.type==='wall')?(canPlaceAt(t.x,t.y,heldItem())&&reachOK(t.x,t.y,6.5)?'rgba(120,255,120,0.8)':'rgba(255,90,90,0.7)'):'rgba(255,255,255,0.6)'; ctx.strokeRect(t.x*T+ox+0.5,t.y*T+oy+0.5,T-1,T-1); }
function render(){ ctx.imageSmoothingEnabled=false; const sh=G.cam.shake; const sx=sh?(Math.random()-0.5)*sh:0, sy=sh?(Math.random()-0.5)*sh:0;
  ctx.save(); ctx.translate(Math.round(sx),Math.round(sy)); drawBackground(); const v=drawWorld(); const ox=v.ox, oy=v.oy;
  for(const e of G.ents){ if(e.dead) continue; if(e.x+ox<-80||e.x+ox>G.VW+80||e.y+oy<-80||e.y+oy>G.VH+80) continue; drawEnt(e,ox,oy); }
  drawPlayer(ox,oy); drawDrops(ox,oy); drawProj(ox,oy); drawParts(ox,oy);
  drawLight(v); drawAim(ox,oy); UI.floats(ox+Math.round(sx),oy+Math.round(sy));
  // Unterwasser / Kälte-Vignette
  const P=G.player; if(inWater(P,true)){ ctx.fillStyle='rgba(30,90,170,0.25)'; ctx.fillRect(0,0,G.VW,G.VH); }
  if(P.warm<25){ ctx.fillStyle=`rgba(180,220,255,${(25-P.warm)/25*0.25})`; ctx.fillRect(0,0,G.VW,G.VH); }
  if(P.hp<maxHp()*0.25){ ctx.fillStyle=`rgba(160,0,0,${0.15+Math.sin(G.clock*5)*0.08})`; ctx.fillRect(0,0,G.VW,G.VH); }
  ctx.restore();
}
