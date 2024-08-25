import mysql from "mysql2";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "mysql2024@ambika",
  database: "worldwise",
});

export default pool;
