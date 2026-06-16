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

  // error handler
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: message });
  });

  return app;
}
