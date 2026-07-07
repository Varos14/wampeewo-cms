import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useAppDataStore } from '../../store/appDataStore';
import { skillService } from '../../services/api';

const GENERIC_SKILLS = [
  'Critical Thinking',
  'Creativity',
  'Collaboration',
  'Communication',
  'Self-direction'
];

export default function TeacherSkillsAssessment() {
  const { user } = useAuthStore();
  const { classes, students, loading, fetchData } = useAppDataStore();
  
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSkills, setStudentSkills] = useState<{name: string, value: number}[]>([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set default class if available
  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      const teacherClassIds = classes.filter(c => c.classTeacherId === user?.id).map(c => c.id);
      setSelectedClassId(teacherClassIds.length > 0 ? teacherClassIds[0] : classes[0].id);
    }
  }, [classes, user, selectedClassId]);

  const filteredStudents = students.filter(s => s.classId === selectedClassId);

  // Fetch skills when student changes
  useEffect(() => {
    if (selectedStudentId) {
      setLoadingSkills(true);
      skillService.list(selectedStudentId)
        .then(skills => {
          // Map to full list of generic skills (default 1)
          const mapped = GENERIC_SKILLS.map(sk => {
            const found = skills.find(s => s.name === sk);
            return { name: sk, value: found ? found.value : 1 };
          });
          setStudentSkills(mapped);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => setLoadingSkills(false));
    } else {
      setStudentSkills([]);
    }
  }, [selectedStudentId]);

  const handleSkillChange = (skillName: string, value: number) => {
    setStudentSkills(prev => prev.map(s => s.name === skillName ? { ...s, value } : s));
  };

  const handleSave = async () => {
    if (!selectedStudentId) return;
    setSaving(true);
    try {
      // Save each skill
      for (const sk of studentSkills) {
        await skillService.create({
          studentId: selectedStudentId,
          name: sk.name,
          value: sk.value
        });
      }
      alert('Skills saved successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to save skills.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-slate-600 animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Generic Skills Assessment</h2>
        <p className="text-xs text-slate-500 mt-1">Evaluate students on core competencies defined in the curriculum.</p>
      </div>

      <div className="flex gap-4">
        <div className="w-1/3 space-y-4">
          <Card className="p-5" variant="glass">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Select Class</h3>
            <select 
              value={selectedClassId} 
              onChange={e => {
                setSelectedClassId(e.target.value);
                setSelectedStudentId('');
              }} 
              className="w-full bg-white/80 border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:border-blue-500 text-sm"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Card>

          <Card className="p-5" variant="glass">
            <h3 className="font-bold text-slate-800 text-sm mb-3">Select Student</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredStudents.map(student => (
                <div 
                  key={student.id}
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`p-3 rounded-xl cursor-pointer border transition-colors flex items-center gap-3 ${
                    selectedStudentId === student.id 
                      ? 'bg-blue-500/10 border-blue-500 text-blue-700' 
                      : 'bg-white/50 border-black/5 hover:border-black/10 text-slate-700'
                  }`}
                >
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`}
                    alt={student.name}
                    className="w-8 h-8 rounded bg-slate-200 shrink-0"
                  />
                  <div>
                    <p className="font-semibold text-xs">{student.name}</p>
                    <p className="text-[10px] opacity-70 font-mono">{student.registrationNumber}</p>
                  </div>
                </div>
              ))}
              {filteredStudents.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-4">No students found.</p>
              )}
            </div>
          </Card>
        </div>

        <div className="w-2/3">
          <Card className="p-6" variant="glass">
            {selectedStudentId ? (
              <>
                <div className="border-b border-black/5 pb-4 mb-6 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-lg">
                    {students.find(s => s.id === selectedStudentId)?.name}'s Profile
                  </h3>
                  <Badge color="blue" variant="subtle">Assess Skills</Badge>
                </div>

                {loadingSkills ? (
                  <div className="text-center py-8 text-slate-500 animate-pulse">Loading skills...</div>
                ) : (
                  <div className="space-y-6">
                    {studentSkills.map(sk => (
                      <div key={sk.name} className="bg-white/40 border border-black/5 rounded-xl p-4 flex justify-between items-center">
                        <div className="w-1/3">
                          <p className="font-bold text-slate-700 text-sm">{sk.name}</p>
                        </div>
                        <div className="w-2/3 flex gap-2 justify-end">
                          {[
                            { value: 1, label: '1 - Basic' },
                            { value: 2, label: '2 - Moderate' },
                            { value: 3, label: '3 - Advanced' },
                          ].map(opt => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleSkillChange(sk.name, opt.value)}
                              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                                sk.value === opt.value
                                  ? 'bg-emerald-500 text-white border-emerald-600 shadow-md scale-105'
                                  : 'bg-white text-slate-600 border-black/10 hover:bg-slate-50 hover:border-black/20'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="pt-6 border-t border-black/5 flex justify-end">
                      <Button variant="primary" onClick={handleSave} loading={saving}>
                        Save Skills Assessment
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-slate-400">
                <span className="text-4xl block mb-4">👈</span>
                <p>Select a student to evaluate their generic skills</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
