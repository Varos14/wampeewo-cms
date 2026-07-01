import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { presentationService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function StudentPresentations() {
  const { user } = useAuthStore();
  const [presentations, setPresentations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real app we'd get the student's classId from their profile. 
  // For now, let's just fetch all or we can mock filtering.
  // The service returns all if we pass no classId, or we could pass it.
  const classId = 'c1'; // Mock Kato's class

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await presentationService.list({ classId });
        setPresentations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Online Classes</h2>
        <p className="text-xs text-slate-500 mt-1">Join scheduled Google Meet presentations from your teachers.</p>
      </div>

      {loading ? (
        <div className="text-slate-600 text-sm">Loading presentations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {presentations.length === 0 && (
            <p className="text-slate-500 italic text-sm col-span-2">No upcoming online classes scheduled.</p>
          )}
          {presentations.map(pres => (
            <Card key={pres.id} className="p-5" variant="glass">
              <div className="flex justify-between items-start mb-3">
                <Badge color="blue">Upcoming</Badge>
                <span className="text-xs font-semibold text-slate-600">
                  {new Date(pres.scheduledAt).toLocaleString()}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">{pres.title}</h3>
              <a 
                href={pres.meetLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors mt-2"
              >
                <span>🎥</span> Join Google Meet
              </a>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


