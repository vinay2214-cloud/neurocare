import { useState } from 'react';
import api from '../../services/api';

const NOTE_TYPES = [
  { value: 'session', label: 'Session Note', icon: '📝' },
  { value: 'observation', label: 'Observation', icon: '👁️' },
  { value: 'medication', label: 'Medication', icon: '💊' },
  { value: 'atec', label: 'ATEC Review', icon: '📋' },
  { value: 'goal', label: 'Goal Update', icon: '🎯' },
];

export default function NotesEditor({ patientId, onSaved }) {
  const [noteType, setNoteType] = useState('session');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) return;
    setSaving(true);
    try {
      await api.post('/therapist/notes', {
        patient_id: patientId,
        note_type: noteType,
        title: title.trim() || undefined,
        content: content.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setSaved(true);
      setTitle('');
      setContent('');
      setTags('');
      onSaved && onSaved();
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    const summary = `[${noteType.toUpperCase()}] ${title}\n\n${content}\n\nTags: ${tags}`;
    navigator.clipboard.writeText(summary);
  };

  return (
    <div className="nc-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-nc-grey-dark">New Note</h3>
        {saved && <span className="text-sm text-nc-green-deep font-bold">✓ Saved</span>}
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {NOTE_TYPES.map(t => (
          <button key={t.value} onClick={() => setNoteType(t.value)}
            className={`px-3 py-1.5 text-xs rounded-full font-bold transition-all duration-safe
              ${noteType === t.value
                ? 'bg-nc-blue-mid text-white'
                : 'bg-nc-beige text-nc-grey-dark hover:bg-nc-grey-pale'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="nc-input mb-2 text-sm" />

      <textarea value={content} onChange={(e) => setContent(e.target.value)}
        placeholder="Write your note..."
        className="nc-input min-h-[120px] mb-2 text-sm" />

      <input type="text" value={tags} onChange={(e) => setTags(e.target.value)}
        placeholder="Tags (comma-separated)"
        className="nc-input mb-3 text-sm" />

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={!content.trim() || saving}
          className="nc-btn-primary flex-1 disabled:opacity-40 text-sm">
          {saving ? 'Saving...' : '✓ Save Note'}
        </button>
        <button onClick={handleCopy}
          className="nc-btn-outline text-sm px-4">
          📋 Copy
        </button>
      </div>
    </div>
  );
}
