import { useState } from 'react';
import { Chart, registerables, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import api from '../../services/api';

Chart.register(...registerables, ArcElement);

const AVAILABLE_PARAMS = [
  'heart_rate', 'hrv', 'gsr', 'skin_temp', 'motion_index',
  'spo2', 'respiratory_rate', 'eeg_alpha', 'eeg_beta', 'eeg_theta',
  'eds', 'emotion_frequency', 'behavior_events', 'intervention_outcomes',
  'atec_subscales', 'sleep_quality', 'meltdown_count', 'social_engagement',
];

const PARAM_LABELS = {
  heart_rate: 'Heart Rate', hrv: 'HRV', gsr: 'GSR',
  skin_temp: 'Temperature', motion_index: 'Motion',
  spo2: 'SpO2', respiratory_rate: 'Respiratory',
  eeg_alpha: 'EEG Alpha', eeg_beta: 'EEG Beta', eeg_theta: 'EEG Theta',
  eds: 'EDS Score', emotion_frequency: 'Emotion Frequency',
  behavior_events: 'Behavior Events', intervention_outcomes: 'Intervention Outcomes',
  atec_subscales: 'ATEC Subscales', sleep_quality: 'Sleep Quality',
  meltdown_count: 'Meltdown Count', social_engagement: 'Social Engagement',
};

const CHART_ICONS = {
  line: '📈', bar: '📊', doughnut: '🍩', radar: '🎯', scatter: '🔘', heatmap: '🌡️',
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function generateSampleData(chartConfig) {
  const type = chartConfig.type || 'line';
  const color = chartConfig.color || '#5B8DB8';

  if (type === 'doughnut') {
    return {
      labels: ['Category A', 'Category B', 'Category C', 'Category D'],
      datasets: [{
        data: [35, 25, 22, 18],
        backgroundColor: [color, `${color}99`, `${color}66`, `${color}33`],
        borderWidth: 2,
        borderColor: '#fff',
      }],
    };
  }

  const values = DAYS.map(() => Math.round(30 + Math.random() * 50));
  return {
    labels: DAYS,
    datasets: [{
      label: chartConfig.title || 'Data',
      data: values,
      borderColor: color,
      backgroundColor: type === 'bar' ? `${color}80` : `${color}20`,
      fill: type === 'line',
      tension: 0.4,
      borderWidth: 2,
      borderRadius: type === 'bar' ? 6 : 0,
    }],
  };
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { grid: { color: 'rgba(0,0,0,0.05)' } },
    x: { grid: { display: false } },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
};

function RenderChart({ config }) {
  const data = generateSampleData(config);
  const type = config.type || 'line';

  return (
    <div className="nc-card">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{CHART_ICONS[type] || '📊'}</span>
        <h4 className="text-sm font-bold text-nc-grey-dark">{config.title}</h4>
      </div>
      <div className="h-48">
        {type === 'doughnut' ? (
          <Doughnut data={data} options={doughnutOptions} />
        ) : type === 'bar' ? (
          <Bar data={data} options={chartOptions} />
        ) : (
          <Line data={data} options={chartOptions} />
        )}
      </div>
      {config.clinical_insight && (
        <div className="mt-3 bg-nc-blue-tint rounded-xl p-3">
          <p className="text-xs text-nc-blue-deep">
            <span className="font-bold">Clinical Insight:</span> {config.clinical_insight}
          </p>
        </div>
      )}
    </div>
  );
}

export default function DynamicDashboardGen({ patientId, patientName }) {
  const [mode, setMode] = useState('auto');
  const [selectedParams, setSelectedParams] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const toggleParam = (param) => {
    setSelectedParams(prev => {
      if (prev.includes(param)) return prev.filter(p => p !== param);
      if (prev.length >= 3) return prev;
      return [...prev, param];
    });
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const body = {
        patient_id: patientId,
        mode,
      };
      if (mode === 'manual') {
        body.parameters = selectedParams;
      }
      const res = await api.post('/dashboard/generate', body);
      setDashboard(res.data);
    } catch (err) {
      console.error('Dashboard generation failed:', err);
      setError('Failed to generate dashboard. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="nc-card">
        <h3 className="text-lg font-bold text-nc-blue-deep mb-3">🤖 AI Dashboard Generator</h3>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setMode('auto')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-safe
              ${mode === 'auto' ? 'bg-nc-blue-mid text-white' : 'bg-nc-beige text-nc-grey-dark hover:bg-nc-grey-pale'}`}>
            AI Auto-Select
          </button>
          <button onClick={() => setMode('manual')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-safe
              ${mode === 'manual' ? 'bg-nc-blue-mid text-white' : 'bg-nc-beige text-nc-grey-dark hover:bg-nc-grey-pale'}`}>
            Manual Pick (3)
          </button>
        </div>

        {mode === 'manual' && (
          <div className="mb-4">
            <p className="text-sm text-nc-grey-mid mb-2">
              Select up to 3 parameters ({selectedParams.length}/3):
            </p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_PARAMS.map(param => (
                <button key={param} onClick={() => toggleParam(param)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-safe
                    ${selectedParams.includes(param)
                      ? 'bg-nc-blue-mid text-white'
                      : 'bg-nc-beige text-nc-grey-dark hover:bg-nc-grey-pale'}
                    ${!selectedParams.includes(param) && selectedParams.length >= 3 ? 'opacity-40' : ''}`}>
                  {PARAM_LABELS[param] || param}
                </button>
              ))}
            </div>
          </div>
        )}

        <button onClick={handleGenerate}
          disabled={generating || (mode === 'manual' && selectedParams.length === 0)}
          className="nc-btn-primary w-full disabled:opacity-40">
          {generating ? 'Generating Dashboard...' : '✨ Generate Dashboard'}
        </button>

        {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
      </div>

      {dashboard && (
        <div className="space-y-4">
          {dashboard.narrative_text && (
            <div className="nc-card bg-gradient-to-r from-nc-blue-tint to-nc-lav-tint">
              <h4 className="text-sm font-bold text-nc-blue-deep mb-2">🧠 Clinical Narrative</h4>
              <p className="text-sm text-nc-grey-dark whitespace-pre-wrap">{dashboard.narrative_text}</p>
            </div>
          )}
          {dashboard.parameters && (
            <div className="nc-card">
              <h4 className="text-sm font-bold text-nc-grey-dark mb-2">Selected Parameters</h4>
              <div className="flex flex-wrap gap-2">
                {dashboard.parameters.map(p => (
                  <span key={p} className="bg-nc-blue-tint text-nc-blue-deep text-xs font-bold px-3 py-1 rounded-full">
                    {PARAM_LABELS[p] || p}
                  </span>
                ))}
              </div>
            </div>
          )}
          {dashboard.chart_config && Array.isArray(dashboard.chart_config) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboard.chart_config.map((chart, i) => (
                <RenderChart key={chart.id || i} config={chart} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
