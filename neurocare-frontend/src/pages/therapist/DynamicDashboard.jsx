import { useParams, useNavigate } from 'react-router-dom';
import DynamicDashboardGen from '../../components/therapist/DynamicDashboardGen';

export default function DynamicDashboard() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const pid = parseInt(patientId);

  return (
    <div className="max-w-3xl mx-auto px-6 py-6">
      <button onClick={() => navigate('/therapist')}
        className="text-nc-blue-mid font-bold text-sm mb-4">← Dashboard</button>
      <DynamicDashboardGen patientId={pid} />
    </div>
  );
}
