# import requests
# from bs4 import BeautifulSoup

# def scrap_meli(query):
#     url = f"https://listado.mercadolibre.com.mx/{query.replace(' ', '-')}"

#     headers = {
#         "User-Agent": "Mozilla/5.0"
#     }

#     html = requests.get(url, headers=headers).text
#     soup = BeautifulSoup(html, "html.parser")

#     productos = []

#     items = soup.select(".ui-search-result__wrapper")
#     for item in items[:5]:  # top 5
#         titulo = item.select_one("h2").get_text(strip=True) if item.select_one("h2") else ""
#         precio = item.select_one(".andes-money-amount__fraction").get_text(strip=True) if item.select_one(".andes-money-amount__fraction") else ""
#         url = item.select_one("a")["href"] if item.select_one("a") else ""
#         thumbnail = item.select_one("img")["src"] if item.select_one("img") else ""

#         productos.append({
#             "titulo": titulo,
#             "precio": precio,
#             "url": url,
#             "thumbnail": thumbnail
#         })

#     return productos

# # Ejemplo de uso
# print(scrap_meli("185/65/R15 Goodyear Assurance 88T"))
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)
CORS(app)    

def scrap_meli(query):
    url = f"https://listado.mercadolibre.com.mx/{query.replace(' ', '-')}"
    headers = {"User-Agent": "Mozilla/5.0"}
    html = requests.get(url, headers=headers).text
    soup = BeautifulSoup(html, "html.parser")
    productos = []
    items = soup.select(".ui-search-result__wrapper")
    for item in items[:5]:  # top 5
        titulo = item.select_one("h2").get_text(strip=True) if item.select_one("h2") else ""
        precio = item.select_one(".andes-money-amount__fraction").get_text(strip=True) if item.select_one(".andes-money-amount__fraction") else ""
        url = item.select_one("a")["href"] if item.select_one("a") else ""
        thumbnail = item.select_one("img")["src"] if item.select_one("img") else ""
        productos.append({
            "titulo": titulo,
            "precio": precio,
            "url": url,
            "thumbnail": thumbnail
        })
    return productos

@app.route('/api/llantas', methods=['GET'])
def endpoint_llantas():
    query = request.args.get('q', '')
    productos = scrap_meli(query)
    return jsonify(productos)

if __name__ == "__main__":
    app.run(debug=True)
