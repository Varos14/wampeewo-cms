import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { mockClasses, mockTeachers } from '../../utils/mockData';

export default function AdminClasses() {
  const getTeacherName = (id: string) =>
    mockTeachers.find(t => t.id === id)?.name ?? 'Unknown';

  const streamColors: Record<string, 'blue' | 'rose' | 'emerald' | 'amber' | 'indigo' | 'purple'> = {
    Blue: 'blue', Red: 'rose', East: 'emerald', West: 'amber',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">Classes</h2>
        <p className="text-xs text-slate-500 mt-1">All active classes and their class teachers.</p>
      </div>

      {/* Stat */}
      <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20">
        <span className="text-2xl font-extrabold text-blue-400">{mockClasses.length}</span>
        <span className="text-xs font-semibold uppercase tracking-widest text-blue-400/70">Active Classes</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockClasses.map(cls => (
          <Card key={cls.id} className="p-5" variant="glass" hoverable>
            <div className="flex items-center justify-between mb-3">
              <Badge color={streamColors[cls.stream ?? ''] ?? 'blue'}>{cls.stream}</Badge>
              <span className="text-xs font-mono text-slate-500">{cls.id.toUpperCase()}</span>
            </div>
            <h3 className="font-bold text-slate-100 text-base">{cls.name}</h3>
            <div className="mt-4 pt-4 border-t border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Students</span>
                <span className="font-bold text-slate-200">{cls.studentCount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Class Teacher</span>
                <span className="font-semibold text-slate-300 truncate max-w-[120px] text-right">{getTeacherName(cls.classTeacherId)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
