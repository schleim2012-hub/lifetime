// Lifetime 0.5 – Teil D: Kino-Titelbild, Intro im Flugzeug, Neues-Spiel-Dialog
'use strict';
const INTRO_KEY='lifetime_intro_seen';
// ---------- Titel ----------
const TT={parts:[],t:0,comet:null,flash:0};
function titleFrame5(dt){ TT.t+=dt; const VW=G.VW, VH=G.VH, t=TT.t; ctx.imageSmoothingEnabled=false; const bg=ART5I.titlebg;
  ctx.fillStyle='#07040a'; ctx.fillRect(0,0,VW,VH);
  if(bg.complete&&bg.naturalWidth){ const z=Math.max(VW/bg.naturalWidth,VH/bg.naturalHeight)*(1.12+0.05*Math.sin(t*0.05)); const w=bg.naturalWidth*z, h=bg.naturalHeight*z; const px=(VW-w)/2+Math.sin(t*0.07)*(w-VW)*0.45, py=(VH-h)/2+Math.cos(t*0.05)*(h-VH)*0.3; ctx.drawImage(bg,Math.round(px),Math.round(py),Math.round(w),Math.round(h)); }
  // Komet zieht über den Himmel
  if(!TT.comet||TT.comet.x>VW+120){ TT.comet={x:-80-Math.random()*200,y:VH*(0.05+Math.random()*0.15),v:26+Math.random()*10}; }
  const c=TT.comet; c.x+=c.v*dt; c.y+=c.v*dt*0.18; ctx.save(); ctx.globalCompositeOperation='lighter'; const gr=ctx.createLinearGradient(c.x,c.y,c.x-110,c.y-20); gr.addColorStop(0,'rgba(255,250,220,0.95)'); gr.addColorStop(0.2,'rgba(120,220,255,0.6)'); gr.addColorStop(1,'rgba(60,120,255,0)'); ctx.strokeStyle=gr; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(c.x,c.y); ctx.lineTo(c.x-110,c.y-20); ctx.stroke(); ctx.drawImage(LOOK.glow.blue,c.x-18,c.y-18,36,36); ctx.fillStyle='#fff'; ctx.fillRect(Math.round(c.x)-1,Math.round(c.y)-1,3,3); ctx.restore();
  // Lichtstrahlen
  ctx.save(); ctx.globalCompositeOperation='lighter'; for(let i=0;i<4;i++){ const a=-0.9+i*0.22+Math.sin(t*0.2+i)*0.05; const ox=VW*0.78, oy=-20; ctx.globalAlpha=0.06+0.03*Math.sin(t*0.6+i*1.7); ctx.fillStyle='#ffc890'; ctx.beginPath(); ctx.moveTo(ox,oy); ctx.lineTo(ox+Math.cos(a+Math.PI/2)*VH*1.6-30,oy+Math.sin(a+Math.PI/2)*VH*1.6); ctx.lineTo(ox+Math.cos(a+Math.PI/2)*VH*1.6+30,oy+Math.sin(a+Math.PI/2)*VH*1.6); ctx.closePath(); ctx.fill(); } ctx.restore();
  // Vordergrund: dunkle Ruinen-Silhouette mit glühenden Fenstern (Parallaxe)
  for(let L=0;L<2;L++){ const sp=L?14:7, base=VH-(L?6:28), col=L?'#050304':'#120a0c'; const off=-(t*sp)%600; ctx.fillStyle=col;
    for(let i=-1;i<Math.ceil(VW/40)+3;i++){ const x=Math.round(off+i*40), k=((i-Math.floor(off/40))*7919)%97; const bh=(L?22:46)+Math.abs(k)%(L?26:60); ctx.fillStyle=col; ctx.fillRect(x,base-bh,L?34:30,bh+40);
      if(!L){ for(let wy=base-bh+5;wy<base-4;wy+=7) for(let wx=x+4;wx<x+26;wx+=7){ const fl=Math.sin(t*3+wx*0.7+wy)*0.5+0.5; if(((wx*13+wy*7)%5)===0){ ctx.fillStyle=`rgba(255,${120+fl*60|0},40,${0.5+fl*0.4})`; ctx.fillRect(wx,wy,3,3); } } ctx.fillStyle=col; } } }
  // Nebel
  ctx.save(); for(let i=0;i<3;i++){ const y=VH*(0.68+i*0.1); const gr2=ctx.createLinearGradient(0,y-24,0,y+24); gr2.addColorStop(0,'rgba(90,60,60,0)'); gr2.addColorStop(0.5,`rgba(90,60,60,${0.18+i*0.05})`); gr2.addColorStop(1,'rgba(90,60,60,0)'); ctx.fillStyle=gr2; ctx.fillRect(0,y-24,VW,48); } ctx.restore();
  // Asche + Glut
  while(TT.parts.length<140){ const em=Math.random()<0.3; TT.parts.push({x:Math.random()*VW,y:em?VH+4:-4-Math.random()*VH,vx:em?(Math.random()-0.3)*14:-8-Math.random()*8,vy:em?-14-Math.random()*22:8+Math.random()*10,em,life:6+Math.random()*8,ph:Math.random()*6}); }
  ctx.save(); for(const p of TT.parts){ p.life-=dt; p.x+=(p.vx+Math.sin(t+p.ph)*6)*dt; p.y+=p.vy*dt; if(p.em){ ctx.globalCompositeOperation='lighter'; const f=0.5+0.5*Math.sin(t*8+p.ph); ctx.fillStyle=`rgba(255,${110+f*80|0},30,${0.6+f*0.4})`; ctx.fillRect(Math.round(p.x),Math.round(p.y),1,1); } else { ctx.globalCompositeOperation='source-over'; ctx.fillStyle='rgba(170,160,160,0.55)'; ctx.fillRect(Math.round(p.x),Math.round(p.y),1,1); } }
  TT.parts=TT.parts.filter(p=>p.life>0&&p.y>-10&&p.y<VH+10&&p.x>-10&&p.x<VW+10); ctx.restore();
  // Wetterleuchten
  TT.flash-=dt; if(TT.flash<-6-Math.random()*6){ TT.flash=0.25; } if(TT.flash>0){ ctx.fillStyle=`rgba(255,220,200,${TT.flash*0.5})`; ctx.fillRect(0,0,VW,VH); }
  // Kino-Balken + Vignette
  const bar=Math.round(VH*0.075*Math.min(1,t/2)); ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,bar); ctx.fillRect(0,VH-bar,VW,bar);
  if(typeof drawVignette==='function') drawVignette(); }
