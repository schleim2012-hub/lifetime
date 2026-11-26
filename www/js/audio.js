// Lifetime – Klang: Soundeffekte und Musik werden live erzeugt (keine Dateien, keine Kosten)
'use strict';
const SND={ctx:null,master:null,sfx:null,mus:null,vol:{mus:0.5,sfx:0.8},mode:null,timer:null,step:0,noiseBuf:null};
function audioInit(){
  if(SND.ctx) { if(SND.ctx.state==='suspended') SND.ctx.resume(); return; }
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  const c=new AC(); SND.ctx=c; SND.master=c.createGain(); SND.master.connect(c.destination);
  SND.sfx=c.createGain(); SND.sfx.gain.value=SND.vol.sfx; SND.sfx.connect(SND.master);
  SND.mus=c.createGain(); SND.mus.gain.value=SND.vol.mus*0.35; SND.mus.connect(SND.master);
  const len=c.sampleRate; const b=c.createBuffer(1,len,c.sampleRate); const d=b.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1; SND.noiseBuf=b;
  if(SND.wantMode) musicMode(SND.wantMode);
}
function setVol(k,v){ SND.vol[k]=v; if(!SND.ctx) return; if(k==='sfx') SND.sfx.gain.value=v; else SND.mus.gain.value=v*0.35; }
function tone(f,dur,type,vol,slide,when,dest){ const c=SND.ctx; if(!c) return; const t=(when||c.currentTime); const o=c.createOscillator(), g=c.createGain(); o.type=type||'square'; o.frequency.setValueAtTime(f,t); if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(20,slide),t+dur); g.gain.setValueAtTime(vol||0.2,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur); o.connect(g); g.connect(dest||SND.sfx); o.start(t); o.stop(t+dur+0.02); }
function noise(dur,vol,freq,q,when,dest,type){ const c=SND.ctx; if(!c) return; const t=when||c.currentTime; const s=c.createBufferSource(); s.buffer=SND.noiseBuf; const f=c.createBiquadFilter(); f.type=type||'bandpass'; f.frequency.value=freq||1000; f.Q.value=q||1; const g=c.createGain(); g.gain.setValueAtTime(vol||0.3,t); g.gain.exponentialRampToValueAtTime(0.001,t+dur); s.connect(f); f.connect(g); g.connect(dest||SND.sfx); s.start(t,Math.random()*0.5); s.stop(t+dur+0.02); }
const SFX={
 hit(){ noise(0.08,0.4,800,2); tone(140,0.08,'square',0.15,60); },
 chop(){ noise(0.07,0.35,1400,3); tone(220,0.05,'triangle',0.15,120); },
 mine(){ noise(0.06,0.3,2500,4); tone(600,0.04,'square',0.06,300); },
 brk(){ noise(0.25,0.4,500,1); },
 place(){ tone(180,0.06,'square',0.15,90); noise(0.05,0.2,900,2); },
 jump(){ tone(300,0.1,'square',0.08,520); },
 hurt(){ tone(300,0.18,'sawtooth',0.2,90); },
 pick(){ tone(880,0.05,'square',0.08); tone(1320,0.07,'square',0.08,null,SND.ctx&&SND.ctx.currentTime+0.05); },
 eat(){ for(let i=0;i<3;i++) noise(0.05,0.25,1200,3,SND.ctx&&SND.ctx.currentTime+i*0.09); },
 drink(){ for(let i=0;i<3;i++) tone(400+i*60,0.08,'sine',0.15,250,SND.ctx&&SND.ctx.currentTime+i*0.1); },
 craft(){ tone(520,0.06,'square',0.1); tone(780,0.1,'square',0.1,null,SND.ctx&&SND.ctx.currentTime+0.07); },
 shoot(){ noise(0.18,0.6,1800,0.7); tone(120,0.12,'square',0.2,40); },
 shotgun(){ noise(0.35,0.8,900,0.5); tone(90,0.2,'square',0.25,30); },
 bow(){ tone(500,0.12,'triangle',0.15,180); },
 boom(){ noise(0.8,0.9,200,0.6,null,null,'lowpass'); tone(80,0.6,'sine',0.5,25); },
 groan(){ if(!SND.ctx) return; const f=90+Math.random()*50; tone(f,0.6,'sawtooth',0.05,f*0.7); noise(0.5,0.06,400,4); },
 scream(){ tone(900,0.8,'sawtooth',0.12,1400); noise(0.8,0.15,2500,2); },
 roar(){ tone(70,1.2,'sawtooth',0.3,40); noise(1.2,0.4,300,1); },
 door(){ tone(160,0.12,'square',0.1,110); },
 level(){ const t=SND.ctx&&SND.ctx.currentTime; [523,659,784,1046].forEach((f,i)=>tone(f,0.15,'square',0.12,null,t+i*0.09)); },
 click(){ tone(700,0.03,'square',0.06); },
 splash(){ noise(0.3,0.3,700,0.8); },
 bark(){ tone(400,0.1,'square',0.12,250); },
 bird(){ tone(1200,0.15,'sine',0.05,1800); },
 honk(){ tone(420,0.12,'square',0.12,380); tone(330,0.16,'square',0.12,300,SND.ctx&&SND.ctx.currentTime+0.13); },
 saw(){ const t=SND.ctx&&SND.ctx.currentTime; for(let i=0;i<6;i++) tone(95+i%2*30,0.12,'sawtooth',0.12,130,t+i*0.1); noise(0.6,0.15,1500,1); },
 thud(){ tone(60,0.3,'sine',0.4,30); noise(0.25,0.4,300,1); },
};
function sfx(n){ try{ if(SND.ctx&&SFX[n]) SFX[n](); }catch(e){} }
// ---- Musik: kleiner Sequenzer, Stimmung je nach Lage ----
const SCALE_MIN=[0,3,5,7,10,12,15]; // Moll-Pentatonik
const MUS={
 tag:{bpm:84,root:57,lead:'triangle',bass:'triangle',den:0.45,drum:0,pad:true},
 nacht:{bpm:66,root:52,lead:'sine',bass:'sine',den:0.25,drum:0,pad:true,dark:true},
 blut:{bpm:140,root:50,lead:'sawtooth',bass:'square',den:0.6,drum:2,dark:true},
 boss:{bpm:150,root:45,lead:'square',bass:'sawtooth',den:0.7,drum:2},
 titel:{bpm:72,root:50,lead:'triangle',bass:'sine',den:0.35,drum:1,pad:true},
 hoehle:{bpm:60,root:48,lead:'sine',bass:'sine',den:0.18,drum:0,pad:true,dark:true},
};
function mtof(m){ return 440*Math.pow(2,(m-69)/12); }
function musicMode(m){ SND.wantMode=m; if(!SND.ctx||SND.mode===m) return; SND.mode=m; SND.step=0; SND.seed=Math.random()*1000|0; if(SND.timer) clearInterval(SND.timer); const M=MUS[m]; if(!M) return;
  const stepDur=60/M.bpm/2; SND.next=SND.ctx.currentTime+0.1; SND.pat=null;
  SND.timer=setInterval(()=>{ const c=SND.ctx; if(!c) return; while(SND.next<c.currentTime+0.3){ musicStep(M,SND.step++,SND.next,stepDur); SND.next+=stepDur; } },100); }
