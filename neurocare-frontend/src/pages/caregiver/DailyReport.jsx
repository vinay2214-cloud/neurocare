import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import DailyLogForm from '../../components/caregiver/DailyLogForm';

export default function DailyReport() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/patients').then(res => {
      const list = res.data.patients || [];
      setPatients(list);
      const pid = searchParams.get('patient');
      if (pid) {
        const found = list.find(p => p.id === parseInt(pid));
        if (found) setSelectedPatient(found);
      }
      if (!pid && list.length === 1) setSelectedPatient(list[0]);
    });
  }, [searchParams]);

  if (!selectedPatient) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <button onClick={() => navigate('/caregiver')}
          className="text-nc-blue-mid mb-4 font-bold text-sm">← Back</button>
        <h1 className="text-2xl font-bold text-nc-blue-deep mb-4">Daily Report</h1>
        <p className="text-nc-grey-mid mb-4">Select a child:</p>
        <div className="space-y-2">
          {patients.map(p => (
            <button key={p.id} onClick={() => setSelectedPatient(p)}
              className="nc-card w-full text-left font-bold text-nc-blue-deep transition-all duration-safe hover:shadow-md">
              {p.name}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <button onClick={() => navigate('/caregiver')}
        className="text-nc-blue-mid mb-4 font-bold text-sm">← Back</button>
      <h1 className="text-xl font-bold text-nc-blue-deep mb-1">Daily Report</h1>
      <p className="text-nc-grey-mid text-sm mb-4">For {selectedPatient.name}</p>
      <DailyLogForm patientId={selectedPatient.id}
        onDone={() => navigate('/caregiver')} />
    </div>
  );
}
