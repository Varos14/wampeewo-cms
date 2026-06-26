import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { classService, teacherService } from '../../services/api';
import { Class, Teacher } from '../../types';

export default function AdminClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', stream: '', classTeacherId: '' });

  const loadData = () => {
    setLoading(true);
    Promise.all([classService.list(), teacherService.list()]).then(([clsData, tData]) => {
      setClasses(clsData);
      setTeachers(tData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTeacherName = (id: string) =>
    teachers.find(t => t.id === id)?.name ?? 'Unknown';

  const streamColors: Record<string, 'blue' | 'rose' | 'emerald' | 'amber' | 'indigo' | 'purple'> = {
    Blue: 'blue', Red: 'rose', East: 'emerald', West: 'amber',
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await classService.create(formData);
      setShowModal(false);
      setFormData({ name: '', stream: '', classTeacherId: '' });
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to create class');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    try {
      await classService.delete(id);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to delete class');
    }
  };

  if (loading) {
    return <div className="text-slate-400 p-8 text-center animate-pulse">Loading classes...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Classes</h2>
          <p className="text-xs text-slate-500 mt-1">All active classes and their class teachers.</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>+ Create Class</Button>
      </div>

      <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
        <span className="text-2xl font-extrabold text-blue-400">{classes.length}</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400/70">Active Classes</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {classes.map(cls => (
          <Card key={cls.id} className="p-5 relative group" variant="glass" hoverable>
            <button 
              onClick={() => handleDelete(cls.id)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition text-slate-500 hover:text-rose-400 p-1"
              title="Delete Class"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <div className="flex items-center justify-between mb-3 pr-6">
              <Badge color={streamColors[cls.stream ?? ''] ?? 'blue'}>{cls.stream || 'N/A'}</Badge>
              <span className="text-xs font-mono text-slate-500">{cls.id.toUpperCase()}</span>
            </div>
            <h3 className="font-bold text-slate-100 text-base">{cls.name}</h3>
            <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Students</span>
                <span className="font-bold text-slate-200">{cls.studentCount ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Class Teacher</span>
                <span className="font-semibold text-slate-300 truncate max-w-[120px] text-right">{getTeacherName(cls.classTeacherId)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 bg-slate-900 border-white/10" variant="glass">
            <h3 className="text-lg font-bold text-white mb-4">Create New Class</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Class Name</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white"
                  placeholder="e.g. Senior 1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Stream</label>
                <input 
                  type="text" 
                  value={formData.stream} onChange={e => setFormData({...formData, stream: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white"
                  placeholder="e.g. Blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Class Teacher</label>
                <select 
                  required
                  value={formData.classTeacherId} onChange={e => setFormData({...formData, classTeacherId: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg p-2.5 text-sm text-white"
                >
                  <option value="">Select a teacher...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)} type="button">Cancel</Button>
                <Button variant="primary" className="flex-1" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Create Class'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
