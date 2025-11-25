from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import time

app = Flask(__name__)
CORS(app)

def extract_title_from_url(url):
    try:
        parsed = urlparse(url)
        domain = parsed.netloc
        path = parsed.path.lstrip("/")
        splitted = path.split("/")
        if "www.mercadolibre.com.mx" in domain:
            if len(splitted) > 0 and splitted[0]:
                return splitted[0].replace("-", " ")
            else:
                return path.replace("/", "-").replace("-", " ")
        else:
            # Si es de click1, ad, etc. devuelve "Publicidad" o ""
            return "" 
    except Exception as e:
        print("Error extrayendo título de url:", e)
        return ""

def scrap_meli(query):
    time.sleep(2)  # Delay anti-baneo
    url = f"https://listado.mercadolibre.com.mx/{query.replace(' ', '-')}"
    headers = {"User-Agent": "Mozilla/5.0"}
    html = requests.get(url, headers=headers).text
    soup = BeautifulSoup(html, "html.parser")
    productos = []
    items = soup.select(".ui-search-result__wrapper")
    for item in items[:5]:  # Top 5
        titulo = item.select_one("h2").get_text(strip=True) if item.select_one("h2") else ""
        url_producto = item.select_one("a")["href"] if item.select_one("a") else ""
        print(url_producto)
        if not titulo and url_producto:
            titulo = extract_title_from_url(url_producto)
        precio = item.select_one(".andes-money-amount__fraction").get_text(strip=True) if item.select_one(".andes-money-amount__fraction") else ""
        thumbnail = item.select_one("img")["src"] if item.select_one("img") else ""
        productos.append({
            "titulo": titulo,
            "precio": precio,
            "url": url_producto,
            "thumbnail": thumbnail
        })

       
    return productos

@app.route('/api/llantas', methods=['GET'])
def endpoint_llantas():
    query = request.args.get('q', '')
    node_api_url = f"http://localhost:3001/api/producto/{query}"
    respuesta = requests.get(node_api_url)

    if respuesta.status_code == 200:
        resultado = respuesta.json()
        body_modelo = resultado.get("bodyModelo", "")
        if not body_modelo:
            return jsonify({"error": "No hay bodyModelo para buscar en MELI"}), 404
        productos_meli = scrap_meli(body_modelo)
        return jsonify({
            "sku": resultado.get("sku"),
            "bodyModelo": body_modelo,
            "productos_meli": productos_meli
        })
    else:
        return jsonify({"error": "No se pudo obtener el producto"}), 500

if __name__ == "__main__":
    app.run(debug=True)



