import { Card } from '../../components/ui/Card';
import { mockExamResults, mockStudents, mockSubjects, mockExams } from '../../utils/mockData';
import { getGradeColor } from '../../utils/helpers';

export default function AdminResults() {
  const getStudentName = (studentId: string) => {
    return mockStudents.find(s => s.id === studentId)?.name ?? 'Unknown Student';
  };

  const getSubjectName = (subjectId: string) => {
    return mockSubjects.find(s => s.id === subjectId)?.name ?? 'Unknown Subject';
  };

  const getExamName = (examId: string) => {
    return mockExams.find(e => e.id === examId)?.name ?? 'Unknown Exam';
  };

  // Group exam results by studentId
  const studentIds = Array.from(new Set(mockExamResults.map(r => r.studentId)));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Exam Results</h2>
        <p className="text-xs text-slate-500 mt-1">Review student terminal and mid-term results.</p>
      </div>

      {/* Roster of results grouped by student */}
      <div className="space-y-6">
        {studentIds.map(studentId => {
          const studentName = getStudentName(studentId);
          const results = mockExamResults.filter(r => r.studentId === studentId);

          return (
            <Card key={studentId} className="p-5" variant="glass">
              <div className="border-b border-white/5 pb-3 mb-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentName)}`}
                    alt={studentName}
                    className="w-8 h-8 rounded bg-slate-700 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm">{studentName}</h3>
                    <p className="text-2xs text-slate-500 font-semibold uppercase tracking-wider">Student Academic Summary</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 bg-white/1">
                      <th className="px-3 py-2 font-semibold uppercase tracking-wider">Exam</th>
                      <th className="px-3 py-2 font-semibold uppercase tracking-wider">Subject</th>
                      <th className="px-3 py-2 font-semibold uppercase tracking-wider">Score</th>
                      <th className="px-3 py-2 font-semibold uppercase tracking-wider">Grade</th>
                      <th className="px-3 py-2 font-semibold uppercase tracking-wider">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {results.map(res => (
                      <tr key={res.id} className="hover:bg-white/2 transition-colors">
                        <td className="px-3 py-3 text-slate-400 font-medium">{getExamName(res.examId)}</td>
                        <td className="px-3 py-3 text-slate-200 font-semibold">{getSubjectName(res.subjectId)}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{res.score}%</span>
                            <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-indigo-500 h-1.5 rounded-full" 
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
            </Card>
          );
        })}
      </div>
    </div>
  );
}
