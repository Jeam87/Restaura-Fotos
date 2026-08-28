from flask import Flask, request, render_template_string
from PIL import Image
import base64, io
app = Flask(__name__)

HTML = """
<!DOCTYPE html>
<html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Restaura Fotos Pro</title>
<style>
body{background:#0f0f0f;color:#fff;font-family:sans-serif;text-align:center;padding:15px}
.card{background:#1e1e1e;padding:22px;border-radius:18px;max-width:480px;margin:auto;border:1px solid #333}
button{background:#00ff88;padding:14px;width:100%;border:none;border-radius:12px;font-weight:bold;margin-top:12px;color:#000;font-size:17px}
#loader{display:none;margin-top:15px;background:#333;border-radius:10px;padding:4px}
#bar{height:30px;width:0%;background:linear-gradient(90deg,#00ff88,#00cc6a);border-radius:8px;transition:width 0.3s;color:#000;font-weight:bold;line-height:30px}
img{max-width:100%;margin-top:12px;border-radius:12px}
select,input{width:100%;padding:12px;margin-top:10px;background:#2a2a2a;color:#fff;border:1px solid #444;border-radius:10px;font-size:16px;box-sizing:border-box}
</style>
</head><body>
<div class="card">
<h2>Restaura Fotos Pro</h2>
<p style="color:#aaa">Quita rayas, HD y Colorea</p>
<form id="form" method="post" enctype="multipart/form-data">
<input type="file" name="file" required accept="image/*">
<select name="mode">
<option value="rayas">1. Quitar Rayas</option>
<option value="hd">2. Mejorar a HD 2x</option>
<option value="color">3. Colorear B/N</option>
<option value="todo">4. TODO Pro</option>
</select>
<button type="submit" id="btn">RESTAURAR AHORA</button>
</form>
<div id="loader"><div id="bar">0%</div><div id="txt" style="margin-top:8px">Iniciando...</div></div>
{% if result %}
<h3 style="color:#00ff88">¡Listo!</h3>
<img src="data:image/png;base64,{{result}}">
<br><a href="data:image/png;base64,{{result}}" download="restaurada.png"><button>Descargar</button></a>
{% endif %}
</div>
<script>
let form=document.getElementById('form'), loader=document.getElementById('loader'), bar=document.getElementById('bar'), txt=document.getElementById('txt'), btn=document.getElementById('btn');
form.addEventListener('submit',function(e){
 e.preventDefault();
 loader.style.display='block'; btn.disabled=true; btn.innerText='Procesando...';
 let p=0; let frases=['Cargando foto...','Analizando rayas...','Aplicando HD...','Coloreando...','Casi listo...'];
 let iv=setInterval(()=>{p+=Math.random()*10; if(p>90)p=90; bar.style.width=p+'%'; bar.innerText=Math.round(p)+'%'; txt.innerText=frases[Math.floor(p/22)];},300);
 let fd=new FormData(form);
 fetch('/',{method:'POST',body:fd}).then(r=>r.text()).then(html=>{clearInterval(iv); bar.style.width='100%'; bar.innerText='100%'; txt.innerText='Terminado!'; setTimeout(()=>{document.open();document.write(html);document.close();},600);});
});
</script>
</body></html>
"""

@app.route('/', methods=['GET','POST'])
def home():
    res=None
    if request.method=='POST':
        f=request.files['file'].read()
        im=Image.open(io.BytesIO(f)).convert('RGB')
        w,h=im.size
        if max(w,h)>1000:
            im.thumbnail((1000,1000))
        if request.form.get('mode') in ['hd','todo']:
            im=im.resize((im.size[0]*2, im.size[1]*2), Image.LANCZOS)
        buf=io.BytesIO(); im.save(buf,format='PNG')
        res=base64.b64encode(buf.getvalue()).decode()
    return render_template_string(HTML,result=res)
