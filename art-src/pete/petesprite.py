#!/usr/bin/env python3
"""Petes eigene Gegner -> Spielsprites.
Ordner art-src/pete/<name>/ mit stand.jpg, walk1.jpg, walk2.jpg (optional attack.jpg, cfg.json {"height":42,"colors":28}).
Aufruf: python3 art-src/pete/petesprite.py   (verarbeitet alle Ordner) -> www/js/artpete.js + art-src/pete/out/<name>_dbg.png
Weißer Hintergrund wird per Flood-Fill vom Rand entfernt, JPEG-Rauschen geglättet, auf Spielgröße
heruntergerechnet (Box-Filter), auf eine gemeinsame Palette reduziert und mit 1px dunkler Outline versehen."""
import os, sys, json, base64, io
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np
from collections import deque
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.abspath(os.path.join(HERE,'..','..'))
FR=['stand','walk1','walk2','attack','grab']

def cutout(im,tol=38,holes=False):
    a=np.asarray(im.convert('RGB')).astype(int); h,w,_=a.shape
    # Hintergrundfarbe = Median der Ränder
    border=np.concatenate([a[0],a[-1],a[:,0],a[:,-1]]); bg=np.median(border,axis=0)
    diff=np.abs(a-bg).max(axis=2); near=diff<tol
    mask=np.zeros((h,w),bool); q=deque()
    for x in range(w):
        for y in (0,h-1):
            if near[y,x] and not mask[y,x]: mask[y,x]=True; q.append((y,x))
    for y in range(h):
        for x in (0,w-1):
            if near[y,x] and not mask[y,x]: mask[y,x]=True; q.append((y,x))
    while q:
        y,x=q.popleft()
        for dy,dx in ((1,0),(-1,0),(0,1),(0,-1)):
            ny,nx=y+dy,x+dx
            if 0<=ny<h and 0<=nx<w and not mask[ny,nx] and near[ny,nx]: mask[ny,nx]=True; q.append((ny,nx))
    if holes:
        # eingeschlossene Hintergrundflächen (z. B. zwischen den Beinen) ebenfalls entfernen
        from scipy import ndimage
        lab,n=ndimage.label(near&~mask); sizes=ndimage.sum(np.ones_like(lab),lab,range(1,n+1))
        for i,sz in enumerate(sizes):
            if sz>h*w*0.0015: mask|=(lab==i+1)
    fg=~mask
    # kleine Inseln/Krümel entfernen: Maske leicht schließen/öffnen
    m=Image.fromarray((fg*255).astype('uint8')).filter(ImageFilter.MedianFilter(5))
    rgba=im.convert('RGBA'); rgba.putalpha(m); return rgba

