process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import axios from 'axios';
import * as cheerio from 'cheerio';
import dotenv from "dotenv";
import { HttpsProxyAgent } from 'https-proxy-agent';

dotenv.config();

async function scrapeML(query) {
  try {

    const url = `https://listado.mercadolibre.com.mx/${encodeURIComponent(query)}`;
    console.log("URL:", url);

    const proxyURL = `http://${process.env.BRIGHTDATA_USER}:${process.env.BRIGHTDATA_PASS}` +
                     `@${process.env.BRIGHTDATA_HOST}:${process.env.BRIGHTDATA_PORT}`;

    const agent = new HttpsProxyAgent(proxyURL);
    console.log("Proxy OK");

    const response = await axios.get(url, {
      httpsAgent: agent,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        "Accept-Language": "es-MX,es;q=0.9"
      },
      timeout: 30000
    });

    const $ = cheerio.load(response.data);

    let results = [];

    $('.ui-search-layout__item').each((i, el) => {
      const title = $(el).find('.ui-search-item__title').text().trim();
      const price = $(el).find('.andes-money-amount__fraction').first().text().trim();
      const link = $(el).find('a.ui-search-item__group__element').attr('href');

      results.push({ title, price, link });
    });

    return results;

  } catch (error) {
    console.error("ERROR:", error.message);
    return [];
  }
}

(async () => {
  const data = await scrapeML("205/55/R16 Goodyear Eagle Sport 2 91V");
  console.log(data);
})();
