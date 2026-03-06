import { useState } from 'react';
import api from '../../services/api';

export default function DailyLogForm({ patientId, onDone }) {
  const [form, setForm] = useState({
    sleep_hours: '',
    sleep_quality: 3,
    meals_regular: true,
    diet_notes: '',
    medication_taken: false,
    medication_notes: '',
    mood_morning: 3,
    mood_afternoon: 3,
    mood_evening: 3,
    meltdown_count: 0,
    stimming_level: 3,
    social_engagement: 3,
    physical_activity_minutes: 30,
    daily_summary: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/caregiver/daily-log', {
        patient_id: patientId,
        ...form,
        sleep_hours: parseFloat(form.sleep_hours) || 0,
      });
      setDone(true);
      setTimeout(() => onDone && onDone(), 2000);
    } catch (err) {
      console.error('Failed to submit daily log:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="nc-card text-center">
        <div className="text-5xl mb-3">📊</div>
        <h3 className="text-xl font-bold text-nc-green-deep">Daily Report Saved</h3>
        <p className="text-nc-grey-mid">Thank you for today's update!</p>
      </div>
    );
  }

  const RatingButton = ({ label, value, selected, onChange }) => (
    <div className="mb-4">
      <label className="text-sm font-bold text-nc-grey-mid mb-2 block">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button key={n}
            onClick={() => onChange(n)}
            className={`w-11 h-11 rounded-full font-bold transition-all duration-safe
              ${selected === n ? 'bg-nc-blue-mid text-white' : 'bg-nc-beige text-nc-grey-dark hover:bg-nc-grey-pale'}`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="nc-card max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold text-nc-blue-deep mb-4">📊 Daily Report</h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-bold text-nc-grey-mid mb-1 block">Sleep Hours</label>
          <input type="number" step="0.5" min="0" max="24"
            className="nc-input" value={form.sleep_hours}
            onChange={(e) => update('sleep_hours', e.target.value)}
            placeholder="Hours of sleep last night" />
        </div>

        <RatingButton label="Sleep Quality (1=Poor, 5=Excellent)" value={form.sleep_quality} selected={form.sleep_quality}
          onChange={(v) => update('sleep_quality', v)} />

        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-nc-grey-mid">Regular Meals?</label>
          <button
            onClick={() => update('meals_regular', !form.meals_regular)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-safe
              ${form.meals_regular ? 'bg-nc-green-mid text-white' : 'bg-nc-beige text-nc-grey-dark'}`}
          >
            {form.meals_regular ? '✓ Yes' : '✗ No'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-nc-grey-mid">Medication Taken?</label>
          <button
            onClick={() => update('medication_taken', !form.medication_taken)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all duration-safe
              ${form.medication_taken ? 'bg-nc-green-mid text-white' : 'bg-nc-beige text-nc-grey-dark'}`}
          >
            {form.medication_taken ? '✓ Yes' : '✗ No'}
          </button>
        </div>

        <RatingButton label="Mood — Morning" value={form.mood_morning} selected={form.mood_morning}
          onChange={(v) => update('mood_morning', v)} />
        <RatingButton label="Mood — Afternoon" value={form.mood_afternoon} selected={form.mood_afternoon}
          onChange={(v) => update('mood_afternoon', v)} />
        <RatingButton label="Mood — Evening" value={form.mood_evening} selected={form.mood_evening}
          onChange={(v) => update('mood_evening', v)} />

        <div>
          <label className="text-sm font-bold text-nc-grey-mid mb-1 block">Meltdown Count</label>
          <input type="number" min="0" max="20"
            className="nc-input" value={form.meltdown_count}
            onChange={(e) => update('meltdown_count', parseInt(e.target.value) || 0)} />
        </div>

        <RatingButton label="Stimming Level (1=None, 5=Constant)" value={form.stimming_level} selected={form.stimming_level}
          onChange={(v) => update('stimming_level', v)} />
        <RatingButton label="Social Engagement (1=Withdrawn, 5=Engaged)" value={form.social_engagement} selected={form.social_engagement}
          onChange={(v) => update('social_engagement', v)} />

        <div>
          <label className="text-sm font-bold text-nc-grey-mid mb-1 block">Physical Activity (minutes)</label>
          <input type="number" min="0" max="480"
            className="nc-input" value={form.physical_activity_minutes}
            onChange={(e) => update('physical_activity_minutes', parseInt(e.target.value) || 0)} />
        </div>

        <div>
          <label className="text-sm font-bold text-nc-grey-mid mb-1 block">Daily Summary</label>
          <textarea className="nc-input min-h-[80px]" value={form.daily_summary}
            onChange={(e) => update('daily_summary', e.target.value)}
            placeholder="How was the day overall?" />
        </div>

        <button onClick={handleSubmit} disabled={submitting} className="nc-btn-primary w-full">
          {submitting ? 'Saving...' : '✓ Submit Daily Report'}
        </button>
      </div>
    </div>
  );
}
