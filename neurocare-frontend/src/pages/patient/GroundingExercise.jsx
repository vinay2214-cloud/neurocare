import GroundingChecklist from '../../components/patient/GroundingChecklist';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/shared/NavBar';

export default function GroundingExercise() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-nc-cream">
      <NavBar />
      <GroundingChecklist onClose={() => navigate('/patient')} />
    </div>
  );
}
