import { useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { useAppDataStore } from '../../store/appDataStore';

export default function StudentSubjects() {
  const { user } = useAuthStore();
  const { students, subjects, teachers, loading, fetchData } = useAppDataStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading subjects...</div>;

  const studentInfo = students.find(s => s.id === user?.id);
  const myClassId = studentInfo?.classId ?? 'c1'; // Default to c1 for demo

  // Filter subjects for the student's class
  const mySubjects = subjects.filter(s => s.classId === myClassId);

  const getTeacherForSubject = (subjectName: string) => {
    // Find teacher whose subjects list includes this subject name
    const teacher = teachers.find(t => 
      t.subjects.some(s => s.toLowerCase() === subjectName.toLowerCase())
    );
    return teacher ? teacher.name : 'Staff Member';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">My Curriculum Subjects</h2>
        <p className="text-xs text-slate-500 mt-1">Review active subjects and assigned teaching staff for this term.</p>
      </div>

      {/* Stat Card */}
      <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
        <span className="text-2xl font-extrabold text-indigo-400">{mySubjects.length}</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-indigo-400/70">Enrolled Subjects</span>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mySubjects.map(sub => (
          <Card key={sub.id} className="p-5 flex flex-col justify-between" variant="glass">
            <div>
              <div className="flex justify-between items-start mb-3">
                <Badge color="indigo">{sub.code}</Badge>
                <span className="text-slate-500 text-3xs font-semibold uppercase tracking-wider">Compulsory Core</span>
              </div>
              <h3 className="font-extrabold text-slate-100 text-sm leading-snug">{sub.name}</h3>
            </div>

            <div className="border-t border-white/5 pt-3.5 mt-5 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Instructor</span>
              <span className="font-bold text-slate-300">{getTeacherForSubject(sub.name)}</span>
            </div>
          </Card>
        ))}
        {mySubjects.length === 0 && (
          <p className="text-sm text-slate-500 italic">No enrolled subjects found.</p>
        )}
      </div>
    </div>
  );
}
