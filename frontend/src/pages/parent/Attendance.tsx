import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { mockStudents, mockAttendance } from '../../utils/mockData';
import { formatDate } from '../../utils/helpers';

export default function ParentAttendance() {
  const { user } = useAuthStore();

  const parentId = user?.id ?? '4';
  const myChildren = mockStudents.filter(s => s.parentIds.includes(parentId));

  const [activeChildId, setActiveChildId] = useState<string>(myChildren[0]?.id ?? '');

  const activeChild = myChildren.find(c => c.id === activeChildId);

  // Filter attendance records for active child
  const childAttendance = mockAttendance.filter(a => a.studentId === activeChildId);

  // Compute stats
  const totalLogs = childAttendance.length;
  const presentCount = childAttendance.filter(a => a.status === 'present').length;
  const absentCount = childAttendance.filter(a => a.status === 'absent').length;
  const excusedCount = childAttendance.filter(a => a.status === 'excused').length;

  const attendancePct = totalLogs > 0 ? (presentCount / totalLogs) * 100 : 0;

  // Sort logs descending by date
  const sortedLogs = [...childAttendance].sort((a, b) => b.date.localeCompare(a.date));

  const getStatusBadge = (status: 'present' | 'absent' | 'excused') => {
    switch (status) {
      case 'present': return <Badge color="emerald">Present</Badge>;
      case 'absent': return <Badge color="rose">Absent</Badge>;
      case 'excused': return <Badge color="amber">Excused</Badge>;
      default: return <Badge color="slate">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Children Attendance Sheets</h2>
        <p className="text-xs text-slate-500 mt-1">Review presence rates and daily roll call history for your children.</p>
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

      {activeChild && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progress Card */}
            <Card className="p-5 lg:col-span-2 flex flex-col justify-between" variant="glass">
              <div>
                <h3 className="font-bold text-slate-200 text-sm mb-3">Presence Rate ({activeChild.name})</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-extrabold text-emerald-400">{attendancePct.toFixed(1)}%</span>
                  <span className="text-slate-500 text-xs font-semibold">attendance compliance</span>
                </div>
                
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/5">
                    <div 
                      className="bg-emerald-500 h-2.5 rounded-full" 
                      style={{ width: `${attendancePct}%` }} 
                    />
                  </div>
                  <span className="text-3xs text-slate-500 block">Required target threshold: 85% attendance rate</span>
                </div>
              </div>
              <div className="mt-4 border-t border-white/5 pt-3">
                <span className="text-3xs text-slate-500 italic">
                  * Compiled from {totalLogs} registered roll calls.
                </span>
              </div>
            </Card>

            {/* Counts Card */}
            <Card className="p-5" variant="glass">
              <h3 className="font-bold text-slate-200 text-sm border-b border-white/5 pb-3 mb-4">Roll Call Counts</h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between items-center bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10">
                  <span className="text-slate-400 font-semibold">Days Present</span>
                  <span className="font-bold text-emerald-400">{presentCount} Days</span>
                </div>
                <div className="flex justify-between items-center bg-rose-500/5 p-2 rounded-lg border border-rose-500/10">
                  <span className="text-slate-400 font-semibold">Days Absent</span>
                  <span className="font-bold text-rose-400">{absentCount} Days</span>
                </div>
                <div className="flex justify-between items-center bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                  <span className="text-slate-400 font-semibold">Days Excused</span>
                  <span className="font-bold text-amber-400">{excusedCount} Days</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Logs Card */}
          <Card variant="glass" className="overflow-hidden">
            <h3 className="font-bold text-slate-200 text-sm p-4 bg-white/1 border-b border-white/5">Daily Roll Call Logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 bg-white/1">
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedLogs.map(log => (
                    <tr key={log.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-300">{formatDate(log.date, 'PPPP')}</td>
                      <td className="px-4 py-3">{getStatusBadge(log.status)}</td>
                    </tr>
                  ))}
                  {sortedLogs.length === 0 && (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-slate-500 text-sm">No attendance records found for {activeChild.name}.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
      {!activeChild && (
        <p className="text-sm text-slate-500 italic">No child profiles linked to this parent account.</p>
      )}
    </div>
  );
}
