import { io } from 'socket.io-client';

let socket = null;

export function getSocket() {
  if (!socket) {
    socket = io('/', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }
  return socket;
}

export function subscribeSensor(patientId, callback) {
  const s = getSocket();
  s.emit('subscribe_sensor', { patient_id: patientId });
  if (callback) {
    s.on('sensor_update', callback);
    return () => s.off('sensor_update', callback);
  }
}

export function subscribeEDS(patientId, callback) {
  const s = getSocket();
  s.emit('subscribe_eds', { patient_id: patientId });
  if (callback) {
    s.on('eds_update', callback);
    return () => s.off('eds_update', callback);
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
