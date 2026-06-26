import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAppDataStore } from '../../store/appDataStore';

interface TeacherProfileModalProps {
  teacherId: string;
  onClose: () => void;
}

export function TeacherProfileModal({ teacherId, onClose }: TeacherProfileModalProps) {
  const { teachers, classes, aois, submissions } = useAppDataStore();

  const teacher = teachers.find(t => t.id === teacherId);

  if (!teacher) return null;

  // Compute teacher stats
  // AOIs created by this teacher for their assigned classes
  const myAois = aois.filter(a => teacher.classIds?.includes(a.classId));
  const pendingApprovals = myAois.filter(a => a.status === 'pending').length;
  
  // Total submissions to grade
  const relevantAoiIds = myAois.map(a => a.id);
  const relevantSubmissions = submissions.filter(s => relevantAoiIds.includes(s.aoiId));
  const pendingGrades = relevantSubmissions.filter(s => !s.grade).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-6 shrink-0">
          <div className="flex items-center gap-4">
            <img
              src={teacher.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(teacher.name)}`}
              alt={teacher.name}
              className="w-16 h-16 rounded-xl bg-slate-800 object-cover"
            />
            <div>
              <h3 className="text-xl font-bold text-slate-100">{teacher.name}</h3>
              <p className="text-sm text-slate-400 font-mono mt-1">{teacher.email}</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white">✕</Button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pr-2 pb-4 flex-1">
          
          {/* Quick Stats */}
          <div className="space-y-6">
            <Card className="p-5" variant="glass">
              <h4 className="font-bold text-slate-200 text-sm mb-4">Teaching Assignment Stats</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Assigned Classes</p>
                  <p className="text-xl font-extrabold text-indigo-400">{teacher.classIds?.length || 0}</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Assigned Subjects</p>
                  <p className="text-xl font-extrabold text-blue-400">{teacher.subjects?.length || 0}</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Ungraded Subs</p>
                  <p className="text-xl font-extrabold text-amber-400">{pendingGrades}</p>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Pending AOIs</p>
                  <p className="text-xl font-extrabold text-rose-400">{pendingApprovals}</p>
                </div>
              </div>
            </Card>

            <Card className="p-5" variant="glass">
              <h4 className="font-bold text-slate-200 text-sm mb-4">Taught Streams</h4>
              <div className="flex flex-wrap gap-2">
                {teacher.classIds && teacher.classIds.length > 0 ? (
                  teacher.classIds.map(cid => {
                    const cls = classes.find(c => c.id === cid);
                    return <Badge key={cid} color="blue" variant="solid">{cls ? cls.name : cid.toUpperCase()}</Badge>;
                  })
                ) : (
                  <p className="text-sm text-slate-500 italic">No classes assigned.</p>
                )}
              </div>
            </Card>
          </div>

          {/* Subjects List */}
          <div className="space-y-6">
            <Card className="p-5" variant="glass">
              <h4 className="font-bold text-slate-200 text-sm mb-4">Subjects Handled</h4>
              <div className="flex flex-wrap gap-2">
                {teacher.subjects && teacher.subjects.length > 0 ? (
                  teacher.subjects.map(sub => (
                    <Badge key={sub} color="emerald" variant="solid">{sub}</Badge>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 italic">No subjects assigned.</p>
                )}
              </div>
            </Card>

            <Card className="p-5" variant="glass">
              <h4 className="font-bold text-slate-200 text-sm mb-4">Recent Activities Configured</h4>
              <div className="space-y-3">
                {myAois.slice(0, 5).map(aoi => (
                  <div key={aoi.id} className="p-3 bg-slate-800/40 rounded-xl border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-slate-300">{aoi.title}</p>
                      <p className="text-[10px] text-slate-500 mt-1">Class: {classes.find(c=>c.id === aoi.classId)?.name}</p>
                    </div>
                    <div>
                      {aoi.status === 'approved' ? (
                        <Badge color="emerald">Approved</Badge>
                      ) : aoi.status === 'pending' ? (
                        <Badge color="amber">Pending</Badge>
                      ) : (
                        <Badge color="slate">{aoi.status}</Badge>
                      )}
                    </div>
                  </div>
                ))}
                {myAois.length === 0 && (
                  <p className="text-sm text-slate-500 italic">No AOIs created recently.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
