import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { noteService } from '../../services/api';
import { Note } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { formatDate } from '../../utils/helpers';

export const Notes: React.FC = () => {
  const { user } = useAuthStore();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadNotes();
    }
  }, [user]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await noteService.list(user!.id);
      setNotes(data);
    } catch (err: any) {
      setError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setError('');
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      await noteService.create({
        studentId: user!.id,
        title: title.trim(),
        content: content.trim(),
        tags,
      });
      setTitle('');
      setContent('');
      setTagsInput('');
      loadNotes();
    } catch (err) {
      setError('Failed to create note');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingContent.trim()) return;
    try {
      setError('');
      await noteService.update(id, editingContent.trim());
      setEditingNoteId(null);
      loadNotes();
    } catch (err) {
      setError('Failed to update note');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      setError('');
      await noteService.delete(id);
      loadNotes();
    } catch (err) {
      setError('Failed to delete note');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Summary Vault</h2>
        <p className="text-xs text-slate-500 mt-1">Write down class notes, curriculum summaries, and study resources.</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Note Form */}
        <Card className="p-6 h-fit" variant="glass">
          <h3 className="text-base font-bold text-slate-800 mb-4">Create Study Note</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-2xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Note Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Physics Formulas"
                className="w-full rounded-xl border border-black/5 bg-slate-950/45 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-2xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Note Details</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your study notes here..."
                rows={10}
                className="w-full rounded-xl border border-black/5 bg-slate-950/45 px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500/50"
                required
              />
            </div>
            <div>
              <label className="block text-2xs font-bold text-slate-600 uppercase tracking-widest mb-1.5">Tags (Comma-separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g. physics, light, term1"
                className="w-full rounded-xl border border-black/5 bg-slate-950/45 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500/50"
              />
            </div>
            <Button type="submit" className="w-full text-xs font-bold">
              Save Note
            </Button>
          </form>
        </Card>

        {/* Notes List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-slate-800 mb-2">My Saved Notes ({notes.length})</h3>
          
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">Loading notes...</div>
          ) : notes.length === 0 ? (
            <Card className="p-8 text-center" variant="glass">
              <p className="text-xs text-slate-500">No notes found. Create your first note on the left panel!</p>
            </Card>
          ) : (
            notes.map((note) => (
              <Card key={note.id} className="p-5" variant="glass">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{note.title}</h4>
                    <span className="text-3xs text-slate-500 font-semibold uppercase tracking-widest mt-1 block">
                      Saved: {formatDate(note.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingNoteId(note.id);
                        setEditingContent(note.content);
                      }}
                      className="p-1.5 text-slate-600 hover:text-blue-400 hover:bg-blue-500/15 rounded-lg transition"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/15 rounded-lg transition"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Edit Mode vs Display Mode */}
                {editingNoteId === note.id ? (
                  <div className="mt-4 space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-black/5 bg-slate-950/45 px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500/50"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(note.id)}
                        className="text-[10px] font-bold px-3 py-1.5"
                      >
                        Save Changes
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingNoteId(null)}
                        className="text-[10px] font-bold px-3 py-1.5"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm md:text-base text-slate-700 mt-4 whitespace-pre-wrap leading-relaxed">
                    {note.content}
                  </p>
                )}

                {/* Tags */}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-white/50 border border-slate-700/40 text-[9px] font-bold text-slate-600 rounded-md uppercase tracking-wider"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
export default Notes;


