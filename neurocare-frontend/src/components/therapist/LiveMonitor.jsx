import { useState, useEffect, useRef } from 'react';
import { subscribeSensor, subscribeEDS } from '../../services/socketService';

const STATE_COLORS = {
  calm: '#22c55e',
  moderate: '#eab308',
  elevated: '#f97316',
  critical: '#ef4444',
};

export default function LiveMonitor({ patientId }) {
  const [eds, setEds] = useState(null);
  const [edsState, setEdsState] = useState('calm');
  const [sensorData, setSensorData] = useState(null);
  const [history, setHistory] = useState([]);
  const svgRef = useRef(null);

  useEffect(() => {
    if (!patientId) return;
    setEds(null);
    setEdsState('calm');
    setSensorData(null);
    setHistory([]);
    const unsubSensor = subscribeSensor(patientId, (data) => {
      setSensorData(data);
    });
    const unsubEDS = subscribeEDS(patientId, (data) => {
      setEds(data.eds);
      setEdsState(data.eds_state || 'calm');
      setHistory(prev => {
        const next = [...prev, { value: data.eds, time: Date.now() }];
        return next.slice(-60);
      });
    });
    return () => { unsubSensor(); unsubEDS(); };
  }, [patientId]);

  const sparklinePoints = () => {
    if (history.length < 2) return '';
    const w = 200;
    const h = 40;
    return history.map((pt, i) => {
      const x = (i / (history.length - 1)) * w;
      const y = h - (pt.value / 100) * h;
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="nc-card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-nc-grey-dark">Live Monitor</h3>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full animate-pulse`}
            style={{ backgroundColor: STATE_COLORS[edsState] || '#ccc' }} />
          <span className="text-xs font-bold uppercase text-nc-grey-mid">{edsState}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3">
        <div className="text-center">
          <div className="text-3xl font-bold" style={{ color: STATE_COLORS[edsState] }}>
            {eds !== null ? eds.toFixed(1) : '—'}
          </div>
          <div className="text-xs text-nc-grey-mid">EDS Score</div>
        </div>
        <svg ref={svgRef} viewBox="0 0 200 40" className="flex-1 h-10">
          <line x1="0" y1="28" x2="200" y2="28" stroke="#FBBF24" strokeWidth="0.5" strokeDasharray="4,2" />
          <line x1="0" y1="18" x2="200" y2="18" stroke="#F97316" strokeWidth="0.5" strokeDasharray="4,2" />
          {history.length >= 2 && (
            <polyline
              points={sparklinePoints()}
              fill="none"
              stroke={STATE_COLORS[edsState]}
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          )}
        </svg>
      </div>

      {sensorData && (
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div>
            <div className="font-bold text-nc-grey-dark">{sensorData.hr?.toFixed(0)}</div>
            <div className="text-nc-grey-mid">HR</div>
          </div>
          <div>
            <div className="font-bold text-nc-grey-dark">{sensorData.hrv?.toFixed(0)}</div>
            <div className="text-nc-grey-mid">HRV</div>
          </div>
          <div>
            <div className="font-bold text-nc-grey-dark">{sensorData.gsr?.toFixed(1)}</div>
            <div className="text-nc-grey-mid">GSR</div>
          </div>
          <div>
            <div className="font-bold text-nc-grey-dark">{sensorData.body_temp?.toFixed(1)}</div>
            <div className="text-nc-grey-mid">Temp</div>
          </div>
          <div>
            <div className="font-bold text-nc-grey-dark">{sensorData.motion?.toFixed(1)}</div>
            <div className="text-nc-grey-mid">Motion</div>
          </div>
        </div>
      )}

      {!sensorData && !eds && (
        <p className="text-sm text-nc-grey-mid text-center py-4">Waiting for live data...</p>
      )}
    </div>
  );
}
