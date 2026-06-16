import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { mockClasses, mockTeachers, mockSubjects, mockAOIs } from '../../utils/mockData';

export default function TeacherMyClasses() {
  const { user } = useAuthStore();

  const teacherId = user?.id ?? '2';
  const teacherInfo = mockTeachers.find(t => t.id === teacherId);
  const teacherClassIds = teacherInfo?.classIds ?? [];

  // Filter classes taught by this teacher or where they are the class teacher
  const myClasses = mockClasses.filter(c => c.classTeacherId === teacherId || teacherClassIds.includes(c.id));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">My Assigned Classes</h2>
        <p className="text-xs text-slate-500 mt-1">Review stream enrollments, curriculum subjects, and activity progress.</p>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {myClasses.map(cls => {
          const subjectsInClass = mockSubjects.filter(s => s.classId === cls.id);
          const aoisInClass = mockAOIs.filter(aoi => aoi.classId === cls.id);
          const isClassTeacher = cls.classTeacherId === teacherId;

          return (
            <Card key={cls.id} className="p-5 flex flex-col justify-between" variant="glass">
              <div>
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {cls.stream && <Badge color="blue">{cls.stream} Stream</Badge>}
                    {isClassTeacher && <Badge color="emerald">Class Teacher</Badge>}
                  </div>
                  <span className="text-slate-400 text-xs font-semibold">{cls.studentCount} Students</span>
                </div>

                <h3 className="font-extrabold text-slate-100 text-base leading-snug">{cls.name}</h3>

                {/* Subjects in this class */}
                <div className="mt-4">
                  <p className="text-3xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Syllabus Subjects</p>
                  <div className="flex flex-wrap gap-1.5">
                    {subjectsInClass.map(sub => (
                      <Badge key={sub.id} color="slate" variant="subtle">
                        {sub.name} ({sub.code})
                      </Badge>
                    ))}
                    {subjectsInClass.length === 0 && (
                      <span className="text-2xs text-slate-500 italic">No subjects registered</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-white/5 pt-3.5 mt-5 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Competency Evaluation Projects</span>
                <span className="font-bold text-indigo-400">{aoisInClass.length} AOIs Assigned</span>
              </div>
            </Card>
          );
        })}
        {myClasses.length === 0 && (
          <p className="text-sm text-slate-500 italic">No assigned classes found.</p>
        )}
      </div>
    </div>
  );
}
