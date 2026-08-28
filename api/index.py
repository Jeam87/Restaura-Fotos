from flask import Flask, request, render_template_string
from PIL import Image
import base64, io
app = Flask(__name__)
HTML = """<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><title>Restaura Fotos</title><style>body{background:#111;color:#fff;font-family:sans-serif;text-align:center;padding:15px}.card{background:#222;padding:20px;border-radius:18px;max-width:480px;margin:auto}button{background:#00ff88;padding:14px;width:100%;border:none;border-radius:12px;font-weight:bold;margin-top:12px;color:#000}img{max-width:100%;margin-top:12px;border-radius:12px}input,select{width:100%;padding:12px;margin-top:10px;background:#333;color:#fff;border:none;border-radius:10px;box-sizing:border-box}#loader{display:none;margin-top:15px;background:#333;border-radius:10px;padding:4px}#bar{height:28px;width:0%;background:#00ff88;border-radius:8px;color:#000;font-weight:bold;line-height:28px;transition:width 0.3s}</style></head><body><div class="card"><h2>Restaura Fotos Pro</h2><form id="form" method="post" enctype="multipart/form-data"><input type="file" name="file" required accept="image/*"><select name="mode"><option value="hd">Mejorar a HD 2x</option><option value="todo">TODO Pro</option></select><button id="btn">RESTAURAR</button></form><div id="loader"><div id="bar">0%</div><div id="txt">Iniciando...</div></div>{% if result %}<h3 style="color:#00ff88">Listo!</h3><img src="data:image/png;base64,{{result}}"><br><a href="data:image/png;base64,{{result}}" download="foto.png"><button>Descargar</button></a>{% endif %}</div><script>let f=document.getElementById('form'),l=document.getElementById('loader'),b=document.getElementById('bar'),t=document.getElementById('txt'),btn=document.getElementById('btn');f.addEventListener('submit',e=>{e.preventDefault();l.style.display='block';btn.disabled=true;let p=0;let iv=setInterval(()=>{p+=10;if(p>90)p=90;b.style.width=p+'%';b.innerText=p+'%';t.innerText=p+'% completado';},300);fetch('/',{method:'POST',body:new FormData(f)}).then(r=>r.text()).then(h=>{clearInterval(iv);b.style.width='100%';b.innerText='100%';setTimeout(()=>{document.open();document.write(h);document.close()},500)})})</script></body></html>"""
@app.route('/', methods=['GET','POST'])
def home():
    r=None
    if request.method=='POST':
        file=request.files['file'].read()
        im=Image.open(io.BytesIO(file)).convert('RGB')
        if max(im.size)>1000: im.thumbnail((1000,1000))
        im=im.resize((im.size[0]*2, im.size[1]*2), Image.LANCZOS)
        buf=io.BytesIO(); im.save(buf, format='PNG')
        r=base64.b64encode(buf.getvalue()).decode()
    return render_template_string(HTML, result=r)
