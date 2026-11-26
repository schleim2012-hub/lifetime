import json,base64,io
src=open('/workspace/lifetime/art-src/proc.py').read(); exec(src[:src.index("ART={")])
from PIL import Image
import numpy as np
def defringe(p):
    a=np.asarray(p).copy(); r,g,b=a[...,0].astype(int),a[...,1].astype(int),a[...,2].astype(int)
    m=(b>g+35)&(r>110)&(a[...,3]>0); a[m,3]=0
    return Image.fromarray(a,'RGBA')
A={'icons':{},'icons16':{},'veh':{},'props':{},'plane':None}
im,a,fg,bg=load('icons_g.jpg'); names='autobatterie reifen elektronik kabel zuendkerze motorteil werkzeugkasten stoersender kaktusfrucht wolfsfell eiskristall verkohltes_holz nummernschild felge filter gurkenglas'.split()
dbg=Image.new('RGBA',(16*34,40),(40,60,140,255))
for i,box in enumerate(cells(fg,4,4)):
    sp=crop(im,fg,box); n=names[i]
    i32=pixelize(sp,30,30,48); c=Image.new('RGBA',(32,32)); c.paste(i32,(1,1)); A['icons'][n]=durl(c)
    i16=pixelize(sp,15,15,24); c2=Image.new('RGBA',(16,16)); c2.paste(i16,(0,1)); A['icons16'][n]=durl(c2); dbg.alpha_composite(c,(i*34,2))
dbg.resize((dbg.width*2,dbg.height*2),Image.NEAREST).save(S+'out/icons_g_dbg.png')
# Fahrzeuge (Breite in Pixeln)
im,a,fg,bg=load('vehicles.jpg'); VW=dict(auto=92,pickup=96,camper=118,bus=170); vn=['auto','pickup','camper','bus']
sheet=Image.new('RGBA',(520,90),(90,110,90,255)); x=0
for i,box in enumerate(cells(fg,2,2)):
    sp=crop(im,fg,box); w,h=sp.size; th=round(VW[vn[i]]*h/w); p=pixelize(sp,999,th,40,fit=False); A['veh'][vn[i]]=durl(p); sheet.alpha_composite(p,(x,2)); x+=p.width+4
sheet.resize((sheet.width*2,sheet.height*2),Image.NEAREST).save(S+'out/veh_dbg.png')
# Requisiten (Höhe)
im,a,fg,bg=load('props.jpg'); pn='mast zaun maschenzaun schild kaktus totbaum kiefer schneekiefer fass2 reifenstapel fels gatter schaedel laterne2 pylone briefkasten'.split()
PH=dict(mast=100,zaun=22,maschenzaun=30,schild=30,kaktus=46,totbaum=70,kiefer=84,schneekiefer=84,fass2=20,reifenstapel=22,fels=26,gatter=30,schaedel=12,laterne2=56,pylone=12,briefkasten=24)
sheet=Image.new('RGBA',(900,110),(90,110,90,255)); x=0
for i,box in enumerate(cells(fg,4,4)):
    sp=crop(im,fg,box); p=pixelize(sp,999,PH[pn[i]],36,fit=False); A['props'][pn[i]]=durl(p); sheet.alpha_composite(p,(x,2)); x+=p.width+3
sheet.resize((sheet.width*2,sheet.height*2),Image.NEAREST).save(S+'out/props_dbg.png')
# Flugzeugwrack
im,a,fg,bg=load('plane.jpg'); H,W=fg.shape; sp=crop(im,fg,(0,0,W,H)); w,h=sp.size; p=defringe(pixelize(sp,999,round(360*h/w),48,fit=False)); A['plane']=durl(p)
Image.alpha_composite(Image.new('RGBA',p.size,(90,110,90,255)),p).resize((p.width*3,p.height*3),Image.NEAREST).save(S+'out/plane_dbg.png'); print('plane',p.size)
# Logo
im,a,fg,bg=load('logo.jpg'); H,W=fg.shape; sp=crop(im,fg,(0,0,W,H)); w,h=sp.size; p=defringe(pixelize(sp,999,round(300*h/w),48,outline=True,fit=False)); A['logo']=durl(p); print('logo',p.size)
Image.alpha_composite(Image.new('RGBA',p.size,(20,10,10,255)),p).resize((p.width*3,p.height*3),Image.NEAREST).save(S+'out/logo_dbg.png')
# Titel-Hintergrund: auf Pixelraster 480x270, Palette 64
t=Image.open(S+'title_bg.jpg').convert('RGB').resize((480,270),Image.LANCZOS).quantize(64,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
b=io.BytesIO(); t.save(b,'PNG',optimize=True); A['titlebg']='data:image/png;base64,'+base64.b64encode(b.getvalue()).decode(); t.resize((960,540),Image.NEAREST).save(S+'out/title_dbg.png')
open('/workspace/lifetime/www/js/artdata5.js','w').write('const ART5='+json.dumps(A)+';\n')
# App-Icon
ic=Image.open(S+'appicon.jpg').convert('RGB'); px=ic.resize((128,128),Image.LANCZOS).quantize(64,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
px.save(S+'out/icon128.png'); import os
for sz in (48,72,96,144,192,512): (px.resize((sz,sz),Image.NEAREST) if sz%128==0 or sz>128 else ic.resize((sz,sz),Image.LANCZOS)).save(S+f'out/icon_{sz}.png')
print('size',os.path.getsize('/workspace/lifetime/www/js/artdata5.js'))
