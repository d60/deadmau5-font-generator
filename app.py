from flask import Flask, send_file
from pathlib import Path
app = Flask(__name__)


@app.route('/')
def index():
    return Path('index.html').read_text('utf-8')

@app.route('/index.js')
def indexjs():
    return send_file('index.js')
@app.route('/renderer.js')
def rendererjs():
    return send_file('renderer.js')
@app.route('/style.css')
def css():
    return send_file('style.css')

@app.route('/fonts/<file>')
def font(file):
    return send_file(f'fonts/{file}')

app.run('0.0.0.0', 3333)