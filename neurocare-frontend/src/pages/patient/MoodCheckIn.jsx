import EmojiMoodGrid from '../../components/patient/EmojiMoodGrid';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NavBar from '../../components/shared/NavBar';

export default function MoodCheckIn() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-nc-cream">
      <NavBar />
      <EmojiMoodGrid
        onClose={() => navigate('/patient')}
        patientId={user?.id}
      />
    </div>
  );
}
