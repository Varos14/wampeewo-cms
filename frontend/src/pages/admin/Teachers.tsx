import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { teacherService, classService } from '../../services/api';
import { Teacher, Class } from '../../types';
import { useSearchParams } from 'react-router-dom';
import { TeacherProfileModal } from './TeacherProfileModal';

const COMMON_SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English Literature',
  'History',
  'Geography',
  'Entrepreneurship',
  'Computer Studies'
];

export default function AdminTeachers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Profile Modal State
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [teacherData, classData] = await Promise.all([
        teacherService.list(),
        classService.list()
      ]);
      setTeachers(teacherData);
      setClasses(classData);
    } catch (err: any) {
      setError(err.message || 'Failed to load teaching staff.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Check search query params to auto-open modal
  useEffect(() => {
    if (searchParams.get('openModal') === 'teacher') {
      setShowModal(true);
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('openModal');
      setSearchParams(newParams);
    }
  }, [searchParams]);

  const handleToggleSubject = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleToggleClass = (cid: string) => {
    if (selectedClasses.includes(cid)) {
      setSelectedClasses(selectedClasses.filter(c => c !== cid));
    } else {
      setSelectedClasses([...selectedClasses, cid]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    if (selectedSubjects.length === 0) {
      setFormError('Please select at least one subject.');
      setSubmitting(false);
      return;
    }

    if (selectedClasses.length === 0) {
      setFormError('Please assign at least one class.');
      setSubmitting(false);
      return;
    }

    try {
      await teacherService.create({
        name,
        email,
        password,
        subjects: selectedSubjects,
        classIds: selectedClasses
      });

      setFormSuccess('Teacher registered successfully!');
      
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setSelectedSubjects([]);
      setSelectedClasses([]);

      // Reload
      await loadData();

      setTimeout(() => {
        setShowModal(false);
        setFormSuccess(null);
      }, 1500);

    } catch (err: any) {
      setFormError(err.message || 'Failed to add teacher.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Teaching Staff</h2>
          <p className="text-xs text-slate-500 mt-1">Manage all instructors, subjects, and classroom streams.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
          <span className="mr-2">👨‍🏫+</span> Add Teacher
        </Button>
      </div>

      {/* Staff Count Stat */}
      {loading ? (
        <div className="h-10 w-32 bg-white/40 rounded-2xl animate-pulse" />
      ) : (
        <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
          <span className="text-2xl font-extrabold text-emerald-400">{teachers.length}</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400/70">Total Teachers</span>
        </div>
      )}

      {/* Roster Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2].map(i => (
            <div key={i} className="h-44 rounded-2xl bg-white/40 border border-black/5 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-6 text-center text-rose-400 border-rose-500/20 bg-rose-500/5">
          <p className="text-sm font-semibold">{error}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={loadData}>Retry</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {teachers.map(teacher => (
            <Card key={teacher.id} className="p-5 cursor-pointer hover:border-blue-500/50 transition-colors" variant="glass" onClick={() => setSelectedTeacherId(teacher.id)}>
              <div className="flex items-start gap-4">
                <img
                  src={teacher.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(teacher.name)}`}
                  alt={teacher.name}
                  className="w-14 h-14 rounded-xl bg-white shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-base">{teacher.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{teacher.email}</p>

                  <div className="mt-3">
                    <p className="text-2xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Subjects</p>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.subjects && teacher.subjects.length > 0 ? (
                        teacher.subjects.map(s => (
                          <Badge key={s} color="emerald">{s}</Badge>
                        ))
                      ) : (
                        <span className="text-slate-500 italic text-2xs">None assigned</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-2xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Classes</p>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.classIds && teacher.classIds.length > 0 ? (
                        teacher.classIds.map(cid => {
                          const cls = classes.find(c => c.id === cid);
                          return (
                            <Badge key={cid} color="blue" variant="outline">
                              {cls ? cls.name : cid.toUpperCase()}
                            </Badge>
                          );
                        })
                      ) : (
                        <span className="text-slate-500 italic text-2xs">None assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {teachers.length === 0 && (
            <p className="text-slate-500 text-sm italic col-span-2 text-center py-8">No teachers currently registered in the database.</p>
          )}
        </div>
      )}

      {selectedTeacherId && (
        <TeacherProfileModal teacherId={selectedTeacherId} onClose={() => setSelectedTeacherId(null)} />
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white border border-black/10 rounded-2xl shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Register New Teacher</h3>

            {formError && (
              <div className="mb-4 p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-400">
                {formError}
              </div>
            )}
            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-xs text-emerald-400">
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block text-slate-600 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Okello John"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-white/80 border border-black/10 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="teacher@wampeewo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-white/80 border border-black/10 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Custom Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-white/80 border border-black/10 rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Subjects Multi-select */}
              <div>
                <label className="block text-slate-600 font-medium mb-1.5">Assign Subjects (Select all that apply)</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 border border-black/5 rounded-xl bg-white/40">
                  {COMMON_SUBJECTS.map(subj => (
                    <label key={subj} className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={selectedSubjects.includes(subj)}
                        onChange={() => handleToggleSubject(subj)}
                        className="rounded bg-white border-black/10 text-emerald-600 focus:ring-0 focus:ring-offset-0"
                      />
                      <span>{subj}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Classes Multi-select */}
              <div>
                <label className="block text-slate-600 font-medium mb-1.5">Assign Class Streams (Select all that apply)</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-3 border border-black/5 rounded-xl bg-white/40">
                  {classes.map(cls => (
                    <label key={cls.id} className="flex items-center gap-2 text-slate-700 cursor-pointer hover:text-white">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(cls.id)}
                        onChange={() => handleToggleClass(cls.id)}
                        className="rounded bg-white border-black/10 text-blue-600 focus:ring-0 focus:ring-offset-0"
                      />
                      <span>{cls.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
                <Button
                  variant="ghost"
                  size="md"
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button variant="primary" size="md" type="submit" loading={submitting}>
                  Add Staff
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


