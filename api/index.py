from flask import Flask, request, render_template_string
import cv2
import numpy as np
import base64

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
<h2>✨ Mejora Fotos Pro V2 - Todo</h2>
<p>Sube foto rayada / manchada</p>
<form method="post" enctype="multipart/form-data">
<input type="file" name="file" required>
<button type="submit">RESTAURAR AHORA - Quitar Rayas</button>
</form>
{% if result %}
<h3>Resultado HD Limpio</h3>
<img src="data:image/png;base64,{{result}}">
<br><a href="data:image/png;base64,{{result}}" download="foto-restaurada-hd.png"><button>Descargar HD</button></a>
{% endif %}
</div></body></html>
"""

def restaurar_pro_v2(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Detectar rayas blancas con TopHat (detecta todo lo brillante fino)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5,5))
    tophat = cv2.morphologyEx(gray, cv2.MORPH_TOPHAT, kernel)
    _, mask = cv2.threshold(tophat, 25, 255, cv2.THRESH_BINARY)
    
    # También detectar grietas por contraste
    kernel2 = cv2.getStructuringElement(cv2.MORPH_RECT, (3,3))
    blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, kernel2)
    _, mask2 = cv2.threshold(blackhat, 15, 255, cv2.THRESH_BINARY)
    
    mask_full = cv2.bitwise_or(mask, mask2)
    # Engordar para cubrir grietas gruesas como las de tu foto
    mask_full = cv2.dilate(mask_full, np.ones((4,4),np.uint8), iterations=2)
    mask_full = cv2.medianBlur(mask_full, 5)

    # Inpainting en 2 pasadas para quitar todo
    tmp = cv2.inpaint(img, mask_full, 5, cv2.INPAINT_TELEA)
    final = cv2.inpaint(tmp, mask_full, 5, cv2.INPAINT_NS)
    final = cv2.detailEnhance(final, sigma_s=12, sigma_r=0.15)
    return final

@app.route('/', methods=['GET','POST'])
def home():
    result = None
    if request.method == 'POST':
        file = request.files['file'].read()
        nparr = np.frombuffer(file, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        out = restaurar_pro_v2(img)
        _, buffer = cv2.imencode('.png', out)
        result = base64.b64encode(buffer).decode('utf-8')
    return render_template_string(HTML, result=result)
