// Lifetime – Daten: Kacheln, Items, Rezepte, Gegner, NPCs
'use strict';
const T = 16; // Kachelgröße in Pixeln
// Kacheln: n=Name, s=solid, h=Härte, tool=axe|pick|hand, drop=[item,anzahl], light, plat=Plattform, climb, liquid
const TILES = [];
function defT(id, o){ TILES[id] = Object.assign({id, s:true, h:1, tool:'hand', drop:null, light:0, c:'#888'}, o); }
defT(0,{n:'Luft',s:false,h:0});
defT(1,{n:'Erde',h:1,tool:'hand',drop:['erde',1],c:'#7a4b2a'});
defT(2,{n:'Gras',h:1,tool:'hand',drop:['erde',1],c:'#4e9a3a'});
defT(3,{n:'Stein',h:3,tool:'pick',drop:['stein',1],c:'#7d7d85'});
defT(4,{n:'Sand',h:1,tool:'hand',drop:['sand',1],c:'#d8c07a'});
defT(5,{n:'Wasser',s:false,h:0,liquid:true,c:'#2c6fb5'});
defT(6,{n:'Baumstamm',s:false,h:2,tool:'axe',drop:['holz',2],c:'#6b4428',tree:true});
defT(7,{n:'Blätter',s:false,h:0.4,tool:'hand',drop:null,c:'#3f9a2f',tree:true,leaf:true});
defT(8,{n:'Holzbretter',h:2,tool:'axe',drop:['bretter',1],c:'#a8743f'});
defT(9,{n:'Bruchstein',h:3.5,tool:'pick',drop:['bruchstein',1],c:'#6c6c72'});
defT(10,{n:'Ziegel',h:4,tool:'pick',drop:['ziegel',1],c:'#9b4a35'});
defT(11,{n:'Beton',h:6,tool:'pick',drop:['beton',1],c:'#9a9a96'});
defT(12,{n:'Glas',h:0.6,tool:'hand',drop:null,c:'#a9d8e8',glass:true});
defT(13,{n:'Stahlplatte',h:9,tool:'pick',drop:['stahl',1],c:'#5d6870'});
defT(14,{n:'Kohle',h:3.5,tool:'pick',drop:['kohle',2],c:'#333'});
defT(15,{n:'Eisenerz',h:4.5,tool:'pick',drop:['eisenerz',1],c:'#b07a55'});
defT(16,{n:'Salpeter',h:3.5,tool:'pick',drop:['salpeter',2],c:'#ddd'});
defT(17,{n:'Grundgestein',h:9999,tool:'none',c:'#222'});
defT(18,{n:'Leiter',s:false,h:1,tool:'axe',drop:['leiter',1],climb:true,c:'#9a6a35'});
defT(19,{n:'Tür',h:2,tool:'axe',drop:['tuer',1],door:true,c:'#7b5030'});
defT(20,{n:'Tür (offen)',s:false,h:2,tool:'axe',drop:['tuer',1],door:true,c:'#7b5030'});
defT(21,{n:'Fackel',s:false,h:0.2,tool:'hand',drop:['fackel',1],light:0.95,c:'#ffb340'});
defT(22,{n:'Lagerfeuer',s:false,h:1,tool:'hand',drop:['lagerfeuer',1],light:1,station:'feuer',warm:1,c:'#e25822'});
defT(23,{n:'Werkbank',s:false,h:2,tool:'axe',drop:['werkbank',1],station:'werkbank',c:'#8b5a2b'});
defT(24,{n:'Esse',s:false,h:3,tool:'pick',drop:['esse',1],station:'esse',light:0.7,warm:1,c:'#555'});
defT(25,{n:'Chemiestation',s:false,h:3,tool:'pick',drop:['chemie',1],station:'chemie',c:'#4a7'});
defT(26,{n:'Kiste',s:false,h:2,tool:'axe',drop:['kiste',1],chest:true,c:'#9b6b35'});
defT(27,{n:'Holzstacheln',s:false,h:1.5,tool:'axe',drop:['stacheln',1],trap:12,c:'#a87'});
defT(28,{n:'Bett',s:false,h:1.5,tool:'axe',drop:['bett',1],bed:true,c:'#b33'});
defT(29,{n:'Lootkiste',s:false,h:2,tool:'hand',drop:null,loot:'haus',c:'#a5793f'});
defT(30,{n:'Wrackteil',h:5,tool:'pick',drop:['schrott',3],c:'#b8bcc0'});
defT(31,{n:'Beerenbusch',s:false,h:0.4,tool:'hand',drop:['beeren',2],c:'#2e6b2e'});
defT(32,{n:'Holzplattform',s:false,plat:true,h:1,tool:'axe',drop:['plattform',1],c:'#a8743f'});
defT(33,{n:'Asphalt',h:5,tool:'pick',drop:['bruchstein',1],c:'#3a3a3e'});
defT(34,{n:'Schutt',h:1.5,tool:'hand',drop:['schrott',1],c:'#7f776c'});
defT(35,{n:'Hohes Gras',s:false,h:0.2,tool:'hand',drop:['faser',1],c:'#5daa3a'});
defT(36,{n:'Steinchen',s:false,h:0.2,tool:'hand',drop:['stein',1],c:'#999'});
defT(37,{n:'Regentonne',s:false,h:2,tool:'axe',drop:['regentonne',1],station:'tonne',c:'#3d6a9a'});
defT(38,{n:'Waffentresor',s:false,h:30,tool:'pick',drop:null,loot:'tresor',c:'#4a4f55'});
defT(39,{n:'Knochenhaufen',s:false,h:0.6,tool:'hand',drop:['knochen',3],cann:true,c:'#e8e0c8'});
defT(40,{n:'Titanerz',h:8,tool:'pick',drop:['titanerz',1],c:'#7ad'});
defT(41,{n:'Stacheldraht',s:false,h:2,tool:'pick',drop:['draht',1],trap:20,c:'#999'});
defT(42,{n:'Aktenschrank',s:false,h:2,tool:'hand',drop:null,loot:'buero',c:'#6d7a80'});
defT(43,{n:'Kühlschrank',s:false,h:2,tool:'hand',drop:null,loot:'kuehl',c:'#e5e5e5'});
defT(44,{n:'Lagerkiste (Gang)',s:false,h:2,tool:'hand',drop:null,loot:'gang',c:'#6b4a2a'});
defT(45,{n:'Kannibalen-Totem',s:false,h:2,tool:'axe',drop:['knochen',5],cann:true,c:'#c9b48a'});
defT(46,{n:'Erdwand-Lehm',h:1.2,tool:'hand',drop:['lehm',1],c:'#9c6b4a'});
defT(47,{n:'Schnee',h:0.8,tool:'hand',drop:null,c:'#f2f6fa'});
defT(49,{n:'Kirschblüten',s:false,h:0.4,tool:'hand',drop:null,c:'#f48fb1',tree:true,leaf:true});
defT(50,{n:'Herbstlaub',s:false,h:0.4,tool:'hand',drop:null,c:'#f2b630',tree:true,leaf:true});
defT(51,{n:'Nadeln',s:false,h:0.4,tool:'hand',drop:null,c:'#1f6b4a',tree:true,leaf:true});
defT(52,{n:'Tropfstein',s:false,h:0.5,tool:'hand',drop:['stein',1],c:'#8a8a92'});
defT(53,{n:'Ranke',s:false,h:0.3,tool:'hand',drop:['faser',1],climb:true,c:'#3a8a2a'});
defT(54,{n:'Pilzgras',h:1.2,tool:'hand',drop:['schlamm',1],c:'#3a6fd8'});
defT(55,{n:'Leuchtpilz',s:false,h:0.3,tool:'hand',drop:['leuchtpilz',1],light:0.75,lcol:'blue',c:'#5ab0ff'});
defT(56,{n:'Schlamm',h:1.2,tool:'hand',drop:['schlamm',1],c:'#4a4258'});
defT(48,{n:'Kannibalen-Vorrat',s:false,h:2,tool:'hand',drop:null,loot:'kann',cann:true,c:'#8a6'});
// Hintergrundwände
const WALLS = {1:{n:'Erdwand',c:'#3e2716'},2:{n:'Holzwand',c:'#5c3d1e',item:'holzwand'},3:{n:'Ziegelwand',c:'#5a2a20',item:'ziegelwand'},4:{n:'Betonwand',c:'#555553',item:'betonwand'},5:{n:'Steinwand',c:'#3b3b40',item:'steinwand'},6:{n:'Tapete',c:'#6d6248'},7:{n:'Zeltstoff',c:'#5d5a3a'}};

