import { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../../services/api';

Chart.register(...registerables);

export default function InterventionAnalytics({ patientId }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    api.get(`/interventions/analytics?patient_id=${patientId}`).then(res => {
      setAnalytics(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return <div className="nc-card h-64 animate-pulse bg-nc-grey-pale" />;
  }

  if (!analytics || !analytics.by_type || analytics.by_type.length === 0) {
    return (
      <div className="nc-card text-center py-8">
        <p className="text-nc-grey-mid">No intervention data yet</p>
      </div>
    );
  }

  const byType = analytics.by_type;
  const labels = byType.map(t => t.intervention_type.replace(/_/g, ' '));

  const data = {
    labels,
    datasets: [
      {
        label: 'Triggered',
        data: byType.map(t => t.total),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3B82F6',
        borderWidth: 1,
      },
      {
        label: 'Completed',
        data: byType.map(t => t.completed || 0),
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: '#10B981',
        borderWidth: 1,
      },
      {
        label: 'Skipped',
        data: byType.map(t => t.skipped || 0),
        backgroundColor: 'rgba(245, 158, 11, 0.6)',
        borderColor: '#F59E0B',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, font: { size: 11 } },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Count', font: { size: 12 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { stepSize: 1 },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="nc-card">
      <h3 className="text-sm font-bold text-nc-grey-dark mb-3">Intervention Outcomes</h3>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
      {analytics.total_interventions > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-3 text-center text-xs">
          <div>
            <div className="font-bold text-nc-blue-deep text-lg">{analytics.total_interventions}</div>
            <div className="text-nc-grey-mid">Total</div>
          </div>
          <div>
            <div className="font-bold text-nc-green-deep text-lg">
              {analytics.completion_rate ? `${(analytics.completion_rate * 100).toFixed(0)}%` : '—'}
            </div>
            <div className="text-nc-grey-mid">Completion</div>
          </div>
          <div>
            <div className="font-bold text-nc-terra text-lg">
              {analytics.avg_eds_reduction ? analytics.avg_eds_reduction.toFixed(1) : '—'}
            </div>
            <div className="text-nc-grey-mid">Avg EDS Δ</div>
          </div>
        </div>
      )}
    </div>
  );
}
