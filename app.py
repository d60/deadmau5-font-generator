from flask import Flask, send_file
from pathlib import Path
app = Flask(__name__)


@app.route('/')
def index():
    return Path('index.html').read_text('utf-8')

@app.route('/fonts/<file>')
def font(file):
    return send_file(f'fonts/{file}')

app.run('0.0.0.0', 3333)