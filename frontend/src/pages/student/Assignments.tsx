import { Card } from '../../components/ui/Card';
import { Badge, RubricBadge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';
import { mockAOIs, mockSubmissions, mockStudents } from '../../utils/mockData';
import { formatDate } from '../../utils/helpers';

export default function StudentAssignments() {
  const { user } = useAuthStore();

  const studentId = user?.id ?? '3';
  const studentInfo = mockStudents.find(s => s.id === studentId) ?? mockStudents[0];
  const myClassId = studentInfo?.classId ?? 'c1';

  // Filter AOIs assigned to this student's class
  const classAOIs = mockAOIs.filter(aoi => aoi.classId === myClassId);

  // Get student's submissions
  const mySubmissions = mockSubmissions.filter(s => s.studentId === studentId);

  // Stats
  const totalCount = classAOIs.length;
  const submittedCount = classAOIs.filter(aoi => mySubmissions.some(s => s.aoiId === aoi.id)).length;
  const pendingCount = totalCount - submittedCount;

  const getDeadlineBadge = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    
    if (deadline.getTime() < now.getTime()) {
      return <Badge color="rose">Past Due</Badge>;
    }

    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 3) {
      return <Badge color="amber">Due in {diffDays} {diffDays === 1 ? 'day' : 'days'}</Badge>;
    }

    return <Badge color="emerald">On Track</Badge>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-100 tracking-tight">My Class Assignments</h2>
        <p className="text-xs text-slate-500 mt-1">Review active Activities of Integration (AOIs) and check grading feedback.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total AOIs', value: totalCount, color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
          { label: 'Submitted', value: submittedCount, color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
          { label: 'Pending', value: pendingCount, color: pendingCount > 0 ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Assignments List */}
      <div className="space-y-6">
        {classAOIs.map(aoi => {
          const submission = mySubmissions.find(s => s.aoiId === aoi.id);

          return (
            <Card key={aoi.id} className="p-5" variant="glass">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 mb-4 gap-2">
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">{aoi.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-500 text-3xs font-semibold uppercase tracking-wider">Deadline:</span>
                    <span className="text-slate-400 text-2xs font-semibold">{formatDate(aoi.deadline, 'PPP p')}</span>
                  </div>
                </div>
                <div>
                  {getDeadlineBadge(aoi.deadline)}
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 leading-relaxed mb-4">{aoi.description}</p>

              {/* Rubric badges */}
              <div className="mb-4">
                <p className="text-3xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Rubric Evaluation Criteria</p>
                <div className="flex flex-wrap gap-1.5">
                  {aoi.rubric.map(r => (
                    <Badge key={r.skill} color="slate" variant="outline">
                      {r.skill} (Max score: {r.maxScore})
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Submission Status */}
              <div className="border-t border-white/5 pt-4 mt-4 space-y-3">
                <p className="text-2xs font-bold uppercase tracking-widest text-slate-500 pl-1">My Submission State</p>
                {submission ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/2 border border-white/5 p-3 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <div>
                          <p className="text-xs font-semibold text-slate-300">Submitted</p>
                          <p className="text-3xs text-slate-500 mt-0.5">{formatDate(submission.submittedAt, 'PP p')}</p>
                        </div>
                      </div>
                      <RubricBadge grade={submission.grade} />
                    </div>

                    {submission.feedback && (
                      <div className="bg-blue-500/5 border border-blue-500/10 p-3 rounded-xl">
                        <span className="font-bold text-blue-400 text-2xs block mb-0.5">Teacher's Evaluation Review</span>
                        <p className="text-slate-400 italic text-2xs leading-relaxed">"{submission.feedback}"</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-slate-800/20 border border-white/5 p-3 rounded-xl text-slate-500 text-xs italic">
                    <span>⚠️ Not submitted yet. Please complete this Activity of Integration project before the deadline.</span>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}