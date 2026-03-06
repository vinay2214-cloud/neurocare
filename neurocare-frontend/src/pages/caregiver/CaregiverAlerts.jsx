import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function CaregiverAlerts() {
  const [patients, setPatients] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const pRes = await api.get('/patients');
        const list = pRes.data.patients || [];
        setPatients(list);
        const allEvents = [];
        for (const p of list) {
          try {
            const liveRes = await api.get(`/patients/${p.id}/live`);
            const live = liveRes.data;
            if (live.eds_state === 'elevated' || live.eds_state === 'critical') {
              allEvents.push({
                type: 'status',
                patient: p,
                state: live.eds_state,
                message: 'Your child may need support right now 💙',
                time: new Date(),
              });
            }
          } catch (err) {
            // Patient may not have live data
          }
          try {
            const behRes = await api.get(`/caregiver/behavioral-events?patient_id=${p.id}&days=1`);
            const severe = (behRes.data.events || []).filter(e => e.severity >= 3);
            severe.forEach(ev => {
              allEvents.push({
                type: 'behavior',
                patient: p,
                event: ev,
                message: `${ev.event_type.replace(/_/g, ' ')} recorded (severity ${ev.severity})`,
                time: new Date(ev.timestamp),
              });
            });
          } catch (err) {
            // May not have behavioral events endpoint with filter
          }
        }
        allEvents.sort((a, b) => b.time - a.time);
        setEvents(allEvents);
      } catch (err) {
        console.error('Failed to load alerts:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getIcon = (ev) => {
    if (ev.type === 'status' && ev.state === 'critical') return '🔴';
    if (ev.type === 'status') return '🟠';
    return '⚠️';
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <button onClick={() => navigate('/caregiver')}
        className="text-nc-blue-mid mb-4 font-bold text-sm">← Back</button>
      <h1 className="text-2xl font-bold text-nc-blue-deep mb-4">🔔 Alerts</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="nc-card h-16 animate-pulse bg-nc-grey-pale" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="nc-card text-center py-12">
          <div className="text-5xl mb-3">✅</div>
          <h3 className="text-lg font-bold text-nc-green-deep">All Clear</h3>
          <p className="text-nc-grey-mid text-sm">No alerts right now. Everything looks good!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev, idx) => (
            <div key={idx} className={`nc-card flex items-start gap-3
              ${ev.state === 'critical' ? 'ring-2 ring-red-300' : ''}`}>
              <span className="text-2xl">{getIcon(ev)}</span>
              <div className="flex-1">
                <p className="font-bold text-nc-grey-dark text-sm">{ev.patient.name}</p>
                <p className={`text-sm ${ev.state === 'critical' ? 'text-red-600 font-bold' : 'text-nc-grey-mid'}`}>
                  {ev.message}
                </p>
                <p className="text-xs text-nc-grey-mid mt-1">
                  {ev.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
