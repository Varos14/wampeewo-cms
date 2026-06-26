import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge, RubricBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useAppDataStore } from '../../store/appDataStore';
import { formatDate } from '../../utils/helpers';
import { aoiService } from '../../services/api';

export default function TeacherAssignments() {
  const { user } = useAuthStore();
  const { classes, students, aois, submissions, loading, fetchData } = useAppDataStore();
  
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [type, setType] = useState<'assignment'|'exam'>('assignment');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!user) return null;
  if (loading) return <div className="p-8 text-center text-slate-400 animate-pulse">Loading assignments...</div>;

  // Filter AOIs by teacher ID (fallback to all if no teacher user ID found, but default is Okello John ID '2')
  const teacherAOIs = aois.filter(aoi => aoi.teacherId === user.id || aoi.teacherId === '2');

  const getClassName = (cid: string) => {
    return classes.find(c => c.id === cid)?.name ?? 'Unknown Class';
  };

  const getStudentInfo = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student ? { name: student.name, regNo: student.registrationNumber } : { name: 'Unknown Student', regNo: '—' };
  };

  // Compute stats
  const totalAOIs = teacherAOIs.length;
  const aoiIds = teacherAOIs.map(a => a.id);
  const relevantSubmissions = submissions.filter(s => aoiIds.includes(s.aoiId));
  const totalSubmissions = relevantSubmissions.length;
  const gradedSubmissionsCount = relevantSubmissions.filter(s => s.grade !== undefined).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">Competence Assignments (AOIs)</h2>
          <p className="text-xs text-slate-500 mt-1">Review Activities of Integration (AOIs) and grade student submissions.</p>
        </div>
        <Button variant="primary" className="bg-red-600 hover:bg-red-500 text-white" onClick={() => setShowModal(true)}>
          <span className="mr-2">📝</span> Create Assignment
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active AOIs', value: totalAOIs, color: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' },
          { label: 'Submissions', value: totalSubmissions, color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
          { label: 'Graded', value: gradedSubmissionsCount, color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 ${s.color}`}>
            <p className="text-2xl font-extrabold">{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-widest mt-1 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AOI assignments list */}
      <div className="space-y-6">
        {teacherAOIs.map(aoi => {
          const aoiSubs = submissions.filter(s => s.aoiId === aoi.id);

          return (
            <div key={aoi.id} className="space-y-3">
              {/* AOI Details Card */}
              <Card className="p-5" variant="glass">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-3 mb-4 gap-2">
                  <div>
                    <h3 className="font-bold text-slate-200 text-sm">{aoi.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge color={aoi.status === 'approved' ? 'emerald' : aoi.status === 'rejected' ? 'rose' : 'amber'}>
                        {aoi.status?.toUpperCase() || 'PENDING'}
                      </Badge>
                      <p className="text-2xs text-slate-500 font-semibold uppercase tracking-wider">Class: {getClassName(aoi.classId)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-2xs font-semibold uppercase tracking-wider block">Deadline</span>
                    <span className="text-slate-300 font-bold text-xs">{formatDate(aoi.deadline, 'PPP p')}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-4">{aoi.description}</p>

                {/* Rubric skills */}
                <div>
                  <p className="text-3xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Evaluation Rubric Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {aoi.rubric && Array.isArray(aoi.rubric) && aoi.rubric.map(r => (
                      <Badge key={r.skill} color="slate" variant="outline">
                        {r.skill} (Max: {r.maxScore})
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Submissions for this AOI */}
              <div className="pl-4 border-l border-white/5 space-y-3">
                <h4 className="text-2xs font-bold text-slate-500 uppercase tracking-widest pl-1">
                  Student Submissions ({aoiSubs.length})
                </h4>

                <div className="grid grid-cols-1 gap-3">
                  {aoiSubs.map(sub => {
                    const student = getStudentInfo(sub.studentId);
                    return (
                      <Card key={sub.id} className="p-4 bg-white/2 border border-white/5 hover:border-white/10 transition-colors" variant="glass">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5 mb-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(student.name)}`}
                              alt={student.name}
                              className="w-7 h-7 rounded bg-slate-700 shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-slate-200 text-xs">{student.name}</p>
                              <p className="text-3xs text-slate-500 font-mono">{student.regNo}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-3xs text-slate-500 font-semibold">{formatDate(sub.submittedAt, 'PP p')}</span>
                            <RubricBadge grade={sub.grade} />
                          </div>
                        </div>

                        <p className="text-xs text-slate-300 bg-white/1 p-2.5 rounded-lg border border-white/5 font-medium leading-relaxed mb-3">
                          {sub.content}
                        </p>

                        {sub.feedback ? (
                          <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-2.5 text-2xs">
                            <span className="font-bold text-blue-400 block mb-0.5">Teacher Feedback</span>
                            <p className="text-slate-400 italic font-medium">"{sub.feedback}"</p>
                          </div>
                        ) : (
                          <div className="text-2xs text-slate-500 italic">No feedback provided yet. Click to grade.</div>
                        )}
                      </Card>
                    );
                  })}
                  {aoiSubs.length === 0 && (
                    <p className="text-2xs text-slate-500 italic pl-1">No submissions received for this assignment yet.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Create Assignment (Needs Approval)</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if(!user) return;
              setSubmitting(true);
              try {
                await aoiService.create({
                  title,
                  description,
                  classId,
                  type,
                  teacherId: user!.id,
                  dueDate: new Date(dueDate).toISOString(),
                  deadline: new Date(dueDate).toISOString(),
                  rubric: []
                });
                setShowModal(false);
                fetchData(); // Trigger a re-fetch of AOIs
                alert('Assignment sent to Admin for approval.');
              } catch(err) {
                console.error(err);
              } finally {
                setSubmitting(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-medium mb-1 text-xs">Title</label>
                <input required value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:border-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1 text-xs">Description</label>
                <textarea required value={description} onChange={e=>setDescription(e.target.value)} className="w-full h-20 bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:border-blue-500 text-sm" />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1 text-xs">Type</label>
                <select value={type} onChange={e=>setType(e.target.value as 'assignment'|'exam')} className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:border-blue-500 text-sm">
                  <option value="assignment">Assignment</option>
                  <option value="exam">Exam</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1 text-xs">Class ID</label>
                <input required value={classId} onChange={e=>setClassId(e.target.value)} className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:border-blue-500 text-sm" placeholder="e.g. c1" />
              </div>
              <div>
                <label className="block text-slate-400 font-medium mb-1 text-xs">Due Date</label>
                <input type="datetime-local" required value={dueDate} onChange={e=>setDueDate(e.target.value)} className="w-full bg-slate-800/80 border border-white/10 rounded-xl px-3 py-2 text-slate-200 focus:border-blue-500 text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" loading={submitting}>Submit for Approval</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
