import { productoBDOperation } from "./conexion.js"

async function modeloBySku(sku) {
  try {
    if (!sku || typeof sku !== "string") {
      return { message:"SKU inválido o vacío"};
    }

    const q1 = `SELECT * FROM fullShopifyProducts WHERE sku = ?`;
    const rest = await productoBDOperation(q1, sku);

    // Validar que exista un resultado
    if (!rest || rest.length === 0) {
      return { message: "No se encontró producto con ese SKU" };
    }

    const { width, height, rin, brand, model } = rest[0];

    // Validar que existan los datos necesarios
    if (!width || !height || !rin || !brand || !model) {
      return { message: "El producto no tiene todos los campos necesarios" };
    }

    // Crear el string del producto
    // Ejemplo '255/55/19 Pirelli Scorpion Verde'
    const bodyModelo = `${width}/${height}/${rin} ${brand} ${model}`;

    return {
      sku,
      bodyModelo
    };

  } catch (error) {
    console.error("Error en modeloBySku:", error);
    return { message: error.message };
  }
}

export {modeloBySku}


//console.log(await modeloBySku("PIR2323000"))
