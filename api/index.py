from flask import Flask, request, render_template_string
import cv2
import numpy as np
import base64

app = Flask(__name__)

HTML = """
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mejora Fotos Pro</title>
<style>
body{background:#111;color:#fff;font-family:sans-serif;text-align:center;padding:20px}
.card{background:#222;padding:20px;border-radius:15px;max-width:500px;margin:auto}
button{background:#00ff88;padding:15px;border:none;border-radius:10px;font-size:18px;width:100%;margin-top:15px;font-weight:bold}
img{max-width:100%;border-radius:10px;margin-top:15px}
</style>
</head>
<body>
<div class="card">
<h2>✨ Mejora Fotos Pro</h2>
<p>Sube foto rayada / manchada / vieja</p>
<form method="post" enctype="multipart/form-data">
<input type="file" name="file" required>
<button type="submit">RESTAURAR AHORA - Quitar Rayas</button>
</form>
{% if result %}
<h3>Resultado HD</h3>
<img src="data:image/png;base64,{{result}}">
<br><a href="data:image/png;base64,{{result}}" download="foto-restaurada-hd.png"><button>Descargar HD</button></a>
{% endif %}
</div>
</body>
</html>
"""

def restaurar_pro(img):
    # 1. Detectar rayas blancas y marcas
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, mask_white = cv2.threshold(gray, 220, 255, cv2.THRESH_BINARY)
    # Detectar rayas finas
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1,15))
    mask_rayas = cv2.morphologyEx(mask_white, cv2.MORPH_OPEN, kernel)
    kernel2 = cv2.getStructuringElement(cv2.MORPH_RECT, (15,1))
    mask_rayas2 = cv2.morphologyEx(mask_white, cv2.MORPH_OPEN, kernel2)
    mask = cv2.bitwise_or(mask_rayas, mask_rayas2)
    # Engordar máscara para cubrir bien
    mask = cv2.dilate(mask, np.ones((3,3),np.uint8), iterations=2)
    # 2. Inpainting PRO (quita todo)
    restaurada = cv2.inpaint(img, mask, 7, cv2.INPAINT_TELEA)
    # 3. Mejora de nitidez y color
    restaurada = cv2.detailEnhance(restaurada, sigma_s=10, sigma_r=0.15)
    return restaurada

@app.route('/', methods=['GET','POST'])
def home():
    result = None
    if request.method == 'POST':
        file = request.files['file'].read()
        nparr = np.frombuffer(file, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        out = restaurar_pro(img)
        _, buffer = cv2.imencode('.png', out)
        result = base64.b64encode(buffer).decode('utf-8')
    return render_template_string(HTML, result=result)

# Para Vercel
if __name__ == '__main__':
    app.run()
