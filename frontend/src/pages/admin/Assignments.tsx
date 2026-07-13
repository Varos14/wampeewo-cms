import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { aoiService } from '../../services/api';
import { AOI } from '../../types';
import { formatDate } from '../../utils/helpers';
import { useAppDataStore } from '../../store/appDataStore';

export default function AdminAssignments() {
  const { teachers, classes, fetchData } = useAppDataStore();
  const [assignments, setAssignments] = useState<AOI[]>([]);
  const [loading, setLoading] = useState(true);

  // Rejection Modal State
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [submittingIds, setSubmittingIds] = useState<Set<string>>(new Set());

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchData();
      // Get all assignments across all teachers/classes
      const data = await aoiService.list(undefined, undefined);
      setAssignments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string, status: 'approved' | 'rejected', feedbackText?: string) => {
    try {
      setSubmittingIds(prev => new Set(prev).add(id));
      await aoiService.approve(id, status, feedbackText);
      await loadData();
      if (status === 'rejected') {
        setRejectId(null);
        setFeedback('');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update assignment status.');
    } finally {
      setSubmittingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Assignment Approvals</h2>
        <p className="text-xs text-slate-500 mt-1">Review and approve teacher-created assignments and exams.</p>
      </div>

      {loading ? (
        <div className="text-slate-600">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {assignments.length === 0 && (
            <p className="text-slate-500 italic text-sm">No assignments found.</p>
          )}
          {assignments.map(aoi => {
            const teacherName = teachers.find(t => t.id === aoi.teacherId)?.name || 'Unknown Teacher';
            const className = classes.find(c => c.id === aoi.classId)?.name || 'Unknown Class';

            return (
              <Card key={aoi.id} className="p-5 flex items-center justify-between" variant="glass">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge color={aoi.type === 'exam' ? 'rose' : 'blue'}>{aoi.type}</Badge>
                    <span className="text-slate-600 text-2xs font-semibold">{formatDate(aoi.dueDate || aoi.deadline, 'PPP')}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{aoi.title}</h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">{aoi.description}</p>
                  <div className="mt-3 text-xs text-slate-500 flex gap-4">
                    <span>Due: {new Date(aoi.dueDate || aoi.deadline).toLocaleDateString()}</span>
                    <span>Teacher: {teacherName}</span>
                    <span>Class: {className}</span>
                  </div>
                  {aoi.status === 'rejected' && aoi.feedback && (
                    <div className="mt-3 bg-rose-50 border border-rose-100 rounded-lg p-3 text-sm text-rose-800">
                      <strong>Rejection Reason:</strong> {aoi.feedback}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge color={
                    aoi.status === 'approved' ? 'emerald' :
                    aoi.status === 'rejected' ? 'rose' : 'amber'
                  }>
                    {aoi.status || 'pending'}
                  </Badge>
                  
                  {(aoi.status === 'pending' || !aoi.status) && (
                    <div className="flex gap-2 mt-2">
                      <Button variant="ghost" size="sm" onClick={() => setRejectId(aoi.id)} disabled={submittingIds.has(aoi.id)}>
                        Reject
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleApprove(aoi.id, 'approved')} className="bg-emerald-600 hover:bg-emerald-500 text-white" disabled={submittingIds.has(aoi.id)} loading={submittingIds.has(aoi.id)}>
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Rejection Modal */}
      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-white border border-black/10 rounded-2xl shadow-2xl p-6 w-full max-w-md animate-fade-in">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Reject Assignment</h3>
            <p className="text-sm text-slate-500 mb-4">Please provide feedback to the teacher explaining why this assignment is being rejected.</p>
            
            <textarea
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 min-h-[120px] mb-4"
              placeholder="e.g., The rubric is missing grading criteria for grammar."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => { setRejectId(null); setFeedback(''); }} disabled={rejectId ? submittingIds.has(rejectId) : false}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                className="bg-rose-600 hover:bg-rose-500 text-white" 
                onClick={() => rejectId && handleApprove(rejectId, 'rejected', feedback)}
                disabled={!feedback.trim() || (rejectId ? submittingIds.has(rejectId) : false)}
                loading={rejectId ? submittingIds.has(rejectId) : false}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


