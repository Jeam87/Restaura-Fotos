from flask import Flask, request, render_template_string
from PIL import Image, ImageEnhance, ImageOps
import base64, io
app = Flask(__name__)
HTML = """<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Restaura Fotos</title><style>body{background:#111;color:#fff;font-family:sans-serif;text-align:center;padding:15px}.card{background:#222;padding:20px;border-radius:18px;max-width:480px;margin:auto}button{background:#00ff88;padding:14px;width:100%;border:none;border-radius:12px;font-weight:bold;margin-top:12px;color:#000}img{max-width:100%;margin-top:12px;border-radius:12px}input,select{width:100%;padding:12px;margin-top:10px;background:#333;color:#fff;border:none;border-radius:10px;box-sizing:border-box}#loader{display:none;margin-top:15px;background:#333;border-radius:10px;padding:4px}#bar{height:28px;width:0%;background:#00ff88;border-radius:8px;color:#000;font-weight:bold;line-height:28px;transition:width 0.3s}.comp{display:flex;gap:8px}.comp div{flex:1}</style></head><body><div class="card"><h2>Restaura Fotos Pro</h2><form id="form" method="post" enctype="multipart/form-data"><input type="file" name="file" required accept="image/*"><select name="mode"><option value="todo">TODO PRO - Color + Nitidez + HD</option><option value="hd">Solo HD 2x</option></select><button id="btn">RESTAURAR AHORA</button></form><div id="loader"><div id="bar">0%</div><div id="txt">Procesando...</div></div>{% if result %}<h3 style="color:#00ff88">Antes / Después</h3><div class="comp"><div><p>Antes</p><img src="data:image/png;base64,{{original}}"></div><div><p>Después</p><img src="data:image/png;base64,{{result}}"></div></div><a href="data:image/png;base64,{{result}}" download="foto_restaurada_HD.png"><button>DESCARGAR HD</button></a>{% endif %}</div><script>let f=document.getElementById('form'),l=document.getElementById('loader'),b=document.getElementById('bar'),t=document.getElementById('txt'),btn=document.getElementById('btn');f.addEventListener('submit',e=>{e.preventDefault();l.style.display='block';btn.disabled=true;btn.innerText='RESTAURANDO...';let p=0;let iv=setInterval(()=>{p+=Math.random()*12;if(p>90)p=90;b.style.width=p+'%';b.innerText=Math.round(p)+'%';},250);fetch('/',{method:'POST',body:new FormData(f)}).then(r=>r.text()).then(h=>{clearInterval(iv);b.style.width='100%';b.innerText='100%';setTimeout(()=>{document.open();document.write(h);document.close()},400)})})</script></body></html>"""
@app.route('/', methods=['GET','POST'])
def home():
    r, orig = None, None
    if request.method=='POST':
        file_bytes=request.files['file'].read()
        im=Image.open(io.BytesIO(file_bytes)).convert('RGB')
        # Guardar original para comparar
        buf0=io.BytesIO(); im.save(buf0, format='PNG'); orig=base64.b64encode(buf0.getvalue()).decode()

        # 1. Auto-contraste
        im = ImageOps.autocontrast(im, cutoff=2)
        # 2. Color mas vivo
        im = ImageEnhance.Color(im).enhance(1.4)
        # 3. Nitidez
        im = ImageEnhance.Sharpness(im).enhance(2.0)
        # 4. Brillo ligero
        im = ImageEnhance.Brightness(im).enhance(1.05)
        # 5. HD 2x
        if max(im.size) > 1200: im.thumbnail((1200,1200))
        im = im.resize((im.size[0]*2, im.size[1]*2), Image.LANCZOS)

        buf=io.BytesIO(); im.save(buf, format='PNG', quality=95)
        r=base64.b64encode(buf.getvalue()).decode()
    return render_template_string(HTML, result=r, original=orig)
