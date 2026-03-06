import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PatientStatusCard from '../../components/caregiver/PatientStatusCard';

export default function CaregiverHome() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await api.get('/patients');
        setPatients(res.data.patients || []);
      } catch (err) {
        console.error('Failed to load patients:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const quickActions = [
    { label: '📝 Log Behavior', path: '/caregiver/log-behavior', color: 'bg-nc-blue-soft' },
    { label: '📊 Daily Report', path: '/caregiver/daily-report', color: 'bg-nc-green-tint' },
    { label: '📋 ATEC Form', path: '/caregiver/atec', color: 'bg-nc-lav-tint' },
    { label: '🔔 Alerts', path: '/caregiver/alerts', color: 'bg-nc-amber-tint' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold text-nc-blue-deep">Welcome back 💙</h1>

      <section>
        <h2 className="text-lg font-bold text-nc-grey-dark mb-3">Your Children</h2>
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="nc-card h-24 animate-pulse bg-nc-grey-pale" />
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="nc-card text-center text-nc-grey-mid">No patients assigned</div>
        ) : (
          <div className="space-y-3">
            {patients.map(p => (
              <PatientStatusCard key={p.id} patient={p}
                onClick={() => navigate(`/caregiver/daily-report?patient=${p.id}`)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-bold text-nc-grey-dark mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map(action => (
            <button key={action.path}
              onClick={() => navigate(action.path)}
              className={`${action.color} rounded-2xl p-4 text-left font-bold text-nc-grey-dark
                transition-all duration-safe hover:shadow-md min-h-[56px]`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
