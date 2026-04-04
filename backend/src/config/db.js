const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

if (process.env.MYSQL_URL) {
  // Railway ka MYSQL_URL use karo — SSL safely add karo
  const url = new URL(process.env.MYSQL_URL);
  url.searchParams.set('ssl', JSON.stringify({ rejectUnauthorized: false }));
  pool = mysql.createPool(url.toString());
} else {
  // Local development ke liye
  pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

module.exports = pool;