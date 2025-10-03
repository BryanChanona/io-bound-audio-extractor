import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

class Database {
  static instance;

  constructor() {
    if (Database.instance) return Database.instance;

    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME || 'audius_downloads',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    Database.instance = this;
  }

  async getConnection() {
    return this.pool.getConnection();
  }

  async query(sql, params) {
    const conn = await this.getConnection();
    try {
      const [results] = await conn.query(sql, params);
      return results;
    } finally {
      conn.release();
    }
  }
}

export const db = new Database();
