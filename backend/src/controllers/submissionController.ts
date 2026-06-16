import type { Request, Response } from 'express';
import { getDb } from '../config/database';

export async function listSubmissions(req: Request, res: Response) {
  const aoiId = req.query.aoiId as string | undefined;

  if (!aoiId) {
    return res.status(400).json({ error: 'aoiId query parameter is required' });
  }

  try {
    const db = getDb();
    
    const [rows] = await db.query(
      'SELECT id, aoi_id as aoiId, student_id as studentId, content, grade, feedback, submitted_at as submittedAt FROM submissions WHERE aoi_id = ?',
      [aoiId]
    );

    return res.json(rows);
  } catch (err) {
    console.error('[listSubmissions] DB error:', err);
    return res.status(500).json({ error: 'Internal server error listing submissions' });
  }
}

export async function createSubmission(req: Request, res: Response) {
  const { aoiId, studentId, content } = req.body;

  if (!aoiId || !studentId || !content) {
    return res.status(400).json({ error: 'aoiId, studentId, and content are required' });
  }

  const id = `sub_${Date.now()}`;
  const submittedAt = new Date().toISOString();

  try {
    const db = getDb();

    await db.query(
      'INSERT INTO submissions (id, aoi_id, student_id, content, submitted_at) VALUES (?, ?, ?, ?, ?)',
      [id, aoiId, studentId, content, submittedAt]
    );

    return res.status(201).json({
      id,
      aoiId,
      studentId,
      content,
      submittedAt
    });
  } catch (err) {
    console.error('[createSubmission] DB error:', err);
    return res.status(500).json({ error: 'Internal server error creating submission' });
  }
}

export async function gradeSubmission(req: Request, res: Response) {
  const { id } = req.params;
  const { grade, feedback } = req.body;

  if (grade === undefined) {
    return res.status(400).json({ error: 'grade is required' });
  }

  try {
    const db = getDb();

    // Check if submission exists
    const [existing] = await db.query('SELECT id, aoi_id, student_id, content, submitted_at FROM submissions WHERE id = ?', [id]);
    const list = existing as any[];
    if (list.length === 0) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    await db.query(
      'UPDATE submissions SET grade = ?, feedback = ? WHERE id = ?',
      [grade, feedback ?? null, id]
    );

    const sub = list[0];
    return res.json({
      id,
      aoiId: sub.aoi_id,
      studentId: sub.student_id,
      content: sub.content,
      grade,
      feedback,
      submittedAt: sub.submitted_at
    });
  } catch (err) {
    console.error('[gradeSubmission] DB error:', err);
    return res.status(500).json({ error: 'Internal server error grading submission' });
  }
}
