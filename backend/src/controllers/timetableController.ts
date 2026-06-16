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
