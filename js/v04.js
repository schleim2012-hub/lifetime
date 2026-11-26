// v04.js – Lifetime 0.4: Musik ohne Ruckeln, stabile Texte, KI-Grafiken, Ghule, Terraria-Kampf, Türen, Kometen, Möbel, Details
'use strict';
// ================= 1) Nachrichten: stabil, ohne Neuaufbau (kein Flackern) =================
UI.msgs=function(){ const box=$('msgs'); if(!box) return; const keep=new Set();
  for(const m of G.msgs){ if(!m.el){ m.el=document.createElement('div'); m.el.className='msg'; m.el.textContent=m.t; m.el.style.color=m.col; box.appendChild(m.el); } keep.add(m.el); const o=Math.min(1,m.life); if(m._o!==o){ m._o=o; m.el.style.opacity=o; } }
  for(const el of [...box.children]) if(!keep.has(el)) el.remove(); };
// ================= 2) Musik: WebAudio-Puffer, nahtlose Schleifen, weiche Übergänge =================
const MUSX={tr:{},bus:null};
function musBus(){ if(!MUSX.bus){ MUSX.bus=SND.ctx.createGain(); MUSX.bus.gain.value=SND.vol.mus; MUSX.bus.connect(SND.master); } return MUSX.bus; }
function loadMusic(file){ const c=SND.ctx; let tr=MUSX.tr[file]; if(tr) return tr; tr=MUSX.tr[file]={file,buf:null,g:null,src:null,ok:true,target:0,loading:true};
  SND.tracks[file]=tr; // für musicStep: Datei-Track vorhanden
  const fail=()=>{ tr.ok=false; tr.loading=false; };
  try{ const x=new XMLHttpRequest(); x.open('GET',file,true); x.responseType='arraybuffer';
    x.onload=()=>{ if(!x.response||x.response.byteLength<1000) return fail(); c.decodeAudioData(x.response,b=>{ tr.buf=b; tr.loading=false; if(tr.target>0) startMusic(tr,tr.fadeIn||2); },fail); };
    x.onerror=fail; x.send(); }catch(e){ fail(); }
  return tr; }
function startMusic(tr,fade){ const c=SND.ctx; if(!tr.buf) return; if(!tr.g){ tr.g=c.createGain(); tr.g.gain.value=0; tr.g.connect(musBus()); }
  if(!tr.src){ const s=c.createBufferSource(); s.buffer=tr.buf; s.loop=true; s.connect(tr.g); s.start(c.currentTime+0.05); tr.src=s; }
  rampMusic(tr,tr.target,fade); }
function rampMusic(tr,v,fade){ if(!tr.g) return; const c=SND.ctx, t=c.currentTime; const g=tr.g.gain; g.cancelScheduledValues(t); g.setValueAtTime(Math.max(0.0001,g.value),t); g.linearRampToValueAtTime(Math.max(0.0001,v),t+Math.max(0.05,fade));
  clearTimeout(tr.stopT); if(v<=0.001) tr.stopT=setTimeout(()=>{ if(tr.target<=0.001&&tr.src){ try{ tr.src.stop(); }catch(e){} tr.src.disconnect(); tr.src=null; } },(fade+20)*1000); }
const MUS_LVL={tag:0.8,nacht:0.8,titel:0.75,hoehle:0.7,kampf:0.5,blut:0.62,boss:0.62};
musicMode=function(m){ SND.wantMode=m; if(!SND.ctx||SND.mode===m) return; const prev=SND.mode; SND.mode=m; const M=MUS[m]; if(!M) return;
  const file=MUSIC_FILES[m]; SND.fileBase=!!file; const toFight=m==='kampf'||m==='boss'; const fromFight=prev==='kampf'||prev==='boss';
  const fadeIn=toFight?2.5:fromFight?3.5:3, fadeOut=toFight?2.5:fromFight?3.5:3;
  for(const k in MUSX.tr){ const tr=MUSX.tr[k]; if(k!==file){ tr.target=0; rampMusic(tr,0,fadeOut); } }
  if(file){ const tr=loadMusic(file); tr.target=MUS_LVL[m]||0.8; tr.fadeIn=fadeIn; if(tr.buf) startMusic(tr,fadeIn); }
  const stepDur=60/M.bpm/4; if(!SND.timer){ SND.next=SND.ctx.currentTime+0.1; SND.timer=setInterval(()=>{ const c=SND.ctx; if(!c) return; const M2=MUS[SND.mode]; if(!M2) return; const sd=60/M2.bpm/4; while(SND.next<c.currentTime+0.35){ try{ musicStep(M2,SND.step++,SND.next,sd); }catch(e){} SND.next+=sd; } },90); } };
fadeTracks=function(){};
musicStop=function(){ if(SND.timer) clearInterval(SND.timer); SND.timer=null; SND.mode=null; for(const k in MUSX.tr){ MUSX.tr[k].target=0; rampMusic(MUSX.tr[k],0,1); } };
const _setVol=setVol; setVol=function(k,v){ SND.vol[k]=v; if(!SND.ctx) return; if(k==='mus'){ if(MUSX.bus) MUSX.bus.gain.setTargetAtTime(v,SND.ctx.currentTime,0.1); SND.mus.gain.value=v*0.5; SND.musRev.gain.value=v*0.6; } else _setVol(k,v); };
// Kampf erkennen: nur echte Kämpfe, kurzes Nachhalten (≈5 s), dann Ausblenden
G.fightT=0;
function fightPing(){ G.fightT=5; }
// ================= 3) KI-Grafiken (Bildgenerator → Pixelraster) =================
const ARTI={icons:{},crea:{},furn:{},port:ART.port};
(function(){ const mk=u=>{ const i=new Image(); i.src=u; return i; };
  for(const k in ART.icons16) ARTI.icons[k]=mk(ART.icons16[k]);
  for(const k in ART.crea) ARTI.crea[k]=ART.crea[k].map(mk);
  for(const k in ART.furn) ARTI.furn[k]=mk(ART.furn[k]); })();
function artKey(id){ const d=ITEMS[id]; if(!d) return null; if(ART.icons[id]) return id; if(d.type==='book') return '_book'; return null; }
function applyArtIcons(){ for(const id in ITEMS){ const k=artKey(id); if(!k) continue; GFX.iconURL[id]=ART.icons[k]; const img=ARTI.icons[k]; const paint=()=>{ let c=GFX.icons[id]; if(!c){ c=mkCanvas(16,16); GFX.icons[id]=c; } const g=c.getContext('2d'); g.clearRect(0,0,16,16); g.imageSmoothingEnabled=false; g.drawImage(img,0,0); if(ITEMS[id].type==='book'){ g.globalCompositeOperation='source-atop'; g.fillStyle=ITEMS[id].col; g.globalAlpha=0.35; g.fillRect(0,0,16,16); g.globalAlpha=1; g.globalCompositeOperation='source-over'; } };
    if(img.complete&&img.naturalWidth) paint(); else img.addEventListener('load',()=>{ paint(); if(G.player&&UI.refreshHot) UI.refreshHot(); }); } }
const _buildIcons=buildIcons; buildIcons=function(){ _buildIcons(); applyArtIcons(); };
// Kreaturen-Sprites aus Bildern (2 Posen)
const _getSprite=getSprite;
getSprite=function(id,fr,rad){ const A=ARTI.crea[id]; if(A&&A[0].complete&&A[0].naturalWidth&&A[1].complete){ const key='art|'+id+'|'+fr; let s=SPR.cache.get(key); if(s) return s;
    const pose=(fr==='j'||fr[0]==='a')?1:(fr[0]==='w'?((parseInt(fr.slice(1))>>1)&1):0); const img=A[pose]; const c=mkCanvas(img.naturalWidth,img.naturalHeight); const g=c.getContext('2d'); g.drawImage(img,0,0);
    s={cv:c,w:c.width,h:c.height,hand:null}; if(fr==='i'){ s.anc={ax:Math.round(c.width/2),ay:c.height-1,top:0}; } SPR.cache.set(key,s); return s; }
  return _getSprite(id,fr,rad); };
