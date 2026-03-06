import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function SessionLogTable({ patientId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    api.get(`/therapist/notes?patient_id=${patientId}`).then(res => {
      setNotes(res.data.notes || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return <div className="nc-card h-48 animate-pulse bg-nc-grey-pale" />;
  }

  if (notes.length === 0) {
    return (
      <div className="nc-card text-center py-8">
        <p className="text-nc-grey-mid">No session notes yet</p>
      </div>
    );
  }

  const TYPE_BADGES = {
    session: 'bg-nc-blue-tint text-nc-blue-deep',
    observation: 'bg-nc-green-tint text-nc-green-deep',
    medication: 'bg-nc-amber-tint text-nc-terra',
    atec: 'bg-nc-lav-tint text-nc-lavender',
    goal: 'bg-nc-beige text-nc-grey-dark',
  };

  return (
    <div className="nc-card">
      <h3 className="text-sm font-bold text-nc-grey-dark mb-3">Session Notes</h3>
      <div className="divide-y divide-nc-grey-pale">
        {notes.map(note => {
          const isExpanded = expandedId === note.id;
          return (
            <div key={note.id} className="py-3">
              <button
                onClick={() => setExpandedId(isExpanded ? null : note.id)}
                className="w-full text-left flex items-center gap-3"
              >
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${TYPE_BADGES[note.note_type] || TYPE_BADGES.session}`}>
                  {note.note_type}
                </span>
                <span className="flex-1 text-sm font-bold text-nc-grey-dark truncate">
                  {note.title || note.content?.slice(0, 50) || 'Untitled'}
                </span>
                <span className="text-xs text-nc-grey-mid">
                  {new Date(note.created_at).toLocaleDateString()}
                </span>
                <svg className={`w-4 h-4 transition-transform duration-safe ${isExpanded ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isExpanded && (
                <div className="mt-2 pl-4 border-l-2 border-nc-blue-tint">
                  <p className="text-sm text-nc-grey-mid whitespace-pre-wrap">{note.content}</p>
                  {note.tags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(typeof note.tags === 'string' ? JSON.parse(note.tags) : note.tags || []).map((tag, i) => (
                        <span key={i} className="text-xs bg-nc-grey-pale text-nc-grey-mid px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
