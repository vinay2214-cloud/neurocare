import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import { SensorProvider } from './contexts/SensorContext';
import NavBar from './components/shared/NavBar';
import Login from './pages/Login';

import PatientHome from './pages/patient/PatientHome';
import MoodCheckIn from './pages/patient/MoodCheckIn';
import BreathingExercise from './pages/patient/BreathingExercise';
import GroundingExercise from './pages/patient/GroundingExercise';
import ThoughtJournal from './pages/patient/ThoughtJournal';
import TodaySummary from './pages/patient/TodaySummary';

import CaregiverHome from './pages/caregiver/CaregiverHome';
import LogBehavior from './pages/caregiver/LogBehavior';
import DailyReport from './pages/caregiver/DailyReport';
import ATECForm from './pages/caregiver/ATECForm';
import CaregiverAlerts from './pages/caregiver/CaregiverAlerts';

import TherapistDashboard from './pages/therapist/TherapistDashboard';
import PatientDetail from './pages/therapist/PatientDetail';
import DynamicDashboard from './pages/therapist/DynamicDashboard';
import ATECHistory from './pages/therapist/ATECHistory';
import SessionNotes from './pages/therapist/SessionNotes';
import PatientSettings from './pages/therapist/PatientSettings';

function RequireAuth({ children, roles }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nc-cream">
        <div className="text-center">
          <div className="text-5xl animate-pulse mb-3">🧠</div>
          <p className="text-nc-grey-mid">Loading...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    if (user.role === 'patient') return <Navigate to="/patient" replace />;
    if (user.role === 'caregiver') return <Navigate to="/caregiver" replace />;
    if (user.role === 'therapist') return <Navigate to="/therapist" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppLayout({ children }) {
  return (
    <SensorProvider>
      <div className="min-h-screen bg-nc-cream">
        <NavBar />
        <main>{children}</main>
      </div>
    </SensorProvider>
  );
}

function AppRoutes() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-nc-cream">
        <div className="text-5xl animate-pulse">🧠</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Patient Routes */}
      <Route path="/patient" element={
        <RequireAuth roles={['patient']}>
          <AppLayout><PatientHome /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/patient/mood" element={
        <RequireAuth roles={['patient']}>
          <AppLayout><MoodCheckIn /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/patient/breathing" element={
        <RequireAuth roles={['patient']}>
          <AppLayout><BreathingExercise /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/patient/grounding" element={
        <RequireAuth roles={['patient']}>
          <AppLayout><GroundingExercise /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/patient/journal" element={
        <RequireAuth roles={['patient']}>
          <AppLayout><ThoughtJournal /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/patient/today" element={
        <RequireAuth roles={['patient']}>
          <AppLayout><TodaySummary /></AppLayout>
        </RequireAuth>
      } />

      {/* Caregiver Routes */}
      <Route path="/caregiver" element={
        <RequireAuth roles={['caregiver']}>
          <AppLayout><CaregiverHome /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/caregiver/log-behavior" element={
        <RequireAuth roles={['caregiver']}>
          <AppLayout><LogBehavior /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/caregiver/daily-report" element={
        <RequireAuth roles={['caregiver']}>
          <AppLayout><DailyReport /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/caregiver/atec" element={
        <RequireAuth roles={['caregiver']}>
          <AppLayout><ATECForm /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/caregiver/alerts" element={
        <RequireAuth roles={['caregiver']}>
          <AppLayout><CaregiverAlerts /></AppLayout>
        </RequireAuth>
      } />

      {/* Therapist Routes */}
      <Route path="/therapist" element={
        <RequireAuth roles={['therapist']}>
          <AppLayout><TherapistDashboard /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/therapist/patient/:patientId" element={
        <RequireAuth roles={['therapist']}>
          <AppLayout><PatientDetail /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/therapist/dashboard/:patientId" element={
        <RequireAuth roles={['therapist']}>
          <AppLayout><DynamicDashboard /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/therapist/atec/:patientId" element={
        <RequireAuth roles={['therapist']}>
          <AppLayout><ATECHistory /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/therapist/notes/:patientId" element={
        <RequireAuth roles={['therapist']}>
          <AppLayout><SessionNotes /></AppLayout>
        </RequireAuth>
      } />
      <Route path="/therapist/settings/:patientId" element={
        <RequireAuth roles={['therapist']}>
          <AppLayout><PatientSettings /></AppLayout>
        </RequireAuth>
      } />

      {/* Default redirect */}
      <Route path="/" element={
        user
          ? <Navigate to={`/${user.role === 'patient' ? 'patient' : user.role === 'caregiver' ? 'caregiver' : 'therapist'}`} replace />
          : <Navigate to="/login" replace />
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
