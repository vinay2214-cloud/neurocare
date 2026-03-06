import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PatientSidebar from '../../components/therapist/PatientSidebar';
import LiveMonitor from '../../components/therapist/LiveMonitor';
import WeeklyEDSTrend from '../../components/therapist/WeeklyEDSTrend';
import EmotionFrequencyDisplay from '../../components/therapist/EmotionFrequencyDisplay';

export default function TherapistDashboard() {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!selectedPatient) return;
    setLoading(true);
    api.get(`/patients/${selectedPatient.id}/summary`).then(res => {
      setSummary(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedPatient]);

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <PatientSidebar selectedId={selectedPatient?.id} onSelect={setSelectedPatient} />

      <main className="flex-1 overflow-y-auto p-6">
        {!selectedPatient ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🧠</div>
              <h2 className="text-xl font-bold text-nc-blue-deep mb-2">NeuroCare Therapist Dashboard</h2>
              <p className="text-nc-grey-mid">Select a patient from the sidebar to begin</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl space-y-4">
            <div className="rounded-2xl bg-gradient-to-r from-nc-blue-deep to-nc-blue-mid p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{selectedPatient.name}</h1>
                  <p className="text-sm text-white/70">{selectedPatient.code}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/therapist/patient/${selectedPatient.id}`)}
                    className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-bold transition-all">📊 Full Detail</button>
                  <button onClick={() => navigate(`/therapist/dashboard/${selectedPatient.id}`)}
                    className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-bold transition-all">🤖 AI Dashboard</button>
                  <button onClick={() => navigate(`/therapist/notes/${selectedPatient.id}`)}
                    className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-bold transition-all">📝 Notes</button>
                  <button onClick={() => navigate(`/therapist/settings/${selectedPatient.id}`)}
                    className="px-3 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-bold transition-all">⚙️ Settings</button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <LiveMonitor patientId={selectedPatient.id} />
              {loading ? (
                <div className="nc-card animate-pulse bg-nc-grey-pale h-48" />
              ) : summary ? (
                <div className="nc-card">
                  <h3 className="text-sm font-bold text-nc-grey-dark mb-3">7-Day Summary</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-2xl font-bold text-nc-blue-deep">
                        {summary.eds_7day_avg != null ? summary.eds_7day_avg.toFixed(1) : '—'}
                      </div>
                      <div className="text-xs text-nc-grey-mid">Avg EDS</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-nc-terra capitalize">
                        {summary.eds_trend || '—'}
                      </div>
                      <div className="text-xs text-nc-grey-mid">Trend</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-nc-green-deep">
                        {summary.intervention_acceptance_rate != null
                          ? `${summary.intervention_acceptance_rate.toFixed(0)}%`
                          : '—'}
                      </div>
                      <div className="text-xs text-nc-grey-mid">Intervention Acceptance</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-nc-lavender">
                        {summary.readings_count || 0}
                      </div>
                      <div className="text-xs text-nc-grey-mid">Sensor Readings</div>
                    </div>
                  </div>
                  {summary.top_emotions && summary.top_emotions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-nc-grey-pale">
                      <p className="text-xs text-nc-grey-mid mb-1">Top Emotions</p>
                      <div className="flex gap-2">
                        {summary.top_emotions.slice(0, 5).map((e, i) => (
                          <span key={i} className="text-lg">{e.emoji || '❓'}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <WeeklyEDSTrend patientId={selectedPatient.id} />
            <EmotionFrequencyDisplay patientId={selectedPatient.id} />
          </div>
        )}
      </main>
    </div>
  );
}