// ---------- Intro im Flugzeug ----------
const CINE={t:0,subs:[],done:false};
const CINE_SUBS=[[1.2,4.6,'Kapitän:','„Meine Damen und Herren, hier spricht Ihr Kapitän …“'],[5.0,9.0,'Kapitän:','„Ein Komet ist in der Stadt eingeschlagen. Der Luftraum wird gesperrt.“'],[9.4,13.6,'Kapitän:','„Bitte bleiben Sie angeschnallt und machen Sie sich bereit für eine Notlandung!“'],[14.2,17.2,'Kapitän:','„Kopf runter! Festhalten! FESTHALTEN!“']];
const CINE_LEN=21.5;
function startCine5(){ G.state='cine'; CINE.t=0; CINE.done=false; CINE.said={}; CINE.parts=[]; $('title').classList.add('hide'); $('hud').classList.add('hide'); $('cine').classList.remove('hide'); $('cinesub').innerHTML=''; if(typeof MUSX!=='undefined'&&MUSX.tr){ for(const k in MUSX.tr){ const tr=MUSX.tr[k]; tr.target=0; rampMusic(tr,0,1.5); } } SND.mode='stille'; SND.wantMode='stille'; sfx('cabin'); }
function endCine5(){ if(CINE.done) return; CINE.done=true; try{ localStorage.setItem(INTRO_KEY,'1'); }catch(e){} $('cine').classList.add('hide'); stopCabin5(); newGame(); UI.fade(); msg('Irgendwo im Wald. Das Flugzeug ist hin. Du lebst.','#ffcc80'); }
function cineFrame5(dt){ CINE.t+=dt; const t=CINE.t, VW=G.VW, VH=G.VH; ctx.imageSmoothingEnabled=false;
  const shake=t<9?0.6:t<14?1.5+Math.sin(t*3)*0.5:t<18.5?4+(t-14)*1.6:0; const sx=(Math.random()-0.5)*shake*2, sy=(Math.random()-0.5)*shake*2+Math.sin(t*1.3)*1.2;
  const turn=Math.min(1,Math.max(0,(t-3)/3))*(t<12?1:Math.max(0.55,1-(t-12)/4)); // Kopf dreht sich zum Fenster
  const tilt=t>14?Math.min(0.28,(t-14)*0.07)*Math.sin(t*0.9):0;
  ctx.save(); ctx.translate(VW/2+sx,VH/2+sy); ctx.rotate(tilt); ctx.translate(-VW/2,-VH/2);
  // Kabinenwand
  { const g0=ctx.createLinearGradient(0,0,0,VH); g0.addColorStop(0,'#1a1820'); g0.addColorStop(0.35,'#3a3542'); g0.addColorStop(0.7,'#2e2a36'); g0.addColorStop(1,'#141218'); ctx.fillStyle=g0; ctx.fillRect(-40,-40,VW+80,VH+80); } const wx=VW*0.5-turn*VW*0.22, z=1+turn*1.25; const ww=70*z, wh=96*z, wy=VH*0.42-wh/2;
  // Wandpaneele
  ctx.fillStyle='#3a3540'; for(let i=-2;i<6;i++){ const px=wx-ww*0.5+i*ww*1.6-ww*1.3; ctx.fillRect(Math.round(px),Math.round(wy-30*z),Math.round(ww*1.4),Math.round(wh+60*z)); }
  // Fenster (Blick nach draußen)
  ctx.save(); ctx.beginPath(); const rx=ww/2, ry=wh/2, cxw=wx, cyw=wy+wh/2; ctx.ellipse(cxw,cyw,rx,ry,0,0,Math.PI*2); ctx.clip();
  const bg=ART5I.titlebg; ctx.fillStyle='#1a0c10'; ctx.fillRect(cxw-rx,cyw-ry,ww,wh);
  if(bg.complete&&bg.naturalWidth){ const s=(wh*1.9)/bg.naturalHeight; const bw=bg.naturalWidth*s; const pan=((t*26*z)%bw); for(let k=-1;k<2;k++) ctx.drawImage(bg,Math.round(cxw-rx-pan+k*bw),Math.round(cyw-wh*1.05+ (t>14?(t-14)*6*z:0)),Math.round(bw),Math.round(bg.naturalHeight*s)); }
  // Komet + Einschlag-Blitz im Fenster
  if(t>6&&t<14){ const k=(t-6)/8; const kx=cxw+rx*(0.9-k*1.4), ky=cyw-ry*(0.8-k*0.9); ctx.save(); ctx.globalCompositeOperation='lighter'; ctx.strokeStyle='rgba(180,230,255,0.9)'; ctx.lineWidth=2*z; ctx.beginPath(); ctx.moveTo(kx,ky); ctx.lineTo(kx+40*z,ky-22*z); ctx.stroke(); ctx.drawImage(LOOK.glow.blue,kx-20*z,ky-20*z,40*z,40*z); ctx.restore(); }
  if(t>13.6&&t<14.6){ ctx.fillStyle=`rgba(255,255,240,${1-(t-13.6)})`; ctx.fillRect(cxw-rx,cyw-ry,ww,wh); }
  // Glut/Rauch am Fenster
  if(Math.random()<0.6) CINE.parts.push({x:cxw+rx,y:cyw+(Math.random()-0.5)*wh,vx:-(60+Math.random()*80)*z,vy:(Math.random()-0.5)*10,life:1.4,em:Math.random()<0.5});
  for(const p of CINE.parts){ p.life-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt; ctx.fillStyle=p.em?'#ff9a3a':'rgba(60,50,50,0.7)'; ctx.fillRect(Math.round(p.x),Math.round(p.y),p.em?Math.max(1,z|0):Math.round(4*z),p.em?Math.max(1,z|0):Math.round(3*z)); } CINE.parts=CINE.parts.filter(p=>p.life>0);
  ctx.restore();
  // Feuerschein durchs Fenster auf der Kabinenwand
  { ctx.save(); ctx.globalCompositeOperation='lighter'; const fl=0.25+0.12*Math.sin(t*7)+0.08*Math.sin(t*13.7)+(t>13.6&&t<14.6?0.6:0); const rg=ctx.createRadialGradient(cxw,cyw,rx*0.6,cxw,cyw,rx*3.2); rg.addColorStop(0,`rgba(255,110,40,${fl})`); rg.addColorStop(1,'rgba(255,60,20,0)'); ctx.fillStyle=rg; ctx.fillRect(cxw-rx*3.2,cyw-rx*3.2,rx*6.4,rx*6.4); ctx.restore(); }
  // Blende halb heruntergezogen
  ctx.fillStyle='#c8c2cc'; ctx.save(); ctx.beginPath(); ctx.ellipse(cxw,cyw,rx,ry,0,0,Math.PI*2); ctx.clip(); ctx.fillRect(cxw-rx,cyw-ry,ww,Math.round(wh*0.16)); ctx.fillStyle='#9a94a0'; ctx.fillRect(cxw-rx,cyw-ry+Math.round(wh*0.16)-2,ww,2); ctx.restore();
  // Fensterrahmen
  ctx.strokeStyle='#bab4c4'; ctx.lineWidth=Math.max(2,5*z); ctx.beginPath(); ctx.ellipse(cxw,cyw,rx+2*z,ry+2*z,0,0,Math.PI*2); ctx.stroke(); ctx.strokeStyle='#6a6474'; ctx.lineWidth=Math.max(1,2*z); ctx.beginPath(); ctx.ellipse(cxw,cyw,rx+5*z,ry+5*z,0,0,Math.PI*2); ctx.stroke();
  // Gepäckfach oben
  ctx.fillStyle='#4a4450'; ctx.fillRect(-40,-40,VW+80,Math.round(VH*0.12+20)); ctx.fillStyle='#5a5462'; ctx.fillRect(-40,Math.round(VH*0.12-24),VW+80,4); ctx.fillStyle=(t%1<0.5||t<9)?'#ffd54f':'#6a5a20'; ctx.fillRect(Math.round(VW*0.62-turn*60),Math.round(VH*0.12-16),18,7); ctx.fillStyle='#2a2630'; ctx.fillRect(Math.round(VW*0.62-turn*60)+3,Math.round(VH*0.12-14),12,3);
  // Sauerstoffmasken
  if(t>14.3){ const dropY=Math.min(1,(t-14.3)*2.5); for(let i=0;i<3;i++){ const mx=VW*(0.25+i*0.3)-turn*40, my=VH*0.12+dropY*48+Math.sin(t*4+i)*3; ctx.strokeStyle='#ddd'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(mx,VH*0.1); ctx.lineTo(mx,my); ctx.stroke(); ctx.fillStyle='#ffd23a'; ctx.fillRect(Math.round(mx-5),Math.round(my),10,8); ctx.fillStyle='#c89a10'; ctx.fillRect(Math.round(mx-5),Math.round(my+6),10,2); } }
  // Sitzlehnen vor dir (Ego-Perspektive)
  const seatX=VW*0.5+turn*VW*0.25; ctx.fillStyle='#1c2a48'; ctx.fillRect(Math.round(seatX-120),Math.round(VH*0.62),110,VH); ctx.fillRect(Math.round(seatX+10),Math.round(VH*0.62),110,VH);
  ctx.fillStyle='#24365c'; ctx.fillRect(Math.round(seatX-112),Math.round(VH*0.56),94,40); ctx.fillRect(Math.round(seatX+18),Math.round(VH*0.56),94,40); ctx.fillStyle='#e8e4dc'; ctx.fillRect(Math.round(seatX-100),Math.round(VH*0.56),70,10); ctx.fillRect(Math.round(seatX+30),Math.round(VH*0.56),70,10);
  ctx.fillStyle='#10182a'; ctx.fillRect(Math.round(seatX-90),Math.round(VH*0.76),50,26); ctx.fillStyle=t<9?'#2a5a8a':'#000'; ctx.fillRect(Math.round(seatX-86),Math.round(VH*0.77),42,20); // Bildschirm
  // Hände am Armlehnen (eigene)
  ctx.fillStyle='#c8946a'; ctx.fillRect(14,VH-22,30,22); ctx.fillRect(VW-44,VH-22,30,22); ctx.fillStyle='#a87452'; ctx.fillRect(14,VH-22,30,3); ctx.fillRect(VW-44,VH-22,30,3);
  ctx.restore();
  // Alarmlicht
  if(t>13.8&&t<19){ ctx.fillStyle=`rgba(255,20,20,${(Math.sin(t*9)*0.5+0.5)*0.22})`; ctx.fillRect(0,0,VW,VH); }
  // Absturz: Weißblitz -> Schwarz
  if(t>18.4){ const k=Math.min(1,(t-18.4)/0.35); ctx.fillStyle=t<18.9?`rgba(255,250,240,${k})`:'#000'; ctx.fillRect(0,0,VW,VH); }
  if(t>18.9&&t<21){ ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,VH); }
  // Einblende am Anfang
  if(t<1){ ctx.fillStyle=`rgba(0,0,0,${1-t})`; ctx.fillRect(0,0,VW,VH); }
  const bar=Math.round(VH*0.09); ctx.fillStyle='#000'; ctx.fillRect(0,0,VW,bar); ctx.fillRect(0,VH-bar,VW,bar);
  // Untertitel + Kauderwelsch-Durchsagen
  let sub=''; for(const [a,b,who,txt] of CINE_SUBS){ if(t>=a&&t<b){ sub=`<span class="who">${who}</span> ${txt}`; if(!CINE.said[a]){ CINE.said[a]=1; pilotBabble5(b-a-0.6, a>14); } } }
  if(t>19&&t<21.2) sub='<span class="who"></span> …'; const el=$('cinesub'); if(el._s!==sub){ el._s=sub; el.innerHTML=sub; }
  // Geräusche
  if(t>13.6&&!CINE.said.boom1){ CINE.said.boom1=1; sfx('boom'); alarm5(true); }
  if(t>18.4&&!CINE.said.crash){ CINE.said.crash=1; sfx('boom'); setTimeout(()=>sfx('boom'),120); setTimeout(()=>sfx('brk'),260); alarm5(false); stopCabin5(); }
  if(t>=CINE_LEN) endCine5(); }
