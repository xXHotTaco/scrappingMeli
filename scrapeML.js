import fetch from "node-fetch";
import * as cheerio from "cheerio";
import dotenv from "dotenv";

dotenv.config();

const BRIGHT_TOKEN = process.env.TOKEN;

// Detecta cantidad (2 llantas, kit de 2, etc.)
function detectarCantidad(texto) {
  const regexCantidad = [
    /(\d+)\s*llantas/,
    /kit\s*con\s*(\d+)/,
    /kit\s*de\s*(\d+)/,
    /paquete\s*(\d+)/,
    /\b(\d+)\s*pzs?\b/,
    /\b(\d+)\s*x\s*\d+\b/,
  ];

  for (const r of regexCantidad) {
    const match = texto.match(r);
    if (match) return parseInt(match[1]);
  }

  return 1;
}

async function scrapeML(query) {
  console.log(query)
  query += " 1 pieza";
  const url = `https://listado.mercadolibre.com.mx/${query.replace(/ /g, "-")}`;
  console.log(url)

  const response = await fetch("https://api.brightdata.com/request", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${BRIGHT_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      zone: "web_unlocker1",
      url,
      method: "GET",
      format: "json",
    }),
  });

  const json = await response.json();
  let html = json.body || "";
  if (!html) {
    console.log("No HTML recibido de BrightData");
    return [];
  }

  const $ = cheerio.load(html);

  let resultados = $(".ui-search-result__wrapper")
    .map((i, el) => {
      let title =
        $(el).find(".ui-search-item__group__element > h2").text().trim() ||
        $(el).find(".ui-search-item__title").text().trim() ||
        $(el).find("h2").text().trim() ||
        $(el).find("a[title]").attr("title") ||
        $(el).find("img").attr("alt") ||
        "";

      const estado = $(el).text().toLowerCase();
      if (estado.includes("usado")) return null;

      const priceText = $(el)
        .find(".andes-money-amount__fraction")
        .first()
        .text()
        .trim();
      const url = $(el).find("a").attr("href") || "";

      let price = parseFloat(priceText.replace(/,/g, "")) || 0;

      const cantidad = detectarCantidad(title);

      let unitPrice = price;
      if (cantidad > 1) {
        unitPrice = price / cantidad;
        price = unitPrice;
      }

      return { title, price, cantidad, unitPrice, url };
    })
    .get();

  // Ordenar por precio unitario
  resultados.sort((a, b) => a.unitPrice - b.unitPrice);

  // Top 5 baratos
  const top5 = resultados.slice(0, 5);

  // Más caro (último de la lista)
  const masCaro = resultados[resultados.length - 1] || null;

  // Regresar ambos
  return {
    top5,
    masCaro,
  };
}


export { scrapeML };
