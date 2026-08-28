from flask import Flask, request, render_template_string
import cv2, numpy as np, base64
app = Flask(__name__)

HTML = """
<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mejora Fotos Pro</title>
<style>body{background:#111;color:#fff;font-family:sans-serif;text-align:center;padding:20px}
.card{background:#222;padding:20px;border-radius:15px;max-width:500px;margin:auto}
button{background:#00ff88;padding:15px;border:none;border-radius:10px;font-size:18px;width:100%;margin-top:15px;font-weight:bold}
img{max-width:100%;border-radius:10px;margin-top:15px}</style>
</head><body><div class="card">
<h2>✨ Mejora Fotos Pro V3</h2>
<form method="post" enctype="multipart/form-data">
<input type="file" name="file" required>
<button type="submit">RESTAURAR AHORA</button>
</form>
{% if result %}
<h3>Resultado HD Limpio</h3>
<img src="data:image/png;base64,{{result}}">
<br><a href="data:image/png;base64,{{result}}" download="restaurada.png"><button>Descargar HD</button></a>
{% endif %}
</div></body></html>
"""

def restaurar_v3(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Suaviza un poco para no confundir textura con raya
    gray_blur = cv2.medianBlur(gray, 3)
    # Solo lo MUY blanco = grieta real
    _, mask = cv2.threshold(gray_blur, 205, 255, cv2.THRESH_BINARY)
    # Limpiar puntitos y quedarse solo con lineas
    kernel = np.ones((2,2), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    # Engordar 1 pixel nada mas para tapar la grieta completa
    mask = cv2.dilate(mask, kernel, iterations=1)
    
    # Inpaint suave
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
