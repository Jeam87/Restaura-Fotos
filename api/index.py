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
 fetch('/',{method:'POST',body:fd}).then(r=>r 
