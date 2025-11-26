import fetch from 'node-fetch';
import * as cheerio from 'cheerio';
import dotenv from 'dotenv';
import { modeloBySku } from './producto.js';

dotenv.config();

const BRIGHT_TOKEN = process.env.TOKEN;

async function scrapeML(query) {
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

  // Buscar los productos
  return $('.ui-search-result__wrapper').slice(0, 5).map((i, el) => {
    // Intenta diferentes selectores para el título
    let title =
      $(el).find('.ui-search-item__title').text().trim() ||
      $(el).find('.ui-search-item__group__element > h2').text().trim() ||
      $(el).find('h2').text().trim() ||
      $(el).find('a[title]').attr('title') ||
      $(el).find('img').attr('alt') || "";

    const price = $(el).find('.andes-money-amount__fraction').first().text().trim() || "";
    const url = $(el).find('a').attr('href') || "";

    return { title, price, url };
  }).get();
}


export {scrapeML}



// const queries = [
//     "185/65/R15 Goodyear Assurance",
//     "205/55/R16 Goodyear Eagle Sport 2",
//     "195/55/R16 Goodyear Eagle Sport 2",
//     "205/55/R16 Dunlop Sport Bluresponse",
//     "185/60/R15 Kumho Ecowing Es31"
// ];


// (async () => {
//   let sku = "PIR2323000"
//   const result = await modeloBySku(sku)
//   let modelo = result.bodyModelo
//   console.log(modelo)
//   const data = await scrapeML(modelo);
//   console.log(data);
// })();
// (async () => {
//   const results = await Promise.all(queries.map(q => scrapeML(q)));

//   results.forEach((products, idx) => {
//     console.log(`\n========== Resultados para: ${queries[idx]} ==========\n`);
//     products.forEach((prod, i) => console.log(`${i + 1}. ${prod.title}\n   ${prod.price}   ${prod.url}\n`));
//   });
// })();



