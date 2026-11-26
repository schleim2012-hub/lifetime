// Lifetime 0.2 – Attribute & Perks (eigene Namen, Parodie), Hefte als Bonus
'use strict';
const ATTRS={
 wahrnehmung:{n:'Wahrnehmung',ic:'👁',d:'Augen auf! Fernkampf, Beute, Schürfen.'},
 staerke:{n:'Stärke',ic:'💪',d:'Draufhauen und Bäume umlegen.'},
 fitness:{n:'Fitness',ic:'❤',d:'Mehr aushalten, weniger jammern.'},
 intellekt:{n:'Intellekt',ic:'🧠',d:'Basteln, Feilschen, Sparen.'},
 agilitaet:{n:'Agilität',ic:'🏃',d:'Schnell, leise, flink.'},
};
// Perk: a=Attribut, max Ränge, d(r) Beschreibung, legacy = altes Skill-Feld
const PERKS={
 zielwasser:{a:'wahrnehmung',n:'Zielwasser getrunken',max:5,legacy:'schuetze',d:'+12% Fernkampfschaden je Rang. Rang 1: Pistole & Munition, Rang 2: Schrotflinte.'},
 kistenfluesterer:{a:'wahrnehmung',n:'Der Kistenflüsterer',max:5,legacy:'pluenderer',d:'Kisten reden mit dir: +25% Beutechance je Rang.'},
 schuerfnase:{a:'wahrnehmung',n:'Schürfnase',max:5,d:'15% je Rang Chance auf doppeltes Erz und Stein.'},
 pruegelknabe:{a:'staerke',n:'Prügelknabe',max:5,legacy:'staerke',d:'+15% Nahkampfschaden je Rang. Rang 1: Nagel-Schläger & Machete.'},
 holzfaeller:{a:'staerke',n:'Holzfäller-Hansi',max:5,d:'+20% Hack- und Abbautempo je Rang. Bäume zittern, wenn du kommst.'},
 kantenklatscher:{a:'staerke',n:'Kantenklatscher',max:5,d:'8% je Rang Chance auf einen kritischen Treffer (doppelter Schaden).'},
 eisenlunge:{a:'fitness',n:'Eiserne Lunge',max:5,legacy:'ausdauer',d:'+15 max. Gesundheit und Ausdauer je Rang.'},
 magenstahl:{a:'fitness',n:'Magen aus Stahl',max:5,legacy:'ueberleben',d:'Hunger, Durst und Kälte −12% je Rang. Rang 1: Erste-Hilfe-Set.'},
 dickfellig:{a:'fitness',n:'Dickfellig',max:5,d:'−6% erlittener Schaden je Rang. Fühlt sich an wie drei Pullover.'},
 bastelbude:{a:'intellekt',n:'Bastelbude Deluxe',max:5,legacy:'handwerk',d:'Neue Rezepte: Rang 1 Eintopf, Stahl, Draht · Rang 2 Chemiestation, Titan, Bomben.'},
 quasselstrippe:{a:'intellekt',n:'Quasselstrippe',max:5,d:'Händler geben je Rang 8% Rabatt, nur damit du aufhörst zu reden.'},
 sparfuchs:{a:'intellekt',n:'Sparfuchs',max:5,d:'10% je Rang Chance, beim Herstellen ein Material zurückzubekommen.'},
 leisetreter:{a:'agilitaet',n:'Leisetreter',max:5,d:'Schlafende Gegner wachen je Rang 15% später auf.'},
 sprintwunder:{a:'agilitaet',n:'Sprintwunder',max:5,d:'+6% Laufgeschwindigkeit je Rang, weniger Ausdauerverbrauch.'},
 flinkefinger:{a:'agilitaet',n:'Flinke Finger',max:5,d:'Je Rang 8% schnellere Angriffe und +10% Bogenschaden.'},
};
// Hefte / Magazine: 5 Reihen × 5 Ausgaben
const MAGS={
 schrauber:{n:'Schrauber Monatlich',col:'#e0a020',d:'+4% Abbautempo je Ausgabe',full:'Komplett: weitere +10% Abbautempo'},
 waidmann:{n:'Waidmanns Witzblatt',col:'#4f8a3a',d:'+3% Fernkampfschaden je Ausgabe',full:'Komplett: weitere +10% Fernkampf'},
 schlagfertig:{n:'Schlag-Fertig',col:'#c62828',d:'+3% Nahkampfschaden je Ausgabe',full:'Komplett: +5% kritische Treffer'},
 omabibel:{n:'Omas Eintopf-Bibel',col:'#8a5a9a',d:'Essen heilt +6% mehr je Ausgabe',full:'Komplett: Hunger −10%'},
 bote:{n:'Der Schleichende Bote',col:'#37474f',d:'Gegner bemerken dich 4% später je Ausgabe',full:'Komplett: Zombies wittern dich nachts 15% schlechter'},
};
for(const k in MAGS) for(let i=1;i<=5;i++) I('heft_'+k+i,{n:`${MAGS[k].n} Nr. ${i}`,type:'book',ic:'book',col:MAGS[k].col,st:5,mag:k,issue:i,d:`Heft zum Lesen. ${MAGS[k].d}. ${MAGS[k].full}.`});
// Beute: Hefte in Häusern, Türmen, Wracks, Verstecken
for(const t of ['haus','tresor','dach','wrack']) if(LOOT[t]) for(const k in MAGS) for(let i=1;i<=5;i++) LOOT[t].push(['heft_'+k+i,1,1,(t==='tresor'?0.25:0.04)/5]);
if(typeof SELL!=='undefined') for(const k in MAGS) for(let i=1;i<=5;i++) SELL.push(['heft_'+k+i,4]);
// Altes Skill-Feld -> Perk-Namen (für Rezept-Sperren)
for(const k in PERKS){ const p=PERKS[k]; if(p.legacy&&SKILLS[p.legacy]) SKILLS[p.legacy].n=p.n; }
function perkReq(r){ return r<=1?1:r*2-1; } // Rang r braucht Attribut-Stufe
function attrCost(l){ return l<5?1:l<8?2:3; } // Kosten für die nächste Attribut-Stufe
function ensureSkills(P){ if(!P.attr){ P.attr={wahrnehmung:1,staerke:1,fitness:1,intellekt:1,agilitaet:1}; // Umstieg von 0.1: alte Punkte zurückgeben
    let n=0; for(const k in P.sk) n+=P.sk[k]||0; if(n){ P.sp+=n; msg(`Neues Skill-System: ${n} Punkte zurückerstattet.`,'#b388ff'); } for(const k in P.sk) P.sk[k]=0; } if(!P.perk){ P.perk={}; } if(!P.books) P.books={};
  syncSk(P); }