// Kauderwelsch-Pilot: Stimme durch Bordlautsprecher (Bandpass + Rauschen)
function pilotBabble5(dur,panic){ if(!SND.ctx) return; const c=SND.ctx; const t0=c.currentTime+0.05; const bus=c.createGain(); bus.gain.value=1; const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=1500; bp.Q.value=0.9; const ws=c.createWaveShaper(); const cu=new Float32Array(256); for(let i=0;i<256;i++){ const x=i/128-1; cu[i]=Math.tanh(x*2.2); } ws.curve=cu; bus.connect(ws); ws.connect(bp); bp.connect(SND.sfx);
  nz(t0,0.12,0.05,{f:2500,q:0.6,dest:bus}); osc('sine',1046,t0,0.18,0.05,{dest:bus}); osc('sine',784,t0+0.2,0.25,0.05,{dest:bus}); // Gong
  let t=t0+0.6; const end=t0+dur; const base=panic?190:125;
  while(t<end-0.15){ const syl=0.09+Math.random()*0.12; const f=base*(0.85+Math.random()*0.35)*(panic?1.1:1); const F1=[300,450,600,750][Math.random()*4|0], F2=[900,1200,1700,2200][Math.random()*4|0];
    const s=c.createOscillator(); s.type='sawtooth'; s.frequency.setValueAtTime(f,t); s.frequency.linearRampToValueAtTime(f*(0.9+Math.random()*0.25),t+syl); const g=c.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(panic?0.22:0.15,t+0.02); g.gain.exponentialRampToValueAtTime(0.0001,t+syl);
    for(const [ff,q,gn] of [[F1,6,1],[F2,8,0.6],[2800,10,0.25]]){ const b=c.createBiquadFilter(); b.type='bandpass'; b.frequency.value=ff; b.Q.value=q; const fg=c.createGain(); fg.gain.value=gn; s.connect(b); b.connect(fg); fg.connect(g); } g.connect(bus); s.start(t); s.stop(t+syl+0.02);
    if(Math.random()<0.35) nz(t+syl*0.6,0.05,0.04,{f:4000,q:1.5,dest:bus}); t+=syl+(Math.random()<0.2?0.18:0.02); }
  nz(t0,dur,0.012,{f:3000,q:0.4,dest:bus}); }