// Items
const ITEMS = {};
function I(id,o){ ITEMS[id]=Object.assign({id, st:99, type:'mat'}, o); }
// Blöcke
I('erde',{n:'Erde',type:'block',tile:1});
I('stein',{n:'Stein',type:'block',tile:3,d:'Kleine Steine. Basis für Werkzeuge.'});
I('sand',{n:'Sand',type:'block',tile:4});
I('holz',{n:'Holz',type:'block',tile:8,d:'Frisch gefällt. Wird als Bretter verbaut.'});
I('bretter',{n:'Holzbretter',type:'block',tile:8});
I('bruchstein',{n:'Bruchstein',type:'block',tile:9});
I('ziegel',{n:'Ziegel',type:'block',tile:10});
I('beton',{n:'Beton',type:'block',tile:11});
I('glas',{n:'Glas',type:'block',tile:12});
I('stahl',{n:'Stahlplatte',type:'block',tile:13,d:'Fast unzerstörbar. Ideal gegen den Blutmond.'});
I('lehm',{n:'Lehm',type:'block',tile:46});
I('schlamm',{n:'Schlamm',type:'block',tile:56});
I('leuchtpilz',{n:'Leuchtpilz',type:'food',ic:'shroom',col:'#5ab0ff',food:{hu:6,hp:8},d:'Leuchtet blau. Schmeckt nach Erde und Abenteuer.'});
I('leiter',{n:'Leiter',type:'block',tile:18});
I('tuer',{n:'Tür',type:'block',tile:19,d:'Tippen zum Öffnen/Schließen.'});
I('fackel',{n:'Fackel',type:'block',tile:21});
I('lagerfeuer',{n:'Lagerfeuer',type:'block',tile:22,d:'Wärme, Licht und Kochen.'});
I('werkbank',{n:'Werkbank',type:'block',tile:23});
I('esse',{n:'Esse',type:'block',tile:24,d:'Schmilzt Erz zu Barren.'});
I('chemie',{n:'Chemiestation',type:'block',tile:25});
I('kiste',{n:'Kiste',type:'block',tile:26});
I('stacheln',{n:'Holzstacheln',type:'block',tile:27,d:'Falle: verletzt Gegner, die drüberlaufen.'});
I('draht',{n:'Stacheldraht',type:'block',tile:41,d:'Starke Falle.'});
I('bett',{n:'Bett',type:'block',tile:28,d:'Hier wachst du wieder auf. Nachts schlafen.'});
I('plattform',{n:'Holzplattform',type:'block',tile:32,d:'Man kann durchspringen.'});
I('regentonne',{n:'Regentonne',type:'block',tile:37,d:'Fängt Regenwasser. Mit leerer Flasche benutzen.'});
I('holzwand',{n:'Holzwand',type:'wall',wall:2,d:'Hintergrundwand – macht ein Haus zum Unterschlupf.'});
I('ziegelwand',{n:'Ziegelwand',type:'wall',wall:3});
I('betonwand',{n:'Betonwand',type:'wall',wall:4});
I('steinwand',{n:'Steinwand',type:'wall',wall:5});
// Materialien
I('faser',{n:'Pflanzenfaser',ic:'fiber',col:'#7c4'});
I('stoff',{n:'Stoff',ic:'cloth',col:'#c9b'});
I('schrott',{n:'Schrott',ic:'scrap',col:'#999'});
I('kohle',{n:'Kohle',ic:'ore',col:'#222'});
I('eisenerz',{n:'Eisenerz',ic:'ore',col:'#b07a55'});
I('salpeter',{n:'Salpeter',ic:'ore',col:'#eee'});
I('titanerz',{n:'Titanerz',ic:'ore',col:'#7ad'});
I('eisen',{n:'Eisenbarren',ic:'bar',col:'#bbb'});
I('titan',{n:'Titanbarren',ic:'bar',col:'#8cf'});
I('pulver',{n:'Schießpulver',ic:'powder',col:'#444'});
I('leder',{n:'Leder',ic:'cloth',col:'#8a5a2b'});
I('federn',{n:'Federn',ic:'feather',col:'#eee'});
I('knochen',{n:'Knochen',ic:'bone',col:'#eee8d0'});
I('kronkorken',{n:'Kronkorken',ic:'coin',col:'#e0b030',d:'Die Währung nach dem Vorfall.'});
I('kleber',{n:'Kleber',ic:'bottle',col:'#ddb'});
I('flasche',{n:'Leere Flasche',ic:'bottle',col:'#9cd',d:'Am Wasser oder an der Regentonne füllen.'});
I('mutantenherz',{n:'Mutantenherz',ic:'heart',col:'#7a2a5a',d:'Pocht noch. Zutat für Beschwörungen.'});
I('seide',{n:'Spinnenseide',ic:'fiber',col:'#ddf'});
I('benzin',{n:'Benzin',ic:'bottle',col:'#d93'});
// Nahrung & Medizin (hu=Hunger, th=Durst, hp, st=Ausdauer, wa=Wärme)
I('beeren',{n:'Beeren',type:'food',ic:'berry',col:'#c2185b',food:{hu:6,th:3}});
I('fleisch_roh',{n:'Rohes Fleisch',type:'food',ic:'meat',col:'#d55',food:{hu:8,hp:-6},d:'Roh essen macht krank. Am Lagerfeuer braten!'});
I('fleisch',{n:'Gebratenes Fleisch',type:'food',ic:'meat',col:'#8b4513',food:{hu:28,hp:5}});
I('konserve',{n:'Konserve',type:'food',ic:'can',col:'#bbb',food:{hu:22,th:4}});
I('chips',{n:'Tüte Chips',type:'food',ic:'bag',col:'#fc3',food:{hu:10,th:-4}});
I('eintopf',{n:'Eintopf',type:'food',ic:'bowl',col:'#a63',food:{hu:40,th:10,hp:10}});
I('kekse',{n:'Grüne Kekse',type:'food',ic:'cookie',col:'#6c6',food:{hu:15},d:'Lieber nicht fragen, woraus die sind.'});
I('wasser_dreckig',{n:'Schmutziges Wasser',type:'food',ic:'bottle',col:'#6a5',food:{th:15,hp:-5},back:'flasche'});
I('wasser',{n:'Abgekochtes Wasser',type:'food',ic:'bottle',col:'#4af',food:{th:35},back:'flasche'});
I('cola',{n:'Blubber-Cola',type:'food',ic:'can',col:'#c22',food:{th:25,st:30}});
I('tee',{n:'Kräutertee',type:'food',ic:'bottle',col:'#9c6',food:{th:25,hp:8,wa:30},back:'flasche'});
I('kaffee',{n:'Kalter Kaffee',type:'food',ic:'can',col:'#642',food:{th:15,st:60}});
I('verband',{n:'Verband',type:'food',ic:'bandage',col:'#fff',food:{hp:15}});
I('medkit',{n:'Erste-Hilfe-Set',type:'food',ic:'medkit',col:'#e33',food:{hp:60}});
I('herzdesberges',{n:'Herz des Berges',type:'food',ic:'heart',col:'#f44',st:5,food:{maxhp:20},d:'Erhöht die maximale Gesundheit dauerhaft um 20.'});
// Werkzeuge & Waffen (axe/pick = Werkzeugstärke, dmg, rate = Sekunden pro Schlag, reach in Kacheln)
I('hand',{n:'Faust',type:'tool',st:1,ic:'fist',col:'#e0b08a',tool:{axe:0.5,pick:0.4,hand:1},dmg:4,rate:0.45,reach:2});
I('notaxt',{n:'Notfall-Axt',type:'tool',st:1,ic:'axe',col:'#d33',tool:{axe:1.8,hand:1.5},dmg:10,rate:0.5,reach:3,d:'Hing im Flieger neben dem Notausgang. Dein bester Freund.'});
I('steinaxt',{n:'Steinaxt',type:'tool',st:1,ic:'axe',col:'#888',tool:{axe:1.5,hand:1.5},dmg:8,rate:0.5,reach:3});
I('steinhacke',{n:'Steinspitzhacke',type:'tool',st:1,ic:'pick',col:'#888',tool:{pick:1.4,hand:1.5},dmg:6,rate:0.5,reach:3});
I('eisenaxt',{n:'Eisenaxt',type:'tool',st:1,ic:'axe',col:'#ccc',tool:{axe:3,hand:2},dmg:14,rate:0.42,reach:3});
I('eisenhacke',{n:'Eisenspitzhacke',type:'tool',st:1,ic:'pick',col:'#ccc',tool:{pick:3,hand:2},dmg:10,rate:0.42,reach:3});
I('titanhacke',{n:'Titanbohrer',type:'tool',st:1,ic:'pick',col:'#8cf',tool:{pick:6,axe:3,hand:3},dmg:14,rate:0.3,reach:4});
I('kettensaege',{n:'Kettensäge',type:'tool',st:1,ic:'chainsaw',col:'#e83',tool:{axe:8,hand:3},dmg:22,rate:0.15,reach:2.5,d:'Beute vom Fleischberg. Brummt herrlich.'});
I('knueppel',{n:'Holzknüppel',type:'weapon',st:1,ic:'club',col:'#8b5a2b',dmg:11,rate:0.5,reach:2.2});
I('speer',{n:'Steinspeer',type:'weapon',st:1,ic:'spear',col:'#a87',dmg:14,rate:0.6,reach:3.2});
I('naegelschlaeger',{n:'Nagel-Schläger',type:'weapon',st:1,ic:'club',col:'#ccc',dmg:22,rate:0.5,reach:2.4});
I('machete',{n:'Machete',type:'weapon',st:1,ic:'sword',col:'#ddd',dmg:26,rate:0.38,reach:2.6,tool:{axe:1.2}});
I('zwillingsklinge',{n:'Zwillingsklinge',type:'weapon',st:1,ic:'sword',col:'#b5f',dmg:40,rate:0.3,reach:2.8,d:'Vom Doppelkopf. Schneidet doppelt.'});
I('armknochen',{n:'Armigen-Keule',type:'weapon',st:1,ic:'club',col:'#e8d8b0',dmg:55,rate:0.8,reach:3,kb:3,d:'Schwer. Schleudert Gegner weg.'});
I('bogen',{n:'Primitiver Bogen',type:'weapon',st:1,ic:'bow',col:'#8b5a2b',dmg:14,rate:0.7,ranged:{ammo:'pfeil',spd:340,grav:300}});
I('armbrust',{n:'Königinnen-Armbrust',type:'weapon',st:1,ic:'bow',col:'#c8f',dmg:34,rate:0.45,ranged:{ammo:'pfeil',spd:520,grav:120}});
I('pistole',{n:'Pistole',type:'weapon',st:1,ic:'gun',col:'#444',dmg:24,rate:0.35,ranged:{ammo:'muni',spd:700,grav:0}});
I('schrotflinte',{n:'Schrotflinte',type:'weapon',st:1,ic:'shotgun',col:'#5a3a22',dmg:16,rate:0.9,ranged:{ammo:'schrot',spd:600,grav:0,pellets:5,spread:0.25}});
I('pfeil',{n:'Steinpfeil',type:'ammo',ic:'arrow',col:'#ccc'});
I('muni',{n:'9mm-Munition',type:'ammo',ic:'ammo',col:'#db3'});
I('schrot',{n:'Schrotpatronen',type:'ammo',ic:'ammo',col:'#c33'});
I('molotow',{n:'Molotow',type:'throw',ic:'bottle',col:'#f63',dmg:30,rate:0.8,d:'Werfen: brennt alles weg.'});
I('rohrbombe',{n:'Rohrbombe',type:'throw',ic:'can',col:'#777',dmg:60,rate:1,boom:2.5,d:'Explodiert. Zerstört auch Blöcke.'});
// Kleidung (wird automatisch getragen: bestes Teil pro Slot)
I('lumpen',{n:'Lumpenkleidung',type:'armor',st:1,slot:'body',ic:'jacket',col:'#987',def:1,warm:8});
I('lederjacke',{n:'Lederjacke',type:'armor',st:1,slot:'body',ic:'jacket',col:'#5a3a22',def:4,warm:20});
I('fellmantel',{n:'Fellmantel',type:'armor',st:1,slot:'body',ic:'jacket',col:'#a98',def:3,warm:40});
I('polizeiweste',{n:'Polizeiweste',type:'armor',st:1,slot:'body',ic:'vest',col:'#335',def:10,warm:10});
I('seidenumhang',{n:'Seidenumhang',type:'armor',st:1,slot:'body',ic:'jacket',col:'#ccf',def:8,warm:35,d:'Aus Spinnenseide. Leicht und warm.'});
I('helm',{n:'Feuerwehrhelm',type:'armor',st:1,slot:'head',ic:'helmet',col:'#c33',def:5,warm:5});
I('muetze',{n:'Wollmütze',type:'armor',st:1,slot:'head',ic:'helmet',col:'#36a',def:1,warm:15});
I('fluegel',{n:'Königinnenflügel',type:'armor',st:1,slot:'back',ic:'wing',col:'#987',def:2,warm:5,wings:true,d:'Doppelsprung und Gleiten (Springen halten).'});
// Beschwörungen
I('opfergabe',{n:'Faulige Opfergabe',type:'summon',st:5,ic:'offering',col:'#7a2',boss:'fleischberg',d:'Nachts benutzen: ruft den Fleischberg.'});
I('aaspfeife',{n:'Aas-Pfeife',type:'summon',st:5,ic:'whistle',col:'#a85',boss:'geierkoenigin',d:'Benutzen: ruft die Geierkönigin.'});
I('funkgeraet',{n:'Funkgerät',type:'misc',st:1,ic:'radio',col:'#333',d:'Rauscht. Manchmal hört man Stimmen ...'});

