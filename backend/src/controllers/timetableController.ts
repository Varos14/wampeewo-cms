import type { Request, Response } from 'express';
import { getDb } from '../config/database';

export async function getClassTimetable(req: Request, res: Response) {
  const classId = (req.query.classId ?? req.params.classId) as string | undefined;

  if (!classId) {
    return res.status(400).json({ error: 'classId is required' });
  }

  try {
    const db = getDb();
    
    const [rows] = await db.query(
      `SELECT id, class_id as classId, subject_id as subjectId, subject_name as subjectName, 
              teacher_name as teacherName, day_of_week as dayOfWeek, start_time as startTime, 
              end_time as endTime, room 
       FROM timetables 
       WHERE class_id = ?`,
      [classId]
    );

    return res.json(rows);
  } catch (err) {
    console.error('[getClassTimetable] DB error:', err);
    return res.status(500).json({ error: 'Internal server error fetching timetable' });
  }
}

export async function createTimetableEntry(req: Request, res: Response) {
  const { classId, subjectId, subjectName, teacherName, dayOfWeek, startTime, endTime, room } = req.body;

  if (!classId || !subjectId || !subjectName || !teacherName || !dayOfWeek || !startTime || !endTime) {
    return res.status(400).json({ error: 'classId, subjectId, subjectName, teacherName, dayOfWeek, startTime, and endTime are required' });
  }

  const userRole = (req as any).auth?.role;
  const userId = (req as any).auth?.sub;

  if (userRole === 'student' && classId !== userId) {
    return res.status(403).json({ error: 'Students can only add study sessions to their own personal timetable' });
  }

  const id = 'tt_' + Math.random().toString(36).substring(2, 11);

  try {
    const db = getDb();
    await db.query(
      `INSERT INTO timetables (id, class_id, subject_id, subject_name, teacher_name, day_of_week, start_time, end_time, room) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, classId, subjectId, subjectName, teacherName, dayOfWeek, startTime, endTime, room || null]
    );

    return res.status(201).json({
      id,
      classId,
      subjectId,
      subjectName,
      teacherName,
      dayOfWeek,
      startTime,
      endTime,
      room
    });
  } catch (err) {
    console.error('[createTimetableEntry] DB error:', err);
    return res.status(500).json({ error: 'Internal server error creating timetable entry' });
  }
}
