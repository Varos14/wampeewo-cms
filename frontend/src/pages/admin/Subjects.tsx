import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { mockSubjects, mockClasses } from '../../utils/mockData';

export default function AdminSubjects() {
  const getClassName = (classId: string) => {
    return mockClasses.find(c => c.id === classId)?.name ?? 'Unknown Class';
  };

  // Group subjects by class
  const classIds = Array.from(new Set(mockSubjects.map(s => s.classId)));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Syllabus & Subjects</h2>
        <p className="text-xs text-slate-500 mt-1">Configure subjects, codes, and map them to lower secondary competency rubrics.</p>
      </div>

      {/* Stat Card */}
      <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
        <span className="text-2xl font-extrabold text-blue-400">{mockSubjects.length}</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400/70">Total Subjects</span>
      </div>

      {/* Classes and their subjects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classIds.map(classId => {
          const subjectsInClass = mockSubjects.filter(s => s.classId === classId);
          const className = getClassName(classId);

          return (
            <Card key={classId} className="p-5" variant="glass">
              <div className="border-b border-white/5 pb-3 mb-4 flex justify-between items-center">
                <h3 className="font-bold text-slate-200 text-sm">{className}</h3>
                <Badge color="blue" variant="outline">{subjectsInClass.length} Subjects</Badge>
              </div>

              <div className="space-y-3">
                {subjectsInClass.map(subject => (
                  <div key={subject.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 hover:bg-white/5 border border-white/5 transition-all">
                    <span className="text-slate-300 font-medium text-xs">{subject.name}</span>
                    <Badge color="indigo">{subject.code}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