// Rezepte: o=Ergebnis, n=Menge, i=Zutaten, at=Station (hand/feuer/werkbank/esse/chemie), sk=Skill-Voraussetzung
const RECIPES = [
 {o:'steinaxt',i:{holz:3,stein:3,faser:2},at:'hand'},
 {o:'steinhacke',i:{holz:3,stein:4,faser:2},at:'hand'},
 {o:'knueppel',i:{holz:5},at:'hand'},
 {o:'speer',i:{holz:4,stein:2,faser:3},at:'hand'},
 {o:'fackel',n:3,i:{holz:1,faser:1},at:'hand'},
 {o:'lagerfeuer',i:{holz:5,stein:5},at:'hand'},
 {o:'werkbank',i:{holz:20},at:'hand'},
 {o:'lumpen',i:{faser:10,stoff:2},at:'hand'},
 {o:'verband',i:{stoff:2},at:'hand'},
 {o:'bretter',n:2,i:{holz:1},at:'hand'},
 {o:'holzwand',n:4,i:{holz:1},at:'hand'},
 {o:'leiter',n:3,i:{holz:2},at:'hand'},
 {o:'plattform',n:2,i:{holz:1},at:'hand'},
 {o:'flasche',i:{glas:1},at:'hand'},
 // Lagerfeuer
 {o:'fleisch',i:{fleisch_roh:1},at:'feuer'},
 {o:'wasser',i:{wasser_dreckig:1},at:'feuer'},
 {o:'tee',i:{wasser_dreckig:1,faser:2},at:'feuer'},
 {o:'eintopf',i:{fleisch_roh:1,beeren:2,wasser_dreckig:1},at:'feuer',sk:{handwerk:1}},
 {o:'opfergabe',i:{mutantenherz:1,fleisch_roh:5,knochen:10},at:'feuer'},
 // Werkbank
 {o:'tuer',i:{bretter:6},at:'werkbank'},
 {o:'kiste',i:{bretter:8},at:'werkbank'},
 {o:'bett',i:{bretter:6,stoff:4},at:'werkbank'},
 {o:'stacheln',n:2,i:{holz:4},at:'werkbank'},
 {o:'regentonne',i:{bretter:8,schrott:2},at:'werkbank'},
 {o:'bruchstein',n:2,i:{stein:3},at:'werkbank'},
 {o:'steinwand',n:4,i:{stein:2},at:'werkbank'},
 {o:'esse',i:{stein:30,lehm:10,holz:10},at:'werkbank'},
 {o:'bogen',i:{holz:6,faser:6},at:'werkbank'},
 {o:'pfeil',n:6,i:{holz:2,stein:1,federn:1},at:'werkbank'},
 {o:'naegelschlaeger',i:{knueppel:1,schrott:4},at:'werkbank',sk:{staerke:1}},
 {o:'fellmantel',i:{leder:6,faser:6},at:'werkbank'},
 {o:'lederjacke',i:{leder:8,stoff:2},at:'werkbank'},
 {o:'muetze',i:{stoff:3,faser:2},at:'werkbank'},
 {o:'aaspfeife',i:{federn:10,schrott:5,mutantenherz:1},at:'werkbank'},
 {o:'glas',n:2,i:{sand:4},at:'esse'},
 // Esse
 {o:'eisen',i:{eisenerz:2,kohle:1},at:'esse'},
 {o:'eisen',i:{schrott:4},at:'esse'},
 {o:'titan',i:{titanerz:3,kohle:2},at:'esse'},
 {o:'eisenaxt',i:{eisen:5,holz:3},at:'esse'},
 {o:'eisenhacke',i:{eisen:6,holz:3},at:'esse'},
 {o:'machete',i:{eisen:6,leder:2},at:'esse',sk:{staerke:1}},
 {o:'stahl',n:2,i:{eisen:3},at:'esse',sk:{handwerk:1}},
 {o:'draht',n:3,i:{eisen:2},at:'esse',sk:{handwerk:1}},
 {o:'chemie',i:{eisen:10,glas:4,schrott:10},at:'esse',sk:{handwerk:2}},
 {o:'pistole',i:{eisen:12,schrott:8,holz:2},at:'esse',sk:{schuetze:1}},
 {o:'schrotflinte',i:{eisen:18,schrott:10,holz:6},at:'esse',sk:{schuetze:2}},
 {o:'titanhacke',i:{titan:8,eisen:4},at:'esse',sk:{handwerk:2}},
 {o:'ziegel',n:4,i:{lehm:4},at:'esse'},
 // Chemie
 {o:'pulver',n:2,i:{salpeter:2,kohle:1},at:'chemie'},
 {o:'muni',n:10,i:{pulver:1,eisen:1},at:'chemie',sk:{schuetze:1}},
 {o:'schrot',n:6,i:{pulver:2,eisen:1},at:'chemie',sk:{schuetze:2}},
 {o:'molotow',i:{flasche:1,benzin:1,stoff:1},at:'chemie'},
 {o:'rohrbombe',i:{schrott:3,pulver:4},at:'chemie',sk:{handwerk:2}},
 {o:'medkit',i:{verband:2,kleber:1,wasser:1},at:'chemie',sk:{ueberleben:1}},
 {o:'kleber',i:{knochen:4,wasser:1},at:'chemie'},
 {o:'benzin',i:{kohle:4,flasche:1},at:'chemie'},
];
const STATIONS = {hand:'Hände',feuer:'Lagerfeuer',werkbank:'Werkbank',esse:'Esse',chemie:'Chemiestation'};
const SKILLS = {
 staerke:{n:'Stärke',d:'+15% Nahkampfschaden und Abbautempo pro Stufe. Stufe 1: Nagel-Schläger & Machete.',max:5},
 ausdauer:{n:'Ausdauer',d:'+15 max. Gesundheit und Ausdauer pro Stufe.',max:5},
 handwerk:{n:'Handwerk',d:'Schaltet Rezepte frei (Eintopf, Stahl, Stacheldraht, Chemiestation, Titan, Bomben).',max:3},
 schuetze:{n:'Schütze',d:'+15% Fernkampfschaden. Stufe 1: Pistole & Munition, Stufe 2: Schrotflinte.',max:3},
 pluenderer:{n:'Plünderer',d:'Mehr Beute in Kisten pro Stufe.',max:3},
 ueberleben:{n:'Überleben',d:'Hunger, Durst und Kälte sinken langsamer. Stufe 1: Erste-Hilfe-Set.',max:3},
};
// Beutetabellen: [item, min, max, chance]
const LOOT = {
 haus:[['konserve',1,2,.5],['wasser_dreckig',1,2,.4],['stoff',1,4,.6],['schrott',1,4,.5],['flasche',1,2,.4],['chips',1,1,.3],['verband',1,2,.3],['kronkorken',2,12,.6],['cola',1,1,.25],['muni',3,8,.12],['kaffee',1,1,.2],['muetze',1,1,.06],['steinaxt',1,1,.05],['kleber',1,1,.15],['benzin',1,1,.08]],
 buero:[['stoff',1,2,.4],['kronkorken',5,20,.7],['kaffee',1,2,.5],['chips',1,1,.3],['schrott',1,3,.4],['kleber',1,2,.3],['funkgeraet',1,1,.03]],
 kuehl:[['cola',1,2,.6],['konserve',1,2,.4],['wasser',1,1,.3],['fleisch_roh',1,1,.2]],
 gang:[['muni',8,20,.8],['schrot',4,10,.5],['konserve',2,4,.7],['benzin',1,2,.5],['kronkorken',20,50,1],['pistole',1,1,.35],['lederjacke',1,1,.3],['medkit',1,1,.4],['eisen',2,6,.6],['pulver',2,4,.5]],
 kann:[['kekse',2,5,1],['knochen',3,8,.9],['fleisch_roh',2,4,.7],['leder',2,5,.7],['federn',2,6,.6]],
 tresor:[['schrotflinte',1,1,1],['schrot',20,30,1],['pistole',1,1,1],['muni',30,50,1],['polizeiweste',1,1,1],['medkit',2,3,1],['rohrbombe',2,3,1],['kronkorken',80,150,1],['titan',4,8,1]],
 dach:[['benzin',1,2,.5],['eisen',2,4,.6],['medkit',1,1,.4],['muni',5,15,.6],['kronkorken',10,30,.8],['cola',1,2,.5]],
 wrack:[['notaxt',1,1,1],['konserve',2,2,1],['wasser',2,2,1],['stoff',3,3,1],['verband',2,2,1],['flasche',1,1,1],['chips',1,1,1]],
};
// Gegnertypen. hp, spd (px/s), dmg, w/h in px, sense (Kacheln), xp
const MOBS = {
 schlurfer:{n:'Schlurfer',hp:40,spd:30,dmg:8,w:14,h:40,xp:10,zombie:true,col:'#6b8f5e',shirt:'#5a6f8a',pants:'#3d3d50'},
 schwester:{n:'Schwester Grausam',hp:45,spd:34,dmg:9,w:14,h:40,xp:12,zombie:true,col:'#8fa080',shirt:'#e8e8e8',pants:'#e8e8e8',nurse:true},
 brandmeister:{n:'Brandmeister Kokel',hp:95,spd:26,dmg:12,w:14,h:40,xp:20,zombie:true,col:'#7a8f6a',shirt:'#d4a017',pants:'#8a6a10',helmet:'#c22'},
 kotzer:{n:'Glüh-Kotzer',hp:45,spd:26,dmg:11,w:18,h:40,xp:34,zombie:true,col:'#7a9a5a',shirt:'#8a8a30',pants:'#3a3a28',fat:true,glow:true,vomit:true},
 fettsack:{n:'Fettsack Bertl',hp:160,spd:20,dmg:16,w:18,h:40,xp:28,zombie:true,col:'#8a9a6e',shirt:'#ddd',pants:'#335',fat:true,spit:true},
 kriecher:{n:'Kriecher',hp:30,spd:36,dmg:7,w:26,h:14,xp:10,zombie:true,col:'#6a7f5a',shirt:'#6a5a4a',pants:'#333',crawl:true},
 spinne:{n:'Spinnen-Karl',hp:60,spd:60,dmg:10,w:20,h:28,xp:22,zombie:true,col:'#9aa',shirt:'#555',pants:'#333',spider:true,jump:340},
 hund:{n:'Zombiehund',hp:28,spd:95,dmg:7,w:24,h:18,xp:10,zombie:true,col:'#5a4a3a',dog:true,jump:260},
 geier:{n:'Zombiegeier',hp:22,spd:70,dmg:6,w:24,h:18,xp:10,zombie:true,col:'#3a3030',fly:true},
 bulle:{n:'Schmier-Bulle',hp:110,spd:28,dmg:12,w:14,h:40,xp:30,zombie:true,col:'#7f9a70',shirt:'#2b3f7a',pants:'#1a2550',cap:'#1a2550',spit:true,blowup:true},
 kreischerin:{n:'Kreischerin',hp:50,spd:40,dmg:7,w:14,h:40,xp:18,zombie:true,col:'#b8c2b0',shirt:'#eee',pants:'#ccc',hair:'#ddd',scream:true},
 bauarbeiter:{n:'Baustellen-Bodo',hp:70,spd:30,dmg:11,w:14,h:40,xp:14,zombie:true},
 soldat:{n:'Gasmasken-Gefreiter',hp:130,spd:34,dmg:13,w:14,h:40,xp:30,zombie:true,armor:0.3},
 clown:{n:'Clown Kicherich',hp:55,spd:44,dmg:9,w:14,h:40,xp:16,zombie:true,honk:true},
 springer:{n:'Der Springer',hp:60,spd:55,dmg:14,w:14,h:40,xp:24,zombie:true,pounce:true},
 rammbock:{n:'Rammbock',hp:180,spd:34,dmg:22,w:22,h:40,xp:45,zombie:true,charge:true},
 brocken:{n:'Der Brocken',hp:900,spd:38,dmg:34,w:32,h:48,xp:300,zombie:true,mutant:true,rocks:true,drop:[['mutantenherz',1],['eisen',6]]},
 mantelmann:{n:'Der Mantelmann',hp:1100,spd:46,dmg:30,w:18,h:56,xp:350,zombie:true,mutant:true,drop:[['mutantenherz',1],['lederjacke',1],['kronkorken',60]]},
 // Menschen
 saegesepp:{n:'Säge-Sepp',hp:320,spd:58,dmg:26,w:14,h:40,xp:120,human:true,gang:true,chainsaw:true,drop:[['kettensaege',1],['benzin',2]]},
 hinterwaeldler:{n:'Sumpfbruder',hp:70,spd:48,dmg:10,w:14,h:40,xp:25,human:true,gang:true,col:'#d9a066',shirt:'#8a3a2a',pants:'#3a4a6a',cap:'#556b2f',gun:true},
 schlaeger:{n:'Sumpfbruder-Schläger',hp:90,spd:52,dmg:14,w:14,h:40,xp:25,human:true,gang:true,col:'#c98a56',shirt:'#556b2f',pants:'#3a3a3a',hair:'#3a2a1a'},
 kannibale:{n:'Kannibale',hp:65,spd:62,dmg:12,w:14,h:40,xp:22,human:true,cann:true,col:'#c48a5a',shirt:null,pants:'#6b4a2a',paint:'#c22',hair:'#2a1a0a'},
 // Mutanten (Mini-Bosse)
 doppelkopf:{n:'Doppelkopf',hp:420,spd:70,dmg:20,w:24,h:40,xp:150,mutant:true,col:'#d8a0a0',drop:[['mutantenherz',1],['zwillingsklinge',1]],jump:330},
 armige:{n:'Der Armige',hp:650,spd:40,dmg:30,w:28,h:46,xp:200,mutant:true,col:'#c89080',drop:[['mutantenherz',1],['armknochen',1]],slam:true},
 spinnenfrau:{n:'Die Spinnenfrau',hp:380,spd:80,dmg:18,w:30,h:30,xp:170,mutant:true,col:'#e0b0b0',drop:[['mutantenherz',1],['seide',8]],jump:420,spider:true},
 // Bosse
 fleischberg:{n:'Der Fleischberg',hp:2600,spd:50,dmg:35,w:80,h:66,xp:800,boss:true,col:'#b06060',drop:[['herzdesberges',1],['kettensaege',1],['kronkorken',150]]},
 geierkoenigin:{n:'Die Geierkönigin',hp:2200,spd:120,dmg:28,w:80,h:44,xp:800,boss:true,fly:true,col:'#5a4040',drop:[['fluegel',1],['armbrust',1],['pfeil',60],['kronkorken',150]]},
 // Tiere
 hase:{n:'Hase',hp:8,spd:90,dmg:0,w:14,h:12,xp:3,animal:true,col:'#c8b090',drop:[['fleisch_roh',1],['leder',1]]},
 hirsch:{n:'Hirsch',hp:40,spd:100,dmg:0,w:28,h:34,xp:8,animal:true,col:'#9a6a3a',drop:[['fleisch_roh',3],['leder',3]]},
 huhn:{n:'Wildhuhn',hp:6,spd:60,dmg:0,w:12,h:14,xp:2,animal:true,col:'#ddd',drop:[['fleisch_roh',1],['federn',3]]},
};
const ZOMBIE_NAMES = ['schlurfer','schwester','brandmeister','fettsack','kriecher','spinne','hund','geier','bulle','kreischerin','bauarbeiter','soldat','clown','springer','rammbock'];

