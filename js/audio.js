// Lifetime 0.3 – Klang: cineastische Soundeffekte (prozedural, geschichtet, mit Hall) + dynamische Musik
// Musik-Dateien (assets/music/*.mp3) stammen aus ElevenLabs; fehlt eine Datei, spielt der prozedurale Score.
'use strict';
const SND={ctx:null,master:null,sfx:null,mus:null,rev:null,vol:{mus:0.5,sfx:0.8},mode:null,timer:null,step:0,noiseBuf:null,tracks:{},cur:null};
const MUSIC_FILES={tag:'music/tag.mp3',nacht:'music/nacht.mp3',titel:'music/nacht.mp3',hoehle:'music/nacht.mp3',kampf:'music/kampf.mp3',blut:'music/blut.mp3',boss:'music/kampf.mp3'};
SND.samples={};
function loadSamples(){ if(typeof SFX_DATA==='undefined') return; for(const k in SFX_DATA){ try{ const b64=SFX_DATA[k].split(',')[1]; const bin=atob(b64); const u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++) u[i]=bin.charCodeAt(i); SND.ctx.decodeAudioData(u.buffer,buf=>{ SND.samples[k]=buf; },()=>{}); }catch(e){} } }
// Sample abspielen (Tonhöhe, Filter, Hall, Verzerrung)
function samp(k,t,o){ const b=SND.samples[k]; if(!b) return false; o=o||{}; const c=SND.ctx; const s=c.createBufferSource(); s.buffer=b; s.playbackRate.value=o.rate||1; const g=c.createGain(); g.gain.value=o.vol||0.8; let n=s; if(o.lp||o.hp){ const f=c.createBiquadFilter(); f.type=o.lp?'lowpass':'highpass'; f.frequency.value=o.lp||o.hp; n.connect(f); n=f; } n.connect(g); g.connect(SND.sfx); const r=c.createGain(); r.gain.value=o.rev==null?0.6:o.rev; g.connect(r); r.connect(SND.sfxRev); if(o.dist){ const dg=c.createGain(); dg.gain.value=o.dist; g.connect(dg); dg.connect(SND.dist); } s.start(t,o.off||0); if(o.dur) s.stop(t+o.dur); return true; }
function makeImpulse(c,sec,decay){ const len=c.sampleRate*sec|0; const b=c.createBuffer(2,len,c.sampleRate); for(let ch=0;ch<2;ch++){ const d=b.getChannelData(ch); for(let i=0;i<len;i++){ d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay); } } return b; }
function makeCurve(k){ const n=1024, a=new Float32Array(n); for(let i=0;i<n;i++){ const x=i/n*2-1; a[i]=(1+k)*x/(1+k*Math.abs(x)); } return a; }
function audioInit(){
  if(SND.ctx){ if(SND.ctx.state==='suspended') SND.ctx.resume(); return; }
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  const c=new AC(); SND.ctx=c;
  const comp=c.createDynamicsCompressor(); comp.threshold.value=-14; comp.knee.value=12; comp.ratio.value=4; comp.attack.value=0.004; comp.release.value=0.2; comp.connect(c.destination);
  SND.master=c.createGain(); SND.master.gain.value=0.9; SND.master.connect(comp);
  // Hall-Bus
  SND.rev=c.createConvolver(); SND.rev.buffer=makeImpulse(c,2.8,3.2); const rg=c.createGain(); rg.gain.value=0.55; SND.rev.connect(rg); rg.connect(SND.master);
  SND.sfx=c.createGain(); SND.sfx.gain.value=SND.vol.sfx; SND.sfx.connect(SND.master);
  SND.sfxRev=c.createGain(); SND.sfxRev.gain.value=SND.vol.sfx*0.35; SND.sfxRev.connect(SND.rev);
  SND.mus=c.createGain(); SND.mus.gain.value=SND.vol.mus*0.5; SND.mus.connect(SND.master);
  SND.musRev=c.createGain(); SND.musRev.gain.value=SND.vol.mus*0.6; SND.musRev.connect(SND.rev);
  SND.dist=c.createWaveShaper(); SND.dist.curve=makeCurve(18); SND.dist.connect(SND.sfx);
  const len=c.sampleRate*2; const b=c.createBuffer(1,len,c.sampleRate); const d=b.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1; SND.noiseBuf=b;
  loadSamples(); if(SND.wantMode) musicMode(SND.wantMode);
}
function setVol(k,v){ SND.vol[k]=v; if(!SND.ctx) return; if(k==='sfx'){ SND.sfx.gain.value=v; SND.sfxRev.gain.value=v*0.35; } else { SND.mus.gain.value=v*0.5; SND.musRev.gain.value=v*0.6; for(const k2 in SND.tracks) SND.tracks[k2].el.volume=Math.min(1,SND.tracks[k2].lv*v); } }
const now=()=>SND.ctx.currentTime;
// Grundbausteine
function env(g,t,a,peak,dur){ g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(peak,t+a); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); }
function osc(type,f,t,dur,peak,o){ o=o||{}; const c=SND.ctx; const s=c.createOscillator(), g=c.createGain(); s.type=type; s.frequency.setValueAtTime(f,t); if(o.to) s.frequency.exponentialRampToValueAtTime(Math.max(18,o.to),t+(o.toT||dur)); if(o.det) s.detune.value=o.det;
  env(g,t,o.a||0.004,peak,dur); let n=s; if(o.lp||o.bp||o.hp){ const fl=c.createBiquadFilter(); fl.type=o.lp?'lowpass':o.bp?'bandpass':'highpass'; fl.frequency.setValueAtTime(o.lp||o.bp||o.hp,t); if(o.lpTo) fl.frequency.exponentialRampToValueAtTime(o.lpTo,t+dur); fl.Q.value=o.q||0.8; n.connect(fl); n=fl; }
  n.connect(g); g.connect(o.dest||SND.sfx); if(o.rev) { const r=c.createGain(); r.gain.value=o.rev; g.connect(r); r.connect(o.revDest||SND.sfxRev); } if(o.dist){ g.connect(SND.dist); }
  if(o.vib){ const l=c.createOscillator(), lg=c.createGain(); l.frequency.value=o.vib; lg.gain.value=o.vibD||f*0.03; l.connect(lg); lg.connect(s.frequency); l.start(t); l.stop(t+dur+0.05); }
  s.start(t); s.stop(t+dur+0.05); return s; }
