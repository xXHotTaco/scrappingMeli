import playwright from "playwright";
import dotenv from "dotenv";
dotenv.config();

console.log("WEBSOCKET:", process.env.BRIGHTDATA_PROXY);


async function scrapeML(query) {
  // Conexión al navegador remoto de BrightData
  const browser = await playwright.chromium.connectOverCDP(
    `wss://${process.env.BRIGHTDATA_PROXY}`
  );

  const context = await browser.newContext();
  const page = await context.newPage();

  const url =
    "https://listado.mercadolibre.com.mx/" + encodeURIComponent(query);

  console.log("➡️ Navegando:", url);

  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Aceptar cookies
  try {
    await page.click('[data-testid="action:understood-button"]', {
      timeout: 3000,
    });
  } catch {}

  // Esperar productos
  await page.waitForSelector(".ui-search-layout__item");

  const items = await page.$$eval(".ui-search-layout__item", (nodes) =>
    nodes.slice(0, 5).map((node) => ({
      titulo:
        node.querySelector(".ui-search-item__title")?.innerText.trim() || null,
      precio:
        node
          .querySelector(".andes-money-amount__fraction")
          ?.innerText.trim()
          .replace(/\./g, "") || null,
      url: node.querySelector("a.ui-search-link")?.href || null,
    }))
  );

  await browser.close();
  return items;
}

(async () => {
  const data = await scrapeML("205/55/R16 Goodyear Eagle Sport 2 91V");
  console.log(JSON.stringify(data, null, 2));
})();
