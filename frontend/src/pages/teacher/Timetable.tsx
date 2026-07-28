import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useAppDataStore } from '../../store/appDataStore';
import { timetableService } from '../../services/api';
import { TimetableEntry } from '../../types';

export default function TeacherTimetable() {
  const { user } = useAuthStore();
  const { classes, loading, fetchData, subjects, teachers } = useAppDataStore();

  const teacherName = user?.name ?? 'Okello John';
  const [showModal, setShowModal] = useState(false);
  const [day, setDay] = useState(1);
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');
  const [mySchedule, setMySchedule] = useState<TimetableEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentTeacher = user ? teachers.find(t => t.id === user.id) : undefined;
  const teacherClasses = user ? classes.filter(c => currentTeacher?.classIds?.includes(c.id) || c.classTeacherId === user.id) : [];
  const availableClasses = teacherClasses.length > 0 ? teacherClasses : classes;

  useEffect(() => {
    if (availableClasses.length > 0 && !classId) {
      setClassId(availableClasses[0].id);
    }
  }, [availableClasses, classId]);

  const availableSubjects = classes.length > 0 ? subjects.filter(s => s.classId === classId) : [];

  useEffect(() => {
    if (availableSubjects.length > 0) {
      const stillValid = availableSubjects.find(s => s.id === subjectId);
      if (!stillValid) {
        setSubjectId(availableSubjects[0].id);
        setSubjectName(availableSubjects[0].name);
      }
    } else {
      setSubjectId('');
      setSubjectName('');
    }
  }, [availableSubjects, classId, subjectId]);

  const loadSchedules = async () => {
    if (classes.length === 0) return;
    let schedule: TimetableEntry[] = [];
    for (const cls of classes) {
      try {
        const res = await timetableService.getByClass(cls.id);
        schedule = [...schedule, ...res];
      } catch (e) {}
    }
    setMySchedule(schedule.filter(t => t.teacherName.toLowerCase() === teacherName.toLowerCase()));
  };

  useEffect(() => {
    loadSchedules();
  }, [classes, teacherName]);

  if (loading) return <div className="p-8 text-center text-slate-600 animate-pulse">Loading timetable...</div>;

  const days = [
    { key: 1, name: 'Monday' },
    { key: 2, name: 'Tuesday' },
    { key: 3, name: 'Wednesday' },
    { key: 4, name: 'Thursday' },
    { key: 5, name: 'Friday' }
  ];

  const getClassName = (cid: string) => {
    return classes.find(c => c.id === cid)?.name ?? cid;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Teaching Timetable</h2>
          <p className="text-xs text-slate-500 mt-1">Your weekly lecture timetable and room assignments.</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <span className="mr-2">➕</span> Add Session
        </Button>
      </div>

      {/* Grid columns for Mon-Fri */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {days.map(d => {
          const entries = mySchedule
            .filter(e => e.dayOfWeek === d.key)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={d.key} className="space-y-3">
              <div className="border-b border-black/5 pb-2 text-center">
                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest">{d.name}</h3>
              </div>

              <div className="space-y-3">
                {entries.map(entry => (
                  <Card key={entry.id} className="p-3 bg-white/2 border border-black/5 flex flex-col justify-between min-h-[120px]" variant="glass">
                    <div>
                      <div className="flex justify-between items-start gap-1 mb-1.5">
                        <Badge color="blue" className="text-3xs px-1.5 py-0.5" variant="outline">
                          {getClassName(entry.classId)}
                        </Badge>
                        {entry.room && (
                          <span className="text-slate-500 text-3xs font-semibold">{entry.room}</span>
                        )}
                      </div>
                      <h4 className="font-bold text-slate-800 text-2xs leading-snug">{entry.subjectName}</h4>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-black/10 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Timetable Session</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!classId || !subjectId || !subjectName) {
                alert('Please select a class and subject.');
                return;
              }
              setSubmitting(true);
              try {
                await timetableService.create({
                  classId,
                  subjectId,
                  subjectName,
                  teacherName,
                  dayOfWeek: day as any,
                  startTime,
                  endTime,
                  room: room || undefined
                });
                setShowModal(false);
                setRoom('');
                await loadSchedules();
                alert('Session added to timetable!');
              } catch (err: any) {
                console.error(err);
                alert(err.message || 'Failed to add session.');
              } finally {
                setSubmitting(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-slate-600 font-medium mb-1 text-xs">Day of Week</label>
                <select value={day} onChange={e=>setDay(Number(e.target.value))} className="w-full bg-white/80 border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:border-blue-500 text-sm">
                  {days.map(d => <option key={d.key} value={d.key}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1 text-xs">Class</label>
                <select 
                  required 
                  value={classId} 
                  onChange={e=>setClassId(e.target.value)} 
                  className="w-full bg-white/80 border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:border-blue-500 text-sm"
                >
                  {availableClasses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.stream ? `(${c.stream})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1 text-xs">Subject</label>
                <select 
                  required 
                  value={subjectId} 
                  onChange={e=>{
                    const subId = e.target.value;
                    const subObj = availableSubjects.find(s => s.id === subId);
                    setSubjectId(subId);
                    setSubjectName(subObj?.name || '');
                  }} 
                  className="w-full bg-white/80 border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:border-blue-500 text-sm"
                >
                  {availableSubjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                  {availableSubjects.length === 0 && (
                    <option value="">No subjects found for this class</option>
                  )}
                </select>
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
              <div>
                <label className="block text-slate-600 font-medium mb-1 text-xs">Room (Optional)</label>
                <input value={room} onChange={e=>setRoom(e.target.value)} className="w-full bg-white/80 border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:border-blue-500 text-sm" placeholder="Room 5" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" loading={submitting}>Add Session</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


