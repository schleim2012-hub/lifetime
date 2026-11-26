// equip.js – Lifetime 0.3: Ausrüstung (Kopf, Brust, Beine, Füße, Zubehör)
'use strict';
const EQ_SLOTS=[['head','Kopf'],['body','Brust'],['legs','Beine'],['feet','Füße'],['acc','Zubehör']];
// neue Kleidung & Rüstung
I('jeans',{n:'Zerrissene Jeans',type:'armor',st:1,slot:'legs',ic:'pants',col:'#3a4658',def:1,warm:4});
I('cargohose',{n:'Cargohose',type:'armor',st:1,slot:'legs',ic:'pants',col:'#4a4a36',def:2,warm:8});
I('fellhose',{n:'Fellhose',type:'armor',st:1,slot:'legs',ic:'pants',col:'#7a6a50',def:2,warm:18});
I('panzerhose',{n:'Blech-Beinschienen',type:'armor',st:1,slot:'legs',ic:'pants',col:'#5a5e62',def:6,warm:4,speed:-0.04,d:'Schwer, aber hält Bisse ab.'});
I('turnschuhe',{n:'Ausgelatschte Turnschuhe',type:'armor',st:1,slot:'feet',ic:'boots',col:'#6a6a62',def:0,warm:3,speed:0.06,d:'Leicht – du läufst schneller.'});
I('arbeitsstiefel',{n:'Arbeitsstiefel',type:'armor',st:1,slot:'feet',ic:'boots',col:'#4a3020',def:2,warm:6});
I('kampfstiefel',{n:'Kampfstiefel',type:'armor',st:1,slot:'feet',ic:'boots',col:'#24241e',def:3,warm:8,speed:0.03});
I('bauhelm',{n:'Bauhelm',type:'armor',st:1,slot:'head',ic:'hardhat',col:'#c8a020',def:4,warm:2});
I('stahlhelm',{n:'Stahlhelm',type:'armor',st:1,slot:'head',ic:'helmet',col:'#4f5a36',def:6,warm:4});
I('gasmaske',{n:'Gasmaske',type:'armor',st:1,slot:'head',ic:'mask',col:'#3a3d40',def:1,warm:2,gas:true,d:'Schützt vor leuchtender Kotze und Strahlenpfützen.'});
I('blechpanzer',{n:'Schrott-Panzer',type:'armor',st:1,slot:'body',ic:'vest',col:'#6a6a66',def:8,warm:4,speed:-0.03,d:'Zusammengenietete Bleche.'});
I('stirnlampe',{n:'Stirnlampe',type:'armor',st:1,slot:'acc',ic:'lamp',col:'#888',def:0,warm:0,lamp:true,d:'Leuchtet dir den Weg – beide Hände bleiben frei.'});
I('hasenpfote',{n:'Hasenpfote',type:'armor',st:1,slot:'acc',ic:'paw',col:'#b8a890',def:0,warm:0,luck:true,d:'Glücksbringer: Gegner lassen öfter etwas fallen.'});
ITEMS.fluegel.slot='acc';
RECIPES.push({o:'fellhose',i:{leder:5,faser:4},at:'werkbank'},{o:'arbeitsstiefel',i:{leder:3,stoff:2},at:'werkbank'},{o:'panzerhose',i:{eisen:6,leder:2},at:'esse'},
  {o:'blechpanzer',i:{schrott:10,eisen:3,leder:2},at:'esse'},{o:'stirnlampe',i:{schrott:2,fackel:2,stoff:1},at:'werkbank'},{o:'gasmaske',i:{schrott:3,stoff:3,flasche:1},at:'werkbank'},{o:'jeans',i:{stoff:5},at:'werkbank'});
if(LOOT.haus) LOOT.haus.push(['jeans',1,1,.08],['turnschuhe',1,1,.07],['cargohose',1,1,.05],['hasenpfote',1,1,.02]);
if(LOOT.gang) LOOT.gang.push(['kampfstiefel',1,1,.25],['cargohose',1,1,.25],['stahlhelm',1,1,.12]);
if(LOOT.tresor) LOOT.tresor.push(['gasmaske',1,1,1],['kampfstiefel',1,1,.6]);
const EQ_MOBDROP={bauarbeiter:[['bauhelm',.12],['arbeitsstiefel',.08]],soldat:[['kampfstiefel',.1],['gasmaske',.06],['stahlhelm',.06]],schlurfer:[['jeans',.04],['turnschuhe',.03]],hinterwaeldler:[['cargohose',.12]],kotzer:[['gasmaske',.1]]};
function ensureEquip(P){ if(P.equip) return; P.equip={head:null,body:null,legs:null,feet:null,acc:null};
  // Altstände: bisher automatisch getragene Kleidung anlegen
  for(const [slot] of EQ_SLOTS){ let best=-1,bi=-1; P.inv.forEach((s,i)=>{ if(!s) return; const d=ITEMS[s.id]; if(d&&d.type==='armor'&&(d.slot===slot||(slot==='acc'&&d.slot==='back'))){ const v=d.def+d.warm/3; if(v>best){ best=v; bi=i; } } }); if(bi>=0){ P.equip[slot]=P.inv[bi].id; P.inv[bi].n--; if(P.inv[bi].n<=0) P.inv[bi]=null; } } }
