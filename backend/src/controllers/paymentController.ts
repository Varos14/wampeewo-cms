import type { Request, Response } from 'express';
import { getDb } from '../config/database';

export async function getFeeStatement(req: Request, res: Response) {
  const studentId = req.query.studentId as string | undefined;

  if (!studentId) {
    return res.status(400).json({ error: 'studentId query parameter is required' });
  }

  try {
    const db = getDb();
    
    // Query statement
    const [statementRows] = await db.query(
      'SELECT student_id as studentId, billed_amount as billedAmount, paid_amount as paidAmount, balance FROM fee_statements WHERE student_id = ?',
      [studentId]
    );
    const statements = statementRows as any[];

    // Query payments
    const [paymentsRows] = await db.query(
      'SELECT id, student_id as studentId, amount, receipt_number as receiptNumber, payment_method as paymentMethod, payment_date as paymentDate, term, year FROM fee_payments WHERE student_id = ? ORDER BY payment_date DESC',
      [studentId]
    );

    if (statements.length === 0) {
      // Return a default fully-paid statement if none is found
      return res.json({
        studentId,
        billedAmount: 0,
        paidAmount: 0,
        balance: 0,
        payments: []
      });
    }

    return res.json({
      ...statements[0],
      payments: paymentsRows
    });
  } catch (err) {
    console.error('[getFeeStatement] DB error:', err);
    return res.status(500).json({ error: 'Internal server error fetching fee statement' });
  }
}

export async function getAllStatements(req: Request, res: Response) {
  try {
    const db = getDb();
    
    const [statementRows] = await db.query(
      'SELECT student_id as studentId, billed_amount as billedAmount, paid_amount as paidAmount, balance FROM fee_statements'
    );
    const statements = statementRows as any[];

    const [paymentsRows] = await db.query(
      'SELECT id, student_id as studentId, amount, receipt_number as receiptNumber, payment_method as paymentMethod, payment_date as paymentDate, term, year FROM fee_payments ORDER BY payment_date DESC'
    );
    const payments = paymentsRows as any[];

    const result = statements.map(st => ({
      ...st,
      payments: payments.filter(p => p.studentId === st.studentId)
    }));

    return res.json(result);
  } catch (err) {
    console.error('[getAllStatements] DB error:', err);
    return res.status(500).json({ error: 'Internal server error fetching fee statements' });
  }
}
