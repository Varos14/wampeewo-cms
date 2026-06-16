import dotenv from 'dotenv';
dotenv.config();

import { createServer } from './app';
import { connectDatabase } from './config/database';
import { seedInitialData } from './seed/initialData';

async function main() {
  const app = createServer();

  await connectDatabase();
  await seedInitialData();

  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Competency CMS Backend running on port ${port}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error:', err);
  process.exit(1);
});
