from flask import Flask, request, render_template_string
from PIL import Image, ImageEnhance, ImageOps
import base64, io
app = Flask(__name__)
HTML = """
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Editor Pro</title>
<style>
body{background:#0f0f0f;color:#fff;font-family:sans-serif;padding:10px;margin:0}
.card{background:#1e1e1e;padding:16px;border-radius:16px;max-width:500px;margin:auto}
canvas{max-width:100%;border-radius:12px;margin-top:10px;background:#000;touch-action:none}
input[type=range]{width:100%} label{font-size:13px;color:#aaa;margin-top:8px;display:block;text-align:left}
button{background:#00ff88;color:#000;border:none;padding:12px;width:100%;border-radius:10px;font-weight:bold;margin-top:8px}
.btn2{background:#333;color:#fff}.row{display:flex;gap:6px}
</style></head><body>
<div class="card">
<h3 style="margin:0">Restaura Fotos - Editor Manual</h3>
<input type="file" id="file" accept="image/*" style="margin-top:12px">
<canvas id="c"></canvas>
<label>Brillo <span id="vB">100</span>%</label><input type="range" id="br" min="50" max="200" value="100">
<label>Contraste <span id="vC">100</span>%</label><input type="range" id="co" min="50" max="200" value="100">
<label>Color <span id="vCol">100</span>%</label><input type="range" id="col" min="0" max="200" value="100">
<label>Nitidez <span id="vS">100</span>%</label><input type="range" id="sh" min="0" max="300" value="100">
<div class="row"><button class="btn2" id="btnBorrar">🩹 Modo Borrar: OFF</button><button class="btn2" id="btnReset">Reset</button></div>
<button id="btnHD">⬇️ DESCARGAR HD 2x</button>
<p style="font-size:11px;color:#666">Tip: Activa Modo Borrar y pinta sobre rayas/manchas con el dedo para borrarlas.</p>
</div>
<script>
let canvas=document.getElementById('c'), ctx=canvas.getContext('2d'), img=new Image(), borrar=false, pintando=false;
let br=document.getElementById('br'), co=document.getElementById('co'), col=document.getElementById('col'), sh=document.getElementById('sh');
document.getElementById('file').onchange=e=>{
 let f=e.target.files[0]; if(!f) return;
 let r=new FileReader(); r.onload=ev=>{img.src=ev.target.result}; r.readAsDataURL(f);
}
img.onload=()=>{canvas.width=img.width; canvas.height=img.height; draw()};
function draw(){
 if(!img.src) return;
 let b=br.value/100, c=co.value/100, cl=col.value/100, s=sh.value/100;
 ctx.filter=`brightness(${b}) contrast(${c}) saturate(${cl})`;
 ctx.drawImage(img,0,0);
 // nitidez simple con overlay
 if(s>1){ ctx.globalAlpha=(s-1)*0.3; ctx.drawImage(canvas,0,0); ctx.globalAlpha=1 }
}
[br][co][col][sh].forEach(el=>el.oninput=()=>{document.getElementById('vB').innerText=br.value;document.getElementById('vC').innerText=co.value;document.getElementById('vCol').innerText=col.value;document.getElementById('vS').innerText=sh.value; draw()});
document.getElementById('btnBorrar').onclick=()=>{borrar=!borrar; document.getElementById('btnBorrar').innerText=borrar?'🩹 Modo Borrar: ON (pinta)':'🩹 Modo Borrar: OFF'; document.getElementById('btnBorrar').style.background=borrar?'#ff4444':'#333'; document.getElementById('btnBorrar').style.color=borrar?'#fff':'#fff'};
canvas.addEventListener('mousedown',e=>{if(!borrar)return;pintando=true; erase(e)}); canvas.addEventListener('mousemove',e=>{if(!borrar||!pintando)return; erase(e)});
canvas.addEventListener('touchstart',e=>{if(!borrar)return;pintando=true; erase(e.touches[0])}); canvas.addEventListener('touchmove',e=>{if(!borrar||!pintando)return; e.preventDefault(); erase(e.touches[0])},{passive:false});
window.addEventListener('mouseup',()=>pintando=false); window.addEventListener('touchend',()=>pintando=false);
function erase(e){let rect=canvas.getBoundingClientRect(); let x=(e.clientX-rect.left)*(canvas.width/rect.width); let y=(e.clientY-rect.top)*(canvas.height/rect.height); ctx.globalCompositeOperation='destination-out'; ctx.beginPath(); ctx.arc(x,y,18,0,Math.PI*2); ctx.fill(); ctx.globalCompositeOperation='source-over';}
document.getElementById('btnReset').onclick=()=>{br.value=100;co.value=100;col.value=100;sh.value=100; draw(); if(img.src){canvas.width=img.width; canvas.height=img.height; draw()}}
document.getElementById('btnHD').onclick=()=>{
 let out=document.createElement('canvas'); out.width=canvas.width*2; out.height=canvas.height*2;
 let octx=out.getContext('2d'); octx.imageSmoothingQuality='high'; octx.drawImage(canvas,0,0,out.width,out.height);
 let a=document.createElement('a'); a.download='foto_restaurada_HD.png'; a.href=out.toDataURL('image/png'); a.click();
}
</script></body></html>
"""
@app.route('/', methods=['GET','POST'])
def home():
    return render_template_string(HTML)