let CAB5=null; SFX.cabin=function(){ if(CAB5) return; const c=SND.ctx; const s=c.createBufferSource(); s.buffer=SND.noiseBuf; s.loop=true; const f=c.createBiquadFilter(); f.type='lowpass'; f.frequency.value=320; const g=c.createGain(); g.gain.value=0.0001; g.gain.exponentialRampToValueAtTime(0.16,c.currentTime+1.5); s.connect(f); f.connect(g); g.connect(SND.sfx); s.start(); CAB5={s,g}; };
function stopCabin5(){ if(!CAB5||!SND.ctx) return; try{ CAB5.g.gain.setTargetAtTime(0.0001,SND.ctx.currentTime,0.1); CAB5.s.stop(SND.ctx.currentTime+0.5); }catch(e){} CAB5=null; }
let ALARM5=null; function alarm5(on){ if(!SND.ctx) return; if(!on){ clearInterval(ALARM5); ALARM5=null; return; } if(ALARM5) return; let k=0; ALARM5=setInterval(()=>{ const t=now(); osc('square',k++%2?740:960,t,0.22,0.045,{lp:2500}); },260); }
// ---------- Neues Spiel: eigener Dialog statt confirm() (in der App-WebView ging confirm nicht) ----------
function newGameFlow5(){ audioInit(); if(hasSave()){ $('ngmodal').classList.remove('hide'); sfx('click'); return; } beginNew5(); }
function beginNew5(){ $('ngmodal').classList.add('hide'); try{ localStorage.removeItem(SAVE_KEY); }catch(e){} let seen=false; try{ seen=!!localStorage.getItem(INTRO_KEY); }catch(e){}
  if(!seen) startCine5(); else { $('title').classList.add('hide'); newGame(); UI.fade(); } }
