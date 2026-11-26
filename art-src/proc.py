import json,base64,io,sys
from PIL import Image, ImageFilter
import numpy as np
S='/workspace/lifetime/art-src/'
def load(n):
    im=Image.open(S+n).convert('RGB'); a=np.asarray(im).astype(int)
    corners=np.concatenate([a[:8,:8].reshape(-1,3),a[-8:,-8:].reshape(-1,3),a[:8,-8:].reshape(-1,3),a[-8:,:8].reshape(-1,3)])
    bg=np.median(corners,axis=0)
    d=np.sqrt(((a-bg)**2).sum(-1))
    mag=(a[...,0]>150)&(a[...,2]>90)&(a[...,1]<90)&(np.abs(a[...,0]-a[...,2])<130)
    fg=~((d<70)|mag)
    return im,a,fg,bg
def cells(fg,rows,cols):
    H,W=fg.shape; out=[]
    # Zeilen/Spalten-Grenzen anhand leerer Bereiche bestimmen
    def bands(prof,n,L):
        # gleichmäßige Teilung als Start, dann Schnitte in die leersten Stellen schieben
        cuts=[0]
        for k in range(1,n):
            c=int(L*k/n); w=int(L/n*0.25)
            seg=prof[c-w:c+w]; cuts.append(c-w+int(np.argmin(seg)))
        cuts.append(L); return cuts
    rc=bands(fg.sum(1),rows,H); cc=bands(fg.sum(0),cols,W)
    for r in range(rows):
        for c in range(cols):
            out.append((cc[c],rc[r],cc[c+1],rc[r+1]))
    return out
def crop(im,fg,box):
    x0,y0,x1,y1=box; m=fg[y0:y1,x0:x1].copy()
    # kleine Flecken entfernen: nur Zeilen/Spalten mit genug Pixeln
    ys=np.where(m.sum(1)>2)[0]; xs=np.where(m.sum(0)>2)[0]
    if len(ys)==0: return None
    bx0,bx1,by0,by1=xs[0],xs[-1]+1,ys[0],ys[-1]+1
    rgb=np.asarray(im)[y0+by0:y0+by1,x0+bx0:x0+bx1]
    al=(m[by0:by1,bx0:bx1]*255).astype(np.uint8)
    al=np.asarray(Image.fromarray(al).filter(ImageFilter.MinFilter(3)))  # Rand einziehen (Magenta-Saum)
    return Image.fromarray(np.dstack([rgb,al]),'RGBA')
