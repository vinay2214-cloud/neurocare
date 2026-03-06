import { useState } from 'react';
import api from '../../services/api';

const EVENT_OPTIONS = [
  { type: 'meltdown', emoji: '😤', label: 'Meltdown' },
  { type: 'aggression', emoji: '👊', label: 'Aggression' },
  { type: 'stimming', emoji: '🔄', label: 'Stimming' },
  { type: 'task_completion', emoji: '✅', label: 'Task Done' },
  { type: 'routine_break', emoji: '🛑', label: 'Routine Break' },
  { type: 'social_withdrawal', emoji: '🙈', label: 'Withdrawal' },
  { type: 'transition_difficulty', emoji: '🔀', label: 'Transition' },
  { type: 'eye_contact', emoji: '👁️', label: 'Eye Contact' },
  { type: 'communication', emoji: '💬', label: 'Communicated' },
];

const SEVERITY_OPTIONS = [
  { value: 1, label: 'No problem', color: 'bg-nc-green-tint text-nc-green-deep' },
  { value: 2, label: 'Minor', color: 'bg-nc-blue-tint text-nc-blue-deep' },
  { value: 3, label: 'Moderate', color: 'bg-nc-amber-tint text-nc-amber' },
  { value: 4, label: 'Serious', color: 'bg-nc-terra-tint text-nc-terra' },
];

const LOCATIONS = [
  { id: 'home', emoji: '🏠', label: 'Home' },
  { id: 'school', emoji: '🏫', label: 'School' },
  { id: 'outside', emoji: '🌳', label: 'Outside' },
  { id: 'public', emoji: '🏪', label: 'Public' },
];

const ACTIVITIES = [
  { id: 'learning', emoji: '📚', label: 'Learning' },
  { id: 'playing', emoji: '🎮', label: 'Playing' },
  { id: 'eating', emoji: '🍽️', label: 'Eating' },
  { id: 'routine', emoji: '🛁', label: 'Routine' },
  { id: 'social', emoji: '👥', label: 'Social' },
];

const NOISE_LEVELS = [
  { id: 1, emoji: '🔇', label: 'Quiet' },
  { id: 3, emoji: '🔉', label: 'Normal' },
  { id: 5, emoji: '🔊', label: 'Loud' },
];

export default function BehaviorEventForm({ patientId, onDone }) {
  const [step, setStep] = useState(1);
  const [eventType, setEventType] = useState(null);
  const [severity, setSeverity] = useState(null);
  const [location, setLocation] = useState(null);
  const [activity, setActivity] = useState(null);
  const [noiseLevel, setNoiseLevel] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/caregiver/behavioral-event', {
        patient_id: patientId,
        event_type: eventType,
        severity: severity || 1,
        location,
        activity,
        noise_level: noiseLevel,
        notes,
      });
      setDone(true);
      setTimeout(() => onDone && onDone(), 2000);
    } catch (err) {
      console.error('Failed to submit event:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="nc-card text-center">
        <div className="text-5xl mb-3">✅</div>
        <h3 className="text-xl font-bold text-nc-green-deep">Event Logged</h3>
        <p className="text-nc-grey-mid">Thank you for recording this observation.</p>
      </div>
    );
  }

  return (
    <div className="nc-card">
      <h2 className="text-xl font-bold text-nc-blue-deep mb-4">📋 Log a Behavior</h2>

      <div className="w-full bg-nc-grey-pale rounded-full h-2 mb-6">
        <div className="h-2 rounded-full bg-nc-blue-mid transition-all duration-safe"
          style={{ width: `${(step / 4) * 100}%` }} />
      </div>

      {step === 1 && (
        <div>
          <h3 className="font-bold mb-3">What happened?</h3>
          <div className="grid grid-cols-3 gap-3">
            {EVENT_OPTIONS.map(opt => (
              <button key={opt.type}
                onClick={() => { setEventType(opt.type); setStep(2); }}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl2 border-2 transition-all duration-safe min-h-[80px]
                  ${eventType === opt.type ? 'border-nc-lavender bg-nc-lav-tint' : 'border-nc-grey-pale bg-white hover:border-nc-blue-soft'}`}
              >
                <span className="text-3xl">{opt.emoji}</span>
                <span className="text-xs font-bold text-nc-grey-mid">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h3 className="font-bold mb-3">How serious?</h3>
          <div className="space-y-3">
            {SEVERITY_OPTIONS.map(opt => (
              <button key={opt.value}
                onClick={() => { setSeverity(opt.value); setStep(3); }}
                className={`w-full p-4 rounded-xl2 font-bold text-left transition-all duration-safe ${opt.color} hover:opacity-80`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)} className="nc-btn-secondary mt-4">← Back</button>
        </div>
      )}

      {step === 3 && (
        <div>
          <h3 className="font-bold mb-3">Context</h3>
          <div className="mb-4">
            <label className="text-sm font-bold text-nc-grey-mid mb-2 block">Where?</label>
            <div className="flex gap-2 flex-wrap">
              {LOCATIONS.map(loc => (
                <button key={loc.id}
                  onClick={() => setLocation(loc.id)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-safe
                    ${location === loc.id ? 'bg-nc-blue-mid text-white' : 'bg-nc-beige text-nc-grey-dark hover:bg-nc-grey-pale'}`}
                >
                  {loc.emoji} {loc.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-bold text-nc-grey-mid mb-2 block">Activity?</label>
            <div className="flex gap-2 flex-wrap">
              {ACTIVITIES.map(a => (
                <button key={a.id}
                  onClick={() => setActivity(a.id)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-safe
                    ${activity === a.id ? 'bg-nc-blue-mid text-white' : 'bg-nc-beige text-nc-grey-dark hover:bg-nc-grey-pale'}`}
                >
                  {a.emoji} {a.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-bold text-nc-grey-mid mb-2 block">Noise level?</label>
            <div className="flex gap-2">
              {NOISE_LEVELS.map(n => (
                <button key={n.id}
                  onClick={() => setNoiseLevel(n.id)}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-safe
                    ${noiseLevel === n.id ? 'bg-nc-blue-mid text-white' : 'bg-nc-beige text-nc-grey-dark hover:bg-nc-grey-pale'}`}
                >
                  {n.emoji} {n.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="nc-btn-secondary">← Back</button>
            <button onClick={() => setStep(4)} className="nc-btn-primary flex-1">Next →</button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h3 className="font-bold mb-3">Notes (optional)</h3>
          <textarea
            className="nc-input min-h-[100px] mb-4"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional observations..."
          />
          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="nc-btn-secondary">← Back</button>
            <button onClick={handleSubmit} disabled={submitting} className="nc-btn-primary flex-1">
              {submitting ? 'Saving...' : '✓ Submit Event'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
