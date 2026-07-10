import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { materialService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const getFileUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiHost = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '');
  return `${apiHost}${url}`;
};

export default function StudentMaterials() {
  const { user } = useAuthStore();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const data = await materialService.list({});
        setMaterials(data);
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
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Learning Materials</h2>
        <p className="text-xs text-slate-500 mt-1">Access notes and handouts uploaded by your teachers.</p>
      </div>

      {loading ? (
        <div className="text-slate-600 text-sm">Loading materials...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {materials.length === 0 && (
            <p className="text-slate-500 italic text-sm col-span-3">No learning materials available.</p>
          )}
          {materials.map(mat => (
            <Card key={mat.id} className="p-5 flex flex-col justify-between" variant="glass">
              <div>
                <h3 className="font-bold text-slate-900 text-base mb-1">{mat.title}</h3>
                <p className="text-xs text-slate-600 mb-4">{mat.description}</p>
              </div>
              <div className="flex justify-between items-center mt-2 pt-3 border-t border-black/5">
                <span className="text-2xs text-slate-500">{new Date(mat.uploadedAt).toLocaleDateString()}</span>
                <a 
                  href={getFileUrl(mat.fileUrl)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 text-xs hover:text-blue-300 font-bold flex items-center gap-1"
                >
                  Download <span>⬇</span>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


