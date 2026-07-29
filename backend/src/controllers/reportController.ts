import type { Request, Response } from 'express';
import PDFDocument from 'pdfkit';
import { getDb } from '../config/database';

export async function downloadClassReport(req: Request, res: Response) {
  const { classId } = req.params;

  try {
    const db = getDb();
    
    // Fetch class info
    const [classRows] = await db.query(
      'SELECT id, name, stream, student_count FROM classes WHERE id = ?',
      [classId]
    );
    const cls = (classRows as any[])[0];
    if (!cls) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Fetch students in class
    const [students] = await db.query(
      'SELECT s.id, u.name, s.registration_number, s.gender FROM students s JOIN users u ON s.id = u.id WHERE s.class_id = ? ORDER BY u.name ASC',
      [classId]
    );

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    
    const filename = `Class_Report_${cls.name.replace(/\s+/g, '_')}.pdf`;
    res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res);

    doc.fontSize(20).text(`Class Report: ${cls.name}`, { align: 'center' });
    if (cls.stream) {
      doc.fontSize(14).text(`Stream: ${cls.stream}`, { align: 'center' });
    }
    doc.moveDown(2);

    doc.fontSize(12).text(`Total Students: ${(students as any[]).length}`);
    doc.moveDown();

    (students as any[]).forEach((student, index) => {
      doc.fontSize(10).text(`${index + 1}. ${student.name} - ${student.registration_number} (${student.gender})`);
      doc.moveDown(0.5);
    });

    doc.end();

  } catch (err) {
    console.error('[downloadClassReport] DB error:', err);
    return res.status(500).json({ error: 'Internal server error generating report' });
  }
}
