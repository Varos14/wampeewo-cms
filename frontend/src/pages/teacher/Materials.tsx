import { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { materialService } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const getFileUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiHost = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '');
  return `${apiHost}${url}`;
};

export default function TeacherMaterials() {
  const { user } = useAuthStore();
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await materialService.list({ teacherId: user.id });
      setMaterials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!file && !fileUrl) {
      alert('Please upload a file or specify a File URL.');
      return;
    }
    setSubmitting(true);
    try {
      await materialService.create({
        teacherId: user.id,
        title,
        description,
        fileUrl: file ? '' : fileUrl,
        fileData: file ? fileBase64 : null,
        fileName: file ? file.name : null,
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setFileUrl('');
      setFile(null);
      setFileBase64('');
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Failed to upload material');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Teaching Materials</h2>
          <p className="text-xs text-slate-500 mt-1">Upload notes, handouts, and reading materials for students.</p>
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <span className="mr-2">📄</span> Upload Material
        </Button>
      </div>

      {loading ? (
        <div className="text-slate-600">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {materials.length === 0 && (
            <p className="text-slate-500 italic text-sm col-span-3">No materials uploaded yet.</p>
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
                  className="text-blue-400 text-xs hover:text-blue-300 font-bold"
                >
                  Download ⬇
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white border border-black/10 rounded-2xl shadow-2xl p-6 text-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4">Upload New Material</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-600 font-medium mb-1 text-xs">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-white/80 border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
                />
              </div>
              
              <div>
                <label className="block text-slate-600 font-medium mb-1 text-xs">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-white/80 border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 text-xs h-16"
                />
              </div>

              <div className="border-t border-slate-100 pt-3">
                <p className="font-semibold text-slate-500 uppercase tracking-widest text-[10px] mb-2">Choose Upload Method</p>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1 text-2xs">Upload File from Local Machine</label>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                      className="w-full bg-slate-50 border border-black/10 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 text-2xs"
                    />
                    {file && <p className="text-[10px] text-emerald-600 mt-1 font-semibold">Selected: {file.name}</p>}
                  </div>

                  {!file && (
                    <div>
                      <label className="block text-slate-600 font-medium mb-1 text-2xs">Or Specify File URL (Google Drive, etc)</label>
                      <input
                        type="url"
                        value={fileUrl}
                        onChange={e => setFileUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-white border border-black/10 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="ghost" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</Button>
                <Button variant="primary" type="submit" loading={submitting}>Upload Material</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


