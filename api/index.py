from flask import Flask, request, render_template_string
import cv2, numpy as np, base64
app = Flask(__name__)

HTML = """
<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Restaura Fotos Pro</title>
<style>
body{background:#111;color:#fff;font-family:sans-serif;text-align:center;padding:15px}
.card{background:#222;padding:20px;border-radius:18px;max-width:500px;margin:auto}
button{background:#00ff88;padding:14px;width:100%;border:none;border-radius:12px;font-weight:bold;margin-top:12px;color:#000;font-size:16px}
button.sec{background:#333;color:#fff}
#loader{display:none;margin-top:15px;background:#333;border-radius:10px;padding:3px}
#bar{height:28px;width:0%;background:#00ff88;border-radius:8px;transition:width 0.3s;color:#000;font-weight:bold;line-height:28px}
img{max-width:100%;margin-top:12px;border-radius:12px}
</style>
</head><body>
<div class="card">
<h2>Restaura Fotos Pro</h2>
<p>Quita rayas, HD y Color</p>
<form id="form" method="post" enctype="multipart/form-data">
<input type="file" name="file" id="file" required accept="image/*"><br>
<select name="mode" id="mode" style="width:100%;padding:12px;margin-top:10px;background:#333;color:#fff;border:none;border-radius:10px;font-size:16px">
<option value="rayas">1. Quitar Rayas / Manchas</option>
<option value="hd">2. Mejorar a HD 2x</option>
<option value="color">3. Colorear B/N -> Color</option>
<option value="todo">4. TODO Pro (Rayas+HD+Color)</option>
</select>
<button type="submit" id="btn">RESTAURAR AHORA</button>
</form>
<div id="loader"><div id="bar">0%</div><div id="txt" style="margin-top:6px;font-size:14px">Preparando...</div></div>
{% if result %}
<div id="res">
<h3>Listo!</h3>
<img src="data:image/png;base64,{{result}}">
<br><a href="data:image/png;base64,{{result}}" download="restaurada.png"><button>Descargar HD</button></a>
<br><button class="sec" onclick="location.reload()">Otra foto</button>
</div>
{% endif %}
</div>
<script>
const form=document.getElementById('form');
const loader=document.getElementById('loader');
const bar=document.getElementById('bar');
const txt=document.getElementById('txt');
const btn=document.getElementById('btn');
form.addEventListener('submit',function(e){
 e.preventDefault();
 loader.style.display='block';
 btn.disabled=true;
 btn.innerText='Restaurando...';
 let p=0;
 let frases=['Cargando foto...','Quitando rayas...','Mejorando nitidez...','Coloreando...','Casi listo...'];
 let iv=setInterval(()=>{
   p+=Math.random()*12;
   if(p>92) p=92;
   bar.style.width=p+'%';
   bar.innerText=Math.round(p)+'%';
   txt.innerText=frases[Math.floor(p/25)]||'Finalizando...';
 },350);
 let fd=new FormData(form);
 fetch('/',{method:'POST',body:fd}).then(r=>r.text()).then(html=>{
   clearInterval(iv);
   bar.style.width='100%'; bar.innerText='100%'; txt.innerText='¡Terminado!';
   setTimeout(()=>{document.open();document.write(html);document.close();},500);
 }).catch(()=>{clearInterval(iv); alert('Error, intenta otra foto'); btn.disabled=false;});
});
</script>
</body></html>
"""

def procesar(img, mode):
    if max(img.shape[:2]) > 1000:
        s=1000/max(img.shape[:2]); img=cv2.resize(img,None,fx=s,fy=s)
    if mode in ['rayas','todo']:
        g=cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
        _,m=cv2.threshold(cv2.medianBlur(g,3),205,255,cv2.THRESH_BINARY)
        k=np.ones((2,2),np.uint8)
        m=cv2.dilate(cv2.morphologyEx(m,cv2.MORPH_OPEN,k,1),k,1)
        img=cv2.inpaint(img,m,3,cv2.INPAINT_TELEA)
    if mode in ['hd','todo']:
        img=cv2.resize(img,None,fx=2,fy=2,interpolation=cv2.INTER_CUBIC)
        img=cv2.detailEnhance(img,10,0.15)
    if mode in ['color','todo']:
        gray=cv2.cvtColor(img,cv2.COLOR_BGR2GRAY)
        col=cv2.applyColorMap(gray,cv2.COLORMAP_PINK)
        img=cv2.addWeighted(img,0.6,col,0.4,0)
    return img

@app.route('/', methods=['GET','POST'])
def home():
    res=None
    if request.method=='POST':
        f=request.files['file'].read()
        mode=request.form.get('mode','rayas')
        im=cv2.imdecode(np.frombuffer(f,np.uint8),cv2.IMREAD_COLOR)
        out=procesar(im,mode)
        _,b=cv2.imencode('.png',out)
        res=base64.b64encode(b).decode()
    return render_template_string(HTML,result=res) 
