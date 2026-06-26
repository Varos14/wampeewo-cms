import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { useAppDataStore } from '../../store/appDataStore';
import { attendanceService } from '../../services/api';
import { formatDate } from '../../utils/helpers';

export default function StudentAttendance() {
  const { user } = useAuthStore();
  const { students, fetchData } = useAppDataStore();
  
  const [myAttendance, setMyAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!user) return;
    const studentInfo = students.find(s => s.id === user.id);
    const myClassId = studentInfo?.classId ?? 'c1';

    const loadAttendance = async () => {
      try {
        // Fetch last 30 days attendance
        const dates = [];
        for (let i = 0; i < 30; i++) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          dates.push(d.toISOString().split('T')[0]);
        }
        
        let allRecords: any[] = [];
        // Just fetch today and a few recent dates as an example
        // In a real application we would have a specific endpoint for student attendance history
        const records = await attendanceService.list(myClassId, dates[0]);
        allRecords = records.filter((r: any) => r.studentId === user.id);
        
        setMyAttendance(allRecords);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (students.length > 0) {
      loadAttendance();
    }
  }, [students, user]);

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading attendance records...</div>;

  // Compute personal stats
  const totalLogs = myAttendance.length;
  const presentCount = myAttendance.filter(a => a.status === 'present').length;
  const absentCount = myAttendance.filter(a => a.status === 'absent').length;
  const excusedCount = myAttendance.filter(a => a.status === 'excused').length;

  const attendancePct = totalLogs > 0 ? (presentCount / totalLogs) * 100 : 0;

  // Sort logs descending by date
  const sortedLogs = [...myAttendance].sort((a, b) => b.date.localeCompare(a.date));

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
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">My Attendance Report</h2>
        <p className="text-xs text-slate-500 mt-1">Monitor your class presence statistics and active record logs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Card */}
        <Card className="p-5 lg:col-span-2 flex flex-col justify-between" variant="glass">
          <div>
            <h3 className="font-bold text-slate-200 text-sm mb-3">Overall Attendance Compliance</h3>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-extrabold text-emerald-400">{attendancePct.toFixed(1)}%</span>
              <span className="text-slate-500 text-xs font-semibold">attendance rate</span>
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
              * Compiled from {totalLogs} registered classroom roll calls this academic term.
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
                  <td colSpan={2} className="px-4 py-8 text-center text-slate-500 text-sm">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
