import { useAuth } from '../../contexts/AuthContext';
import { useSensor } from '../../contexts/SensorContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Activity, Heart } from 'lucide-react';

export default function NavBar() {
  const { user, logout } = useAuth();
  const { connectionMode } = useSensor();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleBadge = {
    patient: { label: 'Patient', color: 'bg-nc-blue-tint text-nc-blue-deep' },
    caregiver: { label: 'Caregiver', color: 'bg-nc-green-tint text-nc-green-deep' },
    therapist: { label: 'Therapist', color: 'bg-nc-lav-tint text-nc-lavender' },
  };

  const badge = roleBadge[user?.role] || roleBadge.patient;

  return (
    <nav className="bg-nc-card border-b border-nc-grey-pale px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Heart className="w-7 h-7 text-nc-blue-mid" />
        <span className="text-xl font-bold text-nc-blue-deep">NeuroCare</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="nc-badge text-sm">
          {connectionMode === 'connected' || connectionMode === 'real'
            ? '💚 Wearable Connected'
            : '🔵 Simulation Mode'}
        </div>

        {user && (
          <>
            <span className={`nc-badge ${badge.color}`}>{badge.label}</span>
            <span className="text-sm text-nc-grey-mid">{user.name || user.code}</span>
            <button
              onClick={handleLogout}
              className="nc-btn-secondary flex items-center gap-2 min-w-[100px] min-h-[44px] text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
