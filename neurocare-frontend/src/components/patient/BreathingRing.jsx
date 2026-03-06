import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';

const PHASES = [
  { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose...', color: '#A8C8E8', bgClass: 'bg-nc-blue-tint' },
  { name: 'Hold', duration: 7, instruction: 'Hold your breath gently...', color: '#8B7EC8', bgClass: 'bg-nc-lav-tint' },
  { name: 'Exhale', duration: 8, instruction: 'Breathe out slowly through your mouth...', color: '#5A9A72', bgClass: 'bg-nc-green-tint' },
];

const TOTAL_CYCLES = 3;

export default function BreathingRing({ onClose, interventionId }) {
  const [cycle, setCycle] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [countdown, setCountdown] = useState(PHASES[0].duration);
  const [completed, setCompleted] = useState(false);
  const timerRef = useRef(null);

  const phase = PHASES[phaseIndex];
  const totalPhaseTime = PHASES.reduce((a, p) => a + p.duration, 0);
  const currentPhaseProgress = 1 - countdown / phase.duration;

  useEffect(() => {
    if (completed) return;

    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          const nextPhase = phaseIndex + 1;
          if (nextPhase >= PHASES.length) {
            const nextCycle = cycle + 1;
            if (nextCycle >= TOTAL_CYCLES) {
              setCompleted(true);
              return 0;
            }
            setCycle(nextCycle);
            setPhaseIndex(0);
            return PHASES[0].duration;
          }
          setPhaseIndex(nextPhase);
          return PHASES[nextPhase].duration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phaseIndex, cycle, completed]);

  useEffect(() => {
    if (completed && interventionId) {
      api.post('/interventions/outcome', {
        intervention_id: interventionId,
        outcome: 'completed',
        duration_seconds: TOTAL_CYCLES * totalPhaseTime,
      }).catch(() => {});
    }
  }, [completed, interventionId, totalPhaseTime]);

  if (completed) {
    return (
      <div className="nc-overlay" role="dialog" aria-modal="true">
        <div className="nc-card max-w-md w-full mx-4 text-center">
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-nc-blue-deep mb-2">Well done!</h2>
          <p className="text-nc-grey-mid mb-6">You completed all 3 breathing cycles. Amazing job!</p>
          <button onClick={onClose} className="nc-btn-primary">
            ✓ I'm Okay
          </button>
        </div>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 95;
  const arcOffset = circumference - currentPhaseProgress * circumference;

  const scaleClass = phase.name === 'Inhale'
    ? 'scale-110'
    : phase.name === 'Exhale'
      ? 'scale-90'
      : 'scale-110';

  return (
    <div className="nc-overlay" role="dialog" aria-modal="true">
      <div className="nc-card max-w-md w-full mx-4 text-center">
        <h2 className="text-2xl font-bold text-nc-blue-deep mb-2">🫁 Breathe With Me</h2>

        <div className="w-full bg-nc-grey-pale rounded-full h-2 mb-6">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-nc-blue-mid to-nc-lavender transition-all duration-safe"
            style={{ width: `${((cycle * PHASES.length + phaseIndex) / (TOTAL_CYCLES * PHASES.length)) * 100}%` }}
          />
        </div>

        <div className="relative w-[220px] h-[220px] mx-auto mb-6">
          <svg width="220" height="220" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="95" fill="none" stroke="#EAE6E2" strokeWidth="12" />
            <circle cx="110" cy="110" r="95" fill="none"
              stroke={phase.color} strokeWidth="12" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={arcOffset}
              transform="rotate(-90 110 110)"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
          </svg>
          <div className={`absolute inset-0 flex items-center justify-center transition-transform duration-slow ${scaleClass}`}>
            <div className={`w-[140px] h-[140px] rounded-full ${phase.bgClass} flex flex-col items-center justify-center transition-all duration-slow`}>
              <span className="text-lg font-bold text-nc-grey-dark">{phase.name}</span>
              <span className="text-3xl font-bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {countdown}
              </span>
            </div>
          </div>
        </div>

        <p className="text-nc-grey-mid mb-6">{phase.instruction}</p>

        <div className="flex items-center justify-center gap-3">
          {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 transition-colors duration-safe
              ${i < cycle ? 'bg-nc-green-mid border-nc-green-mid' : i === cycle ? 'bg-nc-blue-mid border-nc-blue-mid' : 'border-nc-grey-pale'}`}
            />
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
