import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { mockTimetables, mockClasses } from '../../utils/mockData';

export default function TeacherTimetable() {
  const { user } = useAuthStore();

  const teacherName = user?.name ?? 'Okello John';

  // Filter timetable entries for this teacher
  const mySchedule = mockTimetables.filter(t => t.teacherName.toLowerCase() === teacherName.toLowerCase());

  const days = [
    { key: 1, name: 'Monday' },
    { key: 2, name: 'Tuesday' },
    { key: 3, name: 'Wednesday' },
    { key: 4, name: 'Thursday' },
    { key: 5, name: 'Friday' }
  ];

  const getClassName = (classId: string) => {
    return mockClasses.find(c => c.id === classId)?.name ?? classId;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Teaching Timetable</h2>
        <p className="text-xs text-slate-500 mt-1">Your weekly lecture timetable and room assignments.</p>
      </div>

      {/* Grid columns for Mon-Fri */}
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
                  <Card key={entry.id} className="p-3 bg-white/2 border border-white/5 flex flex-col justify-between min-h-[120px]" variant="glass">
                    <div>
                      <div className="flex justify-between items-start gap-1 mb-1.5">
                        <Badge color="blue" className="text-3xs px-1.5 py-0.5" variant="outline">
                          {getClassName(entry.classId)}
                        </Badge>
                        {entry.room && (
                          <span className="text-slate-500 text-3xs font-semibold">{entry.room}</span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-200 text-2xs leading-snug">{entry.subjectName}</h4>
                    </div>

                    <div className="mt-3 text-3xs text-indigo-400 font-bold tracking-wider">
                      {entry.startTime} - {entry.endTime}
                    </div>
                  </Card>
                ))}
                {entries.length === 0 && (
                  <div className="rounded-xl border border-white/3 border-dashed py-6 px-2 text-center bg-white/0.5">
                    <p className="text-3xs text-slate-600 font-semibold uppercase">No Lectures</p>
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
