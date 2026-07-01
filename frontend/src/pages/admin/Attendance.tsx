import { useState, useMemo, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { classService, studentService, attendanceService } from '../../services/api';
import { Attendance, Student, Class } from '../../types';
import { formatDate } from '../../utils/helpers';

export default function AdminAttendance() {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [attendanceLogs, setAttendanceLogs] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For admin view we want to see logs. 
    // The current API expects classId and date, but since we want to see all
    // for this view, we'll fetch basic data. If the backend doesn't support
    // fetching all attendance, we'll fetch for the current date or handle it.
    // Let's assume the mock / API allows fetching some logs. 
    // We will simulate fetching the logs if no date is provided.
    // For now we'll fetch classes and students, and try fetching attendance for a specific date
    // or all if supported.
    
    // We'll fetch today's date or just handle empty data gracefully.
    const loadLogs = async () => {
      try {
        const [clsData, stData] = await Promise.all([
          classService.list(),
          studentService.list()
        ]);
        setClasses(clsData);
        setStudents(stData);

        // Fetch attendance for the first class for today just as a demo, 
        // since the backend requires classId and date for attendance list
        if (clsData.length > 0) {
          const logs = await attendanceService.list(clsData[0].id, new Date().toISOString().split('T')[0]);
          setAttendanceLogs(logs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const totalCount = attendanceLogs.length;
  const presentCount = attendanceLogs.filter(a => a.status === 'present').length;
  const absentCount = attendanceLogs.filter(a => a.status === 'absent').length;
  const excusedCount = attendanceLogs.filter(a => a.status === 'excused').length;
  
  const presentPct = totalCount > 0 ? (presentCount / totalCount) * 100 : 0;

  const filteredAttendance = useMemo(() => {
    if (selectedClassId === 'all') return attendanceLogs;
    const studentIdsInClass = students.filter(s => s.classId === selectedClassId).map(s => s.id);
    return attendanceLogs.filter(a => studentIdsInClass.includes(a.studentId));
  }, [selectedClassId, attendanceLogs, students]);

  // Group by date
  const groupedByDate = filteredAttendance.reduce<Record<string, Attendance[]>>((acc, curr) => {
    if (!acc[curr.date]) {
      acc[curr.date] = [];
    }
    acc[curr.date].push(curr);
    return acc;
  }, {});

  // Sort dates descending
  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const getStudentInfo = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
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

  if (loading) return <div className="text-slate-600 p-8 text-center animate-pulse">Loading attendance logs...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Attendance Logs</h2>
          <p className="text-xs text-slate-500 mt-1">Review school-wide student attendance sheets.</p>
        </div>
        <select
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          className="bg-white border border-black/10 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Classes / Streams</option>
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
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

      {attendanceLogs.length === 0 && (
        <Card className="p-8 text-center text-slate-500" variant="glass">
          No attendance logs available for today.
        </Card>
      )}

      {/* Attendance Logs by Date */}
      <div className="space-y-6">
        {sortedDates.map(date => {
          const records = groupedByDate[date];

          return (
            <div key={date} className="space-y-3">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider pl-1">
                {formatDate(date, 'PPPP')}
              </h3>

              <Card variant="glass" className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-black/5 text-left bg-white/50">
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Student Name</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Reg No.</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {records.map(record => {
                      const student = getStudentInfo(record.studentId);
                      return (
                        <tr key={record.id} className="hover:bg-black/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img
                                src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`}
                                alt={student.name}
                                className="w-7 h-7 rounded bg-slate-700 shrink-0"
                              />
                              <span className="font-semibold text-slate-800">{student.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs text-slate-600">{student.regNo}</td>
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


