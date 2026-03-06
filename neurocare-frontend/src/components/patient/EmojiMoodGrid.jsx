import { useState } from 'react';
import api from '../../services/api';

const EMOJIS = [
  { id: 1, emoji: '😌', name: 'Calm', intensity: 1 },
  { id: 2, emoji: '😊', name: 'Happy', intensity: 1 },
  { id: 3, emoji: '😄', name: 'Very Happy', intensity: 1 },
  { id: 4, emoji: '🥰', name: 'Loved', intensity: 1 },
  { id: 5, emoji: '😐', name: 'Unsure', intensity: 2 },
  { id: 6, emoji: '😑', name: 'Numb', intensity: 2 },
  { id: 7, emoji: '😔', name: 'Sad', intensity: 3 },
  { id: 8, emoji: '😢', name: 'Very Sad', intensity: 4 },
  { id: 9, emoji: '😟', name: 'Worried', intensity: 3 },
  { id: 10, emoji: '😰', name: 'Anxious', intensity: 4 },
  { id: 11, emoji: '😡', name: 'Frustrated', intensity: 4 },
  { id: 12, emoji: '😤', name: 'Angry', intensity: 5 },
  { id: 13, emoji: '😵', name: 'Overwhelmed', intensity: 5 },
  { id: 14, emoji: '🤒', name: 'Uncomfortable', intensity: 3 },
  { id: 15, emoji: '😴', name: 'Tired', intensity: 2 },
  { id: 16, emoji: '🤗', name: 'Need a Hug', intensity: 3 },
];

const INTENSITY_LABELS = ['A little', 'Somewhat', 'Medium', 'A lot', 'Very much'];

export default function EmojiMoodGrid({ onClose, patientId }) {
  const [selected, setSelected] = useState(null);
  const [intensity, setIntensity] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selected || !intensity) return;
    setSubmitting(true);
    try {
      await api.post('/emotions', {
        patient_id: patientId,
        emoji_id: selected.id,
        intensity,
      });
      setSubmitted(true);
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      console.error('Failed to save emotion:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="nc-overlay" role="dialog" aria-modal="true">
        <div className="nc-card max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-nc-blue-deep mb-2">Thank you!</h2>
          <p className="text-nc-grey-mid">Your feelings matter and you shared them bravely.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nc-overlay" role="dialog" aria-modal="true">
      <div className="nc-card max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-nc-blue-deep text-center mb-6">
          💭 How are you feeling?
        </h2>

        {!selected ? (
          <div className="grid grid-cols-4 gap-3">
            {EMOJIS.map((e) => (
              <button key={e.id}
                onClick={() => setSelected(e)}
                className="flex flex-col items-center gap-1 p-3 rounded-xl2 border-2 border-transparent
                  hover:border-nc-lavender hover:bg-nc-lav-tint transition-all duration-safe
                  focus-visible:outline-4 focus-visible:outline-nc-blue-soft min-h-[88px]"
              >
                <span className="text-5xl">{e.emoji}</span>
                <span className="text-xs font-bold text-nc-grey-mid">{e.name}</span>
              </button>
            ))}
          </div>
        ) : !intensity ? (
          <div className="text-center">
            <div className="mb-6">
              <span className="text-6xl">{selected.emoji}</span>
              <h3 className="text-xl font-bold mt-2 text-nc-grey-dark">{selected.name}</h3>
              <p className="text-nc-grey-mid">How much do you feel this?</p>
            </div>
            <div className="flex flex-col gap-3">
              {INTENSITY_LABELS.map((label, idx) => (
                <button key={idx}
                  onClick={() => setIntensity(idx + 1)}
                  className="nc-btn-secondary w-full text-left flex items-center gap-3"
                >
                  <span className="text-lg font-bold text-nc-blue-mid">{idx + 1}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <button
              onClick={() => setSelected(null)}
              className="nc-btn-secondary mt-4"
            >
              ← Choose Different Emoji
            </button>
          </div>
        ) : (
          <div className="text-center">
            <span className="text-6xl">{selected.emoji}</span>
            <h3 className="text-xl font-bold mt-2">{selected.name}</h3>
            <p className="text-nc-grey-mid mb-4">Intensity: {intensity}/5</p>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="nc-btn-primary w-full"
            >
              {submitting ? 'Saving...' : '✓ Done'}
            </button>
            <button
              onClick={() => setIntensity(null)}
              className="nc-btn-secondary mt-3"
            >
              ← Change Intensity
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
