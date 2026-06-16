import { Card } from '../../components/ui/Card';
import { Badge, RubricBadge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { mockStudents, mockAOIs, mockSubmissions, mockClasses } from '../../utils/mockData';

export default function TeacherGradeBook() {
  const { user } = useAuthStore();

  // Find classIds this teacher is assigned to (Okello John has c1, c2; David has c1, c3)
  const teacherClassIds = user?.id === '5' ? ['c1', 'c3'] : ['c1', 'c2'];

  const students = mockStudents.filter(s => teacherClassIds.includes(s.classId));
  const teacherAOIs = mockAOIs.filter(aoi => aoi.teacherId === (user?.id ?? '2'));

  const getClassName = (classId: string) => {
    return mockClasses.find(c => c.id === classId)?.name ?? classId;
  };

  const getGradeFor = (studentId: string, aoiId: string) => {
    const sub = mockSubmissions.find(s => s.studentId === studentId && s.aoiId === aoiId);
    return sub ? sub.grade : undefined;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Competence Gradebook</h2>
        <p className="text-xs text-slate-500 mt-1">Cross-reference student performance scores against Activity of Integration (AOI) rubrics.</p>
      </div>

      {/* Roster Table */}
      <Card variant="glass" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/1">
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[200px]">Student Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Class Stream</th>
                {teacherAOIs.map(aoi => (
                  <th key={aoi.id} className="px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[160px]">
                    <div className="truncate w-36" title={aoi.title}>
                      {aoi.title}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {students.map(student => (
                <tr key={student.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`}
                        alt={student.name}
                        className="w-8 h-8 rounded bg-slate-700 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-slate-200 text-xs">{student.name}</p>
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
              {students.length === 0 && (
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
