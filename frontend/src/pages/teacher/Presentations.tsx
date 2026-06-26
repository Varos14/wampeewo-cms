import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { presentationService, classService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function TeacherPresentations() {
  const { user } = useAuthStore();
  const [presentations, setPresentations] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [meetLink, setMeetLink] = useState('');
  const [classId, setClassId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [presData, classData] = await Promise.all([
        presentationService.list({ teacherId: user.id }),
        classService.list()
      ]);
      setPresentations(presData);
      setClasses(classData);
      if (classData.length > 0 && !classId) {
        setClassId(classData[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await presentationService.create({
        teacherId: user.id,
        classId,
        title,
        meetLink,
        scheduledAt: new Date(scheduledAt).toISOString(),
      });
      setShowModal(false);
      setTitle('');
      setMeetLink('');
      setScheduledAt('');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to schedule presentation');
    } finally {
      setSubmitting(false);
    }
  };

  const getClassName = (cId: string) => classes.find(c => c.id === cId)?.name || cId;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Presentations & Meetings</h2>
          <p className="text-xs text-slate-500 mt-1">Schedule and share Google Meet links for online classes.</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <span className="mr-2">🎥</span> Schedule Meeting
        </Button>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presentations.length === 0 && (
            <p className="text-slate-500 italic text-sm col-span-2">No upcoming presentations scheduled.</p>
          )}
          {presentations.map(pres => (
            <Card key={pres.id} className="p-5" variant="glass">
              <div className="flex justify-between items-start mb-3">
                <Badge color="blue">{getClassName(pres.classId)}</Badge>
                <span className="text-xs font-semibold text-slate-400">
                  {new Date(pres.scheduledAt).toLocaleString()}
                </span>
              </div>
              <h3 className="font-bold text-slate-100 text-lg mb-2">{pres.title}</h3>
              <a 
                href={pres.meetLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 text-sm hover:underline flex items-center gap-2"
              >
                <span>🔗</span> Join Google Meet
              </a>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Schedule Presentation</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1 text-xs">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1 text-xs">Class</label>
                <select
                  value={classId}
                  onChange={e => setClassId(e.target.value)}
                  className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 text-sm"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1 text-xs">Google Meet Link</label>
                <input
                  type="url"
                  required
                  value={meetLink}
                  onChange={e => setMeetLink(e.target.value)}
                  placeholder="https://meet.google.com/xyz-abcd-efg"
                  className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1 text-xs">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</Button>
                <Button variant="primary" type="submit" loading={submitting}>Schedule</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
