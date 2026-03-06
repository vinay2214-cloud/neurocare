import { useParams, useNavigate } from 'react-router-dom';
import ClinicalSettings from '../../components/therapist/ClinicalSettings';

export default function PatientSettings() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const pid = parseInt(patientId);

  return (
    <div className="max-w-2xl mx-auto px-6 py-6">
      <button onClick={() => navigate(`/therapist/patient/${pid}`)}
        className="text-nc-blue-mid font-bold text-sm mb-4">← Patient Detail</button>
      <h1 className="text-2xl font-bold text-nc-blue-deep mb-4">Patient Settings</h1>
      <ClinicalSettings patientId={pid} />
    </div>
  );
}
