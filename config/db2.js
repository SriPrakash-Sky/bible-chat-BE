import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db2 = mysql.createPool({
  host: process.env.DB_HOST2,
  user: process.env.DB_USER2,
  password: process.env.DB_PASS2,
  database: process.env.DB_NAME2,
  connectionLimit: 10,
});

try {
  const connection = await db2.getConnection();
  console.log("Secondary Database Connected");
  connection.release();
} catch (err) {
  console.log("Secondary Database Error:", err.message);
}

export default db2;
