import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function ClinicalSettings({ patientId }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    api.get(`/patients/${patientId}`).then(res => {
      setProfile(res.data.sensory_profile || {
        auditory_sensitivity: 3,
        visual_sensitivity: 3,
        tactile_sensitivity: 3,
        vestibular_sensitivity: 3,
        proprioceptive_sensitivity: 3,
        olfactory_sensitivity: 3,
        gustatory_sensitivity: 3,
        preferred_inputs: [],
        sensory_diet_protocol: 'standard',
        intervention_threshold: 55,
        resting_hr: 75,
        resting_hrv: 45,
        resting_gsr: 4.5,
        resting_temp: 33.0,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [patientId]);

  const update = (key, value) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/therapist/sensory-profile/${patientId}`, profile);
      setSaved(true);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return <div className="nc-card h-64 animate-pulse bg-nc-grey-pale" />;
  }

  const SENSORY_FIELDS = [
    { key: 'auditory_sensitivity', label: 'Auditory' },
    { key: 'visual_sensitivity', label: 'Visual' },
    { key: 'tactile_sensitivity', label: 'Tactile' },
    { key: 'vestibular_sensitivity', label: 'Vestibular' },
    { key: 'proprioceptive_sensitivity', label: 'Proprioceptive' },
    { key: 'olfactory_sensitivity', label: 'Olfactory' },
    { key: 'gustatory_sensitivity', label: 'Gustatory' },
  ];

  const PROTOCOLS = ['standard', 'breathing', 'grounding', 'emoji_mood', 'body_scan', 'thought_reframe'];

  return (
    <div className="space-y-4">
      <div className="nc-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-nc-grey-dark">Sensory Profile</h3>
          {saved && <span className="text-sm text-nc-green-deep font-bold">✓ Saved</span>}
        </div>

        <div className="space-y-3">
          {SENSORY_FIELDS.map(f => (
            <div key={f.key} className="flex items-center justify-between">
              <label className="text-sm text-nc-grey-mid w-28">{f.label}</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => update(f.key, n)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all duration-safe
                      ${profile[f.key] === n
                        ? 'bg-nc-blue-mid text-white'
                        : 'bg-nc-beige text-nc-grey-dark hover:bg-nc-grey-pale'}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="nc-card">
        <h3 className="text-sm font-bold text-nc-grey-dark mb-3">Intervention Settings</h3>

        <div className="mb-3">
          <label className="text-sm text-nc-grey-mid mb-1 block">Preferred Protocol</label>
          <div className="flex flex-wrap gap-2">
            {PROTOCOLS.map(p => (
              <button key={p} onClick={() => update('sensory_diet_protocol', p)}
                className={`px-3 py-1.5 text-xs rounded-full font-bold transition-all duration-safe
                  ${profile.sensory_diet_protocol === p
                    ? 'bg-nc-blue-mid text-white'
                    : 'bg-nc-beige text-nc-grey-dark hover:bg-nc-grey-pale'}`}>
                {p.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <label className="text-sm text-nc-grey-mid mb-1 block">
            Intervention Threshold (EDS): <strong>{profile.intervention_threshold}</strong>
          </label>
          <input type="range" min="20" max="80" step="5"
            value={profile.intervention_threshold}
            onChange={(e) => update('intervention_threshold', parseInt(e.target.value))}
            className="w-full" />
          <div className="flex justify-between text-xs text-nc-grey-mid">
            <span>20 (Sensitive)</span>
            <span>80 (Tolerant)</span>
          </div>
        </div>
      </div>

      <div className="nc-card">
        <h3 className="text-sm font-bold text-nc-grey-dark mb-3">Resting Baselines</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'resting_hr', label: 'Heart Rate (bpm)', min: 50, max: 120, step: 1 },
            { key: 'resting_hrv', label: 'HRV (ms)', min: 10, max: 100, step: 1 },
            { key: 'resting_gsr', label: 'GSR (μS)', min: 1, max: 15, step: 0.5 },
            { key: 'resting_temp', label: 'Skin Temp (°C)', min: 28, max: 38, step: 0.5 },
          ].map(f => (
            <div key={f.key}>
              <label className="text-xs text-nc-grey-mid mb-1 block">{f.label}</label>
              <input type="number" min={f.min} max={f.max} step={f.step}
                value={profile[f.key] || ''}
                onChange={(e) => update(f.key, parseFloat(e.target.value))}
                className="nc-input text-sm" />
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} disabled={saving}
        className="nc-btn-primary w-full">
        {saving ? 'Saving...' : '✓ Save Settings'}
      </button>
    </div>
  );
}
