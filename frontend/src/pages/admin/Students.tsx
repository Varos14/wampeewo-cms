import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { studentService, classService } from '../../services/api';
import { Student, Class } from '../../types';
import { useSearchParams } from 'react-router-dom';

export default function AdminStudents() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [classId, setClassId] = useState('');

  // Parent Optional Fields
  const [linkParent, setLinkParent] = useState(false);
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPassword, setParentPassword] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentData, classData] = await Promise.all([
        studentService.list(),
        classService.list()
      ]);
      setStudents(studentData);
      setClasses(classData);
      if (classData.length > 0 && !classId) {
        setClassId(classData[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load students list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Listen to openModal query parameter
  useEffect(() => {
    if (searchParams.get('openModal') === 'student') {
      setShowModal(true);
      // Clean query params so it doesn't reopen on reload
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('openModal');
      setSearchParams(newParams);
    }
  }, [searchParams]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    const payload: any = {
      name,
      email,
      password,
      registrationNumber: regNumber,
      gender,
      classId
    };

    if (linkParent) {
      if (!parentName || !parentEmail || !parentPassword) {
        setFormError('Please fill out all parent details or disable the link parent option.');
        setSubmitting(false);
        return;
      }
      payload.parentName = parentName;
      payload.parentEmail = parentEmail;
      payload.parentPassword = parentPassword;
    }

    try {
      await studentService.create(payload);
      setFormSuccess('Student registered successfully!');
      
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setRegNumber('');
      setGender('Male');
      setLinkParent(false);
      setParentName('');
      setParentEmail('');
      setParentPassword('');

      // Reload lists
      await loadData();
      
      // Close modal after short delay
      setTimeout(() => {
        setShowModal(false);
        setFormSuccess(null);
      }, 1500);

    } catch (err: any) {
      setFormError(err.message || 'Registration failed. Check details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.registrationNumber.toLowerCase().includes(search.toLowerCase())
  );

  const getClassName = (cid: string) =>
    classes.find(c => c.id === cid)?.name ?? cid;

  const maleCount = students.filter(s => s.gender === 'Male').length;
  const femaleCount = students.filter(s => s.gender === 'Female').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Student Roster</h2>
          <p className="text-xs text-slate-500 mt-1">Manage and register enrolled students across streams.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowModal(true)}>
          <span className="mr-2">👤+</span> Register Student
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Students', value: students.length, color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
          { label: 'Male', value: maleCount, color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
          { label: 'Female', value: femaleCount, color: 'bg-rose-500/10 border-rose-500/20 text-rose-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search by name or registration number…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
        />
      </div>

      {/* Roster Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-sm">Fetching student records...</span>
        </div>
      ) : error ? (
        <Card className="p-6 text-center text-rose-400 border-rose-500/20 bg-rose-500/5">
          <p className="text-sm font-semibold">{error}</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={loadData}>Retry</Button>
        </Card>
      ) : (
        <Card className="overflow-hidden" variant="glass">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Reg No.</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Class</th>
                  <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Gender</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(student => (
                  <tr key={student.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`}
                          alt={student.name}
                          className="w-8 h-8 rounded-lg bg-slate-700 object-cover"
                        />
                        <div>
                          <p className="font-semibold text-slate-200">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{student.registrationNumber}</td>
                    <td className="px-4 py-3">
                      <Badge color="blue">{getClassName(student.classId)}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={student.gender === 'Male' ? 'indigo' : 'rose'}>{student.gender}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-8">No students found matching search filters.</p>
            )}
          </div>
        </Card>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Register New Student</h3>

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

            <form onSubmit={handleRegister} className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block text-slate-400 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kato Paul"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Email & Password Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="student@wampeewo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Custom Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Reg No, Gender, Class */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Reg Number</label>
                  <input
                    type="text"
                    required
                    placeholder="WNS/2026/089"
                    value={regNumber}
                    onChange={e => setRegNumber(e.target.value)}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value as 'Male' | 'Female')}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Class Stream</label>
                  <select
                    value={classId}
                    onChange={e => setClassId(e.target.value)}
                    className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Link Parent Section */}
              <div className="pt-2 border-t border-white/5">
                <label className="flex items-center gap-2 text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={linkParent}
                    onChange={e => setLinkParent(e.target.checked)}
                    className="rounded bg-slate-800 border-white/10 text-blue-600 focus:ring-0 focus:ring-offset-0"
                  />
                  <span>Create & Link Parent Account</span>
                </label>
              </div>

              {linkParent && (
                <div className="space-y-4 p-4 rounded-xl bg-slate-800/40 border border-white/5 animate-slide-down">
                  <p className="text-2xs font-bold text-slate-400 uppercase tracking-widest">Parent Details</p>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Parent Full Name</label>
                    <input
                      type="text"
                      required={linkParent}
                      placeholder="e.g. Mukasa Ronald"
                      value={parentName}
                      onChange={e => setParentName(e.target.value)}
                      className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Parent Email</label>
                      <input
                        type="email"
                        required={linkParent}
                        placeholder="parent@wampeewo.com"
                        value={parentEmail}
                        onChange={e => setParentEmail(e.target.value)}
                        className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-medium mb-1">Parent Password</label>
                      <input
                        type="password"
                        required={linkParent}
                        placeholder="••••••••"
                        value={parentPassword}
                        onChange={e => setParentPassword(e.target.value)}
                        className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
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
                  Register Roster
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
