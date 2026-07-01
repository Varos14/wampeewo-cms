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

  const handleApprove = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await aoiService.approve(id, status);
      await loadData();
    } catch (err) {
      console.error(err);
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
                      <Button variant="ghost" size="sm" onClick={() => handleApprove(aoi.id, 'rejected')}>
                        Reject
                      </Button>
                      <Button variant="primary" size="sm" onClick={() => handleApprove(aoi.id, 'approved')} className="bg-emerald-600 hover:bg-emerald-500 text-white">
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
    </div>
  );
}


