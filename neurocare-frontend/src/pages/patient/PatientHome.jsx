import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSensor } from '../../contexts/SensorContext';
import StateDisplay from '../../components/patient/StateDisplay';
import SensorReadings from '../../components/patient/SensorReadings';
import EmojiMoodGrid from '../../components/patient/EmojiMoodGrid';
import BreathingRing from '../../components/patient/BreathingRing';
import GroundingChecklist from '../../components/patient/GroundingChecklist';
import InterventionOverlay from '../../components/patient/InterventionOverlay';
import TodayStats from '../../components/patient/TodayStats';
import api from '../../services/api';

export default function PatientHome() {
  const { user } = useAuth();
  const { sensorData, edsData, subscribe } = useSensor();

  const [eds, setEds] = useState(25);
  const [edsState, setEdsState] = useState('calm');
  const [sensor, setSensor] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [intervention, setIntervention] = useState(null);
  const [context, setContext] = useState('home');
  const [sustainedCount, setSustainedCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      subscribe(user.id);
      api.get(`/patients/${user.id}/live`)
        .then(res => {
          setSensor(res.data);
          setEds(res.data.eds || 25);
          setEdsState(res.data.eds_state || 'calm');
        })
        .catch(() => {});
    }
  }, [user, subscribe]);

  useEffect(() => {
    if (sensorData) {
      setSensor(sensorData);
      if (sensorData.eds !== undefined) {
        setEds(sensorData.eds);
        setEdsState(sensorData.eds_state || 'calm');
      }
    }
  }, [sensorData]);

  useEffect(() => {
    if (edsData) {
      setEds(edsData.eds);
      setEdsState(edsData.eds_state || 'calm');
    }
  }, [edsData]);

  useEffect(() => {
    if (overlay) return;
    if (eds >= 55) {
      setSustainedCount(prev => {
        const next = prev + 1;
        if (next >= 6) {
          api.post('/interventions/trigger', {
            patient_id: user?.id,
            eds,
            eds_state: edsState,
            context: { location: context },
            force: true,
          })
            .then(res => {
              if (res.data.triggered) {
                setIntervention(res.data);
                setOverlay('intervention');
              }
            })
            .catch(() => {});
          return 0;
        }
        return next;
      });
    } else {
      setSustainedCount(prev => Math.max(0, prev - 1));
    }
  }, [eds, edsState, overlay, user, context]);

  return (
    <div className="min-h-screen bg-nc-cream">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="nc-card flex flex-col items-center py-8">
              <StateDisplay eds={eds} edsState={edsState} />
              <div className="mt-6">
                <SensorReadings sensor={sensor} />
              </div>
            </div>
            <TodayStats patientId={user?.id} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="nc-card">
              <h3 className="text-lg font-bold text-nc-grey-dark mb-4">I need help with...</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setOverlay('breathing')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl2 bg-nc-blue-tint hover:bg-nc-blue-soft/30 transition-all duration-safe text-left"
                >
                  <div className="w-12 h-12 rounded-xl2 bg-nc-blue-soft/40 flex items-center justify-center text-2xl">🫁</div>
                  <div>
                    <div className="font-bold text-nc-blue-deep">Breathe With Me</div>
                    <div className="text-sm text-nc-grey-mid">Calm breathing exercise</div>
                  </div>
                </button>
                <button
                  onClick={() => setOverlay('grounding')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl2 bg-nc-green-tint hover:bg-nc-green-mid/20 transition-all duration-safe text-left"
                >
                  <div className="w-12 h-12 rounded-xl2 bg-nc-green-mid/20 flex items-center justify-center text-2xl">🌱</div>
                  <div>
                    <div className="font-bold text-nc-green-deep">Ground Myself</div>
                    <div className="text-sm text-nc-grey-mid">5-4-3-2-1 senses exercise</div>
                  </div>
                </button>
                <button
                  onClick={() => setOverlay('mood')}
                  className="w-full flex items-center gap-4 p-4 rounded-xl2 bg-nc-lav-tint hover:bg-nc-lavender/20 transition-all duration-safe text-left"
                >
                  <div className="w-12 h-12 rounded-xl2 bg-nc-lavender/20 flex items-center justify-center text-2xl">💭</div>
                  <div>
                    <div className="font-bold text-nc-lavender">How I Feel</div>
                    <div className="text-sm text-nc-grey-mid">Choose an emoji for your mood</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="nc-card">
              <h3 className="text-sm font-bold text-nc-grey-mid mb-3">Where are you?</h3>
              <div className="flex gap-2">
                {[
                  { id: 'school', emoji: '🏫', label: 'School' },
                  { id: 'home', emoji: '🏠', label: 'Home' },
                  { id: 'work', emoji: '💼', label: 'Work' },
                ].map(loc => (
                  <button key={loc.id}
                    onClick={() => setContext(loc.id)}
                    className={`flex-1 py-3 rounded-full font-bold text-sm transition-all duration-safe
                      ${context === loc.id
                        ? 'bg-nc-blue-mid text-white'
                        : 'bg-nc-beige text-nc-grey-dark hover:bg-nc-grey-pale'}`}
                  >
                    {loc.emoji} {loc.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {overlay === 'mood' && (
        <EmojiMoodGrid onClose={() => setOverlay(null)} patientId={user?.id} />
      )}
      {overlay === 'breathing' && (
        <BreathingRing onClose={() => setOverlay(null)} />
      )}
      {overlay === 'grounding' && (
        <GroundingChecklist onClose={() => setOverlay(null)} />
      )}
      {overlay === 'intervention' && intervention && (
        <InterventionOverlay
          intervention={intervention}
          patientId={user?.id}
          onDismiss={() => { setOverlay(null); setIntervention(null); }}
        />
      )}

      <button
        onClick={() => setOverlay(null)}
        className="fixed bottom-6 right-6 w-20 h-20 rounded-full bg-white border-4 border-nc-green-mid
          text-nc-green-deep font-bold text-sm shadow-lg hover:bg-nc-green-tint transition-all duration-safe
          flex items-center justify-center z-40"
      >
        I'm Okay ✓
      </button>
    </div>
  );
}
