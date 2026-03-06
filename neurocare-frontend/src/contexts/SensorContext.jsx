import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSocket, subscribeSensor, subscribeEDS } from '../services/socketService';

const SensorContext = createContext(null);

export function SensorProvider({ children }) {
  const [sensorData, setSensorData] = useState(null);
  const [edsData, setEdsData] = useState(null);
  const [subscribedPatient, setSubscribedPatient] = useState(null);
  const [connectionMode, setConnectionMode] = useState('simulation');

  const subscribe = useCallback((patientId) => {
    if (!patientId) return;
    const socket = getSocket();
    subscribeSensor(patientId);
    subscribeEDS(patientId);
    setSubscribedPatient(patientId);

    socket.off('sensor_update');
    socket.off('eds_update');

    socket.on('sensor_update', (data) => {
      if (data.patient_id === patientId || data.patient_id === String(patientId)) {
        setSensorData(data);
        setConnectionMode(data.sensor_mode || 'simulation');
      }
    });

    socket.on('eds_update', (data) => {
      if (data.patient_id === patientId || data.patient_id === String(patientId)) {
        setEdsData(data);
      }
    });
  }, []);

  return (
    <SensorContext.Provider value={{
      sensorData, edsData, subscribedPatient,
      connectionMode, subscribe, setConnectionMode,
    }}>
      {children}
    </SensorContext.Provider>
  );
}

export function useSensor() {
  const ctx = useContext(SensorContext);
  if (!ctx) throw new Error('useSensor must be used within SensorProvider');
  return ctx;
}
