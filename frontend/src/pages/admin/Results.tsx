import { useState, useMemo, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { mockExamResults, mockExams } from '../../utils/mockData';
import { getGradeColor } from '../../utils/helpers';
import { useAppDataStore } from '../../store/appDataStore';
import { skillService } from '../../services/api';

export default function AdminResults() {
  const { students, subjects, classes, aois, submissions, fetchData } = useAppDataStore();
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Track skills and tab selections for each student
  const [studentSkills, setStudentSkills] = useState<Record<string, { name: string; value: number }[]>>({});
  const [activeTabs, setActiveTabs] = useState<Record<string, 'exams' | 'assignments' | 'skills'>>({});

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTabChange = async (studentId: string, tab: 'exams' | 'assignments' | 'skills') => {
    setActiveTabs(prev => ({ ...prev, [studentId]: tab }));
    if (tab === 'skills' && !studentSkills[studentId]) {
      try {
        const skillsData = await skillService.list(studentId);
        setStudentSkills(prev => ({ ...prev, [studentId]: skillsData }));
      } catch (e) {
        console.error('Failed to load skills for student:', studentId, e);
      }
    }
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name ?? 'Unknown Subject';
  };

  const getExamName = (examId: string) => {
    return mockExams.find(e => e.id === examId)?.name ?? 'Unknown Exam';
  };

  // Filter students based on selected class and search query
  const filteredStudents = useMemo(() => {
    let list = students;
    if (selectedClassId !== 'all') {
      list = list.filter(s => s.classId === selectedClassId);
    }
    
    if (searchQuery.trim() !== '') {
      const lowerQ = searchQuery.toLowerCase();
      list = list.filter(s => {
        // 1. Check basic details (name and registration number)
        const matchesBasic = s.name.toLowerCase().includes(lowerQ) || 
                             s.registrationNumber.toLowerCase().includes(lowerQ);
        if (matchesBasic) return true;

        // 2. Check exam results (subjects, grades, remarks)
        const studentExams = mockExamResults.filter(r => r.studentId === s.id);
        const matchesExams = studentExams.some(res => {
          const subjName = getSubjectName(res.subjectId).toLowerCase();
          const examName = getExamName(res.examId).toLowerCase();
          const grade = res.grade.toLowerCase();
          const remarks = (res.remarks || '').toLowerCase();
          return subjName.includes(lowerQ) || examName.includes(lowerQ) || grade.includes(lowerQ) || remarks.includes(lowerQ);
        });
        if (matchesExams) return true;

        // 3. Check continuous assignments (titles, grades, feedback)
        const studentSubs = submissions.filter(sub => sub.studentId === s.id);
        const matchesAssignments = studentSubs.some(sub => {
          const aoi = aois.find(a => a.id === sub.aoiId);
          const aoiTitle = (aoi?.title || '').toLowerCase();
          const feedback = (sub.feedback || '').toLowerCase();
          const scoreLabel = sub.grade === 3 
            ? 'achieved' 
            : sub.grade === 2 
            ? 'progressing' 
            : sub.grade === 1 
            ? 'not achieved' 
            : 'ungraded';
          return aoiTitle.includes(lowerQ) || feedback.includes(lowerQ) || scoreLabel.includes(lowerQ);
        });
        if (matchesAssignments) return true;

        // 4. Check evaluated skills
        const skills = studentSkills[s.id] || [];
        const matchesSkills = skills.some(sk => {
          const skName = sk.name.toLowerCase();
          const valLabel = sk.value === 3 ? 'achieved' : sk.value === 2 ? 'progressing' : 'not achieved';
          return skName.includes(lowerQ) || valLabel.includes(lowerQ);
        });
        if (matchesSkills) return true;

        return false;
      });
    }
    return list;
  }, [selectedClassId, searchQuery, students, submissions, aois, studentSkills]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Exam Results & Reports</h2>
          <p className="text-xs text-slate-500 mt-1">Review student terminal, continuous assignments, and generic skills assessments.</p>
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
        {filteredStudents.length === 0 && (
          <p className="text-slate-500 text-sm">No students found matching the selected filters.</p>
        )}
        {filteredStudents.map(student => {
          const studentName = student.name;
          const studentId = student.id;
          const examResults = mockExamResults.filter(r => r.studentId === studentId);
          const studentSubs = submissions.filter(s => s.studentId === studentId);
          
          const activeTab = activeTabs[studentId] || 'exams';

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
                    <p className="text-2xs text-slate-500 font-semibold uppercase tracking-wider">Reg: {student.registrationNumber}</p>
                  </div>
                </div>
                
                {/* 3-Tab Selector for Results Categories */}
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => handleTabChange(studentId, 'exams')}
                    className={`px-3 py-1 rounded-md text-3xs font-bold transition-all ${
                      activeTab === 'exams' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Exams
                  </button>
                  <button
                    onClick={() => handleTabChange(studentId, 'assignments')}
                    className={`px-3 py-1 rounded-md text-3xs font-bold transition-all ${
                      activeTab === 'assignments' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Assignments
                  </button>
                  <button
                    onClick={() => handleTabChange(studentId, 'skills')}
                    className={`px-3 py-1 rounded-md text-3xs font-bold transition-all ${
                      activeTab === 'skills' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Generic Skills
                  </button>
                </div>
              </div>

              {/* Tab Content: Exams */}
              {activeTab === 'exams' && (
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
                      {examResults.map(res => (
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
                      {examResults.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-3 py-4 text-center text-slate-500 italic">No terminal exam results available.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Tab Content: Assignments */}
              {activeTab === 'assignments' && (
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
              )}

              {/* Tab Content: Generic Skills */}
              {activeTab === 'skills' && (
                <div className="space-y-4">
                  <h4 className="text-2xs font-extrabold uppercase tracking-widest text-slate-500">Generic Competence Grid</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentSkills[studentId]?.map(skill => {
                      const valuePct = (skill.value / 3) * 100;
                      const valLabel = skill.value === 3 ? 'Achieved' : skill.value === 2 ? 'Progressing' : 'Not Achieved';
                      const valColor = skill.value === 3 ? 'bg-emerald-500' : skill.value === 2 ? 'bg-amber-500' : 'bg-rose-500';

                      return (
                        <div key={skill.name} className="bg-white/50 border border-black/5 rounded-xl p-3.5 flex flex-col justify-between">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-800 text-xs">{skill.name}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold text-white ${valColor}`}>
                              {valLabel} ({skill.value})
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
                            <div className={`h-2 rounded-full ${valColor}`} style={{ width: `${valuePct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                    {!studentSkills[studentId] && (
                      <p className="text-xs text-slate-500 animate-pulse col-span-2">Loading skills grid...</p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}


