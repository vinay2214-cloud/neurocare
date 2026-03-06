import { useSensor } from '../../contexts/SensorContext';

export default function SensorBadge() {
  const { connectionMode } = useSensor();

  if (connectionMode === 'connected' || connectionMode === 'real') {
    return (
      <div className="nc-badge bg-nc-green-tint text-nc-green-deep">
        💚 Wearable Connected
      </div>
    );
  }

  return (
    <div className="nc-badge bg-nc-blue-tint text-nc-blue-deep">
      🔵 Simulation Mode
    </div>
  );
}
