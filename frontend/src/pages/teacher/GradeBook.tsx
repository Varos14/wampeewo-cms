import { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useAppDataStore } from '../../store/appDataStore';
import { aoiService } from '../../services/api';
import { useUiStore } from '../../store/uiStore';

export default function TeacherGradeBook() {
  const { user } = useAuthStore();
  const { students, aois, submissions, classes, subjects, loading, fetchData, refreshSubmissions } = useAppDataStore();
  const { activeTerm } = useUiStore();

  // Filters State
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [termFilter, setTermFilter] = useState<number>(activeTerm);
  const [submittingGrade, setSubmittingGrade] = useState<string | null>(null); // studentId_aoiId

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Align term filter with uiStore's activeTerm initially
  useEffect(() => {
    setTermFilter(activeTerm);
  }, [activeTerm]);

  if (loading) return <div className="p-8 text-center text-slate-600 animate-pulse">Loading gradebook...</div>;

  // Filter classes taught by this teacher
  const teacherClasses = classes.filter(c => c.classTeacherId === user?.id);
  const effectiveClasses = teacherClasses.length > 0 ? teacherClasses : classes.slice(0, 2);

  // Filter AOIs matching the subject and term
  const filteredAOIs = aois.filter(aoi => {
    const isTeacherAOI = aoi.teacherId === (user?.id ?? '2');
    
    // Inferred subject check
    const matchesSubject = selectedSubjectId === 'all' || (() => {
      const subj = subjects.find(s => s.id === selectedSubjectId);
      if (!subj) return true;
      const subjName = subj.name.toLowerCase();
      return aoi.title.toLowerCase().includes(subjName) || 
             aoi.description.toLowerCase().includes(subjName) ||
             (subjName.includes('math') && (aoi.title.toLowerCase().includes('statistic') || aoi.title.toLowerCase().includes('triangle')));
    })();
    
    // Check term mapping
    const deadlineDate = aoi.deadline ? new Date(aoi.deadline) : null;
    let aoiTerm = 1;
    if (deadlineDate && !isNaN(deadlineDate.getTime())) {
      const month = deadlineDate.getMonth() + 1;
      if (month >= 5 && month <= 8) aoiTerm = 2;
      else if (month >= 9 && month <= 12) aoiTerm = 3;
    } else {
      if (aoi.title.toLowerCase().includes('term 2') || aoi.description.toLowerCase().includes('term 2')) aoiTerm = 2;
      else if (aoi.title.toLowerCase().includes('term 3') || aoi.description.toLowerCase().includes('term 3')) aoiTerm = 3;
    }
    
    const matchesTerm = termFilter === aoiTerm;

    return isTeacherAOI && matchesSubject && matchesTerm;
  });

  // Filter students belonging to selected stream
  const filteredStudents = students.filter(student => {
    const isTeacherStudent = effectiveClasses.some(c => c.id === student.classId);
    const matchesClass = selectedClassId === 'all' || student.classId === selectedClassId;
    return isTeacherStudent && matchesClass;
  });

  const getClassName = (classId: string) => {
    return classes.find(c => c.id === classId)?.name ?? classId;
  };

  const getGradeFor = (studentId: string, aoiId: string) => {
    const sub = submissions.find(s => s.studentId === studentId && s.aoiId === aoiId);
    return sub ? sub.grade : undefined;
  };

  const handleGradeChange = async (studentId: string, aoiId: string, val: string) => {
    if (val === '') return;
    const gradeVal = Number(val);
    const key = `${studentId}_${aoiId}`;
    setSubmittingGrade(key);
    
    try {
      await aoiService.gradeDirect(studentId, aoiId, gradeVal, 'Grade updated via inline Gradebook');
      await refreshSubmissions(aoiId);
    } catch (e) {
      console.error(e);
      alert('Failed to save gradebook evaluation');
    } finally {
      setSubmittingGrade(null);
    }
  };

  const handleExport = () => {
    const headers = ['Student Name', 'Reg No', 'Class Stream', ...filteredAOIs.map(a => a.title)];
    const rows = filteredStudents.map(student => {
      const studentName = student.name;
      const regNo = student.registrationNumber;
      const className = getClassName(student.classId);
      const grades = filteredAOIs.map(aoi => {
        const g = getGradeFor(student.id, aoi.id);
        return g === 3 ? 'Achieved (3)' : g === 2 ? 'Progressing (2)' : g === 1 ? 'Not Achieved (1)' : 'Pending';
      });
      return [studentName, regNo, className, ...grades];
    });
    
    const csvContent = [headers, ...rows].map(e => e.map(val => `"${val}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Gradebook_Term_${termFilter}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Competence Gradebook</h2>
          <p className="text-xs text-slate-500 mt-1">Cross-reference and grade student Activity of Integration (AOI) competencies inline.</p>
        </div>
        <Button variant="secondary" onClick={handleExport} disabled={filteredStudents.length === 0}>
          📥 Export to CSV
        </Button>
      </div>

      {/* Filters Bar */}
      <Card variant="glass" className="p-4 flex flex-wrap gap-4 items-center">
        <div className="flex flex-col min-w-[120px]">
          <label className="text-3xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Class Stream</label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="bg-white border border-black/10 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none"
          >
            <option value="all">All My Classes</option>
            {effectiveClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col min-w-[120px]">
          <label className="text-3xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Subject</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="bg-white border border-black/10 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col min-w-[100px]">
          <label className="text-3xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Academic Term</label>
          <select
            value={termFilter}
            onChange={(e) => setTermFilter(Number(e.target.value))}
            className="bg-white border border-black/10 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none"
          >
            <option value={1}>Term I</option>
            <option value={2}>Term II</option>
            <option value={3}>Term III</option>
          </select>
        </div>
      </Card>

      {/* Roster Table */}
      <Card variant="glass" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 bg-white/50 text-3xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 min-w-[200px]">Student Name</th>
                <th className="px-4 py-3">Class Stream</th>
                {filteredAOIs.map(aoi => (
                  <th key={aoi.id} className="px-4 py-3 min-w-[160px]">
                    <div className="truncate w-36 font-bold text-slate-700" title={aoi.title}>
                      {aoi.title}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-slate-700">
              {filteredStudents.map(student => (
                <tr key={student.id} className="hover:bg-black/5 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`}
                        alt={student.name}
                        className="w-8 h-8 rounded bg-slate-700 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-800">{student.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{student.registrationNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color="blue" variant="subtle">{getClassName(student.classId)}</Badge>
                  </td>
                  {filteredAOIs.map(aoi => {
                    const grade = getGradeFor(student.id, aoi.id);
                    const isMutating = submittingGrade === `${student.id}_${aoi.id}`;
                    
                    const selectBg = grade === 3 
                      ? 'bg-emerald-500/10 text-emerald-700 border-emerald-300' 
                      : grade === 2 
                      ? 'bg-amber-500/10 text-amber-700 border-amber-300' 
                      : grade === 1 
                      ? 'bg-rose-500/10 text-rose-700 border-rose-300' 
                      : 'bg-slate-50 text-slate-500 border-slate-300';

                    return (
                      <td key={aoi.id} className="px-4 py-3">
                        <select
                          value={grade !== undefined ? grade : ''}
                          onChange={(e) => handleGradeChange(student.id, aoi.id, e.target.value)}
                          disabled={isMutating}
                          className={`w-full max-w-[140px] px-2 py-1 rounded-lg border text-2xs font-bold focus:outline-none transition-all cursor-pointer ${selectBg} ${isMutating ? 'animate-pulse' : ''}`}
                        >
                          <option value="">Pending evaluation</option>
                          <option value={1}>Not Achieved (1)</option>
                          <option value={2}>Progressing (2)</option>
                          <option value={3}>Achieved (3)</option>
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={2 + filteredAOIs.length} className="px-4 py-8 text-center text-slate-500 italic">
                    No students found matching the selected class stream.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}


