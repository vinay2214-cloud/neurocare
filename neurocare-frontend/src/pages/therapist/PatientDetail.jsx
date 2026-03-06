import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import LiveMonitor from '../../components/therapist/LiveMonitor';
import WeeklyEDSTrend from '../../components/therapist/WeeklyEDSTrend';
import TriggerHeatmap from '../../components/therapist/TriggerHeatmap';
import EmotionFrequencyDisplay from '../../components/therapist/EmotionFrequencyDisplay';
import InterventionAnalytics from '../../components/therapist/InterventionAnalytics';
import ATECLongitudinalChart from '../../components/therapist/ATECLongitudinalChart';
import SessionLogTable from '../../components/therapist/SessionLogTable';

export default function PatientDetail() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  const pid = parseInt(patientId);

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, sRes] = await Promise.all([
          api.get(`/patients/${pid}`),
          api.get(`/patients/${pid}/summary`),
        ]);
        setPatient(pRes.data);
        setSummary(sRes.data);
      } catch (err) {
        console.error('Failed to load patient:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [pid]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="h-8 w-32 bg-nc-grey-pale animate-pulse rounded mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="nc-card h-48 animate-pulse bg-nc-grey-pale" />
          <div className="nc-card h-48 animate-pulse bg-nc-grey-pale" />
        </div>
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'physiology', label: '💓 Physiology' },
    { key: 'behavior', label: '🧩 Behavior' },
    { key: 'atec', label: '📋 ATEC' },
    { key: 'notes', label: '📝 Notes' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/therapist')}
          className="text-nc-blue-mid font-bold text-sm">← Dashboard</button>
        <h1 className="text-2xl font-bold text-nc-blue-deep">{patient?.name || 'Patient'}</h1>
        <span className="text-sm text-nc-grey-mid">{patient?.code}</span>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-safe
              ${tab === t.key
                ? 'bg-nc-blue-mid text-white'
                : 'bg-nc-beige text-nc-grey-dark hover:bg-nc-grey-pale'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <LiveMonitor patientId={pid} />
            <div className="nc-card">
              <h3 className="text-sm font-bold text-nc-grey-dark mb-3">7-Day Overview</h3>
              {summary && (
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div>
                    <div className="text-2xl font-bold text-nc-blue-deep">
                      {summary.eds_trend?.avg_eds?.toFixed(1) || '—'}
                    </div>
                    <div className="text-xs text-nc-grey-mid">Avg EDS</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-nc-terra">
                      {summary.eds_trend?.elevated_pct
                        ? `${(summary.eds_trend.elevated_pct * 100).toFixed(0)}%`
                        : '—'}
                    </div>
                    <div className="text-xs text-nc-grey-mid">Elevated</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-nc-green-deep">
                      {summary.intervention_acceptance_rate
                        ? `${(summary.intervention_acceptance_rate * 100).toFixed(0)}%`
                        : '—'}
                    </div>
                    <div className="text-xs text-nc-grey-mid">IAR</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-nc-lavender">
                      {summary.total_emotions || 0}
                    </div>
                    <div className="text-xs text-nc-grey-mid">Emotions</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <WeeklyEDSTrend patientId={pid} />
          <EmotionFrequencyDisplay patientId={pid} />
        </div>
      )}

      {tab === 'physiology' && (
        <div className="space-y-4">
          <LiveMonitor patientId={pid} />
          <WeeklyEDSTrend patientId={pid} />
          <TriggerHeatmap patientId={pid} />
        </div>
      )}

      {tab === 'behavior' && (
        <div className="space-y-4">
          <InterventionAnalytics patientId={pid} />
          <TriggerHeatmap patientId={pid} />
          <EmotionFrequencyDisplay patientId={pid} />
        </div>
      )}

      {tab === 'atec' && (
        <div className="space-y-4">
          <ATECLongitudinalChart patientId={pid} />
        </div>
      )}

      {tab === 'notes' && (
        <div className="space-y-4">
          <SessionLogTable patientId={pid} />
        </div>
      )}
    </div>
  );
}
