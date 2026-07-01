import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAppDataStore } from '../../store/appDataStore';
import { attendanceService, gradeService } from '../../services/api';
import { getGradeColor } from '../../utils/helpers';

interface StudentProfileModalProps {
  studentId: string;
  onClose: () => void;
}

export function StudentProfileModal({ studentId, onClose }: StudentProfileModalProps) {
  const { students, classes, submissions } = useAppDataStore();
  const [quickGrades, setQuickGrades] = useState<{ subject: string, grade: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const student = students.find(s => s.id === studentId);
  const className = classes.find(c => c.id === student?.classId)?.name || 'Unknown Class';

  useEffect(() => {
    if (!student) return;

    const loadProfileData = async () => {
      setLoading(true);
      try {
        const [grades] = await Promise.all([
          gradeService.getQuickGrade(studentId).catch(() => ({ grades: [] })),
        ]);
        setQuickGrades(grades.grades || []);
        
        // Mocking attendance since admin doesn't easily fetch full history without date range API
        // For demonstration purposes we fetch a recent date for the class
        const recentDate = new Date().toISOString().split('T')[0];
        await attendanceService.list(student.classId, recentDate).catch(() => []);
        
      } catch (err) {
        console.error("Failed to load student profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [studentId, student]);

  if (!student) return null;

  const mySubmissions = submissions.filter(s => s.studentId === studentId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white border border-black/10 rounded-2xl shadow-2xl p-6 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <img
              src={student.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`}
              alt={student.name}
              className="w-16 h-16 rounded-xl bg-white object-cover"
            />
            <div>
              <h3 className="text-xl font-bold text-slate-900">{student.name}</h3>
              <p className="text-sm text-slate-600 font-mono mt-1">Reg No: {student.registrationNumber}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge color="blue">{className}</Badge>
                <Badge color={student.gender === 'Male' ? 'indigo' : 'rose'}>{student.gender}</Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-slate-600 hover:text-white">✕</Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-600 flex-1">
            <svg className="animate-spin h-8 w-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-sm">Fetching student profile data...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 pb-4 flex-1">
            
            {/* Quick Stats */}
            <div className="space-y-6">
              <Card className="p-5" variant="glass">
                <h4 className="font-bold text-slate-800 text-sm mb-4">Academic Overview</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                    <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-1">Submissions</p>
                    <p className="text-xl font-extrabold text-emerald-400">{mySubmissions.length}</p>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
                    <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-1">Evaluated</p>
                    <p className="text-xl font-extrabold text-blue-400">{mySubmissions.filter(s => s.grade).length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-5" variant="glass">
                <h4 className="font-bold text-slate-800 text-sm mb-4">Recent Teacher Assessments</h4>
                {quickGrades.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {quickGrades.map((qg, idx) => (
                      <div key={idx} className="flex flex-col items-center bg-white/50 rounded-lg p-3 border border-black/5 flex-1 min-w-[80px]">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2 text-center">{qg.subject}</span>
                        <span className={`px-3 py-1 rounded-md text-sm font-extrabold border ${getGradeColor(qg.grade)}`}>
                          {qg.grade}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No quick grades available.</p>
                )}
              </Card>
            </div>

            {/* Submissions List */}
            <Card className="p-5" variant="glass">
              <h4 className="font-bold text-slate-800 text-sm mb-4">Recent Assignment Submissions</h4>
              <div className="space-y-3">
                {mySubmissions.slice(0, 5).map(sub => (
                  <div key={sub.id} className="p-3 bg-white/40 rounded-xl border border-black/5 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-700">Assignment ID: {sub.aoiId.substring(0,8)}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Submitted on {new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      {sub.grade ? (
                        <span className={`px-2 py-1 rounded text-2xs font-extrabold border ${getGradeColor(String(sub.grade))}`}>
                          {sub.grade}
                        </span>
                      ) : (
                        <Badge color="amber">Pending</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {mySubmissions.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No assignments submitted yet.</p>
                )}
              </div>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}


