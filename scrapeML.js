import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';

dotenv.config();

const BRIGHT_TOKEN = process.env.TOKEN;

// Detecta cantidad (2 llantas, kit de 2, etc.)
function detectarCantidad(texto) {

  const regexCantidad = [
    /(\d+)\s*llantas/,           // "2 llantas"
    /kit\s*con\s*(\d+)/,          // "kit con 2"
    /kit\s*de\s*(\d+)/,          // "kit de 2"
    /paquete\s*(\d+)/,           // "paquete 2"
    /\b(\d+)\s*pzs?\b/,          // "2 pzs"
    /\b(\d+)\s*x\s*\d+\b/,       // "2x2"
  ];

  for (const r of regexCantidad) {
    const match = texto.match(r);
    if (match) return parseInt(match[1]);
  }

  return 1; // Default: 1 llanta
}

async function scrapeML(query) {
  //console.log(query)
  const url = `https://listado.mercadolibre.com.mx/${query.replace(/ /g, '-')}`;
  
  const response = await fetch('https://api.brightdata.com/request', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${BRIGHT_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      zone: 'web_unlocker1',
      url,
      method: "GET",
      format: 'json'
    })
  });

  const json = await response.json();
  let html = json.body || "";
  if (!html) {
    console.log("No HTML recibido de BrightData");
    return [];
  }

  const $ = cheerio.load(html);

  // Traer resultados sin filtrar
  let resultados = $('.ui-search-result__wrapper').map((i, el) => {
    // Título
    let title =
      $(el).find(".ui-search-item__group__element > h2").text().trim() ||
      $(el).find(".ui-search-item__title").text().trim() ||
      $(el).find("h2").text().trim() ||
      $(el).find("a[title]").attr("title") ||
      $(el).find("img").attr("alt") ||
      "";

    //console.log("Titulo:", title);

    // Detectar estado (usado / nuevo)
    const estado = $(el).text().toLowerCase();

    //console.log("completo:", title + ' ' + estado);

    if (estado.includes("usado")) {
      //console.log("❌ Usado → descartado:", title);
      return null;
    }

    // Precio
    const priceText = $(el).find('.andes-money-amount__fraction').first().text().trim();
    const url = $(el).find('a').attr('href') || "";

    let price = parseFloat(priceText.replace(/,/g, "")) || 0;

    // Detectar cuántas llantas incluye
    const cantidad = detectarCantidad(title);

    let unitPrice = price;
    if (cantidad > 1) {
      unitPrice = price / cantidad;
      price = unitPrice;
    }

    return { title, price, cantidad, unitPrice, url };
  }).get();

  // Ordenar por precio unitario (menor a mayor)
  resultados.sort((a, b) => a.unitPrice - b.unitPrice);
  // console.log("este: ", resultados)
  // console.log(resultados.slice(0, 5))

  // Regresar top 5 más baratos
  return resultados.slice(0, 5);
}


export { scrapeML };
