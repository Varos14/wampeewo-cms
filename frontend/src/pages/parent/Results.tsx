import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { mockStudents, mockExamResults, mockExams, mockSubjects } from '../../utils/mockData';
import { getGradeColor } from '../../utils/helpers';

export default function ParentResults() {
  const { user } = useAuthStore();

  const parentId = user?.id ?? '4';
  const myChildren = mockStudents.filter(s => s.parentIds.includes(parentId));

  const [activeChildId, setActiveChildId] = useState<string>(myChildren[0]?.id ?? '');

  const activeChild = myChildren.find(c => c.id === activeChildId);

  // Filter exam results for the active child
  const childResults = mockExamResults.filter(r => r.studentId === activeChildId);

  // Group by examId
  const groupedByExam = childResults.reduce<Record<string, typeof childResults>>((acc, curr) => {
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
    return mockSubjects.find(s => s.id === subjectId)?.name ?? 'Unknown Subject';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Children Academic Results</h2>
        <p className="text-xs text-slate-500 mt-1">Review academic progress and terminal grades for your children.</p>
      </div>

      {/* Child Selector Tabs */}
      {myChildren.length > 1 && (
        <div className="flex gap-2 p-1 bg-white/2 border border-white/5 rounded-xl w-fit">
          {myChildren.map(child => {
            const isActive = child.id === activeChildId;
            return (
              <button
                key={child.id}
                onClick={() => setActiveChildId(child.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white border border-blue-500/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {child.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Active Child Summary */}
      {activeChild && (
        <div className="space-y-6">
          {Object.entries(groupedByExam).map(([examId, results]) => {
            const exam = getExamInfo(examId);
            const averageScore = results.reduce((acc, curr) => acc + curr.score, 0) / results.length;

            return (
              <Card key={examId} className="p-5" variant="glass">
                {/* Exam Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 mb-4 gap-2">
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm">{exam?.name ?? 'Terminal Examinations'}</h3>
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
                      <tr className="border-b border-white/5 text-slate-400 bg-white/1">
                        <th className="px-3 py-2 font-semibold uppercase tracking-wider">Subject Name</th>
                        <th className="px-3 py-2 font-semibold uppercase tracking-wider">Score</th>
                        <th className="px-3 py-2 font-semibold uppercase tracking-wider">Grade</th>
                        <th className="px-3 py-2 font-semibold uppercase tracking-wider">Teacher Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {results.map(res => (
                        <tr key={res.id} className="hover:bg-white/2 transition-colors">
                          <td className="px-3 py-3 font-semibold text-slate-200">{getSubjectName(res.subjectId)}</td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-200">{res.score}%</span>
                              <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
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
                          <td className="px-3 py-3 text-slate-400 italic">{res.remarks ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Average Summary Footer */}
                <div className="border-t border-white/5 pt-3.5 mt-5 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-semibold uppercase tracking-wider">Average Score for {activeChild.name}</span>
                  <span className="font-extrabold text-emerald-400 text-sm">{averageScore.toFixed(1)}%</span>
                </div>
              </Card>
            );
          })}
          {Object.keys(groupedByExam).length === 0 && (
            <p className="text-sm text-slate-500 italic">No terminal exam records found for {activeChild.name}.</p>
          )}
        </div>
      )}
      {!activeChild && (
        <p className="text-sm text-slate-500 italic">No child profiles linked to this parent account.</p>
      )}
    </div>
  );
}
