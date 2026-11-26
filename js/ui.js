// Lifetime – Oberfläche (HUD, Rucksack, Herstellen, Gespräche, Menüs)
'use strict';
const $=id=>document.getElementById(id);
function icon(id,sz){ return `<img src="${GFX.iconURL[id]||''}" style="width:${sz||28}px;height:${sz||28}px">`; }
const UI={pick:null,tab:'inv',cont:null,hudT:0,
 refreshHot(){ const P=G.player; if(!P) return; let h=''; for(let i=0;i<HOT_N;i++){ const s=P.inv[i]; h+=`<div class="slot ${i===P.sel?'sel':''}" data-i="${i}"><span class="k">${i+1}</span>${s?icon(s.id)+(s.n>1?`<span class="n">${s.n}</span>`:''):''}</div>`; } $('hot').innerHTML=h; const cur=P.inv[P.sel]; $('hotname').textContent=cur?ITEMS[cur.id].n:'';
   $('a-lbl').textContent=actLabel(); if(!$('panel').classList.contains('hide')&&UI.tab==='inv') UI.renderInv(); },
 msgs(){ $('msgs').innerHTML=G.msgs.map(m=>`<div style="color:${m.col};opacity:${Math.min(1,m.life)}">${m.t}</div>`).join(''); },
 hud(dt){ UI.hudT-=dt; if(UI.hudT>0) return; UI.hudT=0.15; const P=G.player;
   const set=(id,v)=>$(id).firstElementChild.style.width=Math.max(0,Math.min(100,v))+'%';
   set('b-hp',P.hp/maxHp()*100); set('b-hu',P.hu); set('b-th',P.th); set('b-st',P.stam/maxStam()*100); set('b-wa',P.warm); set('b-br',P.breath); $('b-br').style.display=P.breath<100?'block':'none';
   $('xpline').firstElementChild.style.width=(P.xp/xpNeed(P.lvl)*100)+'%';
   UI.hearts(); UI.minimap();
   const h=hour(); const hh=Math.floor(h), mm=Math.floor((h-hh)*60/10)*10; $('clock').textContent=`Tag ${G.day} · ${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}${isNight()?' 🌙':' ☀'}`;
   const left=(7-G.day%7)%7; $('bmc').textContent=G.bloodmoon?`🩸 BLUTMOND · ${Math.max(0,G.bmSpawned-G.bmKills)} übrig`:left===0?'🩸 Blutmond heute Nacht!':`🩸 in ${left} ${left===1?'Tag':'Tagen'}`;
   for(const m of G.msgs) m.life-=0.15; const before=G.msgs.length; G.msgs=G.msgs.filter(m=>m.life>0); UI.msgs();
   const b=G.boss&&!G.boss.dead?G.boss:G.ents.find(e=>!e.dead&&e.kind==='mob'&&MOBS[e.t].mutant&&!e.sleep&&dist(e,P)<20*T);
   if(b){ $('bossbar').classList.remove('hide'); $('bossname').textContent=MOBS[b.t].n; $('bosshp').firstElementChild.style.width=(b.hp/b.maxhp*100)+'%'; } else $('bossbar').classList.add('hide');
   const it=findInteract(); $('e-lbl').textContent=it?it.lbl:'—'; $('btn-e').classList.toggle('dim',!it); $('a-lbl').textContent=actLabel();
   if(P.sp>0) $('btn-inv').style.boxShadow='0 0 8px #b388ff'; else $('btn-inv').style.boxShadow='';
 },
 hearts(){ const P=G.player, mx=maxHp(), n=Math.ceil(mx/20); const c=$('hearts'); const W=n*11; if(c.width!==W){ c.width=W; c.style.width=(W*1.5)+'px'; } const g=c.getContext('2d'); g.clearRect(0,0,c.width,c.height);
   const H=['..XX.XX..','.XrrXrrX.','XrwrrrrrX','XrrrrrrrX','.XrrrrrX.','..XrrrX..','...XrX...','....X....'];
   for(let i=0;i<n;i++){ const f=Math.max(0,Math.min(1,(P.hp-i*20)/20)); const fx=Math.round(f*9); for(let y=0;y<8;y++)for(let x=0;x<9;x++){ const ch=H[y][x]; if(ch==='.') continue; let col=ch==='X'?'#3a0000':(x<fx?(ch==='w'?'#ffd0d0':y<3?'#ff5a5a':'#e01e1e'):'#4a2a2a'); g.fillStyle=col; g.fillRect(i*11+x+1,y+1,1,1);} }
   $('lifelbl').textContent=`Leben: ${Math.max(0,Math.ceil(P.hp))}/${mx}`; },
 mmZoom:2,
 minimap(){ const c=$('mm'); if(!c||!G.w) return; const g=c.getContext('2d'), w=G.w, P=G.player; const Wc=c.width,Hc=c.height; const z=UI.mmZoom;
   if(!UI.mmCols){ UI.mmCols=TILES.map(t=>{ if(!t) return [0,0,0]; const v=parseInt((t.c.length===4?t.c.replace(/#(.)(.)(.)/,'#$1$1$2$2$3$3'):t.c).slice(1),16); return [v>>16&255,v>>8&255,v&255]; }); }
   const id=g.createImageData(Wc,Hc), D=id.data; const ptx=(P.x+P.w/2)/T, pty=(P.y+P.h/2)/T; const dl=dayLight();
   for(let j=0;j<Hc;j++)for(let i=0;i<Wc;i++){ const x=Math.floor(ptx+(i-Wc/2)*z), y=Math.floor(pty+(j-Hc/2)*z); const k=(j*Wc+i)*4; let r=0,gg=0,b=0;
     if(x>=0&&y>=0&&x<w.W&&y<w.H&&G.explored[(y>>3)*200+(x>>3)]){ const t=w.tiles[y*w.W+x]; if(t){ [r,gg,b]=UI.mmCols[t]; } else if(w.bg[y*w.W+x]){ r=40;gg=30;b=28; } else if(y<w.sky[x]){ r=60+80*dl|0; gg=90+110*dl|0; b=140+100*dl|0; } else { r=20;gg=14;b=10; } }
     D[k]=r; D[k+1]=gg; D[k+2]=b; D[k+3]=255; }
   g.putImageData(id,0,0);
   const dot=(e,col,s)=>{ const x=Wc/2+((e.x+e.w/2)/T-ptx)/z, y=Hc/2+((e.y+e.h/2)/T-pty)/z; if(x<0||y<0||x>Wc||y>Hc) return; g.fillStyle='#000'; g.fillRect(x-s/2-1|0,y-s/2-1|0,s+2,s+2); g.fillStyle=col; g.fillRect(x-s/2|0,y-s/2|0,s,s); };
   for(const e of G.ents){ if(e.dead) continue; if(e.kind==='npc') dot(e,'#ffd54f',3); else if(hostile(e)&&!e.sleep) dot(e,MOBS[e.t].mutant||MOBS[e.t].boss?'#e040fb':'#ff3b3b',2); }
   dot(P,'#ffffff',3); },
 floats(ox,oy){ const box=$('floats'); if(!box) return; const cv=$('c'); const sc=cv.getBoundingClientRect().width/G.VW; UI.fpool=UI.fpool||[]; const pool=UI.fpool; let i=0;
   for(const n of G.nums){ let el=pool[i]; if(!el){ el=document.createElement('div'); box.appendChild(el); pool.push(el); } i++; el.style.display=''; if(el._t!==n.t){ el.textContent=n.t; el._t=n.t; } el.style.color=n.col; el.className=n.key?'':(n.crit?'dmg crit':'dmg'); el.style.left=((n.x+ox)*sc)+'px'; el.style.top=((n.y+oy)*sc)+'px'; el.style.opacity=Math.min(1,n.life*2); if(!n.key){ const age=(n.life0||(n.life0=n.life))-n.life; const k=age<0.14?1.9-age*6.4:1; el.style.transform=`translate(-50%,-100%) scale(${k.toFixed(2)})`; } else el.style.transform=''; }
   for(;i<pool.length;i++) if(pool[i].style.display!=='none') pool[i].style.display='none'; },
 open(tab){ UI.tab=tab||'inv'; $('panel').classList.remove('hide'); G.paused=true; UI.renderPanel(); sfx('click'); },
 close(){ $('panel').classList.add('hide'); G.paused=false; UI.cont=null; UI.pick=null; UI.npc=null; UI.refreshHot(); },
 renderPanel(){ const tabs=UI.cont?[['cont',UI.contName]]:UI.npc?[['npc',NPCS[UI.npc.t].n]]:UI.tab==='menu'||UI.tab==='opt'||UI.tab==='help'?[['menu','Menü'],['opt','Optionen'],['help','Anleitung']]:[['inv','Rucksack'],['craft','Herstellen'],['skills','Skills'+(G.player.sp?` (${G.player.sp})`:'')],['map','Karte'],['story','Tagebuch']];
   $('ptabs').innerHTML=tabs.map(([k,n])=>`<div data-t="${k}" class="${(UI.tab===k||(k==='cont'&&UI.cont)||(k==='npc'&&UI.npc))?'on':''}">${n}</div>`).join('');
   const f={inv:UI.renderInv,craft:UI.renderCraft,skills:UI.renderSkills,map:UI.renderMap,story:UI.renderStory,menu:UI.renderMenu,opt:UI.renderOpt,help:UI.renderHelp,cont:UI.renderCont,npc:UI.renderNPC}[UI.cont?'cont':UI.npc?'npc':UI.tab]; f&&f(); },
 slotHTML(s,i,src){ return `<div class="slot ${UI.pick&&UI.pick.src===src&&UI.pick.i===i?'pick':''} ${src==='p'&&i===G.player.sel?'sel':''}" data-i="${i}" data-src="${src}">${i<HOT_N&&src==='p'?`<span class="k">${i+1}</span>`:''}${s?icon(s.id)+(s.n>1?`<span class="n">${s.n}</span>`:''):''}</div>`; },
 renderInv(){ const P=G.player; const a=armorStats(); let h='<div class="row" style="flex-wrap:wrap"><div><h3>Rucksack</h3><div class="grid" style="width:340px">'; P.inv.forEach((s,i)=>h+=UI.slotHTML(s,i,'p')); h+='</div></div><div style="flex:1;min-width:200px">';
   const sel=UI.pick?P.inv[UI.pick.i]:null; if(sel){ const d=ITEMS[sel.id]; h+=`<h3>${icon(sel.id,20)} ${d.n} ×${sel.n}</h3><div class="info">${itemDesc(d)}</div>`;
     if(d.type==='food') h+=`<button data-act="use">Essen/Trinken</button>`; if(d.type==='summon') h+=`<button data-act="use">Benutzen</button>`; if(d.type==='book') h+=`<button data-act="use">Lesen</button>`;
     if(UI.pick.i>=HOT_N) h+=`<button data-act="hot">In die Hand</button>`; h+=`<button data-act="drop">Wegwerfen</button>`; }
   else h+=`<div class="info">Tippe ein Teil an, um es auszuwählen. Tippe danach ein anderes Feld an, um es zu tauschen. Die ersten 8 Felder sind deine Schnellleiste.</div>`;
   h+=`<h3>Getragen</h3><div class="info">${['head','body','back'].map(k=>a.best[k]?`${icon(a.best[k].id,18)} ${a.best[k].n}`:'').filter(Boolean).join('<br>')||'Nichts – Kleidung im Rucksack wird automatisch getragen.'}<br>Schutz ${a.def} · Wärme ${a.warm}</div>`;
   h+=`<div class="info">Stufe ${P.lvl} · EP ${P.xp}/${xpNeed(P.lvl)} · Kronkorken ${countItem('kronkorken')}<br>Gesundheit ${Math.round(P.hp)}/${maxHp()} · Temperatur ${Math.round(G.temp||15)}°C</div></div></div>`;
   $('pbody').innerHTML=h; },
 slotTap(i,src){ const P=G.player; const arr=src==='p'?P.inv:G.containers[UI.cont];
   if(UI.cont){ // Container: Tippen verschiebt sofort
     const s=arr[i]; if(!s) return; if(src==='p'){ G.containers[UI.cont].push(s); P.inv[i]=null; } else { const left=addItem(s.id,s.n,true,true); if(left>0){ s.n=left; msg('Rucksack voll!'); } else arr.splice(i,1); } sfx('pick'); UI.renderPanel(); UI.refreshHot(); return; }
   if(!UI.pick){ if(arr[i]) UI.pick={i,src}; if(i<HOT_N) P.sel=i; }
   else { if(UI.pick.i===i){ UI.pick=null; } else { const a=P.inv[UI.pick.i], b=P.inv[i]; if(a&&b&&a.id===b.id&&ITEMS[a.id].st>1){ const k=Math.min(a.n,ITEMS[b.id].st-b.n); b.n+=k; a.n-=k; if(a.n<=0) P.inv[UI.pick.i]=null; } else { P.inv[UI.pick.i]=b; P.inv[i]=a; } UI.pick=null; } }
   sfx('click'); UI.renderInv(); UI.refreshHot(); },
 renderCraft(){ const P=G.player; let h=''; const st={}; for(const k in STATIONS) st[k]=nearStation(k);
   h+=`<div class="info" style="margin:0 0 6px">In der Nähe: ${Object.keys(STATIONS).filter(k=>st[k]).map(k=>STATIONS[k]).join(', ')}</div>`;
   const list=RECIPES.map((r,idx)=>({r,idx,ok:canCraft(r),st:st[r.at]})).sort((a,b)=>(b.ok-a.ok)||(b.st-a.st));
   for(const {r,idx,ok,st:s} of list){ const d=ITEMS[r.o]; const ing=Object.entries(r.i).map(([k,n])=>`<span class="${countItem(k)>=n?'have':'need'}">${n}× ${ITEMS[k].n}</span>`).join(', ');
     let lock=''; if(r.sk) for(const k in r.sk) if(P.sk[k]<r.sk[k]) lock=`Skill ${SKILLS[k].n} ${r.sk[k]} nötig`; if(!s) lock=lock||`Braucht: ${STATIONS[r.at]}`;
     h+=`<div class="rec ${ok?'':'no'}">${icon(r.o)}<div class="nm"><b>${d.n}${(r.n||1)>1?' ×'+r.n:''}</b><small>${ing}${lock?` · <span class="need">${lock}</span>`:''}</small></div><button data-craft="${idx}" ${ok?'':'disabled'}>Herstellen</button><button data-craft5="${idx}" ${ok?'':'disabled'}>5×</button></div>`; }
   $('pbody').innerHTML=h; },
 renderSkills(){ const P=G.player; let h=`<div class="info">Stufe ${P.lvl} · Skillpunkte: <b>${P.sp}</b>. Erfahrung bekommst du für Kämpfe, Plündern, Lager und Blutmonde.</div>`;
   for(const k in SKILLS){ const s=SKILLS[k]; h+=`<div class="skill"><div class="nm"><b>${s.n}</b> <span class="lv">${P.sk[k]}/${s.max}</span><br><small>${s.d}</small></div><button data-skill="${k}" ${P.sp>0&&P.sk[k]<s.max?'':'disabled'}>+1</button></div>`; }
   $('pbody').innerHTML=h; },
 renderMap(){ const w=G.w; $('pbody').innerHTML=`<canvas id="mapc" width="${w.W}" height="${w.H}"></canvas><div class="info">Rot: du · Grün: Bett · Gelb: Leute · Violett: Lager & Siedlungen. Schwarze Flächen sind noch unerforscht.</div>`;
   const c=$('mapc'), g=c.getContext('2d'); const img=g.createImageData(w.W,w.H); const D=img.data; const cols=TILES.map(t=>{ if(!t) return [0,0,0]; const s=t.c.slice(1); const h=s.length===3?s.split('').map(x=>x+x).join(''):s; const v=parseInt(h,16); return [v>>16&255,v>>8&255,v&255]; });
   for(let y=0;y<w.H;y++)for(let x=0;x<w.W;x++){ const i=y*w.W+x; const k=(y>>3)*200+(x>>3); let r=0,gg=0,b=0; if(G.explored[k]){ const t=w.tiles[i]; if(t){ [r,gg,b]=cols[t]; } else if(w.bg[i]){ r=50;gg=40;b=35; } else if(y<w.sky[x]){ r=110;gg=160;b=220; } else { r=30;gg=22;b=16; } } D[i*4]=r;D[i*4+1]=gg;D[i*4+2]=b;D[i*4+3]=255; }
   g.putImageData(img,0,0); const P=G.player; g.fillStyle='#ff1744'; g.fillRect(P.x/T-3,P.y/T-3,7,7); g.fillStyle='#69f0ae'; g.fillRect(P.spawn.x-2,P.spawn.y-2,5,5);
   g.fillStyle='#ffd54f'; for(const e of G.ents) if(e.kind==='npc'&&G.explored[((e.y/T)>>3)*200+((e.x/T)>>3)]) g.fillRect(e.x/T-2,e.y/T-2,4,4);
   g.fillStyle='#e040fb'; for(const c2 of w.feat.camps) if(G.explored[(c2.y>>3)*200+(c2.x0>>3)]) g.fillRect(c2.x0,c2.y-6,c2.x1-c2.x0,2); },
 renderStory(){ const met=G.ents.filter(e=>e.kind==='npc'&&e.met); let h=`<h3>Tagebuch – Tag ${G.day}</h3><div class="info">Unser Flieger ist abgestürzt. Seit diesem grellen Licht am Himmel ist nichts mehr normal. Niemand weiß, was passiert ist – jeder hat eine andere Theorie.</div>`;
   for(const e of met){ const d=NPCS[e.t]; h+=`<div class="info"><b>${d.n}</b> (${d.role}) glaubt: <i>${d.theory}</i></div>`; }
   if(!met.length) h+='<div class="info">Noch keine Überlebenden getroffen. Vielleicht in den Häusern oder in der Stadt?</div>';
   const bosses=[['fleischberg','Der Fleischberg'],['geierkoenigin','Die Geierkönigin']]; h+=`<div class="info">Bosse: ${bosses.map(([k,n])=>`${n} ${G.flags['boss_'+k]?'✔':'✖'}`).join(' · ')}<br>Lager überfallen: ${G.w.feat.camps.filter(c=>c.cleared).length}/${G.w.feat.camps.length} · Erledigte Gegner: ${G.stats.kills}</div>`;
   $('pbody').innerHTML=h; },
 renderMenu(){ $('pbody').innerHTML=`<div style="display:flex;flex-direction:column;align-items:flex-start"><button data-m="resume">Weiterspielen</button><button data-m="save">Speichern</button><button data-m="load">Letzten Spielstand laden</button><button data-m="title">Zum Hauptmenü (speichert)</button></div><div class="info">Das Spiel speichert automatisch alle 2 Minuten und bei jedem neuen Tag.</div>`; },
 renderOpt(){ const o=G.opts; $('pbody').innerHTML=`<div class="opt">Musik <input type="range" min="0" max="1" step="0.05" value="${o.mus}" id="o-mus"></div><div class="opt">Geräusche <input type="range" min="0" max="1" step="0.05" value="${o.sfx}" id="o-sfx"></div>
   <div class="opt">Sichtweite <button data-z="240">Nah</button><button data-z="300">Normal</button><button data-z="370">Weit</button> <span>aktuell ${o.zoomVH===240?'Nah':o.zoomVH===300?'Normal':'Weit'}</span></div>
   <div class="opt">Knöpfe <button data-c="0.85">Klein</button><button data-c="1">Normal</button><button data-c="1.2">Groß</button></div>
   <h3>Credits</h3><div class="credits">Lifetime – ein Spiel für Pete.<br>Grafik: Item-Icons, NPC-Porträts, Tier-/Mutanten-Sprites und Möbel wurden mit einem KI-Bildgenerator erstellt und auf ein Pixelraster heruntergerechnet; Figuren-Animationen, Ghule, Zombies, Blöcke und Effekte werden im Spiel selbst gezeichnet.<br>Musik: Tag-, Nacht-, Kampf- und Blutmond-Thema mit ElevenLabs Music erzeugt (Boss nutzt das Kampf-Thema, Höhle das Nacht-Thema). Geräusche: das Zombie-Stöhnen ist eine ElevenLabs-Aufnahme (auch tiefer/höher verfremdet für Brüllen, Schreie und Würgen); alle übrigen Geräusche entstehen live im Spiel (eigener Synthesizer mit Hall und Schichten).<br>Schrift: Systemschrift.<br>Alle Namen und Anspielungen auf Filme sind Parodie.</div>`; },
 renderHelp(){ $('pbody').innerHTML=`<div class="info"><b>Ziel:</b> Überlebe nach dem Absturz so lange wie möglich. Alle 7 Tage kommt der Blutmond mit einer Horde.</div><div class="info"><b>Neu in 0.3:</b> Kleidung legst du im Rucksack mit „Anziehen“ an (Kopf, Brust, Beine, Füße, Zubehör) – sie schützt, wärmt und ist an deiner Figur zu sehen. Gefällte Bäume zerfallen in Stücke, die du aufsammeln musst. Mit zwei Fingern zusammenziehen zoomst du leicht heraus, auseinanderziehen zoomt zurück. Rund um den Absturzort ist es ruhig – je weiter du wanderst und je tiefer du gräbst, desto gefährlicher wird es. Vorsicht vor leuchtender Kotze: Eine Gasmaske schützt.</div>
   <div class="info"><b>Steuerung:</b> Links der Stick zum Laufen (nach oben = springen, Leiter klettern; nach unten = durch Plattformen). Rechts: <b>⤒</b> Springen, <b>⚒</b> Angreifen/Abbauen/Bauen in Blickrichtung, <b>✋</b> Benutzen (Tür, Kiste, Werkbank, Reden, Bett).<br>Du kannst auch direkt auf die Welt tippen und halten: dort wird abgebaut, gebaut oder geschossen. Oben die Schnellleiste – Teil antippen zum Halten.</div>
   <div class="info"><b>Erste Schritte:</b> Plündere das Wrack. Fälle Bäume mit ⚒ (Holz). Sammle Steinchen und Gras (Fasern). Stell im 🎒 → Herstellen eine Steinaxt, Spitzhacke und ein Lagerfeuer her. Fülle die Flasche am See und koche das Wasser am Feuer ab.</div>
   <div class="info"><b>Überleben:</b> ❤ Gesundheit, 🍖 Hunger, 💧 Durst, ⚡ Ausdauer, 🌡 Wärme. Nachts wird es kalt – Feuer, Kleidung und Häuser mit Hintergrundwand wärmen.</div>
   <div class="info"><b>Herstellen:</b> Hände → Lagerfeuer → Werkbank → Esse → Chemiestation. Manche Rezepte brauchen Perks (🎒 → Skills). Pro Stufenaufstieg gibt es einen Skillpunkt: steigere die 5 Attribute (Wahrnehmung, Stärke, Fitness, Intellekt, Agilität) und kaufe Perk-Ränge – höhere Ränge brauchen höhere Attribute. Gefundene Hefte lesen gibt Dauer-Boni, eine komplette Reihe einen Extra-Bonus.</div>
   <div class="info"><b>Leute:</b> Überlebende (gelber Punkt) wohnen in Häusern und der Stadt. Rede mit ihnen, handle mit Kronkorken oder wirb sie an – sie helfen beim Kämpfen, Heilen, Reparieren und Sammeln.</div>
   <div class="info"><b>Gefahren:</b> Schlurfer & Co. werden nachts stärker. Sumpfbrüder haben Lager voller Beute. Kannibalen beobachten dich nur – bis du sie angreifst oder bestiehlst. Mutanten hausen tief in den Höhlen. Bosse rufst du mit besonderen Gegenständen.</div>`; },
 openContainer(key,name){ UI.cont=key; UI.contName=name; UI.open('cont'); },
 renderCont(){ const arr=G.containers[UI.cont]||[]; let h=`<div class="row" style="flex-wrap:wrap"><div><h3>${UI.contName}</h3><div class="grid" style="width:340px">`; for(let i=0;i<Math.max(8,arr.length);i++) h+=UI.slotHTML(arr[i],i,'c'); h+=`</div><button data-act="takeall">Alles nehmen</button></div><div><h3>Rucksack</h3><div class="grid" style="width:340px">`; G.player.inv.forEach((s,i)=>h+=UI.slotHTML(s,i,'p')); h+='</div><div class="info">Antippen = rüberlegen.</div></div></div>'; $('pbody').innerHTML=h; },
 talk(n){ UI.npc=n; UI.say=null; if(!n.met){ n.met=true; gainXP(20); } UI.open('npc'); },
 renderNPC(){ const n=UI.npc, d=NPCS[n.t]; const P=G.player; let txt=UI.say||d.hi[Math.random()*d.hi.length|0];
   let h=`<div class="npcbox"><canvas id="npcc" width="32" height="44"></canvas><div class="say"><b>${d.n}</b> <small>(${d.role})</small><br>${txt}</div></div><div style="margin-top:6px">`;
   h+=`<button data-n="theory">Was ist passiert?</button><button data-n="rumor">Gerüchte?</button>`; if(d.trade) h+=`<button data-n="trade">Handeln</button>`;
   if(!d.trader){ if(!n.recruited) h+=`<button data-n="recruit">Komm mit mir!</button>`; else { h+=`<button data-n="follow">Folge mir</button><button data-n="base">Bewache die Basis</button><button data-n="home">Geh nach Hause</button>`; } }
   h+=`</div>`;
   if(UI.npcTrade){ h+=`<h3>Angebot (du hast ${countItem('kronkorken')} Kronkorken)</h3>`; for(let i=0;i<d.trade.length;i++){ const [id,n2,pr0]=d.trade[i]; const pr=SKILLFX.price(pr0); h+=`<div class="rec">${icon(id)}<div class="nm">${n2}× ${ITEMS[id].n}<small>${pr} Kronkorken</small></div><button data-buy="${i}" ${countItem('kronkorken')>=pr?'':'disabled'}>Kaufen</button></div>`; }
     if(d.buy){ h+='<h3>Verkaufen</h3>'; for(const [id,pr] of SELL) if(countItem(id)>0) h+=`<div class="rec">${icon(id)}<div class="nm">${ITEMS[id].n} (hast ${countItem(id)})<small>${pr} Kronkorken pro Stück</small></div><button data-sell="${id}">Verkaufen</button></div>`; } }
   $('pbody').innerHTML=h; const c=$('npcc').getContext('2d'); c.imageSmoothingEnabled=false; drawSprite(c,n.t,'i',16,43,1,{}); },
 npcAct(a){ const n=UI.npc, d=NPCS[n.t]; UI.npcTrade=false;
   if(a==='theory') UI.say=d.theory; if(a==='rumor'){ UI.say=RUMORS[G.rumor++%RUMORS.length]; }
   if(a==='trade'){ UI.npcTrade=true; UI.say='Schau dich um. Nur Kronkorken, kein Anschreiben!'; }
   if(a==='recruit'){ const wish=d.wish; const ok=Object.entries(wish).every(([k,v])=>countItem(k)>=v); const ws=Object.entries(wish).map(([k,v])=>`${v}× ${ITEMS[k].n}`).join(' und ');
     if(ok){ for(const [k,v] of Object.entries(wish)) removeItem(k,v); n.recruited=true; n.mode='follow'; UI.say=`Abgemacht! Ich komme mit. ${d.skilltxt}`; msg(`${d.n} schließt sich dir an!`,'#69f0ae'); gainXP(60); sfx('level'); }
     else UI.say=`Mitkommen? Nur wenn du mir ${ws} bringst. Eine Hand wäscht die andere.`; }
   if(a==='follow'){ n.mode='follow'; UI.say='Ich bleib dicht hinter dir.'; } if(a==='base'){ n.mode='base'; UI.say='Ich pass auf dein Bett und die Basis auf.'; } if(a==='home'){ n.mode='home'; n.recruited=false; UI.say='Na gut. Du weißt, wo ich wohne.'; }
   sfx('click'); UI.renderNPC(); },
 toastTalk(e){ const lines=['Der Kannibale starrt dich wortlos an und kaut auf etwas.','Er zeigt auf dich, dann auf seinen Bauch. Lieber weitergehen.','Sie flüstern untereinander. Du verstehst nur „lecker“.','Er bietet dir einen grünen Keks an. Du lehnst höflich ab.']; msg(lines[Math.random()*lines.length|0],'#c5e1a5'); },
 death(){ const d=document.createElement('div'); d.className='dead'; d.innerHTML=`<div>Du bist gestorben</div><div style="font-size:15px;margin:8px">Überlebt bis Tag ${G.day}</div><button>Am Bett aufwachen</button>`; document.body.appendChild(d); d.querySelector('button').onclick=()=>{ d.remove(); respawn(); }; },
 fade(){ const f=$('fade'); f.style.opacity=1; setTimeout(()=>f.style.opacity=0,700); },
};
const SELL=[['schrott',1],['leder',3],['federn',1],['knochen',1],['fleisch',4],['kekse',2],['eisenerz',2],['kohle',1],['seide',5],['beeren',1],['fleisch_roh',2]];
function itemDesc(d){ let s=d.d?d.d+'<br>':''; if(d.food){ const f=d.food; const parts=[]; if(f.hu) parts.push(`Hunger ${f.hu>0?'+':''}${f.hu}`); if(f.th) parts.push(`Durst ${f.th>0?'+':''}${f.th}`); if(f.hp) parts.push(`Gesundheit ${f.hp>0?'+':''}${f.hp}`); if(f.st) parts.push(`Ausdauer +${f.st}`); s+=parts.join(' · '); }
  if(d.dmg&&d.type!=='food') s+=`Schaden ${d.dmg}${d.ranged?' · Munition: '+ITEMS[d.ranged.ammo].n:''}`; if(d.tool&&d.id!=='hand'){ s+=`<br>${d.tool.axe?'Axt '+d.tool.axe+' ':''}${d.tool.pick?'Hacke '+d.tool.pick:''}`; }
  if(d.type==='armor') s+=`Schutz ${d.def} · Wärme ${d.warm} (wird automatisch getragen)`; if(d.type==='block') s+='Zum Bauen: in die Hand nehmen und ⚒ drücken oder auf die Welt tippen.'; if(d.type==='wall') s+='Hintergrundwand: in die Hand nehmen und hinter dir platzieren.'; return s||'Material.'; }
function canCraft(r){ const P=G.player; if(!nearStation(r.at)) return false; if(r.sk) for(const k in r.sk) if(P.sk[k]<r.sk[k]) return false; for(const [k,n] of Object.entries(r.i)) if(countItem(k)<n) return false; return true; }
function craft(idx,times){ const r=RECIPES[idx]; let made=0; for(let t=0;t<times;t++){ if(!canCraft(r)) break; for(const [k,n] of Object.entries(r.i)) removeItem(k,n); addItem(r.o,r.n||1); made++; if(Math.random()<SKILLFX.save()){ const ks=Object.keys(r.i); const k=ks[Math.random()*ks.length|0]; addItem(k,1); msg(`Sparfuchs: 1× ${ITEMS[k].n} gespart.`,'#a5d6a7'); } } if(made){ sfx('craft'); gainXP(2*made); msg(`${ITEMS[r.o].n} hergestellt${made>1?' ×'+made:''}.`,'#b9f6ca');
  if(r.o==='werkbank'&&!G.flags.wb){ G.flags.wb=true; msg('Stell die Werkbank auf – dort gibt es mehr Rezepte.','#ffcc80'); } }
  UI.renderPanel(); }
function actLabel(){ const d=heldDef(); if(d.type==='block'||d.type==='wall') return 'Bauen'; if(d.type==='food') return 'Essen'; if(d.ranged) return 'Schießen'; if(d.type==='throw') return 'Werfen'; if(d.type==='summon') return 'Rufen'; if(d.id==='flasche') return 'Füllen'; if(d.tool&&d.id!=='hand') return 'Abbauen'; return 'Schlagen'; }
function findInteract(){ const P=G.player; if(!P||P.dead) return null; let best=null,bd=3.2*T;
  for(const e of G.ents){ if(e.dead) continue; if(e.kind==='npc'||(e.kind==='mob'&&MOBS[e.t].cann&&G.cannAngry<=0)){ const dd=dist(e,P); if(dd<bd){ bd=dd; best={lbl:'Reden',e}; } } }
  if(best) return best;
  const cx=Math.floor((P.x+P.w/2)/T), cy=Math.floor((P.y+P.h/2)/T); let bt=null,bdd=9;
  for(let y=cy-2;y<=cy+2;y++)for(let x=cx-2;x<=cx+2;x++){ const d=TILES[tget(x,y)]; let l=null; if(d.door) l='Tür'; else if(d.chest||d.loot) l='Öffnen'; else if(d.station==='tonne') l='Wasser'; else if(d.station) l='Herstellen'; else if(d.bed) l='Schlafen'; if(l){ const dd=(x-cx)*(x-cx)+(y-cy)*(y-cy)+(Math.sign(x-cx)===P.dir?0:0.5); if(dd<bdd){ bdd=dd; bt={lbl:l,x,y}; } } }
  return bt; }
function doInteract(){ const it=findInteract(); if(!it) return; if(it.e){ if(it.e.kind==='npc') UI.talk(it.e); else UI.toastTalk(it.e); return; } interactAt(it.x,it.y); }
// Panel-Klicks
document.addEventListener('click',ev=>{ const t=ev.target.closest('[data-i],[data-t],[data-act],[data-craft],[data-craft5],[data-skill],[data-m],[data-z],[data-c],[data-n],[data-buy],[data-sell]'); if(!t) return;
  if(t.dataset.t){ const k=t.dataset.t; if(k!=='cont'&&k!=='npc'){ UI.tab=k; UI.pick=null; } UI.renderPanel(); return; }
  if(t.dataset.i!=null&&t.closest('#hot')){ G.player.sel=+t.dataset.i; UI.refreshHot(); sfx('click'); return; }
  if(t.dataset.i!=null){ UI.slotTap(+t.dataset.i,t.dataset.src); return; }
  if(t.dataset.craft!=null) return craft(+t.dataset.craft,1); if(t.dataset.craft5!=null) return craft(+t.dataset.craft5,5);
  if(t.dataset.skill){ const P=G.player; if(P.sp>0){ P.sp--; P.sk[t.dataset.skill]++; if(t.dataset.skill==='ausdauer') P.hp+=15; sfx('level'); } UI.renderPanel(); return; }
  if(t.dataset.n) return UI.npcAct(t.dataset.n);
  if(t.dataset.buy!=null){ const d=NPCS[UI.npc.t]; const [id,n,pr0]=d.trade[+t.dataset.buy]; const pr=SKILLFX.price(pr0); if(countItem('kronkorken')>=pr){ removeItem('kronkorken',pr); addItem(id,n); sfx('pick'); } UI.npcAct('trade'); return; }
  if(t.dataset.sell){ const id=t.dataset.sell; const pr=SELL.find(s=>s[0]===id)[1]; const n=countItem(id); removeItem(id,n); addItem('kronkorken',n*pr); sfx('pick'); UI.npcAct('trade'); return; }
  if(t.dataset.z){ G.opts.zoomVH=+t.dataset.z; saveOpts(); resize(); UI.renderPanel(); return; }
  if(t.dataset.c){ G.opts.ctrl=+t.dataset.c; saveOpts(); applyCtrl(); return; }
  if(t.dataset.m){ const m=t.dataset.m; if(m==='resume') UI.close(); if(m==='save'){ saveGame(); msg('Gespeichert.','#b9f6ca'); UI.close(); } if(m==='load'){ if(loadGame()){ UI.close(); msg('Spielstand geladen.'); } } if(m==='title'){ saveGame(true); UI.close(); toTitle(); } return; }
  const a=t.dataset.act; const P=G.player;
  if(a==='use'&&UI.pick){ const s=P.inv[UI.pick.i]; if(s){ const d=ITEMS[s.id]; if(d.type==='food') eat(s.id); else if(d.type==='book') readBook(s.id); else if(d.type==='summon'){ UI.close(); summon(s.id); return; } } if(!P.inv[UI.pick.i]) UI.pick=null; UI.renderInv(); }
  if(a==='hot'&&UI.pick){ const i=UI.pick.i; const tmp=P.inv[P.sel]; P.inv[P.sel]=P.inv[i]; P.inv[i]=tmp; UI.pick=null; UI.renderInv(); UI.refreshHot(); }
  if(a==='drop'&&UI.pick){ const s=P.inv[UI.pick.i]; if(s){ spawnDrop(s.id,s.n,P.x+P.w/2+P.dir*30,P.y); G.drops[G.drops.length-1].t=-2; P.inv[UI.pick.i]=null; } UI.pick=null; UI.renderInv(); UI.refreshHot(); }
  if(a==='takeall'){ const arr=G.containers[UI.cont]; for(let i=arr.length-1;i>=0;i--){ const s=arr[i]; const left=addItem(s.id,s.n,true,true); if(left>0) s.n=left; else arr.splice(i,1);} sfx('pick'); UI.renderPanel(); UI.refreshHot(); }
});
