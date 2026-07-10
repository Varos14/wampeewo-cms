import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { useAppDataStore } from '../../store/appDataStore';
import { mockExamResults, mockExams } from '../../utils/mockData';
import { getGradeColor } from '../../utils/helpers';
import { gradeService, skillService } from '../../services/api';

export default function StudentResults() {
  const { user } = useAuthStore();
  const { subjects, aois, submissions, loading, fetchData } = useAppDataStore();
  const [quickGrades, setQuickGrades] = useState<{ subject: string, grade: string }[]>([]);
  const [mySkills, setMySkills] = useState<{ name: string; value: number }[]>([]);
  const [activeTab, setActiveTab] = useState<'exams' | 'assignments' | 'skills'>('exams');

  const studentId = user?.id ?? '3';

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    gradeService.getQuickGrade(studentId)
      .then(res => setQuickGrades(res.grades || []))
      .catch(console.error);

    skillService.list(studentId)
      .then(res => setMySkills(res))
      .catch(console.error);
  }, [studentId]);

  if (loading) return <div className="p-8 text-center text-slate-600 animate-pulse">Loading transcripts...</div>;

  // Filter exam results for the student
  const myResults = mockExamResults.filter(r => r.studentId === studentId);

  // Group by examId
  const groupedByExam = myResults.reduce<Record<string, typeof myResults>>((acc, curr) => {
    if (!acc[curr.examId]) {
      acc[curr.examId] = [];
    }
    acc[curr.examId].push(curr);
    return acc;
  }, {});

  const getExamInfo = (examId: string) => {
    return mockExams.find(e => e.id === examId);
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name ?? 'Unknown Subject';
  };

  // Filter assignments submissions for this student
  const studentSubs = submissions.filter(s => s.studentId === studentId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Academic Transcripts</h2>
          <p className="text-xs text-slate-500 mt-1">Access your terminal report cards, continuous assessments, and skills competency records.</p>
        </div>
        
        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-inner">
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'exams' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Exams
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'assignments' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Assignments
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'skills' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Generic Skills
          </button>
        </div>
      </div>

      {quickGrades.length > 0 && activeTab === 'exams' && (
        <Card className="p-5 flex flex-col md:flex-row md:items-center justify-between border-l-4 border-l-blue-500 gap-4" variant="glass">
          <div>
            <h3 className="font-bold text-slate-800">Overall Teacher Assessment</h3>
            <p className="text-xs text-slate-600 mt-1">Your latest quick grades awarded by your class teachers.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {quickGrades.map((qg, idx) => (
              <div key={idx} className="flex flex-col items-center bg-white/50 rounded-lg p-2 border border-black/5">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">{qg.subject}</span>
                <span className={`px-3 py-1 rounded-md text-sm font-extrabold border ${getGradeColor(qg.grade)}`}>
                  {qg.grade}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab Content: Exams */}
      {activeTab === 'exams' && (
        <div className="space-y-6">
          {Object.entries(groupedByExam).map(([examId, results]) => {
            const exam = getExamInfo(examId);
            const averageScore = results.reduce((acc, curr) => acc + curr.score, 0) / results.length;

            return (
              <Card key={examId} className="p-5" variant="glass">
                {/* Exam Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-black/5 pb-3 mb-4 gap-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{exam?.name ?? 'Terminal Examinations'}</h3>
                    <p className="text-3xs text-slate-500 font-semibold uppercase tracking-wider mt-0.5">
                      Year: {exam?.year ?? 2026}
                    </p>
                  </div>
                  {exam?.term && (
                    <Badge color="blue" variant="solid">Term {exam.term}</Badge>
                  )}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-black/5 text-slate-600 bg-white/50">
                        <th className="px-3 py-2 font-semibold uppercase tracking-wider">Subject Name</th>
                        <th className="px-3 py-2 font-semibold uppercase tracking-wider">Score</th>
                        <th className="px-3 py-2 font-semibold uppercase tracking-wider">Grade</th>
                        <th className="px-3 py-2 font-semibold uppercase tracking-wider">Teacher Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {results.map(res => (
                        <tr key={res.id} className="hover:bg-black/5 transition-colors">
                          <td className="px-3 py-3 font-semibold text-slate-800">{getSubjectName(res.subjectId)}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{res.score}%</span>
                              <div className="w-16 bg-white rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-blue-500 h-1.5 rounded-full" 
                                  style={{ width: `${res.score}%` }} 
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded-md text-3xs font-extrabold border ${getGradeColor(res.grade)}`}>
                              {res.grade}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-slate-600 italic">{res.remarks ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Average Summary Footer */}
                <div className="border-t border-black/5 pt-3.5 mt-5 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider">Transcript Average Score</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{averageScore.toFixed(1)}%</span>
                </div>
              </Card>
            );
          })}
          {Object.keys(groupedByExam).length === 0 && (
            <p className="text-sm text-slate-500 italic">No terminal exam records found.</p>
          )}
        </div>
      )}

      {/* Tab Content: Assignments */}
      {activeTab === 'assignments' && (
        <Card className="p-5" variant="glass">
          <h3 className="font-bold text-slate-800 text-sm border-b border-black/5 pb-3 mb-4">Continuous Assessment Grades</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-black/5 text-slate-600 bg-white/50">
                  <th className="px-3 py-2 font-semibold uppercase tracking-wider">Assignment Title</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wider">Date Submitted</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wider">Competency Grade</th>
                  <th className="px-3 py-2 font-semibold uppercase tracking-wider">Teacher Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {studentSubs.map(sub => {
                  const aoi = aois.find(a => a.id === sub.aoiId);
                  const scoreLabel = sub.grade === 3 
                    ? 'Achieved (3)' 
                    : sub.grade === 2 
                    ? 'Progressing (2)' 
                    : sub.grade === 1 
                    ? 'Not Achieved (1)' 
                    : 'Ungraded';
                  
                  const scoreColor = sub.grade === 3 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : sub.grade === 2 
                    ? 'bg-amber-50 text-amber-700 border-amber-300' 
                    : sub.grade === 1 
                    ? 'bg-rose-50 text-rose-700 border-rose-300' 
                    : 'bg-slate-50 text-slate-500 border-slate-300';

                  return (
                    <tr key={sub.id} className="hover:bg-black/5 transition-colors">
                      <td className="px-3 py-3 text-slate-800 font-bold">{aoi?.title ?? 'Activity of Integration'}</td>
                      <td className="px-3 py-3 text-slate-600 font-medium">{sub.submittedAt}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-3xs font-bold border ${scoreColor}`}>
                          {scoreLabel}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600 italic">{sub.feedback ?? '—'}</td>
                    </tr>
                  );
                })}
                {studentSubs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-slate-500 italic">No assignment submissions available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Tab Content: Generic Skills */}
      {activeTab === 'skills' && (
        <Card className="p-5" variant="glass">
          <h3 className="font-bold text-slate-800 text-sm border-b border-black/5 pb-3 mb-4">Generic Skills Competence Grid</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
            {mySkills.map(skill => {
              const valuePct = (skill.value / 3) * 100;
              const valLabel = skill.value === 3 ? 'Achieved' : skill.value === 2 ? 'Progressing' : 'Not Achieved';
              const valColor = skill.value === 3 ? 'bg-emerald-500' : skill.value === 2 ? 'bg-amber-500' : 'bg-rose-500';

              return (
                <div key={skill.name} className="bg-white/55 border border-black/5 rounded-xl p-4 flex flex-col justify-between shadow-xs">
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="font-bold text-slate-800 text-xs">{skill.name}</span>
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold text-white ${valColor}`}>
                      {valLabel} ({skill.value})
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                    <div className={`h-2 rounded-full ${valColor}`} style={{ width: `${valuePct}%` }} />
                  </div>
                </div>
              );
            })}
            {mySkills.length === 0 && (
              <p className="text-sm text-slate-500 italic col-span-2 text-center">No generic skills records available.</p>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}


