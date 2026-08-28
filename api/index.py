from flask import Flask, request, render_template_string
app = Flask(__name__)
HTML = """
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Jacona Color Pro</title>
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
<style>
body{background:#0f0f0f;color:#fff;font-family:sans-serif;padding:10px;margin:0}
.card{background:#1e1e1e;padding:14px;border-radius:16px;max-width:520px;margin:auto;text-align:center}
canvas{max-width:100%;border-radius:12px;margin-top:10px;background:#000}
input[type=range]{width:100%;accent-color:#00ff88}
label{font-size:12px;color:#aaa;display:flex;justify-content:space-between;margin-top:10px}
button{background:#00ff88;color:#000;border:none;padding:11px;width:100%;border-radius:10px;font-weight:bold;margin-top:8px}
.btn2{background:#333;color:#fff}.tabs{display:flex;gap:6px;margin-bottom:10px}.tabs button{flex:1}
.active{background:#00ff88!important;color:#000!important}
textarea{width:100%;height:150px;background:#111;color:#fff;border:1px solid #333;border-radius:12px;padding:10px;box-sizing:border-box;margin-top:10px}
#bar{height:24px;width:0%;background:#00ff88;border-radius:8px;color:#000;font-weight:bold;line-height:24px}
#loader{margin-top:10px;background:#333;border-radius:10px;padding:4px;display:none}
.filtros{display:flex;gap:6px;overflow-x:auto;margin-top:10px;padding-bottom:6px}
.filtros button{flex:0 0 auto;width:auto;padding:8px 12px;font-size:12px}
</style></head><body>
<div class="card">
<h3 style="margin:4px">APP JACONA - COLOR PRO</h3>
<div class="tabs"><button id="t1" class="active" onclick="show(1)">📝 Texto</button><button id="t2" onclick="show(2)">🎨 Foto Color</button></div>

<div id="p1">
<input type="file" id="fileTxt" accept="image/*"><div id="loader"><div id="bar">0%</div></div>
<textarea id="out" placeholder="Texto aquí..."></textarea><button onclick="copiar()">📋 COPIAR</button>
</div>

<div id="p2" style="display:none">
<input type="file" id="fileImg" accept="image/*"><canvas id="c"></canvas>

<div class="filtros">
<button class="btn2" onclick="setFiltro('original')">Original</button>
<button class="btn2" onclick="setFiltro('bw')">B/N</button>
<button class="btn2" onclick="setFiltro('sepia')">Sepia</button>
<button class="btn2" onclick="setFiltro('color')">🌈 Colorear</button>
<button class="btn2" onclick="setFiltro('vintage')">Vintage</button>
<button class="btn2" onclick="setFiltro('frio')">Frío</button>
<button class="btn2" onclick="setFiltro('calido')">Cálido</button>
</div>

<label>Brillo <b id="vB">100</b></label><input type="range" id="br" min="0" max="200" value="100">
<label>Contraste <b id="vC">100</b></label><input type="range" id="co" min="0" max="200" value="100">
<label>Intensidad Color <b id="vCol">100</b></label><input type="range" id="col" min="0" max="300" value="100">
<label>Matiz (Cambiar Color) <b id="vH">0</b></label><input type="range" id="hue" min="0" max="360" value="0">
<label>Nitidez <b id="vS">0</b></label><input type="range" id="sh" min="0" max="100" value="0">

<div style="display:flex;gap:6px"><button class="btn2" id="btnBorrar" onclick="toggleBorrar()">🩹 Borrar OFF</button><button class="btn2" onclick="resetF()">Reset</button></div>
<button onclick="descargar()">⬇️ DESCARGAR HD</button>
</div>
</div>

<script>
document.getElementById('fileTxt').onchange=e=>{
 let f=e.target.files[0]; document.getElementById('loader').style.display='block';
 Tesseract.recognize(f,'spa',{logger:m=>{if(m.progress){let p=Math.round(m.progress*100);document.getElementById('bar').style.width=p+'%';document.getElementById('bar').innerText=p+'%'}}}).then(r=>{document.getElementById('out').value=r.data.text; document.getElementById('loader').style.display='none'});
}
function copiar(){let t=document.getElementById('out');t.select();document.execCommand('copy');alert('Copiado')}

let canvas=document.getElementById('c'), ctx=canvas.getContext('2d'), img=new Image(), borrar=false, pintando=false, filtroActual='original';
let br=document.getElementById('br'), co=document.getElementById('co'), col=document.getElementById('col'), hue=document.getElementById('hue'), sh=document.getElementById('sh');
document.getElementById('fileImg').onchange=e=>{let f=e.target.files[0]; let rd=new FileReader(); rd.onload=ev=>{img.src=ev.target.result}; rd.readAsDataURL(f);}
img.onload=()=>{canvas.width=img.naturalWidth; canvas.height=img.naturalHeight; aplicar();}

function setFiltro(f){filtroActual=f; aplicar();}

function aplicar(){
 if(!img.src) return;
 ctx.clearRect(0,0,canvas.width,canvas.height);
 let filtros = `brightness(${br.value}%) contrast(${co.value}%) saturate(${col.value}%) hue-rotate(${hue.value}deg)`;

 if(filtroActual=='bw') filtros += ' grayscale(100%)';
 if(filtroActual=='sepia') filtros += ' sepia(100%)';
 if(filtroActual=='vintage') filtros += ' sepia(60%) contrast(110%) brightness(110%)';
 if(filtroActual=='frio') filtros += ' sepia(20%) hue-rotate(180deg) saturate(150%)';
 if(filtroActual=='calido') filtros += ' sepia(40%) saturate(180%) hue-rotate(-20deg)';
 if(filtroActual=='color'){ // Colorear B/N a color falso pero bonito
   ctx.filter = filtros + ' grayscale(100%)';
   ctx.drawImage(img,0,0);
   ctx.globalCompositeOperation='color';
   ctx.filter='none';
   // capa de color cálido
   ctx.fillStyle='#c77d3a';
   ctx.globalAlpha=0.35;
   ctx.fillRect(0,0,canvas.width,canvas.height);
   ctx.globalCompositeOperation='source-over';
   ctx.globalAlpha=1;
   // regresar
   document.getElementById('vB').innerText=br.value; document.getElementById('vC').innerText=co.value; document.getElementById('vCol').innerText=col.value; document.getElementById('vH').innerText=hue.value; document.getElementById('vS').innerText=sh.value;
   return;
 }

 ctx.filter=filtros;
 ctx.drawImage(img,0,0);
 ctx.filter='none';
 if(sh.value>0){ ctx.globalAlpha=sh.value/250; ctx.drawImage(canvas,0,0); ctx.globalAlpha=1; }
 document.getElementById('vB').innerText=br.value; document.getElementById('vC').innerText=co.value; document.getElementById('vCol').innerText=col.value; document.getElementById('vH').innerText=hue.value; document.getElementById('vS').innerText=sh.value;
}
br.oninput=aplicar; co.oninput=aplicar; col.oninput=aplicar; hue.oninput=aplicar; sh.oninput=aplicar;
function toggleBorrar(){borrar=!borrar; document.getElementById('btnBorrar').innerText=borrar?'🩹 Borrar ON':'🩹 Borrar OFF'; document.getElementById('btnBorrar').style.background=borrar?'#ff4444':'#333'}
canvas.addEventListener('mousedown',e=>{if(!borrar)return;pintando=true;borra(e)}); canvas.addEventListener('mousemove',e=>{if(!borrar||!pintando)return;borra(e)});
canvas.addEventListener('touchstart',e=>{if(!borrar)return;pintando=true;borra(e.touches[0])}); canvas.addEventListener('touchmove',e=>{if(!borrar||!pintando)return;e.preventDefault();borra(e.touches[0])},{passive:false});
window.addEventListener('mouseup',()=>pintando=false); window.addEventListener('touchend',()=>pintando=false);
function borra(e){let r=canvas.getBoundingClientRect(); let x=(e.clientX-r.left)*(canvas.width/r.width); let y=(e.clientY-r.top)*(canvas.height/r.height); ctx.globalCompositeOperation='destination-out'; ctx.beginPath(); ctx.arc(x,y,22,0,Math.PI*2); ctx.fill(); ctx.globalCompositeOperation='source-over';}
function resetF(){br.value=100;co.value=100;col.value=100;hue.value=0;sh.value=0;filtroActual='original';aplicar()}
function descargar(){let out=document.createElement('canvas'); out.width=canvas.width*2; out.height=canvas.height*2; let octx=out.getContext('2d'); octx.imageSmoothingQuality='high'; octx.drawImage(canvas,0,0,out.width,out.height); let a=document.createElement('a'); a.download='foto_color_Jacona.png'; a.href=out.toDataURL('image/png'); a.click()}
function show(n){document.getElementById('p1').style.display=n==1?'block':'none'; document.getElementById('p 
