import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function TodayStats({ patientId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    api.get(`/sensor-data/${patientId}/stats?days=1`)
      .then(res => setStats(res.data))
      .catch(() => {});
  }, [patientId]);

  if (!stats) return null;

  return (
    <div className="nc-card">
      <h3 className="text-lg font-bold text-nc-grey-dark mb-4">✨ Today So Far</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 rounded-xl2 bg-nc-blue-tint">
          <div className="text-2xl font-bold text-nc-blue-deep">{stats.total_readings || 0}</div>
          <div className="text-sm text-nc-grey-mid">Check-ins</div>
        </div>
        <div className="text-center p-3 rounded-xl2 bg-nc-green-tint">
          <div className="text-2xl font-bold text-nc-green-deep">
            {stats.hr_avg ? `${Math.round(stats.hr_avg)}` : '--'}
          </div>
          <div className="text-sm text-nc-grey-mid">Avg Heart Rate</div>
        </div>
      </div>
    </div>
  );
}
