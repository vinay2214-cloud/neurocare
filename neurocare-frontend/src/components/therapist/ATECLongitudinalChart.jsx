import { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import api from '../../services/api';

Chart.register(...registerables, annotationPlugin);

export default function ATECLongitudinalChart({ patientId }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    api.get(`/atec/history?patient_id=${patientId}`).then(res => {
      setRecords(res.data.records || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return <div className="nc-card h-64 animate-pulse bg-nc-grey-pale" />;
  }

  if (records.length === 0) {
    return (
      <div className="nc-card text-center py-8">
        <p className="text-nc-grey-mid">No ATEC records yet</p>
      </div>
    );
  }

  const labels = records.map(r => new Date(r.assessment_date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));

  const data = {
    labels,
    datasets: [
      {
        label: 'Speech/Language',
        data: records.map(r => r.speech_language_communication),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        pointRadius: 4,
      },
      {
        label: 'Sociability',
        data: records.map(r => r.sociability),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.3,
        pointRadius: 4,
      },
      {
        label: 'Sensory/Cognitive',
        data: records.map(r => r.sensory_cognitive_awareness),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.3,
        pointRadius: 4,
      },
      {
        label: 'Health/Physical',
        data: records.map(r => r.health_physical_behavior),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.3,
        pointRadius: 4,
      },
      {
        label: 'Total',
        data: records.map(r => r.total_score),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.3,
        pointRadius: 5,
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
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Score', font: { size: 12 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <div className="nc-card">
      <h3 className="text-sm font-bold text-nc-grey-dark mb-3">ATEC Longitudinal Trend</h3>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
