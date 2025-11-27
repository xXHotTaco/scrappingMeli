# 🛒 scrappingMeli
### Extrae precios, cantidad y costo unitario desde Mercado Libre usando BrightData

Este proyecto permite obtener los **5 productos más baratos** de Mercado Libre México para cualquier búsqueda, calculando incluso el **precio unitario** cuando el título indica paquetes como “2 llantas”, “kit de 4”, “paquete 2 pzs”, etc.

Usa:
- 🌐 BrightData Web Unlocker para obtener HTML sin bloqueos  
- 🧼 Cheerio para parsear el DOM  
- 📦 Node.js + ECMAScript Modules

---

## 🚀 Características principales

✔ Obtiene resultados desde Mercado Libre usando BrightData  
✔ Detecta automáticamente cantidades en títulos (2 pzs, kit de 4, etc.)  
✔ Calcula **precio por unidad**  
✔ Devuelve el **top 5 más barato ordenado por precio unitario**  
✔ Maneja títulos habituales de Mercado Libre  
✔ Operación simple: `scrapeML("pc gamer")`

---

## ⭐ Autor

xXHotTaco
