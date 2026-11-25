import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'helpdesk_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

export async function query(sql, params = []) {
  const [result] = await pool.query(sql, params);
  return result;
}

export async function checkConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

export async function closePool() {
  await pool.end();
}