const _spriteAnchor=spriteAnchor; spriteAnchor=function(id,rad){ if(ARTI.crea[id]){ const s=getSprite(id,'i',rad); if(s.anc) return s.anc; } return _spriteAnchor(id,rad); };
// ================= 4) Ghule statt Kannibalen =================
MOBS.kannibale.n='Ghul';
Object.assign(LOOKS,{
 ghul_m:{ghoul:true,skin:'#a07a62',hair:'#3a3026',hairStyle:'strands',shirt:'#4c5038',shirtStyle:'jacket',shirt2:'#33362a',pants:'#323846',shoes:'#1e1a16',belt:true,hood:'#2e2c26',grime:true,torn:true},
 ghul_f:{ghoul:true,skin:'#a88068',hair:'#4a3a2a',hairStyle:'strands',shirt:'#6a3028',shirtStyle:'vest',shirt2:'#4a221c',pants:'#3a3a3c',shoes:'#1e1a16',belt:true,bone:true,grime:true,torn:true},
 ghul_boss:{ghoul:true,skin:'#94705a',hair:null,hairStyle:'bald',shirt:'#2e2a24',shirtStyle:'coat',shirt2:'#5a4a36',pants:'#26241f',shoes:'#141210',belt:true,bone:true,scarf:'#6a2a1a',grime:true,torn:true,skullmask:true}});
const GHUL_LINES={watch:['Frisch. Riecht nach Angst und Deo.','Bleib stehen, Glatthaut.','Wir waren auch mal hübsch, weißt du?','Noch ein Schritt und du bist Abendbrot.','Ich zähl deine Finger. Zehn. Noch.'],
 angry:['Holt ihn!','Fleisch auf zwei Beinen!','Für den Kochtopf!','Umzingeln, nicht verlieren!'],flee:['Zurück! Zurück!','Nicht ins Gesicht!','Das reicht für heute…']};
function bubble(e,t,col){ G.bubbles=G.bubbles||[]; const ex=G.bubbles.find(b=>b.e===e); if(ex){ ex.t=t; ex.life=4.5; ex.col=col; if(ex.el) ex.el.textContent=t; return; } G.bubbles.push({e,t,life:4.5,col:col||'#f3e6d0'}); }
const _updateMob4=updateMob;
updateMob=function(e,dt){ const d=MOBS[e.t]; if(d&&d.cann){ if(!e.look){ e.look=Math.random()<0.4?'ghul_f':(Math.random()<0.12?'ghul_boss':'ghul_m'); e.wpn=['hackebeil','knueppel','speer','eisenrohr'][Math.random()*4|0]; } e.talkT=(e.talkT==null?2+Math.random()*6:e.talkT)-dt; const P=G.player; const dd=Math.abs(e.x-P.x);
    if(e.talkT<=0&&dd<14*T&&!e.dead&&!(G.bubbles||[]).some(b=>b.e!==e&&b.life>0.5&&Math.abs(b.e.x-e.x)<9*T)){ e.talkT=7+Math.random()*9; const L=G.cannAngry>0?(e.hp<e.maxhp*0.3?GHUL_LINES.flee:GHUL_LINES.angry):GHUL_LINES.watch; bubble(e,L[Math.random()*L.length|0]); }
    if(G.cannAngry>0&&e.hp<e.maxhp*0.3&&!e.fled){ e.fled=true; e.flee=4; }
    if(G.cannAngry>0&&!e.sleep){ e.spearCd=(e.spearCd==null?2:e.spearCd)-dt; const dx=P.x-e.x; if(e.spearCd<=0&&Math.abs(dx)>4*T&&Math.abs(dx)<12*T&&Math.abs(P.y-e.y)<4*T){ e.spearCd=3.5+Math.random()*2; const t=0.9; G.proj.push({x:e.x+e.w/2,y:e.y+12,vx:(P.x+P.w/2-e.x-e.w/2)/t,vy:(P.y+10-e.y-12)/t-0.5*450*t,grav:450,dmg:d.dmg*0.9,own:'e',type:'knochenspeer',life:3,rot:true}); e.attackT=0.25; sfx('bow'); } } }
  _updateMob4(e,dt); };
// Ghul-Gesicht
const _drawHead=drawHead;
drawHead=function(r,L,bob,ox){ const res=_drawHead(r,L,bob,ox); if(!L.ghoul) return res; const {hx,hy}=res; const sk=tones(L.skin);
  const burn=['#4a2618','#6a3a26','#c88a80','#e0a8a0','#3a1c12'];
  for(let i=0;i<26;i++){ const x=(i*7+3)%14, y=(i*5+1)%13; r.set(hx+x+1,hy+y,burn[i%5]); }
  r.set(hx+15,hy+7,null); r.clr(hx+15,hy+7); r.clr(hx+15,hy+8); r.set(hx+14,hy+7,'#1a0e08'); r.set(hx+14,hy+8,'#2a160c');
  r.rect(hx+9,hy+4,4,3,'#1e100a'); r.set(hx+11,hy+5,'#fff4a0'); r.set(hx+12,hy+5,'#e8c860'); r.set(hx+10,hy+5,'#3a2010');
  r.rect(hx+9,hy+10,6,2,'#1a0c06'); for(let x=9;x<15;x+=2) r.set(hx+x,hy+10,'#d8c8a0'); r.set(hx+13,hy+12,'#5a3424');
  r.set(hx+5,hy+2,'#c8a888'); r.set(hx+6,hy+3,'#c8a888'); r.set(hx+3,hy+8,'#c8a888');
  if(L.hood){ const h=tones(L.hood); for(let x=-1;x<13;x++) for(let y=-2;y<3;y++){ if(y===-2&&(x<2||x>10)) continue; if(x>8&&y>0) continue; r.set(hx+x,hy+y,y<0?h.hi:(x<3?h.b:h.md)); } for(let y=3;y<12;y++){ r.set(hx-1,hy+y,h.b); r.set(hx,hy+y,h.md); r.set(hx+1,hy+y,y>8?h.md:null); } }
  if(L.skullmask){ r.rect(hx+7,hy+2,8,8,'#d8ccb0'); r.rect(hx+9,hy+4,2,2,'#1a0c06'); r.rect(hx+12,hy+4,2,2,'#1a0c06'); r.set(hx+12,hy+7,'#1a0c06'); for(let x=8;x<15;x+=2) r.set(hx+x,hy+9,'#8a7a60'); }
  return res; };
