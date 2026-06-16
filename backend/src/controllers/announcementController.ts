import type { Request, Response } from 'express';
import { getDb } from '../config/database';

export async function listAnnouncements(req: Request, res: Response) {
  const role = req.query.role as string | undefined;

  try {
    const db = getDb();
    
    const [rows] = await db.query(
      'SELECT id, title, content, author_id as authorId, author_name as authorName, target_roles as targetRoles, created_at as createdAt FROM announcements ORDER BY created_at DESC'
    );

    const items = (rows as any[]).map(r => ({
      ...r,
      targetRoles: typeof r.targetRoles === 'string' ? JSON.parse(r.targetRoles) : r.targetRoles
    }));

    const filtered = role 
      ? items.filter(a => Array.isArray(a.targetRoles) && a.targetRoles.some((r: string) => r.toLowerCase() === role.toLowerCase()))
      : items;

    return res.json(filtered);
  } catch (err) {
    console.error('[listAnnouncements] DB error:', err);
    return res.status(500).json({ error: 'Internal server error listing announcements' });
  }
}
