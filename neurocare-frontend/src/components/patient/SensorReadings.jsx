export default function SensorReadings({ sensor }) {
  if (!sensor) return null;

  const chips = [
    { emoji: '💓', label: 'HR', value: sensor.hr ? `${Math.round(sensor.hr)} BPM` : '--', elevated: sensor.hr > 100 },
    { emoji: '🌡️', label: 'Temp', value: sensor.body_temp ? `${sensor.body_temp.toFixed(1)}°C` : '--', elevated: sensor.body_temp > 37.2 },
    { emoji: '💧', label: 'GSR', value: sensor.gsr ? `${sensor.gsr.toFixed(1)}μS` : '--', elevated: sensor.gsr > 5 },
    { emoji: '🏃', label: 'Motion', value: sensor.motion ? `${sensor.motion.toFixed(1)}g` : '--', elevated: sensor.motion > 1.5 },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center">
      {chips.map((chip) => (
        <div key={chip.label}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors duration-safe
            ${chip.elevated ? 'bg-nc-amber-tint text-nc-amber' : 'bg-nc-green-tint text-nc-green-deep'}`}
        >
          <span>{chip.emoji}</span>
          <span>{chip.value}</span>
        </div>
      ))}
    </div>
  );
}
