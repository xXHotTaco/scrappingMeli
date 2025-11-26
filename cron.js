import { leerSkus, guardarCSV } from "./procesarCsv.js";
import { modeloBySku } from "./producto.js";
import { scrapeML } from "./scrapeML.js";

import { performance } from "perf_hooks";

export async function ejecutarProceso() {
  const start = performance.now();

  const skus = leerSkus("./skus.csv");

  console.log("Procesando SKUs en 10 hilos...");

  let resultadosFinales = [];

  // Tamaño del pool
  const CONCURRENCY = 10;
  let index = 0;

  // Función worker
  async function worker() {
    while (index < skus.length) {
      const sku = skus[index++];
      console.log("Va este sku:", sku);

      let query = await modeloBySku(sku);
      let modelo = query?.bodyModelo;

      if (!modelo) continue;

      const productos = await scrapeML(modelo);

      if (!productos || productos.length === 0) {
        console.log(`⚠️ No se encontraron productos para ${modelo}`);
        continue;
      }

      productos.forEach((p) => {
        resultadosFinales.push({
          sku,
          title: p.title,
          price: p.price,
          url: p.url,
        });
      });
    }
  }

  // Crear 10 hilos (promesas)
  const pool = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    pool.push(worker());
  }

  await Promise.all(pool);

  // Guardar resultados
  guardarCSV("./resultado2.csv", resultadosFinales);

  const end = performance.now();
  const seconds = ((end - start) / 1000).toFixed(2);
  console.log(`⏱️ Tiempo total: ${seconds} segundos`);
}

console.log(await ejecutarProceso());
