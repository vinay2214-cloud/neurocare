import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SessionLogTable from '../../components/therapist/SessionLogTable';
import NotesEditor from '../../components/therapist/NotesEditor';

export default function SessionNotes() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const pid = parseInt(patientId);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="max-w-3xl mx-auto px-6 py-6 space-y-4">
      <button onClick={() => navigate(`/therapist/patient/${pid}`)}
        className="text-nc-blue-mid font-bold text-sm">← Patient Detail</button>
      <h1 className="text-2xl font-bold text-nc-blue-deep">Session Notes</h1>
      <NotesEditor patientId={pid} onSaved={() => setRefreshKey(k => k + 1)} />
      <SessionLogTable key={refreshKey} patientId={pid} />
    </div>
  );
}
