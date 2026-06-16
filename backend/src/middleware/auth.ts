import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing/invalid Authorization header' });
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET ?? 'change_me_super_secret',
    ) as { sub?: string; role?: string };

    // attach to request (using `any` to avoid extending Express types)
    (req as any).auth = payload;

    return next();
  } catch (_err) {
    return res.status(401).json({ error: 'Invalid/expired token' });
  }
}
