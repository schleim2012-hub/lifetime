#!/usr/bin/env python3
"""Lifetime 0.7: Titel-/Intro-Bilder (Bildgenerator, Stil nach Petes Vorlage) -> Pixelraster + Palette -> www/js/artdata7.js
Eingaben: art-src/v07/{title_bg,title_fg,intro1..4}.jpg (nicht im Repo), audio-src/bigbrother_tv.mp3"""
import os, io, json, base64
from PIL import Image, ImageEnhance
import numpy as np
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.abspath(os.path.join(HERE,'..','..'))
GW,GH=480,270
def pix(im,colors=96,alpha=None):
    im=im.convert('RGB').resize((GW,GH),Image.LANCZOS); im=ImageEnhance.Contrast(im).enhance(1.06)
    q=im.quantize(colors,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGBA')
    if alpha is not None: a=np.asarray(q).copy(); a[...,3]=alpha; q=Image.fromarray(a,'RGBA')
    return q
def b64(im):
    b=io.BytesIO(); im.save(b,'PNG',optimize=True); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
def pts(im,cond,n,seed=1):
    a=np.asarray(im.convert('RGB')).astype(int); ys,xs=np.nonzero(cond(a[...,0],a[...,1],a[...,2]))
    if len(xs)==0: return []
    r=np.random.RandomState(seed); idx=r.choice(len(xs),min(n,len(xs)),replace=False); return [[int(xs[i]),int(ys[i])] for i in idx]
out={}; P={}
bg=Image.open(os.path.join(HERE,'title_bg.jpg')); out['title_bg']=b64(pix(bg,112))
small=bg.convert('RGB').resize((GW,GH))
P['water']=pts(small,lambda r,g,b:(g>110)&(b>110)&(r<90)&(np.arange(GH)[:,None]>GH*0.62),260)
P['fall']=pts(small,lambda r,g,b:(r>150)&(g>170)&(b>180)&(np.arange(GW)[None,:]>GW*0.38)&(np.arange(GW)[None,:]<GW*0.56)&(np.arange(GH)[:,None]>GH*0.55)&(np.arange(GH)[:,None]<GH*0.8),160,2)
P['fire_bg']=pts(small,lambda r,g,b:(r>200)&(g>90)&(g<200)&(b<90),220,3)
fg=Image.open(os.path.join(HERE,'title_fg.jpg')).convert('RGB').resize((GW,GH),Image.LANCZOS); a=np.asarray(fg).astype(int)
mag=(a[...,0]>170)&(a[...,2]>150)&(a[...,1]<110)
from scipy import ndimage
mag=ndimage.binary_dilation(mag,iterations=1)
alpha=np.where(mag,0,255).astype('uint8')
c=a.copy(); c[mag]=0
spill=(c[...,0]-c[...,1]>40)&(c[...,2]-c[...,1]>30)  # Magenta-Saum entfärben
c[spill,0]=np.minimum(c[spill,0],c[spill,1]+30); c[spill,2]=np.minimum(c[spill,2],c[spill,1]+10)
fg=Image.fromarray(c.clip(0,255).astype('uint8'))
fgq=pix(fg,80,alpha); out['title_fg']=b64(fgq)
P['fire_fg']=pts(fg,lambda r,g,b:(r>210)&(g>100)&(g<210)&(b<90)&~mag,160,4)
for i in range(1,5):
    im=Image.open(os.path.join(HERE,'intro%d.jpg'%i)); out['intro%d'%i]=b64(pix(im,112))
    s=im.convert('RGB').resize((GW,GH)); P['fire_i%d'%i]=pts(s,lambda r,g,b:(r>210)&(g>100)&(g<200)&(b<80),160,10+i)
out['pts']=P
mp=os.path.join(ROOT,'audio-src','bigbrother_tv.mp3')
if os.path.exists(mp): out['voice_bb']='data:audio/mpeg;base64,'+base64.b64encode(open(mp,'rb').read()).decode()
open(os.path.join(ROOT,'www','js','artdata7.js'),'w').write('// automatisch erzeugt von art-src/v07/mkart.py\nconst ART7='+json.dumps(out)+';\n')
print({k:len(v) for k,v in out.items() if isinstance(v,str)}, {k:len(v) for k,v in P.items()})
