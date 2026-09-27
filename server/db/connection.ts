import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password?: string;
  database: string;
}

export function getDbConfig(): DbConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
    database: process.env.DB_NAME || '4ym_store',
  };
}

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const config = getDbConfig();
    const poolOptions: PoolOptions = {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      charset: 'utf8mb4',
    };

    pool = mysql.createPool(poolOptions);
  }
  return pool;
}

export async function testConnection(): Promise<boolean> {
  try {
    const p = getPool();
    const [rows] = await p.query('SELECT 1 as connected');
    return Array.isArray(rows) && rows.length > 0;
  } catch (error: any) {
    console.error('MySQL Connection test failed:', error.message);
    return false;
  }
}
