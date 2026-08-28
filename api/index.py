from flask import Flask, request, render_template_string
app = Flask(__name__)
HTML = """
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Jacona App Pro</title>
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
<style>
body{background:#0f0f0f;color:#fff;font-family:sans-serif;padding:10px;margin:0}
.card{background:#1e1e1e;padding:14px;border-radius:16px;max-width:520px;margin:auto;text-align:center}
canvas{max-width:100%;border-radius:12px;margin-top:10px;background:#000}
input[type=range]{width:100%;accent-color:#00ff88}
label{font-size:12px;color:#aaa;display:flex;justify-content:space-between;margin-top:10px}
button{background:#00ff88;color:#000;border:none;padding:12px;width:100%;border-radius:10px;font-weight:bold;margin-top:8px}
.btn2{background:#333;color:#fff}.tabs{display:flex;gap:6px;margin-bottom:10px}.tabs button{flex:1}
.active{background:#00ff88!important;color:#000!important}
textarea{width:100%;height:180px;background:#111;color:#fff;border:1px solid #333;border-radius:12px;padding:10px;box-sizing:border-box;margin-top:10px}
#bar{height:24px;width:0%;background:#00ff88;border-radius:8px;color:#000;font-weight:bold;line-height:24px}
#loader{margin-top:10px;background:#333;border-radius:10px;padding:4px;display:none}
</style></head><body>
<div class="card">
<h3 style="margin:4px">APP JACONA PRO</h3>
<div class="tabs"><button id="t1" class="active" onclick="show(1)">📝 Foto a Texto</button><button id="t2" onclick="show(2)">✨ Editor Fotos</button></div>

<div id="p1">
<input type="file" id="fileTxt" accept="image/*" capture="environment">
<img id="prevTxt" style="display:none;max-width:100%;margin-top:8px;border-radius:10px">
<div id="loader"><div id="bar">0%</div></div>
<textarea id="out" placeholder="Aquí sale el texto..."></textarea>
<button onclick="copiar()">📋 COPIAR</button>
</div>

<div id="p2" style="display:none">
<input type="file" id="fileImg" accept="image/*">
<canvas id="c"></canvas>
<label>Brillo <b id="vB">100</b></label><input type="range" id="br" min="0" max="200" value="100">
<label>Contraste <b id="vC">100</b></label><input type="range" id="co" min="0" max="200" value="100">
<label>Color <b id="vCol">100</b></label><input type="range" id="col" min="0" max="200" value="100">
<label>Nitidez <b id="vS">0</b></label><input type="range" id="sh" min="0" max="100" value="0">
<div style="display:flex;gap:6px"><button class="btn2" id="btnBorrar" onclick="toggleBorrar()">🩹 Borrar OFF</button><button class="btn2" onclick="resetF()">Reset</button></div>
<button onclick="descargar()">⬇️ DESCARGAR HD 2x</button>
<p style="font-size:10px;color:#666">Activa Borrar y pinta con el dedo sobre rayas</p>
</div>
</div>

<script>
// --- OCR ---
document.getElementById('fileTxt').onchange=e=>{
 let f=e.target.files[0]; if(!f)return;
 document.getElementById('prevTxt').src=URL.createObjectURL(f);
 document.getElementById('prevTxt').style.display='block';
 document.getElementById('loader').style.display='block';
 Tesseract.recognize(f,'spa',{logger:m=>{
  if(m.progress){let p=Math.round(m.progress*100);document.getElementById('bar').style.width=p+'%';document.getElementById('bar').innerText=p+'%'}
 }}).then(r=>{document.getElementById('out').value=r.data.text; document.getElementById('loader').style.display='none'});
}
function copiar(){let t=document.getElementById('out');t.select();document.execCommand('copy');alert('Copiado')}

// --- EDITOR FOTO ---
let canvas=document.getElementById('c'), ctx=canvas.getContext('2d'), img=new Image(), borrar=false, pintando=false;
let br=document.getElementById('br'), co=document.getElementById('co'), col=document.getElementById('col'), sh=document.getElementById('sh');
document.getElementById('fileImg').onchange=e=>{
 let f=e.target.files[0]; if(!f)return;
 let rd=new FileReader(); rd.onload=ev=>{img.src=ev.target.result}; rd.readAsDataURL(f);
}
img.onload=()=>{canvas.width=img.naturalWidth; canvas.height=img.naturalHeight; aplicar()};
function aplicar(){
 if(!img.src) return;
 // limpiar
 ctx.clearRect(0,0,canvas.width,canvas.height);
 ctx.filter=`brightness(${br.value}%) contrast(${co.value}%) saturate(${col.value}%)`;
 ctx.drawImage(img,0,0);
 // nitidez extra
 if(sh.value>0){
  ctx.filter=`contrast(${100+parseInt(sh.value)}%)`;
  ctx.globalAlpha=0.3; ctx.drawImage(canvas,0,0); ctx.globalAlpha=1;
  ctx.filter='none';
 } else { ctx.filter='none'; }
 document.getElementById('vB').innerText=br.value; document.getElementById('vC').innerText=co.value; document.getElementById('vCol').innerText=col.value; document.getElementById('vS').innerText=sh.value;
}
br.oninput=aplicar; co.oninput=aplicar; col.oninput=aplicar; sh.oninput=aplicar;
function toggleBorrar(){borrar=!borrar; document.getElementById('btnBorrar').innerText=borrar?'🩹 Borrar ON':'🩹 Borrar OFF'; document.getElementById('btnBorrar').style.background=borrar?'#ff4444':'#333'}
canvas.addEventListener('mousedown',e=>{if(!borrar)return;pintando=true;borra(e)}); canvas.addEventListener('mousemove',e=>{if(!borrar||!pintando)return;borra(e)});
canvas.addEventListener('touchstart',e=>{if(!borrar)return;pintando=true;borra(e.touches[0])}); canvas.addEventListener('touchmove',e=>{if(!borrar||!pintando)return;e.preventDefault();borra(e.touches[0])},{passive:false});
window.addEventListener('mouseup',()=>pintando=false); window.addEventListener('touchend',()=>pintando=false);
function borra(e){let r=canvas.getBoundingClientRect(); let x=(e.clientX-r.left)*(canvas.width/r.width); let y=(e.clientY-r.top)*(canvas.height/r.height); ctx.globalCompositeOperation='destination-out'; ctx.beginPath(); ctx.arc(x,y,22,0,Math.PI*2); ctx.fill(); ctx.globalCompositeOperation='source-over';}
function resetF(){br.value=100;co.value=100;col.value=100;sh.value=0;aplicar()}
function descargar(){let out=document.createElement('canvas'); out.width=canvas.width*2; out.height=canvas.height*2; let octx=out.getContext('2d'); octx.imageSmoothingQuality='high'; octx.drawImage(canvas,0,0,out.width,out.height); let a=document.createElement('a'); a.download='foto_Jacona_HD.png'; a.href=out.toDataURL('image/png'); a.click()}
function show(n){document.getElementById('p1').style.display=n==1?'block':'none'; document.getElementById('p2').style.display=n==2?'block':'none'; document.getElementById('t1').className=n==1?'active':''; document.getElementById('t2').className=n==2?'active':'';}
</script></body></html>
"""
@app.route('/')
def home(): return render_template_string(HTML)
