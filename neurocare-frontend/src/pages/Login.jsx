import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Login() {
  const [mode, setMode] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const credentials = mode === 'email'
        ? { email, password }
        : { code, password };
      const user = await login(credentials);
      if (user.role === 'patient') navigate('/patient');
      else if (user.role === 'caregiver') navigate('/caregiver');
      else if (user.role === 'therapist') navigate('/therapist');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = [
    { label: '🧑‍⚕️ Therapist', code: 'THR_001' },
    { label: '👨‍👩‍👧 Caregiver', code: 'CAR_001' },
    { label: '🧒 Patient 1', code: 'PAT_001' },
    { label: '🧒 Patient 2', code: 'PAT_002' },
    { label: '🧒 Patient 3', code: 'PAT_003' },
  ];

  const handleQuickLogin = async (userCode) => {
    setError('');
    setLoading(true);
    try {
      const user = await login({ code: userCode, password: 'demo123' });
      if (user.role === 'patient') navigate('/patient');
      else if (user.role === 'caregiver') navigate('/caregiver');
      else if (user.role === 'therapist') navigate('/therapist');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nc-cream flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🧠</div>
          <h1 className="text-3xl font-bold text-nc-blue-deep">NeuroCare</h1>
          <p className="text-nc-grey-mid mt-1">Emotional Therapy Monitoring Platform</p>
        </div>

        <div className="nc-card">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setMode('email')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-safe
                ${mode === 'email' ? 'bg-nc-blue-mid text-white' : 'bg-nc-beige text-nc-grey-dark'}`}>
              Email Login
            </button>
            <button onClick={() => setMode('code')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-safe
                ${mode === 'code' ? 'bg-nc-blue-mid text-white' : 'bg-nc-beige text-nc-grey-dark'}`}>
              Code Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'email' ? (
              <>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email" className="nc-input" required />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" className="nc-input" required />
              </>
            ) : (
              <>
                <input type="text" value={code} onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter your code (e.g. PAT_001)" className="nc-input" required />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password" className="nc-input" required />
              </>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button type="submit" disabled={loading} className="nc-btn-primary w-full">
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>

        <div className="mt-6">
          <p className="text-xs text-nc-grey-mid text-center mb-3">Quick Demo Login</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {quickLogin.map(q => (
              <button key={q.code} onClick={() => handleQuickLogin(q.code)}
                disabled={loading}
                className="bg-white px-3 py-2 rounded-xl text-xs font-bold text-nc-grey-dark
                  shadow-sm hover:shadow-md transition-all duration-safe">
                {q.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