// NPCs mit Theorien (Filmparodien), Handel und Anwerben
const NPCS = {
 kalle:{n:'Kalle',role:'Mechaniker',skill:'bauen',skilltxt:'Repariert Blöcke an deiner Basis und bringt morgens Holz & Stein.',col:'#e0a878',shirt:'#3a5a8a',pants:'#2a2a2a',cap:'#c33',hp:150,dmg:10,
  hi:['Moin! Pass auf, wo du hintrittst – die Schlurfer sind heute gereizt.','Du bist das aus dem Flieger? Respekt, dass du noch stehst.'],
  theory:'Ich sag dir, wie das anfing: im Einkaufszentrum! „Das Kaufhaus der Untoten“. Wenn in der Hölle kein Platz mehr ist, kommen die Toten zum Sommerschlussverkauf. Ich war dabei – Rolltreppe rauf, Rolltreppe runter, und überall Schnäppchenjäger mit Hunger.',
  wish:{konserve:5,schrott:10}, trade:[['bretter',10,8],['steinaxt',1,15],['eisen',2,12],['tuer',1,10]]},
 gerda:{n:'Gerda',role:'Schützin',skill:'schiessen',skilltxt:'Schießt mit ihrem Gewehr auf alles, was sich nähert.',col:'#f0c8a0',shirt:'#556b2f',pants:'#4a3a2a',hair:'#ccc',hp:120,dmg:18,ranged:true,
  hi:['Kopf runter, Kindchen. Ich war 30 Jahre bei der Reserve.','Zielwasser hab ich genug. Munition nie.'],
  theory:'Benzin, Junge. Wer Benzin hat, hat die Macht. Bald brettern hier Kerle mit Stachel-Autos durch die Gegend, sprühen sich Silberlack auf den Mund und brüllen „Glänzend und verchromt!“. Ein Typ mit Lederjacke und Hund wird alles retten. Wetten?',
  wish:{muni:30,cola:2}, trade:[['muni',10,15],['pfeil',10,8],['bogen',1,20],['schrot',6,20]]},
 brems:{n:'Dr. Ingo Brems',role:'Sanitäter',skill:'heilen',skilltxt:'Heilt dich und andere Begleiter, wenn ihr in der Nähe seid.',col:'#f2d0b0',shirt:'#eee',pants:'#555',hair:'#654',hp:100,dmg:6,
  hi:['Ich bin Arzt, kein Kammerjäger!','Haben Sie sich gewaschen? Nein? Dachte ich mir.'],
  theory:'Es war der Schirm-Konzern. Die haben unter der Stadt ein Labor namens „Bienenstock“. Ein rot-weißer Schirm auf jedem Kittel – das ist doch kein Zufall! Und dann diese Computerstimme: „Ihr werdet alle hier unten sterben.“ Sehr unhöflich.',
  wish:{verband:4,kleber:2}, trade:[['verband',2,10],['medkit',1,40],['tee',1,6],['kleber',1,12]]},
 mecki:{n:'Mecki',role:'Schläger',skill:'kaempfen',skilltxt:'Haut im Nahkampf drauf und hält viel aus.',col:'#d8a070',shirt:'#222',pants:'#1a3a6a',hair:'#3c3',hp:220,dmg:16,
  hi:['Ey! Was guckst du? ...Ach, du bist kein Zombie. Sorry.','Mein Iro hat schon drei Apokalypsen überlebt.'],
  theory:'Ich bin im Krankenhaus aufgewacht. 28 Tage im Koma, Alter. Rausgegangen, alles leer. Lüdenscheid komplett leer! Irgendwelche Affen aus nem Labor haben die Wut übertragen. Oder waren es 28 Wochen? Egal, ich renn jetzt nur noch.',
  wish:{cola:3,naegelschlaeger:1}, trade:[['knueppel',1,6],['naegelschlaeger',1,30],['chips',2,6]]},
 uschi:{n:'Tante Uschi',role:'Kiosk',skill:'handel',skilltxt:'Bleibt im Kiosk. Handelt mit allem.',col:'#f5d0b0',shirt:'#c3a',pants:'#333',hair:'#c63',hp:100,dmg:5,trader:true,
  hi:['Kiosk hat geöffnet! Apokalypse ist kein Grund zu schließen.','Bargeld nehm ich nicht mehr. Nur Kronkorken.'],
  theory:'Ich sag immer: Wir gehen in die Kneipe „Zur Flinte“, trinken ein kühles Blondes und warten, bis das alles vorbei ist. Hat im Film auch fast geklappt. Und wenn einer von den Toten zu nah kommt – mit der Schallplatte drauf!',
  trade:[['konserve',1,8],['wasser',1,6],['cola',1,5],['fackel',5,5],['medkit',1,45],['muni',10,18],['eisen',3,15],['lederjacke',1,40],['funkgeraet',1,60]], buy:true},
 willi:{n:'Willi',role:'Einzelgänger',skill:'sammeln',skilltxt:'Sammelt unterwegs Beeren und Fleisch und teilt mit dir.',col:'#e0b088',shirt:'#777',pants:'#334',hair:'#222',hp:140,dmg:12,
  hi:['Ich bin legendär. ...Na gut, ich bin ein Typ mit Hund. Ohne Hund.','Jeden Abend um sechs funke ich. Nie antwortet wer.'],
  theory:'Ein Heilmittel gegen Krebs. Das war\'s. Die haben ein Wundermittel gespritzt und plötzlich hatten alle Lust auf Nachbarn. Ich wohne jetzt alleine in der Stadt und rede mit Schaufensterpuppen. Die sind gute Zuhörer.',
  wish:{fleisch:5,wasser:3}, trade:[['fleisch',2,8],['leder',3,10],['federn',5,6]]},
 funker:{n:'Funker Fritz',role:'Funker',skill:'schiessen',skilltxt:'Schießt mit seiner Pistole und warnt vor dem Blutmond.',col:'#e8c098',shirt:'#4a5a3a',pants:'#333',cap:'#4a5a3a',hp:110,dmg:14,ranged:true,
  hi:['Himmelsnetz ist erwacht. Ich komme wieder. ...Moment, falscher Film.','Regel Nummer eins: Ausdauer. Regel Nummer zwei: Doppelt tippen.'],
  theory:'Die Maschinen! Ein Computer namens Himmelsnetz hat beschlossen, dass wir überflüssig sind. Die Zombies sind nur der Anfang. Bald kommt ein nackter Österreicher aus der Zukunft. Oder ein Wasserfilm, wo alles überflutet ist. Ich hab alles mitgeschrieben!',
  wish:{funkgeraet:1}, trade:[['muni',10,16],['pulver',2,10],['rohrbombe',1,35]]},
rudi:{n:'Sheriff Rudi',role:'Hilfssheriff',skill:'schiessen',skilltxt:'Schießt mit seinem Revolver und hält die Stellung.',hp:150,dmg:20,ranged:true,
  hi:['Ruhig bleiben. Ich bin das Gesetz hier. Also, was davon übrig ist.','Ich such meine Familie. Hast du wen mit Sheriffhut gesehen? Außer mir?'],
  theory:'Ich bin im Krankenhaus aufgewacht, Blumen verwelkt, Uhr stehengeblieben. Und dann die Wahrheit: Wir sind alle schon angesteckt. Egal wie du stirbst – du stehst wieder auf. Also stirb lieber nicht.',
  wish:{muni:20,konserve:3}, trade:[['muni',10,14],['pistole',1,55]]},
 doris:{n:'Armbrust-Doris',role:'Jägerin',skill:'kaempfen',skilltxt:'Kämpft mit Messer und Armbrust, sehr flink.',hp:170,dmg:18,
  hi:['Psst. Die Pilze da unten in den Höhlen – fass die bloß nicht an.','Mein Motorrad hat kein Benzin mehr. Mein Humor auch nicht.'],
  theory:'Ein Pilz. Ich sag\'s dir, ein Pilz, der in Köpfe wächst. Die Leute fangen an zu klicken wie kaputte Uhren. Hab ich mal in so nem Spiel gesehen. Oder geträumt. Die blauen Leuchtpilze unten in den Höhlen sind mir jedenfalls nicht geheuer.',
  wish:{pfeil:20,fleisch:3}, trade:[['pfeil',10,8],['bogen',1,18],['leder',3,9]]},
};
const NPC_ORDER = ['kalle','gerda','brems','mecki','uschi','willi','funker','rudi','doris'];
// Zufällige Gerüchte, die NPCs erzählen
const RUMORS = [
 'Man sagt, in einem der Hochhäuser hat jemand ein geheimes Lager mit Waffentresor versteckt. Ganz oben oder ganz unten – wer weiß das schon.',
 'Die Kannibalen im Wald lassen dich in Ruhe, wenn du sie in Ruhe lässt. Ihre grünen Kekse würde ich trotzdem nicht essen. Grüne Kekse sind aus Leuten!',
 'Alle sieben Tage färbt sich der Mond rot. Dann kommen sie alle. Bau dir was Festes – Stahl, wenn du kannst.',
 'Die Sumpfbrüder haben ihr Lager voll mit Munition. Wer sich traut ...',
 'In den Höhlen tief unten haust etwas mit zwei Köpfen. Es soll ein pochendes Herz bei sich tragen.',
 'Mit einem Mutantenherz, rohem Fleisch und Knochen kannst du am Feuer etwas Großes rufen. Mach das nur, wenn du lebensmüde bist.',
 'Ich hab gehört, die Geier hören auf eine Königin. Mit der richtigen Pfeife kommt sie angeflogen.',
 '„Die kommen dich holen, Babsi!“ – hat mein Opa immer auf dem Friedhof gesagt. Jetzt stimmt\'s.',
 'Nachts sind die Schlurfer schneller und stärker. Tagsüber pennen viele in Häusern. Leise sein!',
 'Fürs Erste: Holz hacken, Feuer machen, Wasser abkochen. Dreckwasser macht krank.',
];
