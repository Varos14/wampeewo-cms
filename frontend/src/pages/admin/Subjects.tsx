import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { subjectService, classService } from '../../services/api';
import { Subject, Class } from '../../types';

export default function AdminSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({ name: '', code: '', classId: '' });

  const loadData = () => {
    setLoading(true);
    Promise.all([subjectService.list(), classService.list()]).then(([subData, clsData]) => {
      setSubjects(subData);
      setClasses(clsData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const getClassName = (classId: string) => {
    return classes.find(c => c.id === classId)?.name ?? 'Unknown Class';
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await subjectService.create(formData);
      setShowModal(false);
      setFormData({ name: '', code: '', classId: '' });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to create subject');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;
    try {
      await subjectService.delete(id);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete subject');
    }
  };

  if (loading) {
    return <div className="text-slate-400 p-8 text-center animate-pulse">Loading subjects...</div>;
  }

  // Group subjects by class
  const classIds = Array.from(new Set(subjects.map(s => s.classId)));

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Syllabus & Subjects</h2>
          <p className="text-xs text-slate-500 mt-1">Configure subjects, codes, and map them to lower secondary competency rubrics.</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>+ Add Subject</Button>
      </div>

      {/* Stat Card */}
      <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
        <span className="text-2xl font-extrabold text-blue-400">{subjects.length}</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400/70">Total Subjects</span>
      </div>

      {/* Classes and their subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classIds.map(classId => {
          const subjectsInClass = subjects.filter(s => s.classId === classId);
          const className = getClassName(classId);

          return (
            <Card key={classId} className="p-5" variant="glass">
              <div className="border-b border-white/5 pb-3 mb-4 flex justify-between items-center">
                <h3 className="font-bold text-slate-200 text-sm">{className}</h3>
                <Badge color="blue" variant="outline">{subjectsInClass.length} Subjects</Badge>
              </div>

              <div className="space-y-3">
                {subjectsInClass.map(subject => (
                  <div key={subject.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 border border-white/5 transition-all">
                    <span className="text-slate-300 font-medium text-xs">{subject.name}</span>
                    <div className="flex items-center gap-3">
                      <Badge color="indigo">{subject.code}</Badge>
                      <button 
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-md hover:bg-rose-500/10 transition-colors text-xs" 
                        onClick={() => handleDelete(subject.id)}
                        title="Delete Subject"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-slate-900 border-white/10" variant="glass">
            <h3 className="text-lg font-bold text-white mb-4">Add New Subject</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Subject Name</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white"
                  placeholder="e.g. English Literature"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Subject Code</label>
                <input 
                  type="text" required
                  value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white uppercase"
                  placeholder="e.g. ENG"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Class</label>
                <select 
                  required
                  value={formData.classId} onChange={e => setFormData({...formData, classId: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white"
                >
                  <option value="">Select a class...</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                <Button variant="primary" className="flex-1" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Add Subject'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
