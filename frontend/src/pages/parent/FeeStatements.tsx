import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { studentService, feeService } from '../../services/api';
import { Student, FeeStatement } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function ParentFeeStatements() {
  const { user } = useAuthStore();

  const parentId = user?.id ?? '4';
  const [myChildren, setMyChildren] = useState<Student[]>([]);
  const [activeChildId, setActiveChildId] = useState<string>('');
  const [statement, setStatement] = useState<FeeStatement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.list({ parentId }).then(children => {
      setMyChildren(children);
      if (children.length > 0) {
        setActiveChildId(children[0].id);
      } else {
        setLoading(false);
      }
    }).catch(console.error);
  }, [parentId]);

  useEffect(() => {
    if (activeChildId) {
      setLoading(true);
      feeService.getStatement(activeChildId).then(stmt => {
        setStatement(stmt || null);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [activeChildId]);

  const activeChild = myChildren.find(c => c.id === activeChildId);

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'Bank Slip': return 'blue';
      case 'Mobile Money': return 'purple';
      case 'Cash': return 'emerald';
      default: return 'slate';
    }
  };

  const progressPercentage = statement && statement.billedAmount > 0 
    ? (statement.paidAmount / statement.billedAmount) * 100 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Tuition & Fee Statements</h2>
        <p className="text-xs text-slate-500 mt-1">Monitor school fee payments, invoices, and outstanding balances.</p>
      </div>

      {/* Child Selector Tabs */}
      {myChildren.length > 1 && (
        <div className="flex gap-2 p-1 bg-white/2 border border-white/5 rounded-xl w-fit">
          {myChildren.map(child => {
            const isActive = child.id === activeChildId;
            return (
              <button
                key={child.id}
                onClick={() => setActiveChildId(child.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white border border-blue-500/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {child.name}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8"><p className="text-slate-400">Loading fee statements...</p></div>
      ) : activeChild && statement ? (
        <div className="space-y-6">
          {/* Red warning banner if there is a balance outstanding */}
          {statement.balance > 0 && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2.5 animate-pulse">
              <span className="text-sm">⚠️</span>
              Fees are outstanding for {activeChild.name}. Please settle the remaining balance of {formatCurrency(statement.balance)} before Visitation Day.
            </div>
          )}

          {/* Fee summary stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Billed Amount', value: formatCurrency(statement.billedAmount), color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
              { label: 'Total Paid', value: formatCurrency(statement.paidAmount), color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
              { 
                label: 'Outstanding Balance', 
                value: formatCurrency(statement.balance), 
                color: statement.balance > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              },
            ].map(s => (
              <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
                <p className="text-2xl font-extrabold">{s.value}</p>
                <p className="text-xs font-semibold uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Progress bar card */}
          <Card className="p-5" variant="glass">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>Tuition Compliance Progress</span>
                <span>{progressPercentage.toFixed(0)}% Paid</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-white/5">
                <div 
                  className="bg-emerald-500 h-2 rounded-full" 
                  style={{ width: `${progressPercentage}%` }} 
                />
              </div>
            </div>
          </Card>

          {/* Payments Table log */}
          <Card variant="glass" className="overflow-hidden">
            <h3 className="font-bold text-slate-200 text-sm p-4 bg-white/1 border-b border-white/5">Transaction & Receipts Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 bg-white/1">
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Receipt Number</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Payment Date</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider">Method Channel</th>
                    <th className="px-4 py-3 font-semibold uppercase tracking-wider text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {statement.payments.map(pay => (
                    <tr key={pay.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 font-mono font-semibold text-slate-200">{pay.receiptNumber}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(pay.paymentDate, 'PPP')}</td>
                      <td className="px-4 py-3">
                        <Badge color={getPaymentMethodColor(pay.paymentMethod)} variant="outline">
                          {pay.paymentMethod}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-slate-300">{formatCurrency(pay.amount)}</td>
                    </tr>
                  ))}
                  {statement.payments.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-slate-500 italic">No payments recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : activeChild ? (
        <Card className="p-5 text-center" variant="glass">
          <p className="text-slate-400 text-xs italic">No tuition invoices or statements found for {activeChild.name}.</p>
        </Card>
      ) : (
        <p className="text-sm text-slate-500 italic">No child profiles linked to this parent account.</p>
      )}
    </div>
  );
}
