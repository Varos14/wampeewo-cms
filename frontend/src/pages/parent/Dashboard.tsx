import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { StatCard } from '../../components/ui/StatCard';
import { DonutChart } from '../../components/charts/DonutChart';
import { useAuthStore } from '../../store/authStore';
import { mockStudents, mockFeeStatements, mockExamResults, mockAttendance, mockAnnouncements } from '../../utils/mockData';
import { formatDate, formatCurrency } from '../../utils/helpers';

export default function ParentDashboard() {
  const { user } = useAuthStore();
  const [activeChildId, setActiveChildId] = useState<string>('3'); // Default Kato Paul

  if (!user) return null;

  // Ronald (user id 4) is the parent of Kato Paul (3) and Babirye Sarah (6)
  const children = mockStudents.filter(s => s.parentIds.includes(user.id));
  const activeChild = children.find(c => c.id === activeChildId) || children[0];

  if (!activeChild) {
    return <div className="text-center text-xs text-slate-500 py-6">No children associated with this account.</div>;
  }

  // Attendance stats for selected child
  const childAtt = mockAttendance.filter(a => a.studentId === activeChild.id);
  const totalAtt = childAtt.length;
  const presentAtt = childAtt.filter(a => a.status === 'present').length;
  const excusedAtt = childAtt.filter(a => a.status === 'excused').length;
  const attPercent = totalAtt > 0 ? Math.round(((presentAtt + excusedAtt * 0.5) / totalAtt) * 100) : 95; // Default fallback

  // Fee details for selected child
  const feeInfo = mockFeeStatements[activeChild.id];
  const billed = feeInfo?.billedAmount || 1200000;
  const paid = feeInfo?.paidAmount || 850000;
  const balance = feeInfo?.balance || 350000;

  // Exam scores for selected child
  const childScores = mockExamResults.filter(r => r.studentId === activeChild.id);

  // School announcements
  const notices = mockAnnouncements.filter(a => a.targetRoles.includes('parent'));

  return (
    <div className="space-y-6">
      {/* Header and Child Toggle Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Parent Console</h2>
          <p className="text-xs text-slate-500 mt-1">Monitor academic performance, attendance, and fee payments.</p>
        </div>

        {/* Children switching tabs */}
        <div className="flex items-center bg-[#09101d] border border-white/5 p-1 rounded-xl shrink-0">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setActiveChildId(child.id)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeChildId === child.id
                  ? 'bg-blue-600/15 border border-blue-500/20 text-blue-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Tuition Balance"
          value={formatCurrency(balance)}
          color={balance > 0 ? 'amber' : 'emerald'}
          trend={balance > 0 ? { value: 29.1, isPositive: false, label: 'payment pending' } : undefined}
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
        <StatCard
          title="Child Attendance"
          value={`${attPercent}%`}
          color="indigo"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          }
        />
        <StatCard
          title="Academic Status"
          value={childScores.length > 0 ? 'Evaluated' : 'No results'}
          color="emerald"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Child Exam performance scores */}
        <Card className="lg:col-span-2 p-6" variant="glass">
          <h3 className="text-base font-bold text-slate-200 mb-4">{activeChild.name}'s Exam Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="pb-3 text-2xs font-bold text-slate-500 uppercase tracking-widest">Subject</th>
                  <th className="pb-3 text-2xs font-bold text-slate-500 uppercase tracking-widest text-center">Score</th>
                  <th className="pb-3 text-2xs font-bold text-slate-500 uppercase tracking-widest text-center">Grade</th>
                  <th className="pb-3 text-2xs font-bold text-slate-500 uppercase tracking-widest">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {childScores.map((res) => (
                  <tr key={res.id} className="text-xs">
                    <td className="py-3.5 font-bold text-slate-200">
                      {res.subjectId === 's1' ? 'Mathematics' : res.subjectId === 's2' ? 'Physics' : res.subjectId === 's3' ? 'English Literature' : 'History'}
                    </td>
                    <td className="py-3.5 text-center font-bold text-slate-300">{res.score}/100</td>
                    <td className="py-3.5 text-center">
                      <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 rounded-md">
                        {res.grade}
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-400">{res.remarks || 'Consistent performance'}</td>
                  </tr>
                ))}
                {childScores.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-xs text-slate-500">No exam results available for this child yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Attendance Ring */}
        <Card className="p-6 flex flex-col justify-between" variant="glass">
          <div>
            <h3 className="text-base font-bold text-slate-200">Attendance Percentage</h3>
            <p className="text-2xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Term I tracker</p>
          </div>
          <div className="my-auto py-4">
            <DonutChart value={attPercent} size={110} centerLabel="Attendance" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tuition Fee Breakdown */}
        <Card className="lg:col-span-2 p-6 flex flex-col justify-between" variant="glass">
          <div>
            <h3 className="text-base font-bold text-slate-200 mb-4">Fee Statement Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs p-3 bg-slate-800/20 rounded-xl border border-white/5">
                <span className="text-slate-400 font-medium">Billed Amount:</span>
                <span className="font-bold text-slate-200">{formatCurrency(billed)}</span>
              </div>
              <div className="flex justify-between items-center text-xs p-3 bg-slate-800/20 rounded-xl border border-white/5">
                <span className="text-slate-400 font-medium">Paid Amount:</span>
                <span className="font-bold text-emerald-400">{formatCurrency(paid)}</span>
              </div>
              <div className="flex justify-between items-center text-xs p-3 bg-slate-800/20 rounded-xl border border-white/5">
                <span className="text-slate-400 font-medium">Remaining Balance:</span>
                <span className={`font-black ${balance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{formatCurrency(balance)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* School Notices for parents */}
        <Card className="p-6" variant="glass">
          <h3 className="text-base font-bold text-slate-200 mb-4">Urgent Parent Notices</h3>
          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {notices.map((ann) => (
              <div key={ann.id} className="text-xs border-b border-white/5 pb-3 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-300">{ann.title}</span>
                  <span className="text-3xs text-slate-500">{formatDate(ann.createdAt)}</span>
                </div>
                <p className="text-slate-400 mt-1.5 leading-relaxed">{ann.content}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
