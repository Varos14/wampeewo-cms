import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { feeService } from '../../services/api';
import { FeeStatement } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function StudentFeeStatements() {
  const { user } = useAuthStore();
  const [statement, setStatement] = useState<FeeStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      feeService.getStatement(user.id).then(stmt => {
        setStatement(stmt || null);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [user?.id]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Tuition & Fee Statements</h2>
          <p className="text-xs text-slate-500 mt-1">Monitor school fee payments, invoices, and outstanding balances.</p>
        </div>
        <button
          onClick={() => setShowPaymentMethods(!showPaymentMethods)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors border border-blue-500/20"
        >
          {showPaymentMethods ? 'Hide Payment Methods' : 'View Payment Methods'}
        </button>
      </div>

      {showPaymentMethods && (
        <Card className="p-5 border-blue-500/30 bg-blue-500/5 animate-fade-in" variant="glass">
          <h3 className="font-bold text-slate-200 text-sm mb-4">Available Payment Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-[#0a1220]/50 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🏦</span>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Bank Account</h4>
              </div>
              <div className="space-y-1 text-xs text-slate-400 mt-3">
                <p><strong className="text-slate-300">Bank Name:</strong> Centenary Bank</p>
                <p><strong className="text-slate-300">Account Name:</strong> Wampeewo Ntake SS</p>
                <p><strong className="text-slate-300">Account Number:</strong> 3100012345</p>
                <p className="text-2xs text-slate-500 mt-2 italic">*Please include student name and class as reference.</p>
              </div>
            </div>
            
            <div className="p-4 bg-[#0a1220]/50 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📱</span>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Mobile Money</h4>
              </div>
              <div className="space-y-1 text-xs text-slate-400 mt-3">
                <p><strong className="text-slate-300">MTN MoMoPay:</strong> *165*3#</p>
                <p><strong className="text-slate-300">Merchant Code:</strong> 123456</p>
                <p><strong className="text-slate-300">Airtel Money:</strong> *185*9#</p>
                <p><strong className="text-slate-300">Merchant ID:</strong> 654321</p>
                <p className="text-2xs text-slate-500 mt-2 italic">*Use student ID as the payment reference.</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center p-8"><p className="text-slate-400">Loading fee statements...</p></div>
      ) : statement ? (
        <div className="space-y-6">
          {statement.balance > 0 && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2.5 animate-pulse">
              <span className="text-sm">⚠️</span>
              Fees are outstanding. Please settle the remaining balance of {formatCurrency(statement.balance)} before Visitation Day.
            </div>
          )}

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
      ) : (
        <Card className="p-5 text-center" variant="glass">
          <p className="text-slate-400 text-xs italic">No tuition invoices or statements found.</p>
        </Card>
      )}
    </div>
  );
}
