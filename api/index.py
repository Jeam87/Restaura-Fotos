from flask import Flask
app = Flask(__name__)
@app.route('/', methods=['GET','POST'])
def home():
    return "Listo, ya jala - ahora pega el codigo completo" 
