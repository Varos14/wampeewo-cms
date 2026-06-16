import type { NextFunction, Request, Response } from 'express';

type Role = 'admin' | 'teacher' | 'student' | 'parent';

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = (req as any).auth?.role as Role | undefined;

    if (!role) return res.status(401).json({ error: 'Unauthorized' });
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    return next();
  };
}
