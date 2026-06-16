import type { Request, Response } from 'express';

export async function listSkills(_req: Request, res: Response) {
  return res.json({ items: [], message: 'Skills list (stub)' });
}

export async function createSkill(req: Request, res: Response) {
  return res.status(201).json({ message: 'Skill created (stub)', data: req.body ?? {} });
}
