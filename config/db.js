import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "bible_chat",
  connectionLimit: 10,
});
try {
  const connection = await pool.getConnection();
  console.log("Database connected successfully");
  connection.release();
} catch (error) {
  console.error("Database connection failed:", error.message);
}
export default pool;