function musicStep(M,s,t,d){
  const bar=Math.floor(s/16)%4; const prog=M.dark?[0,-2,-4,-5]:[0,-4,-2,-5]; const r=M.root+prog[bar];
  if(!SND.pat||s%64===0){ const R=rngSeed(SND.seed+s); SND.pat=[]; for(let i=0;i<16;i++) SND.pat.push(R()<M.den?SCALE_MIN[Math.floor(R()*SCALE_MIN.length)]:null); }
  const n=SND.pat[s%16]; const dst=SND.mus;
  if(n!=null) tone(mtof(r+12+n),d*1.6,M.lead,0.09,null,t,dst);
  if(s%4===0) tone(mtof(r-12),d*3.5,M.bass,0.16,null,t,dst);
  if(M.pad&&s%16===0){ [0,3,7].forEach(k=>tone(mtof(r+k),d*15,'sine',0.035,null,t,dst)); }
  if(M.drum){ if(s%4===0) { tone(110,0.15,'sine',0.35,40,t,dst); } if(M.drum>1&&s%4===2) noise(0.08,0.15,3000,1,t,dst); if(s%8===4) noise(0.12,0.2,1500,0.8,t,dst); }
}
function musicStop(){ if(SND.timer) clearInterval(SND.timer); SND.timer=null; SND.mode=null; }
