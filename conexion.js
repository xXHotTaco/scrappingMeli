import mysql2 from 'mysql2';
import * as dotenv from 'dotenv';
dotenv.config();

const con = mysql2.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.PRODUCTO_DB,
  connectTimeout: 10000
});

async function productoBDOperation(sql, params = []) {
  return new Promise((resolve, reject) => {
    con.query(sql, params, (err, result) => {
      if (err) {
        console.error("Error en la consulta:", err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

export {productoBDOperation}