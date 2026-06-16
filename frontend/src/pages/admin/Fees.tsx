import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { feeService, studentService } from '../../services/api';
import { FeeStatement, Student } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function AdminFees() {
  const [statements, setStatements] = useState<FeeStatement[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      feeService.listStatements(),
      studentService.list()
    ]).then(([stmts, stds]) => {
      setStatements(stmts);
      setStudents(stds);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const getStudentName = (studentId: string) => {
    return students.find(s => s.id === studentId)?.name ?? 'Unknown Student';
  };

  const getStudentReg = (studentId: string) => {
    return students.find(s => s.id === studentId)?.registrationNumber ?? '—';
  };

  // Compute school-wide fees stats
  const totalBilled = statements.reduce((acc, curr) => acc + curr.billedAmount, 0);
  const totalCollected = statements.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalOutstanding = statements.reduce((acc, curr) => acc + curr.balance, 0);

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'Bank Slip': return 'blue';
      case 'Mobile Money': return 'purple';
      case 'Cash': return 'emerald';
      default: return 'slate';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Fee Administration</h2>
        <p className="text-xs text-slate-500 mt-1">Track tuition billing, payments, and outstanding balances.</p>
      </div>

      {loading ? (
        <div className="flex justify-center p-8"><p className="text-slate-400">Loading fee statements...</p></div>
      ) : (
        <>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Fees Billed', value: formatCurrency(totalBilled), color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
          { label: 'Total Fees Collected', value: formatCurrency(totalCollected), color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
          { label: 'Outstanding Balance', value: formatCurrency(totalOutstanding), color: totalOutstanding > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Roster of statements */}
      <div className="space-y-6">
        {statements.map(statement => {
          const studentName = getStudentName(statement.studentId);
          const studentReg = getStudentReg(statement.studentId);
          const completionPct = statement.billedAmount > 0 ? (statement.paidAmount / statement.billedAmount) * 100 : 0;

          return (
            <Card key={statement.studentId} className="p-5" variant="glass">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 mb-4 gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentName)}`}
                    alt={studentName}
                    className="w-9 h-9 rounded bg-slate-700 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm">{studentName}</h3>
                    <p className="text-2xs text-slate-500 font-mono">{studentReg}</p>
                  </div>
                </div>
                <div>
                  {statement.balance === 0 ? (
                    <Badge color="emerald" variant="solid">Fully Paid</Badge>
                  ) : (
                    <Badge color="rose">Outstanding: {formatCurrency(statement.balance)}</Badge>
                  )}
                </div>
              </div>

              {/* Billed/Paid Stats inside card */}
              <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-white/1 mb-4 border border-white/5">
                <div>
                  <p className="text-3xs font-semibold uppercase tracking-widest text-slate-500">Billed</p>
                  <p className="font-bold text-xs text-slate-300 mt-0.5">{formatCurrency(statement.billedAmount)}</p>
                </div>
                <div>
                  <p className="text-3xs font-semibold uppercase tracking-widest text-slate-500">Paid</p>
                  <p className="font-bold text-xs text-emerald-400 mt-0.5">{formatCurrency(statement.paidAmount)}</p>
                </div>
                <div>
                  <p className="text-3xs font-semibold uppercase tracking-widest text-slate-500">Balance</p>
                  <p className={`font-bold text-xs mt-0.5 ${statement.balance > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {formatCurrency(statement.balance)}
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 mb-4">
                <div className="flex justify-between text-2xs font-semibold text-slate-400">
                  <span>Payment Progress</span>
                  <span>{completionPct.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden border border-white/5">
                  <div 
                    className="bg-emerald-500 h-1.5 rounded-full" 
                    style={{ width: `${completionPct}%` }} 
                  />
                </div>
              </div>

              {/* Payments log */}
              <div className="space-y-2">
                <p className="text-2xs font-bold uppercase tracking-widest text-slate-500 pl-1">Payment History</p>
                <div className="overflow-x-auto rounded-lg border border-white/5">
                  <table className="w-full text-2xs text-left bg-white/1">
                    <thead>
                      <tr className="border-b border-white/5 text-slate-400">
                        <th className="px-3 py-2">Receipt</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Method</th>
                        <th className="px-3 py-2 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {statement.payments.map(pay => (
                        <tr key={pay.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-3 py-2 font-mono text-slate-300 font-semibold">{pay.receiptNumber}</td>
                          <td className="px-3 py-2 text-slate-500">{formatDate(pay.paymentDate, 'PP')}</td>
                          <td className="px-3 py-2">
                            <Badge color={getPaymentMethodColor(pay.paymentMethod)} variant="outline">
                              {pay.paymentMethod}
                            </Badge>
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-slate-200">{formatCurrency(pay.amount)}</td>
                        </tr>
                      ))}
                      {statement.payments.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-slate-500 italic">No payments recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      )}
    </div>
  );
}
