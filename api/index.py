from flask import Flask, request, render_template_string
app = Flask(__name__)
HTML = """
<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Jacona Pro Final</title>
<script src="https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js"></script>
<style>
body{background:#0f0f0f;color:#fff;font-family:sans-serif;padding:10px;margin:0}
.card{background:#1e1e1e;padding:14px;border-radius:16px;max-width:520px;margin:auto;text-align:center}
canvas{max-width:100%;border-radius:12px;margin-top:10px;background:#fff;touch-action:none;border:2px solid #333}
input[type=range]{width:100%;accent-color:#00ff88}
label{font-size:12px;color:#aaa;display:flex;justify-content:space-between;margin-top:8px}
button{background:#00ff88;color:#000;border:none;padding:11px;width:100%;border-radius:10px;font-weight:bold;margin-top:8px}
.btn2{background:#333;color:#fff}.tabs{display:flex;gap:6px;margin-bottom:10px}.tabs button{flex:1}
.active{background:#00ff88!important;color:#000!important}
.filtros{display:flex;gap:6px;overflow-x:auto;margin-top:10px;padding-bottom:6px}.filtros button{flex:0 0 auto;width:auto;padding:8px 12px;font-size:12px}
#bar{height:24px;width:0%;background:#00ff88;border-radius:8px;color:#000;font-weight:bold;line-height:24px}
#loader{display:none;margin-top:8px;background:#333;border-radius:10px;padding:4px}
</style></head><body>
<div class="card">
<h3>APP JACONA PRO</h3>
<div class="tabs"><button id="t1" class="active" onclick="show(1)">📝 Texto</button><button id="t2" onclick="show(2)">🎨 Fotos</button></div>

<div id="p1">
<input type="file" id="fileTxt" accept="image/*"><div id="loader"><div id="bar">0%</div></div>
<textarea id="out" style="width:100%;height:150px;background:#111;color:#fff;border:1px solid #333;border-radius:12px;padding:10px;box-sizing:border-box;margin-top:10px" placeholder="Texto aquí..."></textarea>
<button onclick="copiar()">📋 COPIAR</button>
</div>

<div id="p2" style="display:none">
<input type="file" id="fileImg" accept="image/*">
<canvas id="c"></canvas>
<canvas id="cOrig" style="display:none"></canvas>

<div class="filtros">
<button class="btn2" onclick="setFiltro('original')">Original</button>
<button class="btn2" onclick="setFiltro('bw')">B/N</button>
<button class="btn2" onclick="setFiltro('color')">🌈 Color</button>
<button class="btn2" onclick="setFiltro('sepia')">Sepia</button>
</div>

<label>Brillo <b id="vB">100</b></label><input type="range" id="br" min="0" max="200" value="100">
<label>Color <b id="vCol">100</b></label><input type="range" id="col" min="0" max="300" value="100">
<label>Cambiar Tono <b id="vH">0</b></label><input type="range" id="hue" min="0" max="360" value="0">

<div style="display:flex;gap:6px">
<button class="btn2" id="btnBorrar" onclick="toggleBorrar()">🩹 Borrar: OFF</button>
<button class="btn2" id="antesBtn" onmousedown="verAntes(true)" onmouseup="verAntes(false)" ontouchstart="verAntes(true)" ontouch