const _drawHair=drawHair; drawHair=function(r,L,hx,hy){ if(L.hairStyle==='strands'){ const h=tones(L.hair); for(const x of [1,3,5]) for(let y=0;y<3+(x%2)*2;y++) r.set(hx+x,hy+y,y<0?h.hi:h.b); return; } return _drawHair(r,L,hx,hy); };
// ================= 5) Kampf wie im Klassiker: Schwungbogen, Autoswing, Rückstoß, Krit, Lebensbalken =================
SFX.swish=function(){ const t=SND.ctx.currentTime; nz(t,0.14,0.16,{f:900,fTo:3200,q:0.9,rev:0.3}); };
SFX.clang=function(){ const t=SND.ctx.currentTime; osc('square',1400,t,0.08,0.05,{to:900}); nz(t,0.05,0.08,{f:4000,q:2}); };
const KB={knueppel:230,naegelschlaeger:250,speer:170,machete:150,zwillingsklinge:120,armknochen:260,hackebeil:180,eisenrohr:260,brechstange:240,vorschlaghammer:420,knochenspeer:190};
function swingTargets(e,P){ if(e.dead||e.kind!=='mob') return false; const d=MOBS[e.t]; if(hostile(e)||d.animal) return true; return d.cann&&P.swing&&P.swing.tap===e; }
function startSwing(d,id,tap){ const P=G.player; const r=SKILLFX.rate(); const dur=Math.max(0.2,Math.min(0.55,d.rate*r*0.85)); P.swing={t:0,dur,id,d,hit:new Set(),dir:P.dir,tap}; P.cd=d.rate*r; P.attackT=dur; P.stam-=3; sfx('swish'); }
const _useHeld4=useHeld;
useHeld=function(dt,wx,wy,fresh){ const P=G.player; if(P.dead) return; const id=heldItem(); const d=ITEMS[id]||ITEMS.hand;
  const melee=!d.ranged&&d.type!=='throw'&&(d.type==='weapon'||(d.tool&&d.dmg));
  if(!melee) return _useHeld4(dt,wx,wy,fresh);
  const reach=(d.reach||2)*T; let tgt=null;
  if(wx!=null){ const e=entAt(wx,wy,8); if(e&&e.kind==='mob'&&(hostile(e)||MOBS[e.t].animal||MOBS[e.t].cann)&&dist(e,P)<reach+T) tgt=e; } else tgt=nearestHostile(reach+6,true);
  if(!tgt&&d.tool&&(wx!=null||frontTile(false))) return _useHeld4(dt,wx,wy,fresh); // Werkzeug baut ab
  if(P.swing||P.cd>0) return;
  if(tgt) P.dir=tgt.x+tgt.w/2>P.x+P.w/2?1:-1; else if(wx!=null) P.dir=wx>P.x+P.w/2?1:-1;
  G.mineT=null; startSwing(d,id,tgt); };
function swingUpdate(dt){ const P=G.player; const s=P.swing; if(!s) return; s.t+=dt; const k=Math.min(1,s.t/s.dur); const a0=-2.35, a1=0.85; const cur=a0+(a1-a0)*(1-Math.pow(1-k,2)); s.ang=cur;
  const cx=P.x+P.w/2, cy=P.y+16; const reach=(s.d.reach||2)*T+6;
  for(const e of G.ents){ if(s.hit.has(e)||!swingTargets(e,P)) continue; const ex=e.x+e.w/2, ey=e.y+e.h/2; const nx=Math.max(e.x,Math.min(cx,e.x+e.w)), ny=Math.max(e.y,Math.min(cy,e.y+e.h)); const dd=Math.hypot(nx-cx,ny-cy); if(dd>reach) continue;
    let phi=Math.atan2(ey-cy,(ex-cx)*s.dir); if(dd<10) phi=Math.min(phi,cur); if(phi>cur+0.3||phi<a0-0.4) continue;
    s.hit.add(e); const sk=(1+P.sk.staerke*0.15)*SKILLFX.melee(); let dm=s.d.dmg*sk*(P.stam<5?0.5:1)*(0.9+Math.random()*0.2); const crit=Math.random()<SKILLFX.crit()+0.04; if(crit) dm*=2;
    G._crit=crit; hurtMob(e,dm,P,KB[s.id]||(s.d.kb?260:140)); G._crit=false; if(s.id==='zwillingsklinge') setTimeout(()=>{ if(!e.dead){ G._crit=false; hurtMob(e,dm*0.5,P,0); } },120);
    if(MOBS[e.t]&&MOBS[e.t].armor) sfx('clang'); }
  if(s.t>=s.dur){ P.swing=null; P.attackT=0; } }
drawSwing=function(ox,oy){ const P=G.player; const s=P.swing; if(!s||P.dead) return; const ic=GFX.icons[s.id]; const cx=P.x+P.w/2+ox, cy=P.y+16+oy; const a=s.ang==null?-2.35:s.ang; const L=(s.d.reach||2)>2.8?22:17;
  // Spur
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=1;i<10;i++){ const b=a-i*0.12; if(b<-2.45) break; ctx.globalAlpha=(1-i/10)*0.35; ctx.fillStyle=i<3?'#fff4d8':'#c8b898'; const x=cx+Math.cos(b)*L*s.dir, y=cy+Math.sin(b)*L; ctx.fillRect(Math.round(x)-1,Math.round(y)-1,2,2); const x2=cx+Math.cos(b)*(L-5)*s.dir, y2=cy+Math.sin(b)*(L-5); ctx.fillRect(Math.round(x2),Math.round(y2),1,1); } ctx.restore();
  // Waffe dreht durch den Bogen
  if(ic){ ctx.save(); ctx.translate(Math.round(cx),Math.round(cy)); ctx.scale(s.dir,1); ctx.rotate(a+Math.PI/4); ctx.drawImage(ic,-2,-L+2,L,L); ctx.restore(); } };
// Lebensbalken nur nach Treffer (3 s), Schadenszahlen orange, Krit größer
const _hurtMob4=hurtMob;
hurtMob=function(e,dmg,src,kb){ if(e.dead) return _hurtMob4(e,dmg,src,kb); e.hpShow=3; if(src===G.player) fightPing(); _hurtMob4(e,dmg,src,kb); if(e.dead&&e.kind==='mob'&&MOBS[e.t]&&MOBS[e.t].cann){ G.bubbles=(G.bubbles||[]).filter(b=>b.e!==e); if(Math.random()<0.18) spawnDrop(e.wpn==='speer'?'knochenspeer':e.wpn||'knochenspeer',1,e.x+4,e.y+20); if(Math.random()<0.25) spawnDrop('wurfmesser',1+(Math.random()*2|0),e.x+8,e.y+20); } };
const _num4=num;
num=function(x,y,t,col){ const isN=/^\d+$/.test(String(t)); if(isN&&col==='#ffeb3b'){ G.nums.push({x:x+(Math.random()-0.5)*8,y,t:String(t)+(G._crit?'!':''),col:G._crit?'#ff4a1a':'#ff9a2e',life:1.0,crit:!!G._crit,vy:-40}); return; } _num4(x,y,t,col); };
const _hurtPlayer4=hurtPlayer; hurtPlayer=function(dmg,src){ const P=G.player; const before=P.hp; _hurtPlayer4(dmg,src); if(P.hp<before){ fightPing(); if(P.inv_t>0) P.inv_t=0.67; } };
// Wurfwaffen & neue Nahkampfwaffen
I('wurfmesser',{n:'Wurfmesser',type:'throw',st:30,col:'#ccc',dmg:16,rate:0.32,spin:true,d:'Fliegt gerade, trifft hart. Mit Glück findest du es wieder.'});
I('schrottstern',{n:'Schrottstern',type:'throw',st:40,col:'#aaa',dmg:11,rate:0.24,spin:true,d:'Aus Blechresten gefeilt. Schnell, gemein, rostig.'});
I('hackebeil',{n:'Hackebeil',type:'weapon',st:1,col:'#bbb',dmg:20,rate:0.42,reach:2.2,d:'Ehemals Metzgerei Schulze. Jetzt deins.'});
I('eisenrohr',{n:'Eisenrohr',type:'weapon',st:1,col:'#777',dmg:18,rate:0.55,reach:2.6,d:'Schwer, rostig, ehrlich. Hoher Rückstoß.'});
I('brechstange',{n:'Brechstange',type:'weapon',st:1,col:'#a33',dmg:21,rate:0.5,reach:2.5,tool:{pick:0.8},d:'Öffnet Türen, Kisten und Schädel.'});
I('vorschlaghammer',{n:'Vorschlaghammer',type:'weapon',st:1,col:'#888',dmg:44,rate:0.95,reach:2.6,d:'Langsam. Aber wenn er trifft, fliegt alles.'});
I('knochenspeer',{n:'Knochenspeer',type:'weapon',st:1,col:'#ddc',dmg:24,rate:0.55,reach:3.4,d:'Ghul-Handwerk. Lange Reichweite.'});
I('leuchtfackel',{n:'Signalfackel',type:'block',tile:21,st:20,col:'#f33',d:'Rotes Licht. Platzieren wie eine Fackel.'});
RECIPES.push({o:'wurfmesser',n:4,i:{eisen:1,leder:1},at:'werkbank'},{o:'schrottstern',n:6,i:{schrott:3},at:'werkbank'},{o:'eisenrohr',i:{schrott:6,stoff:1},at:'werkbank'},
 {o:'hackebeil',i:{eisen:3,holz:2},at:'esse'},{o:'brechstange',i:{eisen:5},at:'esse'},{o:'vorschlaghammer',i:{eisen:8,holz:4,leder:1},at:'esse',sk:{staerke:2}},{o:'knochenspeer',i:{knochen:4,holz:2,faser:2},at:'werkbank'});
