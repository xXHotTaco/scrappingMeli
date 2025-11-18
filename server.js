import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());


app.post("/api/huggingface", async (req, res) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2", // Puedes cambiar el modelo aquí
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "" // ← Pon aquí tu token real
        },
        body: JSON.stringify(req.body)
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.listen(3000, () => console.log("Servidor listo en http://localhost:3000"));