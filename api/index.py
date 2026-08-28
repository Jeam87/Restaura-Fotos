from flask import Flask, request, render_template_string
import cv2
import numpy as np
import base64

app = Flask(__name__)

HTML = """<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mejora Fotos Pro</title>
<style>
body{background:#111;color:#fff;font-family:sans-serif;text-align:center;padding:20px}
.card{background:#222;padding:20px;border-radius:15px;max-width:500px;margin:auto}
button{background:#00ff88;padding:15px;border:none;border-radius:10px;font-size:18px;width:100%;margin-top:15px;font-weight:bold;cursor:pointer}
button:disabled{background:#555}
img{max-width:100%;border-radius:10px;margin-top:15px}
#loader{display:none;margin-top:20px;background:#333;border-radius:10px;overflow:hidden;padding:3px}
#bar{height:25px;width:0%;background:#00ff88;border-radius:7px;transition:width 0.3s;text-align:center;color:#000;font-weight:bold;line-height:25px}
#pct{margin-top:10px;font-size:16px;color:#00ff88}
</style>
</head><body><div class="card">
<h2>Mejora Fotos Pro V3</h2>
<p>Sube foto rayada / manchada</p>
<form id="form" method="post" enctype="multipart/form-data">
<input type="file" name="file" id="file" required>
<button type="submit" id="btn">RESTAURAR AHORA</button>
</form>
<div id="loader"><div id="bar">0%</div><div id="pct">Preparando...</div></div>
<div id="resultado">
{% if result %}
<h3>Resultado HD Limpio</h3>
<img src="data:image/png;base64,{{result}}">
<br><a href="data:image/png;base64,{{result}}" download="restaurada.png"><button>Descargar HD</button></a>
{% endif %}
</div>
</div>
<script>
const form=document.getElementById('form');
const bar=document.getElementById('bar');
const loader=document.getElementById('loader');
const pctText=document.getElementById('pct');
const btn=document.getElementById('btn');
const fileInput=document.getElementById('file');
form.addEventListener('submit',function(e){
 if(!fileInput.files.length) return;
 e.preventDefault();
 loader.style.display='block';
 btn.disabled=true;
 btn.innerText='Restaurando... espera';
 let pct=0;
 let msgs=['Cargando foto...','Analizando rayas...','Borrando grietas...','Mejorando HD...','Casi listo...'];
 let interval=setInterval(()=>{
  pct+=Math.random()*12;
  if(pct>92) pct=92;
  bar.style.width=pct+'%';
  bar.innerText=Math.round(pct)+'%';
  pctText.innerText=msgs[Math.floor(pct/20)]+' '+Math.round(pct)+'%';
 },400);
 let fd=new FormData(form);
 fetch('/',{method:'POST',body:fd}).then(r=>r.text()).then(html=>{
  clearInterval(interval);
  bar.style.width='100%';bar.innerText='100%';pctText.innerText='Listo! 100%';
  setTimeout(()=>{document.open();document.write(html);document.close();},500);
 }).catch(err=>{clearInterval(interval);alert('Error, intenta de nuevo');btn.disabled=false;btn.innerText='RESTAURAR AHORA';loader.style.display='none';});
});
</script>
</body></html>
"""

def restaurar_v3(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray_blur = cv2.medianBlur(gray, 3)
    _, mask = cv2.threshold(gray_blur, 205, 255, cv2.THRESH_BINARY)
    kernel = np.ones((2,2), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    mask = cv2.dilate(mask, kernel, iterations=1)
    restored = cv2.inpaint(img, mask, 3, cv2.INPAINT_TELEA)
    return restored

@app.route('/', methods=['GET','POST'])
def home():
    result=None
    if request.method=='POST':
        f=request.files['file'].read()
        img=cv2.imdecode(np.frombuffer(f,np.uint8), cv2.IMREAD_COLOR)
        out=restaurar_v3(img)
        _,buf=cv2.imencode('.png', out)
        result=base64.b64encode(buf).decode()
    return render_template_string(HTML, result=result)
