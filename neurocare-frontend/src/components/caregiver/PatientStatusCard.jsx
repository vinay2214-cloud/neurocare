import { useState, useEffect } from 'react';
import api from '../../services/api';

const STATUS_MAP = {
  calm:     { dot: 'bg-nc-green-mid', text: 'Feeling calm', emoji: '💚' },
  moderate: { dot: 'bg-nc-amber',     text: 'Slightly unsettled', emoji: '💛' },
  elevated: { dot: 'bg-nc-terra',     text: 'Your child may need support right now 💙', emoji: '🧡' },
  critical: { dot: 'bg-red-500',      text: 'Your child may need support right now 💙', emoji: '❤️' },
  unknown:  { dot: 'bg-nc-grey-pale', text: 'No recent data', emoji: '⚪' },
};

export default function PatientStatusCard({ patient, onClick }) {
  const [live, setLive] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchLive = async () => {
      try {
        const res = await api.get(`/patients/${patient.id}/live`);
        if (!cancelled) setLive(res.data);
      } catch (err) {
        console.error('Failed to fetch live data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchLive();
    const interval = setInterval(fetchLive, 10000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [patient.id]);

  const state = live?.eds_state || 'unknown';
  const info = STATUS_MAP[state];
  const isAlert = state === 'elevated' || state === 'critical';

  return (
    <button
      onClick={() => onClick && onClick(patient)}
      className={`nc-card w-full text-left transition-all duration-safe hover:shadow-md
        ${isAlert ? 'ring-2 ring-nc-terra ring-opacity-50' : ''}`}
    >
      {loading ? (
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-nc-grey-pale animate-pulse" />
          <div className="flex-1">
            <div className="h-5 bg-nc-grey-pale rounded w-32 animate-pulse mb-1" />
            <div className="h-4 bg-nc-grey-pale rounded w-48 animate-pulse" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-4 h-4 rounded-full ${info.dot} ${isAlert ? 'animate-pulse' : ''}`} />
            <h3 className="text-lg font-bold text-nc-blue-deep flex-1">{patient.name}</h3>
            <span className="text-2xl">{info.emoji}</span>
          </div>
          <p className={`text-sm ${isAlert ? 'text-nc-terra font-bold' : 'text-nc-grey-mid'}`}>
            {info.text}
          </p>
          {isAlert && (
            <div className="mt-2 bg-nc-terra-tint rounded-xl px-3 py-2 text-sm text-nc-terra">
              Consider checking in with them 💙
            </div>
          )}
          {live?.latest_emotion && (
            <div className="mt-2 text-sm text-nc-grey-mid">
              Last mood: {live.latest_emotion.emoji || '—'}
            </div>
          )}
        </>
      )}
    </button>
  );
}
