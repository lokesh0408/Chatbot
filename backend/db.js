// const mysql = require("mysql2");
// require("dotenv").config();

// // Create a connection pool
// const pool = mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true, // Wait for a connection before creating a new one
//   connectionLimit: 10, // Maximum number of connections allowed in the pool
//   queueLimit: 0, // Maximum number of queued connections allowed in the pool before creating a new connection pool
// });

// module.exports = pool.promise();

const { Pool } = require("pg");
require("dotenv").config();

// Create a connection pool
const pool = new Pool({
  host: process.env.DB_HOST, // PostgreSQL host
  user: process.env.DB_USER, // PostgreSQL username
  password: process.env.DB_PASSWORD, // PostgreSQL password
  database: process.env.DB_NAME, // PostgreSQL database name
  port: process.env.DB_PORT, // PostgreSQL port
});

module.exports = pool;
