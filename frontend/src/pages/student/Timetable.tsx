import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useAppDataStore } from '../../store/appDataStore';
import { timetableService } from '../../services/api';
import { TimetableEntry } from '../../types';

export default function StudentTimetable() {
  const { user } = useAuthStore();
  const { students, fetchData } = useAppDataStore();

  const [showModal, setShowModal] = useState(false);
  const [day, setDay] = useState(1);
  const [subjectName, setSubjectName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [mySchedule, setMySchedule] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter timetable entries for this student's class stream
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const studentInfo = students.find(s => s.id === user?.id);
    const myClassId = studentInfo?.classId ?? 'c1';

    const fetchSchedule = async () => {
      try {
        const data = await timetableService.getByClass(myClassId);
        setMySchedule(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (students.length > 0) {
      fetchSchedule();
    }
  }, [students, user?.id]);

  if (loading) return <div className="p-8 text-center text-slate-600 animate-pulse">Loading timetable...</div>;

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
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Class & Study Timetable</h2>
          <p className="text-xs text-slate-500 mt-1">Your weekly class lectures and personal study sessions.</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <span className="mr-2">➕</span> Add Study Session
        </Button>
      </div>

      {/* Grid Mon-Fri */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {days.map(day => {
          const entries = mySchedule
            .filter(e => e.dayOfWeek === day.key)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={day.key} className="space-y-3">
              <div className="border-b border-black/5 pb-2 text-center">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">{day.name}</h3>
              </div>

              <div className="space-y-3">
                {entries.map(entry => (
                  <Card 
                    key={entry.id} 
                    className={`p-3 border-y border-r border-black/5 flex flex-col justify-between min-h-[130px] transition-all duration-300 ${getStyleForSubject(entry.subjectName)}`} 
                    variant="glass"
                  >
                    <div>
                      <span className="text-slate-500 text-3xs font-semibold block mb-0.5">{entry.room ?? 'Room —'}</span>
                      <h4 className="font-bold text-slate-800 text-2xs leading-snug">{entry.subjectName}</h4>
                      <p className="text-3xs text-slate-500 mt-1">Instructor: {entry.teacherName}</p>
                    </div>

                    <div className="mt-3 text-3xs font-bold tracking-wider text-slate-600">
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-black/10 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Personal Study Session</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const studentInfo = students.find(s => s.id === user?.id);
                const myClassId = studentInfo?.classId ?? 'c1';
                
                await timetableService.create({
                  classId: myClassId,
                  subjectId: 'self-study',
                  subjectName: subjectName,
                  teacherName: 'Self Study', // Indicates a self-study session
                  dayOfWeek: day as any,
                  startTime,
                  endTime,
                  room: 'Library' // Default room for personal study
                });
                setShowModal(false);
                alert('Study session added to personal timetable!');
                
                // Refresh
                const data = await timetableService.getByClass(myClassId);
                setMySchedule(data);
              } catch (e) {
                console.error(e);
                alert('Failed to add study session');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-slate-600 font-medium mb-1 text-xs">Day of Week</label>
                <select value={day} onChange={e=>setDay(Number(e.target.value))} className="w-full bg-white/80 border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:border-blue-500 text-sm">
                  {days.map(d => <option key={d.key} value={d.key}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1 text-xs">Topic / Subject</label>
                <input required value={subjectName} onChange={e=>setSubjectName(e.target.value)} className="w-full bg-white/80 border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:border-blue-500 text-sm" placeholder="e.g. Physics Revision" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-medium mb-1 text-xs">Start Time</label>
                  <input type="time" required value={startTime} onChange={e=>setStartTime(e.target.value)} className="w-full bg-white/80 border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:border-blue-500 text-sm" />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1 text-xs">End Time</label>
                  <input type="time" required value={endTime} onChange={e=>setEndTime(e.target.value)} className="w-full bg-white/80 border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:border-blue-500 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Add Study Session</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


