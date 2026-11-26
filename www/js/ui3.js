// ui3.js – Lifetime 0.3: düstere UI-Texturen, Pixel-Icons, Dialoge mit ▶ Weiter, Nachrichten länger, Zwei-Finger-Zoom
'use strict';
// ---- Texturen (prozedural, als CSS-Variablen) ----
function uiTex(){ const R=rngSeed(9001); const root=document.documentElement.style; const url=c=>`url(${c.toDataURL()})`;
  // rostiges, dunkles Metall
  const p=mkCanvas(96,96), g=p.getContext('2d'); g.fillStyle='#1b1512'; g.fillRect(0,0,96,96);
  for(let i=0;i<2600;i++){ const v=R(); g.fillStyle=v<0.5?`rgba(255,235,210,${R()*0.035})`:`rgba(0,0,0,${R()*0.12})`; g.fillRect(R()*96|0,R()*96|0,1+(R()*2|0),1); }
  for(let i=0;i<14;i++){ const x=R()*96, y=R()*96, r=6+R()*14; const gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,`rgba(110,48,18,${0.12+R()*0.1})`); gr.addColorStop(1,'rgba(110,48,18,0)'); g.fillStyle=gr; g.fillRect(x-r,y-r,r*2,r*2); }
  g.strokeStyle='rgba(255,230,200,0.05)'; for(let i=0;i<10;i++){ g.beginPath(); const x=R()*96,y=R()*96; g.moveTo(x,y); g.lineTo(x+R()*30-15,y+R()*8-4); g.stroke(); }
  root.setProperty('--tex-panel',url(p));
  // Rahmen (9-Slice, 24px Ecken, Nieten)
  const f=mkCanvas(48,48), h=f.getContext('2d'); const met=(x,y,w,hh,c)=>{ h.fillStyle=c; h.fillRect(x,y,w,hh); };
  met(0,0,48,48,'#0c0806'); met(1,1,46,46,'#4a3a2e'); met(2,2,44,44,'#2e241c'); met(3,3,42,42,'#5e4a38'); met(4,4,40,40,'#3a2e24'); met(6,6,36,36,'#120c09');
  for(let i=0;i<120;i++){ const x=R()*48|0, y=R()*48|0; if(x>6&&x<42&&y>6&&y<42) continue; h.fillStyle=R()<0.5?'rgba(140,70,30,0.5)':'rgba(0,0,0,0.35)'; h.fillRect(x,y,1,1); }
  for(const [x,y] of [[5,5],[39,5],[5,39],[39,39]]){ met(x-1,y-1,6,6,'#0c0806'); met(x,y,4,4,'#8a7a66'); met(x,y,2,2,'#c8b89a'); met(x+3,y+3,1,1,'#2a2018'); }
  root.setProperty('--tex-frame',url(f));
  // Knopf-Platte
  const b=mkCanvas(24,24), k=b.getContext('2d'); k.fillStyle='#0c0806'; k.fillRect(0,0,24,24); const lg=k.createLinearGradient(0,1,0,23); lg.addColorStop(0,'#6a5644'); lg.addColorStop(0.5,'#43362a'); lg.addColorStop(1,'#2a2019'); k.fillStyle=lg; k.fillRect(1,1,22,22); k.fillStyle='rgba(255,230,190,0.25)'; k.fillRect(2,2,20,1); k.fillStyle='rgba(0,0,0,0.4)'; k.fillRect(2,21,20,1);
  for(const [x,y] of [[3,3],[19,3],[3,19],[19,19]]){ k.fillStyle='#9a8a74'; k.fillRect(x,y,2,2); k.fillStyle='#2a2018'; k.fillRect(x+1,y+1,1,1); } root.setProperty('--tex-btn',url(b));
  const bh=mkCanvas(24,24), kh=bh.getContext('2d'); kh.drawImage(b,0,0); kh.globalCompositeOperation='source-atop'; kh.fillStyle='rgba(170,40,20,0.35)'; kh.fillRect(0,0,24,24); root.setProperty('--tex-btn-red',url(bh));
  const bg=mkCanvas(24,24), kg=bg.getContext('2d'); kg.drawImage(b,0,0); kg.globalCompositeOperation='source-atop'; kg.fillStyle='rgba(60,140,40,0.35)'; kg.fillRect(0,0,24,24); root.setProperty('--tex-btn-green',url(bg));
  // Slot
  const s=mkCanvas(20,20), q=s.getContext('2d'); q.fillStyle='#070504'; q.fillRect(0,0,20,20); q.fillStyle='#3e3228'; q.fillRect(1,1,18,18); q.fillStyle='#171210'; q.fillRect(2,2,16,16); q.fillStyle='rgba(0,0,0,0.5)'; q.fillRect(2,2,16,2); q.fillRect(2,2,2,16); q.fillStyle='rgba(255,220,180,0.08)'; q.fillRect(3,17,15,1); q.fillRect(17,3,1,15);
  root.setProperty('--tex-slot',url(s));
  // Filmkorn
  const n=mkCanvas(128,128), m=n.getContext('2d'); const id=m.createImageData(128,128); for(let i=0;i<id.data.length;i+=4){ const v=R()*255|0; id.data[i]=id.data[i+1]=id.data[i+2]=v; id.data[i+3]=R()<0.5?14:0; } m.putImageData(id,0,0); root.setProperty('--tex-grain',url(n));
  // Pixel-Icons für HUD/Buttons
  const icon=(draw)=>{ const c=mkCanvas(16,16), x=c.getContext('2d'); draw((a,b2,w,hh,col)=>{ x.fillStyle=col; x.fillRect(a,b2,w,hh); }); return url(c); };
  root.setProperty('--ic-inv',icon(P=>{ P(3,4,10,11,'#1a120c'); P(4,5,8,9,'#6a5030'); P(4,5,8,2,'#8a6a40'); P(6,2,4,3,'#1a120c'); P(7,3,2,2,'#6a5030'); P(5,9,6,3,'#4a3420'); P(7,10,2,1,'#c8a050'); }));
  root.setProperty('--ic-map',icon(P=>{ P(1,3,14,10,'#1a120c'); P(2,4,12,8,'#b8a070'); P(5,4,1,8,'#8a7450'); P(10,4,1,8,'#8a7450'); P(3,6,2,2,'#5a7a3a'); P(7,8,3,2,'#4a6a8a'); P(11,5,2,2,'#a03020'); }));
  root.setProperty('--ic-menu',icon(P=>{ P(3,3,10,10,'#1a120c'); P(4,4,8,8,'#6a6a66'); P(6,6,4,4,'#1a120c'); P(7,2,2,2,'#6a6a66'); P(7,12,2,2,'#6a6a66'); P(2,7,2,2,'#6a6a66'); P(12,7,2,2,'#6a6a66'); }));
  root.setProperty('--ic-hand',icon(P=>{ P(4,6,8,8,'#1a120c'); P(5,7,6,6,'#c4977a'); P(5,3,2,5,'#c4977a'); P(7,2,2,6,'#c4977a'); P(9,3,2,5,'#c4977a'); P(11,8,2,3,'#c4977a'); P(5,12,6,1,'#8a6a50'); }));
  root.setProperty('--ic-act',icon(P=>{ P(7,5,2,10,'#5a3a20'); P(3,2,10,4,'#1a120c'); P(4,3,8,2,'#9a9a96'); P(4,3,8,1,'#d8d8d0'); P(3,5,2,2,'#7a7a76'); }));
  root.setProperty('--ic-jump',icon(P=>{ P(7,4,2,9,'#d8ccb8'); P(5,6,6,1,'#d8ccb8'); P(6,5,4,1,'#d8ccb8'); P(4,13,8,1,'#8a7a66'); }));
}
// ---- Nachrichten länger sichtbar ----
msg=function(t,col){ G.msgs.push({t,col:col||'#fff',life:Math.min(14,6.5+String(t).length/18)}); if(G.msgs.length>5) G.msgs.shift(); UI.msgs(); };
// ---- NPC-Dialog: Seiten, Schreibmaschine, ▶ Weiter ----
function dlgPages(t){ const out=[]; const parts=String(t).match(/[^.!?…]+[.!?…]+[“"«»]?\s*|[^.!?…]+$/g)||[t]; let cur=''; for(const p of parts){ if((cur+p).length>150&&cur){ out.push(cur.trim()); cur=''; } cur+=p; } if(cur.trim()) out.push(cur.trim()); return out; }
UI.dlg=null;
function dlgSet(text){ UI.dlg={text,pages:dlgPages(text),i:0,shown:0}; }
UI.talk=function(n){ UI.npc=n; UI.cont=null; if(!n.met){ n.met=true; gainXP(20); } const d=NPCS[n.t]; UI.say=d.hi[Math.random()*d.hi.length|0]; dlgSet(UI.say); UI.npcTrade=false; UI.open('npc'); };
const _npcAct=UI.npcAct;
UI.npcAct=function(a){ if(a==='__next'){ const D=UI.dlg; if(D){ if(D.shown<D.pages[D.i].length){ D.shown=D.pages[D.i].length; } else if(D.i<D.pages.length-1){ D.i++; D.shown=0; } } sfx('click'); UI.renderNPC(); return; }
  const was=UI.say; const tr=a==='trade'; const wasTrade=UI.npcTrade&&UI.dlg; _npcAct(a); if(tr&&wasTrade){ UI.renderNPC(); return; } if(UI.say&&(UI.say!==was||tr||a==='rumor'||a==='theory')) { dlgSet(UI.say); UI.renderNPC(); } };
UI.renderNPC=function(){ const n=UI.npc, d=NPCS[n.t]; if(!UI.dlg) dlgSet(UI.say||d.hi[0]); const D=UI.dlg; const page=D.pages[D.i]; const done=D.shown>=page.length; const last=D.i>=D.pages.length-1;
  let h=`<div class="npcbox"><div class="portrait"><canvas id="npcc" width="32" height="44"></canvas></div><div class="say" data-n="__next"><div class="who"><b>${d.n}</b> <small>${d.role}</small></div><div id="saytxt">${page.slice(0,D.shown)}<span class="caret">▌</span></div>`;
  h+=`<div class="pg">${D.pages.length>1?`${D.i+1}/${D.pages.length}`:''}</div>`;
  if(!(done&&last)) h+=`<button class="next" data-n="__next">▶ Weiter</button>`; h+=`</div></div>`;
  if(done&&last){ h+=`<div class="choices">`; h+=`<button data-n="theory">Was ist passiert?</button><button data-n="rumor">Gerüchte?</button>`; if(d.trade) h+=`<button data-n="trade">Handeln</button>`;
    if(!d.trader){ if(!n.recruited) h+=`<button data-n="recruit">Komm mit mir!</button>`; else { h+=`<button data-n="follow">Folge mir</button><button data-n="base">Bewache die Basis</button><button data-n="home">Geh nach Hause</button>`; } } h+=`</div>`;
    if(UI.npcTrade){ h+=`<h3>Angebot <small>(du hast ${countItem('kronkorken')} Kronkorken)</small></h3>`; for(let i=0;i<d.trade.length;i++){ const [id,n2,pr0]=d.trade[i]; const pr=SKILLFX.price(pr0); h+=`<div class="rec">${icon(id)}<div class="nm">${n2}× ${ITEMS[id].n}<small>${pr} Kronkorken</small></div><button data-buy="${i}" ${countItem('kronkorken')>=pr?'':'disabled'}>Kaufen</button></div>`; }
      if(d.buy){ h+='<h3>Verkaufen</h3>'; for(const [id,pr] of SELL) if(countItem(id)>0) h+=`<div class="rec">${icon(id)}<div class="nm">${ITEMS[id].n} (hast ${countItem(id)})<small>${pr} Kronkorken pro Stück</small></div><button data-sell="${id}">Verkaufen</button></div>`; } } }
  $('pbody').innerHTML=h; const c=$('npcc').getContext('2d'); c.imageSmoothingEnabled=false; drawSprite(c,n.t,'i',16,43,1,{});
  if(!done) dlgType(); };
function dlgType(){ clearInterval(UI.dlgTimer); UI.dlgTimer=setInterval(()=>{ const D=UI.dlg; const el=$('saytxt'); if(!D||!el||$('panel').classList.contains('hide')){ clearInterval(UI.dlgTimer); return; } const page=D.pages[D.i]; D.shown=Math.min(page.length,D.shown+2); el.innerHTML=page.slice(0,D.shown)+'<span class="caret">▌</span>'; if(D.shown%8===0) sfx('tick');
    if(D.shown>=page.length){ clearInterval(UI.dlgTimer); UI.renderNPC(); } },28); }
// Käufe/Verkäufe sollen den Dialog nicht neu abspielen
const _uiClose=UI.close; UI.close=function(){ clearInterval(UI.dlgTimer); UI.dlg=null; return _uiClose.apply(UI,arguments); };
// ---- Schwebende Zahlen mit „Pop“ ----
// ---- Zwei-Finger-Zoom (nur leicht raus, pixelscharf) ----
function setupPinch(){ const cvs=$('c'); let d0=0, active=false; const dist=e=>{ const a=e.touches[0], b=e.touches[1]; return Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY); };
  cvs.addEventListener('touchstart',e=>{ if(e.touches.length>=2){ active=true; d0=dist(e); INPUT.aim=null; INPUT.aimFresh=false; } },{passive:false});
  cvs.addEventListener('touchmove',e=>{ if(!active||e.touches.length<2) return; INPUT.aim=null; INPUT.aimFresh=false; const r=dist(e)/d0; if(r<0.8&&!G.zoomOut){ G.zoomOut=true; resize(); d0=dist(e); zoomHint(); } else if(r>1.25&&G.zoomOut){ G.zoomOut=false; resize(); d0=dist(e); zoomHint(); } },{passive:false});
  const end=e=>{ if(e.touches.length<2) active=false; if(active) INPUT.aim=null; }; cvs.addEventListener('touchend',end); cvs.addEventListener('touchcancel',end);
  addEventListener('keydown',e=>{ if(G.state!=='play') return; if(e.key==='-'&&!G.zoomOut){ G.zoomOut=true; resize(); zoomHint(); } if((e.key==='+'||e.key==='=')&&G.zoomOut){ G.zoomOut=false; resize(); zoomHint(); } }); }
function zoomHint(){ sfx('click'); const el=$('zoomhint'); if(!el) return; el.textContent=G.zoomOut?'Zoom: weit':'Zoom: normal'; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); }
uiTex();