def pixelize(sp,tw,th,colors=40,outline=True,fit=True):
    w,h=sp.size; s=min(tw/w,th/h) if fit else th/h; nw,nh=max(1,round(w*s)),max(1,round(h*s))
    # vorgemultipliziert verkleinern
    a=np.asarray(sp).astype(float); a[...,:3]*=a[...,3:4]/255
    small=Image.fromarray(a.astype(np.uint8),'RGBA').resize((nw,nh),Image.LANCZOS)
    sa=np.asarray(small).astype(float); al=sa[...,3]
    rgb=np.where(al[...,None]>0, sa[...,:3]*255/np.maximum(al[...,None],1),0)
    rgb=np.clip(rgb*1.06+3,0,255)  # leicht anheben
    op=al>110
    img=Image.fromarray(rgb.astype(np.uint8),'RGB').quantize(colors,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
    q=np.asarray(img).copy()
    W2,H2=(tw,th) if fit else (nw+2,nh+2)
    out=np.zeros((H2,W2,4),np.uint8); ox=(W2-nw)//2; oy=(H2-nh) if not fit else (H2-nh)//2
    if not fit: oy=1
    out[oy:oy+nh,ox:ox+nw,:3]=q; out[oy:oy+nh,ox:ox+nw,3]=np.where(op,255,0)
    if outline:
        A=out[...,3]>0; nb=np.zeros_like(A)
        for dy,dx in((1,0),(-1,0),(0,1),(0,-1)): nb|=np.roll(np.roll(A,dy,0),dx,1)
        ol=nb&~A; out[ol]=[22,14,10,255]
    return Image.fromarray(out,'RGBA')
def durl(img):
    b=io.BytesIO(); img.save(b,'PNG',optimize=True); return 'data:image/png;base64,'+base64.b64encode(b.getvalue()).decode()
ART={'icons':{},'icons16':{},'crea':{},'port':{}}
SHEETS={'icons_a.jpg':'notaxt steinaxt steinhacke eisenaxt eisenhacke titanhacke kettensaege knueppel speer naegelschlaeger machete zwillingsklinge armknochen bogen armbrust pistole',
'icons_b.jpg':'schrotflinte pfeil muni schrot molotow rohrbombe fackel verband medkit funkgeraet aaspfeife opfergabe mutantenherz herzdesberges flasche sternenherz',
'icons_c.jpg':'holz bretter stein faser stoff schrott kohle eisenerz salpeter titanerz eisen titan pulver leder federn knochen',
'icons_d.jpg':'kronkorken kleber seide benzin beeren fleisch_roh fleisch konserve chips eintopf kekse wasser_dreckig wasser cola tee kaffee',
'icons_e.jpg':'lumpen lederjacke fellmantel polizeiweste seidenumhang helm muetze fluegel jeans cargohose fellhose panzerhose turnschuhe arbeitsstiefel kampfstiefel bauhelm',
'icons_f.jpg':'stahlhelm gasmaske blechpanzer stirnlampe hasenpfote kometensplitter _book leuchtpilz kiste werkbank bett tuer leiter regentonne esse chemie'}
dbg=Image.new('RGBA',(16*34,8*34),(40,60,140,255))
SHEETS['weapons2.jpg']='wurfmesser schrottstern hackebeil eisenrohr brechstange vorschlaghammer knochenspeer leuchtfackel'
SHEETS['furniture.jpg']='kronleuchter wandkerze kerze laterne bild_land bild_mann bild_meer karte tisch stuhl regal uhr fass ofen wandregal schaedelkerze'
for si,(f,names) in enumerate(SHEETS.items()):
    im,a,fg,bg=load(f); names=names.split()
    for i,box in enumerate(cells(fg,2 if f=='weapons2.jpg' else 4,4)):
        sp=crop(im,fg,box); n=names[i]
        if sp is None: print('EMPTY',f,n); continue
        i32=pixelize(sp,30,30,48); c=Image.new('RGBA',(32,32)); c.paste(i32,(1,1)); ART['icons'][n]=durl(c)
        i16=pixelize(sp,15,15,24); c2=Image.new('RGBA',(16,16)); c2.paste(i16,(0,1)); ART['icons16'][n]=durl(c2)
        dbg.alpha_composite(c,(i*34,si*34))
dbg.resize((dbg.width*2,dbg.height*2),Image.NEAREST).save(S+'out/icons_dbg.png')
FH=dict(kronleuchter=22,wandkerze=15,kerze=16,laterne=18,bild_land=20,bild_mann=22,bild_meer=20,karte=18,tisch=16,stuhl=20,regal=40,uhr=44,fass=18,ofen=26,wandregal=14,schaedelkerze=16)
ART['furn']={}
im,a,fg,bg=load('furniture.jpg'); fn=SHEETS['furniture.jpg'].split()
for i,box in enumerate(cells(fg,4,4)):
    sp=crop(im,fg,box); ART['furn'][fn[i]]=durl(pixelize(sp,999,FH[fn[i]],40,fit=False))
fd=Image.new('RGBA',(16*50,60),(30,20,16,255))
for i,n in enumerate(fn):
    im2=Image.open(io.BytesIO(base64.b64decode(ART['furn'][n].split(',')[1]))); fd.alpha_composite(im2,(i*50,2))
fd.resize((fd.width*2,fd.height*2),Image.NEAREST).save(S+'out/furn_dbg.png')
# Portraits
im,a,fg,bg=load('portraits.jpg'); pn='kalle gerda brems mecki uschi willi funker rudi doris player ghoul_m ghoul_f'.split()
pd=Image.new('RGBA',(12*50,52),(30,20,16,255))
for i,box in enumerate(cells(fg,3,4)):
    sp=crop(im,fg,box); p=pixelize(sp,48,48,40,outline=False); ART['port'][pn[i]]=durl(p); pd.alpha_composite(p,(i*50,2))
pd.resize((pd.width*2,pd.height*2),Image.NEAREST).save(S+'out/port_dbg.png')
# Kreaturen (zwei Posen)
CRE={'crea1.jpg':[('hund',22),('hirsch',40),('hase',13),('spinne',22)],'crea2.jpg':[('geier',24),('kriecher',18),('huhn',15),('doppelkopf',46)],'crea3.jpg':[('armige',52),('spinnenfrau',30),('brocken',54),('geierkoenigin',60)]}
cd=Image.new('RGBA',(700,4*70*3//2+300),(60,80,140,255)); yy=0
for f,lst in CRE.items():
    im,a,fg,bg=load(f)
    for i,box in enumerate(cells(fg,4,2)):
        n,h=lst[i//2]; sp=crop(im,fg,box)
        p=pixelize(sp,999,h,40,fit=False)
        ART['crea'].setdefault(n,[]).append(durl(p))
        cd.alpha_composite(p,((i%2)*150+10+ (0 if f=='crea1.jpg' else 320 if f=='crea2.jpg' else 0),yy+(i//2)*70 if f!='crea3.jpg' else 300+(i//2)*70)) if False else None
for k,(n,l) in enumerate(ART['crea'].items()):
    for j,u in enumerate(l):
        im2=Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))); cd.alpha_composite(im2,(10+j*110+(k%3)*230,10+(k//3)*72))
cd.resize((cd.width*2,cd.height*2),Image.NEAREST).save(S+'out/crea_dbg.png')
open('/workspace/lifetime/www/js/artdata.js','w').write('// KI-generierte Grafiken (Bildgenerator), auf Pixelraster gerechnet: Icons, Porträts, Kreaturen\nconst ART='+json.dumps(ART)+';\n')
import os; print(os.path.getsize('/workspace/lifetime/www/js/artdata.js'))
