import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import { useAppDataStore } from '../../store/appDataStore';
import { attendanceService } from '../../services/api';

export default function TeacherAttendance() {
  const { user } = useAuthStore();
  const { classes, students, loading, fetchData } = useAppDataStore();
  
  const [selectedClassId, setSelectedClassId] = useState('c1');
  const [selectedDate, setSelectedDate] = useState('2026-06-16');
  const [attendanceState, setAttendanceState] = useState<Record<string, 'present' | 'absent' | 'excused'>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter classes taught by this teacher
  const teacherClasses = classes.filter(c => c.classTeacherId === user?.id || selectedClassId === c.id);
  const studentsInClass = students.filter(s => s.classId === selectedClassId);

  // Load existing attendance
  useEffect(() => {
    if (!selectedClassId || !selectedDate || studentsInClass.length === 0) return;
    
    const loadAttendance = async () => {
      try {
        const records = await attendanceService.list(selectedClassId, selectedDate);
        const state: Record<string, 'present' | 'absent' | 'excused'> = {};
        
        studentsInClass.forEach(student => {
          const existing = records.find(att => att.studentId === student.id);
          state[student.id] = existing ? existing.status : 'present';
        });

        setAttendanceState(state);
        setIsSubmitted(false);
      } catch (e) {
        console.error(e);
      }
    };
    
    loadAttendance();
  }, [selectedClassId, selectedDate, studentsInClass.length]);

  const handleStatusChange = (studentId: string, status: 'present' | 'absent' | 'excused') => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: status
    }));
    setIsSubmitted(false);
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const records = studentsInClass.map(s => ({
        studentId: s.id,
        classId: selectedClassId,
        date: selectedDate,
        status: attendanceState[s.id] || 'present',
        markedBy: user.id
      }));
      await attendanceService.mark(records);
      setIsSubmitted(true);
    } catch (e) {
      console.error(e);
      alert('Failed to save attendance');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-600 animate-pulse">Loading attendance...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Mark Attendance</h2>
        <p className="text-xs text-slate-500 mt-1">Take daily student attendance for your assigned streams.</p>
      </div>

      {/* Selectors card */}
      <Card className="p-5" variant="glass">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Select Class Stream</label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full bg-white/50 border border-black/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500/50"
            >
              {teacherClasses.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.stream} Stream)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-2xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Attendance Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full bg-white/50 border border-black/10 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500/50"
            />
          </div>
        </div>
      </Card>

      {/* Success Notification */}
      {isSubmitted && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2.5 animate-pulse">
          <span className="text-sm">✓</span>
          Attendance sheet saved successfully for {classes.find(c => c.id === selectedClassId)?.name} on {selectedDate}.
        </div>
      )}

      {/* Roster list */}
      <Card variant="glass" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left bg-white/50">
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Student Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Reg No.</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {studentsInClass.map(student => {
                const currentStatus = attendanceState[student.id] ?? 'present';
                return (
                  <tr key={student.id} className="hover:bg-black/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`}
                          alt={student.name}
                          className="w-8 h-8 rounded bg-slate-700 shrink-0"
                        />
                        <div>
                          <p className="font-semibold text-slate-800">{student.name}</p>
                          <p className="text-2xs text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{student.registrationNumber}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex gap-1 bg-white/80 p-1 rounded-lg border border-black/5">
                        {[
                          { key: 'present', label: 'Present', activeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' },
                          { key: 'absent', label: 'Absent', activeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/20' },
                          { key: 'excused', label: 'Excused', activeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/20' }
                        ].map(opt => {
                          const isActive = currentStatus === opt.key;
                          return (
                            <button
                              key={opt.key}
                              onClick={() => handleStatusChange(student.id, opt.key as 'present' | 'absent' | 'excused')}
                              className={`px-3 py-1 text-2xs font-bold rounded-md border border-transparent transition-all ${
                                isActive ? opt.activeColor : 'text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {studentsInClass.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500 text-sm">No students assigned to this stream.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {studentsInClass.length > 0 && (
          <div className="p-4 bg-white/50 border-t border-black/5 flex justify-end">
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all hover:scale-102"
            >
              Save Attendance Sheet
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}


