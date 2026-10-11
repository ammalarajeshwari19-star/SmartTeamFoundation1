import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbClient = process.env.DB_CLIENT || 'sqlite';

let sqliteDb = null;
let mysqlPool = null;

if (dbClient === 'mysql') {
  // MySQL dynamic import
  const mysql = await import('mysql2/promise');
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smartteam_foundation',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('[DB] Using MySQL connection pool on', process.env.DB_HOST || 'localhost');
} else {
  // SQLite default
  const dbRelPath = process.env.SQLITE_DB_PATH || './data/smartteam.sqlite';
  const fullPath = path.resolve(__dirname, '..', '..', dbRelPath);
  const dbDir = path.dirname(fullPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  sqliteDb = new DatabaseSync(fullPath);
  sqliteDb.exec('PRAGMA foreign_keys = ON;');
  console.log('[DB] Using SQLite database at:', fullPath);
}

/**
 * Executes a query returning an array of row objects
 */
export async function query(sql, params = []) {
  if (dbClient === 'mysql') {
    const [rows] = await mysqlPool.execute(sql, params);
    return rows;
  }
  const cleanParams = Array.isArray(params) ? params : [params];
  const stmt = sqliteDb.prepare(sql);
  return stmt.all(...cleanParams);
}

/**
 * Executes a query returning the first matching row or null
 */
export async function get(sql, params = []) {
  if (dbClient === 'mysql') {
    const [rows] = await mysqlPool.execute(sql, params);
    return rows && rows.length > 0 ? rows[0] : null;
  }
  const cleanParams = Array.isArray(params) ? params : [params];
  const stmt = sqliteDb.prepare(sql);
  const row = stmt.get(...cleanParams);
  return row !== undefined ? row : null;
}

/**
 * Executes an INSERT, UPDATE, or DELETE query.
 * Returns { lastInsertRowid, changes }
 */
export async function run(sql, params = []) {
  if (dbClient === 'mysql') {
    const [result] = await mysqlPool.execute(sql, params);
    return {
      lastInsertRowid: result.insertId,
      changes: result.affectedRows
    };
  }
  const cleanParams = Array.isArray(params) ? params : [params];
  const stmt = sqliteDb.prepare(sql);
  const result = stmt.run(...cleanParams);
  return {
    lastInsertRowid: Number(result.lastInsertRowid),
    changes: Number(result.changes)
  };
}

/**
 * Executes raw multi-statement SQL (e.g. for creating schema)
 */
export async function exec(sql) {
  if (dbClient === 'mysql') {
    const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
    for (const stmt of statements) {
      await mysqlPool.query(stmt);
    }
    return;
  }
  sqliteDb.exec(sql);
}

export default { query, get, run, exec };
