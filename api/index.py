from flask import Flask, request, render_template_string
import cv2
import numpy as np
import base64

app = Flask(__name__)

HTML = """
<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Restaura Fotos Pro</title>
<style>
body{background:#111;color:#fff;font-family:sans-serif;text-align:center;padding:15px}
.card{background:#222;padding:20px;border-radius:15px;max-width:500px;margin:auto}
button{background:#00ff88;padding:14px;width:100%;border:none;border-radius:10px;font-weight:bold;margin-top:10px}
img{max-width:100%;margin-top:10px;border-radius:10px}
</style>
</head><body>
<div class="card">
<h2>Restaura Fotos Pro</h2>
<form method="post" enctype="multipart/form-data">
<input type="file" name="file" required accept="image/*"><br>
<select name="mode" style="width:100%;padding:10px;margin-top:10px;background:#333;color:#fff;border:none;border-radius:10px">
<option value="rayas">Quitar Rayas</option>
<option value="hd">HD 2x</option>
<option value="color">Colorear B/N</option>
<option value="todo">Todo Pro</option>
</select>
<button type="submit">RESTAURAR</button>
</form>
{% if result %}
<img src="data:image/png;base64,{{result}}">
<br><a href="data:image/png;base64,{{result}}" download="foto.png"><button>Descargar</button></a>
{% endif %}
</div>
</body></html>
"""

def procesar(img, mode):
    if max(img.shape[:2]) > 1000:
        s = 1000 / max(img.shape[:2])
        img = cv2.resize(img, None, fx=s, fy=s)
    if mode in ['rayas','todo']:
        g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _,m = cv2.threshold(cv2.medianBlur(g,3),205,255,cv2.THRESH_BINARY)
        k = np.ones((2,2),np.uint8)
        m = cv2.dilate(cv2.morphologyEx(m,cv2.MORPH_OPEN,k,1),k,1)
        img = cv2.inpaint(img,m,3,cv2.INPAINT_TELEA)
    if mode in ['hd','todo']:
        img = cv2.resize(img,None,fx=2,fy=2,interpolation=cv2.INTER_CUBIC)
        img = cv2.detailEnhance(img,10,0.15)
    if mode in ['color','todo']:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        col = cv2.applyColorMap(gray, cv2.COLORMAP_PINK)
        img = cv2.addWeighted(img,0.6,col,0.4,0)
    return img

@app.route('/', methods=['GET','POST'])
def home():
    res = None
    if request.method == 'POST':
        f = request.files['file'].read()
        mode = request.form.get('mode','rayas')
        im = cv2.imdecode(np.frombuffer(f,np.uint8), cv2.IMREAD_COLOR)
        out = procesar(im, mode)
        _,b = cv2.imencode('.png', out)
        res = base64.b64encode(b).decode()
    return render_template_string(HTML, result=res) 
