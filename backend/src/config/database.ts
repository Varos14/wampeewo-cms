import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

let pool: any = null;

export async function connectDatabase() {
  const db = await open({
    filename: path.join(__dirname, '../../database.sqlite'),
    driver: sqlite3.Database
  });

  // Create a wrapper object that matches the mysql2 pool.query signature
  // which returns [rows, fields]
  pool = {
    query: async (sql: string, params: any[] = []) => {
      // Replace ? placeholders with standard ? or parameterize if needed
      // sqlite uses ? just like mysql
      try {
        if (sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('PRAGMA') || sql.trim().toUpperCase().startsWith('SHOW')) {
           const rows = await db.all(sql, params);
           return [rows]; 
        } else {
           const result = await db.run(sql, params);
           return [result];
        }
      } catch (error) {
        console.error('DB Query Error:', sql, error);
        throw error;
      }
    }
  };

  // test connection
  await pool.query('SELECT 1');
  // eslint-disable-next-line no-console
  console.log('SQLite connected successfully. database.sqlite created.');

  return pool;
}

export function getDb() {
  if (!pool) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return pool;
}
