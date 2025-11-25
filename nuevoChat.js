import OpenAI from "openai";
import fetch from "node-fetch";
import * as dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.TOKENCHAT
});

async function scrapeML(query) {
  const apiURL = `https://api.mercadolibre.com/sites/MLM/search?q=${encodeURIComponent(query)}`;

  // 1️⃣ Llamar a la API oficial de Mercado Libre
  const apiRes = await fetch(apiURL);
  const apiData = await apiRes.json();

  // 2️⃣ Si NO hay datos → no usar ChatGPT
  if (!apiData.results || apiData.results.length === 0) {
    console.log("❌ Mercado Libre no regresó datos, NO se usará ChatGPT.");
    return [];
  }

  // 3️⃣ Si HAY datos → usar ChatGPT para procesarlos
  console.log("✔ Mercado Libre regresó datos. Ahora sí usaré ChatGPT.");

  const productos = apiData.results.map(item => ({
    titulo: item.title,
    precio: item.price,
    url: item.permalink
  }));

  // 4️⃣ Mandar los productos a ChatGPT (si quieres que haga más cosas)
  const response = await client.chat.completions.create({
    model: "gpt-4.1-mini",
    messages: [
      {
        role: "system",
        content: "Recibe un array de productos y regresa un JSON limpio con {titulo, precio, url}."
      },
      {
        role: "user",
        content: JSON.stringify(productos)
      }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}

// Ejemplo
scrapeML("205/55/R16 Goodyear Eagle Sport 2 91V").then(data => {
  console.log(data);
});
