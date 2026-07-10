import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAppDataStore } from '../../store/appDataStore';
import { examService } from '../../services/api';

export default function AdminExams() {
  const { classes, subjects, fetchData } = useAppDataStore();
  const [scheduledExams, setScheduledExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState('Mid-Term');
  const [term, setTerm] = useState(1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');

  useEffect(() => {
    fetchData();
    loadExams();
  }, [fetchData]);

  const loadExams = async () => {
    try {
      const exams = await examService.listScheduled();
      setScheduledExams(exams);
    } catch (e) {
      console.error('Failed to load scheduled exams:', e);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !subjectId || !date || !startTime || !endTime) {
      alert('Please fill out all required fields.');
      return;
    }

    setLoading(true);
    try {
      const selectedClass = classes.find(c => c.id === classId);
      const selectedSubject = subjects.find(s => s.id === subjectId);

      await examService.schedule({
        name,
        term: Number(term),
        year: Number(year),
        classId,
        className: selectedClass?.name || 'Class',
        subjectId,
        subjectName: selectedSubject?.name || 'Subject',
        date,
        startTime,
        endTime
      });

      alert('Exam scheduled and notifications sent successfully!');
      // Clear form except default terms/year
      setDate('');
      loadExams();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to schedule exam.');
    } finally {
      setLoading(false);
    }
  };

  const getClassName = (cId: string) => {
    return classes.find(c => c.id === cId)?.name ?? 'Unknown Class';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Exams Schedule</h2>
        <p className="text-xs text-slate-500 mt-1">View scheduled school-wide examinations and schedule new ones per class.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scheduling Form */}
        <Card className="lg:col-span-1 p-5 h-fit" variant="glass">
          <h3 className="font-bold text-slate-800 text-sm mb-4 border-b border-black/5 pb-2">Schedule New Exam</h3>
          <form onSubmit={handleSchedule} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Exam Type</label>
              <select
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="Beginning of Term">Beginning of Term</option>
                <option value="Mid-Term">Mid-Term</option>
                <option value="End of Term">End of Term</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Academic Term</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(Number(e.target.value))}
                  className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value={1}>Term I</option>
                  <option value={2}>Term II</option>
                  <option value={3}>Term III</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Year</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Target Class</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select a Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Subject</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select a Subject</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-semibold mb-1">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Exam'}
            </Button>
          </form>
        </Card>

        {/* Scheduled Exams List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-lg font-extrabold text-amber-500">{scheduledExams.length}</span>
            <span className="text-3xs font-semibold uppercase tracking-widest text-amber-500/70">Scheduled Exams</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduledExams.map((exam, i) => (
              <Card key={exam.id || i} className="p-4 flex flex-col justify-between" variant="glass">
                <div>
                  <div className="flex justify-between items-start mb-2.5">
                    <Badge color="amber">Term {exam.term}</Badge>
                    <span className="text-slate-500 font-semibold text-2xs tracking-wider">{exam.year}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{exam.name}</h3>
                  <p className="text-3xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
                    {exam.subjectName || 'Subject'}
                  </p>
                </div>
                
                <div className="border-t border-black/5 pt-2.5 mt-4 space-y-1.5 text-2xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Target Class</span>
                    <span className="font-bold text-slate-700">{getClassName(exam.classId)}</span>
                  </div>
                  {exam.date && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Date & Time</span>
                      <span className="font-bold text-slate-800">{exam.date} @ {exam.startTime}-{exam.endTime}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {scheduledExams.length === 0 && (
              <p className="text-slate-500 text-xs italic col-span-2">No exams scheduled yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


