import { getDb } from './config/database';
(async () => {
  try {
    const db = getDb();
    const [rows] = await db.query('SELECT * FROM aois');
    console.log('AOIs in DB:', rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
