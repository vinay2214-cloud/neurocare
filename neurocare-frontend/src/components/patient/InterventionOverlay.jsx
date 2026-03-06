import { useState, useEffect } from 'react';
import BreathingRing from './BreathingRing';
import GroundingChecklist from './GroundingChecklist';
import EmojiMoodGrid from './EmojiMoodGrid';
import api from '../../services/api';

export default function InterventionOverlay({ intervention, patientId, onDismiss }) {
  const [interventionId, setInterventionId] = useState(intervention?.intervention_id || null);
  const type = intervention?.intervention?.type || intervention?.type || 'breathing';

  const handleClose = () => {
    onDismiss();
  };

  const handleOverride = async () => {
    if (interventionId) {
      try {
        await api.post('/interventions/outcome', {
          intervention_id: interventionId,
          outcome: 'overridden',
        });
      } catch {}
    }
    onDismiss();
  };

  if (type === 'breathing') {
    return <BreathingRing onClose={handleClose} interventionId={interventionId} />;
  }

  if (type === 'grounding') {
    return <GroundingChecklist onClose={handleClose} interventionId={interventionId} />;
  }

  if (type === 'emoji_mood') {
    return <EmojiMoodGrid onClose={handleClose} patientId={patientId} />;
  }

  if (type === 'thought_reframe') {
    return <ThoughtReframe onClose={handleClose} interventionId={interventionId} />;
  }

  if (type === 'body_scan') {
    return <BodyScan onClose={handleClose} interventionId={interventionId} />;
  }

  return <BreathingRing onClose={handleClose} interventionId={interventionId} />;
}

function ThoughtReframe({ onClose, interventionId }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState(['', '', '', '']);
  const [completed, setCompleted] = useState(false);

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
      setCompleted(true);
      if (interventionId) {
        api.post('/interventions/outcome', {
          intervention_id: interventionId,
          outcome: 'completed',
        }).catch(() => {});
      }
    }
  };

  if (completed) {
    return (
      <div className="nc-overlay" role="dialog" aria-modal="true">
        <div className="nc-card max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-nc-blue-deep mb-2">Great thinking!</h2>
          <p className="text-nc-grey-mid mb-6">You explored your thoughts with courage.</p>
          <button onClick={onClose} className="nc-btn-primary">✓ I'm Okay</button>
        </div>
      </div>
    );
  }

  return (
    <div className="nc-overlay" role="dialog" aria-modal="true">
      <div className="nc-card max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-nc-blue-deep text-center mb-4">💭 Thought Reframing</h2>
        <div className="text-center mb-6">
          <span className="text-5xl">{steps[stepIndex].emoji}</span>
          <h3 className="text-lg font-bold mt-3">{steps[stepIndex].q}</h3>
        </div>
        <textarea
          className="nc-input min-h-[100px] mb-4"
          value={answers[stepIndex]}
          onChange={(e) => {
            const a = [...answers];
            a[stepIndex] = e.target.value;
            setAnswers(a);
          }}
          placeholder="Write your thoughts here..."
        />
        <button onClick={handleNext} className="nc-btn-primary w-full">
          {stepIndex < steps.length - 1 ? 'Next →' : '✓ Done'}
        </button>
        <button onClick={onClose}
          className="fixed bottom-6 right-6 w-20 h-20 rounded-full bg-white border-4 border-nc-green-mid text-nc-green-deep font-bold text-sm shadow-lg flex items-center justify-center z-50">
          I'm Okay ✓
        </button>
      </div>
    </div>
  );
}

function BodyScan({ onClose, interventionId }) {
  const [areaIndex, setAreaIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  const areas = [
    { name: 'Head', emoji: '🧠', instruction: 'Notice any tension in your head and forehead. Let it soften.' },
    { name: 'Shoulders', emoji: '💪', instruction: 'Drop your shoulders away from your ears. Feel them relax.' },
    { name: 'Chest', emoji: '💓', instruction: 'Take a deep breath. Feel your chest rise and fall.' },
    { name: 'Hands', emoji: '🤲', instruction: 'Unclench your hands. Feel the warmth in your palms.' },
    { name: 'Feet', emoji: '🦶', instruction: 'Feel the ground beneath your feet. You are grounded.' },
  ];

  const handleNext = () => {
    if (areaIndex < areas.length - 1) {
      setAreaIndex(areaIndex + 1);
    } else {
      setCompleted(true);
      if (interventionId) {
        api.post('/interventions/outcome', {
          intervention_id: interventionId,
          outcome: 'completed',
        }).catch(() => {});
      }
    }
  };

  if (completed) {
    return (
      <div className="nc-overlay" role="dialog" aria-modal="true">
        <div className="nc-card max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-nc-blue-deep mb-2">Body scan complete!</h2>
          <p className="text-nc-grey-mid mb-6">You've connected with your body. Well done.</p>
          <button onClick={onClose} className="nc-btn-primary">✓ I'm Okay</button>
        </div>
      </div>
    );
  }

  return (
    <div className="nc-overlay" role="dialog" aria-modal="true">
      <div className="nc-card max-w-md w-full mx-4 text-center">
        <h2 className="text-2xl font-bold text-nc-blue-deep mb-4">🧘 Body Scan</h2>
        <div className="w-full bg-nc-grey-pale rounded-full h-2 mb-6">
          <div className="h-2 rounded-full bg-nc-lavender transition-all duration-safe"
            style={{ width: `${(areaIndex / areas.length) * 100}%` }} />
        </div>
        <span className="text-6xl">{areas[areaIndex].emoji}</span>
        <h3 className="text-xl font-bold mt-4 mb-2">{areas[areaIndex].name}</h3>
        <p className="text-nc-grey-mid mb-6">{areas[areaIndex].instruction}</p>
        <button onClick={handleNext} className="nc-btn-primary w-full">
          {areaIndex < areas.length - 1 ? 'Next Area →' : '✓ Complete'}
        </button>
        <button onClick={onClose}
          className="fixed bottom-6 right-6 w-20 h-20 rounded-full bg-white border-4 border-nc-green-mid text-nc-green-deep font-bold text-sm shadow-lg flex items-center justify-center z-50">
          I'm Okay ✓
        </button>
      </div>
    </div>
  );
}
