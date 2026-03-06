import { useState, useEffect } from 'react';
import api from '../../services/api';

const EMOJI_MAP = {
  1: '😊', 2: '😢', 3: '😠', 4: '😨', 5: '😴',
  6: '🤗', 7: '😤', 8: '🥺', 9: '😌', 10: '🤯',
  11: '😐', 12: '🥰', 13: '😖', 14: '😬', 15: '🤔', 16: '😶',
};

const EMOJI_NAMES = {
  1: 'Happy', 2: 'Sad', 3: 'Angry', 4: 'Scared', 5: 'Tired',
  6: 'Loved', 7: 'Frustrated', 8: 'Worried', 9: 'Calm', 10: 'Overwhelmed',
  11: 'Neutral', 12: 'Affectionate', 13: 'Uncomfortable', 14: 'Nervous', 15: 'Thinking', 16: 'Quiet',
};

export default function EmotionFrequencyDisplay({ patientId }) {
  const [freq, setFreq] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    api.get(`/emotions/frequency?patient_id=${patientId}&days=30`).then(res => {
      const data = res.data.frequency || [];
      data.sort((a, b) => b.count - a.count);
      setFreq(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return <div className="nc-card h-48 animate-pulse bg-nc-grey-pale" />;
  }

  if (freq.length === 0) {
    return (
      <div className="nc-card text-center py-8">
        <p className="text-nc-grey-mid">No emotion logs yet</p>
      </div>
    );
  }

  const maxCount = freq[0]?.count || 1;

  return (
    <div className="nc-card">
      <h3 className="text-sm font-bold text-nc-grey-dark mb-3">Emotion Frequency (30-Day)</h3>
      <div className="flex flex-wrap gap-3 justify-center">
        {freq.map(item => {
          const ratio = item.count / maxCount;
          const fontSize = 1.5 + ratio * 2;
          return (
            <div key={item.emoji_id} className="text-center group relative">
              <div style={{ fontSize: `${fontSize}rem` }}
                className="transition-all duration-safe cursor-default hover:scale-110">
                {EMOJI_MAP[item.emoji_id] || '❓'}
              </div>
              <div className="text-xs text-nc-grey-mid font-bold">{item.count}</div>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-nc-grey-dark text-white text-xs px-2 py-1 rounded
                opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {EMOJI_NAMES[item.emoji_id] || `Emoji ${item.emoji_id}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
