from flask import Flask, request, render_template_string
import cv2, numpy as np, base64
app = Flask(__name__)

HTML = """<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Restaura Fotos Pro</title>
<style>
body{background:#0d0d0d;color:#fff;font-family:sans-serif;text-align:center;padding:15px}
.card{background:#1e1e1e;padding:20px;border-radius:18px;max-width:500px;margin:auto}
button{background:#00ff88;padding:14px;border:none;border-radius:12px;font-size:17px;width:100%;margin-top:12px;font-weight:bold;cursor:pointer;color:#000}
button.sec{background:#333;color:#fff}
#loader{display:none;margin-top:15px;background:#333;border-radius:10px;padding:3px}
#bar{height:26px;width:0%;background:#00ff88;border-radius:8px;transition:width 0.3s;color:#000;font-weight:bold;line-height:26px}
#paywall{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:#000000ee;z-index:99;padding:30px}
.paybox{background:#222;padding:25px;border-radius:20px;max-width:400px;margin:60px auto;border:2px solid #00ff88}
img{max-width:100%;border-radius:12px;margin-top:12px}
.badge{background:#00ff88;color:#000;padding:5px 12px;border-radius:20px;font-size:12px;font-weight:bold}
</style>
</head><body>
<div class="card">
<h2>Restaura Fotos Pro <span class="badge" id="freeBadge">2 GRATIS</span></h2>
<p>Quita rayas y mejora a HD</p>
<form id="form" method="post" enctype="multipart/form-data">
<input type="file" name="file" id="file" required accept="image/*">
<select name="mode" id="mode" style="width:100%;padding:10px;border-radius:10px;margin-top:10px;background:#333;color:#fff;border:none">
<option value="rayas">Quitar Rayas / Manchas</option>
<option value="hd">Mejorar a HD 2x (Nítida)</option>
<option value="todo">TODO: Rayas + HD (PRO)</option>
</select>
<button type="submit" id="btn">RESTAURAR AHORA</button>
</form>
<div id="loader"><div id="bar">0%</div><div id="pct">Preparando...</div></div>
<div id="resultado">
{% if result %}
<h3>Resultado HD</h3>
<img src="data:image/png;base64,{{result}}">
<br><a href="data:image/png;base64,{{result}}" download="restaurada.png"><button>Descargar HD</button></a>
<br><button class="sec" onclick="location.reload()">Otra foto</button>
{% endif %}
</div>
</div>
<div id="paywall"><div class="paybox">
<h2>Se acabaron tus 2 gratis</h2>
<h1 style="color:#00ff88">$79 MXN / mes</h1>
<p>$149 pago unico</p>
<button onclick="window.open('https://wa.me/521XXXXXXXXXX?text=Quiero%20pagar%20Restaura%20Pro','_blank')">PAGAR POR WHATSAPP</button>
<input id="code" placeholder="Codigo desbloqueo" style="width:100%;padding:10px;border-radius:10px;margin-top:10px">
<button class="sec" onclick="unlock()">DESBLOQUEAR</button>
</div></div>
<script>
let free=localStorage.getItem('freeUses')||0;
document.getElementById('freeBadge').innerText=(2-free)+' GRATIS';
if(localStorage.getItem('isPro')=='true'){document.getElementById('freeBadge').innerText='PRO ILIMITADO';}
function checkPay(){ if(localStorage.getItem('isPro')=='true') return true; if(free>=2){document.getElementById('paywall').style.display='block';return false;} return true;}
function unlock(){ if(document.getElementById('code').value=='PRO79'){localStorage.setItem('isPro','true');alert('Desbloqueado!');location.reload();} else alert('Codigo mal');}
const form=document.getElementById('form');const bar=document.getElementById('bar');const loader=document.getElementById('loader');const pctText=document.getElementById('pct');const btn=document.getElementById('btn');
form.addEventListener('submit',function(e){
 if(!checkPay()){e.preventDefault();return;}
 e.preventDefault();loader.style.display='block';btn.disabled=true;btn.innerText='Restaurando...';
 let pct=0;let msgs=['Cargando...','Quitando rayas...','Mejorando...','Casi listo...'];
 let iv=setInterval(()=>{pct+=Math.random()*12;if(pct>90)pct=90;bar.style.width=pct+'%';bar.innerText=Math.round(pct)+'%';pctText.innerText=msgs[Math.floor(pct/25)];},400);
 let fd=new FormData(form);
 fetch('/',{method:'POST',body:fd}).then(r=>r.text()).then(html=>{
  clearInterval(iv);bar.style.width='100%';bar.innerText='100%';free++;localStorage.setItem('freeUses',free);
  setTimeout(()=>{document.open();document.write(html);document.close();},400);
 }).catch(()=>{clearInterval(iv);alert('Error');btn.disabled=false;});
});
</script>
</body></html>
"""

def procesar(img, mode):
    if mode in ['rayas','todo']:
        gray=cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _,mask=cv2.threshold(cv2.medianBlur(gray,3),205,255,cv2.THRESH_BINARY)
        kernel=np.ones((2,2),np.uint8)
        mask=cv2.morphologyEx(mask,cv2.MORPH_OPEN,kernel,1)
        mask=cv2.dilate(mask,kernel,1)
        img=cv2.inpaint(img,mask,3,cv2.INPAINT_TELEA)
    if mode in ['hd','todo']:
        img=cv2.resize(img,None,fx=2,fy=2,interpolation=cv2.INTER_CUBIC)
        img=cv2.detailEnhance(img, sigma_s=10, sigma_r=0.15)
    return img

@app.route('/', methods=['GET','POST'])
def home():
    result=None
    if request.method=='POST':
        f=request.files['file'].read()
        mode=request.form.get('mode','rayas')
        img=cv2.imdecode(np.frombuffer(f,np.uint8), cv2.IMREAD_COLOR)
        out=procesar(img,mode)
        _,buf=cv2.imencode('.png',out)
        result=base64.b64encode(buf).decode()
    return render_template_string(HTML, result=result) 
