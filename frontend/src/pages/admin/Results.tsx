import { useState, useMemo, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { mockExamResults, mockExams } from '../../utils/mockData';
import { getGradeColor } from '../../utils/helpers';
import { useAppDataStore } from '../../store/appDataStore';

export default function AdminResults() {
  const { students, subjects, classes, fetchData } = useAppDataStore();
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStudentName = (studentId: string) => {
    return students.find(s => s.id === studentId)?.name ?? 'Unknown Student';
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name ?? 'Unknown Subject';
  };

  const getExamName = (examId: string) => {
    return mockExams.find(e => e.id === examId)?.name ?? 'Unknown Exam';
  };

  // Filter students based on selected class and search query
  const filteredStudentIds = useMemo(() => {
    let filteredStudents = students;
    if (selectedClassId !== 'all') {
      filteredStudents = filteredStudents.filter(s => s.classId === selectedClassId);
    }
    
    if (searchQuery.trim() !== '') {
      const lowerQ = searchQuery.toLowerCase();
      filteredStudents = filteredStudents.filter(s => 
        s.name.toLowerCase().includes(lowerQ) || 
        s.registrationNumber.toLowerCase().includes(lowerQ)
      );
    }

    const sIds = new Set(filteredStudents.map(s => s.id));
    return Array.from(new Set(mockExamResults.filter(r => sIds.has(r.studentId)).map(r => r.studentId)));
  }, [selectedClassId, searchQuery, students]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Exam Results & Reports</h2>
          <p className="text-xs text-slate-500 mt-1">Review student terminal and mid-term results by class stream.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input 
            type="text"
            placeholder="Search by student name or reg no..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 bg-white border border-black/10 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
          />
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full sm:w-auto bg-white border border-black/10 rounded-xl px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Roster of results grouped by student */}
      <div className="space-y-6">
        {filteredStudentIds.length === 0 && (
          <p className="text-slate-500 text-sm">No results found for the selected filters.</p>
        )}
        {filteredStudentIds.map(studentId => {
          const studentName = getStudentName(studentId);
          const results = mockExamResults.filter(r => r.studentId === studentId);

          return (
            <Card key={studentId} className="p-5" variant="glass">
              <div className="border-b border-black/5 pb-3 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(studentName)}`}
                    alt={studentName}
                    className="w-8 h-8 rounded bg-slate-700 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{studentName}</h3>
                    <p className="text-2xs text-slate-500 font-semibold uppercase tracking-wider">Student Academic Summary</p>
                  </div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => alert(`Generating PDF Academic Report for ${studentName}...`)}>Generate Student Report</Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-black/5 text-slate-600 bg-white/50">
                      <th className="px-3 py-2 font-semibold uppercase tracking-wider">Exam</th>
                      <th className="px-3 py-2 font-semibold uppercase tracking-wider">Subject</th>
                      <th className="px-3 py-2 font-semibold uppercase tracking-wider">Score</th>
                      <th className="px-3 py-2 font-semibold uppercase tracking-wider">Grade</th>
                      <th className="px-3 py-2 font-semibold uppercase tracking-wider">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {results.map(res => (
                      <tr key={res.id} className="hover:bg-black/5 transition-colors">
                        <td className="px-3 py-3 text-slate-600 font-medium">{getExamName(res.examId)}</td>
                        <td className="px-3 py-3 text-slate-800 font-semibold">{getSubjectName(res.subjectId)}</td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{res.score}%</span>
                            <div className="w-16 bg-white rounded-full h-1.5 overflow-hidden">
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
                        <td className="px-3 py-3 text-slate-600 italic">{res.remarks ?? '—'}</td>
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


