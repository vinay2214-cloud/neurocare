import { useState, useEffect } from 'react';
import api from '../../services/api';

const STEPS = [
  { count: 5, sense: 'SEE', emoji: '👀', instruction: 'Look around and name 5 things you can see' },
  { count: 4, sense: 'TOUCH', emoji: '🤲', instruction: 'Reach out and feel 4 things you can touch' },
  { count: 3, sense: 'HEAR', emoji: '👂', instruction: 'Listen carefully for 3 things you can hear' },
  { count: 2, sense: 'SMELL', emoji: '👃', instruction: 'Notice 2 things you can smell' },
  { count: 1, sense: 'TASTE', emoji: '👅', instruction: 'Focus on 1 thing you can taste' },
];

export default function GroundingChecklist({ onClose, interventionId }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [inputs, setInputs] = useState(STEPS.map(s => Array(s.count).fill('')));
  const [checked, setChecked] = useState(STEPS.map(s => Array(s.count).fill(false)));
  const [completed, setCompleted] = useState(false);

  const step = STEPS[stepIndex];
  const progress = (stepIndex / STEPS.length) * 100;

  const handleCheck = (idx) => {
    const newChecked = [...checked];
    newChecked[stepIndex] = [...newChecked[stepIndex]];
    newChecked[stepIndex][idx] = !newChecked[stepIndex][idx];
    setChecked(newChecked);

    if (newChecked[stepIndex].every(Boolean)) {
      setTimeout(() => {
        if (stepIndex < STEPS.length - 1) {
          setStepIndex(stepIndex + 1);
        } else {
          setCompleted(true);
        }
      }, 600);
    }
  };

  const handleInputChange = (idx, value) => {
    const newInputs = [...inputs];
    newInputs[stepIndex] = [...newInputs[stepIndex]];
    newInputs[stepIndex][idx] = value;
    setInputs(newInputs);
  };

  useEffect(() => {
    if (completed && interventionId) {
      api.post('/interventions/outcome', {
        intervention_id: interventionId,
        outcome: 'completed',
      }).catch(() => {});
    }
  }, [completed, interventionId]);

  if (completed) {
    return (
      <div className="nc-overlay" role="dialog" aria-modal="true">
        <div className="nc-card max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🌿</div>
          <h2 className="text-2xl font-bold text-nc-green-deep mb-2">Great job grounding yourself!</h2>
          <p className="text-nc-grey-mid mb-6">You connected with the world around you. Well done!</p>
          <button onClick={onClose} className="nc-btn-primary">
            ✓ I'm Okay
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="nc-overlay" role="dialog" aria-modal="true">
      <div className="nc-card max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-nc-blue-deep text-center mb-2">🌱 5-4-3-2-1 Grounding</h2>

        <div className="w-full bg-nc-grey-pale rounded-full h-2 mb-6">
          <div
            className="h-2 rounded-full bg-nc-green-mid transition-all duration-safe"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="text-center mb-6">
          <span className="text-6xl">{step.emoji}</span>
          <h3 className="text-xl font-bold mt-3 text-nc-grey-dark">
            {step.count} things you can {step.sense}
          </h3>
          <p className="text-nc-grey-mid">{step.instruction}</p>
        </div>

        <div className="space-y-3">
          {Array.from({ length: step.count }).map((_, idx) => (
            <div key={idx}
              onClick={() => handleCheck(idx)}
              className={`flex items-center gap-3 p-4 rounded-xl2 border-2 cursor-pointer transition-all duration-safe
                ${checked[stepIndex][idx]
                  ? 'border-nc-green-mid bg-nc-green-tint'
                  : 'border-nc-grey-pale bg-white hover:border-nc-blue-soft'}`}
            >
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-safe
                ${checked[stepIndex][idx] ? 'border-nc-green-mid bg-nc-green-mid text-white' : 'border-nc-grey-pale'}`}>
                {checked[stepIndex][idx] && '✓'}
              </div>
              <input
                type="text"
                placeholder={`Thing ${idx + 1}...`}
                value={inputs[stepIndex][idx]}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 bg-transparent border-none outline-none text-nc-grey-dark placeholder-nc-grey-mid"
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            if (interventionId) {
              api.post('/interventions/outcome', {
                intervention_id: interventionId,
                outcome: 'overridden',
              }).catch(() => {});
            }
            onClose();
          }}
          className="fixed bottom-6 right-6 w-20 h-20 rounded-full bg-white border-4 border-nc-green-mid
            text-nc-green-deep font-bold text-sm shadow-lg hover:bg-nc-green-tint transition-all duration-safe
            flex items-center justify-center z-50"
        >
          I'm Okay ✓
        </button>
      </div>
    </div>
  );
}
