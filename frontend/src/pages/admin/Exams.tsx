import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { mockExams, mockClasses } from '../../utils/mockData';

export default function AdminExams() {
  const getClassName = (classId: string) => {
    return mockClasses.find(c => c.id === classId)?.name ?? 'Unknown Class';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Exams Schedule</h2>
        <p className="text-xs text-slate-500 mt-1">View school-wide scheduled examinations and grading boundaries.</p>
      </div>

      {/* Stat Card */}
      <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
        <span className="text-2xl font-extrabold text-amber-400">{mockExams.length}</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-amber-400/70">Scheduled Exams</span>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {mockExams.map(exam => (
          <Card key={exam.id} className="p-5 flex flex-col justify-between" variant="glass">
            <div>
              <div className="flex justify-between items-start mb-3">
                <Badge color="amber">Term {exam.term}</Badge>
                <span className="text-slate-500 font-semibold text-xs tracking-wider">{exam.year}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm leading-snug">{exam.name}</h3>
            </div>
            
            <div className="border-t border-black/5 pt-3 mt-4 flex items-center justify-between text-xs">
              <span className="text-slate-600">Target Class</span>
              <span className="font-bold text-slate-700">{getClassName(exam.classId)}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}


