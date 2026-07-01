import { useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge, RubricBadge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { useAppDataStore } from '../../store/appDataStore';

export default function TeacherGradeBook() {
  const { user } = useAuthStore();
  const { students, aois, submissions, classes, loading, fetchData } = useAppDataStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) return <div className="p-8 text-center text-slate-600 animate-pulse">Loading gradebook...</div>;

  // Find classIds this teacher is assigned to
  const teacherClassIds = classes.filter(c => c.classTeacherId === user?.id).map(c => c.id);
  // Fallback to demo classes if none assigned for demo purposes
  const effectiveClassIds = teacherClassIds.length > 0 ? teacherClassIds : ['c1', 'c2'];

  const filteredStudents = students.filter(s => effectiveClassIds.includes(s.classId));
  const teacherAOIs = aois.filter(aoi => aoi.teacherId === (user?.id ?? '2'));

  const getClassName = (classId: string) => {
    return classes.find(c => c.id === classId)?.name ?? classId;
  };

  const getGradeFor = (studentId: string, aoiId: string) => {
    const sub = submissions.find(s => s.studentId === studentId && s.aoiId === aoiId);
    return sub ? sub.grade : undefined;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Competence Gradebook</h2>
        <p className="text-xs text-slate-500 mt-1">Cross-reference student performance scores against Activity of Integration (AOI) rubrics.</p>
      </div>

      {/* Roster Table */}
      <Card variant="glass" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 bg-white/50">
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[200px]">Student Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Class Stream</th>
                {teacherAOIs.map(aoi => (
                  <th key={aoi.id} className="px-4 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider min-w-[160px]">
                    <div className="truncate w-36" title={aoi.title}>
                      {aoi.title}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
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
                        <p className="font-semibold text-slate-800 text-xs">{student.name}</p>
                        <p className="text-3xs text-slate-500 font-mono">{student.registrationNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color="blue" variant="outline">{getClassName(student.classId)}</Badge>
                  </td>
                  {teacherAOIs.map(aoi => {
                    const grade = getGradeFor(student.id, aoi.id);
                    return (
                      <td key={aoi.id} className="px-4 py-3">
                        {grade !== undefined ? (
                          <RubricBadge grade={grade} />
                        ) : (
                          <span className="text-slate-500 text-xs font-semibold pl-2">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={2 + teacherAOIs.length} className="px-4 py-8 text-center text-slate-500 text-sm">
                    No students found in your assigned streams.
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


