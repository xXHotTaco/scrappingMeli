import express from "express";
import { modeloBySku } from "./producto.js";

const app = express();
app.use(express.json());

app.get("/api/producto/:sku", async (req, res) => {
  const sku = req.params.sku;
  const resultado = await modeloBySku(sku);
  res.json(resultado);
});

app.listen(3001, () => {
  console.log("Node API listening on port 3001");
});