function nz(t,dur,peak,o){ o=o||{}; const c=SND.ctx; const s=c.createBufferSource(); s.buffer=SND.noiseBuf; s.playbackRate.value=o.rate||1; const fl=c.createBiquadFilter(); fl.type=o.type||'bandpass'; fl.frequency.setValueAtTime(o.f||1000,t); if(o.fTo) fl.frequency.exponentialRampToValueAtTime(o.fTo,t+dur); fl.Q.value=o.q||1; const g=c.createGain(); env(g,t,o.a||0.002,peak,dur);
  s.connect(fl); fl.connect(g); g.connect(o.dest||SND.sfx); if(o.rev){ const r=c.createGain(); r.gain.value=o.rev; g.connect(r); r.connect(o.revDest||SND.sfxRev); } if(o.dist) g.connect(SND.dist); s.start(t,Math.random()*1.5); s.stop(t+dur+0.05); }
// Kompatibilität (alte Aufrufe)
function tone(f,dur,type,vol,slide,when,dest){ if(!SND.ctx) return; osc(type||'square',f,when||now(),dur,vol||0.2,{to:slide,dest}); }
function noise(dur,vol,freq,q,when,dest,type){ if(!SND.ctx) return; nz(when||now(),dur,vol,{f:freq,q,dest,type}); }
// Formant-Stimme (Stöhnen, Brüllen, Schreie)
function voice(t,f,dur,peak,formants,o){ o=o||{}; const c=SND.ctx; const s=c.createOscillator(); s.type='sawtooth'; s.frequency.setValueAtTime(f,t); if(o.to) s.frequency.exponentialRampToValueAtTime(o.to,t+dur);
  const l=c.createOscillator(), lg=c.createGain(); l.frequency.value=o.vib||5; lg.gain.value=f*(o.vibD||0.04); l.connect(lg); lg.connect(s.frequency);
  const g=c.createGain(); env(g,t,o.a||0.06,peak,dur); for(const [ff,q,gn] of formants){ const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=ff; bp.Q.value=q; const fg=c.createGain(); fg.gain.value=gn; s.connect(bp); bp.connect(fg); fg.connect(g); }
  g.connect(SND.sfx); const r=c.createGain(); r.gain.value=o.rev||0.6; g.connect(r); r.connect(SND.sfxRev); if(o.dist) g.connect(SND.dist);
  s.start(t); l.start(t); s.stop(t+dur+0.05); l.stop(t+dur+0.05); }
