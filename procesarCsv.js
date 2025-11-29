import fs from "fs";

function leerSkus(ruta) {
  const raw = fs.readFileSync(ruta, "utf8");

  return raw
    .split("\n")              // separar por líneas
    .slice(1)                 // quitar la primera línea "sku"
    .map(l => l.replace(",", "").trim()) // quitar comas y espacios
    .filter(l => l.length > 0);          // eliminar líneas vacías
}

function guardarCSV(ruta, datos) {
  const headers = "sku,title,price,url,tipo\n";

  const sanitize = (text) =>
    String(text)
      .replace(/"/g, '""'); // CSV escape

  const lineas = datos.map(d =>
    `"${sanitize(d.sku)}","${sanitize(d.title)}","${sanitize(d.price)}","${sanitize(d.url)}","${sanitize(d.tipo || "")}"`
  );

  fs.writeFileSync(ruta, headers + lineas.join("\n"), "utf8");
}

// const skus = leerSKUs("./skus.csv");
// console.log(skus);

export {leerSkus, guardarCSV}