function perk(id){ const P=G.player; return P&&P.perk?(P.perk[id]||0):0; }
function syncSk(P){ for(const k in PERKS){ const p=PERKS[k]; if(p.legacy) P.sk[p.legacy]=P.perk[k]||0; } }
function magCount(k){ const P=G.player; let n=0; if(!P||!P.books) return 0; for(let i=1;i<=5;i++) if(P.books['heft_'+k+i]) n++; return n; }
function magBonus(k){ const n=magCount(k); return {n,full:n>=5}; }
function readBook(id){ const P=G.player; const d=ITEMS[id]; if(P.books[id]){ msg('Kennst du schon. Verkaufen oder als Klopapier nutzen.','#cfd8dc'); return; }
  P.books[id]=1; removeItem(id,1); sfx('pick'); const n=magCount(d.mag); msg(`Gelesen: ${d.n} (${n}/5)`,'#ffe082'); if(n===5){ msg(`Reihe komplett: ${MAGS[d.mag].n}! ${MAGS[d.mag].full}`,'#ffd54f'); sfx('level'); gainXP(120); } else gainXP(25); }
// ---- Spielwerte ----
const SKILLFX={
 melee(){ return 1+magCount('schlagfertig')*0.03; },
 ranged(bow){ return 1+perk('zielwasser')*0.12-PERKS.zielwasser.max*0+magCount('waidmann')*0.03+(magBonus('waidmann').full?0.1:0)+(bow?perk('flinkefinger')*0.1:0); },
 mine(){ return (1+perk('holzfaeller')*0.2)*(1+magCount('schrauber')*0.04+(magBonus('schrauber').full?0.1:0)); },
 crit(){ return perk('kantenklatscher')*0.08+(magBonus('schlagfertig').full?0.05:0); },
 dmgTaken(){ return 1-perk('dickfellig')*0.06; },
 rate(){ return 1-perk('flinkefinger')*0.08; },
 speed(){ return 1+perk('sprintwunder')*0.06; },
 stamUse(){ return 1-perk('sprintwunder')*0.08; },
 wake(){ return (1-perk('leisetreter')*0.15)*(1-magCount('bote')*0.04); },
 nightSense(){ return magBonus('bote').full?0.85:1; },
 price(p){ return Math.max(1,Math.round(p*(1-perk('quasselstrippe')*0.08))); },
 food(){ return 1+magCount('omabibel')*0.06; },
 hunger(){ return magBonus('omabibel').full?0.9:1; },
 ore(){ return perk('schuerfnase')*0.15; },
 save(){ return perk('sparfuchs')*0.1; },
};
// ---- Oberfläche ----
UI.renderSkills=function(){ const P=G.player; ensureSkills(P);
  let h=`<div class="info">Stufe ${P.lvl} · <b style="color:#ffd54f">${P.sp} Skillpunkte</b> · Pro Stufenaufstieg gibt's einen Punkt. Perk-Ränge sind durch die Attribut-Stufe begrenzt. Gelesene Hefte: ${Object.keys(P.books).length}/25</div><div class="attrs">`;
  for(const a in ATTRS){ const A=ATTRS[a], l=P.attr[a]; const c=attrCost(l);
    h+=`<div class="attr"><div class="ah"><span class="ai">${A.ic}</span><b>${A.n}</b> <span class="lv">${l}/10</span> <button data-attr="${a}" ${P.sp>=c&&l<10?'':'disabled'}>+ (${c})</button></div><small>${A.d}</small>`;
    for(const k in PERKS){ const p=PERKS[k]; if(p.a!==a) continue; const r=P.perk[k]||0; const need=perkReq(r+1); const can=P.sp>0&&r<p.max&&l>=need;
      h+=`<div class="perk"><div class="pn"><b>${p.n}</b> <span class="pips">${'●'.repeat(r)}${'○'.repeat(p.max-r)}</span><br><small>${p.d}</small>${r<p.max&&l<need?`<br><small class="need">Rang ${r+1} braucht ${A.n} ${need}</small>`:''}</div><button data-perk="${k}" ${can?'':'disabled'}>+1</button></div>`; }
    h+='</div>'; }
  h+='</div><h3>Hefte</h3><div class="mags">'; for(const k in MAGS){ const n=magCount(k); h+=`<div class="mag"><b style="color:${MAGS[k].col}">${MAGS[k].n}</b> ${n}/5<br><small>${MAGS[k].d}. ${MAGS[k].full}.</small></div>`; } h+='</div>';
  $('pbody').innerHTML=h; };
document.addEventListener('click',ev=>{ const t=ev.target.closest('[data-attr],[data-perk]'); if(!t||t.disabled) return; const P=G.player; ensureSkills(P);
  if(t.dataset.attr){ const a=t.dataset.attr, c=attrCost(P.attr[a]); if(P.sp>=c&&P.attr[a]<10){ P.sp-=c; P.attr[a]++; sfx('level'); } }
  if(t.dataset.perk){ const k=t.dataset.perk, p=PERKS[k], r=P.perk[k]||0; if(P.sp>0&&r<p.max&&P.attr[p.a]>=perkReq(r+1)){ P.sp--; P.perk[k]=r+1; if(k==='eisenlunge') P.hp+=15; syncSk(P); sfx('level'); msg(`${p.n} Rang ${r+1}!`,'#b388ff'); } }
  UI.renderPanel(); });