def process(name,cfg):
    d=os.path.join(HERE,name); H=cfg.get('height',42); NC=cfg.get('colors',36); cfg_sat=cfg.get('sat',1.3)
    frames={}
    for f in FR:
        p=os.path.join(d,f+'.jpg')
        if not os.path.exists(p): p=os.path.join(d,f+'.png')
        if os.path.exists(p): frames[f]=cutout(Image.open(p).filter(ImageFilter.MedianFilter(3)),cfg.get('tol',38),cfg.get('holes',False))
    small={}
    for f,im in frames.items():
        bb=im.getbbox(); im=im.crop(bb); s=H/im.height; w=max(1,round(im.width*s))
        # Box-Downscale mit vormultipliziertem Alpha (keine weißen Säume)
        a=np.asarray(im).astype(float); al=a[:,:,3:4]/255; pm=np.concatenate([a[:,:,:3]*al,a[:,:,3:4]],2)
        r=Image.fromarray(pm.astype('uint8'),'RGBA').resize((w,H),Image.BOX); r=np.asarray(r).astype(float)
        A=r[:,:,3:4]; rgb=np.where(A>0,r[:,:,:3]/np.maximum(A,1)*255,0).clip(0,255)
        alpha=(A[:,:,0]>110).astype('uint8')*255
        # Kopf-Mitte als horizontaler Anker (obere 30%)
        top=alpha[:int(H*0.3)]; xs=np.nonzero(top.any(0))[0]; hx=(xs.min()+xs.max())/2 if len(xs) else w/2
        small[f]=(np.dstack([rgb,alpha]).astype('uint8'),hx)
    # gemeinsame Palette
    allpx=np.concatenate([np.asarray(ImageEnhance.Contrast(ImageEnhance.Color(Image.fromarray(v[0][:,:,:3])).enhance(cfg_sat)).enhance(1.12))[v[0][:,:,3]>0] for v in small.values()])
    pal_img=Image.fromarray(allpx.reshape(-1,1,3)).quantize(NC,method=Image.Quantize.MEDIANCUT)
    CW=int(max(v[0].shape[1] for v in small.values())+8); CW+=CW%2; CH=H+2
    out={}
    for f,(px,hx) in small.items():
        rgb=ImageEnhance.Contrast(ImageEnhance.Color(Image.fromarray(px[:,:,:3])).enhance(cfg_sat)).enhance(1.12).quantize(palette=pal_img,dither=Image.Dither.NONE).convert('RGB')
        rgb=np.asarray(rgb); al=px[:,:,3]>0
        cov=cfg.get('cover')
        if cov:  # Bereich mit Kleidung übermalen (Hautfarbe -> Stoff), z. B. Oberkörper
            rgb=rgb.copy(); hh,ww=al.shape; rr=np.random.RandomState(7)
            y0,y1=int(cov['y0']*hh),int(cov['y1']*hh); half=cov.get('half',5)
            for y in range(y0,y1):
                for x in range(max(0,int(hx-half)),min(ww,int(hx+half+1))):
                    if not al[y,x]: continue
                    r,g,b=[int(v) for v in rgb[y,x]]
                    if r>200 and g>200: continue
                    lum=(r+g+b)/3; v=int(min(250,max(170,150+lum*0.55)))
                    col=[v,v-4,v-8]
                    if rr.rand()<cov.get('blood',0.12): col=[140,20,24]
                    rgb[y,x]=col
        c=np.zeros((CH,CW,4),'uint8'); ox=int(round(CW/2-hx)); oy=1
        h,w=al.shape
        for y in range(h):
            for x in range(w):
                if al[y,x] and 0<=x+ox<CW: c[y+oy,x+ox,:3]=rgb[y,x]; c[y+oy,x+ox,3]=255
        # Outline
        A=c[:,:,3]>0; o=np.zeros_like(A)
        o[1:]|=A[:-1]; o[:-1]|=A[1:]; o[:,1:]|=A[:,:-1]; o[:,:-1]|=A[:,1:]; o&=~A
        c[o]=[24,16,14,255]
        out[f]=Image.fromarray(c,'RGBA')
    return out

def main():
    names=[n for n in sorted(os.listdir(HERE)) if os.path.isdir(os.path.join(HERE,n)) and n!='out']
    os.makedirs(os.path.join(HERE,'out'),exist_ok=True); js={}
    for n in names:
        cp=os.path.join(HERE,n,'cfg.json'); cfg=json.load(open(cp)) if os.path.exists(cp) else {}
        fr=process(n,cfg); js[n]={}
        dbg=Image.new('RGBA',(sum(i.width for i in fr.values())*6,max(i.height for i in fr.values())*6),(70,80,90,255)); x=0
        for f,im in fr.items():
            b=io.BytesIO(); im.save(b,'PNG'); js[n][f]='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
            big=im.resize((im.width*6,im.height*6),Image.NEAREST); dbg.alpha_composite(big,(x,0)); x+=big.width
        dbg.save(os.path.join(HERE,'out',n+'_dbg.png')); print(n,{f:i.size for f,i in fr.items()})
    open(os.path.join(ROOT,'www','js','artpete.js'),'w').write('// automatisch erzeugt von art-src/pete/petesprite.py\nconst PETE_ART='+json.dumps(js)+';\n')
main()
