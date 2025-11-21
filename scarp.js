import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

async function scrapMeli(query) {
  const url = `https://listado.mercadolibre.com.mx/${query.replace(/ /g, '-')}`;
  const headers = {
    'User-Agent': 'Mozilla/5.0'
  };
  const response = await fetch(url, { headers });
  const html = await response.text();
  const $ = cheerio.load(html);

  const productos = [];
  
  // Ajusta el selector al contenedor de cada publicación en el listado
  $('.ui-search-result__wrapper').slice(0, 5).each((i, elem) => {
    const titulo = $(elem).find('h2.ui-search-item__title').text().trim() || 
                   $(elem).find('h2').text().trim();
    const precio = $(elem).find('.andes-money-amount__fraction').first().text().trim();
    const itemUrl = $(elem).find('a').first().attr('href');
    const thumbnail = $(elem).find('img').first().attr('src');

    productos.push({
      titulo,
      precio,
      url: itemUrl,
      thumbnail
    });
  });

  return productos;
}

// Ejemplo de uso:
scrapMeli("185/65/R15 Goodyear Assurance 88T").then(console.log);
