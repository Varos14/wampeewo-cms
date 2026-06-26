import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';

import { registerRoutes } from './routes';

export function createServer() {
  const app = express();

  app.use(cors());
  app.use(helmet({
    crossOriginResourcePolicy: false,
  }));
  app.use(express.json({ limit: '1mb' }));
  app.use(morgan('dev'));

  registerRoutes(app);

  // health check
  app.get('/health', (_req: express.Request, res: express.Response) =>
    res.json({ status: 'ok' }),
  );

  // TEMPORARY: Reset database route for Render free tier
  app.get('/api/reset-db', async (_req: express.Request, res: express.Response) => {
    try {
      const { getDb } = await import('./config/database');
      const db = getDb();
      const tables = [
        'users', 'classes', 'subjects', 'students', 'generic_skills', 
        'teacher_classes', 'teacher_subjects', 'aois', 'submissions', 
        'attendance', 'exams', 'exam_results', 'timetables', 
        'announcements', 'notes', 'materials', 'presentations',
        'fee_payments', 'fee_statements', 'student_parents', 'parents'
      ];
      await db.query('SET FOREIGN_KEY_CHECKS = 0');
      for (const table of tables) {
        await db.query(`DROP TABLE IF EXISTS ${table}`);
      }
      await db.query('SET FOREIGN_KEY_CHECKS = 1');
      res.send('<h1>Database wiped successfully!</h1><p>Please click "Manual Deploy" -> "Restart service" in your Render dashboard now.</p>');
    } catch (e: any) {
      res.status(500).send(`Error wiping database: ${e.message}`);
    }
  });

  // error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  });

  return app;
}
