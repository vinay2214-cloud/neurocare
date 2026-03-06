import BreathingRing from '../../components/patient/BreathingRing';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/shared/NavBar';

export default function BreathingExercise() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-nc-cream">
      <NavBar />
      <BreathingRing onClose={() => navigate('/patient')} />
    </div>
  );
}