armorStats=function(){ const P=G.player; ensureEquip(P); let def=0,warm=0,speed=0,wings=false,lamp=false,gas=false,luck=false; const best={};
  for(const [k] of EQ_SLOTS){ const id=P.equip[k]; if(!id) continue; const d=ITEMS[id]; if(!d) continue; best[k==='acc'&&d.wings?'back':k]=d; def+=d.def||0; warm+=d.warm||0; speed+=d.speed||0; if(d.wings) wings=true; if(d.lamp) lamp=true; if(d.gas) gas=true; if(d.luck) luck=true; }
  return {def,warm,wings,lamp,gas,luck,speed,best}; };
function equipItem(i){ const P=G.player; const s=P.inv[i]; if(!s) return; const d=ITEMS[s.id]; if(d.type!=='armor') return; const slot=d.slot==='back'?'acc':d.slot; const old=P.equip[slot];
  P.equip[slot]=s.id; s.n--; if(s.n<=0) P.inv[i]=null; if(old){ if(!P.inv[i]) P.inv[i]={id:old,n:1}; else { const left=addItem(old,1,true,true); if(left>0) spawnDrop(old,1,P.x+P.w/2,P.y); } } sfx('craft'); }
function unequip(slot){ const P=G.player; const id=P.equip[slot]; if(!id) return; const left=addItem(id,1,true,true); if(left>0){ msg('Rucksack voll!','#ff8a65'); return; } P.equip[slot]=null; sfx('click'); }
// Ausrüstung sichtbar an der Figur
const EQ_HATS={helm:'helmet',muetze:'beanie',bauhelm:'hardhat',stahlhelm:'army'};
function playerLook(){ const P=G.player; ensureEquip(P); const e=P.equip; const lk='player|'+EQ_SLOTS.map(([k])=>e[k]||'').join('|'); if(LOOKS[lk]) return lk;
  const L=Object.assign({},LOOKS.player);
  if(e.body){ const d=ITEMS[e.body]; L.shirt=d.col; L.shirtStyle=(e.body==='polizeiweste'||e.body==='blechpanzer')?'vest':'jacket'; if(e.body==='blechpanzer') L.shirt2='#8a8a86'; if(e.body==='polizeiweste') L.shirt2='#2a2e3a'; if(e.body==='fellmantel'||e.body==='seidenumhang') L.scarf=null; }
  if(e.legs){ L.pants=ITEMS[e.legs].col; L.torn=e.legs==='jeans'; } if(e.feet){ L.shoes=ITEMS[e.feet].col; }
  if(e.head){ if(e.head==='gasmaske') L.mask='gas'; else { L.hat=EQ_HATS[e.head]||'beanie'; L.hatCol=ITEMS[e.head].col; } }
  if(e.acc==='stirnlampe') L.lamp=true;
  LOOKS[lk]=L; return lk; }
const _drawPlayerOrig=drawPlayer;
drawPlayer=function(ox,oy){ const P=G.player; if(P.dead) return; const a=armorStats(); const x=P.x+P.w/2+ox, y=P.y+P.h+oy;
  if(P.inv_t>0&&((G.clock*20)|0)%2) return;
  if(a.wings){ const f=Math.sin(G.clock*(P.onGround?2:14))*3; const bx=x-(P.dir>0?10:-2); px(ctx,'#2a2018',bx-1,y-34-f,10,14); px(ctx,'#7a6a5a',bx,y-33-f,8,12); px(ctx,'#9a8a7a',bx,y-33-f,8,2); }
  const fr=frameFor(P,true); const it=heldItem(); const show=it&&(P.attackT>0||it==='fackel'||(ITEMS[it]&&(ITEMS[it].type==='tool'||ITEMS[it].type==='weapon'||ITEMS[it].type==='gun'||ITEMS[it].type==='bow')));
  drawSprite(ctx,playerLook(),fr,x,y,P.dir,{held:show?it:null,flash:P.hurtT>0}); };
// Glücksbringer & Kleidungs-Drops von Gegnern
const _killMobEq=killMob;
killMob=function(e,src){ const was=e.dead; _killMobEq(e,src); if(was||e.kind!=='mob') return; const fromP=src===G.player||src==='player'; if(!fromP) return; const luck=armorStats().luck;
  const L=EQ_MOBDROP[e.t]; if(L) for(const [id,p] of L) if(Math.random()<p*(luck?1.6:1)){ spawnDrop(id,1,e.x+e.w/2,e.y); break; }
  if(luck&&Math.random()<0.3) spawnDrop(['kronkorken','konserve','verband','muni'][Math.random()*4|0],1+(Math.random()*3|0),e.x+e.w/2,e.y); };
