import { useState, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Line } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import api from '../../services/api';

Chart.register(...registerables, annotationPlugin);

export default function WeeklyEDSTrend({ patientId }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    api.get(`/sensor/stats?patient_id=${patientId}&days=7`).then(res => {
      setStats(res.data.daily_stats || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return <div className="nc-card h-64 animate-pulse bg-nc-grey-pale" />;
  }

  if (stats.length === 0) {
    return (
      <div className="nc-card text-center py-8">
        <p className="text-nc-grey-mid">No EDS data for this period</p>
      </div>
    );
  }

  const labels = stats.map(s => {
    const d = new Date(s.date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  });

  const data = {
    labels,
    datasets: [
      {
        label: 'Avg EDS',
        data: stats.map(s => s.avg_eds),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: stats.map(s => {
          const v = s.avg_eds;
          if (v >= 55) return '#EF4444';
          if (v >= 30) return '#F59E0B';
          return '#22C55E';
        }),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      annotation: {
        annotations: {
          elevated: {
            type: 'line',
            yMin: 55,
            yMax: 55,
            borderColor: '#F97316',
            borderWidth: 2,
            borderDash: [6, 3],
            label: {
              display: true,
              content: 'Elevated (55)',
              position: 'start',
              font: { size: 10 },
              backgroundColor: 'rgba(249,115,22,0.8)',
            },
          },
          moderate: {
            type: 'line',
            yMin: 30,
            yMax: 30,
            borderColor: '#EAB308',
            borderWidth: 2,
            borderDash: [6, 3],
            label: {
              display: true,
              content: 'Moderate (30)',
              position: 'start',
              font: { size: 10 },
              backgroundColor: 'rgba(234,179,8,0.8)',
            },
          },
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 100,
        title: { display: true, text: 'EDS Score', font: { size: 12 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <div className="nc-card">
      <h3 className="text-sm font-bold text-nc-grey-dark mb-3">Weekly EDS Trend</h3>
      <div className="h-64">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