$('t-new').onclick=newGameFlow5; $('ng-yes').onclick=()=>{ sfx('click'); beginNew5(); }; $('ng-no').onclick=()=>{ sfx('click'); $('ngmodal').classList.add('hide'); };
$('cine').addEventListener('touchstart',e=>{ e.preventDefault(); if(CINE.t>0.6) endCine5(); },{passive:false}); $('cine').addEventListener('mousedown',()=>{ if(CINE.t>0.6) endCine5(); });
// ---------- Hauptschleife ersetzen ----------
loop=function(t){ requestAnimationFrame(loop); const dt=Math.min(0.05,(t-last)/1000||0.016); last=t;
  try{ if(G.state==='play'){ if(!G.paused&&!G.player.dead) update(dt); else if(G.player.dead){ G.clock+=dt; } render(); UI.hud(dt); }
    else if(G.state==='cine'){ G.clock=(G.clock||0)+dt; cineFrame5(dt); }
    else { G.clock=(G.clock||0)+dt; titleFrame5(dt); } }
  catch(err){ console.error(err); if(!G.errShown){ G.errShown=true; msg('Fehler: '+err.message,'#ff5252'); } } };
const _toTitle5=toTitle; toTitle=function(){ G.state='title'; $('title').classList.remove('hide'); $('hud').classList.add('hide'); $('t-cont').classList.toggle('hide',!hasSave()); musicMode('titel'); TT.t=0; G.w=null; G.player=null; };
// Logo + Version
(function(){ const lg=$('logo'); lg.innerHTML=`<img src="${ART5.logo}" alt="LIFETIME">`; lg.classList.add('v5'); $('tver').textContent='Version 0.5.1 · Biome'; $('sub').textContent='Überleben. Bauen. Herausfinden, was passiert ist.'; })();
toTitle();
