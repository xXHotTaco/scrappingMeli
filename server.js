import OpenAI from "openai";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.TOKENCHAT
});

// 🔍 1. Buscar productos reales en Mercado Libre
async function buscarEnMeli(query) {
  const url = `https://listado.mercadolibre.com.mx/${query.replace(' ', '-')}`;

  const response = await fetch(url);
  console.log(response)
  const data = await response.json();

  return data.results.map(item => ({
    titulo: item.title,
    sku: item.id,
    precio: item.price,
    url: item.permalink,
    thumbnail: item.thumbnail
  }));
}

// 🤖 2. Limpiar y convertir a JSON bonito con GPT
async function procesarConGPT(productos, query) {
  const prompt = `
Tengo estos productos obtenidos desde Mercado Libre México sobre "${query}":

${JSON.stringify(productos, null, 2)}

Devuélveme un JSON FINAL con la siguiente estructura:

{
  "busqueda": "...",
  "productos": [
    {
      "titulo": "",
      "sku": "",
      "precio": "",
      "url": "",
      "descripcion": "",
      "thumbnail": ""
    }
  ]
}

La descripción debe ser de máximo 3 líneas, clara y profesional.
No inventes datos nuevos excepto la descripción.
  `;

  const respuesta = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "user", content: prompt }]
  });

  return respuesta.choices[0].message.content;
}

// 🚀 3. Función principal
async function obtenerProductos(query) {
  const productos = await buscarEnMeli(query);
  console.log(productos)
  //const jsonFinal = await procesarConGPT(productos, query);
  return jsonFinal;
}

// EJEMPLO:
console.log(await obtenerProductos("185/65/R15 Goodyear Assurance 88T"));