const SFX={
 hit(){ const t=now(); nz(t,0.12,0.75,{f:700,q:0.6,type:'lowpass'}); nz(t,0.03,0.4,{f:2600,q:1.2}); nz(t+0.015,0.16,0.3,{f:420,q:2,rev:0.3}); osc('triangle',95,t,0.07,0.35,{to:70}); for(let i=0;i<3;i++) nz(t+0.03+i*0.025,0.03,0.12,{f:1200+Math.random()*900,q:6}); },
 chop(){ const t=now(); osc('triangle',190,t,0.09,0.4,{to:120}); nz(t,0.06,0.5,{f:1300,q:3}); nz(t,0.25,0.08,{f:700,q:2,rev:0.6}); },
 mine(){ const t=now(); osc('sine',1850+Math.random()*200,t,0.35,0.12,{rev:0.5}); osc('sine',2730,t,0.22,0.07); nz(t,0.05,0.45,{f:3500,q:2}); osc('sine',120,t,0.08,0.3,{to:60}); },
 brk(){ const t=now(); nz(t,0.4,0.45,{f:600,fTo:150,q:0.7,type:'lowpass',rev:0.4}); for(let i=0;i<4;i++) nz(t+0.05+i*0.05,0.05,0.2,{f:1500+Math.random()*1500,q:3}); nz(t,0.12,0.4,{f:240,q:0.8,type:'lowpass'}); },
 place(){ const t=now(); osc('triangle',120,t,0.05,0.25,{to:95}); nz(t,0.06,0.3,{f:800,q:1.5,type:'lowpass'}); },
 jump(){ const t=now(); nz(t,0.12,0.15,{f:500,fTo:1200,q:0.8}); osc('sine',180,t,0.08,0.12,{to:260}); },
 hurt(){ const t=now(); voice(t,180,0.25,0.35,[[700,6,1],[1200,8,0.6]],{to:120,rev:0.3}); osc('sine',110,t,0.25,0.5,{to:40}); nz(t,0.1,0.35,{f:700,type:'lowpass'}); },
 pick(){ const t=now(); osc('sine',1320,t,0.25,0.12,{rev:0.6}); osc('triangle',1980,t+0.06,0.3,0.08,{rev:0.6}); },
 eat(){ const t=now(); for(let i=0;i<3;i++) nz(t+i*0.11,0.07,0.3,{f:1400+Math.random()*600,q:2}); },
 drink(){ const t=now(); for(let i=0;i<4;i++) osc('sine',350+i*70,t+i*0.09,0.08,0.15,{to:500+i*70}); },
 craft(){ const t=now(); for(let i=0;i<2;i++){ osc('square',880-i*140,t+i*0.14,0.12,0.08,{lp:2500,rev:0.4}); nz(t+i*0.14,0.05,0.4,{f:3000,q:2}); osc('sine',200,t+i*0.14,0.1,0.3,{to:90}); } },
 shoot(){ const t=now(); nz(t,0.05,0.9,{f:2500,q:0.5,type:'highpass'}); nz(t,0.35,0.6,{f:1200,fTo:200,q:0.5,type:'lowpass',rev:1.2,dist:true}); osc('sine',120,t,0.3,0.8,{to:35}); },
 shotgun(){ const t=now(); nz(t,0.08,1,{f:1800,q:0.4,type:'highpass'}); nz(t,0.7,0.8,{f:900,fTo:120,q:0.4,type:'lowpass',rev:1.6,dist:true}); osc('sine',80,t,0.5,1,{to:28}); nz(t+0.45,0.08,0.15,{f:2500,q:3}); nz(t+0.6,0.06,0.15,{f:1800,q:3}); },
 bow(){ const t=now(); osc('triangle',480,t,0.14,0.18,{to:160}); nz(t,0.18,0.25,{f:2500,fTo:900,q:1.5}); },
 boom(){ const t=now(); osc('sine',70,t,1.4,1,{to:22}); nz(t,1.6,0.9,{f:1600,fTo:60,q:0.5,type:'lowpass',rev:1.8,dist:true}); nz(t,0.1,0.8,{f:3000,q:0.4,type:'highpass'}); for(let i=0;i<6;i++) nz(t+0.2+Math.random()*0.8,0.05,0.2,{f:2000+Math.random()*2000,q:4}); },
 groan(){ const t=now(); if(samp('groan',t,{rate:0.78+Math.random()*0.4,vol:0.55,lp:1800+Math.random()*2500,rev:0.7})) return; const f=70+Math.random()*40; voice(t,f,0.9+Math.random()*0.6,0.22,[[500,5,1],[900,7,0.6],[2400,9,0.2]],{to:f*0.75,vib:4+Math.random()*3,vibD:0.06,a:0.15,rev:0.9}); nz(t,0.8,0.05,{f:600,q:2,a:0.2}); },
 scream(){ const t=now(); if(SND.samples.groan){ samp('groan',t,{rate:1.55+Math.random()*0.3,vol:0.5,hp:500,rev:1,dist:0.4}); voice(t,560,0.7,0.12,[[1200,5,1],[2800,7,0.6]],{to:760,vib:11,vibD:0.1,a:0.03,rev:1}); return; } voice(t,520,1.1,0.32,[[1100,4,1],[2600,6,0.8],[3800,8,0.4]],{to:780,vib:9,vibD:0.08,a:0.05,rev:1.2,dist:true}); nz(t,1,0.25,{f:3000,q:1.2,rev:0.8}); },
 roar(){ const t=now(); if(SND.samples.groan){ samp('groan',t,{rate:0.55,vol:0.9,lp:1400,rev:1.3,dist:0.5}); nz(t,1.2,0.3,{f:300,q:0.8,a:0.08,rev:0.8}); osc('triangle',48,t,1.0,0.35,{a:0.1}); return; } voice(t,58,1.6,0.6,[[350,3,1],[700,4,0.7],[1500,6,0.3]],{to:42,vib:7,vibD:0.1,a:0.12,rev:1.4,dist:true}); osc('sine',45,t,1.6,0.7,{to:30,a:0.1}); nz(t,1.4,0.35,{f:500,q:0.8,a:0.1,rev:0.8}); },
 door(){ const t=now(); voice(t,240,0.35,0.12,[[900,10,1],[1700,12,0.5]],{to:180,vib:22,vibD:0.15,a:0.02,rev:0.5}); osc('sine',110,t+0.3,0.15,0.35,{to:55}); nz(t+0.3,0.08,0.3,{f:600,type:'lowpass'}); },
 level(){ const t=now(); [523,659,784,1046,1318].forEach((f,i)=>{ osc('triangle',f,t+i*0.08,0.9,0.12,{rev:1}); osc('sine',f*2,t+i*0.08,0.6,0.04,{rev:1}); }); osc('sine',130,t,1.2,0.25,{a:0.05,rev:0.5}); },
 tick(){ const t=now(); osc('square',1500+Math.random()*300,t,0.015,0.02,{lp:3000}); },
 click(){ const t=now(); osc('sine',1200,t,0.03,0.08); nz(t,0.015,0.1,{f:4000,q:2}); },
 splash(){ const t=now(); nz(t,0.6,0.45,{f:2500,fTo:300,q:0.6,type:'lowpass',rev:0.8}); for(let i=0;i<5;i++) osc('sine',600+Math.random()*900,t+Math.random()*0.3,0.08,0.05,{to:1500}); },
 bark(){ const t=now(); voice(t,300,0.18,0.3,[[800,4,1],[1600,6,0.5]],{to:200,a:0.01,rev:0.6,dist:true}); },
 bird(){ const t=now(); osc('sine',1800,t,0.3,0.06,{to:1200,rev:0.8,vib:30,vibD:0.05}); },
 honk(){ SFX.giggle(); },
 giggle(){ const t=now(); const n=4+Math.random()*3|0; for(let i=0;i<n;i++){ const f=330-i*18+Math.random()*30; voice(t+i*0.13,f,0.11,0.09,[[900,6,1],[2300,8,0.5]],{to:f*0.85,vib:14,vibD:0.05,a:0.015,rev:1.1}); nz(t+i*0.13,0.1,0.05,{f:2600,q:1.5,rev:0.6}); } },
 saw(){ const t=now(); const c=SND.ctx; const s=c.createOscillator(); s.type='sawtooth'; s.frequency.setValueAtTime(70,t); s.frequency.linearRampToValueAtTime(130,t+0.25); s.frequency.linearRampToValueAtTime(105,t+0.8); const am=c.createOscillator(), ag=c.createGain(); am.frequency.value=38; ag.gain.value=0.5; const g=c.createGain(); g.gain.value=0; am.connect(ag); ag.connect(g.gain); env(g,t,0.03,0.25,0.9); const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=1100; bp.Q.value=0.7; s.connect(bp); bp.connect(g); g.connect(SND.dist); const r=c.createGain(); r.gain.value=0.3; g.connect(r); r.connect(SND.sfxRev); s.start(t); am.start(t); s.stop(t+1); am.stop(t+1); },
 thud(){ const t=now(); nz(t,0.3,0.8,{f:260,q:0.6,type:'lowpass',rev:0.7}); nz(t,0.05,0.35,{f:1800,q:1}); for(let i=0;i<4;i++) nz(t+0.05+Math.random()*0.15,0.04,0.12,{f:900+Math.random()*1500,q:5}); },
 splat(){ const t=now(); nz(t,0.25,0.6,{f:500,fTo:180,q:1.2,type:'lowpass',rev:0.4}); for(let i=0;i<5;i++) nz(t+Math.random()*0.18,0.05,0.25,{f:700+Math.random()*900,q:4}); voice(t,90,0.3,0.08,[[400,4,1],[900,6,0.4]],{to:60,vib:18,vibD:0.2,rev:0.5}); },
 treefall(){ const t=now(); voice(t,62,0.9,0.12,[[300,8,1],[800,10,0.5],[1600,12,0.2]],{to:48,vib:24,vibD:0.25,a:0.1,rev:0.8}); for(let i=0;i<7;i++) nz(t+i*0.09+Math.random()*0.04,0.05,0.35,{f:1400+Math.random()*1800,q:5}); nz(t+0.7,0.8,0.7,{f:700,fTo:120,q:0.6,type:'lowpass',rev:1.2}); for(let i=0;i<10;i++) nz(t+0.75+Math.random()*0.6,0.08,0.12,{f:3000+Math.random()*3000,q:2,rev:0.6}); },
 woodthud(){ const t=now(); nz(t,0.16,0.45,{f:380,q:1.5,type:'lowpass',rev:0.3}); nz(t,0.04,0.2,{f:1500,q:3}); },
 vomit(){ const t=now(); if(SND.samples.groan) samp('groan',t,{rate:1.25,vol:0.35,dur:0.4,lp:2500,rev:0.4}); voice(t+0.15,140,0.7,0.16,[[600,4,1],[1100,6,0.6]],{to:90,vib:26,vibD:0.3,a:0.03,rev:0.6,dist:true}); nz(t+0.18,0.7,0.4,{f:1400,fTo:500,q:0.8,rev:0.5}); for(let i=0;i<6;i++) nz(t+0.3+Math.random()*0.5,0.05,0.2,{f:600+Math.random()*1200,q:5}); },
};
function sfx(n){ try{ if(SND.ctx&&SFX[n]) SFX[n](); }catch(e){} }
// ---- Musik ----
// Modi: titel, tag, nacht, hoehle, kampf, blut, boss. Datei-Tracks mit Überblendung + prozeduraler Score darüber/statt dessen.
const MUS={
 titel:{bpm:60,root:38,drone:true,pad:0.05,choir:0,drums:0,ost:0,dark:true},
 tag:{bpm:70,root:45,drone:false,pad:0.04,choir:0,drums:0,ost:0,bell:true},
 nacht:{bpm:56,root:40,drone:true,pad:0.05,choir:0,drums:0,ost:0,dark:true},
 hoehle:{bpm:50,root:36,drone:true,pad:0.035,choir:0,drums:0,ost:0,dark:true,drip:true},
 kampf:{bpm:132,root:40,drone:true,pad:0.03,choir:0,drums:2,ost:1,dark:true,brass:true},
 blut:{bpm:120,root:38,drone:true,pad:0.04,choir:0.06,drums:3,ost:1,dark:true,brass:true},
 boss:{bpm:144,root:36,drone:true,pad:0.04,choir:0.07,drums:3,ost:2,dark:true,brass:true},
};
function track(file){ if(SND.tracks[file]) return SND.tracks[file]; const el=new Audio(file); el.loop=true; el.preload='auto'; el.volume=0; const tr={el,lv:0,target:0,ok:true}; el.addEventListener('error',()=>{ tr.ok=false; }); SND.tracks[file]=tr; return tr; }
function fadeTracks(){ for(const k in SND.tracks){ const tr=SND.tracks[k]; if(Math.abs(tr.lv-tr.target)>0.001){ tr.lv+=Math.sign(tr.target-tr.lv)*Math.min(0.04,Math.abs(tr.target-tr.lv)); tr.el.volume=Math.max(0,Math.min(1,tr.lv*SND.vol.mus)); if(tr.lv<=0.001&&tr.target===0){ tr.el.pause(); } } } }
function mtof(m){ return 440*Math.pow(2,(m-69)/12); }
function musicMode(m){ SND.wantMode=m; if(!SND.ctx||SND.mode===m) return; SND.mode=m; const M=MUS[m]; if(!M) return;
  // Datei-Track: in Kampf/Blutmond bleibt der Nacht-Track gedämpft darunter
  const base=MUSIC_FILES[m];
  for(const k in SND.tracks) SND.tracks[k].target=0;
  if(base){ const tr=track(base); if(tr.ok){ tr.target=(m==='kampf'||m==='boss'?0.8:m==='blut'?0.85:0.85); if(tr.el.paused){ tr.el.play().catch(()=>{}); } } }
  SND.fileBase=!!(base&&SND.tracks[base]&&SND.tracks[base].ok);
  const stepDur=60/M.bpm/4; if(!SND.timer){ SND.next=SND.ctx.currentTime+0.1; SND.timer=setInterval(()=>{ const c=SND.ctx; if(!c) return; fadeTracks(); const M2=MUS[SND.mode]; if(!M2) return; const sd=60/M2.bpm/4; while(SND.next<c.currentTime+0.35){ try{ musicStep(M2,SND.step++,SND.next,sd); }catch(e){} SND.next+=sd; } },90); } }
