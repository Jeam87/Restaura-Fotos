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
</style>
</head><body>
<div class="card">
<h2>Restaura Fotos Pro</h2>
<p>Quita rayas, HD y Color</p>
<form id="form" method="post" enctype="multipart/form-data">
<input type="file" name="file" id="file" required accept="image/*">
<select name="mode" id="mode" style="width:100%;padding:12px;border-radius:10px;margin-top:10px;background:#333;color:#fff;border:none;font-size:16px">
<option value="rayas">1. Quitar Rayas / Manchas</option>
<option value="hd">2. Mejorar a HD 2x</option>
<option value="color">3. Colorear B/N -> Color</option>
<option value="todo">4. TODO: Rayas + HD + Color (PRO)</option>
</select>
<button type="submit" id="btn">RESTAURAR AHORA</button>
</form>
<div id="loader"><div id="bar">0%</div><div id="pct">Preparando...</div></div>
<div id="resultado">
{% if result %}
<h3>Resultado</h3>
<img src="data:image/png;base64,{{result}}">
<br><a href="data:image/png;base64,{{result}}" download="restaurada.png"><button>Descargar HD</button></a>
<br><button class="sec" onclick="location.reload()">Otra foto</button>
{% endif %}
</div>
</div>
<div id="paywall"><div class="paybox">
<h2>Se acabaron tus 2 gratis</h2>
<h1 style="color:#00ff88">$79 MXN / mes</h1>
<button onclick="window.open('https://wa.me/521XXXXXXXXXX','_blank')">PAGAR POR WHATSAPP</button>
<input id="code" placeholder="Codigo PRO79" style="width:100%;padding:10px;border-radius:10px;margin-top:10px">
<button class="sec" onclick="unlock()">DESBLOQUEAR</button>
</div></div>
<script>
let free=localStorage.getItem('freeUses')||0;
function checkPay(){ if(localStorage.getItem('isPro')=='true') return true; if(free>=2){document.getElementById('paywall').style.display='block';return false;} return true;}
function unlock(){ if(document.getElementById('code').value=='PRO79'){localStorage.setItem('isPro','true');alert('Desbloqueado!');location.reload();} else alert('Mal');}
const form=document.getElementById('form');const bar=document.getElementById('bar');const loader=document.getElementById('loader');const pctText=document.getElementById('pct');const btn=document.getElementById('btn');
form.addEventListener('submit',function(e){
 if(!checkPay()){e.preventDefault();return;}
 e.preventDefault();loader.style.display='block';btn.disabled=true;btn.innerText='Restaurando...';
 let pct=0;let iv=setInterval(()=>{pct+=Math.random()*10;if(pct>90)pct=90;bar.style.width=pct+'%';bar.innerText=Math.round(pct)+'%';},400);
 let fd=new FormData(form);
 fetch('/',{method:'POST',body:fd}).then(r=>r.text()).then(html=>{
  clearInterval(iv);bar.style.width='100%';free++;localStorage.setItem('freeUses',free);
  setTimeout(()=>{document.open();document.write(html);document.close();},400);
 });
});
</script>
</body></html>
"""

def procesar(img, mode):
    # Asegurar que no truene por tamaño
    h,w = img.shape[:2]
    if max 
