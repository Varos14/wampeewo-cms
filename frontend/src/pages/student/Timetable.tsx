import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import { mockTimetables, mockStudents } from '../../utils/mockData';

export default function StudentTimetable() {
  const { user } = useAuthStore();

  const studentId = user?.id ?? '3';
  const studentInfo = mockStudents.find(s => s.id === studentId) ?? mockStudents[0];
  const myClassId = studentInfo?.classId ?? 'c1';

  // Filter timetable entries for this student's class stream
  const mySchedule = mockTimetables.filter(t => t.classId === myClassId);

  const days = [
    { key: 1, name: 'Monday' },
    { key: 2, name: 'Tuesday' },
    { key: 3, name: 'Wednesday' },
    { key: 4, name: 'Thursday' },
    { key: 5, name: 'Friday' }
  ];

  // Colors map for different subjects
  const subjectStyles: Record<string, string> = {
    'mathematics': 'border-l-4 border-l-blue-500 bg-blue-500/5 hover:bg-blue-500/10',
    'physics': 'border-l-4 border-l-purple-500 bg-purple-500/5 hover:bg-purple-500/10',
    'english literature': 'border-l-4 border-l-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10',
    'history': 'border-l-4 border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/10',
    'geography': 'border-l-4 border-l-rose-500 bg-rose-500/5 hover:bg-rose-500/10',
  };

  const getStyleForSubject = (name: string) => {
    return subjectStyles[name.toLowerCase()] ?? 'border-l-4 border-l-slate-500 bg-slate-500/5 hover:bg-slate-500/10';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Class Timetable</h2>
        <p className="text-xs text-slate-500 mt-1">Your weekly class lectures and lecture hall room assignments.</p>
      </div>

      {/* Grid Mon-Fri */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {days.map(day => {
          const entries = mySchedule
            .filter(e => e.dayOfWeek === day.key)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={day.key} className="space-y-3">
              <div className="border-b border-white/5 pb-2 text-center">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{day.name}</h3>
              </div>

              <div className="space-y-3">
                {entries.map(entry => (
                  <Card 
                    key={entry.id} 
                    className={`p-3 border-y border-r border-white/5 flex flex-col justify-between min-h-[130px] transition-all duration-300 ${getStyleForSubject(entry.subjectName)}`} 
                    variant="glass"
                  >
                    <div>
                      <span className="text-slate-500 text-3xs font-semibold block mb-0.5">{entry.room ?? 'Room —'}</span>
                      <h4 className="font-bold text-slate-200 text-2xs leading-snug">{entry.subjectName}</h4>
                      <p className="text-3xs text-slate-500 mt-1">Instructor: {entry.teacherName}</p>
                    </div>

                    <div className="mt-3 text-3xs font-bold tracking-wider text-slate-400">
                      {entry.startTime} - {entry.endTime}
                    </div>
                  </Card>
                ))}
                {entries.length === 0 && (
                  <div className="rounded-xl border border-white/3 border-dashed py-6 px-2 text-center bg-white/0.5">
                    <p className="text-3xs text-slate-600 font-semibold uppercase">No Classes</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