// Inventar mit Ausrüstungs-Spalte
UI.eqHTML=function(){ const P=G.player; ensureEquip(P); const a=armorStats(); let h='<div class="eqcol"><h3>Ausrüstung</h3><div class="eqtop"><div class="eqgrid">';
  for(const [k,n] of EQ_SLOTS){ const id=P.equip[k]; h+=`<div class="eqslot ${id?'full':''}" data-eq="${k}" title="${n}">${id?icon(id):`<span class="eqsil eq-${k}"></span>`}<span class="eqn">${n}</span></div>`; }
  h+=`</div><canvas id="eqprev" width="40" height="60"></canvas></div><div class="eqstats"><span>🛡 ${a.def}</span><span>🔥 ${a.warm}</span><span>👟 ${a.speed>=0?'+':''}${Math.round(a.speed*100)}%</span></div>`;
  h+=`</div>`; return h; };
UI.renderInv=function(){ const P=G.player; ensureEquip(P); const a=armorStats(); let h='<div class="row invrow">'+UI.eqHTML()+'<div><h3>Rucksack</h3><div class="grid" style="width:340px">'; P.inv.forEach((s,i)=>h+=UI.slotHTML(s,i,'p')); h+='</div></div><div class="invinfo">';
  const sel=UI.pick?P.inv[UI.pick.i]:null; if(sel){ const d=ITEMS[sel.id]; h+=`<h3>${icon(sel.id,20)} ${d.n} ×${sel.n}</h3><div class="info">${itemDesc(d)}</div><div class="btnrow">`;
    if(d.type==='armor') h+=`<button data-act="equip" class="good">Anziehen</button>`;
    if(d.type==='food') h+=`<button data-act="use">Essen/Trinken</button>`; if(d.type==='summon') h+=`<button data-act="use">Benutzen</button>`; if(d.type==='book') h+=`<button data-act="use">Lesen</button>`;
    if(UI.pick.i>=HOT_N) h+=`<button data-act="hot">In die Hand</button>`; h+=`<button data-act="drop" class="bad">Wegwerfen</button></div>`; }
  else if(UI.eqSel){ const id=P.equip[UI.eqSel]; const d=ITEMS[id]; h+=`<h3>${icon(id,20)} ${d.n}</h3><div class="info">${itemDesc(d)}</div><div class="btnrow"><button data-act="unequip">Ausziehen</button></div>`; }
  else h+=`<div class="info">Tippe ein Teil an, um es auszuwählen. Kleidung legst du mit „Anziehen“ an – sie erscheint dann an deiner Figur. Die ersten 8 Felder sind deine Schnellleiste.</div>`;
  h+=`<div class="info">Stufe ${P.lvl} · EP ${P.xp}/${xpNeed(P.lvl)} · Kronkorken ${countItem('kronkorken')}<br>Gesundheit ${Math.round(P.hp)}/${maxHp()} · Temperatur ${Math.round(G.temp||15)}°C</div></div></div>`;
  $('pbody').innerHTML=h; const pc=$('eqprev'); if(pc){ const g=pc.getContext('2d'); g.imageSmoothingEnabled=false; drawSprite(g,playerLook(),'i',20,58,1,{}); } };
document.addEventListener('click',ev=>{ const t=ev.target.closest('[data-eq],[data-act="equip"],[data-act="unequip"]'); if(!t) return; const P=G.player;
  if(t.dataset.eq){ const k=t.dataset.eq; if(UI.pick){ const s=P.inv[UI.pick.i]; const d=s&&ITEMS[s.id]; if(d&&d.type==='armor'&&((d.slot==='back'?'acc':d.slot)===k)){ equipItem(UI.pick.i); UI.pick=null; } else if(s) msg('Das passt hier nicht hin.','#ff8a65'); } else UI.eqSel=P.equip[k]?(UI.eqSel===k?null:k):null; sfx('click'); UI.renderInv(); UI.refreshHot(); return; }
  if(t.dataset.act==='equip'&&UI.pick){ equipItem(UI.pick.i); UI.pick=null; UI.renderInv(); UI.refreshHot(); return; }
  if(t.dataset.act==='unequip'&&UI.eqSel){ unequip(UI.eqSel); UI.eqSel=null; UI.renderInv(); UI.refreshHot(); return; } });
const _itemDescEq=itemDesc;
itemDesc=function(d){ if(d.type!=='armor') return _itemDescEq(d); const sl={head:'Kopf',body:'Brust',legs:'Beine',feet:'Füße',acc:'Zubehör',back:'Zubehör'}[d.slot]; return (d.d?d.d+'<br>':'')+`Platz: ${sl} · Schutz ${d.def} · Wärme ${d.warm}${d.speed?` · Tempo ${d.speed>0?'+':''}${Math.round(d.speed*100)}%`:''}`; };
