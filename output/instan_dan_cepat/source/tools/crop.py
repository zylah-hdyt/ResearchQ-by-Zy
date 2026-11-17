import sys,os,glob
from PIL import Image, ImageDraw
A,O=sys.argv[1:3];os.makedirs(O,exist_ok=True)
FX={'frustrated_student_hoodie':.36,'laptop_dark_glow':.5,'desk_notes_coffee_warm':.35,'library_warm_lights':.5,'hand_phone_scroll':.6,'empty_classroom':.5,'empty_lecture_hall':.5,'student_library_aisle':.42,'open_book_notes':.5,'handwriting_journal_notes':.55,'laptop_typing_bw':.5,'students_sharing_laptop':.45,'reading_book_sunlight':.5,'ai_robot_laptop_render':.45,'student_headphones_laptop':.62,'laptop_phone_hands':.55,'video_call_class':.55,'students_discussion_laughing':.5,'curved_library_bright':.5,'typing_laptop_closeup':.55,'ai_abstract_network':.5,'student_thinking_laptop':.35,'books_stack_dulu':.3,'online_class_laptop_sekarang':.55,'silhouette_reading_sunset':.35,'students_overhead_laptops_books':.5}
SPLIT={'books_stack_dulu','online_class_laptop_sekarang'}
sheet=[]
for f in sorted(glob.glob(A+'/*/*.jpg')):
    n=os.path.basename(f)[:-4];im=Image.open(f).convert('RGB');dp=Image.open(f[:-4]+'_depth.png').convert('L').resize(im.size)
    w,h=im.size
    if n in SPLIT: cw,ch=w,h; x0=0   # keep landscape for split panels
    else:
        cw=min(w,int(h*9/16*1.18));fx=FX.get(n,.5);x0=int(min(max(0,fx*w-cw/2),w-cw));ch=h
    c=im.crop((x0,0,x0+cw,ch));d=dp.crop((x0,0,x0+cw,ch))
    k=2100/ch if n not in SPLIT else 1500/cw
    c=c.resize((int(cw*k),int(ch*k)),Image.LANCZOS);d=d.resize((max(1,int(cw*k)//2),max(1,int(ch*k)//2)),Image.BILINEAR)
    c.save(f'{O}/{n}.jpg',quality=86);d.save(f'{O}/{n}_d.png')
    t=c.copy();t.thumbnail((200,340));sheet.append((n,t,d.copy()))
W=210;S=Image.new('RGB',(W*10,700*((len(sheet)+9)//10)),'white');dr=ImageDraw.Draw(S)
for i,(n,t,d) in enumerate(sheet):
    x,y=i%10*W,i//10*700;S.paste(t,(x,y));dd=d.convert('RGB');dd.thumbnail((200,300));S.paste(dd,(x,y+345));dr.text((x,y+650),n[:30],fill='black')
S.save(O+'/../crops_sheet.jpg',quality=80);print(len(sheet))
