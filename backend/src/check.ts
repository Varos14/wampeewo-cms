import { connectDatabase } from './config/database';
(async () => {
  const db = await connectDatabase();
  const [aois] = await db.query('SELECT * FROM aois ORDER BY id DESC LIMIT 5');
  console.log(JSON.stringify(aois, null, 2));
  process.exit(0);
})();
