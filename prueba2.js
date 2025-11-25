process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import axios from 'axios';
import * as cheerio from 'cheerio';
import { HttpsProxyAgent } from 'https-proxy-agent';
import dotenv from "dotenv";
dotenv.config();
const proxy = process.env.BRIGHTDATA_PROXY;

async function scrapeML(query) {
  try {
    const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(query)}`;
    console.log("URL:", url);

    const agent = new HttpsProxyAgent(proxy);
    console.log("Proxy OK");

    const response = await axios.get(url, {
      httpsAgent: agent,
     headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept-Language": "es-MX,es;q=0.9",
        "Accept": "text/html,application/xhtml+xml"
      }
    });

    const $ = cheerio.load(response.data);

    console.log("📌 Items:", $('.ui-search-layout__item').length);
    console.log("📌 Titles:", $('.ui-search-item__title').length);
    console.log("📌 Links:", $('a.ui-search-item__group__element').length);

    let results = [];

    $('.ui-search-layout__item').each((i, el) => {
      const title = $(el).find('.ui-search-item__title').text().trim();
      const price = $(el).find('.andes-money-amount__fraction').first().text().trim();
      const link = $(el).find('a.ui-search-item__group__element').attr('href');

      results.push({ title, price, link });
    });

    return results;

  } catch (err) {
    console.error('Error:', err.message);
    return [];
  }
}

(async () => {
  const data = await scrapeML("205/55/R16 Goodyear Eagle Sport 2 91V");
  console.log(data);
})();
