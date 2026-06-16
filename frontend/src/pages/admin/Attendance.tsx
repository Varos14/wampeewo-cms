import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { mockAttendance, mockStudents } from '../../utils/mockData';
import { formatDate } from '../../utils/helpers';

export default function AdminAttendance() {
  const totalCount = mockAttendance.length;
  const presentCount = mockAttendance.filter(a => a.status === 'present').length;
  const absentCount = mockAttendance.filter(a => a.status === 'absent').length;
  const excusedCount = mockAttendance.filter(a => a.status === 'excused').length;
  
  const presentPct = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

  // Group by date
  const groupedByDate = mockAttendance.reduce<Record<string, typeof mockAttendance>>((acc, curr) => {
    if (!acc[curr.date]) {
      acc[curr.date] = [];
    }
    acc[curr.date].push(curr);
    return acc;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const getStudentInfo = (studentId: string) => {
    const student = mockStudents.find(s => s.id === studentId);
    return student ? { name: student.name, regNo: student.registrationNumber } : { name: 'Unknown Student', regNo: '—' };
  };

  const getStatusBadge = (status: 'present' | 'absent' | 'excused') => {
    switch (status) {
      case 'present':
        return <Badge color="emerald">Present</Badge>;
      case 'absent':
        return <Badge color="rose">Absent</Badge>;
      case 'excused':
        return <Badge color="amber">Excused</Badge>;
      default:
        return <Badge color="slate">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Attendance Logs</h2>
        <p className="text-xs text-slate-500 mt-1">Review school-wide student attendance sheets.</p>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Attendance Rate', value: `${presentPct.toFixed(1)}%`, color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
          { label: 'Total Present', value: presentCount, color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
          { label: 'Total Absent', value: absentCount, color: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
          { label: 'Total Excused', value: excusedCount, color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance Logs by Date */}
      <div className="space-y-6">
        {sortedDates.map(date => {
          const records = groupedByDate[date];

          return (
            <div key={date} className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pl-1">
                {formatDate(date, 'PPPP')}
              </h3>

              <Card variant="glass" className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 text-left bg-white/1">
                      <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Name</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Reg No.</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {records.map(record => {
                      const student = getStudentInfo(record.studentId);
                      return (
                        <tr key={record.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`}
                                alt={student.name}
                                className="w-7 h-7 rounded bg-slate-700 shrink-0"
                              />
                              <span className="font-semibold text-slate-200">{student.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-400">{student.regNo}</td>
                          <td className="px-4 py-3">{getStatusBadge(record.status)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