for(const t of ['haus','wrack','dach']) if(LOOT[t]) LOOT[t].push(['wurfmesser',2,5,0.12],['eisenrohr',1,1,0.08],['brechstange',1,1,0.05],['hackebeil',1,1,0.05]);
const _fireAt4=fireAt; fireAt=function(d,tx,ty){ if(d.spin){ const P=G.player; if(P.cd>0) return; const cx=P.x+P.w/2, cy=P.y+14; removeItem(d.id,1); const a=Math.atan2(ty-cy,tx-cx); const sp=d.id==='wurfmesser'?520:600; G.proj.push({x:cx,y:cy,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,grav:120,dmg:d.dmg*(1+P.sk.staerke*0.08),own:'p',type:d.id,life:1.2,spin:true,back:d.id==='wurfmesser'?0.55:0.3}); P.cd=d.rate*SKILLFX.rate(); P.attackT=0.15; P.dir=tx>cx?1:-1; sfx('swish'); return; } return _fireAt4(d,tx,ty); };
drawProj=function(ox,oy){ for(const p of G.proj){ const x=p.x+ox,y=p.y+oy;
  if(p.type==='bullet'){ ctx.save(); ctx.globalCompositeOperation='lighter'; const L=Math.hypot(p.vx,p.vy)||1; ctx.strokeStyle='rgba(255,220,120,0.55)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-p.vx/L*10,y-p.vy/L*10); ctx.stroke(); ctx.fillStyle='#fff3b0'; ctx.fillRect(x-1,y-1,2,2); ctx.restore(); }
  else if(p.type==='arrow'){ const L=Math.hypot(p.vx,p.vy)||1; ctx.strokeStyle='#cbb89a'; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-p.vx/L*9,y-p.vy/L*9); ctx.stroke(); ctx.fillStyle='#eee'; ctx.fillRect(x-1,y-1,2,2); }
  else if(p.type==='acid'){ ctx.fillStyle='#9c3'; ctx.fillRect(x-2,y-2,4,4);} else if(p.type==='egg'){ ctx.fillStyle='#eee'; ctx.fillRect(x-3,y-4,6,7);}
  else { const ic=GFX.icons[p.type]; if(!ic) continue; ctx.save(); ctx.translate(x,y); const rot=p.spin?G.clock*22:(p.rot?Math.atan2(p.vy,p.vx)+Math.PI/4:G.clock*8); ctx.rotate(rot); if(p.spin){ ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=0.25; ctx.drawImage(LOOK.glow.warm||ic,-8,-8,16,16); ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over'; } ctx.drawImage(ic,-6,-6,12,12); ctx.restore(); } } };
// ================= 6) Türen: einzelne Zombies brauchen lange, Horden brechen schnell durch =================
function doorBang(e,tx,ty,amt){ const t=tget(tx,ty); const d=MOBS[e.t]; const P=G.player;
  if(TILES[t]&&TILES[t].door&&!d.mutant&&!d.boss){ const cx=tx*T+8; const n=G.ents.filter(o=>!o.dead&&o.kind==='mob'&&!MOBS[o.t].fly&&!MOBS[o.t].animal&&Math.abs(o.x+o.w/2-cx)<2.6*T&&Math.abs(o.y+o.h-(ty*T+T))<3*T).length;
    amt*= n>=3?0.6*n:0.12; if(n>=3&&!(G.hordeMsgT>0)&&Math.abs(P.x-cx)<30*T){ msg('Eine Horde drückt gegen die Tür!','#ff7043'); G.hordeMsgT=25; }
    for(let i=0;i<(n>=3?6:2);i++) G.parts.push({x:cx+(e.x<cx?-6:6),y:ty*T+4+Math.random()*10,vx:(e.x<cx?1:-1)*(30+Math.random()*60),vy:-40-Math.random()*60,life:0.6,col:Math.random()<0.5?'#7b5030':'#a07040',sz:1,grav:500});
    if(Math.abs(P.x-cx)<14*T){ sfx('woodthud'); if(n>=3) G.cam.shake=Math.max(G.cam.shake,2); } }
  else sfx('hit');
  dmgTile(tx,ty,amt); }
// ================= 7) Möbel & Deko (KI-Sprites) =================
const FURN=[['kronleuchter','Kronleuchter','ceil',1.0,'warm'],['wandkerze','Wandkerze','wall',0.6,'warm'],['kerze','Kerzenständer','floor',0.55,'warm'],['laterne','Laterne','ceil',0.8,'warm'],
 ['bild_land','Landschaftsbild','wall'],['bild_mann','Ahnenporträt','wall'],['bild_meer','Sturmbild','wall'],['karte','Alte Karte','wall'],
 ['tisch','Tisch','floor'],['stuhl','Stuhl','floor'],['regal','Bücherregal','floor'],['uhr','Standuhr','floor'],['fass','Fass','floor'],['ofen','Ofen','floor',0.7,'warm'],['wandregal','Wandregal','wall'],['schaedelkerze','Schädelkerze','floor',0.5,'red']];
const FURN_ID={}; const FURN_DESC={kronleuchter:'Schummriges Licht für die Apokalypse mit Stil.',wandkerze:'Wachs tropft. Atmosphäre steigt.',kerze:'Drei Dochte gegen die Dunkelheit.',laterne:'Hängt. Leuchtet. Quietscht.',bild_land:'Erinnerung an grüne Hügel.',bild_mann:'Guckt dir überall hin nach.',bild_meer:'Stürmisch. Wie dein Leben.',karte:'Zeigt Orte, die es nicht mehr gibt.',tisch:'Zum Essen. Oder Planen.',stuhl:'Endlich sitzen.',regal:'Voller Bücher, die keiner mehr liest.',uhr:'Tickt noch. Als einzige.',fass:'Riecht nach altem Wein.',ofen:'Wärmt und leuchtet.',wandregal:'Einmachgläser mit fragwürdigem Inhalt.',schaedelkerze:'Ghul-Deko. Geschmackssache.'};
FURN.forEach(([k,n,fa,light,lcol],i)=>{ const id=57+i; FURN_ID[k]=id; defT(id,{n,s:false,h:0.6,tool:'hand',drop:[k,1],furn:k,fa,light:light||0,lcol:lcol||'warm',warm:k==='ofen'?1:0,c:'#7a5a3a'}); I(k,{n,type:'block',tile:id,st:20,d:FURN_DESC[k]}); });
const KOMET_T=73; defT(KOMET_T,{n:'Kometengestein',h:4,tool:'pick',drop:['stein',2],light:0.9,lcol:'blue',c:'#3ad0ff',komet:true});
RECIPES.push({o:'kerze',i:{holz:1,faser:2},at:'werkbank'},{o:'wandkerze',i:{eisen:1,faser:2},at:'werkbank'},{o:'laterne',i:{eisen:2,faser:1,flasche:1},at:'werkbank'},{o:'kronleuchter',i:{eisen:4,faser:4},at:'esse'},
 {o:'tisch',i:{bretter:4},at:'werkbank'},{o:'stuhl',i:{bretter:2},at:'werkbank'},{o:'regal',i:{bretter:6},at:'werkbank'},{o:'fass',i:{bretter:5,eisen:1},at:'werkbank'},{o:'uhr',i:{bretter:6,eisen:2},at:'werkbank'},
 {o:'ofen',i:{eisen:6,stein:4},at:'esse'},{o:'wandregal',i:{bretter:2,flasche:2},at:'werkbank'},{o:'bild_land',i:{bretter:1,stoff:2},at:'werkbank'},{o:'karte',i:{stoff:2},at:'werkbank'});
const _buildTileTex=buildTileTex; buildTileTex=function(){ _buildTileTex(); for(const k in FURN_ID){ const id=FURN_ID[k]; GFX.tiles[id]=[0,1,2,3].map(()=>mkCanvas(T,T)); }
  GFX.tiles[KOMET_T]=[0,1,2,3].map(v=>{ const c=mkCanvas(T,T), g=c.getContext('2d'); const r=rngSeed(731+v*17); g.fillStyle='#1c1a24'; g.fillRect(0,0,T,T); for(let i=0;i<40;i++){ g.fillStyle=['#2a2634','#14121a','#36303f'][i%3]; g.fillRect(r()*T|0,r()*T|0,2,1); }
    g.fillStyle='#38d8ff'; let x=r()*T|0, y=0; for(let i=0;i<14;i++){ g.fillRect(x,y,1,1); x+=(r()<0.5?-1:1); y++; if(x<0)x=0; if(x>15)x=15; } g.fillStyle='#bff4ff'; g.fillRect(r()*14|0,r()*14|0,2,2); g.fillStyle='#ff9a3a'; g.fillRect(r()*14|0,r()*14|0,1,1); return c; }); };
function furnDraw(ox,oy){ const cam=G.cam; const x0=Math.floor(cam.x/T)-3, y0=Math.floor(cam.y/T)-3, x1=x0+Math.ceil(G.VW/T)+6, y1=y0+Math.ceil(G.VH/T)+6;
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){ const t=tget(x,y); const d=TILES[t]; if(!d||!d.furn) continue; const img=ARTI.furn[d.furn]; if(!img||!img.complete) continue; const w=img.naturalWidth,h=img.naturalHeight; const sx=x*T+ox+8-(w>>1);
    const sy=d.fa==='ceil'?y*T+oy:d.fa==='wall'?y*T+oy+8-(h>>1):y*T+oy+T-h; ctx.drawImage(img,sx,sy);
    if(d.light&&(d.furn!=='uhr')){ const fl=0.75+Math.sin(G.clock*9+x*3)*0.08+Math.sin(G.clock*23+y)*0.05; ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=0.22*fl; const gl=LOOK.glow[d.lcol]||LOOK.glow.warm; const gy=d.fa==='ceil'?sy+h*0.6:d.fa==='wall'?sy+2:sy+3; ctx.drawImage(gl,x*T+ox+8-18,gy-18,36,36); ctx.restore(); } } }
const _drawWorld4=drawWorld; drawWorld=function(){ const v=_drawWorld4(); G._ox=v.ox; G._oy=v.oy; furnDraw(v.ox,v.oy); return v; };
function decorateWorld(){ const w=G.w; if(!w||(w.feat&&w.feat.decorated)) return; const W=w.W,H=w.H; let n=0; const rng=rngSeed(4242); const solid=(x,y)=>{ const t=tget(x,y); return t&&TILES[t].s&&t!==19; };
  const air=(x,y)=>tget(x,y)===0&&bget(x,y)>0; const last={};
  const pick=a=>a[(rng()*a.length)|0];
  const wr=w.feat&&w.feat.wreck; for(let y=2;y<H-3;y++){ for(let x=2;x<W-2;x++){ if(!air(x,y)) continue; if(wr&&x>=wr.x-4&&x<=wr.x+22) continue; const key=y; if(last[key]!=null&&x-last[key]<3) continue;
      if(solid(x,y-1)&&air(x,y+1)&&air(x,y+2)&&rng()<0.09){ tset(x,y,FURN_ID[rng()<0.55?'kronleuchter':'laterne']); last[key]=x; n++; continue; }
      if(solid(x,y+1)&&air(x,y-1)&&rng()<0.12){ const k=pick(['tisch','stuhl','regal','uhr','fass','kerze','ofen','stuhl','tisch','kerze']); if((k==='regal'||k==='uhr')&&!(air(x,y-2))) continue; tset(x,y,FURN_ID[k]); last[key]=x; n++; continue; }
      if(air(x,y+1)&&solid(x,y+2)&&air(x,y-1)&&rng()<0.08){ tset(x,y,FURN_ID[pick(['bild_land','bild_mann','bild_meer','karte','wandkerze','wandregal','wandkerze'])]); last[key]=x; n++; } } }
  const c=w.feat&&w.feat.cann; if(c){ for(let x=c.x0;x<c.x1;x+=5){ let y=2; while(y<H-2&&!solid(x,y+1)) y++; if(tget(x,y)===0&&rng()<0.6){ tset(x,y,FURN_ID.schaedelkerze); n++; } } }
  if(w.feat) w.feat.decorated=true; return n; }
// ================= 8) Kometen =================
I('sternenherz',{n:'Sternenherz',type:'food',st:5,col:'#f44',food:{maxhp:20},d:'Pulsiert warm. Essen: +20 maximale Gesundheit (bis +200).'});
I('kometensplitter',{n:'Kometensplitter',type:'summon',st:10,col:'#3cf',d:'Kosmisches Wissen in Steinform. Benutzen: +1 Skillpunkt.'});
const _summon4=summon; summon=function(id){ const P=G.player; if(id==='kometensplitter'){ removeItem(id,1); P.sp=(P.sp||0)+1; msg('Kosmisches Wissen durchströmt dich: +1 Skillpunkt!','#7ae8ff'); sfx('level'); partBurst(P.x+P.w/2,P.y+10,'#7ae8ff',16,120); return; } return _summon4(id); };
const _eat4=eat; eat=function(id){ const P=G.player; if(id==='sternenherz'&&P.bonusHp>=200){ msg('Mehr verträgt dein Herz nicht. (+200 erreicht)','#ffab91'); return; } return _eat4(id); };
function cometSchedule(){ const day=G.day||1; if(G.cometNight===day) return; if(!isNight()) return; G.cometNight=day; if(day<2||Math.random()>0.6) return; G.cometAt=G.clock+20+Math.random()*90; }
function cometLaunch(){ const P=G.player; const w=G.w; const side=Math.random()<0.5?-1:1; let tx=Math.floor(P.x/T)+side*(12+Math.floor(Math.random()*26)); tx=Math.max(20,Math.min(w.W-20,tx)); let ty=4; while(ty<w.H-2&&!(TILES[tget(tx,ty)].s)) ty++;
  const ex=tx*T+8, ey=ty*T; const sx=ex-side*760, sy=ey-340; G.comet={x:sx,y:sy,ex,ey,vx:(ex-sx)/2.6,vy:(ey-sy)/2.6,t:0}; msg('Ein Komet zieht über den Himmel…','#9fe6ff'); }
function cometImpact(c){ const tx=Math.floor(c.ex/T), ty=Math.floor(c.ey/T); const P=G.player; const R=3.2;
  for(let a=-4;a<=4;a++)for(let b=-4;b<=3;b++){ const d=Math.hypot(a,b*1.2); const t=tget(tx+a,ty+b); if(!t||t===17||TILES[t].h>=8||TILES[t].loot||TILES[t].chest||TILES[t].door) continue; if(d<R) tset(tx+a,ty+b,0); else if(d<R+1.2&&TILES[t].s&&Math.random()<0.75) tset(tx+a,ty+b,KOMET_T); }
  for(let a=-1;a<=1;a++){ let y=ty+3; while(y<G.w.H-2&&tget(tx+a,y)===0) y++; if(tget(tx+a,y)!==17) tset(tx+a,y,KOMET_T); }
  let fy=ty; while(fy<G.w.H-2&&tget(tx,fy+1)===0) fy++;
  spawnDrop('kometensplitter',1+(Math.random()*2|0),tx*T+4,fy*T); if(Math.random()<0.55) spawnDrop('sternenherz',1,tx*T+10,fy*T);
  for(let i=0;i<60;i++){ const a=Math.random()*Math.PI*2, s=60+Math.random()*260; G.parts.push({x:c.ex,y:c.ey,vx:Math.cos(a)*s,vy:Math.sin(a)*s-120,life:0.6+Math.random()*0.9,col:['#ffd080','#ff7a30','#9fe6ff','#ffffff'][i%4],sz:1+(i%3===0),light:0.5,grav:300}); }
  const dd=Math.hypot(P.x-c.ex,P.y-c.ey); G.cam.shake=Math.max(G.cam.shake,dd<40*T?9:4); sfx('boom'); if(dd<5*T) hurtPlayer(25,{x:c.ex});
  for(const e of G.ents) if(!e.dead&&e.kind==='mob'&&Math.hypot(e.x-c.ex,e.y-c.ey)<5*T) hurtMob(e,60,null,250);
  G.flags=G.flags||{}; G.flags.comet={x:tx,y:fy}; G.cometGlow={x:c.ex,y:c.ey,t:30};
  msg(`Komet eingeschlagen – ${dd<60*T?(c.ex<P.x?'links':'rechts')+' von dir':'in der Ferne'}! Dort leuchtet etwas.`,'#7ae8ff'); }
function cometUpdate(dt){ cometSchedule(); if(G.cometAt&&G.clock>=G.cometAt&&!G.comet){ G.cometAt=0; cometLaunch(); }
  const c=G.comet; if(c){ c.t+=dt; c.x+=c.vx*dt; c.y+=c.vy*dt; for(let i=0;i<3;i++) G.parts.push({x:c.x+(Math.random()-0.5)*6,y:c.y+(Math.random()-0.5)*6,vx:-c.vx*0.08+(Math.random()-0.5)*30,vy:-c.vy*0.08+(Math.random()-0.5)*30,life:0.5+Math.random()*0.6,col:['#ffe0a0','#ff8a30','#ff5020','#9fe6ff'][i+(Math.random()*2|0)],sz:1+(Math.random()<0.3),light:0.6});
    if(c.t>=2.6){ G.comet=null; cometImpact(c); } }
  if(G.cometGlow){ G.cometGlow.t-=dt; if(G.cometGlow.t<=0) G.cometGlow=null; } }
function cometDraw(ox,oy){ const c=G.comet; if(c){ const x=c.x+ox, y=c.y+oy; ctx.save(); ctx.globalCompositeOperation='lighter'; const L=Math.hypot(c.vx,c.vy); const ux=c.vx/L, uy=c.vy/L;
    const gr=ctx.createLinearGradient(x,y,x-ux*170,y-uy*170); gr.addColorStop(0,'rgba(255,240,200,0.95)'); gr.addColorStop(0.25,'rgba(255,150,60,0.7)'); gr.addColorStop(1,'rgba(255,60,20,0)'); ctx.strokeStyle=gr; ctx.lineCap='round';
    for(const [lw,al] of [[9,0.35],[5,0.6],[2,1]]){ ctx.globalAlpha=al; ctx.lineWidth=lw; ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x-ux*170+Math.sin(G.clock*30)*2,y-uy*170); ctx.stroke(); }
    for(let i=0;i<14;i++){ ctx.globalAlpha=(1-i/14)*0.8; const sz=34-i*1.6; ctx.drawImage(i<4?LOOK.glow.warm:LOOK.glow.red,x-ux*i*9-sz/2,y-uy*i*9-sz/2,sz,sz); } ctx.globalAlpha=1; ctx.drawImage(LOOK.glow.blue,x-24,y-24,48,48); ctx.drawImage(LOOK.glow.warm,x-20,y-20,40,40); ctx.fillStyle='#fff'; ctx.fillRect(x-3,y-3,6,6); ctx.fillStyle='#bff4ff'; ctx.fillRect(x-2,y-4,4,8); ctx.restore(); }
  const g=G.cometGlow; if(g){ ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.globalAlpha=Math.min(1,g.t/10)*(0.5+Math.sin(G.clock*3)*0.1); ctx.drawImage(LOOK.glow.blue,g.x+ox-50,g.y+oy-50,100,100); ctx.restore(); } }
// ================= 9) Himmel: Sternschnuppen, Glühwürmchen =================
G.shoot=[];
function skyExtras(){ const dl=dayLight(); if(dl>0.35) return; const a=1-dl/0.35; if(Math.random()<0.006) G.shoot.push({x:Math.random()*G.VW,y:Math.random()*G.VH*0.35,vx:(Math.random()<0.5?-1:1)*(160+Math.random()*120),vy:60+Math.random()*50,life:0.7+Math.random()*0.4});
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(const s of G.shoot){ s.life-=1/60; s.x+=s.vx/60; s.y+=s.vy/60; const L=Math.hypot(s.vx,s.vy); for(let i=0;i<12;i++){ ctx.globalAlpha=a*Math.min(1,s.life*2)*(1-i/12); ctx.fillStyle=i<2?'#fff':'#bfe4ff'; ctx.fillRect(Math.round(s.x-s.vx/L*i*2),Math.round(s.y-s.vy/L*i*2),1,1); } } ctx.restore(); G.shoot=G.shoot.filter(s=>s.life>0); }
const _drawBackground4=drawBackground; drawBackground=function(){ _drawBackground4(); try{ skyExtras(); }catch(e){} };
function fireflies(ox,oy){ if(dayLight()>0.4||!G.player) return; G.ffl=G.ffl||[]; const P=G.player; while(G.ffl.length<14) G.ffl.push({x:P.x+(Math.random()-0.5)*G.VW,y:P.y-Math.random()*90,p:Math.random()*6});
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(const f of G.ffl){ f.p+=0.02; f.x+=Math.sin(f.p*1.3)*0.3; f.y+=Math.cos(f.p)*0.2; if(Math.abs(f.x-P.x)>G.VW*0.7){ f.x=P.x+(Math.random()-0.5)*G.VW; f.y=P.y-Math.random()*90; } const tx=Math.floor(f.x/T),ty=Math.floor(f.y/T); if(tget(tx,ty)) continue; if(ty>G.w.sky[Math.max(0,Math.min(G.w.W-1,tx))]+2) continue;
    const al=0.4+Math.sin(f.p*5)*0.4; ctx.globalAlpha=Math.max(0,al); ctx.fillStyle='#d8ff70'; ctx.fillRect(Math.round(f.x+ox),Math.round(f.y+oy),1,1); ctx.globalAlpha=Math.max(0,al)*0.3; ctx.drawImage(LOOK.glow.neon,Math.round(f.x+ox)-4,Math.round(f.y+oy)-4,9,9); } ctx.restore(); }
// ================= 10) Sprechblasen (stabil, DOM wird nur verschoben) & Dialog ohne Flackern =================
function bubblesDraw(ox,oy){ const box=$('bubbles'); if(!box) return; const cv=$('c'); const sc=cv.getBoundingClientRect().width/G.VW; G.bubbles=(G.bubbles||[]).filter(b=>{ if(b.life>0&&!b.e.dead&&G.ents.indexOf(b.e)>=0) return true; if(b.el) b.el.remove(); return false; });
  for(const b of G.bubbles){ if(!b.el){ b.el=document.createElement('div'); b.el.className='bub'; b.el.textContent=b.t; box.appendChild(b.el); } const an=spriteAnchor(b.e.look||b.e.t); const top=b.e.y+b.e.h-(an.ay-an.top);
    const x=Math.round((b.e.x+b.e.w/2+ox)*sc), y=Math.round((top+oy-4)*sc); if(b._x!==x||b._y!==y){ b._x=x; b._y=y; b.el.style.transform=`translate(${x}px,${y}px) translate(-50%,-100%)`; } const o=Math.min(1,b.life*1.5).toFixed(2); if(b._o!==o){ b._o=o; b.el.style.opacity=o; } } }
const _floats4=UI.floats; UI.floats=function(ox,oy){ _floats4.call(UI,ox,oy); bubblesDraw(ox,oy); };
dlgType=function(){ clearInterval(UI.dlgTimer); const el=$('saytxt'); const D=UI.dlg; if(!el||!D) return; const tmp=document.createElement('div'); tmp.innerHTML=D.pages[D.i]; const page=tmp.textContent; let shown=Math.min(page.length,D.shown||0);
  el.textContent=''; const tn=document.createTextNode(page.slice(0,shown)); const car=document.createElement('span'); car.className='caret'; car.textContent='▌'; const ghost=document.createElement('span'); ghost.className='ghost'; ghost.textContent=page.slice(shown); el.append(tn,car,ghost);
  UI.dlgTimer=setInterval(()=>{ if(UI.dlg!==D||!el.isConnected||$('panel').classList.contains('hide')){ clearInterval(UI.dlgTimer); return; } shown=Math.min(page.length,shown+2); tn.data=page.slice(0,shown); ghost.textContent=page.slice(shown); if(shown%8===0) sfx('tick');
    if(shown>=page.length){ clearInterval(UI.dlgTimer); D.shown=D.pages[D.i].length; UI.renderNPC(); } else D.shown=Math.min(shown,D.pages[D.i].length-1); },28); };
const _renderNPC4=UI.renderNPC; UI.renderNPC=function(){ _renderNPC4.call(UI); const n=UI.npc; const p=n&&ART.port[n.t]; const box=document.querySelector('#pbody .portrait'); if(p&&box){ box.innerHTML=`<img src="${p}" class="portimg">`; } };
UI.toastTalk=function(e){ const L=GHUL_LINES.watch; bubble(e,L[Math.random()*L.length|0]); };
// ================= 11) HUD: Boss-Leiste, Blutmond-Welle, Inventar-Tooltip =================
const _hud4=UI.hud; UI.hud=function(dt){ const was=UI.hudT; _hud4.call(UI,dt); if(was>dt) return; const b=G.boss&&!G.boss.dead?G.boss:null;
  if(b){ const ic=$('bossic'); const src=ART.crea[b.t]?ART.crea[b.t][0]:''; if(ic&&ic._s!==src){ ic._s=src; ic.src=src; ic.style.display=src?'':'none'; } const t=$('bosstxt'); if(t) t.textContent=Math.max(0,Math.ceil(b.hp))+' / '+b.maxhp; }
  const wb=$('wavebar'); if(wb){ if(G.bloodmoon){ const total=24+G.day*3; const k=Math.min(1,(G.bmKills||0)/total); wb.classList.remove('hide'); wb.querySelector('i').style.width=(k*100).toFixed(1)+'%'; wb.querySelector('span').textContent=`Blutmond · ${G.bmKills||0}/${total}`; } else wb.classList.add('hide'); } };
function typeLabel(d){ if(!d) return ''; if(d.type==='weapon') return d.tool?'Nahkampfwaffe · Werkzeug':'Nahkampfwaffe'; if(d.type==='throw') return 'Wurfwaffe'; if(d.ranged) return 'Fernkampfwaffe'; if(d.type==='tool'||d.tool) return 'Werkzeug'; if(d.type==='armor') return 'Ausrüstung'+(d.slot?' ('+({head:'Kopf',body:'Körper',legs:'Beine',feet:'Füße',acc:'Zubehör'}[d.slot]||d.slot)+')':''); if(d.type==='food') return 'Verbrauchbar'; if(d.type==='book') return 'Lesestoff'; if(d.type==='ammo') return 'Munition'; if(d.type==='summon') return 'Besonderes'; if(d.type==='block'){ const t=TILES[d.tile]; return t&&t.furn?'Möbel · platzierbar':t&&t.light?'Lichtquelle · platzierbar':'Block · platzierbar'; } if(d.type==='wall') return 'Hintergrundwand'; return 'Material'; }
const _itemDesc4=itemDesc; itemDesc=function(d){ let s=_itemDesc4(d); const bits=[]; if(d.dmg) bits.push(`${Math.round(d.dmg)} Schaden`); if(d.rate) bits.push(d.rate<0.35?'sehr schnell':d.rate<0.5?'schnell':d.rate<0.7?'durchschnittlich':'langsam'); if(KB[d.id]) bits.push(KB[d.id]>300?'gewaltiger Rückstoß':KB[d.id]>200?'starker Rückstoß':'mittlerer Rückstoß');
  return `<div class="ttype">${typeLabel(d)}</div>`+(bits.length?`<div class="tstat">${bits.join(' · ')}</div>`:'')+s; };
const _renderInv4=UI.renderInv; UI.renderInv=function(){ _renderInv4.call(UI); const g=document.querySelector('#pbody .grid'); if(g){ g.style.width=''; g.classList.add('invgrid'); } const inf=document.querySelector('#pbody .invinfo .info'); if(inf&&/ersten 8 Felder/.test(inf.textContent)) inf.innerHTML=inf.innerHTML.replace('ersten 8 Felder','ersten 10 Felder (obere Reihe)'); };
// ================= 12) Skill-Ansicht im 7-Days-Stil: Attribute | Perk-Karten | Details =================
const PERK_IC={zielwasser:'pistole',kistenfluesterer:'kiste',schuerfnase:'eisenerz',pruegelknabe:'naegelschlaeger',holzfaeller:'steinaxt',kantenklatscher:'machete',eisenlunge:'medkit',magenstahl:'eintopf',dickfellig:'polizeiweste',bastelbude:'werkbank',quasselstrippe:'kronkorken',sparfuchs:'schrott',leisetreter:'turnschuhe',sprintwunder:'kampfstiefel',flinkefinger:'wurfmesser'};
const ATTR_IC={wahrnehmung:'stirnlampe',staerke:'vorschlaghammer',fitness:'sternenherz',intellekt:'heft_schrauber1',agilitaet:'turnschuhe'};
const PERK_RT={zielwasser:r=>`+${12*r}% Fernkampfschaden`+(r===1?' · Pistole & Munition herstellbar':r===2?' · Schrotflinte herstellbar':''),kistenfluesterer:r=>`+${25*r}% Beutechance in Kisten`,schuerfnase:r=>`${15*r}% Chance auf doppeltes Erz und Stein`,
 pruegelknabe:r=>`+${15*r}% Nahkampfschaden`+(r===1?' · Nagel-Schläger & Machete herstellbar':''),holzfaeller:r=>`+${20*r}% Hack- und Abbautempo`,kantenklatscher:r=>`${8*r}% Chance auf kritische Treffer`,
 eisenlunge:r=>`+${15*r} max. Gesundheit und Ausdauer`,magenstahl:r=>`Hunger, Durst und Kälte −${12*r}%`+(r===1?' · Erste-Hilfe-Set herstellbar':''),dickfellig:r=>`−${6*r}% erlittener Schaden`,
 bastelbude:r=>r===1?'Rezepte: Eintopf, Stahl, Draht':r===2?'Rezepte: Chemiestation, Titan, Bomben':`Handwerks-Stufe ${r}: alle Rezepte bis Stufe ${r}`,quasselstrippe:r=>`${8*r}% Rabatt bei Händlern`,sparfuchs:r=>`${10*r}% Chance, ein Material zurückzubekommen`,
 leisetreter:r=>`Schlafende Gegner wachen ${15*r}% später auf`,sprintwunder:r=>`+${6*r}% Lauftempo, −${8*r}% Ausdauerverbrauch`,flinkefinger:r=>`${8*r}% schnellere Angriffe, +${10*r}% Bogenschaden`};
UI.skA=UI.skA||'staerke'; UI.skP=UI.skP||null;
UI.renderSkills=function(){ const P=G.player; ensureSkills(P); const A0=UI.skA; const ic=id=>`<img src="${GFX.iconURL[id]||''}" class="pix">`;
  let h=`<div class="sk7"><div class="sk7top"><span>Stufe <b>${P.lvl}</b></span><span class="skpts">Skillpunkte: <b>${P.sp}</b></span><span class="sksm">EP ${P.xp}/${xpNeed(P.lvl)} · Hefte ${Object.keys(P.books).length}/25</span></div><div class="sk7body"><div class="sk7l">`;
  for(const a in ATTRS){ const l=P.attr[a]; h+=`<div class="skcat ${a===A0?'on':''}" data-ska="${a}">${ic(ATTR_IC[a])}<div><b>${ATTRS[a].n}</b><small>Stufe ${l}/10</small></div></div>`; }
  h+=`<div class="skcat ${A0==='hefte'?'on':''}" data-ska="hefte">${ic('heft_waidmann1')}<div><b>Hefte</b><small>${Object.keys(P.books).length}/25 gelesen</small></div></div></div><div class="sk7m">`;
  let det='';
  if(A0==='hefte'){ for(const k in MAGS){ const n=magCount(k); h+=`<div class="pcard ${UI.skP===k?'on':''}" data-skp="${k}">${ic('heft_'+k+'1')}<b>${MAGS[k].n}</b><div class="pips">${'<i class="f"></i>'.repeat(n)}${'<i></i>'.repeat(5-n)}</div></div>`; }
    const k=MAGS[UI.skP]?UI.skP:Object.keys(MAGS)[0]; const n=magCount(k); det=`<h3>${ic('heft_'+k+'1')} ${MAGS[k].n}</h3><div class="info">${MAGS[k].d}.<br>${MAGS[k].full}.</div><div class="ranks">`; for(let i=1;i<=5;i++) det+=`<div class="rk ${P.books['heft_'+k+i]?'got':''}">Nr. ${i} ${P.books['heft_'+k+i]?'✓ gelesen':'– fehlt'}</div>`; det+=`</div><div class="info">Hefte findest du in Häusern, Tresoren, Dächern und Wracks.</div>`; }
  else { const A=ATTRS[A0], l=P.attr[A0], c=attrCost(l);
    h+=`<div class="pcard attrc ${!UI.skP||UI.skP==='attr'?'on':''}" data-skp="attr">${ic(ATTR_IC[A0])}<b>${A.n}</b><div class="pips">${'<i class="f"></i>'.repeat(l)}${'<i></i>'.repeat(10-l)}</div></div>`;
    for(const k in PERKS){ const p=PERKS[k]; if(p.a!==A0) continue; const r=P.perk[k]||0; const can=P.sp>0&&r<p.max&&l>=perkReq(r+1); h+=`<div class="pcard ${UI.skP===k?'on':''} ${can?'can':''}" data-skp="${k}">${ic(PERK_IC[k])}<b>${p.n}</b><div class="pips">${'<i class="f"></i>'.repeat(r)}${'<i></i>'.repeat(p.max-r)}</div></div>`; }
    const k=PERKS[UI.skP]&&PERKS[UI.skP].a===A0?UI.skP:null;
    if(!k){ det=`<h3>${ic(ATTR_IC[A0])} ${A.n} <small>${l}/10</small></h3><div class="info">${A.d}</div><div class="info">Die Attribut-Stufe begrenzt, wie hoch du die Perks darunter steigern kannst. Nächste Stufe kostet <b>${c}</b> Punkt${c>1?'e':''}.</div>
      <button data-attr="${A0}" class="buy" ${P.sp>=c&&l<10?'':'disabled'}>${l>=10?'Maximal':'Stufe '+(l+1)+' kaufen ('+c+')'}</button>`; }
    else { const p=PERKS[k], r=P.perk[k]||0; det=`<h3>${ic(PERK_IC[k])} ${p.n}</h3><div class="info">${p.d}</div><div class="ranks">`;
      for(let i=1;i<=p.max;i++){ const need=perkReq(i); det+=`<div class="rk ${i<=r?'got':i===r+1?'next':''}"><b>Rang ${i}</b> ${PERK_RT[k]?PERK_RT[k](i):''}<small>${i<=r?'✓ gelernt':`braucht ${A.n} ${need}`}</small></div>`; }
      const need=perkReq(r+1); det+=`</div><button data-perk="${k}" class="buy" ${P.sp>0&&r<p.max&&l>=need?'':'disabled'}>${r>=p.max?'Gemeistert':l<need?`Braucht ${A.n} ${need}`:P.sp<1?'Keine Punkte':'Rang '+(r+1)+' kaufen (1)'}</button>`; } }
  h+=`</div><div class="sk7r">${det}</div></div></div>`; $('pbody').innerHTML=h; };
document.addEventListener('click',ev=>{ const t=ev.target.closest('[data-ska],[data-skp]'); if(!t) return; if(t.dataset.ska){ UI.skA=t.dataset.ska; UI.skP=null; } else UI.skP=t.dataset.skp; sfx('click'); UI.renderPanel(); });
// ================= 13) Hauptschleife, Laden, Zeichnen =================
const _update4=update; update=function(dt){ _update4(dt); if(G.paused||!G.player) return; swingUpdate(dt); cometUpdate(dt); for(const e of G.ents) if(e.hpShow>0) e.hpShow-=dt; for(const b of (G.bubbles||[])) b.life-=dt; if(G.hordeMsgT>0) G.hordeMsgT-=dt;
  for(const n of G.nums){ if(n.vy!=null){ n.y+=n.vy*dt; n.vy+=60*dt; } } };
const _drawAim4=drawAim; drawAim=function(ox,oy){ try{ fireflies(ox,oy); cometDraw(ox,oy); }catch(e){} _drawAim4(ox,oy); };
const _drawWorld4b=drawWorld; drawWorld=function(){ if(G.w&&G.w.feat&&!G.w.feat.decorated) decorateWorld(); return _drawWorld4b(); };
const _ensureSkills4=ensureSkills; ensureSkills=function(P){ _ensureSkills4(P); if(P.inv) while(P.inv.length<INV_N) P.inv.push(null); };
// Lebensbalken & Namen über der Dunkelheit zeichnen (gut lesbar)
function entLabels(ox,oy){ for(const e of G.ents){ if(e.dead||e.kind!=='mob') continue; const d=MOBS[e.t]; if(!d) continue; const x=Math.round(e.x+e.w/2+ox), y=Math.round(e.y+e.h+oy); if(x<-60||x>G.VW+60||y<-60||y>G.VH+80) continue;
    if(e.hp<e.maxhp&&e.hpShow>0&&!d.boss){ const f=Math.max(0,e.hp/e.maxhp); const bw=e.w>24?30:22; ctx.globalAlpha=Math.min(1,e.hpShow*2); ctx.fillStyle='#120a06'; ctx.fillRect(x-bw/2-1,y+2,bw+2,5); ctx.fillStyle='#3a1410'; ctx.fillRect(x-bw/2,y+3,bw,3); ctx.fillStyle=f>0.5?'#5fd03a':f>0.25?'#e8c030':'#e0402a'; ctx.fillRect(x-bw/2,y+3,Math.round(bw*f),3); ctx.fillStyle='rgba(255,255,255,0.35)'; ctx.fillRect(x-bw/2,y+3,Math.round(bw*f),1); ctx.globalAlpha=1; }
    if((d.boss||d.mutant)&&!e.sleep){ const an=spriteAnchor(e.look||e.t,e.rad); const top=y-(an.ay-an.top); ctx.font='bold 7px monospace'; ctx.textAlign='center'; const lab=d.boss||e.hpShow>0?`${d.n}: ${Math.max(0,Math.ceil(e.hp))}/${Math.round(e.maxhp)}`:d.n; ctx.fillStyle='#000'; ctx.fillText(lab,x+1,top-4); ctx.fillStyle=d.boss?'#ffd8a0':'#ff9af0'; ctx.fillText(lab,x,top-5); ctx.textAlign='left'; } } }
const _drawAim4b=drawAim; drawAim=function(ox,oy){ try{ entLabels(ox,oy); }catch(e){} _drawAim4b(ox,oy); };