function isNightSafe(){ try{ return isNight(); }catch(e){ return true; } }
function mo(type,f,t,dur,peak,o){ o=o||{}; o.dest=SND.mus; o.revDest=SND.musRev; if(o.rev==null) o.rev=0.8; return osc(type,f,t,dur,peak,o); }
function mn(t,dur,peak,o){ o=o||{}; o.dest=SND.mus; o.revDest=SND.musRev; if(o.rev==null) o.rev=0.5; nz(t,dur,peak,o); }
function musicStep(M,s,t,d){
  const bar=Math.floor(s/16); const prog=M.dark?[0,1,-2,-4]:[0,-4,-2,-5]; const r=M.root+prog[bar%4];
  const ftr=SND.tracks[MUSIC_FILES[SND.mode]]; const file=!!(ftr&&ftr.ok); if(file&&(SND.mode==='kampf'||SND.mode==='blut'||SND.mode==='boss')) return;
  // Streicher-Pad (verstimmte Sägezähne, Tiefpass, langsamer Einsatz)
  if(s%32===0&&M.pad&&!file){ const ch=M.dark?[0,3,7,10]:[0,4,7,11]; for(const k of ch) for(const det of [-9,9]) mo('sawtooth',mtof(r+12+k),t,d*34,M.pad*0.5,{a:d*10,lp:900,lpTo:1400,det,rev:1.2}); }
  // Drone
  if(s%64===0&&M.drone&&!file){ mo('sawtooth',mtof(r-12),t,d*66,0.06,{a:d*16,lp:220,det:-6,rev:1}); mo('sine',mtof(r-24),t,d*66,0.12,{a:d*12,rev:0.3}); }
  // Glocken / Klavier am Tag
  if(M.bell&&!file&&s%8===0&&Math.random()<0.5){ const sc=[0,2,4,7,9,12,14]; const n=sc[Math.random()*sc.length|0]; mo('triangle',mtof(r+24+n),t,d*14,0.05,{rev:1.4}); mo('sine',mtof(r+36+n),t,d*8,0.02,{rev:1.4}); }
  // Tropfen in der Höhle
  if(M.drip&&Math.random()<0.03) mo('sine',1200+Math.random()*900,t,0.15,0.04,{to:700,rev:2});
  // Nachts: vereinzelte düstere Klaviertöne
  if(SND.mode==='nacht'&&!file&&s%16===8&&Math.random()<0.35) mo('triangle',mtof(r+12+[0,3,7,10,13][Math.random()*5|0]),t,d*20,0.05,{rev:1.6});
  // Chor (Blutmond/Boss): Formant-„Ah“
  if(M.choir&&s%32===0){ const c=SND.ctx; for(const k of [0,7,12,15]){ const o=c.createOscillator(); o.type='sawtooth'; o.frequency.value=mtof(r+12+k); const g=c.createGain(); env(g,t,d*8,M.choir,d*32); for(const [ff,q] of [[800,6],[1150,8]]){ const bp=c.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=ff; bp.Q.value=q; o.connect(bp); bp.connect(g); } const l=c.createOscillator(), lg=c.createGain(); l.frequency.value=5; lg.gain.value=3; l.connect(lg); lg.connect(o.detune); g.connect(SND.mus); const rr=c.createGain(); rr.gain.value=1.4; g.connect(rr); rr.connect(SND.musRev); o.start(t); l.start(t); o.stop(t+d*33); l.stop(t+d*33); } }
  // Taiko / Kriegstrommeln
  if(M.drums){ const pat=M.drums>=3?[1,0,0,1,0,0,1,0,1,0,1,0,1,1,0,1]:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0]; const i=s%16; if(pat[i]){ const acc=i%8===0; mo('sine',acc?62:74,t,0.5,acc?0.6:0.4,{to:38,rev:0.6}); mn(t,0.18,acc?0.35:0.2,{f:300,fTo:120,type:'lowpass'}); }
    if(M.drums>=2&&i%8===4){ mn(t,0.22,0.25,{f:1800,q:0.8,rev:0.9}); mo('sine',180,t,0.12,0.2,{to:120}); }
    if(M.drums>=2&&i%2===1) mn(t,0.04,0.05,{f:6000,q:1,type:'highpass',rev:0.2}); }
  // Staccato-Streicher-Ostinato
  if(M.ost){ const seq=[0,0,12,0,3,0,7,5]; const i=s%8; if(M.ost>1||s%2===0) mo('sawtooth',mtof(r+seq[i]+(M.ost>1&&bar%2?12:0)),t,d*0.9,0.05,{lp:2400,a:0.005,rev:0.5}); }
  // Blech-Stöße
  if(M.brass&&s%64===0) for(const k of [0,7,12]) for(const det of [-7,7]) mo('sawtooth',mtof(r+k),t,d*12,0.07,{a:0.04,lp:500,lpTo:1600,det,rev:1});
}
function musicStop(){ if(SND.timer) clearInterval(SND.timer); SND.timer=null; SND.mode=null; for(const k in SND.tracks){ SND.tracks[k].target=0; SND.tracks[k].el.pause(); } }
