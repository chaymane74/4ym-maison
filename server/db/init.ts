import { execSync } from 'child_process';
import fs from 'fs';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { getDbConfig, getPool } from './connection';
import { SCHEMA_SQL } from './schema';

dotenv.config();

export async function initDatabase(): Promise<boolean> {
  const config = getDbConfig();

  // If local MySQL / MariaDB service exists on host and is not running, ensure it is started
  if ((config.host === 'localhost' || config.host === '127.0.0.1') && fs.existsSync('/etc/init.d/mariadb')) {
    try {
      execSync('/etc/init.d/mariadb status >/dev/null 2>&1 || /etc/init.d/mariadb start >/dev/null 2>&1', { stdio: 'ignore' });
    } catch (_) {}
  }

  console.log(`Connecting to MySQL server at ${config.host}:${config.port} as ${config.user}...`);

  let rootConn;
  try {
    // 1. Connect without database selected to create database if necessary
    rootConn = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
    });

    console.log(`Ensuring database "${config.database}" exists...`);
    await rootConn.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await rootConn.end();
  } catch (err: any) {
    if (rootConn) {
      try { await rootConn.end(); } catch (_) {}
    }
    console.error(`Failed to connect to MySQL server or create database: ${err.message}`);
    return false;
  }

  // 2. Connect to the database and run schema queries
  try {
    const pool = getPool();
    console.log(`Creating database tables if not existing...`);
    for (const sql of SCHEMA_SQL) {
      await pool.query(sql);
    }
    console.log(`Database tables verified/created successfully.`);

    // 3. Create or update initial admin user if not exists
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const adminPassword = (process.env.ADMIN_PASSWORD || 'Maison4YM2026!').trim();

    const [adminRows] = await pool.query<any[]>(
      'SELECT id, email FROM admin_users WHERE email = ?',
      [adminEmail]
    );

    if (!Array.isArray(adminRows) || adminRows.length === 0) {
      console.log(`Seeding initial admin user: ${adminEmail}...`);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      const adminId = `adm-1`;

      await pool.query(
        `INSERT INTO admin_users (id, email, password_hash, name, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          adminId,
          adminEmail,
          hashedPassword,
          'Direction 4YM',
          'admin',
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
      console.log(`Admin user created.`);
    }

    return true;
  } catch (err: any) {
    console.error(`Error initializing database tables: ${err.message}`);
    return false;
  }
}

// If run directly via CLI: tsx server/db/init.ts
if (process.argv[1]?.endsWith('init.ts')) {
  initDatabase()
    .then((success) => {
      if (success) {
        console.log('Database initialization completed successfully.');
        process.exit(0);
      } else {
        console.error('Database initialization failed.');
        process.exit(1);
      }
    })
    .catch((err) => {
      console.error('Unexpected error during init:', err);
      process.exit(1);
    });
}
