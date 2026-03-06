import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/shared/NavBar';
import api from '../../services/api';

export default function ThoughtJournal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [saved, setSaved] = useState(false);

  const steps = [
    { q: 'What am I thinking right now?', emoji: '💭' },
    { q: 'Is this thought a fact or a feeling?', emoji: '🤔' },
    { q: 'What would I tell a friend who thought this?', emoji: '💬' },
    { q: 'What is a more balanced way to see this?', emoji: '🌈' },
  ];

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      api.post('/emotions', {
        patient_id: user?.id,
        emoji_id: 1,
        intensity: 2,
        notes: `Thought journal: ${answers.join(' | ')}`,
      }).then(() => setSaved(true))
        .catch(() => setSaved(true));
    }
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-nc-cream">
        <NavBar />
        <div className="flex items-center justify-center mt-20">
          <div className="nc-card max-w-md text-center">
            <div className="text-6xl mb-4">🌟</div>
            <h2 className="text-2xl font-bold text-nc-blue-deep mb-2">Journal saved!</h2>
            <p className="text-nc-grey-mid mb-6">Great job reflecting on your thoughts.</p>
            <button onClick={() => navigate('/patient')} className="nc-btn-primary">Go Back Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nc-cream">
      <NavBar />
      <div className="flex items-center justify-center mt-12">
        <div className="nc-card max-w-md w-full mx-4">
          <h2 className="text-2xl font-bold text-nc-blue-deep text-center mb-2">💭 Thought Journal</h2>
          <div className="w-full bg-nc-grey-pale rounded-full h-2 mb-6">
            <div className="h-2 rounded-full bg-nc-lavender transition-all duration-safe"
              style={{ width: `${(stepIndex / steps.length) * 100}%` }} />
          </div>
          <div className="text-center mb-6">
            <span className="text-5xl">{steps[stepIndex].emoji}</span>
            <h3 className="text-lg font-bold mt-3">{steps[stepIndex].q}</h3>
          </div>
          <textarea
            className="nc-input min-h-[120px] mb-4"
            value={answers[stepIndex]}
            onChange={(e) => {
              const a = [...answers];
              a[stepIndex] = e.target.value;
              setAnswers(a);
            }}
            placeholder="Write your thoughts here..."
          />
          <button onClick={handleNext} className="nc-btn-primary w-full">
            {stepIndex < steps.length - 1 ? 'Next →' : '✓ Save Journal'}
          </button>
        </div>
      </div>
    </div>
  );
}
