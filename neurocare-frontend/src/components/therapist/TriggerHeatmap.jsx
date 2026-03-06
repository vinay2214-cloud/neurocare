import { useState, useEffect } from 'react';
import api from '../../services/api';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const getColor = (count) => {
  if (count === 0) return 'bg-nc-grey-pale';
  if (count === 1) return 'bg-amber-200';
  if (count === 2) return 'bg-amber-400';
  if (count === 3) return 'bg-orange-400';
  return 'bg-red-500';
};

export default function TriggerHeatmap({ patientId }) {
  const [grid, setGrid] = useState({});
  const [loading, setLoading] = useState(true);
  const [maxCount, setMaxCount] = useState(0);

  useEffect(() => {
    if (!patientId) return;
    api.get(`/sensor/history?patient_id=${patientId}&days=7`).then(res => {
      const readings = res.data.readings || [];
      const heatGrid = {};
      let max = 0;
      readings.forEach(r => {
        if (r.eds_state === 'elevated' || r.eds_state === 'critical') {
          const d = new Date(r.timestamp);
          const dayIdx = (d.getDay() + 6) % 7;
          const hour = d.getHours();
          const key = `${dayIdx}_${hour}`;
          heatGrid[key] = (heatGrid[key] || 0) + 1;
          if (heatGrid[key] > max) max = heatGrid[key];
        }
      });
      setGrid(heatGrid);
      setMaxCount(max);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return <div className="nc-card h-64 animate-pulse bg-nc-grey-pale" />;
  }

  return (
    <div className="nc-card">
      <h3 className="text-sm font-bold text-nc-grey-dark mb-3">Trigger Heatmap (7-Day)</h3>
      <div className="overflow-x-auto">
        <div className="inline-grid gap-px" style={{
          gridTemplateColumns: `40px repeat(24, 1fr)`,
          gridTemplateRows: `20px repeat(7, 1fr)`,
          minWidth: '500px',
        }}>
          <div />
          {HOURS.map(h => (
            <div key={h} className="text-xs text-nc-grey-mid text-center">
              {h % 4 === 0 ? `${h}:00` : ''}
            </div>
          ))}

          {DAYS.map((day, dayIdx) => (
            <>
              <div key={`label-${dayIdx}`} className="text-xs text-nc-grey-mid flex items-center pr-1 justify-end">
                {day}
              </div>
              {HOURS.map(hour => {
                const count = grid[`${dayIdx}_${hour}`] || 0;
                return (
                  <div
                    key={`${dayIdx}_${hour}`}
                    className={`${getColor(count)} rounded-sm min-h-[16px] min-w-[16px]
                      transition-all duration-safe hover:ring-2 hover:ring-nc-blue-mid`}
                    title={`${day} ${hour}:00 — ${count} elevated/critical episodes`}
                  />
                );
              })}
            </>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-3 text-xs text-nc-grey-mid">
        <span>Less</span>
        <div className="w-4 h-4 bg-nc-grey-pale rounded-sm" />
        <div className="w-4 h-4 bg-amber-200 rounded-sm" />
        <div className="w-4 h-4 bg-amber-400 rounded-sm" />
        <div className="w-4 h-4 bg-orange-400 rounded-sm" />
        <div className="w-4 h-4 bg-red-500 rounded-sm" />
        <span>More</span>
      </div>
    </div>
  );
}
