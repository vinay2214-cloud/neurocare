import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NavBar from '../../components/shared/NavBar';
import api from '../../services/api';

export default function TodaySummary() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [emotions, setEmotions] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/sensor-data/${user.id}/stats?days=1`)
      .then(res => setStats(res.data))
      .catch(() => {});
    api.get(`/emotions/${user.id}?days=1&limit=20`)
      .then(res => setEmotions(res.data.emotions || []))
      .catch(() => {});
  }, [user]);

  const EMOJIS = {
    Calm: '😌', Happy: '😊', 'Very Happy': '😄', Loved: '🥰',
    Unsure: '😐', Numb: '😑', Sad: '😔', 'Very Sad': '😢',
    Worried: '😟', Anxious: '😰', Frustrated: '😡', Angry: '😤',
    Overwhelmed: '😵', Uncomfortable: '🤒', Tired: '😴', 'Need a Hug': '🤗',
  };

  return (
    <div className="min-h-screen bg-nc-cream">
      <NavBar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-nc-blue-deep mb-6 text-center">✨ Today's Summary</h1>

        {stats && (
          <div className="nc-card mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-xl2 bg-nc-blue-tint">
                <div className="text-3xl font-bold text-nc-blue-deep">{stats.total_readings || 0}</div>
                <div className="text-sm text-nc-grey-mid">Readings</div>
              </div>
              <div className="text-center p-4 rounded-xl2 bg-nc-green-tint">
                <div className="text-3xl font-bold text-nc-green-deep">
                  {stats.hr_avg ? Math.round(stats.hr_avg) : '--'}
                </div>
                <div className="text-sm text-nc-grey-mid">Avg HR</div>
              </div>
            </div>
          </div>
        )}

        <div className="nc-card">
          <h2 className="text-lg font-bold text-nc-grey-dark mb-4">My Feelings Today</h2>
          {emotions.length === 0 ? (
            <p className="text-nc-grey-mid text-center">No feelings logged yet today.</p>
          ) : (
            <div className="space-y-3">
              {emotions.map(e => (
                <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl2 bg-nc-beige">
                  <span className="text-3xl">{EMOJIS[e.emoji_name] || '😐'}</span>
                  <div>
                    <div className="font-bold text-nc-grey-dark">{e.emoji_name}</div>
                    <div className="text-sm text-nc-grey-mid">
                      Intensity: {e.intensity}/5 · {new Date(e.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
