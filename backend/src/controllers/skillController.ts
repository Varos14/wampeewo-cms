import type { Request, Response } from 'express';
import { getDb } from '../config/database';

export async function listSkills(req: Request, res: Response) {
  const studentId = req.query.studentId as string | undefined;
  
  if (!studentId) {
    return res.status(400).json({ error: 'studentId query parameter is required' });
  }

  try {
    const db = getDb();
    
    // Ensure table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS generic_skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        value INT NOT NULL,
        UNIQUE KEY student_skill (student_id, name)
      )
    `);

    const [rows] = await db.query(
      'SELECT name, value FROM generic_skills WHERE student_id = ?',
      [studentId]
    );

    let items = rows as any[];
    if (items.length === 0) {
      const defaults = ['Critical Thinking', 'Creativity', 'Collaboration', 'Communication', 'Self-direction'];
      items = defaults.map(name => ({ name, value: 2 }));
    }

    return res.json({ items });
  } catch (err) {
    console.error('[listSkills] DB error:', err);
    return res.status(500).json({ error: 'Internal server error listing skills' });
  }
}

export async function createSkill(req: Request, res: Response) {
  const { studentId, name, value } = req.body;

  if (!studentId || !name || value === undefined) {
    return res.status(400).json({ error: 'studentId, name, and value are required' });
  }

  try {
    const db = getDb();

    await db.query(`
      CREATE TABLE IF NOT EXISTS generic_skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        value INT NOT NULL,
        UNIQUE KEY student_skill (student_id, name)
      )
    `);

    await db.query(`
      INSERT INTO generic_skills (student_id, name, value)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE value = VALUES(value)
    `, [studentId, name, value]);

    return res.status(201).json({ message: 'Skill updated successfully', studentId, name, value });
  } catch (err) {
    console.error('[createSkill] DB error:', err);
    return res.status(500).json({ error: 'Internal server error updating skill' });
  }
}
