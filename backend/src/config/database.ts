import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export async function connectDatabase(): Promise<mysql.Pool> {
  const {
    DB_HOST,
    DB_PORT,
    DB_NAME,
    DB_USER,
    DB_PASSWORD,
    DB_POOL_LIMIT,
  } = process.env;

  pool = mysql.createPool({
    host: DB_HOST ?? 'localhost',
    port: Number(DB_PORT ?? 3306),
    database: DB_NAME ?? 'competency_cms',
    user: DB_USER ?? 'competency_user',
    password: DB_PASSWORD ?? 'competency_password',
    connectionLimit: Number(DB_POOL_LIMIT ?? 10),
    namedPlaceholders: true,
  });

  // test connection
  await pool.query('SELECT 1');
  // eslint-disable-next-line no-console
  console.log('MySQL connected');

  return pool;
}

export function getDb() {
  if (!pool) {
    throw new Error('Database not connected. Call connectDatabase() first.');
  }
  return pool;
}
